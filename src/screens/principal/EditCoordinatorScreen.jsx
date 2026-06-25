import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Switch, TextInput, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {ConfirmationModal, SelectField} from '../../components';
import {WINGS, WING_LABELS} from '../../config/academic';
import coordinatorService from '../../services/coordinators/coordinatorService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, radius, shadows, spacing} from '../../theme';

const wingOptions = Object.values(WINGS).map(value => ({label: WING_LABELS[value], value}));
const genderOptions = ['Female', 'Male', 'Other'].map(value => ({label: value, value}));

const InputRow = ({icon, label, ...props}) => (
  <View style={styles.inputWrap}>
    <MaterialCommunityIcons name={icon} size={14} color={colors.textMuted} style={styles.inputIcon} />
    <TextInput style={styles.input} placeholder={label} placeholderTextColor={colors.textSoft} {...props} />
  </View>
);

const EditCoordinatorScreen = ({navigation, route}) => {
  const coordinator = route.params?.coordinator;
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [form, setForm] = useState({
    coordinatorId: coordinator?.id,
    userId: coordinator?.userId,
    branchId: coordinator?.branchId,
    fullName: coordinator?.user?.fullName || '',
    phoneNumber: coordinator?.user?.phoneNumber || '',
    email: coordinator?.email || '',
    gender: coordinator?.gender || '',
    employeeId: coordinator?.employeeId || '',
    wing: coordinator?.wing || WINGS.PRE_PRIMARY,
    isActive: coordinator?.isActive ?? true});
  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  const mutation = useMutation({
    mutationFn: payload => coordinatorService.updateCoordinator(payload, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['coordinators', user?.branchId]});
      queryClient.invalidateQueries({queryKey: ['coordinator', coordinator?.id]});
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
        <Text style={styles.heroOverline}>Principal</Text>
        <Text style={styles.heroTitle} numberOfLines={1}>{coordinator?.user?.fullName || 'Edit Coordinator'}</Text>
        <Text style={styles.heroSub}>Update profile, wing, and active state</Text>
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Personal Info</Text>
        <InputRow icon="account-outline" label="Full Name" value={form.fullName} onChangeText={v => updateField('fullName', v)} />
        <InputRow icon="phone-outline" label="Mobile Number" keyboardType="phone-pad" value={form.phoneNumber} onChangeText={v => updateField('phoneNumber', v)} />
        <InputRow icon="email-outline" label="Email" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={v => updateField('email', v)} />
        <InputRow icon="badge-account-outline" label="Employee ID" value={form.employeeId} onChangeText={v => updateField('employeeId', v)} />
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Assignment</Text>
        <View style={styles.selectWrap}>
          <SelectField label="Gender" value={form.gender} options={genderOptions} onChange={v => updateField('gender', v)} />
        </View>
        <View style={styles.selectWrap}>
          <SelectField label="Wing Assignment" value={form.wing} options={wingOptions} onChange={v => updateField('wing', v)} />
        </View>
        <View style={styles.switchRow}>
          <MaterialCommunityIcons name="check-circle-outline" size={15} color={colors.textMuted} />
          <View style={styles.switchCopy}>
            <Text style={styles.switchTitle}>Active Coordinator</Text>
            <Text style={styles.switchMeta}>Inactive coordinators cannot log in.</Text>
          </View>
          <Switch
            value={form.isActive}
            onValueChange={v => updateField('isActive', v)}
            trackColor={{false: colors.border, true: colors.primarySoft}}
            thumbColor={form.isActive ? colors.primary : colors.textMuted}
          />
        </View>
      </Animated.View>

      {error ? (
        <View style={styles.errorBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => setConfirmVisible(true)}
        disabled={mutation.isPending}
        style={({pressed}) => [styles.submitBtn, mutation.isPending && {opacity: 0.5}, pressed && !mutation.isPending && {opacity: 0.88}]}>
        <MaterialCommunityIcons name="content-save-outline" size={18} color={colors.white} />
        <Text style={styles.submitBtnText}>{mutation.isPending ? 'Saving…' : 'Save Coordinator'}</Text>
      </Pressable>

      <View style={{height: spacing.xxxl}} />
      <ConfirmationModal
        visible={confirmVisible}
        title="Save Changes?"
        message={`Update coordinator profile for ${form.fullName || 'this coordinator'}?`}
        confirmLabel="Yes, Save"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmVisible(false);
          mutation.mutate(form);
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
  inputWrap: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md},
  inputIcon: {marginRight: spacing.sm},
  input: {color: colors.text, flex: 1, fontSize: 14, fontWeight: '500', minHeight: 46},
  selectWrap: {borderTopColor: colors.border, borderTopWidth: 1, padding: spacing.sm},
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

export default EditCoordinatorScreen;
