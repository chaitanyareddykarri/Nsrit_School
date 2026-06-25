import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {colors, spacing, typography} from '../../theme';
import MarksStatusBadge from './MarksStatusBadge';

// One row in the parent/student result table.
const SubjectResultRow = ({subjectName, marksObtained, maxMarks, passingMarks, isAbsent}) => {
  const status = isAbsent ? 'ABSENT' : marksObtained == null ? 'PENDING' : marksObtained >= passingMarks ? 'PASS' : 'FAIL';
  const obtained = isAbsent ? 'AB' : marksObtained != null ? String(marksObtained) : '—';

  return (
    <View style={styles.row}>
      <Text style={styles.subject} numberOfLines={1}>{subjectName}</Text>
      <Text style={styles.marks}>{obtained}</Text>
      <Text style={styles.max}>{maxMarks}</Text>
      <MarksStatusBadge status={status} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  subject: {...typography.body, color: colors.text, flex: 2, fontWeight: '600', fontSize: 13},
  marks: {...typography.bodyBold, color: colors.text, flex: 1, textAlign: 'center', fontSize: 14},
  max: {...typography.caption, color: colors.textMuted, flex: 1, textAlign: 'center'},
});

export default SubjectResultRow;
