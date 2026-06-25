import {ROLE_LABELS, STAFF_TYPES, USER_ROLES} from '../../config/constants';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {assertBranchAccess} from '../academics/academicAccess';
import StaffIdService from '../staff/StaffIdService';
import {formatE164PhoneNumber, normalizePhoneNumber} from '../../utils/phone';
import {toISODate} from '../../utils/helpers/dateHelpers';

const today = () => toISODate();

const normalizeRole = role => String(role || '').toUpperCase();

const uniqueRoles = roles => {
  const seen = new Set();
  return (roles || [])
    .map(item => normalizeRole(item?.role || item))
    .filter(Boolean)
    .filter(role => {
      if (seen.has(role)) {
        return false;
      }
      seen.add(role);
      return true;
    });
};

const getUserRoles = user => uniqueRoles([...(user?.roles || []), user?.role]);

const getPrimaryRole = user => {
  const normalized = normalizeRole(user?.role);
  return normalized || getUserRoles(user)[0] || '';
};

const formatRoleList = roles =>
  uniqueRoles(roles)
    .map(role => ROLE_LABELS[role] || role)
    .join(', ');

const buildPendingFirebaseUID = ({branchId, phoneNumber}) =>
  `pending:teacher:${branchId}:${normalizePhoneNumber(phoneNumber)}`;

const canManageTeachers = role =>
  [USER_ROLES.PRINCIPAL, USER_ROLES.MAIN_ADMIN, USER_ROLES.COORDINATOR].includes(
    normalizeRole(role),
  );

const canViewTeachers = role =>
  [USER_ROLES.PRINCIPAL, USER_ROLES.BRANCH_ADMIN, USER_ROLES.MAIN_ADMIN, USER_ROLES.COORDINATOR].includes(
    normalizeRole(role),
  );

const canManageClassTeacherAssignments = role =>
  [USER_ROLES.PRINCIPAL, USER_ROLES.BRANCH_ADMIN, USER_ROLES.MAIN_ADMIN, USER_ROLES.COORDINATOR].includes(
    normalizeRole(role),
  );

const assertCoordinatorSectionAccess = (scope, section) => {
  const role = normalizeRole(scope?.role);
  if (role !== USER_ROLES.COORDINATOR) {
    return;
  }
  const sectionWing = section?.academicClass?.wing?.code || section?.wing?.code || section?.wing;
  if (!sectionWing || sectionWing !== scope?.wing) {
    throw new Error('Coordinators can manage class teachers only within their assigned wing.');
  }
};

const validateTeacher = payload => {
  if (!payload.fullName?.trim()) {
    return 'Full name is required.';
  }
  if (normalizePhoneNumber(payload.phoneNumber).length < 10) {
    return 'Enter a valid mobile number.';
  }
  if (!payload.gender) {
    return 'Gender is required.';
  }
  if (!payload.joiningDate) {
    return 'Joining date is required.';
  }
  if (!payload.designation?.trim()) {
    return 'Designation is required.';
  }
  if (![STAFF_TYPES.TEACHING, STAFF_TYPES.SUPPORTING].includes(payload.staffType)) {
    return 'Staff type is required.';
  }
  return '';
};

const normalizeTeacherPayload = (payload, scope) => {
  const branchId = payload.branchId || scope?.branchId;
  const countryCode = payload.countryCode || '+91';
  const phoneNumber = formatE164PhoneNumber({
    countryCode,
    phoneNumber: payload.phoneNumber,
  });

  return {
    ...payload,
    branchId,
    countryCode,
    phoneNumber,
    joiningDate: payload.joiningDate || today(),
    staffType: payload.staffType || STAFF_TYPES.TEACHING,
    fullName: payload.fullName?.trim(),
    designation: payload.designation?.trim(),
  };
};

