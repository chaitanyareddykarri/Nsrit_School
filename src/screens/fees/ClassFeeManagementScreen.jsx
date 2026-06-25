import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Switch, TextInput, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {ConfirmationModal, EmptyState, SelectField} from '../../components';
import useFeeAccess from '../../hooks/useFeeAccess';
import academicRepository from '../../repositories/academicRepository';
import feeService from '../../services/fees/feeService';
import academicYearService from '../../services/academicYear/academicYearService';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const makeAcademicYearOptions = (branchId) => {
  const year = academicYearService.getCurrentStartYear(branchId);
  return [year - 1, year, year + 1].map(value => ({label: `${value}-${String(value + 1).slice(-2)}`, value: String(value)}));
};

const statusOptions = [
  {label: 'Active', value: 'ACTIVE'},
  {label: 'Inactive', value: 'INACTIVE'},
];

const applyOptions = [
  {label: 'Existing Students', value: 'EXISTING'},
  {label: 'Future Students', value: 'FUTURE'},
  {label: 'Both', value: 'BOTH'},
];

const makeEmptyForm = (academicYear) => ({
  id: '',
  academicClassId: '',
  academicYear: String(academicYear),
  term1Fee: '',
  term2Fee: '',
  term3Fee: '',
  applyToFuture: true,
  status: 'ACTIVE'});

const NativeInput = ({icon, label, ...props}) => (
  <View style={styles.inputWrap}>
    <MaterialCommunityIcons name={icon} size={14} color={colors.textMuted} style={styles.inputIcon} />
    <TextInput style={styles.input} placeholder={label} placeholderTextColor={colors.textSoft} {...props} />
  </View>
);

