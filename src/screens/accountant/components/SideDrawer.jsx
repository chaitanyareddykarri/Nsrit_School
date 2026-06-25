import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, spacing} from '../../../theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.76;

const navItems = [
  {label: 'Dashboard', icon: 'view-dashboard', route: 'AccountantDashboard'},
  {label: 'Record Offline Payment', icon: 'cash-register', route: 'RecordPayment'},
  {label: 'Result Posting', icon: 'clipboard-check-outline', route: 'ResultPosting'},
  {label: 'Fee Tracking', icon: 'currency-usd', route: 'FeeDashboard'},
  {label: 'Notifications', icon: 'bell-outline', route: 'NotificationCenter'},
  {label: 'Create Notification', icon: 'megaphone-outline', route: 'CreateNotification'},
  {label: 'Audit Logs', icon: 'history', route: 'AuditLogs'},
  {label: 'Settings', icon: 'cog-outline', route: 'AccountantProfile'},
];

const SideDrawer = ({
  visible,
  onClose,
  navigation,
  activeRoute = 'AccountantDashboard',
  userName = 'Jane Doe, CPA',
  userRole = 'Lead Auditor',
  userId = 'ACC-99234',
  userAvatar,
}) => {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {toValue: 0, duration: 250, useNativeDriver: true}),
        Animated.timing(fadeAnim, {toValue: 1, duration: 250, useNativeDriver: true}),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {toValue: -DRAWER_WIDTH, duration: 200, useNativeDriver: true}),
        Animated.timing(fadeAnim, {toValue: 0, duration: 200, useNativeDriver: true}),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleNavigate = route => {
    onClose();
    if (activeRoute !== route) {
      if (route === 'Logout') {
        navigation.replace('Login');
      } else {
        navigation.navigate(route);
      }
    }
  };

  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <View style={styles.container}>
        <Animated.View style={[styles.scrim, {opacity: fadeAnim}]}>
          <Pressable style={styles.dismissPressable} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.drawer, {transform: [{translateX: slideAnim}]}]}>
          <View style={styles.drawerHeader}>
            <View style={styles.avatarBorder}>
              {userAvatar ? (
                <Image source={{uri: userAvatar}} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userRole}>{userRole}</Text>
              <Text style={styles.userId}>ID: {userId}</Text>
            </View>
          </View>

          <ScrollView style={styles.navScroll} contentContainerStyle={styles.navContent}>
            {navItems.map((item, idx) => {
              const isActive = activeRoute === item.route;
              return (
                <Pressable
                  key={idx}
                  style={[styles.navItem, isActive && styles.activeNavItem]}
                  onPress={() => handleNavigate(item.route)}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color={isActive ? colors.secondary : colors.textMuted}
                    style={styles.navIcon}
                  />
                  <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}

            <View style={styles.divider} />

            <Pressable style={styles.navItem} onPress={() => handleNavigate('Logout')}>
              <MaterialCommunityIcons name="logout" size={22} color={colors.danger} style={styles.navIcon} />
              <Text style={[styles.navLabel, styles.logoutLabel]}>Logout</Text>
            </Pressable>
          </ScrollView>

          <View style={styles.drawerFooter}>
            <View style={styles.healthCard}>
              <View style={styles.healthDot} />
              <Text style={styles.healthText}>System Health: Optimal</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, flexDirection: 'row'},
  scrim: {
    backgroundColor: 'rgba(14,165,233,0.08)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  dismissPressable: {flex: 1},
  drawer: {
    backgroundColor: colors.background,
    borderRightColor: colors.border,
    borderRightWidth: 1.5,
    elevation: 16,
    flexDirection: 'column',
    height: '100%',
    paddingTop: spacing.xxl,
    width: DRAWER_WIDTH,
  },
  drawerHeader: {
    alignItems: 'flex-start',
    borderBottomColor: colors.border,
    borderBottomWidth: 1.5,
    flexDirection: 'column',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  avatarBorder: {borderColor: colors.border, borderRadius: 30, borderWidth: 1.5, height: 60, overflow: 'hidden', width: 60},
  avatar: {height: '100%', resizeMode: 'cover', width: '100%'},
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    flex: 1,
    justifyContent: 'center',
  },
  avatarInitials: {color: colors.primary, fontSize: 20, fontWeight: '800'},
  headerInfo: {flexDirection: 'column'},
  userName: {color: colors.primary, fontSize: 18, fontWeight: '700'},
  userRole: {color: colors.textMuted, fontSize: 13, fontWeight: '500'},
  userId: {color: colors.textSoft, fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginTop: 2},
  navScroll: {flex: 1},
  navContent: {paddingVertical: spacing.md},
  navItem: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    height: 48,
    marginHorizontal: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  activeNavItem: {
    backgroundColor: colors.accentSoft || colors.secondarySoft,
    borderLeftColor: colors.secondary,
    borderLeftWidth: 4,
  },
  navIcon: {marginRight: spacing.sm},
  navLabel: {color: colors.text, fontSize: 14, fontWeight: '500'},
  activeNavLabel: {color: colors.secondary, fontWeight: '700'},
  logoutLabel: {color: colors.danger, fontWeight: '700'},
  divider: {backgroundColor: colors.borderLight, height: 1, marginHorizontal: spacing.md, marginVertical: spacing.md},
  drawerFooter: {borderTopColor: colors.border, borderTopWidth: 1.5, padding: spacing.md},
  healthCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.clay,
  },
  healthDot: {backgroundColor: colors.success, borderRadius: 4, height: 8, width: 8},
  healthText: {color: colors.textMuted, fontSize: 12, fontWeight: '600'},
});

export default SideDrawer;
