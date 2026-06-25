import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {colors, radius, typography} from '../../theme';

// status: 'PASS' | 'FAIL' | 'ABSENT' | 'PENDING'
const MarksStatusBadge = ({status}) => {
  const {bg, text, label} = CONFIG[status] || CONFIG.PENDING;
  return (
    <View style={[styles.badge, {backgroundColor: bg}]}>
      <Text style={[styles.label, {color: text}]}>{label}</Text>
    </View>
  );
};

const CONFIG = {
  PASS:    {bg: `${colors.success}20`, text: colors.success, label: 'Pass'},
  FAIL:    {bg: `${colors.danger}20`,  text: colors.danger,  label: 'Fail'},
  ABSENT:  {bg: `${colors.warning}20`, text: colors.warning, label: 'Absent'},
  PENDING: {bg: `${colors.textSoft}15`, text: colors.textMuted, label: '—'},
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  label: {...typography.captionBold, fontSize: 11},
});

export default MarksStatusBadge;
