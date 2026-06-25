import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import TeacherDashboardScreen from '../screens/teachers/TeacherDashboardScreen';
import TakeAttendanceScreen from '../screens/teachers/TakeAttendanceScreen';
import StudentsListScreen from '../screens/teachers/StudentsListScreen';
import StudentProfileScreen from '../screens/students/StudentProfileScreen';
import TeacherProfileScreen from '../screens/teachers/TeacherProfileScreen';
import HomeworkScreen from '../screens/teachers/HomeworkScreen';
import TimetableScreen from '../screens/teachers/TimetableScreen';
import SharedNoticeBoardScreen from '../screens/shared/NoticeBoardScreen';
import NotificationCenterScreen from '../screens/notifications/NotificationCenterScreen';
import {renderFeeStackScreens} from './FeeStackScreens';
import {colors} from '../theme';
import ExamListScreen from '../screens/marks/ExamListScreen';
import ExamDetailsScreen from '../screens/marks/ExamDetailsScreen';
import MarksEntryScreen from '../screens/marks/MarksEntryScreen';
import ExamAnalyticsScreen from '../screens/marks/ExamAnalyticsScreen';
import ClassTeacherDueFeesScreen from '../screens/teachers/ClassTeacherDueFeesScreen';
import SectionAttendanceReportScreen from '../screens/teachers/SectionAttendanceReportScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TeacherHomeIcon = ({color, size}) => (
  <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
);

const TeacherStudentsIcon = ({color, size}) => (
  <MaterialCommunityIcons name="account-school-outline" size={size} color={color} />
);

const TeacherBellIcon = ({color, size}) => (
  <MaterialCommunityIcons name="bell-outline" size={size} color={color} />
);

const TeacherHomeStack = () => (
  <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
    <Stack.Screen
      name="TeacherDashboard"
      component={TeacherDashboardScreen}
      options={{title: 'Teacher'}}
    />
    <Stack.Screen
      name="TeacherProfile"
      component={TeacherProfileScreen}
      options={{title: 'Teacher Profile'}}
    />
    <Stack.Screen
      name="TakeAttendance"
      component={TakeAttendanceScreen}
      options={{title: 'Take Attendance'}}
    />
    <Stack.Screen
      name="StudentProfile"
      component={StudentProfileScreen}
      options={{title: 'Student'}}
    />
    <Stack.Screen
      name="Homework"
      component={HomeworkScreen}
      options={{title: 'Homework'}}
    />
    <Stack.Screen
      name="Timetable"
      component={TimetableScreen}
      options={{title: 'My Timetable'}}
    />
    <Stack.Screen
      name="NoticeBoard"
      component={SharedNoticeBoardScreen}
      options={{title: 'Notice Board'}}
      initialParams={{edition: 'Teacher Edition', canPost: false}}
    />
    <Stack.Screen
      name="NotificationCenter"
      component={NotificationCenterScreen}
      options={{title: 'Notifications'}}
    />
    {renderFeeStackScreens(Stack)}
    <Stack.Screen
      name="ClassTeacherDueFees"
      component={ClassTeacherDueFeesScreen}
      options={{title: 'Students with Due Fees'}}
    />
    <Stack.Screen
      name="SectionAttendanceReport"
      component={SectionAttendanceReportScreen}
      options={{title: 'Section Attendance Report'}}
    />
    {/* Marks — read+entry only for teachers */}
    <Stack.Screen name="ExamList" component={ExamListScreen} options={{headerShown: false}} />
    <Stack.Screen name="ExamDetails" component={ExamDetailsScreen} options={{headerShown: false}} />
    <Stack.Screen name="MarksEntry" component={MarksEntryScreen} options={{headerShown: false}} />
    <Stack.Screen name="ExamAnalytics" component={ExamAnalyticsScreen} options={{headerShown: false}} />
  </Stack.Navigator>
);

const TeacherNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
          height: 54 + (insets.bottom > 0 ? insets.bottom : 8),
        },
      }}>
      <Tab.Screen
        name="Home"
        component={TeacherHomeStack}
        options={{tabBarIcon: TeacherHomeIcon}}
      />
      {/* Enable header for direct tab screens so React Navigation handles safe area */}
      <Tab.Screen
        name="StudentsList"
        component={StudentsListScreen}
        options={{
          title: 'Students',
          headerShown: true,
          tabBarIcon: TeacherStudentsIcon,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationCenterScreen}
        options={{
          title: 'Notifications',
          headerShown: true,
          tabBarIcon: TeacherBellIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export default TeacherNavigator;
