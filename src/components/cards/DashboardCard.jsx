/**
 * DashboardCard — premium floating clay list card.
 * Variants: 'default' (horizontal nav card) | 'featured' (metric banner)
 */
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DashboardCard = ({
  title,
  value,
  description,
  onPress,
  icon = 'view-dashboard-outline',
  tone = colors.primary,
  variant = 'default',
  badge}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}]}));

  const handlePressIn = () => {
    if (!onPress) {return;}
    scale.value = withSpring(0.973, {damping: 22, stiffness: 280});
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 18, stiffness: 200});
  };

  if (variant === 'featured') {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.featured, {borderLeftColor: tone, borderLeftWidth: 4}, animStyle]}>
        <View style={styles.featuredLeft}>
          <View style={[styles.iconSm, {backgroundColor: `${tone}18`}]}>
            <MaterialCommunityIcons name={icon} size={18} color={tone} />
          </View>
          <View style={styles.featuredCopy}>
            <Text style={styles.featuredTitle}>{title}</Text>
            {description ? (
              <Text style={styles.featuredDesc} numberOfLines={1}>{description}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.featuredRight}>
          <Text style={[styles.featuredValue, {color: tone}]} numberOfLines={1}>
            {value}
          </Text>
          {onPress ? (
            <MaterialCommunityIcons name="chevron-right" size={16} color={`${tone}80`} />
          ) : null}
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, animStyle]}>

      {/* Left icon bubble */}
      <View style={[styles.iconBadge, {backgroundColor: `${tone}15`}]}>
        <MaterialCommunityIcons name={icon} size={22} color={tone} />
      </View>

      {/* Copy */}
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {badge ? (
            <View style={[styles.badge, {backgroundColor: `${tone}18`}]}>
              <Text style={[styles.badgeText, {color: tone}]}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.value, {color: tone}]} numberOfLines={1}>{value}</Text>
        {description ? (
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        ) : null}
      </View>

      {/* Arrow */}
      {onPress ? (
        <View style={[styles.arrowWrap, {backgroundColor: `${tone}10`}]}>
          <MaterialCommunityIcons name="chevron-right" size={16} color={tone} />
        </View>
      ) : null}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
    paddingRight: spacing.sm},
  iconBadge: {
    alignItems: 'center',
    borderRadius: radius.xl,
    height: 52,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 52},
  copy: {flex: 1, minWidth: 0},
  titleRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.xs},
  title: {
    ...typography.heading,
    color: colors.text,
    flex: 1},
  value: {
    ...typography.metricSm,
    marginTop: 2},
  description: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3},
  arrowWrap: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 28,
    justifyContent: 'center',
    marginLeft: spacing.xs,
    width: 28},
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2},
  badgeText: {fontSize: 10, fontWeight: '700'},
  // Featured variant
  featured: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    padding: spacing.md},
  featuredLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minWidth: 0},
  iconSm: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 38,
    justifyContent: 'center',
    width: 38},
  featuredCopy: {flex: 1, minWidth: 0},
  featuredTitle: {...typography.captionBold, color: colors.text},
  featuredDesc: {...typography.caption, color: colors.textMuted},
  featuredRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    paddingLeft: spacing.sm},
  featuredValue: {...typography.bodyBold, fontWeight: '800'}});

export default DashboardCard;
