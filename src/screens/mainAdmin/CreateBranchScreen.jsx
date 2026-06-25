import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {ConfirmationModal, SelectField} from '../../components';
import {createBranch} from '../../store/slices/branchSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const statusOptions = [
  {label: 'Active', value: 'ACTIVE'},
  {label: 'Inactive', value: 'INACTIVE'},
];

const InputField = ({icon, label, ...props}) => (
  <View style={styles.inputWrap}>
    <MaterialCommunityIcons name={icon} size={15} color={colors.textMuted} style={styles.inputIcon} />
    <TextInput style={styles.input} placeholder={label} placeholderTextColor={colors.textSoft} {...props} />
  </View>
);

const CreateBranchScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {loading, error} = useSelector(state => state.branches);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [form, setForm] = useState({
    name: '', code: '', address: '', city: '', state: '', pincode: '', phone: '', email: '', status: 'ACTIVE'});

  const updateField = (field, value) =>
    setForm(current => ({
      ...current,
      [field]: field === 'code' ? String(value || '').toUpperCase().slice(0, 2) : value}));

  const handleSubmit = async () => {
    const action = await dispatch(createBranch(form));
    if (createBranch.fulfilled.match(action)) {
      navigation.replace('BranchDetails', {branchId: action.payload.id});
    }
  };

  const isComplete = [form.name, form.code, form.address, form.city, form.state, form.pincode, form.phone, form.email, form.status]
    .every(value => String(value || '').trim());

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">

      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <Text style={styles.heroOverline}>Main Admin</Text>
        <Text style={styles.heroTitle}>Create Branch</Text>
        <Text style={styles.heroSub}>Add a campus and make it available for branch admins</Text>
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Branch Identity</Text>
        <InputField icon="office-building-outline" label="Branch name" value={form.name} onChangeText={v => updateField('name', v)} />
        <InputField icon="barcode" label="Branch code (2 chars)" value={form.code} onChangeText={v => updateField('code', v)} autoCapitalize="characters" maxLength={2} />
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Location</Text>
        <InputField icon="map-marker-outline" label="Address" value={form.address} onChangeText={v => updateField('address', v)} multiline />
        <InputField icon="city-variant-outline" label="City" value={form.city} onChangeText={v => updateField('city', v)} />
        <InputField icon="map-outline" label="State" value={form.state} onChangeText={v => updateField('state', v)} />
        <InputField icon="numeric" label="Pincode" value={form.pincode} onChangeText={v => updateField('pincode', v)} keyboardType="number-pad" />
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Contact</Text>
        <InputField icon="phone-outline" label="Contact number" value={form.phone} onChangeText={v => updateField('phone', v)} keyboardType="phone-pad" />
        <InputField icon="email-outline" label="Email" value={form.email} onChangeText={v => updateField('email', v)} keyboardType="email-address" autoCapitalize="none" />
      </Animated.View>

      <View style={styles.formCard}>
        <Text style={styles.formSection}>Status</Text>
        <View style={styles.selectWrap}>
          <SelectField label="Status" value={form.status} options={statusOptions} onChange={v => updateField('status', v)} />
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => setConfirmVisible(true)}
        disabled={!isComplete || loading}
        style={({pressed}) => [styles.submitBtn, (!isComplete || loading) && {opacity: 0.5}, pressed && isComplete && {opacity: 0.88}]}>
        <MaterialCommunityIcons name="check-circle-outline" size={18} color={colors.white} />
        <Text style={styles.submitBtnText}>{loading ? 'Saving…' : 'Save Branch'}</Text>
      </Pressable>

      <View style={{height: spacing.xxxl}} />
      <ConfirmationModal
        visible={confirmVisible}
        title="Create Branch?"
        message={`Create branch "${form.name || ''}" (${form.code || ''}) in ${form.city || ''}?`}
        confirmLabel="Yes, Create"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmVisible(false);
          handleSubmit();
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},
  hero: {
    backgroundColor: colors.primaryDark,
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
    backgroundColor: colors.primaryDark,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 50,
    justifyContent: 'center',
    ...shadows.fab},
  submitBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'}});

export default CreateBranchScreen;
