import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ROLE_LABELS} from '../../config/constants';
import {colors, radius, spacing, typography} from '../../theme';

const RoleCard = ({role, description}) => (
  <View style={styles.card}>
    <Text style={styles.role}>{ROLE_LABELS[role] || role}</Text>
    {description ? <Text style={styles.description}>{description}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  role: {
    ...typography.subtitle,
    color: colors.primaryDark,
  },
  description: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

export default RoleCard;
