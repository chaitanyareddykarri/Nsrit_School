import React, {useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import DocumentPicker from 'react-native-document-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import marksService from '../../services/marks/marksService';
import examService from '../../services/marks/examService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const STEPS = ['Select Section', 'Upload File', 'Validate', 'Save'];

const StepDot = ({index, label, active, done}) => (
  <View style={styles.stepItem}>
    <View style={[styles.stepDot, active && styles.stepDotActive, done && styles.stepDotDone]}>
      {done ? (
        <MaterialCommunityIcons name="check" size={12} color={colors.white} />
      ) : (
        <Text style={styles.stepDotText}>{index + 1}</Text>
      )}
    </View>
    <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
  </View>
);

const BulkUploadScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {examId, exam} = route.params || {};
  const user = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const role = user?.role;

  const [step, setStep] = useState(0);
  const [selectedSection, setSelectedSection] = useState(null);
  const [file, setFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [validating, setValidating] = useState(false);

  const {data: examDetails, isLoading} = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examService.getExamDetails(examId),
    enabled: Boolean(examId)});

  const {data: sectionData, isLoading: loadingSection} = useQuery({
    queryKey: ['marks', examId, selectedSection?.sectionId],
    queryFn: () => marksService.getMarksForSection(examId, selectedSection.sectionId),
    enabled: Boolean(examId && selectedSection?.sectionId)});

  const sections = examDetails?.examSections || [];

  const handleDownloadTemplate = async () => {
    if (!selectedSection) {
      Toast.show({type: 'error', text1: 'Please select a section first'});
      return;
    }
    if (!sectionData) {
      Toast.show({type: 'error', text1: 'Section data is still loading, please wait'});
      return;
    }
    try {
      setDownloading(true);
      const sectionLabel = selectedSection.section?.name || 'section';
      await marksService.downloadTemplate(
        sectionData.students,
        sectionData.subjectConfigs,
        `marks_template_${sectionLabel}.xlsx`,
      );
      Toast.show({type: 'success', text1: 'Template downloaded to Documents'});
    } catch (err) {
      Toast.show({type: 'error', text1: err.message});
    } finally {
      setDownloading(false);
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles]});
      setFile(result);
      setStep(2);
      setValidationResult(null);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Toast.show({type: 'error', text1: 'Failed to pick file'});
      }
    }
  };

  const handleValidate = async () => {
    if (!file || !sectionData) return;
    try {
      setValidating(true);
      const rows = await marksService.parseBulkUploadFile(file.uri, file.type);
      const result = marksService.validateBulkMarks(rows, sectionData.students, sectionData.subjectConfigs);
      setValidationResult(result);
      setStep(3);
    } catch (err) {
      Toast.show({type: 'error', text1: err.message});
    } finally {
      setValidating(false);
    }
  };

  const handleSaveValid = async () => {
    if (!validationResult?.valid?.length) return;
    try {
      setSaving(true);
      const report = await marksService.bulkSaveMarks(
        validationResult.valid,
        {
          branchId: user.branchId,
          academicYearId: activeAcademicYear?.id,
          examId,
          sectionId: selectedSection?.sectionId,
          enteredById: user.id,
          role,
          subjectConfigs: sectionData?.subjectConfigs || [],
        },
      );
      Toast.show({
        type: report.failedCount > 0 ? 'error' : 'success',
        text1: `${report.successCount} saved${report.failedCount > 0 ? `, ${report.failedCount} failed` : ''}`});
      if (report.successCount > 0) {
        navigation.goBack();
      }
    } catch (err) {
      Toast.show({type: 'error', text1: err.message});
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Bulk Upload Marks</Text>
        <View style={{width: 36}} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 32}]}>
        {/* Stepper */}
        <Animated.View style={styles.stepper}>
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <StepDot index={i} label={label} active={step === i} done={step > i} />
              {i < STEPS.length - 1 && <View style={[styles.stepLine, step > i && styles.stepLineDone]} />}
            </React.Fragment>
          ))}
        </Animated.View>

        {/* Exam info */}
        <Animated.View style={styles.card}>
          <Text style={styles.sectionTitle}>Exam: {exam?.name}</Text>
          {isLoading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
        </Animated.View>

        {/* Step 0: Select Section */}
        {step >= 0 && (
          <Animated.View style={styles.card}>
            <Text style={styles.cardTitle}>1 · Select Section</Text>
            {sections.map(es => (
              <Pressable
                key={es.id}
                onPress={() => {
                  setSelectedSection(es);
                  setStep(Math.max(step, 1));
                }}
                style={[styles.sectionChip, selectedSection?.id === es.id && styles.sectionChipActive]}>
                <Text style={[styles.sectionChipText, selectedSection?.id === es.id && styles.sectionChipTextActive]}>
                  {es.section?.academicClass?.name} — {es.section?.name}
                </Text>
                {selectedSection?.id === es.id && (
                  <MaterialCommunityIcons name="check" size={14} color={colors.white} />
                )}
              </Pressable>
            ))}
          </Animated.View>
        )}

        {/* Step 1: Upload */}
        {step >= 1 && selectedSection && (
          <Animated.View style={styles.card}>
            <Text style={styles.cardTitle}>2 · Upload File</Text>
            <Pressable
              onPress={handleDownloadTemplate}
              disabled={downloading || loadingSection}
              style={styles.outlineBtn}>
              {downloading ? (
                <ActivityIndicator size="small" color={colors.info} />
              ) : (
                <MaterialCommunityIcons name="download-outline" size={16} color={colors.info} />
              )}
              <Text style={[styles.outlineBtnText, {color: colors.info}]}>
                {downloading ? 'Downloading…' : 'Download Template (XLSX)'}
              </Text>
            </Pressable>
            <Text style={styles.hint}>
              Fill in the template and upload it below. Supported formats: .xlsx, .csv
            </Text>
            <Pressable onPress={handlePickFile} style={styles.uploadZone}>
              <MaterialCommunityIcons name="upload" size={28} color={colors.primary} />
              <Text style={styles.uploadText}>{file ? file.name : 'Tap to select file'}</Text>
              {file && (
                <Text style={styles.fileSize}>
                  {(file.size / 1024).toFixed(1)} KB
                </Text>
              )}
            </Pressable>
            {file && (
              <Pressable
                onPress={handleValidate}
                disabled={validating || loadingSection}
                style={styles.primaryBtn}>
                {validating ? <ActivityIndicator size="small" color={colors.white} /> : null}
                <Text style={styles.primaryBtnText}>{validating ? 'Validating…' : 'Validate & Preview'}</Text>
              </Pressable>
            )}
          </Animated.View>
        )}

        {/* Step 2-3: Validation report */}
        {validationResult && (
          <Animated.View style={styles.card}>
            <Text style={styles.cardTitle}>3 · Validation Report</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{validationResult.total}</Text>
                <Text style={styles.statLabel}>Total Rows</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, {color: colors.success}]}>{validationResult.successCount}</Text>
                <Text style={styles.statLabel}>Valid</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, {color: colors.danger}]}>{validationResult.failedCount}</Text>
                <Text style={styles.statLabel}>Invalid</Text>
              </View>
            </View>

            {validationResult.invalid.length > 0 && (
              <View style={styles.errorTable}>
                <Text style={styles.errorTableTitle}>Rows with errors:</Text>
                {validationResult.invalid.map((err, i) => (
                  <View key={i} style={styles.errorRow}>
                    <Text style={styles.errorRowNum}>Row {err.rowNumber}</Text>
                    <Text style={styles.errorRowName}>{err.studentName}</Text>
                    <Text style={styles.errorRowMsg}>{err.error}</Text>
                  </View>
                ))}
              </View>
            )}

            {validationResult.successCount > 0 && (
              <Pressable
                onPress={handleSaveValid}
                disabled={saving}
                style={[styles.primaryBtn, saving && {opacity: 0.6}]}>
                {saving ? <ActivityIndicator size="small" color={colors.white} /> : null}
                <Text style={styles.primaryBtnText}>
                  {saving ? 'Saving…' : `Save ${validationResult.successCount} Valid Rows`}
                </Text>
              </Pressable>
            )}
          </Animated.View>
        )}
      </ScrollView>
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
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md},
  backBtn: {padding: 4},
  topTitle: {...typography.heading, color: colors.text, flex: 1, textAlign: 'center'},
  content: {padding: spacing.lg, gap: spacing.md},
  stepper: {flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm},
  stepItem: {alignItems: 'center', gap: 4},
  stepDot: {
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28},
  stepDotActive: {backgroundColor: colors.primary},
  stepDotDone: {backgroundColor: colors.success},
  stepDotText: {...typography.captionBold, color: colors.textMuted, fontSize: 11},
  stepLabel: {...typography.caption, color: colors.textSoft, fontSize: 9, textAlign: 'center'},
  stepLabelActive: {color: colors.primary, fontWeight: '700'},
  stepLine: {flex: 1, height: 2, backgroundColor: colors.borderLight, marginBottom: 14},
  stepLineDone: {backgroundColor: colors.success},
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    gap: spacing.sm,
    padding: spacing.lg},
  sectionTitle: {...typography.body, color: colors.textMuted, fontWeight: '700'},
  cardTitle: {...typography.heading, color: colors.text, fontSize: 14, marginBottom: spacing.xs},
  sectionChip: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 8},
  sectionChipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  sectionChipText: {...typography.body, color: colors.textMuted, fontWeight: '600'},
  sectionChipTextActive: {color: colors.white},
  outlineBtn: {
    alignItems: 'center',
    borderColor: colors.info,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingVertical: 10},
  outlineBtnText: {...typography.body, fontWeight: '700', fontSize: 13},
  hint: {...typography.caption, color: colors.textSoft, textAlign: 'center'},
  uploadZone: {
    alignItems: 'center',
    backgroundColor: `${colors.primary}08`,
    borderColor: `${colors.primary}40`,
    borderRadius: radius.card,
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: spacing.xs,
    padding: spacing.xl},
  uploadText: {...typography.body, color: colors.primary, fontWeight: '700', textAlign: 'center'},
  fileSize: {...typography.caption, color: colors.textSoft},
  primaryBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingVertical: 14},
  primaryBtnText: {color: colors.white, fontSize: 14, fontWeight: '800'},
  statsRow: {flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.md},
  statItem: {alignItems: 'center'},
  statValue: {...typography.heading, color: colors.text, fontSize: 22, fontWeight: '900'},
  statLabel: {...typography.caption, color: colors.textSoft, marginTop: 2},
  errorTable: {
    backgroundColor: `${colors.danger}08`,
    borderColor: `${colors.danger}25`,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 2,
    padding: spacing.sm},
  errorTableTitle: {...typography.captionBold, color: colors.danger, fontSize: 11, marginBottom: spacing.xs},
  errorRow: {flexDirection: 'row', gap: spacing.sm, paddingVertical: 4},
  errorRowNum: {...typography.captionBold, color: colors.danger, width: 50, fontSize: 11},
  errorRowName: {...typography.caption, color: colors.text, flex: 1, fontWeight: '600'},
  errorRowMsg: {...typography.caption, color: colors.danger, flex: 1.5, fontSize: 11}});

export default BulkUploadScreen;
