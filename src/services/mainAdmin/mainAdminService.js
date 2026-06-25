import {ROLE_LABELS, USER_ROLES} from '../../config/constants';
import {formatE164PhoneNumber, normalizePhoneNumber} from '../../utils/phone';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import StaffIdService from '../staff/StaffIdService';
import academicYearService from '../academicYear/academicYearService';
import {toISODate} from '../../utils/helpers/dateHelpers';

const CACHE_TTL = 60 * 1000;
const cache = new Map();

const todayKey = () => toISODate();

const readCache = key => {
  const entry = cache.get(key);
  if (!entry || Date.now() - entry.createdAt > CACHE_TTL) {
    return null;
  }
  return entry.value;
};

const writeCache = (key, value) => {
  cache.set(key, {createdAt: Date.now(), value});
  return value;
};

const withCache = async (key, loader, forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = readCache(key);
    if (cached) {
      return cached;
    }
  }

  return writeCache(key, await loader());
};

const invalidate = (...prefixes) => {
  [...cache.keys()].forEach(key => {
    if (prefixes.some(prefix => key.startsWith(prefix))) {
      cache.delete(key);
    }
  });
};

const asArray = value => (Array.isArray(value) ? value : []);

const isPresent = status => String(status || '').toUpperCase() === 'PRESENT';
const isAbsent = status => String(status || '').toUpperCase() === 'ABSENT';
const isFacultyRole = role => {
  const r = String(role || '').toUpperCase();
  return r === USER_ROLES.TEACHER || r === USER_ROLES.CLASS_TEACHER;
};
const isTeacherRole = isFacultyRole;
const isRole = (role, expected) => String(role || '').toUpperCase() === expected;

const percent = (part, total) => {
  if (!total) {
    return 0;
  }
  return Math.round((part / total) * 100);
};

const feeCollectionPercent = fees => {
  const total = asArray(fees).reduce((sum, item) => sum + Number(item.totalFee || 0), 0);
  const paid = asArray(fees).reduce((sum, item) => sum + Number(item.paidAmount || 0), 0);
  return percent(paid, total);
};

const attendancePercent = records => {
  const attendance = asArray(records).filter(item => isPresent(item.status) || isAbsent(item.status));
  return percent(attendance.filter(item => isPresent(item.status)).length, attendance.length);
};

const normalizeBranch = branch => ({
  ...branch,
  code: branch?.branchCode,
  contactNumber: branch?.phone,
  status: branch?.status || (branch?.isActive ? 'ACTIVE' : 'INACTIVE'),
});

const roleVariant = role => {
  const normalized = String(role || '').trim();
  return {
    role: normalized,
    alternateRole: normalized.toUpperCase(),
  };
};

const buildPendingFirebaseUID = ({role, branchId, phoneNumber}) =>
  `pending:${String(role).toLowerCase()}:${branchId}:${normalizePhoneNumber(phoneNumber)}`;

const matchesText = (values, searchText) => {
  const needle = String(searchText || '').trim().toLowerCase();
  if (!needle) {
    return true;
  }

  return values.some(value => String(value || '').toLowerCase().includes(needle));
};

const buildBranchList = data => {
  const classes = asArray(data.academicClasses);
  const students = asArray(data.students);
  const users = asArray(data.users);

  return asArray(data.branches).map(branch => {
    const branchClasses = classes.filter(item => item.branchId === branch.id && item.isActive !== false);
    const branchStudents = students.filter(item => item.branchId === branch.id && item.isActive !== false);
    const branchCoordinators = branch.branchCoordinators
      ? asArray(branch.branchCoordinators)
      : users.filter(item => item.branchId === branch.id && isRole(item.role, USER_ROLES.COORDINATOR));
    const branchAccountants = branch.branchAccountants
      ? asArray(branch.branchAccountants)
      : users.filter(item => item.branchId === branch.id && isRole(item.role, USER_ROLES.ACCOUNTANT));
    const branchTeacherCount = branch.branchTeachers
      ? asArray(branch.branchTeachers).length
      : users.filter(item => item.branchId === branch.id && isFacultyRole(item.role)).length;

    return {
      ...normalizeBranch(branch),
      totalClasses: branchClasses.length,
      totalStudents: branchStudents.length,
      totalTeachers: branchTeacherCount,
      totalCoordinators: branchCoordinators.length,
      totalAccountants: branchAccountants.length,
      principalAvailable: Boolean(branch.principalId || branch.principal),
    };
  });
};

