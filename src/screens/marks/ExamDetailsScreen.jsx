import React, {useState} from 'react';
import {ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {EXAM_STATUS, EXAM_TYPE_LABELS} from '../../config/constants';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import examService, {canDeleteExam, canManageExams, canPublishResults, canUnpublishResults} from '../../services/marks/examService';
import marksService from '../../services/marks/marksService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const STATUS_COLOR = {
  [EXAM_STATUS.DRAFT]: colors.warning,
  [EXAM_STATUS.PUBLISHED]: colors.success,
  [EXAM_STATUS.ARCHIVED]: colors.textSoft};

const SectionRow = ({es, examName, onEnterMarks, onPublish, onUnpublish, canPublish, canUnpub, delay}) => {
  const color = es.isPublished ? colors.success : colors.warning;
  return (
    <Animated.View style={styles.sectionRow}>
      <View style={styles.sectionLeft}>
        <Text style={styles.sectionName}>
          {es.section?.academicClass?.name} — {es.section?.name}
        </Text>
        <View style={[styles.pubBadge, {backgroundColor: `${color}18`}]}>
          <Text style={[styles.pubText, {color}]}>{es.isPublished ? 'Published' : 'Draft'}</Text>
        </View>
      </View>
      <View style={styles.sectionActions}>
        <Pressable
          onPress={() => onEnterMarks(es)}
          style={({pressed}) => [styles.iconBtn, pressed && {opacity: 0.7}]}>
          <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.primary} />
        </Pressable>
        {canPublish && !es.isPublished && (
          <Pressable
            onPress={() => onPublish(es)}
            style={({pressed}) => [styles.iconBtn, {backgroundColor: `${colors.success}15`}, pressed && {opacity: 0.7}]}>
            <MaterialCommunityIcons name="publish" size={18} color={colors.success} />
          </Pressable>
        )}
        {canUnpub && es.isPublished && (
          <Pressable
            onPress={() => onUnpublish(es)}
            style={({pressed}) => [styles.iconBtn, {backgroundColor: `${colors.danger}12`}, pressed && {opacity: 0.7}]}>
            <MaterialCommunityIcons name="eye-off-outline" size={18} color={colors.danger} />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

const ExamDetailsScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {examId} = route.params;
  const user = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const role = user?.role;

  const [publishing, setPublishing] = useState(null);

  const {data: exam, isLoading, isError, refetch} = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examService.getExamDetails(examId, true),
    enabled: Boolean(examId)});

  const handlePublish = async es => {
    Alert.alert(
      'Publish Results',
      `Once published, parents and students will be able to view results for ${es.section?.academicClass?.name} — ${es.section?.name}.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Publish',
          style: 'default',
          onPress: async () => {
            try {
              setPublishing(es.id);
              await marksService.publishResults(
                es.id,
                user.id,
                examId,
                es.sectionId,
                exam?.name,
                user.branchId,
                activeAcademicYear?.id,
                role,
              );
              Toast.show({type: 'success', text1: 'Results published'});
              refetch();
            } catch (err) {
              Toast.show({type: 'error', text1: err.message});
            } finally {
              setPublishing(null);
            }
          }},
      ],
    );
  };

  const handleUnpublish = async es => {
    Alert.alert('Unpublish Results', 'Parents will no longer be able to view these results.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Unpublish',
        style: 'destructive',
        onPress: async () => {
          try {
            await marksService.unpublishResults(es.id, role);
            Toast.show({type: 'success', text1: 'Results unpublished'});
            refetch();
          } catch (err) {
            Toast.show({type: 'error', text1: err.message});
          }
        }},
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Exam', 'This will permanently remove the exam and all its marks.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await examService.deleteExam(examId, role);
            Toast.show({type: 'success', text1: 'Exam deleted'});
            navigation.goBack();
          } catch (err) {
            Toast.show({type: 'error', text1: err.message});
          }
        }},
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centred}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !exam) {
    return (
      <View style={styles.centred}>
        <MaterialCommunityIcons name="alert-circle-outline" size={40} color={colors.danger} />
        <Text style={styles.errorText}>Failed to load exam</Text>
        <Pressable onPress={refetch} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const statusColor = STATUS_COLOR[exam.status] || colors.textSoft;
  const subjectCount = exam.examSubjectConfigs?.length || 0;

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      {/* Header */}
      <Animated.View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.white} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>{exam.name}</Text>
            <Text style={styles.headerSub}>{EXAM_TYPE_LABELS[exam.examType] || exam.examType}</Text>
          </View>
          {canManageExams(role) && (
            <Pressable
              onPress={() => navigation.navigate('CreateExam', {exam})}
              style={styles.editBtn}>
              <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.white} />
            </Pressable>
          )}
        </View>
        <View style={styles.headerChips}>
          <View style={[styles.statusChip, {backgroundColor: `${statusColor}25`}]}>
            <Text style={[styles.statusText, {color: statusColor}]}>{exam.status}</Text>
          </View>
          {exam.startDate && (
            <View style={styles.dateChip}>
              <MaterialCommunityIcons name="calendar-outline" size={12} color="rgba(255,255,255,0.75)" />
              <Text style={styles.dateText}>{exam.startDate}</Text>
            </View>
          )}
        </View>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
      </Animated.View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
        contentContainerStyle={styles.content}>

        {/* Subject Configs */}
        {subjectCount > 0 && (
          <Animated.View style={styles.card}>
            <Text style={styles.sectionTitle}>Subjects ({subjectCount})</Text>
            {exam.examSubjectConfigs.map((cfg, i) => (
              <View key={cfg.id} style={[styles.subjRow, i < subjectCount - 1 && styles.subjRowBorder]}>
                <Text style={styles.subjName}>{cfg.subjectName}</Text>
                <Text style={styles.subjMarks}>Max: {cfg.maxMarks} · Pass: {cfg.passingMarks}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Add Subject Config */}
        {canManageExams(role) && (
          <Pressable
            onPress={() => navigation.navigate('MarksEntry', {examId, exam, addSubject: true})}
            style={({pressed}) => [styles.outlineBtn, pressed && {opacity: 0.8}]}>
            <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
            <Text style={styles.outlineBtnText}>Configure Subjects & Marks</Text>
          </Pressable>
        )}

        {/* Sections */}
        <Animated.View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Sections ({exam.examSections?.length || 0})</Text>
            {canManageExams(role) && (
              <Pressable onPress={() => navigation.navigate('MarksEntry', {examId, exam})} style={styles.addSectionBtn}>
                <MaterialCommunityIcons name="plus" size={14} color={colors.primary} />
                <Text style={styles.addSectionText}>Add Section</Text>
              </Pressable>
            )}
          </View>

          {(exam.examSections || []).length === 0 ? (
            <Text style={styles.emptyText}>No sections added yet.</Text>
          ) : (
            exam.examSections.map((es, i) => (
              <SectionRow
                key={es.id}
                es={es}
                examName={exam.name}
                delay={i * 40}
                canPublish={canPublishResults(role)}
                canUnpub={canUnpublishResults(role)}
                onEnterMarks={s => navigation.navigate('MarksEntry', {examId, sectionId: s.sectionId, examSectionId: s.id, exam})}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
              />
            ))
          )}
        </Animated.View>

        {/* Analytics shortcut */}
        {(exam.examSections || []).length > 0 && (
          <Pressable
            onPress={() => navigation.navigate('ExamAnalytics', {examId, exam})}
            style={({pressed}) => [styles.analyticsBtn, pressed && {opacity: 0.85}]}>
            <MaterialCommunityIcons name="chart-bar" size={18} color={colors.white} />
            <Text style={styles.analyticsBtnText}>View Analytics</Text>
          </Pressable>
        )}

        {/* Bulk Upload shortcut */}
        {canManageExams(role) && (
          <Pressable
            onPress={() => navigation.navigate('BulkMarksUpload', {examId, exam})}
            style={({pressed}) => [styles.outlineBtn, pressed && {opacity: 0.8}]}>
            <MaterialCommunityIcons name="upload-outline" size={16} color={colors.info} />
            <Text style={[styles.outlineBtnText, {color: colors.info}]}>Bulk Upload Marks</Text>
          </Pressable>
        )}

        {/* Danger zone */}
        {canDeleteExam(role) && exam.status !== EXAM_STATUS.PUBLISHED && (
          <Pressable
            onPress={handleDelete}
            style={({pressed}) => [styles.deleteBtn, pressed && {opacity: 0.8}]}>
            <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.danger} />
            <Text style={styles.deleteBtnText}>Delete Exam</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  centred: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md},
  header: {
    ...shadows.clayDeep,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.hero,
    borderBottomRightRadius: radius.hero,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md},
  headerRow: {flexDirection: 'row', alignItems: 'center'},
  backBtn: {padding: 4},
  editBtn: {padding: 4},
  headerCenter: {flex: 1, alignItems: 'center'},
  headerTitle: {...typography.subtitle, color: colors.white, fontSize: 17},
  headerSub: {...typography.caption, color: 'rgba(255,255,255,0.75)', marginTop: 2},
  headerChips: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, justifyContent: 'center'},
  statusChip: {borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4},
  statusText: {...typography.captionBold, fontSize: 11},
  dateChip: {flexDirection: 'row', alignItems: 'center', gap: 4},
  dateText: {...typography.caption, color: 'rgba(255,255,255,0.75)', fontSize: 11},
  blob1: {backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 120, position: 'absolute', right: -30, top: -30, width: 120},
  blob2: {backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 80, bottom: -20, height: 90, left: -20, position: 'absolute', width: 90},
  content: {padding: spacing.lg, gap: spacing.md, paddingBottom: 48},
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    padding: spacing.lg},
  cardHeaderRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm},
  sectionTitle: {...typography.heading, color: colors.text, fontSize: 14},
  subjRow: {paddingVertical: spacing.sm},
  subjRowBorder: {borderBottomColor: colors.borderLight, borderBottomWidth: 1},
  subjName: {...typography.body, color: colors.text, fontWeight: '600'},
  subjMarks: {...typography.caption, color: colors.textSoft, marginTop: 2},
  sectionRow: {
    alignItems: 'center',
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm},
  sectionLeft: {flex: 1, gap: 4},
  sectionName: {...typography.body, color: colors.text, fontWeight: '600', fontSize: 13},
  pubBadge: {alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2},
  pubText: {...typography.captionBold, fontSize: 10},
  sectionActions: {flexDirection: 'row', gap: spacing.xs},
  iconBtn: {
    alignItems: 'center',
    backgroundColor: `${colors.primary}12`,
    borderRadius: radius.sm,
    height: 32,
    justifyContent: 'center',
    width: 32},
  addSectionBtn: {flexDirection: 'row', alignItems: 'center', gap: 4},
  addSectionText: {...typography.caption, color: colors.primary, fontWeight: '700'},
  emptyText: {...typography.caption, color: colors.textSoft, textAlign: 'center', paddingVertical: spacing.md},
  outlineBtn: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingVertical: 12},
  outlineBtnText: {...typography.body, color: colors.primary, fontWeight: '700', fontSize: 14},
  analyticsBtn: {
    alignItems: 'center',
    backgroundColor: colors.info,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingVertical: 14},
  analyticsBtnText: {color: colors.white, fontWeight: '800', fontSize: 14},
  deleteBtn: {
    alignItems: 'center',
    borderColor: `${colors.danger}40`,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingVertical: 12},
  deleteBtnText: {...typography.body, color: colors.danger, fontWeight: '700', fontSize: 14},
  errorText: {...typography.body, color: colors.textMuted, marginTop: spacing.sm},
  retryBtn: {backgroundColor: colors.primary, borderRadius: radius.card, paddingHorizontal: spacing.xl, paddingVertical: 10},
  retryText: {color: colors.white, fontWeight: '800'}});

export default ExamDetailsScreen;
