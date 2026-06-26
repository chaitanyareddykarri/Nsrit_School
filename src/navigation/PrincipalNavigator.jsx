import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DashboardScreen from '../screens/principal/DashboardScreen';
import AcademicStructureScreen from '../screens/principal/AcademicStructureScreen';
import CreateSectionScreen from '../screens/principal/CreateSectionScreen';
import ViewAllAttendanceScreen from '../screens/principal/ViewAllAttendanceScreen';
import EditAttendanceScreen from '../screens/coordinator/EditAttendanceScreen';
import CoordinatorManagementScreen from '../screens/principal/CoordinatorManagementScreen';
import CreateCoordinatorScreen from '../screens/principal/CreateCoordinatorScreen';
import EditCoordinatorScreen from '../screens/principal/EditCoordinatorScreen';
import CoordinatorDetailsScreen from '../screens/principal/CoordinatorDetailsScreen';
import ClassManagementScreen from '../screens/principal/ClassManagementScreen';
import SectionManagementScreen from '../screens/principal/SectionManagementScreen';
import SectionDetailsScreen from '../screens/principal/SectionDetailsScreen';
import AssignClassTeacherScreen from '../screens/principal/AssignClassTeacherScreen';
import PromotionManagementScreen from '../screens/principal/PromotionManagementScreen';
import PromotionHistoryScreen from '../screens/principal/PromotionHistoryScreen';
import TransferStudentScreen from '../screens/students/TransferStudentScreen';
import AddStudentScreen from '../screens/students/AddStudentScreen';
import EditStudentScreen from '../screens/students/EditStudentScreen';
import StudentDetailsScreen from '../screens/students/StudentDetailsScreen';
import StudentManagementScreen from '../screens/students/StudentManagementScreen';
import BulkStudentImportScreen from '../screens/students/BulkStudentImportScreen';
import StudentSearchScreen from '../screens/students/StudentSearchScreen';
import TeacherManagementScreen from '../screens/teachers/TeacherManagementScreen';
import CreateTeacherScreen from '../screens/teachers/CreateTeacherScreen';
import EditTeacherScreen from '../screens/teachers/EditTeacherScreen';
import TeacherDetailsScreen from '../screens/teachers/TeacherDetailsScreen';
import TeacherProfileScreen from '../screens/teachers/TeacherProfileScreen';
import SubjectManagementScreen from '../screens/teachers/SubjectManagementScreen';
import AssignSubjectsScreen from '../screens/teachers/AssignSubjectsScreen';
import AccountantManagementScreen from '../screens/principal/AccountantManagementScreen';
import CreateAccountantScreen from '../screens/principal/CreateAccountantScreen';
import EditAccountantScreen from '../screens/principal/EditAccountantScreen';
import AccountantProfileScreen from '../screens/principal/AccountantProfileScreen';
import {renderFeeStackScreens} from './FeeStackScreens';
import PrincipalProfileScreen from '../screens/principal/ProfileScreen';
import NoticeBoardScreen from '../screens/principal/NoticeBoardScreen';
import PostNoticeScreen from '../screens/coordinator/PostNoticeScreen';
import TimetableDashboardScreen from '../screens/principal/TimetableDashboardScreen';
import TimetableEditorScreen from '../screens/principal/TimetableEditorScreen';
import BulkImportTimetableScreen from '../screens/timetable/BulkImportTimetableScreen';
import NotificationCenterScreen from '../screens/notifications/NotificationCenterScreen';
import CreateNotificationScreen from '../screens/accountant/CreateNotificationScreen';
import GraduateFinalYearScreen from '../screens/principal/GraduateFinalYearScreen';
import HolidayManagementScreen from '../screens/shared/HolidayManagementScreen';
import AcademicYearOverviewScreen from '../screens/principal/AcademicYearOverviewScreen';
import AcademicYearManagementScreen from '../screens/principal/AcademicYearManagementScreen';
import ExamListScreen from '../screens/marks/ExamListScreen';
import CreateExamScreen from '../screens/marks/CreateExamScreen';
import ExamDetailsScreen from '../screens/marks/ExamDetailsScreen';
import MarksEntryScreen from '../screens/marks/MarksEntryScreen';
import BulkUploadScreen from '../screens/marks/BulkUploadScreen';
import ExamAnalyticsScreen from '../screens/marks/ExamAnalyticsScreen';
import AddExamSectionScreen from '../screens/marks/AddExamSectionScreen';
import ExamSubjectConfigScreen from '../screens/marks/ExamSubjectConfigScreen';

