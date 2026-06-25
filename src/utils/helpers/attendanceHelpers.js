import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_ICONS,
  ATTENDANCE_STATUS_LABELS,
  ABSENT_EQUIVALENT_STATUSES,
  LEAVE_STATUSES,
  PRESENT_EQUIVALENT_STATUSES,
} from '../../config/constants';

export const normalizeAttendanceStatus = status => {
  if (!status) { return null; }
  const normalized = String(status).trim().toUpperCase();
  switch (normalized) {
    case 'PRESENT':        return ATTENDANCE_STATUS.PRESENT;
    case 'ABSENT':         return ATTENDANCE_STATUS.ABSENT;
    case 'HALF_DAY':       return ATTENDANCE_STATUS.HALF_DAY;
    case 'LATE':           return ATTENDANCE_STATUS.LATE;
    case 'MEDICAL_LEAVE':  return ATTENDANCE_STATUS.MEDICAL_LEAVE;
    case 'APPROVED_LEAVE': return ATTENDANCE_STATUS.APPROVED_LEAVE;
    case 'HOLIDAY':        return ATTENDANCE_STATUS.HOLIDAY;
    case 'SUNDAY_HOLIDAY': return ATTENDANCE_STATUS.SUNDAY_HOLIDAY;
    case 'PUBLIC_HOLIDAY': return ATTENDANCE_STATUS.PUBLIC_HOLIDAY;
    case 'SCHOOL_HOLIDAY': return ATTENDANCE_STATUS.SCHOOL_HOLIDAY;
    default:               return null;
  }
};

export const getStatusLabel = status =>
  ATTENDANCE_STATUS_LABELS[String(status || '').toUpperCase()] || String(status || '');

export const getStatusIcon = status =>
  ATTENDANCE_STATUS_ICONS[String(status || '').toUpperCase()] || 'help-circle-outline';

export const getStatusColor = status =>
  ATTENDANCE_STATUS_COLORS[String(status || '').toUpperCase()] || '#94A3B8';

// Returns 1 for present, 0.5 for half day, 0 for absent/leave/holiday
export const getPresentCredit = status => {
  const s = String(status || '').toUpperCase();
  if (PRESENT_EQUIVALENT_STATUSES.includes(s)) { return 1; }
  if (s === ATTENDANCE_STATUS.HALF_DAY) { return 0.5; }
  return 0;
};

// Returns 1 for absent, 0.5 for half day, 0 otherwise
export const getAbsentCredit = status => {
  const s = String(status || '').toUpperCase();
  if (ABSENT_EQUIVALENT_STATUSES.includes(s)) { return 1; }
  if (s === ATTENDANCE_STATUS.HALF_DAY) { return 0.5; }
  return 0;
};

export const isLeaveStatus = status =>
  LEAVE_STATUSES.includes(String(status || '').toUpperCase());

export const isHolidayStatus = status => {
  const s = String(status || '').toUpperCase();
  return [
    ATTENDANCE_STATUS.HOLIDAY,
    ATTENDANCE_STATUS.SUNDAY_HOLIDAY,
    ATTENDANCE_STATUS.PUBLIC_HOLIDAY,
    ATTENDANCE_STATUS.SCHOOL_HOLIDAY,
  ].includes(s);
};

// Whether a status is one a teacher can mark (not auto/holiday types)
export const isMarkableStatus = status =>
  ['PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'MEDICAL_LEAVE', 'APPROVED_LEAVE']
    .includes(String(status || '').toUpperCase());
