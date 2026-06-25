import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, Modal, Pressable, ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  ConfirmationModal,
  EmptyState,
  SearchBar,
  SelectField,
  StudentListItem} from '../../components';
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_ICONS,
  ATTENDANCE_STATUS_LABELS,
  TEACHER_MARKABLE_STATUSES,
  USER_ROLES} from '../../config/constants';
import attendanceService from '../../services/attendance/attendanceService';
import {attendanceAuditService} from '../../services/audit/attendanceAuditService';
import classService from '../../services/classes/classService';
import holidayService from '../../services/holidays/holidayService';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatDateForDisplay, toISODate} from '../../utils/helpers/dateHelpers';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const STEP_DATE       = 0;
const STEP_CLASS      = 1;
const STEP_SECTION    = 2;
const STEP_RECORDS    = 3;

// ── Status selector dropdown ──────────────────────────────────────────────────
const StatusPicker = ({value, onChange}) => {
  const [open, setOpen] = useState(false);
  const color = ATTENDANCE_STATUS_COLORS[value] || '#94A3B8';
  const icon  = ATTENDANCE_STATUS_ICONS[value]  || 'help-circle-outline';
  const label = ATTENDANCE_STATUS_LABELS[value] || value;
  return (
    <View>
      <Pressable
        onPress={() => setOpen(o => !o)}
        style={[sp.trigger, {borderColor: `${color}55`, backgroundColor: `${color}10`}]}>
        <MaterialCommunityIcons name={icon} size={14} color={color} />
        <Text style={[sp.triggerText, {color}]}>{label}</Text>
        <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={color} />
      </Pressable>
      {open ? (
        <View style={sp.dropdown}>
          {TEACHER_MARKABLE_STATUSES.map(s => {
            const c  = ATTENDANCE_STATUS_COLORS[s];
            const ic = ATTENDANCE_STATUS_ICONS[s];
            const lb = ATTENDANCE_STATUS_LABELS[s];
            const active = s === value;
            return (
              <Pressable key={s} onPress={() => { onChange(s); setOpen(false); }}
                style={[sp.option, active && {backgroundColor: `${c}15`}]}>
                <MaterialCommunityIcons name={ic} size={13} color={c} />
                <Text style={[sp.optLabel, {color: active ? c : colors.text}]}>{lb}</Text>
                {active ? <MaterialCommunityIcons name="check" size={13} color={c} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

// ── Month calendar for date selection ─────────────────────────────────────────
const MonthCalendar = ({value, onChange, minDate, maxDate, holidayDates = {}}) => {
  const anchor = value ? new Date(value + 'T00:00:00') : new Date();
  const [vy, setVy] = useState(anchor.getFullYear());
  const [vm, setVm] = useState(anchor.getMonth());
  const todayMid = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
  const first       = new Date(vy, vm, 1).getDay();
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) { cells.push(null); }
  for (let d = 1; d <= daysInMonth; d++) { cells.push(d); }
  const isoOf = d => `${vy}-${String(vm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const isSelectable = d => {
    if (!d) { return false; }
    const iso  = isoOf(d);
    const date = new Date(vy, vm, d);
    if (date.getDay() === 0) { return false; }
    if (holidayDates[iso]) { return false; }
    if (minDate && iso < minDate) { return false; }
    if (maxDate && iso > maxDate) { return false; }
    if (date > todayMid) { return false; }
    return true;
  };
  const prevMon = () => vm === 0 ? (setVy(y => y - 1), setVm(11)) : setVm(m => m - 1);
  const nextMon = () => vm === 11 ? (setVy(y => y + 1), setVm(0)) : setVm(m => m + 1);
  const atMax = maxDate && new Date(vy, vm + 1, 1) > new Date(maxDate + 'T00:00:00');
  const atMin = minDate && new Date(vy, vm, 1) < new Date(minDate + 'T00:00:00');
  const viewYM = `${vy}-${String(vm + 1).padStart(2, '0')}`;
  return (
    <View style={mc.wrap}>
      <View style={mc.nav}>
        <Pressable onPress={prevMon} disabled={atMin} hitSlop={8}
          style={[mc.navBtn, atMin && mc.navBtnDis]}>
          <MaterialCommunityIcons name="chevron-left" size={18}
            color={atMin ? colors.border : colors.primary} />
        </Pressable>
        <Text style={mc.navTitle}>{MONTHS[vm]} {vy}</Text>
        <Pressable onPress={nextMon} disabled={atMax} hitSlop={8}
          style={[mc.navBtn, atMax && mc.navBtnDis]}>
          <MaterialCommunityIcons name="chevron-right" size={18}
            color={atMax ? colors.border : colors.primary} />
        </Pressable>
      </View>
      <View style={mc.grid}>
        {DAYS.map(d => (
          <Text key={d} style={[mc.dayLabel, d === 'Su' && mc.dayLabelSun]}>{d}</Text>
        ))}
        {cells.map((d, i) => {
          if (!d) { return <View key={i} style={mc.cellWrap} />; }
          const iso = isoOf(d);
          const sel = iso === value;
          const ok  = isSelectable(d);
          const isSun = new Date(vy, vm, d).getDay() === 0;
          const isHol = Boolean(holidayDates[iso]);
          return (
            <View key={i} style={mc.cellWrap}>
              <Pressable onPress={() => ok && onChange(iso)} disabled={!ok}
                style={[mc.cell, !ok && mc.cellDis, isSun && mc.cellSun, isHol && mc.cellHol, sel && mc.cellSel]}>
                <Text style={[mc.cellText, !ok && mc.cellTextDis, isSun && mc.cellTextSun, isHol && mc.cellTextHol, sel && mc.cellTextSel]}>
                  {d}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
      {/* Holiday legend */}
      {Object.keys(holidayDates).some(k => k.startsWith(viewYM)) ? (
        <View style={mc.holidayHint}>
          <View style={[mc.legendDot, {backgroundColor: '#F97316'}]} />
          <Text style={mc.legendText}>Holiday — attendance not editable</Text>
        </View>
      ) : null}
    </View>
  );
};

// ── Audit log modal ────────────────────────────────────────────────────────────
const AuditLogModal = ({visible, attendanceId, onClose}) => {
  const logQuery = useQuery({
    queryKey: ['attendanceAuditLog', attendanceId],
    queryFn:  () => attendanceAuditService.getAuditLog(attendanceId),
    enabled:  Boolean(visible && attendanceId),
    staleTime: 60 * 1000});
  const logs = logQuery.data || [];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={al.overlay} onPress={onClose}>
        <View style={al.sheet}>
          <View style={al.header}>
            <Text style={al.title}>Edit History</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
          {logQuery.isLoading ? (
            <Text style={al.emptyText}>Loading…</Text>
          ) : !logs.length ? (
            <Text style={al.emptyText}>No edit history for this record.</Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {logs.map((log, idx) => (
                <View key={log.id || idx} style={al.logRow}>
                  <View style={al.logDot} />
                  <View style={al.logBody}>
                    <Text style={al.logTitle}>
                      {ATTENDANCE_STATUS_LABELS[log.previousStatus] || log.previousStatus}
                      {' → '}
                      {ATTENDANCE_STATUS_LABELS[log.newStatus] || log.newStatus}
                    </Text>
                    <Text style={al.logMeta}>
                      By {log.editedByRole} · {log.editedAt ? new Date(log.editedAt).toLocaleString() : '—'}
                    </Text>
                    {Boolean(log.reason) ? <Text style={al.logReason}>Reason: {log.reason}</Text> : null}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

// ── Main screen ────────────────────────────────────────────────────────────────
const EditAttendanceScreen = () => {
  const user              = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const scope             = useMemo(() => getAccessScope(user), [user]);
  const queryClient       = useQueryClient();
  const role              = String(user?.role || '').toUpperCase();
  const isCoordinator     = role === USER_ROLES.COORDINATOR;
  const today             = useMemo(() => toISODate(), []);

  const [step,              setStep]              = useState(STEP_DATE);
  const [selectedDate,      setSelectedDate]      = useState(today);
  const [selectedClassId,   setSelectedClassId]   = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [statuses,          setStatuses]          = useState({});
  const [reasons,           setReasons]           = useState({});
  const [query,             setQuery]             = useState('');
  const [error,             setError]             = useState('');
  const [confirmVisible,    setConfirmVisible]    = useState(false);
  const [auditAttId,        setAuditAttId]        = useState(null);

  const ayStart = activeAcademicYear?.startDate || `${new Date().getFullYear()}-06-01`;
  const ayEnd   = activeAcademicYear?.endDate   || today;

  // ── Data queries ──────────────────────────────────────────────────────────
  // Holiday map for the full academic year — blocks selection of holiday dates in the calendar
  const holidayYearQuery = useQuery({
    queryKey: ['editHolidayYear', user?.branchId, ayStart, ayEnd],
    queryFn:  async () => {
      const list = await holidayService.getHolidaysByBranch(user?.branchId, ayStart, ayEnd);
      return (list || []).reduce((acc, h) => { acc[h.date] = h; return acc; }, {});
    },
    enabled:  Boolean(user?.branchId),
    staleTime: 15 * 60 * 1000});
  const holidayDates = useMemo(() => holidayYearQuery.data || {}, [holidayYearQuery.data]);
  const classesQuery = useQuery({
    queryKey: ['coordClasses', user?.branchId],
    queryFn:  () => classService.getClasses(),
    enabled:  Boolean(user?.branchId && step >= STEP_CLASS)});
  const branchClasses = useMemo(() => {
    const all = classesQuery.data || [];
    if (isCoordinator && scope?.wingCode) {
      return all.filter(c => c.wingCode === scope.wingCode || !c.wingCode);
    }
    return all.filter(c => !c.branchId || c.branchId === user?.branchId);
  }, [classesQuery.data, isCoordinator, scope?.wingCode, user?.branchId]);

  const sectionsQuery = useQuery({
    queryKey: ['coordSections', selectedClassId],
    queryFn:  () => sectionService.getSectionsByClass(selectedClassId),
    enabled:  Boolean(selectedClassId && step >= STEP_SECTION)});
  const sections = useMemo(() => sectionsQuery.data || [], [sectionsQuery.data]);

  const selectedClass   = branchClasses.find(c => c.id === selectedClassId)  || null;
  const selectedSection = sections.find(s => s.id === selectedSectionId)     || null;

  const studentsQuery = useQuery({
    queryKey: ['coordEditStudents', selectedSectionId],
    queryFn:  () => studentService.getStudentsBySection(selectedSectionId),
    enabled:  Boolean(selectedSectionId && step === STEP_RECORDS)});
  const attendanceQuery = useQuery({
    queryKey: ['coordEditAttendance', selectedSectionId, selectedDate],
    queryFn:  () => attendanceService.getSectionAttendanceMap({
      sectionId: selectedSectionId, attendanceDate: selectedDate}),
    enabled: Boolean(selectedSectionId && selectedDate && step === STEP_RECORDS)});

  const students    = useMemo(() => studentsQuery.data || [],   [studentsQuery.data]);
  const existingMap = useMemo(() => attendanceQuery.data || {}, [attendanceQuery.data]);

  useEffect(() => {
    if (!students.length || !Object.keys(existingMap).length) { return; }
    setStatuses(students.reduce((acc, s) => ({
      ...acc, [s.id]: existingMap[s.id]?.status || ATTENDANCE_STATUS.PRESENT}), {}));
    setReasons({});
  }, [existingMap, students]);

  const visibleStudents = useMemo(
    () => students.filter(s =>
      `${s.fullName} ${s.studentId}`.toLowerCase().includes(query.toLowerCase()),
    ),
    [query, students],
  );

  const isWingBlocked = useMemo(() => {
    if (!isCoordinator || !scope?.wingCode || !selectedClass) { return false; }
    return Boolean(selectedClass.wingCode && selectedClass.wingCode !== scope.wingCode);
  }, [isCoordinator, scope?.wingCode, selectedClass]);

  // ── Save mutation ─────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedClass || !selectedSection) {
        throw new Error('Class and section must be selected.');
      }
      const changed = students.filter(s =>
        statuses[s.id] && statuses[s.id] !== existingMap[s.id]?.status,
      );
      if (!changed.length) {
        throw new Error('No changes detected. Modify at least one student\'s attendance status.');
      }
      const missing = changed.filter(s => !reasons[s.id]?.trim());
      if (missing.length) {
        throw new Error(
          `Reason required for: ${missing.map(s => s.fullName.split(' ')[0]).join(', ')}`,
        );
      }
      for (const student of changed) {
        const existing = existingMap[student.id];
        await attendanceService.correctAttendance({
          attendanceId:   existing.id,
          actorRole:      role,
          scope,
          records: [{
            studentId:  student.id,
            status:     statuses[student.id],
            editedById: user.id,
            reason:     reasons[student.id].trim(),
            remarks:    null}],
          attendanceDate:  selectedDate,
          sectionId:       selectedSection.id,
          previousStatus:  existing.status || '',
          branchId:        user.branchId,
          academicYearId:  scope?.academicYearId || null});
      }
      return changed.length;
    },
    onSuccess: () => {
      setError('');
      setReasons({});
      queryClient.invalidateQueries({queryKey: ['coordEditAttendance', selectedSectionId, selectedDate]});
      queryClient.invalidateQueries({queryKey: ['sectionAttendance', selectedSectionId, selectedDate]});
      queryClient.invalidateQueries({queryKey: ['sectionMonthMap', selectedSectionId]});
      queryClient.invalidateQueries({queryKey: ['parentAttendance']});
      queryClient.invalidateQueries({queryKey: ['parentAttendanceYear']});
      queryClient.invalidateQueries({queryKey: ['branchAttendance']});
    },
    onError: err => setError(err.message || 'Unable to save corrections.')});

  const changedCount = students.filter(s =>
    statuses[s.id] && statuses[s.id] !== existingMap[s.id]?.status,
  ).length;

  // ── Step indicator ────────────────────────────────────────────────────────
  const StepIndicator = () => (
    <View style={styles.stepRow}>
      {['Date', 'Class', 'Section', 'Records'].map((label, idx) => {
        const active = step === idx;
        const done   = step > idx;
        return (
          <Pressable key={label} onPress={() => (done || active) ? setStep(idx) : null}
            style={styles.stepItem}>
            <View style={[styles.stepDot, active && styles.stepDotActive, done && styles.stepDotDone]}>
              {done
                ? <MaterialCommunityIcons name="check" size={10} color={colors.white} />
                : <Text style={[styles.stepNum, active && styles.stepNumActive]}>{idx + 1}</Text>}
            </View>
            <Text style={[styles.stepLabel, (active || done) && styles.stepLabelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  // ── Step renders ──────────────────────────────────────────────────────────
  const renderDate = () => (
    <Animated.View style={styles.card}>
      <Text style={styles.cardTitle}>Select Date to Edit</Text>
      <Text style={styles.cardSub}>Correct attendance for any past date within this academic year.</Text>
      <MonthCalendar
        value={selectedDate}
        onChange={v => { setSelectedDate(v); setStatuses({}); setReasons({}); }}
        minDate={ayStart}
        maxDate={today}
        holidayDates={holidayDates}
      />
      <View style={styles.selectedDatePill}>
        <MaterialCommunityIcons name="calendar-check" size={14} color={colors.primary} />
        <Text style={styles.selectedDateText}>
          {selectedDate === today ? 'Today — ' : ''}
          {formatDateForDisplay(selectedDate) || selectedDate}
        </Text>
      </View>
      <Pressable onPress={() => setStep(STEP_CLASS)} disabled={!selectedDate}
        style={[styles.nextBtn, !selectedDate && styles.nextBtnDis]}>
        <Text style={styles.nextBtnText}>Next — Choose Class</Text>
        <MaterialCommunityIcons name="arrow-right" size={16} color={colors.white} />
      </Pressable>
    </Animated.View>
  );

  const renderClass = () => {
    const classOptions = branchClasses.map(c => ({label: c.name, value: c.id}));
    return (
      <Animated.View style={styles.card}>
        <Pressable onPress={() => setStep(STEP_DATE)} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={14} color={colors.primary} />
          <Text style={styles.backText}>{formatDateForDisplay(selectedDate) || selectedDate}</Text>
        </Pressable>
        <Text style={styles.cardTitle}>Select Class</Text>
        <SelectField
          label="Class"
          value={selectedClassId}
          options={classOptions}
          onChange={v => { setSelectedClassId(v); setSelectedSectionId(''); setStatuses({}); setReasons({}); }}
        />
        {isCoordinator && scope?.wingCode ? (
          <View style={styles.wingChip}>
            <MaterialCommunityIcons name="domain" size={12} color={colors.primary} />
            <Text style={styles.wingText}>Showing classes for wing: {scope.wingCode}</Text>
          </View>
        ) : null}
        <Pressable onPress={() => setStep(STEP_SECTION)} disabled={!selectedClassId}
          style={[styles.nextBtn, !selectedClassId && styles.nextBtnDis]}>
          <Text style={styles.nextBtnText}>Next — Choose Section</Text>
          <MaterialCommunityIcons name="arrow-right" size={16} color={colors.white} />
        </Pressable>
      </Animated.View>
    );
  };

  const renderSection = () => {
    const sectionOptions = sections.map(s => ({label: s.name, value: s.id}));
    return (
      <Animated.View style={styles.card}>
        <Pressable onPress={() => setStep(STEP_CLASS)} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={14} color={colors.primary} />
          <Text style={styles.backText}>{branchClasses.find(c => c.id === selectedClassId)?.name || 'Class'}</Text>
        </Pressable>
        <Text style={styles.cardTitle}>Select Section</Text>
        <SelectField
          label="Section"
          value={selectedSectionId}
          options={sectionOptions}
          disabled={!sectionOptions.length}
          onChange={v => { setSelectedSectionId(v); setStatuses({}); setReasons({}); }}
        />
        {isWingBlocked ? (
          <View style={styles.wingBlock}>
            <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.danger} />
            <Text style={styles.wingBlockText}>
              This section is outside your wing ({scope.wingCode}). You cannot edit it.
            </Text>
          </View>
        ) : null}
        <Pressable
          onPress={() => setStep(STEP_RECORDS)}
          disabled={!selectedSectionId || isWingBlocked}
          style={[styles.nextBtn, (!selectedSectionId || isWingBlocked) && styles.nextBtnDis]}>
          <Text style={styles.nextBtnText}>Load Attendance Records</Text>
          <MaterialCommunityIcons name="arrow-right" size={16} color={colors.white} />
        </Pressable>
      </Animated.View>
    );
  };

  const renderRecords = () => {
    const isLoading = studentsQuery.isLoading || attendanceQuery.isLoading;
    const noRecords = !isLoading && !Object.keys(existingMap).length && students.length > 0;
    return (
      <View>
        <Animated.View style={styles.contextBar}>
          <Pressable onPress={() => setStep(STEP_SECTION)} hitSlop={8}>
            <MaterialCommunityIcons name="arrow-left" size={16} color={colors.primary} />
          </Pressable>
          <MaterialCommunityIcons name="pencil-circle" size={14} color={colors.primary} />
          <Text style={styles.contextText} numberOfLines={1}>
            {selectedClass?.name} – {selectedSection?.name} · {formatDateForDisplay(selectedDate) || selectedDate}
          </Text>
        </Animated.View>

        {noRecords ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="alert-circle-outline" size={32} color={colors.warning} />
            <Text style={styles.emptyTitle}>No Attendance Found</Text>
            <Text style={styles.emptySub}>
              No attendance was submitted for this section on{' '}
              {formatDateForDisplay(selectedDate) || selectedDate}.
              {'\n'}Only submitted attendance can be corrected.
            </Text>
          </View>
        ) : (
          <>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Search student" />
            {changedCount > 0 ? (
              <View style={styles.changeBadge}>
                <MaterialCommunityIcons name="pencil-circle-outline" size={13} color={colors.primary} />
                <Text style={styles.changeBadgeText}>
                  {changedCount} change{changedCount !== 1 ? 's' : ''} pending
                </Text>
              </View>
            ) : (
              <Text style={styles.tapHint}>Change a status then fill in a reason to save.</Text>
            )}
            {visibleStudents.map(item => {
              const existing  = existingMap[item.id];
              const curStatus = statuses[item.id] || existing?.status || ATTENDANCE_STATUS.PRESENT;
              const changed   = curStatus !== existing?.status;
              return (
                <View key={item.id} style={[styles.recordRow, changed && styles.recordRowChanged]}>
                  <StudentListItem
                    student={{id: item.id, name: item.fullName, rollNo: item.studentId}}
                    status={curStatus}
                    right={
                      <View style={styles.rightCol}>
                        <StatusPicker
                          value={curStatus}
                          onChange={s => setStatuses(cur => ({...cur, [item.id]: s}))}
                        />
                        {existing?.id ? (
                          <Pressable onPress={() => setAuditAttId(existing.id)}
                            style={styles.histBtn} hitSlop={6}>
                            <MaterialCommunityIcons name="history" size={13} color={colors.textMuted} />
                            <Text style={styles.histText}>History</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    }
                  />
                  {changed ? (
                    <View style={styles.reasonRow}>
                      <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.warning} />
                      <TextInput
                        value={reasons[item.id] || ''}
                        onChangeText={v => setReasons(cur => ({...cur, [item.id]: v}))}
                        placeholder="Reason for change (required)"
                        placeholderTextColor={colors.textMuted}
                        style={styles.reasonInput}
                        maxLength={200}
                      />
                    </View>
                  ) : null}
                </View>
              );
            })}
            {!visibleStudents.length && !isLoading ? <EmptyState title="No students found" /> : null}
          </>
        )}

        {Boolean(error) ? (
          <Animated.View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        ) : null}

        {!noRecords ? (
          <Pressable
            onPress={() => setConfirmVisible(true)}
            disabled={mutation.isPending || changedCount === 0}
            style={[styles.saveBtn, (mutation.isPending || changedCount === 0) && styles.saveBtnDis]}>
            <MaterialCommunityIcons
              name={mutation.isPending ? 'loading' : 'content-save-check-outline'}
              size={16} color={colors.white} />
            <Text style={styles.saveBtnText}>
              {mutation.isPending
                ? 'Saving…'
                : `Save ${changedCount} Correction${changedCount !== 1 ? 's' : ''}`}
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StepIndicator />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {step === STEP_DATE    && renderDate()}
        {step === STEP_CLASS   && renderClass()}
        {step === STEP_SECTION && renderSection()}
        {step === STEP_RECORDS && renderRecords()}
        <View style={{height: 80}} />
      </ScrollView>

      <ConfirmationModal
        visible={confirmVisible}
        title="Save Corrections?"
        message={`Save ${changedCount} attendance correction${changedCount !== 1 ? 's' : ''} for ${formatDateForDisplay(selectedDate)}?\n\nAn audit log entry will be created for each change.`}
        confirmLabel="Yes, Save Corrections"
        cancelLabel="Cancel"
        onConfirm={() => { setConfirmVisible(false); mutation.mutate(); }}
        onCancel={() => setConfirmVisible(false)}
      />

      <AuditLogModal
        visible={Boolean(auditAttId)}
        attendanceId={auditAttId}
        onClose={() => setAuditAttId(null)}
      />
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:    {backgroundColor: colors.background, flex: 1},
  content: {padding: spacing.lg, paddingBottom: 8},

  stepRow:       {backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.sm},
  stepItem:      {alignItems: 'center', gap: 4},
  stepDot:       {alignItems: 'center', backgroundColor: colors.border, borderRadius: 12, height: 24, justifyContent: 'center', width: 24},
  stepDotActive: {backgroundColor: colors.primary},
  stepDotDone:   {backgroundColor: colors.success},
  stepNum:       {color: colors.textMuted, fontSize: 11, fontWeight: '700'},
  stepNumActive: {color: colors.white},
  stepLabel:     {color: colors.textMuted, fontSize: 10, fontWeight: '600'},
  stepLabelActive:{color: colors.primary, fontWeight: '700'},

  card:     {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, padding: spacing.lg, ...shadows.clay},
  cardTitle:{color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 4},
  cardSub:  {color: colors.textMuted, fontSize: 12, fontWeight: '500', lineHeight: 18, marginBottom: spacing.md},

  selectedDatePill: {alignItems: 'center', backgroundColor: `${colors.primary}12`, borderRadius: radius.pill, flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: spacing.md, paddingVertical: spacing.sm},
  selectedDateText: {color: colors.primary, fontSize: 13, fontWeight: '700'},

  nextBtn:    {alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.lg, flexDirection: 'row', gap: spacing.sm, height: 46, justifyContent: 'center', marginTop: spacing.lg},
  nextBtnDis: {backgroundColor: colors.border},
  nextBtnText:{color: colors.white, fontSize: 14, fontWeight: '700'},
  backBtn:    {alignItems: 'center', flexDirection: 'row', gap: 4, marginBottom: spacing.md},
  backText:   {color: colors.primary, fontSize: 13, fontWeight: '600'},

  wingChip:     {alignItems: 'center', backgroundColor: `${colors.primary}10`, borderRadius: radius.pill, flexDirection: 'row', gap: 5, marginTop: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: 4, alignSelf: 'flex-start'},
  wingText:     {color: colors.primary, fontSize: 11, fontWeight: '600'},
  wingBlock:    {alignItems: 'center', backgroundColor: `${colors.danger}10`, borderRadius: radius.sm, flexDirection: 'row', gap: 5, marginTop: spacing.sm, padding: spacing.sm},
  wingBlockText:{color: colors.danger, flex: 1, fontSize: 11, fontWeight: '600'},

  contextBar: {alignItems: 'center', backgroundColor: `${colors.primary}10`, borderRadius: radius.sm, flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, padding: spacing.sm},
  contextText:{color: colors.primary, flex: 1, fontSize: 12, fontWeight: '700'},

  emptyCard:  {alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, gap: spacing.sm, marginTop: spacing.md, padding: spacing.xl},
  emptyTitle: {color: colors.text, fontSize: 15, fontWeight: '800'},
  emptySub:   {color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center'},

  changeBadge:     {alignItems: 'center', backgroundColor: `${colors.primary}12`, borderRadius: radius.pill, flexDirection: 'row', gap: 5, marginBottom: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: 4, alignSelf: 'flex-start'},
  changeBadgeText: {color: colors.primary, fontSize: 11, fontWeight: '700'},
  tapHint:         {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginBottom: spacing.sm},

  recordRow:        {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, marginBottom: spacing.sm, overflow: 'hidden'},
  recordRowChanged: {borderColor: `${colors.primary}55`, borderWidth: 2},
  rightCol:         {alignItems: 'flex-end', gap: 4},
  histBtn:          {alignItems: 'center', flexDirection: 'row', gap: 3},
  histText:         {color: colors.textMuted, fontSize: 10, fontWeight: '600'},
  reasonRow:        {alignItems: 'center', borderTopColor: `${colors.primary}30`, borderTopWidth: 1, flexDirection: 'row', gap: 6, padding: spacing.sm},
  reasonInput:      {color: colors.text, flex: 1, fontSize: 12, fontWeight: '500'},

  errorBanner: {alignItems: 'center', backgroundColor: `${colors.danger}12`, borderRadius: radius.sm, flexDirection: 'row', gap: 6, marginBottom: spacing.sm, padding: spacing.sm},
  errorText:   {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},

  saveBtn:     {alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.lg, flexDirection: 'row', gap: spacing.sm, height: 46, justifyContent: 'center', marginTop: spacing.sm},
  saveBtnDis:  {backgroundColor: colors.border},
  saveBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'}});

const mc = StyleSheet.create({
  wrap:        {backgroundColor: colors.background, borderRadius: radius.card, marginTop: spacing.sm, padding: spacing.sm},
  nav:         {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm},
  navBtn:      {padding: 4},
  navBtnDis:   {opacity: 0.3},
  navTitle:    {color: colors.text, fontSize: 14, fontWeight: '800'},
  grid:        {flexDirection: 'row', flexWrap: 'wrap'},
  dayLabel:    {color: colors.textMuted, fontSize: 11, fontWeight: '700', paddingBottom: 4, textAlign: 'center', width: '14.28%'},
  dayLabelSun: {color: '#FCA5A5'},
  cellWrap:    {alignItems: 'center', paddingBottom: 3, width: '14.28%'},
  cell:        {alignItems: 'center', aspectRatio: 1, borderRadius: 100, justifyContent: 'center', width: '100%'},
  cellDis:      {opacity: 0.25},
  cellSun:      {backgroundColor: 'rgba(252,165,165,0.2)'},
  cellHol:      {backgroundColor: 'rgba(249,115,22,0.18)', borderColor: '#F97316', borderWidth: 1},
  cellSel:      {backgroundColor: colors.primary},
  cellText:     {color: colors.text, fontSize: 13, fontWeight: '600'},
  cellTextDis:  {color: colors.textMuted},
  cellTextSun:  {color: '#FCA5A5'},
  cellTextHol:  {color: '#C2410C', fontWeight: '700'},
  cellTextSel:  {color: colors.white, fontWeight: '800'},
  holidayHint:  {alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: spacing.xs},
  legendDot:    {borderRadius: 3, height: 6, width: 6},
  legendText:   {color: colors.textMuted, fontSize: 10, fontWeight: '600'}});

const sp = StyleSheet.create({
  trigger:     {alignItems: 'center', borderRadius: radius.pill, borderWidth: 1.5, flexDirection: 'row', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 4},
  triggerText: {fontSize: 11, fontWeight: '700'},
  dropdown:    {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, marginTop: 3, ...shadows.clay, zIndex: 999},
  option:      {alignItems: 'center', flexDirection: 'row', gap: 8, padding: spacing.sm},
  optLabel:    {flex: 1, fontSize: 12, fontWeight: '600'}});

const al = StyleSheet.create({
  overlay:   {backgroundColor: 'rgba(0,0,0,0.5)', flex: 1, justifyContent: 'flex-end'},
  sheet:     {backgroundColor: colors.surface, borderTopLeftRadius: radius.hero, borderTopRightRadius: radius.hero, maxHeight: '70%', padding: spacing.lg},
  header:    {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md},
  title:     {color: colors.text, fontSize: 16, fontWeight: '800'},
  emptyText: {color: colors.textMuted, fontSize: 13, fontWeight: '500', padding: spacing.xl, textAlign: 'center'},
  logRow:    {alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md},
  logDot:    {backgroundColor: colors.primary, borderRadius: 6, height: 8, marginTop: 4, width: 8},
  logBody:   {flex: 1},
  logTitle:  {color: colors.text, fontSize: 13, fontWeight: '700'},
  logMeta:   {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  logReason: {color: colors.primary, fontSize: 11, fontWeight: '600', marginTop: 2}});

export default EditAttendanceScreen;
