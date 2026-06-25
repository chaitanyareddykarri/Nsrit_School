import React from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {Text} from 'react-native-paper';
import {colors, radius, spacing, typography} from '../../theme';

/**
 * A single row in the marks entry grid.
 * Shows roll number, student name, and one TextInput per subject.
 *
 * Props:
 *  student     – { id, fullName, rollNumber }
 *  subjects    – [{ subjectName, maxMarks }]
 *  values      – { [subjectName]: string }  (controlled)
 *  onChange    – (studentId, subjectName, value) => void
 *  onNext      – (studentId, subjectIndex) => void  (for tab navigation)
 *  inputRefs   – ref array indexed by subjects order (passed from parent)
 *  isReadOnly  – bool  (published exam = read-only)
 *  isAbsents   – { [subjectName]: bool }
 *  onAbsentToggle – (studentId, subjectName) => void
 */
const MarksRowInput = ({student, subjects, values = {}, onChange, onNext, inputRefs = [], isReadOnly, isAbsents = {}, onAbsentToggle}) => (
  <View style={styles.row}>
    <View style={styles.studentCell}>
      <Text style={styles.rollNo}>{student.rollNumber || '—'}</Text>
      <Text style={styles.name} numberOfLines={1}>{student.fullName}</Text>
    </View>
    {subjects.map((subj, idx) => {
      const isAbsent = isAbsents[subj.subjectName];
      const hasError =
        !isAbsent &&
        values[subj.subjectName] !== '' &&
        values[subj.subjectName] != null &&
        Number(values[subj.subjectName]) > subj.maxMarks;

      return (
        <View key={subj.subjectName} style={styles.inputCell}>
          <TextInput
            ref={r => {
              if (inputRefs) inputRefs[idx] = r;
            }}
            style={[
              styles.input,
              isAbsent && styles.inputAbsent,
              hasError && styles.inputError,
              isReadOnly && styles.inputReadOnly,
            ]}
            value={isAbsent ? 'AB' : (values[subj.subjectName] ?? '')}
            onChangeText={v => !isReadOnly && !isAbsent && onChange?.(student.id, subj.subjectName, v)}
            keyboardType="numeric"
            maxLength={5}
            editable={!isReadOnly && !isAbsent}
            returnKeyType="next"
            onSubmitEditing={() => onNext?.(student.id, idx)}
            placeholder={isReadOnly ? '—' : `/${subj.maxMarks}`}
            placeholderTextColor={colors.textSoft}
            selectTextOnFocus
          />
          {!isReadOnly && (
            <Text
              style={styles.abToggle}
              onPress={() => onAbsentToggle?.(student.id, subj.subjectName)}>
              {isAbsent ? 'undo' : 'AB'}
            </Text>
          )}
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: 6,
  },
  studentCell: {flex: 1.8, paddingHorizontal: spacing.sm},
  rollNo: {...typography.caption, color: colors.textSoft, fontSize: 10},
  name: {...typography.caption, color: colors.text, fontWeight: '600', fontSize: 12},
  inputCell: {flex: 1, alignItems: 'center', gap: 2},
  input: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    height: 36,
    minWidth: 52,
    paddingHorizontal: 6,
    textAlign: 'center',
  },
  inputAbsent: {backgroundColor: `${colors.warning}15`, borderColor: colors.warning, color: colors.warning},
  inputError: {borderColor: colors.danger, backgroundColor: `${colors.danger}10`},
  inputReadOnly: {backgroundColor: colors.surfaceAlt, color: colors.textMuted},
  abToggle: {color: colors.textSoft, fontSize: 9, fontWeight: '700', textAlign: 'center', paddingVertical: 2},
});

export default MarksRowInput;
