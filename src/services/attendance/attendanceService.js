import {USER_ROLES, ATTENDANCE_STATUS} from '../../config/constants';
import logger from '../../utils/logger';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {normalizeAttendanceStatus} from '../../utils/helpers/attendanceHelpers';
import {toISODate} from '../../utils/helpers/dateHelpers';

const today = () => toISODate();

// Roles that can correct (edit after lock) attendance
const canCorrectAttendance = role =>
  [
    USER_ROLES.COORDINATOR,
    USER_ROLES.PRINCIPAL,
    USER_ROLES.MAIN_ADMIN,
  ].includes(String(role || '').toUpperCase());

const normalise = r => ({
  ...r,
  status: normalizeAttendanceStatus(r.status) || r.status,
});

export const summarizeAttendance = (records) => {
  if (!Array.isArray(records)) { records = []; }
  const norm = records.map(r => ({...r, status: normalizeAttendanceStatus(r.status) || r.status}));
  let presentEquiv = 0;
  let present = 0, absent = 0, halfDay = 0, late = 0, medical = 0, approved = 0;
  for (const r of norm) {
    switch (r.status) {
      case ATTENDANCE_STATUS.PRESENT:        present++;  presentEquiv += 1;   break;
      case ATTENDANCE_STATUS.ABSENT:         absent++;                         break;
      case ATTENDANCE_STATUS.HALF_DAY:       halfDay++;  presentEquiv += 0.5; break;
      case ATTENDANCE_STATUS.LATE:           late++;     presentEquiv += 1;   break;
      case ATTENDANCE_STATUS.MEDICAL_LEAVE:  medical++;                        break;
      case ATTENDANCE_STATUS.APPROVED_LEAVE: approved++; presentEquiv += 1;   break;
      default: break;
    }
  }
  const total = present + absent + halfDay + late + medical + approved;
  const percentage = total > 0 ? Math.round((presentEquiv / total) * 100) : 0;
  return {present, absent, halfDay, late, medicalLeave: medical, approvedLeave: approved, total, percentage};
};

