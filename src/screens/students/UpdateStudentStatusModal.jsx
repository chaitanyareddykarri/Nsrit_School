import React, {useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import {Modal, Portal, Text} from 'react-native-paper';
import {SelectField} from '../../components';
import {STUDENT_STATUS} from '../../config/academic';
import {colors, radius, shadows, spacing} from '../../theme';

const options = Object.values(STUDENT_STATUS).map(value => ({label: value, value}));

const UpdateStudentStatusModal = ({visible, student, onDismiss, onSubmit, loading}) => {
  const [status, setStatus] = useState(student?.status || STUDENT_STATUS.ACTIVE);

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text style={styles.title}>Update Student Status</Text>
        <SelectField label="Status" value={status} options={options} onChange={setStatus} />
        <View style={styles.actions}>
          <Pressable onPress={onDismiss} style={({pressed}) => [styles.cancelBtn, pressed && {opacity: 0.88}]}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={() => onSubmit(status)}
            disabled={loading}
            style={({pressed}) => [styles.submitBtn, loading && {opacity: 0.6}, pressed && !loading && {opacity: 0.88}]}>
            {loading ? <ActivityIndicator size="small" color={colors.white} /> : null}
            <Text style={styles.submitBtnText}>{loading ? 'Saving…' : 'Save'}</Text>
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
  actions: {flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end', marginTop: spacing.sm},
  cancelBtn: {borderColor: colors.borderLight, borderRadius: radius.card, borderWidth: 1.5, paddingHorizontal: spacing.lg, paddingVertical: 10},
  cancelBtnText: {color: colors.textMuted, fontSize: 13, fontWeight: '700'},
  submitBtn: {alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.card, flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: 10, ...shadows.fab},
  submitBtnText: {color: colors.white, fontSize: 13, fontWeight: '700'},
});

export default UpdateStudentStatusModal;
