import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {AnimatedProgressBar, EmptyState, SearchBar, SkeletonLoader} from '../../components';
import attendanceService, {summarizeAttendance} from '../../services/attendance/attendanceService';
import studentService from '../../services/students/studentService';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {toISODate} from '../../utils/helpers/dateHelpers';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const LOW_RED   = 75;
const LOW_AMBER = 85;

const pctColor = pct =>
  pct < LOW_RED   ? colors.danger  :
  pct < LOW_AMBER ? '#F97316'      :
  colors.success;

const pctBg = pct =>
  pct < LOW_RED   ? '#FEE2E2' :
  pct < LOW_AMBER ? '#FFF7ED' :
  '#F0FDF4';

const monthRange = (year, month) => {
  const mm   = String(month + 1).padStart(2, '0');
  const last = new Date(year, month + 1, 0).getDate();
  return {
    fromDate: `${year}-${mm}-01`,
    toDate:   `${year}-${mm}-${String(last).padStart(2, '0')}`,
    yearMonth: `${year}-${mm}`};
};

// ── Per-student card ───────────────────────────────────────────────────────────
const StudentCard = ({item, workingDays, index}) => {
  const pct   = item.pct;
  const color = pctColor(pct);
  const bg    = pctBg(pct);
  const needsAttention = pct < LOW_AMBER;

  return (
    <Animated.View
      style={[s.card, needsAttention && {borderColor: `${color}55`}]}>
      <View style={[s.pctBadge, {backgroundColor: bg}]}>
        <Text style={[s.pctText, {color}]}>{pct}%</Text>
      </View>
      <View style={s.cardBody}>
        <Text style={s.name} numberOfLines={1}>{item.name}</Text>
        <Text style={s.meta}>
          {item.admissionNumber ? `${item.admissionNumber} · ` : ''}
          {item.present}P · {item.absent}A
          {item.halfDay ? ` · ${item.halfDay}H` : ''}
          {item.late    ? ` · ${item.late}L`    : ''}
          {workingDays > 0 ? ` / ${workingDays} days` : ''}
        </Text>
        <AnimatedProgressBar
          progress={pct}
          color={color}
          trackColor={colors.border}
          height={4}
        />
      </View>
      {needsAttention ? (
        <MaterialCommunityIcons
          name={pct < LOW_RED ? 'alert-circle' : 'alert-circle-outline'}
          size={18}
          color={color}
        />
      ) : (
        <MaterialCommunityIcons name="check-circle-outline" size={18} color={colors.success} />
      )}
    </Animated.View>
  );
};

