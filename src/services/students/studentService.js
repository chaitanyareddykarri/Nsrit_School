import {USER_ROLES} from '../../config/constants';
import {getClassWing} from '../../config/academic';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {applyRoleFilter} from '../rbacScope';
import {validateStudentPayload} from '../../utils/studentValidation';
import parentService from '../parents/parentService';
import AdmissionNumberService from './AdmissionNumberService';
import studentRepository from '../../repositories/studentRepository';
import {assertBranchAccess, assertCoordinatorWing} from '../academics/academicAccess';
import {formatE164PhoneNumber} from '../../utils/phone';
import {parseCsv} from '../../utils/csvParser';
import {toISODate} from '../../utils/helpers/dateHelpers';
import academicYearService from '../academicYear/academicYearService';

const currentYear = (branchId) => academicYearService.getCurrentStartYear(branchId);
const normalizeRole = role => String(role || '').toUpperCase();
const RELATIONSHIP_ORDER = ['FATHER', 'MOTHER', 'GUARDIAN'];

const formatOptionalPhone = ({countryCode = '+91', phoneNumber}) =>
  phoneNumber ? formatE164PhoneNumber({countryCode, phoneNumber}) : '';

const buildParentContacts = payload => {
  const countryCode = payload.countryCode || '+91';
  const contacts = [
    {
      relationship: 'FATHER',
      name: payload.fatherName,
      phoneNumber: payload.fatherMobile || payload.fatherPhoneNumber || payload.parentPhoneNumber,
    },
    {
      relationship: 'MOTHER',
      name: payload.motherName,
      phoneNumber: payload.motherMobile || payload.motherPhoneNumber,
    },
    {
      relationship: 'GUARDIAN',
      name: payload.guardianName,
      phoneNumber: payload.guardianMobile || payload.guardianPhoneNumber,
    },
  ];
  const seen = new Set();

  return contacts
    .map(contact => ({
      ...contact,
      countryCode,
      phoneNumber: formatOptionalPhone({countryCode, phoneNumber: contact.phoneNumber}),
    }))
    .filter(contact => contact.phoneNumber)
    .filter(contact => {
      const key = `${contact.relationship}:${contact.phoneNumber}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
};

const resolveBranchCode = async (scope, branchId) => {
  if (scope?.branchCode) {
    return scope.branchCode;
  }
  const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_BRANCHES, {
    limit: 1000,
    offset: 0,
  });
  const branch = response.branches?.find(item => item.id === branchId);
  if (!branch?.branchCode) {
    throw new Error('Branch code is required to generate admission number.');
  }
  return branch.branchCode;
};

const normalizeStudentPayload = (payload, scope = {}) => {
  const branchId = payload.branchId || scope.branchId;
  const branchCode = payload.branchCode || scope.branchCode;
  const countryCode = payload.countryCode || '+91';
  const parentContacts = buildParentContacts({...payload, countryCode});
  const primaryParent = parentContacts[0] || {};

  return {
    ...payload,
    branchId,
    branchCode,
    countryCode,
    phoneNumber: primaryParent.phoneNumber || '',
    parentPhoneNumber: primaryParent.phoneNumber || '',
    parentContacts,
    admissionYear: Number(payload.admissionYear || currentYear(payload.branchId)),
    admissionDate: payload.admissionDate || toISODate(),
    parentName: payload.fatherName || payload.parentName,
    className: payload.className || payload.academicClass?.name,
    wingId: payload.wingId || payload.academicClass?.wingId || payload.academicClass?.wing?.id || payload.section?.wingId,
    wingCode:
      payload.wingCode ||
      payload.academicClass?.wing?.code ||
      payload.wing?.code ||
      getClassWing(payload.className || payload.academicClass?.name),
  };
};

const toStudentMutationPayload = payload => ({
  studentId: payload.studentId,
  admissionYear: Number(payload.admissionYear),
  branchCode: payload.branchCode,
  serialNumber: Number(payload.serialNumber),
  fullName: payload.fullName,
  gender: payload.gender || null,
  dateOfBirth: payload.dateOfBirth || null,
  photoUrl: payload.photoUrl || null,
  aadhaarNumber: payload.aadhaarNumber || null,
  apaarId: payload.apaarId || null,
  bloodGroup: payload.bloodGroup || null,
  branchId: payload.branchId,
  wingId: payload.wingId,
  wingCode: payload.wingCode,
  academicClassId: payload.academicClassId,
  sectionId: payload.sectionId,
  parentId: payload.parentId,
  countryCode: payload.countryCode || '+91',
  phoneNumber: payload.phoneNumber || payload.parentPhoneNumber || null,
  address: payload.address || null,
  city: payload.city || null,
  state: payload.state || null,
  pincode: payload.pincode || null,
  emergencyContact: payload.emergencyContact || null,
  transportRequired: Boolean(payload.transportRequired),
  admissionDate: payload.admissionDate,
});

const resolveParentLinks = async normalized => {
  const contacts = (normalized.parentContacts || []).sort(
    (a, b) => RELATIONSHIP_ORDER.indexOf(a.relationship) - RELATIONSHIP_ORDER.indexOf(b.relationship),
  );
  const links = [];

  for (const contact of contacts) {
    const parent = await parentService.createParent({
      branchId: normalized.branchId,
      fullName: contact.name || `${contact.relationship} Parent`,
      fatherName: normalized.fatherName || null,
      motherName: normalized.motherName || null,
      countryCode: contact.countryCode || normalized.countryCode || '+91',
      phoneNumber: contact.phoneNumber,
      address: normalized.address || null,
    });

    links.push({
      relationship: contact.relationship,
      userId: parent.userId,
      parentId: parent.id,
      phoneNumber: contact.phoneNumber,
      name: contact.name,
    });
  }

  return links;
};

const assertStudentRecordAccess = (scope, student) => {
  assertBranchAccess(scope, student?.branchId || scope?.branchId);
  const role = normalizeRole(scope?.role);
  if (role === USER_ROLES.COORDINATOR) {
    const wing = student?.academicClass?.wing?.code || getClassWing(student?.academicClass?.name);
    assertCoordinatorWing(scope, wing);
  }
};

const filterStudentsForScope = (students, scope) => {
  const role = normalizeRole(scope?.role);
  if (role === USER_ROLES.COORDINATOR) {
    return students.filter(item => item.academicClass?.wing?.code === scope?.wing);
  }
  return applyRoleFilter(students, scope);
};

const assignFutureClassFee = async ({student, scope}) => {
  if (!student?.id || !student.branchId || !student.academicClassId || !scope?.userId) {
    return;
  }

  try {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_CLASS_FEES, {
      branchId: student.branchId,
      academicYear: Number(student.admissionYear || currentYear()),
      limit: 200,
      offset: 0,
    });
    const template = (response.academicYearFeeTemplates || []).find(
      item =>
        item.academicClassId === student.academicClassId &&
        item.applyToFuture !== false &&
        String(item.status || 'ACTIVE').toUpperCase() === 'ACTIVE',
    );
    if (!template) {
      return;
    }

    const grossAmount = Number(template.totalTuitionFee || 0);
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_FEE_PLAN, {
      studentId: student.id,
      academicYear: Number(template.academicYear),
      classFeeTemplateId: template.id,
      term1Fee: Number(template.term1Fee || 0),
      term2Fee: Number(template.term2Fee || 0),
      term3Fee: Number(template.term3Fee || 0),
      booksFee: 0,
      transportFee: 0,
      concessionType: null,
      concessionValue: 0,
      concessionAmount: 0,
      grossAmount,
      totalAmount: grossAmount,
      createdById: scope.userId,
      branchId: student.branchId,
      actorRole: normalizeRole(scope.role),
      oldValue: null,
      newValue: JSON.stringify({
        studentId: student.id,
        academicYear: template.academicYear,
        classFeeTemplateId: template.id,
        totalAmount: grossAmount,
      }),
    });
  } catch (error) {
    console.log('[StudentCreate] Future class fee assignment skipped:', {
      studentId: student.id,
      academicClassId: student.academicClassId,
      error,
    });
  }
};

const parseDateString = dateStr => {
  if (!dateStr) return null;
  const str = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const parts = str.split(/[-/]/);
  if (parts.length === 3) {
    const [day, month, year] = parts;
    if (year.length === 4) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  return str;
};

const mapCsvRow = row => ({
  rowNumber: row.rowNumber,
  fullName: row['Full Name'] || row['Student Name'],
  gender: row.Gender,
  dateOfBirth: parseDateString(row.DOB || row['Date of Birth']),
  fatherName: row['Father Name'],
  motherName: row['Mother Name'],
  guardianName: row['Guardian Name'],
  fatherMobile: row['Father Mobile'] || row['Father Phone'] || row['Parent Mobile'] || row['Parent Phone'],
  motherMobile: row['Mother Mobile'] || row['Mother Phone'],
  guardianMobile: row['Guardian Mobile'] || row['Guardian Phone'],
  className: row.Class,
  sectionName: row.Section,
  admissionDate: parseDateString(row['Admission Date']) || toISODate(),
});

export const studentService = {
  async getStudents({branchId, limit = 9999, offset = 0}, scope) {
    const role = normalizeRole(scope?.role);
    if (!branchId && role === USER_ROLES.MAIN_ADMIN) {
      const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_GLOBAL_STUDENTS, {
        limit,
        offset,
      });
      return response.students || [];
    }

    assertBranchAccess(scope, branchId);
    try {
      const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENTS, {
        branchId,
        limit,
        offset,
      });
      return filterStudentsForScope(response.students || [], scope);
    } catch (error) {
      console.log('[Students] Failed to fetch students:', {branchId, limit, offset, role, error});
      throw error;
    }
  },

  async getStudentsByBranch(branchId, options = {}) {
    if (!branchId) {
      return [];
    }

    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENTS, {
      branchId,
      limit: options.limit || 9999,
      offset: options.offset || 0,
    });
    return response.students || [];
  },

  async getStudentsBySection(sectionId, options = {}) {
    if (!sectionId) {
      return [];
    }

    try {
      const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENTS_BY_SECTION, {
        sectionId,
        limit: options.limit || 500,
        offset: options.offset || 0,
      });
      return response.students || [];
    } catch (error) {
      console.log('[Students] Failed to fetch section students:', {sectionId, error});
      throw error;
    }
  },

  async getStudentDetails(studentId, scope) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENT_DETAILS, {
      studentId,
    });
    if (!response.student) {
      return null;
    }
    assertStudentRecordAccess(scope, response.student);
    return response;
  },

  async searchStudents({branchId, searchText, classId, sectionId, status, limit = 25}, scope) {
    if (!branchId || !searchText?.trim()) {
      return [];
    }

    assertBranchAccess(scope, branchId);
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.SEARCH_STUDENTS, {
      branchId,
      searchText: searchText.trim(),
      limit,
    });

    return filterStudentsForScope(response.students || [], scope).filter(item => {
      const classMatches = !classId || item.academicClassId === classId;
      const sectionMatches = !sectionId || item.sectionId === sectionId;
      const statusMatches = !status || item.status === status;
      return classMatches && sectionMatches && statusMatches;
    });
  },

  async getStudentsForRole(scope, options = {}) {
    if (scope?.sectionId) {
      return this.getStudentsBySection(scope.sectionId, options);
    }

    return this.getStudents({branchId: scope?.branchId, ...options}, scope);
  },

  async getNextStudentIdSeed({admissionYear, branchCode}) {
    return AdmissionNumberService.getNextAdmissionNumber({
      year: admissionYear,
      branchCode,
    });
  },

  async getStudentsByWing({branchId, wing, limit, offset}, scope) {
    assertBranchAccess(scope, branchId);
    assertCoordinatorWing(scope, wing);
    return studentRepository.getStudentsByWing({branchId, wing, limit, offset});
  },

  async createStudent(payload, scope) {
    const normalized = normalizeStudentPayload(payload, scope);
    normalized.branchCode = await resolveBranchCode(scope, normalized.branchId);

    console.log('[StudentCreate] Normalized form payload:', {
      selectedClassId: normalized.academicClassId,
      selectedClassName: normalized.className,
      selectedSectionId: normalized.sectionId,
      branchId: normalized.branchId,
      branchCode: normalized.branchCode,
      wingId: normalized.wingId,
      wingCode: normalized.wingCode,
    });

    assertBranchAccess(scope, normalized.branchId);
    assertCoordinatorWing(scope, normalized.wingCode || normalized.className || normalized.wing);

    const validationError = validateStudentPayload(normalized);
    if (validationError) {
      throw new Error(validationError);
    }

    const idPayload =
      normalized.studentId && normalized.serialNumber
        ? normalized
        : await this.getNextStudentIdSeed({
            admissionYear: normalized.admissionYear,
            branchCode: normalized.branchCode,
          });

    console.log('[StudentCreate] Generated admission number:', {
      admissionNumber: idPayload.studentId,
      admissionYear: idPayload.admissionYear,
      serialNumber: idPayload.serialNumber,
    });

    const parentLinks = await resolveParentLinks(normalized);
    const primaryParent = parentLinks[0];
    const parentId = normalized.parentId || primaryParent?.parentId;

    console.log('[StudentCreate] Parent links resolved:', {
      parentId,
      links: parentLinks.map(link => ({
        relationship: link.relationship,
        userId: link.userId,
      })),
    });

    const mutationPayload = toStudentMutationPayload({
      ...normalized,
      ...idPayload,
      parentId,
    });

    console.log('[StudentCreate] CreateStudent mutation payload:', mutationPayload);

    const response = await dataConnectClient.mutate(
      DATA_CONNECT_MUTATIONS.CREATE_STUDENT,
      mutationPayload,
    );

    console.log('[StudentCreate] CreateStudent mutation response:', response);

    const createdStudent = {
      id: response.student_insert?.id || response.student_insert,
      ...normalized,
      ...idPayload,
      parentId,
      linkedParents: parentLinks,
      status: 'ACTIVE',
      isActive: true,
    };

    for (const link of parentLinks) {
      if (createdStudent.id && link.userId) {
        await parentService.linkStudentParent({
          studentId: createdStudent.id,
          userId: link.userId,
          relationship: link.relationship,
          branchId: normalized.branchId,
        });
      }
    }

    await assignFutureClassFee({student: createdStudent, scope});
    return createdStudent;
  },

  async updateStudent(payload, scope) {
    const normalized = normalizeStudentPayload(payload, scope);
    if (!normalized.branchId) {
      throw new Error('Student branch is required to update student details.');
    }
    assertBranchAccess(scope, normalized.branchId);
    assertCoordinatorWing(scope, normalized.className || normalized.wing);

    const validationError = validateStudentPayload(normalized);
    if (validationError) {
      throw new Error(validationError);
    }

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_STUDENT, {
      studentId: normalized.studentId || normalized.id,
      parentId: normalized.parentId,
      branchId: normalized.branchId,
      fullName: normalized.fullName,
      gender: normalized.gender,
      dateOfBirth: normalized.dateOfBirth,
      photoUrl: normalized.photoUrl || null,
      aadhaarNumber: normalized.aadhaarNumber || null,
      apaarId: normalized.apaarId || null,
      bloodGroup: normalized.bloodGroup || null,
      academicClassId: normalized.academicClassId,
      sectionId: normalized.sectionId,
      countryCode: normalized.countryCode || '+91',
      phoneNumber: normalized.phoneNumber,
      address: normalized.address || null,
      city: normalized.city || null,
      state: normalized.state || null,
      pincode: normalized.pincode || null,
      emergencyContact: normalized.emergencyContact || null,
      transportRequired: Boolean(normalized.transportRequired),
      admissionDate: normalized.admissionDate,
      fatherName: normalized.fatherName,
      motherName: normalized.motherName,
      parentPhoneNumber: normalized.parentPhoneNumber,
      transferCertificateUrl: normalized.transferCertificateUrl || null,
      birthCertificateUrl: normalized.birthCertificateUrl || null,
    });

    return {id: response.student_update?.id || normalized.studentId || normalized.id, ...normalized};
  },

  async transferStudent(payload, scope) {
    assertBranchAccess(scope, payload.branchId || scope?.branchId);
    assertCoordinatorWing(scope, payload.targetWing || payload.className);
    return studentRepository.transferStudent({
      studentId: payload.studentId,
      oldSectionId: payload.oldSectionId,
      newSectionId: payload.newSectionId,
      newClassId: payload.newClassId,
      changedById: scope?.userId,
    });
  },

  async bulkAssignStudents(payload, scope) {
    assertBranchAccess(scope, payload.branchId || scope?.branchId);
    assertCoordinatorWing(scope, payload.targetWing || payload.className);
    return studentRepository.bulkAssignStudents({
      studentIds: payload.studentIds,
      sectionId: payload.sectionId,
      academicClassId: payload.academicClassId,
    });
  },

  async updateStudentStatus(payload, scope) {
    const role = normalizeRole(scope?.role);
    if (![USER_ROLES.PRINCIPAL, USER_ROLES.MAIN_ADMIN, USER_ROLES.COORDINATOR].includes(role)) {
      throw new Error('Student status access denied.');
    }
    assertBranchAccess(scope, payload.branchId || scope?.branchId);
    return studentRepository.updateStudentStatus({
      studentId: payload.studentId,
      status: payload.status,
    });
  },

  async importStudents({csvText, classes = [], sections = []}, scope, onProgress) {
    const rows = parseCsv(csvText).map(mapCsvRow);
    const created = [];
    const failed = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const academicClass = classes.find(item => item.name === String(row.className));
      const section = sections.find(
        item =>
          item.name === String(row.sectionName) &&
          item.academicClassId === academicClass?.id,
      );

      try {
        if (!academicClass) {
          throw new Error(`Class ${row.className} does not exist.`);
        }
        if (!section) {
          throw new Error(`Section ${row.sectionName} does not exist for class ${row.className}.`);
        }

        const student = await this.createStudent(
          {
            ...row,
            branchId: scope.branchId,
            branchCode: scope.branchCode,
            academicClassId: academicClass.id,
            className: academicClass.name,
            academicClass: academicClass,
            sectionId: section.id,
            section: section,
          },
          scope,
        );
        created.push(student);
      } catch (error) {
        failed.push({rowNumber: row.rowNumber, row, error: error.message});
      }

      if (onProgress) {
        onProgress({completed: index + 1, total: rows.length});
      }
    }

    return {
      successCount: created.length,
      failedCount: failed.length,
      errors: failed,
      created,
    };
  },

  async promoteStudents(payload, scope) {
    assertBranchAccess(scope, payload.branchId || scope?.branchId);
    return studentRepository.promoteStudents({
      studentIds: payload.studentIds,
      fromClassId: payload.fromClassId,
      toClassId: payload.toClassId,
      fromSectionId: payload.fromSectionId,
      toSectionId: payload.toSectionId,
      promotedById: scope?.userId,
    });
  },
};

export default studentService;
