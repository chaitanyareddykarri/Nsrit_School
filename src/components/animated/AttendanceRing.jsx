/**
 * AttendanceRing — circular progress ring built without SVG.
 * Uses the two-half-disc technique with clip containers.
 * Animates via Reanimated when the percentage changes.
 *
 * Geometry proof (transform origin = element center = outer ring center):
 *   rightRotation: -90° (0%) → +90° (50%)
 *   leftRotation : +90° (50%) → -90° (100%)
 */
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming} from 'react-native-reanimated';
import {colors as themeColors} from '../../theme';

const AttendanceRing = ({
  percentage = 0,
  size = 120,
  strokeWidth = 11,
  color = themeColors.primary,
  trackColor = themeColors.border,
  bgColor = themeColors.surface,
  style,
  children}) => {
  const pct = Math.min(Math.max(percentage, 0), 100);
  const halfSize = size / 2;
  const innerSize = size - strokeWidth * 2;

  const animPct = useSharedValue(0);

  useEffect(() => {
    animPct.value = withTiming(pct, {duration: 1000});
  }, [pct, animPct]);

  // Right half: sweeps 0 → 50%
  const rightStyle = useAnimatedStyle(() => {
    const rot = (Math.min(animPct.value, 50) / 50) * 180 - 90;
    return {transform: [{rotate: `${rot}deg`}]};
  });

  // Left half: sweeps 50 → 100%
  const leftStyle = useAnimatedStyle(() => {
    const rot =
      animPct.value > 50 ? 90 - ((animPct.value - 50) / 50) * 180 : 90;
    return {transform: [{rotate: `${rot}deg`}]};
  });

  return (
    <View style={[{width: size, height: size}, style]}>
      {/* Track ring */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: halfSize,
            borderWidth: strokeWidth,
            borderColor: trackColor},
        ]}
      />

      {/* Right-side progress clip */}
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: halfSize,
          height: size,
          overflow: 'hidden'}}>
        {/* Full-size wrapper centered on outer ring; left: -halfSize shifts center to ring center */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: -halfSize,
              top: 0,
              width: size,
              height: size},
            rightStyle,
          ]}>
          {/* Colored top-semicircle */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              width: size,
              height: halfSize,
              backgroundColor: color,
              borderTopLeftRadius: halfSize,
              borderTopRightRadius: halfSize}}
          />
        </Animated.View>
      </View>

      {/* Left-side progress clip */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: halfSize,
          height: size,
          overflow: 'hidden'}}>
        <Animated.View
          style={[
            {position: 'absolute', left: 0, top: 0, width: size, height: size},
            leftStyle,
          ]}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              width: size,
              height: halfSize,
              backgroundColor: color,
              borderTopLeftRadius: halfSize,
              borderTopRightRadius: halfSize}}
          />
        </Animated.View>
      </View>

      {/* White donut center — renders on top of discs */}
      <View
        style={{
          position: 'absolute',
          top: strokeWidth,
          left: strokeWidth,
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: bgColor,
          justifyContent: 'center',
          alignItems: 'center'}}>
        {children}
      </View>
    </View>
  );
};

export default AttendanceRing;
