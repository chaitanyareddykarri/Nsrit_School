import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import {canManageExams, canEnterMarks} from '../../services/marks/examService';
import marksService from '../../services/marks/marksService';
import MarksRowInput from '../../components/marks/MarksRowInput';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const MarksEntryScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {examId, sectionId, examSectionId, exam} = route.params || {};
  const user = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const role = user?.role;

  // marks state: { [studentId]: { [subjectName]: string } }
  const [marksMap, setMarksMap] = useState({});
  // absent state: { [studentId]: { [subjectName]: bool } }
  const [absentsMap, setAbsentsMap] = useState({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const autoSaveTimer = useRef({});
  const inputRefsMap = useRef({});

  const {data, isLoading, isError, refetch} = useQuery({
    queryKey: ['marks', examId, sectionId],
    queryFn: () => marksService.getMarksForSection(examId, sectionId),
    enabled: Boolean(examId && sectionId)});

  // On data load, populate local state
  useEffect(() => {
    if (!data) return;
    const mMap = {};
    const aMap = {};
    (data.students || []).forEach(stu => {
      mMap[stu.id] = {};
      aMap[stu.id] = {};
      (data.marks || [])
        .filter(m => m.studentId === stu.id)
        .forEach(m => {
          mMap[stu.id][m.subjectName] = m.marksObtained != null ? String(m.marksObtained) : '';
          aMap[stu.id][m.subjectName] = m.isAbsent || false;
        });
    });
    setMarksMap(mMap);
    setAbsentsMap(aMap);
    setDirty(false);
  }, [data]);

  const subjectConfigs = useMemo(() => data?.subjectConfigs || [], [data]);
  const students = useMemo(() => data?.students || [], [data]);
  const isPublished = data?.isPublished || false;
  const isReadOnly = isPublished || !canEnterMarks(role);

  const handleChange = useCallback(
    (studentId, subjectName, value) => {
      setMarksMap(prev => ({
        ...prev,
        [studentId]: {...(prev[studentId] || {}), [subjectName]: value}}));
      setDirty(true);

      // Auto-save on change, debounced 900ms
      const key = `${studentId}:${subjectName}`;
      clearTimeout(autoSaveTimer.current[key]);
      autoSaveTimer.current[key] = setTimeout(() => {
        const cfg = subjectConfigs.find(c => c.subjectName === subjectName);
        if (!cfg) return;
        const num = parseFloat(value);
        if (value === '' || isNaN(num) || num < 0 || num > cfg.maxMarks) return;
        marksService
          .saveStudentMark({
            examId,
            studentId,
            sectionId,
            branchId: user.branchId,
            academicYearId: activeAcademicYear?.id,
            subjectName,
            marksObtained: num,
            isAbsent: false,
            enteredById: user.id,
            role})
          .catch(() => {});
      }, 900);
    },
    [subjectConfigs, examId, sectionId, user, activeAcademicYear, role],
  );

  const handleAbsentToggle = useCallback(
    (studentId, subjectName) => {
      setAbsentsMap(prev => {
        const newVal = !prev[studentId]?.[subjectName];
        const updated = {...prev, [studentId]: {...(prev[studentId] || {}), [subjectName]: newVal}};
        setDirty(true);
        marksService
          .saveStudentMark({
            examId,
            studentId,
            sectionId,
            branchId: user.branchId,
            academicYearId: activeAcademicYear?.id,
            subjectName,
            marksObtained: null,
            isAbsent: newVal,
            enteredById: user.id,
            role})
          .catch(() => {});
        return updated;
      });
    },
    [examId, sectionId, user, activeAcademicYear, role],
  );

  const handleSaveAll = async () => {
    if (!dirty) return;
    setSaving(true);
    const batch = [];
    students.forEach(stu => {
      subjectConfigs.forEach(cfg => {
        const rawVal = marksMap[stu.id]?.[cfg.subjectName];
        const isAbsent = absentsMap[stu.id]?.[cfg.subjectName] || false;
        const num = rawVal !== '' && rawVal != null ? parseFloat(rawVal) : null;
        if (num !== null || isAbsent) {
          batch.push({
            examId,
            studentId: stu.id,
            sectionId,
            branchId: user.branchId,
            academicYearId: activeAcademicYear?.id,
            subjectName: cfg.subjectName,
            marksObtained: isAbsent ? null : num,
            isAbsent,
            enteredById: user.id,
            role});
        }
      });
    });
    try {
      const report = await marksService.bulkSaveMarks(batch, role);
      if (report.failedCount > 0) {
        Toast.show({
          type: 'error',
          text1: `${report.successCount} saved, ${report.failedCount} failed`});
      } else {
        Toast.show({type: 'success', text1: `All marks saved (${report.successCount})`});
        setDirty(false);
      }
    } catch (err) {
      Toast.show({type: 'error', text1: err.message});
    } finally {
      setSaving(false);
    }
  };

  const renderStudent = useCallback(
    ({item: student}) => (
      <MarksRowInput
        student={student}
        subjects={subjectConfigs}
        values={marksMap[student.id] || {}}
        isAbsents={absentsMap[student.id] || {}}
        isReadOnly={isReadOnly}
        onChange={handleChange}
        onAbsentToggle={handleAbsentToggle}
        inputRefs={(inputRefsMap.current[student.id] = inputRefsMap.current[student.id] || [])}
        onNext={(sid, idx) => {
          const nextRef = inputRefsMap.current[sid]?.[idx + 1];
          if (nextRef) nextRef.focus();
        }}
      />
    ),
    [marksMap, absentsMap, subjectConfigs, isReadOnly, handleChange, handleAbsentToggle],
  );

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.topTitle} numberOfLines={1}>{exam?.name || 'Marks Entry'}</Text>
          {data?.sectionLabel ? (
            <Text style={styles.topSub}>{data.sectionLabel}</Text>
          ) : null}
        </View>
        {isPublished ? (
          <View style={[styles.pubBadge, {backgroundColor: `${colors.success}18`}]}>
            <Text style={[styles.pubText, {color: colors.success}]}>Published</Text>
          </View>
        ) : (
          <View style={{width: 36}} />
        )}
      </View>

      {isLoading ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError || !data ? (
        <View style={styles.centred}>
          <MaterialCommunityIcons name="alert-circle-outline" size={40} color={colors.danger} />
          <Text style={styles.errorText}>Failed to load marks data</Text>
          <Pressable onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Subject header row */}
          <Animated.View style={styles.subjectHeader}>
            <View style={{flex: 1.8}}>
              <Text style={styles.headerCol}>Student</Text>
            </View>
            {subjectConfigs.map(cfg => (
              <View key={cfg.subjectName} style={{flex: 1, alignItems: 'center'}}>
                <Text style={styles.headerCol} numberOfLines={2}>
                  {cfg.subjectName}
                </Text>
                <Text style={styles.maxLabel}>/{cfg.maxMarks}</Text>
              </View>
            ))}
          </Animated.View>

          <FlatList
            data={students}
            keyExtractor={s => s.id}
            renderItem={renderStudent}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
          />

          {/* Save All Footer */}
          {!isReadOnly && (
            <View style={[styles.footer, {paddingBottom: insets.bottom + 8}]}>
              {dirty && (
                <Text style={styles.dirtyHint}>
                  <MaterialCommunityIcons name="circle" size={8} color={colors.warning} /> Unsaved changes
                </Text>
              )}
              <Pressable
                onPress={handleSaveAll}
                disabled={saving || !dirty}
                style={[styles.saveBtn, (saving || !dirty) && {opacity: 0.5}]}>
                {saving ? <ActivityIndicator size="small" color={colors.white} /> : null}
                <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save All Marks'}</Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  topBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md},
  backBtn: {padding: 4},
  headerCenter: {flex: 1},
  topTitle: {...typography.heading, color: colors.text, fontSize: 15},
  topSub: {...typography.caption, color: colors.textSoft, marginTop: 2},
  pubBadge: {borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3},
  pubText: {...typography.captionBold, fontSize: 10},
  centred: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md},
  errorText: {...typography.body, color: colors.textMuted, marginTop: spacing.sm},
  retryBtn: {backgroundColor: colors.primary, borderRadius: radius.card, paddingHorizontal: spacing.xl, paddingVertical: 10},
  retryText: {color: colors.white, fontWeight: '800'},
  subjectHeader: {
    backgroundColor: colors.surfaceAlt,
    borderBottomColor: colors.border,
    borderBottomWidth: 1.5,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8},
  headerCol: {...typography.captionBold, color: colors.textMuted, fontSize: 10, textAlign: 'center', textTransform: 'uppercase'},
  maxLabel: {...typography.caption, color: colors.textSoft, fontSize: 9, textAlign: 'center'},
  list: {paddingBottom: 100},
  footer: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg},
  dirtyHint: {...typography.caption, color: colors.warning, fontWeight: '600', fontSize: 11},
  saveBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingVertical: 14},
  saveBtnText: {color: colors.white, fontSize: 15, fontWeight: '800'}});

export default MarksEntryScreen;
