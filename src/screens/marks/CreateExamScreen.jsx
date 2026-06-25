import React, {useEffect, useState} from 'react';
import {ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {EXAM_TYPE_LABELS, EXAM_TYPES} from '../../config/constants';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import examService from '../../services/marks/examService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const EXAM_TYPE_OPTIONS = Object.entries(EXAM_TYPE_LABELS).map(([value, label]) => ({value, label}));

const FieldLabel = ({children}) => <Text style={styles.fieldLabel}>{children}</Text>;

const CreateExamScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const user = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);

  // When editing, the existing exam is passed via route.params.exam
  const existing = route?.params?.exam;
  const isEdit = Boolean(existing);

  const [form, setForm] = useState({
    name: existing?.name || '',
    examType: existing?.examType || EXAM_TYPES.UNIT_TEST,
    startDate: existing?.startDate || '',
    endDate: existing?.endDate || '',
    remarks: existing?.remarks || ''});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (key, val) => setForm(f => ({...f, [key]: val}));

  const handleSave = async () => {
    setError('');
    if (!form.name.trim()) {
      setError('Exam name is required.');
      return;
    }
    try {
      setSaving(true);
      if (isEdit) {
        await examService.updateExam(existing.id, form);
        Toast.show({type: 'success', text1: 'Exam updated'});
        navigation.goBack();
      } else {
        const created = await examService.createExam({
          branchId: user.branchId,
          academicYearId: activeAcademicYear?.id,
          name: form.name,
          examType: form.examType,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          remarks: form.remarks || null,
          createdById: user.id});
        Toast.show({type: 'success', text1: 'Exam created'});
        navigation.replace('ExamDetails', {examId: created.id});
      }
    } catch (err) {
      setError(err.message || 'Failed to save exam.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.topBar, {paddingTop: insets.top + 8}]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>{isEdit ? 'Edit Exam' : 'Create Exam'}</Text>
        <View style={{width: 36}} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 32}]}>
        <Animated.View style={styles.card}>
          {/* Exam Name */}
          <FieldLabel>Exam Name *</FieldLabel>
          <TextInput
            style={styles.input}
            placeholder="e.g. Unit Test 1"
            placeholderTextColor={colors.textSoft}
            value={form.name}
            onChangeText={v => update('name', v)}
            autoCapitalize="words"
          />

          {/* Exam Type */}
          <FieldLabel>Exam Type *</FieldLabel>
          <View style={styles.typeGrid}>
            {EXAM_TYPE_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                onPress={() => update('examType', opt.value)}
                style={[
                  styles.typeChip,
                  form.examType === opt.value && styles.typeChipActive,
                ]}>
                <Text
                  style={[
                    styles.typeChipText,
                    form.examType === opt.value && styles.typeChipTextActive,
                  ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Dates */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <FieldLabel>Start Date</FieldLabel>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSoft}
                value={form.startDate}
                onChangeText={v => update('startDate', v)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfField}>
              <FieldLabel>End Date</FieldLabel>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSoft}
                value={form.endDate}
                onChangeText={v => update('endDate', v)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Remarks */}
          <FieldLabel>Remarks</FieldLabel>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Optional remarks…"
            placeholderTextColor={colors.textSoft}
            value={form.remarks}
            onChangeText={v => update('remarks', v)}
            multiline
            numberOfLines={3}
          />

          {error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({pressed}) => [styles.saveBtn, saving && {opacity: 0.6}, pressed && {opacity: 0.85}]}>
            {saving ? <ActivityIndicator size="small" color={colors.white} /> : null}
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : isEdit ? 'Update Exam' : 'Create Exam'}</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg},
  backBtn: {padding: 4},
  topTitle: {...typography.heading, color: colors.text},
  content: {padding: spacing.lg},
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    padding: spacing.lg,
    gap: spacing.xs},
  fieldLabel: {...typography.captionBold, color: colors.textMuted, marginTop: spacing.sm, marginBottom: 4, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.8},
  input: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1.5,
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm},
  textarea: {height: 80, textAlignVertical: 'top'},
  row: {flexDirection: 'row', gap: spacing.sm},
  halfField: {flex: 1},
  typeGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs},
  typeChip: {
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: 6},
  typeChipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  typeChipText: {...typography.caption, color: colors.textMuted, fontWeight: '700'},
  typeChipTextActive: {color: colors.white},
  errorBox: {
    alignItems: 'center',
    backgroundColor: `${colors.danger}12`,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.sm},
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},
  saveBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingVertical: 14},
  saveBtnText: {color: colors.white, fontSize: 15, fontWeight: '800'}});

export default CreateExamScreen;
