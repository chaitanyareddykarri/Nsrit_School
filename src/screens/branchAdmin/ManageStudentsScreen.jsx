import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {EmptyState, FloatingActionButton, SearchBar, SkeletonLoader} from '../../components';
import {getAccessScope} from '../../services/rbacScope';
import studentService from '../../services/students/studentService';
import {fetchStudentsForRole} from '../../store/slices/studentSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const FILTERS = ['All', 'Active', 'Inactive'];

const getInitials = name =>
  name
    ? name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    : '?';

const statusColor = status => {
  if (!status || status === 'ACTIVE') {return colors.success;}
  if (status === 'INACTIVE') {return colors.danger;}
  return colors.warning;
};

const StudentRow = ({student, onPress, delay = 0}) => {
  const accentColor = statusColor(student.status);
  return (
    <Animated.View>
      <Pressable onPress={onPress} style={styles.studentRow}>
        <View style={[styles.studentAvatar, {backgroundColor: `${colors.primary}18`}]}>
          <Text style={styles.studentAvatarText}>{getInitials(student.fullName)}</Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName} numberOfLines={1}>
            {student.fullName}
          </Text>
          <Text style={styles.studentMeta}>
            {student.studentId} · {student.academicClass?.name || '-'}-
            {student.section?.name || '-'}
          </Text>
        </View>
        <View style={[styles.statusDot, {backgroundColor: accentColor}]} />
        <MaterialCommunityIcons
          name="chevron-right"
          size={16}
          color={colors.textSoft}
        />
      </Pressable>
    </Animated.View>
  );
};

const ManageStudentsScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const {items, loading} = useSelector(state => state.students);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filter, setFilter] = useState('All');
  const scope = useMemo(() => getAccessScope(user), [user]);

  useEffect(() => {
    dispatch(fetchStudentsForRole(scope));
  }, [dispatch, scope]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        const results = await studentService.searchStudents(
          {branchId: scope.branchId, searchText: query},
          scope,
        );
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, scope]);

  const baseData = query.trim() ? searchResults : items;

  const filteredData = useMemo(() => {
    if (filter === 'All') {return baseData;}
    const status = filter === 'Active' ? 'ACTIVE' : 'INACTIVE';
    return baseData.filter(
      s => (s.status || 'ACTIVE').toUpperCase() === status,
    );
  }, [baseData, filter]);

  return (
    <View style={styles.root}>
      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ── Header ── */}
            <Animated.View
              style={styles.header}>
              <View style={styles.headerDecor} />
              <Text style={styles.headerOverline}>Branch Management</Text>
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Students</Text>
                {items.length > 0 ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{items.length}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.headerSub}>
                Search by name, student ID, or parent phone
              </Text>
            </Animated.View>

            {/* ── Search ── */}
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search students"
            />

            {/* ── Filter chips ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterRow}
              contentContainerStyle={styles.filterContent}>
              {FILTERS.map(f => (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[styles.filterChip, filter === f && styles.filterChipActive]}>
                  <Text
                    style={[
                      styles.filterChipText,
                      filter === f && styles.filterChipTextActive,
                    ]}>
                    {f}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {filteredData.length > 0 && !loading ? (
              <Text style={styles.rosterMeta}>
                {filteredData.length} student{filteredData.length !== 1 ? 's' : ''}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <StudentRow
            student={item}
            onPress={() =>
              navigation.navigate('StudentProfile', {studentId: item.id})
            }
            delay={Math.min(index * 25, 300)}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <SkeletonLoader rows={5} />
          ) : (
            <EmptyState
              title="No students"
              message={
                query.trim()
                  ? 'No results match your search query.'
                  : 'Create or upload students to see them here.'
              }
              actionLabel={query.trim() ? undefined : 'Add Student'}
              onAction={
                query.trim()
                  ? undefined
                  : () => navigation.navigate('CreateStudent')
              }
            />
          )
        }
        ListFooterComponent={<View style={{height: spacing.xxxl + spacing.xl}} />}
      />

      <FloatingActionButton
        icon="account-plus"
        label="Add Student"
        onPress={() => navigation.navigate('CreateStudent')}
        extended
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingBottom: spacing.xxl},

  // Header
  header: {
    backgroundColor: colors.primary,
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

  // Filters
  filterRow: {marginBottom: spacing.md},
  filterContent: {gap: spacing.sm, paddingVertical: 2},
  filterChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs},
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary},
  filterChipText: {color: colors.textMuted, fontSize: 12, fontWeight: '700'},
  filterChipTextActive: {color: colors.white},

  rosterMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'},

  // Student row
  studentRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.clay},
  studentAvatar: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42},
  studentAvatarText: {color: colors.primary, fontSize: 13, fontWeight: '800'},
  studentInfo: {flex: 1, minWidth: 0},
  studentName: {...typography.bodyBold, color: colors.text},
  studentMeta: {...typography.caption, color: colors.textMuted, marginTop: 2},
  statusDot: {
    borderRadius: radius.pill,
    height: 8,
    width: 8}});

export default ManageStudentsScreen;
