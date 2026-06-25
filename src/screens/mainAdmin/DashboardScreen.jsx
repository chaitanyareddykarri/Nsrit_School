import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {AnimatedMetric, EmptyState, SectionHeader} from '../../components';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import UserMenuDrawer from '../../components/common/UserMenuDrawer';
import {formatCurrency} from '../../utils/formatters/currency';

const ACCENT = colors.primaryDark;

const KpiCard = ({label, value, icon, color = colors.primary, sub, onPress, delay = 0, isNumeric = true}) => (
  <Animated.View
    style={styles.kpiCard}>
    <View style={[styles.kpiAccent, {backgroundColor: color}]} />
    <Pressable onPress={onPress} style={styles.kpiInner}>
      <View style={styles.kpiTop}>
        <View style={[styles.kpiIcon, {backgroundColor: `${color}15`}]}>
          <MaterialCommunityIcons name={icon} size={18} color={color} />
        </View>
        {onPress ? (
          <View style={[styles.kpiArrow, {backgroundColor: `${color}12`}]}>
            <MaterialCommunityIcons name="arrow-top-right" size={12} color={color} />
          </View>
        ) : null}
      </View>
      <AnimatedMetric
        value={value}
        isNumeric={isNumeric}
        style={[typography.metric, {color: colors.text}]}
      />
      <Text style={styles.kpiLabel}>{label}</Text>
      {sub ? <Text style={styles.kpiSub}>{sub}</Text> : null}
    </Pressable>
  </Animated.View>
);

