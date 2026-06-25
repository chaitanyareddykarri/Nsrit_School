export const APP_NAME = 'NSRIT Connect';

export const USER_ROLES = {
  MAIN_ADMIN: 'MAIN_ADMIN',
  BRANCH_ADMIN: 'BRANCH_ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  COORDINATOR: 'COORDINATOR',
  TEACHER: 'TEACHER',
  CLASS_TEACHER: 'CLASS_TEACHER',
  PARENT: 'PARENT',
  ACCOUNTANT: 'ACCOUNTANT',
};

export const STAFF_TYPES = {
  TEACHING: 'TEACHING',
  SUPPORTING: 'SUPPORTING',
};

export const STAFF_TYPE_LABELS = {
  [STAFF_TYPES.TEACHING]: 'Teaching Staff',
  [STAFF_TYPES.SUPPORTING]: 'Supporting Staff',
};

export const ROLE_LABELS = {
  [USER_ROLES.MAIN_ADMIN]: 'Main Admin',
  [USER_ROLES.BRANCH_ADMIN]: 'Branch Admin',
  [USER_ROLES.PRINCIPAL]: 'Principal',
  [USER_ROLES.COORDINATOR]: 'Coordinator',
  [USER_ROLES.TEACHER]: 'Teacher',
  [USER_ROLES.CLASS_TEACHER]: 'Class Teacher',
  [USER_ROLES.PARENT]: 'Parent',
  [USER_ROLES.ACCOUNTANT]: 'Accountant',
};

export const HOLIDAY_TYPES = {
  NATIONAL:  'NATIONAL',
  STATE:     'STATE',
  SCHOOL:    'SCHOOL',
  FESTIVAL:  'FESTIVAL',
  EMERGENCY: 'EMERGENCY',
};

export const HOLIDAY_TYPE_LABELS = {
  [HOLIDAY_TYPES.NATIONAL]:  'National Holiday',
  [HOLIDAY_TYPES.STATE]:     'State Holiday',
  [HOLIDAY_TYPES.SCHOOL]:    'School Holiday',
  [HOLIDAY_TYPES.FESTIVAL]:  'Festival Holiday',
  [HOLIDAY_TYPES.EMERGENCY]: 'Emergency Holiday',
};

export const HOLIDAY_TYPE_ICONS = {
  [HOLIDAY_TYPES.NATIONAL]:  'flag',
  [HOLIDAY_TYPES.STATE]:     'map-marker-outline',
  [HOLIDAY_TYPES.SCHOOL]:    'school',
  [HOLIDAY_TYPES.FESTIVAL]:  'party-popper',
  [HOLIDAY_TYPES.EMERGENCY]: 'alert-circle',
};

export const USER_ROLE_PRIORITY = [
  USER_ROLES.MAIN_ADMIN,
  USER_ROLES.BRANCH_ADMIN,
  USER_ROLES.PRINCIPAL,
  USER_ROLES.COORDINATOR,
  USER_ROLES.TEACHER,
  USER_ROLES.CLASS_TEACHER,
  USER_ROLES.ACCOUNTANT,
  USER_ROLES.PARENT,
];

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth.token',
  AUTH_USER: 'auth.user',
  MAIN_ADMIN_BRANCH_CONTEXT: 'mainAdmin.branchContext',
  OTP_VERIFICATION_ID: 'auth.otpVerificationId',
  ACTIVE_CHILD_ID: 'parent.activeChildId',
};

export const ATTENDANCE_STATUS = {
  PRESENT:        'PRESENT',
  ABSENT:         'ABSENT',
  HALF_DAY:       'HALF_DAY',
  LATE:           'LATE',
  MEDICAL_LEAVE:  'MEDICAL_LEAVE',
  APPROVED_LEAVE: 'APPROVED_LEAVE',
  HOLIDAY:        'HOLIDAY',
  SUNDAY_HOLIDAY: 'SUNDAY_HOLIDAY',
  PUBLIC_HOLIDAY: 'PUBLIC_HOLIDAY',
  SCHOOL_HOLIDAY: 'SCHOOL_HOLIDAY',
};

export const ATTENDANCE_STATUS_LABELS = {
  PRESENT:        'Present',
  ABSENT:         'Absent',
  HALF_DAY:       'Half Day',
  LATE:           'Late',
  MEDICAL_LEAVE:  'Medical Leave',
  APPROVED_LEAVE: 'Approved Leave',
  HOLIDAY:        'Holiday',
  SUNDAY_HOLIDAY: 'Sunday',
  PUBLIC_HOLIDAY: 'Public Holiday',
  SCHOOL_HOLIDAY: 'School Holiday',
};

export const ATTENDANCE_STATUS_ICONS = {
  PRESENT:        'check-circle-outline',
  ABSENT:         'close-circle-outline',
  HALF_DAY:       'circle-half-full',
  LATE:           'clock-alert-outline',
  MEDICAL_LEAVE:  'medical-bag',
  APPROVED_LEAVE: 'calendar-check-outline',
  HOLIDAY:        'star-circle-outline',
  SUNDAY_HOLIDAY: 'weather-sunny',
  PUBLIC_HOLIDAY: 'flag-outline',
  SCHOOL_HOLIDAY: 'school-outline',
};