const enrichClasses = data => {
  const students = asArray(data.students).filter(student => student.isActive !== false);
  const assignments = asArray(data.teacherAssignments);
  const attendance = asArray(data.attendances);
  const fees = asArray(data.studentFees);

  return asArray(data.sections).map(section => {
    const sectionStudents = students.filter(student => student.sectionId === section.id);
    const sectionAttendance = attendance.filter(record => record.sectionId === section.id);
    const sectionFees = fees.filter(fee =>
      sectionStudents.some(student => student.id === fee.student?.id || student.id === fee.studentId),
    );
    const classTeacher = assignments.find(
      item => item.sectionId === section.id && item.isClassTeacher,
    )?.teacher;

    return {
      id: section.id,
      branchId: section.branchId,
      classId: section.academicClassId,
      branchName: section.branch?.name || 'Branch',
      branchCode: section.branch?.branchCode,
      className: section.academicClass?.name || 'Class',
      section: section.name,
      classTeacher: classTeacher?.fullName || 'Unassigned',
      totalStudents: sectionStudents.length,
      attendancePercent: attendancePercent(sectionAttendance),
      feeCollectionPercent: feeCollectionPercent(sectionFees),
      isActive: section.isActive,
      raw: section,
    };
  });
};

const summarizeNestedStudent = student => {
  const attendance = asArray(student.explorerAttendance);
  const plans = asArray(student.explorerFeePlans);
  const totalAmount = plans.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  const paidAmount = plans.reduce(
    (sum, item) =>
      sum +
      asArray(item.explorerFeePayments)
        .filter(payment => String(payment.status || 'RECORDED').toUpperCase() !== 'REVERSED')
        .reduce((paymentSum, payment) => paymentSum + Number(payment.amount || 0), 0),
    0,
  );
  const pendingAmount = Math.max(totalAmount - paidAmount, 0);

  return {
    ...student,
    admissionNumber: student.studentId,
    branchName: student.branch?.name || 'Branch',
    branchCode: student.branch?.branchCode,
    className: student.academicClass?.name || 'Class',
    wing: student.academicClass?.wing?.code,
    sectionName: student.section?.name || '',
    parentPhone: student.parent?.phoneNumber || student.phoneNumber,
    attendancePercent: attendancePercent(attendance),
    feeStatus: pendingAmount > 0 ? 'PENDING' : 'PAID',
    pendingAmount,
  };
};

const summarizeProfile = data => {
  const attendance = asArray(data.attendances);
  const fees = asArray(data.studentFees);
  const planPayments = asArray(data.studentDetailFeePlans).flatMap(plan =>
    asArray(plan.detailFeePayments).map(payment => ({
      ...payment,
      feePlanId: plan.id,
      academicYear: plan.academicYear,
    })),
  );
  const payments = asArray(data.payments).length ? asArray(data.payments) : planPayments;
  const presentDays = attendance.filter(item => isPresent(item.status)).length;
  const absentDays = attendance.filter(item => isAbsent(item.status)).length;

  return {
    student: data.student,
    attendance,
    fees,
    payments,
    feePlans: asArray(data.studentDetailFeePlans),
    transferHistory: asArray(data.studentSectionHistories),
    promotionHistory: asArray(data.studentPromotionHistories),
    summary: {
      presentDays,
      absentDays,
      attendancePercent: percent(presentDays, presentDays + absentDays),
      totalFees: fees.reduce((sum, item) => sum + Number(item.totalFee || 0), 0),
      paidAmount: fees.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0),
      pendingAmount: fees.reduce((sum, item) => sum + Number(item.remainingAmount || 0), 0),
      nextDueDate: fees.find(item => Number(item.remainingAmount || 0) > 0)?.dueDate || null,
    },
  };
};

