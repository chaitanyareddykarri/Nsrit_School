import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import {EmptyState} from '../../components';
import parentService from '../../services/parents/parentService';
import timetableService from '../../services/timetable/timetableService';
import timetablePdfService from '../../services/timetable/timetablePdfService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SUBJECT_COLORS = [
  colors.primary, colors.secondary, colors.purple, colors.success,
  colors.info, colors.accent, colors.danger, '#6366F1',
];

const subjectColor = subject => {
  if (!subject) {return colors.textSoft;}
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {hash = subject.charCodeAt(i) + ((hash << 5) - hash);}
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
};

const PeriodCard = ({period}) => {
  const isLunch = period.timetableType === 'LUNCH';
  const isBreak = period.timetableType === 'BREAK';
  const color = isLunch ? '#d97706' : isBreak ? '#16a34a' : subjectColor(period.subject);
  const cardBg = isLunch ? '#fefce8' : isBreak ? '#f0fdf4' : colors.surface;
  return (
    <Animated.View>
      <View style={[styles.periodCard, {borderLeftColor: color, borderLeftWidth: 3, backgroundColor: cardBg}]}>
        <View style={[styles.periodNumBadge, {backgroundColor: `${color}15`}]}>
          {isLunch
            ? <MaterialCommunityIcons name="food" size={14} color={color} />
            : isBreak
            ? <MaterialCommunityIcons name="coffee-outline" size={14} color={color} />
            : <Text style={[styles.periodNum, {color}]}>P{period.periodNum}</Text>}
        </View>
        <View style={styles.periodInfo}>
          <Text style={[styles.periodSubject, {color: isLunch || isBreak ? color : colors.text}]}>
            {period.subject}
          </Text>
          {!isLunch && !isBreak && period.teacherName ? (
            <View style={styles.periodMeta}>
              <MaterialCommunityIcons name="account-outline" size={11} color={colors.textMuted} />
              <Text style={styles.periodMetaText}>{period.teacherName}</Text>
            </View>
          ) : null}
          {period.startTime ? (
            <View style={styles.periodMeta}>
              <MaterialCommunityIcons name="clock-outline" size={11} color={colors.textMuted} />
              <Text style={styles.periodMetaText}>
                {period.startTime}{period.endTime ? ` – ${period.endTime}` : ''}
              </Text>
            </View>
          ) : null}
          {!isLunch && !isBreak && period.room ? (
            <View style={styles.periodMeta}>
              <MaterialCommunityIcons name="map-marker-outline" size={11} color={colors.textMuted} />
              <Text style={styles.periodMetaText}>{period.room}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
};

const ParentTimetableScreen = ({navigation}) => {
  const {user} = useSelector(state => state.auth);
  const userId = user?.id;
  const [selectedDay, setSelectedDay] = useState('All');
  const [selectedChildIdx, setSelectedChildIdx] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const {data: dashData, isLoading: loadingChildren, refetch: refetchChildren} = useQuery({
    queryKey: ['parentDashboard', userId],
    queryFn: () => parentService.getParentDashboard(userId),
    enabled: !!userId});

  const children = dashData?.children || [];
  const selectedChild = children[selectedChildIdx] || null;
  const sectionId = selectedChild?.sectionId;

  const {data: timetable, isLoading: loadingTimetable, refetch: refetchTimetable} = useQuery({
    queryKey: ['timetable', sectionId],
    queryFn: () => timetableService.getTimetableForSection(sectionId),
    enabled: !!sectionId});

  const isLoading = loadingChildren || (!!sectionId && loadingTimetable);

  const handleRefresh = () => {
    refetchChildren();
    refetchTimetable();
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await timetablePdfService.downloadParentPDF(
        periods,
        selectedChild?.name || 'Child',
        selectedChild?.className || '',
        selectedChild?.sectionName || '',
      );
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to generate PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const periods = (timetable?.periods || []).filter(p => p.status === 'PUBLISHED');

  const periodsByDay = DAYS_FULL.reduce((acc, day) => {
    const dayPeriods = periods
      .filter(p => p.day === day && p.subject)
      .sort((a, b) => a.periodNum - b.periodNum);
    if (dayPeriods.length > 0) {acc[day] = dayPeriods;}
    return acc;
  }, {});

  const activeDays = DAYS_FULL.filter(d => periodsByDay[d]);
  const displayDays = selectedDay === 'All' ? activeDays : activeDays.filter(d => d === selectedDay);
  const totalPeriods = periods.filter(p => p.subject && p.timetableType !== 'LUNCH' && p.timetableType !== 'BREAK').length;

  const renderDayBlock = ({item: day, index}) => (
    <Animated.View style={styles.dayBlock}>
      <View style={styles.dayHeader}>
        <MaterialCommunityIcons name="calendar-week" size={14} color={colors.primary} />
        <Text style={styles.dayLabel}>{day}</Text>
        <View style={styles.dayCount}>
          <Text style={styles.dayCountText}>{periodsByDay[day].length} periods</Text>
        </View>
      </View>
      {periodsByDay[day].map((period, i) => (
        <PeriodCard key={`${day}-${period.periodNum}`} period={period} index={i} />
      ))}
    </Animated.View>
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={displayDays}
        keyExtractor={d => d}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
        ListHeaderComponent={
          <View>
            <Animated.View style={styles.header}>
              <View style={styles.headerDecor1} />
              <View style={styles.headerDecor2} />
              <View style={styles.headerRow}>
                <MaterialCommunityIcons name="calendar-month" size={22} color={colors.white} />
                <View style={styles.headerCopy}>
                  <Text style={styles.headerTitle}>Class Timetable</Text>
                  <Text style={styles.headerSub}>
                    {selectedChild
                      ? `${selectedChild.name} · ${selectedChild.className || ''} ${selectedChild.sectionName || ''}`
                      : 'Select a child'}
                  </Text>
                </View>
                {isLoading
                  ? <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
                  : periods.length > 0
                  ? (
                    <Pressable style={styles.pdfBtn} onPress={handleDownloadPDF} disabled={downloading}>
                      {downloading
                        ? <ActivityIndicator size="small" color={colors.white} />
                        : <MaterialCommunityIcons name="file-pdf-box" size={22} color={colors.white} />}
                    </Pressable>
                  ) : null}
              </View>

              {/* Child selector when multiple children */}
              {children.length > 1 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.childRow}>
                  {children.map((child, i) => (
                    <Pressable
                      key={child.id}
                      onPress={() => setSelectedChildIdx(i)}
                      style={[styles.childChip, selectedChildIdx === i && styles.childChipActive]}>
                      <Text style={[styles.childChipText, selectedChildIdx === i && styles.childChipTextActive]}>
                        {child.name?.split(' ')[0] || `Child ${i + 1}`}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : null}

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{activeDays.length}</Text>
                  <Text style={styles.statLabel}>School Days</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{totalPeriods}</Text>
                  <Text style={styles.statLabel}>Total Periods</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>
                    {totalPeriods > 0 ? Math.round(totalPeriods / Math.max(activeDays.length, 1)) : 0}
                  </Text>
                  <Text style={styles.statLabel}>Periods/Day</Text>
                </View>
              </View>
            </Animated.View>

            {/* Day filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayFilter}>
              {['All', ...DAYS_SHORT].map((d, i) => {
                const fullDay = i === 0 ? 'All' : DAYS_FULL[i - 1];
                const isActive = selectedDay === fullDay;
                const hasData = fullDay === 'All' || !!periodsByDay[DAYS_FULL[i - 1]];
                return (
                  <Pressable
                    key={d}
                    onPress={() => setSelectedDay(fullDay)}
                    style={[styles.dayFilterChip, isActive && styles.dayFilterChipActive, !hasData && styles.dayFilterChipEmpty]}>
                    <Text style={[styles.dayFilterText, isActive && styles.dayFilterTextActive]}>
                      {d}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        renderItem={renderDayBlock}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title={!sectionId ? 'No section assigned' : 'No timetable yet'}
              message={
                !sectionId
                  ? "Your child's class section hasn't been assigned yet."
                  : 'The school timetable will appear here once the principal sets it up.'
              }
            />
          ) : null
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

  header: {
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  headerDecor1: {backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 80, height: 140, position: 'absolute', right: -20, top: -40, width: 140},
  headerDecor2: {backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 60, bottom: -20, height: 90, left: -10, position: 'absolute', width: 90},
  headerRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md},
  pdfBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36},
  headerCopy: {flex: 1},
  headerTitle: {color: colors.white, fontSize: 20, fontWeight: '800'},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 2},

  childRow: {gap: spacing.sm, marginBottom: spacing.md},
  childChip: {backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs},
  childChipActive: {backgroundColor: 'rgba(255,255,255,0.9)'},
  childChipText: {color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700'},
  childChipTextActive: {color: colors.primary},

  statsRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.md},
  statBox: {alignItems: 'center', flex: 1},
  statValue: {color: colors.white, fontSize: 22, fontWeight: '800'},
  statLabel: {color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 2},
  statDivider: {backgroundColor: 'rgba(255,255,255,0.2)', height: 30, width: 1},

  dayFilter: {gap: spacing.sm, marginBottom: spacing.lg},
  dayFilterChip: {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1.5, paddingHorizontal: spacing.md, paddingVertical: spacing.xs},
  dayFilterChipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  dayFilterChipEmpty: {opacity: 0.4},
  dayFilterText: {color: colors.textMuted, fontSize: 12, fontWeight: '700'},
  dayFilterTextActive: {color: colors.white},

  dayBlock: {marginBottom: spacing.xl},
  dayHeader: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm},
  dayLabel: {...typography.subtitle, color: colors.text, flex: 1},
  dayCount: {backgroundColor: colors.infoSoft, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2},
  dayCountText: {color: colors.info, fontSize: 10, fontWeight: '700'},

  periodCard: {
    backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5,
    flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm, overflow: 'hidden', padding: spacing.md,
    ...shadows.clay},
  periodNumBadge: {alignItems: 'center', borderRadius: radius.sm, justifyContent: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs},
  periodNum: {fontSize: 13, fontWeight: '800'},
  periodInfo: {flex: 1, justifyContent: 'center'},
  periodSubject: {...typography.bodyBold, color: colors.text, fontSize: 14},
  periodMeta: {alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 2},
  periodMetaText: {color: colors.textMuted, fontSize: 11}});

export default ParentTimetableScreen;
