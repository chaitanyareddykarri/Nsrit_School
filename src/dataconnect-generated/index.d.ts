import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AcademicClass_Key {
  id: UUIDString;
  __typename?: 'AcademicClass_Key';
}

export interface AcademicYearFeeTemplate_Key {
  id: UUIDString;
  __typename?: 'AcademicYearFeeTemplate_Key';
}

export interface AcademicYear_Key {
  id: UUIDString;
  __typename?: 'AcademicYear_Key';
}

export interface Accountant_Key {
  id: UUIDString;
  __typename?: 'Accountant_Key';
}

export interface ActivateAcademicYearData {
  deactivateOthers: number;
  academicYear_update?: AcademicYear_Key | null;
}

export interface ActivateAcademicYearVariables {
  id: UUIDString;
  branchId: UUIDString;
}

export interface ActivateClassData {
  academicClass_update?: AcademicClass_Key | null;
}

export interface ActivateClassVariables {
  classId: UUIDString;
}

export interface AddAdditionalRoleData {
  userRole_upsert: UserRole_Key;
}

export interface AddAdditionalRoleVariables {
  userId: UUIDString;
  role: string;
}

export interface AddExamSectionData {
  examSection_insert: ExamSection_Key;
}

export interface AddExamSectionVariables {
  examId: UUIDString;
  sectionId: UUIDString;
  academicClassId: UUIDString;
  branchId: UUIDString;
}

export interface AddParentRoleData {
  userRole_upsert: UserRole_Key;
  auditLog_insert: AuditLog_Key;
}

export interface AddParentRoleVariables {
  userId: UUIDString;
  branchId?: UUIDString | null;
}

export interface ApplyStudentPromotionData {
  studentAcademicHistory_upsert: StudentAcademicHistory_Key;
  student_update?: Student_Key | null;
}

export interface ApplyStudentPromotionVariables {
  studentId: UUIDString;
  toSectionId: UUIDString;
  toClassId: UUIDString;
  branchId: UUIDString;
  fromClassId: UUIDString;
  fromSectionId: UUIDString;
  academicYear: number;
  promotionStatus?: string;
}

export interface ArchiveExamData {
  exam_update?: Exam_Key | null;
}

export interface ArchiveExamVariables {
  id: UUIDString;
}

export interface AssignBranchAdminData {
  branch_update?: Branch_Key | null;
}

export interface AssignBranchAdminVariables {
  branchId: UUIDString;
  branchAdminId: UUIDString;
}

export interface AssignClassTeacherData {
  section_update?: Section_Key | null;
}

export interface AssignClassTeacherVariables {
  sectionId: UUIDString;
  teacherId: UUIDString;
}

export interface AssignPrincipalData {
  employeeSequence_upsert: EmployeeSequence_Key;
  staffIdSequence_upsert: StaffIdSequence_Key;
  user_update?: User_Key | null;
  branch_update?: Branch_Key | null;
  auditLog_insert: AuditLog_Key;
}

export interface AssignPrincipalVariables {
  branchId: UUIDString;
  principalId: UUIDString;
  employeeId: string;
  joiningYear: number;
  branchCode: string;
  serialNumber: number;
}

export interface AssignTeacherClassTeacherData {
  staleAssignment_clean: number;
  teacherSectionAssignment_insert: TeacherSectionAssignment_Key;
  section_update?: Section_Key | null;
  userRole_upsert: UserRole_Key;
  auditLog_insert: AuditLog_Key;
  roleAuditLog_insert: AuditLog_Key;
}

export interface AssignTeacherClassTeacherVariables {
  sectionId: UUIDString;
  teacherId: UUIDString;
  teacherUserId: UUIDString;
  branchId: UUIDString;
  sectionAuditId?: string | null;
  teacherAuditId?: string | null;
}

export interface AssignTeacherData {
  teacherAssignment_insert: TeacherAssignment_Key;
}

export interface AssignTeacherSubjectData {
  teacherSubject_insert: TeacherSubject_Key;
  userRole_upsert: UserRole_Key;
  auditLog_insert: AuditLog_Key;
}

export interface AssignTeacherSubjectVariables {
  teacherId: UUIDString;
  subjectId: UUIDString;
  branchId: UUIDString;
}

export interface AssignTeacherVariables {
  teacherId: UUIDString;
  branchId: UUIDString;
  academicClassId: UUIDString;
  sectionId: UUIDString;
  subjectName?: string | null;
  isClassTeacher: boolean;
}

export interface AttendanceAlertLog_Key {
  id: UUIDString;
  __typename?: 'AttendanceAlertLog_Key';
}

export interface AttendanceAuditLog_Key {
  id: UUIDString;
  __typename?: 'AttendanceAuditLog_Key';
}

export interface AttendanceSummary_Key {
  studentId: UUIDString;
  academicYearId: UUIDString;
  yearMonth: string;
  __typename?: 'AttendanceSummary_Key';
}

export interface Attendance_Key {
  id: UUIDString;
  __typename?: 'Attendance_Key';
}

export interface AuditLog_Key {
  id: UUIDString;
  __typename?: 'AuditLog_Key';
}

export interface Branch_Key {
  id: UUIDString;
  __typename?: 'Branch_Key';
}

export interface ChangeUserPrimaryRoleData {
  user_update?: User_Key | null;
  staleRoles_clean: number;
  userRole_upsert: UserRole_Key;
}

export interface ChangeUserPrimaryRoleVariables {
  userId: UUIDString;
  newRole: string;
}

export interface ClaimUserFirebaseUidData {
  user_update?: User_Key | null;
}

export interface ClaimUserFirebaseUidVariables {
  id: UUIDString;
}

export interface CleanUserRolesToPrimaryData {
  staleRoles_clean: number;
  userRole_upsert: UserRole_Key;
}

export interface CleanUserRolesToPrimaryVariables {
  userId: UUIDString;
}

export interface ClearFeePlanItemsData {
  studentFeeItem_deleteMany: number;
}

export interface ClearFeePlanItemsVariables {
  feePlanId: UUIDString;
  branchId: UUIDString;
}

export interface ClearTeacherSubjectsData {
  teacherSubject_deleteMany: number;
}

export interface ClearTeacherSubjectsVariables {
  teacherId: UUIDString;
  branchId: UUIDString;
}

export interface ClearTeacherWingRestrictionsData {
  teacher_updateMany: number;
}

export interface ClearTeacherWingRestrictionsVariables {
  branchId: UUIDString;
}

export interface ClearTimetableForSectionData {
  timetablePeriod_deleteMany: number;
}

export interface ClearTimetableForSectionVariables {
  sectionId: UUIDString;
  branchId: UUIDString;
}

export interface CloseAcademicYearData {
  academicYear_update?: AcademicYear_Key | null;
}

export interface CloseAcademicYearVariables {
  id: UUIDString;
}

export interface Coordinator_Key {
  id: UUIDString;
  __typename?: 'Coordinator_Key';
}

export interface CorrectAttendanceData {
  attendance_update?: Attendance_Key | null;
  attendanceAuditLog_insert: AttendanceAuditLog_Key;
  auditLog_insert: AuditLog_Key;
}

export interface CorrectAttendanceVariables {
  id: UUIDString;
  status: string;
  editedById: UUIDString;
  editedByRole: string;
  previousStatus: string;
  reason: string;
  remarks?: string | null;
  studentId: UUIDString;
  sectionId: UUIDString;
  attendanceDate: DateString;
  branchId: UUIDString;
  academicYearId?: UUIDString | null;
}

export interface CreateAcademicYearData {
  academicYear_insert: AcademicYear_Key;
}

export interface CreateAcademicYearVariables {
  branchId: UUIDString;
  name: string;
  startYear: number;
  startDate: DateString;
  endDate: DateString;
}

export interface CreateAccountantData {
  employeeSequence_upsert: EmployeeSequence_Key;
  staffIdSequence_upsert: StaffIdSequence_Key;
  user_insert: User_Key;
  userRole_upsert: UserRole_Key;
  accountant_insert: Accountant_Key;
  auditLog_insert: AuditLog_Key;
}

export interface CreateAccountantVariables {
  firebaseUID: string;
  fullName: string;
  countryCode: string;
  phoneNumber: string;
  email?: string | null;
  gender: string;
  joiningDate: DateString;
  designation: string;
  qualification?: string | null;
  experience?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  emergencyContact?: string | null;
  bloodGroup?: string | null;
  employeeId: string;
  staffType?: string;
  joiningYear: number;
  branchCode: string;
  serialNumber: number;
  branchId: UUIDString;
}

export interface CreateAttendanceAlertLogData {
  attendanceAlertLog_insert: AttendanceAlertLog_Key;
}

export interface CreateAttendanceAlertLogVariables {
  studentId: UUIDString;
  branchId: UUIDString;
  academicYearId: UUIDString;
  threshold: number;
  alertType: string;
  yearMonth?: string | null;
  currentPct: number;
  sentToRoles: string;
}

export interface CreateAttendanceData {
  attendance_insert: Attendance_Key;
  auditLog_insert: AuditLog_Key;
}

export interface CreateAttendanceVariables {
  studentId: UUIDString;
  academicClassId: UUIDString;
  sectionId: UUIDString;
  branchId?: UUIDString | null;
  attendanceDate: DateString;
  status: string;
  markedById: UUIDString;
  remarks?: string | null;
}

export interface CreateBranchData {
  branch_insert: Branch_Key;
}

export interface CreateBranchVariables {
  name: string;
  branchCode: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  status?: string | null;
}

export interface CreateClassData {
  academicClass_insert: AcademicClass_Key;
}

export interface CreateClassFeeData {
  academicYearFeeTemplate_insert: AcademicYearFeeTemplate_Key;
}

export interface CreateClassFeeVariables {
  branchId: UUIDString;
  academicClassId: UUIDString;
  academicYear: number;
  term1Fee: number;
  term2Fee: number;
  term3Fee: number;
  totalTuitionFee: number;
  applyToFuture: boolean;
  status: string;
  createdById: UUIDString;
}

export interface CreateClassVariables {
  branchId: UUIDString;
  wingId: UUIDString;
  name: string;
  displayOrder?: number | null;
}

export interface CreateCoordinatorData {
  employeeSequence_upsert: EmployeeSequence_Key;
  staffIdSequence_upsert: StaffIdSequence_Key;
  user_insert: User_Key;
  userRole_upsert: UserRole_Key;
  coordinator_insert: Coordinator_Key;
  auditLog_insert: AuditLog_Key;
}

export interface CreateCoordinatorVariables {
  firebaseUID: string;
  fullName: string;
  countryCode: string;
  phoneNumber: string;
  email?: string | null;
  gender?: string | null;
  employeeId: string;
  staffType?: string;
  joiningYear: number;
  branchCode: string;
  serialNumber: number;
  branchId: UUIDString;
  wing: string;
}

export interface CreateExamData {
  exam_insert: Exam_Key;
}

export interface CreateExamVariables {
  branchId: UUIDString;
  academicYearId: UUIDString;
  name: string;
  examType: string;
  startDate?: DateString | null;
  endDate?: DateString | null;
  remarks?: string | null;
  createdById: UUIDString;
}

export interface CreateFeeCategoryData {
  feeCategory_insert: FeeCategory_Key;
}

export interface CreateFeeCategoryVariables {
  name: string;
  status?: string;
}

export interface CreateFeePlanData {
  studentFeePlan_insert: StudentFeePlan_Key;
  feeAuditLog_insert: FeeAuditLog_Key;
}

export interface CreateFeePlanItemData {
  studentFeeItem_insert: StudentFeeItem_Key;
}

export interface CreateFeePlanItemVariables {
  feePlanId: UUIDString;
  categoryId: UUIDString;
  amount: number;
  branchId: UUIDString;
}

export interface CreateFeePlanVariables {
  studentId: UUIDString;
  academicYear: number;
  classFeeTemplateId?: UUIDString | null;
  term1Fee?: number;
  term2Fee?: number;
  term3Fee?: number;
  booksFee?: number;
  transportFee?: number;
  concessionType?: string | null;
  concessionValue?: number;
  concessionAmount?: number;
  grossAmount?: number;
  totalAmount: number;
  previousYearDue?: number;
  carryForwardAmount?: number;
  createdById: UUIDString;
  branchId: UUIDString;
  actorRole?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
}

export interface CreateHolidayData {
  holiday_insert: Holiday_Key;
  auditLog_insert: AuditLog_Key;
}

export interface CreateHolidayVariables {
  branchId: UUIDString;
  name: string;
  date: DateString;
  type: string;
  description?: string | null;
  createdById: UUIDString;
}

export interface CreateNoticeData {
  notice_insert: Notice_Key;
}

export interface CreateNoticeVariables {
  branchId: UUIDString;
  authorId: UUIDString;
  title: string;
  body: string;
  category: string;
  pinned: boolean;
  date: DateString;
}

export interface CreateNotificationData {
  notification_insert: Notification_Key;
}

export interface CreateNotificationVariables {
  userId: UUIDString;
  branchId: UUIDString;
  title: string;
  message: string;
  audienceRole?: string | null;
  createdById?: UUIDString | null;
  createdByRole?: string | null;
  category?: string | null;
  academicYear?: number | null;
}

export interface CreateParentData {
  userRole_upsert: UserRole_Key;
  parent_insert: Parent_Key;
  auditLog_insert: AuditLog_Key;
}

export interface CreateParentVariables {
  userId?: UUIDString | null;
  branchId: UUIDString;
  fullName: string;
  fatherName?: string | null;
  motherName?: string | null;
  countryCode: string;
  phoneNumber: string;
  address?: string | null;
}

export interface CreateParentWithoutUserData {
  user_insert: User_Key;
  userRole_upsert: UserRole_Key;
  parent_insert: Parent_Key;
  auditLog_insert: AuditLog_Key;
}

export interface CreateParentWithoutUserVariables {
  firebaseUID?: string | null;
  branchId: UUIDString;
  fullName: string;
  fatherName?: string | null;
  motherName?: string | null;
  countryCode: string;
  phoneNumber: string;
  address?: string | null;
}

export interface CreatePublicHolidayData {
  holiday_insert: Holiday_Key;
}

export interface CreatePublicHolidayVariables {
  branchId: UUIDString;
  name: string;
  date: DateString;
  type: string;
  description?: string | null;
  createdById: UUIDString;
  isPublicHoliday: boolean;
  isSeeded: boolean;
}

export interface CreateSectionData {
  section_insert: Section_Key;
}

export interface CreateSectionVariables {
  branchId: UUIDString;
  wingId: UUIDString;
  academicClassId: UUIDString;
  name: string;
  academicYear?: number;
}

export interface CreateStudentData {
  studentIdSequence_upsert: StudentIdSequence_Key;
  studentSequence_upsert: StudentSequence_Key;
  student_insert: Student_Key;
  auditLog_insert: AuditLog_Key;
}

export interface CreateStudentVariables {
  studentId: string;
  admissionYear: number;
  branchCode: string;
  serialNumber: number;
  fullName: string;
  gender?: string | null;
  dateOfBirth?: DateString | null;
  photoUrl?: string | null;
  aadhaarNumber?: string | null;
  apaarId?: string | null;
  bloodGroup?: string | null;
  branchId: UUIDString;
  wingId?: UUIDString | null;
  wingCode?: string | null;
  academicClassId: UUIDString;
  sectionId: UUIDString;
  parentId: UUIDString;
  countryCode?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  emergencyContact?: string | null;
  transportRequired?: boolean | null;
  admissionDate: DateString;
}

export interface CreateSubjectData {
  subject_insert: Subject_Key;
}

export interface CreateSubjectVariables {
  name: string;
  code: string;
  status?: string;
}

export interface CreateSuggestionData {
  suggestion_insert: Suggestion_Key;
}

export interface CreateSuggestionVariables {
  parentId: UUIDString;
  branchId: UUIDString;
  title: string;
  message: string;
  studentId?: UUIDString | null;
}

export interface CreateTeacherData {
  employeeSequence_upsert: EmployeeSequence_Key;
  staffIdSequence_upsert: StaffIdSequence_Key;
  user_insert: User_Key;
  userRole_upsert: UserRole_Key;
  teacher_insert: Teacher_Key;
  auditLog_insert: AuditLog_Key;
}

export interface CreateTeacherVariables {
  firebaseUID: string;
  fullName: string;
  countryCode: string;
  phoneNumber: string;
  alternateMobileNumber?: string | null;
  email?: string | null;
  dateOfBirth?: DateString | null;
  gender?: string;
  joiningDate?: DateString;
  designation?: string;
  qualification?: string | null;
  experience?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  emergencyContact?: string | null;
  bloodGroup?: string | null;
  employeeId: string;
  staffType: string;
  joiningYear: number;
  branchCode: string;
  serialNumber: number;
  branchId: UUIDString;
}

export interface CreateUserData {
  user_insert: User_Key;
  userRole_upsert: UserRole_Key;
}

export interface CreateUserVariables {
  firebaseUID: string;
  fullName: string;
  countryCode: string;
  phoneNumber: string;
  role: string;
  employeeId?: string | null;
  staffType?: string | null;
  branchId?: UUIDString | null;
  wingId?: UUIDString | null;
}

export interface CreateWingData {
  wing_insert: Wing_Key;
}

export interface CreateWingVariables {
  branchId: UUIDString;
  name: string;
  code: string;
}

export interface DeactivateClassData {
  academicClass_update?: AcademicClass_Key | null;
}

export interface DeactivateClassVariables {
  classId: UUIDString;
}

export interface DeleteExamData {
  exam_update?: Exam_Key | null;
}

export interface DeleteExamSubjectConfigData {
  examSubjectConfig_delete?: ExamSubjectConfig_Key | null;
}

export interface DeleteExamSubjectConfigVariables {
  examId: UUIDString;
  academicClassId: UUIDString;
  subjectName: string;
}

export interface DeleteExamVariables {
  id: UUIDString;
}

export interface DeleteHolidayData {
  holiday_delete?: Holiday_Key | null;
  auditLog_insert: AuditLog_Key;
}

export interface DeleteHolidayVariables {
  id: UUIDString;
  deletedById: UUIDString;
}

export interface DeleteNoticeData {
  notice_delete?: Notice_Key | null;
}

export interface DeleteNoticeVariables {
  id: UUIDString;
}

export interface DeleteNotificationData {
  notification_delete?: Notification_Key | null;
}

export interface DeleteNotificationVariables {
  id: UUIDString;
}

export interface DueTracking_Key {
  id: UUIDString;
  __typename?: 'DueTracking_Key';
}

export interface EmployeeSequence_Key {
  year: number;
  branchCode: string;
  staffType: string;
  __typename?: 'EmployeeSequence_Key';
}

export interface EnsureCoordinatorTeacherProfileData {
  teacher_insert: Teacher_Key;
  auditLog_insert: AuditLog_Key;
}

export interface EnsureCoordinatorTeacherProfileVariables {
  userId: UUIDString;
  branchId: UUIDString;
  employeeId: string;
  staffType?: string;
  joiningDate: DateString;
  designation?: string;
  gender?: string;
  email?: string | null;
}

export interface EnsureCurrentUserLegacyRoleData {
  userRole_upsert: UserRole_Key;
}

export interface ExamSection_Key {
  id: UUIDString;
  __typename?: 'ExamSection_Key';
}

export interface ExamSubjectConfig_Key {
  subjectName: string;
  examId: UUIDString;
  academicClassId: UUIDString;
  __typename?: 'ExamSubjectConfig_Key';
}

export interface Exam_Key {
  id: UUIDString;
  __typename?: 'Exam_Key';
}

export interface FeeAuditLog_Key {
  id: UUIDString;
  __typename?: 'FeeAuditLog_Key';
}

export interface FeeCategory_Key {
  id: UUIDString;
  __typename?: 'FeeCategory_Key';
}

export interface FeePayment_Key {
  id: UUIDString;
  __typename?: 'FeePayment_Key';
}

export interface FeeStructure_Key {
  id: UUIDString;
  __typename?: 'FeeStructure_Key';
}

export interface GenerateAdmissionNumberData {
  studentSequences: ({
    year: number;
    branchCode: string;
    lastSerial: number;
  } & StudentSequence_Key)[];
}

export interface GenerateAdmissionNumberVariables {
  year: number;
  branchCode: string;
}

export interface GetAcademicClassesData {
  academicClasses: ({
    id: UUIDString;
    branchId: UUIDString;
    name: string;
    classCode?: string | null;
    wingId: UUIDString;
    wing: {
      id: UUIDString;
      name: string;
      code: string;
    } & Wing_Key;
    sortOrder: number;
    displayOrder?: number | null;
    isActive: boolean;
    activatedById?: UUIDString | null;
    activatedAt?: TimestampString | null;
  } & AcademicClass_Key)[];
}

export interface GetAcademicClassesVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface GetAcademicYearsData {
  academicYears: ({
    id: UUIDString;
    branchId: UUIDString;
    name: string;
    startYear: number;
    startDate: DateString;
    endDate: DateString;
    status: string;
    isActive: boolean;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & AcademicYear_Key)[];
}

export interface GetAcademicYearsVariables {
  branchId: UUIDString;
  limit?: number | null;
}

export interface GetAccountantByUserData {
  accountants: ({
    id: UUIDString;
    userId: UUIDString;
    employeeId: string;
    staffType: string;
    branchId: UUIDString;
    branch: {
      id: UUIDString;
      branchCode: string;
      name: string;
    } & Branch_Key;
    joiningDate: DateString;
    designation: string;
    gender: string;
    isActive: boolean;
  } & Accountant_Key)[];
}

export interface GetAccountantByUserVariables {
  userId: UUIDString;
}

export interface GetAccountantProfileData {
  accountant?: {
    id: UUIDString;
    userId: UUIDString;
    employeeId: string;
    staffType: string;
    branchId: UUIDString;
    joiningDate: DateString;
    designation: string;
    gender: string;
    email?: string | null;
    qualification?: string | null;
    experience?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    emergencyContact?: string | null;
    bloodGroup?: string | null;
    isActive: boolean;
    user: {
      id: UUIDString;
      fullName: string;
      countryCode: string;
      phoneNumber: string;
      role: string;
      staffType?: string | null;
      isActive: boolean;
    } & User_Key;
    branch: {
      id: UUIDString;
      name: string;
      branchCode: string;
    } & Branch_Key;
  } & Accountant_Key;
}

export interface GetAccountantProfileVariables {
  accountantId: UUIDString;
}

export interface GetAccountantsData {
  accountants: ({
    id: UUIDString;
    userId: UUIDString;
    employeeId: string;
    staffType: string;
    branchId: UUIDString;
    joiningDate: DateString;
    designation: string;
    gender: string;
    email?: string | null;
    qualification?: string | null;
    experience?: string | null;
    isActive: boolean;
    user: {
      id: UUIDString;
      fullName: string;
      countryCode: string;
      phoneNumber: string;
      role: string;
      staffType?: string | null;
      isActive: boolean;
    } & User_Key;
    branch: {
      id: UUIDString;
      name: string;
      branchCode: string;
    } & Branch_Key;
  } & Accountant_Key)[];
}

export interface GetAccountantsVariables {
  branchId: UUIDString;
  limit?: number | null;
  offset?: number | null;
}

export interface GetActiveAcademicClassesData {
  academicClasses: ({
    id: UUIDString;
    branchId: UUIDString;
    name: string;
    classCode?: string | null;
    wingId: UUIDString;
    wing: {
      id: UUIDString;
      name: string;
      code: string;
    } & Wing_Key;
    sortOrder: number;
    displayOrder?: number | null;
    isActive: boolean;
  } & AcademicClass_Key)[];
}

export interface GetActiveAcademicClassesVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface GetActiveAcademicYearData {
  academicYears: ({
    id: UUIDString;
    branchId: UUIDString;
    name: string;
    startYear: number;
    startDate: DateString;
    endDate: DateString;
    status: string;
    isActive: boolean;
  } & AcademicYear_Key)[];
}

export interface GetActiveAcademicYearVariables {
  branchId: UUIDString;
}

export interface GetAllFeeRecordsData {
  studentFees: ({
    id: UUIDString;
    studentId: UUIDString;
    feeStructureId: UUIDString;
    totalFee: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    dueDate: DateString;
    student: {
      id: UUIDString;
      studentId: string;
      fullName: string;
      branchId: UUIDString;
      wingId?: UUIDString | null;
      academicClassId: UUIDString;
      sectionId: UUIDString;
      parentId: UUIDString;
      phoneNumber?: string | null;
    } & Student_Key;
  } & StudentFee_Key)[];
}

export interface GetAllFeeRecordsVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface GetAssignmentConflictsData {
  branchAdminBranches: ({
    id: UUIDString;
    name: string;
    branchCode: string;
  } & Branch_Key)[];
  principalBranches: ({
    id: UUIDString;
    name: string;
    branchCode: string;
  } & Branch_Key)[];
}

export interface GetAssignmentConflictsVariables {
  userId: UUIDString;
}

export interface GetAttendanceAlertLogData {
  attendanceAlertLogs: ({
    id: UUIDString;
    studentId: UUIDString;
    threshold: number;
    yearMonth?: string | null;
    currentPct: number;
    sentAt: TimestampString;
    recovered: boolean;
  } & AttendanceAlertLog_Key)[];
}

export interface GetAttendanceAlertLogVariables {
  studentId: UUIDString;
  threshold: number;
  yearMonth?: string | null;
}

export interface GetAttendanceAuditLogByBranchData {
  attendanceAuditLogs: ({
    id: UUIDString;
    attendanceId: UUIDString;
    studentId: UUIDString;
    sectionId: UUIDString;
    attendanceDate: DateString;
    editedById: UUIDString;
    editedByRole: string;
    previousStatus: string;
    newStatus: string;
    reason: string;
    editedAt: TimestampString;
    editedBy: {
      id: UUIDString;
      fullName: string;
      role: string;
    } & User_Key;
    student: {
      id: UUIDString;
      fullName: string;
      studentId: string;
    } & Student_Key;
    section: {
      id: UUIDString;
      name: string;
      academicClass: {
        id: UUIDString;
        name: string;
      } & AcademicClass_Key;
    } & Section_Key;
  } & AttendanceAuditLog_Key)[];
}

export interface GetAttendanceAuditLogByBranchVariables {
  branchId: UUIDString;
  fromDate: DateString;
  toDate: DateString;
  limit?: number | null;
  offset?: number | null;
}

export interface GetAttendanceAuditLogBySectionData {
  attendanceAuditLogs: ({
    id: UUIDString;
    attendanceId: UUIDString;
    studentId: UUIDString;
    attendanceDate: DateString;
    editedById: UUIDString;
    editedByRole: string;
    previousStatus: string;
    newStatus: string;
    reason: string;
    editedAt: TimestampString;
    editedBy: {
      id: UUIDString;
      fullName: string;
      role: string;
    } & User_Key;
    student: {
      id: UUIDString;
      fullName: string;
      studentId: string;
    } & Student_Key;
  } & AttendanceAuditLog_Key)[];
}

export interface GetAttendanceAuditLogBySectionVariables {
  sectionId: UUIDString;
  fromDate: DateString;
  toDate: DateString;
}

export interface GetAttendanceAuditLogData {
  attendanceAuditLogs: ({
    id: UUIDString;
    attendanceId: UUIDString;
    studentId: UUIDString;
    sectionId: UUIDString;
    branchId: UUIDString;
    attendanceDate: DateString;
    editedById: UUIDString;
    editedByRole: string;
    previousStatus: string;
    newStatus: string;
    reason: string;
    editedAt: TimestampString;
    editedBy: {
      id: UUIDString;
      fullName: string;
      role: string;
    } & User_Key;
  } & AttendanceAuditLog_Key)[];
}

export interface GetAttendanceAuditLogVariables {
  attendanceId: UUIDString;
}

export interface GetAttendanceByBranchData {
  attendances: ({
    id: UUIDString;
    studentId: UUIDString;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    attendanceDate: DateString;
    status: string;
    markedById: UUIDString;
    editedById?: UUIDString | null;
    remarks?: string | null;
    student: {
      id: UUIDString;
      studentId: string;
      fullName: string;
      parentId: UUIDString;
    } & Student_Key;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
      academicYear: number;
    } & Section_Key;
    markedBy: {
      id: UUIDString;
      fullName: string;
      role: string;
    } & User_Key;
  } & Attendance_Key)[];
}

export interface GetAttendanceByBranchVariables {
  branchId: UUIDString;
  fromDate?: DateString | null;
  toDate?: DateString | null;
  limit?: number | null;
  offset?: number | null;
}

export interface GetAttendanceByMonthData {
  attendances: ({
    id: UUIDString;
    studentId: UUIDString;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    attendanceDate: DateString;
    status: string;
    markedById: UUIDString;
    editedById?: UUIDString | null;
    remarks?: string | null;
    createdAt: TimestampString;
  } & Attendance_Key)[];
}

export interface GetAttendanceByMonthVariables {
  studentId: UUIDString;
  fromDate: DateString;
  toDate: DateString;
}

export interface GetAttendanceBySectionData {
  attendances: ({
    id: UUIDString;
    studentId: UUIDString;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    branchId?: UUIDString | null;
    attendanceDate: DateString;
    status: string;
    markedById: UUIDString;
    editedById?: UUIDString | null;
    remarks?: string | null;
    student: {
      id: UUIDString;
      fullName: string;
      studentId: string;
    } & Student_Key;
  } & Attendance_Key)[];
}

export interface GetAttendanceBySectionHistoryData {
  attendances: ({
    id: UUIDString;
    studentId: UUIDString;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    attendanceDate: DateString;
    status: string;
    isLocked: boolean;
    lockedAt?: TimestampString | null;
    markedById: UUIDString;
    editedById?: UUIDString | null;
    remarks?: string | null;
    student: {
      id: UUIDString;
      fullName: string;
      studentId: string;
    } & Student_Key;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
    } & Section_Key;
  } & Attendance_Key)[];
}

export interface GetAttendanceBySectionHistoryVariables {
  sectionId: UUIDString;
  fromDate?: DateString | null;
  toDate?: DateString | null;
  limit?: number | null;
  offset?: number | null;
}

export interface GetAttendanceBySectionVariables {
  sectionId: UUIDString;
  attendanceDate: DateString;
}

export interface GetAttendanceByWingData {
  attendances: ({
    id: UUIDString;
    studentId: UUIDString;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    attendanceDate: DateString;
    status: string;
    markedById: UUIDString;
    editedById?: UUIDString | null;
    remarks?: string | null;
    student: {
      id: UUIDString;
      studentId: string;
      fullName: string;
      parentId: UUIDString;
    } & Student_Key;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
      academicYear: number;
    } & Section_Key;
    markedBy: {
      id: UUIDString;
      fullName: string;
      role: string;
    } & User_Key;
  } & Attendance_Key)[];
}

export interface GetAttendanceByWingVariables {
  branchId: UUIDString;
  wingCode: string;
  fromDate?: DateString | null;
  toDate?: DateString | null;
  limit?: number | null;
  offset?: number | null;
}

export interface GetAttendanceLockStatusData {
  attendances: ({
    id: UUIDString;
    isLocked: boolean;
    lockedAt?: TimestampString | null;
  } & Attendance_Key)[];
}

export interface GetAttendanceLockStatusVariables {
  sectionId: UUIDString;
  attendanceDate: DateString;
}

export interface GetAttendanceSummaryBySectionData {
  attendanceSummaries: ({
    studentId: UUIDString;
    attendancePct: number;
    academicYearPct: number;
    presentCount: number;
    absentCount: number;
    halfDayCount: number;
    lateCount: number;
    medicalLeaveCount: number;
    approvedLeaveCount: number;
    effectiveDays: number;
    yearMonth: string;
    student: {
      id: UUIDString;
      fullName: string;
      studentId: string;
    } & Student_Key;
  })[];
}

export interface GetAttendanceSummaryBySectionVariables {
  sectionId: UUIDString;
  yearMonth: string;
}

export interface GetAttendanceSummaryByStudentData {
  attendanceSummaries: ({
    studentId: UUIDString;
    branchId: UUIDString;
    sectionId: UUIDString;
    academicYearId: UUIDString;
    yearMonth: string;
    totalWorkingDays: number;
    effectiveDays: number;
    presentCount: number;
    absentCount: number;
    halfDayCount: number;
    lateCount: number;
    medicalLeaveCount: number;
    approvedLeaveCount: number;
    holidayCount: number;
    sundayCount: number;
    attendancePct: number;
    academicYearPct: number;
    lastRecalcAt: TimestampString;
  } & AttendanceSummary_Key)[];
}

export interface GetAttendanceSummaryByStudentVariables {
  studentId: UUIDString;
  academicYearId: UUIDString;
}

export interface GetAuditLogsData {
  auditLogs: ({
    id: UUIDString;
    userId?: UUIDString | null;
    performedBy: string;
    performedRole: string;
    actingAs?: string | null;
    branchId?: UUIDString | null;
    action: string;
    entityType?: string | null;
    entityId?: string | null;
    oldRole?: string | null;
    newRole?: string | null;
    oldData?: string | null;
    newData?: string | null;
    createdAt: TimestampString;
  } & AuditLog_Key)[];
}

export interface GetAuditLogsVariables {
  branchId?: UUIDString | null;
  limit?: number | null;
  offset?: number | null;
}

export interface GetBranchAnalyticsData {
  students: ({
    id: UUIDString;
  } & Student_Key)[];
  attendances: ({
    id: UUIDString;
    status: string;
  } & Attendance_Key)[];
  studentFees: ({
    id: UUIDString;
    paidAmount: number;
    remainingAmount: number;
  } & StudentFee_Key)[];
}

export interface GetBranchAnalyticsVariables {
  branchId: UUIDString;
}

export interface GetBranchDetailsData {
  branch?: {
    id: UUIDString;
    name: string;
    branchCode: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    phone?: string | null;
    email?: string | null;
    status: string;
    branchAdminId?: UUIDString | null;
    principalId?: UUIDString | null;
    isActive: boolean;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    branchAdmin?: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
      role: string;
      isActive: boolean;
    } & User_Key;
    principal?: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
      role: string;
      isActive: boolean;
    } & User_Key;
  } & Branch_Key;
  academicClasses: ({
    id: UUIDString;
    branchId: UUIDString;
    wingId: UUIDString;
    name: string;
    displayOrder?: number | null;
    isActive: boolean;
  } & AcademicClass_Key)[];
  sections: ({
    id: UUIDString;
    branchId: UUIDString;
    wingId: UUIDString;
    academicClassId: UUIDString;
    name: string;
    isActive: boolean;
    academicClass: {
      id: UUIDString;
      name: string;
    } & AcademicClass_Key;
  } & Section_Key)[];
  students: ({
    id: UUIDString;
    studentId: string;
    fullName: string;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    isActive: boolean;
  } & Student_Key)[];
  users: ({
    id: UUIDString;
    fullName: string;
    phoneNumber: string;
    role: string;
    employeeId?: string | null;
    staffType?: string | null;
    branchId?: UUIDString | null;
    isActive: boolean;
  } & User_Key)[];
  branchTeachers: ({
    id: UUIDString;
  } & Teacher_Key)[];
  branchCoordinators: ({
    id: UUIDString;
  } & Coordinator_Key)[];
  branchAccountants: ({
    id: UUIDString;
  } & Accountant_Key)[];
  teacherAssignments: ({
    id: UUIDString;
    teacherId: UUIDString;
    sectionId: UUIDString;
    isClassTeacher: boolean;
    teacher: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
      role: string;
    } & User_Key;
  } & TeacherAssignment_Key)[];
  attendances: ({
    id: UUIDString;
    status: string;
    attendanceDate: DateString;
  } & Attendance_Key)[];
  studentFees: ({
    id: UUIDString;
    totalFee: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    dueDate: DateString;
  } & StudentFee_Key)[];
}

