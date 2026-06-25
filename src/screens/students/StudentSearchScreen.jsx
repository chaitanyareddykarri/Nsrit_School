import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, SearchBar, SelectField} from '../../components';
import {STUDENT_STATUS} from '../../config/academic';
import academicRepository from '../../repositories/academicRepository';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import academicYearService from '../../services/academicYear/academicYearService';

const statusOptions = [{label: 'Any', value: ''}].concat(
  Object.values(STUDENT_STATUS).map(value => ({label: value, value})),
);

const getInitials = name =>
  name
    ? name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    : '?';

const StudentCard = ({item, index, onPress}) => (
  <Animated.View>
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.studentCard, pressed && {opacity: 0.88}]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.fullName)}</Text>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName} numberOfLines={1}>{item.fullName}</Text>
        <Text style={styles.studentMeta}>
          #{item.studentId} · {item.academicClass?.name || '—'}–{item.section?.name || '—'}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textMuted} />
    </Pressable>
  </Animated.View>
);

const StudentSearchScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const academicYear = academicYearService.getCurrentStartYear(user?.branchId);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({classId: '', sectionId: '', status: ''});
  const [submittedQuery, setSubmittedQuery] = useState('');

  const classesQuery = useQuery({
    queryKey: ['academicClasses', user?.branchId],
    queryFn: () => academicRepository.getAcademicClasses()});
  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () => sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId)});
  const resultsQuery = useQuery({
    queryKey: ['studentSearch', user?.branchId, submittedQuery, filters],
    queryFn: () =>
      studentService.searchStudents(
        {
          branchId: user.branchId,
          searchText: submittedQuery,
          classId: filters.classId,
          sectionId: filters.sectionId,
          status: filters.status},
        scope,
      ),
    enabled: Boolean(user?.branchId && submittedQuery)});

  const classes = useMemo(
    () =>
      (classesQuery.data || []).filter(
        item =>
          item.branchId === user?.branchId &&
          (!user?.wing || user?.role !== 'COORDINATOR' || item.wing?.code === user.wing),
      ),
    [classesQuery.data, user?.branchId, user?.role, user?.wing],
  );
  const sections = useMemo(
    () =>
      (sectionsQuery.data?.sections || []).filter(
        section => !filters.classId || section.academicClassId === filters.classId,
      ),
    [sectionsQuery.data?.sections, filters.classId],
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={resultsQuery.data || []}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Animated.View style={styles.filterCard}>
              <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder="Name, admission number, or parent mobile"
              />
              <SelectField
                label="Class"
                value={filters.classId}
                options={[{label: 'Any', value: ''}].concat(classes.map(item => ({label: item.name, value: item.id})))}
                onChange={value => setFilters(current => ({...current, classId: value, sectionId: ''}))}
              />
              <SelectField
                label="Section"
                value={filters.sectionId}
                options={[{label: 'Any', value: ''}].concat(
                  sections.map(item => ({
                    label: `${item.academicClass?.name}-${item.name}`,
                    value: item.id})),
                )}
                onChange={value => setFilters(current => ({...current, sectionId: value}))}
              />
              <SelectField
                label="Status"
                value={filters.status}
                options={statusOptions}
                onChange={value => setFilters(current => ({...current, status: value}))}
              />
              <Pressable
                onPress={() => setSubmittedQuery(query.trim())}
                style={({pressed}) => [styles.searchBtn, pressed && {opacity: 0.88}]}>
                <MaterialCommunityIcons name="magnify" size={17} color={colors.white} />
                <Text style={styles.searchBtnText}>Search</Text>
              </Pressable>
            </Animated.View>
            {(resultsQuery.data?.length || 0) > 0 ? (
              <Text style={styles.resultsLabel}>
                {resultsQuery.data.length} result{resultsQuery.data.length !== 1 ? 's' : ''}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <StudentCard
            item={item}
            index={index}
            onPress={() => navigation.navigate('StudentDetails', {studentId: item.id})}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No results"
            message={
              submittedQuery
                ? 'Try another search or filter.'
                : 'Search students by name, admission number, or parent mobile.'
            }
          />
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

  filterCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.clay},
  searchBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 46,
    justifyContent: 'center',
    marginTop: spacing.xs,
    ...shadows.fab},
  searchBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'},
  resultsLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'},

  studentCard: {
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
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40},
  avatarText: {color: colors.primary, fontSize: 13, fontWeight: '800'},
  studentInfo: {flex: 1, minWidth: 0},
  studentName: {...typography.bodyBold, color: colors.text},
  studentMeta: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2}});

export default StudentSearchScreen;
