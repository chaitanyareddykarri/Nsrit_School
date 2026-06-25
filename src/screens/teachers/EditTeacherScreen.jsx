import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, TextInput, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {ConfirmationModal, DatePickerField, SelectField} from '../../components';
import teacherService from '../../services/teachers/teacherService';
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

const EditTeacherScreen = ({navigation, route}) => {
  const teacherId = route.params?.teacherId;
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [form, setForm] = useState(null);

  const {data: teacher} = useQuery({
    queryKey: ['teacher', teacherId],
    queryFn: () => teacherService.getTeacherProfile(teacherId),
    enabled: Boolean(teacherId)});

  useEffect(() => {
    if (!teacher) return;
    setForm({
      teacherId: teacher.id, userId: teacher.userId, branchId: teacher.branchId,
      fullName: teacher.fullName || teacher.user?.fullName || '',
      countryCode: teacher.countryCode || '+91',
      phoneNumber: teacher.phoneNumber || teacher.user?.phoneNumber || '',
      alternateMobileNumber: teacher.alternateMobileNumber || '',
      email: teacher.email || '', dateOfBirth: teacher.dateOfBirth || '',
      gender: teacher.gender || '', joiningDate: teacher.joiningDate || '',
      designation: teacher.designation || '', qualification: teacher.qualification || '',
      experience: teacher.experience || '', address: teacher.address || '',
      city: teacher.city || '', state: teacher.state || '', pincode: teacher.pincode || '',
      emergencyContact: teacher.emergencyContact || '', bloodGroup: teacher.bloodGroup || '',
      isActive: teacher.isActive ?? true});
  }, [teacher]);

  const mutation = useMutation({
    mutationFn: payload => teacherService.updateTeacher(payload, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['teachers', user?.branchId]});
      queryClient.invalidateQueries({queryKey: ['teacher', teacherId]});
      navigation.goBack();
    },
    onError: err => setError(err.message)});

  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  if (!form) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.secondary} size="large" />
        <Text style={styles.loadingText}>Loading teacher…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">

      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <Text style={styles.heroOverline}>Teachers</Text>
        <Text style={styles.heroTitle} numberOfLines={1}>{form.fullName || 'Edit Teacher'}</Text>
        <Text style={styles.heroSub}>Teachers are branch-level resources</Text>
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Personal Info</Text>
        <InputRow icon="account-outline" label="Full Name" value={form.fullName} onChangeText={v => updateField('fullName', v)} />
        <InputRow icon="phone-outline" label="Mobile Number" keyboardType="phone-pad" value={form.phoneNumber} onChangeText={v => updateField('phoneNumber', v)} />
        <View style={styles.selectWrap}>
          <SelectField label="Gender" value={form.gender} options={genderOptions} onChange={v => updateField('gender', v)} />
        </View>
        <View style={styles.selectWrap}>
          <DatePickerField label="Joining Date" value={form.joiningDate} maximumDate={toISODate(new Date())} onChange={v => updateField('joiningDate', v)} />
        </View>
        <InputRow icon="briefcase-outline" label="Designation" value={form.designation} onChangeText={v => updateField('designation', v)} />
        <InputRow icon="phone-plus-outline" label="Alternate Mobile" keyboardType="phone-pad" value={form.alternateMobileNumber} onChangeText={v => updateField('alternateMobileNumber', v)} />
        <InputRow icon="email-outline" label="Email" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={v => updateField('email', v)} />
        <View style={styles.selectWrap}>
          <DatePickerField label="Date of Birth" value={form.dateOfBirth} maximumDate={toISODate(new Date())} onChange={v => updateField('dateOfBirth', v)} />
        </View>
        <InputRow icon="school-outline" label="Qualification" value={form.qualification} onChangeText={v => updateField('qualification', v)} />
        <InputRow icon="clock-outline" label="Experience" value={form.experience} onChangeText={v => updateField('experience', v)} />
        <InputRow icon="water-outline" label="Blood Group" value={form.bloodGroup} onChangeText={v => updateField('bloodGroup', v)} />
        <InputRow icon="phone-alert-outline" label="Emergency Contact" keyboardType="phone-pad" value={form.emergencyContact} onChangeText={v => updateField('emergencyContact', v)} />
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Address</Text>
        <InputRow icon="home-outline" label="Address" multiline value={form.address} onChangeText={v => updateField('address', v)} />
        <InputRow icon="city-variant-outline" label="City" value={form.city} onChangeText={v => updateField('city', v)} />
        <InputRow icon="map-outline" label="State" value={form.state} onChangeText={v => updateField('state', v)} />
        <InputRow icon="numeric" label="Pincode" keyboardType="number-pad" value={form.pincode} onChangeText={v => updateField('pincode', v)} />
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Status</Text>
        <View style={styles.switchRow}>
          <MaterialCommunityIcons name="check-circle-outline" size={15} color={colors.textMuted} />
          <View style={styles.switchCopy}>
            <Text style={styles.switchTitle}>Active Teacher</Text>
            <Text style={styles.switchMeta}>Inactive teachers cannot log in.</Text>
          </View>
          <Switch
            value={form.isActive}
            onValueChange={v => updateField('isActive', v)}
            trackColor={{false: colors.border, true: colors.secondarySoft}}
            thumbColor={form.isActive ? colors.secondary : colors.textMuted}
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
        <Text style={styles.submitBtnText}>{mutation.isPending ? 'Saving…' : 'Save Teacher'}</Text>
      </Pressable>

      <View style={{height: spacing.xxxl}} />
      <ConfirmationModal
        visible={confirmVisible}
        title="Save Changes?"
        message={`Update teacher profile for ${form?.fullName || 'this teacher'}?`}
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
  loadingWrap: {alignItems: 'center', backgroundColor: colors.background, flex: 1, gap: spacing.md, justifyContent: 'center'},
  loadingText: {color: colors.textMuted, fontSize: 13, fontWeight: '600'},
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
    ...shadows.fab},
  submitBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'}});

export default EditTeacherScreen;