const flattenTeacher = teacher => {
  const roles = getUserRoles(teacher.user);
  const primaryRole = getPrimaryRole(teacher.user);

  return {
    ...teacher,
    fullName: teacher.user?.fullName,
    phoneNumber: teacher.user?.phoneNumber,
    countryCode: teacher.user?.countryCode,
    role: teacher.user?.role,
    roles,
    primaryRole,
    primaryRoleLabel: ROLE_LABELS[primaryRole] || primaryRole || 'Teacher',
    additionalRoles: roles.filter(role => role !== primaryRole),
    additionalRoleLabels: formatRoleList(roles.filter(role => role !== primaryRole)),
    staffType: teacher.staffType || teacher.user?.staffType || STAFF_TYPES.TEACHING,
    subjects:
      (teacher.subjects || teacher.teacherSubjects_on_teacher || [])
        .map(item => item.subject)
        .filter(Boolean) || [],
    assignments: (
      teacher.profileAssignments ||
      teacher.listAssignments ||
      teacher.profileByUserAssignments ||
      teacher.dashboardAssignments ||
      teacher.assignments ||
      teacher.teacherSectionAssignments_on_teacher ||
      []
    ).filter(item => item.isActive !== false),
    attendanceMarked:
      teacher.attendanceMarked?.attendances_on_markedBy ||
      teacher.attendanceMarked?.profileMarkedAttendance ||
      teacher.user?.dashboardMarkedAttendance ||
      teacher.user?.profileMarkedAttendance ||
      teacher.user?.attendances_on_markedBy ||
      [],
  };
};

const flattenClassTeacherAssignment = assignment => {
  const teacherUser = assignment.teacher?.user || {};
  const roles = getUserRoles(teacherUser);
  const primaryRole = getPrimaryRole(teacherUser);

  return {
    ...assignment,
    teacherUserId: assignment.teacher?.user?.id || assignment.teacherUserId,
    teacherName: assignment.teacher?.user?.fullName || assignment.teacher?.fullName || '',
    employeeId: assignment.teacher?.employeeId || assignment.teacher?.user?.employeeId || '',
    teacherPhoneNumber: assignment.teacher?.user?.phoneNumber || '',
    roles,
    primaryRole,
    primaryRoleLabel: ROLE_LABELS[primaryRole] || primaryRole || 'Teacher',
    additionalRoles: roles.filter(role => role !== primaryRole),
    additionalRoleLabels: formatRoleList(roles.filter(role => role !== primaryRole)),
    assignedByName: assignment.assignedBy?.fullName || '',
    className: assignment.section?.academicClass?.name || '',
    sectionName: assignment.section?.name || '',
    wing: assignment.section?.academicClass?.wing?.code || '',
  };
};

const isSyntheticCoordinatorId = id => String(id || '').startsWith('coordinator:');

const ensureAssignableTeacherProfile = async ({candidate, branchId}) => {
  const teacherId = candidate?.teacherId || (!isSyntheticCoordinatorId(candidate?.id) ? candidate?.id : null);
  const userId = candidate?.userId || candidate?.user?.id;

  if (teacherId && userId) {
    return {
      ...candidate,
      id: teacherId,
      teacherId,
      userId,
    };
  }

  if (!candidate?.isCoordinatorCandidate || !userId) {
    return candidate;
  }

  const payload = {
    userId,
    branchId: branchId || candidate.branchId,
    employeeId: candidate.employeeId,
    staffType: candidate.staffType || STAFF_TYPES.TEACHING,
    joiningDate: candidate.joiningDate || today(),
    designation: candidate.designation || 'Class Teacher',
    gender: candidate.gender || 'Other',
    email: candidate.email || null,
  };

  if (!payload.branchId || !payload.employeeId) {
    throw new Error('Coordinator employee profile is incomplete.');
  }

  try {
    const response = await dataConnectClient.mutate(
      DATA_CONNECT_MUTATIONS.ENSURE_COORDINATOR_TEACHER_PROFILE,
      payload,
    );
    const createdTeacherId = response.teacher_insert?.id || response.teacher_insert;
    return {
      ...candidate,
      id: createdTeacherId,
      teacherId: createdTeacherId,
      userId,
      branchId: payload.branchId,
    };
  } catch (error) {
    if (!String(error.message || '').toLowerCase().includes('already exists')) {
      throw error;
    }

    const existingTeacher = await teacherService.getTeacherProfileByUser(userId);
    if (!existingTeacher?.id) {
      throw error;
    }
    return {
      ...candidate,
      id: existingTeacher.id,
      teacherId: existingTeacher.id,
      userId,
      branchId: existingTeacher.branchId || payload.branchId,
    };
  }
};

