import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  AppState,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {AttendanceRing, CalendarAttendance, EmptyState, SelectField} from '../../components';
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_ICONS,
  ATTENDANCE_STATUS_LABELS,
  HOLIDAY_TYPE_LABELS} from '../../config/constants';
import attendanceService from '../../services/attendance/attendanceService';
import holidayService from '../../services/holidays/holidayService';
import parentService from '../../services/parents/parentService';
import VoiceAnnouncementButton from '../../components/common/VoiceAnnouncementButton';
import {TELUGU} from '../../services/tts/teluguTemplates';
import {colors, radius, shadows, spacing} from '../../theme';
import {normalizeAttendanceStatus} from '../../utils/helpers/attendanceHelpers';
import {toISODate} from '../../utils/helpers/dateHelpers';

const pad = n => String(n).padStart(2, '0');
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ── Low Attendance Warning Banner ─────────────────────────────────────────────
const LowAttendanceBanner = ({percentage}) => {
  const thresholds = [
    {at: 75, color: '#EF4444', icon: 'alert-circle',          severity: 'critical'},
    {at: 80, color: '#F97316', icon: 'alert-circle-outline',  severity: 'warning'},
    {at: 90, color: '#EAB308', icon: 'alert-outline',         severity: 'notice'},
  ];
  const hit = thresholds.find(t => percentage < t.at);
  if (!hit) { return null; }
  return (
    <Animated.View
      style={[banner.wrap, {backgroundColor: `${hit.color}15`, borderColor: `${hit.color}40`}]}>
      <MaterialCommunityIcons name={hit.icon} size={15} color={hit.color} />
      <Text style={[banner.text, {color: hit.color}]}>
        {percentage.toFixed(1)}% attendance is below the {hit.at}% minimum.
        {hit.severity === 'critical' ? ' Immediate action required.' : ' Please contact the school.'}
      </Text>
    </Animated.View>
  );
};

// ── Stat Pill (monthly) ───────────────────────────────────────────────────────
const StatPill = ({icon, count, label, color}) => (
  <View style={[stat.wrap, {backgroundColor: `${color}10`, borderColor: `${color}25`}]}>
    <MaterialCommunityIcons name={icon} size={14} color={color} />
    <Text style={[stat.count, {color}]}>{count}</Text>
    <Text style={stat.label}>{label}</Text>
  </View>
);

