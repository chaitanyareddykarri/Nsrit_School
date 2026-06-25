import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const SummaryCard = ({title, value, subtitle, progress = 0, tone = colors.primary}) => {
  const safeProgress = Math.min(Math.max(Number(progress) || 0, 0), 1);

  return (
    <View style={styles.card}>
      <View style={[styles.accentBar, {backgroundColor: tone}]} />
      <View style={styles.inner}>
        <View style={styles.row}>
          <View style={styles.copy}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
          <View style={[styles.percentBadge, {backgroundColor: `${tone}15`}]}>
            <Text style={[styles.percent, {color: tone}]}>
              {Math.round(safeProgress * 100)}%
            </Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${safeProgress * 100}%`, backgroundColor: tone}]} />
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  accentBar: {height: 4},
  inner: {padding: spacing.lg},
  row: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  copy: {flex: 1, minWidth: 0, paddingRight: spacing.md},
  title: {...typography.captionBold, color: colors.textMuted, textTransform: 'uppercase'},
  value: {...typography.title, color: colors.text, marginTop: spacing.xs},
  percentBadge: {
    alignItems: 'center',
    borderRadius: radius.lg,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  percent: {...typography.subtitle},
  progressTrack: {
    backgroundColor: colors.borderLight,
    borderRadius: radius.pill,
    height: 8,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {borderRadius: radius.pill, height: 8},
  subtitle: {...typography.caption, color: colors.textMuted, marginTop: spacing.sm},
});

export default SummaryCard;