export const teacherService = {
  async getTeachers({branchId, limit = 9999, offset = 0}, scope) {
    if (!branchId) {
      return [];
    }

    if (!canViewTeachers(scope?.role)) {
      throw new Error('Teacher list access denied.');
    }

    assertBranchAccess(scope, branchId);

    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_TEACHERS, {
      branchId,
      limit,
      offset,
    });
    return (response.teachers || []).map(flattenTeacher);
  },

  async getTeachersByBranch(branchId, scope) {
    return this.getTeachers({branchId}, scope);
  },

  async clearTeacherWingRestrictions(branchId, scope) {
    if (!branchId) {
      throw new Error('Branch is required.');
    }
    assertBranchAccess(scope, branchId);
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CLEAR_TEACHER_WING_RESTRICTIONS, {
      branchId,
    });
    return {branchId};
  },

  async getTeacherProfile(teacherId) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_TEACHER_PROFILE, {
      teacherId,
    });
    return response.teacher ? flattenTeacher(response.teacher) : null;
  },

  async getTeacherProfileByUser(userId) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_TEACHER_PROFILE_BY_USER, {
      userId,
    });
    return response.teachers?.[0] || null;
  },

  async getTeacherDashboard(teacherId) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_TEACHER_DASHBOARD, {
      teacherId,
    });
    const teacher = response.teacher ? flattenTeacher(response.teacher) : null;
    const assignments = teacher?.assignments || [];
    const sections = assignments.map(item => item.section).filter(Boolean);
    const todayDate = toISODate();
    const activeAssignments = assignments.filter(item => item.isActive !== false);
    const attendanceMarked = teacher?.attendanceMarked || [];
    const todayRecords = sections.flatMap(section =>
      (
        section.dashboardSectionAttendance ||
        section.profileSectionAttendance ||
        section.sectionAttendance ||
        section.attendances_on_section ||
        []
      ).filter(item => item.attendanceDate === todayDate),
    );
    const assignedSubjects = teacher?.subjects || [];
    const totalStudents = sections.reduce(
      (sum, section) =>
        sum +
        (
          section.dashboardActiveStudents ||
          section.profileActiveStudents ||
          section.activeStudents ||
          section.students_on_section ||
          []
        ).filter(student =>
          ['ACTIVE', undefined, null].includes(student.status),
        ).length,
      0,
    );
    const pendingAttendance = sections.filter(section => {
      const students =
        section.dashboardActiveStudents ||
        section.profileActiveStudents ||
        section.activeStudents ||
        section.students_on_section ||
        [];
      const markedIds = new Set(
        (
          section.dashboardSectionAttendance ||
          section.profileSectionAttendance ||
          section.sectionAttendance ||
          section.attendances_on_section ||
          []
        )
          .filter(item => item.attendanceDate === todayDate)
          .map(item => item.studentId),
      );
      return students.some(student => !markedIds.has(student.id));
    }).length;

    return {
      teacher,
      assignedSections: sections,
      assignments: activeAssignments,
      assignedSubjects,
      totalStudents,
      subjectsAssigned: assignedSubjects.length,
      todaysAttendance: todayRecords.length,
      pendingAttendance,
      classTeacherAssignments: activeAssignments.filter(item => item.isClassTeacher),
      attendanceRecordsMarked: attendanceMarked.length,
    };
  },

  async getClassTeacherAssignments({branchId, academicYear, limit = 500}, scope) {
    const resolvedYear = academicYear ?? require('../academicYear/academicYearService').default.getCurrentStartYear(branchId);
    if (!branchId) {
      return {sections: [], assignments: [], students: [], coordinators: []};
    }

    if (!canManageClassTeacherAssignments(scope?.role)) {
      return {sections: [], assignments: [], students: [], coordinators: []};
    }

    assertBranchAccess(scope, branchId);

    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_CLASS_TEACHER_ASSIGNMENTS, {
      branchId,
      academicYear: resolvedYear,
      limit,
    });

    const sections =
      normalizeRole(scope?.role) === USER_ROLES.COORDINATOR
        ? (response.sections || []).filter(section => section.academicClass?.wing?.code === scope?.wing)
        : response.sections || [];
    const sectionIds = new Set(sections.map(section => section.id));
    return {
      sections,
      assignments: (response.teacherSectionAssignments || [])
        .filter(assignment => sectionIds.has(assignment.sectionId))
        .map(flattenClassTeacherAssignment),
      students: (response.students || []).filter(student => sectionIds.has(student.sectionId)),
      coordinators: response.coordinators || [],
    };
  },

  async getAssignments(filters = {}) {
    if (!filters.teacherId) {
      return [];
    }

    const teacher = await this.getTeacherProfile(filters.teacherId);
    return (teacher?.assignments || []).map(item => ({
      id: item.id,
      teacherId: teacher.id,
      branchId: teacher.branchId,
      sectionId: item.section?.id || item.sectionId,
      academicClassId: item.section?.academicClass?.id,
      isClassTeacher: item.isClassTeacher,
      section: item.section,
    }));
  },

  async createTeacher(payload, scope) {
    if (!canManageTeachers(scope?.role)) {
      throw new Error('Teacher management access denied.');
    }

    const normalized = normalizeTeacherPayload(payload, scope);
    assertBranchAccess(scope, normalized.branchId);

    const error = validateTeacher(normalized);
    if (error) {
      throw new Error(error);
    }

    const existingUser = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_USER_BY_PHONE, {
      phoneNumber: normalized.phoneNumber,
    });
    if (existingUser.users?.length) {
      throw new Error('A user with this phone number already exists.');
    }

    const staffId = await StaffIdService.getNextStaffId({
      branchId: normalized.branchId,
      branchCode: scope?.branchCode,
      staffType: normalized.staffType,
    });

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_TEACHER, {
      firebaseUID:
        normalized.firebaseUID ||
        buildPendingFirebaseUID({
          branchId: normalized.branchId,
          phoneNumber: normalized.phoneNumber,
        }),
      fullName: normalized.fullName,
      countryCode: normalized.countryCode,
      phoneNumber: normalized.phoneNumber,
      alternateMobileNumber: normalized.alternateMobileNumber || null,
      email: normalized.email || null,
      dateOfBirth: normalized.dateOfBirth || null,
      gender: normalized.gender,
      joiningDate: normalized.joiningDate,
      designation: normalized.designation,
      qualification: normalized.qualification || null,
      experience: normalized.experience || null,
      address: normalized.address || null,
      city: normalized.city || null,
      state: normalized.state || null,
      pincode: normalized.pincode || null,
      emergencyContact: normalized.emergencyContact || null,
      bloodGroup: normalized.bloodGroup || null,
      employeeId: staffId.employeeId,
      staffType: staffId.staffType,
      joiningYear: staffId.joiningYear,
      branchCode: staffId.branchCode,
      serialNumber: staffId.serialNumber,
      branchId: normalized.branchId,
    });

    return {
      id: response.teacher_insert?.id || response.teacher_insert,
      userId: response.user_insert?.id || response.user_insert,
      ...normalized,
      ...staffId,
      role: USER_ROLES.TEACHER,
      isActive: true,
    };
  },

  async updateTeacher(payload, scope) {
    const normalized = normalizeTeacherPayload(payload, scope);
    assertBranchAccess(scope, normalized.branchId);

    const error = validateTeacher(normalized);
    if (error) {
      throw new Error(error);
    }

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_TEACHER, {
      teacherId: normalized.teacherId,
      userId: normalized.userId,
      fullName: normalized.fullName,
      countryCode: normalized.countryCode,
      phoneNumber: normalized.phoneNumber,
      alternateMobileNumber: normalized.alternateMobileNumber || null,
      email: normalized.email || null,
      dateOfBirth: normalized.dateOfBirth || null,
      gender: normalized.gender,
      joiningDate: normalized.joiningDate,
      designation: normalized.designation,
      qualification: normalized.qualification || null,
      experience: normalized.experience || null,
      address: normalized.address || null,
      city: normalized.city || null,
      state: normalized.state || null,
      pincode: normalized.pincode || null,
      emergencyContact: normalized.emergencyContact || null,
      bloodGroup: normalized.bloodGroup || null,
      branchId: normalized.branchId,
      isActive: normalized.isActive ?? true,
    });

    return {id: response.teacher_update?.id || response.teacher_update, ...normalized};
  },

  async assignTeacherSubjects({teacher, teacherId, subjectIds = []}, scope) {
    const resolvedTeacherId = teacherId || teacher?.id;
    if (!resolvedTeacherId) {
      throw new Error('Select a teacher.');
    }
    assertBranchAccess(scope, teacher?.branchId || scope?.branchId);

    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CLEAR_TEACHER_SUBJECTS, {
      teacherId: resolvedTeacherId,
      branchId: teacher?.branchId || scope?.branchId,
    });

    await Promise.all(
      subjectIds.map(subjectId =>
        dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ASSIGN_TEACHER_SUBJECT, {
          teacherId: resolvedTeacherId,
          subjectId,
          branchId: teacher?.branchId || scope?.branchId,
        }),
      ),
    );

    return {teacherId: resolvedTeacherId, subjectIds};
  },

  async assignClassTeacher({teacher, teacherId, sectionId, branchId, section}, scope) {
    if (!canManageClassTeacherAssignments(scope?.role)) {
      throw new Error('Class teacher assignment access denied.');
    }
    const resolvedBranchId = branchId || teacher?.branchId || scope?.branchId;
    const resolvedTeacher = await ensureAssignableTeacherProfile({
      candidate: teacher || {id: teacherId},
      branchId: resolvedBranchId,
    });
    const resolvedTeacherId = resolvedTeacher.teacherId || teacherId || resolvedTeacher.id;
    const teacherUserId = resolvedTeacher.userId || resolvedTeacher.user?.id;

    if (!resolvedTeacherId || !teacherUserId || !sectionId) {
      throw new Error('Select a teacher and section.');
    }

    assertBranchAccess(scope, resolvedBranchId || resolvedTeacher.branchId || scope?.branchId);
    assertCoordinatorSectionAccess(scope, section);

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ASSIGN_CLASS_TEACHER, {
      sectionId,
      teacherId: resolvedTeacherId,
      teacherUserId,
      branchId: resolvedBranchId || resolvedTeacher.branchId || scope?.branchId,
      sectionAuditId: String(sectionId),
      teacherAuditId: String(resolvedTeacherId),
    });

    return {id: response.teacherSectionAssignment_insert?.id, sectionId, teacherId: resolvedTeacherId};
  },

  async updateClassTeacherAssignment(payload, scope) {
    if (!canManageClassTeacherAssignments(scope?.role)) {
      throw new Error('Class teacher assignment access denied.');
    }
    const resolvedBranchId = payload.branchId || payload.teacher?.branchId || scope?.branchId;
    const resolvedTeacher = await ensureAssignableTeacherProfile({
      candidate: payload.teacher || {id: payload.teacherId},
      branchId: resolvedBranchId,
    });
    const teacherId = resolvedTeacher.teacherId || payload.teacherId || resolvedTeacher.id;
    const teacherUserId = resolvedTeacher.userId || resolvedTeacher.user?.id;
    if (!payload.assignmentId || !payload.oldSectionId || !payload.sectionId || !teacherId || !teacherUserId) {
      throw new Error('Select an assignment, teacher, and section.');
    }
    assertBranchAccess(scope, resolvedBranchId || resolvedTeacher.branchId || scope?.branchId);
    assertCoordinatorSectionAccess(scope, payload.section);
    assertCoordinatorSectionAccess(scope, payload.oldSection);

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_CLASS_TEACHER_ASSIGNMENT, {
      assignmentId: payload.assignmentId,
      oldSectionId: payload.oldSectionId,
      sectionId: payload.sectionId,
      teacherId,
      teacherUserId,
      branchId: resolvedBranchId || resolvedTeacher.branchId || scope?.branchId,
      oldTeacherId: payload.oldTeacherId || null,
      sectionAuditId: String(payload.sectionId),
      teacherAuditId: String(teacherId),
      oldTeacherAuditId: payload.oldTeacherId ? String(payload.oldTeacherId) : null,
    });
    return {
      id: response.teacherSectionAssignment_insert?.id || payload.assignmentId,
      sectionId: payload.sectionId,
      teacherId,
    };
  },

  async removeClassTeacherAssignment(payload, scope) {
    if (!canManageClassTeacherAssignments(scope?.role)) {
      throw new Error('Class teacher assignment access denied.');
    }
    if (!payload.assignmentId || !payload.sectionId || !payload.teacherId) {
      throw new Error('Select an assignment to remove.');
    }
    assertBranchAccess(scope, payload.branchId || scope?.branchId);
    assertCoordinatorSectionAccess(scope, payload.section);

    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.REMOVE_CLASS_TEACHER_ASSIGNMENT, {
      assignmentId: payload.assignmentId,
      sectionId: payload.sectionId,
      teacherId: payload.teacherId,
      branchId: payload.branchId || scope?.branchId,
      sectionAuditId: String(payload.sectionId),
      teacherAuditId: String(payload.teacherId),
    });
    return {id: payload.assignmentId, sectionId: payload.sectionId, teacherId: payload.teacherId};
  },
};

export default teacherService;
