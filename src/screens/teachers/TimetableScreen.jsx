import React, {useState, useMemo} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState} from '../../components';
import timetableService from '../../services/timetable/timetableService';
import timetablePdfService from '../../services/timetable/timetablePdfService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const DAY_COLORS = {
  Monday: colors.primary,
  Tuesday: colors.secondary,
  Wednesday: colors.info,
  Thursday: colors.success,
  Friday: colors.warning,
  Saturday: colors.purple};

const UpNextCard = ({period}) => {
  const color = DAY_COLORS[period.day] || colors.primary;
  return (
    <Animated.View
      style={[styles.upNextCard, {borderLeftColor: color, borderLeftWidth: 4}]}>
      <View style={[styles.upNextBadge, {backgroundColor: `${color}18`}]}>
        <MaterialCommunityIcons name="timer-outline" size={14} color={color} />
        <Text style={[styles.upNextBadgeText, {color}]}>Up Next</Text>
      </View>
      <Text style={styles.upNextSubject}>{period.subject}</Text>
      <View style={styles.upNextMeta}>
        <View style={styles.upNextMetaItem}>
          <MaterialCommunityIcons name="google-classroom" size={12} color={colors.textMuted} />
          <Text style={styles.upNextMetaText}>{period.sectionLabel}</Text>
        </View>
        <Text style={styles.upNextDot}>·</Text>
        <View style={styles.upNextMetaItem}>
          <MaterialCommunityIcons name="counter" size={12} color={colors.textMuted} />
          <Text style={styles.upNextMetaText}>Period {period.periodNum}</Text>
        </View>
        {period.startTime ? (
          <>
            <Text style={styles.upNextDot}>·</Text>
            <View style={styles.upNextMetaItem}>
              <MaterialCommunityIcons name="clock-outline" size={12} color={colors.textMuted} />
              <Text style={styles.upNextMetaText}>{period.startTime}</Text>
            </View>
          </>
        ) : null}
        {period.room ? (
          <>
            <Text style={styles.upNextDot}>·</Text>
            <View style={styles.upNextMetaItem}>
              <MaterialCommunityIcons name="door-open" size={12} color={colors.textMuted} />
              <Text style={styles.upNextMetaText}>{period.room}</Text>
            </View>
          </>
        ) : null}
      </View>
    </Animated.View>
  );
};

const PeriodCard = ({period, index, isCurrentPeriod}) => (
  <Animated.View
    style={[styles.periodCard, isCurrentPeriod && styles.periodCardActive]}>
    <View style={[styles.periodNumBadge, {backgroundColor: `${colors.primary}15`}]}>
      <Text style={[styles.periodNum, {color: colors.primary}]}>P{period.periodNum}</Text>
      {isCurrentPeriod ? (
        <View style={styles.liveDot} />
      ) : null}
    </View>
    <View style={styles.periodInfo}>
      <Text style={styles.periodSubject}>{period.subject}</Text>
      {period.sectionLabel ? (
        <Text style={styles.periodSection}>{period.sectionLabel}</Text>
      ) : null}
      <View style={styles.periodMeta}>
        {period.startTime ? (
          <Text style={styles.periodMetaText}>{period.startTime}{period.endTime ? `–${period.endTime}` : ''}</Text>
        ) : null}
        {period.room ? (
          <Text style={styles.periodMetaText}>{period.room}</Text>
        ) : null}
      </View>
    </View>
  </Animated.View>
);

const DayBlock = ({day, periods, index}) => {
  const dayColor = DAY_COLORS[day] || colors.primary;
  if (periods.length === 0) {return null;}
  return (
    <Animated.View
      style={styles.dayBlock}>
      <View style={[styles.dayHeader, {backgroundColor: `${dayColor}15`, borderLeftColor: dayColor}]}>
        <MaterialCommunityIcons name="calendar-today" size={14} color={dayColor} />
        <Text style={[styles.dayTitle, {color: dayColor}]}>{day}</Text>
        <Text style={styles.dayCount}>{periods.length} period{periods.length !== 1 ? 's' : ''}</Text>
      </View>
      {periods.map((p, i) => (
        <PeriodCard
          key={`${p.day}_${p.periodNum}_${p.sectionId}`}
          period={p}
          index={i}
          isCurrentPeriod={p.isCurrent}
        />
      ))}
    </Animated.View>
  );
};

