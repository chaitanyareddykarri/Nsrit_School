import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {ConfirmationModal, EmptyState, SelectField, SkeletonLoader} from '../../components';
import subjectService from '../../services/subjects/subjectService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const statusOptions = ['ACTIVE', 'INACTIVE'].map(value => ({label: value, value}));

const SubjectCard = ({item, index, onEdit}) => {
  const isActive = item.status !== 'INACTIVE';
  return (
    <Animated.View>
      <Pressable
        onPress={() => onEdit(item)}
        style={({pressed}) => [styles.subjectCard, pressed && {opacity: 0.88}]}>
        <View style={styles.subjectIcon}>
          <MaterialCommunityIcons
            name="book-open-page-variant-outline"
            size={18}
            color={colors.secondary}
          />
        </View>
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>{item.name}</Text>
          <Text style={styles.subjectCode}>{item.code}</Text>
        </View>
        <View style={[styles.statusBadge, {backgroundColor: isActive ? colors.successSoft : colors.dangerSoft}]}>
          <Text style={[styles.statusText, {color: isActive ? colors.success : colors.danger}]}>
            {item.status}
          </Text>
        </View>
        <MaterialCommunityIcons name="pencil-outline" size={14} color={colors.textMuted} />
      </Pressable>
    </Animated.View>
  );
};

const SubjectManagementScreen = () => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({id: null, name: '', code: '', status: 'ACTIVE'});
  const [error, setError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  const {data = [], isLoading} = useQuery({
    queryKey: ['subjects', 0],
    queryFn: () => subjectService.getSubjects({limit: 100, offset: 0})});

  const subjects = useMemo(() => data, [data]);

  const mutation = useMutation({
    mutationFn: payload =>
      payload.id
        ? subjectService.updateSubject({...payload, subjectId: payload.id}, scope)
        : subjectService.createSubject(payload, scope),
    onSuccess: () => {
      setForm({id: null, name: '', code: '', status: 'ACTIVE'});
      setError('');
      queryClient.invalidateQueries({queryKey: ['subjects']});
    },
    onError: err => setError(err.message)});

  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  return (
    <View style={styles.root}>
      <FlatList
        data={subjects}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ── Hero ── */}
            <Animated.View style={styles.header}>
              <View style={styles.headerDecor} />
              <Text style={styles.headerOverline}>Teacher</Text>
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Subjects</Text>
                {subjects.length > 0 ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{subjects.length}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.headerSub}>Reusable master subject list</Text>
            </Animated.View>

            {/* ── Form card ── */}
            <Animated.View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {form.id ? 'Edit Subject' : 'Create Subject'}
              </Text>

              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="book-open-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Subject Name"
                  placeholderTextColor={colors.textSoft}
                  value={form.name}
                  onChangeText={value => updateField('name', value)}
                />
              </View>

              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="tag-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Subject Code (e.g. MATH)"
                  placeholderTextColor={colors.textSoft}
                  value={form.code}
                  onChangeText={value => updateField('code', value)}
                  autoCapitalize="characters"
                />
              </View>

              <SelectField
                label="Status"
                value={form.status}
                options={statusOptions}
                onChange={value => updateField('status', value)}
              />

              {error ? (
                <View style={styles.errorBox}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={() => setConfirmVisible(true)}
                disabled={mutation.isPending}
                style={({pressed}) => [
                  styles.submitBtn,
                  mutation.isPending && styles.submitBtnDisabled,
                  pressed && !mutation.isPending && {opacity: 0.88},
                ]}>
                <MaterialCommunityIcons
                  name={form.id ? 'content-save-outline' : 'plus-circle-outline'}
                  size={18}
                  color={colors.white}
                />
                <Text style={styles.submitBtnText}>
                  {mutation.isPending ? 'Saving…' : form.id ? 'Update Subject' : 'Create Subject'}
                </Text>
              </Pressable>

              {form.id ? (
                <Pressable
                  onPress={() => setForm({id: null, name: '', code: '', status: 'ACTIVE'})}
                  style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancel Edit</Text>
                </Pressable>
              ) : null}
            </Animated.View>

            {subjects.length > 0 ? (
              <Text style={styles.sectionLabel}>All Subjects</Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <SubjectCard
            item={item}
            index={index}
            onEdit={setForm}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <SkeletonLoader rows={3} />
          ) : (
            <EmptyState
              title="No subjects"
              message="Create reusable master subjects for assignments."
            />
          )
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
      <ConfirmationModal
        visible={confirmVisible}
        title={form.id ? 'Update Subject?' : 'Create Subject?'}
        message={`${form.id ? 'Update' : 'Create'} the subject "${form.name || ''}"?`}
        confirmLabel="Yes, Save"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmVisible(false);
          mutation.mutate(form);
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

  header: {
    backgroundColor: colors.secondary,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130},
  headerOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  headerRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 2},
  countBadgeText: {color: colors.white, fontSize: 12, fontWeight: '800'},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 4},

  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    ...shadows.clay},
  formTitle: {color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: spacing.md},

  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md},
  inputIcon: {marginRight: spacing.sm},
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    height: 46},

  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.sm},
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},

  submitBtn: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 48,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.fab},
  submitBtnDisabled: {opacity: 0.55},
  submitBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'},
  cancelBtn: {alignItems: 'center', paddingVertical: spacing.sm},
  cancelBtnText: {color: colors.textMuted, fontSize: 13, fontWeight: '600'},

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'},

  subjectCard: {
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
  subjectIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.lg,
    height: 40,
    justifyContent: 'center',
    width: 40},
  subjectInfo: {flex: 1, minWidth: 0},
  subjectName: {...typography.bodyBold, color: colors.text},
  subjectCode: {color: colors.textMuted, fontSize: 11, fontWeight: '600', marginTop: 2},
  statusBadge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2},
  statusText: {fontSize: 9, fontWeight: '800'}});

export default SubjectManagementScreen;
