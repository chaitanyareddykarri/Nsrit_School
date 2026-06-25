import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import StatusBadge from '../common/StatusBadge';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const money = value => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const FeeCard = ({student, onPress}) => {
  const paidRatio = student.totalFee ? student.paidAmount / student.totalFee : 0;
  const clampedRatio = Math.min(1, Math.max(0, paidRatio));
  const barColor = student.dueAmount > 0 ? colors.warning : colors.success;

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.card, pressed && {opacity: 0.9}]}>
      <View style={[styles.accentBar, {backgroundColor: barColor}]} />
      <View style={styles.inner}>
        <View style={styles.row}>
          <View style={styles.copy}>
            <Text style={styles.name}>{student.studentName}</Text>
            <Text style={styles.meta}>
              {student.className} · {student.sectionName}
            </Text>
          </View>
          <StatusBadge status={student.status} />
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${Math.round(clampedRatio * 100)}%`, backgroundColor: barColor}]} />
        </View>
        <View style={styles.amountRow}>
          <View style={styles.amountBlock}>
            <Text style={styles.amountLabel}>Paid</Text>
            <Text style={[styles.amount, styles.paid]}>{money(student.paidAmount)}</Text>
          </View>
          <View style={styles.amountBlock}>
            <Text style={styles.amountLabel}>Due</Text>
            <Text style={[styles.amount, student.dueAmount > 0 && styles.due]}>{money(student.dueAmount)}</Text>
          </View>
          <View style={styles.ratioChip}>
            <Text style={[styles.ratioText, {color: barColor}]}>
              {Math.round(clampedRatio * 100)}%
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radius.card,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  accentBar: {height: 4},
  inner: {padding: spacing.lg},
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copy: {flex: 1, minWidth: 0, paddingRight: spacing.md},
  name: {...typography.sectionTitle, color: colors.text},
  meta: {...typography.caption, color: colors.textMuted, marginTop: spacing.xxs},
  progressTrack: {
    backgroundColor: colors.borderLight,
    borderRadius: radius.pill,
    height: 8,
    marginVertical: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {borderRadius: radius.pill, height: '100%'},
  amountRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  amountBlock: {gap: 2},
  amountLabel: {...typography.overline, color: colors.textMuted, fontSize: 9},
  amount: {...typography.subtitle, color: colors.text, marginTop: spacing.xs},
  paid: {color: colors.success},
  due: {color: colors.danger},
  ratioChip: {
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  ratioText: {fontSize: 13, fontWeight: '800'},
});

export default FeeCard;
