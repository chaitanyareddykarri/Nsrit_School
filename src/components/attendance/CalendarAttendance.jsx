import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {colors, radius, spacing} from '../../theme';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad2 = n => String(n).padStart(2, '0');

// Build today's date string in LOCAL timezone to avoid UTC-offset date shift on physical devices
const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const getDayCfg = (status, isToday, isSunday) => {
  // Holiday takes priority over Sunday (a declared holiday on Sunday is more informative)
  if (status === 'holiday' || status === 'publicHoliday') {
    return {bg: '#FED7AA', fg: '#C2410C', ring: false};
  }
  if (isSunday) {
    return {bg: `${colors.danger}15`, fg: colors.danger, ring: false};
  }
  if (status === 'future') {
    return {bg: 'transparent', fg: colors.border, ring: false};
  }
  if (isToday && !status) {
    return {bg: 'transparent', fg: colors.primary, ring: true};
  }
  if (status === 'present')             { return {bg: colors.success, fg: colors.white, ring: false}; }
  if (status === 'absent')              { return {bg: colors.danger,  fg: colors.white, ring: false}; }
  if (status === 'half')                { return {bg: '#F97316',      fg: colors.white, ring: false}; }
  if (status === 'late')                { return {bg: '#EAB308',      fg: colors.text,  ring: false}; }
  if (status === 'medical')             { return {bg: '#8B5CF6',      fg: colors.white, ring: false}; }
  if (status === 'approved')            { return {bg: '#3B82F6',      fg: colors.white, ring: false}; }
  if (status === 'coordinator_present') { return {bg: '#3B82F6',      fg: colors.white, ring: false}; }
  return {bg: 'transparent', fg: colors.textMuted, ring: false};
};

const CalendarAttendance = ({monthDate = new Date(), records = {}}) => {
  const todayStr = getToday();

  const cells = useMemo(() => {
    const year  = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const dayCount = new Date(year, month + 1, 0).getDate();

    const built = Array.from({length: firstDay}).map((_, i) => ({
      key: `blank-${i}`,
      blank: true,
    }));

    for (let day = 1; day <= dayCount; day++) {
      // Build key from local date parts — avoids UTC-offset date shift on physical devices
      const key = `${year}-${pad2(month + 1)}-${pad2(day)}`;
      // String comparison avoids the stale-Date capture problem inside useMemo
      const isFuture = key > todayStr;
      const isSun    = new Date(year, month, day).getDay() === 0;
      const rawRecord      = records[key];
      const recordStatus   = typeof rawRecord === 'object' ? rawRecord?.status       : rawRecord;
      const coordinatorEdited = typeof rawRecord === 'object' ? rawRecord?.coordinatorEdited : false;
      let status;
      if (isSun && (recordStatus === 'holiday' || recordStatus === 'publicHoliday')) {
        // Holiday declared on a Sunday — show the holiday, not the Sunday
        status = recordStatus;
      } else if (isSun) {
        status = 'sunday';
      } else if (isFuture) {
        status = 'future';
      } else if (coordinatorEdited && recordStatus === 'present') {
        status = 'coordinator_present';
      } else {
        status = recordStatus || null;
      }
      built.push({key, day, isToday: key === todayStr, status, isSunday: isSun && status === 'sunday'});
    }

    return built;
  }, [monthDate, records, todayStr]);

  return (
    <View>
      <View style={styles.weekRow}>
        {DAY_LABELS.map(label => (
          <Text key={label} style={styles.weekLabel}>
            {label.slice(0, 1)}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map(cell => {
          if (cell.blank) {
            return <View key={cell.key} style={styles.cell} />;
          }
          const cfg = getDayCfg(cell.status, cell.isToday, cell.isSunday);
          return (
            <View key={cell.key} style={styles.cell}>
              <View
                style={[
                  styles.day,
                  {backgroundColor: cfg.bg},
                  cfg.ring && styles.dayRing,
                ]}>
                <Text style={[styles.dayText, {color: cfg.fg}]}>
                  {cell.day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekLabel: {
    color: colors.text,
    flex: 1,
    fontWeight: '800',
    fontSize: 11,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  cell: {
    alignItems: 'center',
    aspectRatio: 1,
    justifyContent: 'center',
    padding: spacing.xxs,
    width: `${100 / 7}%`,
  },
  day: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  dayRing: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  dayText: {fontSize: 13, fontWeight: '700'},
});

export default CalendarAttendance;
