import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';

// Indian-grouping currency formatting for notification message bodies.
const formatAmount = value =>
  Number(value || 0).toLocaleString('en-IN', {maximumFractionDigits: 2});

export const notificationService = {
  async getNotifications({userId, limit = 30, offset = 0}) {
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_NOTIFICATIONS_BY_USER,
        {userId, limit, offset},
      );
      return response.notifications || [];
    } catch (error) {
      console.log('[Notifications] Fetch failed:', error);
      return [];
    }
  },

  async getUnreadCount(userId) {
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_UNREAD_NOTIFICATION_COUNT,
        {userId},
      );
      return (response.notifications || []).length;
    } catch (error) {
      console.log('[Notifications] Unread count failed:', error);
      return 0;
    }
  },

  async markRead(notificationId) {
    try {
      await dataConnectClient.mutate(
        DATA_CONNECT_MUTATIONS.MARK_NOTIFICATION_READ,
        {id: notificationId},
      );
    } catch (error) {
      console.log('[Notifications] Mark read failed:', error);
    }
  },

  async markAllRead(userId) {
    try {
      await dataConnectClient.mutate(
        DATA_CONNECT_MUTATIONS.MARK_ALL_NOTIFICATIONS_READ,
        {userId},
      );
    } catch (error) {
      console.log('[Notifications] Mark all read failed:', error);
    }
  },

  async createNotification({userId, branchId, title, message, audienceRole, createdById = null, createdByRole = null}) {
    try {
      const response = await dataConnectClient.mutate(
        DATA_CONNECT_MUTATIONS.CREATE_NOTIFICATION,
        {userId, branchId, title, message, audienceRole: audienceRole || 'PARENT', createdById, createdByRole},
      );
      return response.notification_insert;
    } catch (error) {
      console.log('[Notifications] Create failed:', error);
    }
  },

  // Broadcast a notification to a target audience within a branch.
  // target: 'all' | 'parents' | 'teachers' | 'students'
  // senderId / senderName / senderRole: identity of the broadcaster — sender always gets a copy.
  // Returns {sent, failed} counts.
  async broadcastNotification({branchId, title, message, target = 'all', senderId = null, senderName = null, senderRole = null}) {
    if (!branchId) {throw new Error('branchId required for broadcast');}
    const userIds = new Set();

    // Sender always receives their own broadcast so it appears in their Notification Center.
    if (senderId) {
      userIds.add(senderId);
    }

    try {
      const includeStaff = target === 'all' || target === 'teachers';
      const includeParents = target === 'all' || target === 'parents' || target === 'students';

      const [staffRes, studentsRes] = await Promise.all([
        includeStaff
          ? dataConnectClient.query(DATA_CONNECT_QUERIES.GET_BRANCH_STAFF_USER_IDS, {branchId, limit: 500})
          : Promise.resolve(null),
        includeParents
          ? dataConnectClient.query(DATA_CONNECT_QUERIES.GET_BRANCH_STUDENTS_WITH_PARENTS, {branchId, limit: 1000})
          : Promise.resolve(null),
      ]);

      if (staffRes?.users) {
        staffRes.users.forEach(u => u?.id && userIds.add(u.id));
      }
      if (studentsRes?.students) {
        studentsRes.students.forEach(s => {
          (s?.linkedParents || []).forEach(lp => lp?.userId && userIds.add(lp.userId));
        });
      }
    } catch (err) {
      console.log('[Notifications] Broadcast user fetch failed:', err);
      throw err;
    }

    if (!userIds.size) {return {sent: 0, failed: 0};}

    const results = await Promise.allSettled(
      [...userIds].map(uid =>
        this.createNotification({
          userId: uid,
          branchId,
          title,
          message,
          audienceRole: target.toUpperCase(),
          createdById: senderId,
          createdByRole: senderRole,
        }),
      ),
    );
    const sent = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - sent;
    console.log(`[Notifications] Broadcast sent ${sent}/${userIds.size}, failed ${failed}`);
    return {sent, failed};
  },

  // Delete a single notification record and record an audit log entry.
  // The backend DeleteNotification mutation removes the record from the database,
  // which makes it disappear for all users who hold that notification ID.
  async deleteNotification({id, title, branchId = null, deletedById, deletedByName, deletedByRole}) {
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.DELETE_NOTIFICATION, {id});
    try {
      await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.RECORD_AUDIT_LOG, {
        performedBy: deletedByName || deletedByRole || 'UNKNOWN',
        performedRole: deletedByRole,
        actingAs: deletedByRole,
        branchId: branchId || null,
        action: 'DeleteNotification',
        entityType: 'NOTIFICATION',
        entityId: id,
        oldData: JSON.stringify({title, deletedById}),
        newData: null,
      });
    } catch (_) {
      // Audit log failures never block the delete operation
    }
  },

  // ── Fee notifications ──────────────────────────────────────────────────────

  // Sends a "fees due" alert to a parent's Notification Center. Includes the
  // current outstanding amount and, when present, the prior-year carry-forward
  // so the parent sees the full obligation.
  async sendFeeTermDueNotification({
    parentUserId,
    branchId,
    studentName,
    className,
    sectionName,
    dueAmount,
    previousYearDue = 0,
    academicYear = null,
    createdById = null,
    createdByRole = null,
  }) {
    if (!parentUserId) {return null;}
    const classLabel = className && sectionName ? ` (Class ${className}-${sectionName})` : '';
    const carryNote = Number(previousYearDue) > 0
      ? ` This includes ₹${formatAmount(previousYearDue)} carried forward from previous years.`
      : '';
    return this.createNotification({
      userId: parentUserId,
      branchId,
      title: 'Fees Due',
      message: `Fees of ₹${formatAmount(dueAmount)} are pending for ${studentName}${classLabel}.${carryNote} Please clear the dues at the earliest.`,
      audienceRole: 'PARENT',
      createdById,
      createdByRole,
      category: 'FEE_DUE',
      academicYear,
    });
  },

  // Sends a payment-receipt confirmation to a parent after a payment is recorded.
  async sendFeeReceiptNotification({
    parentUserId,
    branchId,
    studentName,
    amount,
    receiptNumber,
    paymentDate,
    remainingDue = 0,
    academicYear = null,
    createdById = null,
    createdByRole = null,
  }) {
    if (!parentUserId) {return null;}
    const dateLabel = paymentDate
      ? new Date(paymentDate + 'T00:00:00').toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'})
      : '';
    const remainingNote = Number(remainingDue) > 0
      ? ` Remaining balance: ₹${formatAmount(remainingDue)}.`
      : ' All dues cleared. Thank you!';
    return this.createNotification({
      userId: parentUserId,
      branchId,
      title: 'Payment Received',
      message: `Payment of ₹${formatAmount(amount)} for ${studentName} was received${dateLabel ? ` on ${dateLabel}` : ''}. Receipt: ${receiptNumber || '—'}.${remainingNote}`,
      audienceRole: 'PARENT',
      createdById,
      createdByRole,
      category: 'FEE_RECEIPT',
      academicYear,
    });
  },

  // Sends an outstanding-dues reminder (e.g. for prior-year carry-forward balances).
  async sendOutstandingDueReminder({
    parentUserId,
    branchId,
    studentName,
    outstandingAmount,
    academicYear = null,
    createdById = null,
    createdByRole = null,
  }) {
    if (!parentUserId) {return null;}
    return this.createNotification({
      userId: parentUserId,
      branchId,
      title: 'Outstanding Dues',
      message: `An outstanding balance of ₹${formatAmount(outstandingAmount)} remains for ${studentName}. Kindly clear the dues to avoid any disruption.`,
      audienceRole: 'PARENT',
      createdById,
      createdByRole,
      category: 'FEE_DUE',
      academicYear,
    });
  },

  // Called after attendance is saved — creates notifications for absent students' parents.
  // absentStudents: [{id, fullName, parent: {userId}, branchId, academicClass: {name}, section: {name}}]
  async notifyAbsentStudentsParents({absentStudents = [], attendanceDate, markedByName}) {
    if (!absentStudents.length) {return;}
    const dateLabel = attendanceDate
      ? new Date(attendanceDate + 'T00:00:00').toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : attendanceDate;

    const results = await Promise.allSettled(
      absentStudents.map(student => {
        const parentUserId = student?.parent?.userId;
        if (!parentUserId) {return Promise.resolve(null);}
        const className = student?.academicClass?.name || '';
        const sectionName = student?.section?.name || '';
        const classLabel = className && sectionName ? `${className}-${sectionName}` : className || sectionName;
        return this.createNotification({
          userId: parentUserId,
          branchId: student.branchId,
          title: 'Attendance Alert',
          message: `Your child ${student.fullName} was marked absent on ${dateLabel}${classLabel ? ` (Class ${classLabel})` : ''}. Please contact the school if this is incorrect.`,
          audienceRole: 'PARENT',
        });
      }),
    );

    const created = results.filter(r => r.status === 'fulfilled' && r.value).length;
    console.log(`[Notifications] Created ${created}/${absentStudents.length} absence notifications`);
    return created;
  },
};

export default notificationService;
