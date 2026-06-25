import React from 'react';
import {Pressable, ScrollView, StyleSheet, View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {logoutUser} from '../../store/slices/authSlice';
import {ROLE_LABELS} from '../../config/constants';
import {colors, radius, shadows, spacing} from '../../theme';

const InfoRow = ({icon, label, value}) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={16} color={colors.textMuted} />
    <View style={styles.infoBody}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const ProfileScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {user, role} = useSelector(state => state.auth);

  const initials = (user?.fullName || 'PR')
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="rgba(255,255,255,0.85)" />
        </Pressable>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.heroName}>{user?.fullName || 'Principal'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{ROLE_LABELS[role] || 'Principal'}</Text>
        </View>
        <Text style={styles.heroPhone}>{user?.phoneNumber || '—'}</Text>
      </Animated.View>

      <Animated.View style={styles.card}>
        <Text style={styles.cardSection}>Account Details</Text>
        <InfoRow icon="school-outline" label="Branch" value={user?.branchName || user?.branchId || '—'} />
        <InfoRow icon="phone-outline" label="Phone" value={user?.phoneNumber || '—'} />
        <InfoRow icon="identifier" label="User ID" value={user?.id || '—'} />
        <InfoRow icon="shield-check-outline" label="Role" value={ROLE_LABELS[role] || role || '—'} />
      </Animated.View>

      <Animated.View style={styles.card}>
        <Text style={styles.cardSection}>System</Text>
        <InfoRow icon="application-outline" label="App Version" value="v1.0.0 (Release)" />
        <InfoRow icon="database-outline" label="Database" value="Firebase Data Connect" />
        <InfoRow icon="earth" label="Region" value="asia-south1 (Live)" />
      </Animated.View>

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
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    position: 'relative',
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 140,
    position: 'absolute',
    right: -30,
    top: -40,
    width: 140},
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg},
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: radius.pill,
    borderWidth: 2.5,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 72},
  avatarText: {color: colors.white, fontSize: 26, fontWeight: '800'},
  heroName: {color: colors.white, fontSize: 20, fontWeight: '800', marginBottom: spacing.sm, textAlign: 'center'},
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
    paddingHorizontal: 14,
    paddingVertical: 4},
  roleText: {color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase'},
  heroPhone: {color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '500'},

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.clay},
  cardSection: {color: colors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: spacing.md, textTransform: 'uppercase'},
  infoRow: {
    alignItems: 'flex-start',
    borderBottomColor: colors.background,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm},
  infoBody: {flex: 1},
  infoLabel: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},
  infoValue: {color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 1},

  logoutBtn: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.md,
    paddingVertical: 14,
    ...shadows.fab},
  logoutBtnText: {color: colors.white, fontSize: 15, fontWeight: '700'}});

export default ProfileScreen;
