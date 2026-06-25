import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '../../theme';

export const LoadingOverlay = ({ visible, message = 'Loading...' }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
    >
      <Animated.View 
        exiting={FadeOut.duration(150)} 
        style={styles.backdrop}
      >
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // Sleek dark overlay
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl},
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8},
  message: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center'}});

export default LoadingOverlay;
