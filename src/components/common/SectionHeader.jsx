import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, spacing, typography} from '../../theme';

const SectionHeader = ({title, subtitle, actionLabel, onAction, icon}) => (
  <View style={styles.container}>
    <View style={styles.left}>
      {icon ? (
        <View style={styles.iconPill}>
          <MaterialCommunityIcons name={icon} size={13} color={colors.primary} />
        </View>
      ) : null}
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>

    {actionLabel ? (
      <Pressable onPress={onAction} style={styles.action} hitSlop={10}>
        <Text style={styles.actionText}>{actionLabel}</Text>
        <MaterialCommunityIcons name="chevron-right" size={14} color={colors.primary} />
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  left: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  iconPill: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  copy: {flex: 1, minWidth: 0},
  title: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  action: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionText: {
    ...typography.captionBold,
    color: colors.primary,
  },
});

export default SectionHeader;
