import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {ConfirmationModal, EmptyState} from '../../components';
import subjectService from '../../services/subjects/subjectService';
import teacherService from '../../services/teachers/teacherService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const AssignSubjectsScreen = ({navigation, route}) => {
  const teacherId = route.params?.teacherId;
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  const {data: teacher} = useQuery({
    queryKey: ['teacher', teacherId],
    queryFn: () => teacherService.getTeacherProfile(teacherId),
    enabled: Boolean(teacherId)});
  const {data: subjects = [], isLoading} = useQuery({
    queryKey: ['subjects', 0],
    queryFn: () => subjectService.getSubjects({limit: 100, offset: 0})});

  useEffect(() => {
    if (teacher?.subjects) {
      setSelected(teacher.subjects.map(item => item.id));
    }
  }, [teacher]);

  const activeSubjects = useMemo(
    () => subjects.filter(item => item.status === 'ACTIVE'),
    [subjects],
  );

  const mutation = useMutation({
    mutationFn: () => teacherService.assignTeacherSubjects({teacher, subjectIds: selected}, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['teacher', teacherId]});
      queryClient.invalidateQueries({queryKey: ['teachers', user?.branchId]});
      navigation.goBack();
    },
    onError: err => setError(err.message)});

  const toggle = subjectId =>
    setSelected(current =>
      current.includes(subjectId)
        ? current.filter(item => item !== subjectId)
        : [...current, subjectId],
    );

  return (
    <View style={styles.root}>
      <FlatList
        data={activeSubjects}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Animated.View style={styles.hero}>
              <View style={styles.heroDecor} />
              <Text style={styles.heroOverline}>Teacher</Text>
              <Text style={styles.heroTitle}>Assign Subjects</Text>
              <Text style={styles.heroSub} numberOfLines={1}>
                {teacher?.fullName || teacher?.user?.fullName || 'Teacher'}
              </Text>
            </Animated.View>
            {selected.length > 0 ? (
              <View style={styles.selectedInfo}>
                <MaterialCommunityIcons name="book-check-outline" size={13} color={colors.secondary} />
                <Text style={styles.selectedInfoText}>{selected.length} subject{selected.length > 1 ? 's' : ''} selected</Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => {
          const checked = selected.includes(item.id);
          return (
            <Animated.View>
              <Pressable
                onPress={() => toggle(item.id)}
                style={({pressed}) => [styles.subjectRow, pressed && {opacity: 0.88}]}>
                <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                  {checked ? <MaterialCommunityIcons name="check" size={14} color={colors.white} /> : null}
                </View>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectName}>{item.name}</Text>
                  <Text style={styles.subjectCode}>{item.code}</Text>
                </View>
              </Pressable>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title={isLoading ? 'Loading subjects' : 'No active subjects'}
            message="Create active master subjects before assigning them."
          />
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            <Pressable
              onPress={() => setConfirmVisible(true)}
              disabled={mutation.isPending || !teacher}
              style={({pressed}) => [
                styles.saveBtn,
                (mutation.isPending || !teacher) && {opacity: 0.5},
                pressed && teacher && {opacity: 0.88},
              ]}>
              <MaterialCommunityIcons name="content-save-outline" size={18} color={colors.white} />
              <Text style={styles.saveBtnText}>{mutation.isPending ? 'Saving…' : 'Save Subject Assignments'}</Text>
            </Pressable>
            <View style={{height: spacing.xxxl}} />
          </View>
        }
      />
      <ConfirmationModal
        visible={confirmVisible}
        title="Save Subject Assignments?"
        message={`Assign ${selected.length} subject${selected.length !== 1 ? 's' : ''} to this teacher?`}
        confirmLabel="Yes, Save"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmVisible(false);
          mutation.mutate();
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

  hero: {
    backgroundColor: colors.secondary,
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
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600', marginTop: 4},

  selectedInfo: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md},
  selectedInfoText: {color: colors.secondary, fontSize: 13, fontWeight: '700'},

  subjectRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.clay},
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22},
  checkboxChecked: {backgroundColor: colors.secondary, borderColor: colors.secondary},
  subjectInfo: {flex: 1},
  subjectName: {...typography.bodyBold, color: colors.text},
  subjectCode: {color: colors.textMuted, fontSize: 11, fontWeight: '600', marginTop: 2},

  footer: {marginTop: spacing.md},
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md},
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},
  saveBtn: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 50,
    justifyContent: 'center',
    ...shadows.fab},
  saveBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'}});

export default AssignSubjectsScreen;
