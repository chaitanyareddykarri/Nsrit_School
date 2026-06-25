import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {logoutUser, switchUser, switchActiveRole} from '../../store/slices/authSlice';
import {ROLE_LABELS} from '../../config/constants';
import Toast from 'react-native-toast-message';
import {colors, radius, shadows, spacing} from '../../theme';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(Math.round(SCREEN_WIDTH * 0.82), 348);

const ROLE_CONFIG = {
  MAIN_ADMIN: {color: colors.primaryDark, icon: 'shield-crown-outline'},
  BRANCH_ADMIN: {color: colors.secondary, icon: 'office-building-outline'},
  PRINCIPAL: {color: colors.primary, icon: 'school-outline'},
  COORDINATOR: {color: colors.info, icon: 'account-supervisor-outline'},
  TEACHER: {color: colors.secondary, icon: 'teach'},
  CLASS_TEACHER: {color: colors.secondary, icon: 'account-school-outline'},
  PARENT: {color: colors.primary, icon: 'account-child-outline'},
  ACCOUNTANT: {color: colors.primary, icon: 'calculator-variant-outline'},
};

// ─── MenuItem ────────────────────────────────────────────────────────────────
const MenuItem = React.memo(({icon, label, sub, onPress, accentColor, badge, disabled, danger}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {toValue: 0.97, useNativeDriver: true, speed: 50}).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, {toValue: 1, useNativeDriver: true, speed: 30}).start();
  };

  const effectiveColor = danger ? colors.danger : (accentColor || colors.text);

  return (
    <Animated.View style={{transform: [{scale}]}}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={disabled ? undefined : handlePressIn}
        onPressOut={disabled ? undefined : handlePressOut}
        style={({pressed}) => [
          styles.menuItem,
          pressed && !disabled && styles.menuItemPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{disabled}}>
        <View style={[
          styles.menuItemIconWrap,
          {backgroundColor: disabled ? colors.background : `${effectiveColor}12`},
        ]}>
          <MaterialCommunityIcons
            name={icon}
            size={19}
            color={disabled ? colors.textSoft : effectiveColor}
          />
        </View>
        <View style={styles.menuItemCopy}>
          <Text style={[
            styles.menuItemLabel,
            {color: disabled ? colors.textSoft : danger ? colors.danger : colors.text},
          ]}>
            {label}
          </Text>
          {sub ? <Text style={styles.menuItemSub}>{sub}</Text> : null}
        </View>
        {badge ? (
          <View style={[styles.menuBadge, {backgroundColor: disabled ? colors.background : `${effectiveColor}15`}]}>
            <Text style={[styles.menuBadgeText, {color: disabled ? colors.textSoft : effectiveColor}]}>{badge}</Text>
          </View>
        ) : !disabled ? (
          <MaterialCommunityIcons name="chevron-right" size={15} color={danger ? `${colors.danger}60` : colors.border} />
        ) : null}
      </Pressable>
    </Animated.View>
  );
});