const ActionRow = ({title, description, icon, color, onPress, delay = 0}) => (
  <Animated.View>
    <Pressable onPress={onPress} style={styles.actionRow}>
      <View style={[styles.actionIcon, {backgroundColor: `${color}15`}]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        {description ? (
          <Text style={styles.actionDesc} numberOfLines={1}>{description}</Text>
        ) : null}
      </View>
      <View style={[styles.actionArrow, {backgroundColor: `${color}12`}]}>
        <MaterialCommunityIcons name="chevron-right" size={16} color={color} />
      </View>
    </Pressable>
  </Animated.View>
);

const DashboardScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const {data: stats} = useAsyncResource(
    options => mainAdminService.getDashboardStatistics(options),
    [],
  );

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) {return 'Good morning';}
    if (h < 17) {return 'Good afternoon';}
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>
                {(user?.name || 'M').slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.headerGreeting}>{getGreeting()}</Text>
              <Text style={styles.headerName} numberOfLines={1}>
                {user?.name || 'Main Admin'}
              </Text>
            </View>
            <Pressable onPress={() => setMenuOpen(true)} style={styles.menuBtn} hitSlop={6}>
              <MaterialCommunityIcons name="dots-vertical" size={20} color="rgba(255,255,255,0.9)" />
            </Pressable>
          </View>

          <View style={styles.headerBottom}>
            <View style={styles.roleBadge}>
              <View style={styles.roleDot} />
              <Text style={styles.roleLabel}>Global Administrator</Text>
            </View>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'})}
            </Text>
          </View>

          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatVal}>{stats?.totalBranches || 0}</Text>
              <Text style={styles.headerStatLabel}>Branches</Text>
            </View>
            <View style={styles.headerStatDiv} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatVal}>{stats?.totalStudents || 0}</Text>
              <Text style={styles.headerStatLabel}>Students</Text>
            </View>
            <View style={styles.headerStatDiv} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatVal}>{stats?.totalTeachers || 0}</Text>
              <Text style={styles.headerStatLabel}>Faculty & Staff</Text>
            </View>
            <View style={styles.headerStatDiv} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatVal}>{stats?.todayAttendance || 0}%</Text>
              <Text style={styles.headerStatLabel}>Attendance</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Global KPI Grid ── */}
        <SectionHeader title="Global Overview" icon="earth" />
        <View style={styles.kpiGrid}>
          <KpiCard label="Total Branches" value={String(stats?.totalBranches || 0)}   icon="domain"          color={colors.secondary} sub={`${stats?.activeBranches || 0} active`}  onPress={() => navigation.navigate('BranchList')}    delay={60}  />
          <KpiCard label="Students"        value={String(stats?.totalStudents || 0)}   icon="account-school"  color={colors.success}   sub="Enrolled globally"                        onPress={() => navigation.navigate('GlobalStudents')} delay={100} />
          <KpiCard label="Faculty & Staff" value={String(stats?.totalTeachers || 0)}   icon="account-tie"     color={colors.purple}    sub="All branches"                             delay={140} />
          <KpiCard label="Attendance"      value={`${stats?.todayAttendance || 0}%`}   icon="calendar-check"  color={colors.info}      sub="Today global avg"                         isNumeric={false} delay={180} />
        </View>

        {/* ── Revenue Strip ── */}
        <SectionHeader
          title="Revenue"
          icon="cash-multiple"
          actionLabel="Full Report"
          onAction={() => navigation.navigate('GlobalReports')}
        />
        <Animated.View
          style={styles.revenueCard}>
          <View style={styles.revenueCardAccent} />
          <View style={styles.revenueInner}>
            <View style={styles.revenueRow}>
              <View style={styles.revenueStat}>
                <View style={[styles.revenueStatIcon, {backgroundColor: `${colors.success}15`}]}>
                  <MaterialCommunityIcons name="cash-check" size={16} color={colors.success} />
                </View>
                <Text style={styles.revenueLabel}>Collected</Text>
                <AnimatedMetric
                  value={stats?.branchWiseCollection || 0}
                  isNumeric={false}
                  style={[styles.revenueValue, {color: colors.success}]}
                />
                <View style={styles.revenueBadge}>
                  <MaterialCommunityIcons name="trending-up" size={10} color={colors.success} />
                  <Text style={styles.revenueBadgeText}>{formatCurrency(stats?.branchWiseCollection || 0)}</Text>
                </View>
              </View>
              <View style={styles.revenueDiv} />
              <View style={styles.revenueStat}>
                <View style={[styles.revenueStatIcon, {backgroundColor: `${colors.danger}15`}]}>
                  <MaterialCommunityIcons name="cash-clock" size={16} color={colors.danger} />
                </View>
                <Text style={styles.revenueLabel}>Pending</Text>
                <AnimatedMetric
                  value={stats?.branchWiseDues || 0}
                  isNumeric={false}
                  style={[styles.revenueValue, {color: colors.danger}]}
                />
                <View style={[styles.revenueBadge, {backgroundColor: `${colors.danger}12`}]}>
                  <MaterialCommunityIcons name="alert-outline" size={10} color={colors.danger} />
                  <Text style={[styles.revenueBadgeText, {color: colors.danger}]}>{formatCurrency(stats?.branchWiseDues || 0)}</Text>
                </View>
              </View>
              <View style={styles.revenueDiv} />
              <View style={styles.revenueStat}>
                <View style={[styles.revenueStatIcon, {backgroundColor: `${colors.info}15`}]}>
                  <MaterialCommunityIcons name="sale" size={16} color={colors.info} />
                </View>
                <Text style={styles.revenueLabel}>Concession</Text>
                <AnimatedMetric
                  value={stats?.branchWiseConcessions || 0}
                  isNumeric={false}
                  style={[styles.revenueValue, {color: colors.info}]}
                />
                <View style={[styles.revenueBadge, {backgroundColor: `${colors.info}12`}]}>
                  <Text style={[styles.revenueBadgeText, {color: colors.info}]}>{formatCurrency(stats?.branchWiseConcessions || 0)}</Text>
                </View>
              </View>
            </View>
            <Pressable
              onPress={() => navigation.navigate('RevenueOverview')}
              style={styles.revenueAction}>
              <Text style={styles.revenueActionText}>View detailed breakdown</Text>
              <MaterialCommunityIcons name="arrow-right" size={14} color={colors.primary} />
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Management ── */}
        <SectionHeader title="Management" icon="cog-outline" />
        <Animated.View style={styles.actionGroup}>
          <ActionRow title="Branch Context"   description="Mimic a branch as local admin"           icon="office-building-cog"    color={colors.primary}   onPress={() => navigation.navigate('BranchContext')}        delay={0}   />
          <View style={styles.actionDivider} />
          <ActionRow title="Manage Branches"  description="Create, edit, and configure branches"    icon="domain"                  color={colors.secondary} onPress={() => navigation.navigate('BranchList')}           delay={40}  />
          <View style={styles.actionDivider} />
          <ActionRow title="Manage Users"     description="Role assignments and access control"     icon="account-cog-outline"    color={colors.purple}    onPress={() => navigation.navigate('ManageUsers')}          delay={80}  />
          <View style={styles.actionDivider} />
          <ActionRow title="Global Students"  description="View all enrolled students"              icon="account-school"          color={colors.success}   onPress={() => navigation.navigate('GlobalStudents')}       delay={120} />
        </Animated.View>

        {/* ── Analytics & Logs ── */}
        <SectionHeader title="Analytics & Logs" icon="chart-bar" />
        <Animated.View style={styles.actionGroup}>
          <ActionRow title="Global Analytics"  description="Cross-branch performance charts"        icon="chart-box-outline"               color={colors.accent}    onPress={() => navigation.navigate('Reports')}              delay={0}   />
          <View style={styles.actionDivider} />
          <ActionRow title="Audit Logs"        description="System transaction and security trace"  icon="clipboard-text-clock-outline"   color={colors.warning}   onPress={() => navigation.navigate('AuditLogs')}            delay={40}  />
          <View style={styles.actionDivider} />
          <ActionRow title="Class Fee Setup"   description="Configure fee structures globally"     icon="cash-multiple"                   color={colors.info}      onPress={() => navigation.navigate('ClassFeeManagement')}  delay={80}  />
          <View style={styles.actionDivider} />
          <ActionRow title="Create Branch"     description="Register a new school branch"          icon="office-building-plus"           color={colors.success}   onPress={() => navigation.navigate('CreateBranch')}         delay={120} />
        </Animated.View>

      </ScrollView>

      <UserMenuDrawer
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        navigation={navigation}
        profileRoute="Profile"
        settingsRoute="Settings"
        notificationsRoute="NotificationCenter"
        composeNotificationRoute="CreateNotification"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.page, paddingBottom: spacing.xxxl + spacing.xl},

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    ...shadows.clayDeep,
    backgroundColor: ACCENT,
    borderRadius: radius.hero,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    padding: spacing.xl,
    paddingBottom: spacing.lg},
  blob1: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 100,
    height: 190,
    position: 'absolute',
    right: -40,
    top: -60,
    width: 190},
  blob2: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 80,
    bottom: -40,
    height: 140,
    left: -30,
    position: 'absolute',
    width: 140},
  blob3: {
    backgroundColor: 'rgba(21,94,239,0.25)',
    borderRadius: 60,
    height: 110,
    left: '38%',
    position: 'absolute',
    top: 10,
    width: 110},
  headerTop: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md},
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 52, width: 52,
    justifyContent: 'center'},
  avatarText: {color: colors.white, fontSize: 22, fontWeight: '900'},
  headerCopy: {flex: 1, minWidth: 0},
  headerGreeting: {...typography.overline, color: 'rgba(255,255,255,0.58)'},
  headerName: {...typography.subtitle, color: colors.white, marginTop: 2},
  menuBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.md,
    height: 38, width: 38,
    justifyContent: 'center'},
  headerBottom: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg},
  roleBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 5},
  roleDot: {backgroundColor: '#4ADE80', borderRadius: radius.pill, height: 7, width: 7},
  roleLabel: {color: colors.white, fontSize: 11, fontWeight: '700'},
  headerDate: {...typography.overline, color: 'rgba(255,255,255,0.52)'},
  headerStats: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: radius.xl,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md},
  headerStat: {alignItems: 'center', flex: 1},
  headerStatVal: {color: colors.white, fontSize: 18, fontWeight: '900'},
  headerStatLabel: {...typography.overline, color: 'rgba(255,255,255,0.58)', fontSize: 9},
  headerStatDiv: {backgroundColor: 'rgba(255,255,255,0.18)', width: 1},

  // ── KPI Grid ──────────────────────────────────────────────────────────────
  kpiGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xs},
  kpiCard: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flex: 1,
    minWidth: '47%',
    overflow: 'hidden'},
  kpiAccent: {height: 4},
  kpiInner: {padding: spacing.md},
  kpiTop: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm},
  kpiIcon: {alignItems: 'center', borderRadius: radius.lg, height: 40, justifyContent: 'center', width: 40},
  kpiArrow: {alignItems: 'center', borderRadius: radius.sm, height: 26, justifyContent: 'center', width: 26},
  kpiLabel: {...typography.captionBold, color: colors.textMuted, letterSpacing: 0.4, marginTop: spacing.xs, textTransform: 'uppercase'},
  kpiSub: {...typography.overline, color: colors.textSoft, marginTop: 1},

  // ── Revenue Card ──────────────────────────────────────────────────────────
  revenueCard: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden'},
  revenueCardAccent: {backgroundColor: colors.success, height: 4},
  revenueInner: {padding: spacing.lg},
  revenueRow: {flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.md},
  revenueStat: {alignItems: 'center', flex: 1, gap: spacing.xs},
  revenueStatIcon: {alignItems: 'center', borderRadius: radius.lg, height: 36, justifyContent: 'center', width: 36},
  revenueLabel: {...typography.overline, color: colors.textMuted},
  revenueValue: {fontSize: 14, fontWeight: '900', lineHeight: 18},
  revenueBadge: {
    alignItems: 'center',
    backgroundColor: `${colors.success}12`,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2},
  revenueBadgeText: {color: colors.success, fontSize: 9, fontWeight: '700'},
  revenueDiv: {backgroundColor: colors.borderLight, width: 1},
  revenueAction: {
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    paddingTop: spacing.md},
  revenueActionText: {...typography.captionBold, color: colors.primary},

  // ── Action Groups ─────────────────────────────────────────────────────────
  actionGroup: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden'},
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md},
  actionIcon: {alignItems: 'center', borderRadius: radius.lg, height: 44, justifyContent: 'center', width: 44},
  actionCopy: {flex: 1, minWidth: 0},
  actionTitle: {...typography.bodyBold, color: colors.text},
  actionDesc:  {...typography.caption, color: colors.textMuted, marginTop: 2},
  actionArrow: {alignItems: 'center', borderRadius: radius.sm, height: 28, justifyContent: 'center', width: 28},
  actionDivider: {backgroundColor: colors.borderLight, height: 1, marginLeft: 76}});

export default DashboardScreen;
