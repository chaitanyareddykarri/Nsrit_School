import React, {useCallback, useMemo, useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';
import {EmptyState} from '../../components';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';
import AssignBranchAdminModal from './components/AssignBranchAdminModal';
import AssignPrincipalModal from './components/AssignPrincipalModal';

const InfoRow = ({label, value}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || 'Not set'}</Text>
  </View>
);

const MetricPill = ({label, value}) => (
  <View style={styles.metricPill}>
    <Text style={styles.metricPillValue}>{value}</Text>
    <Text style={styles.metricPillLabel}>{label}</Text>
  </View>
);

const BranchDetailsScreen = ({navigation, route}) => {
  const {branchId} = route.params || {};
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showPrincipalModal, setShowPrincipalModal] = useState(false);
  const {data, loading, refreshing, error, refresh} = useAsyncResource(
    options => mainAdminService.getBranchDetails(branchId, options),
    [branchId],
  );

  const sections = useMemo(() => data?.sections || [], [data]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  if (loading && !data) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading branch details…</Text>
      </View>
    );
  }

  if (!data?.branch) {
    return (
      <View style={styles.root}>
        <EmptyState title="Branch unavailable" message={error || 'Unable to load this branch.'} />
      </View>
    );
  }

  const {branch, summary} = data;
  const isActive = branch.isActive !== false;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Hero ── */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroOverline}>{branch.branchCode}</Text>
            <Text style={styles.heroName} numberOfLines={2}>{branch.name}</Text>
            <Text style={styles.heroMeta}>{branch.city || 'City not set'}</Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: isActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}]}>
            <View style={[styles.statusDot, {backgroundColor: isActive ? colors.success : colors.danger}]} />
            <Text style={[styles.statusText, {color: isActive ? '#86efac' : '#fca5a5'}]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* stats row */}
        <View style={styles.statsRow}>
          {[
            {label: 'Students', value: summary?.totalStudents || 0},
            {label: 'Faculty & Staff', value: summary?.totalTeachers || 0},
            {label: 'Attendance', value: `${summary?.attendancePercent || 0}%`},
            {label: 'Collection', value: `${summary?.feeCollectionPercent || 0}%`},
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 ? <View style={styles.statSep} /> : null}
              <View style={styles.stat}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* action buttons */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => navigation.navigate('BranchOperationsDashboard', {branchId: branch.id})}
            style={styles.primaryAction}>
            <MaterialCommunityIcons name="view-dashboard-outline" size={14} color={colors.primaryDark} />
            <Text style={styles.primaryActionText}>Enter Operations</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('EditBranch', {branch})}
            style={styles.secondaryAction}>
            <MaterialCommunityIcons name="pencil-outline" size={14} color={colors.white} />
          </Pressable>
          <Pressable onPress={refresh} style={styles.secondaryAction}>
            <MaterialCommunityIcons name="refresh" size={14} color={colors.white} />
          </Pressable>
        </View>
      </Animated.View>

      {refreshing ? (
        <View style={styles.refreshingBar}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.refreshingText}>Refreshing…</Text>
        </View>
      ) : null}

      {/* ── Branch info ── */}
      <Animated.View style={styles.infoCard}>
        <Text style={styles.cardSection}>Branch Information</Text>
        <InfoRow label="Address" value={branch.address} />
        <InfoRow label="City" value={branch.city} />
        <InfoRow label="State" value={branch.state} />
        <InfoRow label="Pincode" value={branch.pincode} />
        <InfoRow label="Phone" value={branch.phone} />
        <InfoRow label="Email" value={branch.email} />
      </Animated.View>

      {/* ── Metrics grid ── */}
      <Animated.View style={styles.metricsGrid}>
        {[
          {label: 'Classes', value: summary?.totalClasses || 0},
          {label: 'Students', value: summary?.totalStudents || 0},
          {label: 'Faculty & Staff', value: summary?.totalTeachers || 0},
          {label: 'Coordinators', value: summary?.totalCoordinators || 0},
          {label: 'Accountants', value: summary?.totalAccountants || 0},
          {label: 'Attendance', value: `${summary?.attendancePercent || 0}%`},
        ].map(item => (
          <MetricPill key={item.label} label={item.label} value={item.value} />
        ))}
      </Animated.View>

      {/* ── Leadership ── */}
      <Animated.View style={styles.infoCard}>
        <Text style={styles.cardSection}>Leadership</Text>
        <InfoRow label="Principal" value={branch.principal?.fullName || 'Unassigned'} />
        <InfoRow label="Branch Admin" value={branch.branchAdmin?.fullName || 'Unassigned'} />
        <View style={styles.assignBtnsRow}>
          <Pressable
            onPress={() => setShowAdminModal(true)}
            style={styles.assignBtn}>
            <MaterialCommunityIcons name="account-tie" size={13} color={colors.primary} />
            <Text style={styles.assignBtnText}>Assign Admin</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowPrincipalModal(true)}
            style={styles.assignBtn}>
            <MaterialCommunityIcons name="school" size={13} color={colors.primary} />
            <Text style={styles.assignBtnText}>Assign Principal</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* ── Fees ── */}
      <Animated.View style={styles.infoCard}>
        <Text style={styles.cardSection}>Fee Collection</Text>
        <InfoRow label="Total Fees" value={formatCurrency(summary?.totalFees)} />
        <InfoRow label="Collected" value={formatCurrency(summary?.paidFees)} />
        <InfoRow label="Pending" value={formatCurrency(summary?.pendingFees)} />
        <InfoRow label="Collection Rate" value={`${summary?.feeCollectionPercent || 0}%`} />
      </Animated.View>

      {/* ── Classes ── */}
      <Text style={styles.listLabel}>Classes in Branch</Text>
      {sections.length ? (
        sections.map((section, index) => (
          <Animated.View key={section.id}>
            <Pressable
              onPress={() => navigation.navigate('ClassDetails', {sectionId: section.id})}
              style={({pressed}) => [styles.sectionItem, pressed && {opacity: 0.88}]}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons name="google-classroom" size={14} color={colors.primaryDark} />
              </View>
              <Text style={styles.sectionText}>
                {section.academicClass?.name || 'Class'} {section.name}
              </Text>
              <Text style={[styles.sectionStatus, {color: section.isActive ? colors.success : colors.textMuted}]}>
                {section.isActive ? 'Active' : 'Inactive'}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={14} color={colors.textMuted} />
            </Pressable>
          </Animated.View>
        ))
      ) : (
        <EmptyState title="No classes" message="Classes for this branch will appear here." />
      )}

      <View style={{height: spacing.xxxl}} />

      <AssignBranchAdminModal
        branchId={branch.id}
        visible={showAdminModal}
        onDismiss={() => setShowAdminModal(false)}
        onAssigned={refresh}
      />
      <AssignPrincipalModal
        branchId={branch.id}
        visible={showPrincipalModal}
        onDismiss={() => setShowPrincipalModal(false)}
        onAssigned={refresh}
      />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},
  loadingWrap: {alignItems: 'center', backgroundColor: colors.background, flex: 1, gap: spacing.md, justifyContent: 'center'},
  loadingText: {color: colors.textMuted, fontSize: 13, fontWeight: '600'},

  hero: {
    backgroundColor: colors.primaryDark,
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
  heroTop: {alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md},
  heroCopy: {flex: 1},
  heroOverline: {color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase'},
  heroName: {color: colors.white, fontSize: 20, fontWeight: '800', marginTop: 2},
  heroMeta: {color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '500', marginTop: 2},
  statusBadge: {alignItems: 'center', borderRadius: radius.pill, flexDirection: 'row', gap: 5, paddingHorizontal: spacing.sm, paddingVertical: 4},
  statusDot: {borderRadius: radius.pill, height: 6, width: 6},
  statusText: {fontSize: 10, fontWeight: '700'},
  statsRow: {
    borderTopColor: 'rgba(255,255,255,0.12)',
    borderTopWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingTop: spacing.md},
  stat: {alignItems: 'center', flex: 1},
  statValue: {color: colors.white, fontSize: 15, fontWeight: '800'},
  statLabel: {color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '700', marginTop: 1, textTransform: 'uppercase'},
  statSep: {backgroundColor: 'rgba(255,255,255,0.12)', width: 1},
  actionRow: {flexDirection: 'row', gap: spacing.sm},
  primaryAction: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    paddingVertical: spacing.sm},
  primaryActionText: {color: colors.primaryDark, fontSize: 12, fontWeight: '700'},
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34},

  refreshingBar: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm},
  refreshingText: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},

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
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingVertical: spacing.sm},
  infoLabel: {color: colors.textMuted, flex: 1, fontSize: 12, fontWeight: '500'},
  infoValue: {...typography.bodyBold, color: colors.text, flex: 1.4, fontSize: 12, textAlign: 'right'},
  assignBtnsRow: {borderTopColor: colors.borderLight, borderTopWidth: 1, flexDirection: 'row', gap: spacing.sm, padding: spacing.md},
  assignBtn: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.card,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    paddingVertical: spacing.sm},
  assignBtnText: {color: colors.primary, fontSize: 12, fontWeight: '700'},

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm},
  metricPill: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexBasis: '31%',
    flexGrow: 1,
    padding: spacing.md,
    ...shadows.clay},
  metricPillValue: {color: colors.primaryDark, fontSize: 18, fontWeight: '800'},
  metricPillLabel: {color: colors.textMuted, fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase'},

  listLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    textTransform: 'uppercase'},
  sectionItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.clay},
  sectionIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    height: 30,
    justifyContent: 'center',
    width: 30},
  sectionText: {...typography.bodyBold, color: colors.text, flex: 1},
  sectionStatus: {fontSize: 10, fontWeight: '700'}});

export default BranchDetailsScreen;
