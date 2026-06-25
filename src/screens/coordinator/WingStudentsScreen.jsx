import React, {useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {EmptyState, SearchBar, SkeletonLoader} from '../../components';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import BulkSectionAssignmentModal from '../students/BulkSectionAssignmentModal';
import UpdateStudentStatusModal from '../students/UpdateStudentStatusModal';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import academicYearService from '../../services/academicYear/academicYearService';

const getInitials = name =>
  name
    ? name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    : '?';

const StudentRow = ({item, index, selected, onToggle}) => {
  const isSelected = selected;
  return (
    <Animated.View>
      <Pressable
        onPress={() => onToggle(item.id)}
        style={[styles.studentRow, isSelected && styles.studentRowSelected]}>
        <View style={[styles.studentAvatar, isSelected && styles.studentAvatarSelected]}>
          <Text style={[styles.studentAvatarText, isSelected && {color: colors.white}]}>
            {getInitials(item.fullName)}
          </Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName} numberOfLines={1}>
            {item.fullName}
          </Text>
          <Text style={styles.studentMeta}>
            {item.academicClass?.name || '—'}–{item.section?.name || '—'} · #
            {item.studentId || '—'}
          </Text>
        </View>
        {isSelected ? (
          <MaterialCommunityIcons
            name="check-circle"
            size={20}
            color={colors.primary}
          />
        ) : (
          <MaterialCommunityIcons
            name="circle-outline"
            size={20}
            color={colors.border}
          />
        )}
      </Pressable>
    </Animated.View>
  );
};

const WingStudentsScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkVisible, setBulkVisible] = useState(false);
  const [statusStudent, setStatusStudent] = useState(null);
  const academicYear = academicYearService.getCurrentStartYear(user?.branchId);

  const studentsQuery = useQuery({
    queryKey: ['wingStudents', user?.branchId, user?.wing],
    queryFn: () =>
      studentService.getStudentsByWing(
        {branchId: user.branchId, wing: user.wing, limit: 9999},
        scope,
      ),
    enabled: Boolean(user?.branchId && user?.wing)});
  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () =>
      sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId)});

  const bulkMutation = useMutation({
    mutationFn: payload =>
      studentService.bulkAssignStudents(
        {...payload, branchId: user.branchId},
        scope,
      ),
    onSuccess: () => {
      setSelectedStudents([]);
      setBulkVisible(false);
      queryClient.invalidateQueries({
        queryKey: ['wingStudents', user?.branchId, user?.wing]});
    }});
  const statusMutation = useMutation({
    mutationFn: status =>
      studentService.updateStudentStatus(
        {studentId: statusStudent.id, status, branchId: user.branchId},
        scope,
      ),
    onSuccess: () => {
      setStatusStudent(null);
      queryClient.invalidateQueries({
        queryKey: ['wingStudents', user?.branchId, user?.wing]});
    }});

  const allStudents = studentsQuery.data || [];
  const sections = (sectionsQuery.data?.sections || []).filter(
    section => section.academicClass?.wing?.code === user?.wing,
  );

  const filteredStudents = allStudents.filter(item =>
    `${item.fullName} ${item.studentId} ${item.academicClass?.name || ''}-${item.section?.name || ''}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const toggleSelected = studentId =>
    setSelectedStudents(current =>
      current.includes(studentId)
        ? current.filter(id => id !== studentId)
        : [...current, studentId],
    );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <FlatList
        data={filteredStudents}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Animated.View
              style={styles.header}>
              <View style={styles.headerDecor} />
              <Text style={styles.headerOverline}>
                Coordinator · {user?.wing || 'Wing'}
              </Text>
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Wing Students</Text>
                {allStudents.length > 0 ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{allStudents.length}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.headerSub}>Students in your assigned wing</Text>
            </Animated.View>

            {/* ── Quick actions ── */}
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => navigation.navigate('AddStudent')}
                style={styles.actionBtn}>
                <MaterialCommunityIcons
                  name="account-plus-outline"
                  size={15}
                  color={colors.primary}
                />
                <Text style={styles.actionBtnText}>Add Student</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('TransferStudent')}
                style={styles.actionBtn}>
                <MaterialCommunityIcons
                  name="swap-horizontal"
                  size={15}
                  color={colors.primary}
                />
                <Text style={styles.actionBtnText}>Transfer</Text>
              </Pressable>
              {selectedStudents.length > 0 ? (
                <Pressable
                  onPress={() => setBulkVisible(true)}
                  style={[styles.actionBtn, styles.actionBtnActive]}>
                  <MaterialCommunityIcons
                    name="select-group"
                    size={15}
                    color={colors.white}
                  />
                  <Text style={[styles.actionBtnText, {color: colors.white}]}>
                    Bulk ({selectedStudents.length})
                  </Text>
                </Pressable>
              ) : null}
              {selectedStudents.length === 1 ? (
                <Pressable
                  onPress={() => {
                    const student = allStudents.find(
                      item => item.id === selectedStudents[0],
                    );
                    if (student) {
                      setStatusStudent(student);
                    }
                  }}
                  style={styles.actionBtn}>
                  <MaterialCommunityIcons
                    name="account-cancel-outline"
                    size={15}
                    color={colors.warning}
                  />
                  <Text style={[styles.actionBtnText, {color: colors.warning}]}>
                    Status
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search student, class, or section"
            />

            {filteredStudents.length > 0 ? (
              <Text style={styles.resultMeta}>
                {filteredStudents.length} student
                {filteredStudents.length !== 1 ? 's' : ''}
                {selectedStudents.length > 0
                  ? ` · ${selectedStudents.length} selected`
                  : ''}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <StudentRow
            item={item}
            index={Math.min(index, 15)}
            selected={selectedStudents.includes(item.id)}
            onToggle={toggleSelected}
          />
        )}
        ListEmptyComponent={
          studentsQuery.isLoading ? (
            <SkeletonLoader rows={5} />
          ) : (
            <EmptyState
              title="No students"
              message="Students in your assigned wing will appear here."
            />
          )
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />

      <BulkSectionAssignmentModal
        visible={bulkVisible}
        sections={sections}
        selectedStudentIds={selectedStudents}
        onDismiss={() => setBulkVisible(false)}
        onSubmit={payload => bulkMutation.mutate(payload)}
        loading={bulkMutation.isPending}
      />
      <UpdateStudentStatusModal
        visible={Boolean(statusStudent)}
        student={statusStudent}
        onDismiss={() => setStatusStudent(null)}
        onSubmit={status => statusMutation.mutate(status)}
        loading={statusMutation.isPending}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

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

  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md},
  actionBtn: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.clay},
  actionBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary},
  actionBtnText: {color: colors.primary, fontSize: 12, fontWeight: '700'},

  resultMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'},

  studentRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.clay},
  studentRowSelected: {
    borderColor: `${colors.primary}40`,
    borderWidth: 1.5},
  studentAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40},
  studentAvatarSelected: {backgroundColor: colors.primary},
  studentAvatarText: {color: colors.primary, fontSize: 12, fontWeight: '800'},
  studentInfo: {flex: 1, minWidth: 0},
  studentName: {...typography.bodyBold, color: colors.text},
  studentMeta: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2}});

export default WingStudentsScreen;