const TimetableScreen = () => {
  const user = useSelector(state => state.auth.user);
  const teacherId = user?.teacherId || user?.id;
  const branchId = user?.branchId;
  const [selectedDay, setSelectedDay] = useState('All');
  const [downloading, setDownloading] = useState(false);

  const {data: timetables = [], isLoading} = useQuery({
    queryKey: ['teacherTimetable', teacherId, branchId],
    queryFn: () => timetableService.getTimetablesForTeacher(teacherId, branchId),
    enabled: Boolean(teacherId && branchId)});

  // Build periods grouped by day with section labels
  const periodsGroupedByDay = useMemo(() => {
    const grouped = {};
    for (const day of timetableService.DAYS) {grouped[day] = [];}
    for (const tt of timetables) {
      for (const period of tt.periods || []) {
        if (period.subject && period.teacherId === teacherId) {
          grouped[period.day]?.push({
            ...period,
            sectionId: tt.sectionId,
            sectionLabel: `${tt.className} ${tt.sectionName}`});
        }
      }
    }
    for (const day of Object.keys(grouped)) {
      grouped[day].sort((a, b) => a.periodNum - b.periodNum);
    }
    return grouped;
  }, [timetables, teacherId]);

  // Schedule stats
  const stats = useMemo(
    () => timetableService.getTeacherScheduleStats(timetables, teacherId),
    [timetables, teacherId],
  );

  // Mark current period (rough approximation by period number if no startTime)
  const allPeriodsWithCurrent = useMemo(() => {
    if (!stats.todayPeriods.length) {return periodsGroupedByDay;}
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = currentHour * 60 + now.getMinutes();
    const result = {...periodsGroupedByDay};
    result[stats.today] = (result[stats.today] || []).map(p => {
      if (!p.startTime || !p.endTime) {return p;}
      const [sh, sm] = p.startTime.split(':').map(Number);
      const [eh, em] = p.endTime.split(':').map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;
      return {...p, isCurrent: currentMinutes >= start && currentMinutes <= end};
    });
    return result;
  }, [periodsGroupedByDay, stats]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await timetablePdfService.downloadTeacherPDF(timetables, user?.name || 'Teacher', teacherId);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to generate PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const allPeriods = Object.values(periodsGroupedByDay).flat();
  const days = selectedDay === 'All'
    ? timetableService.DAYS.filter(d => periodsGroupedByDay[d]?.length > 0)
    : timetableService.DAYS.filter(d => d === selectedDay);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* ── Hero ── */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.heroRow}>
          <MaterialCommunityIcons name="calendar-clock" size={24} color={colors.white} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>My Timetable</Text>
            <Text style={styles.heroSub}>
              {allPeriods.length} assigned period{allPeriods.length !== 1 ? 's' : ''} this week
            </Text>
          </View>
          {allPeriods.length > 0 ? (
            <Pressable style={styles.pdfBtn} onPress={handleDownloadPDF} disabled={downloading}>
              {downloading
                ? <ActivityIndicator size="small" color={colors.white} />
                : <MaterialCommunityIcons name="file-pdf-box" size={22} color={colors.white} />}
            </Pressable>
          ) : null}
        </View>

        {/* Schedule stats */}
        {allPeriods.length > 0 ? (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.todayPeriods.length}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.weekTotal}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{Math.max(0, stats.freePeriods)}</Text>
              <Text style={styles.statLabel}>Free Periods</Text>
            </View>
          </View>
        ) : null}

        {/* Day filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {['All', ...timetableService.DAYS.map(d => d.slice(0, 3))].map((label, i) => {
            const fullDay = i === 0 ? 'All' : timetableService.DAYS[i - 1];
            const active = selectedDay === fullDay;
            return (
              <View
                key={label}
                style={[styles.chip, active && styles.chipActive]}
                onStartShouldSetResponder={() => true}
                onResponderRelease={() => setSelectedDay(fullDay)}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* ── Up Next card ── */}
      {stats.nextPeriod && selectedDay === 'All' ? (
        <UpNextCard period={stats.nextPeriod} />
      ) : null}

      {/* ── Day blocks ── */}
      {allPeriods.length === 0 ? (
        <EmptyState
          title="No periods assigned"
          message="Your timetable will appear here once the principal has assigned your classes."
        />
      ) : (
        days.map((day, i) => (
          <DayBlock
            key={day}
            day={day}
            periods={allPeriodsWithCurrent[day] || []}
            index={i}
          />
        ))
      )}

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.lg},
  center: {alignItems: 'center', flex: 1, justifyContent: 'center'},

  hero: {
    backgroundColor: colors.secondary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 90,
    height: 160,
    position: 'absolute',
    right: -30,
    top: -50,
    width: 160},
  heroRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md},
  pdfBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.md,
    height: 38,
    justifyContent: 'center',
    width: 38},
  heroCopy: {flex: 1},
  heroTitle: {color: colors.white, fontSize: 18, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2},

  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md},
  statBox: {alignItems: 'center', flex: 1},
  statValue: {color: colors.white, fontSize: 20, fontWeight: '800'},
  statLabel: {color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 2},
  statDivider: {backgroundColor: 'rgba(255,255,255,0.2)', height: 26, width: 1},

  chips: {gap: spacing.sm},
  chip: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs},
  chipActive: {backgroundColor: 'rgba(255,255,255,0.9)'},
  chipText: {color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700'},
  chipTextActive: {color: colors.secondary},

  // ── Up Next ──
  upNextCard: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.lg,
    padding: spacing.md},
  upNextBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3},
  upNextBadgeText: {fontSize: 10, fontWeight: '800', textTransform: 'uppercase'},
  upNextSubject: {...typography.subtitle, color: colors.text, marginBottom: 4},
  upNextMeta: {alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 4},
  upNextMetaItem: {alignItems: 'center', flexDirection: 'row', gap: 3},
  upNextMetaText: {...typography.caption, color: colors.textMuted},
  upNextDot: {color: colors.textSoft, fontSize: 12},

  // ── Day Blocks ──
  dayBlock: {marginBottom: spacing.md},
  dayHeader: {
    alignItems: 'center',
    borderLeftWidth: 3,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm},
  dayTitle: {flex: 1, fontSize: 13, fontWeight: '800'},
  dayCount: {...typography.caption, color: colors.textMuted},

  periodCard: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md},
  periodCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaint},
  periodNumBadge: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 38, width: 38,
    justifyContent: 'center',
    position: 'relative'},
  periodNum: {fontSize: 11, fontWeight: '900'},
  liveDot: {
    backgroundColor: colors.success,
    borderRadius: 4,
    height: 6,
    position: 'absolute',
    right: 2,
    top: 2,
    width: 6},
  periodInfo: {flex: 1},
  periodSubject: {...typography.bodyBold, color: colors.text},
  periodSection: {...typography.caption, color: colors.primary, fontWeight: '700', marginTop: 1},
  periodMeta: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginTop: 2},
  periodMetaText: {...typography.caption, color: colors.textMuted}});

export default TimetableScreen;