export interface GetBranchDetailsVariables {
  branchId: UUIDString;
}

export interface GetBranchPromotionHistoryData {
  studentPromotionHistories: ({
    id: UUIDString;
    promotionStatus: string;
    academicYear: number;
    promotedAt: TimestampString;
    remarks?: string | null;
    student: {
      id: UUIDString;
      fullName: string;
      studentId: string;
    } & Student_Key;
    fromClass: {
      id: UUIDString;
      name: string;
    } & AcademicClass_Key;
    toClass?: {
      id: UUIDString;
      name: string;
    } & AcademicClass_Key;
    fromSection: {
      id: UUIDString;
      name: string;
    } & Section_Key;
    toSection?: {
      id: UUIDString;
      name: string;
    } & Section_Key;
    promotedBy: {
      id: UUIDString;
      fullName: string;
    } & User_Key;
  } & StudentPromotionHistory_Key)[];
}

export interface GetBranchPromotionHistoryVariables {
  branchId: UUIDString;
  academicYear?: number | null;
  limit?: number | null;
}

export interface GetBranchStaffUserIdsData {
  users: ({
    id: UUIDString;
  } & User_Key)[];
}

export interface GetBranchStaffUserIdsVariables {
  branchId: UUIDString;
  limit?: number | null;
}

export interface GetBranchStudentsWithParentsData {
  students: ({
    id: UUIDString;
    linkedParents: ({
      userId: UUIDString;
    })[];
  } & Student_Key)[];
}

export interface GetBranchStudentsWithParentsVariables {
  branchId: UUIDString;
  limit?: number | null;
}

export interface GetBranchesData {
  branches: ({
    id: UUIDString;
    name: string;
    branchCode: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    phone?: string | null;
    email?: string | null;
    status: string;
    branchAdminId?: UUIDString | null;
    principalId?: UUIDString | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    branchAdmin?: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
      role: string;
      isActive: boolean;
      roles: ({
        role: string;
      })[];
    } & User_Key;
    principal?: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
      role: string;
      isActive: boolean;
    } & User_Key;
    isActive: boolean;
    branchTeachers: ({
      id: UUIDString;
    } & Teacher_Key)[];
    branchCoordinators: ({
      id: UUIDString;
    } & Coordinator_Key)[];
    branchAccountants: ({
      id: UUIDString;
    } & Accountant_Key)[];
  } & Branch_Key)[];
}

export interface GetBranchesVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface GetClassAnalyticsData {
  students: ({
    id: UUIDString;
  } & Student_Key)[];
  attendances: ({
    id: UUIDString;
    status: string;
  } & Attendance_Key)[];
  studentFees: ({
    id: UUIDString;
    paidAmount: number;
    remainingAmount: number;
  } & StudentFee_Key)[];
}

export interface GetClassAnalyticsVariables {
  academicClassId: UUIDString;
}

export interface GetClassCollectionSummaryData {
  students: ({
    id: UUIDString;
    studentId: string;
    fullName: string;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
    } & Section_Key;
    classCollectionFeePlans: ({
      id: UUIDString;
      academicYear: number;
      term1Fee: number;
      term2Fee: number;
      term3Fee: number;
      booksFee: number;
      transportFee: number;
      concessionType?: string | null;
      concessionValue: number;
      concessionAmount: number;
      grossAmount: number;
      totalAmount: number;
      isActive: boolean;
      classCollectionFeePayments: ({
        id: UUIDString;
        amount: number;
        paymentDate: DateString;
        paymentMode: string;
        receiptNumber: string;
        status: string;
      } & FeePayment_Key)[];
    } & StudentFeePlan_Key)[];
  } & Student_Key)[];
}

export interface GetClassCollectionSummaryVariables {
  branchId: UUIDString;
  academicClassId: UUIDString;
  sectionId?: UUIDString | null;
  academicYear: number;
  limit?: number | null;
  offset?: number | null;
}

export interface GetClassDetailsData {
  section?: {
    id: UUIDString;
    branchId: UUIDString;
    academicClassId: UUIDString;
    name: string;
    isActive: boolean;
    branch: {
      id: UUIDString;
      name: string;
      branchCode: string;
    } & Branch_Key;
    academicClass: {
      id: UUIDString;
      name: string;
      displayOrder?: number | null;
    } & AcademicClass_Key;
  } & Section_Key;
  students: ({
    id: UUIDString;
    studentId: string;
    fullName: string;
    gender?: string | null;
    phoneNumber?: string | null;
    rollNumber?: string | null;
    isActive: boolean;
  } & Student_Key)[];
  teacherAssignments: ({
    id: UUIDString;
    teacherId: UUIDString;
    subjectName?: string | null;
    isClassTeacher: boolean;
    teacher: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
      role: string;
    } & User_Key;
  } & TeacherAssignment_Key)[];
  attendances: ({
    id: UUIDString;
    studentId: UUIDString;
    attendanceDate: DateString;
    status: string;
    remarks?: string | null;
  } & Attendance_Key)[];
  studentFees: ({
    id: UUIDString;
    studentId: UUIDString;
    totalFee: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    dueDate: DateString;
  } & StudentFee_Key)[];
}

export interface GetClassDetailsVariables {
  sectionId: UUIDString;
}

export interface GetClassFeeReportData {
  students: ({
    id: UUIDString;
    studentId: string;
    fullName: string;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
    } & Section_Key;
    classReportFeePlans: ({
      id: UUIDString;
      academicYear: number;
      term1Fee: number;
      term2Fee: number;
      term3Fee: number;
      booksFee: number;
      transportFee: number;
      concessionType?: string | null;
      concessionValue: number;
      concessionAmount: number;
      grossAmount: number;
      totalAmount: number;
      isActive: boolean;
      classReportFeePayments: ({
        id: UUIDString;
        amount: number;
        paymentDate: DateString;
        paymentMode: string;
        receiptNumber: string;
        status: string;
      } & FeePayment_Key)[];
    } & StudentFeePlan_Key)[];
  } & Student_Key)[];
}

export interface GetClassFeeReportVariables {
  branchId: UUIDString;
  academicClassId: UUIDString;
  sectionId?: UUIDString | null;
  academicYear: number;
  limit?: number | null;
  offset?: number | null;
}

export interface GetClassFeesData {
  academicYearFeeTemplates: ({
    id: UUIDString;
    branchId: UUIDString;
    academicClassId: UUIDString;
    academicYear: number;
    term1Fee: number;
    term2Fee: number;
    term3Fee: number;
    totalTuitionFee: number;
    applyToFuture: boolean;
    status: string;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    academicClass: {
      id: UUIDString;
      name: string;
      classCode?: string | null;
      sortOrder: number;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    createdBy: {
      id: UUIDString;
      fullName: string;
    } & User_Key;
  } & AcademicYearFeeTemplate_Key)[];
}

export interface GetClassFeesVariables {
  branchId: UUIDString;
  academicYear?: number | null;
  limit?: number | null;
  offset?: number | null;
}

export interface GetClassOutstandingSummaryData {
  students: ({
    id: UUIDString;
    studentId: string;
    fullName: string;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
    } & Section_Key;
    classOutstandingFeePlans: ({
      id: UUIDString;
      academicYear: number;
      term1Fee: number;
      term2Fee: number;
      term3Fee: number;
      booksFee: number;
      transportFee: number;
      concessionType?: string | null;
      concessionValue: number;
      concessionAmount: number;
      grossAmount: number;
      totalAmount: number;
      isActive: boolean;
      classOutstandingFeePayments: ({
        id: UUIDString;
        amount: number;
        paymentDate: DateString;
        paymentMode: string;
        receiptNumber: string;
        status: string;
      } & FeePayment_Key)[];
    } & StudentFeePlan_Key)[];
  } & Student_Key)[];
}

export interface GetClassOutstandingSummaryVariables {
  branchId: UUIDString;
  academicClassId: UUIDString;
  sectionId?: UUIDString | null;
  academicYear: number;
  limit?: number | null;
  offset?: number | null;
}

export interface GetClassStudentsFeeStatusData {
  students: ({
    id: UUIDString;
    studentId: string;
    fullName: string;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
    } & Section_Key;
    classStatusFeePlans: ({
      id: UUIDString;
      academicYear: number;
      term1Fee: number;
      term2Fee: number;
      term3Fee: number;
      booksFee: number;
      transportFee: number;
      concessionType?: string | null;
      concessionValue: number;
      concessionAmount: number;
      grossAmount: number;
      totalAmount: number;
      isActive: boolean;
      classStatusFeePayments: ({
        id: UUIDString;
        amount: number;
        paymentDate: DateString;
        paymentMode: string;
        receiptNumber: string;
        status: string;
      } & FeePayment_Key)[];
    } & StudentFeePlan_Key)[];
  } & Student_Key)[];
}

export interface GetClassStudentsFeeStatusVariables {
  branchId: UUIDString;
  academicClassId: UUIDString;
  sectionId?: UUIDString | null;
  academicYear: number;
  limit?: number | null;
  offset?: number | null;
}

export interface GetClassTeacherAssignmentsData {
  sections: ({
    id: UUIDString;
    branchId: UUIDString;
    wingId: UUIDString;
    academicClassId: UUIDString;
    name: string;
    academicYear: number;
    classTeacherId?: UUIDString | null;
    isActive: boolean;
    academicClass: {
      id: UUIDString;
      name: string;
      sortOrder: number;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    classTeacher?: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
      employeeId?: string | null;
      staffType?: string | null;
      role: string;
      roles: ({
        role: string;
      })[];
      teacherProfile?: {
        id: UUIDString;
        userId: UUIDString;
        employeeId: string;
        staffType: string;
        branchId: UUIDString;
        isActive: boolean;
      } & Teacher_Key;
    } & User_Key;
  } & Section_Key)[];
  teacherSectionAssignments: ({
    id: UUIDString;
    teacherId: UUIDString;
    sectionId: UUIDString;
    isClassTeacher: boolean;
    isActive: boolean;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    assignedBy?: {
      id: UUIDString;
      fullName: string;
      role: string;
    } & User_Key;
    teacher: {
      id: UUIDString;
      employeeId: string;
      staffType: string;
      user: {
        id: UUIDString;
        fullName: string;
        phoneNumber: string;
        employeeId?: string | null;
        role: string;
        roles: ({
          role: string;
        })[];
        teacherProfile?: {
          id: UUIDString;
          userId: UUIDString;
          employeeId: string;
          staffType: string;
          branchId: UUIDString;
          isActive: boolean;
        } & Teacher_Key;
      } & User_Key;
    } & Teacher_Key;
    section: {
      id: UUIDString;
      branchId: UUIDString;
      wingId: UUIDString;
      name: string;
      academicYear: number;
      classTeacherId?: UUIDString | null;
      academicClass: {
        id: UUIDString;
        name: string;
        sortOrder: number;
        wing: {
          id: UUIDString;
          code: string;
          name: string;
        } & Wing_Key;
      } & AcademicClass_Key;
    } & Section_Key;
  } & TeacherSectionAssignment_Key)[];
  students: ({
    id: UUIDString;
    sectionId: UUIDString;
  } & Student_Key)[];
  coordinators: ({
    id: UUIDString;
    wing: string;
    user: {
      id: UUIDString;
      fullName: string;
      employeeId?: string | null;
      phoneNumber: string;
      role: string;
      staffType?: string | null;
      roles: ({
        role: string;
      })[];
      teacherProfile?: {
        id: UUIDString;
        userId: UUIDString;
        employeeId: string;
        staffType: string;
        branchId: UUIDString;
        joiningDate: DateString;
        designation: string;
        gender: string;
        email?: string | null;
        isActive: boolean;
      } & Teacher_Key;
    } & User_Key;
  } & Coordinator_Key)[];
}

export interface GetClassTeacherAssignmentsVariables {
  branchId: UUIDString;
  academicYear: number;
  limit?: number | null;
}

export interface GetClassesByWingCodeData {
  academicClasses: ({
    id: UUIDString;
    branchId: UUIDString;
    name: string;
    classCode?: string | null;
    wingId: UUIDString;
    wing: {
      id: UUIDString;
      name: string;
      code: string;
    } & Wing_Key;
    sortOrder: number;
    displayOrder?: number | null;
    isActive: boolean;
  } & AcademicClass_Key)[];
}

export interface GetClassesByWingCodeVariables {
  wingCode: string;
  limit?: number | null;
  offset?: number | null;
}

export interface GetClassesByWingData {
  academicClasses: ({
    id: UUIDString;
    branchId: UUIDString;
    wingId: UUIDString;
    name: string;
    displayOrder?: number | null;
    isActive: boolean;
  } & AcademicClass_Key)[];
}

export interface GetClassesByWingVariables {
  wingId: UUIDString;
}

export interface GetCoordinatorByUserData {
  coordinators: ({
    id: UUIDString;
    userId: UUIDString;
    branchId: UUIDString;
    wing: string;
    employeeId?: string | null;
    staffType?: string | null;
    gender?: string | null;
    email?: string | null;
    isActive: boolean;
  } & Coordinator_Key)[];
}

export interface GetCoordinatorByUserVariables {
  userId: UUIDString;
}

export interface GetCoordinatorDetailsData {
  coordinator?: {
    id: UUIDString;
    userId: UUIDString;
    branchId: UUIDString;
    wing: string;
    employeeId?: string | null;
    staffType?: string | null;
    gender?: string | null;
    email?: string | null;
    isActive: boolean;
    user: {
      id: UUIDString;
      fullName: string;
      countryCode: string;
      phoneNumber: string;
      role: string;
      staffType?: string | null;
      branchId?: UUIDString | null;
      isActive: boolean;
      roles: ({
        role: string;
      })[];
      teacherProfile?: {
        id: UUIDString;
        userId: UUIDString;
        employeeId: string;
        staffType: string;
        branchId: UUIDString;
        joiningDate: DateString;
        designation: string;
        gender: string;
        email?: string | null;
        isActive: boolean;
      } & Teacher_Key;
    } & User_Key;
  } & Coordinator_Key;
}

export interface GetCoordinatorDetailsVariables {
  coordinatorId: UUIDString;
}

export interface GetCoordinatorStudentsByWingData {
  students: ({
    id: UUIDString;
    studentId: string;
    fullName: string;
    gender?: string | null;
    branchId: UUIDString;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    parentId: UUIDString;
    phoneNumber?: string | null;
    status: string;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        code: string;
        name: string;
      };
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
      academicYear: number;
    } & Section_Key;
    parent: {
      id: UUIDString;
      fatherName?: string | null;
      motherName?: string | null;
      phoneNumber: string;
    } & Parent_Key;
  } & Student_Key)[];
}

export interface GetCoordinatorStudentsByWingVariables {
  branchId: UUIDString;
  wing: string;
  limit?: number | null;
  offset?: number | null;
}

export interface GetCoordinatorTeachersByWingData {
  teachers: ({
    id: UUIDString;
    userId: UUIDString;
    employeeId: string;
    staffType: string;
    branchId: UUIDString;
    joiningDate: DateString;
    designation: string;
    gender: string;
    email?: string | null;
    qualification?: string | null;
    experience?: string | null;
    isActive: boolean;
    user: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
      countryCode: string;
      role: string;
      staffType?: string | null;
      isActive: boolean;
      roles: ({
        role: string;
      })[];
    } & User_Key;
    teacherSubjects_on_teacher: ({
      id: UUIDString;
      subject: {
        id: UUIDString;
        name: string;
        code: string;
        status: string;
      } & Subject_Key;
    } & TeacherSubject_Key)[];
  } & Teacher_Key)[];
}

export interface GetCoordinatorTeachersByWingVariables {
  branchId: UUIDString;
  wing: string;
  limit?: number | null;
  offset?: number | null;
}

export interface GetCoordinatorsData {
  coordinators: ({
    id: UUIDString;
    userId: UUIDString;
    branchId: UUIDString;
    wing: string;
    employeeId?: string | null;
    staffType?: string | null;
    gender?: string | null;
    email?: string | null;
    isActive: boolean;
    user: {
      id: UUIDString;
      fullName: string;
      countryCode: string;
      phoneNumber: string;
      role: string;
      staffType?: string | null;
      branchId?: UUIDString | null;
      isActive: boolean;
      roles: ({
        role: string;
      })[];
      teacherProfile?: {
        id: UUIDString;
        userId: UUIDString;
        employeeId: string;
        staffType: string;
        branchId: UUIDString;
        joiningDate: DateString;
        designation: string;
        gender: string;
        email?: string | null;
        isActive: boolean;
      } & Teacher_Key;
    } & User_Key;
  } & Coordinator_Key)[];
}

export interface GetCoordinatorsVariables {
  branchId: UUIDString;
}

export interface GetCurrentUserData {
  users: ({
    id: UUIDString;
    firebaseUID: string;
    fullName: string;
    countryCode: string;
    phoneNumber: string;
    status: string;
    role: string;
    employeeId?: string | null;
    staffType?: string | null;
    branchId?: UUIDString | null;
    wingId?: UUIDString | null;
    branch?: {
      id: UUIDString;
      branchCode: string;
      name: string;
    } & Branch_Key;
    branchAdminBranches: ({
      id: UUIDString;
      branchCode: string;
      name: string;
    } & Branch_Key)[];
    principalBranches: ({
      id: UUIDString;
      branchCode: string;
      name: string;
    } & Branch_Key)[];
    coordinatorProfiles: ({
      id: UUIDString;
      branchId: UUIDString;
      wing: string;
    } & Coordinator_Key)[];
    teacherProfile?: {
      id: UUIDString;
      branchId: UUIDString;
    } & Teacher_Key;
    accountantProfile?: {
      id: UUIDString;
      branchId: UUIDString;
    } & Accountant_Key;
    roles: ({
      id: UUIDString;
      role: string;
      createdAt: TimestampString;
    })[];
    isActive: boolean;
  } & User_Key)[];
}

export interface GetCurrentUserVariables {
  firebaseUID: string;
}

export interface GetDailyAttendanceReportData {
  attendances: ({
    id: UUIDString;
    studentId: UUIDString;
    sectionId: UUIDString;
    attendanceDate: DateString;
    status: string;
    markedById: UUIDString;
    editedById?: UUIDString | null;
    student: {
      id: UUIDString;
      fullName: string;
      studentId: string;
    } & Student_Key;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
    } & Section_Key;
  } & Attendance_Key)[];
}

export interface GetDailyAttendanceReportVariables {
  branchId: UUIDString;
  attendanceDate: DateString;
}

export interface GetDashboardStatisticsData {
  branches: ({
    id: UUIDString;
    isActive: boolean;
    status: string;
  } & Branch_Key)[];
  academicClasses: ({
    id: UUIDString;
    branchId: UUIDString;
    isActive: boolean;
  } & AcademicClass_Key)[];
  users: ({
    id: UUIDString;
    branchId?: UUIDString | null;
    role: string;
  } & User_Key)[];
  teachers: ({
    id: UUIDString;
    branchId: UUIDString;
  } & Teacher_Key)[];
  students: ({
    id: UUIDString;
    branchId: UUIDString;
  } & Student_Key)[];
  attendances: ({
    id: UUIDString;
    status: string;
    attendanceDate: DateString;
  } & Attendance_Key)[];
  studentFees: ({
    id: UUIDString;
    paidAmount: number;
    remainingAmount: number;
    totalFee: number;
  } & StudentFee_Key)[];
  studentFeePlans: ({
    id: UUIDString;
    studentId: UUIDString;
    totalAmount: number;
    concessionAmount: number;
    dashboardPayments: ({
      id: UUIDString;
      amount: number;
      status: string;
    } & FeePayment_Key)[];
  } & StudentFeePlan_Key)[];
}

export interface GetDueStudentsData {
  studentFees: ({
    id: UUIDString;
    studentId: UUIDString;
    totalFee: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    dueDate: DateString;
    student: {
      id: UUIDString;
      studentId: string;
      fullName: string;
      branchId: UUIDString;
      wingId?: UUIDString | null;
      sectionId: UUIDString;
    } & Student_Key;
  } & StudentFee_Key)[];
}

export interface GetDueStudentsVariables {
  branchId: UUIDString;
}

export interface GetEmployeeSequenceData {
  employeeSequences: ({
    year: number;
    branchCode: string;
    staffType: string;
    lastSequence: number;
  } & EmployeeSequence_Key)[];
}

export interface GetEmployeeSequenceVariables {
  year: number;
  branchCode: string;
  staffType: string;
}

export interface GetExamAnalyticsData {
  studentMarks: ({
    studentId: UUIDString;
    subjectName: string;
    marksObtained?: number | null;
    isAbsent: boolean;
  })[];
  examSubjectConfigs: ({
    subjectName: string;
    maxMarks: number;
    passingMarks: number;
    examDate?: DateString | null;
  })[];
  students: ({
    id: UUIDString;
    fullName: string;
    studentId: string;
    rollNumber?: string | null;
  } & Student_Key)[];
}

export interface GetExamAnalyticsVariables {
  examId: UUIDString;
  sectionId: UUIDString;
}

export interface GetExamDetailsData {
  exams: ({
    id: UUIDString;
    name: string;
    examType: string;
    status: string;
    startDate?: DateString | null;
    endDate?: DateString | null;
    remarks?: string | null;
    branchId: UUIDString;
    academicYearId: UUIDString;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    createdBy: {
      id: UUIDString;
      fullName: string;
    } & User_Key;
    academicYear: {
      id: UUIDString;
      name: string;
      startYear: number;
    } & AcademicYear_Key;
    examSections_on_exam: ({
      id: UUIDString;
      sectionId: UUIDString;
      academicClassId: UUIDString;
      isPublished: boolean;
      publishedAt?: TimestampString | null;
      publishedBy?: {
        id: UUIDString;
        fullName: string;
      } & User_Key;
      section: {
        id: UUIDString;
        name: string;
        academicClass: {
          id: UUIDString;
          name: string;
        } & AcademicClass_Key;
      } & Section_Key;
    } & ExamSection_Key)[];
    examSubjectConfigs_on_exam: ({
      subjectName: string;
      maxMarks: number;
      passingMarks: number;
      examDate?: DateString | null;
      academicClassId: UUIDString;
    })[];
  } & Exam_Key)[];
}

export interface GetExamDetailsVariables {
  examId: UUIDString;
}

export interface GetExamsByBranchData {
  exams: ({
    id: UUIDString;
    name: string;
    examType: string;
    status: string;
    startDate?: DateString | null;
    endDate?: DateString | null;
    remarks?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    academicYear: {
      id: UUIDString;
      name: string;
      startYear: number;
    } & AcademicYear_Key;
    examSections_on_exam: ({
      id: UUIDString;
      sectionId: UUIDString;
      isPublished: boolean;
      section: {
        id: UUIDString;
        name: string;
        academicClass: {
          id: UUIDString;
          name: string;
        } & AcademicClass_Key;
      } & Section_Key;
    } & ExamSection_Key)[];
  } & Exam_Key)[];
}

export interface GetExamsByBranchVariables {
  branchId: UUIDString;
  academicYearId: UUIDString;
  limit: number;
  offset: number;
}

export interface GetExamsBySectionData {
  examSections: ({
    id: UUIDString;
    isPublished: boolean;
    publishedAt?: TimestampString | null;
    exam: {
      id: UUIDString;
      name: string;
      examType: string;
      status: string;
      startDate?: DateString | null;
      endDate?: DateString | null;
      remarks?: string | null;
      examSubjectConfigs_on_exam: ({
        subjectName: string;
        maxMarks: number;
        passingMarks: number;
        examDate?: DateString | null;
        academicClassId: UUIDString;
      })[];
    } & Exam_Key;
  } & ExamSection_Key)[];
}

export interface GetExamsBySectionVariables {
  sectionId: UUIDString;
  academicYearId: UUIDString;
}

export interface GetFeeCategoriesData {
  feeCategories: ({
    id: UUIDString;
    name: string;
    status: string;
    createdAt: TimestampString;
  } & FeeCategory_Key)[];
}

export interface GetFeeCategoriesVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface GetFeeDetailsData {
  studentFees: ({
    id: UUIDString;
    studentId: UUIDString;
    feeStructureId: UUIDString;
    totalFee: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    dueDate: DateString;
    updatedAt: TimestampString;
  } & StudentFee_Key)[];
  payments: ({
    id: UUIDString;
    studentId: UUIDString;
    studentFeeId: UUIDString;
    amount: number;
    paymentMode: string;
    receiptNumber?: string | null;
    uploadedById: UUIDString;
    remarks?: string | null;
    paidAt: TimestampString;
  } & Payment_Key)[];
}

export interface GetFeeDetailsVariables {
  studentId: UUIDString;
}

export interface GetFeeRecordsByBranchData {
  studentFees: ({
    id: UUIDString;
    studentId: UUIDString;
    feeStructureId: UUIDString;
    totalFee: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    dueDate: DateString;
    student: {
      id: UUIDString;
      studentId: string;
      fullName: string;
      branchId: UUIDString;
      wingId?: UUIDString | null;
      academicClassId: UUIDString;
      sectionId: UUIDString;
      parentId: UUIDString;
      phoneNumber?: string | null;
    } & Student_Key;
  } & StudentFee_Key)[];
}

export interface GetFeeRecordsByBranchVariables {
  branchId: UUIDString;
}

export interface GetFeeReportsData {
  students: ({
    id: UUIDString;
    studentId: string;
    fullName: string;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
    } & Section_Key;
    branchId: UUIDString;
    reportLinkedParents: ({
      userId: UUIDString;
    })[];
    reportFeePlans: ({
      id: UUIDString;
      academicYear: number;
      classFeeTemplateId?: UUIDString | null;
      term1Fee: number;
      term2Fee: number;
      term3Fee: number;
      booksFee: number;
      transportFee: number;
      concessionType?: string | null;
      concessionValue: number;
      concessionAmount: number;
      grossAmount: number;
      totalAmount: number;
      previousYearDue: number;
      carryForwardAmount: number;
      isActive: boolean;
      reportFeePayments: ({
        id: UUIDString;
        amount: number;
        academicYear?: number | null;
        paymentDate: DateString;
        paymentMode: string;
        receiptNumber: string;
        status: string;
      } & FeePayment_Key)[];
      reportFeeItems: ({
        id: UUIDString;
        amount: number;
        category: {
          id: UUIDString;
          name: string;
        } & FeeCategory_Key;
      } & StudentFeeItem_Key)[];
    } & StudentFeePlan_Key)[];
  } & Student_Key)[];
}

export interface GetFeeReportsVariables {
  branchId: UUIDString;
  limit?: number | null;
  offset?: number | null;
}

export interface GetGlobalClassesData {
  sections: ({
    id: UUIDString;
    branchId: UUIDString;
    academicClassId: UUIDString;
    name: string;
    isActive: boolean;
    branch: {
      id: UUIDString;
      name: string;
      branchCode: string;
      status: string;
      isActive: boolean;
    } & Branch_Key;
    academicClass: {
      id: UUIDString;
      name: string;
      displayOrder?: number | null;
    } & AcademicClass_Key;
  } & Section_Key)[];
  students: ({
    id: UUIDString;
    branchId: UUIDString;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    isActive: boolean;
  } & Student_Key)[];
  teacherAssignments: ({
    id: UUIDString;
    teacherId: UUIDString;
    sectionId: UUIDString;
    isClassTeacher: boolean;
    teacher: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
      role: string;
    } & User_Key;
  } & TeacherAssignment_Key)[];
  attendances: ({
    id: UUIDString;
    sectionId: UUIDString;
    status: string;
  } & Attendance_Key)[];
  studentFees: ({
    id: UUIDString;
    paidAmount: number;
    remainingAmount: number;
    student: {
      id: UUIDString;
      sectionId: UUIDString;
    } & Student_Key;
  } & StudentFee_Key)[];
}

export interface GetGlobalClassesVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface GetGlobalReportsData {
  branches: ({
    id: UUIDString;
    name: string;
    branchCode: string;
    status: string;
    isActive: boolean;
  } & Branch_Key)[];
  users: ({
    id: UUIDString;
    branchId?: UUIDString | null;
    role: string;
    isActive: boolean;
  } & User_Key)[];
  coordinators: ({
    id: UUIDString;
    branchId: UUIDString;
  } & Coordinator_Key)[];
  accountants: ({
    id: UUIDString;
    branchId: UUIDString;
  } & Accountant_Key)[];
  students: ({
    id: UUIDString;
    branchId: UUIDString;
    status: string;
    isActive: boolean;
    admissionDate: DateString;
  } & Student_Key)[];
  attendances: ({
    id: UUIDString;
    sectionId: UUIDString;
    status: string;
    attendanceDate: DateString;
    section: {
      id: UUIDString;
      branchId: UUIDString;
    } & Section_Key;
  } & Attendance_Key)[];
  studentFeePlans: ({
    id: UUIDString;
    studentId: UUIDString;
    grossAmount: number;
    concessionAmount: number;
    totalAmount: number;
    isActive: boolean;
    student: {
      id: UUIDString;
      branchId: UUIDString;
    } & Student_Key;
    reportPayments: ({
      id: UUIDString;
      amount: number;
      status: string;
      paymentDate: DateString;
    } & FeePayment_Key)[];
  } & StudentFeePlan_Key)[];
}

export interface GetGlobalStudentExplorerData {
  students: ({
    id: UUIDString;
    studentId: string;
    fullName: string;
    gender?: string | null;
    branchId: UUIDString;
    wingId?: UUIDString | null;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    parentId: UUIDString;
    phoneNumber?: string | null;
    admissionDate: DateString;
    status: string;
    isActive: boolean;
    branch: {
      id: UUIDString;
      name: string;
      branchCode: string;
    } & Branch_Key;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
    } & Section_Key;
    parent: {
      id: UUIDString;
      fullName: string;
      fatherName?: string | null;
      motherName?: string | null;
      phoneNumber: string;
      email?: string | null;
    } & Parent_Key;
    explorerAttendance: ({
      id: UUIDString;
      status: string;
    } & Attendance_Key)[];
    explorerFeePlans: ({
      id: UUIDString;
      totalAmount: number;
      explorerFeePayments: ({
        id: UUIDString;
        amount: number;
        status: string;
      } & FeePayment_Key)[];
    } & StudentFeePlan_Key)[];
  } & Student_Key)[];
}

export interface GetGlobalStudentExplorerVariables {
  branchId?: UUIDString | null;
  academicClassId?: UUIDString | null;
  sectionId?: UUIDString | null;
  status?: string | null;
  searchText?: string;
  limit?: number | null;
  offset?: number | null;
}

export interface GetGlobalStudentsData {
  students: ({
    id: UUIDString;
    studentId: string;
    fullName: string;
    gender?: string | null;
    dateOfBirth?: DateString | null;
    bloodGroup?: string | null;
    rollNumber?: string | null;
    branchId: UUIDString;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    parentId: UUIDString;
    phoneNumber?: string | null;
    admissionDate: DateString;
    isActive: boolean;
    branch: {
      id: UUIDString;
      name: string;
      branchCode: string;
    } & Branch_Key;
    academicClass: {
      id: UUIDString;
      name: string;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
    } & Section_Key;
    parent: {
      id: UUIDString;
      fullName: string;
      fatherName?: string | null;
      motherName?: string | null;
      phoneNumber: string;
      email?: string | null;
    } & Parent_Key;
  } & Student_Key)[];
  attendances: ({
    id: UUIDString;
    studentId: UUIDString;
    status: string;
  } & Attendance_Key)[];
  studentFees: ({
    id: UUIDString;
    studentId: UUIDString;
    paidAmount: number;
    remainingAmount: number;
    status: string;
  } & StudentFee_Key)[];
}

export interface GetGlobalStudentsVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface GetHolidaysByBranchData {
  holidays: ({
    id: UUIDString;
    name: string;
    date: DateString;
    type: string;
    description?: string | null;
    isPublicHoliday: boolean;
    isSeeded: boolean;
    createdById: UUIDString;
    createdAt: TimestampString;
  } & Holiday_Key)[];
}

export interface GetHolidaysByBranchVariables {
  branchId: UUIDString;
  fromDate: DateString;
  toDate: DateString;
}

export interface GetHolidaysByMonthData {
  holidays: ({
    id: UUIDString;
    name: string;
    date: DateString;
    type: string;
    description?: string | null;
    isPublicHoliday: boolean;
  } & Holiday_Key)[];
}

export interface GetHolidaysByMonthVariables {
  branchId: UUIDString;
  fromDate: DateString;
  toDate: DateString;
}

export interface GetLastStudentSerialData {
  students: ({
    id: UUIDString;
    studentId: string;
    serialNumber: number;
  } & Student_Key)[];
}

export interface GetLastStudentSerialVariables {
  admissionYear: number;
  branchCode: string;
}

export interface GetLowAttendanceStudentsData {
  attendanceSummaries: ({
    studentId: UUIDString;
    sectionId: UUIDString;
    yearMonth: string;
    attendancePct: number;
    academicYearPct: number;
    presentCount: number;
    absentCount: number;
    effectiveDays: number;
    student: {
      id: UUIDString;
      fullName: string;
      studentId: string;
      academicClass: {
        id: UUIDString;
        name: string;
      } & AcademicClass_Key;
      section: {
        id: UUIDString;
        name: string;
      } & Section_Key;
    } & Student_Key;
  })[];
}

export interface GetLowAttendanceStudentsVariables {
  branchId: UUIDString;
  academicYearId: UUIDString;
  thresholdPct: number;
  yearMonth?: string | null;
}

export interface GetMarksForSectionData {
  students: ({
    id: UUIDString;
    studentId: string;
    fullName: string;
    rollNumber?: string | null;
    examMarks: ({
      subjectName: string;
      marksObtained?: number | null;
      isAbsent: boolean;
      updatedAt: TimestampString;
    })[];
  } & Student_Key)[];
  examSubjectConfigs: ({
    subjectName: string;
    maxMarks: number;
    passingMarks: number;
    examDate?: DateString | null;
    academicClassId: UUIDString;
  })[];
  examSections: ({
    id: UUIDString;
    isPublished: boolean;
    publishedAt?: TimestampString | null;
  } & ExamSection_Key)[];
}

export interface GetMarksForSectionVariables {
  examId: UUIDString;
  sectionId: UUIDString;
}

export interface GetMonthlyAttendanceReportData {
  attendances: ({
    id: UUIDString;
    studentId: UUIDString;
    sectionId: UUIDString;
    attendanceDate: DateString;
    status: string;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
    } & Section_Key;
    student: {
      id: UUIDString;
      fullName: string;
      studentId: string;
    } & Student_Key;
  } & Attendance_Key)[];
}

export interface GetMonthlyAttendanceReportVariables {
  branchId: UUIDString;
  fromDate: DateString;
  toDate: DateString;
  limit?: number | null;
  offset?: number | null;
}

