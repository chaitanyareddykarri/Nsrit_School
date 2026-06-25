import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, StatusBadge} from '../../components';
import {WING_LABELS} from '../../config/academic';
import {ROLE_LABELS} from '../../config/constants';
import coordinatorService from '../../services/coordinators/coordinatorService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const getInitials = name =>
  name
    ? name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    : '?';

const InfoRow = ({icon, label, value}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <MaterialCommunityIcons name={icon} size={15} color={colors.primary} />
    </View>
    <View style={styles.infoBody}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>{value || '—'}</Text>
    </View>
  </View>
);

const normalizeRole = role => String(role || '').toUpperCase();
const uniqueRoles = roles => [...new Set((roles || []).map(item => normalizeRole(item?.role || item)).filter(Boolean))];

const CoordinatorDetailsScreen = ({navigation, route}) => {
  const coordinatorId = route.params?.coordinatorId;
  const {data} = useQuery({
    queryKey: ['coordinator', coordinatorId],
    queryFn: () => coordinatorService.getCoordinatorDetails(coordinatorId),
    enabled: Boolean(coordinatorId)});

  if (!data) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Coordinator not found"
          message="The selected coordinator could not be loaded."
        />
      </View>
    );
  }
  const roles = uniqueRoles([...(data.user?.roles || []), data.user?.role]);

  const isActive = data.isActive !== false;
  const name = data.user?.fullName || 'Coordinator';
  const wingLabel = WING_LABELS[data.wing] || data.wing || '—';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Hero ── */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.heroContent}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroName} numberOfLines={2}>{name}</Text>
            <Text style={styles.heroMeta}>{wingLabel}</Text>
          </View>
        </View>
        <View style={styles.heroFooter}>
          <View style={[styles.statusBadge, {backgroundColor: isActive ? 'rgba(34,197,94,0.22)' : 'rgba(239,68,68,0.22)'}]}>
            <View style={[styles.statusDot, {backgroundColor: isActive ? colors.success : colors.danger}]} />
            <Text style={[styles.statusText, {color: isActive ? '#86efac' : '#fca5a5'}]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('EditCoordinator', {coordinator: data})}
            style={styles.editBtn}>
            <MaterialCommunityIcons name="pencil-outline" size={13} color={colors.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* ── Roles ── */}
      {roles.length ? (
        <View style={styles.roleRow}>
          {roles.map(role => (
            <StatusBadge key={role} status="info" label={ROLE_LABELS[role] || role} />
          ))}
        </View>
      ) : null}

      {/* ── Info card ── */}
      <Animated.View style={styles.infoCard}>
        <Text style={styles.cardSection}>Contact & Identity</Text>
        <InfoRow icon="phone" label="Mobile" value={data.user?.phoneNumber} />
        <InfoRow icon="email-outline" label="Email" value={data.email} />
        <InfoRow icon="badge-account-outline" label="Employee ID" value={data.employeeId} />
        <InfoRow icon="view-dashboard-outline" label="Wing" value={wingLabel} />
      </Animated.View>

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},

  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130},
  heroContent: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md},
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56},
  avatarText: {color: colors.white, fontSize: 16, fontWeight: '800'},
  heroCopy: {flex: 1},
  heroName: {color: colors.white, fontSize: 18, fontWeight: '800'},
  heroMeta: {color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '500', marginTop: 2},
  heroFooter: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between'},
  statusBadge: {alignItems: 'center', borderRadius: radius.pill, flexDirection: 'row', gap: 5, paddingHorizontal: spacing.sm, paddingVertical: 4},
  statusDot: {borderRadius: radius.pill, height: 6, width: 6},
  statusText: {fontSize: 11, fontWeight: '700'},
  editBtn: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs},
  editBtnText: {color: colors.primary, fontSize: 12, fontWeight: '700'},

  infoCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
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
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md},
  infoIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.card,
    height: 32,
    justifyContent: 'center',
    width: 32},
  infoBody: {flex: 1, minWidth: 0},
  infoLabel: {color: colors.textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase'},
  infoValue: {...typography.bodyBold, color: colors.text, fontSize: 13, marginTop: 1},
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md}});

export default CoordinatorDetailsScreen;
