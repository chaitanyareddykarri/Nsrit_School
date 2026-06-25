import React, {useMemo, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {Modal, Portal, Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {SelectField} from '../../components';
import {SECTION_NAMES} from '../../config/academic';
import academicYearService from '../../services/academicYear/academicYearService';
import {colors, radius, shadows, spacing} from '../../theme';

const sectionOptions = SECTION_NAMES.map(value => ({label: value, value}));

const CreateSectionModal = ({visible, classes, existingSections, onDismiss, onSubmit, loading}) => {
  const branchId = useSelector(s => s.auth.user?.branchId);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    academicClassId: classes[0]?.id || '',
    name: SECTION_NAMES[0],
    academicYear: academicYearService.getCurrentStartYear(branchId),
  });

  const classOptions = useMemo(
    () => classes.map(item => ({label: item.name, value: item.id, item})),
    [classes],
  );
  const selectedClass = classes.find(item => item.id === form.academicClassId);

  const submit = () => {
    const duplicate = existingSections.some(
      item =>
        item.academicClassId === form.academicClassId &&
        item.name === form.name &&
        Number(item.academicYear) === Number(form.academicYear),
    );
    if (duplicate) {
      setError('This section already exists for the selected class and academic year.');
      return;
    }
    setError('');
    onSubmit({
      ...form,
      className: selectedClass?.name,
      wing: selectedClass?.wing?.code,
      wingId: selectedClass?.wingId,
    });
  };

  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text style={styles.title}>Create Section</Text>
        <SelectField label="Class" value={form.academicClassId} options={classOptions} onChange={value => updateField('academicClassId', value)} />
        <SelectField label="Section" value={form.name} options={sectionOptions} onChange={value => updateField('name', value)} />
        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="calendar-outline" size={14} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Academic Year"
            placeholderTextColor={colors.textSoft}
            keyboardType="numeric"
            value={String(form.academicYear)}
            onChangeText={value => updateField('academicYear', value)}
          />
        </View>
        {error ? (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        <View style={styles.actions}>
          <Pressable onPress={onDismiss} style={({pressed}) => [styles.cancelBtn, pressed && {opacity: 0.88}]}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={submit}
            disabled={loading}
            style={({pressed}) => [styles.submitBtn, loading && {opacity: 0.6}, pressed && !loading && {opacity: 0.88}]}>
            {loading ? <ActivityIndicator size="small" color={colors.white} /> : null}
            <Text style={styles.submitBtnText}>{loading ? 'Creating…' : 'Create'}</Text>
          </Pressable>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    margin: spacing.lg,
    padding: spacing.lg,
    ...shadows.clayModal,
  },
  title: {color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.md},
  inputWrap: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {marginRight: spacing.sm},
  input: {color: colors.text, flex: 1, fontSize: 14, fontWeight: '500', minHeight: 44},
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},
  actions: {flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end', marginTop: spacing.sm},
  cancelBtn: {
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  cancelBtnText: {color: colors.textMuted, fontSize: 13, fontWeight: '700'},
  submitBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    ...shadows.fab,
  },
  submitBtnText: {color: colors.white, fontSize: 13, fontWeight: '700'},
});

export default CreateSectionModal;