const buildReports = data => {
  const branches = asArray(data.branches);
  const users = asArray(data.users);
  const students = asArray(data.students);
  const attendances = asArray(data.attendances);
  const feePlans = asArray(data.studentFeePlans);
  const allCoordinators = asArray(data.coordinators);
  const allAccountants = asArray(data.accountants);

  const roleCount = (branchId, role) =>
    users.filter(
      user =>
        user.branchId === branchId &&
        String(user.role || '').toUpperCase() === String(role || '').toUpperCase(),
    ).length;

  const branchWise = branches.map(branch => {
    const branchStudents = students.filter(student => student.branchId === branch.id);
    const branchAttendance = attendances.filter(item => item.section?.branchId === branch.id);
    const branchPlans = feePlans.filter(plan => plan.student?.branchId === branch.id);
    const totalFees = branchPlans.reduce((sum, plan) => sum + Number(plan.totalAmount || 0), 0);
    const concessionFees = branchPlans.reduce((sum, plan) => sum + Number(plan.concessionAmount || 0), 0);
    const paidFees = branchPlans.reduce(
      (sum, plan) =>
        sum +
        asArray(plan.reportPayments)
          .filter(payment => String(payment.status || 'RECORDED').toUpperCase() !== 'REVERSED')
          .reduce((paymentSum, payment) => paymentSum + Number(payment.amount || 0), 0),
      0,
    );

    const coordCount = allCoordinators.length > 0
      ? allCoordinators.filter(c => c.branchId === branch.id).length
      : roleCount(branch.id, USER_ROLES.COORDINATOR);
    const acctCount = allAccountants.length > 0
      ? allAccountants.filter(a => a.branchId === branch.id).length
      : roleCount(branch.id, USER_ROLES.ACCOUNTANT);

    return {
      branchId: branch.id,
      branchName: branch.name,
      branchCode: branch.branchCode,
      students: branchStudents.length,
      teachers: branch.branchTeachers
        ? asArray(branch.branchTeachers).length
        : roleCount(branch.id, USER_ROLES.TEACHER),
      coordinators: coordCount,
      accountants: acctCount,
      attendancePercent: attendancePercent(branchAttendance),
      totalFees,
      paidFees,
      pendingFees: Math.max(totalFees - paidFees, 0),
      concessionFees,
      admissions: (() => {
        const yearDates = academicYearService.getActiveYearDates(branchId);
        const cutoff = yearDates?.startDate || `${academicYearService.getCurrentStartYear(branchId)}-06-01`;
        return branchStudents.filter(s => (s.admissionDate || '') >= cutoff).length;
      })(),
    };
  });

  return {
    branchWise,
    totals: {
      students: students.length,
      teachers: users.filter(user => isTeacherRole(user.role)).length,
      coordinators: allCoordinators.length > 0
        ? allCoordinators.length
        : users.filter(user => String(user.role || '').toUpperCase() === USER_ROLES.COORDINATOR).length,
      accountants: allAccountants.length > 0
        ? allAccountants.length
        : users.filter(user => String(user.role || '').toUpperCase() === USER_ROLES.ACCOUNTANT).length,
      attendancePercent: attendancePercent(attendances),
      totalFees: branchWise.reduce((sum, branch) => sum + branch.totalFees, 0),
      paidFees: branchWise.reduce((sum, branch) => sum + branch.paidFees, 0),
      pendingFees: branchWise.reduce((sum, branch) => sum + branch.pendingFees, 0),
      concessionFees: branchWise.reduce((sum, branch) => sum + branch.concessionFees, 0),
    },
  };
};

