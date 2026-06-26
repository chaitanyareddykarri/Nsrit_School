import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import {ConfirmationModal, DatePickerField, SelectField} from '../../components';
import {USER_ROLES} from '../../config/constants';
import academicRepository from '../../repositories/academicRepository';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import {isBeforeDate, isFutureDate, toISODate} from '../../utils/helpers/dateHelpers';
import {colors, radius, shadows, spacing} from '../../theme';
import academicYearService from '../../services/academicYear/academicYearService';

const genderOptions = ['Female', 'Male', 'Other'].map(value => ({label: value, value}));

const blankForm = {
  academicClassId: '', sectionId: '', className: '', wingId: '', wingCode: '',
  fullName: '', gender: '', dateOfBirth: '', admissionDate: toISODate(new Date()),
  fatherName: '', fatherMobile: '',
  motherName: '', motherMobile: '',
  guardianName: '', guardianMobile: '',
  photoUrl: '', aadhaarNumber: '', apaarId: '', bloodGroup: '',
  address: '', city: '', state: '', pincode: '', emergencyContact: '',
  transportRequired: false, countryCode: '+91'};

const InputRow = ({icon, label, ...props}) => (
  <View style={styles.inputWrap}>
    <MaterialCommunityIcons name={icon} size={14} color={colors.textMuted} style={styles.inputIcon} />
    <TextInput style={styles.input} placeholder={label} placeholderTextColor={colors.textSoft} {...props} />
  </View>
);

const AddStudentScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const academicYear = academicYearService.getCurrentStartYear(user?.branchId);
  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  const classesQuery = useQuery({
    queryKey: ['activeAcademicClasses', user?.branchId],
    queryFn: () => academicRepository.getActiveAcademicClasses(),
    enabled: Boolean(user?.branchId)});
  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () => sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId)});

  const classes = useMemo(() => {
    const items = (classesQuery.data || []).filter(item => item.branchId === user?.branchId);
    return user?.role === USER_ROLES.COORDINATOR
      ? items.filter(item => item.wing?.code === user.wing || item.wing === user.wing)
      : items;
  }, [classesQuery.data, user?.branchId, user?.role, user?.wing]);

  const sections = useMemo(
    () => (sectionsQuery.data?.sections || []).filter(section => section.academicClassId === form.academicClassId),
    [sectionsQuery.data?.sections, form.academicClassId],
  );

  const classOptions = classes.map(item => ({label: item.name, value: item.id, item}));
  const sectionOptions = sections.map(item => ({label: item.name, value: item.id, item}));

  const mutation = useMutation({
    mutationFn: payload => studentService.createStudent(payload, scope),
    onSuccess: student => {
      Toast.show({type: 'success', text1: 'Student created successfully.'});
      queryClient.invalidateQueries({queryKey: ['students', user?.branchId]});
      queryClient.invalidateQueries({queryKey: ['wingStudents', user?.branchId, user?.wing]});
      navigation.replace('StudentDetails', {studentId: student.id});
    },
    onError: err => {
      console.log('[StudentCreate] UI create failed:', err);
      setError(err.message || 'Student creation failed.');
    }});

  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  const validateDates = () => {
    if (isFutureDate(form.dateOfBirth)) return 'Date of birth cannot be a future date.';
    if (isFutureDate(form.admissionDate)) return 'Admission date cannot be a future date.';
    if (form.dateOfBirth && form.admissionDate && isBeforeDate(form.admissionDate, form.dateOfBirth)) {
      return 'Admission date cannot be before date of birth.';
    }
    return '';
  };

  const submit = () => {
    setError('');
    const dateError = validateDates();
    if (dateError) { setError(dateError); return; }
    console.log('[StudentCreate] Submit pressed:', {
      selectedClass: {id: form.academicClassId, name: form.className, wingId: form.wingId, wingCode: form.wingCode},
      selectedSection: form.sectionId, branchId: user?.branchId});
    if (!user?.branchId) { setError('Your account is not assigned to a branch.'); return; }
    setConfirmVisible(true);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">

      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <Text style={styles.heroOverline}>Students</Text>
        <Text style={styles.heroTitle}>Add Student</Text>
        <Text style={styles.heroSub}>Branch and admission number are assigned automatically</Text>
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Class & Section</Text>
        <View style={styles.selectWrap}>
          <SelectField
            label="Class *"
            value={form.academicClassId}
            options={classOptions}
            disabled={classesQuery.isLoading || !user?.branchId}
            onChange={(value, option) =>
              setForm(current => ({
                ...current, academicClassId: value, className: option.item.name,
                wingId: option.item.wingId, wingCode: option.item.wing?.code, sectionId: ''}))
            }
          />
        </View>
        {!classesQuery.isLoading && !classesQuery.error && user?.branchId && !classOptions.length ? (
          <Text style={styles.hintText}>No active classes available for your branch.</Text>
        ) : null}
        <View style={styles.selectWrap}>
          <SelectField
            label="Section *"
            value={form.sectionId}
            options={sectionOptions}
            disabled={!form.academicClassId || sectionsQuery.isLoading}
            onChange={value => updateField('sectionId', value)}
          />
        </View>
        {form.academicClassId && !sectionsQuery.isLoading && !sectionsQuery.error && !sectionOptions.length ? (
          <Text style={styles.hintText}>No active sections for this class. Ask the Principal to create a section first.</Text>
        ) : null}
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Student Info</Text>
        <InputRow icon="account-outline" label="Full Name *" value={form.fullName} onChangeText={v => updateField('fullName', v)} />
        <View style={styles.selectWrap}>
          <SelectField label="Gender *" value={form.gender} options={genderOptions} onChange={v => updateField('gender', v)} />
        </View>
        <View style={styles.selectWrap}>
          <DatePickerField label="Date of Birth" value={form.dateOfBirth} maximumDate={toISODate(new Date())} required onChange={v => updateField('dateOfBirth', v)} />
        </View>
        <View style={styles.selectWrap}>
          <DatePickerField label="Admission Date" value={form.admissionDate} minimumDate={form.dateOfBirth} maximumDate={toISODate(new Date())} required onChange={v => updateField('admissionDate', v)} />
        </View>
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Parent Info</Text>
        <InputRow icon="account-tie-outline" label="Father Name" value={form.fatherName} onChangeText={v => updateField('fatherName', v)} />
        <InputRow icon="phone-outline" label="Father Mobile" keyboardType="phone-pad" value={form.fatherMobile} onChangeText={v => updateField('fatherMobile', v)} />
        <InputRow icon="account-heart-outline" label="Mother Name" value={form.motherName} onChangeText={v => updateField('motherName', v)} />
        <InputRow icon="phone-outline" label="Mother Mobile" keyboardType="phone-pad" value={form.motherMobile} onChangeText={v => updateField('motherMobile', v)} />
        <InputRow icon="account-outline" label="Guardian Name" value={form.guardianName} onChangeText={v => updateField('guardianName', v)} />
        <InputRow icon="phone-outline" label="Guardian Mobile" keyboardType="phone-pad" value={form.guardianMobile} onChangeText={v => updateField('guardianMobile', v)} />
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Optional</Text>
        <InputRow icon="image-outline" label="Student Photo URL" value={form.photoUrl} onChangeText={v => updateField('photoUrl', v)} />
        <InputRow icon="card-account-details-outline" label="Aadhaar Number" keyboardType="number-pad" value={form.aadhaarNumber} onChangeText={v => updateField('aadhaarNumber', v)} />
        <InputRow icon="card-account-details-star-outline" label="Apaar ID" keyboardType="number-pad" value={form.apaarId} onChangeText={v => updateField('apaarId', v)} />
        <InputRow icon="water-outline" label="Blood Group" value={form.bloodGroup} onChangeText={v => updateField('bloodGroup', v)} />
        <InputRow icon="phone-alert-outline" label="Emergency Contact" keyboardType="phone-pad" value={form.emergencyContact} onChangeText={v => updateField('emergencyContact', v)} />
        <View style={styles.selectWrap}>
          <SelectField
            label="Transport Required"
            value={form.transportRequired ? 'YES' : 'NO'}
            options={[{label: 'No', value: 'NO'}, {label: 'Yes', value: 'YES'}]}
            onChange={v => updateField('transportRequired', v === 'YES')}
          />
        </View>
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
        onPress={submit}
        disabled={mutation.isPending}
        style={({pressed}) => [styles.submitBtn, mutation.isPending && {opacity: 0.5}, pressed && !mutation.isPending && {opacity: 0.88}]}>
        <MaterialCommunityIcons name="account-plus-outline" size={18} color={colors.white} />
        <Text style={styles.submitBtnText}>{mutation.isPending ? 'Adding…' : 'Add Student'}</Text>
      </Pressable>

      <View style={{height: spacing.xxxl}} />
      <ConfirmationModal
        visible={confirmVisible}
        title="Add Student?"
        message={`Add ${form.fullName || 'this student'} to the system?`}
        confirmLabel="Yes, Add"
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
  inputWrap: {
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md},
  inputIcon: {marginRight: spacing.sm},
  input: {color: colors.text, flex: 1, fontSize: 14, fontWeight: '500', minHeight: 46},
  selectWrap: {borderTopColor: colors.borderLight, borderTopWidth: 1, padding: spacing.sm},
  hintText: {color: colors.warning, fontSize: 11, fontWeight: '600', paddingHorizontal: spacing.md, paddingBottom: spacing.sm},
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

export default AddStudentScreen;
