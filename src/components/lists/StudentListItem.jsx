import React, {memo} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_ICONS,
  ATTENDANCE_STATUS_LABELS} from '../../config/constants';
import {colors, radius, spacing, typography} from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getInitials = name =>
  name
    ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

const getStatusMeta = status => {
  const s = String(status || ATTENDANCE_STATUS.PRESENT).toUpperCase();
  let color = ATTENDANCE_STATUS_COLORS[s] || '#94A3B8';
  let bg = `${color}09`;
  let text = color;
  let icon = ATTENDANCE_STATUS_ICONS[s] || 'help-circle-outline';

  if (s === 'PRESENT') {
    color = '#10B981';
    bg = '#E8F5E9';
    text = '#1B5E20';
    icon = 'check-circle';
  } else if (s === 'ABSENT') {
    color = '#EF4444';
    bg = '#FFEBEE';
    text = '#B71C1C';
    icon = 'close-circle';
  }

  return {
    color,
    bg,
    text,
    icon,
    label: ATTENDANCE_STATUS_LABELS[s] || s
  };
};

const StudentListItem = ({
  student,
  status = ATTENDANCE_STATUS.PRESENT,
  onToggle,      // if provided, tapping the row cycles/toggles status (teacher mode)
  onStatusPress, // if provided, opens a full status picker (called with student.id)
  right,
  disabled}) => {
  const scale = useSharedValue(1);
  const {color, bg, text, icon, label} = getStatusMeta(status);

  const animStyle = useAnimatedStyle(() => ({transform: [{scale: scale.value}]}));

  const handlePress = () => {
    if (disabled || (!onToggle && !onStatusPress)) { return; }
    scale.value = withSpring(0.965, {damping: 14, stiffness: 300}, () => {
      scale.value = withSpring(1, {damping: 11, stiffness: 240});
    });
    if (onToggle) { onToggle(); }
    else if (onStatusPress) { onStatusPress(student.id); }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled && !onStatusPress && !onToggle}
      style={[
        animStyle,
        styles.wrapper,
        {borderLeftColor: color, backgroundColor: bg, borderColor: color},
      ]}>
      <View style={styles.row}>
        <View style={[styles.avatar, {backgroundColor: `${color}1F`}]}>
          <Text style={[styles.avatarText, {color: text}]}>
            {getInitials(student.name)}
          </Text>
        </View>
        <View style={styles.copy}>
          <Text style={[styles.name, {color: text}]} numberOfLines={1}>{student.name}</Text>
          <Text style={[styles.meta, {color: `${text}B0`}]}>
            {student.section ? `${student.section}  ·  ` : ''}Roll {student.rollNo}
          </Text>
        </View>
        {right != null
          ? right
          : (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <MaterialCommunityIcons name={icon} size={20} color={color} />
              <Text style={{fontSize: 12, fontWeight: '700', color: text}}>{label}</Text>
            </View>
          )}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderLeftWidth: 3,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: 'hidden'},
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm},
  avatar: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38},
  avatarText: {fontSize: 13, fontWeight: '800'},
  copy: {flex: 1, minWidth: 0},
  name: {...typography.bodyBold, color: colors.text},
  meta: {...typography.caption, color: colors.textMuted, marginTop: 1}});

const chip = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4},
  label: {fontSize: 10, fontWeight: '700'}});

export default memo(StudentListItem);
