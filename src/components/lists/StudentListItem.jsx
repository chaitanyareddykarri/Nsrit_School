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
  return {
    color:  ATTENDANCE_STATUS_COLORS[s]  || '#94A3B8',
    icon:   ATTENDANCE_STATUS_ICONS[s]   || 'help-circle-outline',
    label:  ATTENDANCE_STATUS_LABELS[s]  || s};
};

// ── Compact status chip shown on each student row ─────────────────────────────
const StatusChip = ({status}) => {
  const {color, icon, label} = getStatusMeta(status);
  return (
    <View style={[chip.wrap, {backgroundColor: `${color}18`, borderColor: `${color}35`}]}>
      <MaterialCommunityIcons name={icon} size={12} color={color} />
      <Text style={[chip.label, {color}]}>{label}</Text>
    </View>
  );
};

const StudentListItem = ({
  student,
  status = ATTENDANCE_STATUS.PRESENT,
  onToggle,      // if provided, tapping the row cycles through statuses (teacher mode)
  onStatusPress, // if provided, opens a full status picker (called with student.id)
  right,
  disabled}) => {
  const scale = useSharedValue(1);
  const {color: accentColor} = getStatusMeta(status);
  const bgTint = `${accentColor}09`;

  const animStyle = useAnimatedStyle(() => ({transform: [{scale: scale.value}]}));

  const handlePress = () => {
    if (disabled || (!onToggle && !onStatusPress)) { return; }
    scale.value = withSpring(0.965, {damping: 14, stiffness: 300}, () => {
      scale.value = withSpring(1, {damping: 11, stiffness: 240});
    });
    if (onStatusPress) { onStatusPress(student.id); return; }
    if (onToggle) { onToggle(); }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled && !onStatusPress && !onToggle}
      style={[
        animStyle,
        styles.wrapper,
        {borderLeftColor: accentColor, backgroundColor: bgTint},
      ]}>
      <View style={styles.row}>
        <View style={[styles.avatar, {backgroundColor: `${accentColor}1F`}]}>
          <Text style={[styles.avatarText, {color: accentColor}]}>
            {getInitials(student.name)}
          </Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.name} numberOfLines={1}>{student.name}</Text>
          <Text style={styles.meta}>
            {student.section ? `${student.section}  ·  ` : ''}Roll {student.rollNo}
          </Text>
        </View>
        {right != null
          ? right
          : <StatusChip status={status} />}
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