export interface GetNoticesByBranchCategoryData {
  notices: ({
    id: UUIDString;
    branchId: UUIDString;
    authorId?: UUIDString | null;
    title: string;
    body: string;
    category: string;
    pinned: boolean;
    date: DateString;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    author?: {
      id: UUIDString;
      fullName: string;
    } & User_Key;
  } & Notice_Key)[];
}

export interface GetNoticesByBranchCategoryVariables {
  branchId: UUIDString;
  category: string;
  limit?: number | null;
  offset?: number | null;
}

export interface GetNoticesByBranchData {
  notices: ({
    id: UUIDString;
    branchId: UUIDString;
    authorId?: UUIDString | null;
    title: string;
    body: string;
    category: string;
    pinned: boolean;
    date: DateString;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    author?: {
      id: UUIDString;
      fullName: string;
    } & User_Key;
  } & Notice_Key)[];
}

export interface GetNoticesByBranchVariables {
  branchId: UUIDString;
  limit?: number | null;
  offset?: number | null;
}

export interface GetNotificationsByUserData {
  notifications: ({
    id: UUIDString;
    title: string;
    message: string;
    audienceRole?: string | null;
    category?: string | null;
    academicYear?: number | null;
    createdById?: UUIDString | null;
    createdByRole?: string | null;
    isRead: boolean;
    createdAt: TimestampString;
    branch?: {
      id: UUIDString;
      name: string;
    } & Branch_Key;
  } & Notification_Key)[];
}

export interface GetNotificationsByUserVariables {
  userId: UUIDString;
  limit?: number | null;
  offset?: number | null;
}

export interface GetPaidStudentsData {
  studentFees: ({
    id: UUIDString;
    studentId: UUIDString;
    totalFee: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    dueDate: DateString;
    student: {
      id: UUIDString;
      studentId: string;
      fullName: string;
      branchId: UUIDString;
      wingId?: UUIDString | null;
      sectionId: UUIDString;
    } & Student_Key;
  } & StudentFee_Key)[];
}

export interface GetPaidStudentsVariables {
  branchId: UUIDString;
}

export interface GetParentByPhoneData {
  parents: ({
    id: UUIDString;
    userId?: UUIDString | null;
    branchId: UUIDString;
    fullName: string;
    fatherName?: string | null;
    motherName?: string | null;
    countryCode: string;
    phoneNumber: string;
    address?: string | null;
    isActive: boolean;
  } & Parent_Key)[];
}

export interface GetParentByPhoneVariables {
  branchId: UUIDString;
  phoneNumber: string;
}

export interface GetParentByUserData {
  parents: ({
    id: UUIDString;
    userId?: UUIDString | null;
    branchId: UUIDString;
    fullName: string;
    fatherName?: string | null;
    motherName?: string | null;
    countryCode: string;
    phoneNumber: string;
    address?: string | null;
    isActive: boolean;
  } & Parent_Key)[];
}

export interface GetParentByUserVariables {
  userId: UUIDString;
}

export interface GetParentChildrenByUserData {
  studentParents: ({
    id: UUIDString;
    relationship: string;
    student: {
      id: UUIDString;
      studentId: string;
      fullName: string;
      gender?: string | null;
      dateOfBirth?: DateString | null;
      branchId: UUIDString;
      academicClassId: UUIDString;
      sectionId: UUIDString;
      parentId: UUIDString;
      phoneNumber?: string | null;
      admissionYear: number;
      branchCode: string;
      admissionDate: DateString;
      status: string;
      academicClass: {
        id: UUIDString;
        name: string;
        wing: {
          id: UUIDString;
          code: string;
          name: string;
        } & Wing_Key;
      } & AcademicClass_Key;
      section: {
        id: UUIDString;
        name: string;
        academicYear: number;
        classTeacher?: {
          id: UUIDString;
          fullName: string;
          phoneNumber: string;
        } & User_Key;
      } & Section_Key;
      parent: {
        id: UUIDString;
        fullName: string;
        fatherName?: string | null;
        motherName?: string | null;
        countryCode: string;
        phoneNumber: string;
        address?: string | null;
      } & Parent_Key;
      linkedParents: ({
        id: UUIDString;
        relationship: string;
        user: {
          id: UUIDString;
          fullName: string;
          phoneNumber: string;
          role: string;
          roles: ({
            role: string;
          })[];
        } & User_Key;
      })[];
      linkedRecentAttendance: ({
        id: UUIDString;
        attendanceDate: DateString;
        status: string;
        remarks?: string | null;
      } & Attendance_Key)[];
      linkedAttendance: ({
        id: UUIDString;
        attendanceDate: DateString;
        status: string;
      } & Attendance_Key)[];
      linkedFees: ({
        id: UUIDString;
        totalFee: number;
        paidAmount: number;
        remainingAmount: number;
        status: string;
        dueDate: DateString;
      } & StudentFee_Key)[];
      linkedParentFeePlans: ({
        id: UUIDString;
        academicYear: number;
        classFeeTemplateId?: UUIDString | null;
        term1Fee: number;
        term2Fee: number;
        term3Fee: number;
        booksFee: number;
        transportFee: number;
        concessionType?: string | null;
        concessionValue: number;
        concessionAmount: number;
        grossAmount: number;
        totalAmount: number;
        previousYearDue: number;
        carryForwardAmount: number;
        isActive: boolean;
        classFeeTemplate?: {
          id: UUIDString;
          totalTuitionFee: number;
          applyToFuture: boolean;
          status: string;
        } & AcademicYearFeeTemplate_Key;
        linkedParentFeeItems: ({
          id: UUIDString;
          amount: number;
          category: {
            id: UUIDString;
            name: string;
          } & FeeCategory_Key;
        } & StudentFeeItem_Key)[];
        linkedParentFeePayments: ({
          id: UUIDString;
          amount: number;
          paymentDate: DateString;
          paymentMode: string;
          referenceNumber?: string | null;
          receiptNumber: string;
          status: string;
          reversedAt?: TimestampString | null;
          reverseReason?: string | null;
          remarks?: string | null;
          collectedBy: {
            id: UUIDString;
            fullName: string;
          } & User_Key;
        } & FeePayment_Key)[];
      } & StudentFeePlan_Key)[];
    } & Student_Key;
  })[];
  legacyStudents: ({
    id: UUIDString;
    studentId: string;
    fullName: string;
    gender?: string | null;
    dateOfBirth?: DateString | null;
    branchId: UUIDString;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    parentId: UUIDString;
    phoneNumber?: string | null;
    admissionYear: number;
    branchCode: string;
    admissionDate: DateString;
    status: string;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
      academicYear: number;
      classTeacher?: {
        id: UUIDString;
        fullName: string;
        phoneNumber: string;
      } & User_Key;
    } & Section_Key;
    parent: {
      id: UUIDString;
      fullName: string;
      fatherName?: string | null;
      motherName?: string | null;
      countryCode: string;
      phoneNumber: string;
      address?: string | null;
    } & Parent_Key;
    linkedParents: ({
      id: UUIDString;
      relationship: string;
      user: {
        id: UUIDString;
        fullName: string;
        phoneNumber: string;
        role: string;
        roles: ({
          role: string;
        })[];
      } & User_Key;
    })[];
    legacyRecentAttendance: ({
      id: UUIDString;
      attendanceDate: DateString;
      status: string;
      remarks?: string | null;
    } & Attendance_Key)[];
    legacyAttendance: ({
      id: UUIDString;
      attendanceDate: DateString;
      status: string;
    } & Attendance_Key)[];
    legacyFees: ({
      id: UUIDString;
      totalFee: number;
      paidAmount: number;
      remainingAmount: number;
      status: string;
      dueDate: DateString;
    } & StudentFee_Key)[];
    legacyParentFeePlans: ({
      id: UUIDString;
      academicYear: number;
      classFeeTemplateId?: UUIDString | null;
      term1Fee: number;
      term2Fee: number;
      term3Fee: number;
      booksFee: number;
      transportFee: number;
      concessionType?: string | null;
      concessionValue: number;
      concessionAmount: number;
      grossAmount: number;
      totalAmount: number;
      isActive: boolean;
      classFeeTemplate?: {
        id: UUIDString;
        totalTuitionFee: number;
        applyToFuture: boolean;
        status: string;
      } & AcademicYearFeeTemplate_Key;
      legacyParentFeeItems: ({
        id: UUIDString;
        amount: number;
        category: {
          id: UUIDString;
          name: string;
        } & FeeCategory_Key;
      } & StudentFeeItem_Key)[];
      legacyParentFeePayments: ({
        id: UUIDString;
        amount: number;
        paymentDate: DateString;
        paymentMode: string;
        referenceNumber?: string | null;
        receiptNumber: string;
        status: string;
        reversedAt?: TimestampString | null;
        reverseReason?: string | null;
        remarks?: string | null;
        collectedBy: {
          id: UUIDString;
          fullName: string;
        } & User_Key;
      } & FeePayment_Key)[];
    } & StudentFeePlan_Key)[];
  } & Student_Key)[];
}

export interface GetParentChildrenByUserVariables {
  userId: UUIDString;
}

export interface GetParentChildrenData {
  students: ({
    id: UUIDString;
    studentId: string;
    fullName: string;
    gender?: string | null;
    dateOfBirth?: DateString | null;
    branchId: UUIDString;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    parentId: UUIDString;
    phoneNumber?: string | null;
    admissionYear: number;
    branchCode: string;
    admissionDate: DateString;
    status: string;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
      academicYear: number;
      classTeacher?: {
        id: UUIDString;
        fullName: string;
        phoneNumber: string;
      } & User_Key;
    } & Section_Key;
    parent: {
      id: UUIDString;
      fullName: string;
      fatherName?: string | null;
      motherName?: string | null;
      countryCode: string;
      phoneNumber: string;
      address?: string | null;
    } & Parent_Key;
    recentAttendance: ({
      id: UUIDString;
      attendanceDate: DateString;
      status: string;
      remarks?: string | null;
    } & Attendance_Key)[];
    attendance: ({
      id: UUIDString;
      attendanceDate: DateString;
      status: string;
    } & Attendance_Key)[];
    fees: ({
      id: UUIDString;
      totalFee: number;
      paidAmount: number;
      remainingAmount: number;
      status: string;
      dueDate: DateString;
    } & StudentFee_Key)[];
    parentFeePlans: ({
      id: UUIDString;
      academicYear: number;
      classFeeTemplateId?: UUIDString | null;
      term1Fee: number;
      term2Fee: number;
      term3Fee: number;
      booksFee: number;
      transportFee: number;
      concessionType?: string | null;
      concessionValue: number;
      concessionAmount: number;
      grossAmount: number;
      totalAmount: number;
      isActive: boolean;
      classFeeTemplate?: {
        id: UUIDString;
        totalTuitionFee: number;
        applyToFuture: boolean;
        status: string;
      } & AcademicYearFeeTemplate_Key;
      parentFeeItems: ({
        id: UUIDString;
        amount: number;
        category: {
          id: UUIDString;
          name: string;
        } & FeeCategory_Key;
      } & StudentFeeItem_Key)[];
      parentFeePayments: ({
        id: UUIDString;
        amount: number;
        paymentDate: DateString;
        paymentMode: string;
        referenceNumber?: string | null;
        receiptNumber: string;
        status: string;
        reversedAt?: TimestampString | null;
        reverseReason?: string | null;
        remarks?: string | null;
        collectedBy: {
          id: UUIDString;
          fullName: string;
        } & User_Key;
      } & FeePayment_Key)[];
    } & StudentFeePlan_Key)[];
  } & Student_Key)[];
}

export interface GetParentChildrenVariables {
  parentId: UUIDString;
}

export interface GetPaymentHistoryData {
  feePayments: ({
    id: UUIDString;
    studentId: UUIDString;
    feePlanId: UUIDString;
    amount: number;
    academicYear?: number | null;
    paymentDate: DateString;
    paymentMode: string;
    referenceNumber?: string | null;
    receiptNumber: string;
    status: string;
    reversedAt?: TimestampString | null;
    reverseReason?: string | null;
    remarks?: string | null;
    student: {
      id: UUIDString;
      studentId: string;
      fullName: string;
      academicClass: {
        id: UUIDString;
        name: string;
        wing: {
          id: UUIDString;
          code: string;
          name: string;
        } & Wing_Key;
      } & AcademicClass_Key;
      section: {
        id: UUIDString;
        name: string;
      } & Section_Key;
      branch: {
        id: UUIDString;
        name: string;
        branchCode: string;
      } & Branch_Key;
    } & Student_Key;
    collectedBy: {
      id: UUIDString;
      fullName: string;
    } & User_Key;
    reversedBy?: {
      id: UUIDString;
      fullName: string;
    } & User_Key;
  } & FeePayment_Key)[];
}

export interface GetPaymentHistoryVariables {
  branchId: UUIDString;
  fromDate?: DateString | null;
  toDate?: DateString | null;
  limit?: number | null;
  offset?: number | null;
}

export interface GetPrincipalDashboardData {
  students: ({
    id: UUIDString;
  } & Student_Key)[];
  teachers: ({
    id: UUIDString;
  } & Teacher_Key)[];
  coordinators: ({
    id: UUIDString;
  } & Coordinator_Key)[];
  sections: ({
    id: UUIDString;
  } & Section_Key)[];
  pendingPromotions: ({
    id: UUIDString;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
  } & Student_Key)[];
}

export interface GetPrincipalDashboardVariables {
  branchId: UUIDString;
}

export interface GetPromotionHistoryData {
  studentPromotionHistories: ({
    id: UUIDString;
    studentId: UUIDString;
    fromClassId: UUIDString;
    toClassId?: UUIDString | null;
    fromSectionId: UUIDString;
    toSectionId?: UUIDString | null;
    promotedById: UUIDString;
    promotedAt: TimestampString;
    student: {
      id: UUIDString;
      studentId: string;
      fullName: string;
    } & Student_Key;
    fromClass: {
      id: UUIDString;
      name: string;
    } & AcademicClass_Key;
    toClass?: {
      id: UUIDString;
      name: string;
    } & AcademicClass_Key;
    fromSection: {
      id: UUIDString;
      name: string;
    } & Section_Key;
    toSection?: {
      id: UUIDString;
      name: string;
    } & Section_Key;
    promotedBy: {
      id: UUIDString;
      fullName: string;
    } & User_Key;
  } & StudentPromotionHistory_Key)[];
}

export interface GetPromotionHistoryVariables {
  studentId?: UUIDString | null;
}

export interface GetPublishedExamsForSectionData {
  examSections: ({
    id: UUIDString;
    isPublished: boolean;
    publishedAt?: TimestampString | null;
    exam: {
      id: UUIDString;
      name: string;
      examType: string;
      startDate?: DateString | null;
      endDate?: DateString | null;
    } & Exam_Key;
  } & ExamSection_Key)[];
}

export interface GetPublishedExamsForSectionVariables {
  sectionId: UUIDString;
  academicYearId: UUIDString;
}

export interface GetReceiptSequenceData {
  receiptSequences: ({
    year: number;
    branchCode: string;
    lastSequence: number;
  } & ReceiptSequence_Key)[];
}

export interface GetReceiptSequenceVariables {
  year: number;
  branchCode: string;
}

export interface GetSectionClassTeacherData {
  sections: ({
    id: UUIDString;
    name: string;
    classTeacherId?: UUIDString | null;
    academicClass: {
      id: UUIDString;
      name: string;
    } & AcademicClass_Key;
  } & Section_Key)[];
}

export interface GetSectionClassTeacherVariables {
  sectionId: UUIDString;
}

export interface GetSectionsByClassAndYearData {
  sections: ({
    id: UUIDString;
    branchId: UUIDString;
    wingId: UUIDString;
    academicClassId: UUIDString;
    name: string;
    academicYear: number;
    classTeacherId?: UUIDString | null;
    isActive: boolean;
  } & Section_Key)[];
}

export interface GetSectionsByClassAndYearVariables {
  branchId: UUIDString;
  academicClassId: UUIDString;
  academicYear: number;
}

export interface GetSectionsByClassData {
  sections: ({
    id: UUIDString;
    branchId: UUIDString;
    wingId: UUIDString;
    academicClassId: UUIDString;
    name: string;
    isActive: boolean;
  } & Section_Key)[];
}

export interface GetSectionsByClassVariables {
  academicClassId: UUIDString;
}

export interface GetSectionsData {
  sections: ({
    id: UUIDString;
    branchId: UUIDString;
    wingId: UUIDString;
    academicClassId: UUIDString;
    name: string;
    academicYear: number;
    classTeacherId?: UUIDString | null;
    isActive: boolean;
    academicClass: {
      id: UUIDString;
      name: string;
      sortOrder: number;
      wingId: UUIDString;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    classTeacher?: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
      employeeId?: string | null;
      staffType?: string | null;
      role: string;
      roles: ({
        role: string;
      })[];
      teacherProfile?: {
        id: UUIDString;
        userId: UUIDString;
        employeeId: string;
        staffType: string;
        branchId: UUIDString;
        isActive: boolean;
      } & Teacher_Key;
    } & User_Key;
    classTeacherAssignments: ({
      id: UUIDString;
      teacherId: UUIDString;
      sectionId: UUIDString;
      createdAt: TimestampString;
      updatedAt: TimestampString;
      assignedBy?: {
        id: UUIDString;
        fullName: string;
        role: string;
      } & User_Key;
      teacher: {
        id: UUIDString;
        employeeId: string;
        staffType: string;
        user: {
          id: UUIDString;
          fullName: string;
          phoneNumber: string;
          employeeId?: string | null;
          role: string;
          roles: ({
            role: string;
          })[];
        } & User_Key;
      } & Teacher_Key;
    } & TeacherSectionAssignment_Key)[];
  } & Section_Key)[];
  students: ({
    id: UUIDString;
    sectionId: UUIDString;
  } & Student_Key)[];
  attendances: ({
    id: UUIDString;
    sectionId: UUIDString;
    status: string;
  } & Attendance_Key)[];
}

export interface GetSectionsForTeacherAssignmentData {
  sections: ({
    id: UUIDString;
    branchId: UUIDString;
    wingId: UUIDString;
    academicClassId: UUIDString;
    name: string;
    academicYear: number;
    classTeacherId?: UUIDString | null;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    classTeacher?: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
    } & User_Key;
  } & Section_Key)[];
}

export interface GetSectionsForTeacherAssignmentVariables {
  branchId: UUIDString;
  wing?: string | null;
  academicYear: number;
}

export interface GetSectionsVariables {
  branchId: UUIDString;
  academicYear: number;
  limit?: number | null;
  offset?: number | null;
}

export interface GetStaffIdSequenceData {
  staffIdSequences: ({
    joiningYear: number;
    branchCode: string;
    staffType: string;
    lastSerialNumber: number;
  } & StaffIdSequence_Key)[];
}

export interface GetStaffIdSequenceVariables {
  joiningYear: number;
  branchCode: string;
  staffType: string;
}

export interface GetStaffIdsByPrefixData {
  users: ({
    id: UUIDString;
    employeeId?: string | null;
    staffType?: string | null;
  } & User_Key)[];
}

export interface GetStaffIdsByPrefixVariables {
  branchId: UUIDString;
  staffType: string;
  employeeIdPrefix: string;
}

export interface GetStudentAttendanceData {
  attendances: ({
    id: UUIDString;
    attendanceDate: DateString;
    status: string;
    remarks?: string | null;
  } & Attendance_Key)[];
}

export interface GetStudentAttendanceVariables {
  studentId: UUIDString;
}

export interface GetStudentDetailsData {
  student?: {
    id: UUIDString;
    studentId: string;
    admissionYear: number;
    branchCode: string;
    serialNumber: number;
    fullName: string;
    gender?: string | null;
    dateOfBirth?: DateString | null;
    photoUrl?: string | null;
    aadhaarNumber?: string | null;
    apaarId?: string | null;
    bloodGroup?: string | null;
    branchId: UUIDString;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    parentId: UUIDString;
    countryCode?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    emergencyContact?: string | null;
    transportRequired?: boolean | null;
    aadhaarDocumentUrl?: string | null;
    transferCertificateUrl?: string | null;
    birthCertificateUrl?: string | null;
    admissionDate: DateString;
    status: string;
    isActive: boolean;
    branch: {
      id: UUIDString;
      name: string;
      branchCode: string;
    } & Branch_Key;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
      academicYear: number;
      classTeacher?: {
        id: UUIDString;
        fullName: string;
        phoneNumber: string;
      } & User_Key;
    } & Section_Key;
    parent: {
      id: UUIDString;
      fullName: string;
      fatherName?: string | null;
      motherName?: string | null;
      countryCode: string;
      phoneNumber: string;
      email?: string | null;
      address?: string | null;
    } & Parent_Key;
    linkedParents: ({
      id: UUIDString;
      relationship: string;
      createdAt: TimestampString;
      user: {
        id: UUIDString;
        fullName: string;
        phoneNumber: string;
        role: string;
        roles: ({
          role: string;
        })[];
      } & User_Key;
    })[];
  } & Student_Key;
  attendances: ({
    id: UUIDString;
    attendanceDate: DateString;
    status: string;
    remarks?: string | null;
    markedBy: {
      id: UUIDString;
      fullName: string;
    } & User_Key;
    editedBy?: {
      id: UUIDString;
      fullName: string;
    } & User_Key;
  } & Attendance_Key)[];
  studentFees: ({
    id: UUIDString;
    totalFee: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    dueDate: DateString;
  } & StudentFee_Key)[];
  studentDetailFeePlans: ({
    id: UUIDString;
    academicYear: number;
    totalAmount: number;
    isActive: boolean;
    detailFeeItems: ({
      id: UUIDString;
      amount: number;
      category: {
        id: UUIDString;
        name: string;
      } & FeeCategory_Key;
    } & StudentFeeItem_Key)[];
    detailFeePayments: ({
      id: UUIDString;
      amount: number;
      paymentDate: DateString;
      paymentMode: string;
      receiptNumber: string;
    } & FeePayment_Key)[];
  } & StudentFeePlan_Key)[];
  studentSectionHistories: ({
    id: UUIDString;
    changedAt: TimestampString;
    oldSection: {
      id: UUIDString;
      name: string;
      academicClass: {
        id: UUIDString;
        name: string;
      } & AcademicClass_Key;
    } & Section_Key;
    newSection: {
      id: UUIDString;
      name: string;
      academicClass: {
        id: UUIDString;
        name: string;
      } & AcademicClass_Key;
    } & Section_Key;
    changedBy: {
      id: UUIDString;
      fullName: string;
    } & User_Key;
  } & StudentSectionHistory_Key)[];
  studentPromotionHistories: ({
    id: UUIDString;
    promotedAt: TimestampString;
    fromClass: {
      id: UUIDString;
      name: string;
    } & AcademicClass_Key;
    toClass?: {
      id: UUIDString;
      name: string;
    } & AcademicClass_Key;
    fromSection: {
      id: UUIDString;
      name: string;
    } & Section_Key;
    toSection?: {
      id: UUIDString;
      name: string;
    } & Section_Key;
    promotedBy: {
      id: UUIDString;
      fullName: string;
    } & User_Key;
  } & StudentPromotionHistory_Key)[];
}

export interface GetStudentDetailsVariables {
  studentId: UUIDString;
}

export interface GetStudentFeeHistoryData {
  studentFees: ({
    id: UUIDString;
    totalFee: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    dueDate: DateString;
  } & StudentFee_Key)[];
  payments: ({
    id: UUIDString;
    studentFeeId: UUIDString;
    amount: number;
    paymentMode: string;
    receiptNumber?: string | null;
    remarks?: string | null;
    paidAt: TimestampString;
  } & Payment_Key)[];
}

export interface GetStudentFeeHistoryVariables {
  studentId: UUIDString;
}

export interface GetStudentFeeProfileData {
  student?: {
    id: UUIDString;
    studentId: string;
    fullName: string;
    branchId: UUIDString;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
    } & Section_Key;
    parent: {
      id: UUIDString;
      fullName: string;
      fatherName?: string | null;
      motherName?: string | null;
      phoneNumber: string;
    } & Parent_Key;
    profileLinkedParents: ({
      userId: UUIDString;
    })[];
    branch: {
      id: UUIDString;
      name: string;
      branchCode: string;
    } & Branch_Key;
    profileFeePlans: ({
      id: UUIDString;
      academicYear: number;
      classFeeTemplateId?: UUIDString | null;
      term1Fee: number;
      term2Fee: number;
      term3Fee: number;
      booksFee: number;
      transportFee: number;
      concessionType?: string | null;
      concessionValue: number;
      concessionAmount: number;
      grossAmount: number;
      totalAmount: number;
      previousYearDue: number;
      carryForwardAmount: number;
      isActive: boolean;
      createdAt: TimestampString;
      classFeeTemplate?: {
        id: UUIDString;
        totalTuitionFee: number;
        applyToFuture: boolean;
        status: string;
      } & AcademicYearFeeTemplate_Key;
      createdBy: {
        id: UUIDString;
        fullName: string;
      } & User_Key;
      profileFeeItems: ({
        id: UUIDString;
        amount: number;
        category: {
          id: UUIDString;
          name: string;
          status: string;
        } & FeeCategory_Key;
      } & StudentFeeItem_Key)[];
      profileFeePayments: ({
        id: UUIDString;
        amount: number;
        academicYear?: number | null;
        paymentDate: DateString;
        paymentMode: string;
        referenceNumber?: string | null;
        receiptNumber: string;
        status: string;
        reversedAt?: TimestampString | null;
        reverseReason?: string | null;
        remarks?: string | null;
        collectedBy: {
          id: UUIDString;
          fullName: string;
        } & User_Key;
        reversedBy?: {
          id: UUIDString;
          fullName: string;
        } & User_Key;
      } & FeePayment_Key)[];
    } & StudentFeePlan_Key)[];
  } & Student_Key;
}

export interface GetStudentFeeProfileVariables {
  studentId: UUIDString;
  actorRole?: string | null;
  actorRoleAlias?: string | null;
}

export interface GetStudentIdSequenceData {
  studentIdSequences: ({
    admissionYear: number;
    branchCode: string;
    lastSerialNumber: number;
  } & StudentIdSequence_Key)[];
}

export interface GetStudentIdSequenceVariables {
  admissionYear: number;
  branchCode: string;
}

export interface GetStudentParentsData {
  studentParents: ({
    id: UUIDString;
    relationship: string;
    createdAt: TimestampString;
    user: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
      role: string;
      roles: ({
        role: string;
      })[];
    } & User_Key;
  })[];
}

export interface GetStudentParentsVariables {
  studentId: UUIDString;
}

export interface GetStudentProfileData {
  student?: {
    id: UUIDString;
    studentId: string;
    fullName: string;
    gender?: string | null;
    dateOfBirth?: DateString | null;
    photoUrl?: string | null;
    bloodGroup?: string | null;
    apaarId?: string | null;
    rollNumber?: string | null;
    branchId: UUIDString;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    parentId: UUIDString;
    phoneNumber?: string | null;
    address?: string | null;
    aadhaarDocumentUrl?: string | null;
    transferCertificateUrl?: string | null;
    birthCertificateUrl?: string | null;
    admissionDate: DateString;
    isActive: boolean;
    branch: {
      id: UUIDString;
      name: string;
      branchCode: string;
    } & Branch_Key;
    academicClass: {
      id: UUIDString;
      name: string;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
    } & Section_Key;
    parent: {
      id: UUIDString;
      fullName: string;
      fatherName?: string | null;
      motherName?: string | null;
      countryCode: string;
      phoneNumber: string;
      email?: string | null;
      address?: string | null;
    } & Parent_Key;
    linkedParents: ({
      id: UUIDString;
      relationship: string;
      createdAt: TimestampString;
      user: {
        id: UUIDString;
        fullName: string;
        phoneNumber: string;
        role: string;
        roles: ({
          role: string;
        })[];
      } & User_Key;
    })[];
  } & Student_Key;
  attendances: ({
    id: UUIDString;
    attendanceDate: DateString;
    status: string;
    remarks?: string | null;
  } & Attendance_Key)[];
  studentFees: ({
    id: UUIDString;
    totalFee: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    dueDate: DateString;
  } & StudentFee_Key)[];
  payments: ({
    id: UUIDString;
    studentFeeId: UUIDString;
    amount: number;
    paymentMode: string;
    receiptNumber?: string | null;
    uploadedById: UUIDString;
    remarks?: string | null;
    paidAt: TimestampString;
  } & Payment_Key)[];
}

export interface GetStudentProfileVariables {
  studentId: UUIDString;
}

export interface GetStudentResultDetailData {
  studentMarks: ({
    subjectName: string;
    marksObtained?: number | null;
    isAbsent: boolean;
    updatedAt: TimestampString;
    student: {
      id: UUIDString;
      fullName: string;
      studentId: string;
      rollNumber?: string | null;
      section: {
        id: UUIDString;
        name: string;
        academicClass: {
          id: UUIDString;
          name: string;
        } & AcademicClass_Key;
      } & Section_Key;
    } & Student_Key;
  })[];
  examSubjectConfigs: ({
    subjectName: string;
    maxMarks: number;
    passingMarks: number;
    examDate?: DateString | null;
  })[];
  exams: ({
    id: UUIDString;
    name: string;
    examType: string;
    startDate?: DateString | null;
    endDate?: DateString | null;
    branchId: UUIDString;
    academicYear: {
      id: UUIDString;
      name: string;
      startYear: number;
    } & AcademicYear_Key;
  } & Exam_Key)[];
}

export interface GetStudentResultDetailVariables {
  examId: UUIDString;
  studentId: UUIDString;
}

export interface GetStudentResultsForParentData {
  examSections: ({
    id: UUIDString;
    isPublished: boolean;
    publishedAt?: TimestampString | null;
    exam: {
      id: UUIDString;
      name: string;
      examType: string;
      startDate?: DateString | null;
      endDate?: DateString | null;
      academicYearId: UUIDString;
    } & Exam_Key;
    section: {
      id: UUIDString;
      name: string;
      academicClass: {
        id: UUIDString;
        name: string;
      } & AcademicClass_Key;
    } & Section_Key;
  } & ExamSection_Key)[];
}

export interface GetStudentResultsForParentVariables {
  studentId: UUIDString;
  academicYearId: UUIDString;
}

export interface GetStudentSequenceData {
  studentSequences: ({
    year: number;
    branchCode: string;
    lastSerial: number;
  } & StudentSequence_Key)[];
}

export interface GetStudentSequenceVariables {
  year: number;
  branchCode: string;
}

export interface GetStudentsByBranchData {
  students: ({
    id: UUIDString;
    studentId: string;
    admissionYear: number;
    branchCode: string;
    serialNumber: number;
    fullName: string;
    gender?: string | null;
    dateOfBirth?: DateString | null;
    branchId: UUIDString;
    wingId?: UUIDString | null;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    parentId: UUIDString;
    phoneNumber?: string | null;
    address?: string | null;
    admissionDate: DateString;
    status: string;
    isActive: boolean;
  } & Student_Key)[];
}

export interface GetStudentsByBranchVariables {
  branchId: UUIDString;
  limit?: number | null;
  offset?: number | null;
}

export interface GetStudentsBySectionData {
  students: ({
    id: UUIDString;
    studentId: string;
    fullName: string;
    gender?: string | null;
    dateOfBirth?: DateString | null;
    branchId: UUIDString;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    parentId: UUIDString;
    phoneNumber?: string | null;
    admissionDate: DateString;
    status: string;
    isActive: boolean;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
      academicYear: number;
      classTeacher?: {
        id: UUIDString;
        fullName: string;
        phoneNumber: string;
      } & User_Key;
    } & Section_Key;
    parent: {
      id: UUIDString;
      userId?: UUIDString | null;
      fullName: string;
      fatherName?: string | null;
      motherName?: string | null;
      phoneNumber: string;
    } & Parent_Key;
  } & Student_Key)[];
}

export interface GetStudentsBySectionVariables {
  sectionId: UUIDString;
  limit?: number | null;
  offset?: number | null;
}

export interface GetStudentsByWingData {
  students: ({
    id: UUIDString;
    studentId: string;
    fullName: string;
    gender?: string | null;
    branchId: UUIDString;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    parentId: UUIDString;
    phoneNumber?: string | null;
    status: string;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        code: string;
        name: string;
      };
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
      academicYear: number;
    } & Section_Key;
  } & Student_Key)[];
}

export interface GetStudentsByWingVariables {
  branchId: UUIDString;
  wing: string;
  limit?: number | null;
  offset?: number | null;
}

export interface GetStudentsData {
  students: ({
    id: UUIDString;
    studentId: string;
    admissionYear: number;
    branchCode: string;
    serialNumber: number;
    fullName: string;
    gender?: string | null;
    dateOfBirth?: DateString | null;
    photoUrl?: string | null;
    aadhaarNumber?: string | null;
    apaarId?: string | null;
    bloodGroup?: string | null;
    branchId: UUIDString;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    parentId: UUIDString;
    countryCode?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    emergencyContact?: string | null;
    transportRequired?: boolean | null;
    admissionDate: DateString;
    status: string;
    isActive: boolean;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        id: UUIDString;
        code: string;
        name: string;
      } & Wing_Key;
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
      academicYear: number;
    } & Section_Key;
    parent: {
      id: UUIDString;
      fullName: string;
      fatherName?: string | null;
      motherName?: string | null;
      phoneNumber: string;
    } & Parent_Key;
  } & Student_Key)[];
}

export interface GetStudentsVariables {
  branchId: UUIDString;
  limit?: number | null;
  offset?: number | null;
}

export interface GetSubjectsData {
  subjects: ({
    id: UUIDString;
    name: string;
    code: string;
    status: string;
  } & Subject_Key)[];
}

export interface GetSubjectsVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface GetSuggestionsByBranchData {
  suggestions: ({
    id: UUIDString;
    parentId: UUIDString;
    studentId?: UUIDString | null;
    branchId: UUIDString;
    title: string;
    message: string;
    status: string;
    response?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    parent: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
    } & Parent_Key;
    student?: {
      id: UUIDString;
      fullName: string;
    } & Student_Key;
  } & Suggestion_Key)[];
}

export interface GetSuggestionsByBranchVariables {
  branchId: UUIDString;
  limit?: number | null;
}

export interface GetSuggestionsByParentData {
  suggestions: ({
    id: UUIDString;
    parentId: UUIDString;
    studentId?: UUIDString | null;
    branchId: UUIDString;
    title: string;
    message: string;
    status: string;
    response?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    student?: {
      id: UUIDString;
      fullName: string;
    } & Student_Key;
  } & Suggestion_Key)[];
}

export interface GetSuggestionsByParentVariables {
  parentId: UUIDString;
  limit?: number | null;
}

export interface GetTeacherAssignmentsData {
  teacherAssignments: ({
    id: UUIDString;
    teacherId: UUIDString;
    branchId: UUIDString;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    subjectName?: string | null;
    isClassTeacher: boolean;
  } & TeacherAssignment_Key)[];
}

export interface GetTeacherAssignmentsVariables {
  teacherId: UUIDString;
}

