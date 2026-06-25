import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CustomButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',   // 'primary' | 'outline' | 'ghost' | 'danger'
  icon,
  style,
  size = 'md',           // 'sm' | 'md' | 'lg'
}) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}]}));

  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    if (isDisabled) {return;}
    scale.value = withSpring(0.96, {damping: 18, stiffness: 280});
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15, stiffness: 200});
  };

  const variantStyle = {
    primary: styles.variantPrimary,
    outline: styles.variantOutline,
    ghost:   styles.variantGhost,
    danger:  styles.variantDanger}[variant] || styles.variantPrimary;

  const labelStyle = {
    primary: styles.labelPrimary,
    outline: styles.labelOutline,
    ghost:   styles.labelGhost,
    danger:  styles.labelDanger}[variant] || styles.labelPrimary;

  const sizeStyle = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg}[size] || styles.sizeMd;

  return (
    <AnimatedPressable
      onPress={isDisabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.base,
        variantStyle,
        sizeStyle,
        isDisabled && styles.disabled,
        style,
        animStyle,
      ]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary}
        />
      ) : (
        <View style={styles.inner}>
          {icon ? (
            <MaterialCommunityIcons
              name={icon}
              size={16}
              color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary}
              style={styles.icon}
            />
          ) : null}
          <Text style={[styles.label, labelStyle]}>{label}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.pill,
    justifyContent: 'center'},
  inner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs},
  variantPrimary: {
    ...shadows.fab,
    backgroundColor: colors.primary},
  variantOutline: {
    ...shadows.clayInset,
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 2},
  variantGhost: {
    backgroundColor: colors.primarySoft},
  variantDanger: {
    ...shadows.fab,
    backgroundColor: colors.danger,
    shadowColor: colors.danger},
  sizeSm: {paddingHorizontal: spacing.lg,  paddingVertical: spacing.xs},
  sizeMd: {paddingHorizontal: spacing.xl,  paddingVertical: spacing.md},
  sizeLg: {paddingHorizontal: spacing.xxl, paddingVertical: spacing.lg},
  label:        {...typography.bodyBold},
  labelPrimary: {color: colors.white},
  labelOutline: {color: colors.primary},
  labelGhost:   {color: colors.primary},
  labelDanger:  {color: colors.white},
  disabled:     {opacity: 0.5},
  icon:         {marginRight: 2}});

export default CustomButton;
