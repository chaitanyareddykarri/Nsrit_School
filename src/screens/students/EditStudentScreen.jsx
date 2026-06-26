import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import DocumentPicker from 'react-native-document-picker';
import {ConfirmationModal, DatePickerField, SelectField} from '../../components';
import {USER_ROLES} from '../../config/constants';
import academicRepository from '../../repositories/academicRepository';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import firebaseStorageService from '../../services/storage/firebaseStorageService';
import {getAccessScope} from '../../services/rbacScope';
import {isBeforeDate, isFutureDate, toISODate} from '../../utils/helpers/dateHelpers';
import {isValidAadhaarFormat} from '../../utils/masking';
import {colors, radius, shadows, spacing} from '../../theme';
import academicYearService from '../../services/academicYear/academicYearService';

const genderOptions = ['Female', 'Male', 'Other'].map(value => ({label: value, value}));

const InputRow = ({icon, label, ...props}) => (
  <View style={styles.inputWrap}>
    <MaterialCommunityIcons name={icon} size={14} color={colors.textMuted} style={styles.inputIcon} />
    <TextInput style={styles.input} placeholder={label} placeholderTextColor={colors.textSoft} {...props} />
  </View>
);

const EditStudentScreen = ({navigation, route}) => {
  const studentId = route.params?.studentId;
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const academicYear = academicYearService.getCurrentStartYear(user?.branchId);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const effectiveBranchId = form?.branchId || user?.branchId;
  const effectiveScope = useMemo(
    () => ({...scope, branchId: effectiveBranchId || scope.branchId}),
    [effectiveBranchId, scope],
  );

  const detailsQuery = useQuery({
    queryKey: ['studentDetails', studentId],
    queryFn: () => studentService.getStudentDetails(studentId, scope),
    enabled: Boolean(studentId)});
  const classesQuery = useQuery({
    queryKey: ['academicClasses', effectiveBranchId],
    queryFn: () => academicRepository.getAcademicClasses()});
  const sectionsQuery = useQuery({
    queryKey: ['sections', effectiveBranchId, academicYear],
    queryFn: () => sectionService.getSections({branchId: effectiveBranchId, academicYear}, effectiveScope),
    enabled: Boolean(effectiveBranchId)});

  useEffect(() => {
    const student = detailsQuery.data?.student;
    if (!student) return;
    setForm({
      id: student.id, studentId: student.id, parentId: student.parentId,
      branchId: student.branchId, branchCode: student.branchCode || student.branch?.branchCode,
      admissionYear: student.admissionYear, academicClassId: student.academicClassId,
      wingId: student.academicClass?.wing?.id, wingCode: student.academicClass?.wing?.code,
      sectionId: student.sectionId, className: student.academicClass?.name,
      fullName: student.fullName || '', gender: student.gender || '',
      dateOfBirth: student.dateOfBirth || '', admissionDate: student.admissionDate || '',
      fatherName: student.parent?.fatherName || student.parent?.fullName || '',
      motherName: student.parent?.motherName || '',
      parentPhoneNumber: student.parent?.phoneNumber || student.phoneNumber || '',
      photoUrl: student.photoUrl || '',
      // H-1 fix: do not pre-populate the Aadhaar field with the stored value.
      // Leaves the field blank so staff must deliberately re-enter it to change it.
      // The submit handler preserves the existing DB value when the field is left empty.
      aadhaarNumber: '',
      apaarId: student.apaarId || '',
      bloodGroup: student.bloodGroup || '', address: student.address || '',
      city: student.city || '', state: student.state || '', pincode: student.pincode || '',
      emergencyContact: student.emergencyContact || '',
      transportRequired: Boolean(student.transportRequired), countryCode: student.countryCode || '+91',
      transferCertificateUrl: student.transferCertificateUrl || '',
      birthCertificateUrl: student.birthCertificateUrl || ''});
  }, [detailsQuery.data?.student]);

  const classes = useMemo(() => {
    const items = (classesQuery.data || []).filter(item => item.branchId === effectiveBranchId);
    return user?.role === USER_ROLES.COORDINATOR
      ? items.filter(item => item.wing?.code === user.wing || item.wing === user.wing)
      : items;
  }, [classesQuery.data, effectiveBranchId, user?.role, user?.wing]);

  const sections = useMemo(
    () => (sectionsQuery.data?.sections || []).filter(section => section.academicClassId === form?.academicClassId),
    [sectionsQuery.data?.sections, form?.academicClassId],
  );

  const mutation = useMutation({
    mutationFn: payload => studentService.updateStudent({...payload, branchId: payload.branchId || effectiveBranchId}, effectiveScope),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['studentDetails', studentId]});
      queryClient.invalidateQueries({queryKey: ['students', effectiveBranchId]});
      navigation.goBack();
    },
    onError: err => setError(err.message)});

  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  const pickAndUploadDocument = async (docType) => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
        copyTo: 'cachesDirectory',
      });
      setUploadingDoc(docType);
      const uploadFn = docType === 'tc'
        ? firebaseStorageService.uploadTransferCertificate
        : firebaseStorageService.uploadBirthCertificate;
      const url = await uploadFn({
        studentId: form.id,
        fileUri: result.fileCopyUri || result.uri,
        fileName: result.name || 'document',
      });
      const field = docType === 'tc' ? 'transferCertificateUrl' : 'birthCertificateUrl';
      updateField(field, url);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Upload Failed', err.message || 'Could not upload document.');
      }
    } finally {
      setUploadingDoc(null);
    }
  };

  const save = () => {
    if (isFutureDate(form.dateOfBirth)) { setError('Date of birth cannot be a future date.'); return; }
    if (isFutureDate(form.admissionDate)) { setError('Admission date cannot be a future date.'); return; }
    if (form.dateOfBirth && form.admissionDate && isBeforeDate(form.admissionDate, form.dateOfBirth)) {
      setError('Admission date cannot be before date of birth.'); return;
    }
    setError('');
    setConfirmVisible(true);
  };

  if (!form) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading student…</Text>
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
        <Text style={styles.heroOverline}>Students</Text>
        <Text style={styles.heroTitle} numberOfLines={1}>{form.fullName || 'Edit Student'}</Text>
        <Text style={styles.heroSub}>Admission number cannot be changed</Text>
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Class & Section</Text>
        <View style={styles.selectWrap}>
          <SelectField
            label="Class"
            value={form.academicClassId}
            options={classes.map(item => ({label: item.name, value: item.id, item}))}
            onChange={(value, option) =>
              setForm(current => ({
                ...current, academicClassId: value, className: option.item.name,
                wingId: option.item.wingId || option.item.wing?.id, wingCode: option.item.wing?.code, sectionId: ''}))
            }
          />
        </View>
        <View style={styles.selectWrap}>
          <SelectField
            label="Section"
            value={form.sectionId}
            options={sections.map(item => ({label: item.name, value: item.id}))}
            onChange={v => updateField('sectionId', v)}
          />
        </View>
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Student Info</Text>
        <InputRow icon="account-outline" label="Full Name" value={form.fullName} onChangeText={v => updateField('fullName', v)} />
        <View style={styles.selectWrap}>
          <SelectField label="Gender" value={form.gender} options={genderOptions} onChange={v => updateField('gender', v)} />
        </View>
        <View style={styles.selectWrap}>
          <DatePickerField label="Date of Birth" value={form.dateOfBirth} maximumDate={toISODate(new Date())} onChange={v => updateField('dateOfBirth', v)} />
        </View>
        <View style={styles.selectWrap}>
          <DatePickerField label="Admission Date" value={form.admissionDate} minimumDate={form.dateOfBirth} maximumDate={toISODate(new Date())} onChange={v => updateField('admissionDate', v)} />
        </View>
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Parent Info</Text>
        <InputRow icon="account-tie-outline" label="Father Name" value={form.fatherName} onChangeText={v => updateField('fatherName', v)} />
        <InputRow icon="account-heart-outline" label="Mother Name" value={form.motherName} onChangeText={v => updateField('motherName', v)} />
        <InputRow icon="phone-outline" label="Parent Mobile Number" keyboardType="phone-pad" value={form.parentPhoneNumber} onChangeText={v => updateField('parentPhoneNumber', v)} />
      </Animated.View>

      <Animated.View style={styles.formCard}>
        <Text style={styles.formSection}>Optional</Text>
        <InputRow icon="image-outline" label="Student Photo URL" value={form.photoUrl} onChangeText={v => updateField('photoUrl', v)} />
        <InputRow icon="card-account-details-outline" label="Aadhaar Number" keyboardType="number-pad" placeholder="Leave blank to keep existing" value={form.aadhaarNumber} onChangeText={v => updateField('aadhaarNumber', v)} />
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
        <Text style={styles.formSection}>Documents</Text>
        {[
          {key: 'tc', label: 'Transfer Certificate', field: 'transferCertificateUrl'},
          {key: 'bc', label: 'Birth Certificate', field: 'birthCertificateUrl'},
        ].map(doc => (
          <View key={doc.key} style={styles.docRow}>
            <View style={styles.docInfo}>
              <MaterialCommunityIcons name="file-document-outline" size={14} color={colors.textMuted} />
              <View style={styles.docText}>
                <Text style={styles.docLabel}>{doc.label}</Text>
                <Text style={styles.docStatus} numberOfLines={1}>
                  {form[doc.field] ? 'Uploaded' : 'Not uploaded'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => pickAndUploadDocument(doc.key)}
              disabled={uploadingDoc !== null}
              style={({pressed}) => [styles.uploadBtn, pressed && {opacity: 0.7}]}>
              {uploadingDoc === doc.key ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name={form[doc.field] ? 'refresh' : 'upload'}
                    size={13}
                    color={colors.primary}
                  />
                  <Text style={styles.uploadBtnText}>
                    {form[doc.field] ? 'Re-upload' : 'Upload'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        ))}
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
        onPress={save}
        disabled={mutation.isPending}
        style={({pressed}) => [styles.submitBtn, mutation.isPending && {opacity: 0.5}, pressed && !mutation.isPending && {opacity: 0.88}]}>
        <MaterialCommunityIcons name="content-save-outline" size={18} color={colors.white} />
        <Text style={styles.submitBtnText}>{mutation.isPending ? 'Saving…' : 'Save Student'}</Text>
      </Pressable>

      <View style={{height: spacing.xxxl}} />
      <ConfirmationModal
        visible={confirmVisible}
        title="Save Changes?"
        message={`Update ${form?.fullName || 'this student'}'s profile?`}
        confirmLabel="Yes, Save"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmVisible(false);
          // H-1 fix: if aadhaarNumber was left blank, preserve the existing DB value
          // rather than overwriting it with an empty string.
          const student = detailsQuery.data?.student;
          const aadhaarNumber =
            form.aadhaarNumber && isValidAadhaarFormat(form.aadhaarNumber)
              ? form.aadhaarNumber
              : student?.aadhaarNumber || '';
          mutation.mutate({...form, aadhaarNumber});
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
  submitBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'},
  docRow: {
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm},
  docInfo: {alignItems: 'center', flexDirection: 'row', flex: 1, gap: spacing.sm},
  docText: {flex: 1},
  docLabel: {color: colors.text, fontSize: 13, fontWeight: '600'},
  docStatus: {color: colors.textMuted, fontSize: 11, marginTop: 1},
  uploadBtn: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6},
  uploadBtnText: {color: colors.primary, fontSize: 12, fontWeight: '700'}});

export default EditStudentScreen;