export interface GetTeacherDashboardData {
  teacher?: {
    id: UUIDString;
    userId: UUIDString;
    branchId: UUIDString;
    employeeId: string;
    staffType: string;
    designation: string;
    user: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
      role: string;
      roles: ({
        role: string;
      })[];
      dashboardMarkedAttendance: ({
        id: UUIDString;
        attendanceDate: DateString;
        status: string;
        sectionId: UUIDString;
      } & Attendance_Key)[];
    } & User_Key;
    teacherSubjects_on_teacher: ({
      id: UUIDString;
      subject: {
        id: UUIDString;
        name: string;
        code: string;
      } & Subject_Key;
    } & TeacherSubject_Key)[];
    dashboardAssignments: ({
      id: UUIDString;
      sectionId: UUIDString;
      isClassTeacher: boolean;
      isActive: boolean;
      section: {
        id: UUIDString;
        name: string;
        academicYear: number;
        academicClass: {
          id: UUIDString;
          name: string;
          wing: {
            code: string;
            name: string;
          };
        } & AcademicClass_Key;
        dashboardActiveStudents: ({
          id: UUIDString;
          studentId: string;
          fullName: string;
          status: string;
        } & Student_Key)[];
        dashboardSectionAttendance: ({
          id: UUIDString;
          studentId: UUIDString;
          attendanceDate: DateString;
          status: string;
          markedById: UUIDString;
        } & Attendance_Key)[];
      } & Section_Key;
    } & TeacherSectionAssignment_Key)[];
  } & Teacher_Key;
}

export interface GetTeacherDashboardVariables {
  teacherId: UUIDString;
}

export interface GetTeacherProfileByUserData {
  teachers: ({
    id: UUIDString;
    userId: UUIDString;
    employeeId: string;
    staffType: string;
    branchId: UUIDString;
    joiningDate: DateString;
    designation: string;
    gender: string;
    isActive: boolean;
    user: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
      role: string;
      roles: ({
        role: string;
      })[];
    } & User_Key;
    profileByUserAssignments: ({
      id: UUIDString;
      sectionId: UUIDString;
      isClassTeacher: boolean;
      isActive: boolean;
      section: {
        id: UUIDString;
        name: string;
        academicYear: number;
        academicClass: {
          id: UUIDString;
          name: string;
          wing: {
            code: string;
            name: string;
          };
        } & AcademicClass_Key;
      } & Section_Key;
    } & TeacherSectionAssignment_Key)[];
  } & Teacher_Key)[];
}

export interface GetTeacherProfileByUserVariables {
  userId: UUIDString;
}

export interface GetTeacherProfileData {
  teacher?: {
    id: UUIDString;
    userId: UUIDString;
    employeeId: string;
    staffType: string;
    branchId: UUIDString;
    joiningDate: DateString;
    designation: string;
    gender: string;
    alternateMobileNumber?: string | null;
    email?: string | null;
    dateOfBirth?: DateString | null;
    qualification?: string | null;
    experience?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    emergencyContact?: string | null;
    bloodGroup?: string | null;
    isActive: boolean;
    user: {
      id: UUIDString;
      fullName: string;
      countryCode: string;
      phoneNumber: string;
      role: string;
      isActive: boolean;
      roles: ({
        role: string;
      })[];
    } & User_Key;
    branch: {
      id: UUIDString;
      name: string;
      branchCode: string;
    } & Branch_Key;
    subjects: ({
      id: UUIDString;
      subject: {
        id: UUIDString;
        name: string;
        code: string;
        status: string;
      } & Subject_Key;
    } & TeacherSubject_Key)[];
    profileAssignments: ({
      id: UUIDString;
      sectionId: UUIDString;
      isClassTeacher: boolean;
      isActive: boolean;
      section: {
        id: UUIDString;
        name: string;
        academicYear: number;
        academicClass: {
          id: UUIDString;
          name: string;
          wing: {
            code: string;
            name: string;
          };
        } & AcademicClass_Key;
        profileActiveStudents: ({
          id: UUIDString;
          studentId: string;
          fullName: string;
          status: string;
        } & Student_Key)[];
        profileSectionAttendance: ({
          id: UUIDString;
          studentId: UUIDString;
          attendanceDate: DateString;
          status: string;
          markedById: UUIDString;
        } & Attendance_Key)[];
      } & Section_Key;
    } & TeacherSectionAssignment_Key)[];
    attendanceMarked: {
      profileMarkedAttendance: ({
        id: UUIDString;
        attendanceDate: DateString;
        status: string;
        sectionId: UUIDString;
      } & Attendance_Key)[];
    };
  } & Teacher_Key;
}

export interface GetTeacherProfileVariables {
  teacherId: UUIDString;
}

export interface GetTeachersByBranchData {
  users: ({
    id: UUIDString;
    fullName: string;
    phoneNumber: string;
    role: string;
    employeeId?: string | null;
    staffType?: string | null;
    branchId?: UUIDString | null;
  } & User_Key)[];
}

export interface GetTeachersByBranchVariables {
  branchId: UUIDString;
}

export interface GetTeachersByWingData {
  teachers: ({
    id: UUIDString;
    userId: UUIDString;
    employeeId: string;
    staffType: string;
    branchId: UUIDString;
    joiningDate: DateString;
    designation: string;
    gender: string;
    email?: string | null;
    qualification?: string | null;
    experience?: string | null;
    isActive: boolean;
    user: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
      countryCode: string;
      role: string;
      staffType?: string | null;
      isActive: boolean;
      roles: ({
        role: string;
      })[];
    } & User_Key;
    teacherSubjects_on_teacher: ({
      id: UUIDString;
      subject: {
        id: UUIDString;
        name: string;
        code: string;
        status: string;
      } & Subject_Key;
    } & TeacherSubject_Key)[];
  } & Teacher_Key)[];
}

export interface GetTeachersByWingVariables {
  branchId: UUIDString;
  wing: string;
  limit?: number | null;
  offset?: number | null;
}

export interface GetTeachersData {
  teachers: ({
    id: UUIDString;
    userId: UUIDString;
    employeeId: string;
    staffType: string;
    branchId: UUIDString;
    joiningDate: DateString;
    designation: string;
    gender: string;
    email?: string | null;
    qualification?: string | null;
    experience?: string | null;
    isActive: boolean;
    user: {
      id: UUIDString;
      fullName: string;
      phoneNumber: string;
      countryCode: string;
      role: string;
      staffType?: string | null;
      isActive: boolean;
      roles: ({
        role: string;
      })[];
    } & User_Key;
    teacherSubjects_on_teacher: ({
      id: UUIDString;
      subject: {
        id: UUIDString;
        name: string;
        code: string;
        status: string;
      } & Subject_Key;
    } & TeacherSubject_Key)[];
    listAssignments: ({
      id: UUIDString;
      sectionId: UUIDString;
      isClassTeacher: boolean;
      isActive: boolean;
      section: {
        id: UUIDString;
        name: string;
        academicYear: number;
        academicClass: {
          id: UUIDString;
          name: string;
          wing: {
            code: string;
            name: string;
          };
        } & AcademicClass_Key;
      } & Section_Key;
    } & TeacherSectionAssignment_Key)[];
  } & Teacher_Key)[];
}

export interface GetTeachersVariables {
  branchId: UUIDString;
  limit?: number | null;
  offset?: number | null;
}

export interface GetTimetableForSectionData {
  timetablePeriods: ({
    sectionId: UUIDString;
    branchId: UUIDString;
    teacherId?: UUIDString | null;
    day: string;
    periodNum: number;
    subject?: string | null;
    teacherName?: string | null;
    room?: string | null;
    status?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    timetableType?: string | null;
    publishedById?: UUIDString | null;
    publishedAt?: TimestampString | null;
    isActive: boolean;
    section: {
      id: UUIDString;
      name: string;
      academicClass: {
        id: UUIDString;
        name: string;
      } & AcademicClass_Key;
    } & Section_Key;
  } & TimetablePeriod_Key)[];
}

export interface GetTimetableForSectionVariables {
  sectionId: UUIDString;
}

export interface GetTimetableForTeacherData {
  timetablePeriods: ({
    sectionId: UUIDString;
    branchId: UUIDString;
    teacherId?: UUIDString | null;
    day: string;
    periodNum: number;
    subject?: string | null;
    teacherName?: string | null;
    room?: string | null;
    status?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    timetableType?: string | null;
    isActive: boolean;
    section: {
      id: UUIDString;
      name: string;
      academicClass: {
        id: UUIDString;
        name: string;
      } & AcademicClass_Key;
    } & Section_Key;
  } & TimetablePeriod_Key)[];
}

export interface GetTimetableForTeacherVariables {
  teacherId: UUIDString;
  branchId: UUIDString;
}

export interface GetTimetablesForBranchData {
  timetablePeriods: ({
    sectionId: UUIDString;
    branchId: UUIDString;
    teacherId?: UUIDString | null;
    day: string;
    periodNum: number;
    subject?: string | null;
    teacherName?: string | null;
    room?: string | null;
    status?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    timetableType?: string | null;
    publishedById?: UUIDString | null;
    publishedAt?: TimestampString | null;
    isActive: boolean;
    section: {
      id: UUIDString;
      name: string;
      wingId: UUIDString;
      academicClass: {
        id: UUIDString;
        name: string;
      } & AcademicClass_Key;
    } & Section_Key;
  } & TimetablePeriod_Key)[];
}

export interface GetTimetablesForBranchVariables {
  branchId: UUIDString;
}

export interface GetTimetablesForWingData {
  timetablePeriods: ({
    sectionId: UUIDString;
    branchId: UUIDString;
    teacherId?: UUIDString | null;
    day: string;
    periodNum: number;
    subject?: string | null;
    teacherName?: string | null;
    room?: string | null;
    status?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    timetableType?: string | null;
    publishedById?: UUIDString | null;
    publishedAt?: TimestampString | null;
    isActive: boolean;
    section: {
      id: UUIDString;
      name: string;
      wingId: UUIDString;
      academicClass: {
        id: UUIDString;
        name: string;
      } & AcademicClass_Key;
    } & Section_Key;
  } & TimetablePeriod_Key)[];
}

export interface GetTimetablesForWingVariables {
  branchId: UUIDString;
  wingId: UUIDString;
}

export interface GetUnreadNotificationCountData {
  notifications: ({
    id: UUIDString;
  } & Notification_Key)[];
}

export interface GetUnreadNotificationCountVariables {
  userId: UUIDString;
}

export interface GetUserByPhoneData {
  users: ({
    id: UUIDString;
    firebaseUID: string;
    phoneNumber: string;
    isActive: boolean;
  } & User_Key)[];
}

export interface GetUserByPhoneVariables {
  phoneNumber: string;
}

export interface GetUserForRoleChangeData {
  users: ({
    id: UUIDString;
    fullName: string;
    phoneNumber: string;
    role: string;
    branchId?: UUIDString | null;
    isActive: boolean;
    branch?: {
      id: UUIDString;
      name: string;
      branchCode: string;
    } & Branch_Key;
    userRoles_on_user: ({
      id: UUIDString;
      role: string;
      createdAt: TimestampString;
    })[];
  } & User_Key)[];
}

export interface GetUserForRoleChangeVariables {
  phoneNumber: string;
}

export interface GetUserRoleForClaimsData {
  users: ({
    role: string;
    branchId?: UUIDString | null;
    isActive: boolean;
  })[];
}

export interface GetUserRoleForClaimsVariables {
  firebaseUID: string;
}

export interface GetUserRolesData {
  userRoles: ({
    id: UUIDString;
    userId: UUIDString;
    role: string;
    createdAt: TimestampString;
  } & UserRole_Key)[];
}

export interface GetUserRolesVariables {
  userId: UUIDString;
}

export interface GetUsersByPhoneData {
  users: ({
    id: UUIDString;
    firebaseUID: string;
    fullName: string;
    countryCode: string;
    phoneNumber: string;
    role: string;
    employeeId?: string | null;
    staffType?: string | null;
    branchId?: UUIDString | null;
    wingId?: UUIDString | null;
    branch?: {
      id: UUIDString;
      branchCode: string;
      name: string;
    } & Branch_Key;
    isActive: boolean;
  } & User_Key)[];
}

export interface GetUsersByPhoneVariables {
  phoneNumber: string;
}

export interface GetUsersByRoleData {
  users: ({
    id: UUIDString;
    fullName: string;
    phoneNumber: string;
    role: string;
    roles: ({
      role: string;
    })[];
    branchId?: UUIDString | null;
    isActive: boolean;
  } & User_Key)[];
}

export interface GetUsersByRoleVariables {
  role: string;
  alternateRole: string;
  searchText: string;
  limit?: number | null;
}

export interface GetWingsByBranchData {
  wings: ({
    id: UUIDString;
    branchId: UUIDString;
    name: string;
    code: string;
    isActive: boolean;
  } & Wing_Key)[];
}

export interface GetWingsByBranchVariables {
  branchId: UUIDString;
}

export interface Holiday_Key {
  id: UUIDString;
  __typename?: 'Holiday_Key';
}

export interface LinkParentUserData {
  parent_update?: Parent_Key | null;
}

export interface LinkParentUserVariables {
  parentId: UUIDString;
  userId: UUIDString;
  branchId?: UUIDString | null;
}

export interface LinkStudentParentData {
  studentParent_upsert: StudentParent_Key;
  auditLog_insert: AuditLog_Key;
}

export interface LinkStudentParentVariables {
  studentId: UUIDString;
  userId: UUIDString;
  relationship: string;
  branchId: UUIDString;
}

export interface MarkAllNotificationsReadData {
  notification_updateMany: number;
}

export interface MarkAllNotificationsReadVariables {
  userId: UUIDString;
}

export interface MarkNotificationReadData {
  notification_update?: Notification_Key | null;
}

export interface MarkNotificationReadVariables {
  id: UUIDString;
}

export interface MarksAuditLog_Key {
  id: UUIDString;
  __typename?: 'MarksAuditLog_Key';
}

export interface Notice_Key {
  id: UUIDString;
  __typename?: 'Notice_Key';
}

export interface Notification_Key {
  id: UUIDString;
  __typename?: 'Notification_Key';
}

export interface Parent_Key {
  id: UUIDString;
  __typename?: 'Parent_Key';
}

export interface Payment_Key {
  id: UUIDString;
  __typename?: 'Payment_Key';
}

export interface PublishExamSectionData {
  examSection_update?: ExamSection_Key | null;
}

export interface PublishExamSectionVariables {
  examSectionId: UUIDString;
  publishedById: UUIDString;
}

export interface PublishTimetableSectionData {
  timetablePeriod_updateMany: number;
}

export interface PublishTimetableSectionVariables {
  sectionId: UUIDString;
  branchId: UUIDString;
  publishedById: UUIDString;
}

export interface ReceiptSequence_Key {
  year: number;
  branchCode: string;
  __typename?: 'ReceiptSequence_Key';
}

export interface RecordAuditLogData {
  auditLog_insert: AuditLog_Key;
}

export interface RecordAuditLogVariables {
  performedBy: string;
  performedRole: string;
  actingAs?: string | null;
  branchId?: UUIDString | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  oldData?: string | null;
  newData?: string | null;
}

export interface RecordMarksAuditLogData {
  marksAuditLog_insert: MarksAuditLog_Key;
}

export interface RecordMarksAuditLogVariables {
  examId: UUIDString;
  studentId: UUIDString;
  branchId: UUIDString;
  subjectName: string;
  oldMarks?: number | null;
  newMarks?: number | null;
  changedById: UUIDString;
  changedByRole: string;
}

export interface RecordPaymentData {
  receiptSequence_upsert: ReceiptSequence_Key;
  feePayment_insert: FeePayment_Key;
  feeAuditLog_insert: FeeAuditLog_Key;
}

export interface RecordPaymentVariables {
  studentId: UUIDString;
  feePlanId: UUIDString;
  amount: number;
  paymentDate: DateString;
  paymentMode: string;
  referenceNumber?: string | null;
  receiptNumber: string;
  remarks?: string | null;
  collectedById: UUIDString;
  branchId: UUIDString;
  receiptYear: number;
  branchCode: string;
  receiptSequence: number;
  academicYear?: number | null;
  actorRole?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
}

export interface RecordStudentPromotionData {
  studentPromotionHistory_insert: StudentPromotionHistory_Key;
}

export interface RecordStudentPromotionVariables {
  branchId: UUIDString;
  studentId: UUIDString;
  fromClassId: UUIDString;
  fromSectionId: UUIDString;
  toClassId?: UUIDString | null;
  toSectionId?: UUIDString | null;
  promotionStatus: string;
  academicYear: number;
  remarks?: string | null;
}

export interface RemoveClassTeacherAssignmentData {
  teacherSectionAssignment_update?: TeacherSectionAssignment_Key | null;
  section_update?: Section_Key | null;
  auditLog_insert: AuditLog_Key;
  roleAuditLog_insert: AuditLog_Key;
}

export interface RemoveClassTeacherAssignmentVariables {
  assignmentId: UUIDString;
  sectionId: UUIDString;
  teacherId: UUIDString;
  branchId: UUIDString;
  sectionAuditId: string;
  teacherAuditId: string;
}

export interface RemoveLegacyClassTeacherAssignmentData {
  section_update?: Section_Key | null;
  auditLog_insert: AuditLog_Key;
  roleAuditLog_insert: AuditLog_Key;
}

export interface RemoveLegacyClassTeacherAssignmentVariables {
  sectionId: UUIDString;
  teacherUserId: UUIDString;
  branchId: UUIDString;
  sectionAuditId: string;
  teacherAuditId: string;
}

export interface RemoveSectionData {
  section_update?: Section_Key | null;
}

export interface RemoveSectionVariables {
  id: UUIDString;
}

export interface RespondToSuggestionData {
  suggestion_update?: Suggestion_Key | null;
}

export interface RespondToSuggestionVariables {
  id: UUIDString;
  response: string;
  status: string;
}

export interface ReversePaymentData {
  feePayment_update?: FeePayment_Key | null;
  feeAuditLog_insert: FeeAuditLog_Key;
}

export interface ReversePaymentVariables {
  paymentId: UUIDString;
  studentId: UUIDString;
  branchId: UUIDString;
  reversedById: UUIDString;
  reason?: string | null;
  actorRole?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
}

export interface SearchStudentsData {
  students: ({
    id: UUIDString;
    studentId: string;
    fullName: string;
    branchId: UUIDString;
    wingId?: UUIDString | null;
    academicClassId: UUIDString;
    sectionId: UUIDString;
    parentId: UUIDString;
    phoneNumber?: string | null;
    admissionDate: DateString;
    status: string;
    academicClass: {
      id: UUIDString;
      name: string;
      wing: {
        code: string;
        name: string;
      };
    } & AcademicClass_Key;
    section: {
      id: UUIDString;
      name: string;
      academicYear: number;
      classTeacher?: {
        id: UUIDString;
        fullName: string;
        phoneNumber: string;
      } & User_Key;
    } & Section_Key;
    parent: {
      id: UUIDString;
      fatherName?: string | null;
      motherName?: string | null;
      phoneNumber: string;
    } & Parent_Key;
  } & Student_Key)[];
}

export interface SearchStudentsVariables {
  branchId: UUIDString;
  searchText: string;
  limit?: number | null;
}

export interface Section_Key {
  id: UUIDString;
  __typename?: 'Section_Key';
}

export interface SeedAcademicClassData {
  academicClass_insert: AcademicClass_Key;
}

export interface SeedAcademicClassVariables {
  branchId: UUIDString;
  wingId: UUIDString;
  name: string;
  classCode: string;
  sortOrder: number;
  isActive: boolean;
}

export interface StaffIdSequence_Key {
  joiningYear: number;
  branchCode: string;
  staffType: string;
  __typename?: 'StaffIdSequence_Key';
}

export interface StudentAcademicHistory_Key {
  studentId: UUIDString;
  academicYear: number;
  __typename?: 'StudentAcademicHistory_Key';
}

export interface StudentFeeItem_Key {
  id: UUIDString;
  __typename?: 'StudentFeeItem_Key';
}

export interface StudentFeePlan_Key {
  id: UUIDString;
  __typename?: 'StudentFeePlan_Key';
}

export interface StudentFee_Key {
  id: UUIDString;
  __typename?: 'StudentFee_Key';
}

export interface StudentIdSequence_Key {
  admissionYear: number;
  branchCode: string;
  __typename?: 'StudentIdSequence_Key';
}

export interface StudentMark_Key {
  subjectName: string;
  examId: UUIDString;
  studentId: UUIDString;
  __typename?: 'StudentMark_Key';
}

export interface StudentParent_Key {
  studentId: UUIDString;
  userId: UUIDString;
  relationship: string;
  __typename?: 'StudentParent_Key';
}

export interface StudentPromotionHistory_Key {
  id: UUIDString;
  __typename?: 'StudentPromotionHistory_Key';
}

export interface StudentSectionHistory_Key {
  id: UUIDString;
  __typename?: 'StudentSectionHistory_Key';
}

export interface StudentSequence_Key {
  year: number;
  branchCode: string;
  __typename?: 'StudentSequence_Key';
}

export interface Student_Key {
  id: UUIDString;
  __typename?: 'Student_Key';
}

export interface Subject_Key {
  id: UUIDString;
  __typename?: 'Subject_Key';
}

export interface Suggestion_Key {
  id: UUIDString;
  __typename?: 'Suggestion_Key';
}

export interface SwitchRoleData {
  user_update?: User_Key | null;
  auditLog_insert: AuditLog_Key;
}

export interface SwitchRoleVariables {
  userId: UUIDString;
  oldRole: string;
  newRole: string;
}

export interface TeacherAssignment_Key {
  id: UUIDString;
  __typename?: 'TeacherAssignment_Key';
}

export interface TeacherSectionAssignment_Key {
  id: UUIDString;
  __typename?: 'TeacherSectionAssignment_Key';
}

export interface TeacherSubject_Key {
  id: UUIDString;
  __typename?: 'TeacherSubject_Key';
}

export interface TeacherTransferHistory_Key {
  id: UUIDString;
  __typename?: 'TeacherTransferHistory_Key';
}

export interface Teacher_Key {
  id: UUIDString;
  __typename?: 'Teacher_Key';
}

export interface TimetableArchive_Key {
  id: UUIDString;
  __typename?: 'TimetableArchive_Key';
}

export interface TimetablePeriod_Key {
  sectionId: UUIDString;
  day: string;
  periodNum: number;
  __typename?: 'TimetablePeriod_Key';
}

export interface ToggleNoticePinData {
  notice_update?: Notice_Key | null;
}

export interface ToggleNoticePinVariables {
  id: UUIDString;
  pinned: boolean;
}

export interface UnpublishExamSectionData {
  examSection_update?: ExamSection_Key | null;
}

export interface UnpublishExamSectionVariables {
  examSectionId: UUIDString;
}

export interface UnpublishTimetableSectionData {
  timetablePeriod_updateMany: number;
}

export interface UnpublishTimetableSectionVariables {
  sectionId: UUIDString;
  branchId: UUIDString;
}

export interface UpdateAcademicYearData {
  academicYear_update?: AcademicYear_Key | null;
}

export interface UpdateAcademicYearVariables {
  id: UUIDString;
  name: string;
  startDate: DateString;
  endDate: DateString;
}

export interface UpdateAccountantData {
  user_update?: User_Key | null;
  accountant_update?: Accountant_Key | null;
}

export interface UpdateAccountantVariables {
  accountantId: UUIDString;
  userId: UUIDString;
  branchId: UUIDString;
  fullName: string;
  countryCode: string;
  phoneNumber: string;
  email?: string | null;
  gender: string;
  joiningDate: DateString;
  designation: string;
  qualification?: string | null;
  experience?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  emergencyContact?: string | null;
  bloodGroup?: string | null;
  isActive: boolean;
}

export interface UpdateAttendanceData {
  attendance_update?: Attendance_Key | null;
  auditLog_insert: AuditLog_Key;
}

export interface UpdateAttendanceVariables {
  id: UUIDString;
  status: string;
  editedById: UUIDString;
  remarks?: string | null;
}

export interface UpdateBranchData {
  branch_update?: Branch_Key | null;
}

export interface UpdateBranchVariables {
  id: UUIDString;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  status: string;
  isActive: boolean;
}

export interface UpdateClassFeeData {
  academicYearFeeTemplate_update?: AcademicYearFeeTemplate_Key | null;
}

export interface UpdateClassFeeVariables {
  classFeeId: UUIDString;
  branchId: UUIDString;
  academicClassId: UUIDString;
  academicYear: number;
  term1Fee: number;
  term2Fee: number;
  term3Fee: number;
  totalTuitionFee: number;
  applyToFuture: boolean;
  status: string;
}

export interface UpdateClassTeacherAssignmentData {
  teacherSectionAssignment_update?: TeacherSectionAssignment_Key | null;
  oldSection_update?: Section_Key | null;
  staleAssignment_clean: number;
  teacherSectionAssignment_insert: TeacherSectionAssignment_Key;
  section_update?: Section_Key | null;
  userRole_upsert: UserRole_Key;
  auditLog_insert: AuditLog_Key;
  roleAuditLog_insert: AuditLog_Key;
}

export interface UpdateClassTeacherAssignmentVariables {
  assignmentId: UUIDString;
  oldSectionId: UUIDString;
  sectionId: UUIDString;
  teacherId: UUIDString;
  teacherUserId: UUIDString;
  branchId: UUIDString;
  oldTeacherId?: UUIDString | null;
  sectionAuditId: string;
  teacherAuditId: string;
  oldTeacherAuditId?: string | null;
}

export interface UpdateExamData {
  exam_update?: Exam_Key | null;
}

export interface UpdateExamVariables {
  id: UUIDString;
  name: string;
  examType: string;
  startDate?: DateString | null;
  endDate?: DateString | null;
  remarks?: string | null;
}

export interface UpdateFcmTokenData {
  user_update?: User_Key | null;
}

export interface UpdateFcmTokenVariables {
  userId: UUIDString;
  fcmToken?: string | null;
}

export interface UpdateFeeCategoryData {
  feeCategory_update?: FeeCategory_Key | null;
}

export interface UpdateFeeCategoryVariables {
  categoryId: UUIDString;
  name: string;
  status: string;
}

export interface UpdateFeePlanData {
  studentFeePlan_update?: StudentFeePlan_Key | null;
  feeAuditLog_insert: FeeAuditLog_Key;
}

export interface UpdateFeePlanVariables {
  feePlanId: UUIDString;
  studentId: UUIDString;
  classFeeTemplateId?: UUIDString | null;
  term1Fee?: number;
  term2Fee?: number;
  term3Fee?: number;
  booksFee?: number;
  transportFee?: number;
  concessionType?: string | null;
  concessionValue?: number;
  concessionAmount?: number;
  grossAmount?: number;
  totalAmount: number;
  previousYearDue?: number;
  carryForwardAmount?: number;
  isActive: boolean;
  branchId: UUIDString;
  updatedById: UUIDString;
  actorRole?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
}

export interface UpdateHolidayData {
  holiday_update?: Holiday_Key | null;
  auditLog_insert: AuditLog_Key;
}

export interface UpdateHolidayVariables {
  id: UUIDString;
  name: string;
  date: DateString;
  type: string;
  description?: string | null;
  updatedById: UUIDString;
}

export interface UpdateNoticeData {
  notice_update?: Notice_Key | null;
}

export interface UpdateNoticeVariables {
  id: UUIDString;
  title: string;
  body: string;
  category: string;
  pinned: boolean;
}

export interface UpdatePaymentData {
  feePayment_update?: FeePayment_Key | null;
  feeAuditLog_insert: FeeAuditLog_Key;
}

export interface UpdatePaymentVariables {
  paymentId: UUIDString;
  studentId: UUIDString;
  branchId: UUIDString;
  amount: number;
  paymentDate: DateString;
  paymentMode: string;
  referenceNumber?: string | null;
  remarks?: string | null;
  updatedById: UUIDString;
  actorRole?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
}

export interface UpdateStudentData {
  student_update?: Student_Key | null;
  parent_update?: Parent_Key | null;
  auditLog_insert: AuditLog_Key;
}

export interface UpdateStudentVariables {
  studentId: UUIDString;
  parentId: UUIDString;
  branchId: UUIDString;
  fullName: string;
  gender?: string | null;
  dateOfBirth?: DateString | null;
  photoUrl?: string | null;
  aadhaarNumber?: string | null;
  apaarId?: string | null;
  bloodGroup?: string | null;
  academicClassId: UUIDString;
  sectionId: UUIDString;
  countryCode?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  emergencyContact?: string | null;
  transportRequired?: boolean | null;
  admissionDate: DateString;
  fatherName?: string | null;
  motherName?: string | null;
  parentPhoneNumber?: string | null;
  transferCertificateUrl?: string | null;
  birthCertificateUrl?: string | null;
}

export interface UpdateTeacherData {
  user_update?: User_Key | null;
  teacher_update?: Teacher_Key | null;
  auditLog_insert: AuditLog_Key;
}

export interface UpdateTeacherVariables {
  teacherId: UUIDString;
  userId: UUIDString;
  fullName: string;
  countryCode: string;
  phoneNumber: string;
  alternateMobileNumber?: string | null;
  email?: string | null;
  dateOfBirth?: DateString | null;
  gender: string;
  joiningDate: DateString;
  designation: string;
  qualification?: string | null;
  experience?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  emergencyContact?: string | null;
  bloodGroup?: string | null;
  branchId: UUIDString;
  isActive: boolean;
}

export interface UploadFeePaymentData {
  payment_insert: Payment_Key;
}

export interface UploadFeePaymentVariables {
  studentId: UUIDString;
  studentFeeId: UUIDString;
  amount: number;
  paymentMode: string;
  receiptNumber?: string | null;
  uploadedById: UUIDString;
  remarks?: string | null;
}

export interface UpsertAttendanceSummaryData {
  attendanceSummary_upsert: AttendanceSummary_Key;
}

export interface UpsertAttendanceSummaryVariables {
  studentId: UUIDString;
  branchId: UUIDString;
  sectionId: UUIDString;
  academicYearId: UUIDString;
  yearMonth: string;
  totalWorkingDays: number;
  effectiveDays: number;
  presentCount: number;
  absentCount: number;
  halfDayCount: number;
  lateCount: number;
  medicalLeaveCount: number;
  approvedLeaveCount: number;
  holidayCount: number;
  sundayCount: number;
  attendancePct: number;
  academicYearPct: number;
}

export interface UpsertExamSubjectConfigData {
  examSubjectConfig_upsert: ExamSubjectConfig_Key;
}

export interface UpsertExamSubjectConfigVariables {
  examId: UUIDString;
  academicClassId: UUIDString;
  branchId: UUIDString;
  subjectName: string;
  maxMarks: number;
  passingMarks: number;
  examDate?: DateString | null;
}

export interface UpsertStudentMarkData {
  studentMark_upsert: StudentMark_Key;
}

export interface UpsertStudentMarkVariables {
  examId: UUIDString;
  studentId: UUIDString;
  sectionId: UUIDString;
  branchId: UUIDString;
  academicYearId: UUIDString;
  subjectName: string;
  marksObtained?: number | null;
  isAbsent: boolean;
  enteredById: UUIDString;
}

export interface UpsertTimetablePeriodData {
  timetablePeriod_upsert: TimetablePeriod_Key;
}

export interface UpsertTimetablePeriodFullData {
  timetablePeriod_upsert: TimetablePeriod_Key;
}

export interface UpsertTimetablePeriodFullVariables {
  sectionId: UUIDString;
  branchId: UUIDString;
  day: string;
  periodNum: number;
  subject?: string | null;
  teacherId?: UUIDString | null;
  teacherName?: string | null;
  room?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  status?: string | null;
  timetableType?: string | null;
}

export interface UpsertTimetablePeriodVariables {
  sectionId: UUIDString;
  branchId: UUIDString;
  day: string;
  periodNum: number;
  subject?: string | null;
  teacherId?: UUIDString | null;
  teacherName?: string | null;
  room?: string | null;
}

export interface UserRole_Key {
  userId: UUIDString;
  role: string;
  __typename?: 'UserRole_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface Wing_Key {
  id: UUIDString;
  __typename?: 'Wing_Key';
}

interface CreateBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBranchVariables): MutationRef<CreateBranchData, CreateBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateBranchVariables): MutationRef<CreateBranchData, CreateBranchVariables>;
  operationName: string;
}
export const createBranchRef: CreateBranchRef;

export function createBranch(vars: CreateBranchVariables): MutationPromise<CreateBranchData, CreateBranchVariables>;
export function createBranch(dc: DataConnect, vars: CreateBranchVariables): MutationPromise<CreateBranchData, CreateBranchVariables>;

interface UpdateBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateBranchVariables): MutationRef<UpdateBranchData, UpdateBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateBranchVariables): MutationRef<UpdateBranchData, UpdateBranchVariables>;
  operationName: string;
}
export const updateBranchRef: UpdateBranchRef;

export function updateBranch(vars: UpdateBranchVariables): MutationPromise<UpdateBranchData, UpdateBranchVariables>;
export function updateBranch(dc: DataConnect, vars: UpdateBranchVariables): MutationPromise<UpdateBranchData, UpdateBranchVariables>;

interface AssignBranchAdminRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AssignBranchAdminVariables): MutationRef<AssignBranchAdminData, AssignBranchAdminVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AssignBranchAdminVariables): MutationRef<AssignBranchAdminData, AssignBranchAdminVariables>;
  operationName: string;
}
export const assignBranchAdminRef: AssignBranchAdminRef;

export function assignBranchAdmin(vars: AssignBranchAdminVariables): MutationPromise<AssignBranchAdminData, AssignBranchAdminVariables>;
export function assignBranchAdmin(dc: DataConnect, vars: AssignBranchAdminVariables): MutationPromise<AssignBranchAdminData, AssignBranchAdminVariables>;

interface AssignPrincipalRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AssignPrincipalVariables): MutationRef<AssignPrincipalData, AssignPrincipalVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AssignPrincipalVariables): MutationRef<AssignPrincipalData, AssignPrincipalVariables>;
  operationName: string;
}
export const assignPrincipalRef: AssignPrincipalRef;

export function assignPrincipal(vars: AssignPrincipalVariables): MutationPromise<AssignPrincipalData, AssignPrincipalVariables>;
export function assignPrincipal(dc: DataConnect, vars: AssignPrincipalVariables): MutationPromise<AssignPrincipalData, AssignPrincipalVariables>;

interface CreateClassRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateClassVariables): MutationRef<CreateClassData, CreateClassVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateClassVariables): MutationRef<CreateClassData, CreateClassVariables>;
  operationName: string;
}
export const createClassRef: CreateClassRef;

export function createClass(vars: CreateClassVariables): MutationPromise<CreateClassData, CreateClassVariables>;
export function createClass(dc: DataConnect, vars: CreateClassVariables): MutationPromise<CreateClassData, CreateClassVariables>;

interface ActivateClassRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ActivateClassVariables): MutationRef<ActivateClassData, ActivateClassVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ActivateClassVariables): MutationRef<ActivateClassData, ActivateClassVariables>;
  operationName: string;
}
export const activateClassRef: ActivateClassRef;

export function activateClass(vars: ActivateClassVariables): MutationPromise<ActivateClassData, ActivateClassVariables>;
export function activateClass(dc: DataConnect, vars: ActivateClassVariables): MutationPromise<ActivateClassData, ActivateClassVariables>;

