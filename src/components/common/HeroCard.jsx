/**
 * HeroCard — large full-width featured card used in parent/student dashboards.
 * Displays a child profile, key metric, and a sub-action row.
 */
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const HeroCard = ({
  title,
  subtitle,
  metricLabel,
  metricValue,
  metricColor = colors.success,
  icon = 'account-school-outline',
  iconColor = colors.primary,
  actions = [],
  onPress,
  style}) => (
  <Animated.View
    style={[styles.card, style]}>
    <Pressable onPress={onPress} style={styles.inner}>
      {/* Decorative blob */}
      <View style={styles.blob} />

      <View style={styles.topRow}>
        {/* Avatar circle */}
        <View style={styles.avatarWrap}>
          <MaterialCommunityIcons name={icon} size={30} color={iconColor} />
        </View>

        {/* Text info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {title || 'Select Child'}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle || 'Tap to choose'}
          </Text>
        </View>

        {/* Metric chip */}
        {metricValue ? (
          <View style={[styles.metricChip, {backgroundColor: `${metricColor}15`}]}>
            <Text style={[styles.metricValue, {color: metricColor}]}>
              {metricValue}
            </Text>
            <Text style={styles.metricLabel}>{metricLabel}</Text>
          </View>
        ) : null}
      </View>

      {/* Action strip */}
      {actions.length > 0 ? (
        <View style={styles.actionStrip}>
          {actions.map((action, idx) => (
            <Pressable
              key={idx}
              onPress={action.onPress}
              style={styles.actionItem}>
              <MaterialCommunityIcons
                name={action.icon}
                size={16}
                color={action.color || colors.primary}
              />
              <Text style={[styles.actionLabel, {color: action.color || colors.primary}]}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </Pressable>
  </Animated.View>
);

const styles = StyleSheet.create({
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden'},
  inner: {
    padding: spacing.lg},
  blob: {
    backgroundColor: colors.primarySoft,
    borderRadius: 60,
    height: 120,
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120},
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md},
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 60,
    justifyContent: 'center',
    width: 60},
  info: {
    flex: 1,
    minWidth: 0},
  title: {
    ...typography.heading,
    color: colors.text},
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2},
  metricChip: {
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm},
  metricValue: {
    ...typography.metricSm,
    fontWeight: '900'},
  metricLabel: {
    ...typography.overline,
    color: colors.textMuted},
  actionStrip: {
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingTop: spacing.md},
  actionItem: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center'},
  actionLabel: {
    ...typography.captionBold,
    fontSize: 11}});

export default HeroCard;