export const ATTENDANCE_STATUS_COLORS = {
  PRESENT:        '#10B981',   // Emerald-500 — matches colors.success
  ABSENT:         '#EF4444',   // Red-500
  HALF_DAY:       '#F97316',   // Orange-500
  LATE:           '#EAB308',   // Amber-500
  MEDICAL_LEAVE:  '#8B5CF6',   // Purple-500
  APPROVED_LEAVE: '#3B82F6',   // Blue-500
  HOLIDAY:        '#C2410C',   // Orange-700 — distinct from HALF_DAY
  SUNDAY_HOLIDAY: '#94A3B8',   // Slate-400
  PUBLIC_HOLIDAY: '#C2410C',   // Orange-700 — distinct from ABSENT (#EF4444)
  SCHOOL_HOLIDAY: '#C2410C',   // Orange-700 — all holiday types same colour
};

// Statuses a teacher can mark (excludes holiday/sunday auto-types)
export const TEACHER_MARKABLE_STATUSES = [
  'PRESENT',
  'ABSENT',
  'HALF_DAY',
  'LATE',
  'MEDICAL_LEAVE',
  'APPROVED_LEAVE',
];

// Statuses that count as "present" for attendance percentage
export const PRESENT_EQUIVALENT_STATUSES = ['PRESENT', 'LATE', 'APPROVED_LEAVE'];

// Statuses that count as "absent" for attendance percentage
export const ABSENT_EQUIVALENT_STATUSES = ['ABSENT', 'MEDICAL_LEAVE'];

// Statuses that count as "leave"
export const LEAVE_STATUSES = ['MEDICAL_LEAVE', 'APPROVED_LEAVE'];

export const COLLECTIONS = {
  USERS: 'users',
  BRANCHES: 'branches',
  CLASSES: 'classes',
  SECTIONS: 'sections',
  TEACHER_ASSIGNMENTS: 'teacherAssignments',
  ATTENDANCE: 'attendance',
  FEES: 'fees',
  PAYMENTS: 'payments',
};

export const FEE_STATUS = {
  PAID: 'PAID',
  PARTIAL: 'PARTIAL',
  DUE: 'DUE',
  OVERDUE: 'OVERDUE',
};

export const USER_ROLE_ALIASES = {
  MAIN_ADMIN: ['MAIN_ADMIN', 'main_admin'],
  BRANCH_ADMIN: ['BRANCH_ADMIN', 'branch_admin'],
  PRINCIPAL: ['PRINCIPAL', 'principal'],
  COORDINATOR: ['COORDINATOR', 'coordinator'],
  TEACHER: ['TEACHER', 'teacher'],
  CLASS_TEACHER: ['CLASS_TEACHER', 'class_teacher'],
  PARENT: ['PARENT', 'parent'],
  ACCOUNTANT: ['ACCOUNTANT', 'accountant'],
};

// ─── Marks Management ────────────────────────────────────────────────────────

export const EXAM_TYPES = {
  UNIT_TEST: 'UNIT_TEST',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  HALF_YEARLY: 'HALF_YEARLY',
  PRE_FINAL: 'PRE_FINAL',
  ANNUAL: 'ANNUAL',
  CUSTOM: 'CUSTOM',
};

export const EXAM_TYPE_LABELS = {
  UNIT_TEST: 'Unit Test',
  MONTHLY: 'Monthly Test',
  QUARTERLY: 'Quarterly',
  HALF_YEARLY: 'Half Yearly',
  PRE_FINAL: 'Pre-Final',
  ANNUAL: 'Annual',
  CUSTOM: 'Custom',
};

export const EXAM_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
};

export const EXAM_STATUS_LABELS = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

export const TIMETABLE_STATUS = {
  DRAFT:     'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED:  'ARCHIVED',
};

export const TIMETABLE_TYPE = {
  REGULAR: 'REGULAR',
  EXAM:    'EXAM',
  SPECIAL: 'SPECIAL',
};

export const TIMETABLE_STATUS_LABELS = {
  [TIMETABLE_STATUS.DRAFT]:     'Draft',
  [TIMETABLE_STATUS.PUBLISHED]: 'Published',
  [TIMETABLE_STATUS.ARCHIVED]:  'Archived',
};

export const TIMETABLE_TYPE_LABELS = {
  [TIMETABLE_TYPE.REGULAR]: 'Regular',
  [TIMETABLE_TYPE.EXAM]:    'Exam',
  [TIMETABLE_TYPE.SPECIAL]: 'Special',
};

// Grade thresholds based on percentage. Evaluated top-to-bottom — first match wins.
export const GRADE_THRESHOLDS = [
  {min: 90, grade: 'A+', label: 'Outstanding'},
  {min: 80, grade: 'A', label: 'Excellent'},
  {min: 70, grade: 'B+', label: 'Very Good'},
  {min: 60, grade: 'B', label: 'Good'},
  {min: 50, grade: 'C', label: 'Average'},
  {min: 40, grade: 'D', label: 'Below Average'},
  {min: 0, grade: 'F', label: 'Fail'},
];
