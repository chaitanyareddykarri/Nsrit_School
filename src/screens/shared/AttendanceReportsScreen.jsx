import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, SelectField} from '../../components';
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_LABELS,
  USER_ROLES} from '../../config/constants';
import attendanceService from '../../services/attendance/attendanceService';
import {attendanceCalculationEngine} from '../../services/attendance/attendanceCalculationEngine';
import classService from '../../services/classes/classService';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {toISODate} from '../../utils/helpers/dateHelpers';

const pad    = n => String(n).padStart(2, '0');
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const REPORT_TYPES = [
  {id: 'daily',     label: 'Daily Report',        icon: 'calendar-today',         desc: 'All sections for one day'},
  {id: 'monthly',   label: 'Monthly Report',       icon: 'calendar-month',         desc: 'A full month branch-wide'},
  {id: 'academic',  label: 'Academic Year',        icon: 'calendar-range',         desc: 'Cumulative AY attendance'},
  {id: 'classwise', label: 'Class-wise Report',    icon: 'school-outline',         desc: 'Totals grouped by class'},
  {id: 'section',   label: 'Section-wise Report',  icon: 'google-classroom',       desc: 'Totals grouped by section'},
  {id: 'student',   label: 'Student-wise Report',  icon: 'account-outline',        desc: 'Monthly history per student'},
  {id: 'low',       label: 'Low Attendance',       icon: 'alert-circle-outline',   desc: 'Students below threshold'},
];

const THRESHOLDS = [75, 80, 85, 90];

// ── Compact color bar ─────────────────────────────────────────────────────────
const PctBar = ({pct, height = 6}) => {
  const color = pct >= 85 ? colors.success : pct >= 75 ? colors.warning : colors.danger;
  return (
    <View style={{backgroundColor: colors.border, borderRadius: 99, height, overflow: 'hidden', flex: 1}}>
      <View style={{backgroundColor: color, height, width: `${Math.min(pct, 100)}%`}} />
    </View>
  );
};

// ── Stat cell ─────────────────────────────────────────────────────────────────
const Cell = ({label, value, color}) => (
  <View style={cell.wrap}>
    <Text style={[cell.val, color ? {color} : null]}>{value}</Text>
    <Text style={cell.lbl}>{label}</Text>
  </View>
);

