import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import StatusBadge from '../common/StatusBadge';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const AttendanceCard = ({title, date, present, absent, late, status, onPress}) => (
  <Pressable
    onPress={onPress}
    style={({pressed}) => [styles.card, pressed && {opacity: 0.88}]}>
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <StatusBadge status={status || 'info'} label={status ? undefined : 'Today'} />
    </View>
    <View style={styles.metrics}>
      <View style={[styles.metricPill, styles.present]}>
        <Text style={[styles.metric, {color: colors.success}]}>{present} Present</Text>
      </View>
      <View style={[styles.metricPill, styles.absent]}>
        <Text style={[styles.metric, {color: colors.danger}]}>{absent} Absent</Text>
      </View>
      <View style={[styles.metricPill, styles.late]}>
        <Text style={[styles.metric, {color: colors.warning}]}>{late} Late</Text>
      </View>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copy: {flex: 1, minWidth: 0, paddingRight: spacing.md},
  title: {...typography.sectionTitle, color: colors.text},
  date: {...typography.caption, color: colors.textMuted, marginTop: spacing.xxs},
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  metric: {fontSize: 12, fontWeight: '700'},
  metricPill: {borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm},
  present: {backgroundColor: `${colors.success}12`},
  absent: {backgroundColor: `${colors.danger}12`},
  late: {backgroundColor: `${colors.warning}12`},
});

export default AttendanceCard;
