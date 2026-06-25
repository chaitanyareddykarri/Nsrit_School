import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const EmptyState = ({
  title = 'Nothing here yet',
  message,
  icon = 'inbox-outline',
  actionLabel,
  onAction,
  compact = false}) => (
  <Animated.View
    style={[styles.container, compact && styles.compact]}>

    {/* Floating icon ring */}
    <View style={styles.iconRing}>
      <View style={styles.iconInner}>
        <MaterialCommunityIcons name={icon} size={30} color={colors.primary} />
      </View>
    </View>

    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}

    {actionLabel ? (
      <Pressable onPress={onAction} style={styles.actionBtn}>
        <Text style={styles.actionText}>{actionLabel}</Text>
      </Pressable>
    ) : null}
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    padding: spacing.xxl},
  compact: {
    padding: spacing.xl},
  iconRing: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 6,
    height: 82,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 82},
  iconInner: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56},
  title: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center'},
  message: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center'},
  actionBtn: {
    ...shadows.clay,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md},
  actionText: {
    ...typography.captionBold,
    color: colors.white,
    fontSize: 13}});

export default EmptyState;
