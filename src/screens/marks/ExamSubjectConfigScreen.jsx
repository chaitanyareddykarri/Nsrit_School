import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import examService from '../../services/marks/examService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const EMPTY_FORM = {subjectName: '', maxMarks: '', passingMarks: '', examDate: ''};

// ── Subject row ──────────────────────────────────────────────────────────────
const SubjectRow = ({cfg, onDelete}) => (
  <View style={styles.subjectRow}>
    <View style={styles.subjectInfo}>
      <Text style={styles.subjectName}>{cfg.subjectName}</Text>
      <Text style={styles.subjectMeta}>
        Max: {cfg.maxMarks} &nbsp;|&nbsp; Pass: {cfg.passingMarks}
        {cfg.examDate ? `  |  📅 ${cfg.examDate}` : ''}
      </Text>
    </View>
    <Pressable onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
      <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
    </Pressable>
  </View>
);

// ── Add-subject form ──────────────────────────────────────────────────────────
const AddSubjectForm = ({onAdd, saving}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [err, setErr] = useState('');
  const set = (key, val) => setForm(f => ({...f, [key]: val}));

  const validate = () => {
    if (!form.subjectName.trim()) return 'Subject name is required.';
    const max = Number(form.maxMarks);
    const pass = Number(form.passingMarks);
    if (!form.maxMarks || isNaN(max) || max <= 0) return 'Max marks must be a positive number.';
    if (form.passingMarks === '' || isNaN(pass) || pass < 0) return 'Passing marks must be 0 or more.';
    if (pass > max) return 'Passing marks cannot exceed max marks.';
    if (form.examDate && !/^\d{4}-\d{2}-\d{2}$/.test(form.examDate)) return 'Exam date must be in YYYY-MM-DD format.';
    return null;
  };

  const handleAdd = () => {
    const e = validate();
    if (e) {setErr(e); return;}
    setErr('');
    onAdd({
      subjectName: form.subjectName.trim(),
      maxMarks: Number(form.maxMarks),
      passingMarks: Number(form.passingMarks),
      examDate: form.examDate.trim() || null,
    }, () => setForm(EMPTY_FORM));
  };

  return (
    <View style={styles.addForm}>
      <Text style={styles.addFormTitle}>Add Subject</Text>
      <TextInput
        style={styles.input}
        placeholder="Subject name (e.g. Mathematics)"
        placeholderTextColor={colors.textSoft}
        value={form.subjectName}
        onChangeText={v => set('subjectName', v)}
        autoCapitalize="words"
      />
      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.inputLabel}>Max Marks</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 100"
            placeholderTextColor={colors.textSoft}
            value={form.maxMarks}
            onChangeText={v => set('maxMarks', v)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.inputLabel}>Passing Marks</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 35"
            placeholderTextColor={colors.textSoft}
            value={form.passingMarks}
            onChangeText={v => set('passingMarks', v)}
            keyboardType="numeric"
          />
        </View>
      </View>
      <Text style={styles.inputLabel}>Exam Date (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD  e.g. 2025-10-15"
        placeholderTextColor={colors.textSoft}
        value={form.examDate}
        onChangeText={v => set('examDate', v)}
        keyboardType="numeric"
      />
      {err ? (
        <View style={styles.errorBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
          <Text style={styles.errorText}>{err}</Text>
        </View>
      ) : null}
      <Pressable
        onPress={handleAdd}
        disabled={saving}
        style={({pressed}) => [styles.addBtn, saving && {opacity: 0.6}, pressed && {opacity: 0.85}]}>
        {saving
          ? <ActivityIndicator size="small" color={colors.white} />
          : <MaterialCommunityIcons name="plus" size={16} color={colors.white} />}
        <Text style={styles.addBtnText}>{saving ? 'Saving…' : 'Add Subject'}</Text>
      </Pressable>
    </View>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────
const ExamSubjectConfigScreen = ({navigation, route}) => {
  const {examId} = route.params || {};
  const insets = useSafeAreaInsets();
  const user = useSelector(state => state.auth.user);
  const queryClient = useQueryClient();

  const [selectedClass, setSelectedClass] = useState(null);
  const [saving, setSaving] = useState(false);

  const {data: exam, isLoading, refetch} = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examService.getExamDetails(examId, true),
    enabled: Boolean(examId),
  });

  // Unique classes from sections already added to the exam
  const classes = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const es of exam?.examSections || []) {
      if (!seen.has(es.academicClassId)) {
        seen.add(es.academicClassId);
        result.push({
          academicClassId: es.academicClassId,
          name: es.section?.academicClass?.name || `Class (${es.academicClassId.slice(-4)})`,
        });
      }
    }
    return result;
  }, [exam]);

  // Subject configs for the selected class
  const subjectsForClass = useMemo(() => {
    if (!selectedClass) return [];
    return (exam?.examSubjectConfigs || []).filter(
      c => c.academicClassId === selectedClass.academicClassId,
    );
  }, [exam, selectedClass]);

  const handleAddSubject = async ({subjectName, maxMarks, passingMarks, examDate}, resetForm) => {
    // Prevent duplicate subject names in same class
    if (subjectsForClass.some(c => c.subjectName.toLowerCase() === subjectName.toLowerCase())) {
      Toast.show({type: 'error', text1: `"${subjectName}" is already configured for this class.`});
      return;
    }
    try {
      setSaving(true);
      await examService.upsertSubjectConfig({
        examId,
        academicClassId: selectedClass.academicClassId,
        branchId: exam?.branchId || user?.branchId,
        subjectName,
        maxMarks,
        passingMarks,
        examDate: examDate || null,
      });
      Toast.show({type: 'success', text1: `${subjectName} added`});
      resetForm();
      await refetch();
      queryClient.invalidateQueries({queryKey: ['exam', examId]});
    } catch (err) {
      Toast.show({type: 'error', text1: err.message || 'Failed to add subject'});
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = cfg => {
    Alert.alert(
      'Remove Subject',
      `Remove "${cfg.subjectName}" from this class? Existing marks for this subject will remain but won't appear in results.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await examService.deleteSubjectConfig({
                examId,
                academicClassId: selectedClass.academicClassId,
                subjectName: cfg.subjectName,
              });
              Toast.show({type: 'success', text1: `${cfg.subjectName} removed`});
              await refetch();
              queryClient.invalidateQueries({queryKey: ['exam', examId]});
            } catch (err) {
              Toast.show({type: 'error', text1: err.message || 'Failed to remove subject'});
            }
          },
        },
      ],
    );
  };

  const goBack = () => {
    if (selectedClass) {
      setSelectedClass(null);
    } else {
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.root, {paddingTop: insets.top}]}>
        <View style={styles.topBar}>
          <Pressable onPress={goBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.topTitle}>Configure Subjects</Text>
          <View style={{width: 36}} />
        </View>
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, {paddingTop: insets.top}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.topBar}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.topTitle} numberOfLines={1}>
            {selectedClass ? selectedClass.name : 'Configure Subjects'}
          </Text>
          {selectedClass && (
            <Text style={styles.topSub}>{exam?.name}</Text>
          )}
        </View>
        <View style={{width: 36}} />
      </View>

      {/* Step 1 — Class picker */}
      {!selectedClass && (
        classes.length === 0 ? (
          <View style={styles.centred}>
            <MaterialCommunityIcons name="google-classroom" size={48} color={colors.border} />
            <Text style={styles.emptyTitle}>No classes in this exam yet</Text>
            <Text style={styles.emptyDesc}>
              Go back and add sections first, then configure subjects for each class.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContent}>
            <Text style={styles.stepHint}>
              Select a class to configure its subjects, max marks and passing marks.
            </Text>
            {classes.map(cls => {
              const count = (exam?.examSubjectConfigs || []).filter(
                c => c.academicClassId === cls.academicClassId,
              ).length;
              return (
                <Pressable
                  key={cls.academicClassId}
                  onPress={() => setSelectedClass(cls)}
                  style={({pressed}) => [styles.classCard, pressed && {opacity: 0.8}]}>
                  <View style={styles.classCardLeft}>
                    <Text style={styles.classCardName}>{cls.name}</Text>
                    <Text style={styles.classCardCount}>
                      {count === 0 ? 'No subjects configured' : `${count} subject${count !== 1 ? 's' : ''}`}
                    </Text>
                  </View>
                  <View style={styles.classCardRight}>
                    {count === 0 && (
                      <View style={styles.warnBadge}>
                        <Text style={styles.warnText}>Setup needed</Text>
                      </View>
                    )}
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSoft} />
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )
      )}

      {/* Step 2 — Subject editor for selected class */}
      {selectedClass && (
        <ScrollView
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled">

          {/* Existing subjects */}
          {subjectsForClass.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Subjects ({subjectsForClass.length})
              </Text>
              {subjectsForClass.map((cfg, i) => (
                <SubjectRow
                  key={cfg.id || cfg.subjectName}
                  cfg={cfg}
                  onDelete={() => handleDeleteSubject(cfg)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="book-open-outline" size={32} color={colors.border} />
              <Text style={styles.emptyCardText}>No subjects configured for {selectedClass.name} yet.</Text>
            </View>
          )}

          {/* Add subject form */}
          <AddSubjectForm onAdd={handleAddSubject} saving={saving} />
        </ScrollView>
      )}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backBtn: {padding: 4},
  headerCenter: {flex: 1, alignItems: 'center'},
  topTitle: {...typography.heading, color: colors.text, fontSize: 16},
  topSub: {...typography.caption, color: colors.textSoft, marginTop: 2},
  centred: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md},
  emptyTitle: {...typography.heading, color: colors.textMuted, textAlign: 'center', fontSize: 16},
  emptyDesc: {...typography.body, color: colors.textSoft, textAlign: 'center', fontSize: 13, lineHeight: 20},
  listContent: {padding: spacing.lg, gap: spacing.md},
  stepHint: {...typography.caption, color: colors.textSoft, marginBottom: spacing.xs},

  // Class cards
  classCard: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  classCardLeft: {flex: 1},
  classCardName: {...typography.body, color: colors.text, fontWeight: '700', fontSize: 15},
  classCardCount: {...typography.caption, color: colors.textSoft, marginTop: 3},
  classCardRight: {flexDirection: 'row', alignItems: 'center', gap: spacing.xs},
  warnBadge: {
    backgroundColor: `${colors.warning}18`,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  warnText: {...typography.captionBold, color: colors.warning, fontSize: 10},

  // Subject list card
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  cardTitle: {...typography.heading, color: colors.text, fontSize: 14, marginBottom: spacing.xs},
  subjectRow: {
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  subjectInfo: {flex: 1},
  subjectName: {...typography.body, color: colors.text, fontWeight: '600', fontSize: 14},
  subjectMeta: {...typography.caption, color: colors.textSoft, marginTop: 2},
  deleteBtn: {padding: 4},

  emptyCard: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  emptyCardText: {...typography.caption, color: colors.textMuted, textAlign: 'center'},

  // Add subject form
  addForm: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radius.card,
    borderWidth: 1.5,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  addFormTitle: {...typography.heading, color: colors.text, fontSize: 14, marginBottom: 2},
  inputLabel: {...typography.captionBold, color: colors.textMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6},
  input: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1.5,
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  row: {flexDirection: 'row', gap: spacing.sm},
  half: {flex: 1, gap: 4},
  errorBox: {
    alignItems: 'center',
    backgroundColor: `${colors.danger}12`,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},
  addBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.xs,
    paddingVertical: 12,
  },
  addBtnText: {color: colors.white, fontWeight: '800', fontSize: 14},
});

export default ExamSubjectConfigScreen;
