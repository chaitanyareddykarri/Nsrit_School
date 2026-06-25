/**
 * ClayCard — the base floating clay card for the Blue Claymorphism system.
 * All other card variants are built on top of this.
 */
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring} from 'react-native-reanimated';
import {colors, radius, shadows} from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ClayCard = ({
  children,
  onPress,
  style,
  contentStyle,
  shadowVariant = 'clay',   // 'clay' | 'clayDeep' | 'clayInset'
  borderColor,
  noBorder = false}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}]}));

  const handlePressIn = () => {
    if (!onPress) {return;}
    scale.value = withSpring(0.974, {damping: 20, stiffness: 280});
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 16, stiffness: 200});
  };

  const shadowStyle = shadows[shadowVariant] || shadows.clay;

  const cardStyle = [
    styles.card,
    shadowStyle,
    borderColor && {borderColor, borderWidth: 1.5},
    noBorder && {borderWidth: 0},
    style,
  ];

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[cardStyle, animStyle]}>
        <View style={contentStyle}>{children}</View>
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View style={[cardStyle, animStyle]}>
      <View style={contentStyle}>{children}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    overflow: 'hidden'}});

export default ClayCard;
