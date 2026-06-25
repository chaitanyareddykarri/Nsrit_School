import React, {useMemo, useState} from 'react';
import {Modal, Portal} from 'react-native-paper';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, spacing, typography} from '../../theme';
import {formatDateForDisplay, parseDateString, toISODate} from '../../utils/helpers/dateHelpers';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const sameDay = (left, right) =>
  left && right &&
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const clampDate = (date, minDate, maxDate) => {
  if (minDate && date < minDate) return minDate;
  if (maxDate && date > maxDate) return maxDate;
  return date;
};

const buildCalendarDays = date => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({length: first.getDay()}, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

const buildYearOptions = (viewDate, selectedDate, minDate, maxDate) => {
  const currentYear = new Date().getFullYear();
  const selectedYear = selectedDate?.getFullYear();
  const viewYear = viewDate.getFullYear();
  const upperYear = maxDate?.getFullYear() || Math.max(currentYear, selectedYear || currentYear, viewYear);
  const lowerYear = minDate?.getFullYear() || Math.min(upperYear - 25, selectedYear || upperYear - 25, viewYear);
  const years = [];
  for (let year = upperYear; year >= lowerYear; year -= 1) years.push(year);
  return years;
};

// ─── Nav Arrow Button ───────────────────────────────────────────────────────
const NavBtn = ({icon, onPress}) => (
  <Pressable onPress={onPress} style={({pressed}) => [styles.navBtn, pressed && {opacity: 0.7}]}>
    <MaterialCommunityIcons name={icon} size={20} color={colors.text} />
  </Pressable>
);

const DatePickerField = ({
  label,
  value,
  onChange,
  placeholder = 'DD-MM-YYYY',
  minimumDate,
  maximumDate,
  disabled,
  required,
}) => {
  const selectedDate = parseDateString(value);
  const minDate = parseDateString(minimumDate);
  const maxDate = parseDateString(maximumDate);
  const initialDate = clampDate(selectedDate || maxDate || new Date(), minDate, maxDate);
  const [visible, setVisible] = useState(false);
  const [viewDate, setViewDate] = useState(initialDate);
  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const yearOptions = useMemo(
    () => buildYearOptions(viewDate, selectedDate, minDate, maxDate),
    [maxDate, minDate, selectedDate, viewDate],
  );

  const open = () => { setViewDate(initialDate); setVisible(true); };
  const moveMonth = delta => setViewDate(c => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  const moveYear = delta => setViewDate(c => new Date(c.getFullYear() + delta, c.getMonth(), 1));
  const selectYear = year => setViewDate(c => clampDate(new Date(year, c.getMonth(), 1), minDate, maxDate));
  const selectMonth = month => setViewDate(c => clampDate(new Date(c.getFullYear(), month, 1), minDate, maxDate));
  const selectDate = date => { onChange(toISODate(date)); setVisible(false); };
  const isDisabledDate = date => !date || (minDate && date < minDate) || (maxDate && date > maxDate);
  const isDisabledMonth = month => {
    const start = new Date(viewDate.getFullYear(), month, 1);
    const end = new Date(viewDate.getFullYear(), month + 1, 0);
    return Boolean((minDate && end < minDate) || (maxDate && start > maxDate));
  };

  return (
    <>
      {/* ── Trigger ── */}
      <Pressable disabled={disabled} onPress={open} style={styles.triggerWrapper}>
        {label ? <Text style={styles.triggerLabel}>{label}{required ? ' *' : ''}</Text> : null}
        <View style={[styles.triggerInput, disabled && styles.triggerDisabled]}>
          <Text style={[styles.triggerText, !value && styles.triggerPlaceholder]}>
            {formatDateForDisplay(value) || placeholder}
          </Text>
          <MaterialCommunityIcons name="calendar-month-outline" size={18} color={colors.textSoft} />
        </View>
      </Pressable>

      {/* ── Calendar Modal ── */}
      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
          {/* Header nav */}
          <View style={styles.headerRow}>
            <NavBtn icon="chevron-double-left" onPress={() => moveYear(-1)} />
            <NavBtn icon="chevron-left" onPress={() => moveMonth(-1)} />
            <View style={styles.monthCopy}>
              <Text style={styles.monthTitle}>{monthNames[viewDate.getMonth()]}</Text>
              <Text style={styles.yearTitle}>{viewDate.getFullYear()}</Text>
            </View>
            <NavBtn icon="chevron-right" onPress={() => moveMonth(1)} />
            <NavBtn icon="chevron-double-right" onPress={() => moveYear(1)} />
          </View>

          {/* Year selector */}
          <View style={styles.selectorBlock}>
            <Text style={styles.selectorLabel}>Year</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearList}>
              {yearOptions.map(year => {
                const sel = year === viewDate.getFullYear();
                return (
                  <Pressable key={year} style={[styles.yearChip, sel && styles.selectedChip]} onPress={() => selectYear(year)}>
                    <Text style={[styles.chipText, sel && styles.selectedText]}>{year}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Month selector */}
          <View style={styles.selectorBlock}>
            <Text style={styles.selectorLabel}>Month</Text>
            <View style={styles.monthGrid}>
              {monthNames.map((month, index) => {
                const disabledMonth = isDisabledMonth(index);
                const sel = index === viewDate.getMonth();
                return (
                  <Pressable
                    key={month}
                    disabled={disabledMonth}
                    style={[styles.monthChip, sel && styles.selectedChip, disabledMonth && styles.disabledDay]}
                    onPress={() => selectMonth(index)}>
                    <Text style={[styles.chipText, sel && styles.selectedText, disabledMonth && styles.disabledText]}>
                      {month.slice(0, 3)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Week header */}
          <View style={styles.weekRow}>
            {weekDays.map((day, index) => (
              <Text key={`${day}-${index}`} style={styles.weekLabel}>{day}</Text>
            ))}
          </View>

          {/* Days grid */}
          <View style={styles.grid}>
            {days.map((date, index) => {
              const disabledDate = isDisabledDate(date);
              const sel = sameDay(date, selectedDate);
              return (
                <Pressable
                  key={date ? toISODate(date) : `blank-${index}`}
                  disabled={disabledDate}
                  style={[styles.dayCell, sel && styles.selectedDay, disabledDate && styles.disabledDay]}
                  onPress={() => date && selectDate(date)}>
                  <Text style={[styles.dayText, sel && styles.selectedText, disabledDate && styles.disabledText]}>
                    {date ? date.getDate() : ''}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable onPress={() => setVisible(false)} style={styles.footerBtn}>
              <Text style={styles.footerBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => setViewDate(clampDate(new Date(), minDate, maxDate))}
              style={[styles.footerBtn, styles.footerBtnOutline]}>
              <Text style={[styles.footerBtnText, styles.footerBtnOutlineText]}>Today</Text>
            </Pressable>
          </View>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  // ── Trigger ──
  triggerWrapper: {marginBottom: spacing.md},
  triggerLabel: {color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: 6},
  triggerInput: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  triggerDisabled: {backgroundColor: colors.background, opacity: 0.6},
  triggerText: {color: colors.text, fontSize: 14},
  triggerPlaceholder: {color: colors.textSoft},

  // ── Modal ──
  modal: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.hero,
    margin: spacing.lg,
    maxWidth: 420,
    padding: spacing.lg,
    width: '92%',
  },
  headerRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm},
  navBtn: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  monthCopy: {alignItems: 'center', flex: 1},
  monthTitle: {...typography.subtitle, color: colors.text},
  yearTitle: {color: colors.textMuted, marginTop: spacing.xxs},

  selectorBlock: {marginBottom: spacing.md},
  selectorLabel: {...typography.caption, color: colors.textMuted, fontWeight: '700', marginBottom: spacing.xs},
  yearList: {gap: spacing.xs, paddingRight: spacing.md},
  yearChip: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    minWidth: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  monthGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs},
  monthChip: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    width: `${(100 - 3) / 4}%`,
  },
  selectedChip: {backgroundColor: colors.primary},
  chipText: {color: colors.text, fontWeight: '700'},

  weekRow: {flexDirection: 'row'},
  weekLabel: {color: colors.text, flex: 1, fontSize: 11, fontWeight: '800', textAlign: 'center'},
  grid: {flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm},
  dayCell: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: radius.pill,
    justifyContent: 'center',
    width: `${100 / 7}%`,
  },
  selectedDay: {backgroundColor: colors.primary},
  disabledDay: {opacity: 0.45},
  dayText: {color: colors.text, fontSize: 13, fontWeight: '600'},
  selectedText: {color: colors.white, fontWeight: '800'},
  disabledText: {color: colors.textMuted},

  footer: {flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md},
  footerBtn: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  footerBtnText: {color: colors.textMuted, fontSize: 14, fontWeight: '700'},
  footerBtnOutline: {
    borderColor: colors.primary,
    borderRadius: radius.sm,
    borderWidth: 1.5,
  },
  footerBtnOutlineText: {color: colors.primary},
});

export default DatePickerField;
