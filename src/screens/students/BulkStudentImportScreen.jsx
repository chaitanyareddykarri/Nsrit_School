import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {STUDENT_CSV_TEMPLATE} from '../../utils/csvParser';
import academicRepository from '../../repositories/academicRepository';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, radius, shadows, spacing} from '../../theme';
import academicYearService from '../../services/academicYear/academicYearService';

const BulkStudentImportScreen = () => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const academicYear = academicYearService.getCurrentStartYear(user?.branchId);
  const [csvText, setCsvText] = useState(STUDENT_CSV_TEMPLATE);
  const [progress, setProgress] = useState({completed: 0, total: 0});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const classesQuery = useQuery({
    queryKey: ['academicClasses', user?.branchId],
    queryFn: () => academicRepository.getAcademicClasses()});
  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () => sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId)});

  const classes = useMemo(
    () => (classesQuery.data || []).filter(
      item => item.branchId === user?.branchId &&
        (!user?.wing || user?.role !== 'COORDINATOR' || item.wing?.code === user.wing),
    ),
    [classesQuery.data, user?.branchId, user?.role, user?.wing],
  );
  const sections = useMemo(() => sectionsQuery.data?.sections || [], [sectionsQuery.data?.sections]);

  const handleImport = async () => {
    setLoading(true);
    setResult(null);
    try {
      const importResult = await studentService.importStudents({csvText, classes, sections}, scope, setProgress);
      setResult(importResult);
      queryClient.invalidateQueries({queryKey: ['students', user?.branchId]});
      queryClient.invalidateQueries({queryKey: ['wingStudents', user?.branchId, user?.wing]});
    } finally {
      setLoading(false);
    }
  };

  const progressValue = progress.total ? progress.completed / progress.total : 0;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">

      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <Text style={styles.heroOverline}>Students</Text>
        <Text style={styles.heroTitle}>Bulk Import</Text>
        <Text style={styles.heroSub}>Paste CSV content exported from your sheet</Text>
      </Animated.View>

      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information-outline" size={14} color={colors.primary} />
        <Text style={styles.infoText}>
          Required columns: Full Name, Gender, DOB, Class, Section, and at least one of Father Mobile, Mother Mobile, or Guardian Mobile.
        </Text>
      </View>

      <View style={styles.csvCard}>
        <Text style={styles.csvLabel}>CSV Content</Text>
        <TextInput
          style={styles.csvInput}
          value={csvText}
          onChangeText={setCsvText}
          multiline
          numberOfLines={12}
          placeholder="Paste your CSV content here..."
          placeholderTextColor={colors.textSoft}
          textAlignVertical="top"
        />
      </View>

      {progress.total > 0 ? (
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressCount}>{progress.completed} / {progress.total}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {width: `${Math.round(progressValue * 100)}%`}]} />
          </View>
        </View>
      ) : null}
      {result ? (
        <View style={styles.resultCard}>
          <View style={styles.resultRow}>
            <View style={[styles.resultPill, {backgroundColor: colors.successSoft}]}>
              <MaterialCommunityIcons name="check-circle-outline" size={14} color={colors.success} />
              <Text style={[styles.resultCount, {color: colors.success}]}>{result.successCount} success</Text>
            </View>
            <View style={[styles.resultPill, {backgroundColor: colors.dangerSoft}]}>
              <MaterialCommunityIcons name="close-circle-outline" size={14} color={colors.danger} />
              <Text style={[styles.resultCount, {color: colors.danger}]}>{result.failedCount} failed</Text>
            </View>
          </View>
          {(result.errors || []).map(item => (
            <Text key={`${item.rowNumber}-${item.error}`} style={styles.errorRow}>
              Row {item.rowNumber}: {item.error}
            </Text>
          ))}
        </View>
      ) : null}

      <Pressable
        onPress={handleImport}
        disabled={loading || !csvText.trim()}
        style={({pressed}) => [
          styles.submitBtn,
          (loading || !csvText.trim()) && {opacity: 0.5},
          pressed && !loading && csvText.trim() && {opacity: 0.88},
        ]}>
        <MaterialCommunityIcons name="file-import-outline" size={18} color={colors.white} />
        <Text style={styles.submitBtnText}>{loading ? `Importing… ${progress.completed}/${progress.total}` : 'Import Students'}</Text>
      </Pressable>

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},
  hero: {
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
  heroOverline: {color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase'},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 4},
  infoCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md},
  infoText: {color: colors.primary, flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 17},
  csvCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.clay},
  csvLabel: {
    backgroundColor: colors.background,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    padding: spacing.md,
    paddingBottom: spacing.xs,
    textTransform: 'uppercase'},
  csvInput: {
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 12,
    minHeight: 200,
    padding: spacing.md},
  progressCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.clay},
  progressRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs},
  progressLabel: {color: colors.textMuted, fontSize: 11, fontWeight: '700'},
  progressCount: {color: colors.primary, fontSize: 11, fontWeight: '700'},
  progressTrack: {backgroundColor: colors.borderLight, borderRadius: radius.pill, height: 6, overflow: 'hidden'},
  progressFill: {backgroundColor: colors.primary, borderRadius: radius.pill, height: '100%'},
  resultCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.clay},
  resultRow: {flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm},
  resultPill: {alignItems: 'center', borderRadius: radius.pill, flexDirection: 'row', gap: 5, paddingHorizontal: spacing.md, paddingVertical: spacing.xs},
  resultCount: {fontSize: 12, fontWeight: '700'},
  errorRow: {color: colors.danger, fontSize: 11, fontWeight: '500', marginBottom: 2},
  submitBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 50,
    justifyContent: 'center',
    ...shadows.fab},
  submitBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'}});

export default BulkStudentImportScreen;
