import React, {useState, useCallback} from 'react';
import {Pressable, RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import {
  AnimatedProgressBar,
  SectionHeader} from '../../components';
import principalDashboardService from '../../services/principal/principalDashboardService';
import {getAccessScope} from '../../services/rbacScope';
import feeService from '../../services/fees/feeService';
import {formatCurrency} from '../../utils/formatters/currency';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import UserMenuDrawer from '../../components/common/UserMenuDrawer';

const NavRow = ({icon, label, desc, color, onPress, delay = 0}) => (
  <Animated.View>
    <Pressable onPress={onPress} style={styles.navRow}>
      <View style={[styles.navIcon, {backgroundColor: `${color}15`}]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <View style={styles.navCopy}>
        <Text style={styles.navLabel}>{label}</Text>
        {desc ? <Text style={styles.navDesc} numberOfLines={1}>{desc}</Text> : null}
      </View>
      <View style={[styles.navArrow, {backgroundColor: `${color}12`}]}>
        <MaterialCommunityIcons name="chevron-right" size={16} color={color} />
      </View>
    </Pressable>
  </Animated.View>
);

const StatChip = ({label, value, color, loading, hasError}) => (
  <View style={styles.chipWrap}>
    <Text style={[styles.chipVal, {color: hasError ? colors.danger : (color || colors.white)}]}>
      {loading ? '…' : hasError ? '!' : value}
    </Text>
    <Text style={styles.chipLabel}>{label}</Text>
  </View>
);

const DashboardScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const yearClosed = activeAcademicYear?.status === 'CLOSED';
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scope = getAccessScope(user);

  console.log('[PrincipalDashboard] render — branchId:', user?.branchId, '| userId:', user?.id, '| role:', user?.role);

  const {
    data,
    isLoading: dashLoading,
    isError: dashError,
    refetch: refetchDash} = useQuery({
    queryKey: ['principalDashboard', user?.branchId],
    queryFn: () => principalDashboardService.getDashboard(user.branchId, scope),
    enabled: Boolean(user?.branchId),
    onError: err => console.error('[PrincipalDashboard] query error:', err.message)});

  const {
    data: feeData,
    isLoading: feeLoading,
    isError: feeError,
    refetch: refetchFee} = useQuery({
    queryKey: ['principalFeeSummary', user?.branchId],
    queryFn: () => feeService.getFeeReports(scope),
    enabled: Boolean(user?.branchId),
    onError: err => console.error('[PrincipalDashboard] fee query error:', err.message)});

  const feeSummary = feeData?.summary || {};
  const collectionRate = Math.round((feeSummary.collectionRate || 0) * 100);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([refetchDash(), refetchFee()]);
    setRefreshing(false);
  }, [refetchDash, refetchFee]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) {return 'Good morning';}
    if (h < 17) {return 'Good afternoon';}
    return 'Good evening';
  };

  const stat = (key, fallback = 0) => {
    if (!user?.branchId) {return '—';}
    if (dashLoading) {return '…';}
    if (dashError) {return '!';}
    return data?.[key] ?? fallback;
  };

  return (
    <>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }>

        {/* ── Clay Hero Header ── */}
        <Animated.View style={styles.header}>
          <View style={styles.blob1} />
          <View style={styles.blob2} />
          <View style={styles.blob3} />

          <View style={styles.headerTop}>
            <View style={styles.avatarWrap}>
              <MaterialCommunityIcons name="school" size={24} color={colors.white} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.name} numberOfLines={1}>
                {user?.fullName || 'Principal'}
              </Text>
            </View>
            <Pressable onPress={() => setMenuOpen(true)} style={styles.menuBtn} hitSlop={12}>
              <MaterialCommunityIcons name="dots-vertical" size={20} color="rgba(255,255,255,0.9)" />
            </Pressable>
          </View>

          <View style={styles.roleBadgeRow}>
            <View style={styles.roleBadge}>
              <View style={styles.roleDot} />
              <Text style={styles.roleText}>Principal</Text>
            </View>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short', day: 'numeric', month: 'short'})}
            </Text>
          </View>

          {/* Quick KPI strip inside header */}
          <View style={styles.headerStats}>
            <StatChip label="Students"  value={stat('totalStudents')}  loading={dashLoading && !refreshing} hasError={dashError && !dashLoading} />
            <View style={styles.headerStatDiv} />
            <StatChip label="Faculty & Staff"  value={stat('totalTeachers')}  loading={dashLoading && !refreshing} hasError={dashError && !dashLoading} />
            <View style={styles.headerStatDiv} />
            <StatChip label="Sections"  value={stat('totalSections')}  loading={dashLoading && !refreshing} hasError={dashError && !dashLoading} />
            <View style={styles.headerStatDiv} />
            <StatChip label="Pending"   value={stat('pendingPromotions')} loading={dashLoading && !refreshing} hasError={dashError && !dashLoading} />
          </View>
        </Animated.View>

        {/* ── Fee Health Card ── */}
        <Animated.View style={styles.feeCard}>
          <View style={styles.feeCardAccent} />
          <View style={styles.feeCardInner}>
            <View style={styles.feeCardHeader}>
              <View style={styles.feeCardTitleRow}>
                <View style={styles.feeCardIcon}>
                  <MaterialCommunityIcons name="cash-multiple" size={16} color={colors.primary} />
                </View>
                <Text style={styles.feeCardTitle}>Fee Health</Text>
              </View>
              <Pressable
                onPress={() => navigation.navigate('FeeDashboard')}
                style={styles.feeViewBtn}>
                <Text style={styles.feeViewBtnText}>View All</Text>
                <MaterialCommunityIcons name="arrow-right" size={12} color={colors.primary} />
              </Pressable>
            </View>

            {feeError && !feeLoading ? (
              <View style={styles.feeErrorRow}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.danger} />
                <Text style={styles.feeErrorText}>Fee data unavailable — pull to refresh</Text>
              </View>
            ) : (
              <>
                <View style={styles.feeStats}>
                  <View style={styles.feeStat}>
                    <Text style={[styles.feeStatVal, {color: colors.success}]}>
                      {feeLoading ? '…' : formatCurrency(feeSummary.paidAmount || 0)}
                    </Text>
                    <Text style={styles.feeStatLabel}>Collected</Text>
                  </View>
                  <View style={styles.feeStatDiv} />
                  <View style={styles.feeStat}>
                    <Text style={[styles.feeStatVal, {color: colors.danger}]}>
                      {feeLoading ? '…' : formatCurrency(feeSummary.dueAmount || 0)}
                    </Text>
                    <Text style={styles.feeStatLabel}>Pending</Text>
                  </View>
                  <View style={styles.feeStatDiv} />
                  <View style={styles.feeStat}>
                    <Text style={[styles.feeStatVal, {color: colors.info}]}>
                      {feeLoading ? '…' : formatCurrency(feeSummary.concessionAmount || 0)}
                    </Text>
                    <Text style={styles.feeStatLabel}>Waiver</Text>
                  </View>
                </View>

                <View style={styles.feeProgressRow}>
                  <Text style={styles.feeProgressLabel}>Collection Rate</Text>
                  <Text style={[styles.feeProgressPct,
                    {color: collectionRate >= 70 ? colors.success : colors.warning}]}>
                    {feeLoading ? '…' : `${collectionRate}%`}
                  </Text>
                </View>
                <AnimatedProgressBar
                  progress={feeLoading ? 0 : collectionRate}
                  color={collectionRate >= 70 ? colors.success : colors.warning}
                  trackColor={colors.borderLight}
                  height={8}
                />
              </>
            )}
          </View>
        </Animated.View>

        {/* ── Staff Overview Card ── */}
        <Animated.View style={styles.staffCard}>
          <View style={styles.staffCardInner}>
            <View style={styles.staffCardHeader}>
              <MaterialCommunityIcons name="account-group-outline" size={16} color={colors.secondary} />
              <Text style={styles.staffCardTitle}>Staff Overview</Text>
            </View>
            <View style={styles.staffStats}>
              <View style={styles.staffStat}>
                <Text style={[styles.staffStatVal, {color: colors.secondary}]}>
                  {stat('totalCoordinators')}
                </Text>
                <Text style={styles.staffStatLabel}>Coordinators</Text>
              </View>
              <View style={styles.staffStatDiv} />
              <View style={styles.staffStat}>
                <Text style={[styles.staffStatVal, {color: colors.accent}]}>
                  {stat('totalAccountants')}
                </Text>
                <Text style={styles.staffStatLabel}>Accountants</Text>
              </View>
              <View style={styles.staffStatDiv} />
              <View style={styles.staffStat}>
                <Text style={[styles.staffStatVal, {color: colors.purple}]}>
                  {stat('totalTeachers')}
                </Text>
                <Text style={styles.staffStatLabel}>Faculty & Staff</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── Academic Management ── */}
        <SectionHeader title="Academic" icon="school-outline" />
        <Animated.View style={styles.group}>
          <NavRow icon="account-plus-outline"   label="Add Student"          desc="Enrol new student"                   color={colors.success}   onPress={() => navigation.navigate('AddStudent')}            delay={0}   />
          <View style={styles.div} />
          <NavRow icon="account-school-outline" label="Manage Students"      desc="View and edit records"               color={colors.primary}   onPress={() => navigation.navigate('StudentManagement')}     delay={40}  />
          <View style={styles.div} />
          <NavRow icon="clipboard-text-clock"   label="View Attendance"      desc="Branch-wide attendance log"          color={colors.info}      onPress={() => navigation.navigate('ViewAllAttendance')}     delay={80}  />
          <View style={styles.div} />
          <NavRow icon="shape-outline"          label="Academic Structure"   desc="Classes, sections, subjects"         color={colors.secondary} onPress={() => navigation.navigate('AcademicStructure')}     delay={120} />
          <View style={styles.div} />
          {yearClosed ? (
            <NavRow icon="school-outline"         label="Promote Students"     desc="Review and promote students to next year"  color={colors.warning}   onPress={() => navigation.navigate('PromotionManagement')}   delay={160} />
          ) : (
            <NavRow icon="school-outline"         label="Promotion Management" desc="Available when academic year is closed"     color={colors.textMuted} onPress={() => navigation.navigate('PromotionManagement')}   delay={160} />
          )}
          <View style={styles.div} />
          <NavRow icon="school"                 label="Graduate Students"    desc="Mark final-year students graduated"  color={colors.success}   onPress={() => navigation.navigate('GraduateFinalYear')}     delay={200} />
          <View style={styles.div} />
          <NavRow icon="calendar-clock"         label="Timetable"            desc="Set weekly class schedules"          color={colors.secondary} onPress={() => navigation.navigate('Timetable')}              delay={240} />
          <View style={styles.div} />
          <NavRow icon="bulletin-board"         label="Notice Board"         desc="Post notices for parents and staff"  color={colors.primary}   onPress={() => navigation.navigate('NoticeBoard')}           delay={280} />
          <View style={styles.div} />
          <NavRow icon="calendar-remove-outline" label="Holiday Management"  desc="School holidays & public holidays"  color={colors.danger}    onPress={() => navigation.navigate('HolidayManagement')}     delay={300} />
          <View style={styles.div} />
          <NavRow icon="calendar-star-outline"  label="Academic Year"        desc="Year overview, status & rollover"   color={colors.warning}   onPress={() => navigation.navigate('AcademicYearOverview')}  delay={340} />
          <NavRow icon="calendar-edit"          label="Year Management"      desc="Create, activate & close years"     color={colors.primary}   onPress={() => navigation.navigate('AcademicYearManagement')} delay={360} />
          <View style={styles.div} />
          <NavRow icon="clipboard-text-outline" label="Exams & Marks"        desc="Create exams, enter marks, publish results" color={colors.info} onPress={() => navigation.navigate('ExamList')} delay={380} />
        </Animated.View>

        {/* ── Staff Management ── */}
        <SectionHeader title="Staff" icon="account-tie-outline" />
        <Animated.View style={styles.group}>
          <NavRow icon="account-tie-outline"    label="Teachers"             desc="Roster, assignments, subjects"       color={colors.purple}    onPress={() => navigation.navigate('TeacherManagement')}     delay={0}  />
          <View style={styles.div} />
          <NavRow icon="account-supervisor"     label="Coordinators"         desc="Wing supervisors"                    color={colors.secondary} onPress={() => navigation.navigate('CoordinatorManagement')} delay={40} />
          <View style={styles.div} />
          <NavRow icon="cash-register"          label="Accountants"          desc="Fee desk operators"                  color={colors.accent}    onPress={() => navigation.navigate('AccountantManagement')}  delay={80} />
          <View style={styles.div} />
          <NavRow icon="teach"                  label="Assign Class Teacher" desc="Assign teacher to section"           color={colors.info}      onPress={() => navigation.navigate('AssignClassTeacher')}    delay={120} />
        </Animated.View>

      </ScrollView>

      <UserMenuDrawer
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        navigation={navigation}
        profileRoute="PrincipalProfile"
        notificationsRoute="NotificationCenter"
        composeNotificationRoute="CreateNotification"
      />
    </>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.page, paddingBottom: spacing.xxxl + spacing.xl},

  // ── Hero Header ──────────────────────────────────────────────────────────
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
    height: 180,
    position: 'absolute',
    right: -40,
    top: -60,
    width: 180},
  blob2: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    bottom: -30,
    height: 130,
    left: -20,
    position: 'absolute',
    width: 130},
  blob3: {
    backgroundColor: 'rgba(56,189,248,0.15)',
    borderRadius: 60,
    height: 100,
    left: '40%',
    position: 'absolute',
    top: -20,
    width: 100},
  headerTop: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md},
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderColor: 'rgba(255,255,255,0.30)',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 50, width: 50,
    justifyContent: 'center'},
  headerCopy: {flex: 1, minWidth: 0},
  greeting: {...typography.overline, color: 'rgba(255,255,255,0.65)'},
  name: {...typography.subtitle, color: colors.white, marginTop: 2},
  menuBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md,
    height: 38, width: 38,
    justifyContent: 'center'},
  roleBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg},
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

  // Stats strip inside header
  headerStats: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.xl,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.xs,
    paddingVertical: spacing.md},
  chipWrap: {alignItems: 'center', flex: 1},
  chipVal: {color: colors.white, fontSize: 20, fontWeight: '900'},
  chipLabel: {...typography.overline, color: 'rgba(255,255,255,0.60)', fontSize: 9},
  headerStatDiv: {backgroundColor: 'rgba(255,255,255,0.20)', width: 1},

  // ── Fee Health Card ───────────────────────────────────────────────────────
  feeCard: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.xs,
    overflow: 'hidden'},
  feeCardAccent: {backgroundColor: colors.primary, height: 4, width: '100%'},
  feeCardInner: {padding: spacing.lg},
  feeCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg},
  feeCardTitleRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  feeCardIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    height: 30, width: 30,
    justifyContent: 'center'},
  feeCardTitle: {...typography.heading, color: colors.text},
  feeViewBtn: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs},
  feeViewBtnText: {...typography.captionBold, color: colors.primary},
  feeStats: {flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.lg},
  feeStat: {alignItems: 'center', gap: spacing.xs},
  feeStatVal: {fontSize: 14, fontWeight: '800'},
  feeStatLabel: {...typography.overline, color: colors.textMuted, fontSize: 9},
  feeStatDiv: {backgroundColor: colors.borderLight, width: 1},
  feeProgressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm},
  feeProgressLabel: {...typography.captionBold, color: colors.textMuted},
  feeProgressPct: {fontSize: 14, fontWeight: '800'},
  feeErrorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md},
  feeErrorText: {...typography.caption, color: colors.danger},

  // ── Staff Overview Card ───────────────────────────────────────────────────
  staffCard: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden'},
  staffCardInner: {padding: spacing.lg},
  staffCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg},
  staffCardTitle: {...typography.heading, color: colors.text},
  staffStats: {flexDirection: 'row', justifyContent: 'space-around'},
  staffStat: {alignItems: 'center', gap: spacing.xs},
  staffStatVal: {fontSize: 22, fontWeight: '900'},
  staffStatLabel: {...typography.overline, color: colors.textMuted, fontSize: 9},
  staffStatDiv: {backgroundColor: colors.borderLight, width: 1},

  // ── Navigation Groups ─────────────────────────────────────────────────────
  group: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden'},
  navRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md},
  navIcon: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 44,
    justifyContent: 'center',
    width: 44},
  navCopy: {flex: 1, minWidth: 0},
  navLabel: {...typography.bodyBold, color: colors.text},
  navDesc:  {...typography.caption, color: colors.textMuted, marginTop: 2},
  navArrow: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 28, width: 28,
    justifyContent: 'center'},
  div: {backgroundColor: colors.borderLight, height: 1, marginLeft: 76}});

export default DashboardScreen;
