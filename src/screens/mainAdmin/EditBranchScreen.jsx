import React, {useState} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, shadows, spacing} from '../../theme';

const InputField = ({icon, label, ...props}) => (
  <View style={styles.inputWrap}>
    <MaterialCommunityIcons name={icon} size={15} color={colors.textMuted} style={styles.inputIcon} />
    <TextInput style={styles.input} placeholder={label} placeholderTextColor={colors.textSoft} {...props} />
  </View>
);

const EditBranchScreen = ({navigation, route}) => {
  const branch = route.params?.branch || {};
  const [form, setForm] = useState({
    id: branch.id,
    name: branch.name || '',
    address: branch.address || '',
    city: branch.city || '',
    state: branch.state || '',
    pincode: branch.pincode || '',
    phone: branch.phone || '',
    email: branch.email || '',
    status: branch.status || (branch.isActive ? 'ACTIVE' : 'INACTIVE')});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  const save = async () => {
    try {
      setSaving(true);
      setError(null);
      await mainAdminService.updateBranch(form);
      Toast.show({type: 'success', text1: 'Branch updated'});
      navigation.navigate('BranchDetails', {branchId: form.id});
    } catch (saveError) {
      setError(saveError.message || 'Unable to update branch');
    } finally {
      setSaving(false);
    }
  };

  const confirmSave = () => {
    Alert.alert('Update branch?', 'Changes will be saved to Firebase Data Connect.', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Update', onPress: save},
    ]);
  };

  const isActive = form.status === 'ACTIVE';

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
        <Text style={styles.heroTitle} numberOfLines={1}>{branch.name || 'Edit Branch'}</Text>
        <Text style={styles.heroSub}>Update branch profile and active status</Text>
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Branch Name</Text>
        <InputField icon="office-building-outline" label="Branch name" value={form.name} onChangeText={v => updateField('name', v)} />
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

      {/* Status toggle */}
      <View style={styles.formCard}>
        <Text style={styles.formSection}>Status</Text>
        <View style={styles.statusRow}>
          {['ACTIVE', 'INACTIVE'].map(s => (
            <Pressable
              key={s}
              onPress={() => updateField('status', s)}
              style={[styles.statusBtn, form.status === s && styles.statusBtnActive]}>
              <Text style={[styles.statusBtnText, form.status === s && styles.statusBtnTextActive]}>
                {s === 'ACTIVE' ? 'Active' : 'Inactive'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={confirmSave}
        disabled={!form.name || saving}
        style={({pressed}) => [styles.submitBtn, (!form.name || saving) && {opacity: 0.5}, pressed && form.name && {opacity: 0.88}]}>
        <MaterialCommunityIcons name="content-save-outline" size={18} color={colors.white} />
        <Text style={styles.submitBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
      </Pressable>

      <View style={{height: spacing.xxxl}} />
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
  heroTitle: {color: colors.white, fontSize: 20, fontWeight: '800'},
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
  statusRow: {borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', gap: spacing.sm, padding: spacing.md},
  statusBtn: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flex: 1,
    paddingVertical: spacing.sm},
  statusBtnActive: {backgroundColor: colors.primaryDark, borderColor: colors.primaryDark},
  statusBtnText: {color: colors.text, fontSize: 13, fontWeight: '700'},
  statusBtnTextActive: {color: colors.white},
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

export default EditBranchScreen;
