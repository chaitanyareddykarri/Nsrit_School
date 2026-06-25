import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, StatusBadge} from '../../components';
import {ROLE_LABELS} from '../../config/constants';
import parentService from '../../services/parents/parentService';
import {formatCurrency} from '../../utils/formatters/currency';
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

const InfoRow = ({icon, label, value, color = colors.text}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconWrap}>
      <MaterialCommunityIcons name={icon} size={15} color={colors.primary} />
    </View>
    <View style={styles.infoCopy}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, {color}]} numberOfLines={1}>
        {value || '—'}
      </Text>
    </View>
  </View>
);

const normalizeRole = role => String(role || '').toUpperCase();
const uniqueRoles = roles => [...new Set((roles || []).map(item => normalizeRole(item?.role || item)).filter(Boolean))];

const ChildCard = ({child, index}) => {
  const attendancePct = child.attendanceSummary?.percentage || 0;
  const feeDue = child.feeSummary?.due || 0;
  const attColor =
    attendancePct >= 75
      ? colors.success
      : attendancePct >= 60
      ? colors.warning
      : colors.danger;

  return (
    <Animated.View
      style={styles.childCard}>
      <View style={styles.childCardTop}>
        <View style={styles.childAvatar}>
          <Text style={styles.childAvatarText}>{getInitials(child.fullName)}</Text>
        </View>
        <View style={styles.childInfo}>
          <Text style={styles.childName} numberOfLines={1}>
            {child.fullName}
          </Text>
          <View style={styles.childMeta}>
            <MaterialCommunityIcons
              name="google-classroom"
              size={11}
              color={colors.textMuted}
            />
            <Text style={styles.childMetaText}>
              {child.academicClass?.name || '-'}–{child.section?.name || '-'}
            </Text>
            {child.studentId ? (
              <>
                <View style={styles.metaDot} />
                <Text style={styles.childMetaText}>#{child.studentId}</Text>
              </>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.childStats}>
        <View style={styles.childStat}>
          <Text style={[styles.childStatValue, {color: attColor}]}>
            {attendancePct}%
          </Text>
          <Text style={styles.childStatLabel}>Attendance</Text>
        </View>
        <View style={styles.childStatSep} />
        <View style={styles.childStat}>
          <Text
            style={[
              styles.childStatValue,
              {color: feeDue > 0 ? colors.danger : colors.success},
            ]}>
            {feeDue > 0 ? formatCurrency(feeDue) : 'Nil'}
          </Text>
          <Text style={styles.childStatLabel}>Fee Due</Text>
        </View>
        <View style={styles.childStatSep} />
        <View style={styles.childStat}>
          <Text style={[styles.childStatValue, {color: colors.text}]}>
            {child.feeSummary?.total
              ? `${Math.round(((child.feeSummary.paid || 0) / child.feeSummary.total) * 100)}%`
              : '—'}
          </Text>
          <Text style={styles.childStatLabel}>Paid</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const ProfileScreen = () => {
  const user = useSelector(state => state.auth.user);
  const parentId = user?.parentId;

  const {data: children = [], error, isLoading} = useQuery({
    queryKey: ['parentChildren', parentId],
    queryFn: () => parentService.getParentChildren(parentId),
    enabled: Boolean(parentId)});

  const parent = children[0]?.parent;
  const displayName = parent?.fullName || user?.fullName || user?.name || 'Parent';
  const phone = parent?.phoneNumber || user?.phoneNumber || '';
  const roles = uniqueRoles([...(user?.roles || []), user?.role]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Hero header ── */}
      <Animated.View
        style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.heroDecor2} />

        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
        </View>
        <Text style={styles.heroName}>{isLoading ? 'Loading…' : displayName}</Text>
        {phone ? (
          <View style={styles.phoneBadge}>
            <MaterialCommunityIcons name="phone-outline" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.phoneBadgeText}>{phone}</Text>
          </View>
        ) : null}
        <View style={styles.roleChip}>
          <Text style={styles.roleChipText}>PARENT ACCOUNT</Text>
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

      {/* ── Parent details ── */}
      {(parent?.fatherName || parent?.motherName || parent?.email) ? (
        <Animated.View
          style={styles.detailCard}>
          <Text style={styles.sectionLabel}>Family Details</Text>
          {parent?.fatherName ? (
            <InfoRow icon="account-outline" label="Father" value={parent.fatherName} />
          ) : null}
          {parent?.motherName ? (
            <InfoRow icon="account-heart-outline" label="Mother" value={parent.motherName} />
          ) : null}
          {parent?.email ? (
            <InfoRow icon="email-outline" label="Email" value={parent.email} />
          ) : null}
          {parent?.address ? (
            <InfoRow icon="map-marker-outline" label="Address" value={parent.address} />
          ) : null}
        </Animated.View>
      ) : null}

      {/* ── Children ── */}
      <Text style={styles.childrenHeader}>
        {children.length > 0
          ? `Linked Children (${children.length})`
          : 'Linked Children'}
      </Text>

      {error ? (
        <EmptyState title="Unable to load children" message={error.message} />
      ) : isLoading ? (
        <View style={styles.loadingCard}>
          <MaterialCommunityIcons
            name="account-school-outline"
            size={32}
            color={colors.border}
          />
          <Text style={styles.loadingText}>Loading children…</Text>
        </View>
      ) : children.length ? (
        children.map((child, i) => (
          <ChildCard key={child.id} child={child} index={i} />
        ))
      ) : (
        <EmptyState
          title="No linked children"
          message="Child records linked to your account will appear here."
        />
      )}

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},

  // Hero
  hero: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 100,
    height: 160,
    position: 'absolute',
    right: -30,
    top: -50,
    width: 160},
  heroDecor2: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 80,
    height: 110,
    left: -20,
    position: 'absolute',
    bottom: -30,
    width: 110},
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 72},
  avatarText: {color: colors.white, fontSize: 26, fontWeight: '900'},
  heroName: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: spacing.sm,
    textAlign: 'center'},
  phoneBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 5},
  phoneBadgeText: {color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600'},
  roleChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 4},
  roleChipText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2},

  // Detail card
  detailCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    ...shadows.clay},
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.md,
    textTransform: 'uppercase'},
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1},
  infoIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    height: 30,
    justifyContent: 'center',
    width: 30},
  infoCopy: {flex: 1},
  infoLabel: {...typography.overline, color: colors.textMuted, fontSize: 9},
  infoValue: {...typography.bodyBold, fontSize: 13},

  // Children header
  childrenHeader: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.md,
    textTransform: 'uppercase'},

  // Child card
  childCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.clay},
  childCardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md},
  childAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44},
  childAvatarText: {color: colors.primary, fontSize: 14, fontWeight: '800'},
  childInfo: {flex: 1, minWidth: 0},
  childName: {...typography.bodyBold, color: colors.text},
  childMeta: {alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 2},
  childMetaText: {color: colors.textMuted, fontSize: 11, fontWeight: '500'},
  metaDot: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 3,
    width: 3},

  childStats: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md},
  childStat: {alignItems: 'center', flex: 1, gap: 2},
  childStatValue: {fontSize: 14, fontWeight: '800'},
  childStatLabel: {color: colors.textMuted, fontSize: 10, fontWeight: '600'},
  childStatSep: {backgroundColor: colors.border, height: 28, width: 1},

  // Loading
  loadingCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    gap: spacing.sm,
    padding: spacing.xxl},
  loadingText: {color: colors.textMuted, fontSize: 13, fontWeight: '600'},
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md}});

export default ProfileScreen;
