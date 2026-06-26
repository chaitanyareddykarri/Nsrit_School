import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../theme';

import DashboardScreen from '../screens/coordinator/DashboardScreen';
import WingAttendanceScreen from '../screens/coordinator/WingAttendanceScreen';
import EditAttendanceScreen from '../screens/coordinator/EditAttendanceScreen';
import WingStudentsScreen from '../screens/coordinator/WingStudentsScreen';
import EventsScreen from '../screens/coordinator/EventsScreen';
import FeeDashboardScreen from '../screens/fees/FeeDashboardScreen';
import AssignTeachersScreen from '../screens/coordinator/AssignTeachersScreen';

import AddStudentScreen from '../screens/students/AddStudentScreen';
import EditStudentScreen from '../screens/students/EditStudentScreen';
import StudentDetailsScreen from '../screens/students/StudentDetailsScreen';
import StudentManagementScreen from '../screens/students/StudentManagementScreen';
import BulkStudentImportScreen from '../screens/students/BulkStudentImportScreen';
import StudentSearchScreen from '../screens/students/StudentSearchScreen';
import TransferStudentScreen from '../screens/students/TransferStudentScreen';
import TeacherManagementScreen from '../screens/teachers/TeacherManagementScreen';
import CreateTeacherScreen from '../screens/teachers/CreateTeacherScreen';
import EditTeacherScreen from '../screens/teachers/EditTeacherScreen';
import TeacherDetailsScreen from '../screens/teachers/TeacherDetailsScreen';
import TeacherProfileScreen from '../screens/teachers/TeacherProfileScreen';
import AssignSubjectsScreen from '../screens/teachers/AssignSubjectsScreen';
import AssignClassTeacherScreen from '../screens/principal/AssignClassTeacherScreen';
import PostNoticeScreen from '../screens/coordinator/PostNoticeScreen';
import WingFeesScreen from '../screens/coordinator/WingFeesScreen';
import SharedNoticeBoardScreen from '../screens/shared/NoticeBoardScreen';
import NotificationCenterScreen from '../screens/notifications/NotificationCenterScreen';
import CreateNotificationScreen from '../screens/accountant/CreateNotificationScreen';
import {renderFeeStackScreens} from './FeeStackScreens';
import CoordinatorProfileScreen from '../screens/coordinator/ProfileScreen';
import HolidayManagementScreen from '../screens/shared/HolidayManagementScreen';
import ExamListScreen from '../screens/marks/ExamListScreen';
import CreateExamScreen from '../screens/marks/CreateExamScreen';
import ExamDetailsScreen from '../screens/marks/ExamDetailsScreen';
import MarksEntryScreen from '../screens/marks/MarksEntryScreen';
import BulkUploadScreen from '../screens/marks/BulkUploadScreen';
import ExamAnalyticsScreen from '../screens/marks/ExamAnalyticsScreen';
import AddExamSectionScreen from '../screens/marks/AddExamSectionScreen';
import ExamSubjectConfigScreen from '../screens/marks/ExamSubjectConfigScreen';
import TimetableDashboardScreen from '../screens/principal/TimetableDashboardScreen';
import TimetableEditorScreen from '../screens/principal/TimetableEditorScreen';
import BulkImportTimetableScreen from '../screens/timetable/BulkImportTimetableScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Bottom Tabs (Coordinator only) ─────────────────────────────────────────
const CoordinatorTabs = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({color}) => {
          const icons = {
            Dashboard: 'view-dashboard',
            Classes: 'google-classroom',
            Attendance: 'clipboard-check',
            Events: 'calendar-star',
            Profile: 'account-circle',
          };
          return (
            <MaterialCommunityIcons
              name={icons[route.name]}
              size={26}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarStyle: {
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
          height: 54 + (insets.bottom > 0 ? insets.bottom : 8),
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {fontSize: 11, fontWeight: '700'},
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Classes" component={WingStudentsScreen} />
      <Tab.Screen name="Attendance" component={WingAttendanceScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Profile" component={CoordinatorProfileScreen} />
    </Tab.Navigator>
  );
};

const CoordinatorNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    {/* Root: the tab bar */}
    <Stack.Screen name="CoordinatorTabs" component={CoordinatorTabs} />

    {/* ── Alias routes ── */}
    <Stack.Screen name="WingStudents" component={WingStudentsScreen} />
    <Stack.Screen name="WingAttendance" component={WingAttendanceScreen} />
    <Stack.Screen name="FeeDashboard" component={FeeDashboardScreen} />

    {/* ── Push/Detail screens — show header so React Navigation handles safe area ── */}
    <Stack.Screen
      name="AssignTeachers"
      component={AssignTeachersScreen}
      options={{headerShown: true, title: 'Assign Teachers'}}
    />
    <Stack.Screen
      name="EditAttendance"
      component={EditAttendanceScreen}
      options={{headerShown: true, title: 'Correct Attendance'}}
    />
    <Stack.Screen
      name="TeacherManagement"
      component={TeacherManagementScreen}
      options={{headerShown: true, title: 'Teachers'}}
    />
    <Stack.Screen
      name="CreateTeacher"
      component={CreateTeacherScreen}
      options={{headerShown: true, title: 'Create Teacher'}}
    />
    <Stack.Screen
      name="EditTeacher"
      component={EditTeacherScreen}
      options={{headerShown: true, title: 'Edit Teacher'}}
    />
    <Stack.Screen
      name="TeacherDetails"
      component={TeacherDetailsScreen}
      options={{headerShown: true, title: 'Teacher Details'}}
    />
    <Stack.Screen
      name="TeacherProfile"
      component={TeacherProfileScreen}
      options={{headerShown: true, title: 'Teacher Profile'}}
    />
    <Stack.Screen
      name="AssignSubjects"
      component={AssignSubjectsScreen}
      options={{headerShown: true, title: 'Assign Subjects'}}
    />
    <Stack.Screen
      name="AssignClassTeacher"
      component={AssignClassTeacherScreen}
      options={{headerShown: true, title: 'Assign Class Teacher'}}
    />
    <Stack.Screen
      name="Students"
      component={StudentManagementScreen}
      options={{headerShown: true, title: 'Students'}}
    />
    <Stack.Screen
      name="StudentManagement"
      component={StudentManagementScreen}
      options={{headerShown: true, title: 'Students'}}
    />
    <Stack.Screen
      name="StudentSearch"
      component={StudentSearchScreen}
      options={{headerShown: true, title: 'Search Students'}}
    />
    <Stack.Screen
      name="CreateStudent"
      component={AddStudentScreen}
      options={{headerShown: true, title: 'Add Student'}}
    />
    <Stack.Screen
      name="AddStudent"
      component={AddStudentScreen}
      options={{headerShown: true, title: 'Add Student'}}
    />
    <Stack.Screen
      name="EditStudent"
      component={EditStudentScreen}
      options={{headerShown: true, title: 'Edit Student'}}
    />
    <Stack.Screen
      name="StudentDetails"
      component={StudentDetailsScreen}
      options={{headerShown: true, title: 'Student Details'}}
    />
    <Stack.Screen
      name="BulkStudentImport"
      component={BulkStudentImportScreen}
      options={{headerShown: true, title: 'Bulk Import'}}
    />
    <Stack.Screen
      name="TransferStudent"
      component={TransferStudentScreen}
      options={{headerShown: true, title: 'Transfer Student'}}
    />

    {/* ── Coordinator-specific screens — manage own safe area ── */}
    <Stack.Screen name="CoordinatorProfile" component={CoordinatorProfileScreen} options={{headerShown: false}} />
    <Stack.Screen
      name="HolidayManagement"
      component={HolidayManagementScreen}
      options={{headerShown: true, title: 'Holiday Management'}}
    />
    <Stack.Screen
      name="PostNotice"
      component={PostNoticeScreen}
      options={{headerShown: true, title: 'Post Notice'}}
    />
    <Stack.Screen
      name="WingFees"
      component={WingFeesScreen}
      options={{headerShown: true, title: 'Wing Fees'}}
    />
    <Stack.Screen
      name="NoticeBoard"
      component={SharedNoticeBoardScreen}
      options={{headerShown: true, title: 'Notice Board'}}
      initialParams={{edition: 'Coordinator Edition', canPost: true}}
    />
    <Stack.Screen
      name="NotificationCenter"
      component={NotificationCenterScreen}
      options={{headerShown: true, title: 'Notifications'}}
    />
    <Stack.Screen
      name="CreateNotification"
      component={CreateNotificationScreen}
      options={{headerShown: false}}
    />

    {/* ── Shared fee sub-screens ── */}
    {renderFeeStackScreens(Stack, {skipDashboard: true, reports: true})}

    {/* ── Marks Management ── */}
    <Stack.Screen name="ExamList" component={ExamListScreen} options={{headerShown: false}} />
    <Stack.Screen name="CreateExam" component={CreateExamScreen} options={{headerShown: false}} />
    <Stack.Screen name="ExamDetails" component={ExamDetailsScreen} options={{headerShown: false}} />
    <Stack.Screen name="AddExamSection" component={AddExamSectionScreen} options={{headerShown: false}} />
    <Stack.Screen name="ExamSubjectConfig" component={ExamSubjectConfigScreen} options={{headerShown: false}} />
    <Stack.Screen name="MarksEntry" component={MarksEntryScreen} options={{headerShown: false}} />
    <Stack.Screen name="BulkMarksUpload" component={BulkUploadScreen} options={{headerShown: false}} />
    <Stack.Screen name="ExamAnalytics" component={ExamAnalyticsScreen} options={{headerShown: false}} />

    {/* ── Timetable Management ── */}
    <Stack.Screen name="Timetable" component={TimetableDashboardScreen} options={{headerShown: false}} />
    <Stack.Screen name="TimetableEditor" component={TimetableEditorScreen} options={{headerShown: false}} />
    <Stack.Screen name="BulkImportTimetable" component={BulkImportTimetableScreen} options={{headerShown: false}} />
  </Stack.Navigator>
);

export default CoordinatorNavigator;