// ── Report type tab selector ──────────────────────────────────────────────────
const ReportTypePicker = ({value, onChange}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={rt.row}>
    {REPORT_TYPES.map(r => {
      const active = r.id === value;
      return (
        <Pressable key={r.id} onPress={() => onChange(r.id)}
          style={[rt.chip, active && rt.chipActive]}>
          <MaterialCommunityIcons name={r.icon} size={13}
            color={active ? colors.white : colors.textMuted} />
          <Text style={[rt.chipText, active && rt.chipTextActive]}>{r.label}</Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

// ── helpers ───────────────────────────────────────────────────────────────────
const groupBy = (arr, key) => arr.reduce((acc, item) => {
  const k = typeof key === 'function' ? key(item) : item[key];
  if (!acc[k]) { acc[k] = []; }
  acc[k].push(item);
  return acc;
}, {});

const summarise = records => attendanceService.summarizeAttendance(records);

// ── Individual report renderers ────────────────────────────────────────────────

const DailyReport = ({branchId, selectedDate}) => {
  const q = useQuery({
    queryKey: ['reportDaily', branchId, selectedDate],
    queryFn:  () => attendanceService.getDailyReport({branchId, attendanceDate: selectedDate}),
    enabled:  Boolean(branchId && selectedDate),
    staleTime: 2 * 60 * 1000});
  const records = q.data || [];
  const bySection = useMemo(() => groupBy(records, r => r.section?.name || r.sectionId || 'Unknown'), [records]);
  const total = summarise(records);
  if (q.isLoading) { return <Text style={s.loading}>Loading…</Text>; }
  if (!records.length) { return <EmptyState icon="calendar-search" title="No Records" message={`No attendance submitted for ${selectedDate}.`} />; }
  return (
    <View>
      <View style={s.summaryCard}>
        <Text style={s.summaryTitle}>Branch Total — {selectedDate}</Text>
        <View style={s.statRow}>
          <Cell label="Present" value={total.present} color={colors.success} />
          <Cell label="Absent"  value={total.absent}  color={colors.danger}  />
          {total.halfDay > 0    ? <Cell label="Half Day" value={total.halfDay}    color="#F97316" /> : null}
          {total.late > 0       ? <Cell label="Late"     value={total.late}       color="#EAB308" /> : null}
          <Cell label="Total"   value={total.total} />
          <Cell label="Avg %" value={`${total.percentage}%`}
            color={total.percentage >= 85 ? colors.success : total.percentage >= 75 ? colors.warning : colors.danger} />
        </View>
        <PctBar pct={total.percentage} height={8} />
      </View>
      {Object.entries(bySection).map(([section, recs]) => {
        const sum = summarise(recs);
        return (
          <View key={section} style={s.sectionBlock}>
            <Text style={s.sectionName}>{section}</Text>
            <View style={s.statRow}>
              <Cell label="P" value={sum.present} color={colors.success} />
              <Cell label="A" value={sum.absent}  color={colors.danger}  />
              {sum.halfDay > 0 ? <Cell label="HD" value={sum.halfDay} color="#F97316" /> : null}
              {sum.late > 0    ? <Cell label="L"  value={sum.late}    color="#EAB308" /> : null}
              <Cell label="Tot" value={sum.total} />
            </View>
            <View style={s.barRow}>
              <PctBar pct={sum.percentage} />
              <Text style={[s.barPct, {color: sum.percentage >= 85 ? colors.success : sum.percentage >= 75 ? colors.warning : colors.danger}]}>
                {sum.percentage}%
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const MonthlyReport = ({branchId, viewYear, viewMonth}) => {
  const fromDate = `${viewYear}-${pad(viewMonth + 1)}-01`;
  const toDate   = `${viewYear}-${pad(viewMonth + 1)}-${pad(new Date(viewYear, viewMonth + 1, 0).getDate())}`;
  const q = useQuery({
    queryKey: ['reportMonthly', branchId, viewYear, viewMonth],
    queryFn:  () => attendanceService.getMonthlyReport({branchId, fromDate, toDate}),
    enabled:  Boolean(branchId),
    staleTime: 3 * 60 * 1000});
  const records = q.data || [];
  const byDate = useMemo(
    () => Object.entries(groupBy(records, 'attendanceDate')).sort(([a], [b]) => a.localeCompare(b)),
    [records],
  );
  const total = summarise(records);
  if (q.isLoading) { return <Text style={s.loading}>Loading…</Text>; }
  if (!records.length) { return <EmptyState icon="calendar-month-outline" title="No Records" message={`No attendance submitted for ${MONTH_NAMES[viewMonth]} ${viewYear}.`} />; }
  return (
    <View>
      <View style={s.summaryCard}>
        <Text style={s.summaryTitle}>{MONTH_NAMES[viewMonth]} {viewYear} — Branch Summary</Text>
        <View style={s.statRow}>
          <Cell label="Present" value={total.present} color={colors.success} />
          <Cell label="Absent"  value={total.absent}  color={colors.danger}  />
          <Cell label="Total"   value={total.total} />
          <Cell label="Avg %"   value={`${total.percentage}%`}
            color={total.percentage >= 85 ? colors.success : total.percentage >= 75 ? colors.warning : colors.danger} />
        </View>
        <PctBar pct={total.percentage} height={8} />
      </View>
      {byDate.map(([date, recs]) => {
        const sum = summarise(recs);
        return (
          <View key={date} style={s.sectionBlock}>
            <Text style={s.sectionName}>{date}</Text>
            <View style={s.barRow}>
              <Cell label="P" value={sum.present} color={colors.success} />
              <Cell label="A" value={sum.absent}  color={colors.danger}  />
              <PctBar pct={sum.percentage} />
              <Text style={[s.barPct, {color: sum.percentage >= 85 ? colors.success : sum.percentage >= 75 ? colors.warning : colors.danger}]}>
                {sum.percentage}%
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const ClasswiseReport = ({branchId, viewYear, viewMonth}) => {
  const fromDate = `${viewYear}-${pad(viewMonth + 1)}-01`;
  const toDate   = `${viewYear}-${pad(viewMonth + 1)}-${pad(new Date(viewYear, viewMonth + 1, 0).getDate())}`;
  const q = useQuery({
    queryKey: ['reportClasswise', branchId, viewYear, viewMonth],
    queryFn:  () => attendanceService.getMonthlyReport({branchId, fromDate, toDate}),
    enabled:  Boolean(branchId),
    staleTime: 3 * 60 * 1000});
  const records = q.data || [];
  const byClass = useMemo(
    () => groupBy(records, r => r.academicClass?.name || r.academicClassId || 'Unknown'),
    [records],
  );
  if (q.isLoading) { return <Text style={s.loading}>Loading…</Text>; }
  if (!records.length) { return <EmptyState icon="school-outline" title="No Records" />; }
  return (
    <View>
      <Text style={s.subTitle}>{MONTH_NAMES[viewMonth]} {viewYear} · Class-wise</Text>
      {Object.entries(byClass).sort(([a], [b]) => a.localeCompare(b)).map(([cls, recs]) => {
        const sum = summarise(recs);
        return (
          <View key={cls} style={s.sectionBlock}>
            <Text style={s.sectionName}>{cls}</Text>
            <View style={s.statRow}>
              <Cell label="P" value={sum.present} color={colors.success} />
              <Cell label="A" value={sum.absent}  color={colors.danger}  />
              {sum.halfDay > 0 ? <Cell label="HD" value={sum.halfDay} color="#F97316" /> : null}
              <Cell label="Total" value={sum.total} />
            </View>
            <View style={s.barRow}>
              <PctBar pct={sum.percentage} />
              <Text style={[s.barPct, {color: sum.percentage >= 85 ? colors.success : sum.percentage >= 75 ? colors.warning : colors.danger}]}>
                {sum.percentage}%
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const SectionwiseReport = ({branchId, viewYear, viewMonth, classes}) => {
  const fromDate = `${viewYear}-${pad(viewMonth + 1)}-01`;
  const toDate   = `${viewYear}-${pad(viewMonth + 1)}-${pad(new Date(viewYear, viewMonth + 1, 0).getDate())}`;
  const [classId, setClassId] = useState('');
  const classOptions = classes.map(c => ({label: c.name, value: c.id}));

  const sectionsQ = useQuery({
    queryKey: ['reportSections', classId],
    queryFn:  () => sectionService.getSectionsByClass(classId),
    enabled:  Boolean(classId)});
  const sections = sectionsQ.data || [];
  const sectionOptions = sections.map(s => ({label: s.name, value: s.id}));
  const [sectionId, setSectionId] = useState('');

  const q = useQuery({
    queryKey: ['reportSectionwise', branchId, viewYear, viewMonth, sectionId],
    queryFn:  () => attendanceService.getAttendance({sectionId, fromDate, toDate}),
    enabled:  Boolean(sectionId),
    staleTime: 3 * 60 * 1000});
  const records = q.data || [];
  const byStudent = useMemo(
    () => groupBy(records, r => r.studentId),
    [records],
  );
  const section = sections.find(s2 => s2.id === sectionId);
  if (q.isLoading) { return <Text style={s.loading}>Loading…</Text>; }
  return (
    <View>
      <View style={s.filterRow}>
        <View style={{flex: 1}}>
          <SelectField label="Class" value={classId} options={classOptions}
            onChange={v => { setClassId(v); setSectionId(''); }} />
        </View>
        <View style={{flex: 1}}>
          <SelectField label="Section" value={sectionId} options={sectionOptions}
            disabled={!sectionOptions.length} onChange={setSectionId} />
        </View>
      </View>
      {!sectionId ? (
        <EmptyState icon="google-classroom" title="Select a Section" message="Choose a class and section to view attendance." />
      ) : !records.length ? (
        <EmptyState icon="google-classroom" title="No Records" message={`No attendance submitted for ${section?.name || 'this section'} in ${MONTH_NAMES[viewMonth]}.`} />
      ) : (
        <View>
          <Text style={s.subTitle}>{section?.name} · {MONTH_NAMES[viewMonth]} {viewYear}</Text>
          {Object.entries(byStudent).map(([studentId2, recs]) => {
            const first = recs[0];
            const name  = first.student?.fullName || first.studentId;
            const sum   = summarise(recs);
            return (
              <View key={studentId2} style={s.studentRow}>
                <View style={s.studentLeft}>
                  <Text style={s.studentName} numberOfLines={1}>{name}</Text>
                  <View style={s.statRow}>
                    <Cell label="P" value={sum.present} color={colors.success} />
                    <Cell label="A" value={sum.absent}  color={colors.danger}  />
                    <Cell label="Tot" value={sum.total} />
                  </View>
                </View>
                <View style={s.studentRight}>
                  <Text style={[s.bigPct, {color: sum.percentage >= 85 ? colors.success : sum.percentage >= 75 ? colors.warning : colors.danger}]}>
                    {sum.percentage}%
                  </Text>
                  <PctBar pct={sum.percentage} height={4} />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const StudentwiseReport = ({branchId, nowYear, nowMonth}) => {
  const [classId,   setClassId]   = useState('');
  const [sectionId, setSectionId] = useState('');
  const [studentId, setStudentId] = useState('');

  const classesQ   = useQuery({queryKey: ['swClasses', branchId], queryFn: () => classService.getClasses(), enabled: Boolean(branchId)});
  const sectionsQ  = useQuery({queryKey: ['swSections', classId], queryFn: () => sectionService.getSectionsByClass(classId), enabled: Boolean(classId)});
  const studentsQ  = useQuery({queryKey: ['swStudents', sectionId], queryFn: () => studentService.getStudentsBySection(sectionId), enabled: Boolean(sectionId)});

  const classes  = useMemo(() => (classesQ.data  || []).filter(c => !c.branchId || c.branchId === branchId), [classesQ.data, branchId]);
  const sections = useMemo(() => sectionsQ.data  || [], [sectionsQ.data]);
  const students = useMemo(() => studentsQ.data  || [], [studentsQ.data]);

  const classOptions   = classes.map(c  => ({label: c.name,       value: c.id}));
  const sectionOptions = sections.map(s => ({label: s.name,       value: s.id}));
  const studentOptions = students.map(st => ({label: st.fullName, value: st.id}));

  const nowYearMonth = `${nowYear}-${pad(nowMonth + 1)}`;
  const [vy, setVy] = useState(nowYear);
  const [vm, setVm] = useState(nowMonth);
  const fromDate = `${vy}-${pad(vm + 1)}-01`;
  const toDate   = `${vy}-${pad(vm + 1)}-${pad(new Date(vy, vm + 1, 0).getDate())}`;

  const q = useQuery({
    queryKey: ['reportStudent', studentId, vy, vm],
    queryFn:  () => attendanceService.getAttendance({studentId, fromDate, toDate}),
    enabled:  Boolean(studentId),
    staleTime: 3 * 60 * 1000});
  const records = q.data || [];
  const sum     = useMemo(() => summarise(records), [records]);

  const student = students.find(st => st.id === studentId);

  return (
    <View>
      <View style={s.filterRow}>
        <View style={{flex: 1}}><SelectField label="Class" value={classId} options={classOptions} onChange={v => { setClassId(v); setSectionId(''); setStudentId(''); }} /></View>
        <View style={{flex: 1}}><SelectField label="Section" value={sectionId} options={sectionOptions} disabled={!sectionOptions.length} onChange={v => { setSectionId(v); setStudentId(''); }} /></View>
      </View>
      <SelectField label="Student" value={studentId} options={studentOptions} disabled={!studentOptions.length} onChange={setStudentId} />
      <View style={s.monthNav}>
        <Pressable onPress={() => vm === 0 ? (setVy(y => y - 1), setVm(11)) : setVm(m => m - 1)} hitSlop={8}>
          <MaterialCommunityIcons name="chevron-left" size={18} color={colors.primary} />
        </Pressable>
        <Text style={s.monthNavText}>{MONTHS[vm]} {vy}</Text>
        <Pressable onPress={() => vm === 11 ? (setVy(y => y + 1), setVm(0)) : setVm(m => m + 1)}
          disabled={vy === nowYear && vm >= nowMonth} hitSlop={8}>
          <MaterialCommunityIcons name="chevron-right" size={18}
            color={vy === nowYear && vm >= nowMonth ? colors.border : colors.primary} />
        </Pressable>
      </View>
      {!studentId ? (
        <EmptyState icon="account-search" title="Select a Student" />
      ) : q.isLoading ? (
        <Text style={s.loading}>Loading…</Text>
      ) : !records.length ? (
        <EmptyState icon="account-search" title="No Records" message={`No attendance for ${student?.fullName || 'this student'} in ${MONTHS[vm]} ${vy}.`} />
      ) : (
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>{student?.fullName}</Text>
          <View style={s.statRow}>
            <Cell label="Present"  value={sum.present}      color={colors.success} />
            <Cell label="Absent"   value={sum.absent}       color={colors.danger}  />
            <Cell label="Half Day" value={sum.halfDay}       color="#F97316" />
            <Cell label="Late"     value={sum.late}          color="#EAB308" />
            <Cell label="Medical"  value={sum.medicalLeave}  color="#8B5CF6" />
            <Cell label="Approved" value={sum.approvedLeave} color="#3B82F6" />
          </View>
          <View style={s.barRow}>
            <PctBar pct={sum.percentage} />
            <Text style={[s.bigPct, {color: sum.percentage >= 85 ? colors.success : sum.percentage >= 75 ? colors.warning : colors.danger}]}>
              {sum.percentage}%
            </Text>
          </View>
          {records.sort((a, b) => a.attendanceDate.localeCompare(b.attendanceDate)).map(r => {
            const status = r.status;
            const color  = ATTENDANCE_STATUS_COLORS[status] || '#94A3B8';
            return (
              <View key={r.id} style={s.dayRow}>
                <Text style={s.dayDate}>{r.attendanceDate}</Text>
                <View style={[s.dayBadge, {backgroundColor: `${color}18`, borderColor: `${color}40`}]}>
                  <Text style={[s.dayStatus, {color}]}>{ATTENDANCE_STATUS_LABELS[status] || status}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const LowAttendanceReport = ({branchId, academicYearId, viewYear, viewMonth}) => {
  const [threshold, setThreshold] = useState(75);
  const yearMonth = `${viewYear}-${pad(viewMonth + 1)}`;
  const fromDate  = `${viewYear}-${pad(viewMonth + 1)}-01`;
  const toDate    = `${viewYear}-${pad(viewMonth + 1)}-${pad(new Date(viewYear, viewMonth + 1, 0).getDate())}`;

  const q = useQuery({
    queryKey: ['reportLow', branchId, academicYearId, threshold, viewYear, viewMonth],
    queryFn:  async () => {
      const allRecords = await attendanceService.getMonthlyReport({branchId, fromDate, toDate, limit: 10000});
      const byStudent  = groupBy(allRecords, r => r.studentId);
      return Object.entries(byStudent).map(([studentId2, recs]) => {
        const first = recs[0];
        const sum   = summarise(recs);
        return {
          studentId: studentId2,
          name:    first.student?.fullName || first.studentId,
          section: first.section?.name || '',
          class:   first.academicClass?.name || '',
          ...sum};
      }).filter(r => r.percentage < threshold)
        .sort((a, b) => a.percentage - b.percentage);
    },
    enabled:  Boolean(branchId),
    staleTime: 5 * 60 * 1000});

  const lowStudents = q.data || [];

  return (
    <View>
      <View style={s.thresholdRow}>
        <Text style={s.thresholdLabel}>Threshold:</Text>
        {THRESHOLDS.map(t => (
          <Pressable key={t} onPress={() => setThreshold(t)}
            style={[s.thresholdChip, threshold === t && s.thresholdChipActive]}>
            <Text style={[s.thresholdText, threshold === t && s.thresholdTextActive]}>
              &lt;{t}%
            </Text>
          </Pressable>
        ))}
      </View>
      {q.isLoading ? (
        <Text style={s.loading}>Calculating…</Text>
      ) : !lowStudents.length ? (
        <EmptyState
          icon="check-all"
          title={`All above ${threshold}%`}
          message={`No students below ${threshold}% attendance in ${MONTH_NAMES[viewMonth]} ${viewYear}.`}
        />
      ) : (
        <View>
          <View style={s.lowHeader}>
            <MaterialCommunityIcons name="alert-circle" size={14} color={colors.danger} />
            <Text style={s.lowHeaderText}>
              {lowStudents.length} student{lowStudents.length !== 1 ? 's' : ''} below {threshold}%
            </Text>
          </View>
          {lowStudents.map(st => (
            <View key={st.studentId} style={s.lowRow}>
              <View style={s.studentLeft}>
                <Text style={s.studentName} numberOfLines={1}>{st.name}</Text>
                <Text style={s.studentMeta}>{st.class} {st.section}</Text>
                <View style={s.statRow}>
                  <Cell label="P" value={st.present} color={colors.success} />
                  <Cell label="A" value={st.absent}  color={colors.danger} />
                  <Cell label="Tot" value={st.total} />
                </View>
              </View>
              <View style={s.studentRight}>
                <Text style={[s.bigPct, {color: st.percentage >= 75 ? colors.warning : colors.danger}]}>
                  {st.percentage}%
                </Text>
                <PctBar pct={st.percentage} height={4} />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const AcademicYearReport = ({branchId, academicYear}) => {
  const fromDate = academicYear?.startDate;
  const toDate   = academicYear?.endDate || toISODate();
  const q = useQuery({
    queryKey: ['reportAY', branchId, academicYear?.id],
    queryFn:  () => attendanceService.getMonthlyReport({branchId, fromDate, toDate, limit: 50000}),
    enabled:  Boolean(branchId && fromDate),
    staleTime: 5 * 60 * 1000});
  const records = q.data || [];
  const total   = useMemo(() => summarise(records), [records]);
  const byMonth = useMemo(() => {
    const m = groupBy(records, r => r.attendanceDate.slice(0, 7));
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b));
  }, [records]);

  if (q.isLoading) { return <Text style={s.loading}>Loading…</Text>; }
  if (!records.length) { return <EmptyState icon="calendar-range" title="No Records" message="No attendance data for the academic year." />; }
  return (
    <View>
      <View style={s.summaryCard}>
        <Text style={s.summaryTitle}>{academicYear?.name || 'Academic Year'} — Branch Total</Text>
        <View style={s.statRow}>
          <Cell label="Present" value={total.present} color={colors.success} />
          <Cell label="Absent"  value={total.absent}  color={colors.danger}  />
          <Cell label="Half Day" value={total.halfDay} color="#F97316" />
          <Cell label="Total"   value={total.total} />
          <Cell label="Overall %" value={`${total.percentage}%`}
            color={total.percentage >= 85 ? colors.success : total.percentage >= 75 ? colors.warning : colors.danger} />
        </View>
        <PctBar pct={total.percentage} height={8} />
      </View>
      {byMonth.map(([ym, recs]) => {
        const sum  = summarise(recs);
        const [y, m] = ym.split('-');
        return (
          <View key={ym} style={s.sectionBlock}>
            <Text style={s.sectionName}>{MONTHS[parseInt(m, 10) - 1]} {y}</Text>
            <View style={s.barRow}>
              <Cell label="P" value={sum.present} color={colors.success} />
              <Cell label="A" value={sum.absent}  color={colors.danger} />
              <Cell label="Tot" value={sum.total} />
              <PctBar pct={sum.percentage} />
              <Text style={[s.barPct, {color: sum.percentage >= 85 ? colors.success : sum.percentage >= 75 ? colors.warning : colors.danger}]}>
                {sum.percentage}%
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

// ── Main screen ────────────────────────────────────────────────────────────────
const AttendanceReportsScreen = () => {
  const user             = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const branchId         = user?.branchId;
  const academicYearId   = activeAcademicYear?.id;

  // Compute "now" at render time so these stay fresh if the screen is mounted across midnight
  const {nowYear, nowMonth, today} = useMemo(() => {
    const n = new Date();
    return {nowYear: n.getFullYear(), nowMonth: n.getMonth(), today: toISODate()};
  }, []);

  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewYear,     setViewYear]     = useState(nowYear);
  const [viewMonth,    setViewMonth]    = useState(nowMonth);

  const classesQ = useQuery({
    queryKey: ['reportClasses', branchId],
    queryFn:  () => classService.getClasses(),
    enabled:  Boolean(branchId)});
  const classes = useMemo(
    () => (classesQ.data || []).filter(c => !c.branchId || c.branchId === branchId),
    [classesQ.data, branchId],
  );

  const prevMonth = () => viewMonth === 0
    ? (setViewYear(y => y - 1), setViewMonth(11))
    : setViewMonth(m => m - 1);
  const nextMonth = () => {
    if (viewYear === nowYear && viewMonth >= nowMonth) { return; }
    viewMonth === 11 ? (setViewYear(y => y + 1), setViewMonth(0)) : setViewMonth(m => m + 1);
  };

  const needsMonthNav = ['monthly', 'classwise', 'section', 'low'].includes(reportType);

  return (
    <View style={s.root}>
      <ReportTypePicker value={reportType} onChange={setReportType} />

      {needsMonthNav ? (
        <View style={s.monthNav}>
          <Pressable onPress={prevMonth} hitSlop={8}>
            <MaterialCommunityIcons name="chevron-left" size={18} color={colors.primary} />
          </Pressable>
          <Text style={s.monthNavText}>{MONTH_NAMES[viewMonth]} {viewYear}</Text>
          <Pressable
            onPress={nextMonth}
            disabled={viewYear === nowYear && viewMonth >= nowMonth}
            hitSlop={8}>
            <MaterialCommunityIcons name="chevron-right" size={18}
              color={viewYear === nowYear && viewMonth >= nowMonth ? colors.border : colors.primary} />
          </Pressable>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Animated.View>
          {reportType === 'daily'   && (
            <DailyReport branchId={branchId} selectedDate={selectedDate} />
          )}
          {reportType === 'monthly' && (
            <MonthlyReport branchId={branchId} viewYear={viewYear} viewMonth={viewMonth} />
          )}
          {reportType === 'academic' && (
            <AcademicYearReport branchId={branchId} academicYear={activeAcademicYear} />
          )}
          {reportType === 'classwise' && (
            <ClasswiseReport branchId={branchId} viewYear={viewYear} viewMonth={viewMonth} />
          )}
          {reportType === 'section' && (
            <SectionwiseReport branchId={branchId} viewYear={viewYear} viewMonth={viewMonth} classes={classes} />
          )}
          {reportType === 'student' && (
            <StudentwiseReport branchId={branchId} nowYear={nowYear} nowMonth={nowMonth} />
          )}
          {reportType === 'low' && (
            <LowAttendanceReport
              branchId={branchId}
              academicYearId={academicYearId}
              viewYear={viewYear}
              viewMonth={viewMonth}
            />
          )}
        </Animated.View>
        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:    {backgroundColor: colors.background, flex: 1},
  content: {padding: spacing.lg},
  loading: {color: colors.textMuted, fontSize: 13, fontWeight: '600', padding: spacing.xl, textAlign: 'center'},

  summaryCard:   {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, marginBottom: spacing.md, padding: spacing.md, ...shadows.clay},
  summaryTitle:  {color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: spacing.sm},
  subTitle:      {color: colors.textMuted, fontSize: 12, fontWeight: '700', marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5},
  sectionBlock:  {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, marginBottom: spacing.sm, padding: spacing.sm},
  sectionName:   {color: colors.text, fontSize: 13, fontWeight: '800', marginBottom: 4},
  statRow:       {alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: 4},
  barRow:        {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  barPct:        {fontSize: 12, fontWeight: '800', minWidth: 36, textAlign: 'right'},
  bigPct:        {fontSize: 16, fontWeight: '900', minWidth: 46, textAlign: 'right'},
  filterRow:     {flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm},
  monthNav:      {alignItems: 'center', backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm},
  monthNavText:  {color: colors.text, fontSize: 14, fontWeight: '800'},

  studentRow:    {alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm, padding: spacing.sm},
  studentLeft:   {flex: 1},
  studentRight:  {alignItems: 'flex-end', minWidth: 60, gap: 4},
  studentName:   {color: colors.text, fontSize: 13, fontWeight: '700'},
  studentMeta:   {color: colors.textMuted, fontSize: 10, fontWeight: '600'},

  lowHeader:     {alignItems: 'center', backgroundColor: `${colors.danger}10`, borderRadius: radius.sm, flexDirection: 'row', gap: 6, marginBottom: spacing.sm, padding: spacing.sm},
  lowHeaderText: {color: colors.danger, fontSize: 13, fontWeight: '700'},
  lowRow:        {alignItems: 'center', backgroundColor: colors.surface, borderColor: `${colors.danger}30`, borderRadius: radius.sm, borderWidth: 1.5, flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm, padding: spacing.sm},

  thresholdRow:  {alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm},
  thresholdLabel:{color: colors.textMuted, fontSize: 12, fontWeight: '700'},
  thresholdChip: {borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1.5, paddingHorizontal: spacing.sm, paddingVertical: 4},
  thresholdChipActive: {backgroundColor: colors.danger, borderColor: colors.danger},
  thresholdText: {color: colors.textMuted, fontSize: 12, fontWeight: '700'},
  thresholdTextActive: {color: colors.white},

  dayRow:   {alignItems: 'center', borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4},
  dayDate:  {color: colors.textMuted, fontSize: 12, fontWeight: '600'},
  dayBadge: {borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 2},
  dayStatus:{fontSize: 11, fontWeight: '700'}});

const rt = StyleSheet.create({
  row:          {flexDirection: 'row', gap: spacing.sm, padding: spacing.sm},
  chip:         {alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1.5, flexDirection: 'row', gap: 5, paddingHorizontal: spacing.md, paddingVertical: 6},
  chipActive:   {backgroundColor: colors.primary, borderColor: colors.primary},
  chipText:     {color: colors.textMuted, fontSize: 11, fontWeight: '700'},
  chipTextActive: {color: colors.white}});

const cell = StyleSheet.create({
  wrap: {alignItems: 'center'},
  val:  {color: colors.text, fontSize: 15, fontWeight: '800'},
  lbl:  {color: colors.textMuted, fontSize: 9, fontWeight: '700'}});

export default AttendanceReportsScreen;