// ── Main screen ────────────────────────────────────────────────────────────────
const SectionAttendanceReportScreen = () => {
  const user               = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);

  // Compute today fresh on each render — avoids stale date if screen stays open past midnight
  const todayISO    = toISODate();
  const todayYear   = parseInt(todayISO.slice(0, 4), 10);
  const todayMonth0 = parseInt(todayISO.slice(5, 7), 10) - 1;

  // Academic year floor for month navigation
  const ayStartStr   = activeAcademicYear?.startDate || `${todayYear}-06-01`;
  const ayStartYear  = parseInt(ayStartStr.slice(0, 4), 10);
  const ayStartMonth0 = parseInt(ayStartStr.slice(5, 7), 10) - 1;

  const [viewYear,  setViewYear]  = useState(todayYear);
  const [viewMonth, setViewMonth] = useState(todayMonth0);
  const [query,     setQuery]     = useState('');

  const {fromDate, toDate, yearMonth} = useMemo(
    () => monthRange(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const atCurrentMonth = yearMonth === todayISO.slice(0, 7);

  const sectionId = user?.sectionId;

  // All students in the section
  const studentsQuery = useQuery({
    queryKey: ['sectionStudents', sectionId],
    queryFn:  () => studentService.getStudentsBySection(sectionId),
    enabled:  Boolean(sectionId),
    staleTime: 10 * 60 * 1000});

  // All attendance records for the section in the selected month.
  // Key includes todayISO when viewing current month so the cache refreshes at day boundary.
  const historyQuery = useQuery({
    queryKey: ['sectionMonthHistory', sectionId, yearMonth, atCurrentMonth ? todayISO : 'full'],
    queryFn:  () => attendanceService.getSectionHistory({
      sectionId,
      fromDate,
      toDate: atCurrentMonth ? todayISO : toDate,
      limit: 9999}),
    enabled:  Boolean(sectionId),
    staleTime: 3 * 60 * 1000});

  const isLoading = studentsQuery.isLoading || historyQuery.isLoading;

  // Working days = unique dates with any submitted record
  const workingDays = useMemo(() => {
    const dates = new Set((historyQuery.data || []).map(r => r.attendanceDate));
    return dates.size;
  }, [historyQuery.data]);

  // Per-student aggregates
  const studentStats = useMemo(() => {
    const students = studentsQuery.data || [];
    const records  = historyQuery.data  || [];

    const byStudent = {};
    for (const r of records) {
      if (!byStudent[r.studentId]) { byStudent[r.studentId] = []; }
      byStudent[r.studentId].push(r);
    }

    return students.map(st => {
      const recs    = byStudent[st.id] || [];
      const summary = summarizeAttendance(recs);
      const denom   = workingDays > 0 ? workingDays : recs.length;
      const pct     = denom > 0
        ? Math.round(
            ((summary.present + summary.late + summary.approvedLeave + 0.5 * summary.halfDay) / denom) * 100,
          )
        : 0;
      return {
        id:              st.id,
        name:            st.fullName || st.name || 'Student',
        admissionNumber: st.studentId || st.admissionNumber,
        present:         summary.present + summary.late + summary.approvedLeave,
        absent:          summary.absent,
        halfDay:         summary.halfDay,
        late:            summary.late,
        medicalLeave:    summary.medicalLeave,
        pct,
        recs};
    }).sort((a, b) => a.pct - b.pct); // lowest attendance first
  }, [studentsQuery.data, historyQuery.data, workingDays]);

  const filtered = useMemo(() => {
    if (!query) { return studentStats; }
    const q = query.toLowerCase();
    return studentStats.filter(s =>
      `${s.name} ${s.admissionNumber || ''}`.toLowerCase().includes(q),
    );
  }, [studentStats, query]);

  // Section summary
  const sectionAvg   = studentStats.length
    ? Math.round(studentStats.reduce((s, r) => s + r.pct, 0) / studentStats.length)
    : 0;
  const belowRed     = studentStats.filter(r => r.pct < LOW_RED).length;
  const belowAmber   = studentStats.filter(r => r.pct >= LOW_RED && r.pct < LOW_AMBER).length;
  const fullAttendance = studentStats.filter(r => r.pct === 100).length;

  const atAyStart = viewYear === ayStartYear && viewMonth === ayStartMonth0;

  const prevMonth = () => {
    if (atAyStart) { return; }
    viewMonth === 0
      ? (setViewYear(y => y - 1), setViewMonth(11))
      : setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (atCurrentMonth) { return; }
    viewMonth === 11
      ? (setViewYear(y => y + 1), setViewMonth(0))
      : setViewMonth(m => m + 1);
  };

  return (
    <View style={s.root}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({item, index}) => (
          <StudentCard item={item} workingDays={workingDays} index={index} />
        )}
        ListHeaderComponent={
          <View>
            {/* Hero */}
            <Animated.View style={s.hero}>
              <View style={s.heroDecor} />
              <Text style={s.heroOverline}>
                {user?.sectionName ? `Section ${user.sectionName}` : 'My Section'} · Class Teacher
              </Text>
              <Text style={s.heroTitle}>Attendance Report</Text>
              <Text style={s.heroSub}>
                {isLoading
                  ? 'Loading…'
                  : `${studentStats.length} students · ${workingDays} working day${workingDays !== 1 ? 's' : ''} this month`}
              </Text>
            </Animated.View>

            {/* Month navigator */}
            <Animated.View
              style={s.monthNav}>
              <Pressable
                onPress={prevMonth}
                hitSlop={10}
                disabled={atAyStart}
                style={s.monthNavBtn}>
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={22}
                  color={atAyStart ? colors.border : colors.primary}
                />
              </Pressable>
              <View style={s.monthCenter}>
                <Text style={s.monthText}>{MONTHS[viewMonth]} {viewYear}</Text>
                {atCurrentMonth ? <Text style={s.monthChip}>This month</Text> : null}
              </View>
              <Pressable
                onPress={nextMonth}
                hitSlop={10}
                disabled={atCurrentMonth}
                style={s.monthNavBtn}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={atCurrentMonth ? colors.border : colors.primary}
                />
              </Pressable>
            </Animated.View>

            {/* Summary card */}
            {!isLoading && studentStats.length > 0 ? (
              <Animated.View
                style={s.summaryCard}>
                <View style={s.summaryRow}>
                  <View style={s.summaryBox}>
                    <Text style={[s.summaryVal, {color: pctColor(sectionAvg)}]}>
                      {sectionAvg}%
                    </Text>
                    <Text style={s.summaryLabel}>Class Avg</Text>
                  </View>
                  <View style={s.summaryDiv} />
                  <View style={s.summaryBox}>
                    <Text style={[s.summaryVal, {color: colors.success}]}>{fullAttendance}</Text>
                    <Text style={s.summaryLabel}>100%</Text>
                  </View>
                  <View style={s.summaryDiv} />
                  <View style={s.summaryBox}>
                    <Text style={[s.summaryVal, {color: '#F97316'}]}>{belowAmber}</Text>
                    <Text style={s.summaryLabel}>Below 85%</Text>
                  </View>
                  <View style={s.summaryDiv} />
                  <View style={s.summaryBox}>
                    <Text style={[s.summaryVal, {color: colors.danger}]}>{belowRed}</Text>
                    <Text style={s.summaryLabel}>Below 75%</Text>
                  </View>
                </View>
                <AnimatedProgressBar
                  progress={sectionAvg}
                  color={pctColor(sectionAvg)}
                  trackColor={colors.border}
                  height={6}
                />
                <View style={s.tagRow}>
                  <Text style={s.tagHint}>{MONTHS[viewMonth]} {viewYear} · {workingDays} school days</Text>
                </View>
              </Animated.View>
            ) : null}

            {isLoading ? (
              <View style={{gap: spacing.sm}}>
                {[0, 1, 2, 3, 4].map(i => (
                  <SkeletonLoader key={i} width="100%" height={64} borderRadius={12} />
                ))}
              </View>
            ) : null}

            {!isLoading && belowRed > 0 ? (
              <Animated.View style={s.alertBanner}>
                <MaterialCommunityIcons name="alert-circle" size={15} color={colors.danger} />
                <Text style={s.alertText}>
                  {belowRed} student{belowRed !== 1 ? 's' : ''} below 75% — contact parents
                </Text>
              </Animated.View>
            ) : null}

            {!isLoading && studentStats.length > 0 ? (
              <View style={s.sortHint}>
                <MaterialCommunityIcons name="sort-ascending" size={12} color={colors.textMuted} />
                <Text style={s.sortHintText}>Sorted by attendance % — lowest first</Text>
              </View>
            ) : null}

            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search student"
            />
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon={query ? 'account-search-outline' : 'clipboard-text-clock'}
              title={query ? 'No match' : workingDays === 0 ? 'No attendance yet' : 'No students found'}
              message={
                query
                  ? `No student matches "${query}".`
                  : workingDays === 0
                  ? `No attendance has been submitted for ${MONTHS[viewMonth]} ${viewYear} yet.`
                  : 'No students found in your section.'
              }
            />
          ) : null
        }
        ListFooterComponent={<View style={{height: 40}} />}
      />
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {paddingBottom: 40, paddingHorizontal: spacing.lg, paddingTop: spacing.md},

  // Hero
  hero: {
    ...shadows.clayDeep,
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 80,
    height: 120,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 120},
  heroOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '900', marginBottom: 4},
  heroSub:   {color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '500'},

  // Month nav
  monthNav: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm},
  monthNavBtn: {padding: 4},
  monthCenter: {alignItems: 'center', gap: 2},
  monthText:   {color: colors.text, fontSize: 15, fontWeight: '800'},
  monthChip:   {color: colors.primary, fontSize: 10, fontWeight: '700'},

  // Summary
  summaryCard: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.lg},
  summaryRow: {flexDirection: 'row', justifyContent: 'space-around'},
  summaryBox: {alignItems: 'center', flex: 1, gap: 3},
  summaryVal: {fontSize: 18, fontWeight: '900'},
  summaryLabel: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},
  summaryDiv: {backgroundColor: colors.border, width: 1},

  tagRow: {alignItems: 'center'},
  tagHint: {color: colors.textMuted, fontSize: 11, fontWeight: '500'},

  // Alert
  alertBanner: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: `${colors.danger}30`,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm},
  alertText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '700'},

  // Sort hint
  sortHint: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.xs},
  sortHintText: {color: colors.textMuted, fontSize: 11, fontWeight: '500'},

  // Student card
  card: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md},
  pctBadge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    minWidth: 46,
    paddingHorizontal: 6,
    paddingVertical: 6},
  pctText: {fontSize: 13, fontWeight: '900'},
  cardBody: {flex: 1, gap: 3},
  name: {...typography.body, color: colors.text, fontWeight: '700'},
  meta: {...typography.caption, color: colors.textMuted}});

export default SectionAttendanceReportScreen;
