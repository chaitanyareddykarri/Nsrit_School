import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {logoutUser} from '../../store/slices/authSlice';
import {ROLE_LABELS} from '../../config/constants';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const InfoRow = ({label, value}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const {user, role} = useSelector(state => state.auth);

  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'MA';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Hero ── */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{userInitials}</Text>
        </View>
        <Text style={styles.heroName}>{user?.fullName || 'NSRIT Administrator'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{ROLE_LABELS[role] || 'Main Admin'}</Text>
        </View>
        <Text style={styles.heroPhone}>{user?.phoneNumber || 'No phone set'}</Text>
      </Animated.View>

      {/* ── System info ── */}
      <Animated.View style={styles.infoCard}>
        <Text style={styles.cardSection}>System Environment</Text>
        <InfoRow label="App Version" value="v1.0.0 (Release)" />
        <InfoRow label="Database" value="Firebase Data Connect" />
        <InfoRow label="Region" value="asia-south1 (Live)" />
        <InfoRow label="Auth Service" value="Production Phone Auth" />
        <InfoRow label="Active Workspace" value="chaitanyareddykarri/NSRITSchoolApp" />
      </Animated.View>

      {/* ── Sign out ── */}
      <Pressable
        onPress={() => dispatch(logoutUser())}
        style={({pressed}) => [styles.logoutBtn, pressed && {opacity: 0.88}]}>
        <MaterialCommunityIcons name="logout" size={17} color={colors.white} />
        <Text style={styles.logoutBtnText}>Sign Out of ERP</Text>
      </Pressable>

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},

  hero: {
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.xl,
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 80,
    height: 160,
    position: 'absolute',
    right: -30,
    top: -50,
    width: 160},
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 72},
  avatarText: {color: colors.white, fontSize: 22, fontWeight: '800'},
  heroName: {color: colors.white, fontSize: 18, fontWeight: '800', textAlign: 'center'},
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 3},
  roleText: {color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '800', textTransform: 'uppercase'},
  heroPhone: {color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '500'},

  infoCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.clay},
  cardSection: {
    backgroundColor: colors.background,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    padding: spacing.md,
    paddingBottom: spacing.xs,
    textTransform: 'uppercase'},
  infoRow: {
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md},
  infoLabel: {color: colors.textMuted, fontSize: 12, fontWeight: '600'},
  infoValue: {...typography.bodyBold, color: colors.text, fontSize: 12},

  logoutBtn: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 50,
    justifyContent: 'center',
    ...shadows.fab},
  logoutBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'}});

export default ProfileScreen;
