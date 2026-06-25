import React, { useEffect } from 'react';
import { Modal, StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeOut } from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, radius, shadows, spacing, typography } from '../../theme';

const GlassBackdrop = ({ children, visible, onClose }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        exiting={FadeOut.duration(150)} 
        style={styles.backdrop}
      >
        <Pressable style={styles.dismissPressable} onPress={onClose} />
        {children}
      </Animated.View>
    </Modal>
  );
};

export const SuccessModal = ({ visible, title, message, buttonLabel = 'Continue', onConfirm, onClose }) => {
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      scale.value = 0.9;
    }
  }, [scale, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]}));

  return (
    <GlassBackdrop visible={visible} onClose={onClose}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={[styles.iconContainer, styles.successIcon]}>
          <MaterialCommunityIcons name="check-circle" size={36} color={colors.success} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Pressable style={styles.confirmButton} onPress={onConfirm}>
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </Pressable>
      </Animated.View>
    </GlassBackdrop>
  );
};

export const ErrorModal = ({ visible, title, message, buttonLabel = 'Retry', onConfirm, onClose }) => {
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      scale.value = 0.9;
    }
  }, [scale, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]}));

  return (
    <GlassBackdrop visible={visible} onClose={onClose}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={[styles.iconContainer, styles.errorIcon]}>
          <MaterialCommunityIcons name="alert-circle" size={36} color={colors.danger} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Pressable style={[styles.confirmButton, styles.errorBtn]} onPress={onConfirm}>
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </Pressable>
      </Animated.View>
    </GlassBackdrop>
  );
};

export const WarningModal = ({ visible, title, message, buttonLabel = 'OK', onConfirm, onClose }) => {
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      scale.value = 0.9;
    }
  }, [scale, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]}));

  return (
    <GlassBackdrop visible={visible} onClose={onClose}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={[styles.iconContainer, styles.warningIcon]}>
          <MaterialCommunityIcons name="alert" size={36} color={colors.warning} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Pressable style={[styles.confirmButton, styles.warningBtn]} onPress={onConfirm}>
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </Pressable>
      </Animated.View>
    </GlassBackdrop>
  );
};

export const ConfirmationModal = ({ 
  visible, 
  title, 
  message, 
  confirmLabel = 'Confirm', 
  cancelLabel = 'Cancel', 
  onConfirm, 
  onCancel, 
  isDestructive = false 
}) => {
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      scale.value = 0.9;
    }
  }, [scale, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]}));

  return (
    <GlassBackdrop visible={visible} onClose={onCancel}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={[styles.iconContainer, isDestructive ? styles.errorIcon : styles.infoIcon]}>
          <MaterialCommunityIcons 
            name={isDestructive ? 'alert-octagon' : 'help-circle'} 
            size={36} 
            color={isDestructive ? colors.danger : colors.primary} 
          />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        
        <View style={styles.rowButtons}>
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
          </Pressable>
          <Pressable 
            style={[styles.rowConfirmButton, isDestructive ? styles.errorBtn : styles.primaryBtn]} 
            onPress={onConfirm}
          >
            <Text style={styles.buttonText}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </GlassBackdrop>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)', // Deep slate translucent backdrop
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl},
  dismissPressable: {
    ...StyleSheet.absoluteFillObject},
  card: {
    ...shadows.clayModal,
    backgroundColor: colors.surface,
    borderRadius: radius.hero,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border},
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg},
  successIcon: {
    backgroundColor: `${colors.success}13`},
  errorIcon: {
    backgroundColor: `${colors.danger}13`},
  warningIcon: {
    backgroundColor: `${colors.warning}13`},
  infoIcon: {
    backgroundColor: `${colors.primary}13`},
  title: {
    ...typography.headline,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs},
  message: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSoft,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 18},
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    alignSelf: 'stretch',
    alignItems: 'center',
    ...shadows.sm},
  errorBtn: {
    backgroundColor: colors.danger},
  warningBtn: {
    backgroundColor: colors.warning},
  primaryBtn: {
    backgroundColor: colors.primary},
  buttonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14},
  rowButtons: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: spacing.md},
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 12,
    alignItems: 'center'},
  cancelButtonText: {
    color: colors.textSoft,
    fontWeight: '600',
    fontSize: 14},
  rowConfirmButton: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    ...shadows.sm}});
