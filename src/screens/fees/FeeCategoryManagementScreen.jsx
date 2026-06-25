import React, {useState} from 'react';
import {FlatList, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {ConfirmationModal, EmptyState, SelectField} from '../../components';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const statusOptions = [
  {label: 'Active', value: 'ACTIVE'},
  {label: 'Inactive', value: 'INACTIVE'},
];

const FeeCategoryManagementScreen = () => {
  const access = useFeeAccess();
  const queryClient = useQueryClient();
  const canManagePlans = feeService.canManageFeePlans(access.role);
  const [form, setForm] = useState({name: '', status: 'ACTIVE'});
  const [error, setError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const {data: categories = [], isLoading} = useQuery({
    queryKey: ['feeCategories', access.role],
    queryFn: () =>
      canManagePlans ? feeService.ensureDefaultFeeCategories(access) : feeService.getFeeCategories()});
  const mutation = useMutation({
    mutationFn: () => feeService.saveFeeCategory(form, access),
    onSuccess: () => {
      setForm({name: '', status: 'ACTIVE'});
      setError('');
      queryClient.invalidateQueries({queryKey: ['feeCategories']});
    },
    onError: err => setError(err.message)});

  return (
    <View style={styles.root}>
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ── Hero ── */}
            <Animated.View style={styles.hero}>
              <View style={styles.heroDecor} />
              <Text style={styles.heroOverline}>Fee</Text>
              <View style={styles.heroRow}>
                <Text style={styles.heroTitle}>Fee Categories</Text>
                {categories.length > 0 ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{categories.length}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.heroSub}>Reusable master categories</Text>
            </Animated.View>

            {/* ── Form ── */}
            {canManagePlans ? (
              <Animated.View style={styles.formCard}>
                <Text style={styles.formTitle}>{form.id ? 'Edit Category' : 'Create Category'}</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="tag-outline" size={15} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Category Name"
                    placeholderTextColor={colors.textSoft}
                    value={form.name}
                    onChangeText={value => setForm(current => ({...current, name: value}))}
                  />
                </View>
                <SelectField
                  label="Status"
                  value={form.status}
                  options={statusOptions}
                  onChange={value => setForm(current => ({...current, status: value}))}
                />
                {error ? (
                  <View style={styles.errorBox}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
                <Pressable
                  onPress={() => setConfirmVisible(true)}
                  disabled={!form.name || mutation.isPending}
                  style={({pressed}) => [
                    styles.submitBtn,
                    (!form.name || mutation.isPending) && {opacity: 0.5},
                    pressed && form.name && {opacity: 0.88},
                  ]}>
                  <Text style={styles.submitBtnText}>
                    {mutation.isPending ? 'Saving…' : form.id ? 'Update Category' : 'Create Category'}
                  </Text>
                </Pressable>
                {form.id ? (
                  <Pressable onPress={() => setForm({name: '', status: 'ACTIVE'})} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>Cancel Edit</Text>
                  </Pressable>
                ) : null}
              </Animated.View>
            ) : null}

            {categories.length > 0 ? (
              <Text style={styles.sectionLabel}>All Categories</Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <Animated.View>
            <Pressable
              onPress={canManagePlans ? () => setForm({id: item.id, name: item.name, status: item.status}) : undefined}
              disabled={!canManagePlans}
              style={({pressed}) => [styles.categoryCard, pressed && canManagePlans && {opacity: 0.88}]}>
              <View style={styles.categoryIcon}>
                <MaterialCommunityIcons name="tag-outline" size={16} color={colors.secondary} />
              </View>
              <Text style={styles.categoryName}>{item.name}</Text>
              <View style={[styles.statusBadge, {backgroundColor: item.status === 'ACTIVE' ? colors.successSoft : colors.dangerSoft}]}>
                <Text style={[styles.statusText, {color: item.status === 'ACTIVE' ? colors.success : colors.danger}]}>
                  {item.status}
                </Text>
              </View>
              {canManagePlans ? (
                <MaterialCommunityIcons name="pencil-outline" size={14} color={colors.textMuted} />
              ) : null}
            </Pressable>
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState
            title={isLoading ? 'Loading categories' : 'No categories'}
            message="Create fee categories to reuse in fee plans."
          />
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
      <ConfirmationModal
        visible={confirmVisible}
        title={form.id ? 'Update Category?' : 'Create Category?'}
        message={`${form.id ? 'Update' : 'Create'} the fee category "${form.name}"?`}
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
  heroRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  countBadge: {backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 2},
  countBadgeText: {color: colors.white, fontSize: 12, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 4},

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
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md},
  inputIcon: {marginRight: spacing.sm},
  input: {color: colors.text, flex: 1, fontSize: 14, fontWeight: '500', height: 46},
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm},
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},
  submitBtn: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    height: 46,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    ...shadows.fab},
  submitBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'},
  cancelBtn: {alignItems: 'center', paddingVertical: spacing.xs},
  cancelBtnText: {color: colors.textMuted, fontSize: 13, fontWeight: '600'},

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'},
  categoryCard: {
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
  categoryIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.lg,
    height: 36,
    justifyContent: 'center',
    width: 36},
  categoryName: {...typography.bodyBold, color: colors.text, flex: 1},
  statusBadge: {borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2},
  statusText: {fontSize: 9, fontWeight: '800'}});

export default FeeCategoryManagementScreen;
