import React, {useMemo, useState} from 'react';
import {Pressable, SectionList, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, FilterTabs, SearchBar, SkeletonLoader} from '../../components';
import {USER_ROLES} from '../../config/constants';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, radius, shadows, spacing} from '../../theme';

const CLASS_ORDER = name => {
  if (!name || name === 'Unassigned') { return 999; }
  const lower = name.toLowerCase();
  if (lower === 'lkg') { return -2; }
  if (lower === 'ukg') { return -1; }
  const match = name.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 998;
};

const CLASS_COLORS = [
  colors.primary,
  '#7C3AED',
  '#059669',
  '#D97706',
  '#DC2626',
  '#0284C7',
  '#9333EA',
  '#16A34A',
  '#EA580C',
  '#0891B2',
  '#6D28D9',
  '#15803D',
];

const StudentManagementScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState(null);

  const studentsQuery = useQuery({
    queryKey: ['students', user?.branchId, user?.wing || 'ALL'],
    queryFn: () =>
      user?.role === USER_ROLES.COORDINATOR
        ? studentService.getStudentsByWing({branchId: user.branchId, wing: user.wing, limit: 9999, offset: 0}, scope)
        : studentService.getStudents({branchId: user.branchId, limit: 9999, offset: 0}, scope),
    enabled: Boolean(user?.branchId || user?.role === USER_ROLES.MAIN_ADMIN)});

  const students = useMemo(() => studentsQuery.data || [], [studentsQuery.data]);

  // Group all students by class
  const classGroups = useMemo(() => {
    const groups = {};
    students.forEach(student => {
      const className = student.academicClass?.name || 'Unassigned';
      const classId = student.academicClass?.id || 'unassigned';
      if (!groups[className]) {
        groups[className] = {classId, className, sections: {}, total: 0};
      }
      groups[className].total += 1;
      const sectionName = student.section?.name || '—';
      if (!groups[className].sections[sectionName]) {
        groups[className].sections[sectionName] = 0;
      }
      groups[className].sections[sectionName] += 1;
    });
    return Object.values(groups).sort(
      (a, b) => CLASS_ORDER(a.className) - CLASS_ORDER(b.className),
    );
  }, [students]);

  // Students filtered for the selected class view
  const classStudents = useMemo(() => {
    if (!selectedClass) { return []; }
    const filtered = students.filter(s => {
      const matchesClass = (s.academicClass?.name || 'Unassigned') === selectedClass;
      const matchesQuery = `${s.fullName} ${s.studentId} ${s.parent?.phoneNumber || ''}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const itemStatus = String(s.status || 'ACTIVE').toUpperCase();
      const matchesStatus = status === 'ALL' || itemStatus === status;
      return matchesClass && matchesQuery && matchesStatus;
    });

    // Group by section within the class
    const sections = {};
    filtered.forEach(s => {
      const sec = s.section?.name || 'No Section';
      if (!sections[sec]) { sections[sec] = []; }
      sections[sec].push(s);
    });
    return Object.entries(sections)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({title, data}));
  }, [selectedClass, students, query, status]);

  // ── Class list view ──────────────────────────────────────────────────────────

  if (!selectedClass) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <Animated.View style={styles.hero}>
          <View style={styles.heroDecor} />
          <Text style={styles.heroOverline}>Management</Text>
          <Text style={styles.heroTitle}>Students</Text>
          <Text style={styles.heroSub}>Admissions, profiles, status, and section transfers</Text>
          <Pressable
            onPress={() => navigation.navigate('AddStudent')}
            style={styles.heroBtn}>
            <MaterialCommunityIcons name="account-plus-outline" size={14} color={colors.primary} />
            <Text style={styles.heroBtnText}>Add Student</Text>
          </Pressable>
        </Animated.View>

        {/* Class count summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryNum}>{classGroups.length}</Text>
            <Text style={styles.summaryLabel}>Classes</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryNum}>{students.length}</Text>
            <Text style={styles.summaryLabel}>Total Students</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Select a Class</Text>

        {studentsQuery.isLoading ? (
          <SkeletonLoader rows={5} />
        ) : classGroups.length === 0 ? (
          <EmptyState title="No classes" message="No students have been added yet." />
        ) : (
          classGroups.map((group, index) => {
            const color = CLASS_COLORS[index % CLASS_COLORS.length];
            const sectionNames = Object.keys(group.sections).sort().join(', ');
            return (
              <Animated.View
                key={group.className}>
                <Pressable
                  onPress={() => {
                    setQuery('');
                    setStatus('ALL');
                    setSelectedClass(group.className);
                  }}
                  style={({pressed}) => [styles.classCard, pressed && {opacity: 0.88}]}>
                  <View style={[styles.classIcon, {backgroundColor: color + '18'}]}>
                    <Text style={[styles.classIconText, {color}]}>
                      {group.className}
                    </Text>
                  </View>
                  <View style={styles.classBody}>
                    <Text style={styles.className}>Class {group.className}</Text>
                    <Text style={styles.classMeta}>
                      Sections: {sectionNames || '—'}
                    </Text>
                  </View>
                  <View style={styles.classRight}>
                    <Text style={[styles.classCount, {color}]}>{group.total}</Text>
                    <Text style={styles.classCountLabel}>students</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSoft} />
                </Pressable>
              </Animated.View>
            );
          })
        )}

        {/* More Actions */}
        <View style={styles.actions}>
          <Text style={styles.actionsLabel}>More Actions</Text>
          <Pressable onPress={() => navigation.navigate('StudentSearch')} style={({pressed}) => [styles.actionRow, pressed && {opacity: 0.88}]}>
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="account-search-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.actionBody}>
              <Text style={styles.actionLabel}>Advanced Search</Text>
              <Text style={styles.actionSub}>Find by class, section, status</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSoft} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('BulkStudentImport')} style={({pressed}) => [styles.actionRow, pressed && {opacity: 0.88}]}>
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="file-upload-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.actionBody}>
              <Text style={styles.actionLabel}>Bulk Import</Text>
              <Text style={styles.actionSub}>Upload students via CSV</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSoft} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('TransferStudent')} style={({pressed}) => [styles.actionRow, pressed && {opacity: 0.88}]}>
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="swap-horizontal" size={18} color={colors.primary} />
            </View>
            <View style={styles.actionBody}>
              <Text style={styles.actionLabel}>Transfer Student</Text>
              <Text style={styles.actionSub}>Move between sections</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSoft} />
          </Pressable>
          <View style={{height: spacing.xxxl}} />
        </View>
      </ScrollView>
    );
  }

  // ── Students in selected class ────────────────────────────────────────────────

  const totalInClass = classStudents.reduce((sum, s) => sum + s.data.length, 0);

  return (
    <SectionList
      sections={classStudents}
      keyExtractor={item => item.id}
      style={styles.root}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <View>
          {/* Back to classes */}
          <Pressable
            onPress={() => {
              setSelectedClass(null);
              setQuery('');
              setStatus('ALL');
            }}
            style={styles.backRow}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={colors.primary} />
            <Text style={styles.backText}>All Classes</Text>
          </Pressable>

          {/* Class hero */}
          <Animated.View style={styles.classHero}>
            <View style={styles.heroDecor} />
            <Text style={styles.heroOverline}>Class</Text>
            <Text style={styles.heroTitle}>{selectedClass}</Text>
            <Text style={styles.heroSub}>{totalInClass} students enrolled</Text>
            <Pressable
              onPress={() => navigation.navigate('AddStudent')}
              style={styles.heroBtn}>
              <MaterialCommunityIcons name="account-plus-outline" size={14} color={colors.primary} />
              <Text style={styles.heroBtnText}>Add Student</Text>
            </Pressable>
          </Animated.View>

          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, admission no"
          />
          <FilterTabs
            tabs={[
              {label: 'All', value: 'ALL'},
              {label: 'Active', value: 'ACTIVE'},
              {label: 'Inactive', value: 'INACTIVE'},
            ]}
            value={status}
            onChange={setStatus}
          />
        </View>
      }
      renderSectionHeader={({section}) => (
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="door-open" size={13} color={colors.primary} />
          <Text style={styles.sectionHeaderTitle}>Section {section.title}</Text>
          <Text style={styles.sectionHeaderCount}>· {section.data.length}</Text>
        </View>
      )}
      ListEmptyComponent={
        <EmptyState title="No students" message="No students match your filter." />
      }
      renderItem={({item, index}) => (
        <Animated.View>
          <Pressable
            onPress={() => navigation.navigate('StudentDetails', {studentId: item.id})}
            style={({pressed}) => [styles.studentRow, pressed && {opacity: 0.88}]}>
            <View style={styles.studentAvatar}>
              <Text style={styles.studentAvatarText}>
                {(item.fullName || 'S').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.fullName}</Text>
              <Text style={styles.studentMeta}>
                {item.studentId || '—'}
              </Text>
            </View>
            <View style={[
              styles.statusPill,
              {backgroundColor: String(item.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? colors.successSoft : colors.dangerSoft},
            ]}>
              <Text style={[
                styles.statusText,
                {color: String(item.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? colors.success : colors.danger},
              ]}>
                {String(item.status || 'ACTIVE').toUpperCase()}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      )}
      ListFooterComponent={<View style={{height: spacing.xxxl}} />}
    />
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingTop: 0},

  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  classHero: {
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130},
  heroOverline: {color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase'},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginBottom: spacing.md, marginTop: 4},
  heroBtn: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    ...shadows.fab},
  heroBtnText: {color: colors.primary, fontSize: 12, fontWeight: '700'},

  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md},
  summaryChip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flex: 1,
    paddingVertical: spacing.md,
    ...shadows.clay},
  summaryNum: {color: colors.primary, fontSize: 20, fontWeight: '800'},
  summaryLabel: {color: colors.textMuted, fontSize: 11, fontWeight: '600', marginTop: 2},

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'},

  classCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.clay},
  classIcon: {
    alignItems: 'center',
    borderRadius: radius.card,
    height: 48,
    justifyContent: 'center',
    width: 48},
  classIconText: {fontSize: 13, fontWeight: '900'},
  classBody: {flex: 1},
  className: {color: colors.text, fontSize: 14, fontWeight: '700'},
  classMeta: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  classRight: {alignItems: 'center', marginRight: 4},
  classCount: {fontSize: 18, fontWeight: '800'},
  classCountLabel: {color: colors.textMuted, fontSize: 9, fontWeight: '600'},

  backRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.lg,
    marginBottom: spacing.sm},
  backText: {color: colors.primary, fontSize: 13, fontWeight: '700'},

  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: 2},
  sectionHeaderTitle: {color: colors.text, fontSize: 13, fontWeight: '800'},
  sectionHeaderCount: {color: colors.textMuted, fontSize: 12, fontWeight: '600'},

  studentRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.clay},
  studentAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42},
  studentAvatarText: {color: colors.primary, fontSize: 15, fontWeight: '800'},
  studentInfo: {flex: 1},
  studentName: {color: colors.text, fontSize: 14, fontWeight: '700'},
  studentMeta: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  statusPill: {borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3},
  statusText: {fontSize: 9, fontWeight: '800'},

  actions: {marginTop: spacing.md},
  actionsLabel: {color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: spacing.sm, textTransform: 'uppercase'},
  actionRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.clay},
  actionIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38},
  actionBody: {flex: 1},
  actionLabel: {color: colors.text, fontSize: 13, fontWeight: '700'},
  actionSub: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 1}});

export default StudentManagementScreen;
