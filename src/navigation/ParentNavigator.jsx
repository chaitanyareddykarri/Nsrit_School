import React, {useEffect, useRef} from 'react';
import {AppState, View, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import DashboardScreen from '../screens/parent/DashboardScreen';
import AttendanceScreen from '../screens/parent/AttendanceScreen';
import ProfileScreen from '../screens/parent/ProfileScreen';
import StudentSelectorScreen from '../screens/parent/StudentSelectorScreen';
import NoticeBoardScreen from '../screens/parent/NoticeBoardScreen';
import SuggestionScreen from '../screens/parent/SuggestionScreen';
import SuggestionStatusScreen from '../screens/parent/SuggestionStatusScreen';
import FeeLedgerScreen from '../screens/parent/FeeLedgerScreen';
import PaymentScreen from '../screens/parent/PaymentScreen';
import TimetableScreen from '../screens/parent/TimetableScreen';
import NotificationCenterScreen from '../screens/notifications/NotificationCenterScreen';
import notificationService from '../services/notifications/notificationService';
import {colors} from '../theme';
import ResultsScreen from '../screens/parent/ResultsScreen';
import ResultDetailsScreen from '../screens/parent/ResultDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ParentHomeStack = () => (
  <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
    <Stack.Screen
      name="ParentDashboard"
      component={DashboardScreen}
      options={{title: 'Home'}}
    />
    <Stack.Screen
      name="ParentNotices"
      component={NoticeBoardScreen}
      options={{title: 'Notice Board'}}
    />
    <Stack.Screen
      name="ParentSuggestions"
      component={SuggestionScreen}
      options={{title: 'Suggestions'}}
    />
    <Stack.Screen
      name="ParentSuggestionStatus"
      component={SuggestionStatusScreen}
      options={{title: 'Suggestion Status'}}
    />
    <Stack.Screen
      name="FeeLedger"
      component={FeeLedgerScreen}
      options={{title: 'Fee Ledger'}}
    />
    <Stack.Screen
      name="Payments"
      component={PaymentScreen}
      options={{title: 'Fee Payments'}}
    />
    <Stack.Screen
      name="Timetable"
      component={TimetableScreen}
      options={{title: 'Class Timetable'}}
    />
    {/* Results */}
    <Stack.Screen name="Results" component={ResultsScreen} options={{headerShown: false}} />
    <Stack.Screen name="ResultDetails" component={ResultDetailsScreen} options={{headerShown: false}} />
  </Stack.Navigator>
);

// Tab bar icons
const HomeIcon = ({color, size}) => (
  <MaterialCommunityIcons name="home-outline" size={size} color={color} />
);

const AttendanceIcon = ({color, size}) => (
  <MaterialCommunityIcons name="calendar-check-outline" size={size} color={color} />
);

const ProfileIcon = ({color, size}) => (
  <MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />
);

const StudentsIcon = ({color, size}) => (
  <MaterialCommunityIcons name="account-child-outline" size={size} color={color} />
);

const useNotificationBadge = () => {
  const userId = useSelector(s => s.auth.user?.id);
  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);

  const {data: count = 0} = useQuery({
    queryKey: ['notificationBadge', userId],
    queryFn: () => notificationService.getUnreadCount(userId),
    enabled: Boolean(userId),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: 60 * 1000,
  });

  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        queryClient.invalidateQueries({queryKey: ['notificationBadge', userId]});
        queryClient.invalidateQueries({queryKey: ['userNotifications']});
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [userId, queryClient]);

  return count;
};

const ParentNavigator = () => {
  const unreadCount = useNotificationBadge();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.white,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
          height: 54 + (insets.bottom > 0 ? insets.bottom : 8),
        },
      }}>
      <Tab.Screen
        name="Home"
        component={ParentHomeStack}
        options={{headerShown: false, title: 'Home', tabBarIcon: HomeIcon}}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{tabBarIcon: AttendanceIcon}}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationCenterScreen}
        options={{
          title: 'Notifications',
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="bell-outline" size={size} color={color} />
          ),
          tabBarBadgeStyle: {
            backgroundColor: colors.danger,
            fontSize: 10,
            minWidth: 16,
            height: 16,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{tabBarIcon: ProfileIcon}}
      />
      <Tab.Screen
        name="Students"
        component={StudentSelectorScreen}
        options={{tabBarIcon: StudentsIcon}}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.danger,
    borderRadius: 6,
    height: 8,
    position: 'absolute',
    right: -2,
    top: -1,
    width: 8,
  },
});

export default ParentNavigator;
