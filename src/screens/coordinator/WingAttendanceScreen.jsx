import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, SkeletonLoader} from '../../components';
import attendanceService from '../../services/attendance/attendanceService';
import classService from '../../services/classes/classService';
import sectionService from '../../services/sections/sectionService';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {toISODate, formatDateForDisplay} from '../../utils/helpers/dateHelpers';

const STATUS_META = {
  PRESENT:        {color: colors.success, bg: colors.successSoft,  label: 'Present'},
  ABSENT:         {color: colors.danger,  bg: colors.dangerSoft,   label: 'Absent'},
  HALF_DAY:       {color: '#F97316',      bg: '#FFF7ED',           label: 'Half Day'},
  LATE:           {color: '#EAB308',      bg: '#FEFCE8',           label: 'Late'},
  MEDICAL_LEAVE:  {color: '#8B5CF6',      bg: '#F5F3FF',           label: 'Medical'},
  APPROVED_LEAVE: {color: '#3B82F6',      bg: '#EFF6FF',           label: 'Approved'}};

const WingAttendanceScreen = () => {
  const user              = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const wingCode          = user?.wing;
  const todayISO          = useMemo(() => toISODate(), []);
  const ayStartISO        = activeAcademicYear?.startDate || `${new Date().getFullYear()}-06-01`;

  const [step,            setStep]            = useState('class');
  const [selectedClass,   setSelectedClass]   = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedDate,    setSelectedDate]    = useState(() => toISODate());

  // ── Classes (wing-filtered) ───────────────────────────────────────────────
  const classesQuery = useQuery({
    queryKey: ['wingAttClasses', user?.branchId],
    queryFn:  () => classService.getClasses(user?.branchId),
    enabled:  Boolean(user?.branchId)});
  const classes = useMemo(() => {
    const all = classesQuery.data || [];
    return wingCode
      ? all.filter(c => !c.wingCode || c.wingCode === wingCode)
      : all;
  }, [classesQuery.data, wingCode]);

  // ── Sections ──────────────────────────────────────────────────────────────
  const sectionsQuery = useQuery({
    queryKey: ['wingAttSections', selectedClass?.id],
    queryFn:  () => sectionService.getSectionsByClass(selectedClass?.id),
    enabled:  Boolean(selectedClass?.id)});
  const sections = useMemo(
    () => (sectionsQuery.data || []).filter(s => s.isActive !== false),
    [sectionsQuery.data],
  );

  // ── Attendance records ────────────────────────────────────────────────────
  const attendanceQuery = useQuery({
    queryKey: ['wingAttRecords', selectedSection?.id, selectedDate],
    queryFn:  () => attendanceService.getAttendance({
      sectionId: selectedSection.id, attendanceDate: selectedDate}),
    enabled: Boolean(selectedSection?.id && selectedDate)});
  const records = useMemo(() => attendanceQuery.data || [], [attendanceQuery.data]);
  const summary = useMemo(
    () => attendanceService.getAttendanceSummary(records),
    [records],
  );

  // ── Date navigation ───────────────────────────────────────────────────────
  const shiftDate = delta => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    const iso = toISODate(d);
    if (iso >= ayStartISO && iso <= todayISO) { setSelectedDate(iso); }
  };

  // ── STEP: Class list ──────────────────────────────────────────────────────
  const renderClassStep = () => (
    <FlatList
      data={classesQuery.isLoading ? [] : classes}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <Animated.View style={styles.heroCard}>
          <View style={styles.heroDecor} />
          <Text style={styles.heroOverline}>Coordinator · {wingCode || 'Wing'}</Text>
          <Text style={styles.heroTitle}>Wing Attendance</Text>
          <Text style={styles.heroSub}>Select a class to view attendance</Text>
        </Animated.View>
      }
      renderItem={({item, index}) => (
        <Animated.View>
          <Pressable
            onPress={() => {
              setSelectedClass(item);
              setSelectedSection(null);
              setStep('section');
            }}
            style={({pressed}) => [styles.selCard, pressed && {opacity: 0.82}]}>
            <View style={[styles.selIcon, {backgroundColor: `${colors.secondary}18`}]}>
              <MaterialCommunityIcons name="google-classroom" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.selLabel}>{item.name}</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSoft} />
          </Pressable>
        </Animated.View>
      )}
      ListEmptyComponent={
        classesQuery.isLoading ? (
          <SkeletonLoader rows={5} />
        ) : (
          <EmptyState
            icon="google-classroom"
            title="No classes found"
            message="No classes are assigned to your wing yet."
          />
        )
      }
      ListFooterComponent={<View style={{height: spacing.xxxl}} />}
    />
  );

  // ── STEP: Section list ────────────────────────────────────────────────────
  const renderSectionStep = () => (
    <FlatList
      data={sectionsQuery.isLoading ? [] : sections}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          <Pressable onPress={() => setStep('class')} style={styles.backBtn} hitSlop={8}>
            <MaterialCommunityIcons name="arrow-left" size={15} color={colors.primary} />
            <Text style={styles.backText}>Classes</Text>
          </Pressable>
          <Animated.View style={styles.heroCard}>
            <View style={styles.heroDecor} />
            <Text style={styles.heroOverline}>{selectedClass?.name}</Text>
            <Text style={styles.heroTitle}>Select Section</Text>
            <Text style={styles.heroSub}>Choose a section to view attendance</Text>
          </Animated.View>
        </View>
      }
      renderItem={({item, index}) => (
        <Animated.View>
          <Pressable
            onPress={() => { setSelectedSection(item); setStep('attendance'); }}
            style={({pressed}) => [styles.selCard, pressed && {opacity: 0.82}]}>
            <View style={[styles.selIcon, {backgroundColor: `${colors.primary}15`}]}>
              <MaterialCommunityIcons name="account-group-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.selLabel}>
              {selectedClass?.name} – {item.name}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSoft} />
          </Pressable>
        </Animated.View>
      )}
      ListEmptyComponent={
        sectionsQuery.isLoading ? (
          <SkeletonLoader rows={3} />
        ) : (
          <EmptyState
            icon="account-group-outline"
            title="No sections"
            message="No active sections found for this class."
          />
        )
      }
      ListFooterComponent={<View style={{height: spacing.xxxl}} />}
    />
  );

  // ── STEP: Attendance records ──────────────────────────────────────────────
  const renderAttendanceStep = () => (
    <FlatList
      data={records}
      keyExtractor={item => item.id || item.studentId}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          <Pressable onPress={() => setStep('section')} style={styles.backBtn} hitSlop={8}>
            <MaterialCommunityIcons name="arrow-left" size={15} color={colors.primary} />
            <Text style={styles.backText}>{selectedClass?.name} · Sections</Text>
          </Pressable>

          <Animated.View style={styles.heroCard}>
            <View style={styles.heroDecor} />
            <Text style={styles.heroOverline}>
              {selectedClass?.name} – {selectedSection?.name}
            </Text>
            <Text style={styles.heroTitle}>Attendance</Text>
            <Text style={styles.heroSub}>Submitted records for this section</Text>
          </Animated.View>

          {/* Date navigator */}
          <Animated.View
            style={styles.dateNav}>
            <Pressable
              onPress={() => shiftDate(-1)}
              hitSlop={10}
              disabled={selectedDate <= ayStartISO}
              style={styles.dateNavBtn}>
              <MaterialCommunityIcons
                name="chevron-left" size={22}
                color={selectedDate <= ayStartISO ? colors.border : colors.primary} />
            </Pressable>
            <View style={styles.dateCenter}>
              <Text style={styles.dateText}>
                {formatDateForDisplay(selectedDate) || selectedDate}
              </Text>
              {selectedDate === todayISO ? (
                <Text style={styles.todayChip}>Today</Text>
              ) : null}
            </View>
            <Pressable
              onPress={() => shiftDate(1)}
              hitSlop={10}
              disabled={selectedDate >= todayISO}
              style={styles.dateNavBtn}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={selectedDate >= todayISO ? colors.border : colors.primary}
              />
            </Pressable>
          </Animated.View>

          {/* Summary stats */}
          {!attendanceQuery.isLoading && records.length > 0 ? (
            <Animated.View
              style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={[styles.statVal, {color: colors.success}]}>
                  {summary.present || 0}
                </Text>
                <Text style={styles.statLbl}>Present</Text>
              </View>
              <View style={styles.statDiv} />
              <View style={styles.stat}>
                <Text style={[styles.statVal, {color: colors.danger}]}>
                  {summary.absent || 0}
                </Text>
                <Text style={styles.statLbl}>Absent</Text>
              </View>
              <View style={styles.statDiv} />
              <View style={styles.stat}>
                <Text style={[styles.statVal, {color: colors.text}]}>
                  {records.length}
                </Text>
                <Text style={styles.statLbl}>Total</Text>
              </View>
              <View style={styles.statDiv} />
              <View style={styles.stat}>
                <Text style={[styles.statVal, {color: colors.primary}]}>
                  {summary.percentage || 0}%
                </Text>
                <Text style={styles.statLbl}>Rate</Text>
              </View>
            </Animated.View>
          ) : null}
        </View>
      }
      renderItem={({item, index}) => {
        const status = String(item.status || 'PRESENT').toUpperCase();
        const meta   = STATUS_META[status] || {color: colors.textMuted, bg: colors.background, label: status};
        return (
          <Animated.View
            style={styles.recordRow}>
            <View style={[styles.statusDot, {backgroundColor: meta.color}]} />
            <View style={styles.rowInfo}>
              <Text style={styles.rowName} numberOfLines={1}>
                {item.student?.fullName || 'Student'}
              </Text>
              <Text style={styles.rowMeta}>
                {item.student?.studentId || item.studentId || '—'}
              </Text>
            </View>
            <View style={[styles.statusBadge, {backgroundColor: meta.bg}]}>
              <Text style={[styles.statusText, {color: meta.color}]}>{meta.label}</Text>
            </View>
          </Animated.View>
        );
      }}
      ListEmptyComponent={
        attendanceQuery.isLoading ? (
          <SkeletonLoader rows={6} />
        ) : (
          <EmptyState
            icon="clipboard-text-outline"
            title="No attendance found"
            message={`No attendance submitted for ${selectedClass?.name}–${selectedSection?.name} on ${formatDateForDisplay(selectedDate) || selectedDate}.`}
          />
        )
      }
      ListFooterComponent={<View style={{height: spacing.xxxl}} />}
    />
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {step === 'class'      && renderClassStep()}
      {step === 'section'    && renderSectionStep()}
      {step === 'attendance' && renderAttendanceStep()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

  heroCard: {
    backgroundColor: colors.secondary,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130},
  heroOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 4},
  heroSub:   {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500'},

  backBtn: {alignItems: 'center', flexDirection: 'row', gap: 6, marginBottom: spacing.md},
  backText: {color: colors.primary, fontSize: 13, fontWeight: '700'},

  selCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.clay},
  selIcon:  {alignItems: 'center', borderRadius: radius.lg, height: 44, justifyContent: 'center', width: 44},
  selLabel: {...typography.bodyBold, color: colors.text, flex: 1},

  dateNav: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...shadows.clay},
  dateNavBtn: {padding: 4},
  dateCenter: {alignItems: 'center', gap: 2},
  dateText:   {color: colors.text, fontSize: 14, fontWeight: '800'},
  todayChip:  {color: colors.primary, fontSize: 10, fontWeight: '700'},

  statsRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    paddingVertical: spacing.lg,
    ...shadows.clay},
  stat:    {alignItems: 'center', gap: 3},
  statVal: {fontSize: 22, fontWeight: '800'},
  statLbl: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},
  statDiv: {backgroundColor: colors.border, width: 1},

  recordRow: {
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
  statusDot:   {borderRadius: radius.pill, height: 10, width: 10},
  rowInfo:     {flex: 1, minWidth: 0},
  rowName:     {...typography.bodyBold, color: colors.text},
  rowMeta:     {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  statusBadge: {borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3},
  statusText:  {fontSize: 10, fontWeight: '800'}});

export default WingAttendanceScreen;
