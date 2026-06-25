import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring} from 'react-native-reanimated';
import {colors, radius, spacing, typography} from '../../theme';

const AnimatedProgressBar = ({
  progress = 0,
  color = colors.primary,
  trackColor = colors.border,
  height = 6,
  showLabel = false,
  label,
  style}) => {
  const pct = Math.min(Math.max(progress, 0), 100);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(pct, {damping: 20, stiffness: 100, mass: 1});
  }, [pct, width]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`}));

  return (
    <View style={[styles.wrapper, style]}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label || 'Progress'}</Text>
          <Text style={[styles.labelValue, {color}]}>{pct}%</Text>
        </View>
      )}
      <View style={[styles.track, {backgroundColor: trackColor, height}]}>
        <Animated.View
          style={[
            {
              height,
              backgroundColor: color,
              borderRadius: radius.pill},
            barStyle,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%'},
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs},
  label: {
    ...typography.captionBold,
    color: colors.textMuted},
  labelValue: {
    ...typography.captionBold},
  track: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    width: '100%'}});

export default AnimatedProgressBar;
