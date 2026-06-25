import React, {useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {selectRole, logoutUser} from '../../store/slices/authSlice';
import {ROLE_LABELS, USER_ROLES} from '../../config/constants';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const ROLE_META = {
  [USER_ROLES.MAIN_ADMIN]:   {icon: 'shield-crown',          color: '#7C3AED', description: 'Manage all branches and system-wide settings'},
  [USER_ROLES.BRANCH_ADMIN]: {icon: 'office-building-cog',   color: '#0284C7', description: 'Oversee branch operations and staff'},
  [USER_ROLES.PRINCIPAL]:    {icon: 'account-tie',            color: '#0D9488', description: 'Academic leadership and school management'},
  [USER_ROLES.COORDINATOR]:  {icon: 'account-supervisor',     color: '#D97706', description: 'Manage academic operations and wings'},
  [USER_ROLES.TEACHER]:      {icon: 'human-male-board',       color: '#059669', description: 'Mark attendance and manage classes'},
  [USER_ROLES.CLASS_TEACHER]:{icon: 'account-school',         color: '#059669', description: 'Class teacher duties and section management'},
  [USER_ROLES.PARENT]:       {icon: 'account-child-circle',   color: '#2563EB', description: 'View child attendance, fees and homework'},
  [USER_ROLES.ACCOUNTANT]:   {icon: 'cash-register',          color: '#B45309', description: 'Fee collection and financial records'}};

const RoleCard = ({roleKey, onPress, loading}) => {
  const meta = ROLE_META[roleKey] || {icon: 'account', color: colors.primary, description: ''};
  const label = ROLE_LABELS[roleKey] || roleKey;
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}]}));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, {damping: 15, stiffness: 400});
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15, stiffness: 300});
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={() => onPress(roleKey)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading}
        style={({pressed}) => [styles.roleCard, pressed && styles.roleCardPressed]}>
        <View style={[styles.roleIconWrap, {backgroundColor: `${meta.color}15`}]}>
          <MaterialCommunityIcons name={meta.icon} size={26} color={meta.color} />
        </View>
        <View style={styles.roleCopy}>
          <Text style={styles.roleLabel}>{label}</Text>
          <Text style={styles.roleDesc} numberOfLines={2}>{meta.description}</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={meta.color} />
        ) : (
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
        )}
      </Pressable>
    </Animated.View>
  );
};

const RoleSelectionScreen = () => {
  const dispatch = useDispatch();
  const {user, error} = useSelector(state => state.auth);
  const [selectingRole, setSelectingRole] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const rawRoles = user?.roles || [];
  const hasTeacher = rawRoles.some(r => String(r || '').toUpperCase() === 'TEACHER');
  const roles = rawRoles.filter(r => !(String(r || '').toUpperCase() === 'CLASS_TEACHER' && hasTeacher));
  const userName = user?.fullName || user?.name || 'User';
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0] || '')
    .join('')
    .toUpperCase() || 'U';

  const handleSelect = async role => {
    if (selectingRole) {
      return;
    }
    setSelectingRole(role);
    try {
      await dispatch(selectRole(role)).unwrap();
      // AppNavigator detects isAuthenticated → true and switches to role dashboard automatically
    } catch (e) {
      console.warn('Role selection failed:', e);
    } finally {
      setSelectingRole(null);
    }
  };

  const handleCancel = async () => {
    setLoggingOut(true);
    await dispatch(logoutUser());
    setLoggingOut(false);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Background blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View style={styles.header}>
          <View style={styles.avatarRing}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.subtitle}>
            This account has multiple roles.{'\n'}Select how you want to sign in.
          </Text>
        </Animated.View>

        {/* Role cards */}
        <Animated.View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account-multiple" size={14} color={colors.textMuted} />
            <Text style={styles.sectionLabel}>SELECT AN ACCOUNT</Text>
          </View>

          <View style={styles.cardList}>
            {roles.map((role, idx) => (
              <Animated.View
                key={role}>
                <RoleCard
                  roleKey={String(role).toUpperCase()}
                  onPress={handleSelect}
                  loading={selectingRole === String(role).toUpperCase()}
                />
                {idx < roles.length - 1 && <View style={styles.divider} />}
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Error */}
        {error ? (
          <Animated.View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        ) : null}

        {/* Cancel / use different account */}
        <Animated.View style={styles.footer}>
          <Pressable
            onPress={handleCancel}
            disabled={loggingOut || Boolean(selectingRole)}
            style={({pressed}) => [styles.cancelBtn, pressed && {opacity: 0.7}]}>
            {loggingOut ? (
              <ActivityIndicator size="small" color={colors.textMuted} />
            ) : (
              <>
                <MaterialCommunityIcons name="logout-variant" size={14} color={colors.textMuted} />
                <Text style={styles.cancelText}>Use a different account</Text>
              </>
            )}
          </Pressable>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background},
  blobTop: {
    position: 'absolute',
    top: -40,
    right: -70,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.primarySoft,
    opacity: 0.4},
  blobBottom: {
    position: 'absolute',
    bottom: -30,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.secondarySoft,
    opacity: 0.3},
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.xxl},
  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl},
  avatarRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.fab},
  avatarText: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5},
  greeting: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 2},
  userName: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center'},
  subtitle: {
    ...typography.body,
    color: colors.textSoft,
    textAlign: 'center',
    lineHeight: 20},
  // Section
  section: {
    marginBottom: spacing.lg},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm},
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8},
  cardList: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden'},
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 50 + spacing.md},
  // Role card
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    gap: spacing.md,
    backgroundColor: colors.surface},
  roleCardPressed: {
    backgroundColor: colors.background},
  roleIconWrap: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center'},
  roleCopy: {
    flex: 1,
    minWidth: 0},
  roleLabel: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2},
  roleDesc: {
    ...typography.caption,
    color: colors.textSoft,
    lineHeight: 16},
  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.danger,
    padding: spacing.md,
    marginBottom: spacing.lg},
  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600'},
  // Footer
  footer: {
    alignItems: 'center',
    marginTop: spacing.md},
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg},
  cancelText: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 13}});

export default RoleSelectionScreen;
