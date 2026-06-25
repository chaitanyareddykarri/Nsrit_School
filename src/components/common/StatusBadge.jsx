import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {ATTENDANCE_STATUS, FEE_STATUS} from '../../config/constants';
import {colors, radius, spacing, typography} from '../../theme';

const BADGE_THEME = {
  ACTIVE: {
    bg: colors.successSoft,
    fg: colors.success,
    label: 'Active',
  },
  INACTIVE: {
    bg: colors.neutralSoft,
    fg: colors.textMuted,
    label: 'Inactive',
  },
  DISABLED: {
    bg: colors.neutralSoft,
    fg: colors.textMuted,
    label: 'Disabled',
  },
  [FEE_STATUS.PAID]: {
    bg: colors.successSoft,
    fg: colors.success,
    label: 'Paid',
  },
  [FEE_STATUS.PARTIAL]: {
    bg: colors.warningSoft,
    fg: colors.warning,
    label: 'Partial',
  },
  [FEE_STATUS.DUE]: {bg: colors.dangerSoft, fg: colors.danger, label: 'Due'},
  [FEE_STATUS.OVERDUE]: {
    bg: colors.dangerSoft,
    fg: colors.danger,
    label: 'Overdue',
  },
  [ATTENDANCE_STATUS.PRESENT]: {
    bg: colors.successSoft,
    fg: colors.success,
    label: 'Present',
  },
  [ATTENDANCE_STATUS.ABSENT]: {
    bg: colors.dangerSoft,
    fg: colors.danger,
    label: 'Absent',
  },
  [ATTENDANCE_STATUS.LATE]: {
    bg: colors.warningSoft,
    fg: colors.warning,
    label: 'Late',
  },
  PENDING: {
    bg: colors.warningSoft,
    fg: colors.warning,
    label: 'Pending',
  },
  COMPLETED: {
    bg: colors.successSoft,
    fg: colors.success,
    label: 'Completed',
  },
  REVIEW: {
    bg: colors.infoSoft,
    fg: colors.info,
    label: 'Review',
  },
  SOLVED: {
    bg: colors.successSoft,
    fg: colors.success,
    label: 'Solved',
  },
  RECORDED: {
    bg: colors.infoSoft,
    fg: colors.info,
    label: 'Recorded',
  },
  REVERSED: {
    bg: colors.dangerSoft,
    fg: colors.danger,
    label: 'Reversed',
  },
  CANCELLED: {
    bg: colors.dangerSoft,
    fg: colors.danger,
    label: 'Cancelled',
  },
  holiday: {bg: colors.surfaceAlt, fg: colors.textMuted, label: 'Holiday'},
  info: {bg: colors.infoSoft, fg: colors.info, label: 'Info'},
};

const StatusBadge = ({status = 'info', label}) => {
  const statusKey = String(status || 'info').toUpperCase();
  const statusLower = String(status || 'info').toLowerCase();
  const theme =
    BADGE_THEME[status] ||
    BADGE_THEME[statusKey] ||
    BADGE_THEME[statusLower] ||
    BADGE_THEME.info;

  return (
    <View style={[styles.badge, {backgroundColor: theme.bg}]}>
      <View style={[styles.dot, {backgroundColor: theme.fg}]} />
      <Text style={[styles.label, {color: theme.fg}]}>
        {label || theme.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    flexDirection: 'row',
    minHeight: 28,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  dot: {
    borderRadius: radius.pill,
    height: 6,
    marginRight: spacing.xs,
    width: 6,
  },
  label: {
    ...typography.caption,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
});

export default StatusBadge;
