import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, SkeletonLoader} from '../../components';
import DatePickerField from '../../components/forms/DatePickerField';
import attendanceService from '../../services/attendance/attendanceService';
import classService from '../../services/classes/classService';
import sectionService from '../../services/sections/sectionService';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {toISODate, formatDateForDisplay, parseDateString} from '../../utils/helpers/dateHelpers';

const STATUS_META = {
  PRESENT:        {color: colors.success, bg: colors.successSoft,  label: 'Present',  icon: 'check-circle-outline'},
  ABSENT:         {color: colors.danger,  bg: colors.dangerSoft,   label: 'Absent',   icon: 'close-circle-outline'},
  HALF_DAY:       {color: '#F97316',      bg: '#FFF7ED',           label: 'Half Day', icon: 'circle-half-full'},
  LATE:           {color: '#EAB308',      bg: '#FEFCE8',           label: 'Late',     icon: 'clock-alert-outline'},
  MEDICAL_LEAVE:  {color: '#8B5CF6',      bg: '#F5F3FF',           label: 'Medical',  icon: 'medical-bag'},
  APPROVED_LEAVE: {color: '#3B82F6',      bg: '#EFF6FF',           label: 'Approved', icon: 'calendar-check-outline'}};

const ROLE_LABEL = {
  MAIN_ADMIN:  'Main Admin',
  PRINCIPAL:   'Principal',
  BRANCH_ADMIN: 'Branch Admin'};