// ── Academic Year Summary Card ────────────────────────────────────────────────
const AcademicYearSummary = ({summary, ayPct}) => {
  if (!summary || summary.total === 0) { return null; }

  const items = [
    {icon: 'check-circle',             count: summary.present,       label: 'Present',  color: colors.success},
    {icon: 'close-circle',             count: summary.absent,        label: 'Absent',   color: colors.danger},
    {icon: 'circle-half-full',         count: summary.halfDay,       label: 'Half Day', color: '#F97316'},
    {icon: 'clock-alert-outline',      count: summary.late,          label: 'Late',     color: '#EAB308'},
    {icon: 'medical-bag',              count: summary.medicalLeave,  label: 'Medical',  color: '#8B5CF6'},
    {icon: 'calendar-check-outline',   count: summary.approvedLeave, label: 'Approved', color: '#3B82F6'},
  ];

  const pctColor = ayPct < 75 ? colors.danger : ayPct < 85 ? '#F97316' : colors.success;

  return (
    <Animated.View style={ay.card}>
      {/* Header */}
      <View style={ay.header}>
        <MaterialCommunityIcons name="chart-bar" size={16} color={colors.primary} />
        <Text style={ay.title}>Academic Year Summary</Text>
        <View style={[ay.pctBadge, {backgroundColor: `${pctColor}15`, borderColor: `${pctColor}40`}]}>
          <Text style={[ay.pctBadgeText, {color: pctColor}]}>{ayPct != null ? `${ayPct}%` : '—'}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={ay.divider} />

      {/* Grid of all statuses */}
      <View style={ay.grid}>
        {items.map(item => (
          <View key={item.label} style={ay.cell}>
            <View style={[ay.iconWrap, {backgroundColor: `${item.color}15`}]}>
              <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
            </View>
            <Text style={[ay.cellCount, {color: item.color}]}>{item.count}</Text>
            <Text style={ay.cellLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Total working days attended */}
      <View style={ay.footer}>
        <MaterialCommunityIcons name="calendar-range" size={13} color={colors.textMuted} />
        <Text style={ay.footerText}>
          {summary.present + summary.late + summary.approvedLeave} out of {summary.total} school days attended this year
        </Text>
      </View>
    </Animated.View>
  );
};

// ── Holiday Panel ─────────────────────────────────────────────────────────────
const HolidayPanel = ({holidays, title}) => {
  const [expanded, setExpanded] = useState(false);
  if (!holidays.length) { return null; }
  const visible = expanded ? holidays : holidays.slice(0, 3);
  return (
    <Animated.View style={hp.wrap}>
      <Pressable onPress={() => setExpanded(e => !e)} style={hp.header}>
        <MaterialCommunityIcons name="calendar-star" size={16} color={colors.primary} />
        <Text style={hp.title}>{title}</Text>
        <View style={hp.badge}>
          <Text style={hp.badgeText}>{holidays.length}</Text>
        </View>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
      </Pressable>
      {visible.map((h, i) => {
        const isUpcoming = h.date >= toISODate();
        return (
          <View key={h.id || i} style={hp.row}>
            <View style={[hp.dot, {backgroundColor: isUpcoming ? colors.primary : colors.border}]} />
            <View style={hp.info}>
              <Text style={hp.name}>{h.name}</Text>
              <Text style={hp.meta}>
                {new Date(h.date + 'T00:00:00').toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}
                {h.type ? `  ·  ${HOLIDAY_TYPE_LABELS[h.type] || h.type}` : ''}
              </Text>
            </View>
            {isUpcoming ? (
              <View style={hp.upcomingChip}>
                <Text style={hp.upcomingText}>Upcoming</Text>
              </View>
            ) : null}
          </View>
        );
      })}
      {holidays.length > 3 ? (
        <Pressable onPress={() => setExpanded(e => !e)} style={hp.showMore}>
          <Text style={hp.showMoreText}>
            {expanded ? 'Show less' : `Show ${holidays.length - 3} more`}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────────
const ParentAttendanceScreen = () => {
  const user     = useSelector(state => state.auth.user);
  const appState = useRef(AppState.currentState);

  const now = new Date();
  const nowYear  = now.getFullYear();
  const nowMonth = now.getMonth(); // 0-based

  const [selectedChild, setSelectedChild] = useState(null);
  const [viewYear,      setViewYear]      = useState(nowYear);
  const [viewMonth,     setViewMonth]     = useState(nowMonth);

  const childrenQuery = useQuery({
    queryKey: ['parentChildren', user?.id],
    queryFn:  () => parentService.getParentChildren(user?.id),
    enabled:  Boolean(user?.id)});
  const children = useMemo(() => childrenQuery.data || [], [childrenQuery.data]);

  useEffect(() => {
    if (!selectedChild && children[0]) { setSelectedChild(children[0]); }
  }, [children, selectedChild]);

  // Academic year bounds
  const ayStart = selectedChild?.ayStartDate || `${nowYear}-06-01`;
  const ayEnd   = selectedChild?.ayEndDate   || `${nowYear + 1}-03-31`;

  // Parse AY start/end for navigation bounds (0-based month)
  const [ayStartYear, ayStartMonth0] = useMemo(() => {
    const parts = ayStart.split('-').map(Number);
    return [parts[0], parts[1] - 1];
  }, [ayStart]);

  const [ayEndYear, ayEndMonth0] = useMemo(() => {
    const parts = ayEnd.split('-').map(Number);
    return [parts[0], parts[1] - 1];
  }, [ayEnd]);

  const yearMonth = `${viewYear}-${pad(viewMonth + 1)}`;
  const lastDay   = new Date(viewYear, viewMonth + 1, 0).getDate();
  const fromDate  = `${yearMonth}-01`;
  const toDate    = `${yearMonth}-${pad(lastDay)}`;

  const studentId      = selectedChild?.studentId;
  const branchId       = selectedChild?.branchId || user?.branchId;
  const academicYearId = selectedChild?.academicYearId || user?.academicYearId;

  // Monthly attendance
  const attendanceQuery = useQuery({
    queryKey: ['parentAttendance', studentId, yearMonth],
    queryFn:  () => attendanceService.getAttendance({studentId, fromDate, toDate}),
    enabled:  Boolean(studentId),
    staleTime: 2 * 60 * 1000});

  // Full academic year attendance
  // BUG-A FIX: ayStart + ayEnd must be in the query key — they change when
  // selectedChild first loads (null → real child), and the key change is what
  // triggers a refetch with the correct date range.
  const fullYearQuery = useQuery({
    queryKey: ['parentAttendanceYear', studentId, academicYearId, ayStart, ayEnd],
    queryFn:  () => attendanceService.getAttendance({studentId, fromDate: ayStart, toDate: ayEnd}),
    enabled:  Boolean(studentId),
    staleTime: 5 * 60 * 1000});

  // Holiday map for viewed month
  const holidayMonthQuery = useQuery({
    queryKey: ['holidayMap', branchId, yearMonth],
    queryFn:  () => holidayService.getHolidayMonthMap(branchId, yearMonth),
    enabled:  Boolean(branchId),
    staleTime: 10 * 60 * 1000});

  // Full-year holidays for Holiday Panel
  const holidayYearQuery = useQuery({
    queryKey: ['holidayYearList', branchId, ayStart, ayEnd],
    queryFn:  () => holidayService.getHolidaysByBranch(branchId, ayStart, ayEnd),
    enabled:  Boolean(branchId),
    staleTime: 10 * 60 * 1000});

  const records     = useMemo(() => attendanceQuery.data  || [], [attendanceQuery.data]);
  const allRecords  = useMemo(() => fullYearQuery.data    || [], [fullYearQuery.data]);
  const holidayMap  = useMemo(() => holidayMonthQuery.data || {}, [holidayMonthQuery.data]);
  const allHolidays = useMemo(() => holidayYearQuery.data  || [], [holidayYearQuery.data]);

  // Monthly summary
  const summary = useMemo(() => attendanceService.summarizeAttendance(records), [records]);

  // Full academic year summary — all counts, not just percentage
  const aySummary = useMemo(() => {
    if (!allRecords.length) { return null; }
    return attendanceService.summarizeAttendance(allRecords);
  }, [allRecords]);

  const ayPct = aySummary?.percentage ?? null;

  // Calendar color map for current month
  const calendarMap = useMemo(() => {
    const map = {};
    records.forEach(r => {
      const s = normalizeAttendanceStatus(r.status) || r.status;
      switch (s) {
        case ATTENDANCE_STATUS.PRESENT:        map[r.attendanceDate] = 'present';  break;
        case ATTENDANCE_STATUS.ABSENT:         map[r.attendanceDate] = 'absent';   break;
        case ATTENDANCE_STATUS.HALF_DAY:       map[r.attendanceDate] = 'half';     break;
        case ATTENDANCE_STATUS.LATE:           map[r.attendanceDate] = 'late';     break;
        case ATTENDANCE_STATUS.MEDICAL_LEAVE:  map[r.attendanceDate] = 'medical';  break;
        case ATTENDANCE_STATUS.APPROVED_LEAVE: map[r.attendanceDate] = 'approved'; break;
        default: break;
      }
    });
    Object.entries(holidayMap).forEach(([date, h]) => {
      if (!map[date]) { map[date] = h.isPublicHoliday ? 'publicHoliday' : 'holiday'; }
    });
    return map;
  }, [records, holidayMap]);

  const upcomingHolidays = useMemo(() => {
    const todayStr = toISODate();
    return allHolidays.filter(h => h.date >= todayStr).slice(0, 10);
  }, [allHolidays]);

  // BUG-D FIX: include all four queries so the spinner stays active until
  // every network call finishes, not just attendance.
  const isRefreshing =
    attendanceQuery.isFetching  ||
    fullYearQuery.isFetching    ||
    holidayMonthQuery.isFetching ||
    holidayYearQuery.isFetching;

  // BUG-C FIX: holidayMonthQuery was missing — current-month holiday additions
  // would never appear after a pull-to-refresh.
  const onRefresh = () => {
    attendanceQuery.refetch();
    fullYearQuery.refetch();
    holidayMonthQuery.refetch();
    holidayYearQuery.refetch();
  };

  // Re-fetch on app foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (appState.current.match(/inactive|background/) && state === 'active') {
        attendanceQuery.refetch();
      }
      appState.current = state;
    });
    return () => sub.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Navigation bounds ──────────────────────────────────────────────────────
  const isAtAyStart      = viewYear === ayStartYear  && viewMonth === ayStartMonth0;
  const isAtCurrentMonth = viewYear === nowYear       && viewMonth === nowMonth;

  // BUG-B FIX: upper bound is the EARLIER of (current month) and (AY end month).
  // Without this, a parent could keep tapping Next past March (AY end) into
  // April, May, June — empty screens with no explanation.
  const isAtUpperBound = (() => {
    const pastCurrent = viewYear > nowYear || (viewYear === nowYear && viewMonth >= nowMonth);
    const pastAyEnd   = viewYear > ayEndYear || (viewYear === ayEndYear && viewMonth >= ayEndMonth0);
    return pastCurrent || pastAyEnd;
  })();

  const goToPrevMonth = () => {
    if (isAtAyStart) { return; }
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (isAtUpperBound) { return; }
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  // BUG-E FIX: when the parent switches between children, reset the calendar
  // view to the current month. Without this, viewing April for Child A then
  // switching to Child B would still show April for Child B.
  useEffect(() => {
    if (!selectedChild?.id) { return; }
    const n = new Date();
    setViewYear(n.getFullYear());
    setViewMonth(n.getMonth());
  }, [selectedChild?.id]);

  const childOptions = children.map(c => ({label: c.fullName, value: c.id}));

  if (!children.length && !childrenQuery.isLoading) {
    return (
      <View style={styles.root}>
        <EmptyState
          icon="account-child"
          title="No Children Found"
          message="No student profiles are linked to your account. Please contact the school administrator."
        />
      </View>
    );
  }

  const hasMonthData    = records.length > 0;
  const isLoadingMonth  = attendanceQuery.isLoading;
  const isFutureMonth   = new Date(viewYear, viewMonth, 1) > new Date(nowYear, nowMonth, 1);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>

      {/* Child selector */}
      {children.length > 1 ? (
        <View style={styles.childSelector}>
          <SelectField
            label="Child"
            value={selectedChild?.id}
            options={childOptions}
            onChange={id => setSelectedChild(children.find(c => c.id === id))}
          />
        </View>
      ) : selectedChild ? (
        <View style={styles.childNameRow}>
          <MaterialCommunityIcons name="account-school" size={16} color={colors.primary} />
          <Text style={styles.childName}>{selectedChild.fullName}</Text>
          {selectedChild.section?.name ? (
            <Text style={styles.childSection}>{selectedChild.section.name}</Text>
          ) : null}
        </View>
      ) : null}

      {/* BUG-F FIX: only show the banner once AY data has loaded.
          Using monthly % here is misleading — a student absent for 3 days
          in the first week looks like 0% attendance for the month even though
          their academic year % is perfectly fine. */}
      {ayPct != null ? <LowAttendanceBanner percentage={ayPct} /> : null}

      {/* Month navigator */}
      <Animated.View style={styles.monthNav}>
        <Pressable
          onPress={goToPrevMonth}
          disabled={isAtAyStart}
          hitSlop={12}
          style={[styles.monthNavBtn, isAtAyStart && styles.monthNavBtnDis]}>
          <MaterialCommunityIcons
            name="chevron-left" size={22}
            color={isAtAyStart ? colors.border : colors.primary} />
        </Pressable>

        <View style={styles.monthCenter}>
          <Text style={styles.monthTitle}>{MONTH_NAMES[viewMonth]} {viewYear}</Text>
          {!isAtCurrentMonth ? (
            <Pressable onPress={() => { setViewYear(nowYear); setViewMonth(nowMonth); }}>
              <Text style={styles.todayLink}>Back to current month</Text>
            </Pressable>
          ) : null}
        </View>

        <Pressable
          onPress={goToNextMonth}
          disabled={isAtUpperBound}
          hitSlop={12}
          style={[styles.monthNavBtn, isAtUpperBound && styles.monthNavBtnDis]}>
          <MaterialCommunityIcons
            name="chevron-right" size={22}
            color={isAtUpperBound ? colors.border : colors.primary} />
        </Pressable>
      </Animated.View>

      {/* Attendance ring — monthly % + AY % */}
      <Animated.View style={styles.ringCard}>
        <AttendanceRing percentage={summary.percentage} size={110} strokeWidth={10} />
        <View style={styles.ringStats}>
          <Text style={styles.ringPct}>{summary.percentage}%</Text>
          <Text style={styles.ringLabel}>
            {isAtCurrentMonth ? 'This Month' : `${MONTH_NAMES[viewMonth].slice(0, 3)} ${viewYear}`}
          </Text>
          {ayPct != null ? (
            <View style={styles.ayPctRow}>
              <Text style={styles.ayPctLabel}>Academic Year:</Text>
              <Text style={[styles.ayPctVal, {
                color: ayPct < 75 ? colors.danger : ayPct < 85 ? '#F97316' : colors.success}]}>
                {ayPct}%
              </Text>
            </View>
          ) : null}
        </View>
        {selectedChild ? (
          <VoiceAnnouncementButton
            text={TELUGU.attendanceAlert(
              selectedChild.fullName,
              ayPct != null ? ayPct : summary.percentage,
            )}
            size={18}
          />
        ) : null}
      </Animated.View>

      {/* Monthly stat pills — always show all 6 statuses */}
      {!isLoadingMonth ? (
        hasMonthData ? (
          <Animated.View style={styles.statsRow}>
            <StatPill icon="check-circle"             count={summary.present}       label="Present"  color={colors.success} />
            <StatPill icon="close-circle"             count={summary.absent}        label="Absent"   color={colors.danger}  />
            <StatPill icon="circle-half-full"         count={summary.halfDay}       label="Half Day" color="#F97316"        />
            <StatPill icon="clock-alert-outline"      count={summary.late}          label="Late"     color="#EAB308"        />
            <StatPill icon="medical-bag"              count={summary.medicalLeave}  label="Medical"  color="#8B5CF6"        />
            <StatPill icon="calendar-check-outline"   count={summary.approvedLeave} label="Approved" color="#3B82F6"        />
          </Animated.View>
        ) : (
          /* No records for this month */
          <Animated.View style={styles.emptyMonth}>
            <MaterialCommunityIcons
              name={isFutureMonth ? 'calendar-clock' : 'calendar-remove'}
              size={32}
              color={colors.border}
            />
            <Text style={styles.emptyMonthTitle}>
              {isFutureMonth ? 'Upcoming Month' : 'No Attendance Data'}
            </Text>
            <Text style={styles.emptyMonthSub}>
              {isFutureMonth
                ? 'Attendance for this month has not started yet.'
                : 'No attendance records found for this month.'}
            </Text>
          </Animated.View>
        )
      ) : null}

      {/* Calendar */}
      <Animated.View style={styles.calCard}>
        <Text style={styles.calTitle}>Daily Attendance — {MONTH_NAMES[viewMonth]} {viewYear}</Text>
        <CalendarAttendance
          monthDate={new Date(viewYear, viewMonth, 1)}
          records={calendarMap}
        />
        {/* Legend */}
        <View style={styles.legend}>
          {[
            {key: 'present',  color: colors.success,  label: 'Present'},
            {key: 'absent',   color: colors.danger,   label: 'Absent'},
            {key: 'half',     color: '#F97316',       label: 'Half Day'},
            {key: 'late',     color: '#EAB308',       label: 'Late'},
            {key: 'medical',  color: '#8B5CF6',       label: 'Medical'},
            {key: 'approved', color: '#3B82F6',       label: 'Approved'},
            {key: 'holiday',  color: '#C2410C',       label: 'Holiday'},
            {key: 'sunday',   color: colors.danger,   label: 'Sunday', faint: true},
          ].map(item => (
            <View key={item.key} style={styles.legendItem}>
              <View style={[
                styles.legendDot,
                {backgroundColor: item.faint ? `${item.color}22` : item.color},
                item.faint && {borderColor: item.color, borderWidth: 1},
              ]} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Academic Year Summary — total present, absent, half-day, etc. */}
      <AcademicYearSummary summary={aySummary} ayPct={ayPct} />

      {/* Holiday Panel */}
      {upcomingHolidays.length > 0 ? (
        <HolidayPanel holidays={upcomingHolidays} title="Upcoming Holidays" />
      ) : null}
      {allHolidays.length > 0 && !upcomingHolidays.length ? (
        <HolidayPanel holidays={allHolidays} title="Academic Year Holidays" />
      ) : null}

      <View style={{height: 32}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root:    {backgroundColor: colors.background, flex: 1},
  content: {padding: spacing.lg},

  childSelector: {marginBottom: spacing.md},
  childNameRow:  {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md},
  childName:     {color: colors.text, fontSize: 15, fontWeight: '800'},
  childSection:  {color: colors.textMuted, fontSize: 12, fontWeight: '600'},

  monthNav:      {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md},
  monthNavBtn:   {padding: 4},
  monthNavBtnDis:{opacity: 0.3},
  monthCenter:   {alignItems: 'center'},
  monthTitle:    {color: colors.text, fontSize: 17, fontWeight: '800'},
  todayLink:     {color: colors.primary, fontSize: 11, fontWeight: '600', marginTop: 2},

  ringCard:   {alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, flexDirection: 'row', gap: spacing.xl, marginBottom: spacing.md, padding: spacing.lg, ...shadows.clay},
  ringStats:  {flex: 1},
  ringPct:    {color: colors.text, fontSize: 28, fontWeight: '900'},
  ringLabel:  {color: colors.textMuted, fontSize: 12, fontWeight: '600'},
  ayPctRow:   {alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: spacing.sm},
  ayPctLabel: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},
  ayPctVal:   {fontSize: 13, fontWeight: '800'},

  statsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md},

  emptyMonth:      {alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, gap: spacing.sm, marginBottom: spacing.md, padding: spacing.xl, ...shadows.clay},
  emptyMonthTitle: {color: colors.text, fontSize: 14, fontWeight: '800'},
  emptyMonthSub:   {color: colors.textMuted, fontSize: 12, fontWeight: '500', textAlign: 'center'},

  calCard:   {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, marginBottom: spacing.md, padding: spacing.md, ...shadows.clay},
  calTitle:  {color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: spacing.sm},
  legend:    {borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm, paddingTop: spacing.sm},
  legendItem:{alignItems: 'center', flexDirection: 'row', gap: 4},
  legendDot: {borderRadius: 3, height: 6, width: 6},
  legendText:{color: colors.textMuted, fontSize: 10, fontWeight: '700'}});

const banner = StyleSheet.create({
  wrap: {alignItems: 'center', borderRadius: radius.card, borderWidth: 1.5, flexDirection: 'row', gap: 8, marginBottom: spacing.md, padding: spacing.md},
  text: {flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18}});

const stat = StyleSheet.create({
  wrap:  {alignItems: 'center', borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', gap: 5, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs},
  count: {fontSize: 14, fontWeight: '800'},
  label: {color: colors.textMuted, fontSize: 10, fontWeight: '600'}});

// Academic Year Summary styles
const ay = StyleSheet.create({
  card:        {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, marginBottom: spacing.md, padding: spacing.md, ...shadows.clay},
  header:      {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm},
  title:       {color: colors.text, flex: 1, fontSize: 14, fontWeight: '800'},
  pctBadge:    {borderRadius: radius.pill, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 3},
  pctBadgeText:{fontSize: 13, fontWeight: '900'},
  divider:     {backgroundColor: colors.border, height: 1, marginBottom: spacing.md},
  grid:        {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between'},
  cell:        {alignItems: 'center', gap: 4, width: '30%'},
  iconWrap:    {alignItems: 'center', borderRadius: radius.sm, height: 36, justifyContent: 'center', width: 36},
  cellCount:   {fontSize: 18, fontWeight: '900'},
  cellLabel:   {color: colors.textMuted, fontSize: 10, fontWeight: '600'},
  footer:      {alignItems: 'center', borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', gap: 6, marginTop: spacing.md, paddingTop: spacing.sm},
  footerText:  {color: colors.textMuted, fontSize: 11, fontWeight: '600'}});

const hp = StyleSheet.create({
  wrap:        {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, marginBottom: spacing.md, padding: spacing.md},
  header:      {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm},
  title:       {color: colors.text, flex: 1, fontSize: 14, fontWeight: '800'},
  badge:       {alignItems: 'center', backgroundColor: `${colors.primary}15`, borderRadius: radius.pill, height: 20, justifyContent: 'center', minWidth: 20, paddingHorizontal: 5},
  badgeText:   {color: colors.primary, fontSize: 10, fontWeight: '800'},
  row:         {alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm},
  dot:         {borderRadius: 5, height: 6, marginTop: 5, width: 6},
  info:        {flex: 1},
  name:        {color: colors.text, fontSize: 13, fontWeight: '700'},
  meta:        {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  upcomingChip:{backgroundColor: `${colors.primary}15`, borderRadius: radius.pill, paddingHorizontal: 6, paddingVertical: 2},
  upcomingText:{color: colors.primary, fontSize: 9, fontWeight: '800'},
  showMore:    {alignItems: 'center', paddingTop: spacing.xs},
  showMoreText:{color: colors.primary, fontSize: 12, fontWeight: '600'}});

export default ParentAttendanceScreen;
