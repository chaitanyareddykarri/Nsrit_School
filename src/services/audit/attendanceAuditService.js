import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';

export const attendanceAuditService = {
  // Write an audit log entry for a coordinator/principal attendance correction.
  // Called automatically inside CorrectAttendance mutation — use getAuditLog for reads.
  async getAuditLog(attendanceId) {
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_ATTENDANCE_AUDIT_LOG,
        {attendanceId},
      );
      return response.attendanceAuditLogs || [];
    } catch (err) {
      console.warn('[AttendanceAudit] getAuditLog failed:', err.message);
      return [];
    }
  },

  async getAuditLogByBranch({branchId, fromDate, toDate, limit = 200, offset = 0}) {
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_ATTENDANCE_AUDIT_LOG_BY_BRANCH,
        {branchId, fromDate, toDate, limit, offset},
      );
      return response.attendanceAuditLogs || [];
    } catch (err) {
      console.warn('[AttendanceAudit] getAuditLogByBranch failed:', err.message);
      return [];
    }
  },

  async getAuditLogBySection({sectionId, fromDate, toDate}) {
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_ATTENDANCE_AUDIT_LOG_BY_SECTION,
        {sectionId, fromDate, toDate},
      );
      return response.attendanceAuditLogs || [];
    } catch (err) {
      console.warn('[AttendanceAudit] getAuditLogBySection failed:', err.message);
      return [];
    }
  },
};

export default attendanceAuditService;
