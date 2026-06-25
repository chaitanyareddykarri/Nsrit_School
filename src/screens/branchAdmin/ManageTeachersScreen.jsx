import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {EmptyState, SearchBar, SelectField, SkeletonLoader} from '../../components';
import {STAFF_TYPE_LABELS} from '../../config/constants';
import {getAccessScope} from '../../services/rbacScope';
import teacherService from '../../services/teachers/teacherService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const allOption = label => ({label, value: 'ALL'});

const STATUS_TABS = [
  {label: 'All', value: 'ALL'},
  {label: 'Active', value: 'ACTIVE'},
  {label: 'Inactive', value: 'INACTIVE'},
];

const getInitials = name =>
  name
    ? name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    : '?';

const TeacherCard = ({teacher, index}) => {
  const name = teacher.fullName || teacher.user?.fullName || 'Teacher';
  const isActive = teacher.isActive !== false;
  const staffLabel =
    STAFF_TYPE_LABELS[teacher.staffType] || teacher.staffType || 'Staff';
  const subjects = (teacher.subjects || []).map(s => s.name).join(', ');
  const sections = (teacher.assignments || [])
    .map(
      a =>
        `${a.section?.academicClass?.name || '-'}-${a.section?.name || '-'}`,
    )
    .join(', ');

  return (
    <Animated.View>
      <View style={styles.teacherCard}>
        <View style={styles.cardTop}>
          <View
            style={[
              styles.teacherAvatar,
              {backgroundColor: isActive ? `${colors.purple}18` : colors.neutralSoft},
            ]}>
            <Text
              style={[
                styles.teacherAvatarText,
                {color: isActive ? colors.purple : colors.textMuted},
              ]}>
              {getInitials(name)}
            </Text>
          </View>
          <View style={styles.teacherInfo}>
            <Text style={styles.teacherName} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.metaRow}>
              {teacher.employeeId ? (
                <View style={styles.empBadge}>
                  <Text style={styles.empBadgeText}>
                    {teacher.employeeId}
                  </Text>
                </View>
              ) : null}
              <View
                style={[
                  styles.statusDot,
                  {backgroundColor: isActive ? colors.success : colors.danger},
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  {color: isActive ? colors.success : colors.danger},
                ]}>
                {isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardMeta}>
          {staffLabel ? (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="badge-account-outline"
                size={12}
                color={colors.purple}
              />
              <Text style={styles.metaText}>{staffLabel}</Text>
            </View>
          ) : null}
          {subjects ? (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="book-open-outline"
                size={12}
                color={colors.primary}
              />
              <Text style={styles.metaText} numberOfLines={1}>
                {subjects}
              </Text>
            </View>
          ) : null}
          {sections ? (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="google-classroom"
                size={12}
                color={colors.secondary}
              />
              <Text style={styles.metaText} numberOfLines={1}>
                {sections}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
};

const ManageTeachersScreen = () => {
  const user = useSelector(state => state.auth.user);
  const scope = useMemo(() => getAccessScope(user), [user]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [staffTypeFilter, setStaffTypeFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const teachersQuery = useQuery({
    queryKey: ['teachers', scope?.branchId, 'VIEW_ONLY'],
    queryFn: () => teacherService.getTeachersByBranch(scope.branchId, scope),
    enabled: Boolean(scope?.branchId)});

  const teachers = useMemo(() => teachersQuery.data || [], [teachersQuery.data]);

  const filterOptions = useMemo(() => {
    const subjects = new Map();
    const classes = new Map();
    const sections = new Map();
    const staffTypes = new Map();

    teachers.forEach(teacher => {
      if (teacher.staffType) {
        staffTypes.set(
          teacher.staffType,
          STAFF_TYPE_LABELS[teacher.staffType] || teacher.staffType,
        );
      }
      (teacher.subjects || []).forEach(subject => {
        if (subject?.id) {
          subjects.set(subject.id, subject.name || subject.code || 'Subject');
        }
      });
      (teacher.assignments || []).forEach(assignment => {
        const section = assignment.section;
        const academicClass = section?.academicClass;
        if (academicClass?.id) {
          classes.set(academicClass.id, academicClass.name || 'Class');
        }
        if (section?.id) {
          sections.set(
            section.id,
            `${academicClass?.name || '-'}-${section.name || '-'}`,
          );
        }
      });
    });

    const toOptions = map =>
      [...map.entries()]
        .sort((a, b) =>
          String(a[1]).localeCompare(String(b[1]), undefined, {numeric: true}),
        )
        .map(([value, label]) => ({label, value}));

    return {
      subjects: [allOption('All Subjects'), ...toOptions(subjects)],
      classes: [allOption('All Classes'), ...toOptions(classes)],
      sections: [allOption('All Sections'), ...toOptions(sections)],
      staffTypes: [allOption('All Staff Types'), ...toOptions(staffTypes)]};
  }, [teachers]);

  const filteredTeachers = useMemo(
    () =>
      teachers.filter(item => {
        const name = item.fullName || item.user?.fullName || '';
        const matchesQuery = `${name} ${item.employeeId || ''} ${item.phoneNumber || ''}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const itemStatus = item.isActive === false ? 'INACTIVE' : 'ACTIVE';
        const matchesStatus =
          statusFilter === 'ALL' || itemStatus === statusFilter;
        const matchesSubject =
          subjectFilter === 'ALL' ||
          (item.subjects || []).some(s => s.id === subjectFilter);
        const matchesClass =
          classFilter === 'ALL' ||
          (item.assignments || []).some(
            a => a.section?.academicClass?.id === classFilter,
          );
        const matchesSection =
          sectionFilter === 'ALL' ||
          (item.assignments || []).some(a => a.section?.id === sectionFilter);
        const matchesStaffType =
          staffTypeFilter === 'ALL' || item.staffType === staffTypeFilter;

        return (
          matchesQuery &&
          matchesStatus &&
          matchesSubject &&
          matchesClass &&
          matchesSection &&
          matchesStaffType
        );
      }),
    [
      classFilter,
      query,
      sectionFilter,
      staffTypeFilter,
      statusFilter,
      subjectFilter,
      teachers,
    ],
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={filteredTeachers}
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
                <Text style={styles.headerTitle}>Teachers</Text>
                {teachers.length > 0 ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{teachers.length}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.headerSub}>
                Principal and coordinators manage teacher changes.
              </Text>
            </Animated.View>

            {/* ── Search ── */}
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name, employee ID, mobile"
            />

            {/* ── Status tabs ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabRow}
              contentContainerStyle={styles.tabContent}>
              {STATUS_TABS.map(tab => (
                <Pressable
                  key={tab.value}
                  onPress={() => setStatusFilter(tab.value)}
                  style={[
                    styles.tabChip,
                    statusFilter === tab.value && styles.tabChipActive,
                  ]}>
                  <Text
                    style={[
                      styles.tabChipText,
                      statusFilter === tab.value && styles.tabChipTextActive,
                    ]}>
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* ── Advanced filters toggle ── */}
            <Pressable
              onPress={() => setShowFilters(f => !f)}
              style={styles.filterToggle}>
              <MaterialCommunityIcons
                name="tune-variant"
                size={14}
                color={colors.primary}
              />
              <Text style={styles.filterToggleText}>
                {showFilters ? 'Hide Filters' : 'Advanced Filters'}
              </Text>
              <MaterialCommunityIcons
                name={showFilters ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colors.primary}
              />
            </Pressable>

            {/* ── Advanced filters ── */}
            {showFilters ? (
              <Animated.View
                style={styles.filtersCard}>
                <SelectField
                  label="Filter By Subject"
                  value={subjectFilter}
                  options={filterOptions.subjects}
                  onChange={setSubjectFilter}
                />
                <SelectField
                  label="Filter By Class"
                  value={classFilter}
                  options={filterOptions.classes}
                  onChange={setClassFilter}
                />
                <SelectField
                  label="Filter By Section"
                  value={sectionFilter}
                  options={filterOptions.sections}
                  onChange={setSectionFilter}
                />
                <SelectField
                  label="Filter By Staff Type"
                  value={staffTypeFilter}
                  options={filterOptions.staffTypes}
                  onChange={setStaffTypeFilter}
                />
              </Animated.View>
            ) : null}

            {filteredTeachers.length > 0 && !teachersQuery.isLoading ? (
              <Text style={styles.rosterMeta}>
                {filteredTeachers.length} teacher
                {filteredTeachers.length !== 1 ? 's' : ''}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <TeacherCard teacher={item} index={Math.min(index, 15)} />
        )}
        refreshing={teachersQuery.isFetching}
        ListEmptyComponent={
          teachersQuery.isLoading ? (
            <SkeletonLoader rows={5} />
          ) : (
            <EmptyState
              title="No teachers"
              message={
                query.trim()
                  ? 'No results match your search.'
                  : 'Teacher records will appear here.'
              }
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

  // Header
  header: {
    backgroundColor: colors.purple,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
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
  headerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4},

  // Status tabs
  tabRow: {marginBottom: spacing.sm},
  tabContent: {gap: spacing.sm, paddingVertical: 2},
  tabChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs},
  tabChipActive: {backgroundColor: colors.purple, borderColor: colors.purple},
  tabChipText: {color: colors.textMuted, fontSize: 12, fontWeight: '700'},
  tabChipTextActive: {color: colors.white},

  // Advanced filters toggle
  filterToggle: {
    alignItems: 'center',
    backgroundColor: `${colors.primary}0F`,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm},
  filterToggleText: {color: colors.primary, fontSize: 12, fontWeight: '700'},
  filtersCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.clay},

  rosterMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'},

  // Teacher card
  teacherCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.clay},
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm},
  teacherAvatar: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42},
  teacherAvatarText: {fontSize: 13, fontWeight: '800'},
  teacherInfo: {flex: 1, minWidth: 0},
  teacherName: {...typography.bodyBold, color: colors.text},
  metaRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginTop: 3},
  empBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1},
  empBadgeText: {color: colors.primary, fontSize: 9, fontWeight: '800'},
  statusDot: {
    borderRadius: radius.pill,
    height: 6,
    width: 6},
  statusText: {fontSize: 11, fontWeight: '700'},

  cardMeta: {
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopColor: colors.borderLight,
    borderTopWidth: 1.5},
  metaItem: {alignItems: 'center', flexDirection: 'row', gap: 5},
  metaText: {color: colors.textMuted, flex: 1, fontSize: 11, fontWeight: '500'}});

export default ManageTeachersScreen;
