import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {
  AttendanceRing,
  DashboardCard,
  EmptyState,
  SectionHeader} from '../../components';
import parentService from '../../services/parents/parentService';
import {formatCurrency} from '../../utils/formatters/currency';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import UserMenuDrawer from '../../components/common/UserMenuDrawer';
import {storage} from '../../services/storage/mmkvStorage';
import {STORAGE_KEYS} from '../../config/constants';

const QuickAction = ({icon, label, onPress, color = colors.primary, delay = 0}) => (
  <Animated.View>
    <Pressable onPress={onPress} style={styles.quickAction}>
      <View style={[styles.qaIcon, {backgroundColor: `${color}15`}]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.qaLabel} numberOfLines={1}>{label}</Text>
    </Pressable>
  </Animated.View>
);

const HeroMetric = ({label, value, color = colors.success, icon}) => (
  <View style={[styles.heroMetric, {borderColor: `${color}25`}]}>
    <View style={[styles.heroMetricIcon, {backgroundColor: `${color}15`}]}>
      <MaterialCommunityIcons name={icon} size={14} color={color} />
    </View>
    <View>
      <Text style={[styles.heroMetricValue, {color}]}>{value}</Text>
      <Text style={styles.heroMetricLabel}>{label}</Text>
    </View>
  </View>
);

const DashboardScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const parentId = user?.parentId;
  const [selectedChildId, setSelectedChildId] = useState(() => {
    return storage.getString(STORAGE_KEYS.ACTIVE_CHILD_ID) || null;
  });

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const persistedId = storage.getString(STORAGE_KEYS.ACTIVE_CHILD_ID);
      if (persistedId) {
        setSelectedChildId(persistedId);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const {data, error} = useQuery({
    queryKey: ['parentDashboard', parentId],
    queryFn: () => parentService.getParentDashboard(parentId),
    enabled: Boolean(parentId)});

  const children = data?.children || [];
  const selectedChild = children.find(c => c.id === selectedChildId) || children[0] || null;
  const attendancePct = selectedChild?.attendanceSummary?.percentage || 0;
  const totalDue = data?.totalDue || 0;

  const handleSelectChild = childId => {
    setSelectedChildId(childId);
    storage.set(STORAGE_KEYS.ACTIVE_CHILD_ID, childId);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) {return 'Good morning';}
    if (h < 17) {return 'Good afternoon';}
    return 'Good evening';
  };

  return (
    <>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* ── Clay Hero Header ── */}
        <Animated.View style={styles.header}>
          <View style={styles.blob1} />
          <View style={styles.blob2} />
          <View style={styles.blob3} />

          <View style={styles.headerTop}>
            <View style={styles.headerCopy}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.parentName} numberOfLines={1}>
                {user?.fullName || user?.name || 'Parent'}
              </Text>
            </View>
            <Pressable onPress={() => setMenuOpen(true)} style={styles.menuBtn} hitSlop={6}>
              <MaterialCommunityIcons name="dots-vertical" size={20} color="rgba(255,255,255,0.9)" />
            </Pressable>
          </View>

          <View style={styles.headerBottomRow}>
            <View style={styles.roleBadge}>
              <View style={styles.roleDot} />
              <Text style={styles.roleText}>Parent Portal</Text>
            </View>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short', day: 'numeric', month: 'short'})}
            </Text>
          </View>
        </Animated.View>

        {/* ── Hero Child Card ── */}
        {selectedChild ? (
          <Animated.View
            style={styles.heroCard}>
            <View style={styles.heroCardAccent} />
            <View style={styles.heroCardInner}>
              <View style={styles.heroTop}>
                <View style={styles.heroLeft}>
                  <View style={styles.childAvatar}>
                    <MaterialCommunityIcons name="account-school" size={28} color={colors.primary} />
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName} numberOfLines={1}>
                      {selectedChild.fullName}
                    </Text>
                    <Text style={styles.childMeta}>
                      {selectedChild.academicClass?.name || '—'}{' · '}{selectedChild.section?.name || '—'}
                    </Text>
                    <Text style={styles.childId}>{selectedChild.studentId}</Text>
                  </View>
                </View>

                <AttendanceRing
                  percentage={attendancePct}
                  size={90}
                  strokeWidth={8}
                  color={attendancePct >= 75 ? colors.success : colors.danger}
                  trackColor={colors.borderLight}
                  bgColor={colors.white}>
                  <Text style={[styles.ringPct, {color: attendancePct >= 75 ? colors.success : colors.danger}]}>
                    {attendancePct}%
                  </Text>
                  <Text style={styles.ringLabel}>ATT</Text>
                </AttendanceRing>
              </View>

              <View style={styles.heroMetrics}>
                <HeroMetric
                  icon="calendar-check"
                  label="Attendance"
                  value={`${attendancePct}%`}
                  color={attendancePct >= 75 ? colors.success : colors.danger}
                />
                <HeroMetric
                  icon="cash-clock"
                  label="Fee Due"
                  value={formatCurrency(selectedChild.feeSummary?.due || 0)}
                  color={colors.warning}
                />
                <HeroMetric
                  icon="school-outline"
                  label="Class"
                  value={selectedChild.academicClass?.name || '—'}
                  color={colors.info}
                />
              </View>

              <Pressable
                onPress={() => navigation.navigate('Students')}
                style={styles.changeChildBtn}>
                <MaterialCommunityIcons name="swap-horizontal" size={13} color={colors.primary} />
                <Text style={styles.changeChildText}>Switch child</Text>
              </Pressable>
            </View>
          </Animated.View>
        ) : (
          <Animated.View>
            <EmptyState
              icon="account-child-outline"
              title="No child linked"
              message="Once admission is complete, your child's record will appear here."
              actionLabel="Select Child"
              onAction={() => navigation.navigate('Students')}
            />
          </Animated.View>
        )}

        {!selectedChild && children.length > 0 ? (
          <DashboardCard
            title="Select Child"
            value={`${children.length} linked`}
            description="Tap to choose which child to view"
            icon="account-child-outline"
            tone={colors.primary}
            onPress={() => navigation.navigate('Students')}
          />
        ) : null}

        {/* ── Quick Actions ── */}
        <SectionHeader title="Quick Actions" icon="lightning-bolt" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.qaStrip}>
          <QuickAction icon="chart-donut"          label="Attendance"   color={colors.success}   delay={0}   onPress={() => navigation.navigate('Attendance', selectedChild ? {studentId: selectedChild.id} : undefined)} />
          <QuickAction icon="file-chart-outline"   label="Results"      color={colors.info}      delay={30}  onPress={() => navigation.navigate('Results')} />
          <QuickAction icon="cash-multiple"        label="Fee Ledger"   color={colors.warning}   delay={60}  onPress={() => navigation.navigate('FeeLedger')} />
          <QuickAction icon="cash-register"        label="Pay Fees"     color={colors.success}   delay={90}  onPress={() => navigation.navigate('Payments')} />
          <QuickAction icon="calendar-month"       label="Timetable"   color={colors.secondary} delay={90}  onPress={() => navigation.navigate('Timetable')} />
          <QuickAction icon="bell-outline"         label="Notices"      color={colors.info}      delay={120} onPress={() => navigation.navigate('ParentNotices')} />
          <QuickAction icon="message-text-outline" label="Suggestions"  color={colors.accent}    delay={180} onPress={() => navigation.navigate('ParentSuggestions')} />
          <QuickAction icon="account-switch"       label="Switch Child" color={colors.secondary} delay={240} onPress={() => navigation.navigate('Students')} />
          <QuickAction icon="account-circle-outline" label="Profile"    color={colors.purple}    delay={300} onPress={() => navigation.navigate('Profile')} />
        </ScrollView>

        {/* ── Fee Summary ── */}
        <SectionHeader
          title="Fee Summary"
          icon="cash-multiple"
          actionLabel="View All"
          onAction={() => navigation.navigate('FeeLedger')}
        />
        <Animated.View
          style={styles.feeCard}>
          <View style={styles.feeCardAccent} />
          <View style={styles.feeCardInner}>
            <View style={styles.feeRow}>
              <View style={styles.feeStat}>
                <View style={[styles.feeStatIcon, {backgroundColor: `${colors.success}15`}]}>
                  <MaterialCommunityIcons name="cash-check" size={18} color={colors.success} />
                </View>
                <Text style={[styles.feeValue, {color: colors.success}]}>
                  {formatCurrency(data?.totalPaid || 0)}
                </Text>
                <Text style={styles.feeStatLabel}>Paid</Text>
              </View>
              <View style={styles.feeDivider} />
              <View style={styles.feeStat}>
                <View style={[styles.feeStatIcon, {backgroundColor: `${colors.danger}15`}]}>
                  <MaterialCommunityIcons name="cash-clock" size={18} color={colors.danger} />
                </View>
                <Text style={[styles.feeValue, {color: colors.danger}]}>
                  {formatCurrency(totalDue)}
                </Text>
                <Text style={styles.feeStatLabel}>Due</Text>
              </View>
              <View style={styles.feeDivider} />
              <View style={styles.feeStat}>
                <View style={[styles.feeStatIcon, {backgroundColor: `${colors.info}15`}]}>
                  <MaterialCommunityIcons name="sale" size={18} color={colors.info} />
                </View>
                <Text style={[styles.feeValue, {color: colors.info}]}>
                  {formatCurrency(data?.totalConcession || 0)}
                </Text>
                <Text style={styles.feeStatLabel}>Concession</Text>
              </View>
            </View>

            {totalDue > 0 ? (
              <Pressable
                onPress={() => navigation.navigate('FeeLedger')}
                style={styles.payNowBtn}>
                <MaterialCommunityIcons name="credit-card-outline" size={15} color={colors.white} />
                <Text style={styles.payNowText}>Pay Now</Text>
              </Pressable>
            ) : (
              <View style={styles.feeClearBadge}>
                <MaterialCommunityIcons name="check-circle" size={14} color={colors.success} />
                <Text style={styles.feeClearText}>All fees cleared</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── All Children ── */}
        {children.length > 1 ? (
          <>
            <SectionHeader title="All Children" icon="account-group-outline" />
            {children.map((child, i) => (
              <Animated.View
                key={child.id}>
                <DashboardCard
                  title={child.fullName}
                  value={`${child.attendanceSummary?.percentage || 0}% att.`}
                  description={`${child.academicClass?.name || '—'}-${child.section?.name || '—'} · Due: ${formatCurrency(child.feeSummary?.due || 0)}`}
                  icon="account-school-outline"
                  tone={colors.primary}
                  onPress={() => navigation.navigate('Attendance', {studentId: child.id})}
                />
              </Animated.View>
            ))}
          </>
        ) : null}

        {error ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Could not load dashboard"
            message={error.message}
          />
        ) : null}

      </ScrollView>

      <UserMenuDrawer
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        navigation={navigation}
        profileRoute="Profile"
      />
    </>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.page, paddingBottom: spacing.xxxl + spacing.xl},

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    ...shadows.clayDeep,
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    padding: spacing.xl,
    paddingBottom: spacing.lg},
  blob1: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 100,
    height: 160,
    position: 'absolute',
    right: -30,
    top: -40,
    width: 160},
  blob2: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 70,
    bottom: -30,
    height: 110,
    left: -15,
    position: 'absolute',
    width: 110},
  blob3: {
    backgroundColor: 'rgba(125,211,252,0.12)',
    borderRadius: 60,
    height: 90,
    left: '35%',
    position: 'absolute',
    top: -10,
    width: 90},
  headerTop: {alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md},
  headerCopy: {flex: 1, minWidth: 0},
  greeting: {...typography.overline, color: 'rgba(255,255,255,0.65)'},
  parentName: {...typography.title, color: colors.white, marginTop: 2},
  menuBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md,
    height: 38, width: 38,
    justifyContent: 'center'},
  headerBottomRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  roleBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 5},
  roleDot: {backgroundColor: '#4ADE80', borderRadius: radius.pill, height: 7, width: 7},
  roleText: {color: colors.white, fontSize: 11, fontWeight: '700'},
  headerDate: {...typography.captionBold, color: 'rgba(255,255,255,0.60)'},

  // ── Hero Child Card ───────────────────────────────────────────────────────
  heroCard: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden'},
  heroCardAccent: {backgroundColor: colors.primary, height: 4},
  heroCardInner: {padding: spacing.lg},
  heroTop: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg},
  heroLeft: {alignItems: 'center', flex: 1, flexDirection: 'row', gap: spacing.md, minWidth: 0},
  childAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryFaint,
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 58, width: 58,
    justifyContent: 'center'},
  childInfo: {flex: 1, minWidth: 0},
  childName: {...typography.heading, color: colors.text},
  childMeta: {...typography.caption, color: colors.textMuted, marginTop: 2},
  childId: {...typography.overline, color: colors.textSoft, marginTop: 2},
  ringPct: {fontSize: 16, fontWeight: '900'},
  ringLabel: {...typography.overline, color: colors.textSoft, fontSize: 8},
  heroMetrics: {flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md},
  heroMetric: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm},
  heroMetricIcon: {alignItems: 'center', borderRadius: radius.md, height: 28, justifyContent: 'center', width: 28},
  heroMetricValue: {fontSize: 12, fontWeight: '800', lineHeight: 16},
  heroMetricLabel: {...typography.overline, color: colors.textSoft, fontSize: 8},
  changeChildBtn: {alignItems: 'center', alignSelf: 'flex-end', flexDirection: 'row', gap: 4},
  changeChildText: {...typography.captionBold, color: colors.primary, fontSize: 11},

  // ── Quick Actions ─────────────────────────────────────────────────────────
  qaStrip: {gap: spacing.md, paddingBottom: spacing.sm, paddingRight: spacing.page},
  quickAction: {alignItems: 'center', gap: spacing.xs, width: 72},
  qaIcon: {
    alignItems: 'center',
    borderRadius: radius.card,
    height: 56,
    justifyContent: 'center',
    width: 56},
  qaLabel: {...typography.overline, color: colors.textMuted, fontSize: 9, textAlign: 'center'},

  // ── Fee Card ──────────────────────────────────────────────────────────────
  feeCard: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden'},
  feeCardAccent: {backgroundColor: colors.primary, height: 4},
  feeCardInner: {padding: spacing.lg},
  feeRow: {flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.lg},
  feeStat: {alignItems: 'center', gap: spacing.sm},
  feeStatIcon: {alignItems: 'center', borderRadius: radius.lg, height: 40, justifyContent: 'center', width: 40},
  feeValue: {fontSize: 14, fontWeight: '800', lineHeight: 18},
  feeStatLabel: {...typography.overline, color: colors.textMuted, fontSize: 9},
  feeDivider: {backgroundColor: colors.borderLight, width: 1},
  payNowBtn: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.md},
  payNowText: {color: colors.white, fontSize: 13, fontWeight: '800'},
  feeClearBadge: {
    alignItems: 'center',
    backgroundColor: `${colors.success}12`,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    paddingVertical: spacing.md},
  feeClearText: {...typography.captionBold, color: colors.success}});

export default DashboardScreen;
