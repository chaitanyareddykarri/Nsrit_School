import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {USER_ROLES} from '../../config/constants';
import {normalizePhoneNumber} from '../../utils/phone';
import {summarizeAttendance} from '../attendance/attendanceService';

const buildPendingFirebaseUID = ({branchId, phoneNumber}) =>
  `pending:parent:${branchId}:${normalizePhoneNumber(phoneNumber)}`;

const getFeePlans = student =>
  student?.feePlans ||
  student?.parentFeePlans ||
  student?.linkedParentFeePlans ||
  student?.legacyParentFeePlans ||
  [];

// Reduce a single fee plan to its own-year totals (no carry-forward folded in).
const summarizePlan = plan => {
  const planPayments = getFeePayments(plan);
  const activePayments = planPayments.filter(isActivePayment);
  const paid = activePayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const tuition = toAmount(plan?.term1Fee) + toAmount(plan?.term2Fee) + toAmount(plan?.term3Fee);
  const extras = toAmount(plan?.booksFee) + toAmount(plan?.transportFee);
  const items = getFeeItems(plan);
  const gross = toAmount(plan?.grossAmount || tuition + extras || items.reduce((sum, item) => sum + Number(item.amount || 0), 0));
  const concession = calculateConcessionAmount(plan);
  const total = toAmount(plan?.totalAmount || gross - concession);
  const due = Math.max(total - paid, 0);
  return {
    id: plan?.id,
    academicYear: Number(plan?.academicYear) || null,
    total,
    gross,
    concession,
    paid,
    due,
    previousYearDue: toAmount(plan?.previousYearDue),
    term1Fee: toAmount(plan?.term1Fee),
    term2Fee: toAmount(plan?.term2Fee),
    term3Fee: toAmount(plan?.term3Fee),
    booksFee: toAmount(plan?.booksFee),
    transportFee: toAmount(plan?.transportFee),
    items,
    payments: planPayments,
    activePayments,
    isActive: plan?.isActive !== false,
  };
};
const getFeeItems = plan =>
  plan?.items || plan?.parentFeeItems || plan?.linkedParentFeeItems || plan?.legacyParentFeeItems || [];
const getFeePayments = plan =>
  plan?.payments ||
  plan?.parentFeePayments ||
  plan?.linkedParentFeePayments ||
  plan?.legacyParentFeePayments ||
  [];
const isActivePayment = payment => !['REVERSED', 'CANCELLED'].includes(String(payment?.status || 'RECORDED').toUpperCase());
const toAmount = value => Math.max(Number(value || 0), 0);
const calculateConcessionAmount = plan => {
  const gross = toAmount(plan?.grossAmount || plan?.totalAmount);
  const value = toAmount(plan?.concessionValue);
  const type = String(plan?.concessionType || '').toUpperCase();
  if (type === 'PERCENTAGE') {
    return Math.min((gross * value) / 100, gross);
  }
  if (type === 'AMOUNT') {
    return Math.min(value, gross);
  }
  return toAmount(plan?.concessionAmount);
};
const hasParentRole = user =>
  [user?.role, ...(user?.roles || []).map(item => item.role || item)]
    .map(role => String(role || '').toUpperCase())
    .includes(USER_ROLES.PARENT);

