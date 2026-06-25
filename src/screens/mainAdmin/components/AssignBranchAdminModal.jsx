import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {Modal, Portal, Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import mainAdminService from '../../../services/mainAdmin/mainAdminService';
import {colors, radius, shadows, spacing, typography} from '../../../theme';

const initialForm = {fullName: '', countryCode: '+91', phoneNumber: ''};

const AssignBranchAdminModal = ({branchId, visible, onDismiss, onAssigned}) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) {
      setForm(initialForm);
      setError('');
    }
  }, [visible]);

  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await mainAdminService.createAndAssignBranchAdmin({branchId, ...form});
      Toast.show({type: 'success', text1: 'Branch admin created and assigned'});
      onAssigned?.();
      onDismiss?.();
    } catch (saveError) {
      setError(saveError.message || 'Unable to create branch admin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create Branch Admin</Text>
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons name="account-outline" size={14} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={colors.textSoft}
              autoCapitalize="words"
              value={form.fullName}
              onChangeText={value => updateField('fullName', value)}
            />
          </View>
          <View style={styles.phoneRow}>
            <View style={[styles.inputWrap, {flex: 0.32}]}>
              <TextInput
                style={styles.input}
                placeholder="+91"
                placeholderTextColor={colors.textSoft}
                keyboardType="phone-pad"
                value={form.countryCode}
                onChangeText={value => updateField('countryCode', value)}
              />
            </View>
            <View style={[styles.inputWrap, {flex: 0.68}]}>
              <MaterialCommunityIcons name="phone-outline" size={14} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                placeholderTextColor={colors.textSoft}
                keyboardType="phone-pad"
                value={form.phoneNumber}
                onChangeText={value => updateField('phoneNumber', value)}
              />
            </View>
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
              onPress={handleSave}
              disabled={!form.fullName || !form.phoneNumber || saving}
              style={({pressed}) => [
                styles.submitBtn,
                (!form.fullName || !form.phoneNumber || saving) && {opacity: 0.5},
                pressed && form.fullName && form.phoneNumber && !saving && {opacity: 0.88},
              ]}>
              {saving ? <ActivityIndicator size="small" color={colors.white} /> : null}
              <Text style={styles.submitBtnText}>{saving ? 'Creating…' : 'Create'}</Text>
            </Pressable>
          </View>
        </ScrollView>
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
  title: {...typography.subtitle, color: colors.text, marginBottom: spacing.md},
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
  phoneRow: {flexDirection: 'row', gap: spacing.sm},
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
  cancelBtn: {borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, paddingHorizontal: spacing.lg, paddingVertical: 10},
  cancelBtnText: {color: colors.textMuted, fontSize: 13, fontWeight: '700'},
  submitBtn: {alignItems: 'center', backgroundColor: colors.primaryDark, borderRadius: radius.card, flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: 10},
  submitBtnText: {color: colors.white, fontSize: 13, fontWeight: '700'},
});

export default AssignBranchAdminModal;
