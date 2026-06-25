import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {AnimatedProgressBar, SectionHeader, StatCard} from '../../components';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {formatCurrency} from '../../utils/formatters/currency';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import UserMenuDrawer from '../../components/common/UserMenuDrawer';

const ACCENT = colors.secondary;

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

const DashboardScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const access = useFeeAccess();

  const {data} = useQuery({
    queryKey: ['branchAdminFeeDashboard', access.branchId],
    queryFn: () => feeService.getFeeReports(access),
    enabled: Boolean(access.branchId)});
  const summary = data?.summary || {};
  const collectionRate = Math.round((summary.collectionRate || 0) * 100);

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
            <View style={styles.avatarWrap}>
              <MaterialCommunityIcons name="domain" size={24} color={colors.white} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.name} numberOfLines={1}>
                {user?.name || 'Branch Admin'}
              </Text>
            </View>
            <Pressable onPress={() => setMenuOpen(true)} style={styles.menuBtn} hitSlop={6}>
              <MaterialCommunityIcons name="dots-vertical" size={20} color="rgba(255,255,255,0.9)" />
            </Pressable>
          </View>

          <View style={styles.roleBadgeRow}>
            <View style={styles.roleBadge}>
              <View style={styles.roleDot} />
              <Text style={styles.roleText}>Branch Administrator</Text>
            </View>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short', day: 'numeric', month: 'short'})}
            </Text>
          </View>

          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatVal}>{summary.studentsWithFeePlans || 0}</Text>
              <Text style={styles.headerStatLabel}>Students</Text>
            </View>
            <View style={styles.headerStatDiv} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatVal}>{formatCurrency(summary.paidAmount || 0)}</Text>
              <Text style={styles.headerStatLabel}>Collected</Text>
            </View>
            <View style={styles.headerStatDiv} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatVal}>{collectionRate}%</Text>
              <Text style={styles.headerStatLabel}>Rate</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Fee Progress ── */}
        <Animated.View style={styles.progressCard}>
          <View style={styles.progressAccent} />
          <View style={styles.progressInner}>
            <View style={styles.progressHeader}>
              <View style={styles.progressIconWrap}>
                <MaterialCommunityIcons name="cash-multiple" size={16} color={ACCENT} />
              </View>
              <Text style={styles.progressTitle}>Fee Collection Progress</Text>
              <Text style={[styles.progressPct,
                {color: collectionRate >= 70 ? colors.success : colors.warning}]}>
                {collectionRate}%
              </Text>
            </View>
            <AnimatedProgressBar
              progress={collectionRate}
              color={collectionRate >= 70 ? colors.success : colors.warning}
              trackColor={colors.borderLight}
              height={8}
            />
            <Text style={styles.progressMeta}>
              Collected {formatCurrency(summary.paidAmount || 0)} of{' '}
              {formatCurrency(summary.totalFee || 0)}
            </Text>
          </View>
        </Animated.View>

        {/* ── Student Management ── */}
        <SectionHeader title="Student Management" icon="account-school-outline" />
        <Animated.View style={styles.group}>
          <NavRow icon="account-plus-outline" label="Add Student"      desc="Enrol a new student"                color={colors.success} onPress={() => navigation.navigate('CreateStudent')}     delay={0}  />
          <View style={styles.div} />
          <NavRow icon="account-school"       label="All Students"     desc="View and manage student records"    color={colors.primary} onPress={() => navigation.navigate('ManageStudents')}    delay={40} />
          <View style={styles.div} />
          <NavRow icon="file-upload-outline"  label="Bulk CSV Import"  desc="Upload multiple students at once"   color={colors.info}    onPress={() => navigation.navigate('BulkStudentUpload')} delay={80} />
        </Animated.View>

        {/* ── Staff & Attendance ── */}
        <SectionHeader title="Staff & Attendance" icon="account-tie-outline" />
        <Animated.View style={styles.group}>
          <NavRow icon="account-tie"             label="Manage Teachers"        desc="Teacher roster for this branch"         color={colors.purple}    onPress={() => navigation.navigate('ManageTeachers')}     delay={0}   />
          <View style={styles.div} />
          <NavRow icon="account-switch-outline"  label="Assign Class Teacher"   desc="Link teacher to section"                color={ACCENT}           onPress={() => navigation.navigate('AssignClassTeacher')} delay={40}  />
          <View style={styles.div} />
          <NavRow icon="clipboard-text-clock"    label="Attendance Overview"    desc="Branch-wide attendance log"             color={colors.info}      onPress={() => navigation.navigate('AttendanceOverview')} delay={80}  />
          <View style={styles.div} />
          <NavRow icon="finance"                 label="Fee Overview"           desc="Branch fee collection desk"             color={colors.accent}    onPress={() => navigation.navigate('FeeDashboard')}       delay={120} />
          <View style={styles.div} />
          <NavRow icon="chart-box-outline"       label="Branch Analytics"       desc="Fee collection and performance data"    color={colors.purple}    onPress={() => navigation.navigate('BranchAnalytics')}    delay={160} />
          <View style={styles.div} />
          <NavRow icon="cog-outline"             label="Branch Settings"        desc="Configuration and preferences"          color={colors.textMuted} onPress={() => navigation.navigate('BranchSettings')}     delay={200} />
        </Animated.View>

      </ScrollView>

      <UserMenuDrawer
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        navigation={navigation}
        profileRoute="BranchAdminProfile"
        settingsRoute="BranchSettings"
        notificationsRoute="NotificationCenter"
        composeNotificationRoute="CreateNotification"
      />
    </>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.page, paddingBottom: spacing.xxxl + spacing.xl},

  header: {
    ...shadows.clayDeep,
    backgroundColor: ACCENT,
    borderRadius: radius.hero,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    padding: spacing.xl,
    paddingBottom: spacing.lg},
  blob1: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 100,
    height: 170,
    position: 'absolute',
    right: -30,
    top: -50,
    width: 170},
  blob2: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 70,
    bottom: -30,
    height: 120,
    left: -15,
    position: 'absolute',
    width: 120},
  blob3: {
    backgroundColor: 'rgba(96,165,250,0.15)',
    borderRadius: 60,
    height: 90,
    left: '40%',
    position: 'absolute',
    top: -10,
    width: 90},
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
  roleBadgeRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg},
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
  headerStats: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.xl,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md},
  headerStat: {alignItems: 'center', flex: 1},
  headerStatVal: {color: colors.white, fontSize: 16, fontWeight: '900'},
  headerStatLabel: {...typography.overline, color: 'rgba(255,255,255,0.60)', fontSize: 9},
  headerStatDiv: {backgroundColor: 'rgba(255,255,255,0.20)', width: 1},

  progressCard: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.xs,
    overflow: 'hidden'},
  progressAccent: {backgroundColor: ACCENT, height: 4},
  progressInner: {padding: spacing.lg},
  progressHeader: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg},
  progressIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.md,
    height: 30, width: 30,
    justifyContent: 'center'},
  progressTitle: {...typography.heading, color: colors.text, flex: 1},
  progressPct: {fontSize: 15, fontWeight: '800'},
  progressMeta: {...typography.caption, color: colors.textMuted, marginTop: spacing.sm},

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
  navIcon: {alignItems: 'center', borderRadius: radius.lg, height: 44, justifyContent: 'center', width: 44},
  navCopy: {flex: 1, minWidth: 0},
  navLabel: {...typography.bodyBold, color: colors.text},
  navDesc:  {...typography.caption, color: colors.textMuted, marginTop: 2},
  navArrow: {alignItems: 'center', borderRadius: radius.sm, height: 28, width: 28, justifyContent: 'center'},
  div: {backgroundColor: colors.borderLight, height: 1, marginLeft: 76}});

export default DashboardScreen;
