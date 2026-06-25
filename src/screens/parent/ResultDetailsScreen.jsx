import React, {useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import marksService, {computeGrade} from '../../services/marks/marksService';
import reportCardService from '../../services/marks/reportCardService';
import SubjectResultRow from '../../components/marks/SubjectResultRow';
import GradeChip from '../../components/marks/GradeChip';
import PerformanceBar from '../../components/marks/PerformanceBar';
import VoiceAnnouncementButton from '../../components/common/VoiceAnnouncementButton';
import {TELUGU} from '../../services/tts/teluguTemplates';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const ResultDetailsScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {examId, studentId, examName} = route.params || {};
  const user = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const [downloading, setDownloading] = useState(false);

  const {data, isLoading, isError, refetch} = useQuery({
    queryKey: ['resultDetail', examId, studentId],
    queryFn: () => marksService.getStudentResultDetail(examId, studentId),
    enabled: Boolean(examId && studentId)});

  const handleDownloadReportCard = async () => {
    if (!data) return;
    try {
      setDownloading(true);
      await reportCardService.generateAndShare({
        student: data.student,
        exam: data.exam,
        subjectRows: data.subjectRows,
        totalObtained: data.totalObtained,
        totalMax: data.totalMax,
        percentage: data.percentage,
        grade: data.grade,
        gradeLabel: data.gradeLabel,
        branchName: user?.branchName || '',
        academicYearName: activeAcademicYear?.name || ''});
    } catch (err) {
      Toast.show({type: 'error', text1: err.message});
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centred}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.centred}>
        <MaterialCommunityIcons name="alert-circle-outline" size={40} color={colors.danger} />
        <Text style={styles.errorText}>Failed to load results</Text>
        <Pressable onPress={refetch} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const {grade, gradeLabel, percentage, totalObtained, totalMax, subjectRows} = data;
  const passColor = percentage >= 40 ? colors.success : colors.danger;
  const teluguText = TELUGU.marksPublished(
    data.student?.fullName || '',
    examName || '',
    `${totalObtained} / ${totalMax}`,
  );

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.topTitle} numberOfLines={1}>{examName || 'Result'}</Text>
          <Text style={styles.topSub}>{data.student?.fullName}</Text>
        </View>
        <View style={styles.topActions}>
          <VoiceAnnouncementButton text={teluguText} size={18} />
          <Pressable
            onPress={handleDownloadReportCard}
            disabled={downloading}
            style={styles.dlBtn}>
            {downloading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <MaterialCommunityIcons name="download-outline" size={20} color={colors.primary} />
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 32}]}>
        {/* Performance summary card */}
        <Animated.View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryPerf}>
              <Text style={[styles.bigPct, {color: passColor}]}>{percentage}%</Text>
              <Text style={styles.bigLabel}>Overall</Text>
            </View>
            <GradeChip grade={grade} label={gradeLabel} size="lg" />
          </View>
          <PerformanceBar percentage={parseFloat(percentage)} />
          <View style={styles.summaryStats}>
            <View style={styles.sumItem}>
              <Text style={styles.sumVal}>{totalObtained}</Text>
              <Text style={styles.sumLabel}>Marks Obtained</Text>
            </View>
            <View style={styles.sumDivider} />
            <View style={styles.sumItem}>
              <Text style={styles.sumVal}>{totalMax}</Text>
              <Text style={styles.sumLabel}>Total Marks</Text>
            </View>
            <View style={styles.sumDivider} />
            <View style={styles.sumItem}>
              <Text style={[styles.sumVal, {color: passColor}]}>{percentage >= 40 ? 'Pass' : 'Fail'}</Text>
              <Text style={styles.sumLabel}>Result</Text>
            </View>
          </View>
        </Animated.View>

        {/* Subject marks table */}
        <Animated.View style={styles.card}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCol, {flex: 2}]}>Subject</Text>
            <Text style={styles.headerCol}>Marks</Text>
            <Text style={styles.headerCol}>Max</Text>
            <Text style={styles.headerCol}>Status</Text>
          </View>
          {subjectRows.map(row => (
            <SubjectResultRow
              key={row.subjectName}
              subjectName={row.subjectName}
              marksObtained={row.marksObtained}
              maxMarks={row.maxMarks}
              passingMarks={row.passingMarks}
              isAbsent={row.isAbsent}
            />
          ))}
        </Animated.View>

        {/* Download button */}
        <Animated.View>
          <Pressable
            onPress={handleDownloadReportCard}
            disabled={downloading}
            style={({pressed}) => [styles.downloadBtn, downloading && {opacity: 0.6}, pressed && {opacity: 0.85}]}>
            {downloading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <MaterialCommunityIcons name="file-pdf-box" size={20} color={colors.white} />
            )}
            <Text style={styles.downloadBtnText}>
              {downloading ? 'Generating PDF…' : 'Download Report Card'}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  centred: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md},
  topBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md},
  backBtn: {padding: 4},
  topActions: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  dlBtn: {padding: 4},
  headerCenter: {flex: 1, alignItems: 'center'},
  topTitle: {...typography.heading, color: colors.text, fontSize: 15},
  topSub: {...typography.caption, color: colors.textSoft, marginTop: 2},
  content: {padding: spacing.lg, gap: spacing.md},
  summaryCard: {
    ...shadows.clayDeep,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    gap: spacing.md,
    padding: spacing.xl},
  summaryTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  summaryPerf: {},
  bigPct: {fontSize: 40, fontWeight: '900'},
  bigLabel: {...typography.caption, color: colors.textSoft, marginTop: 2},
  summaryStats: {flexDirection: 'row', justifyContent: 'space-around', paddingTop: spacing.sm},
  sumItem: {alignItems: 'center'},
  sumVal: {...typography.heading, fontSize: 18, fontWeight: '900', color: colors.text},
  sumLabel: {...typography.caption, color: colors.textSoft, fontSize: 10, marginTop: 2},
  sumDivider: {width: 1, height: 36, backgroundColor: colors.borderLight},
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    overflow: 'hidden'},
  tableHeader: {
    backgroundColor: colors.surfaceAlt,
    borderBottomColor: colors.border,
    borderBottomWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm},
  headerCol: {...typography.captionBold, color: colors.textMuted, fontSize: 10, flex: 1, textAlign: 'center', textTransform: 'uppercase'},
  downloadBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: 14},
  downloadBtnText: {color: colors.white, fontSize: 15, fontWeight: '800'},
  errorText: {...typography.body, color: colors.textMuted},
  retryBtn: {backgroundColor: colors.primary, borderRadius: radius.card, paddingHorizontal: spacing.xl, paddingVertical: 10},
  retryText: {color: colors.white, fontWeight: '800'}});

export default ResultDetailsScreen;