const Stack = createNativeStackNavigator();

const PrincipalNavigator = () => (
  <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
    <Stack.Screen
      name="PrincipalDashboard"
      component={DashboardScreen}
      options={{title: 'Principal'}}
    />
    <Stack.Screen
      name="AcademicStructure"
      component={AcademicStructureScreen}
      options={{title: 'Academic Structure'}}
    />
    <Stack.Screen
      name="CreateSection"
      component={CreateSectionScreen}
      options={{title: 'Create Section'}}
    />
    <Stack.Screen
      name="CoordinatorManagement"
      component={CoordinatorManagementScreen}
      options={{title: 'Coordinators'}}
    />
    <Stack.Screen
      name="CreateCoordinator"
      component={CreateCoordinatorScreen}
      options={{title: 'Create Coordinator'}}
    />
    <Stack.Screen
      name="EditCoordinator"
      component={EditCoordinatorScreen}
      options={{title: 'Edit Coordinator'}}
    />
    <Stack.Screen
      name="CoordinatorDetails"
      component={CoordinatorDetailsScreen}
      options={{title: 'Coordinator Details'}}
    />
    <Stack.Screen
      name="ClassManagement"
      component={ClassManagementScreen}
      options={{title: 'Classes'}}
    />
    <Stack.Screen
      name="SectionManagement"
      component={SectionManagementScreen}
      options={{title: 'Sections'}}
    />
    <Stack.Screen
      name="SectionDetails"
      component={SectionDetailsScreen}
      options={{title: 'Section Details'}}
    />
    <Stack.Screen
      name="AssignClassTeacher"
      component={AssignClassTeacherScreen}
      options={{title: 'Assign Class Teacher'}}
    />
    <Stack.Screen
      name="TeacherManagement"
      component={TeacherManagementScreen}
      options={{title: 'Teachers'}}
    />
    <Stack.Screen
      name="CreateTeacher"
      component={CreateTeacherScreen}
      options={{title: 'Create Teacher'}}
    />
    <Stack.Screen
      name="EditTeacher"
      component={EditTeacherScreen}
      options={{title: 'Edit Teacher'}}
    />
    <Stack.Screen
      name="TeacherDetails"
      component={TeacherDetailsScreen}
      options={{title: 'Teacher Details'}}
    />
    <Stack.Screen
      name="TeacherProfile"
      component={TeacherProfileScreen}
      options={{title: 'Teacher Profile'}}
    />
    <Stack.Screen
      name="SubjectManagement"
      component={SubjectManagementScreen}
      options={{title: 'Subjects'}}
    />
    <Stack.Screen
      name="AssignSubjects"
      component={AssignSubjectsScreen}
      options={{title: 'Assign Subjects'}}
    />
    <Stack.Screen
      name="AccountantManagement"
      component={AccountantManagementScreen}
      options={{title: 'Accountants'}}
    />
    <Stack.Screen
      name="CreateAccountant"
      component={CreateAccountantScreen}
      options={{title: 'Create Accountant'}}
    />
    <Stack.Screen
      name="EditAccountant"
      component={EditAccountantScreen}
      options={{title: 'Edit Accountant'}}
    />
    <Stack.Screen
      name="AccountantProfile"
      component={AccountantProfileScreen}
      options={{title: 'Accountant Profile'}}
    />
    <Stack.Screen
      name="PromotionManagement"
      component={PromotionManagementScreen}
      options={{title: 'Promotions'}}
    />
    <Stack.Screen
      name="StudentManagement"
      component={StudentManagementScreen}
      options={{title: 'Students'}}
    />
    <Stack.Screen
      name="StudentSearch"
      component={StudentSearchScreen}
      options={{title: 'Search Students'}}
    />
    <Stack.Screen
      name="AddStudent"
      component={AddStudentScreen}
      options={{title: 'Add Student'}}
    />
    <Stack.Screen
      name="EditStudent"
      component={EditStudentScreen}
      options={{title: 'Edit Student'}}
    />
    <Stack.Screen
      name="StudentDetails"
      component={StudentDetailsScreen}
      options={{title: 'Student Details'}}
    />
    <Stack.Screen
      name="BulkStudentImport"
      component={BulkStudentImportScreen}
      options={{title: 'Bulk Import'}}
    />
    <Stack.Screen
      name="PromotionHistory"
      component={PromotionHistoryScreen}
      options={{title: 'Promotion History'}}
    />
    <Stack.Screen
      name="TransferStudent"
      component={TransferStudentScreen}
      options={{title: 'Transfer Student'}}
    />
    <Stack.Screen
      name="ViewAllAttendance"
      component={ViewAllAttendanceScreen}
      options={{title: 'Attendance'}}
    />
    <Stack.Screen
      name="EditAttendance"
      component={EditAttendanceScreen}
      options={{title: 'Correct Attendance'}}
    />
    {renderFeeStackScreens(Stack, {canUpload: true, reports: true})}
    <Stack.Screen
      name="NoticeBoard"
      component={NoticeBoardScreen}
      options={{title: 'Notice Board'}}
    />
    <Stack.Screen
      name="PostNotice"
      component={PostNoticeScreen}
      options={{title: 'Post Notice'}}
    />
    <Stack.Screen
      name="Timetable"
      component={TimetableDashboardScreen}
      options={{title: 'Timetable Management'}}
    />
    <Stack.Screen
      name="TimetableEditor"
      component={TimetableEditorScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="BulkImportTimetable"
      component={BulkImportTimetableScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="NotificationCenter"
      component={NotificationCenterScreen}
      options={{title: 'Notifications'}}
    />
    <Stack.Screen
      name="CreateNotification"
      component={CreateNotificationScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="GraduateFinalYear"
      component={GraduateFinalYearScreen}
      options={{title: 'Graduate Students'}}
    />
    <Stack.Screen
      name="PrincipalProfile"
      component={PrincipalProfileScreen}
      options={{title: 'My Profile', headerShown: false}}
    />
    <Stack.Screen
      name="HolidayManagement"
      component={HolidayManagementScreen}
      options={{title: 'Holiday Management'}}
    />
    <Stack.Screen
      name="AcademicYearOverview"
      component={AcademicYearOverviewScreen}
      options={{title: 'Academic Year'}}
    />
    <Stack.Screen
      name="AcademicYearManagement"
      component={AcademicYearManagementScreen}
      options={{title: 'Year Management'}}
    />
    {/* Marks Management */}
    <Stack.Screen name="ExamList" component={ExamListScreen} options={{headerShown: false}} />
    <Stack.Screen name="CreateExam" component={CreateExamScreen} options={{headerShown: false}} />
    <Stack.Screen name="ExamDetails" component={ExamDetailsScreen} options={{headerShown: false}} />
    <Stack.Screen name="AddExamSection" component={AddExamSectionScreen} options={{headerShown: false}} />
    <Stack.Screen name="ExamSubjectConfig" component={ExamSubjectConfigScreen} options={{headerShown: false}} />
    <Stack.Screen name="MarksEntry" component={MarksEntryScreen} options={{headerShown: false}} />
    <Stack.Screen name="BulkMarksUpload" component={BulkUploadScreen} options={{headerShown: false}} />
    <Stack.Screen name="ExamAnalytics" component={ExamAnalyticsScreen} options={{headerShown: false}} />
  </Stack.Navigator>
);

export default PrincipalNavigator;
