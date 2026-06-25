import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {
  EmptyState,
  FilterTabs,
  SearchBar,
  SelectField,
  SkeletonLoader} from '../../components';
import {STAFF_TYPE_LABELS} from '../../config/constants';
import teacherService from '../../services/teachers/teacherService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const allOption = label => ({label, value: 'ALL'});

const getInitials = name =>
  name
    ? name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    : '?';

const TeacherCard = ({item, index, onPress}) => {
  const name = item.fullName || item.user?.fullName || 'Teacher';
  const subjects = (item.subjects || []).map(s => s.name).join(', ');
  const sections = (item.assignments || [])
    .map(a => `${a.section?.academicClass?.name || '-'}-${a.section?.name || '-'}`)
    .join(', ');
  const isActive = item.isActive !== false;

  return (
    <Animated.View>
      <Pressable
        onPress={onPress}
        style={({pressed}) => [styles.card, pressed && {opacity: 0.88}]}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.teacherName} numberOfLines={1}>{name}</Text>
            <View style={styles.metaRow}>
              {item.employeeId ? (
                <View style={styles.empBadge}>
                  <Text style={styles.empBadgeText}>{item.employeeId}</Text>
                </View>
              ) : null}
              {item.staffType ? (
                <Text style={styles.staffType}>
                  {STAFF_TYPE_LABELS[item.staffType] || item.staffType}
                </Text>
              ) : null}
              <View style={[styles.statusDot, {backgroundColor: isActive ? colors.success : colors.danger}]} />
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textMuted} />
        </View>

        {(subjects || sections) ? (
          <View style={styles.cardFooter}>
            {subjects ? (
              <View style={styles.footerRow}>
                <MaterialCommunityIcons name="book-open-outline" size={11} color={colors.secondary} />
                <Text style={styles.footerText} numberOfLines={1}>{subjects}</Text>
              </View>
            ) : null}
            {sections ? (
              <View style={styles.footerRow}>
                <MaterialCommunityIcons name="google-classroom" size={11} color={colors.textMuted} />
                <Text style={styles.footerText} numberOfLines={1}>{sections}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
};

const TeacherManagementScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [staffTypeFilter, setStaffTypeFilter] = useState('ALL');

  const {data = [], isLoading} = useQuery({
    queryKey: ['teachers', user?.branchId, 0],
    queryFn: () =>
      teacherService.getTeachers({branchId: user.branchId, limit: 9999, offset: 0}, scope),
    enabled: Boolean(user?.branchId)});

  const teachers = useMemo(() => data, [data]);

  const filterOptions = useMemo(() => {
    const subjects = new Map();
    const classes = new Map();
    const sections = new Map();
    const staffTypes = new Map();
    teachers.forEach(teacher => {
      if (teacher.staffType) {
        staffTypes.set(teacher.staffType, STAFF_TYPE_LABELS[teacher.staffType] || teacher.staffType);
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
          sections.set(section.id, `${academicClass?.name || '-'}-${section.name || '-'}`);
        }
      });
    });
    const toOptions = map =>
      [...map.entries()]
        .sort((a, b) => String(a[1]).localeCompare(String(b[1]), undefined, {numeric: true}))
        .map(([value, label]) => ({label, value}));
    return {
      subjects: [allOption('All Subjects'), ...toOptions(subjects)],
      classes: [allOption('All Classes'), ...toOptions(classes)],
      sections: [allOption('All Sections'), ...toOptions(sections)],
      staffTypes: [allOption('All Staff Types'), ...toOptions(staffTypes)]};
  }, [teachers]);

  const filtered = useMemo(
    () =>
      teachers.filter(item => {
        const name = item.fullName || item.user?.fullName || '';
        const matchesQuery = `${name} ${item.employeeId || ''} ${item.phoneNumber || ''}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const itemStatus = item.isActive === false ? 'INACTIVE' : 'ACTIVE';
        const matchesStatus = status === 'ALL' || itemStatus === status;
        const matchesSubject =
          subjectFilter === 'ALL' ||
          (item.subjects || []).some(s => s.id === subjectFilter);
        const matchesClass =
          classFilter === 'ALL' ||
          (item.assignments || []).some(a => a.section?.academicClass?.id === classFilter);
        const matchesSection =
          sectionFilter === 'ALL' ||
          (item.assignments || []).some(a => a.section?.id === sectionFilter);
        const matchesStaffType = staffTypeFilter === 'ALL' || item.staffType === staffTypeFilter;
        return matchesQuery && matchesStatus && matchesSubject && matchesClass && matchesSection && matchesStaffType;
      }),
    [classFilter, query, sectionFilter, staffTypeFilter, status, subjectFilter, teachers],
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Animated.View
              style={styles.header}>
              <View style={styles.headerDecor} />
              <Text style={styles.headerOverline}>Staff Management</Text>
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Teachers</Text>
                {filtered.length > 0 ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{filtered.length}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.headerSub}>Staff profiles, subjects, and class assignments</Text>
              <Pressable
                onPress={() => navigation.navigate('CreateTeacher')}
                style={styles.headerCta}>
                <MaterialCommunityIcons name="plus" size={14} color={colors.secondary} />
                <Text style={styles.headerCtaText}>Add Teacher</Text>
              </Pressable>
            </Animated.View>

            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search teachers, employee ID, mobile"
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
            <SelectField label="Filter By Subject" value={subjectFilter} options={filterOptions.subjects} onChange={setSubjectFilter} />
            <SelectField label="Filter By Class" value={classFilter} options={filterOptions.classes} onChange={setClassFilter} />
            <SelectField label="Filter By Section" value={sectionFilter} options={filterOptions.sections} onChange={setSectionFilter} />
            <SelectField label="Filter By Staff Type" value={staffTypeFilter} options={filterOptions.staffTypes} onChange={setStaffTypeFilter} />

            {filtered.length > 0 ? (
              <Text style={styles.resultMeta}>
                {filtered.length} of {teachers.length} teachers
              </Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <TeacherCard
            item={item}
            index={Math.min(index, 15)}
            onPress={() => navigation.navigate('TeacherDetails', {teacherId: item.id})}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <SkeletonLoader rows={4} />
          ) : (
            <EmptyState
              title="No teachers"
              message="Teacher records created from Firebase Auth and Data Connect will appear here."
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
  headerCta: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm},
  headerCtaText: {color: colors.secondary, fontSize: 12, fontWeight: '700'},

  resultMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'},

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    padding: spacing.md,
    ...shadows.clay},
  cardTop: {alignItems: 'center', flexDirection: 'row', gap: spacing.md},
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44},
  avatarText: {color: colors.secondary, fontSize: 13, fontWeight: '800'},
  info: {flex: 1, minWidth: 0},
  teacherName: {...typography.bodyBold, color: colors.text},
  metaRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.xs, marginTop: 3},
  empBadge: {
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1},
  empBadgeText: {color: colors.secondary, fontSize: 9, fontWeight: '800'},
  staffType: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},
  statusDot: {borderRadius: radius.pill, height: 6, width: 6},
  cardFooter: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: 3,
    marginTop: spacing.sm,
    paddingTop: spacing.sm},
  footerRow: {alignItems: 'center', flexDirection: 'row', gap: 4},
  footerText: {color: colors.textMuted, flex: 1, fontSize: 11, fontWeight: '500'}});

export default TeacherManagementScreen;
