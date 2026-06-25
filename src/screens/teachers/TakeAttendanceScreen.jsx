import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, Modal, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  AnimatedProgressBar,
  ConfirmationModal,
  EmptyState,
  SearchBar,
  SelectField,
  StudentListItem,
} from '../../components';
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_ICONS,
  ATTENDANCE_STATUS_LABELS,
  TEACHER_MARKABLE_STATUSES,
  USER_ROLES,
} from '../../config/constants';
import attendanceService from '../../services/attendance/attendanceService';
import holidayService from '../../services/holidays/holidayService';
import classService from '../../services/classes/classService';
import notificationService from '../../services/notifications/notificationService';
import {getAccessScope} from '../../services/rbacScope';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import teacherService from '../../services/teachers/teacherService';
import academicYearService from '../../services/academicYear/academicYearService';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {toISODate, formatDateForDisplay, parseDateString} from '../../utils/helpers/dateHelpers';

// ── Constants ──────────────────────────────────────────────────────────────────
const DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Status cycle order when tapping a student row (teacher mode)
const STATUS_CYCLE = [
  ATTENDANCE_STATUS.PRESENT,
  ATTENDANCE_STATUS.ABSENT,
  ATTENDANCE_STATUS.HALF_DAY,
  ATTENDANCE_STATUS.LATE,
  ATTENDANCE_STATUS.MEDICAL_LEAVE,
  ATTENDANCE_STATUS.APPROVED_LEAVE,
];

const cycleStatus = current => {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
};

