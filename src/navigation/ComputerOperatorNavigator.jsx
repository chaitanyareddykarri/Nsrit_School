import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DashboardScreen from '../screens/computerOperator/DashboardScreen';
import ViewAllAttendanceScreen from '../screens/principal/ViewAllAttendanceScreen';
import EditAttendanceScreen from '../screens/coordinator/EditAttendanceScreen';
import CoordinatorManagementScreen from '../screens/principal/CoordinatorManagementScreen';
import CreateCoordinatorScreen from '../screens/principal/CreateCoordinatorScreen';
import EditCoordinatorScreen from '../screens/principal/EditCoordinatorScreen';
import CoordinatorDetailsScreen from '../screens/principal/CoordinatorDetailsScreen';
import TransferStudentScreen from '../screens/students/TransferStudentScreen';
import AddStudentScreen from '../screens/students/AddStudentScreen';
import EditStudentScreen from '../screens/students/EditStudentScreen';
import StudentDetailsScreen from '../screens/students/StudentDetailsScreen';
import StudentManagementScreen from '../screens/students/StudentManagementScreen';
import BulkStudentImportScreen from '../screens/students/BulkStudentImportScreen';
import StudentSearchScreen from '../screens/students/StudentSearchScreen';
import TeacherManagementScreen from '../screens/teachers/TeacherManagementScreen';
import CreateStaffScreen from '../screens/teachers/CreateStaffScreen';
import EditTeacherScreen from '../screens/teachers/EditTeacherScreen';
import TeacherDetailsScreen from '../screens/teachers/TeacherDetailsScreen';
import TeacherProfileScreen from '../screens/teachers/TeacherProfileScreen';
import {renderFeeStackScreens} from './FeeStackScreens';
import NoticeBoardScreen from '../screens/principal/NoticeBoardScreen';
import PostNoticeScreen from '../screens/coordinator/PostNoticeScreen';
import AccountantManagementScreen from '../screens/principal/AccountantManagementScreen';
import CreateAccountantScreen from '../screens/principal/CreateAccountantScreen';
import EditAccountantScreen from '../screens/principal/EditAccountantScreen';
import AccountantProfileScreen from '../screens/principal/AccountantProfileScreen';
import AssignClassTeacherScreen from '../screens/principal/AssignClassTeacherScreen';
import PromotionManagementScreen from '../screens/principal/PromotionManagementScreen';
import PromotionHistoryScreen from '../screens/principal/PromotionHistoryScreen';
import ComputerOperatorProfileScreen from '../screens/computerOperator/ProfileScreen';

const Stack = createNativeStackNavigator();

const ComputerOperatorNavigator = () => (
  <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
    <Stack.Screen
      name="ComputerOperatorDashboard"
      component={DashboardScreen}
      options={{title: 'Computer Operator'}}
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
      name="AssignClassTeacher"
      component={AssignClassTeacherScreen}
      options={{title: 'Assign Class Teacher'}}
    />
    <Stack.Screen
      name="PromotionManagement"
      component={PromotionManagementScreen}
      options={{title: 'Promote Students'}}
    />
    <Stack.Screen
      name="PromotionHistory"
      component={PromotionHistoryScreen}
      options={{title: 'Promotion History'}}
    />
    <Stack.Screen
      name="StudentManagement"
      component={StudentManagementScreen}
      options={{title: 'Student Management'}}
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
      name="TransferStudent"
      component={TransferStudentScreen}
      options={{title: 'Transfer Student'}}
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
      name="StudentSearch"
      component={StudentSearchScreen}
      options={{title: 'Search Students'}}
    />
    <Stack.Screen
      name="TeacherManagement"
      component={TeacherManagementScreen}
      options={{title: 'Teachers'}}
    />
    <Stack.Screen
      name="CreateTeacher"
      component={CreateStaffScreen}
      options={{title: 'Add Teacher'}}
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
      name="AccountantManagement"
      component={AccountantManagementScreen}
      options={{title: 'Accountants'}}
    />
    <Stack.Screen
      name="CreateAccountant"
      component={CreateAccountantScreen}
      options={{title: 'Add Accountant'}}
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
      name="ViewAllAttendance"
      component={ViewAllAttendanceScreen}
      options={{title: 'Attendance View'}}
    />
    <Stack.Screen
      name="EditAttendance"
      component={EditAttendanceScreen}
      options={{title: 'Edit Attendance'}}
    />
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
      name="ComputerOperatorProfile"
      component={ComputerOperatorProfileScreen}
      options={{headerShown: false}}
    />
    {renderFeeStackScreens(Stack)}
  </Stack.Navigator>
);

export default ComputerOperatorNavigator;