export const attendanceService = {
  // ── Queries ────────────────────────────────────────────────────────────────

  async getAttendance(filters = {}) {
    try {
      if (filters.studentId && filters.fromDate && filters.toDate) {
        const response = await dataConnectClient.query(
          DATA_CONNECT_QUERIES.GET_ATTENDANCE_BY_MONTH,
          filters,
        );
        return (response.attendances || []).map(normalise);
      }
      if (filters.sectionId && filters.attendanceDate) {
        const response = await dataConnectClient.query(
          DATA_CONNECT_QUERIES.GET_ATTENDANCE_BY_SECTION,
          filters,
        );
        return (response.attendances || []).map(normalise);
      }
      if (filters.branchId && filters.wingCode) {
        const response = await dataConnectClient.query(
          DATA_CONNECT_QUERIES.GET_ATTENDANCE_BY_WING,
          {
            branchId: filters.branchId,
            wingCode: filters.wingCode,
            fromDate: filters.fromDate || '2000-01-01',
            toDate:   filters.toDate   || today(),
            limit:    filters.limit    || 500,
            offset:   filters.offset   || 0,
          },
        );
        return (response.attendances || []).map(normalise);
      }
      if (filters.branchId) {
        const response = await dataConnectClient.query(
          DATA_CONNECT_QUERIES.GET_ATTENDANCE_BY_BRANCH,
          {
            branchId: filters.branchId,
            fromDate: filters.fromDate || '2000-01-01',
            toDate:   filters.toDate   || today(),
            limit:    filters.limit    || 500,
            offset:   filters.offset   || 0,
          },
        );
        return (response.attendances || []).map(normalise);
      }
      return [];
    } catch (error) {
      logger.log('[Attendance] Query failed:', {filters, error});
      throw error;
    }
  },

  async getSectionHistory({sectionId, fromDate, toDate, limit = 300}) {
    const response = await dataConnectClient.query(
      DATA_CONNECT_QUERIES.GET_ATTENDANCE_BY_SECTION_HISTORY,
      {
        sectionId,
        fromDate: fromDate || '2000-01-01',
        toDate:   toDate   || today(),
        limit,
        offset: 0,
      },
    );
    return (response.attendances || []).map(normalise);
  },

  async getSectionAttendanceMap({sectionId, attendanceDate}) {
    const records = await this.getAttendance({sectionId, attendanceDate});
    return records.reduce((acc, r) => { if (r.studentId) { acc[r.studentId] = r; } return acc; }, {});
  },

  // Returns {[dateStr]: 'locked'|'coordinator'|'teacher'} for calendar dot coloring.
  async getSectionMonthMap({sectionId, yearMonth}) {
    const [year, month] = yearMonth.split('-');
    const fromDate = `${year}-${month}-01`;
    const lastDay  = new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate();
    const toDate   = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
    const records  = await this.getSectionHistory({sectionId, fromDate, toDate, limit: 9999});
    const map = {};
    records.forEach(r => {
      const coordEdited = Boolean(r.editedById && r.editedById !== r.markedById);
      if (!map[r.attendanceDate] || coordEdited) {
        map[r.attendanceDate] = coordEdited ? 'coordinator' : r.isLocked ? 'locked' : 'teacher';
      }
    });
    return map;
  },

  // ── Teacher: mark (first submission only) ─────────────────────────────────

  async markAttendance(payload, scope = {}) {
    const role = String(scope?.role || '').toUpperCase();
    const response = await dataConnectClient.query(
      DATA_CONNECT_QUERIES.GET_ATTENDANCE_BY_SECTION,
      {sectionId: payload.sectionId, attendanceDate: payload.attendanceDate},
    );
    const existing = (response.attendances || []).find(r => r.studentId === payload.studentId);
    if (existing?.id) {
      if (!canCorrectAttendance(role)) {
        throw new Error('Attendance already submitted. Ask a coordinator or principal to make corrections.');
      }
      return this.correctAttendance({
        attendanceId: existing.id,
        actorRole: role,
        scope,
        records: [{
          studentId: payload.studentId,
          status: payload.status,
          editedById: payload.markedById,
          reason: 'Re-marked by admin role',
          remarks: payload.remarks || null,
        }],
        attendanceDate: payload.attendanceDate,
        sectionId: payload.sectionId,
        previousStatus: existing.status,
        branchId: existing.branchId || scope.branchId,
        academicYearId: scope.academicYearId || null,
      });
    }
    const createPayload = {
      ...payload,
      status: normalizeAttendanceStatus(payload.status) || payload.status,
    };
    const createResponse = await dataConnectClient.mutate(
      DATA_CONNECT_MUTATIONS.CREATE_ATTENDANCE,
      createPayload,
    );
    return {id: createResponse.attendance_insert?.id || createResponse.attendance_insert, ...createPayload};
  },

  async saveAttendanceBatch({records = []}, scope = {}) {
    if (!records.length) { throw new Error('No attendance records to save.'); }
    const role = String(scope?.role || '').toUpperCase();

    // Pre-fetch existing attendance maps per sectionId+date
    const existingBySectionDate = {};
    const uniqueKeys = [...new Set(records.map(r => `${r.sectionId}|${r.attendanceDate}`))];
    for (const key of uniqueKeys) {
      const [sectionId, attendanceDate] = key.split('|');
      existingBySectionDate[key] = await this.getSectionAttendanceMap({sectionId, attendanceDate});
    }

    const saved = [];
    for (const record of records) {
      const key      = `${record.sectionId}|${record.attendanceDate}`;
      const existing = existingBySectionDate[key]?.[record.studentId];
      const status   = normalizeAttendanceStatus(record.status) || record.status;

      if (existing?.id) {
        if (!canCorrectAttendance(role)) {
          throw new Error('Attendance already submitted. Ask a coordinator or principal to make corrections.');
        }
        // Use CorrectAttendance mutation (bypasses isLocked)
        const updated = await this.correctAttendance({
          attendanceId: existing.id,
          actorRole: role,
          scope,
          records: [{
            studentId: record.studentId,
            status,
            editedById: record.markedById,
            reason: record.reason || 'Batch attendance update',
            remarks: record.remarks || null,
          }],
          attendanceDate: record.attendanceDate,
          sectionId: record.sectionId,
          previousStatus: existing.status,
          branchId: existing.branchId || scope.branchId || record.branchId,
          academicYearId: scope.academicYearId || null,
        });
        saved.push(updated);
      } else {
        const response = await dataConnectClient.mutate(
          DATA_CONNECT_MUTATIONS.CREATE_ATTENDANCE,
          {...record, status},
        );
        saved.push({id: response.attendance_insert?.id || response.attendance_insert, ...record, status});
      }
    }
    return saved;
  },

  // ── Coordinator / Principal: correct (bypasses lock, writes audit) ─────────

  async correctAttendance({
    attendanceId,
    records,
    actorRole,
    scope,
    attendanceDate,
    sectionId,
    previousStatus,
    branchId,
    academicYearId,
  }) {
    const role = String(actorRole || scope?.role || '').toUpperCase();
    if (!canCorrectAttendance(role)) {
      throw new Error('Only coordinators, principals, branch admins, and main admins can correct submitted attendance');
    }
    if (!records?.length) { throw new Error('No attendance records selected for correction'); }

    const [record] = records;
    if (!record.reason || !String(record.reason).trim()) {
      throw new Error('A reason is required when correcting attendance.');
    }

    const status = normalizeAttendanceStatus(record.status) || record.status;

    // Use CorrectAttendance mutation — bypasses isLocked constraint, writes audit log
    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CORRECT_ATTENDANCE, {
      id:             attendanceId,
      status,
      editedById:     record.editedById,
      editedByRole:   role,
      previousStatus: previousStatus || '',
      reason:         String(record.reason).trim(),
      remarks:        record.remarks || null,
      studentId:      record.studentId,
      sectionId:      sectionId || record.sectionId,
      attendanceDate: attendanceDate || record.attendanceDate,
      branchId:       branchId || scope?.branchId,
      academicYearId: academicYearId || scope?.academicYearId || null,
    });

    return {id: response.attendance_update?.id || attendanceId, ...record, status};
  },

  // ── Daily attendance report ────────────────────────────────────────────────

  async getDailyReport({branchId, attendanceDate}) {
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_DAILY_ATTENDANCE_REPORT,
        {branchId, attendanceDate},
      );
      return (response.attendances || []).map(normalise);
    } catch (err) {
      logger.warn('[Attendance] getDailyReport failed:', err.message);
      return [];
    }
  },

  // ── Monthly attendance report ──────────────────────────────────────────────

  async getMonthlyReport({branchId, fromDate, toDate, limit = 5000, offset = 0}) {
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_MONTHLY_ATTENDANCE_REPORT,
        {branchId, fromDate, toDate, limit, offset},
      );
      return (response.attendances || []).map(normalise);
    } catch (err) {
      logger.warn('[Attendance] getMonthlyReport failed:', err.message);
      return [];
    }
  },

  summarizeAttendance,
  getAttendanceSummary: (records = []) => summarizeAttendance(records),
};

export default attendanceService;