const mainAdminService = {
  invalidate,

  async getAllBranches({forceRefresh = false} = {}) {
    const data = await withCache(
      'branches:all',
      () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_DASHBOARD_STATISTICS),
      forceRefresh,
    );
    const branchData = await withCache(
      'branches:list',
      () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_BRANCHES, {limit: 1000, offset: 0}),
      forceRefresh,
    );

    return buildBranchList({...data, branches: branchData.branches || []});
  },

  async getBranchDetails(branchId, {forceRefresh = false} = {}) {
    const data = await withCache(
      `branch:${branchId}`,
      () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_BRANCH_DETAILS, {branchId}),
      forceRefresh,
    );
    const students = asArray(data.students).filter(student => student.isActive !== false);
    const teachers = asArray(data.branchTeachers).length > 0
      ? asArray(data.branchTeachers)
      : asArray(data.users).filter(user => isFacultyRole(user.role));
    const coordinators = asArray(data.branchCoordinators).length > 0
      ? asArray(data.branchCoordinators)
      : asArray(data.users).filter(user => isRole(user.role, USER_ROLES.COORDINATOR));
    const accountants = asArray(data.branchAccountants).length > 0
      ? asArray(data.branchAccountants)
      : asArray(data.users).filter(user => isRole(user.role, USER_ROLES.ACCOUNTANT));
    const activeClasses = asArray(data.academicClasses).filter(item => item.isActive !== false);

    return {
      ...data,
      branch: normalizeBranch(data.branch),
      summary: {
        totalClasses: activeClasses.length,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalCoordinators: coordinators.length,
        totalAccountants: accountants.length,
        attendancePercent: attendancePercent(data.attendances),
        feeCollectionPercent: feeCollectionPercent(data.studentFees),
        totalFees: asArray(data.studentFees).reduce((sum, item) => sum + Number(item.totalFee || 0), 0),
        paidFees: asArray(data.studentFees).reduce((sum, item) => sum + Number(item.paidAmount || 0), 0),
        pendingFees: asArray(data.studentFees).reduce(
          (sum, item) => sum + Number(item.remainingAmount || 0),
          0,
        ),
      },
    };
  },

  async updateBranch(payload) {
    const status = payload.status || 'ACTIVE';
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_BRANCH, {
      id: payload.id,
      name: payload.name,
      address: payload.address || null,
      city: payload.city || null,
      state: payload.state || null,
      pincode: payload.pincode || null,
      phone: payload.phone || null,
      email: payload.email || null,
      status,
      isActive: status.toUpperCase() === 'ACTIVE',
    });
    invalidate('branch:', 'branches:', 'dashboard:');
    return payload;
  },

  async searchUsersByRole({role, searchText = '', limit = 25}) {
    const roles = roleVariant(role);
    const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_USERS_BY_ROLE, {
      ...roles,
      searchText,
      limit,
    });
    return data.users || [];
  },

  async findUserByPhone(phoneNumber) {
    const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_USER_BY_PHONE, {
      phoneNumber,
    });
    return data.users?.[0] || null;
  },

  async createBranchRoleUser({
    branchId,
    fullName,
    countryCode = '+91',
    phoneNumber,
    role,
    employeeId = null,
    staffType = null,
  }) {
    const trimmedName = String(fullName || '').trim();
    const fullPhoneNumber = formatE164PhoneNumber({countryCode, phoneNumber});

    if (!trimmedName) {
      throw new Error('Full name is required.');
    }

    if (normalizePhoneNumber(phoneNumber).length < 10) {
      throw new Error('Enter a valid phone number.');
    }

    const existingUser = await this.findUserByPhone(fullPhoneNumber);
    if (existingUser) {
      throw new Error('A user with this phone number already exists.');
    }

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_USER, {
      firebaseUID: buildPendingFirebaseUID({role, branchId, phoneNumber: fullPhoneNumber}),
      fullName: trimmedName,
      countryCode,
      phoneNumber: fullPhoneNumber,
      role,
      employeeId,
      staffType,
      branchId,
    });

    return {
      id: response.user_insert.id,
      fullName: trimmedName,
      countryCode,
      phoneNumber: fullPhoneNumber,
      role,
      employeeId,
      staffType,
      branchId,
      isActive: true,
    };
  },

  async ensureAssignable(userId, branchId, assignmentType) {
    const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_ASSIGNMENT_CONFLICTS, {
      userId,
    });
    const key = assignmentType === 'principal' ? 'principalBranches' : 'branchAdminBranches';
    const conflicts = asArray(data[key]).filter(branch => branch.id !== branchId);

    if (conflicts.length) {
      throw new Error(
        `${assignmentType === 'principal' ? 'Principal' : 'Branch admin'} is already assigned to ${conflicts[0].name}.`,
      );
    }
  },

  async assignBranchAdmin({branchId, userId, allowMultipleAssignments = false}) {
    if (!allowMultipleAssignments) {
      await this.ensureAssignable(userId, branchId, 'branchAdmin');
    }
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ASSIGN_BRANCH_ADMIN, {
      branchId,
      branchAdminId: userId,
    });
    invalidate('branch:', 'branches:');
  },

  async createAndAssignBranchAdmin(payload) {
    const user = await this.createBranchRoleUser({
      ...payload,
      role: USER_ROLES.BRANCH_ADMIN,
    });
    await this.assignBranchAdmin({
      branchId: payload.branchId,
      userId: user.id,
      allowMultipleAssignments: true,
    });
    return user;
  },

  async assignPrincipal({branchId, userId, staffId, allowMultipleAssignments = false}) {
    if (!allowMultipleAssignments) {
      await this.ensureAssignable(userId, branchId, 'principal');
    }
    const resolvedStaffId =
      staffId ||
      (await StaffIdService.getNextStaffId({
        branchId,
        staffType: 'TEACHING',
      }));
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ASSIGN_PRINCIPAL, {
      branchId,
      principalId: userId,
      employeeId: resolvedStaffId.employeeId,
      joiningYear: resolvedStaffId.joiningYear,
      branchCode: resolvedStaffId.branchCode,
      serialNumber: resolvedStaffId.serialNumber,
    });
    invalidate('branch:', 'branches:');
  },

  async createAndAssignPrincipal(payload) {
    const fullPhoneNumber = formatE164PhoneNumber({
      countryCode: payload.countryCode || '+91',
      phoneNumber: payload.phoneNumber,
    });

    const existingUser = await this.findUserByPhone(fullPhoneNumber);

    if (existingUser) {
      // Only an existing PRINCIPAL account can be reassigned to a branch.
      // Any other role is a data conflict the caller must resolve manually.
      if (existingUser.role !== USER_ROLES.PRINCIPAL) {
        const roleLabel = ROLE_LABELS[existingUser.role] || existingUser.role;
        throw new Error(
          `This phone number is already registered as ${roleLabel}. Only existing principal accounts can be reassigned to a branch.`,
        );
      }

      // Existing principal found — skip creation and assign directly.
      const staffId = await StaffIdService.getNextStaffId({
        branchId: payload.branchId,
        staffType: 'TEACHING',
      });
      await this.assignPrincipal({
        branchId: payload.branchId,
        userId: existingUser.id,
        staffId,
        allowMultipleAssignments: true,
      });
      return {...existingUser, ...staffId, isExistingUser: true};
    }

    // No existing user — create then assign (original flow).
    const staffId = await StaffIdService.getNextStaffId({
      branchId: payload.branchId,
      staffType: 'TEACHING',
    });
    const user = await this.createBranchRoleUser({
      ...payload,
      role: USER_ROLES.PRINCIPAL,
      employeeId: staffId.employeeId,
      staffType: staffId.staffType,
    });
    await this.assignPrincipal({
      branchId: payload.branchId,
      userId: user.id,
      staffId,
      allowMultipleAssignments: true,
    });
    return {...user, ...staffId, isExistingUser: false};
  },

  async getGlobalClasses({filters = {}, searchText = '', forceRefresh = false} = {}) {
    const data = await withCache(
      'classes:global',
      () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_GLOBAL_CLASSES, {limit: 1000, offset: 0}),
      forceRefresh,
    );
    return enrichClasses(data).filter(item => {
      const matchesFilters =
        (!filters.branchId || item.branchId === filters.branchId) &&
        (!filters.grade || item.className === filters.grade) &&
        (!filters.section || item.section === filters.section);
      return (
        matchesFilters &&
        matchesText(
          [item.branchName, item.branchCode, item.className, item.section, item.classTeacher],
          searchText,
        )
      );
    });
  },

  async getClassDetails(sectionId, {forceRefresh = false} = {}) {
    const data = await withCache(
      `class:${sectionId}`,
      () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_CLASS_DETAILS, {sectionId}),
      forceRefresh,
    );
    return {
      ...data,
      classInfo: enrichClasses({
        sections: data.section ? [data.section] : [],
        students: data.students,
        teacherAssignments: data.teacherAssignments,
        attendances: data.attendances,
        studentFees: data.studentFees,
      })[0],
    };
  },

  async getGlobalStudents({
    filters = {},
    searchText = '',
    page = 1,
    pageSize = 25,
    forceRefresh = false,
  } = {}) {
    const offset = (page - 1) * pageSize;
    const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_GLOBAL_STUDENT_EXPLORER, {
      branchId: filters.branchId || null,
      academicClassId: filters.classId || filters.academicClassId || null,
      sectionId: filters.sectionId || null,
      status: filters.status || null,
      searchText: String(searchText || '').trim(),
      limit: pageSize + 1,
      offset,
    });
    const pageItems = asArray(data.students)
      .map(summarizeNestedStudent)
      .filter(student => !filters.gender || student.gender === filters.gender);
    const items = pageItems.slice(0, pageSize);

    return {
      items,
      total: offset + items.length + (pageItems.length > pageSize ? 1 : 0),
      page,
      pageSize,
      hasNextPage: pageItems.length > pageSize,
      hasPreviousPage: page > 1,
    };
  },

  async getStudentProfile(studentId, {forceRefresh = false} = {}) {
    const data = await withCache(
      `student:${studentId}`,
      () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENT_DETAILS, {studentId}),
      forceRefresh,
    );
    return summarizeProfile(data);
  },

  async getGlobalReports({forceRefresh = false} = {}) {
    const data = await withCache(
      'reports:global',
      () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_GLOBAL_REPORTS),
      forceRefresh,
    );
    return buildReports(data);
  },

  async getAuditLogs({branchId = null, limit = 100, offset = 0} = {}) {
    const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_AUDIT_LOGS, {
      branchId,
      limit,
      offset,
    });
    return data.auditLogs || [];
  },

  async getStudentAttendance(studentId) {
    const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENT_ATTENDANCE, {
      studentId,
    });
    return data.attendances || [];
  },

  async getStudentFeeHistory(studentId) {
    const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENT_FEE_HISTORY, {
      studentId,
    });
    return data;
  },

  async getDashboardStatistics({forceRefresh = false} = {}) {
    const data = await withCache(
      'dashboard:stats',
      () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_DASHBOARD_STATISTICS),
      forceRefresh,
    );
    const teachers = asArray(data.teachers).length > 0
      ? asArray(data.teachers)
      : asArray(data.users).filter(user => isFacultyRole(user.role));
    const todayAttendance = asArray(data.attendances).filter(record =>
      String(record.attendanceDate || '').startsWith(todayKey()),
    );
    const feePlans = asArray(data.studentFeePlans);
    const paidFees = feePlans.reduce(
      (sum, plan) =>
        sum +
        asArray(plan.dashboardPayments)
          .filter(payment => String(payment.status || 'RECORDED').toUpperCase() !== 'REVERSED')
          .reduce((paymentSum, payment) => paymentSum + Number(payment.amount || 0), 0),
      0,
    );
    const totalFees = feePlans.reduce((sum, plan) => sum + Number(plan.totalAmount || 0), 0);
    const concessionFees = feePlans.reduce((sum, plan) => sum + Number(plan.concessionAmount || 0), 0);

    return {
      totalBranches: asArray(data.branches).length,
      activeBranches: asArray(data.branches).filter(branch => branch.isActive !== false).length,
      inactiveBranches: asArray(data.branches).filter(branch => branch.isActive === false).length,
      totalClasses: asArray(data.academicClasses).filter(item => item.isActive !== false).length,
      totalTeachers: teachers.length,
      totalStudents: asArray(data.students).length,
      totalUsers: asArray(data.users).length,
      revenue: paidFees,
      todayAttendance: attendancePercent(todayAttendance),
      branchWiseCollection: paidFees,
      branchWiseDues: Math.max(totalFees - paidFees, 0),
      branchWiseConcessions: concessionFees,
      pendingFees: Math.max(totalFees - paidFees, 0),
      rawBranches: asArray(data.branches),
      rawUsers: asArray(data.users),
    };
  },
};

export default mainAdminService;