const ViewAllAttendanceScreen = ({navigation}) => {
  const user              = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const roleKey           = String(user?.role || '').toUpperCase();

  // ── Today — computed fresh (not a stale module constant) ──────────────────
  const todayISO = useMemo(() => toISODate(), []);

  // ── Academic year navigation bounds ──────────────────────────────────────
  // Min: academic year start (can't go before it).
  // Max: the earlier of today and academic year end (can't see future attendance).
  const minDate = activeAcademicYear?.startDate || `${new Date().getFullYear()}-06-01`;
  const maxDate = useMemo(() => {
    const yearEnd = activeAcademicYear?.endDate;
    if (!yearEnd) return todayISO;
    return yearEnd < todayISO ? yearEnd : todayISO;
  }, [activeAcademicYear?.endDate, todayISO]);

  const [step,            setStep]            = useState('class');
  const [selectedClass,   setSelectedClass]   = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedDate,    setSelectedDate]    = useState(todayISO);

  // ── Classes ──────────────────────────────────────────────────────────────
  const classesQuery = useQuery({
    queryKey: ['viewAttClasses', user?.branchId],
    queryFn:  () => classService.getClasses(),
    enabled:  Boolean(user?.branchId)});
  const classes = useMemo(
    () => (classesQuery.data || []).filter(c => !c.branchId || c.branchId === user?.branchId),
    [classesQuery.data, user?.branchId],
  );

  // ── Sections ──────────────────────────────────────────────────────────────
  const sectionsQuery = useQuery({
    queryKey: ['viewAttSections', selectedClass?.id],
    queryFn:  () => sectionService.getSectionsByClass(selectedClass?.id),
    enabled:  Boolean(selectedClass?.id)});
  const sections = useMemo(
    () => (sectionsQuery.data || []).filter(s => s.isActive !== false),
    [sectionsQuery.data],
  );

  // ── Attendance records ────────────────────────────────────────────────────
  const attendanceQuery = useQuery({
    queryKey: ['viewAttRecords', selectedSection?.id, selectedDate],
    queryFn:  () => attendanceService.getAttendance({
      sectionId: selectedSection.id, attendanceDate: selectedDate}),
    enabled: Boolean(selectedSection?.id && selectedDate)});
  const records = useMemo(() => attendanceQuery.data || [], [attendanceQuery.data]);
  const summary = useMemo(
    () => attendanceService.getAttendanceSummary(records),
    [records],
  );

  // ── Date navigation ───────────────────────────────────────────────────────
  // FIX: use parseDateString + toISODate (local date arithmetic) instead of
  // d.toISOString().slice(0,10) which returns UTC and causes timezone skipping.
  const shiftDate = delta => {
    const d = parseDateString(selectedDate);
    if (!d) return;
    d.setDate(d.getDate() + delta);
    const iso = toISODate(d);
    if (minDate && iso < minDate) return;
    if (iso > maxDate) return;
    setSelectedDate(iso);
  };

  const atMinDate = Boolean(minDate && selectedDate <= minDate);
  const atMaxDate = selectedDate >= maxDate;

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
          <Text style={styles.heroOverline}>{ROLE_LABEL[roleKey] || 'Staff'}</Text>
          <Text style={styles.heroTitle}>View Attendance</Text>
          <Text style={styles.heroSub}>Select a class to view submitted attendance</Text>
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
            <View style={[styles.selIcon, {backgroundColor: `${colors.primary}15`}]}>
              <MaterialCommunityIcons name="google-classroom" size={20} color={colors.primary} />
            </View>
            <Text style={styles.selLabel}>{item.name}</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSoft} />
          </Pressable>
        </Animated.View>
      )}
      ListEmptyComponent={
        classesQuery.isLoading ? (
          <SkeletonLoader rows={6} />
        ) : (
          <EmptyState icon="google-classroom" title="No classes found" />
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
            <View style={[styles.selIcon, {backgroundColor: `${colors.info}15`}]}>
              <MaterialCommunityIcons name="account-group-outline" size={20} color={colors.info} />
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
            <Text style={styles.heroSub}>Review and correct teacher submissions</Text>
          </Animated.View>

          {/* ── Date navigator ── */}
          <Animated.View
            style={styles.dateNav}>
            {/* Back arrow */}
            <Pressable
              onPress={() => shiftDate(-1)}
              hitSlop={10}
              disabled={atMinDate}
              style={styles.dateNavBtn}>
              <MaterialCommunityIcons
                name="chevron-left"
                size={22}
                color={atMinDate ? colors.border : colors.primary}
              />
            </Pressable>

            {/* Date display */}
            <View style={styles.dateCenter}>
              <Text style={styles.dateText}>
                {formatDateForDisplay(selectedDate) || selectedDate}
              </Text>
              {selectedDate === todayISO ? (
                <Text style={styles.todayChip}>Today</Text>
              ) : atMinDate ? (
                <Text style={styles.boundaryChip}>Start of year</Text>
              ) : atMaxDate ? (
                <Text style={styles.boundaryChip}>Latest</Text>
              ) : null}
            </View>

            {/* Forward arrow */}
            <Pressable
              onPress={() => shiftDate(1)}
              hitSlop={10}
              disabled={atMaxDate}
              style={styles.dateNavBtn}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={atMaxDate ? colors.border : colors.primary}
              />
            </Pressable>
          </Animated.View>

          {/* ── Calendar date picker ── */}
          <Animated.View>
            <DatePickerField
              label="Jump to Date"
              value={selectedDate}
              onChange={iso => {
                if (!iso) return;
                if (minDate && iso < minDate) return;
                if (iso > maxDate) return;
                setSelectedDate(iso);
              }}
              minimumDate={minDate || undefined}
              maximumDate={maxDate}
            />
          </Animated.View>

          {/* ── Academic year boundary hint ── */}
          {activeAcademicYear ? (
            <Text style={styles.yearHint}>
              Academic year: {formatDateForDisplay(activeAcademicYear.startDate)} – {formatDateForDisplay(activeAcademicYear.endDate)}
            </Text>
          ) : null}

          {/* ── Summary stats ── */}
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

          {/* ── Correct attendance shortcut ── */}
          {records.length > 0 ? (
            <Pressable
              onPress={() => navigation.navigate('EditAttendance')}
              style={({pressed}) => [styles.correctBtn, pressed && {opacity: 0.85}]}>
              <MaterialCommunityIcons name="pencil-circle-outline" size={16} color={colors.warning} />
              <Text style={styles.correctBtnText}>Correct Attendance</Text>
              <MaterialCommunityIcons name="arrow-right" size={14} color={colors.warning} />
            </Pressable>
          ) : null}
        </View>
      }
      renderItem={({item, index}) => {
        const status = String(item.status || 'PRESENT').toUpperCase();
        const meta   = STATUS_META[status] || {color: colors.textMuted, bg: colors.background, label: status, icon: 'help-circle-outline'};
        return (
          <Animated.View>
            <Pressable
              onPress={() => navigation.navigate('EditAttendance')}
              style={({pressed}) => [styles.recordRow, pressed && {opacity: 0.85}]}>
              <View style={[styles.statusIconWrap, {backgroundColor: meta.bg}]}>
                <MaterialCommunityIcons name={meta.icon} size={18} color={meta.color} />
              </View>
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
            </Pressable>
          </Animated.View>
        );
      }}
      ListEmptyComponent={
        attendanceQuery.isLoading ? (
          <SkeletonLoader rows={6} />
        ) : (
          <EmptyState
            icon="clipboard-text-clock"
            title="No attendance submitted"
            message={`No attendance submitted for ${selectedClass?.name}–${selectedSection?.name} on ${formatDateForDisplay(selectedDate) || selectedDate}.`}
          />
        )
      }
      ListFooterComponent={<View style={{height: spacing.xxxl}} />}
    />
  );

  return (
    <View style={styles.root}>
      {step === 'class'      && renderClassStep()}
      {step === 'section'    && renderSectionStep()}
      {step === 'attendance' && renderAttendanceStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

  heroCard: {
    backgroundColor: colors.primary,
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

  backBtn:  {alignItems: 'center', flexDirection: 'row', gap: 6, marginBottom: spacing.md},
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
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...shadows.clay},
  dateNavBtn:    {padding: 4},
  dateCenter:    {alignItems: 'center', gap: 2},
  dateText:      {color: colors.text, fontSize: 14, fontWeight: '800'},
  todayChip:     {color: colors.primary, fontSize: 10, fontWeight: '700'},
  boundaryChip:  {color: colors.textMuted, fontSize: 10, fontWeight: '600'},

  yearHint: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: spacing.sm,
    textAlign: 'center'},

  statsRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
    paddingVertical: spacing.lg,
    ...shadows.clay},
  stat:    {alignItems: 'center', gap: 3},
  statVal: {fontSize: 22, fontWeight: '800'},
  statLbl: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},
  statDiv: {backgroundColor: colors.border, width: 1},

  correctBtn: {
    alignItems: 'center',
    backgroundColor: `${colors.warning}12`,
    borderColor: `${colors.warning}40`,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm},
  correctBtnText: {color: colors.warning, fontSize: 13, fontWeight: '700'},

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
  statusIconWrap: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38},
  rowInfo:     {flex: 1, minWidth: 0},
  rowName:     {...typography.bodyBold, color: colors.text},
  rowMeta:     {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  statusBadge: {borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3},
  statusText:  {fontSize: 10, fontWeight: '800'}});

export default ViewAllAttendanceScreen;
