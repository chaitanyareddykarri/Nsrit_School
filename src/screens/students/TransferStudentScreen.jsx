import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {ConfirmationModal, SelectField} from '../../components';
import {USER_ROLES} from '../../config/constants';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, radius, shadows, spacing} from '../../theme';
import academicYearService from '../../services/academicYear/academicYearService';

const TransferStudentScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const academicYear = academicYearService.getCurrentStartYear(user?.branchId);
  const [error, setError] = useState('');
  const [form, setForm] = useState({studentId: '', newSectionId: ''});
  const [confirmVisible, setConfirmVisible] = useState(false);

  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () => sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId)});
  const studentsQuery = useQuery({
    queryKey: ['transferStudents', user?.branchId, user?.wing],
    queryFn: () =>
      user.role === USER_ROLES.COORDINATOR
        ? studentService.getStudentsByWing({branchId: user.branchId, wing: user.wing, limit: 9999}, scope)
        : studentService.getStudentsByBranch(user.branchId, {limit: 9999}),
    enabled: Boolean(user?.branchId)});

  const students = useMemo(() => studentsQuery.data || [], [studentsQuery.data]);
  const sections = useMemo(() => {
    const items = sectionsQuery.data?.sections || [];
    return user.role === USER_ROLES.COORDINATOR
      ? items.filter(section => section.academicClass?.wing?.code === user.wing)
      : items;
  }, [sectionsQuery.data?.sections, user.role, user.wing]);

  const selectedStudent = students.find(item => item.id === form.studentId);
  const targetSection = sections.find(item => item.id === form.newSectionId);

  const studentOptions = useMemo(
    () => students.map(item => ({label: `${item.studentId} - ${item.fullName}`, value: item.id})),
    [students],
  );
  const sectionOptions = useMemo(
    () => sections.map(item => ({label: `${item.academicClass?.name}-${item.name}`, value: item.id})),
    [sections],
  );

  const mutation = useMutation({
    mutationFn: () =>
      studentService.transferStudent(
        {
          branchId: user.branchId,
          studentId: selectedStudent.id,
          oldSectionId: selectedStudent.sectionId,
          newSectionId: targetSection.id,
          newClassId: targetSection.academicClassId,
          className: targetSection.academicClass?.name,
          targetWing: targetSection.academicClass?.wing?.code},
        scope,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['transferStudents', user?.branchId, user?.wing]});
      navigation.goBack();
    },
    onError: err => setError(err.message)});

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">

      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <Text style={styles.heroOverline}>Students</Text>
        <Text style={styles.heroTitle}>Transfer Student</Text>
        <Text style={styles.heroSub}>Move a student between permitted sections</Text>
      </Animated.View>

      <View style={styles.formCard}>
        <Text style={styles.formSection}>Select Student & Target</Text>
        <View style={styles.selectWrap}>
          <SelectField
            label="Student"
            value={form.studentId}
            options={studentOptions}
            onChange={value => setForm(current => ({...current, studentId: value}))}
          />
        </View>
        <View style={styles.selectWrap}>
          <SelectField
            label="New Section"
            value={form.newSectionId}
            options={sectionOptions}
            onChange={value => setForm(current => ({...current, newSectionId: value}))}
          />
        </View>
      </View>

      {selectedStudent && targetSection ? (
        <View style={styles.previewCard}>
          <MaterialCommunityIcons name="transfer-right" size={18} color={colors.primary} />
          <View style={styles.previewBody}>
            <Text style={styles.previewName}>{selectedStudent.fullName}</Text>
            <Text style={styles.previewMeta}>
              Moving to {targetSection.academicClass?.name}-{targetSection.name}
            </Text>
          </View>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => setConfirmVisible(true)}
        disabled={mutation.isPending || !selectedStudent || !targetSection}
        style={({pressed}) => [
          styles.submitBtn,
          (mutation.isPending || !selectedStudent || !targetSection) && {opacity: 0.5},
          pressed && selectedStudent && targetSection && {opacity: 0.88},
        ]}>
        <MaterialCommunityIcons name="transfer-right" size={18} color={colors.white} />
        <Text style={styles.submitBtnText}>{mutation.isPending ? 'Transferring…' : 'Transfer Student'}</Text>
      </Pressable>

      <View style={{height: spacing.xxxl}} />
      <ConfirmationModal
        visible={confirmVisible}
        title="Transfer Student?"
        message={`Transfer ${selectedStudent?.fullName || 'this student'} to ${targetSection ? `${targetSection.academicClass?.name || ''}–${targetSection.name}` : 'the selected section'}?`}
        confirmLabel="Yes, Transfer"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmVisible(false);
          mutation.mutate();
        }}
        onCancel={() => setConfirmVisible(false)}
      />
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
  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.clay},
  formSection: {
    backgroundColor: colors.background,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    padding: spacing.md,
    paddingBottom: spacing.xs,
    textTransform: 'uppercase'},
  selectWrap: {borderTopColor: colors.borderLight, borderTopWidth: 1, padding: spacing.sm},
  previewCard: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md},
  previewBody: {flex: 1},
  previewName: {color: colors.primary, fontSize: 14, fontWeight: '800'},
  previewMeta: {color: colors.primary, fontSize: 12, fontWeight: '500', marginTop: 2, opacity: 0.7},
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md},
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},
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

export default TransferStudentScreen;