interface DeactivateClassRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeactivateClassVariables): MutationRef<DeactivateClassData, DeactivateClassVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeactivateClassVariables): MutationRef<DeactivateClassData, DeactivateClassVariables>;
  operationName: string;
}
export const deactivateClassRef: DeactivateClassRef;

export function deactivateClass(vars: DeactivateClassVariables): MutationPromise<DeactivateClassData, DeactivateClassVariables>;
export function deactivateClass(dc: DataConnect, vars: DeactivateClassVariables): MutationPromise<DeactivateClassData, DeactivateClassVariables>;

interface SeedAcademicClassRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SeedAcademicClassVariables): MutationRef<SeedAcademicClassData, SeedAcademicClassVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SeedAcademicClassVariables): MutationRef<SeedAcademicClassData, SeedAcademicClassVariables>;
  operationName: string;
}
export const seedAcademicClassRef: SeedAcademicClassRef;

export function seedAcademicClass(vars: SeedAcademicClassVariables): MutationPromise<SeedAcademicClassData, SeedAcademicClassVariables>;
export function seedAcademicClass(dc: DataConnect, vars: SeedAcademicClassVariables): MutationPromise<SeedAcademicClassData, SeedAcademicClassVariables>;

interface CreateWingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateWingVariables): MutationRef<CreateWingData, CreateWingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateWingVariables): MutationRef<CreateWingData, CreateWingVariables>;
  operationName: string;
}
export const createWingRef: CreateWingRef;

export function createWing(vars: CreateWingVariables): MutationPromise<CreateWingData, CreateWingVariables>;
export function createWing(dc: DataConnect, vars: CreateWingVariables): MutationPromise<CreateWingData, CreateWingVariables>;

interface CreateSectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSectionVariables): MutationRef<CreateSectionData, CreateSectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateSectionVariables): MutationRef<CreateSectionData, CreateSectionVariables>;
  operationName: string;
}
export const createSectionRef: CreateSectionRef;

export function createSection(vars: CreateSectionVariables): MutationPromise<CreateSectionData, CreateSectionVariables>;
export function createSection(dc: DataConnect, vars: CreateSectionVariables): MutationPromise<CreateSectionData, CreateSectionVariables>;

interface RemoveSectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RemoveSectionVariables): MutationRef<RemoveSectionData, RemoveSectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RemoveSectionVariables): MutationRef<RemoveSectionData, RemoveSectionVariables>;
  operationName: string;
}
export const removeSectionRef: RemoveSectionRef;

export function removeSection(vars: RemoveSectionVariables): MutationPromise<RemoveSectionData, RemoveSectionVariables>;
export function removeSection(dc: DataConnect, vars: RemoveSectionVariables): MutationPromise<RemoveSectionData, RemoveSectionVariables>;

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface ClaimUserFirebaseUidRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ClaimUserFirebaseUidVariables): MutationRef<ClaimUserFirebaseUidData, ClaimUserFirebaseUidVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ClaimUserFirebaseUidVariables): MutationRef<ClaimUserFirebaseUidData, ClaimUserFirebaseUidVariables>;
  operationName: string;
}
export const claimUserFirebaseUidRef: ClaimUserFirebaseUidRef;

export function claimUserFirebaseUid(vars: ClaimUserFirebaseUidVariables): MutationPromise<ClaimUserFirebaseUidData, ClaimUserFirebaseUidVariables>;
export function claimUserFirebaseUid(dc: DataConnect, vars: ClaimUserFirebaseUidVariables): MutationPromise<ClaimUserFirebaseUidData, ClaimUserFirebaseUidVariables>;

interface EnsureCurrentUserLegacyRoleRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<EnsureCurrentUserLegacyRoleData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<EnsureCurrentUserLegacyRoleData, undefined>;
  operationName: string;
}
export const ensureCurrentUserLegacyRoleRef: EnsureCurrentUserLegacyRoleRef;

export function ensureCurrentUserLegacyRole(): MutationPromise<EnsureCurrentUserLegacyRoleData, undefined>;
export function ensureCurrentUserLegacyRole(dc: DataConnect): MutationPromise<EnsureCurrentUserLegacyRoleData, undefined>;

interface AddParentRoleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddParentRoleVariables): MutationRef<AddParentRoleData, AddParentRoleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddParentRoleVariables): MutationRef<AddParentRoleData, AddParentRoleVariables>;
  operationName: string;
}
export const addParentRoleRef: AddParentRoleRef;

export function addParentRole(vars: AddParentRoleVariables): MutationPromise<AddParentRoleData, AddParentRoleVariables>;
export function addParentRole(dc: DataConnect, vars: AddParentRoleVariables): MutationPromise<AddParentRoleData, AddParentRoleVariables>;

interface SwitchRoleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SwitchRoleVariables): MutationRef<SwitchRoleData, SwitchRoleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SwitchRoleVariables): MutationRef<SwitchRoleData, SwitchRoleVariables>;
  operationName: string;
}
export const switchRoleRef: SwitchRoleRef;

export function switchRole(vars: SwitchRoleVariables): MutationPromise<SwitchRoleData, SwitchRoleVariables>;
export function switchRole(dc: DataConnect, vars: SwitchRoleVariables): MutationPromise<SwitchRoleData, SwitchRoleVariables>;

interface LinkParentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: LinkParentUserVariables): MutationRef<LinkParentUserData, LinkParentUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: LinkParentUserVariables): MutationRef<LinkParentUserData, LinkParentUserVariables>;
  operationName: string;
}
export const linkParentUserRef: LinkParentUserRef;

export function linkParentUser(vars: LinkParentUserVariables): MutationPromise<LinkParentUserData, LinkParentUserVariables>;
export function linkParentUser(dc: DataConnect, vars: LinkParentUserVariables): MutationPromise<LinkParentUserData, LinkParentUserVariables>;

interface LinkStudentParentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: LinkStudentParentVariables): MutationRef<LinkStudentParentData, LinkStudentParentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: LinkStudentParentVariables): MutationRef<LinkStudentParentData, LinkStudentParentVariables>;
  operationName: string;
}
export const linkStudentParentRef: LinkStudentParentRef;

export function linkStudentParent(vars: LinkStudentParentVariables): MutationPromise<LinkStudentParentData, LinkStudentParentVariables>;
export function linkStudentParent(dc: DataConnect, vars: LinkStudentParentVariables): MutationPromise<LinkStudentParentData, LinkStudentParentVariables>;

interface CreateParentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateParentVariables): MutationRef<CreateParentData, CreateParentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateParentVariables): MutationRef<CreateParentData, CreateParentVariables>;
  operationName: string;
}
export const createParentRef: CreateParentRef;

export function createParent(vars: CreateParentVariables): MutationPromise<CreateParentData, CreateParentVariables>;
export function createParent(dc: DataConnect, vars: CreateParentVariables): MutationPromise<CreateParentData, CreateParentVariables>;

interface CreateParentWithoutUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateParentWithoutUserVariables): MutationRef<CreateParentWithoutUserData, CreateParentWithoutUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateParentWithoutUserVariables): MutationRef<CreateParentWithoutUserData, CreateParentWithoutUserVariables>;
  operationName: string;
}
export const createParentWithoutUserRef: CreateParentWithoutUserRef;

export function createParentWithoutUser(vars: CreateParentWithoutUserVariables): MutationPromise<CreateParentWithoutUserData, CreateParentWithoutUserVariables>;
export function createParentWithoutUser(dc: DataConnect, vars: CreateParentWithoutUserVariables): MutationPromise<CreateParentWithoutUserData, CreateParentWithoutUserVariables>;

interface CreateStudentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateStudentVariables): MutationRef<CreateStudentData, CreateStudentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateStudentVariables): MutationRef<CreateStudentData, CreateStudentVariables>;
  operationName: string;
}
export const createStudentRef: CreateStudentRef;

export function createStudent(vars: CreateStudentVariables): MutationPromise<CreateStudentData, CreateStudentVariables>;
export function createStudent(dc: DataConnect, vars: CreateStudentVariables): MutationPromise<CreateStudentData, CreateStudentVariables>;

interface UpdateStudentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateStudentVariables): MutationRef<UpdateStudentData, UpdateStudentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateStudentVariables): MutationRef<UpdateStudentData, UpdateStudentVariables>;
  operationName: string;
}
export const updateStudentRef: UpdateStudentRef;

export function updateStudent(vars: UpdateStudentVariables): MutationPromise<UpdateStudentData, UpdateStudentVariables>;
export function updateStudent(dc: DataConnect, vars: UpdateStudentVariables): MutationPromise<UpdateStudentData, UpdateStudentVariables>;

interface CreateAttendanceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAttendanceVariables): MutationRef<CreateAttendanceData, CreateAttendanceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAttendanceVariables): MutationRef<CreateAttendanceData, CreateAttendanceVariables>;
  operationName: string;
}
export const createAttendanceRef: CreateAttendanceRef;

export function createAttendance(vars: CreateAttendanceVariables): MutationPromise<CreateAttendanceData, CreateAttendanceVariables>;
export function createAttendance(dc: DataConnect, vars: CreateAttendanceVariables): MutationPromise<CreateAttendanceData, CreateAttendanceVariables>;

interface UpdateAttendanceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAttendanceVariables): MutationRef<UpdateAttendanceData, UpdateAttendanceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateAttendanceVariables): MutationRef<UpdateAttendanceData, UpdateAttendanceVariables>;
  operationName: string;
}
export const updateAttendanceRef: UpdateAttendanceRef;

export function updateAttendance(vars: UpdateAttendanceVariables): MutationPromise<UpdateAttendanceData, UpdateAttendanceVariables>;
export function updateAttendance(dc: DataConnect, vars: UpdateAttendanceVariables): MutationPromise<UpdateAttendanceData, UpdateAttendanceVariables>;

interface UploadFeePaymentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UploadFeePaymentVariables): MutationRef<UploadFeePaymentData, UploadFeePaymentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UploadFeePaymentVariables): MutationRef<UploadFeePaymentData, UploadFeePaymentVariables>;
  operationName: string;
}
export const uploadFeePaymentRef: UploadFeePaymentRef;

export function uploadFeePayment(vars: UploadFeePaymentVariables): MutationPromise<UploadFeePaymentData, UploadFeePaymentVariables>;
export function uploadFeePayment(dc: DataConnect, vars: UploadFeePaymentVariables): MutationPromise<UploadFeePaymentData, UploadFeePaymentVariables>;

interface AssignTeacherRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AssignTeacherVariables): MutationRef<AssignTeacherData, AssignTeacherVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AssignTeacherVariables): MutationRef<AssignTeacherData, AssignTeacherVariables>;
  operationName: string;
}
export const assignTeacherRef: AssignTeacherRef;

export function assignTeacher(vars: AssignTeacherVariables): MutationPromise<AssignTeacherData, AssignTeacherVariables>;
export function assignTeacher(dc: DataConnect, vars: AssignTeacherVariables): MutationPromise<AssignTeacherData, AssignTeacherVariables>;

interface CreateCoordinatorRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCoordinatorVariables): MutationRef<CreateCoordinatorData, CreateCoordinatorVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCoordinatorVariables): MutationRef<CreateCoordinatorData, CreateCoordinatorVariables>;
  operationName: string;
}
export const createCoordinatorRef: CreateCoordinatorRef;

export function createCoordinator(vars: CreateCoordinatorVariables): MutationPromise<CreateCoordinatorData, CreateCoordinatorVariables>;
export function createCoordinator(dc: DataConnect, vars: CreateCoordinatorVariables): MutationPromise<CreateCoordinatorData, CreateCoordinatorVariables>;

interface CreateTeacherRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTeacherVariables): MutationRef<CreateTeacherData, CreateTeacherVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTeacherVariables): MutationRef<CreateTeacherData, CreateTeacherVariables>;
  operationName: string;
}
export const createTeacherRef: CreateTeacherRef;

export function createTeacher(vars: CreateTeacherVariables): MutationPromise<CreateTeacherData, CreateTeacherVariables>;
export function createTeacher(dc: DataConnect, vars: CreateTeacherVariables): MutationPromise<CreateTeacherData, CreateTeacherVariables>;

interface AssignTeacherClassTeacherRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AssignTeacherClassTeacherVariables): MutationRef<AssignTeacherClassTeacherData, AssignTeacherClassTeacherVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AssignTeacherClassTeacherVariables): MutationRef<AssignTeacherClassTeacherData, AssignTeacherClassTeacherVariables>;
  operationName: string;
}
export const assignTeacherClassTeacherRef: AssignTeacherClassTeacherRef;

export function assignTeacherClassTeacher(vars: AssignTeacherClassTeacherVariables): MutationPromise<AssignTeacherClassTeacherData, AssignTeacherClassTeacherVariables>;
export function assignTeacherClassTeacher(dc: DataConnect, vars: AssignTeacherClassTeacherVariables): MutationPromise<AssignTeacherClassTeacherData, AssignTeacherClassTeacherVariables>;

interface UpdateTeacherRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTeacherVariables): MutationRef<UpdateTeacherData, UpdateTeacherVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTeacherVariables): MutationRef<UpdateTeacherData, UpdateTeacherVariables>;
  operationName: string;
}
export const updateTeacherRef: UpdateTeacherRef;

export function updateTeacher(vars: UpdateTeacherVariables): MutationPromise<UpdateTeacherData, UpdateTeacherVariables>;
export function updateTeacher(dc: DataConnect, vars: UpdateTeacherVariables): MutationPromise<UpdateTeacherData, UpdateTeacherVariables>;

interface AssignClassTeacherRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AssignClassTeacherVariables): MutationRef<AssignClassTeacherData, AssignClassTeacherVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AssignClassTeacherVariables): MutationRef<AssignClassTeacherData, AssignClassTeacherVariables>;
  operationName: string;
}
export const assignClassTeacherRef: AssignClassTeacherRef;

export function assignClassTeacher(vars: AssignClassTeacherVariables): MutationPromise<AssignClassTeacherData, AssignClassTeacherVariables>;
export function assignClassTeacher(dc: DataConnect, vars: AssignClassTeacherVariables): MutationPromise<AssignClassTeacherData, AssignClassTeacherVariables>;

interface CreateSubjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSubjectVariables): MutationRef<CreateSubjectData, CreateSubjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateSubjectVariables): MutationRef<CreateSubjectData, CreateSubjectVariables>;
  operationName: string;
}
export const createSubjectRef: CreateSubjectRef;

export function createSubject(vars: CreateSubjectVariables): MutationPromise<CreateSubjectData, CreateSubjectVariables>;
export function createSubject(dc: DataConnect, vars: CreateSubjectVariables): MutationPromise<CreateSubjectData, CreateSubjectVariables>;

interface AssignTeacherSubjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AssignTeacherSubjectVariables): MutationRef<AssignTeacherSubjectData, AssignTeacherSubjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AssignTeacherSubjectVariables): MutationRef<AssignTeacherSubjectData, AssignTeacherSubjectVariables>;
  operationName: string;
}
export const assignTeacherSubjectRef: AssignTeacherSubjectRef;

export function assignTeacherSubject(vars: AssignTeacherSubjectVariables): MutationPromise<AssignTeacherSubjectData, AssignTeacherSubjectVariables>;
export function assignTeacherSubject(dc: DataConnect, vars: AssignTeacherSubjectVariables): MutationPromise<AssignTeacherSubjectData, AssignTeacherSubjectVariables>;

interface ClearTeacherSubjectsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ClearTeacherSubjectsVariables): MutationRef<ClearTeacherSubjectsData, ClearTeacherSubjectsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ClearTeacherSubjectsVariables): MutationRef<ClearTeacherSubjectsData, ClearTeacherSubjectsVariables>;
  operationName: string;
}
export const clearTeacherSubjectsRef: ClearTeacherSubjectsRef;

export function clearTeacherSubjects(vars: ClearTeacherSubjectsVariables): MutationPromise<ClearTeacherSubjectsData, ClearTeacherSubjectsVariables>;
export function clearTeacherSubjects(dc: DataConnect, vars: ClearTeacherSubjectsVariables): MutationPromise<ClearTeacherSubjectsData, ClearTeacherSubjectsVariables>;

interface CreateAccountantRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAccountantVariables): MutationRef<CreateAccountantData, CreateAccountantVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAccountantVariables): MutationRef<CreateAccountantData, CreateAccountantVariables>;
  operationName: string;
}
export const createAccountantRef: CreateAccountantRef;

export function createAccountant(vars: CreateAccountantVariables): MutationPromise<CreateAccountantData, CreateAccountantVariables>;
export function createAccountant(dc: DataConnect, vars: CreateAccountantVariables): MutationPromise<CreateAccountantData, CreateAccountantVariables>;

interface ClearTeacherWingRestrictionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ClearTeacherWingRestrictionsVariables): MutationRef<ClearTeacherWingRestrictionsData, ClearTeacherWingRestrictionsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ClearTeacherWingRestrictionsVariables): MutationRef<ClearTeacherWingRestrictionsData, ClearTeacherWingRestrictionsVariables>;
  operationName: string;
}
export const clearTeacherWingRestrictionsRef: ClearTeacherWingRestrictionsRef;

export function clearTeacherWingRestrictions(vars: ClearTeacherWingRestrictionsVariables): MutationPromise<ClearTeacherWingRestrictionsData, ClearTeacherWingRestrictionsVariables>;
export function clearTeacherWingRestrictions(dc: DataConnect, vars: ClearTeacherWingRestrictionsVariables): MutationPromise<ClearTeacherWingRestrictionsData, ClearTeacherWingRestrictionsVariables>;

interface EnsureCoordinatorTeacherProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: EnsureCoordinatorTeacherProfileVariables): MutationRef<EnsureCoordinatorTeacherProfileData, EnsureCoordinatorTeacherProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: EnsureCoordinatorTeacherProfileVariables): MutationRef<EnsureCoordinatorTeacherProfileData, EnsureCoordinatorTeacherProfileVariables>;
  operationName: string;
}
export const ensureCoordinatorTeacherProfileRef: EnsureCoordinatorTeacherProfileRef;

export function ensureCoordinatorTeacherProfile(vars: EnsureCoordinatorTeacherProfileVariables): MutationPromise<EnsureCoordinatorTeacherProfileData, EnsureCoordinatorTeacherProfileVariables>;
export function ensureCoordinatorTeacherProfile(dc: DataConnect, vars: EnsureCoordinatorTeacherProfileVariables): MutationPromise<EnsureCoordinatorTeacherProfileData, EnsureCoordinatorTeacherProfileVariables>;

interface UpdateClassTeacherAssignmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateClassTeacherAssignmentVariables): MutationRef<UpdateClassTeacherAssignmentData, UpdateClassTeacherAssignmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateClassTeacherAssignmentVariables): MutationRef<UpdateClassTeacherAssignmentData, UpdateClassTeacherAssignmentVariables>;
  operationName: string;
}
export const updateClassTeacherAssignmentRef: UpdateClassTeacherAssignmentRef;

export function updateClassTeacherAssignment(vars: UpdateClassTeacherAssignmentVariables): MutationPromise<UpdateClassTeacherAssignmentData, UpdateClassTeacherAssignmentVariables>;
export function updateClassTeacherAssignment(dc: DataConnect, vars: UpdateClassTeacherAssignmentVariables): MutationPromise<UpdateClassTeacherAssignmentData, UpdateClassTeacherAssignmentVariables>;

interface RemoveClassTeacherAssignmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RemoveClassTeacherAssignmentVariables): MutationRef<RemoveClassTeacherAssignmentData, RemoveClassTeacherAssignmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RemoveClassTeacherAssignmentVariables): MutationRef<RemoveClassTeacherAssignmentData, RemoveClassTeacherAssignmentVariables>;
  operationName: string;
}
export const removeClassTeacherAssignmentRef: RemoveClassTeacherAssignmentRef;

export function removeClassTeacherAssignment(vars: RemoveClassTeacherAssignmentVariables): MutationPromise<RemoveClassTeacherAssignmentData, RemoveClassTeacherAssignmentVariables>;
export function removeClassTeacherAssignment(dc: DataConnect, vars: RemoveClassTeacherAssignmentVariables): MutationPromise<RemoveClassTeacherAssignmentData, RemoveClassTeacherAssignmentVariables>;

interface RemoveLegacyClassTeacherAssignmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RemoveLegacyClassTeacherAssignmentVariables): MutationRef<RemoveLegacyClassTeacherAssignmentData, RemoveLegacyClassTeacherAssignmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RemoveLegacyClassTeacherAssignmentVariables): MutationRef<RemoveLegacyClassTeacherAssignmentData, RemoveLegacyClassTeacherAssignmentVariables>;
  operationName: string;
}
export const removeLegacyClassTeacherAssignmentRef: RemoveLegacyClassTeacherAssignmentRef;

export function removeLegacyClassTeacherAssignment(vars: RemoveLegacyClassTeacherAssignmentVariables): MutationPromise<RemoveLegacyClassTeacherAssignmentData, RemoveLegacyClassTeacherAssignmentVariables>;
export function removeLegacyClassTeacherAssignment(dc: DataConnect, vars: RemoveLegacyClassTeacherAssignmentVariables): MutationPromise<RemoveLegacyClassTeacherAssignmentData, RemoveLegacyClassTeacherAssignmentVariables>;

interface UpdateAccountantRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAccountantVariables): MutationRef<UpdateAccountantData, UpdateAccountantVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateAccountantVariables): MutationRef<UpdateAccountantData, UpdateAccountantVariables>;
  operationName: string;
}
export const updateAccountantRef: UpdateAccountantRef;

export function updateAccountant(vars: UpdateAccountantVariables): MutationPromise<UpdateAccountantData, UpdateAccountantVariables>;
export function updateAccountant(dc: DataConnect, vars: UpdateAccountantVariables): MutationPromise<UpdateAccountantData, UpdateAccountantVariables>;

interface CreateFeeCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFeeCategoryVariables): MutationRef<CreateFeeCategoryData, CreateFeeCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateFeeCategoryVariables): MutationRef<CreateFeeCategoryData, CreateFeeCategoryVariables>;
  operationName: string;
}
export const createFeeCategoryRef: CreateFeeCategoryRef;

export function createFeeCategory(vars: CreateFeeCategoryVariables): MutationPromise<CreateFeeCategoryData, CreateFeeCategoryVariables>;
export function createFeeCategory(dc: DataConnect, vars: CreateFeeCategoryVariables): MutationPromise<CreateFeeCategoryData, CreateFeeCategoryVariables>;

interface UpdateFeeCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateFeeCategoryVariables): MutationRef<UpdateFeeCategoryData, UpdateFeeCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateFeeCategoryVariables): MutationRef<UpdateFeeCategoryData, UpdateFeeCategoryVariables>;
  operationName: string;
}
export const updateFeeCategoryRef: UpdateFeeCategoryRef;

export function updateFeeCategory(vars: UpdateFeeCategoryVariables): MutationPromise<UpdateFeeCategoryData, UpdateFeeCategoryVariables>;
export function updateFeeCategory(dc: DataConnect, vars: UpdateFeeCategoryVariables): MutationPromise<UpdateFeeCategoryData, UpdateFeeCategoryVariables>;

interface CreateClassFeeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateClassFeeVariables): MutationRef<CreateClassFeeData, CreateClassFeeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateClassFeeVariables): MutationRef<CreateClassFeeData, CreateClassFeeVariables>;
  operationName: string;
}
export const createClassFeeRef: CreateClassFeeRef;

export function createClassFee(vars: CreateClassFeeVariables): MutationPromise<CreateClassFeeData, CreateClassFeeVariables>;
export function createClassFee(dc: DataConnect, vars: CreateClassFeeVariables): MutationPromise<CreateClassFeeData, CreateClassFeeVariables>;

interface UpdateClassFeeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateClassFeeVariables): MutationRef<UpdateClassFeeData, UpdateClassFeeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateClassFeeVariables): MutationRef<UpdateClassFeeData, UpdateClassFeeVariables>;
  operationName: string;
}
export const updateClassFeeRef: UpdateClassFeeRef;

export function updateClassFee(vars: UpdateClassFeeVariables): MutationPromise<UpdateClassFeeData, UpdateClassFeeVariables>;
export function updateClassFee(dc: DataConnect, vars: UpdateClassFeeVariables): MutationPromise<UpdateClassFeeData, UpdateClassFeeVariables>;

interface CreateFeePlanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFeePlanVariables): MutationRef<CreateFeePlanData, CreateFeePlanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateFeePlanVariables): MutationRef<CreateFeePlanData, CreateFeePlanVariables>;
  operationName: string;
}
export const createFeePlanRef: CreateFeePlanRef;

export function createFeePlan(vars: CreateFeePlanVariables): MutationPromise<CreateFeePlanData, CreateFeePlanVariables>;
export function createFeePlan(dc: DataConnect, vars: CreateFeePlanVariables): MutationPromise<CreateFeePlanData, CreateFeePlanVariables>;

interface UpdateFeePlanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateFeePlanVariables): MutationRef<UpdateFeePlanData, UpdateFeePlanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateFeePlanVariables): MutationRef<UpdateFeePlanData, UpdateFeePlanVariables>;
  operationName: string;
}
export const updateFeePlanRef: UpdateFeePlanRef;

export function updateFeePlan(vars: UpdateFeePlanVariables): MutationPromise<UpdateFeePlanData, UpdateFeePlanVariables>;
export function updateFeePlan(dc: DataConnect, vars: UpdateFeePlanVariables): MutationPromise<UpdateFeePlanData, UpdateFeePlanVariables>;

interface ClearFeePlanItemsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ClearFeePlanItemsVariables): MutationRef<ClearFeePlanItemsData, ClearFeePlanItemsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ClearFeePlanItemsVariables): MutationRef<ClearFeePlanItemsData, ClearFeePlanItemsVariables>;
  operationName: string;
}
export const clearFeePlanItemsRef: ClearFeePlanItemsRef;

export function clearFeePlanItems(vars: ClearFeePlanItemsVariables): MutationPromise<ClearFeePlanItemsData, ClearFeePlanItemsVariables>;
export function clearFeePlanItems(dc: DataConnect, vars: ClearFeePlanItemsVariables): MutationPromise<ClearFeePlanItemsData, ClearFeePlanItemsVariables>;

interface CreateFeePlanItemRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFeePlanItemVariables): MutationRef<CreateFeePlanItemData, CreateFeePlanItemVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateFeePlanItemVariables): MutationRef<CreateFeePlanItemData, CreateFeePlanItemVariables>;
  operationName: string;
}
export const createFeePlanItemRef: CreateFeePlanItemRef;

export function createFeePlanItem(vars: CreateFeePlanItemVariables): MutationPromise<CreateFeePlanItemData, CreateFeePlanItemVariables>;
export function createFeePlanItem(dc: DataConnect, vars: CreateFeePlanItemVariables): MutationPromise<CreateFeePlanItemData, CreateFeePlanItemVariables>;

interface RecordPaymentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RecordPaymentVariables): MutationRef<RecordPaymentData, RecordPaymentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RecordPaymentVariables): MutationRef<RecordPaymentData, RecordPaymentVariables>;
  operationName: string;
}
export const recordPaymentRef: RecordPaymentRef;

export function recordPayment(vars: RecordPaymentVariables): MutationPromise<RecordPaymentData, RecordPaymentVariables>;
export function recordPayment(dc: DataConnect, vars: RecordPaymentVariables): MutationPromise<RecordPaymentData, RecordPaymentVariables>;

interface UpdatePaymentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePaymentVariables): MutationRef<UpdatePaymentData, UpdatePaymentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePaymentVariables): MutationRef<UpdatePaymentData, UpdatePaymentVariables>;
  operationName: string;
}
export const updatePaymentRef: UpdatePaymentRef;

export function updatePayment(vars: UpdatePaymentVariables): MutationPromise<UpdatePaymentData, UpdatePaymentVariables>;
export function updatePayment(dc: DataConnect, vars: UpdatePaymentVariables): MutationPromise<UpdatePaymentData, UpdatePaymentVariables>;

interface ReversePaymentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ReversePaymentVariables): MutationRef<ReversePaymentData, ReversePaymentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ReversePaymentVariables): MutationRef<ReversePaymentData, ReversePaymentVariables>;
  operationName: string;
}
export const reversePaymentRef: ReversePaymentRef;

export function reversePayment(vars: ReversePaymentVariables): MutationPromise<ReversePaymentData, ReversePaymentVariables>;
export function reversePayment(dc: DataConnect, vars: ReversePaymentVariables): MutationPromise<ReversePaymentData, ReversePaymentVariables>;

interface RecordAuditLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RecordAuditLogVariables): MutationRef<RecordAuditLogData, RecordAuditLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RecordAuditLogVariables): MutationRef<RecordAuditLogData, RecordAuditLogVariables>;
  operationName: string;
}
export const recordAuditLogRef: RecordAuditLogRef;

export function recordAuditLog(vars: RecordAuditLogVariables): MutationPromise<RecordAuditLogData, RecordAuditLogVariables>;
export function recordAuditLog(dc: DataConnect, vars: RecordAuditLogVariables): MutationPromise<RecordAuditLogData, RecordAuditLogVariables>;

interface CreateNoticeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNoticeVariables): MutationRef<CreateNoticeData, CreateNoticeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNoticeVariables): MutationRef<CreateNoticeData, CreateNoticeVariables>;
  operationName: string;
}
export const createNoticeRef: CreateNoticeRef;

export function createNotice(vars: CreateNoticeVariables): MutationPromise<CreateNoticeData, CreateNoticeVariables>;
export function createNotice(dc: DataConnect, vars: CreateNoticeVariables): MutationPromise<CreateNoticeData, CreateNoticeVariables>;

interface UpdateNoticeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateNoticeVariables): MutationRef<UpdateNoticeData, UpdateNoticeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateNoticeVariables): MutationRef<UpdateNoticeData, UpdateNoticeVariables>;
  operationName: string;
}
export const updateNoticeRef: UpdateNoticeRef;

export function updateNotice(vars: UpdateNoticeVariables): MutationPromise<UpdateNoticeData, UpdateNoticeVariables>;
export function updateNotice(dc: DataConnect, vars: UpdateNoticeVariables): MutationPromise<UpdateNoticeData, UpdateNoticeVariables>;

interface DeleteNoticeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteNoticeVariables): MutationRef<DeleteNoticeData, DeleteNoticeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteNoticeVariables): MutationRef<DeleteNoticeData, DeleteNoticeVariables>;
  operationName: string;
}
export const deleteNoticeRef: DeleteNoticeRef;

export function deleteNotice(vars: DeleteNoticeVariables): MutationPromise<DeleteNoticeData, DeleteNoticeVariables>;
export function deleteNotice(dc: DataConnect, vars: DeleteNoticeVariables): MutationPromise<DeleteNoticeData, DeleteNoticeVariables>;

interface ToggleNoticePinRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ToggleNoticePinVariables): MutationRef<ToggleNoticePinData, ToggleNoticePinVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ToggleNoticePinVariables): MutationRef<ToggleNoticePinData, ToggleNoticePinVariables>;
  operationName: string;
}
export const toggleNoticePinRef: ToggleNoticePinRef;

export function toggleNoticePin(vars: ToggleNoticePinVariables): MutationPromise<ToggleNoticePinData, ToggleNoticePinVariables>;
export function toggleNoticePin(dc: DataConnect, vars: ToggleNoticePinVariables): MutationPromise<ToggleNoticePinData, ToggleNoticePinVariables>;

interface UpsertTimetablePeriodRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertTimetablePeriodVariables): MutationRef<UpsertTimetablePeriodData, UpsertTimetablePeriodVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertTimetablePeriodVariables): MutationRef<UpsertTimetablePeriodData, UpsertTimetablePeriodVariables>;
  operationName: string;
}
export const upsertTimetablePeriodRef: UpsertTimetablePeriodRef;

export function upsertTimetablePeriod(vars: UpsertTimetablePeriodVariables): MutationPromise<UpsertTimetablePeriodData, UpsertTimetablePeriodVariables>;
export function upsertTimetablePeriod(dc: DataConnect, vars: UpsertTimetablePeriodVariables): MutationPromise<UpsertTimetablePeriodData, UpsertTimetablePeriodVariables>;

interface ClearTimetableForSectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ClearTimetableForSectionVariables): MutationRef<ClearTimetableForSectionData, ClearTimetableForSectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ClearTimetableForSectionVariables): MutationRef<ClearTimetableForSectionData, ClearTimetableForSectionVariables>;
  operationName: string;
}
export const clearTimetableForSectionRef: ClearTimetableForSectionRef;

export function clearTimetableForSection(vars: ClearTimetableForSectionVariables): MutationPromise<ClearTimetableForSectionData, ClearTimetableForSectionVariables>;
export function clearTimetableForSection(dc: DataConnect, vars: ClearTimetableForSectionVariables): MutationPromise<ClearTimetableForSectionData, ClearTimetableForSectionVariables>;

interface UpsertTimetablePeriodFullRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertTimetablePeriodFullVariables): MutationRef<UpsertTimetablePeriodFullData, UpsertTimetablePeriodFullVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertTimetablePeriodFullVariables): MutationRef<UpsertTimetablePeriodFullData, UpsertTimetablePeriodFullVariables>;
  operationName: string;
}
export const upsertTimetablePeriodFullRef: UpsertTimetablePeriodFullRef;

export function upsertTimetablePeriodFull(vars: UpsertTimetablePeriodFullVariables): MutationPromise<UpsertTimetablePeriodFullData, UpsertTimetablePeriodFullVariables>;
export function upsertTimetablePeriodFull(dc: DataConnect, vars: UpsertTimetablePeriodFullVariables): MutationPromise<UpsertTimetablePeriodFullData, UpsertTimetablePeriodFullVariables>;

interface PublishTimetableSectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: PublishTimetableSectionVariables): MutationRef<PublishTimetableSectionData, PublishTimetableSectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: PublishTimetableSectionVariables): MutationRef<PublishTimetableSectionData, PublishTimetableSectionVariables>;
  operationName: string;
}
export const publishTimetableSectionRef: PublishTimetableSectionRef;

export function publishTimetableSection(vars: PublishTimetableSectionVariables): MutationPromise<PublishTimetableSectionData, PublishTimetableSectionVariables>;
export function publishTimetableSection(dc: DataConnect, vars: PublishTimetableSectionVariables): MutationPromise<PublishTimetableSectionData, PublishTimetableSectionVariables>;

interface UnpublishTimetableSectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UnpublishTimetableSectionVariables): MutationRef<UnpublishTimetableSectionData, UnpublishTimetableSectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UnpublishTimetableSectionVariables): MutationRef<UnpublishTimetableSectionData, UnpublishTimetableSectionVariables>;
  operationName: string;
}
export const unpublishTimetableSectionRef: UnpublishTimetableSectionRef;

export function unpublishTimetableSection(vars: UnpublishTimetableSectionVariables): MutationPromise<UnpublishTimetableSectionData, UnpublishTimetableSectionVariables>;
export function unpublishTimetableSection(dc: DataConnect, vars: UnpublishTimetableSectionVariables): MutationPromise<UnpublishTimetableSectionData, UnpublishTimetableSectionVariables>;