const ClassFeeManagementScreen = () => {
  const access = useFeeAccess();
  const queryClient = useQueryClient();
  const canManage = feeService.canManageFeePlans(access.role);
  const currentAY = academicYearService.getCurrentStartYear(access.branchId);
  const [form, setForm] = useState(() => makeEmptyForm(currentAY));
  const [applyTo, setApplyTo] = useState('BOTH');
  const [error, setError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  const classesQuery = useQuery({
    queryKey: ['activeAcademicClasses', access.branchId],
    queryFn: () => academicRepository.getActiveAcademicClasses({limit: 300}),
    enabled: Boolean(canManage)});
  const classFeesQuery = useQuery({
    queryKey: ['classFees', access.branchId, form.academicYear],
    queryFn: () => feeService.getClassFees(access, {academicYear: Number(form.academicYear)}),
    enabled: Boolean(canManage && access.branchId)});

  const classes = useMemo(
    () => (classesQuery.data || []).filter(item => !access.branchId || item.branchId === access.branchId),
    [access.branchId, classesQuery.data],
  );
  const classOptions = classes.map(item => ({label: `${item.name} (${item.wing?.code || '-'})`, value: item.id, item}));
  const total = Number(form.term1Fee || 0) + Number(form.term2Fee || 0) + Number(form.term3Fee || 0);

  const resetForm = () => {
    setForm(makeEmptyForm(currentAY));
    setApplyTo('BOTH');
    setError('');
  };
  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  const mutation = useMutation({
    mutationFn: async () => {
      const saved = await feeService.saveClassFee(
        {
          ...form,
          branchId: access.branchId,
          term1Fee: Number(form.term1Fee || 0),
          term2Fee: Number(form.term2Fee || 0),
          term3Fee: Number(form.term3Fee || 0),
          applyToFuture: ['FUTURE', 'BOTH'].includes(applyTo)},
        access,
      );
      const classFee = {
        ...saved,
        id: saved.id || form.id,
        branchId: access.branchId,
        academicClassId: form.academicClassId,
        academicYear: Number(form.academicYear),
        term1Fee: Number(form.term1Fee || 0),
        term2Fee: Number(form.term2Fee || 0),
        term3Fee: Number(form.term3Fee || 0)};
      if (['EXISTING', 'BOTH'].includes(applyTo)) {
        await feeService.applyClassFee(classFee, access, applyTo);
      }
      return classFee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['classFees']});
      queryClient.invalidateQueries({queryKey: ['feeRecords']});
      queryClient.invalidateQueries({queryKey: ['feeReports']});
      queryClient.invalidateQueries({queryKey: ['parentChildren']});
      queryClient.invalidateQueries({queryKey: ['parentDashboard']});
      resetForm();
    },
    onError: err => setError(err.message)});

  const editTemplate = item => {
    setForm({
      id: item.id,
      academicClassId: item.academicClassId,
      academicYear: String(item.academicYear),
      term1Fee: String(item.term1Fee || ''),
      term2Fee: String(item.term2Fee || ''),
      term3Fee: String(item.term3Fee || ''),
      applyToFuture: item.applyToFuture !== false,
      status: item.status || 'ACTIVE'});
    setApplyTo(item.applyToFuture ? 'BOTH' : 'EXISTING');
  };

  const confirmSave = () => {
    if (!form.academicClassId || !form.academicYear || total <= 0) {
      setError('Select class, academic year, and enter at least one term fee.');
      return;
    }
    setConfirmVisible(true);
  };

  if (!canManage) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Access denied"
          message="Only coordinators, principals, branch admins, and main admins can manage class fees."
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={classFeesQuery.data || []}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ── Hero ── */}
            <Animated.View style={styles.hero}>
              <View style={styles.heroDecor} />
              <Text style={styles.heroOverline}>Fee</Text>
              <Text style={styles.heroTitle}>Class Fee Templates</Text>
              <Text style={styles.heroSub}>Academic year tuition templates by class</Text>
            </Animated.View>

            {/* ── Form ── */}
            <Animated.View style={styles.formCard}>
              <Text style={styles.formSection}>Class & Year</Text>
              <View style={styles.selectWrap}>
                <SelectField label="Academic Year" value={form.academicYear} options={makeAcademicYearOptions(access.branchId)} onChange={v => updateField('academicYear', v)} />
              </View>
              <View style={styles.selectWrap}>
                <SelectField label="Class" value={form.academicClassId} options={classOptions} onChange={v => updateField('academicClassId', v)} />
              </View>
            </Animated.View>

            <Animated.View style={styles.formCard}>
              <Text style={styles.formSection}>Term Fees</Text>
              <NativeInput icon="numeric-1-circle-outline" label="1st Term Fee" keyboardType="numeric" value={form.term1Fee} onChangeText={v => updateField('term1Fee', v)} />
              <NativeInput icon="numeric-2-circle-outline" label="2nd Term Fee" keyboardType="numeric" value={form.term2Fee} onChangeText={v => updateField('term2Fee', v)} />
              <NativeInput icon="numeric-3-circle-outline" label="3rd Term Fee" keyboardType="numeric" value={form.term3Fee} onChangeText={v => updateField('term3Fee', v)} />
            </Animated.View>

            {/* ── Total pill ── */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total Tuition</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>

            <Animated.View style={styles.formCard}>
              <Text style={styles.formSection}>Apply To</Text>
              <View style={styles.selectWrap}>
                <SelectField label="Apply To" value={applyTo} options={applyOptions} onChange={setApplyTo} />
              </View>
              <View style={styles.switchRow}>
                <MaterialCommunityIcons name="account-multiple-plus-outline" size={15} color={colors.textMuted} />
                <View style={styles.switchCopy}>
                  <Text style={styles.switchTitle}>Future Students</Text>
                  <Text style={styles.switchMeta}>New students inherit this class fee automatically.</Text>
                </View>
                <Switch
                  value={form.applyToFuture}
                  onValueChange={v => updateField('applyToFuture', v)}
                  trackColor={{false: colors.border, true: colors.secondarySoft}}
                  thumbColor={form.applyToFuture ? colors.secondary : colors.textMuted}
                />
              </View>
              <View style={styles.selectWrap}>
                <SelectField label="Status" value={form.status} options={statusOptions} onChange={v => updateField('status', v)} />
              </View>
            </Animated.View>

            {error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={confirmSave}
              disabled={mutation.isPending}
              style={({pressed}) => [styles.submitBtn, mutation.isPending && {opacity: 0.5}, pressed && !mutation.isPending && {opacity: 0.88}]}>
              <MaterialCommunityIcons name="content-save-outline" size={18} color={colors.white} />
              <Text style={styles.submitBtnText}>
                {mutation.isPending ? 'Saving…' : form.id ? 'Update Class Fee' : 'Create Class Fee'}
              </Text>
            </Pressable>
            {form.id ? (
              <Pressable onPress={resetForm} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel Edit</Text>
              </Pressable>
            ) : null}

            {(classFeesQuery.data || []).length > 0 ? (
              <Text style={styles.sectionLabel}>Existing Class Fees</Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <Animated.View>
            <Pressable
              onPress={() => editTemplate(item)}
              style={({pressed}) => [styles.feeCard, pressed && {opacity: 0.88}]}>
              <View style={styles.feeCardIcon}>
                <MaterialCommunityIcons name="google-classroom" size={16} color={colors.secondary} />
              </View>
              <View style={styles.feeCardBody}>
                <Text style={styles.feeCardTitle}>
                  {item.academicClass?.name || 'Class'} · {item.academicYear}-{String(Number(item.academicYear || 0) + 1).slice(-2)}
                </Text>
                <Text style={styles.feeCardMeta}>
                  T1 {formatCurrency(item.term1Fee)} · T2 {formatCurrency(item.term2Fee)} · T3 {formatCurrency(item.term3Fee)}
                </Text>
              </View>
              <View style={styles.feeCardRight}>
                <Text style={styles.feeCardTotal}>{formatCurrency(item.totalTuitionFee)}</Text>
                <MaterialCommunityIcons name="pencil-outline" size={13} color={colors.textMuted} />
              </View>
            </Pressable>
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState
            title={classFeesQuery.isLoading ? 'Loading class fees' : 'No class fees'}
            message={classFeesQuery.error?.message || 'Create class fee templates for the academic year.'}
          />
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
      <ConfirmationModal
        visible={confirmVisible}
        title="Save Class Fee?"
        message={`Apply this class fee structure to ${applyTo === 'BOTH' ? 'existing and future' : applyTo === 'EXISTING' ? 'existing' : 'future'} students?`}
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
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 4},

  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
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
  selectWrap: {borderTopColor: colors.border, borderTopWidth: 1, padding: spacing.sm},
  inputWrap: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md},
  inputIcon: {marginRight: spacing.sm},
  input: {color: colors.text, flex: 1, fontSize: 14, fontWeight: '500', minHeight: 46},

  switchRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md},
  switchCopy: {flex: 1},
  switchTitle: {color: colors.text, fontSize: 13, fontWeight: '700'},
  switchMeta: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},

  totalCard: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    padding: spacing.lg,
    ...shadows.clay},
  totalLabel: {color: colors.secondary, fontSize: 14, fontWeight: '700'},
  totalValue: {color: colors.secondary, fontSize: 20, fontWeight: '800'},

  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md},
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},
  submitBtn: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 50,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    ...shadows.fab},
  submitBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'},
  cancelBtn: {alignItems: 'center', marginBottom: spacing.md, paddingVertical: spacing.xs},
  cancelBtnText: {color: colors.textMuted, fontSize: 13, fontWeight: '600'},

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    textTransform: 'uppercase'},
  feeCard: {
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
  feeCardIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36},
  feeCardBody: {flex: 1},
  feeCardTitle: {...typography.bodyBold, color: colors.text},
  feeCardMeta: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  feeCardRight: {alignItems: 'flex-end', gap: 3},
  feeCardTotal: {color: colors.secondary, fontSize: 13, fontWeight: '800'}});

export default ClassFeeManagementScreen;
