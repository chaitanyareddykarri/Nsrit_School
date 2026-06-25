import React, {useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import {Modal, Portal, Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {SelectField} from '../../components';
import {colors, radius, shadows, spacing} from '../../theme';

const BulkSectionAssignmentModal = ({visible, sections, selectedStudentIds, onDismiss, onSubmit, loading}) => {
  const [sectionId, setSectionId] = useState('');
  const [error, setError] = useState('');
  const options = sections.map(section => ({
    label: `${section.academicClass?.name || ''}-${section.name}`,
    value: section.id,
    item: section,
  }));

  const submit = () => {
    const section = sections.find(item => item.id === sectionId);
    if (!section || !selectedStudentIds.length) {
      setError('Select students and a target section.');
      return;
    }
    setError('');
    onSubmit({
      studentIds: selectedStudentIds,
      sectionId,
      academicClassId: section.academicClassId,
      className: section.academicClass?.name,
      targetWing: section.academicClass?.wing?.code,
    });
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text style={styles.title}>Bulk Section Assignment</Text>
        <SelectField label="Target Section" value={sectionId} options={options} onChange={setSectionId} />
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
            <Text style={styles.submitBtnText}>{loading ? 'Assigning…' : 'Assign'}</Text>
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
  cancelBtn: {borderColor: colors.borderLight, borderRadius: radius.card, borderWidth: 1.5, paddingHorizontal: spacing.lg, paddingVertical: 10},
  cancelBtnText: {color: colors.textMuted, fontSize: 13, fontWeight: '700'},
  submitBtn: {alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.card, flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: 10, ...shadows.fab},
  submitBtnText: {color: colors.white, fontSize: 13, fontWeight: '700'},
});

export default BulkSectionAssignmentModal;
