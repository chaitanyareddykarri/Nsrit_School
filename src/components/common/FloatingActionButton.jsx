import React from 'react';
import {StyleSheet, Text as RNText} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring} from 'react-native-reanimated';
import {Pressable} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const FloatingActionButton = ({
  onPress,
  icon = 'plus',
  label,
  color = colors.primary,
  style}) => {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}]}));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, {damping: 15, stiffness: 300});
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 12, stiffness: 200});
  };

  // Ensure the FAB clears the home indicator / gesture area on all devices.
  const bottomOffset = Math.max(spacing.xl, insets.bottom + spacing.md);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.fab,
        {backgroundColor: color, bottom: bottomOffset},
        label ? styles.extended : styles.round,
        style,
        animStyle,
      ]}>
      <MaterialCommunityIcons name={icon} size={22} color={colors.white} />
      {label ? <RNText style={styles.label}>{label}</RNText> : null}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    ...shadows.fab,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.xl},
  round: {
    borderRadius: radius.pill,
    height: 56,
    width: 56},
  extended: {
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md},
  label: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 14}});

export default FloatingActionButton;
