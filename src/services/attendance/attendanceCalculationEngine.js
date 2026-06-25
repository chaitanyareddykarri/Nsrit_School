import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {
  ABSENT_EQUIVALENT_STATUSES,
  ATTENDANCE_STATUS,
  PRESENT_EQUIVALENT_STATUSES,
} from '../../config/constants';
import {normalizeAttendanceStatus} from '../../utils/helpers/attendanceHelpers';
import {toISODate} from '../../utils/helpers/dateHelpers';

// ── Helpers ────────────────────────────────────────────────────────────────────

const pad = n => String(n).padStart(2, '0');

const isSunday = dateStr => new Date(dateStr + 'T00:00:00').getDay() === 0;

const getMonthRange = yearMonth => {
  const [year, month] = yearMonth.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    fromDate: `${year}-${pad(month)}-01`,
    toDate:   `${year}-${pad(month)}-${pad(lastDay)}`,
  };
};

const getDatesInRange = (fromDate, toDate) => {
  const dates = [];
  const cur = new Date(fromDate + 'T00:00:00');
  const end = new Date(toDate + 'T00:00:00');
  while (cur <= end) {
    dates.push(toISODate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

// ── Present credit per status ──────────────────────────────────────────────────
const presentCredit = status => {
  const s = normalizeAttendanceStatus(status) || String(status || '').toUpperCase();
  if (PRESENT_EQUIVALENT_STATUSES.includes(s)) { return 1; }
  if (s === ATTENDANCE_STATUS.HALF_DAY) { return 0.5; }
  return 0;
};

const absentCredit = status => {
  const s = normalizeAttendanceStatus(status) || String(status || '').toUpperCase();
  if (ABSENT_EQUIVALENT_STATUSES.includes(s)) { return 1; }
  if (s === ATTENDANCE_STATUS.HALF_DAY) { return 0.5; }
  return 0;
};

// ── Working day count ─────────────────────────────────────────────────────────

/**
 * Count working days in a date range (excludes Sundays and holidays).
 * holidayDates: Set<string> — pre-fetched holiday date strings for the range.
 */
const countWorkingDays = (fromDate, toDate, holidayDateSet = new Set()) => {
  const dates = getDatesInRange(fromDate, toDate);
  return dates.filter(d => !isSunday(d) && !holidayDateSet.has(d)).length;
};

const countSundays = (fromDate, toDate) => {
  return getDatesInRange(fromDate, toDate).filter(isSunday).length;
};

// ── Per-month summary calculation ─────────────────────────────────────────────

/**
 * Calculate summary counts from a list of attendance records for one student, one month.
 * records: array from GetAttendanceByMonth
 * holidayDateSet: Set<string> of holiday date strings for that month
 * ayStartDate / ayEndDate: academic year bounds (clamp working day count)
 */
const buildMonthlySummary = (records, yearMonth, holidayDateSet, ayStartDate, ayEndDate) => {
  const {fromDate: mFrom, toDate: mTo} = getMonthRange(yearMonth);

  // Clamp to academic year boundaries
  const effectiveFrom = mFrom < ayStartDate ? ayStartDate : mFrom;
  const effectiveTo   = mTo   > ayEndDate   ? ayEndDate   : mTo;

  const totalWorkingDays = countWorkingDays(effectiveFrom, effectiveTo, holidayDateSet);
  const sundayCount      = countSundays(effectiveFrom, effectiveTo);

  let presentCount = 0, absentCount = 0, halfDayCount = 0;
  let lateCount = 0, medicalLeaveCount = 0, approvedLeaveCount = 0;
  let holidayCount = holidayDateSet.size;
  let presentEquiv = 0, absentEquiv = 0;

  for (const rec of records) {
    const s = normalizeAttendanceStatus(rec.status) || String(rec.status || '').toUpperCase();
    switch (s) {
      case ATTENDANCE_STATUS.PRESENT:
        presentCount++;
        presentEquiv += 1;
        absentEquiv += 0;
        break;
      case ATTENDANCE_STATUS.ABSENT:
        absentCount++;
        absentEquiv += 1;
        break;
      case ATTENDANCE_STATUS.HALF_DAY:
        halfDayCount++;
        presentEquiv += 0.5;
        absentEquiv  += 0.5;
        break;
      case ATTENDANCE_STATUS.LATE:
        lateCount++;
        presentEquiv += 1;
        break;
      case ATTENDANCE_STATUS.MEDICAL_LEAVE:
        medicalLeaveCount++;
        absentEquiv += 1;
        break;
      case ATTENDANCE_STATUS.APPROVED_LEAVE:
        approvedLeaveCount++;
        presentEquiv += 1;
        break;
      default:
        break;
    }
  }

  const effectiveDays = records.length; // days teacher has actually submitted
  const attendancePct = effectiveDays > 0
    ? Math.floor((presentEquiv / effectiveDays) * 10000) / 100
    : 0;

  return {
    totalWorkingDays,
    effectiveDays,
    presentCount,
    absentCount,
    halfDayCount,
    lateCount,
    medicalLeaveCount,
    approvedLeaveCount,
    holidayCount,
    sundayCount,
    attendancePct,
  };
};

// ── Academic-year rolling percentage ─────────────────────────────────────────

const computeAcademicYearPct = monthSummaries => {
  let totalPresent = 0, totalEffective = 0;
  for (const m of monthSummaries) {
    totalPresent  += m.presentCount + (m.halfDayCount * 0.5)
                   + m.lateCount + m.approvedLeaveCount;
    totalEffective += m.effectiveDays;
  }
  return totalEffective > 0
    ? Math.floor((totalPresent / totalEffective) * 10000) / 100
    : 0;
};

// ── Public API ────────────────────────────────────────────────────────────────

export const attendanceCalculationEngine = {
  buildMonthlySummary,
  countWorkingDays,
  countSundays,
  getDatesInRange,

  /**
   * Summarise a list of attendance records (any mix of students, any date range).
   * Returns {present, absent, halfDay, late, medicalLeave, approvedLeave, total, pct}
   */
  summarise(records = []) {
    let presentEquiv = 0, absentEquiv = 0;
    let present = 0, absent = 0, halfDay = 0, late = 0, medical = 0, approved = 0;
    for (const rec of records) {
      const s = normalizeAttendanceStatus(rec.status) || String(rec.status || '').toUpperCase();
      switch (s) {
        case ATTENDANCE_STATUS.PRESENT:        present++;  presentEquiv += 1; break;
        case ATTENDANCE_STATUS.ABSENT:         absent++;   absentEquiv  += 1; break;
        case ATTENDANCE_STATUS.HALF_DAY:       halfDay++;  presentEquiv += 0.5; absentEquiv += 0.5; break;
        case ATTENDANCE_STATUS.LATE:           late++;     presentEquiv += 1; break;
        case ATTENDANCE_STATUS.MEDICAL_LEAVE:  medical++;  absentEquiv  += 1; break;
        case ATTENDANCE_STATUS.APPROVED_LEAVE: approved++; presentEquiv += 1; break;
        default: break;
      }
    }
    const total = records.length;
    const pct   = total > 0 ? Math.floor((presentEquiv / total) * 10000) / 100 : 0;
    return {present, absent, halfDay, late, medicalLeave: medical, approvedLeave: approved, total, pct};
  },

  /**
   * Recalculate and upsert the attendance_summaries row for one student + month.
   * Called after every teacher submission or coordinator correction.
   */
  async triggerSummaryRecalculation({
    studentId, sectionId, branchId, academicYearId,
    yearMonth, ayStartDate, ayEndDate,
    attendanceRecords, holidayDateSet,
  }) {
    try {
      const {fromDate, toDate} = getMonthRange(yearMonth);
      const clampedFrom = fromDate < ayStartDate ? ayStartDate : fromDate;
      const clampedTo   = toDate   > ayEndDate   ? ayEndDate   : toDate;

      // Filter records for this student + month
      const monthRecords = attendanceRecords.filter(r => {
        const d = r.attendanceDate;
        return d >= clampedFrom && d <= clampedTo;
      });

      const summary = buildMonthlySummary(
        monthRecords, yearMonth, holidayDateSet, ayStartDate, ayEndDate,
      );

      // Compute rolling AY% using all months for this student, not just the current month.
      let academicYearPct = summary.attendancePct;
      try {
        const existingResp = await dataConnectClient.query(
          DATA_CONNECT_QUERIES.GET_ATTENDANCE_SUMMARY_BY_STUDENT,
          {studentId, academicYearId},
        );
        const existingSummaries = (existingResp.attendanceSummaries || [])
          .filter(m => m.yearMonth !== yearMonth);
        academicYearPct = computeAcademicYearPct([...existingSummaries, summary]);
      } catch {
        // Fall back to current month pct if the query fails
      }

      await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPSERT_ATTENDANCE_SUMMARY, {
        studentId,
        branchId,
        sectionId,
        academicYearId,
        yearMonth,
        ...summary,
        academicYearPct,
      });
    } catch (err) {
      console.warn('[CalcEngine] triggerSummaryRecalculation failed:', err.message);
    }
  },

  computeAcademicYearPct,

  /**
   * Fetch pre-calculated summaries for a student across the full academic year.
   */
  async getStudentAcademicYearSummary(studentId, academicYearId) {
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_ATTENDANCE_SUMMARY_BY_STUDENT,
        {studentId, academicYearId},
      );
      const summaries = response.attendanceSummaries || [];
      const ayPct = computeAcademicYearPct(summaries);
      const totals = summaries.reduce(
        (acc, m) => ({
          presentCount:       acc.presentCount       + m.presentCount,
          absentCount:        acc.absentCount        + m.absentCount,
          halfDayCount:       acc.halfDayCount       + m.halfDayCount,
          lateCount:          acc.lateCount          + m.lateCount,
          medicalLeaveCount:  acc.medicalLeaveCount  + m.medicalLeaveCount,
          approvedLeaveCount: acc.approvedLeaveCount + m.approvedLeaveCount,
          holidayCount:       acc.holidayCount       + m.holidayCount,
          sundayCount:        acc.sundayCount        + m.sundayCount,
          effectiveDays:      acc.effectiveDays      + m.effectiveDays,
          totalWorkingDays:   acc.totalWorkingDays   + m.totalWorkingDays,
        }),
        {
          presentCount: 0, absentCount: 0, halfDayCount: 0, lateCount: 0,
          medicalLeaveCount: 0, approvedLeaveCount: 0, holidayCount: 0,
          sundayCount: 0, effectiveDays: 0, totalWorkingDays: 0,
        },
      );
      return {months: summaries, totals, academicYearPct: ayPct};
    } catch (err) {
      console.warn('[CalcEngine] getStudentAcademicYearSummary failed:', err.message);
      return {months: [], totals: {}, academicYearPct: 0};
    }
  },

  /**
   * Fetch low-attendance students for a branch + month below a threshold.
   */
  async getLowAttendanceStudents({branchId, academicYearId, thresholdPct, yearMonth}) {
    try {
      const response = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_LOW_ATTENDANCE_STUDENTS,
        {branchId, academicYearId, thresholdPct, yearMonth: yearMonth || null},
      );
      return response.attendanceSummaries || [];
    } catch (err) {
      console.warn('[CalcEngine] getLowAttendanceStudents failed:', err.message);
      return [];
    }
  },
};

export default attendanceCalculationEngine;