// ── Status Picker Modal ────────────────────────────────────────────────────────
const StatusPickerModal = ({visible, studentName, currentStatus, onSelect, onClose}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={sp.overlay} onPress={onClose}>
      <View style={sp.sheet}>
        <Text style={sp.title}>Mark attendance for</Text>
        <Text style={sp.studentName} numberOfLines={1}>{studentName}</Text>
        <View style={sp.divider} />
        {TEACHER_MARKABLE_STATUSES.map(s => {
          const color   = ATTENDANCE_STATUS_COLORS[s];
          const icon    = ATTENDANCE_STATUS_ICONS[s];
          const label   = ATTENDANCE_STATUS_LABELS[s];
          const active  = currentStatus === s;
          return (
            <Pressable
              key={s}
              onPress={() => { onSelect(s); onClose(); }}
              style={[sp.option, active && {backgroundColor: `${color}15`, borderColor: `${color}40`}]}>
              <View style={[sp.dot, {backgroundColor: active ? color : `${color}50`}]}>
                <MaterialCommunityIcons name={icon} size={16} color={active ? colors.white : color} />
              </View>
              <Text style={[sp.optLabel, {color: active ? color : colors.text}]}>{label}</Text>
              {active ? <MaterialCommunityIcons name="check-circle" size={18} color={color} /> : null}
            </Pressable>
          );
        })}
        <Pressable onPress={onClose} style={sp.cancelBtn}>
          <Text style={sp.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Pressable>
  </Modal>
);

// ── Calendar date picker ───────────────────────────────────────────────────────
const AttendanceDatePicker = ({
  value, onChange, onHolidayTap,
  yearStartDate, yearEndDate,
  attendanceDates = {}, holidayMap = {},
  onMonthChange, initialViewMonth,
}) => {
  const initFrom = initialViewMonth
    ? parseDateString(initialViewMonth + '-01')
    : (parseDateString(value) || new Date());
  const [viewYear,  setViewYear]  = useState(initFrom.getFullYear());
  const [viewMonth, setViewMonth] = useState(initFrom.getMonth());

  const yearStart = parseDateString(yearStartDate);
  const yearEnd   = parseDateString(yearEndDate);
  const todayMid  = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const isFutureMon = new Date(viewYear, viewMonth, 1) > todayMid;

  const cells = [];
  for (let i = 0; i < firstDay; i++) { cells.push(null); }
  for (let d = 1; d <= daysInMonth; d++) { cells.push(d); }

  const isoOf  = d => `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const isSun  = d => d && new Date(viewYear, viewMonth, d).getDay() === 0;

  const getCellState = d => {
    if (!d) { return 'blank'; }
    const date = new Date(viewYear, viewMonth, d);
    if (yearStart && date < yearStart) { return 'outside'; }
    if (yearEnd   && date > yearEnd)   { return 'outside'; }
    if (isSun(d)) { return 'sunday'; }
    const iso = isoOf(d);
    if (holidayMap[iso])  { return 'holiday'; }
    if (date > todayMid)  { return 'future'; }
    const attStatus = attendanceDates[iso];
    if (attStatus === 'coordinator') { return 'coordinator'; }
    if (attStatus === 'locked' || attStatus === 'teacher') { return 'locked'; }
    return date.getTime() === todayMid.getTime() ? 'active' : 'past';
  };

  const atStartBound = yearStart
    ? (viewYear === yearStart.getFullYear() && viewMonth === yearStart.getMonth()) : false;
  const atEndBound = yearEnd
    ? (viewYear === yearEnd.getFullYear()   && viewMonth === yearEnd.getMonth())   : false;

  const prevMonth = () => {
    if (atStartBound) { return; }
    const nm = viewMonth === 0 ? 11 : viewMonth - 1;
    const ny = viewMonth === 0 ? viewYear - 1 : viewYear;
    setViewMonth(nm); setViewYear(ny);
    onMonthChange?.(`${ny}-${String(nm + 1).padStart(2, '0')}`);
  };
  const nextMonth = () => {
    if (atEndBound) { return; }
    const nm = viewMonth === 11 ? 0  : viewMonth + 1;
    const ny = viewMonth === 11 ? viewYear + 1 : viewYear;
    setViewMonth(nm); setViewYear(ny);
    onMonthChange?.(`${ny}-${String(nm + 1).padStart(2, '0')}`);
  };

  return (
    <View style={cal.wrap}>
      <View style={cal.nav}>
        <Pressable onPress={prevMonth} disabled={atStartBound}
          style={[cal.navBtn, atStartBound && cal.navBtnDisabled]} hitSlop={8}>
          <MaterialCommunityIcons name="chevron-left" size={20}
            color={atStartBound ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)'} />
        </Pressable>
        <View style={{alignItems: 'center'}}>
          <Text style={cal.navTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
          {isFutureMon ? <Text style={cal.navFuture}>Upcoming — no attendance yet</Text> : null}
        </View>
        <Pressable onPress={nextMonth} disabled={atEndBound}
          style={[cal.navBtn, atEndBound && cal.navBtnDisabled]} hitSlop={8}>
          <MaterialCommunityIcons name="chevron-right" size={20}
            color={atEndBound ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)'} />
        </Pressable>
      </View>

      <View style={cal.grid}>
        {DAYS.map(d => (
          <Text key={d} style={[cal.dayLabel, d === 'Su' && cal.dayLabelSun]}>{d}</Text>
        ))}
        {cells.map((d, i) => {
          const state = getCellState(d);
          if (state === 'blank' || state === 'outside') { return <View key={i} style={cal.cellWrap} />; }
          const selected = d && isoOf(d) === value;
          const tappable = ['active','locked','past','coordinator','holiday'].includes(state);
          const iso = isoOf(d);
          return (
            <View key={i} style={cal.cellWrap}>
              <Pressable
                disabled={!tappable}
                onPress={() => {
                  if (state === 'holiday') { onHolidayTap?.(holidayMap[iso]); return; }
                  if (tappable) { onChange(iso); }
                }}
                style={[
                  cal.cell,
                  state === 'past'        && cal.cellPast,
                  state === 'sunday'      && cal.cellSunday,
                  state === 'future'      && cal.cellFuture,
                  state === 'holiday'     && cal.cellHoliday,
                  state === 'locked'      && cal.cellLocked,
                  state === 'coordinator' && cal.cellCoordinator,
                  state === 'active'      && cal.cellActive,
                  selected               && cal.cellSelected,
                ]}>
                <Text style={[
                  cal.cellText,
                  state === 'past'        && cal.cellTextPast,
                  state === 'sunday'      && cal.cellTextSunday,
                  state === 'future'      && cal.cellTextFuture,
                  state === 'holiday'     && cal.cellTextHoliday,
                  state === 'locked'      && cal.cellTextLocked,
                  state === 'coordinator' && cal.cellTextCoordinator,
                  state === 'active'      && cal.cellTextActive,
                  selected               && cal.cellTextSelected,
                ]}>
                  {d}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={cal.legend}>
        {[
          {color: 'rgba(255,255,255,0.92)', label: 'Saved'},
          {color: '#10B981',                label: 'Corrected'},
          {color: '#3B82F6',                label: 'Today'},
          {color: 'rgba(255,255,255,0.3)',  label: 'Past'},
          {color: '#F97316',                label: 'Holiday'},
          {color: '#FCA5A5',                label: 'Sunday'},
        ].map(item => (
          <View key={item.label} style={cal.legendItem}>
            <View style={[cal.legendDot, {backgroundColor: item.color}]} />
            <Text style={cal.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ── Main screen ────────────────────────────────────────────────────────────────
const TakeAttendanceScreen = () => {
  const user = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const scope = useMemo(() => getAccessScope(user), [user]);
  const queryClient = useQueryClient();
  const todayStr = toISODate();
  const role = String(user?.role || '').toUpperCase();
  const isTeachingRole = [USER_ROLES.TEACHER, USER_ROLES.CLASS_TEACHER].includes(role);
  const isAssignedClassTeacher = isTeachingRole && Boolean(user?.sectionId);

  const [selectedClassId,   setSelectedClassId]   = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedDate,      setSelectedDate]      = useState(todayStr);
  const [calViewMonth,      setCalViewMonth]      = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
  );
  const [showCalendar,   setShowCalendar]   = useState(false);
  const [holidayModal,   setHolidayModal]   = useState(null);
  const [statuses,       setStatuses]       = useState({});
  const [pickerStudent,  setPickerStudent]  = useState(null); // {id, name}
  const [query,          setQuery]          = useState('');
  const [error,          setError]          = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  // ── Academic year gate ────────────────────────────────────────────────────
  const yearDates = activeAcademicYear
    ? {startDate: activeAcademicYear.startDate, endDate: activeAcademicYear.endDate}
    : academicYearService.getActiveYearDates(user?.branchId);

  const yearActive = activeAcademicYear
    ? activeAcademicYear.status === 'ACTIVE' && activeAcademicYear.isActive &&
      todayStr >= activeAcademicYear.startDate && todayStr <= activeAcademicYear.endDate
    : academicYearService.isYearActive(user?.branchId);

  useEffect(() => {
    if (!yearDates?.startDate || !yearDates?.endDate) { return; }
    const clamp = (d, s, e) => d < s ? s : d > e ? e : d;
    const clamped = clamp(todayStr, yearDates.startDate, yearDates.endDate);
    setSelectedDate(clamped);
    const [y, m] = clamped.split('-');
    setCalViewMonth(`${y}-${m}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearDates?.startDate, yearDates?.endDate]);

  const minDate = yearDates?.startDate || todayStr;

  const nowHour = new Date().getHours();
  const isSundaySelected  = parseDateString(selectedDate)?.getDay() === 0;
  const isReadOnly        = isTeachingRole && selectedDate !== todayStr;
  const isBeforeWindow    = isTeachingRole && selectedDate === todayStr && nowHour < 8;
  const isAfterWindow     = isTeachingRole && selectedDate === todayStr && nowHour >= 15;
  const isTimeGated       = isBeforeWindow || isAfterWindow;

  // Holiday queries must live here so isHolidaySelected is defined before effectiveReadOnly
  const holidayMapQuery = useQuery({
    queryKey: ['holidayMap', user?.branchId, calViewMonth],
    queryFn:  () => holidayService.getHolidayMonthMap(user.branchId, calViewMonth),
    enabled:  Boolean(user?.branchId),
    staleTime: 5 * 60 * 1000,
  });
  const selectedDateMonth = selectedDate.slice(0, 7);
  const selectedMonthHolidayQuery = useQuery({
    queryKey: ['holidayMap', user?.branchId, selectedDateMonth],
    queryFn:  () => holidayService.getHolidayMonthMap(user.branchId, selectedDateMonth),
    enabled:  Boolean(user?.branchId && selectedDateMonth !== calViewMonth),
    staleTime: 5 * 60 * 1000,
  });
  const combinedHolidayMap = {
    ...(selectedMonthHolidayQuery.data || {}),
    ...(holidayMapQuery.data || {}),
  };
  const isHolidaySelected = Boolean(combinedHolidayMap[selectedDate]);
  const selectedHoliday   = combinedHolidayMap[selectedDate] || null;

  const effectiveReadOnly = isReadOnly || isTimeGated || isSundaySelected || isHolidaySelected;

  // ── Class / section queries ───────────────────────────────────────────────
  const assignmentsQuery = useQuery({
    queryKey: ['attendanceTeacherAssignments', user?.teacherId, role],
    queryFn:  () => teacherService.getAssignments({teacherId: user?.teacherId}),
    enabled:  Boolean(user?.teacherId && isTeachingRole),
  });
  const scopedAssignments = useMemo(() => {
    const all = assignmentsQuery.data || [];
    return isAssignedClassTeacher ? all.filter(a => a.isClassTeacher) : all;
  }, [assignmentsQuery.data, isAssignedClassTeacher]);

  const classesQuery = useQuery({
    queryKey: ['attendanceClasses', user?.branchId],
    queryFn:  () => classService.getClasses(),
    enabled:  Boolean(user?.branchId && !isTeachingRole),
  });
  const branchClasses = useMemo(
    () => (classesQuery.data || []).filter(c => !c.branchId || c.branchId === user?.branchId),
    [classesQuery.data, user?.branchId],
  );
  const assignmentClasses = useMemo(() => {
    const byId = new Map();
    scopedAssignments.forEach(a => {
      const cls = a.section?.academicClass;
      const id  = cls?.id || a.academicClassId;
      if (id && !byId.has(id)) { byId.set(id, {...cls, id, name: cls?.name || 'Class'}); }
    });
    return [...byId.values()];
  }, [scopedAssignments]);
  const classes = isTeachingRole ? assignmentClasses : branchClasses;

  useEffect(() => {
    if (!selectedClassId && classes[0]?.id) { setSelectedClassId(classes[0].id); }
  }, [classes, selectedClassId]);

  const sectionsQuery = useQuery({
    queryKey: ['attendanceSections', selectedClassId],
    queryFn:  () => sectionService.getSectionsByClass(selectedClassId),
    enabled:  Boolean(selectedClassId && !isTeachingRole),
  });
  const branchSections = useMemo(
    () => (sectionsQuery.data || []).filter(s => s.isActive !== false),
    [sectionsQuery.data],
  );
  const assignmentSections = useMemo(
    () => scopedAssignments
      .filter(a => {
        const cid = a.section?.academicClass?.id || a.academicClassId;
        return !selectedClassId || cid === selectedClassId;
      })
      .map(a => ({...a.section, id: a.section?.id || a.sectionId}))
      .filter(s => s.id),
    [scopedAssignments, selectedClassId],
  );
  const sections = isTeachingRole ? assignmentSections : branchSections;

  useEffect(() => {
    if (!sections.some(s => s.id === selectedSectionId)) {
      setSelectedSectionId(sections[0]?.id || '');
    }
  }, [sections, selectedSectionId]);

  const selectedClass   = classes.find(c => c.id === selectedClassId)  || null;
  const selectedSection = sections.find(s => s.id === selectedSectionId) || null;
  const resolvedSectionId = selectedSection?.id;

  // ── Student / attendance queries ─────────────────────────────────────────
  const studentsQuery = useQuery({
    queryKey: ['sectionStudents', resolvedSectionId],
    queryFn:  () => studentService.getStudentsBySection(resolvedSectionId),
    enabled:  Boolean(resolvedSectionId),
  });
  const attendanceQuery = useQuery({
    queryKey: ['sectionAttendance', resolvedSectionId, selectedDate],
    queryFn:  () => attendanceService.getSectionAttendanceMap({
      sectionId: resolvedSectionId, attendanceDate: selectedDate,
    }),
    enabled: Boolean(resolvedSectionId),
  });
  const monthMapQuery = useQuery({
    queryKey: ['sectionMonthMap', resolvedSectionId, calViewMonth],
    queryFn:  () => attendanceService.getSectionMonthMap({sectionId: resolvedSectionId, yearMonth: calViewMonth}),
    enabled:  Boolean(resolvedSectionId),
    staleTime: 2 * 60 * 1000,
  });
  const todayLocked = Boolean(
    resolvedSectionId &&
    (monthMapQuery.data?.[todayStr] === 'locked' ||
     monthMapQuery.data?.[todayStr] === 'coordinator'),
  );

  const students = useMemo(() => studentsQuery.data || [], [studentsQuery.data]);

  useEffect(() => {
    if (!students.length) { setStatuses({}); return; }
    const existing = attendanceQuery.data || {};
    setStatuses(
      students.reduce((acc, s) => ({
        ...acc,
        [s.id]: existing[s.id]?.status || ATTENDANCE_STATUS.PRESENT,
      }), {}),
    );
  }, [attendanceQuery.data, students]);

  const visibleStudents = useMemo(
    () => students.filter(s =>
      `${s.fullName} ${s.studentId}`.toLowerCase().includes(query.toLowerCase()),
    ),
    [query, students],
  );

  // ── Summary counts ────────────────────────────────────────────────────────
  const counts = useMemo(() => {
    let present = 0, absent = 0, halfDay = 0, late = 0, medical = 0, approved = 0;
    students.forEach(s => {
      switch (statuses[s.id]) {
        case ATTENDANCE_STATUS.PRESENT:        present++;  break;
        case ATTENDANCE_STATUS.ABSENT:         absent++;   break;
        case ATTENDANCE_STATUS.HALF_DAY:       halfDay++;  break;
        case ATTENDANCE_STATUS.LATE:           late++;     break;
        case ATTENDANCE_STATUS.MEDICAL_LEAVE:  medical++;  break;
        case ATTENDANCE_STATUS.APPROVED_LEAVE: approved++; break;
        default: present++; break;
      }
    });
    return {present, absent, halfDay, late, medical, approved};
  }, [statuses, students]);

  const presentTotal = counts.present + counts.late + counts.approved;
  const progressPct  = students.length ? (presentTotal / students.length) * 100 : 0;

  const setAll = status =>
    setStatuses(students.reduce((acc, s) => ({...acc, [s.id]: status}), {}));

  // ── Status picker ─────────────────────────────────────────────────────────
  const openPicker = studentId => {
    const student = students.find(s => s.id === studentId);
    if (student && !effectiveReadOnly) { setPickerStudent({id: studentId, name: student.fullName}); }
  };

  const handleStatusSelect = newStatus => {
    if (!pickerStudent) { return; }
    setStatuses(cur => ({...cur, [pickerStudent.id]: newStatus}));
    setPickerStudent(null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: () => {
      if (!selectedClass || !selectedSection) {
        throw new Error('Select a class and section before submitting.');
      }
      const records = students.map(student => ({
        studentId:       student.id,
        academicClassId: selectedClass.id || student.academicClassId,
        sectionId:       selectedSection.id,
        branchId:        user.branchId,
        attendanceDate:  selectedDate,
        status:          statuses[student.id] || ATTENDANCE_STATUS.PRESENT,
        markedById:      user.id,
        markedByRole:    user.role,
      }));
      return attendanceService.saveAttendanceBatch({records}, scope);
    },
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({queryKey: ['sectionAttendance', resolvedSectionId, selectedDate]});
      queryClient.invalidateQueries({queryKey: ['sectionMonthMap',   resolvedSectionId, calViewMonth]});
      queryClient.invalidateQueries({queryKey: ['teacherDashboard',  user?.teacherId]});
      queryClient.invalidateQueries({queryKey: ['parentAttendance']});
      queryClient.invalidateQueries({queryKey: ['parentAttendanceYear']});
      queryClient.invalidateQueries({queryKey: ['branchAttendance']});
      queryClient.invalidateQueries({queryKey: ['userNotifications']});
      const absentStudents = students.filter(s => statuses[s.id] === ATTENDANCE_STATUS.ABSENT);
      if (absentStudents.length > 0) {
        notificationService.notifyAbsentStudentsParents({
          absentStudents,
          attendanceDate: selectedDate,
          markedByName: user?.fullName,
        }).catch(err => console.log('[TakeAttendance] notification error:', err));
      }
    },
    onError: err => setError(err.message || 'Unable to save attendance.'),
  });

  const classOptions   = classes.map(c  => ({label: c.name,  value: c.id}));
  const sectionOptions = sections.map(s => ({label: s.name,  value: s.id}));
  const isLoading      = classesQuery.isLoading || sectionsQuery.isLoading || studentsQuery.isLoading;

  // ── Gate: year closed ─────────────────────────────────────────────────────
  if (activeAcademicYear && !yearActive) {
    const isClosed   = activeAcademicYear.status === 'CLOSED';
    const isUpcoming = activeAcademicYear.status === 'PLANNING' || todayStr < activeAcademicYear.startDate;
    const msg = isClosed
      ? `Academic year ${activeAcademicYear.name} has ended. Attendance is closed.`
      : isUpcoming
      ? `Academic year ${activeAcademicYear.name} has not started yet (starts ${formatDateForDisplay(activeAcademicYear.startDate)}).`
      : 'No active academic year. Contact your administrator.';
    return (
      <View style={styles.gateRoot}>
        <MaterialCommunityIcons name="calendar-lock" size={48} color={colors.textMuted} />
        <Text style={styles.gateTitle}>Attendance Closed</Text>
        <Text style={styles.gateMsg}>{msg}</Text>
      </View>
    );
  }

  const header = useMemo(() => (
    <View style={styles.listHeader}>
      {/* Summary card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Pressable style={styles.summaryLeft} onPress={() => setShowCalendar(c => !c)}>
            <Text style={styles.summaryDate}>{formatDateForDisplay(selectedDate) || selectedDate}</Text>
            <View style={styles.datePill}>
              <MaterialCommunityIcons name="calendar-month" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.datePillText}>{selectedDate === todayStr ? 'Today' : 'Selected date'}</Text>
              <MaterialCommunityIcons
                name={showCalendar ? 'chevron-up' : 'chevron-down'}
                size={12} color="rgba(255,255,255,0.8)" />
            </View>
          </Pressable>
          {selectedClass && selectedSection ? (
            <View style={styles.contextChip}>
              <Text style={styles.contextChipText}>{selectedClass.name}–{selectedSection.name}</Text>
            </View>
          ) : null}
        </View>

        {showCalendar ? (
          <AttendanceDatePicker
            value={selectedDate}
            initialViewMonth={calViewMonth}
            yearStartDate={minDate}
            yearEndDate={yearDates?.endDate}
            attendanceDates={monthMapQuery.data || {}}
            holidayMap={holidayMapQuery.data || {}}
            onMonthChange={ym => setCalViewMonth(ym)}
            onHolidayTap={h => { setShowCalendar(false); setHolidayModal(h); }}
            onChange={d => { setSelectedDate(d); setShowCalendar(false); }}
          />
        ) : null}

        {isSundaySelected ? (
          <View style={styles.banner}>
            <MaterialCommunityIcons name="calendar-weekend" size={13} color={colors.danger} />
            <Text style={[styles.bannerText, {color: colors.danger}]}>Sunday — attendance not applicable</Text>
          </View>
        ) : isHolidaySelected ? (
          <View style={[styles.banner, {backgroundColor: '#FFF7ED', borderColor: '#F97316'}]}>
            <MaterialCommunityIcons name="star-circle-outline" size={13} color="#F97316" />
            <Text style={[styles.bannerText, {color: '#F97316'}]}>
              {selectedHoliday?.name || 'Holiday'} — no attendance on holidays
            </Text>
          </View>
        ) : isTimeGated ? (
          <View style={styles.banner}>
            <MaterialCommunityIcons name="clock-alert-outline" size={13} color={colors.warning} />
            <Text style={styles.bannerText}>
              {isBeforeWindow ? 'Attendance window opens at 8:00 AM' : 'Attendance window closed at 3:00 PM'}
            </Text>
          </View>
        ) : isReadOnly ? (
          <View style={styles.banner}>
            <MaterialCommunityIcons name="eye-outline" size={13} color={colors.warning} />
            <Text style={styles.bannerText}>View only — only today's attendance can be edited</Text>
          </View>
        ) : null}

        {students.length > 0 ? (
          <View style={styles.progressWrap}>
            <View style={styles.progressMeta}>
              <View style={styles.countPill}>
                <MaterialCommunityIcons name="check-circle" size={12} color={colors.success} />
                <Text style={[styles.countNum, {color: colors.success}]}>{counts.present}</Text>
                <Text style={styles.countLabel}>P</Text>
              </View>
              {counts.absent > 0 ? (
                <View style={styles.countPill}>
                  <MaterialCommunityIcons name="close-circle" size={12} color={colors.danger} />
                  <Text style={[styles.countNum, {color: colors.danger}]}>{counts.absent}</Text>
                  <Text style={styles.countLabel}>A</Text>
                </View>
              ) : null}
              {counts.halfDay > 0 ? (
                <View style={styles.countPill}>
                  <MaterialCommunityIcons name="circle-half-full" size={12} color="#F97316" />
                  <Text style={[styles.countNum, {color: '#F97316'}]}>{counts.halfDay}</Text>
                  <Text style={styles.countLabel}>HD</Text>
                </View>
              ) : null}
              {counts.late > 0 ? (
                <View style={styles.countPill}>
                  <MaterialCommunityIcons name="clock-alert-outline" size={12} color="#EAB308" />
                  <Text style={[styles.countNum, {color: '#EAB308'}]}>{counts.late}</Text>
                  <Text style={styles.countLabel}>L</Text>
                </View>
              ) : null}
              {counts.medical > 0 ? (
                <View style={styles.countPill}>
                  <MaterialCommunityIcons name="medical-bag" size={12} color="#8B5CF6" />
                  <Text style={[styles.countNum, {color: '#8B5CF6'}]}>{counts.medical}</Text>
                  <Text style={styles.countLabel}>ML</Text>
                </View>
              ) : null}
              {counts.approved > 0 ? (
                <View style={styles.countPill}>
                  <MaterialCommunityIcons name="calendar-check-outline" size={12} color="#3B82F6" />
                  <Text style={[styles.countNum, {color: '#3B82F6'}]}>{counts.approved}</Text>
                  <Text style={styles.countLabel}>AL</Text>
                </View>
              ) : null}
              <Text style={styles.totalLabel}>of {students.length}</Text>
            </View>
            <AnimatedProgressBar
              progress={progressPct}
              color={progressPct >= 80 ? colors.success : progressPct >= 60 ? colors.warning : colors.danger}
              trackColor={colors.border}
              height={6}
            />
          </View>
        ) : null}
      </View>

      {/* Class / Section selectors */}
      <View style={styles.selectorCard}>
        <View style={styles.selectorRow}>
          <View style={styles.selectorHalf}>
            <SelectField
              label="Class"
              value={selectedClassId}
              options={classOptions}
              disabled={!classOptions.length}
              onChange={v => { setSelectedClassId(v); setSelectedSectionId(''); }}
            />
          </View>
          <View style={styles.selectorHalf}>
            <SelectField
              label="Section"
              value={resolvedSectionId}
              options={sectionOptions}
              disabled={!sectionOptions.length}
              onChange={setSelectedSectionId}
            />
          </View>
        </View>
      </View>

      <SearchBar value={query} onChangeText={setQuery} placeholder="Search student name or roll number" />

      {!effectiveReadOnly ? (
        <View>
          {/* Bulk quick-set row */}
          <View style={styles.bulkRow}>
            <Pressable onPress={() => setAll(ATTENDANCE_STATUS.PRESENT)} style={styles.bulkBtn}>
              <MaterialCommunityIcons name="check-all" size={14} color={colors.success} />
              <Text style={[styles.bulkLabel, {color: colors.success}]}>All Present</Text>
            </Pressable>
            <Pressable onPress={() => setAll(ATTENDANCE_STATUS.ABSENT)} style={styles.bulkBtn}>
              <MaterialCommunityIcons name="close-circle-multiple-outline" size={14} color={colors.danger} />
              <Text style={[styles.bulkLabel, {color: colors.danger}]}>All Absent</Text>
            </Pressable>
          </View>
          <Text style={styles.tapHint}>Tap a student to change their attendance status</Text>
        </View>
      ) : null}

      {visibleStudents.length > 0 ? (
        <Text style={styles.rosterLabel}>
          Roster — {visibleStudents.length} student{visibleStudents.length !== 1 ? 's' : ''}
        </Text>
      ) : null}
    </View>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [showCalendar, selectedDate, todayStr, selectedClass, selectedSection, resolvedSectionId,
      calViewMonth, monthMapQuery.data, holidayMapQuery.data, minDate, yearDates,
      isSundaySelected, isTimeGated, isBeforeWindow, isReadOnly, effectiveReadOnly,
      students, counts, presentTotal, progressPct,
      selectedClassId, classOptions, sectionOptions,
      query, visibleStudents]);

  return (
    <View style={styles.root}>
      <FlatList
        data={isSundaySelected || isHolidaySelected ? [] : visibleStudents}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        renderItem={({item}) => (
          <StudentListItem
            student={{
              id:     item.id,
              name:   item.fullName,
              rollNo: item.studentId,
              section: `${item.academicClass?.name || ''}–${item.section?.name || ''}`,
            }}
            status={statuses[item.id] || ATTENDANCE_STATUS.PRESENT}
            onStatusPress={effectiveReadOnly ? undefined : openPicker}
            disabled={effectiveReadOnly}
          />
        )}
        ListEmptyComponent={
          isSundaySelected ? (
            <EmptyState icon="calendar-weekend" title="Sunday — No Attendance"
              message="Sundays are holidays. Attendance is not taken on Sundays." />
          ) : isHolidaySelected ? (
            <EmptyState icon="star-circle-outline" title={selectedHoliday?.name || 'Holiday'}
              message="This is a holiday. Attendance is not taken on holidays." />
          ) : (
            <EmptyState
              title={isLoading ? 'Loading roster…' : 'No students'}
              message={
                assignmentsQuery.error?.message ||
                classesQuery.error?.message ||
                studentsQuery.error?.message ||
                'Select a class and section with active students.'
              }
            />
          )
        }
        ListFooterComponent={<View style={styles.footerSpacer} />}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {Boolean(error) ? <Text style={styles.errorText}>{error}</Text> : null}
        {isSundaySelected ? (
          <View style={styles.footerMsg}>
            <MaterialCommunityIcons name="calendar-weekend" size={16} color={colors.textMuted} />
            <Text style={styles.footerMsgText}>Sunday — Attendance Not Applicable</Text>
          </View>
        ) : isHolidaySelected ? (
          <View style={[styles.footerMsg, {backgroundColor: '#FFF7ED'}]}>
            <MaterialCommunityIcons name="star-circle-outline" size={16} color="#F97316" />
            <Text style={[styles.footerMsgText, {color: '#F97316'}]}>
              {selectedHoliday?.name || 'Holiday'} — No Attendance
            </Text>
          </View>
        ) : todayLocked && selectedDate === todayStr ? (
          <View style={[styles.footerMsg, {backgroundColor: `${colors.success}15`}]}>
            <MaterialCommunityIcons name="lock-check" size={16} color={colors.success} />
            <Text style={[styles.footerMsgText, {color: colors.success}]}>
              Attendance submitted and locked for today
            </Text>
          </View>
        ) : isTimeGated ? (
          <View style={styles.footerMsg}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={colors.warning} />
            <Text style={[styles.footerMsgText, {color: colors.warning}]}>
              {isBeforeWindow ? 'Attendance opens at 8:00 AM' : 'Attendance window closed at 3:00 PM'}
            </Text>
          </View>
        ) : isReadOnly ? (
          <View style={styles.footerMsg}>
            <MaterialCommunityIcons name="lock-outline" size={16} color={colors.textMuted} />
            <Text style={styles.footerMsgText}>View only — contact coordinator to edit</Text>
          </View>
        ) : (
          <Pressable
            onPress={() => setConfirmVisible(true)}
            disabled={mutation.isPending || !selectedClass || !selectedSection || !students.length}
            style={[
              styles.saveBtn,
              (mutation.isPending || !selectedClass || !selectedSection || !students.length) &&
                styles.saveBtnDisabled,
            ]}>
            <MaterialCommunityIcons
              name={mutation.isPending ? 'loading' : 'content-save-check-outline'}
              size={18} color={colors.white} />
            <Text style={styles.saveBtnText}>
              {mutation.isPending ? 'Saving…' : 'Submit Attendance'}
            </Text>
            {students.length > 0 && !mutation.isPending ? (
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>{presentTotal}/{students.length}</Text>
              </View>
            ) : null}
          </Pressable>
        )}
      </View>

      {/* Status picker modal */}
      <StatusPickerModal
        visible={Boolean(pickerStudent)}
        studentName={pickerStudent?.name || ''}
        currentStatus={pickerStudent ? (statuses[pickerStudent.id] || ATTENDANCE_STATUS.PRESENT) : ATTENDANCE_STATUS.PRESENT}
        onSelect={handleStatusSelect}
        onClose={() => setPickerStudent(null)}
      />

      {/* Submit confirmation */}
      <ConfirmationModal
        visible={confirmVisible}
        title="Submit Attendance?"
        message={`Submit attendance for ${students.length} student${students.length !== 1 ? 's' : ''} in ${selectedClass?.name || ''}${selectedSection ? `–${selectedSection.name}` : ''} for ${formatDateForDisplay(selectedDate)}?\n\nPresent: ${counts.present}  Absent: ${counts.absent}  Half Day: ${counts.halfDay}  Late: ${counts.late}  Medical: ${counts.medical}  Approved: ${counts.approved}\n\nThis cannot be edited by you after submission.`}
        confirmLabel="Yes, Submit & Lock"
        cancelLabel="Cancel"
        onConfirm={() => { setConfirmVisible(false); mutation.mutate(); }}
        onCancel={() => setConfirmVisible(false)}
      />

      {/* Holiday info modal */}
      <ConfirmationModal
        visible={Boolean(holidayModal)}
        title={holidayModal?.name || 'Holiday'}
        message={`Type: ${holidayModal?.type || ''}\n${holidayModal?.description ? `\n${holidayModal.description}` : '\nNo attendance on this day.'}`}
        confirmLabel="OK"
        cancelLabel={null}
        onConfirm={() => setHolidayModal(null)}
        onCancel={() => setHolidayModal(null)}
      />
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:       {backgroundColor: colors.background, flex: 1},
  list:       {padding: spacing.lg, paddingBottom: 8},
  listHeader: {marginBottom: spacing.sm},
  footerSpacer: {height: spacing.xxxl + spacing.xl},

  gateRoot: {alignItems: 'center', backgroundColor: colors.background, flex: 1, gap: spacing.md, justifyContent: 'center', padding: spacing.xl},
  gateTitle: {color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center'},
  gateMsg:   {color: colors.textMuted, fontSize: 13, fontWeight: '500', lineHeight: 20, textAlign: 'center'},

  summaryCard:  {backgroundColor: colors.primary, borderRadius: radius.hero, marginBottom: spacing.md, overflow: 'hidden', padding: spacing.lg, ...shadows.clayDeep},
  summaryRow:   {alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md},
  summaryLeft:  {gap: 4},
  summaryDate:  {color: colors.white, fontSize: 17, fontWeight: '800'},
  datePill:     {alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.pill, flexDirection: 'row', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 3, alignSelf: 'flex-start'},
  datePillText: {color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600'},
  contextChip:  {backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs},
  contextChipText: {color: colors.white, fontSize: 12, fontWeight: '700'},
  progressWrap: {gap: spacing.sm, marginTop: spacing.sm},
  progressMeta: {alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  countPill:    {alignItems: 'center', flexDirection: 'row', gap: 3},
  countNum:     {fontSize: 14, fontWeight: '800'},
  countLabel:   {color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600'},
  totalLabel:   {color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600'},
  banner:       {alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.sm, flexDirection: 'row', gap: 6, marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 6},
  bannerText:   {color: colors.warning, fontSize: 11, fontWeight: '600', flex: 1},

  selectorCard: {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, marginBottom: spacing.md, padding: spacing.md, ...shadows.clay},
  selectorRow:  {flexDirection: 'row', gap: spacing.md},
  selectorHalf: {flex: 1},

  bulkRow:    {flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs},
  bulkBtn:    {alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 5, justifyContent: 'center', paddingVertical: spacing.sm},
  bulkLabel:  {fontSize: 12, fontWeight: '700'},
  tapHint:    {color: colors.textMuted, fontSize: 11, fontWeight: '500', textAlign: 'center', marginBottom: spacing.sm},
  rosterLabel:{color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.4, marginBottom: spacing.sm, textTransform: 'uppercase'},

  footer:        {backgroundColor: colors.surface, borderColor: colors.border, borderTopWidth: 1.5, bottom: 0, left: 0, padding: spacing.lg, position: 'absolute', right: 0, ...shadows.clay},
  errorText:     {color: colors.danger, fontSize: 12, fontWeight: '600', marginBottom: spacing.sm, textAlign: 'center'},
  saveBtn:       {alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.lg, flexDirection: 'row', gap: spacing.sm, height: 48, justifyContent: 'center', paddingHorizontal: spacing.xl},
  saveBtnDisabled: {backgroundColor: colors.border},
  saveBtnText:   {color: colors.white, fontSize: 15, fontWeight: '700'},
  saveBadge:     {backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2},
  saveBadgeText: {color: colors.white, fontSize: 11, fontWeight: '800'},
  footerMsg:     {alignItems: 'center', borderRadius: radius.sm, flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', padding: spacing.sm},
  footerMsgText: {color: colors.textMuted, fontSize: 13, fontWeight: '600'},
});

const cal = StyleSheet.create({
  wrap:    {backgroundColor: 'rgba(0,0,0,0.28)', borderRadius: radius.card, marginTop: spacing.sm, padding: spacing.md},
  nav:     {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm},
  navBtn:  {padding: 4},
  navBtnDisabled: {opacity: 0.3},
  navTitle: {color: colors.white, fontSize: 14, fontWeight: '800'},
  navFuture: {color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '600', marginTop: 1},
  grid:    {flexDirection: 'row', flexWrap: 'wrap'},
  dayLabel: {color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700', textAlign: 'center', width: '14.28%', paddingVertical: 5},
  dayLabelSun: {color: '#FCA5A5'},
  cellWrap: {alignItems: 'center', width: '14.28%', paddingBottom: 3},
  cell:    {alignItems: 'center', justifyContent: 'center', width: '100%', aspectRatio: 1, borderRadius: 100},
  cellPast: {backgroundColor: 'rgba(255,255,255,0.18)'},
  cellSunday: {backgroundColor: 'rgba(252,165,165,0.25)'},
  cellFuture: {opacity: 0.55},
  cellHoliday: {backgroundColor: 'rgba(249,115,22,0.28)', borderColor: '#F97316', borderWidth: 1.5},
  cellLocked: {backgroundColor: 'rgba(255,255,255,0.92)'},
  cellCoordinator: {backgroundColor: '#10B981'},
  cellActive: {backgroundColor: '#3B82F6'},
  cellSelected: {borderColor: colors.white, borderWidth: 2.5},
  cellText: {color: 'rgba(255,255,255,0.95)', fontSize: 13, fontWeight: '700'},
  cellTextPast: {color: 'rgba(255,255,255,0.95)', fontWeight: '700'},
  cellTextSunday: {color: '#FCA5A5', fontWeight: '700'},
  cellTextFuture: {color: 'rgba(255,255,255,0.6)'},
  cellTextHoliday: {color: '#F97316', fontWeight: '700'},
  cellTextLocked: {color: '#1E3A5F', fontWeight: '800'},
  cellTextCoordinator: {color: colors.white, fontWeight: '800'},
  cellTextActive: {color: colors.white, fontWeight: '800'},
  cellTextSelected: {color: colors.white, fontWeight: '800'},
  legend: {borderTopColor: 'rgba(255,255,255,0.2)', borderTopWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginTop: spacing.sm, paddingTop: spacing.sm},
  legendItem: {alignItems: 'center', flexDirection: 'row', gap: 4},
  legendDot: {borderRadius: 3, height: 6, width: 6},
  legendText: {color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '700'},
});

const sp = StyleSheet.create({
  overlay:    {backgroundColor: 'rgba(0,0,0,0.5)', flex: 1, justifyContent: 'flex-end'},
  sheet:      {backgroundColor: colors.surface, borderTopLeftRadius: radius.hero, borderTopRightRadius: radius.hero, padding: spacing.lg, paddingBottom: spacing.xxxl},
  title:      {color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center', textTransform: 'uppercase'},
  studentName:{color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 4, textAlign: 'center'},
  divider:    {backgroundColor: colors.border, height: 1, marginVertical: spacing.md},
  option:     {alignItems: 'center', borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm, padding: spacing.md},
  dot:        {alignItems: 'center', borderRadius: radius.pill, height: 34, justifyContent: 'center', width: 34},
  optLabel:   {flex: 1, fontSize: 14, fontWeight: '700'},
  cancelBtn:  {alignItems: 'center', marginTop: spacing.sm, paddingVertical: spacing.md},
  cancelText: {color: colors.textMuted, fontSize: 14, fontWeight: '600'},
});

export default TakeAttendanceScreen;
