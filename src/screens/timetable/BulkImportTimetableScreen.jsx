import React, {useState, useMemo} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import timetableService from '../../services/timetable/timetableService';
import teacherService from '../../services/teachers/teacherService';
import academicRepository from '../../repositories/academicRepository';
import academicYearService from '../../services/academicYear/academicYearService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const STEPS = ['Setup', 'Paste Data', 'Validate', 'Done'];

const StepIndicator = ({currentStep}) => (
  <View style={styles.stepRow}>
    {STEPS.map((label, i) => (
      <React.Fragment key={label}>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle,
            i < currentStep && styles.stepCircleDone,
            i === currentStep && styles.stepCircleActive]}>
            {i < currentStep ? (
              <MaterialCommunityIcons name="check" size={12} color={colors.white} />
            ) : (
              <Text style={[styles.stepNum, i === currentStep && styles.stepNumActive]}>{i + 1}</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, i === currentStep && styles.stepLabelActive]}>{label}</Text>
        </View>
        {i < STEPS.length - 1 ? (
          <View style={[styles.stepLine, i < currentStep && styles.stepLineDone]} />
        ) : null}
      </React.Fragment>
    ))}
  </View>
);

const ErrorRow = ({item, index}) => (
  <Animated.View style={styles.errorRow}>
    <View style={styles.errorRowNum}>
      <Text style={styles.errorRowNumText}>Row {item.rowNum}</Text>
    </View>
    <View style={styles.errorRowInfo}>
      <Text style={styles.errorClass}>{item.className} — {item.sectionName}</Text>
      <Text style={styles.errorMsg}>{item.errors}</Text>
    </View>
  </Animated.View>
);

const BulkImportTimetableScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const role = useSelector(state => state.auth.role);
  const scope = getAccessScope(user);
  const branchId = user?.branchId;
  const academicYear = academicYearService.getCurrentStartYear(branchId);
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [csvText, setCsvText] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [validating, setValidating] = useState(false);

  // Load sections + teachers for validation
  const {data: sectionsData} = useQuery({
    queryKey: ['sections', branchId, academicYear],
    queryFn: () => academicRepository.getSections({branchId, academicYear}),
    enabled: Boolean(branchId)});

  const {data: teachersData} = useQuery({
    queryKey: ['teachersByBranch', branchId],
    queryFn: () => teacherService.getTeachers({branchId}, scope),
    enabled: Boolean(branchId)});

  const sections = useMemo(() =>
    (sectionsData?.sections || []).map(s => ({
      sectionId: s.id,
      className: s.academicClass?.name || '',
      sectionName: s.name || ''})),
  [sectionsData]);

  const teachers = useMemo(() =>
    (teachersData?.teachers || []).map(t => ({
      id: t.id,
      name: t.user?.name || t.name || ''})),
  [teachersData]);

  const handleDownloadTemplate = async () => {
    const csv = timetableService.getBulkTemplateCSV();
    try {
      await Share.share({
        message: csv,
        title: 'Timetable Import Template.csv'});
    } catch {
      // Show content in textarea if share not available
      setCsvText(csv);
      Alert.alert('Template', 'Template content has been pasted into the text area below.');
    }
  };

  const handleValidate = () => {
    if (!csvText.trim()) {
      Alert.alert('Empty', 'Please paste your CSV data first.');
      return;
    }
    setValidating(true);
    try {
      const rows = timetableService.parseBulkImportCSV(csvText);
      if (rows.length === 0) {
        Alert.alert('Empty', 'No rows found in your data. Check the CSV format.');
        return;
      }
      const result = timetableService.validateBulkRows(rows, {sections, teachers});
      setValidationResult(result);
      setStep(2);
    } catch (err) {
      Alert.alert('Parse Error', err?.message || 'Failed to parse CSV data.');
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!validationResult?.valid?.length) {return;}
    setImporting(true);
    try {
      const result = await timetableService.importBulkTimetable(validationResult.valid, branchId, role);
      setImportResult(result);
      queryClient.invalidateQueries({queryKey: ['timetablesForBranch', branchId]});
      setStep(3);
    } catch (err) {
      Alert.alert('Import Error', err?.message || 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setCsvText('');
    setValidationResult(null);
    setImportResult(null);
    setStep(0);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>

        {/* ── Hero ── */}
        <Animated.View style={styles.hero}>
          <View style={styles.heroDecor} />
          <View style={styles.heroRow}>
            <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={colors.white} />
            </Pressable>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Bulk Import Timetable</Text>
              <Text style={styles.heroSub}>Import timetable data from CSV</Text>
            </View>
          </View>
          <StepIndicator currentStep={step} />
        </Animated.View>

        {/* ── Step 0: Setup ── */}
        {step === 0 ? (
          <Animated.View style={styles.card}>
            <Text style={styles.cardTitle}>Before You Start</Text>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="information-circle-outline" size={16} color={colors.info} />
              <Text style={styles.infoText}>
                Download the CSV template, fill it with your timetable data, then paste the content in the next step.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>CSV Format</Text>
            <View style={styles.formatBox}>
              <Text style={styles.formatText}>Day, Period, StartTime, EndTime, Class, Section, Subject, Teacher, Room</Text>
              <Text style={styles.formatExample}>Monday, 1, 09:00, 09:45, Class I, A, Mathematics, John Smith, Room 101</Text>
            </View>

            <Text style={styles.sectionTitle}>Supported Values</Text>
            <View style={styles.rulesBox}>
              {[
                'Day: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday',
                'Period: 1 to 8',
                'Class: must match existing class name (e.g., "Class I")',
                'Section: A, B, C, or D',
                'Teacher: must match teacher full name',
              ].map((rule, i) => (
                <View key={i} style={styles.ruleRow}>
                  <Text style={styles.ruleBullet}>•</Text>
                  <Text style={styles.ruleText}>{rule}</Text>
                </View>
              ))}
            </View>

            <Pressable style={styles.templateBtn} onPress={handleDownloadTemplate}>
              <MaterialCommunityIcons name="download" size={16} color={colors.primary} />
              <Text style={styles.templateBtnText}>Download Template</Text>
            </Pressable>

            <Pressable style={styles.primaryBtn} onPress={() => setStep(1)}>
              <Text style={styles.primaryBtnText}>Continue to Paste Data</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color={colors.white} />
            </Pressable>
          </Animated.View>
        ) : null}

        {/* ── Step 1: Paste Data ── */}
        {step === 1 ? (
          <Animated.View style={styles.card}>
            <Text style={styles.cardTitle}>Paste CSV Data</Text>
            <Text style={styles.cardSub}>Copy your filled CSV content and paste it below</Text>

            <View style={styles.csvArea}>
              <TextInput
                style={styles.csvInput}
                value={csvText}
                onChangeText={setCsvText}
                placeholder={`Day,Period,StartTime,EndTime,Class,Section,Subject,Teacher,Room\nMonday,1,09:00,09:45,Class I,A,Mathematics,John Smith,Room 101`}
                placeholderTextColor={colors.textSoft}
                multiline
                autoCorrect={false}
                autoCapitalize="none"
                textAlignVertical="top"
              />
            </View>

            {csvText.trim() ? (
              <View style={styles.csvMeta}>
                <MaterialCommunityIcons name="check-circle" size={13} color={colors.success} />
                <Text style={styles.csvMetaText}>
                  {csvText.trim().split('\n').filter(Boolean).length - 1} data row(s) detected
                </Text>
              </View>
            ) : null}

            <View style={styles.stepBtnRow}>
              <Pressable style={styles.secondaryBtn} onPress={() => setStep(0)}>
                <MaterialCommunityIcons name="arrow-left" size={14} color={colors.textMuted} />
                <Text style={styles.secondaryBtnText}>Back</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryBtn, styles.flex1, validating && styles.btnDisabled]}
                onPress={handleValidate}
                disabled={validating}>
                {validating ? <ActivityIndicator size="small" color={colors.white} /> : (
                  <>
                    <Text style={styles.primaryBtnText}>Validate Data</Text>
                    <MaterialCommunityIcons name="check-all" size={16} color={colors.white} />
                  </>
                )}
              </Pressable>
            </View>
          </Animated.View>
        ) : null}

        {/* ── Step 2: Validation Results ── */}
        {step === 2 && validationResult ? (
          <Animated.View style={styles.card}>
            <Text style={styles.cardTitle}>Validation Report</Text>

            {/* Summary chips */}
            <View style={styles.summaryRow}>
              <View style={[styles.summaryChip, styles.summaryTotal]}>
                <Text style={styles.summaryVal}>{validationResult.successCount + validationResult.failedCount}</Text>
                <Text style={styles.summaryLabel}>Total Rows</Text>
              </View>
              <View style={[styles.summaryChip, styles.summarySuccess]}>
                <Text style={[styles.summaryVal, {color: colors.success}]}>{validationResult.successCount}</Text>
                <Text style={styles.summaryLabel}>Valid</Text>
              </View>
              <View style={[styles.summaryChip, styles.summaryFail]}>
                <Text style={[styles.summaryVal, {color: colors.danger}]}>{validationResult.failedCount}</Text>
                <Text style={styles.summaryLabel}>Errors</Text>
              </View>
            </View>

            {validationResult.failedCount > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Error Details</Text>
                <FlatList
                  data={validationResult.invalid}
                  keyExtractor={item => String(item.rowNum)}
                  renderItem={({item, index}) => <ErrorRow item={item} index={index} />}
                  scrollEnabled={false}
                  style={styles.errorList}
                />
              </>
            ) : null}

            {validationResult.successCount === 0 ? (
              <View style={styles.allErrorBanner}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.danger} />
                <Text style={styles.allErrorText}>All rows have errors. Please fix your CSV and try again.</Text>
              </View>
            ) : null}

            <View style={styles.stepBtnRow}>
              <Pressable style={styles.secondaryBtn} onPress={() => setStep(1)}>
                <MaterialCommunityIcons name="arrow-left" size={14} color={colors.textMuted} />
                <Text style={styles.secondaryBtnText}>Edit Data</Text>
              </Pressable>
              {validationResult.successCount > 0 ? (
                <Pressable
                  style={[styles.primaryBtn, styles.flex1, importing && styles.btnDisabled]}
                  onPress={handleImport}
                  disabled={importing}>
                  {importing ? <ActivityIndicator size="small" color={colors.white} /> : (
                    <>
                      <Text style={styles.primaryBtnText}>
                        Import {validationResult.successCount} Rows
                      </Text>
                      <MaterialCommunityIcons name="upload" size={16} color={colors.white} />
                    </>
                  )}
                </Pressable>
              ) : null}
            </View>
          </Animated.View>
        ) : null}

        {/* ── Step 3: Done ── */}
        {step === 3 && importResult ? (
          <Animated.View style={styles.card}>
            <View style={styles.successIcon}>
              <MaterialCommunityIcons name="check-circle" size={56} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>Import Complete!</Text>
            <Text style={styles.successSub}>Your timetable data has been imported successfully.</Text>

            <View style={styles.resultGrid}>
              <View style={styles.resultCell}>
                <Text style={styles.resultVal}>{importResult.imported}</Text>
                <Text style={styles.resultLabel}>Periods Imported</Text>
              </View>
              <View style={styles.resultCell}>
                <Text style={styles.resultVal}>{importResult.sectionCount}</Text>
                <Text style={styles.resultLabel}>Sections Updated</Text>
              </View>
              {importResult.failed?.length > 0 ? (
                <View style={styles.resultCell}>
                  <Text style={[styles.resultVal, {color: colors.danger}]}>{importResult.failed.length}</Text>
                  <Text style={styles.resultLabel}>Rows Failed</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="information-circle-outline" size={15} color={colors.info} />
              <Text style={styles.infoText}>
                Imported timetables are saved as Draft. Publish each section's timetable when ready.
              </Text>
            </View>

            <Pressable style={styles.primaryBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.primaryBtnText}>Go to Timetable List</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color={colors.white} />
            </Pressable>
            <Pressable style={[styles.secondaryBtn, {marginTop: spacing.sm, alignSelf: 'center'}]} onPress={handleReset}>
              <Text style={styles.secondaryBtnText}>Import Another File</Text>
            </Pressable>
          </Animated.View>
        ) : null}

        <View style={{height: spacing.xxxl}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.md},
  flex1: {flex: 1},

  // ── Hero ──
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 100,
    height: 180,
    position: 'absolute',
    right: -30,
    top: -60,
    width: 180},
  heroRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl},
  backBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md,
    height: 38,
    justifyContent: 'center',
    width: 38},
  heroCopy: {flex: 1},
  heroTitle: {color: colors.white, fontSize: 18, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2},

  // ── Step Indicator ──
  stepRow: {alignItems: 'center', flexDirection: 'row'},
  stepItem: {alignItems: 'center', gap: 4},
  stepCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    height: 24,
    justifyContent: 'center',
    width: 24},
  stepCircleActive: {backgroundColor: colors.white},
  stepCircleDone: {backgroundColor: 'rgba(34,197,94,0.7)'},
  stepNum: {color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '800'},
  stepNumActive: {color: colors.primary},
  stepLabel: {color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: '700'},
  stepLabelActive: {color: colors.white},
  stepLine: {flex: 1, height: 1.5, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 4, marginBottom: 14},
  stepLineDone: {backgroundColor: 'rgba(34,197,94,0.6)'},

  // ── Card ──
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.lg},
  cardTitle: {...typography.subtitle, color: colors.text, marginBottom: spacing.xs},
  cardSub: {...typography.caption, color: colors.textMuted, marginBottom: spacing.lg},

  // ── Info ──
  infoRow: {
    alignItems: 'flex-start',
    backgroundColor: colors.infoSoft,
    borderColor: `${colors.info}40`,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md},
  infoText: {...typography.caption, color: colors.info, flex: 1, lineHeight: 18},

  // ── Format ──
  sectionTitle: {...typography.captionBold, color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.md, textTransform: 'uppercase'},
  formatBox: {
    backgroundColor: colors.neutralSoft,
    borderRadius: radius.card,
    padding: spacing.md},
  formatText: {color: colors.primary, fontFamily: 'monospace', fontSize: 11, fontWeight: '700'},
  formatExample: {color: colors.textMuted, fontFamily: 'monospace', fontSize: 10, marginTop: 4},
  rulesBox: {gap: 4},
  ruleRow: {flexDirection: 'row', gap: spacing.sm},
  ruleBullet: {color: colors.textMuted, fontSize: 12},
  ruleText: {...typography.caption, color: colors.textMuted, flex: 1, lineHeight: 17},

  // ── Template Button ──
  templateBtn: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
    paddingVertical: spacing.md},
  templateBtnText: {color: colors.primary, fontSize: 14, fontWeight: '700'},

  // ── Buttons ──
  primaryBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.md,
    ...shadows.fab},
  primaryBtnText: {color: colors.white, fontSize: 14, fontWeight: '800'},
  secondaryBtn: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md},
  secondaryBtnText: {...typography.captionBold, color: colors.textMuted},
  btnDisabled: {opacity: 0.6},
  stepBtnRow: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg},

  // ── CSV Area ──
  csvArea: {
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    minHeight: 200,
    overflow: 'hidden'},
  csvInput: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 11,
    minHeight: 200,
    padding: spacing.md,
    textAlignVertical: 'top'},
  csvMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginBottom: spacing.md},
  csvMetaText: {...typography.caption, color: colors.success},

  // ── Validation ──
  summaryRow: {flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md},
  summaryChip: {
    alignItems: 'center',
    borderRadius: radius.card,
    borderWidth: 1.5,
    flex: 1,
    padding: spacing.md},
  summaryTotal: {backgroundColor: colors.neutralSoft, borderColor: colors.border},
  summarySuccess: {backgroundColor: `${colors.success}15`, borderColor: `${colors.success}40`},
  summaryFail: {backgroundColor: `${colors.danger}10`, borderColor: `${colors.danger}30`},
  summaryVal: {color: colors.text, fontSize: 22, fontWeight: '800'},
  summaryLabel: {...typography.caption, color: colors.textMuted, marginTop: 2},

  errorList: {marginTop: spacing.sm},
  errorRow: {
    backgroundColor: `${colors.danger}08`,
    borderColor: `${colors.danger}30`,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm},
  errorRowNum: {
    alignItems: 'center',
    backgroundColor: `${colors.danger}20`,
    borderRadius: radius.sm,
    justifyContent: 'center',
    minWidth: 44,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4},
  errorRowNumText: {color: colors.danger, fontSize: 10, fontWeight: '800'},
  errorRowInfo: {flex: 1},
  errorClass: {color: colors.text, fontSize: 12, fontWeight: '700'},
  errorMsg: {color: colors.danger, fontSize: 11, lineHeight: 16, marginTop: 2},

  allErrorBanner: {
    alignItems: 'center',
    backgroundColor: `${colors.danger}10`,
    borderColor: `${colors.danger}30`,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.md,
    padding: spacing.md},
  allErrorText: {color: colors.danger, flex: 1, fontSize: 13, fontWeight: '600'},

  // ── Success ──
  successIcon: {alignItems: 'center', marginBottom: spacing.md, marginTop: spacing.sm},
  successTitle: {color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing.xs, textAlign: 'center'},
  successSub: {...typography.body, color: colors.textMuted, marginBottom: spacing.lg, textAlign: 'center'},
  resultGrid: {flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg},
  resultCell: {
    alignItems: 'center',
    backgroundColor: colors.neutralSoft,
    borderRadius: radius.card,
    flex: 1,
    padding: spacing.md},
  resultVal: {color: colors.primary, fontSize: 24, fontWeight: '800'},
  resultLabel: {...typography.caption, color: colors.textMuted, marginTop: 4, textAlign: 'center'}});

export default BulkImportTimetableScreen;
