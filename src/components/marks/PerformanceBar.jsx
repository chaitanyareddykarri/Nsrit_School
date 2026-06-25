import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import {colors, radius, spacing, typography} from '../../theme';

const PerformanceBar = ({percentage = 0, label}) => {
  const pct = Math.min(100, Math.max(0, percentage));
  const width = useSharedValue(0);

  React.useEffect(() => {
    width.value = withSpring(pct, {damping: 18, stiffness: 90});
  }, [pct]);

  const barStyle = useAnimatedStyle(() => ({width: `${width.value}%`}));
  const barColor = pct >= 75 ? colors.success : pct >= 40 ? colors.warning : colors.danger;

  return (
    <View style={styles.root}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle, {backgroundColor: barColor}]} />
      </View>
      <Text style={[styles.pct, {color: barColor}]}>{pct.toFixed(1)}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  label: {...typography.caption, color: colors.textMuted, flex: 1, fontSize: 12},
  track: {
    flex: 1,
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: radius.pill,
    overflow: 'hidden'},
  fill: {height: '100%', borderRadius: radius.pill},
  pct: {...typography.captionBold, fontSize: 12, minWidth: 44, textAlign: 'right'}});

export default PerformanceBar;