export const parentService = {
  async getParentChildren(userId) {
    if (!userId) {
      return [];
    }

    try {
      const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_PARENT_CHILDREN_BY_USER, {
        userId,
      });
      const linkedStudents = (response.studentParents || [])
        .map(link => ({
          ...(link.student || {}),
          parentRelationship: link.relationship,
        }))
        .filter(student => student.id);
      const studentsById = new Map();
      [...linkedStudents, ...(response.legacyStudents || [])].forEach(student => {
        if (!studentsById.has(student.id)) {
          studentsById.set(student.id, student);
        }
      });

      return [...studentsById.values()].map(student => {
        const attendance = student.attendance || student.linkedAttendance || student.legacyAttendance || [];
        const feePlans = getFeePlans(student);
        // Newest year first so the active/current plan leads the breakdown.
        const sortedPlans = [...feePlans].sort((a, b) => Number(b.academicYear || 0) - Number(a.academicYear || 0));
        const activePlan = sortedPlans.find(plan => plan.isActive !== false) || sortedPlans[0];

        // Per-year breakdown using each plan's own numbers (no carry-forward
        // double counting — grand totals below sum these actuals directly).
        const yearlyFees = sortedPlans.map(summarizePlan);
        const grandTotal = yearlyFees.reduce((sum, y) => sum + y.total, 0);
        const grandGross = yearlyFees.reduce((sum, y) => sum + y.gross, 0);
        const grandConcession = yearlyFees.reduce((sum, y) => sum + y.concession, 0);
        const grandPaid = yearlyFees.reduce((sum, y) => sum + y.paid, 0);
        const grandDue = Math.max(grandTotal - grandPaid, 0);

        const activeYear = Number(activePlan?.academicYear) || null;
        // Outstanding owed for academic years prior to the active plan's year.
        const previousYearDue = yearlyFees
          .filter(y => activeYear && y.academicYear && y.academicYear < activeYear)
          .reduce((sum, y) => sum + y.due, 0);
        const currentYearSummary = yearlyFees.find(y => y.academicYear === activeYear) || null;

        const planItems = getFeeItems(activePlan);
        const planPayments = getFeePayments(activePlan);

        const legacyFees = student.fees || student.linkedFees || student.legacyFees || [];
        const legacyFeeSummary = legacyFees.reduce(
          (summary, fee) => ({
            total: summary.total + Number(fee.totalFee || 0),
            paid: summary.paid + Number(fee.paidAmount || 0),
            due: summary.due + Number(fee.remainingAmount || 0),
          }),
          {total: 0, paid: 0, due: 0},
        );

        // Grand summary spans every academic year; previousYearDue surfaces the
        // carry-forward portion for the prominent outstanding-dues banner.
        const feeSummary = activePlan
          ? {
              total: grandTotal,
              gross: grandGross,
              concession: grandConcession,
              paid: grandPaid,
              due: grandDue,
              currentYearTotal: currentYearSummary?.total || 0,
              currentYearDue: currentYearSummary?.due || 0,
              previousYearDue,
              hasOutstanding: grandDue > 0,
              previousYearOutstanding: previousYearDue > 0,
            }
          : {...legacyFeeSummary, previousYearDue: 0, hasOutstanding: legacyFeeSummary.due > 0, previousYearOutstanding: false};

        return {
          ...student,
          attendanceSummary: summarizeAttendance(attendance),
          feeSummary,
          yearlyFees,
          feePlan: activePlan ? {...activePlan, items: planItems, payments: planPayments} : null,
          payments: yearlyFees.flatMap(y => y.payments),
          recentAttendance:
            student.recentAttendance || student.linkedRecentAttendance || student.legacyRecentAttendance || [],
        };
      });
    } catch (error) {
      console.log('[ParentPortal] Failed to load linked children:', {userId, error});
      throw error;
    }
  },

  async getParentDashboard(userId) {
    const children = await this.getParentChildren(userId);
    const selectedChild = children[0] || null;
    const totalDue = children.reduce((sum, child) => sum + Number(child.feeSummary?.due || 0), 0);
    return {
      children,
      selectedChild,
      totalDue,
      childCount: children.length,
    };
  },

  async createParent(payload) {
    if (!payload.branchId || !payload.phoneNumber) {
      throw new Error('Parent branch and phone number are required.');
    }

    const existingParent = await this.getParentByPhone({
      branchId: payload.branchId,
      phoneNumber: payload.phoneNumber,
    });

    const existingUserResponse = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_USER_BY_PHONE, {
      phoneNumber: payload.phoneNumber,
    });
    const existingUser = existingUserResponse.users?.[0];

    // If parent profile already exists:
    if (existingParent) {
      // 1. If it already has a linked user:
      if (existingParent.userId) {
        await this.addParentRole({
          userId: existingParent.userId,
          branchId: payload.branchId,
        });
        console.log('[StudentCreate] Existing parent linked:', {
          parentId: existingParent.id,
          phoneNumber: payload.phoneNumber,
        });
        return existingParent;
      }

      // 2. If it exists but has no user link:
      if (existingUser) {
        // Link parent profile to existing user and assign role
        await this.addParentRole({
          userId: existingUser.id,
          branchId: payload.branchId,
        });
        await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.LINK_PARENT_USER, {
          parentId: existingParent.id,
          userId: existingUser.id,
          branchId: payload.branchId,
        });
        console.log('[StudentCreate] Linked existing parent to user:', {
          parentId: existingParent.id,
          userId: existingUser.id,
        });
        return {
          ...existingParent,
          userId: existingUser.id,
        };
      }

      // 3. If parent exists, has no user link, and no user exists by phone:
      const newFirebaseUID = payload.firebaseUID || buildPendingFirebaseUID({
        branchId: payload.branchId,
        phoneNumber: payload.phoneNumber,
      });
      const userResp = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_USER, {
        firebaseUID: newFirebaseUID,
        fullName: payload.fullName,
        countryCode: payload.countryCode || '+91',
        phoneNumber: payload.phoneNumber,
        role: 'PARENT',
        branchId: payload.branchId,
      });
      const newUserId = userResp.user_insert?.id || userResp.user_insert;
      await this.addParentRole({
        userId: newUserId,
        branchId: payload.branchId,
      });
      await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.LINK_PARENT_USER, {
        parentId: existingParent.id,
        userId: newUserId,
        branchId: payload.branchId,
      });
      console.log('[StudentCreate] Created user for existing parent:', {
        parentId: existingParent.id,
        userId: newUserId,
      });
      return {
        ...existingParent,
        userId: newUserId,
      };
    }

    // If parent profile does not exist:
    if (existingUser && !hasParentRole(existingUser)) {
      await this.addParentRole({
        userId: existingUser.id,
        branchId: payload.branchId,
      });
    }

    const mutationPayload = {
      branchId: payload.branchId,
      fullName: payload.fullName,
      fatherName: payload.fatherName || null,
      motherName: payload.motherName || null,
      countryCode: payload.countryCode || '+91',
      phoneNumber: payload.phoneNumber,
      address: payload.address || null,
    };

    const response = existingUser
      ? await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_PARENT, {
          ...mutationPayload,
          userId: existingUser.id,
        })
      : await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_PARENT_WITHOUT_USER, {
          ...mutationPayload,
          firebaseUID:
            payload.firebaseUID ||
            buildPendingFirebaseUID({
              branchId: payload.branchId,
              phoneNumber: payload.phoneNumber,
            }),
        });

    const parentId = response.parent_insert?.id || response.parent_insert;
    const finalUserId = response.user_insert?.id || existingUser?.id || payload.userId || null;
    console.log('[StudentCreate] Parent created:', {
      parentId,
      userId: finalUserId,
      phoneNumber: payload.phoneNumber,
    });

    return {
      id: parentId,
      userId: finalUserId,
      ...mutationPayload,
      isActive: true,
    };
  },

  async addParentRole({userId, branchId}) {
    if (!userId) {
      return null;
    }

    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ADD_PARENT_ROLE, {
      userId,
      branchId: branchId || null,
    });
    return {userId, role: USER_ROLES.PARENT};
  },

  async linkStudentParent({studentId, userId, relationship, branchId}) {
    if (!studentId || !userId || !relationship || !branchId) {
      throw new Error('Student, parent user, relationship, and branch are required.');
    }

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.LINK_STUDENT_PARENT, {
      studentId,
      userId,
      relationship,
      branchId,
    });
    return response.studentParent_upsert || response.studentParent_insert || {studentId, userId, relationship};
  },

  async getParentByUser(userId) {
    if (!userId) {
      return null;
    }

    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_PARENT_BY_USER, {
      userId,
    });
    return response.parents?.[0] || null;
  },

  async getParentByPhone({branchId, phoneNumber}) {
    if (!branchId || !phoneNumber) {
      return null;
    }

    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_PARENT_BY_PHONE, {
      branchId,
      phoneNumber,
    });
    return response.parents?.[0] || null;
  },
};

export default parentService;
