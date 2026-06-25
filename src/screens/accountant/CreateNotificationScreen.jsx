import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Modal, Portal} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import notificationService from '../../services/notifications/notificationService';
import {colors, radius, shadows, spacing} from '../../theme';

const TARGETS = [
  {id: 'all', label: 'All Recipients', icon: 'account-group-outline'},
  {id: 'parents', label: 'Parents Only', icon: 'human-male-female-child'},
  {id: 'teachers', label: 'Teachers Only', icon: 'account-tie-outline'},
  {id: 'students', label: 'Students (via Parents)', icon: 'school-outline'},
];

const CreateNotificationScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('all');
  const [isPriority, setIsPriority] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const handleBroadcast = async () => {
    if (!title.trim()) {
      setValidationError('Please enter a notification title.');
      return;
    }
    if (!message.trim()) {
      setValidationError('Please type your notification message.');
      return;
    }
    if (!user?.branchId) {
      setValidationError('Branch context not found. Please re-login.');
      return;
    }
    setValidationError('');
    setLoading(true);
    try {
      const notifTitle = isPriority ? `🔴 ${title.trim()}` : title.trim();
      const result = await notificationService.broadcastNotification({
        branchId: user.branchId,
        title: notifTitle,
        message: message.trim(),
        target: selectedTarget,
        senderId: user.id,
        senderName: user.fullName,
        senderRole: user.role,
      });
      setSentCount(result.sent);
      setSuccessVisible(true);
    } catch (err) {
      console.log('[CreateNotification] Broadcast error:', err);
      setValidationError('Failed to send notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setSuccessVisible(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Compose Notification</Text>
          <Text style={styles.headerSubtitle}>Broadcast alerts to school stakeholders</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Broadcast Target</Text>
        <View style={styles.targetGrid}>
          {TARGETS.map(target => {
            const isSelected = selectedTarget === target.id;
            return (
              <Pressable
                key={target.id}
                style={({pressed}) => [
                  styles.targetCard,
                  isSelected && styles.targetCardSelected,
                  pressed && {opacity: 0.85},
                ]}
                onPress={() => setSelectedTarget(target.id)}>
                <MaterialCommunityIcons
                  name={target.icon}
                  size={20}
                  color={isSelected ? colors.secondary : colors.textMuted}
                />
                <Text style={[styles.targetLabel, isSelected && styles.targetLabelSelected]}>
                  {target.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Alert Details</Text>
        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="lead-pencil" size={14} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Notification Title"
            placeholderTextColor={colors.textSoft}
            value={title}
            onChangeText={setTitle}
          />
        </View>
        <View style={[styles.inputWrap, styles.textAreaWrap]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Type your message details here..."
            placeholderTextColor={colors.textSoft}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.priorityCard}>
          <View style={styles.priorityLeft}>
            <View style={[styles.priorityIconCircle, isPriority && styles.priorityIconCircleActive]}>
              <MaterialCommunityIcons
                name="alert-decagram-outline"
                size={20}
                color={isPriority ? colors.danger : colors.textMuted}
              />
            </View>
            <View style={styles.priorityCopy}>
              <Text style={styles.priorityTitle}>Mark as High Priority</Text>
              <Text style={styles.prioritySubtitle}>Prefixes title with 🔴 priority indicator</Text>
            </View>
          </View>
          <Switch
            value={isPriority}
            onValueChange={setIsPriority}
            trackColor={{false: colors.border, true: '#FECACA'}}
            thumbColor={isPriority ? colors.danger : colors.textSoft}
          />
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information-outline" size={18} color={colors.primary} style={{marginTop: 2}} />
          <Text style={styles.infoText}>
            Notifications appear in each recipient's Notification Center immediately. Delivery is immediate — all matched users in your branch receive it.
          </Text>
        </View>

        {validationError ? (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
            <Text style={styles.errorText}>{validationError}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.actionPanel}>
        <Pressable
          onPress={handleBroadcast}
          disabled={loading}
          style={({pressed}) => [styles.submitBtn, loading && {opacity: 0.7}, pressed && !loading && {opacity: 0.88}]}>
          {loading ? <ActivityIndicator size="small" color={colors.white} /> : null}
          <Text style={styles.submitBtnText}>{loading ? 'Sending…' : 'Broadcast Notification'}</Text>
        </Pressable>
      </View>

      <Portal>
        <Modal visible={successVisible} onDismiss={handleSuccessConfirm} contentContainerStyle={styles.successModal}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="check-circle" size={48} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Broadcast Sent</Text>
          <Text style={styles.successText}>
            Your notification was delivered to {sentCount} recipient{sentCount !== 1 ? 's' : ''} in your branch.
          </Text>
          <Pressable
            onPress={handleSuccessConfirm}
            style={({pressed}) => [styles.acknowledgeBtn, pressed && {opacity: 0.88}]}>
            <Text style={styles.acknowledgeBtnText}>Done</Text>
          </Pressable>
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  container: {backgroundColor: colors.background, flex: 1},
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    ...shadows.clayDeep,
  },
  backBtn: {alignItems: 'center', height: 36, justifyContent: 'center', width: 36},
  headerTitle: {color: colors.primary, fontSize: 16, fontWeight: '800'},
  headerSubtitle: {color: colors.textMuted, fontSize: 11, fontWeight: '500'},
  scroll: {flex: 1},
  scrollContent: {padding: spacing.lg, paddingBottom: spacing.xxl},
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  targetGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg},
  targetCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.md,
    width: '47%',
    ...shadows.clay,
  },
  targetCardSelected: {backgroundColor: colors.secondarySoft, borderColor: colors.secondary},
  targetLabel: {color: colors.text, fontSize: 12, fontWeight: '600'},
  targetLabelSelected: {color: colors.secondary, fontWeight: '700'},
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  textAreaWrap: {alignItems: 'flex-start', paddingTop: spacing.sm},
  inputIcon: {marginRight: spacing.sm},
  input: {color: colors.text, flex: 1, fontSize: 14, fontWeight: '500', minHeight: 44},
  textArea: {minHeight: 120},
  priorityCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    padding: spacing.md,
    ...shadows.clay,
  },
  priorityLeft: {alignItems: 'center', flex: 1, flexDirection: 'row'},
  priorityIconCircle: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 36,
  },
  priorityIconCircleActive: {backgroundColor: '#FEE2E2'},
  priorityCopy: {flex: 1},
  priorityTitle: {color: colors.text, fontSize: 14, fontWeight: '700'},
  prioritySubtitle: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  infoCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderColor: 'rgba(21,94,239,0.2)',
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  infoText: {color: colors.textMuted, flex: 1, fontSize: 12, fontWeight: '500', lineHeight: 18},
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  errorText: {color: colors.danger, flex: 1, fontSize: 13, fontWeight: '600'},
  actionPanel: {
    backgroundColor: colors.surface,
    borderTopColor: colors.borderLight,
    borderTopWidth: 1.5,
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
  },
  submitBtn: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 48,
    justifyContent: 'center',
    ...shadows.fab,
  },
  submitBtnText: {color: colors.white, fontSize: 15, fontWeight: '700'},
  successModal: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    margin: spacing.lg,
    padding: spacing.xl,
    ...shadows.clayModal,
  },
  successIcon: {marginBottom: spacing.md},
  successTitle: {color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: spacing.sm, textAlign: 'center'},
  successText: {color: colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: spacing.lg, textAlign: 'center'},
  acknowledgeBtn: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    width: '100%',
    ...shadows.fab,
  },
  acknowledgeBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'},
});

export default CreateNotificationScreen;
