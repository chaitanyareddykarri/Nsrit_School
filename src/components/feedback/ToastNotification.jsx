import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export const ToastNotification = ({ 
  visible, 
  message, 
  type = 'success', // 'success' | 'error' | 'info'
  duration = 2500, 
  onHide 
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(insets.top + 12, { damping: 15, stiffness: 120 });
      
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 250 });
        if (onHide) {
          onHide();
        }
      }, duration);

      return () => clearTimeout(timer);
    } else {
      translateY.value = -100;
    }
  }, [duration, insets.top, onHide, translateY, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]}));

  const getIcon = () => {
    switch (type) {
      case 'error': return 'alert-circle';
      case 'info': return 'information';
      default: return 'check-circle';
    }
  };

  const getThemeStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: `${colors.danger}11`,
          border: colors.danger,
          icon: colors.danger};
      case 'info':
        return {
          bg: `${colors.primary}11`,
          border: colors.primary,
          icon: colors.primary};
      default:
        return {
          bg: `${colors.success}11`,
          border: colors.success,
          icon: colors.success};
    }
  };

  if (!visible) return null;

  const theme = getThemeStyles();

  return (
    <Animated.View style={[styles.container, animatedStyle, { backgroundColor: colors.surface, borderColor: theme.border }]}>
      <View style={[styles.iconWrapper, { backgroundColor: theme.bg }]}>
        <MaterialCommunityIcons name={getIcon()} size={20} color={theme.icon} />
      </View>
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    ...shadows.md,
    zIndex: 9999,
    gap: spacing.sm},
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'},
  message: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    flex: 1}});

export default ToastNotification;
