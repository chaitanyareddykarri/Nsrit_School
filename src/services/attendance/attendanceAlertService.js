import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {notificationService} from '../notifications/notificationService';

// Thresholds in descending order — highest first so we fire the most critical alert
const THRESHOLDS = [90, 80, 75, 70];

const ALERT_ROLES = {
  90: ['PARENT', 'TEACHER'],
  80: ['PARENT', 'TEACHER', 'COORDINATOR'],
  75: ['PARENT', 'TEACHER', 'COORDINATOR', 'PRINCIPAL'],
  70: ['PARENT', 'TEACHER', 'COORDINATOR', 'PRINCIPAL'],
};

export const attendanceAlertService = {
  /**
   * Check all 4 thresholds for a student's current attendance percentage.
   * If the student just fell below a threshold and no alert has been sent yet
   * this month, fires a notification and records the alert log.
   *
   * @param {object} params
   * @param {string} params.studentId
   * @param {string} params.studentName
   * @param {string} params.branchId
   * @param {string} params.academicYearId
   * @param {string} params.yearMonth    - 'YYYY-MM'
   * @param {number} params.currentPct   - 0..100
   * @param {string[]} params.parentUserIds - FCM targets
   * @param {string[]} params.teacherUserIds
   * @param {string[]} params.coordinatorUserIds
   * @param {string[]} params.principalUserIds
   */
  async checkAndFireAlerts({
    studentId,
    studentName,
    branchId,
    academicYearId,
    yearMonth,
    currentPct,
    parentUserIds = [],
    teacherUserIds = [],
    coordinatorUserIds = [],
    principalUserIds = [],
  }) {
    for (const threshold of THRESHOLDS) {
      if (currentPct >= threshold) { continue; }

      // Check if we already sent this alert this month
      const alreadySent = await this._alreadySent(studentId, threshold, yearMonth);
      if (alreadySent) { continue; }

      const roles = ALERT_ROLES[threshold];
      const sentToRoles = roles.join(',');

      // Build targets with per-user role mapping so each notification gets the correct audienceRole
      const userRoleMap = new Map();
      if (roles.includes('PARENT'))      { parentUserIds.forEach(id => userRoleMap.set(id, 'PARENT')); }
      if (roles.includes('TEACHER'))     { teacherUserIds.forEach(id => userRoleMap.set(id, 'TEACHER')); }
      if (roles.includes('COORDINATOR')) { coordinatorUserIds.forEach(id => userRoleMap.set(id, 'COORDINATOR')); }
      if (roles.includes('PRINCIPAL'))   { principalUserIds.forEach(id => userRoleMap.set(id, 'PRINCIPAL')); }

      for (const [userId, audienceRole] of userRoleMap) {
        await notificationService.createNotification({
          userId,
          branchId,
          title: `Low Attendance Alert — ${studentName}`,
          message: `${studentName}'s attendance is ${currentPct.toFixed(1)}%, below the ${threshold}% threshold. Please take necessary action.`,
          audienceRole,
        }).catch(err => console.warn('[AlertService] notification failed:', err.message));
      }

      // Record alert log to prevent duplicate sends this month
      await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_ATTENDANCE_ALERT_LOG, {
        studentId,
        branchId,
        academicYearId,
        threshold,
        alertType: 'MONTHLY',
        yearMonth,
        currentPct,
        sentToRoles,
      }).catch(err => console.warn('[AlertService] alert log insert failed:', err.message));
    }
  },

  async _alreadySent(studentId, threshold, yearMonth) {
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_ATTENDANCE_ALERT_LOG,
        {studentId, threshold, yearMonth},
      );
      return (response.attendanceAlertLogs || []).length > 0;
    } catch {
      return false;
    }
  },
};

export default attendanceAlertService;
