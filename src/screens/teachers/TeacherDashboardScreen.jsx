import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {
  AnimatedMetric,
  AnimatedProgressBar,
  DashboardCard,
  EmptyState,
  SectionHeader} from '../../components';
import teacherService from '../../services/teachers/teacherService';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {formatCurrency} from '../../utils/formatters/currency';
import {toISODate} from '../../utils/helpers/dateHelpers';
import {logoutUser} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {ROLE_LABELS, USER_ROLES} from '../../config/constants';
import UserMenuDrawer from '../../components/common/UserMenuDrawer';

const TeacherDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const access = useFeeAccess();
  const teacherId = user?.teacherId;
  const role = String(user?.role || '').toUpperCase();
  const roleLabel = ROLE_LABELS[role] || 'Teacher';
  const isClassTeacherRole = role === USER_ROLES.CLASS_TEACHER;

  const {data, isLoading} = useQuery({
    queryKey: ['teacherDashboard', teacherId, role],
    queryFn: () => teacherService.getTeacherDashboard(teacherId),
    enabled: Boolean(teacherId)});

  const {data: feeData} = useQuery({
    queryKey: ['teacherFeeStatus', access.branchId, access.academicClassId, access.sectionId],
    queryFn: () => feeService.getFeeReports(access),
    enabled: Boolean(access.branchId)});
  const feeSummary = feeData?.summary || {};

  if (!teacherId) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <EmptyState
          icon="account-tie-outline"
          title="Teacher profile pending"
          message="Ask the principal to complete your teacher profile setup."
          actionLabel="Logout"
          onAction={() => dispatch(logoutUser())}
        />
      </ScrollView>
    );
  }

  const allSections = data?.assignedSections || [];
  const subjects = data?.assignedSubjects || [];
  const classTeacherSections = data?.classTeacherAssignments || [];
  const sections = isClassTeacherRole
    ? classTeacherSections.map(item => item.section).filter(Boolean)
    : allSections;
  const sectionLabel = sections.map(item => `${item.academicClass?.name || '-'}-${item.name || '-'}`).join(', ');
  const totalStudents = sections.reduce(
    (sum, section) =>
      sum +
      (
        section.dashboardActiveStudents ||
        section.profileActiveStudents ||
        section.activeStudents ||
        section.students_on_section ||
        []
      ).filter(student => ['ACTIVE', undefined, null].includes(student.status)).length,
    0,
  );
  const todayDate = toISODate();
  const pendingAttendance = isClassTeacherRole
    ? sections.filter(section => {
        const students =
          section.dashboardActiveStudents ||
          section.profileActiveStudents ||
          section.activeStudents ||
          section.students_on_section ||
          [];
        const markedIds = new Set(
          (
            section.dashboardSectionAttendance ||
            section.profileSectionAttendance ||
            section.sectionAttendance ||
            section.attendances_on_section ||
            []
          )
            .filter(item => item.attendanceDate === todayDate)
            .map(item => item.studentId),
        );
        return students.some(student => !markedIds.has(student.id));
      }).length
    : data?.pendingAttendance || 0;
  const todaysAttendance = isClassTeacherRole
    ? sections.reduce(
        (sum, section) =>
          sum +
          (
            section.dashboardSectionAttendance ||
            section.profileSectionAttendance ||
            section.sectionAttendance ||
            section.attendances_on_section ||
            []
          ).filter(item => item.attendanceDate === todayDate).length,
        0,
      )
    : data?.todaysAttendance || 0;
  const attendancePct = data?.todayAttendancePct || 0;
  const feeCollectionRate = Math.round((feeSummary.collectionRate || 0) * 100);

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

      {/* ── Header ── */}
      <Animated.View
        style={styles.header}>
        <View style={styles.headerDecor} />
        <View style={styles.headerTop}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {(user?.fullName || 'T').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.headerGreeting}>{getGreeting()}</Text>
            <Text style={styles.headerName} numberOfLines={1}>
              {isLoading ? 'Loading...' : user?.fullName || 'Teacher'}
            </Text>
          </View>
          <Pressable onPress={() => setMenuOpen(true)} style={styles.logoutBtn} hitSlop={6}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={20}
              color="rgba(255,255,255,0.85)"
            />
          </Pressable>
        </View>

        {/* Section + subject info */}
        <View style={styles.headerMeta}>
          {sections.slice(0, 2).map((sec, i) => (
            <View key={i} style={styles.metaChip}>
              <MaterialCommunityIcons name="google-classroom" size={11} color="rgba(255,255,255,0.7)" />
              <Text style={styles.metaChipText}>
                {sec.academicClass?.name || '—'}-{sec.name}
              </Text>
            </View>
          ))}
          {sections.length > 2 ? (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>+{sections.length - 2} more</Text>
            </View>
          ) : null}
        </View>
      </Animated.View>

      {/* ── PRIMARY CTA: Mark Attendance ── */}
      <Animated.View
        style={styles.attendanceCta}>
        <View style={styles.ctaLeft}>
          <View style={styles.ctaIconWrap}>
            <MaterialCommunityIcons
              name="clipboard-check-outline"
              size={28}
              color={colors.white}
            />
          </View>
          <View>
            <Text style={styles.ctaLabel}>{isClassTeacherRole ? 'Attendance' : 'Mark Attendance'}</Text>
            <Text style={styles.ctaSub}>
              {pendingAttendance
                ? `${pendingAttendance} session${pendingAttendance !== 1 ? 's' : ''} pending`
                : "Today's roll call"}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => navigation.navigate('TakeAttendance')}
          style={styles.ctaBtn}>
          <Text style={styles.ctaBtnText}>Open</Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={14}
            color={colors.primary}
          />
        </Pressable>
      </Animated.View>

      {/* ── Today stats ── */}
      <SectionHeader title="Today's Snapshot" icon="chart-bar" />
      <Animated.View
        style={styles.statsRow}>

        <View style={styles.statBox}>
          <MaterialCommunityIcons name="account-school" size={20} color={colors.primary} />
          <AnimatedMetric
            value={isClassTeacherRole ? totalStudents : data?.totalStudents || 0}
            style={[typography.metricSm, {color: colors.text}]}
          />
          <Text style={styles.statLabel}>Students</Text>
        </View>

        <View style={styles.statDiv} />

        <View style={styles.statBox}>
          <MaterialCommunityIcons name="book-open-page-variant-outline" size={20} color={colors.secondary} />
          <AnimatedMetric
            value={data?.subjectsAssigned || 0}
            style={[typography.metricSm, {color: colors.text}]}
          />
          <Text style={styles.statLabel}>Subjects</Text>
        </View>

        <View style={styles.statDiv} />

        <View style={styles.statBox}>
          <MaterialCommunityIcons name="clipboard-check" size={20} color={colors.success} />
          <AnimatedMetric
            value={todaysAttendance}
            style={[typography.metricSm, {color: colors.text}]}
          />
          <Text style={styles.statLabel}>Marked</Text>
        </View>

        <View style={styles.statDiv} />

        <View style={styles.statBox}>
          <MaterialCommunityIcons name="account-tie" size={20} color={colors.purple} />
          <AnimatedMetric
            value={classTeacherSections.length}
            style={[typography.metricSm, {color: colors.text}]}
          />
          <Text style={styles.statLabel}>Class Tchr</Text>
        </View>
      </Animated.View>

      {/* ── Attendance progress ── */}
      {attendancePct > 0 ? (
        <Animated.View
          style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Attendance Rate</Text>
            <Text style={[styles.progressPct, {color: attendancePct >= 75 ? colors.success : colors.danger}]}>
              {attendancePct}%
            </Text>
          </View>
          <AnimatedProgressBar
            progress={attendancePct}
            color={attendancePct >= 75 ? colors.success : colors.danger}
            trackColor={colors.border}
            height={7}
          />
        </Animated.View>
      ) : null}

      {/* ── Sections ── */}
      <SectionHeader
        title="Assigned Sections"
        icon="google-classroom"
        actionLabel="All Students"
        onAction={() => navigation.navigate('StudentsList')}
      />
      {sections.length ? (
        sections.map((sec, i) => (
          <Animated.View
            key={sec.id || i}>
            <DashboardCard
              title={`${sec.academicClass?.name || '—'} – Section ${sec.name}`}
              value={`${sec.studentCount || '—'} students`}
              description={subjects
                .filter(s => s.sectionId === sec.id)
                .map(s => s.name)
                .join(', ') || 'No subjects linked'}
              icon="google-classroom"
              tone={colors.primary}
              onPress={() => navigation.navigate('TakeAttendance', {sectionId: sec.id})}
            />
          </Animated.View>
        ))
      ) : (
        <EmptyState
          compact
          icon="google-classroom"
          title="No sections assigned"
          message="Ask the principal to assign you to a section."
        />
      )}

      {/* ── Quick nav ── */}
      <SectionHeader title="More" icon="dots-grid" />
      <DashboardCard
        title="Students List"
        value="View"
        description={isClassTeacherRole ? "Assigned class teacher section roster" : "Full roster of your assigned sections"}
        icon="account-group-outline"
        tone={colors.secondary}
        onPress={() => navigation.navigate('StudentsList')}
      />
      {isClassTeacherRole ? (
        <>
          <DashboardCard
            title="Homework"
            value="Class"
            description="Assigned section homework"
            icon="book-check-outline"
            tone={colors.secondary}
            onPress={() => navigation.navigate('Homework')}
          />
          <DashboardCard
            title="Parent Information"
            value="View"
            description="Open student profiles for parent contacts"
            icon="account-child-outline"
            onPress={() => navigation.navigate('StudentsList')}
          />
          <DashboardCard
            title="Section Attendance"
            value="This Month"
            description="Monthly attendance report for your section"
            icon="chart-areaspline"
            tone={colors.primary}
            onPress={() => navigation.navigate('SectionAttendanceReport')}
          />
          <DashboardCard
            title="Students with Due Fees"
            value={feeSummary.dueStudents > 0 ? `${feeSummary.dueStudents} pending` : 'View'}
            description="List of students in your section with outstanding dues"
            icon="cash-clock"
            tone={colors.danger}
            onPress={() => navigation.navigate('ClassTeacherDueFees')}
          />
        </>
      ) : null}
      <DashboardCard
        title="My Timetable"
        value="Weekly"
        description="View your assigned periods and classes"
        icon="calendar-clock"
        tone={colors.primary}
        onPress={() => navigation.navigate('Timetable')}
      />
      <DashboardCard
        title="Notice Board"
        value="View"
        description="School announcements and notices"
        icon="bulletin-board"
        tone={colors.info}
        onPress={() => navigation.navigate('NoticeBoard')}
      />
      <DashboardCard
        title="Teacher Profile"
        value="View"
        description="Your assignments, subjects, and bio"
        icon="account-details-outline"
        tone={colors.purple}
        onPress={() => navigation.navigate('TeacherProfile', {teacherId})}
      />

      {/* ── Fee visibility (read-only) ── */}
      <SectionHeader title="Section Fee Visibility" icon="cash-check" />
      <Animated.View
        style={styles.feeStrip}>
        <View style={styles.feeStat}>
          <Text style={[styles.feeValue, {color: colors.success}]}>
            {formatCurrency(feeSummary.paidAmount || 0)}
          </Text>
          <Text style={styles.feeLabel}>Paid</Text>
        </View>
        <View style={styles.feeDiv} />
        <View style={styles.feeStat}>
          <Text style={[styles.feeValue, {color: colors.danger}]}>
            {formatCurrency(feeSummary.dueAmount || 0)}
          </Text>
          <Text style={styles.feeLabel}>Due</Text>
        </View>
        <View style={styles.feeDiv} />
        <View style={styles.feeStat}>
          <Text style={[styles.feeValue, {color: colors.primary}]}>
            {feeCollectionRate}%
          </Text>
          <Text style={styles.feeLabel}>Rate</Text>
        </View>
      </Animated.View>

    </ScrollView>

    <UserMenuDrawer
      visible={menuOpen}
      onClose={() => setMenuOpen(false)}
      navigation={navigation}
      profileRoute="TeacherProfile"
      profileParams={{teacherId: user?.teacherId || user?.id}}
      notificationsRoute="NotificationCenter"
    />
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background},
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl + spacing.xl},
  // Header
  header: {
    backgroundColor: colors.secondary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 80,
    height: 150,
    position: 'absolute',
    right: -30,
    top: -50,
    width: 150},
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md},
  headerAvatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 46,
    justifyContent: 'center',
    width: 46},
  headerAvatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900'},
  headerCopy: {
    flex: 1,
    minWidth: 0},
  headerGreeting: {
    ...typography.overline,
    color: 'rgba(255,255,255,0.6)'},
  headerName: {
    ...typography.subtitle,
    color: colors.white,
    marginTop: 1},
  logoutBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36},
  headerMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm},
  metaChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 4},
  metaChipText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600'},
  // Primary CTA
  attendanceCta: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: radius.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    overflow: 'hidden',
    padding: spacing.lg},
  ctaLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md},
  ctaIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.lg,
    height: 52,
    justifyContent: 'center',
    width: 52},
  ctaLabel: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800'},
  ctaSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2},
  ctaBtn: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md},
  ctaBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800'},
  // Stats row
  statsRow: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg},
  statBox: {
    alignItems: 'center',
    gap: spacing.xs},
  statDiv: {
    backgroundColor: colors.border,
    height: 32,
    width: 1},
  statLabel: {
    ...typography.overline,
    color: colors.textMuted,
    fontSize: 9,
    textAlign: 'center'},
  // Progress card
  progressCard: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.lg},
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md},
  progressTitle: {
    ...typography.captionBold,
    color: colors.text},
  progressPct: {
    fontSize: 14,
    fontWeight: '800'},
  // Fee strip
  feeStrip: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg},
  feeStat: {
    alignItems: 'center'},
  feeValue: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18},
  feeLabel: {
    ...typography.overline,
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 3},
  feeDiv: {
    backgroundColor: colors.border,
    height: 32,
    width: 1}});

export default TeacherDashboardScreen;