// ─── UserMenuDrawer ───────────────────────────────────────────────────────────
const UserMenuDrawer = ({
  visible,
  onClose,
  navigation,
  profileRoute,
  profileParams,
  settingsRoute,
  notificationsRoute,
  composeNotificationRoute,
}) => {
  const dispatch = useDispatch();
  const {user, role} = useSelector(state => state.auth);
  const [showConfirm, setShowConfirm] = useState(null);
  const [logging, setLogging] = useState(false);

  // Animations — slide from RIGHT (translateX: DRAWER_WIDTH → 0)
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    if (visible) {
      setShowConfirm(null);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 260,
          mass: 0.9,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 18,
          stiffness: 220,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: DRAWER_WIDTH,
          duration: 210,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim, scaleAnim]);

  const handleLogout = useCallback(async () => {
    setLogging(true);
    await dispatch(logoutUser());
    setLogging(false);
  }, [dispatch]);

  const handleSwitchUser = useCallback(async () => {
    setLogging(true);
    await dispatch(switchUser());
    setLogging(false);
  }, [dispatch]);

  const navigate = useCallback((route, params) => {
    onClose();
    setTimeout(() => {
      try { navigation.navigate(route, params || {}); } catch (_) {}
    }, 220);
  }, [onClose, navigation]);

  const roleKey = String(role || '').toUpperCase();
  const config = ROLE_CONFIG[roleKey] || {color: colors.primary, icon: 'account-outline'};
  const headerColor = config.color;
  const roleIcon = config.icon;
  const roleLabel = ROLE_LABELS[roleKey] || role || 'User';
  const userName = user?.fullName || user?.name || 'User';
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0] || '')
    .join('')
    .toUpperCase() || 'U';
  const phone = user?.phoneNumber || '';
  const branchName = user?.branchName || user?.branchId || null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      <StatusBar backgroundColor="rgba(0,0,0,0.45)" barStyle="light-content" />
      <View style={styles.overlay}>
        {/* Scrim */}
        <Animated.View style={[styles.scrim, {opacity: fadeAnim}]}>
          <Pressable style={styles.scrimPress} onPress={onClose} accessibilityLabel="Close menu" />
        </Animated.View>

        {/* Drawer */}
        <Animated.View style={[
          styles.drawer,
          {transform: [{translateX: slideAnim}, {scale: scaleAnim}]},
        ]}>
          {/* ── Header ── */}
          <View style={[styles.drawerHeader, {backgroundColor: headerColor}]}>
            {/* Decorative blobs */}
            <View style={[styles.blob, styles.blobLg]} />
            <View style={[styles.blob, styles.blobSm]} />

            {/* Close button */}
            <Pressable onPress={onClose} style={styles.closeBtnWrap} hitSlop={10} accessibilityLabel="Close">
              <View style={styles.closeBtnInner}>
                <MaterialCommunityIcons name="close" size={17} color="rgba(255,255,255,0.8)" />
              </View>
            </Pressable>

            {/* Avatar */}
            <View style={styles.avatarOuterRing}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            </View>

            {/* Name */}
            <Text style={styles.userName} numberOfLines={1}>{userName}</Text>

            {/* Role badge */}
            <View style={styles.roleBadgeRow}>
              <MaterialCommunityIcons name={roleIcon} size={11} color="rgba(255,255,255,0.75)" />
              <Text style={styles.roleBadgeText}>{roleLabel}</Text>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active</Text>
            </View>

            {/* Sub info */}
            <View style={styles.headerMeta}>
              {phone ? (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="phone-outline" size={10} color="rgba(255,255,255,0.55)" />
                  <Text style={styles.metaChipText}>{phone}</Text>
                </View>
              ) : null}
              {branchName ? (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="office-building-outline" size={10} color="rgba(255,255,255,0.55)" />
                  <Text style={styles.metaChipText} numberOfLines={1}>{branchName}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* ── Menu ── */}
          <ScrollView
            style={styles.menuScroll}
            contentContainerStyle={styles.menuContent}
            showsVerticalScrollIndicator={false}
            bounces={false}>
            {!showConfirm ? (
              <>
                {/* Section 1: Account */}
                <Text style={styles.sectionLabel}>ACCOUNT</Text>

                <MenuItem
                  icon="account-circle-outline"
                  label="My Profile"
                  sub="View and edit your details"
                  accentColor={headerColor}
                  onPress={() => navigate(profileRoute, profileParams)}
                  disabled={!profileRoute}
                />
                <View style={styles.rowDivider} />
                <MenuItem
                  icon="bell-ring-outline"
                  label="Notifications"
                  sub="Alerts and announcements"
                  accentColor={colors.warning}
                  onPress={() => navigate(notificationsRoute)}
                  disabled={!notificationsRoute}
                  badge={!notificationsRoute ? 'SOON' : undefined}
                />
                {composeNotificationRoute ? (
                  <>
                    <View style={styles.rowDivider} />
                    <MenuItem
                      icon="send-outline"
                      label="Send Notification"
                      sub="Broadcast to parents or staff"
                      accentColor={colors.secondary}
                      onPress={() => navigate(composeNotificationRoute)}
                    />
                  </>
                ) : null}
                <View style={styles.rowDivider} />
                <MenuItem
                  icon="cog-outline"
                  label="Settings"
                  sub="App preferences"
                  accentColor={colors.textMuted}
                  onPress={() => navigate(settingsRoute)}
                  disabled={!settingsRoute}
                  badge={!settingsRoute ? 'SOON' : undefined}
                />

                {/* Section: Roles Switcher */}
                {user?.roles && user.roles.length > 1 ? (
                  <>
                    <View style={styles.sectionGap} />
                    <Text style={styles.sectionLabel}>SWITCH ACTIVE ROLE</Text>
                    {user.roles
                      .filter(r => {
                        const rKey = String(r || '').toUpperCase();
                        if (rKey === 'CLASS_TEACHER') {
                          return !user.roles.some(x => String(x || '').toUpperCase() === 'TEACHER');
                        }
                        return true;
                      })
                      .map(r => {
                      const rKey = String(r || '').toUpperCase();
                      const isCurrent = rKey === String(role || '').toUpperCase();
                      const rConfig = ROLE_CONFIG[rKey] || {color: colors.primary, icon: 'account-outline'};
                      const rLabel = ROLE_LABELS[rKey] || r;
                      return (
                        <React.Fragment key={r}>
                          <Pressable
                            onPress={async () => {
                              if (isCurrent) return;
                              try {
                                onClose();
                                Toast.show({
                                  type: 'info',
                                  text1: 'Switching role...',
                                  text2: `Switching to ${rLabel}`,
                                  position: 'bottom',
                                });
                                await dispatch(switchActiveRole(r)).unwrap();
                                Toast.show({
                                  type: 'success',
                                  text1: 'Role switched successfully',
                                  text2: `Active role: ${rLabel}`,
                                  position: 'bottom',
                                });
                              } catch (err) {
                                Toast.show({
                                  type: 'error',
                                  text1: 'Role Switch Failed',
                                  text2: err.message || 'Could not switch role',
                                  position: 'bottom',
                                });
                              }
                            }}
                            style={({pressed}) => [
                              styles.roleItem,
                              isCurrent && styles.activeRoleItem,
                              pressed && {opacity: 0.8},
                            ]}>
                            <MaterialCommunityIcons
                              name={rConfig.icon}
                              size={18}
                              color={isCurrent ? colors.primary : colors.textSoft}
                            />
                            <View style={styles.roleTextWrap}>
                              <Text style={[styles.roleItemLabel, isCurrent && styles.activeRoleItemLabel]}>
                                {rLabel}
                              </Text>
                              {isCurrent && <Text style={styles.currentIndicator}>Active</Text>}
                            </View>
                            {isCurrent && (
                              <MaterialCommunityIcons
                                name="check-circle"
                                size={18}
                                color={colors.primary}
                              />
                            )}
                          </Pressable>
                          <View style={styles.rowDivider} />
                        </React.Fragment>
                      );
                    })}
                  </>
                ) : null}

                {/* Section 2: Session */}
                <View style={styles.sectionGap} />
                <Text style={styles.sectionLabel}>SESSION</Text>

                <MenuItem
                  icon="account-switch-outline"
                  label="Switch User"
                  sub="Login as a different account"
                  accentColor={colors.info}
                  onPress={() => setShowConfirm('switch')}
                />
                <View style={styles.rowDivider} />
                <MenuItem
                  icon="logout-variant"
                  label="Sign Out"
                  sub="End your current session"
                  danger
                  onPress={() => setShowConfirm('logout')}
                />
              </>
            ) : (
              <View style={styles.confirmCard}>
                <View style={[
                  styles.confirmIconWrap,
                  {backgroundColor: showConfirm === 'logout' ? colors.dangerSoft : colors.primarySoft},
                ]}>
                  <MaterialCommunityIcons
                    name={showConfirm === 'logout' ? 'logout-variant' : 'account-switch-outline'}
                    size={32}
                    color={showConfirm === 'logout' ? colors.danger : colors.primary}
                  />
                </View>

                <Text style={styles.confirmHeading}>
                  {showConfirm === 'logout' ? 'Sign out?' : 'Switch user?'}
                </Text>
                <Text style={styles.confirmBody}>
                  {showConfirm === 'logout'
                    ? 'Your session will end and you will be returned to the login screen.'
                    : 'Your current session will end. You can sign in with a different account.'}
                </Text>

                <Pressable
                  onPress={showConfirm === 'logout' ? handleLogout : handleSwitchUser}
                  disabled={logging}
                  style={({pressed}) => [
                    styles.confirmActionBtn,
                    {backgroundColor: showConfirm === 'logout' ? colors.danger : colors.primary},
                    (pressed || logging) && {opacity: 0.82},
                  ]}>
                  {logging ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name={showConfirm === 'logout' ? 'logout-variant' : 'account-switch-outline'}
                        size={16}
                        color={colors.white}
                      />
                      <Text style={styles.confirmActionText}>
                        {showConfirm === 'logout' ? 'Sign Out' : 'Switch Account'}
                      </Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => setShowConfirm(null)}
                  style={({pressed}) => [styles.confirmCancelBtn, pressed && {opacity: 0.75}]}>
                  <Text style={styles.confirmCancelText}>Cancel</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <View style={[styles.footerDot, {backgroundColor: headerColor}]} />
            <Text style={styles.footerText}>NSRIT Connect ERP • v1.0.0</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {bottom: 0, left: 0, position: 'absolute', right: 0, top: 0},

  scrim: {
    backgroundColor: 'rgba(2, 8, 23, 0.52)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  scrimPress: {flex: 1, height: SCREEN_HEIGHT},

  drawer: {
    backgroundColor: colors.white,
    bottom: 0,
    elevation: 28,
    position: 'absolute',
    right: 0,
    shadowColor: '#000',
    shadowOffset: {width: -4, height: 0},
    shadowOpacity: 0.22,
    shadowRadius: 20,
    top: 0,
    width: DRAWER_WIDTH,
  },

  // ─── Header ──────────────────────────────────────────────────────────────
  drawerHeader: {
    alignItems: 'flex-start',
    overflow: 'hidden',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    position: 'relative',
  },
  blob: {
    borderRadius: 999,
    position: 'absolute',
  },
  blobLg: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    height: 180,
    right: -50,
    top: -60,
    width: 180,
  },
  blobSm: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -30,
    height: 100,
    right: 40,
    width: 100,
  },

  closeBtnWrap: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md + 8,
  },
  closeBtnInner: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },

  avatarOuterRing: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: radius.pill,
    borderWidth: 2.5,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 72,
  },
  avatarInner: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radius.pill,
    height: 65,
    justifyContent: 'center',
    width: 65,
  },
  avatarInitials: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  userName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
  },

  roleBadgeRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    marginBottom: spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleBadgeText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  activeDot: {
    backgroundColor: '#4ADE80',
    borderRadius: radius.pill,
    height: 5,
    marginLeft: 2,
    width: 5,
  },
  activeText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 9,
    fontWeight: '600',
  },

  headerMeta: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 2},
  metaChip: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  metaChipText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '500',
  },

  // ─── Menu ────────────────────────────────────────────────────────────────
  menuScroll: {backgroundColor: colors.background, flex: 1},
  menuContent: {
    backgroundColor: colors.white,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },

  sectionLabel: {
    color: colors.textSoft,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 2,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  sectionGap: {height: 8, backgroundColor: colors.background},

  menuItem: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
  },
  menuItemPressed: {backgroundColor: colors.background},
  menuItemIconWrap: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  menuItemCopy: {flex: 1, minWidth: 0},
  menuItemLabel: {fontSize: 14, fontWeight: '700'},
  menuItemSub: {color: colors.textSoft, fontSize: 11, fontWeight: '500', marginTop: 1},
  menuBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  menuBadgeText: {fontSize: 8, fontWeight: '800', letterSpacing: 0.3},

  rowDivider: {backgroundColor: colors.background, height: 1, marginLeft: spacing.lg + 36 + spacing.md},

  // ─── Confirm card ────────────────────────────────────────────────────────
  confirmCard: {
    alignItems: 'center',
    flex: 1,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  confirmIconWrap: {
    alignItems: 'center',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 80,
  },
  confirmHeading: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  confirmBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  confirmActionBtn: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.md,
    paddingVertical: 14,
    width: '100%',
  },
  confirmActionText: {color: colors.white, fontSize: 15, fontWeight: '800'},
  confirmCancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  confirmCancelText: {color: colors.textMuted, fontSize: 14, fontWeight: '700'},

  // ─── Footer ──────────────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopColor: colors.background,
    borderTopWidth: 2,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  footerDot: {borderRadius: radius.pill, height: 5, width: 5},
  footerText: {color: colors.textSoft, fontSize: 10, fontWeight: '600'},
  roleItem: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  activeRoleItem: {
    backgroundColor: `${colors.primary}06`,
  },
  roleTextWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleItemLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSoft,
  },
  activeRoleItemLabel: {
    color: colors.primary,
  },
  currentIndicator: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 1,
    textTransform: 'uppercase',
  },
});

export default UserMenuDrawer;
