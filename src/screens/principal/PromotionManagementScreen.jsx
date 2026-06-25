import React, {useCallback, useMemo, useState} from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {ConfirmationModal, EmptyState, SelectField} from '../../components';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import academicYearService from '../../services/academicYear/academicYearService';
import feeService from '../../services/fees/feeService';
import {getAccessScope} from '../../services/rbacScope';
import {formatCurrency} from '../../utils/formatters/currency';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';

// Promotion status options
const PROMOTION_STATUS = {
  PROMOTED: 'PROMOTED',
  REPEATED: 'REPEATED',
  DROPPED: 'DROPPED',
  TRANSFERRED: 'TRANSFERRED'};

const STATUS_META = {
  PROMOTED:    {label: 'Promote',   icon: 'arrow-up-circle',         color: colors.success},
  REPEATED:    {label: 'Repeat',    icon: 'refresh-circle',          color: colors.warning},
  DROPPED:     {label: 'Drop',      icon: 'account-remove',          color: colors.danger},
  TRANSFERRED: {label: 'Transfer',  icon: 'transfer-right',          color: colors.info || '#0ea5e9'}};

const StudentDecisionRow = ({student, decision, onDecide, sections, targetSectionId, onTargetSection}) => {
  const meta = STATUS_META[decision] || {};
  const needsTarget = decision === PROMOTION_STATUS.PROMOTED;

  const targetOptions = useMemo(
    () => sections.map(s => ({label: `${s.academicClass?.name}-${s.name}`, value: s.id})),
    [sections],
  );

  return (
    <Animated.View style={row.wrap}>
      <View style={row.info}>
        <Text style={row.name} numberOfLines={1}>{student.fullName}</Text>
        <Text style={row.sub}>{student.studentId} · {student.academicClass?.name || ''}–{student.section?.name || ''}</Text>
      </View>

      {/* 4 decision buttons */}
      <View style={row.btns}>
        {Object.entries(STATUS_META).map(([status, m]) => (
          <Pressable
            key={status}
            onPress={() => onDecide(student.id, status)}
            style={[row.btn, decision === status && {backgroundColor: `${m.color}20`, borderColor: m.color}]}>
            <MaterialCommunityIcons
              name={m.icon}
              size={14}
              color={decision === status ? m.color : colors.textMuted}
            />
            <Text style={[row.btnLabel, decision === status && {color: m.color}]}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Target section selector — only for PROMOTED */}
      {needsTarget ? (
        <View style={row.targetWrap}>
          <SelectField
            label="Promote to section"
            value={targetSectionId || ''}
            options={targetOptions}
            onChange={onTargetSection}
          />
        </View>
      ) : null}
    </Animated.View>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const PromotionManagementScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();

  const academicYear = academicYearService.getCurrentStartYear(user?.branchId);
  const nextAcademicYear = academicYear + 1;

  // Step: 'class' → 'students'
  const [step, setStep] = useState('class');
  const [selectedFromSectionId, setSelectedFromSectionId] = useState('');
  // Map of studentId → {status, toSectionId}
  const [decisions, setDecisions] = useState({});
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load all sections for current year (the "from" sections)
  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () => sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId)});

  // Load all sections for next year (the "to" sections for promoted students)
  const nextSectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, nextAcademicYear],
    queryFn: () => sectionService.getSections({branchId: user.branchId, academicYear: nextAcademicYear}, scope),
    enabled: Boolean(user?.branchId)});

  const allSections = useMemo(() => sectionsQuery.data?.sections || [], [sectionsQuery.data]);
  const nextSections = useMemo(() => nextSectionsQuery.data?.sections || [], [nextSectionsQuery.data]);

  // Group sections by class for the from-selector
  const sectionsByClass = useMemo(() => {
    const map = {};
    allSections.forEach(s => {
      const key = s.academicClass?.name || 'Unknown';
      if (!map[key]) { map[key] = []; }
      map[key].push(s);
    });
    return map;
  }, [allSections]);

  const fromOptions = useMemo(
    () => allSections.map(s => ({
      label: `${s.academicClass?.name}-${s.name}`,
      value: s.id})),
    [allSections],
  );

  const fromSection = allSections.find(s => s.id === selectedFromSectionId);
  const fromClassName = fromSection?.academicClass?.name;

  // Next-class sections filtered by class (one class up from selected)
  const eligibleNextSections = useMemo(() => {
    if (!fromClassName) { return nextSections; }
    // Get numeric part of class name e.g. "Class 3" → 3
    const match = fromClassName.match(/(\d+)/);
    const num = match ? parseInt(match[1], 10) : null;
    if (!num) { return nextSections; }
    return nextSections.filter(s => {
      const nm = s.academicClass?.name?.match(/(\d+)/);
      return nm && parseInt(nm[1], 10) === num + 1;
    });
  }, [fromClassName, nextSections]);

  // Load students in the selected from-section
  const studentsQuery = useQuery({
    queryKey: ['sectionStudents', selectedFromSectionId],
    queryFn: () => studentService.getStudentsBySection(selectedFromSectionId),
    enabled: Boolean(selectedFromSectionId && step === 'students')});

  const students = useMemo(() => studentsQuery.data || [], [studentsQuery.data]);

  // Outstanding-dues check: load each student's fee profile so the principal
  // can see who still owes fees before promoting. Dues are not blocked — they
  // carry forward automatically into the next year's fee plan.
  const duesQuery = useQuery({
    queryKey: ['promotionDues', selectedFromSectionId, students.map(s => s.id).join(',')],
    queryFn: async () => {
      const profiles = await Promise.all(
        students.map(s =>
          feeService.getStudentFeeProfile(s.id, scope).catch(() => null),
        ),
      );
      const map = {};
      profiles.forEach(p => {
        if (p?.studentId) {
          map[p.studentId] = Number(p.dueAmount || 0);
        }
      });
      return map;
    },
    enabled: Boolean(step === 'students' && students.length)});

  const duesByStudent = duesQuery.data || {};
  const studentsWithDues = students.filter(s => Number(duesByStudent[s.id] || 0) > 0);
  const totalOutstanding = studentsWithDues.reduce((sum, s) => sum + Number(duesByStudent[s.id] || 0), 0);

  // Initialize decisions when students load
  React.useEffect(() => {
    if (students.length) {
      setDecisions(prev => {
        const next = {...prev};
        students.forEach(s => {
          if (!next[s.id]) {
            next[s.id] = {status: PROMOTION_STATUS.PROMOTED, toSectionId: ''};
          }
        });
        return next;
      });
    }
  }, [students]);

  const setDecision = useCallback((studentId, status) => {
    setDecisions(prev => ({
      ...prev,
      [studentId]: {...(prev[studentId] || {}), status, toSectionId: prev[studentId]?.toSectionId || ''}}));
  }, []);

  const setTargetSection = useCallback((studentId, toSectionId) => {
    setDecisions(prev => ({
      ...prev,
      [studentId]: {...(prev[studentId] || {}), toSectionId}}));
  }, []);

  // Progress tracking
  const totalStudents = students.length;
  const reviewed = students.filter(s => {
    const d = decisions[s.id];
    if (!d) { return false; }
    if (d.status === PROMOTION_STATUS.PROMOTED && !d.toSectionId) { return false; }
    return Boolean(d.status);
  }).length;
  const allReviewed = reviewed === totalStudents && totalStudents > 0;

  const handleApplyAll = async () => {
    setSubmitting(true);
    setError('');
    try {
      for (const student of students) {
        const d = decisions[student.id];
        if (!d?.status) { continue; }
        const toSection = d.toSectionId
          ? (nextSections.find(s => s.id === d.toSectionId) || null)
          : null;

        await academicYearService.recordStudentPromotion({
          branchId: user.branchId,
          studentId: student.id,
          fromClassId: fromSection.academicClassId,
          fromSectionId: fromSection.id,
          toClassId: toSection?.academicClassId || null,
          toSectionId: toSection?.id || null,
          promotionStatus: d.status,
          academicYear});

        if (d.status === PROMOTION_STATUS.PROMOTED && toSection) {
          await academicYearService.applyStudentPromotion({
            studentId: student.id,
            toSectionId: toSection.id,
            toClassId: toSection.academicClassId,
            branchId: user.branchId,
            fromClassId: fromSection.academicClassId,
            fromSectionId: fromSection.id,
            academicYear,
            promotionStatus: d.status});
        }
      }

      queryClient.invalidateQueries({queryKey: ['sectionStudents', selectedFromSectionId]});
      queryClient.invalidateQueries({queryKey: ['studentsByBranch', user?.branchId]});
      navigation.navigate('PromotionHistory');
    } catch (err) {
      setError(err.message || 'Promotion failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 1: class/section selection ────────────────────────────────────────
  if (step === 'class') {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={styles.header}>
          <View style={styles.headerDecor} />
          <Text style={styles.headerOverline}>Academic Year {academicYear}–{String(nextAcademicYear).slice(-2)}</Text>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Promotions</Text>
            <Pressable onPress={() => navigation.navigate('PromotionHistory')} style={styles.historyBtn}>
              <MaterialCommunityIcons name="history" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.historyBtnText}>History</Text>
            </Pressable>
          </View>
          <Text style={styles.headerSub}>
            Select a section to review and promote students one by one
          </Text>
        </Animated.View>

        <Animated.View style={styles.formCard}>
          <SelectField
            label="Select Section to Promote"
            value={selectedFromSectionId}
            options={fromOptions}
            onChange={setSelectedFromSectionId}
          />
          {fromSection ? (
            <View style={styles.sectionInfo}>
              <MaterialCommunityIcons name="information-outline" size={14} color={colors.primary} />
              <Text style={styles.sectionInfoText}>
                Students in {fromSection.academicClass?.name}-{fromSection.name} will be reviewed individually.
              </Text>
            </View>
          ) : null}
        </Animated.View>

        <Pressable
          onPress={() => { setStep('students'); setDecisions({}); }}
          disabled={!selectedFromSectionId}
          style={[styles.proceedBtn, !selectedFromSectionId && styles.proceedBtnDisabled]}>
          <MaterialCommunityIcons name="arrow-right-circle" size={20} color={colors.white} />
          <Text style={styles.proceedBtnText}>Review Students</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ── Step 2: per-student decisions ──────────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.studentHeader}>
        <Pressable onPress={() => setStep('class')} style={styles.backBtn} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.studentHeaderTitle}>
            {fromSection?.academicClass?.name}-{fromSection?.name}
          </Text>
          <Text style={styles.progressText}>{reviewed}/{totalStudents} reviewed</Text>
        </View>
        <View style={[styles.progressDot, allReviewed && styles.progressDotDone]} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, {width: `${totalStudents ? (reviewed / totalStudents) * 100 : 0}%`}]} />
      </View>

      <FlatList
        data={students}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.studentList}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <StudentDecisionRow
            student={item}
            decision={decisions[item.id]?.status || ''}
            onDecide={setDecision}
            sections={eligibleNextSections}
            targetSectionId={decisions[item.id]?.toSectionId}
            onTargetSection={sectionId => setTargetSection(item.id, sectionId)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title={studentsQuery.isLoading ? 'Loading students…' : 'No students'}
            message="No active students in this section."
          />
        }
        ListFooterComponent={<View style={{height: 100}} />}
      />

      {/* Sticky footer */}
      <View style={styles.footer}>
        {Boolean(error) ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
        {!allReviewed && totalStudents > 0 ? (
          <Text style={styles.pendingText}>
            {totalStudents - reviewed} student{totalStudents - reviewed !== 1 ? 's' : ''} pending review
          </Text>
        ) : null}
        {studentsWithDues.length > 0 ? (
          <Text style={styles.duesText}>
            {studentsWithDues.length} student{studentsWithDues.length !== 1 ? 's have' : ' has'} pending dues ({formatCurrency(totalOutstanding)}) — will carry forward
          </Text>
        ) : null}
        <Pressable
          onPress={() => setConfirmVisible(true)}
          disabled={!allReviewed || submitting}
          style={[styles.applyBtn, (!allReviewed || submitting) && styles.applyBtnDisabled]}>
          <MaterialCommunityIcons
            name={submitting ? 'loading' : 'check-circle-outline'}
            size={20}
            color={colors.white}
          />
          <Text style={styles.applyBtnText}>
            {submitting ? 'Applying…' : `Apply Promotions (${totalStudents} students)`}
          </Text>
        </Pressable>
      </View>

      <ConfirmationModal
        visible={confirmVisible}
        title="Apply Promotions?"
        message={`This will apply promotion decisions for all ${totalStudents} students in ${fromSection?.academicClass?.name}-${fromSection?.name}.${studentsWithDues.length > 0 ? ` ${studentsWithDues.length} student(s) have pending dues of ${formatCurrency(totalOutstanding)}, which will carry forward to the new academic year.` : ''} Students marked DROPPED will be deactivated. This cannot be undone.`}
        confirmLabel="Yes, Apply"
        cancelLabel="Cancel"
        onConfirm={() => { setConfirmVisible(false); handleApplyAll(); }}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},

  header: {
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  headerDecor: {backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 80, height: 130, position: 'absolute', right: -20, top: -40, width: 130},
  headerOverline: {color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase'},
  headerRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  historyBtn: {alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.pill, flexDirection: 'row', gap: 5, paddingHorizontal: spacing.md, paddingVertical: 5},
  historyBtnText: {color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700'},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 6},

  formCard: {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, marginBottom: spacing.md, padding: spacing.md, ...shadows.clay},
  sectionInfo: {alignItems: 'center', backgroundColor: `${colors.primary}10`, borderRadius: radius.sm, flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm, padding: spacing.sm},
  sectionInfoText: {color: colors.primary, flex: 1, fontSize: 12, fontWeight: '500'},

  proceedBtn: {alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.card, flexDirection: 'row', gap: spacing.sm, height: 52, justifyContent: 'center', ...shadows.fab},
  proceedBtnDisabled: {backgroundColor: colors.border},
  proceedBtnText: {color: colors.white, fontSize: 15, fontWeight: '700'},

  // Step 2
  studentHeader: {alignItems: 'center', backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.md},
  backBtn: {padding: 4},
  headerCopy: {flex: 1},
  studentHeaderTitle: {color: colors.text, fontSize: 16, fontWeight: '800'},
  progressText: {color: colors.textMuted, fontSize: 12, fontWeight: '600'},
  progressDot: {backgroundColor: colors.border, borderRadius: 8, height: 16, width: 16},
  progressDotDone: {backgroundColor: colors.success},
  progressTrack: {backgroundColor: colors.border, height: 3},
  progressFill: {backgroundColor: colors.primary, height: 3},
  studentList: {padding: spacing.md, paddingBottom: 8},

  footer: {backgroundColor: colors.surface, borderColor: colors.border, borderTopWidth: 1.5, bottom: 0, left: 0, padding: spacing.md, position: 'absolute', right: 0, ...shadows.clay},
  errorText: {color: colors.danger, fontSize: 12, fontWeight: '600', marginBottom: spacing.xs, textAlign: 'center'},
  pendingText: {color: colors.warning, fontSize: 12, fontWeight: '600', marginBottom: spacing.xs, textAlign: 'center'},
  duesText: {color: colors.danger, fontSize: 12, fontWeight: '600', marginBottom: spacing.xs, textAlign: 'center'},
  applyBtn: {alignItems: 'center', backgroundColor: colors.success, borderRadius: radius.lg, flexDirection: 'row', gap: spacing.sm, height: 48, justifyContent: 'center'},
  applyBtnDisabled: {backgroundColor: colors.border},
  applyBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'}});

// Student row styles
const row = StyleSheet.create({
  wrap: {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, marginBottom: spacing.sm, padding: spacing.md, ...shadows.clay},
  info: {marginBottom: spacing.sm},
  name: {color: colors.text, fontSize: 14, fontWeight: '700'},
  sub: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  btns: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs},
  btn: {alignItems: 'center', borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1.5, flexDirection: 'row', gap: 3, paddingHorizontal: spacing.sm, paddingVertical: 5},
  btnLabel: {color: colors.textMuted, fontSize: 11, fontWeight: '700'},
  targetWrap: {marginTop: spacing.sm}});

export default PromotionManagementScreen;
