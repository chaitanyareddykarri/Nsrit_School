import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AnimatedMetric from '../animated/AnimatedMetric';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const StatCard = ({
  title,
  value,
  icon = 'chart-box-outline',
  tone = colors.primary,
  description,
  onPress}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}]}));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, {damping: 20, stiffness: 300});
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15, stiffness: 200});
  };

  const isNumeric = !isNaN(parseFloat(String(value))) && String(value).trim() !== '';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      style={[styles.wrapper, animStyle]}>

      {/* Top accent strip */}
      <View style={[styles.accentStrip, {backgroundColor: tone}]} />

      {/* Icon + arrow row */}
      <View style={[styles.topRow, {backgroundColor: `${tone}0F`}]}>
        <View style={[styles.iconWrap, {backgroundColor: `${tone}20`}]}>
          <MaterialCommunityIcons name={icon} size={20} color={tone} />
        </View>
        {onPress ? (
          <View style={[styles.arrowWrap, {backgroundColor: `${tone}15`}]}>
            <MaterialCommunityIcons name="arrow-top-right" size={13} color={tone} />
          </View>
        ) : null}
      </View>

      {/* Metric */}
      <View style={styles.body}>
        <AnimatedMetric
          value={value}
          isNumeric={isNumeric}
          style={[typography.metric, {color: colors.text}]}
        />
        <Text style={[styles.title, {color: tone}]} numberOfLines={2}>
          {title}
        </Text>
        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flex: 1,
    minWidth: '47%',
    overflow: 'hidden'},
  accentStrip: {
    height: 4,
    width: '100%'},
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingBottom: spacing.sm},
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 42,
    justifyContent: 'center',
    width: 42},
  arrowWrap: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 26,
    justifyContent: 'center',
    width: 26},
  body: {
    padding: spacing.md,
    paddingTop: spacing.xs},
  title: {
    ...typography.overline,
    marginTop: spacing.xs},
  description: {
    ...typography.caption,
    color: colors.textSoft,
    marginTop: 3}});

export default StatCard;
