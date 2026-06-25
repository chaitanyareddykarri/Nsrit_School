/**
 * AppHeader — top bar for management/stack screens.
 * Replaces the old Header component with a cleaner, more structured layout.
 * Still uses the same props for backward compatibility (title, subtitle, actionLabel, onAction).
 */
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, spacing, typography} from '../../theme';

const AppHeader = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon,
  onBack,
  children,
}) => (
  <View style={styles.container}>
    <View style={styles.left}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={20}
            color={colors.text}
          />
        </Pressable>
      ) : null}
      <View style={styles.copy}>
        {subtitle ? <Text style={styles.overline}>{subtitle}</Text> : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>

    <View style={styles.right}>
      {children}
      {actionLabel ? (
        <Pressable onPress={onAction} style={styles.actionBtn} hitSlop={6}>
          {actionIcon ? (
            <MaterialCommunityIcons
              name={actionIcon}
              size={16}
              color={colors.primary}
            />
          ) : null}
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  left: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minWidth: 0,
  },
  backBtn: {
    alignItems: 'center',
    backgroundColor: colors.neutralSoft,
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  overline: {
    ...typography.overline,
    color: colors.textMuted,
    marginBottom: 1,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
  right: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingLeft: spacing.sm,
  },
  actionBtn: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionText: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 12,
  },
});

export default AppHeader;