interface CreateSuggestionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSuggestionVariables): MutationRef<CreateSuggestionData, CreateSuggestionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateSuggestionVariables): MutationRef<CreateSuggestionData, CreateSuggestionVariables>;
  operationName: string;
}
export const createSuggestionRef: CreateSuggestionRef;

export function createSuggestion(vars: CreateSuggestionVariables): MutationPromise<CreateSuggestionData, CreateSuggestionVariables>;
export function createSuggestion(dc: DataConnect, vars: CreateSuggestionVariables): MutationPromise<CreateSuggestionData, CreateSuggestionVariables>;

interface RespondToSuggestionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RespondToSuggestionVariables): MutationRef<RespondToSuggestionData, RespondToSuggestionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RespondToSuggestionVariables): MutationRef<RespondToSuggestionData, RespondToSuggestionVariables>;
  operationName: string;
}
export const respondToSuggestionRef: RespondToSuggestionRef;

export function respondToSuggestion(vars: RespondToSuggestionVariables): MutationPromise<RespondToSuggestionData, RespondToSuggestionVariables>;
export function respondToSuggestion(dc: DataConnect, vars: RespondToSuggestionVariables): MutationPromise<RespondToSuggestionData, RespondToSuggestionVariables>;

interface CreateNotificationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNotificationVariables): MutationRef<CreateNotificationData, CreateNotificationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNotificationVariables): MutationRef<CreateNotificationData, CreateNotificationVariables>;
  operationName: string;
}
export const createNotificationRef: CreateNotificationRef;

export function createNotification(vars: CreateNotificationVariables): MutationPromise<CreateNotificationData, CreateNotificationVariables>;
export function createNotification(dc: DataConnect, vars: CreateNotificationVariables): MutationPromise<CreateNotificationData, CreateNotificationVariables>;

interface DeleteNotificationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteNotificationVariables): MutationRef<DeleteNotificationData, DeleteNotificationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteNotificationVariables): MutationRef<DeleteNotificationData, DeleteNotificationVariables>;
  operationName: string;
}
export const deleteNotificationRef: DeleteNotificationRef;

export function deleteNotification(vars: DeleteNotificationVariables): MutationPromise<DeleteNotificationData, DeleteNotificationVariables>;
export function deleteNotification(dc: DataConnect, vars: DeleteNotificationVariables): MutationPromise<DeleteNotificationData, DeleteNotificationVariables>;

interface MarkNotificationReadRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: MarkNotificationReadVariables): MutationRef<MarkNotificationReadData, MarkNotificationReadVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: MarkNotificationReadVariables): MutationRef<MarkNotificationReadData, MarkNotificationReadVariables>;
  operationName: string;
}
export const markNotificationReadRef: MarkNotificationReadRef;

export function markNotificationRead(vars: MarkNotificationReadVariables): MutationPromise<MarkNotificationReadData, MarkNotificationReadVariables>;
export function markNotificationRead(dc: DataConnect, vars: MarkNotificationReadVariables): MutationPromise<MarkNotificationReadData, MarkNotificationReadVariables>;

interface MarkAllNotificationsReadRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: MarkAllNotificationsReadVariables): MutationRef<MarkAllNotificationsReadData, MarkAllNotificationsReadVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: MarkAllNotificationsReadVariables): MutationRef<MarkAllNotificationsReadData, MarkAllNotificationsReadVariables>;
  operationName: string;
}
export const markAllNotificationsReadRef: MarkAllNotificationsReadRef;

export function markAllNotificationsRead(vars: MarkAllNotificationsReadVariables): MutationPromise<MarkAllNotificationsReadData, MarkAllNotificationsReadVariables>;
export function markAllNotificationsRead(dc: DataConnect, vars: MarkAllNotificationsReadVariables): MutationPromise<MarkAllNotificationsReadData, MarkAllNotificationsReadVariables>;

interface ChangeUserPrimaryRoleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ChangeUserPrimaryRoleVariables): MutationRef<ChangeUserPrimaryRoleData, ChangeUserPrimaryRoleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ChangeUserPrimaryRoleVariables): MutationRef<ChangeUserPrimaryRoleData, ChangeUserPrimaryRoleVariables>;
  operationName: string;
}
export const changeUserPrimaryRoleRef: ChangeUserPrimaryRoleRef;

export function changeUserPrimaryRole(vars: ChangeUserPrimaryRoleVariables): MutationPromise<ChangeUserPrimaryRoleData, ChangeUserPrimaryRoleVariables>;
export function changeUserPrimaryRole(dc: DataConnect, vars: ChangeUserPrimaryRoleVariables): MutationPromise<ChangeUserPrimaryRoleData, ChangeUserPrimaryRoleVariables>;

interface AddAdditionalRoleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddAdditionalRoleVariables): MutationRef<AddAdditionalRoleData, AddAdditionalRoleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddAdditionalRoleVariables): MutationRef<AddAdditionalRoleData, AddAdditionalRoleVariables>;
  operationName: string;
}
export const addAdditionalRoleRef: AddAdditionalRoleRef;

export function addAdditionalRole(vars: AddAdditionalRoleVariables): MutationPromise<AddAdditionalRoleData, AddAdditionalRoleVariables>;
export function addAdditionalRole(dc: DataConnect, vars: AddAdditionalRoleVariables): MutationPromise<AddAdditionalRoleData, AddAdditionalRoleVariables>;

interface CleanUserRolesToPrimaryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CleanUserRolesToPrimaryVariables): MutationRef<CleanUserRolesToPrimaryData, CleanUserRolesToPrimaryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CleanUserRolesToPrimaryVariables): MutationRef<CleanUserRolesToPrimaryData, CleanUserRolesToPrimaryVariables>;
  operationName: string;
}
export const cleanUserRolesToPrimaryRef: CleanUserRolesToPrimaryRef;

export function cleanUserRolesToPrimary(vars: CleanUserRolesToPrimaryVariables): MutationPromise<CleanUserRolesToPrimaryData, CleanUserRolesToPrimaryVariables>;
export function cleanUserRolesToPrimary(dc: DataConnect, vars: CleanUserRolesToPrimaryVariables): MutationPromise<CleanUserRolesToPrimaryData, CleanUserRolesToPrimaryVariables>;

interface CreateAcademicYearRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAcademicYearVariables): MutationRef<CreateAcademicYearData, CreateAcademicYearVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAcademicYearVariables): MutationRef<CreateAcademicYearData, CreateAcademicYearVariables>;
  operationName: string;
}
export const createAcademicYearRef: CreateAcademicYearRef;

export function createAcademicYear(vars: CreateAcademicYearVariables): MutationPromise<CreateAcademicYearData, CreateAcademicYearVariables>;
export function createAcademicYear(dc: DataConnect, vars: CreateAcademicYearVariables): MutationPromise<CreateAcademicYearData, CreateAcademicYearVariables>;

interface UpdateAcademicYearRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAcademicYearVariables): MutationRef<UpdateAcademicYearData, UpdateAcademicYearVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateAcademicYearVariables): MutationRef<UpdateAcademicYearData, UpdateAcademicYearVariables>;
  operationName: string;
}
export const updateAcademicYearRef: UpdateAcademicYearRef;

export function updateAcademicYear(vars: UpdateAcademicYearVariables): MutationPromise<UpdateAcademicYearData, UpdateAcademicYearVariables>;
export function updateAcademicYear(dc: DataConnect, vars: UpdateAcademicYearVariables): MutationPromise<UpdateAcademicYearData, UpdateAcademicYearVariables>;

interface ActivateAcademicYearRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ActivateAcademicYearVariables): MutationRef<ActivateAcademicYearData, ActivateAcademicYearVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ActivateAcademicYearVariables): MutationRef<ActivateAcademicYearData, ActivateAcademicYearVariables>;
  operationName: string;
}
export const activateAcademicYearRef: ActivateAcademicYearRef;

export function activateAcademicYear(vars: ActivateAcademicYearVariables): MutationPromise<ActivateAcademicYearData, ActivateAcademicYearVariables>;
export function activateAcademicYear(dc: DataConnect, vars: ActivateAcademicYearVariables): MutationPromise<ActivateAcademicYearData, ActivateAcademicYearVariables>;

interface CloseAcademicYearRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CloseAcademicYearVariables): MutationRef<CloseAcademicYearData, CloseAcademicYearVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CloseAcademicYearVariables): MutationRef<CloseAcademicYearData, CloseAcademicYearVariables>;
  operationName: string;
}
export const closeAcademicYearRef: CloseAcademicYearRef;

export function closeAcademicYear(vars: CloseAcademicYearVariables): MutationPromise<CloseAcademicYearData, CloseAcademicYearVariables>;
export function closeAcademicYear(dc: DataConnect, vars: CloseAcademicYearVariables): MutationPromise<CloseAcademicYearData, CloseAcademicYearVariables>;

interface RecordStudentPromotionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RecordStudentPromotionVariables): MutationRef<RecordStudentPromotionData, RecordStudentPromotionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RecordStudentPromotionVariables): MutationRef<RecordStudentPromotionData, RecordStudentPromotionVariables>;
  operationName: string;
}
export const recordStudentPromotionRef: RecordStudentPromotionRef;

export function recordStudentPromotion(vars: RecordStudentPromotionVariables): MutationPromise<RecordStudentPromotionData, RecordStudentPromotionVariables>;
export function recordStudentPromotion(dc: DataConnect, vars: RecordStudentPromotionVariables): MutationPromise<RecordStudentPromotionData, RecordStudentPromotionVariables>;

interface ApplyStudentPromotionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ApplyStudentPromotionVariables): MutationRef<ApplyStudentPromotionData, ApplyStudentPromotionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ApplyStudentPromotionVariables): MutationRef<ApplyStudentPromotionData, ApplyStudentPromotionVariables>;
  operationName: string;
}
export const applyStudentPromotionRef: ApplyStudentPromotionRef;

export function applyStudentPromotion(vars: ApplyStudentPromotionVariables): MutationPromise<ApplyStudentPromotionData, ApplyStudentPromotionVariables>;
export function applyStudentPromotion(dc: DataConnect, vars: ApplyStudentPromotionVariables): MutationPromise<ApplyStudentPromotionData, ApplyStudentPromotionVariables>;

interface CreateHolidayRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateHolidayVariables): MutationRef<CreateHolidayData, CreateHolidayVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateHolidayVariables): MutationRef<CreateHolidayData, CreateHolidayVariables>;
  operationName: string;
}
export const createHolidayRef: CreateHolidayRef;

export function createHoliday(vars: CreateHolidayVariables): MutationPromise<CreateHolidayData, CreateHolidayVariables>;
export function createHoliday(dc: DataConnect, vars: CreateHolidayVariables): MutationPromise<CreateHolidayData, CreateHolidayVariables>;

interface UpdateHolidayRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateHolidayVariables): MutationRef<UpdateHolidayData, UpdateHolidayVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateHolidayVariables): MutationRef<UpdateHolidayData, UpdateHolidayVariables>;
  operationName: string;
}
export const updateHolidayRef: UpdateHolidayRef;

export function updateHoliday(vars: UpdateHolidayVariables): MutationPromise<UpdateHolidayData, UpdateHolidayVariables>;
export function updateHoliday(dc: DataConnect, vars: UpdateHolidayVariables): MutationPromise<UpdateHolidayData, UpdateHolidayVariables>;

interface DeleteHolidayRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteHolidayVariables): MutationRef<DeleteHolidayData, DeleteHolidayVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteHolidayVariables): MutationRef<DeleteHolidayData, DeleteHolidayVariables>;
  operationName: string;
}
export const deleteHolidayRef: DeleteHolidayRef;

export function deleteHoliday(vars: DeleteHolidayVariables): MutationPromise<DeleteHolidayData, DeleteHolidayVariables>;
export function deleteHoliday(dc: DataConnect, vars: DeleteHolidayVariables): MutationPromise<DeleteHolidayData, DeleteHolidayVariables>;

interface CorrectAttendanceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CorrectAttendanceVariables): MutationRef<CorrectAttendanceData, CorrectAttendanceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CorrectAttendanceVariables): MutationRef<CorrectAttendanceData, CorrectAttendanceVariables>;
  operationName: string;
}
export const correctAttendanceRef: CorrectAttendanceRef;

export function correctAttendance(vars: CorrectAttendanceVariables): MutationPromise<CorrectAttendanceData, CorrectAttendanceVariables>;
export function correctAttendance(dc: DataConnect, vars: CorrectAttendanceVariables): MutationPromise<CorrectAttendanceData, CorrectAttendanceVariables>;

interface UpsertAttendanceSummaryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertAttendanceSummaryVariables): MutationRef<UpsertAttendanceSummaryData, UpsertAttendanceSummaryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertAttendanceSummaryVariables): MutationRef<UpsertAttendanceSummaryData, UpsertAttendanceSummaryVariables>;
  operationName: string;
}
export const upsertAttendanceSummaryRef: UpsertAttendanceSummaryRef;

export function upsertAttendanceSummary(vars: UpsertAttendanceSummaryVariables): MutationPromise<UpsertAttendanceSummaryData, UpsertAttendanceSummaryVariables>;
export function upsertAttendanceSummary(dc: DataConnect, vars: UpsertAttendanceSummaryVariables): MutationPromise<UpsertAttendanceSummaryData, UpsertAttendanceSummaryVariables>;

interface CreateAttendanceAlertLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAttendanceAlertLogVariables): MutationRef<CreateAttendanceAlertLogData, CreateAttendanceAlertLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAttendanceAlertLogVariables): MutationRef<CreateAttendanceAlertLogData, CreateAttendanceAlertLogVariables>;
  operationName: string;
}
export const createAttendanceAlertLogRef: CreateAttendanceAlertLogRef;

export function createAttendanceAlertLog(vars: CreateAttendanceAlertLogVariables): MutationPromise<CreateAttendanceAlertLogData, CreateAttendanceAlertLogVariables>;
export function createAttendanceAlertLog(dc: DataConnect, vars: CreateAttendanceAlertLogVariables): MutationPromise<CreateAttendanceAlertLogData, CreateAttendanceAlertLogVariables>;

interface CreatePublicHolidayRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePublicHolidayVariables): MutationRef<CreatePublicHolidayData, CreatePublicHolidayVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePublicHolidayVariables): MutationRef<CreatePublicHolidayData, CreatePublicHolidayVariables>;
  operationName: string;
}
export const createPublicHolidayRef: CreatePublicHolidayRef;

export function createPublicHoliday(vars: CreatePublicHolidayVariables): MutationPromise<CreatePublicHolidayData, CreatePublicHolidayVariables>;
export function createPublicHoliday(dc: DataConnect, vars: CreatePublicHolidayVariables): MutationPromise<CreatePublicHolidayData, CreatePublicHolidayVariables>;

interface CreateExamRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateExamVariables): MutationRef<CreateExamData, CreateExamVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateExamVariables): MutationRef<CreateExamData, CreateExamVariables>;
  operationName: string;
}
export const createExamRef: CreateExamRef;

export function createExam(vars: CreateExamVariables): MutationPromise<CreateExamData, CreateExamVariables>;
export function createExam(dc: DataConnect, vars: CreateExamVariables): MutationPromise<CreateExamData, CreateExamVariables>;

interface UpdateExamRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateExamVariables): MutationRef<UpdateExamData, UpdateExamVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateExamVariables): MutationRef<UpdateExamData, UpdateExamVariables>;
  operationName: string;
}
export const updateExamRef: UpdateExamRef;

export function updateExam(vars: UpdateExamVariables): MutationPromise<UpdateExamData, UpdateExamVariables>;
export function updateExam(dc: DataConnect, vars: UpdateExamVariables): MutationPromise<UpdateExamData, UpdateExamVariables>;

interface ArchiveExamRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ArchiveExamVariables): MutationRef<ArchiveExamData, ArchiveExamVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ArchiveExamVariables): MutationRef<ArchiveExamData, ArchiveExamVariables>;
  operationName: string;
}
export const archiveExamRef: ArchiveExamRef;

export function archiveExam(vars: ArchiveExamVariables): MutationPromise<ArchiveExamData, ArchiveExamVariables>;
export function archiveExam(dc: DataConnect, vars: ArchiveExamVariables): MutationPromise<ArchiveExamData, ArchiveExamVariables>;

interface DeleteExamRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteExamVariables): MutationRef<DeleteExamData, DeleteExamVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteExamVariables): MutationRef<DeleteExamData, DeleteExamVariables>;
  operationName: string;
}
export const deleteExamRef: DeleteExamRef;

export function deleteExam(vars: DeleteExamVariables): MutationPromise<DeleteExamData, DeleteExamVariables>;
export function deleteExam(dc: DataConnect, vars: DeleteExamVariables): MutationPromise<DeleteExamData, DeleteExamVariables>;

interface AddExamSectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddExamSectionVariables): MutationRef<AddExamSectionData, AddExamSectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddExamSectionVariables): MutationRef<AddExamSectionData, AddExamSectionVariables>;
  operationName: string;
}
export const addExamSectionRef: AddExamSectionRef;

export function addExamSection(vars: AddExamSectionVariables): MutationPromise<AddExamSectionData, AddExamSectionVariables>;
export function addExamSection(dc: DataConnect, vars: AddExamSectionVariables): MutationPromise<AddExamSectionData, AddExamSectionVariables>;

interface UpsertExamSubjectConfigRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertExamSubjectConfigVariables): MutationRef<UpsertExamSubjectConfigData, UpsertExamSubjectConfigVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertExamSubjectConfigVariables): MutationRef<UpsertExamSubjectConfigData, UpsertExamSubjectConfigVariables>;
  operationName: string;
}
export const upsertExamSubjectConfigRef: UpsertExamSubjectConfigRef;

export function upsertExamSubjectConfig(vars: UpsertExamSubjectConfigVariables): MutationPromise<UpsertExamSubjectConfigData, UpsertExamSubjectConfigVariables>;
export function upsertExamSubjectConfig(dc: DataConnect, vars: UpsertExamSubjectConfigVariables): MutationPromise<UpsertExamSubjectConfigData, UpsertExamSubjectConfigVariables>;

interface DeleteExamSubjectConfigRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteExamSubjectConfigVariables): MutationRef<DeleteExamSubjectConfigData, DeleteExamSubjectConfigVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteExamSubjectConfigVariables): MutationRef<DeleteExamSubjectConfigData, DeleteExamSubjectConfigVariables>;
  operationName: string;
}
export const deleteExamSubjectConfigRef: DeleteExamSubjectConfigRef;

export function deleteExamSubjectConfig(vars: DeleteExamSubjectConfigVariables): MutationPromise<DeleteExamSubjectConfigData, DeleteExamSubjectConfigVariables>;
export function deleteExamSubjectConfig(dc: DataConnect, vars: DeleteExamSubjectConfigVariables): MutationPromise<DeleteExamSubjectConfigData, DeleteExamSubjectConfigVariables>;

interface UpsertStudentMarkRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertStudentMarkVariables): MutationRef<UpsertStudentMarkData, UpsertStudentMarkVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertStudentMarkVariables): MutationRef<UpsertStudentMarkData, UpsertStudentMarkVariables>;
  operationName: string;
}
export const upsertStudentMarkRef: UpsertStudentMarkRef;

export function upsertStudentMark(vars: UpsertStudentMarkVariables): MutationPromise<UpsertStudentMarkData, UpsertStudentMarkVariables>;
export function upsertStudentMark(dc: DataConnect, vars: UpsertStudentMarkVariables): MutationPromise<UpsertStudentMarkData, UpsertStudentMarkVariables>;

interface PublishExamSectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: PublishExamSectionVariables): MutationRef<PublishExamSectionData, PublishExamSectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: PublishExamSectionVariables): MutationRef<PublishExamSectionData, PublishExamSectionVariables>;
  operationName: string;
}
export const publishExamSectionRef: PublishExamSectionRef;

export function publishExamSection(vars: PublishExamSectionVariables): MutationPromise<PublishExamSectionData, PublishExamSectionVariables>;
export function publishExamSection(dc: DataConnect, vars: PublishExamSectionVariables): MutationPromise<PublishExamSectionData, PublishExamSectionVariables>;

interface UnpublishExamSectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UnpublishExamSectionVariables): MutationRef<UnpublishExamSectionData, UnpublishExamSectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UnpublishExamSectionVariables): MutationRef<UnpublishExamSectionData, UnpublishExamSectionVariables>;
  operationName: string;
}
export const unpublishExamSectionRef: UnpublishExamSectionRef;

export function unpublishExamSection(vars: UnpublishExamSectionVariables): MutationPromise<UnpublishExamSectionData, UnpublishExamSectionVariables>;
export function unpublishExamSection(dc: DataConnect, vars: UnpublishExamSectionVariables): MutationPromise<UnpublishExamSectionData, UnpublishExamSectionVariables>;

interface UpdateFcmTokenRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateFcmTokenVariables): MutationRef<UpdateFcmTokenData, UpdateFcmTokenVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateFcmTokenVariables): MutationRef<UpdateFcmTokenData, UpdateFcmTokenVariables>;
  operationName: string;
}
export const updateFcmTokenRef: UpdateFcmTokenRef;

export function updateFcmToken(vars: UpdateFcmTokenVariables): MutationPromise<UpdateFcmTokenData, UpdateFcmTokenVariables>;
export function updateFcmToken(dc: DataConnect, vars: UpdateFcmTokenVariables): MutationPromise<UpdateFcmTokenData, UpdateFcmTokenVariables>;

interface RecordMarksAuditLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RecordMarksAuditLogVariables): MutationRef<RecordMarksAuditLogData, RecordMarksAuditLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RecordMarksAuditLogVariables): MutationRef<RecordMarksAuditLogData, RecordMarksAuditLogVariables>;
  operationName: string;
}
export const recordMarksAuditLogRef: RecordMarksAuditLogRef;

export function recordMarksAuditLog(vars: RecordMarksAuditLogVariables): MutationPromise<RecordMarksAuditLogData, RecordMarksAuditLogVariables>;
export function recordMarksAuditLog(dc: DataConnect, vars: RecordMarksAuditLogVariables): MutationPromise<RecordMarksAuditLogData, RecordMarksAuditLogVariables>;

interface GetCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCurrentUserVariables): QueryRef<GetCurrentUserData, GetCurrentUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCurrentUserVariables): QueryRef<GetCurrentUserData, GetCurrentUserVariables>;
  operationName: string;
}
export const getCurrentUserRef: GetCurrentUserRef;

export function getCurrentUser(vars: GetCurrentUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, GetCurrentUserVariables>;
export function getCurrentUser(dc: DataConnect, vars: GetCurrentUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, GetCurrentUserVariables>;

interface GetUserByPhoneRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByPhoneVariables): QueryRef<GetUserByPhoneData, GetUserByPhoneVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserByPhoneVariables): QueryRef<GetUserByPhoneData, GetUserByPhoneVariables>;
  operationName: string;
}
export const getUserByPhoneRef: GetUserByPhoneRef;

export function getUserByPhone(vars: GetUserByPhoneVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByPhoneData, GetUserByPhoneVariables>;
export function getUserByPhone(dc: DataConnect, vars: GetUserByPhoneVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByPhoneData, GetUserByPhoneVariables>;

interface GetUserRoleForClaimsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserRoleForClaimsVariables): QueryRef<GetUserRoleForClaimsData, GetUserRoleForClaimsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserRoleForClaimsVariables): QueryRef<GetUserRoleForClaimsData, GetUserRoleForClaimsVariables>;
  operationName: string;
}
export const getUserRoleForClaimsRef: GetUserRoleForClaimsRef;

export function getUserRoleForClaims(vars: GetUserRoleForClaimsVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserRoleForClaimsData, GetUserRoleForClaimsVariables>;
export function getUserRoleForClaims(dc: DataConnect, vars: GetUserRoleForClaimsVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserRoleForClaimsData, GetUserRoleForClaimsVariables>;

interface GetUserRolesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserRolesVariables): QueryRef<GetUserRolesData, GetUserRolesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserRolesVariables): QueryRef<GetUserRolesData, GetUserRolesVariables>;
  operationName: string;
}
export const getUserRolesRef: GetUserRolesRef;

export function getUserRoles(vars: GetUserRolesVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserRolesData, GetUserRolesVariables>;
export function getUserRoles(dc: DataConnect, vars: GetUserRolesVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserRolesData, GetUserRolesVariables>;

interface GetStudentsByBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStudentsByBranchVariables): QueryRef<GetStudentsByBranchData, GetStudentsByBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStudentsByBranchVariables): QueryRef<GetStudentsByBranchData, GetStudentsByBranchVariables>;
  operationName: string;
}
export const getStudentsByBranchRef: GetStudentsByBranchRef;

export function getStudentsByBranch(vars: GetStudentsByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentsByBranchData, GetStudentsByBranchVariables>;
export function getStudentsByBranch(dc: DataConnect, vars: GetStudentsByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentsByBranchData, GetStudentsByBranchVariables>;

interface GetStudentsBySectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStudentsBySectionVariables): QueryRef<GetStudentsBySectionData, GetStudentsBySectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStudentsBySectionVariables): QueryRef<GetStudentsBySectionData, GetStudentsBySectionVariables>;
  operationName: string;
}
export const getStudentsBySectionRef: GetStudentsBySectionRef;

export function getStudentsBySection(vars: GetStudentsBySectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentsBySectionData, GetStudentsBySectionVariables>;
export function getStudentsBySection(dc: DataConnect, vars: GetStudentsBySectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentsBySectionData, GetStudentsBySectionVariables>;

interface GetParentChildrenRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetParentChildrenVariables): QueryRef<GetParentChildrenData, GetParentChildrenVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetParentChildrenVariables): QueryRef<GetParentChildrenData, GetParentChildrenVariables>;
  operationName: string;
}
export const getParentChildrenRef: GetParentChildrenRef;

export function getParentChildren(vars: GetParentChildrenVariables, options?: ExecuteQueryOptions): QueryPromise<GetParentChildrenData, GetParentChildrenVariables>;
export function getParentChildren(dc: DataConnect, vars: GetParentChildrenVariables, options?: ExecuteQueryOptions): QueryPromise<GetParentChildrenData, GetParentChildrenVariables>;

interface GetParentChildrenByUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetParentChildrenByUserVariables): QueryRef<GetParentChildrenByUserData, GetParentChildrenByUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetParentChildrenByUserVariables): QueryRef<GetParentChildrenByUserData, GetParentChildrenByUserVariables>;
  operationName: string;
}
export const getParentChildrenByUserRef: GetParentChildrenByUserRef;

export function getParentChildrenByUser(vars: GetParentChildrenByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetParentChildrenByUserData, GetParentChildrenByUserVariables>;
export function getParentChildrenByUser(dc: DataConnect, vars: GetParentChildrenByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetParentChildrenByUserData, GetParentChildrenByUserVariables>;

interface GetStudentParentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStudentParentsVariables): QueryRef<GetStudentParentsData, GetStudentParentsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStudentParentsVariables): QueryRef<GetStudentParentsData, GetStudentParentsVariables>;
  operationName: string;
}
export const getStudentParentsRef: GetStudentParentsRef;

export function getStudentParents(vars: GetStudentParentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentParentsData, GetStudentParentsVariables>;
export function getStudentParents(dc: DataConnect, vars: GetStudentParentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentParentsData, GetStudentParentsVariables>;

interface GetParentByUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetParentByUserVariables): QueryRef<GetParentByUserData, GetParentByUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetParentByUserVariables): QueryRef<GetParentByUserData, GetParentByUserVariables>;
  operationName: string;
}
export const getParentByUserRef: GetParentByUserRef;

export function getParentByUser(vars: GetParentByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetParentByUserData, GetParentByUserVariables>;
export function getParentByUser(dc: DataConnect, vars: GetParentByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetParentByUserData, GetParentByUserVariables>;

interface GetParentByPhoneRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetParentByPhoneVariables): QueryRef<GetParentByPhoneData, GetParentByPhoneVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetParentByPhoneVariables): QueryRef<GetParentByPhoneData, GetParentByPhoneVariables>;
  operationName: string;
}
export const getParentByPhoneRef: GetParentByPhoneRef;

export function getParentByPhone(vars: GetParentByPhoneVariables, options?: ExecuteQueryOptions): QueryPromise<GetParentByPhoneData, GetParentByPhoneVariables>;
export function getParentByPhone(dc: DataConnect, vars: GetParentByPhoneVariables, options?: ExecuteQueryOptions): QueryPromise<GetParentByPhoneData, GetParentByPhoneVariables>;

interface GetBranchesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetBranchesVariables): QueryRef<GetBranchesData, GetBranchesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetBranchesVariables): QueryRef<GetBranchesData, GetBranchesVariables>;
  operationName: string;
}
export const getBranchesRef: GetBranchesRef;

export function getBranches(vars?: GetBranchesVariables, options?: ExecuteQueryOptions): QueryPromise<GetBranchesData, GetBranchesVariables>;
export function getBranches(dc: DataConnect, vars?: GetBranchesVariables, options?: ExecuteQueryOptions): QueryPromise<GetBranchesData, GetBranchesVariables>;

interface GetBranchDetailsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBranchDetailsVariables): QueryRef<GetBranchDetailsData, GetBranchDetailsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetBranchDetailsVariables): QueryRef<GetBranchDetailsData, GetBranchDetailsVariables>;
  operationName: string;
}
export const getBranchDetailsRef: GetBranchDetailsRef;

export function getBranchDetails(vars: GetBranchDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetBranchDetailsData, GetBranchDetailsVariables>;
export function getBranchDetails(dc: DataConnect, vars: GetBranchDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetBranchDetailsData, GetBranchDetailsVariables>;

interface GetUsersByRoleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUsersByRoleVariables): QueryRef<GetUsersByRoleData, GetUsersByRoleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUsersByRoleVariables): QueryRef<GetUsersByRoleData, GetUsersByRoleVariables>;
  operationName: string;
}
export const getUsersByRoleRef: GetUsersByRoleRef;

export function getUsersByRole(vars: GetUsersByRoleVariables, options?: ExecuteQueryOptions): QueryPromise<GetUsersByRoleData, GetUsersByRoleVariables>;
export function getUsersByRole(dc: DataConnect, vars: GetUsersByRoleVariables, options?: ExecuteQueryOptions): QueryPromise<GetUsersByRoleData, GetUsersByRoleVariables>;

interface GetAssignmentConflictsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAssignmentConflictsVariables): QueryRef<GetAssignmentConflictsData, GetAssignmentConflictsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAssignmentConflictsVariables): QueryRef<GetAssignmentConflictsData, GetAssignmentConflictsVariables>;
  operationName: string;
}
export const getAssignmentConflictsRef: GetAssignmentConflictsRef;

export function getAssignmentConflicts(vars: GetAssignmentConflictsVariables, options?: ExecuteQueryOptions): QueryPromise<GetAssignmentConflictsData, GetAssignmentConflictsVariables>;
export function getAssignmentConflicts(dc: DataConnect, vars: GetAssignmentConflictsVariables, options?: ExecuteQueryOptions): QueryPromise<GetAssignmentConflictsData, GetAssignmentConflictsVariables>;

interface GetGlobalClassesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetGlobalClassesVariables): QueryRef<GetGlobalClassesData, GetGlobalClassesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetGlobalClassesVariables): QueryRef<GetGlobalClassesData, GetGlobalClassesVariables>;
  operationName: string;
}
export const getGlobalClassesRef: GetGlobalClassesRef;

export function getGlobalClasses(vars?: GetGlobalClassesVariables, options?: ExecuteQueryOptions): QueryPromise<GetGlobalClassesData, GetGlobalClassesVariables>;
export function getGlobalClasses(dc: DataConnect, vars?: GetGlobalClassesVariables, options?: ExecuteQueryOptions): QueryPromise<GetGlobalClassesData, GetGlobalClassesVariables>;

interface GetClassDetailsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClassDetailsVariables): QueryRef<GetClassDetailsData, GetClassDetailsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetClassDetailsVariables): QueryRef<GetClassDetailsData, GetClassDetailsVariables>;
  operationName: string;
}
export const getClassDetailsRef: GetClassDetailsRef;

export function getClassDetails(vars: GetClassDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassDetailsData, GetClassDetailsVariables>;
export function getClassDetails(dc: DataConnect, vars: GetClassDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassDetailsData, GetClassDetailsVariables>;

interface GetGlobalStudentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetGlobalStudentsVariables): QueryRef<GetGlobalStudentsData, GetGlobalStudentsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetGlobalStudentsVariables): QueryRef<GetGlobalStudentsData, GetGlobalStudentsVariables>;
  operationName: string;
}
export const getGlobalStudentsRef: GetGlobalStudentsRef;

export function getGlobalStudents(vars?: GetGlobalStudentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetGlobalStudentsData, GetGlobalStudentsVariables>;
export function getGlobalStudents(dc: DataConnect, vars?: GetGlobalStudentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetGlobalStudentsData, GetGlobalStudentsVariables>;

interface GetStudentProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStudentProfileVariables): QueryRef<GetStudentProfileData, GetStudentProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStudentProfileVariables): QueryRef<GetStudentProfileData, GetStudentProfileVariables>;
  operationName: string;
}
export const getStudentProfileRef: GetStudentProfileRef;

export function getStudentProfile(vars: GetStudentProfileVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentProfileData, GetStudentProfileVariables>;
export function getStudentProfile(dc: DataConnect, vars: GetStudentProfileVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentProfileData, GetStudentProfileVariables>;

interface GetStudentAttendanceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStudentAttendanceVariables): QueryRef<GetStudentAttendanceData, GetStudentAttendanceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStudentAttendanceVariables): QueryRef<GetStudentAttendanceData, GetStudentAttendanceVariables>;
  operationName: string;
}
export const getStudentAttendanceRef: GetStudentAttendanceRef;

export function getStudentAttendance(vars: GetStudentAttendanceVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentAttendanceData, GetStudentAttendanceVariables>;
export function getStudentAttendance(dc: DataConnect, vars: GetStudentAttendanceVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentAttendanceData, GetStudentAttendanceVariables>;

interface GetStudentFeeHistoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStudentFeeHistoryVariables): QueryRef<GetStudentFeeHistoryData, GetStudentFeeHistoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStudentFeeHistoryVariables): QueryRef<GetStudentFeeHistoryData, GetStudentFeeHistoryVariables>;
  operationName: string;
}
export const getStudentFeeHistoryRef: GetStudentFeeHistoryRef;

export function getStudentFeeHistory(vars: GetStudentFeeHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentFeeHistoryData, GetStudentFeeHistoryVariables>;
export function getStudentFeeHistory(dc: DataConnect, vars: GetStudentFeeHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentFeeHistoryData, GetStudentFeeHistoryVariables>;

interface GetDashboardStatisticsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetDashboardStatisticsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetDashboardStatisticsData, undefined>;
  operationName: string;
}
export const getDashboardStatisticsRef: GetDashboardStatisticsRef;

export function getDashboardStatistics(options?: ExecuteQueryOptions): QueryPromise<GetDashboardStatisticsData, undefined>;
export function getDashboardStatistics(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetDashboardStatisticsData, undefined>;

interface GetWingsByBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetWingsByBranchVariables): QueryRef<GetWingsByBranchData, GetWingsByBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetWingsByBranchVariables): QueryRef<GetWingsByBranchData, GetWingsByBranchVariables>;
  operationName: string;
}
export const getWingsByBranchRef: GetWingsByBranchRef;

