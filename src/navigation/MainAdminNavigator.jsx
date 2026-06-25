import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../theme';

import DashboardScreen from '../screens/mainAdmin/DashboardScreen';
import AuditLogsScreen from '../screens/mainAdmin/AuditLogsScreen';
import BranchDetailsScreen from '../screens/mainAdmin/BranchDetailsScreen';
import BranchContextScreen from '../screens/mainAdmin/BranchContextScreen';
import BranchListScreen from '../screens/mainAdmin/BranchListScreen';
import BranchOperationsDashboard from '../screens/mainAdmin/BranchOperationsDashboard';
import ClassDetailsScreen from '../screens/mainAdmin/ClassDetailsScreen';
import CreateBranchScreen from '../screens/mainAdmin/CreateBranchScreen';
import EditBranchScreen from '../screens/mainAdmin/EditBranchScreen';
import GlobalAnalyticsScreen from '../screens/mainAdmin/GlobalAnalyticsScreen';
import GlobalClassesScreen from '../screens/mainAdmin/GlobalClassesScreen';
import GlobalReportsScreen from '../screens/mainAdmin/GlobalReportsScreen';
import GlobalStudentsScreen from '../screens/mainAdmin/GlobalStudentsScreen';
import GlobalStudentProfileScreen from '../screens/mainAdmin/GlobalStudentProfileScreen';
import ManageUsersScreen from '../screens/mainAdmin/ManageUsersScreen';
import ChangeUserRoleScreen from '../screens/mainAdmin/ChangeUserRoleScreen';
import SettingsScreen from '../screens/mainAdmin/SettingsScreen';
import StudentProfileScreen from '../screens/mainAdmin/StudentProfileScreen';
import RevenueOverviewScreen from '../screens/mainAdmin/RevenueOverviewScreen';
import ProfileScreen from '../screens/mainAdmin/ProfileScreen';
import BranchSettingsScreen from '../screens/branchAdmin/BranchSettingsScreen';
import ViewAllAttendanceScreen from '../screens/principal/ViewAllAttendanceScreen';
import CoordinatorManagementScreen from '../screens/principal/CoordinatorManagementScreen';
import CreateCoordinatorScreen from '../screens/principal/CreateCoordinatorScreen';
import EditCoordinatorScreen from '../screens/principal/EditCoordinatorScreen';
import CoordinatorDetailsScreen from '../screens/principal/CoordinatorDetailsScreen';
import ClassManagementScreen from '../screens/principal/ClassManagementScreen';
import SectionManagementScreen from '../screens/principal/SectionManagementScreen';
import SectionDetailsScreen from '../screens/principal/SectionDetailsScreen';
import CreateSectionScreen from '../screens/principal/CreateSectionScreen';
import AssignClassTeacherScreen from '../screens/principal/AssignClassTeacherScreen';
import AccountantManagementScreen from '../screens/principal/AccountantManagementScreen';
import CreateAccountantScreen from '../screens/principal/CreateAccountantScreen';
import EditAccountantScreen from '../screens/principal/EditAccountantScreen';
import AccountantProfileScreen from '../screens/principal/AccountantProfileScreen';
import PromotionManagementScreen from '../screens/principal/PromotionManagementScreen';
import PromotionHistoryScreen from '../screens/principal/PromotionHistoryScreen';
import TeacherManagementScreen from '../screens/teachers/TeacherManagementScreen';
import CreateTeacherScreen from '../screens/teachers/CreateTeacherScreen';
import EditTeacherScreen from '../screens/teachers/EditTeacherScreen';
import TeacherDetailsScreen from '../screens/teachers/TeacherDetailsScreen';
import TeacherProfileScreen from '../screens/teachers/TeacherProfileScreen';
import SubjectManagementScreen from '../screens/teachers/SubjectManagementScreen';
import AssignSubjectsScreen from '../screens/teachers/AssignSubjectsScreen';
import StudentManagementScreen from '../screens/students/StudentManagementScreen';
import StudentSearchScreen from '../screens/students/StudentSearchScreen';
import AddStudentScreen from '../screens/students/AddStudentScreen';
import EditStudentScreen from '../screens/students/EditStudentScreen';
import StudentDetailsScreen from '../screens/students/StudentDetailsScreen';
import BulkStudentImportScreen from '../screens/students/BulkStudentImportScreen';
import TransferStudentScreen from '../screens/students/TransferStudentScreen';
import NotificationCenterScreen from '../screens/notifications/NotificationCenterScreen';
import CreateNotificationScreen from '../screens/accountant/CreateNotificationScreen';
import {renderFeeStackScreens} from './FeeStackScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Bottom Tabs (Main Admin only) ──────────────────────────────────────────
const MainAdminTabs = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({color}) => {
          const icons = {
            Dashboard: 'view-dashboard',
            Schools: 'office-building',
            Users: 'account-group',
            Reports: 'chart-line',
            Settings: 'cog',
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
      <Tab.Screen name="Schools" component={BranchListScreen} />
      <Tab.Screen name="Users" component={ManageUsersScreen} />
      <Tab.Screen name="Reports" component={GlobalAnalyticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// ─── Stack wraps Tabs + all push-navigable routes ───────────────────────────
// screenOptions has headerShown:false so tab screens manage their own safe area.
// Every push/detail screen overrides with headerShown:true so React Navigation
// handles the top safe area for those shared screens.
const MainAdminNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="MainAdminTabs" component={MainAdminTabs} />

    {/* ── Alias routes ── */}
    <Stack.Screen name="ManageBranches" component={BranchListScreen} />
    <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
    <Stack.Screen
      name="ChangeUserRole"
      component={ChangeUserRoleScreen}
      options={{headerShown: true, title: 'Change User Role'}}
    />
    <Stack.Screen name="GlobalAnalytics" component={GlobalAnalyticsScreen} />

    {/* ── Detail/push screens — all show header so safe area is automatic ── */}
    <Stack.Screen name="BranchList" component={BranchListScreen} />
    <Stack.Screen
      name="BranchContext"
      component={BranchContextScreen}
      options={{headerShown: true, title: 'Branch Context'}}
    />
    <Stack.Screen
      name="BranchOperationsDashboard"
      component={BranchOperationsDashboard}
      options={{headerShown: true, title: 'Branch Operations'}}
    />
    <Stack.Screen
      name="BranchDetails"
      component={BranchDetailsScreen}
      options={{headerShown: true, title: 'Branch Details'}}
    />
    <Stack.Screen
      name="EditBranch"
      component={EditBranchScreen}
      options={{headerShown: true, title: 'Edit Branch'}}
    />
    <Stack.Screen
      name="GlobalClasses"
      component={GlobalClassesScreen}
      options={{headerShown: true, title: 'Global Classes'}}
    />
    <Stack.Screen
      name="ClassDetails"
      component={ClassDetailsScreen}
      options={{headerShown: true, title: 'Class Details'}}
    />
    <Stack.Screen
      name="GlobalStudents"
      component={GlobalStudentsScreen}
      options={{headerShown: true, title: 'All Students'}}
    />
    <Stack.Screen
      name="GlobalStudentProfile"
      component={GlobalStudentProfileScreen}
      options={{headerShown: true, title: 'Student Profile'}}
    />
    <Stack.Screen
      name="StudentProfile"
      component={StudentProfileScreen}
      options={{headerShown: true, title: 'Student Profile'}}
    />
    <Stack.Screen
      name="GlobalReports"
      component={GlobalReportsScreen}
      options={{headerShown: true, title: 'Global Reports'}}
    />
    <Stack.Screen
      name="CreateBranch"
      component={CreateBranchScreen}
      options={{headerShown: true, title: 'Create Branch'}}
    />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen
      name="AuditLogs"
      component={AuditLogsScreen}
      options={{headerShown: true, title: 'Audit Logs'}}
    />
    <Stack.Screen
      name="BranchSettings"
      component={BranchSettingsScreen}
      options={{headerShown: true, title: 'Branch Settings'}}
    />
    <Stack.Screen
      name="ViewAllAttendance"
      component={ViewAllAttendanceScreen}
      options={{headerShown: true, title: 'Attendance'}}
    />
    <Stack.Screen
      name="CoordinatorManagement"
      component={CoordinatorManagementScreen}
      options={{headerShown: true, title: 'Coordinators'}}
    />
    <Stack.Screen
      name="CreateCoordinator"
      component={CreateCoordinatorScreen}
      options={{headerShown: true, title: 'Create Coordinator'}}
    />
    <Stack.Screen
      name="EditCoordinator"
      component={EditCoordinatorScreen}
      options={{headerShown: true, title: 'Edit Coordinator'}}
    />
    <Stack.Screen
      name="CoordinatorDetails"
      component={CoordinatorDetailsScreen}
      options={{headerShown: true, title: 'Coordinator Details'}}
    />
    <Stack.Screen
      name="ClassManagement"
      component={ClassManagementScreen}
      options={{headerShown: true, title: 'Classes'}}
    />
    <Stack.Screen
      name="SectionManagement"
      component={SectionManagementScreen}
      options={{headerShown: true, title: 'Sections'}}
    />
    <Stack.Screen
      name="SectionDetails"
      component={SectionDetailsScreen}
      options={{headerShown: true, title: 'Section Details'}}
    />
    <Stack.Screen
      name="CreateSection"
      component={CreateSectionScreen}
      options={{headerShown: true, title: 'Create Section'}}
    />
    <Stack.Screen
      name="AssignClassTeacher"
      component={AssignClassTeacherScreen}
      options={{headerShown: true, title: 'Assign Class Teacher'}}
    />
    <Stack.Screen
      name="AccountantManagement"
      component={AccountantManagementScreen}
      options={{headerShown: true, title: 'Accountants'}}
    />
    <Stack.Screen
      name="CreateAccountant"
      component={CreateAccountantScreen}
      options={{headerShown: true, title: 'Create Accountant'}}
    />
    <Stack.Screen
      name="EditAccountant"
      component={EditAccountantScreen}
      options={{headerShown: true, title: 'Edit Accountant'}}
    />
    <Stack.Screen
      name="AccountantProfile"
      component={AccountantProfileScreen}
      options={{headerShown: true, title: 'Accountant Profile'}}
    />
    <Stack.Screen
      name="PromotionManagement"
      component={PromotionManagementScreen}
      options={{headerShown: true, title: 'Promotions'}}
    />
    <Stack.Screen
      name="PromotionHistory"
      component={PromotionHistoryScreen}
      options={{headerShown: true, title: 'Promotion History'}}
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
      name="SubjectManagement"
      component={SubjectManagementScreen}
      options={{headerShown: true, title: 'Subjects'}}
    />
    <Stack.Screen
      name="AssignSubjects"
      component={AssignSubjectsScreen}
      options={{headerShown: true, title: 'Assign Subjects'}}
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
      name="AddStudent"
      component={AddStudentScreen}
      options={{headerShown: true, title: 'Add Student'}}
    />
    <Stack.Screen
      name="CreateStudent"
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
    <Stack.Screen
      name="RevenueOverview"
      component={RevenueOverviewScreen}
      options={{headerShown: true, title: 'Revenue Overview'}}
    />
    <Stack.Screen name="Profile" component={ProfileScreen} />
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
    {renderFeeStackScreens(Stack, {canUpload: true, reports: true})}
  </Stack.Navigator>
);

export default MainAdminNavigator;
