import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {colors, radius, typography} from '../../theme';

// Displays a coloured grade badge (A+, A, B+, … F) based on percentage.
const GradeChip = ({grade, label, size = 'md'}) => {
  const {bg, text} = gradeColor(grade);
  const isLg = size === 'lg';
  return (
    <View style={[styles.chip, {backgroundColor: bg}, isLg && styles.chipLg]}>
      <Text style={[styles.grade, {color: text}, isLg && styles.gradeLg]}>{grade || '—'}</Text>
      {label ? <Text style={[styles.label, {color: text}]}>{label}</Text> : null}
    </View>
  );
};

function gradeColor(grade) {
  switch (grade) {
    case 'A+': return {bg: `${colors.success}25`, text: colors.success};
    case 'A':  return {bg: `${colors.success}18`, text: colors.success};
    case 'B+': return {bg: `${colors.info}20`,    text: colors.info};
    case 'B':  return {bg: `${colors.info}15`,    text: colors.info};
    case 'C':  return {bg: `${colors.warning}20`, text: colors.warning};
    case 'D':  return {bg: `${colors.warning}15`, text: '#D97706'};
    case 'F':  return {bg: `${colors.danger}20`,  text: colors.danger};
    default:   return {bg: `${colors.textSoft}15`, text: colors.textMuted};
  }
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipLg: {paddingHorizontal: 18, paddingVertical: 8},
  grade: {...typography.captionBold, fontSize: 13},
  gradeLg: {fontSize: 22, fontWeight: '900'},
  label: {...typography.caption, fontSize: 10, marginTop: 1},
});

export default GradeChip;