export function getWingsByBranch(vars: GetWingsByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetWingsByBranchData, GetWingsByBranchVariables>;
export function getWingsByBranch(dc: DataConnect, vars: GetWingsByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetWingsByBranchData, GetWingsByBranchVariables>;

interface GetClassesByWingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClassesByWingVariables): QueryRef<GetClassesByWingData, GetClassesByWingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetClassesByWingVariables): QueryRef<GetClassesByWingData, GetClassesByWingVariables>;
  operationName: string;
}
export const getClassesByWingRef: GetClassesByWingRef;

export function getClassesByWing(vars: GetClassesByWingVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassesByWingData, GetClassesByWingVariables>;
export function getClassesByWing(dc: DataConnect, vars: GetClassesByWingVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassesByWingData, GetClassesByWingVariables>;

interface GetSectionsByClassRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSectionsByClassVariables): QueryRef<GetSectionsByClassData, GetSectionsByClassVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSectionsByClassVariables): QueryRef<GetSectionsByClassData, GetSectionsByClassVariables>;
  operationName: string;
}
export const getSectionsByClassRef: GetSectionsByClassRef;

export function getSectionsByClass(vars: GetSectionsByClassVariables, options?: ExecuteQueryOptions): QueryPromise<GetSectionsByClassData, GetSectionsByClassVariables>;
export function getSectionsByClass(dc: DataConnect, vars: GetSectionsByClassVariables, options?: ExecuteQueryOptions): QueryPromise<GetSectionsByClassData, GetSectionsByClassVariables>;

interface GetSectionClassTeacherRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSectionClassTeacherVariables): QueryRef<GetSectionClassTeacherData, GetSectionClassTeacherVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSectionClassTeacherVariables): QueryRef<GetSectionClassTeacherData, GetSectionClassTeacherVariables>;
  operationName: string;
}
export const getSectionClassTeacherRef: GetSectionClassTeacherRef;

export function getSectionClassTeacher(vars: GetSectionClassTeacherVariables, options?: ExecuteQueryOptions): QueryPromise<GetSectionClassTeacherData, GetSectionClassTeacherVariables>;
export function getSectionClassTeacher(dc: DataConnect, vars: GetSectionClassTeacherVariables, options?: ExecuteQueryOptions): QueryPromise<GetSectionClassTeacherData, GetSectionClassTeacherVariables>;

interface GetTeacherAssignmentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTeacherAssignmentsVariables): QueryRef<GetTeacherAssignmentsData, GetTeacherAssignmentsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTeacherAssignmentsVariables): QueryRef<GetTeacherAssignmentsData, GetTeacherAssignmentsVariables>;
  operationName: string;
}
export const getTeacherAssignmentsRef: GetTeacherAssignmentsRef;

export function getTeacherAssignments(vars: GetTeacherAssignmentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetTeacherAssignmentsData, GetTeacherAssignmentsVariables>;
export function getTeacherAssignments(dc: DataConnect, vars: GetTeacherAssignmentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetTeacherAssignmentsData, GetTeacherAssignmentsVariables>;

interface SearchStudentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchStudentsVariables): QueryRef<SearchStudentsData, SearchStudentsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SearchStudentsVariables): QueryRef<SearchStudentsData, SearchStudentsVariables>;
  operationName: string;
}
export const searchStudentsRef: SearchStudentsRef;

export function searchStudents(vars: SearchStudentsVariables, options?: ExecuteQueryOptions): QueryPromise<SearchStudentsData, SearchStudentsVariables>;
export function searchStudents(dc: DataConnect, vars: SearchStudentsVariables, options?: ExecuteQueryOptions): QueryPromise<SearchStudentsData, SearchStudentsVariables>;

interface GetStudentIdSequenceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStudentIdSequenceVariables): QueryRef<GetStudentIdSequenceData, GetStudentIdSequenceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStudentIdSequenceVariables): QueryRef<GetStudentIdSequenceData, GetStudentIdSequenceVariables>;
  operationName: string;
}
export const getStudentIdSequenceRef: GetStudentIdSequenceRef;

export function getStudentIdSequence(vars: GetStudentIdSequenceVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentIdSequenceData, GetStudentIdSequenceVariables>;
export function getStudentIdSequence(dc: DataConnect, vars: GetStudentIdSequenceVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentIdSequenceData, GetStudentIdSequenceVariables>;

interface GetStudentDetailsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStudentDetailsVariables): QueryRef<GetStudentDetailsData, GetStudentDetailsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStudentDetailsVariables): QueryRef<GetStudentDetailsData, GetStudentDetailsVariables>;
  operationName: string;
}
export const getStudentDetailsRef: GetStudentDetailsRef;

export function getStudentDetails(vars: GetStudentDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentDetailsData, GetStudentDetailsVariables>;
export function getStudentDetails(dc: DataConnect, vars: GetStudentDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentDetailsData, GetStudentDetailsVariables>;

interface GetStudentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStudentsVariables): QueryRef<GetStudentsData, GetStudentsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStudentsVariables): QueryRef<GetStudentsData, GetStudentsVariables>;
  operationName: string;
}
export const getStudentsRef: GetStudentsRef;

export function getStudents(vars: GetStudentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentsData, GetStudentsVariables>;
export function getStudents(dc: DataConnect, vars: GetStudentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentsData, GetStudentsVariables>;

interface GetStaffIdSequenceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStaffIdSequenceVariables): QueryRef<GetStaffIdSequenceData, GetStaffIdSequenceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStaffIdSequenceVariables): QueryRef<GetStaffIdSequenceData, GetStaffIdSequenceVariables>;
  operationName: string;
}
export const getStaffIdSequenceRef: GetStaffIdSequenceRef;

export function getStaffIdSequence(vars: GetStaffIdSequenceVariables, options?: ExecuteQueryOptions): QueryPromise<GetStaffIdSequenceData, GetStaffIdSequenceVariables>;
export function getStaffIdSequence(dc: DataConnect, vars: GetStaffIdSequenceVariables, options?: ExecuteQueryOptions): QueryPromise<GetStaffIdSequenceData, GetStaffIdSequenceVariables>;

interface GetEmployeeSequenceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEmployeeSequenceVariables): QueryRef<GetEmployeeSequenceData, GetEmployeeSequenceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetEmployeeSequenceVariables): QueryRef<GetEmployeeSequenceData, GetEmployeeSequenceVariables>;
  operationName: string;
}
export const getEmployeeSequenceRef: GetEmployeeSequenceRef;

export function getEmployeeSequence(vars: GetEmployeeSequenceVariables, options?: ExecuteQueryOptions): QueryPromise<GetEmployeeSequenceData, GetEmployeeSequenceVariables>;
export function getEmployeeSequence(dc: DataConnect, vars: GetEmployeeSequenceVariables, options?: ExecuteQueryOptions): QueryPromise<GetEmployeeSequenceData, GetEmployeeSequenceVariables>;

interface GetStaffIdsByPrefixRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStaffIdsByPrefixVariables): QueryRef<GetStaffIdsByPrefixData, GetStaffIdsByPrefixVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStaffIdsByPrefixVariables): QueryRef<GetStaffIdsByPrefixData, GetStaffIdsByPrefixVariables>;
  operationName: string;
}
export const getStaffIdsByPrefixRef: GetStaffIdsByPrefixRef;

export function getStaffIdsByPrefix(vars: GetStaffIdsByPrefixVariables, options?: ExecuteQueryOptions): QueryPromise<GetStaffIdsByPrefixData, GetStaffIdsByPrefixVariables>;
export function getStaffIdsByPrefix(dc: DataConnect, vars: GetStaffIdsByPrefixVariables, options?: ExecuteQueryOptions): QueryPromise<GetStaffIdsByPrefixData, GetStaffIdsByPrefixVariables>;

interface GetAttendanceByMonthRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAttendanceByMonthVariables): QueryRef<GetAttendanceByMonthData, GetAttendanceByMonthVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAttendanceByMonthVariables): QueryRef<GetAttendanceByMonthData, GetAttendanceByMonthVariables>;
  operationName: string;
}
export const getAttendanceByMonthRef: GetAttendanceByMonthRef;

export function getAttendanceByMonth(vars: GetAttendanceByMonthVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceByMonthData, GetAttendanceByMonthVariables>;
export function getAttendanceByMonth(dc: DataConnect, vars: GetAttendanceByMonthVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceByMonthData, GetAttendanceByMonthVariables>;

interface GetAttendanceBySectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAttendanceBySectionVariables): QueryRef<GetAttendanceBySectionData, GetAttendanceBySectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAttendanceBySectionVariables): QueryRef<GetAttendanceBySectionData, GetAttendanceBySectionVariables>;
  operationName: string;
}
export const getAttendanceBySectionRef: GetAttendanceBySectionRef;

export function getAttendanceBySection(vars: GetAttendanceBySectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceBySectionData, GetAttendanceBySectionVariables>;
export function getAttendanceBySection(dc: DataConnect, vars: GetAttendanceBySectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceBySectionData, GetAttendanceBySectionVariables>;

interface GetAttendanceBySectionHistoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAttendanceBySectionHistoryVariables): QueryRef<GetAttendanceBySectionHistoryData, GetAttendanceBySectionHistoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAttendanceBySectionHistoryVariables): QueryRef<GetAttendanceBySectionHistoryData, GetAttendanceBySectionHistoryVariables>;
  operationName: string;
}
export const getAttendanceBySectionHistoryRef: GetAttendanceBySectionHistoryRef;

export function getAttendanceBySectionHistory(vars: GetAttendanceBySectionHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceBySectionHistoryData, GetAttendanceBySectionHistoryVariables>;
export function getAttendanceBySectionHistory(dc: DataConnect, vars: GetAttendanceBySectionHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceBySectionHistoryData, GetAttendanceBySectionHistoryVariables>;

interface GetAttendanceByBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAttendanceByBranchVariables): QueryRef<GetAttendanceByBranchData, GetAttendanceByBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAttendanceByBranchVariables): QueryRef<GetAttendanceByBranchData, GetAttendanceByBranchVariables>;
  operationName: string;
}
export const getAttendanceByBranchRef: GetAttendanceByBranchRef;

export function getAttendanceByBranch(vars: GetAttendanceByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceByBranchData, GetAttendanceByBranchVariables>;
export function getAttendanceByBranch(dc: DataConnect, vars: GetAttendanceByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceByBranchData, GetAttendanceByBranchVariables>;

interface GetAttendanceByWingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAttendanceByWingVariables): QueryRef<GetAttendanceByWingData, GetAttendanceByWingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAttendanceByWingVariables): QueryRef<GetAttendanceByWingData, GetAttendanceByWingVariables>;
  operationName: string;
}
export const getAttendanceByWingRef: GetAttendanceByWingRef;

export function getAttendanceByWing(vars: GetAttendanceByWingVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceByWingData, GetAttendanceByWingVariables>;
export function getAttendanceByWing(dc: DataConnect, vars: GetAttendanceByWingVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceByWingData, GetAttendanceByWingVariables>;

interface GetFeeDetailsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFeeDetailsVariables): QueryRef<GetFeeDetailsData, GetFeeDetailsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetFeeDetailsVariables): QueryRef<GetFeeDetailsData, GetFeeDetailsVariables>;
  operationName: string;
}
export const getFeeDetailsRef: GetFeeDetailsRef;

export function getFeeDetails(vars: GetFeeDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetFeeDetailsData, GetFeeDetailsVariables>;
export function getFeeDetails(dc: DataConnect, vars: GetFeeDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetFeeDetailsData, GetFeeDetailsVariables>;

interface GetFeeRecordsByBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFeeRecordsByBranchVariables): QueryRef<GetFeeRecordsByBranchData, GetFeeRecordsByBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetFeeRecordsByBranchVariables): QueryRef<GetFeeRecordsByBranchData, GetFeeRecordsByBranchVariables>;
  operationName: string;
}
export const getFeeRecordsByBranchRef: GetFeeRecordsByBranchRef;

export function getFeeRecordsByBranch(vars: GetFeeRecordsByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetFeeRecordsByBranchData, GetFeeRecordsByBranchVariables>;
export function getFeeRecordsByBranch(dc: DataConnect, vars: GetFeeRecordsByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetFeeRecordsByBranchData, GetFeeRecordsByBranchVariables>;

interface GetAllFeeRecordsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetAllFeeRecordsVariables): QueryRef<GetAllFeeRecordsData, GetAllFeeRecordsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetAllFeeRecordsVariables): QueryRef<GetAllFeeRecordsData, GetAllFeeRecordsVariables>;
  operationName: string;
}
export const getAllFeeRecordsRef: GetAllFeeRecordsRef;

export function getAllFeeRecords(vars?: GetAllFeeRecordsVariables, options?: ExecuteQueryOptions): QueryPromise<GetAllFeeRecordsData, GetAllFeeRecordsVariables>;
export function getAllFeeRecords(dc: DataConnect, vars?: GetAllFeeRecordsVariables, options?: ExecuteQueryOptions): QueryPromise<GetAllFeeRecordsData, GetAllFeeRecordsVariables>;

interface GetDueStudentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDueStudentsVariables): QueryRef<GetDueStudentsData, GetDueStudentsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetDueStudentsVariables): QueryRef<GetDueStudentsData, GetDueStudentsVariables>;
  operationName: string;
}
export const getDueStudentsRef: GetDueStudentsRef;

export function getDueStudents(vars: GetDueStudentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetDueStudentsData, GetDueStudentsVariables>;
export function getDueStudents(dc: DataConnect, vars: GetDueStudentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetDueStudentsData, GetDueStudentsVariables>;

interface GetPaidStudentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPaidStudentsVariables): QueryRef<GetPaidStudentsData, GetPaidStudentsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPaidStudentsVariables): QueryRef<GetPaidStudentsData, GetPaidStudentsVariables>;
  operationName: string;
}
export const getPaidStudentsRef: GetPaidStudentsRef;

export function getPaidStudents(vars: GetPaidStudentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetPaidStudentsData, GetPaidStudentsVariables>;
export function getPaidStudents(dc: DataConnect, vars: GetPaidStudentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetPaidStudentsData, GetPaidStudentsVariables>;

interface GetBranchAnalyticsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBranchAnalyticsVariables): QueryRef<GetBranchAnalyticsData, GetBranchAnalyticsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetBranchAnalyticsVariables): QueryRef<GetBranchAnalyticsData, GetBranchAnalyticsVariables>;
  operationName: string;
}
export const getBranchAnalyticsRef: GetBranchAnalyticsRef;

export function getBranchAnalytics(vars: GetBranchAnalyticsVariables, options?: ExecuteQueryOptions): QueryPromise<GetBranchAnalyticsData, GetBranchAnalyticsVariables>;
export function getBranchAnalytics(dc: DataConnect, vars: GetBranchAnalyticsVariables, options?: ExecuteQueryOptions): QueryPromise<GetBranchAnalyticsData, GetBranchAnalyticsVariables>;

interface GetClassAnalyticsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClassAnalyticsVariables): QueryRef<GetClassAnalyticsData, GetClassAnalyticsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetClassAnalyticsVariables): QueryRef<GetClassAnalyticsData, GetClassAnalyticsVariables>;
  operationName: string;
}
export const getClassAnalyticsRef: GetClassAnalyticsRef;

export function getClassAnalytics(vars: GetClassAnalyticsVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassAnalyticsData, GetClassAnalyticsVariables>;
export function getClassAnalytics(dc: DataConnect, vars: GetClassAnalyticsVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassAnalyticsData, GetClassAnalyticsVariables>;

interface GetAcademicClassesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetAcademicClassesVariables): QueryRef<GetAcademicClassesData, GetAcademicClassesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetAcademicClassesVariables): QueryRef<GetAcademicClassesData, GetAcademicClassesVariables>;
  operationName: string;
}
export const getAcademicClassesRef: GetAcademicClassesRef;

export function getAcademicClasses(vars?: GetAcademicClassesVariables, options?: ExecuteQueryOptions): QueryPromise<GetAcademicClassesData, GetAcademicClassesVariables>;
export function getAcademicClasses(dc: DataConnect, vars?: GetAcademicClassesVariables, options?: ExecuteQueryOptions): QueryPromise<GetAcademicClassesData, GetAcademicClassesVariables>;

interface GetActiveAcademicClassesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetActiveAcademicClassesVariables): QueryRef<GetActiveAcademicClassesData, GetActiveAcademicClassesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetActiveAcademicClassesVariables): QueryRef<GetActiveAcademicClassesData, GetActiveAcademicClassesVariables>;
  operationName: string;
}
export const getActiveAcademicClassesRef: GetActiveAcademicClassesRef;

export function getActiveAcademicClasses(vars?: GetActiveAcademicClassesVariables, options?: ExecuteQueryOptions): QueryPromise<GetActiveAcademicClassesData, GetActiveAcademicClassesVariables>;
export function getActiveAcademicClasses(dc: DataConnect, vars?: GetActiveAcademicClassesVariables, options?: ExecuteQueryOptions): QueryPromise<GetActiveAcademicClassesData, GetActiveAcademicClassesVariables>;

interface GetClassesByWingCodeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClassesByWingCodeVariables): QueryRef<GetClassesByWingCodeData, GetClassesByWingCodeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetClassesByWingCodeVariables): QueryRef<GetClassesByWingCodeData, GetClassesByWingCodeVariables>;
  operationName: string;
}
export const getClassesByWingCodeRef: GetClassesByWingCodeRef;

export function getClassesByWingCode(vars: GetClassesByWingCodeVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassesByWingCodeData, GetClassesByWingCodeVariables>;
export function getClassesByWingCode(dc: DataConnect, vars: GetClassesByWingCodeVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassesByWingCodeData, GetClassesByWingCodeVariables>;

interface GetCoordinatorsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoordinatorsVariables): QueryRef<GetCoordinatorsData, GetCoordinatorsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCoordinatorsVariables): QueryRef<GetCoordinatorsData, GetCoordinatorsVariables>;
  operationName: string;
}
export const getCoordinatorsRef: GetCoordinatorsRef;

export function getCoordinators(vars: GetCoordinatorsVariables, options?: ExecuteQueryOptions): QueryPromise<GetCoordinatorsData, GetCoordinatorsVariables>;
export function getCoordinators(dc: DataConnect, vars: GetCoordinatorsVariables, options?: ExecuteQueryOptions): QueryPromise<GetCoordinatorsData, GetCoordinatorsVariables>;

interface GetCoordinatorDetailsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoordinatorDetailsVariables): QueryRef<GetCoordinatorDetailsData, GetCoordinatorDetailsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCoordinatorDetailsVariables): QueryRef<GetCoordinatorDetailsData, GetCoordinatorDetailsVariables>;
  operationName: string;
}
export const getCoordinatorDetailsRef: GetCoordinatorDetailsRef;

export function getCoordinatorDetails(vars: GetCoordinatorDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetCoordinatorDetailsData, GetCoordinatorDetailsVariables>;
export function getCoordinatorDetails(dc: DataConnect, vars: GetCoordinatorDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetCoordinatorDetailsData, GetCoordinatorDetailsVariables>;

interface GetCoordinatorByUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoordinatorByUserVariables): QueryRef<GetCoordinatorByUserData, GetCoordinatorByUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCoordinatorByUserVariables): QueryRef<GetCoordinatorByUserData, GetCoordinatorByUserVariables>;
  operationName: string;
}
export const getCoordinatorByUserRef: GetCoordinatorByUserRef;

export function getCoordinatorByUser(vars: GetCoordinatorByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetCoordinatorByUserData, GetCoordinatorByUserVariables>;
export function getCoordinatorByUser(dc: DataConnect, vars: GetCoordinatorByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetCoordinatorByUserData, GetCoordinatorByUserVariables>;

interface GetSectionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSectionsVariables): QueryRef<GetSectionsData, GetSectionsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSectionsVariables): QueryRef<GetSectionsData, GetSectionsVariables>;
  operationName: string;
}
export const getSectionsRef: GetSectionsRef;

export function getSections(vars: GetSectionsVariables, options?: ExecuteQueryOptions): QueryPromise<GetSectionsData, GetSectionsVariables>;
export function getSections(dc: DataConnect, vars: GetSectionsVariables, options?: ExecuteQueryOptions): QueryPromise<GetSectionsData, GetSectionsVariables>;

interface GetSectionsByClassAndYearRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSectionsByClassAndYearVariables): QueryRef<GetSectionsByClassAndYearData, GetSectionsByClassAndYearVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSectionsByClassAndYearVariables): QueryRef<GetSectionsByClassAndYearData, GetSectionsByClassAndYearVariables>;
  operationName: string;
}
export const getSectionsByClassAndYearRef: GetSectionsByClassAndYearRef;

export function getSectionsByClassAndYear(vars: GetSectionsByClassAndYearVariables, options?: ExecuteQueryOptions): QueryPromise<GetSectionsByClassAndYearData, GetSectionsByClassAndYearVariables>;
export function getSectionsByClassAndYear(dc: DataConnect, vars: GetSectionsByClassAndYearVariables, options?: ExecuteQueryOptions): QueryPromise<GetSectionsByClassAndYearData, GetSectionsByClassAndYearVariables>;

interface GetPrincipalDashboardRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPrincipalDashboardVariables): QueryRef<GetPrincipalDashboardData, GetPrincipalDashboardVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPrincipalDashboardVariables): QueryRef<GetPrincipalDashboardData, GetPrincipalDashboardVariables>;
  operationName: string;
}
export const getPrincipalDashboardRef: GetPrincipalDashboardRef;

export function getPrincipalDashboard(vars: GetPrincipalDashboardVariables, options?: ExecuteQueryOptions): QueryPromise<GetPrincipalDashboardData, GetPrincipalDashboardVariables>;
export function getPrincipalDashboard(dc: DataConnect, vars: GetPrincipalDashboardVariables, options?: ExecuteQueryOptions): QueryPromise<GetPrincipalDashboardData, GetPrincipalDashboardVariables>;

interface GetStudentsByWingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStudentsByWingVariables): QueryRef<GetStudentsByWingData, GetStudentsByWingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStudentsByWingVariables): QueryRef<GetStudentsByWingData, GetStudentsByWingVariables>;
  operationName: string;
}
export const getStudentsByWingRef: GetStudentsByWingRef;

export function getStudentsByWing(vars: GetStudentsByWingVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentsByWingData, GetStudentsByWingVariables>;
export function getStudentsByWing(dc: DataConnect, vars: GetStudentsByWingVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentsByWingData, GetStudentsByWingVariables>;

interface GetCoordinatorStudentsByWingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoordinatorStudentsByWingVariables): QueryRef<GetCoordinatorStudentsByWingData, GetCoordinatorStudentsByWingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCoordinatorStudentsByWingVariables): QueryRef<GetCoordinatorStudentsByWingData, GetCoordinatorStudentsByWingVariables>;
  operationName: string;
}
export const getCoordinatorStudentsByWingRef: GetCoordinatorStudentsByWingRef;

export function getCoordinatorStudentsByWing(vars: GetCoordinatorStudentsByWingVariables, options?: ExecuteQueryOptions): QueryPromise<GetCoordinatorStudentsByWingData, GetCoordinatorStudentsByWingVariables>;
export function getCoordinatorStudentsByWing(dc: DataConnect, vars: GetCoordinatorStudentsByWingVariables, options?: ExecuteQueryOptions): QueryPromise<GetCoordinatorStudentsByWingData, GetCoordinatorStudentsByWingVariables>;

interface GetPromotionHistoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetPromotionHistoryVariables): QueryRef<GetPromotionHistoryData, GetPromotionHistoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetPromotionHistoryVariables): QueryRef<GetPromotionHistoryData, GetPromotionHistoryVariables>;
  operationName: string;
}
export const getPromotionHistoryRef: GetPromotionHistoryRef;

export function getPromotionHistory(vars?: GetPromotionHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetPromotionHistoryData, GetPromotionHistoryVariables>;
export function getPromotionHistory(dc: DataConnect, vars?: GetPromotionHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetPromotionHistoryData, GetPromotionHistoryVariables>;

interface GetStudentSequenceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStudentSequenceVariables): QueryRef<GetStudentSequenceData, GetStudentSequenceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStudentSequenceVariables): QueryRef<GetStudentSequenceData, GetStudentSequenceVariables>;
  operationName: string;
}
export const getStudentSequenceRef: GetStudentSequenceRef;

export function getStudentSequence(vars: GetStudentSequenceVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentSequenceData, GetStudentSequenceVariables>;
export function getStudentSequence(dc: DataConnect, vars: GetStudentSequenceVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentSequenceData, GetStudentSequenceVariables>;

interface GenerateAdmissionNumberRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GenerateAdmissionNumberVariables): QueryRef<GenerateAdmissionNumberData, GenerateAdmissionNumberVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GenerateAdmissionNumberVariables): QueryRef<GenerateAdmissionNumberData, GenerateAdmissionNumberVariables>;
  operationName: string;
}
export const generateAdmissionNumberRef: GenerateAdmissionNumberRef;

export function generateAdmissionNumber(vars: GenerateAdmissionNumberVariables, options?: ExecuteQueryOptions): QueryPromise<GenerateAdmissionNumberData, GenerateAdmissionNumberVariables>;
export function generateAdmissionNumber(dc: DataConnect, vars: GenerateAdmissionNumberVariables, options?: ExecuteQueryOptions): QueryPromise<GenerateAdmissionNumberData, GenerateAdmissionNumberVariables>;

interface GetLastStudentSerialRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLastStudentSerialVariables): QueryRef<GetLastStudentSerialData, GetLastStudentSerialVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLastStudentSerialVariables): QueryRef<GetLastStudentSerialData, GetLastStudentSerialVariables>;
  operationName: string;
}
export const getLastStudentSerialRef: GetLastStudentSerialRef;

export function getLastStudentSerial(vars: GetLastStudentSerialVariables, options?: ExecuteQueryOptions): QueryPromise<GetLastStudentSerialData, GetLastStudentSerialVariables>;
export function getLastStudentSerial(dc: DataConnect, vars: GetLastStudentSerialVariables, options?: ExecuteQueryOptions): QueryPromise<GetLastStudentSerialData, GetLastStudentSerialVariables>;

interface GetTeachersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTeachersVariables): QueryRef<GetTeachersData, GetTeachersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTeachersVariables): QueryRef<GetTeachersData, GetTeachersVariables>;
  operationName: string;
}
export const getTeachersRef: GetTeachersRef;

export function getTeachers(vars: GetTeachersVariables, options?: ExecuteQueryOptions): QueryPromise<GetTeachersData, GetTeachersVariables>;
export function getTeachers(dc: DataConnect, vars: GetTeachersVariables, options?: ExecuteQueryOptions): QueryPromise<GetTeachersData, GetTeachersVariables>;

interface GetTeachersByBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTeachersByBranchVariables): QueryRef<GetTeachersByBranchData, GetTeachersByBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTeachersByBranchVariables): QueryRef<GetTeachersByBranchData, GetTeachersByBranchVariables>;
  operationName: string;
}
export const getTeachersByBranchRef: GetTeachersByBranchRef;

export function getTeachersByBranch(vars: GetTeachersByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetTeachersByBranchData, GetTeachersByBranchVariables>;
export function getTeachersByBranch(dc: DataConnect, vars: GetTeachersByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetTeachersByBranchData, GetTeachersByBranchVariables>;

interface GetTeachersByWingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTeachersByWingVariables): QueryRef<GetTeachersByWingData, GetTeachersByWingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTeachersByWingVariables): QueryRef<GetTeachersByWingData, GetTeachersByWingVariables>;
  operationName: string;
}
export const getTeachersByWingRef: GetTeachersByWingRef;

export function getTeachersByWing(vars: GetTeachersByWingVariables, options?: ExecuteQueryOptions): QueryPromise<GetTeachersByWingData, GetTeachersByWingVariables>;
export function getTeachersByWing(dc: DataConnect, vars: GetTeachersByWingVariables, options?: ExecuteQueryOptions): QueryPromise<GetTeachersByWingData, GetTeachersByWingVariables>;

interface GetCoordinatorTeachersByWingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCoordinatorTeachersByWingVariables): QueryRef<GetCoordinatorTeachersByWingData, GetCoordinatorTeachersByWingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCoordinatorTeachersByWingVariables): QueryRef<GetCoordinatorTeachersByWingData, GetCoordinatorTeachersByWingVariables>;
  operationName: string;
}
export const getCoordinatorTeachersByWingRef: GetCoordinatorTeachersByWingRef;

export function getCoordinatorTeachersByWing(vars: GetCoordinatorTeachersByWingVariables, options?: ExecuteQueryOptions): QueryPromise<GetCoordinatorTeachersByWingData, GetCoordinatorTeachersByWingVariables>;
export function getCoordinatorTeachersByWing(dc: DataConnect, vars: GetCoordinatorTeachersByWingVariables, options?: ExecuteQueryOptions): QueryPromise<GetCoordinatorTeachersByWingData, GetCoordinatorTeachersByWingVariables>;

interface GetTeacherProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTeacherProfileVariables): QueryRef<GetTeacherProfileData, GetTeacherProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTeacherProfileVariables): QueryRef<GetTeacherProfileData, GetTeacherProfileVariables>;
  operationName: string;
}
export const getTeacherProfileRef: GetTeacherProfileRef;

export function getTeacherProfile(vars: GetTeacherProfileVariables, options?: ExecuteQueryOptions): QueryPromise<GetTeacherProfileData, GetTeacherProfileVariables>;
export function getTeacherProfile(dc: DataConnect, vars: GetTeacherProfileVariables, options?: ExecuteQueryOptions): QueryPromise<GetTeacherProfileData, GetTeacherProfileVariables>;

interface GetTeacherProfileByUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTeacherProfileByUserVariables): QueryRef<GetTeacherProfileByUserData, GetTeacherProfileByUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTeacherProfileByUserVariables): QueryRef<GetTeacherProfileByUserData, GetTeacherProfileByUserVariables>;
  operationName: string;
}
export const getTeacherProfileByUserRef: GetTeacherProfileByUserRef;

export function getTeacherProfileByUser(vars: GetTeacherProfileByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetTeacherProfileByUserData, GetTeacherProfileByUserVariables>;
export function getTeacherProfileByUser(dc: DataConnect, vars: GetTeacherProfileByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetTeacherProfileByUserData, GetTeacherProfileByUserVariables>;

interface GetTeacherDashboardRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTeacherDashboardVariables): QueryRef<GetTeacherDashboardData, GetTeacherDashboardVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTeacherDashboardVariables): QueryRef<GetTeacherDashboardData, GetTeacherDashboardVariables>;
  operationName: string;
}
export const getTeacherDashboardRef: GetTeacherDashboardRef;

export function getTeacherDashboard(vars: GetTeacherDashboardVariables, options?: ExecuteQueryOptions): QueryPromise<GetTeacherDashboardData, GetTeacherDashboardVariables>;
export function getTeacherDashboard(dc: DataConnect, vars: GetTeacherDashboardVariables, options?: ExecuteQueryOptions): QueryPromise<GetTeacherDashboardData, GetTeacherDashboardVariables>;

interface GetSubjectsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetSubjectsVariables): QueryRef<GetSubjectsData, GetSubjectsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetSubjectsVariables): QueryRef<GetSubjectsData, GetSubjectsVariables>;
  operationName: string;
}
export const getSubjectsRef: GetSubjectsRef;

export function getSubjects(vars?: GetSubjectsVariables, options?: ExecuteQueryOptions): QueryPromise<GetSubjectsData, GetSubjectsVariables>;
export function getSubjects(dc: DataConnect, vars?: GetSubjectsVariables, options?: ExecuteQueryOptions): QueryPromise<GetSubjectsData, GetSubjectsVariables>;

interface GetSectionsForTeacherAssignmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSectionsForTeacherAssignmentVariables): QueryRef<GetSectionsForTeacherAssignmentData, GetSectionsForTeacherAssignmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSectionsForTeacherAssignmentVariables): QueryRef<GetSectionsForTeacherAssignmentData, GetSectionsForTeacherAssignmentVariables>;
  operationName: string;
}
export const getSectionsForTeacherAssignmentRef: GetSectionsForTeacherAssignmentRef;

export function getSectionsForTeacherAssignment(vars: GetSectionsForTeacherAssignmentVariables, options?: ExecuteQueryOptions): QueryPromise<GetSectionsForTeacherAssignmentData, GetSectionsForTeacherAssignmentVariables>;
export function getSectionsForTeacherAssignment(dc: DataConnect, vars: GetSectionsForTeacherAssignmentVariables, options?: ExecuteQueryOptions): QueryPromise<GetSectionsForTeacherAssignmentData, GetSectionsForTeacherAssignmentVariables>;

interface GetAccountantsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAccountantsVariables): QueryRef<GetAccountantsData, GetAccountantsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAccountantsVariables): QueryRef<GetAccountantsData, GetAccountantsVariables>;
  operationName: string;
}
export const getAccountantsRef: GetAccountantsRef;

export function getAccountants(vars: GetAccountantsVariables, options?: ExecuteQueryOptions): QueryPromise<GetAccountantsData, GetAccountantsVariables>;
export function getAccountants(dc: DataConnect, vars: GetAccountantsVariables, options?: ExecuteQueryOptions): QueryPromise<GetAccountantsData, GetAccountantsVariables>;

interface GetAccountantProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAccountantProfileVariables): QueryRef<GetAccountantProfileData, GetAccountantProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAccountantProfileVariables): QueryRef<GetAccountantProfileData, GetAccountantProfileVariables>;
  operationName: string;
}
export const getAccountantProfileRef: GetAccountantProfileRef;

export function getAccountantProfile(vars: GetAccountantProfileVariables, options?: ExecuteQueryOptions): QueryPromise<GetAccountantProfileData, GetAccountantProfileVariables>;
export function getAccountantProfile(dc: DataConnect, vars: GetAccountantProfileVariables, options?: ExecuteQueryOptions): QueryPromise<GetAccountantProfileData, GetAccountantProfileVariables>;

interface GetAccountantByUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAccountantByUserVariables): QueryRef<GetAccountantByUserData, GetAccountantByUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAccountantByUserVariables): QueryRef<GetAccountantByUserData, GetAccountantByUserVariables>;
  operationName: string;
}
export const getAccountantByUserRef: GetAccountantByUserRef;

export function getAccountantByUser(vars: GetAccountantByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetAccountantByUserData, GetAccountantByUserVariables>;
export function getAccountantByUser(dc: DataConnect, vars: GetAccountantByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetAccountantByUserData, GetAccountantByUserVariables>;

interface GetFeeCategoriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetFeeCategoriesVariables): QueryRef<GetFeeCategoriesData, GetFeeCategoriesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetFeeCategoriesVariables): QueryRef<GetFeeCategoriesData, GetFeeCategoriesVariables>;
  operationName: string;
}
export const getFeeCategoriesRef: GetFeeCategoriesRef;

export function getFeeCategories(vars?: GetFeeCategoriesVariables, options?: ExecuteQueryOptions): QueryPromise<GetFeeCategoriesData, GetFeeCategoriesVariables>;
export function getFeeCategories(dc: DataConnect, vars?: GetFeeCategoriesVariables, options?: ExecuteQueryOptions): QueryPromise<GetFeeCategoriesData, GetFeeCategoriesVariables>;

interface GetClassTeacherAssignmentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClassTeacherAssignmentsVariables): QueryRef<GetClassTeacherAssignmentsData, GetClassTeacherAssignmentsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetClassTeacherAssignmentsVariables): QueryRef<GetClassTeacherAssignmentsData, GetClassTeacherAssignmentsVariables>;
  operationName: string;
}
export const getClassTeacherAssignmentsRef: GetClassTeacherAssignmentsRef;

export function getClassTeacherAssignments(vars: GetClassTeacherAssignmentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassTeacherAssignmentsData, GetClassTeacherAssignmentsVariables>;
export function getClassTeacherAssignments(dc: DataConnect, vars: GetClassTeacherAssignmentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassTeacherAssignmentsData, GetClassTeacherAssignmentsVariables>;

interface GetClassFeesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClassFeesVariables): QueryRef<GetClassFeesData, GetClassFeesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetClassFeesVariables): QueryRef<GetClassFeesData, GetClassFeesVariables>;
  operationName: string;
}
export const getClassFeesRef: GetClassFeesRef;

export function getClassFees(vars: GetClassFeesVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassFeesData, GetClassFeesVariables>;
export function getClassFees(dc: DataConnect, vars: GetClassFeesVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassFeesData, GetClassFeesVariables>;

interface GetStudentFeeProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStudentFeeProfileVariables): QueryRef<GetStudentFeeProfileData, GetStudentFeeProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStudentFeeProfileVariables): QueryRef<GetStudentFeeProfileData, GetStudentFeeProfileVariables>;
  operationName: string;
}
export const getStudentFeeProfileRef: GetStudentFeeProfileRef;

export function getStudentFeeProfile(vars: GetStudentFeeProfileVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentFeeProfileData, GetStudentFeeProfileVariables>;
export function getStudentFeeProfile(dc: DataConnect, vars: GetStudentFeeProfileVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentFeeProfileData, GetStudentFeeProfileVariables>;

interface GetPaymentHistoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPaymentHistoryVariables): QueryRef<GetPaymentHistoryData, GetPaymentHistoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPaymentHistoryVariables): QueryRef<GetPaymentHistoryData, GetPaymentHistoryVariables>;
  operationName: string;
}
export const getPaymentHistoryRef: GetPaymentHistoryRef;

export function getPaymentHistory(vars: GetPaymentHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetPaymentHistoryData, GetPaymentHistoryVariables>;
export function getPaymentHistory(dc: DataConnect, vars: GetPaymentHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetPaymentHistoryData, GetPaymentHistoryVariables>;

interface GetReceiptSequenceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetReceiptSequenceVariables): QueryRef<GetReceiptSequenceData, GetReceiptSequenceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetReceiptSequenceVariables): QueryRef<GetReceiptSequenceData, GetReceiptSequenceVariables>;
  operationName: string;
}
export const getReceiptSequenceRef: GetReceiptSequenceRef;

export function getReceiptSequence(vars: GetReceiptSequenceVariables, options?: ExecuteQueryOptions): QueryPromise<GetReceiptSequenceData, GetReceiptSequenceVariables>;
export function getReceiptSequence(dc: DataConnect, vars: GetReceiptSequenceVariables, options?: ExecuteQueryOptions): QueryPromise<GetReceiptSequenceData, GetReceiptSequenceVariables>;

interface GetFeeReportsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFeeReportsVariables): QueryRef<GetFeeReportsData, GetFeeReportsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetFeeReportsVariables): QueryRef<GetFeeReportsData, GetFeeReportsVariables>;
  operationName: string;
}
export const getFeeReportsRef: GetFeeReportsRef;

export function getFeeReports(vars: GetFeeReportsVariables, options?: ExecuteQueryOptions): QueryPromise<GetFeeReportsData, GetFeeReportsVariables>;
export function getFeeReports(dc: DataConnect, vars: GetFeeReportsVariables, options?: ExecuteQueryOptions): QueryPromise<GetFeeReportsData, GetFeeReportsVariables>;

interface GetGlobalStudentExplorerRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetGlobalStudentExplorerVariables): QueryRef<GetGlobalStudentExplorerData, GetGlobalStudentExplorerVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetGlobalStudentExplorerVariables): QueryRef<GetGlobalStudentExplorerData, GetGlobalStudentExplorerVariables>;
  operationName: string;
}
export const getGlobalStudentExplorerRef: GetGlobalStudentExplorerRef;

export function getGlobalStudentExplorer(vars?: GetGlobalStudentExplorerVariables, options?: ExecuteQueryOptions): QueryPromise<GetGlobalStudentExplorerData, GetGlobalStudentExplorerVariables>;
export function getGlobalStudentExplorer(dc: DataConnect, vars?: GetGlobalStudentExplorerVariables, options?: ExecuteQueryOptions): QueryPromise<GetGlobalStudentExplorerData, GetGlobalStudentExplorerVariables>;

interface GetGlobalReportsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetGlobalReportsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetGlobalReportsData, undefined>;
  operationName: string;
}
export const getGlobalReportsRef: GetGlobalReportsRef;

export function getGlobalReports(options?: ExecuteQueryOptions): QueryPromise<GetGlobalReportsData, undefined>;
export function getGlobalReports(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetGlobalReportsData, undefined>;

interface GetAuditLogsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetAuditLogsVariables): QueryRef<GetAuditLogsData, GetAuditLogsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetAuditLogsVariables): QueryRef<GetAuditLogsData, GetAuditLogsVariables>;
  operationName: string;
}
export const getAuditLogsRef: GetAuditLogsRef;

export function getAuditLogs(vars?: GetAuditLogsVariables, options?: ExecuteQueryOptions): QueryPromise<GetAuditLogsData, GetAuditLogsVariables>;
export function getAuditLogs(dc: DataConnect, vars?: GetAuditLogsVariables, options?: ExecuteQueryOptions): QueryPromise<GetAuditLogsData, GetAuditLogsVariables>;

interface GetClassFeeReportRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClassFeeReportVariables): QueryRef<GetClassFeeReportData, GetClassFeeReportVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetClassFeeReportVariables): QueryRef<GetClassFeeReportData, GetClassFeeReportVariables>;
  operationName: string;
}
export const getClassFeeReportRef: GetClassFeeReportRef;

export function getClassFeeReport(vars: GetClassFeeReportVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassFeeReportData, GetClassFeeReportVariables>;
export function getClassFeeReport(dc: DataConnect, vars: GetClassFeeReportVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassFeeReportData, GetClassFeeReportVariables>;

interface GetClassStudentsFeeStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClassStudentsFeeStatusVariables): QueryRef<GetClassStudentsFeeStatusData, GetClassStudentsFeeStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetClassStudentsFeeStatusVariables): QueryRef<GetClassStudentsFeeStatusData, GetClassStudentsFeeStatusVariables>;
  operationName: string;
}
export const getClassStudentsFeeStatusRef: GetClassStudentsFeeStatusRef;

export function getClassStudentsFeeStatus(vars: GetClassStudentsFeeStatusVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassStudentsFeeStatusData, GetClassStudentsFeeStatusVariables>;
export function getClassStudentsFeeStatus(dc: DataConnect, vars: GetClassStudentsFeeStatusVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassStudentsFeeStatusData, GetClassStudentsFeeStatusVariables>;

interface GetClassCollectionSummaryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClassCollectionSummaryVariables): QueryRef<GetClassCollectionSummaryData, GetClassCollectionSummaryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetClassCollectionSummaryVariables): QueryRef<GetClassCollectionSummaryData, GetClassCollectionSummaryVariables>;
  operationName: string;
}
export const getClassCollectionSummaryRef: GetClassCollectionSummaryRef;

export function getClassCollectionSummary(vars: GetClassCollectionSummaryVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassCollectionSummaryData, GetClassCollectionSummaryVariables>;
export function getClassCollectionSummary(dc: DataConnect, vars: GetClassCollectionSummaryVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassCollectionSummaryData, GetClassCollectionSummaryVariables>;

interface GetClassOutstandingSummaryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClassOutstandingSummaryVariables): QueryRef<GetClassOutstandingSummaryData, GetClassOutstandingSummaryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetClassOutstandingSummaryVariables): QueryRef<GetClassOutstandingSummaryData, GetClassOutstandingSummaryVariables>;
  operationName: string;
}
export const getClassOutstandingSummaryRef: GetClassOutstandingSummaryRef;

export function getClassOutstandingSummary(vars: GetClassOutstandingSummaryVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassOutstandingSummaryData, GetClassOutstandingSummaryVariables>;
export function getClassOutstandingSummary(dc: DataConnect, vars: GetClassOutstandingSummaryVariables, options?: ExecuteQueryOptions): QueryPromise<GetClassOutstandingSummaryData, GetClassOutstandingSummaryVariables>;

interface GetUsersByPhoneRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUsersByPhoneVariables): QueryRef<GetUsersByPhoneData, GetUsersByPhoneVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUsersByPhoneVariables): QueryRef<GetUsersByPhoneData, GetUsersByPhoneVariables>;
  operationName: string;
}
export const getUsersByPhoneRef: GetUsersByPhoneRef;

export function getUsersByPhone(vars: GetUsersByPhoneVariables, options?: ExecuteQueryOptions): QueryPromise<GetUsersByPhoneData, GetUsersByPhoneVariables>;
export function getUsersByPhone(dc: DataConnect, vars: GetUsersByPhoneVariables, options?: ExecuteQueryOptions): QueryPromise<GetUsersByPhoneData, GetUsersByPhoneVariables>;

interface GetNoticesByBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetNoticesByBranchVariables): QueryRef<GetNoticesByBranchData, GetNoticesByBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetNoticesByBranchVariables): QueryRef<GetNoticesByBranchData, GetNoticesByBranchVariables>;
  operationName: string;
}
export const getNoticesByBranchRef: GetNoticesByBranchRef;

export function getNoticesByBranch(vars: GetNoticesByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetNoticesByBranchData, GetNoticesByBranchVariables>;
export function getNoticesByBranch(dc: DataConnect, vars: GetNoticesByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetNoticesByBranchData, GetNoticesByBranchVariables>;

interface GetNoticesByBranchCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetNoticesByBranchCategoryVariables): QueryRef<GetNoticesByBranchCategoryData, GetNoticesByBranchCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetNoticesByBranchCategoryVariables): QueryRef<GetNoticesByBranchCategoryData, GetNoticesByBranchCategoryVariables>;
  operationName: string;
}
export const getNoticesByBranchCategoryRef: GetNoticesByBranchCategoryRef;

export function getNoticesByBranchCategory(vars: GetNoticesByBranchCategoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetNoticesByBranchCategoryData, GetNoticesByBranchCategoryVariables>;
export function getNoticesByBranchCategory(dc: DataConnect, vars: GetNoticesByBranchCategoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetNoticesByBranchCategoryData, GetNoticesByBranchCategoryVariables>;

interface GetTimetableForSectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTimetableForSectionVariables): QueryRef<GetTimetableForSectionData, GetTimetableForSectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTimetableForSectionVariables): QueryRef<GetTimetableForSectionData, GetTimetableForSectionVariables>;
  operationName: string;
}
export const getTimetableForSectionRef: GetTimetableForSectionRef;

export function getTimetableForSection(vars: GetTimetableForSectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetTimetableForSectionData, GetTimetableForSectionVariables>;
export function getTimetableForSection(dc: DataConnect, vars: GetTimetableForSectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetTimetableForSectionData, GetTimetableForSectionVariables>;

interface GetTimetablesForBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTimetablesForBranchVariables): QueryRef<GetTimetablesForBranchData, GetTimetablesForBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTimetablesForBranchVariables): QueryRef<GetTimetablesForBranchData, GetTimetablesForBranchVariables>;
  operationName: string;
}
export const getTimetablesForBranchRef: GetTimetablesForBranchRef;

export function getTimetablesForBranch(vars: GetTimetablesForBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetTimetablesForBranchData, GetTimetablesForBranchVariables>;
export function getTimetablesForBranch(dc: DataConnect, vars: GetTimetablesForBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetTimetablesForBranchData, GetTimetablesForBranchVariables>;

interface GetTimetablesForWingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTimetablesForWingVariables): QueryRef<GetTimetablesForWingData, GetTimetablesForWingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTimetablesForWingVariables): QueryRef<GetTimetablesForWingData, GetTimetablesForWingVariables>;
  operationName: string;
}
export const getTimetablesForWingRef: GetTimetablesForWingRef;

export function getTimetablesForWing(vars: GetTimetablesForWingVariables, options?: ExecuteQueryOptions): QueryPromise<GetTimetablesForWingData, GetTimetablesForWingVariables>;
export function getTimetablesForWing(dc: DataConnect, vars: GetTimetablesForWingVariables, options?: ExecuteQueryOptions): QueryPromise<GetTimetablesForWingData, GetTimetablesForWingVariables>;

interface GetTimetableForTeacherRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTimetableForTeacherVariables): QueryRef<GetTimetableForTeacherData, GetTimetableForTeacherVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTimetableForTeacherVariables): QueryRef<GetTimetableForTeacherData, GetTimetableForTeacherVariables>;
  operationName: string;
}
export const getTimetableForTeacherRef: GetTimetableForTeacherRef;

export function getTimetableForTeacher(vars: GetTimetableForTeacherVariables, options?: ExecuteQueryOptions): QueryPromise<GetTimetableForTeacherData, GetTimetableForTeacherVariables>;
export function getTimetableForTeacher(dc: DataConnect, vars: GetTimetableForTeacherVariables, options?: ExecuteQueryOptions): QueryPromise<GetTimetableForTeacherData, GetTimetableForTeacherVariables>;

interface GetSuggestionsByParentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSuggestionsByParentVariables): QueryRef<GetSuggestionsByParentData, GetSuggestionsByParentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSuggestionsByParentVariables): QueryRef<GetSuggestionsByParentData, GetSuggestionsByParentVariables>;
  operationName: string;
}
export const getSuggestionsByParentRef: GetSuggestionsByParentRef;

export function getSuggestionsByParent(vars: GetSuggestionsByParentVariables, options?: ExecuteQueryOptions): QueryPromise<GetSuggestionsByParentData, GetSuggestionsByParentVariables>;
export function getSuggestionsByParent(dc: DataConnect, vars: GetSuggestionsByParentVariables, options?: ExecuteQueryOptions): QueryPromise<GetSuggestionsByParentData, GetSuggestionsByParentVariables>;

interface GetSuggestionsByBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSuggestionsByBranchVariables): QueryRef<GetSuggestionsByBranchData, GetSuggestionsByBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSuggestionsByBranchVariables): QueryRef<GetSuggestionsByBranchData, GetSuggestionsByBranchVariables>;
  operationName: string;
}
export const getSuggestionsByBranchRef: GetSuggestionsByBranchRef;

export function getSuggestionsByBranch(vars: GetSuggestionsByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetSuggestionsByBranchData, GetSuggestionsByBranchVariables>;
export function getSuggestionsByBranch(dc: DataConnect, vars: GetSuggestionsByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetSuggestionsByBranchData, GetSuggestionsByBranchVariables>;

interface GetNotificationsByUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetNotificationsByUserVariables): QueryRef<GetNotificationsByUserData, GetNotificationsByUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetNotificationsByUserVariables): QueryRef<GetNotificationsByUserData, GetNotificationsByUserVariables>;
  operationName: string;
}
export const getNotificationsByUserRef: GetNotificationsByUserRef;

export function getNotificationsByUser(vars: GetNotificationsByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetNotificationsByUserData, GetNotificationsByUserVariables>;
export function getNotificationsByUser(dc: DataConnect, vars: GetNotificationsByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetNotificationsByUserData, GetNotificationsByUserVariables>;

interface GetUnreadNotificationCountRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUnreadNotificationCountVariables): QueryRef<GetUnreadNotificationCountData, GetUnreadNotificationCountVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUnreadNotificationCountVariables): QueryRef<GetUnreadNotificationCountData, GetUnreadNotificationCountVariables>;
  operationName: string;
}
export const getUnreadNotificationCountRef: GetUnreadNotificationCountRef;

export function getUnreadNotificationCount(vars: GetUnreadNotificationCountVariables, options?: ExecuteQueryOptions): QueryPromise<GetUnreadNotificationCountData, GetUnreadNotificationCountVariables>;
export function getUnreadNotificationCount(dc: DataConnect, vars: GetUnreadNotificationCountVariables, options?: ExecuteQueryOptions): QueryPromise<GetUnreadNotificationCountData, GetUnreadNotificationCountVariables>;

interface GetBranchStaffUserIdsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBranchStaffUserIdsVariables): QueryRef<GetBranchStaffUserIdsData, GetBranchStaffUserIdsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetBranchStaffUserIdsVariables): QueryRef<GetBranchStaffUserIdsData, GetBranchStaffUserIdsVariables>;
  operationName: string;
}
export const getBranchStaffUserIdsRef: GetBranchStaffUserIdsRef;

export function getBranchStaffUserIds(vars: GetBranchStaffUserIdsVariables, options?: ExecuteQueryOptions): QueryPromise<GetBranchStaffUserIdsData, GetBranchStaffUserIdsVariables>;
export function getBranchStaffUserIds(dc: DataConnect, vars: GetBranchStaffUserIdsVariables, options?: ExecuteQueryOptions): QueryPromise<GetBranchStaffUserIdsData, GetBranchStaffUserIdsVariables>;

interface GetBranchStudentsWithParentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBranchStudentsWithParentsVariables): QueryRef<GetBranchStudentsWithParentsData, GetBranchStudentsWithParentsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetBranchStudentsWithParentsVariables): QueryRef<GetBranchStudentsWithParentsData, GetBranchStudentsWithParentsVariables>;
  operationName: string;
}
export const getBranchStudentsWithParentsRef: GetBranchStudentsWithParentsRef;

export function getBranchStudentsWithParents(vars: GetBranchStudentsWithParentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetBranchStudentsWithParentsData, GetBranchStudentsWithParentsVariables>;
export function getBranchStudentsWithParents(dc: DataConnect, vars: GetBranchStudentsWithParentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetBranchStudentsWithParentsData, GetBranchStudentsWithParentsVariables>;

interface GetUserForRoleChangeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserForRoleChangeVariables): QueryRef<GetUserForRoleChangeData, GetUserForRoleChangeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserForRoleChangeVariables): QueryRef<GetUserForRoleChangeData, GetUserForRoleChangeVariables>;
  operationName: string;
}
export const getUserForRoleChangeRef: GetUserForRoleChangeRef;

export function getUserForRoleChange(vars: GetUserForRoleChangeVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserForRoleChangeData, GetUserForRoleChangeVariables>;
export function getUserForRoleChange(dc: DataConnect, vars: GetUserForRoleChangeVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserForRoleChangeData, GetUserForRoleChangeVariables>;

interface GetAcademicYearsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAcademicYearsVariables): QueryRef<GetAcademicYearsData, GetAcademicYearsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAcademicYearsVariables): QueryRef<GetAcademicYearsData, GetAcademicYearsVariables>;
  operationName: string;
}
export const getAcademicYearsRef: GetAcademicYearsRef;

export function getAcademicYears(vars: GetAcademicYearsVariables, options?: ExecuteQueryOptions): QueryPromise<GetAcademicYearsData, GetAcademicYearsVariables>;
export function getAcademicYears(dc: DataConnect, vars: GetAcademicYearsVariables, options?: ExecuteQueryOptions): QueryPromise<GetAcademicYearsData, GetAcademicYearsVariables>;

interface GetActiveAcademicYearRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetActiveAcademicYearVariables): QueryRef<GetActiveAcademicYearData, GetActiveAcademicYearVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetActiveAcademicYearVariables): QueryRef<GetActiveAcademicYearData, GetActiveAcademicYearVariables>;
  operationName: string;
}
export const getActiveAcademicYearRef: GetActiveAcademicYearRef;

export function getActiveAcademicYear(vars: GetActiveAcademicYearVariables, options?: ExecuteQueryOptions): QueryPromise<GetActiveAcademicYearData, GetActiveAcademicYearVariables>;
export function getActiveAcademicYear(dc: DataConnect, vars: GetActiveAcademicYearVariables, options?: ExecuteQueryOptions): QueryPromise<GetActiveAcademicYearData, GetActiveAcademicYearVariables>;

interface GetBranchPromotionHistoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBranchPromotionHistoryVariables): QueryRef<GetBranchPromotionHistoryData, GetBranchPromotionHistoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetBranchPromotionHistoryVariables): QueryRef<GetBranchPromotionHistoryData, GetBranchPromotionHistoryVariables>;
  operationName: string;
}
export const getBranchPromotionHistoryRef: GetBranchPromotionHistoryRef;

export function getBranchPromotionHistory(vars: GetBranchPromotionHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetBranchPromotionHistoryData, GetBranchPromotionHistoryVariables>;
export function getBranchPromotionHistory(dc: DataConnect, vars: GetBranchPromotionHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetBranchPromotionHistoryData, GetBranchPromotionHistoryVariables>;

interface GetHolidaysByBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetHolidaysByBranchVariables): QueryRef<GetHolidaysByBranchData, GetHolidaysByBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetHolidaysByBranchVariables): QueryRef<GetHolidaysByBranchData, GetHolidaysByBranchVariables>;
  operationName: string;
}
export const getHolidaysByBranchRef: GetHolidaysByBranchRef;

export function getHolidaysByBranch(vars: GetHolidaysByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetHolidaysByBranchData, GetHolidaysByBranchVariables>;
export function getHolidaysByBranch(dc: DataConnect, vars: GetHolidaysByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetHolidaysByBranchData, GetHolidaysByBranchVariables>;

interface GetHolidaysByMonthRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetHolidaysByMonthVariables): QueryRef<GetHolidaysByMonthData, GetHolidaysByMonthVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetHolidaysByMonthVariables): QueryRef<GetHolidaysByMonthData, GetHolidaysByMonthVariables>;
  operationName: string;
}
export const getHolidaysByMonthRef: GetHolidaysByMonthRef;

export function getHolidaysByMonth(vars: GetHolidaysByMonthVariables, options?: ExecuteQueryOptions): QueryPromise<GetHolidaysByMonthData, GetHolidaysByMonthVariables>;
export function getHolidaysByMonth(dc: DataConnect, vars: GetHolidaysByMonthVariables, options?: ExecuteQueryOptions): QueryPromise<GetHolidaysByMonthData, GetHolidaysByMonthVariables>;

interface GetAttendanceLockStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAttendanceLockStatusVariables): QueryRef<GetAttendanceLockStatusData, GetAttendanceLockStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAttendanceLockStatusVariables): QueryRef<GetAttendanceLockStatusData, GetAttendanceLockStatusVariables>;
  operationName: string;
}
export const getAttendanceLockStatusRef: GetAttendanceLockStatusRef;

export function getAttendanceLockStatus(vars: GetAttendanceLockStatusVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceLockStatusData, GetAttendanceLockStatusVariables>;
export function getAttendanceLockStatus(dc: DataConnect, vars: GetAttendanceLockStatusVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceLockStatusData, GetAttendanceLockStatusVariables>;

interface GetAttendanceAuditLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAttendanceAuditLogVariables): QueryRef<GetAttendanceAuditLogData, GetAttendanceAuditLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAttendanceAuditLogVariables): QueryRef<GetAttendanceAuditLogData, GetAttendanceAuditLogVariables>;
  operationName: string;
}
export const getAttendanceAuditLogRef: GetAttendanceAuditLogRef;

export function getAttendanceAuditLog(vars: GetAttendanceAuditLogVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceAuditLogData, GetAttendanceAuditLogVariables>;
export function getAttendanceAuditLog(dc: DataConnect, vars: GetAttendanceAuditLogVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceAuditLogData, GetAttendanceAuditLogVariables>;

interface GetAttendanceAuditLogByBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAttendanceAuditLogByBranchVariables): QueryRef<GetAttendanceAuditLogByBranchData, GetAttendanceAuditLogByBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAttendanceAuditLogByBranchVariables): QueryRef<GetAttendanceAuditLogByBranchData, GetAttendanceAuditLogByBranchVariables>;
  operationName: string;
}
export const getAttendanceAuditLogByBranchRef: GetAttendanceAuditLogByBranchRef;

export function getAttendanceAuditLogByBranch(vars: GetAttendanceAuditLogByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceAuditLogByBranchData, GetAttendanceAuditLogByBranchVariables>;
export function getAttendanceAuditLogByBranch(dc: DataConnect, vars: GetAttendanceAuditLogByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceAuditLogByBranchData, GetAttendanceAuditLogByBranchVariables>;

interface GetAttendanceAuditLogBySectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAttendanceAuditLogBySectionVariables): QueryRef<GetAttendanceAuditLogBySectionData, GetAttendanceAuditLogBySectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAttendanceAuditLogBySectionVariables): QueryRef<GetAttendanceAuditLogBySectionData, GetAttendanceAuditLogBySectionVariables>;
  operationName: string;
}
export const getAttendanceAuditLogBySectionRef: GetAttendanceAuditLogBySectionRef;

export function getAttendanceAuditLogBySection(vars: GetAttendanceAuditLogBySectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceAuditLogBySectionData, GetAttendanceAuditLogBySectionVariables>;
export function getAttendanceAuditLogBySection(dc: DataConnect, vars: GetAttendanceAuditLogBySectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceAuditLogBySectionData, GetAttendanceAuditLogBySectionVariables>;

interface GetAttendanceSummaryByStudentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAttendanceSummaryByStudentVariables): QueryRef<GetAttendanceSummaryByStudentData, GetAttendanceSummaryByStudentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAttendanceSummaryByStudentVariables): QueryRef<GetAttendanceSummaryByStudentData, GetAttendanceSummaryByStudentVariables>;
  operationName: string;
}
export const getAttendanceSummaryByStudentRef: GetAttendanceSummaryByStudentRef;

export function getAttendanceSummaryByStudent(vars: GetAttendanceSummaryByStudentVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceSummaryByStudentData, GetAttendanceSummaryByStudentVariables>;
export function getAttendanceSummaryByStudent(dc: DataConnect, vars: GetAttendanceSummaryByStudentVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceSummaryByStudentData, GetAttendanceSummaryByStudentVariables>;

interface GetAttendanceSummaryBySectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAttendanceSummaryBySectionVariables): QueryRef<GetAttendanceSummaryBySectionData, GetAttendanceSummaryBySectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAttendanceSummaryBySectionVariables): QueryRef<GetAttendanceSummaryBySectionData, GetAttendanceSummaryBySectionVariables>;
  operationName: string;
}
export const getAttendanceSummaryBySectionRef: GetAttendanceSummaryBySectionRef;

export function getAttendanceSummaryBySection(vars: GetAttendanceSummaryBySectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceSummaryBySectionData, GetAttendanceSummaryBySectionVariables>;
export function getAttendanceSummaryBySection(dc: DataConnect, vars: GetAttendanceSummaryBySectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceSummaryBySectionData, GetAttendanceSummaryBySectionVariables>;

interface GetLowAttendanceStudentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLowAttendanceStudentsVariables): QueryRef<GetLowAttendanceStudentsData, GetLowAttendanceStudentsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLowAttendanceStudentsVariables): QueryRef<GetLowAttendanceStudentsData, GetLowAttendanceStudentsVariables>;
  operationName: string;
}
export const getLowAttendanceStudentsRef: GetLowAttendanceStudentsRef;

export function getLowAttendanceStudents(vars: GetLowAttendanceStudentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetLowAttendanceStudentsData, GetLowAttendanceStudentsVariables>;
export function getLowAttendanceStudents(dc: DataConnect, vars: GetLowAttendanceStudentsVariables, options?: ExecuteQueryOptions): QueryPromise<GetLowAttendanceStudentsData, GetLowAttendanceStudentsVariables>;

interface GetDailyAttendanceReportRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDailyAttendanceReportVariables): QueryRef<GetDailyAttendanceReportData, GetDailyAttendanceReportVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetDailyAttendanceReportVariables): QueryRef<GetDailyAttendanceReportData, GetDailyAttendanceReportVariables>;
  operationName: string;
}
export const getDailyAttendanceReportRef: GetDailyAttendanceReportRef;

export function getDailyAttendanceReport(vars: GetDailyAttendanceReportVariables, options?: ExecuteQueryOptions): QueryPromise<GetDailyAttendanceReportData, GetDailyAttendanceReportVariables>;
export function getDailyAttendanceReport(dc: DataConnect, vars: GetDailyAttendanceReportVariables, options?: ExecuteQueryOptions): QueryPromise<GetDailyAttendanceReportData, GetDailyAttendanceReportVariables>;

interface GetMonthlyAttendanceReportRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMonthlyAttendanceReportVariables): QueryRef<GetMonthlyAttendanceReportData, GetMonthlyAttendanceReportVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMonthlyAttendanceReportVariables): QueryRef<GetMonthlyAttendanceReportData, GetMonthlyAttendanceReportVariables>;
  operationName: string;
}
export const getMonthlyAttendanceReportRef: GetMonthlyAttendanceReportRef;

export function getMonthlyAttendanceReport(vars: GetMonthlyAttendanceReportVariables, options?: ExecuteQueryOptions): QueryPromise<GetMonthlyAttendanceReportData, GetMonthlyAttendanceReportVariables>;
export function getMonthlyAttendanceReport(dc: DataConnect, vars: GetMonthlyAttendanceReportVariables, options?: ExecuteQueryOptions): QueryPromise<GetMonthlyAttendanceReportData, GetMonthlyAttendanceReportVariables>;

interface GetAttendanceAlertLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAttendanceAlertLogVariables): QueryRef<GetAttendanceAlertLogData, GetAttendanceAlertLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAttendanceAlertLogVariables): QueryRef<GetAttendanceAlertLogData, GetAttendanceAlertLogVariables>;
  operationName: string;
}
export const getAttendanceAlertLogRef: GetAttendanceAlertLogRef;

export function getAttendanceAlertLog(vars: GetAttendanceAlertLogVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceAlertLogData, GetAttendanceAlertLogVariables>;
export function getAttendanceAlertLog(dc: DataConnect, vars: GetAttendanceAlertLogVariables, options?: ExecuteQueryOptions): QueryPromise<GetAttendanceAlertLogData, GetAttendanceAlertLogVariables>;

interface GetExamsByBranchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetExamsByBranchVariables): QueryRef<GetExamsByBranchData, GetExamsByBranchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetExamsByBranchVariables): QueryRef<GetExamsByBranchData, GetExamsByBranchVariables>;
  operationName: string;
}
export const getExamsByBranchRef: GetExamsByBranchRef;

export function getExamsByBranch(vars: GetExamsByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetExamsByBranchData, GetExamsByBranchVariables>;
export function getExamsByBranch(dc: DataConnect, vars: GetExamsByBranchVariables, options?: ExecuteQueryOptions): QueryPromise<GetExamsByBranchData, GetExamsByBranchVariables>;

interface GetExamDetailsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetExamDetailsVariables): QueryRef<GetExamDetailsData, GetExamDetailsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetExamDetailsVariables): QueryRef<GetExamDetailsData, GetExamDetailsVariables>;
  operationName: string;
}
export const getExamDetailsRef: GetExamDetailsRef;

export function getExamDetails(vars: GetExamDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetExamDetailsData, GetExamDetailsVariables>;
export function getExamDetails(dc: DataConnect, vars: GetExamDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetExamDetailsData, GetExamDetailsVariables>;

interface GetMarksForSectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMarksForSectionVariables): QueryRef<GetMarksForSectionData, GetMarksForSectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMarksForSectionVariables): QueryRef<GetMarksForSectionData, GetMarksForSectionVariables>;
  operationName: string;
}
export const getMarksForSectionRef: GetMarksForSectionRef;

export function getMarksForSection(vars: GetMarksForSectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetMarksForSectionData, GetMarksForSectionVariables>;
export function getMarksForSection(dc: DataConnect, vars: GetMarksForSectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetMarksForSectionData, GetMarksForSectionVariables>;

interface GetStudentResultsForParentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStudentResultsForParentVariables): QueryRef<GetStudentResultsForParentData, GetStudentResultsForParentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStudentResultsForParentVariables): QueryRef<GetStudentResultsForParentData, GetStudentResultsForParentVariables>;
  operationName: string;
}
export const getStudentResultsForParentRef: GetStudentResultsForParentRef;

export function getStudentResultsForParent(vars: GetStudentResultsForParentVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentResultsForParentData, GetStudentResultsForParentVariables>;
export function getStudentResultsForParent(dc: DataConnect, vars: GetStudentResultsForParentVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentResultsForParentData, GetStudentResultsForParentVariables>;

interface GetStudentResultDetailRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStudentResultDetailVariables): QueryRef<GetStudentResultDetailData, GetStudentResultDetailVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStudentResultDetailVariables): QueryRef<GetStudentResultDetailData, GetStudentResultDetailVariables>;
  operationName: string;
}
export const getStudentResultDetailRef: GetStudentResultDetailRef;

export function getStudentResultDetail(vars: GetStudentResultDetailVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentResultDetailData, GetStudentResultDetailVariables>;
export function getStudentResultDetail(dc: DataConnect, vars: GetStudentResultDetailVariables, options?: ExecuteQueryOptions): QueryPromise<GetStudentResultDetailData, GetStudentResultDetailVariables>;

interface GetExamAnalyticsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetExamAnalyticsVariables): QueryRef<GetExamAnalyticsData, GetExamAnalyticsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetExamAnalyticsVariables): QueryRef<GetExamAnalyticsData, GetExamAnalyticsVariables>;
  operationName: string;
}
export const getExamAnalyticsRef: GetExamAnalyticsRef;

export function getExamAnalytics(vars: GetExamAnalyticsVariables, options?: ExecuteQueryOptions): QueryPromise<GetExamAnalyticsData, GetExamAnalyticsVariables>;
export function getExamAnalytics(dc: DataConnect, vars: GetExamAnalyticsVariables, options?: ExecuteQueryOptions): QueryPromise<GetExamAnalyticsData, GetExamAnalyticsVariables>;

interface GetPublishedExamsForSectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPublishedExamsForSectionVariables): QueryRef<GetPublishedExamsForSectionData, GetPublishedExamsForSectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPublishedExamsForSectionVariables): QueryRef<GetPublishedExamsForSectionData, GetPublishedExamsForSectionVariables>;
  operationName: string;
}
export const getPublishedExamsForSectionRef: GetPublishedExamsForSectionRef;

export function getPublishedExamsForSection(vars: GetPublishedExamsForSectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetPublishedExamsForSectionData, GetPublishedExamsForSectionVariables>;
export function getPublishedExamsForSection(dc: DataConnect, vars: GetPublishedExamsForSectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetPublishedExamsForSectionData, GetPublishedExamsForSectionVariables>;

interface GetExamsBySectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetExamsBySectionVariables): QueryRef<GetExamsBySectionData, GetExamsBySectionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetExamsBySectionVariables): QueryRef<GetExamsBySectionData, GetExamsBySectionVariables>;
  operationName: string;
}
export const getExamsBySectionRef: GetExamsBySectionRef;

export function getExamsBySection(vars: GetExamsBySectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetExamsBySectionData, GetExamsBySectionVariables>;
export function getExamsBySection(dc: DataConnect, vars: GetExamsBySectionVariables, options?: ExecuteQueryOptions): QueryPromise<GetExamsBySectionData, GetExamsBySectionVariables>;

