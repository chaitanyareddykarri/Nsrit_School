/**
 * GradientCard — premium clay card with a blue gradient header band.
 * Used for hero stats, featured metrics, and dashboard KPI cards.
 */
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring} from 'react-native-reanimated';
import {colors, radius, shadows} from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GradientCard = ({
  children,
  onPress,
  style,
  // accent band color across the top — defaults to primary
  accentColor = colors.primary,
  accentHeight = 4,
  noBand = false}) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}]}));

  const handlePressIn = () => {
    if (!onPress) {return;}
    scale.value = withSpring(0.972, {damping: 18, stiffness: 260});
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15, stiffness: 200});
  };

  const inner = (
    <>
      {!noBand && (
        <View
          style={[
            styles.band,
            {height: accentHeight, backgroundColor: accentColor},
          ]}
        />
      )}
      {children}
    </>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, style, animStyle]}>
        {inner}
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View style={[styles.card, style, animStyle]}>
      {inner}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    overflow: 'hidden'},
  band: {
    width: '100%'}});

export default GradientCard;
