import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {STUDENT_STATUS} from '../../config/academic';
import {ConfirmationModal} from '../../components';
import {getAccessScope} from '../../services/rbacScope';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import academicYearService from '../../services/academicYear/academicYearService';

const FINAL_CLASS = '12';

const GraduateFinalYearScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const academicYear = academicYearService.getCurrentStartYear(user?.branchId);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [successCount, setSuccessCount] = useState(0);
  const [error, setError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Fetch all sections for this branch
  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () =>
      sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId)});

  // Fetch all students for this branch
  const studentsQuery = useQuery({
    queryKey: ['studentsByBranch', user?.branchId],
    queryFn: () =>
      studentService.getStudentsByBranch(user.branchId, {limit: 1000}),
    enabled: Boolean(user?.branchId)});

  const finalYearSections = useMemo(
    () =>
      (sectionsQuery.data?.sections || []).filter(
        s => s.academicClass?.name === FINAL_CLASS,
      ),
    [sectionsQuery.data],
  );

  const finalYearSectionIds = useMemo(
    () => new Set(finalYearSections.map(s => s.id)),
    [finalYearSections],
  );

  const activeStudents = useMemo(
    () =>
      (studentsQuery.data || []).filter(
        s =>
          finalYearSectionIds.has(s.sectionId) &&
          s.status === STUDENT_STATUS.ACTIVE,
      ),
    [studentsQuery.data, finalYearSectionIds],
  );

  const isLoading = sectionsQuery.isLoading || studentsQuery.isLoading;
  const allSelected =
    activeStudents.length > 0 &&
    activeStudents.every(s => selectedIds.has(s.id));

  const toggleStudent = id => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(activeStudents.map(s => s.id)));
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const ids = [...selectedIds];
      let count = 0;
      for (const studentId of ids) {
        await studentService.updateStudentStatus(
          {studentId, status: STUDENT_STATUS.GRADUATED},
          scope,
        );
        count += 1;
      }
      return count;
    },
    onSuccess: count => {
      setSuccessCount(count);
      setSelectedIds(new Set());
      setError('');
      queryClient.invalidateQueries({queryKey: ['studentsByBranch', user?.branchId]});
    },
    onError: err => setError(err.message || 'Something went wrong. Please try again.')});

  const canGraduate = selectedIds.size > 0 && !mutation.isPending;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Hero header ── */}
      <Animated.View style={styles.header}>
        <View style={styles.headerDecor} />
        <Text style={styles.headerOverline}>Principal · Class {FINAL_CLASS}</Text>
        <Text style={styles.headerTitle}>Graduate Students</Text>
        <Text style={styles.headerSub}>
          Mark Class {FINAL_CLASS} students as graduated. This cannot be undone.
        </Text>

        {/* Stats strip */}
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{finalYearSections.length}</Text>
            <Text style={styles.statLabel}>Sections</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{activeStudents.length}</Text>
            <Text style={styles.statLabel}>Active students</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{selectedIds.size}</Text>
            <Text style={styles.statLabel}>Selected</Text>
          </View>
        </View>
      </Animated.View>

      {/* ── Success banner ── */}
      {successCount > 0 && !mutation.isPending ? (
        <Animated.View style={styles.successBanner}>
          <MaterialCommunityIcons name="check-circle" size={18} color={colors.success} />
          <Text style={styles.successText}>
            {successCount} student{successCount !== 1 ? 's' : ''} successfully graduated.
          </Text>
        </Animated.View>
      ) : null}

      {/* ── Error banner ── */}
      {error ? (
        <Animated.View style={styles.errorBanner}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      ) : null}

      {/* ── No sections ── */}
      {!isLoading && finalYearSections.length === 0 ? (
        <Animated.View style={styles.emptyCard}>
          <MaterialCommunityIcons name="school-outline" size={48} color={colors.primarySoft} />
          <Text style={styles.emptyTitle}>No Class {FINAL_CLASS} Sections</Text>
          <Text style={styles.emptyBody}>
            Create Class {FINAL_CLASS} sections in Academic Structure first.
          </Text>
        </Animated.View>
      ) : null}

      {/* ── No active students ── */}
      {!isLoading && finalYearSections.length > 0 && activeStudents.length === 0 ? (
        <Animated.View style={styles.emptyCard}>
          <MaterialCommunityIcons name="account-check-outline" size={48} color={colors.primarySoft} />
          <Text style={styles.emptyTitle}>All Students Graduated</Text>
          <Text style={styles.emptyBody}>
            No active Class {FINAL_CLASS} students remain.
          </Text>
        </Animated.View>
      ) : null}

      {/* ── Student list ── */}
      {activeStudents.length > 0 ? (
        <Animated.View>
          {/* Select-all row */}
          <View style={styles.selectAllRow}>
            <Pressable onPress={toggleAll} style={styles.selectAllBtn} hitSlop={8}>
              <MaterialCommunityIcons
                name={allSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={22}
                color={allSelected ? colors.primary : colors.textMuted}
              />
              <Text style={styles.selectAllText}>
                {allSelected ? 'Deselect all' : 'Select all'} ({activeStudents.length})
              </Text>
            </Pressable>
          </View>

          {activeStudents.map((student, index) => {
            const checked = selectedIds.has(student.id);
            const sectionObj = finalYearSections.find(
              s => s.id === student.sectionId,
            );
            const sectionLabel = sectionObj
              ? `${sectionObj.academicClass?.name}-${sectionObj.name}`
              : 'Class 12';

            return (
              <Animated.View
                key={student.id}>
                <Pressable
                  onPress={() => toggleStudent(student.id)}
                  style={[styles.studentCard, checked && styles.studentCardChecked]}>
                  {/* Accent bar */}
                  <View
                    style={[
                      styles.accentBar,
                      {backgroundColor: checked ? colors.success : colors.border},
                    ]}
                  />
                  <View style={styles.studentInner}>
                    {/* Checkbox */}
                    <MaterialCommunityIcons
                      name={checked ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                      size={24}
                      color={checked ? colors.success : colors.textMuted}
                    />

                    {/* Avatar */}
                    <View
                      style={[
                        styles.avatar,
                        {backgroundColor: checked ? `${colors.success}18` : colors.primaryFaint},
                      ]}>
                      <Text
                        style={[
                          styles.avatarText,
                          {color: checked ? colors.success : colors.primary},
                        ]}>
                        {(student.name || 'S').charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    {/* Name + details */}
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName} numberOfLines={1}>
                        {student.name || '—'}
                      </Text>
                      <View style={styles.studentMeta}>
                        <Text style={styles.studentMetaText}>{sectionLabel}</Text>
                        {student.admissionNumber ? (
                          <>
                            <Text style={styles.metaDot}>·</Text>
                            <Text style={styles.studentMetaText}>
                              {student.admissionNumber}
                            </Text>
                          </>
                        ) : null}
                      </View>
                    </View>

                    {/* Status chip */}
                    {checked ? (
                      <View style={styles.graduateChip}>
                        <Text style={styles.graduateChipText}>GRADUATE</Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </Animated.View>
      ) : null}

      {/* ── Loading skeletons ── */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading students…</Text>
        </View>
      ) : null}

      {/* ── Bottom action ── */}
      {activeStudents.length > 0 ? (
        <Animated.View style={styles.footer}>
          <View style={styles.footerInfo}>
            <MaterialCommunityIcons name="school" size={16} color={colors.textMuted} />
            <Text style={styles.footerInfoText}>
              {selectedIds.size} of {activeStudents.length} students selected
            </Text>
          </View>
          <Pressable
            onPress={() => setConfirmVisible(true)}
            disabled={!canGraduate}
            style={[styles.graduateBtn, !canGraduate && styles.graduateBtnDisabled]}>
            {mutation.isPending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <MaterialCommunityIcons name="school" size={18} color={colors.white} />
            )}
            <Text style={styles.graduateBtnText}>
              {mutation.isPending
                ? 'Graduating…'
                : `Graduate ${selectedIds.size > 0 ? selectedIds.size : ''} Student${selectedIds.size !== 1 ? 's' : ''}`}
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}
      <ConfirmationModal
        visible={confirmVisible}
        title="Graduate Students?"
        message={`Mark ${selectedIds.size} student${selectedIds.size !== 1 ? 's' : ''} as graduated from the final year? This cannot be undone.`}
        confirmLabel="Yes, Graduate"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={() => {
          setConfirmVisible(false);
          mutation.mutate();
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {flex: 1, backgroundColor: colors.background},
  scroll: {padding: spacing.lg, paddingBottom: 40},

  // ── Header ──
  header: {
    ...shadows.clayDeep,
    backgroundColor: colors.success,
    borderRadius: radius.hero,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    padding: spacing.xl,
    paddingBottom: spacing.xl},
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 999,
    height: 160,
    position: 'absolute',
    right: -30,
    top: -50,
    width: 160},
  headerOverline: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  headerTitle: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: spacing.xs},
  headerSub: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: spacing.lg},

  // Stats strip
  statsRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.card,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md},
  statPill: {alignItems: 'center', flex: 1},
  statValue: {color: colors.white, fontSize: 20, fontWeight: '900'},
  statLabel: {color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: '600', marginTop: 2},
  statDivider: {backgroundColor: 'rgba(255,255,255,0.2)', height: 32, width: 1},

  // ── Banners ──
  successBanner: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: `${colors.success}12`,
    borderColor: `${colors.success}30`,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md},
  successText: {color: colors.success, flex: 1, fontSize: 13, fontWeight: '700'},
  errorBanner: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md},
  errorText: {color: colors.danger, flex: 1, fontSize: 13, fontWeight: '600'},

  // ── Empty state ──
  emptyCard: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    gap: spacing.sm,
    padding: spacing.xxl},
  emptyTitle: {...typography.subtitle, color: colors.text, textAlign: 'center'},
  emptyBody: {color: colors.textMuted, fontSize: 13, lineHeight: 18, textAlign: 'center'},

  // ── Select all row ──
  selectAllRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.sm},
  selectAllBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs},
  selectAllText: {color: colors.primary, fontSize: 13, fontWeight: '700'},

  // ── Student card ──
  studentCard: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    overflow: 'hidden'},
  studentCardChecked: {
    borderColor: `${colors.success}50`,
    backgroundColor: `${colors.success}06`},
  accentBar: {height: 4},
  studentInner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md},
  avatar: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40},
  avatarText: {fontSize: 16, fontWeight: '800'},
  studentInfo: {flex: 1, minWidth: 0},
  studentName: {...typography.bodyBold, color: colors.text},
  studentMeta: {alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 2},
  studentMetaText: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},
  metaDot: {color: colors.textMuted, fontSize: 11},
  graduateChip: {
    backgroundColor: `${colors.success}18`,
    borderColor: `${colors.success}40`,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2},
  graduateChipText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase'},

  // ── Loading ──
  loadingWrap: {alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl},
  loadingText: {color: colors.textMuted, fontSize: 13},

  // ── Footer ──
  footer: {
    ...shadows.clayDeep,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.hero,
    borderWidth: 1.5,
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg},
  footerInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center'},
  footerInfoText: {color: colors.textMuted, fontSize: 12, fontWeight: '600'},
  graduateBtn: {
    ...shadows.fab,
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 52,
    justifyContent: 'center'},
  graduateBtnDisabled: {
    backgroundColor: colors.textSoft,
    elevation: 0,
    shadowOpacity: 0},
  graduateBtnText: {color: colors.white, fontSize: 15, fontWeight: '800'}});

export default GraduateFinalYearScreen;
