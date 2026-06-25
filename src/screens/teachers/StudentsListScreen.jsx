import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, SearchBar, SkeletonLoader, StudentListItem} from '../../components';
import {USER_ROLES} from '../../config/constants';
import studentService from '../../services/students/studentService';
import teacherService from '../../services/teachers/teacherService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const StudentsListScreen = () => {
  const user = useSelector(state => state.auth.user);
  const [query, setQuery] = useState('');
  const role = String(user?.role || '').toUpperCase();
  const isClassTeacherRole = role === USER_ROLES.CLASS_TEACHER;

  const assignmentsQuery = useQuery({
    queryKey: ['teacherAssignments', user?.teacherId],
    queryFn: () => teacherService.getAssignments({teacherId: user?.teacherId}),
    enabled: Boolean(user?.teacherId)});

  const assignments = useMemo(() => {
    const items = assignmentsQuery.data || [];
    return isClassTeacherRole ? items.filter(item => item.isClassTeacher) : items;
  }, [assignmentsQuery.data, isClassTeacherRole]);

  const studentsQuery = useQuery({
    queryKey: [
      'teacherAssignedStudents',
      user?.teacherId,
      assignments.map(item => item.sectionId).join(','),
    ],
    queryFn: async () => {
      const rosters = await Promise.all(
        assignments.map(async assignment => {
          const students = await studentService.getStudentsBySection(assignment.sectionId);
          return students.map(student => ({
            ...student,
            assignmentSection: assignment.section}));
        }),
      );
      return rosters.flat();
    },
    enabled: Boolean(assignments.length)});

  const students = useMemo(() => studentsQuery.data || [], [studentsQuery.data]);
  const filteredStudents = useMemo(
    () =>
      students.filter(item =>
        `${item.fullName} ${item.studentId} ${item.academicClass?.name || ''} ${item.section?.name || ''}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, students],
  );

  const isLoading = assignmentsQuery.isLoading || studentsQuery.isLoading;
  const errorMsg = assignmentsQuery.error?.message || studentsQuery.error?.message;

  return (
    <View style={styles.root}>
      <FlatList
        data={filteredStudents}
        keyExtractor={item => `${item.sectionId}-${item.id}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ── Header ── */}
            <Animated.View
              style={styles.header}>
              <View style={styles.headerDecor} />
              <Text style={styles.headerOverline}>Teacher View</Text>
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Student Roster</Text>
                {students.length > 0 ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{students.length}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.headerSub}>
                {assignments.length
                  ? `${assignments.length} section${assignments.length !== 1 ? 's' : ''} assigned`
                  : 'Your assigned section roster'}
              </Text>
            </Animated.View>

            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name, ID, or class"
            />

            {filteredStudents.length > 0 && !isLoading ? (
              <Text style={styles.resultMeta}>
                {filteredStudents.length} student
                {filteredStudents.length !== 1 ? 's' : ''}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({item}) => (
          <StudentListItem
            student={{
              id: item.id,
              name: item.fullName,
              rollNo: item.studentId,
              section: `${
                item.academicClass?.name ||
                item.assignmentSection?.academicClass?.name ||
                ''
              }-${item.section?.name || item.assignmentSection?.name || ''}`}}
            checked
            status="info"
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <SkeletonLoader rows={5} />
          ) : (
            <EmptyState
              title="No students"
              message={errorMsg || 'No students in your assigned sections.'}
            />
          )
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingBottom: spacing.xxl},

  header: {
    backgroundColor: colors.secondary,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130},
  headerOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  headerRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 2},
  countBadgeText: {color: colors.white, fontSize: 12, fontWeight: '800'},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 4},

  resultMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'}});

export default StudentsListScreen;
