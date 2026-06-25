import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {ConfirmationModal, DatePickerField, SelectField} from '../../components';
import accountantService from '../../services/accountants/accountantService';
import {getAccessScope} from '../../services/rbacScope';
import {toISODate} from '../../utils/helpers/dateHelpers';
import {colors, radius, shadows, spacing} from '../../theme';

const genderOptions = ['Female', 'Male', 'Other'].map(value => ({label: value, value}));

const InputRow = ({icon, label, ...props}) => (
  <View style={styles.inputWrap}>
    <MaterialCommunityIcons name={icon} size={14} color={colors.textMuted} style={styles.inputIcon} />
    <TextInput style={styles.input} placeholder={label} placeholderTextColor={colors.textSoft} {...props} />
  </View>
);

const CreateAccountantScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    fullName: '', phoneNumber: '', gender: '',
    joiningDate: toISODate(new Date()), designation: 'Accountant',
    email: '', qualification: '', experience: '',
    address: '', city: '', state: '', pincode: '',
    emergencyContact: '', bloodGroup: '', countryCode: '+91'});
  const [error, setError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  const mutation = useMutation({
    mutationFn: () => accountantService.createAccountant(form, scope),
    onSuccess: accountant => {
      queryClient.invalidateQueries({queryKey: ['accountants', user?.branchId]});
      navigation.replace('AccountantProfile', {accountantId: accountant.id});
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
        <Text style={styles.heroTitle}>Create Accountant</Text>
        <Text style={styles.heroSub}>Employee ID is generated automatically</Text>
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Personal Info</Text>
        <InputRow icon="account-outline" label="Full Name *" value={form.fullName} onChangeText={v => updateField('fullName', v)} />
        <InputRow icon="phone-outline" label="Mobile Number *" keyboardType="phone-pad" value={form.phoneNumber} onChangeText={v => updateField('phoneNumber', v)} />
        <InputRow icon="email-outline" label="Email" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={v => updateField('email', v)} />
        <View style={styles.selectWrap}>
          <SelectField label="Gender *" value={form.gender} options={genderOptions} onChange={v => updateField('gender', v)} />
        </View>
        <InputRow icon="water-outline" label="Blood Group" value={form.bloodGroup} onChangeText={v => updateField('bloodGroup', v)} />
        <InputRow icon="phone-alert-outline" label="Emergency Contact" keyboardType="phone-pad" value={form.emergencyContact} onChangeText={v => updateField('emergencyContact', v)} />
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Employment</Text>
        <InputRow icon="briefcase-outline" label="Designation *" value={form.designation} onChangeText={v => updateField('designation', v)} />
        <View style={styles.selectWrap}>
          <DatePickerField label="Joining Date" value={form.joiningDate} maximumDate={toISODate(new Date())} required onChange={v => updateField('joiningDate', v)} />
        </View>
        <InputRow icon="school-outline" label="Qualification" value={form.qualification} onChangeText={v => updateField('qualification', v)} />
        <InputRow icon="clock-outline" label="Experience" value={form.experience} onChangeText={v => updateField('experience', v)} />
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Address</Text>
        <InputRow icon="home-outline" label="Address" multiline value={form.address} onChangeText={v => updateField('address', v)} />
        <InputRow icon="city-variant-outline" label="City" value={form.city} onChangeText={v => updateField('city', v)} />
        <InputRow icon="map-outline" label="State" value={form.state} onChangeText={v => updateField('state', v)} />
        <InputRow icon="numeric" label="Pincode" keyboardType="number-pad" value={form.pincode} onChangeText={v => updateField('pincode', v)} />
      </Animated.View>

      {error ? (
        <View style={styles.errorBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => setConfirmVisible(true)}
        disabled={!form.fullName || !form.phoneNumber || mutation.isPending}
        style={({pressed}) => [
          styles.submitBtn,
          (!form.fullName || !form.phoneNumber || mutation.isPending) && {opacity: 0.5},
          pressed && form.fullName && form.phoneNumber && {opacity: 0.88},
        ]}>
        <MaterialCommunityIcons name="account-plus-outline" size={18} color={colors.white} />
        <Text style={styles.submitBtnText}>{mutation.isPending ? 'Creating…' : 'Create Accountant'}</Text>
      </Pressable>

      <View style={{height: spacing.xxxl}} />
      <ConfirmationModal
        visible={confirmVisible}
        title="Create Accountant?"
        message={`Create accountant account for ${form.fullName || 'this user'}?`}
        confirmLabel="Yes, Create"
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
  inputWrap: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md},
  inputIcon: {marginRight: spacing.sm},
  input: {color: colors.text, flex: 1, fontSize: 14, fontWeight: '500', minHeight: 46},
  selectWrap: {borderTopColor: colors.border, borderTopWidth: 1, padding: spacing.sm},
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
    backgroundColor: colors.secondary,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 50,
    justifyContent: 'center',
    ...shadows.fab},
  submitBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'}});

export default CreateAccountantScreen;
