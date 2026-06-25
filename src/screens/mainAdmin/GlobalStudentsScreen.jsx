import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, SearchBar} from '../../components';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const PAGE_SIZE = 25;

const FilterChip = ({label, selected, onPress}) => (
  <Pressable
    onPress={onPress}
    style={[styles.chip, selected && styles.chipSelected]}>
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
      {label}
    </Text>
  </Pressable>
);

const StudentCard = ({item, index, onPress, onEdit, onAttendance, onFees}) => {
  const isPaid = item.feeStatus === 'PAID';
  return (
    <Animated.View>
      <Pressable
        onPress={onPress}
        style={({pressed}) => [styles.card, pressed && {opacity: 0.88}]}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.fullName
                ? item.fullName
                    .split(' ')
                    .slice(0, 2)
                    .map(w => w[0])
                    .join('')
                    .toUpperCase()
                : '?'}
            </Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName} numberOfLines={1}>{item.fullName}</Text>
            <Text style={styles.studentMeta} numberOfLines={1}>
              #{item.studentId} · {item.branchName}
            </Text>
          </View>
          <View style={[styles.feeBadge, {backgroundColor: isPaid ? colors.successSoft : colors.warningSoft}]}>
            <Text style={[styles.feeBadgeText, {color: isPaid ? colors.success : colors.warning}]}>
              {isPaid ? 'Paid' : 'Due'}
            </Text>
          </View>
        </View>

        {(item.className || item.attendancePercent !== undefined) ? (
          <View style={styles.detailRow}>
            {item.className ? (
              <View style={styles.detailPill}>
                <MaterialCommunityIcons name="google-classroom" size={10} color={colors.primary} />
                <Text style={styles.detailPillText}>
                  {item.className} {item.sectionName}
                </Text>
              </View>
            ) : null}
            {item.attendancePercent !== undefined ? (
              <View style={styles.detailPill}>
                <MaterialCommunityIcons name="calendar-check-outline" size={10} color={colors.secondary} />
                <Text style={styles.detailPillText}>{item.attendancePercent}% attendance</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {item.parentPhone ? (
          <View style={styles.phoneRow}>
            <MaterialCommunityIcons name="phone-outline" size={11} color={colors.textMuted} />
            <Text style={styles.phoneText}>{item.parentPhone}</Text>
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <Pressable onPress={onEdit} style={styles.actionBtn}>
            <MaterialCommunityIcons name="pencil-outline" size={12} color={colors.primary} />
            <Text style={styles.actionBtnText}>Edit</Text>
          </Pressable>
          <Pressable onPress={onAttendance} style={styles.actionBtn}>
            <MaterialCommunityIcons name="calendar-outline" size={12} color={colors.secondary} />
            <Text style={[styles.actionBtnText, {color: colors.secondary}]}>Attendance</Text>
          </Pressable>
          <Pressable onPress={onFees} style={styles.actionBtn}>
            <MaterialCommunityIcons name="cash-outline" size={12} color={colors.warning} />
            <Text style={[styles.actionBtnText, {color: colors.warning}]}>Fees</Text>
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const GlobalStudentsScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchText(searchText), 350);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    setPage(1);
  }, [filters, debouncedSearchText]);

  const studentsQuery = useQuery({
    queryKey: ['globalStudents', filters, debouncedSearchText, page],
    queryFn: () =>
      mainAdminService.getGlobalStudents({
        filters,
        searchText: debouncedSearchText,
        page,
        pageSize: PAGE_SIZE})});

  const branchesQuery = useQuery({
    queryKey: ['globalStudentBranches'],
    queryFn: () => mainAdminService.getAllBranches()});

  const classesQuery = useQuery({
    queryKey: ['globalStudentClasses'],
    queryFn: () => mainAdminService.getGlobalClasses()});

  const result = studentsQuery.data;

  const branches = useMemo(
    () => (branchesQuery.data || []).map(branch => [branch.id, branch.name]),
    [branchesQuery.data],
  );

  const classOptions = useMemo(() => {
    const scoped = (classesQuery.data || []).filter(
      item => !filters.branchId || item.branchId === filters.branchId,
    );
    return [...new Map(scoped.map(item => [item.classId, item.className])).entries()];
  }, [classesQuery.data, filters.branchId]);

  const sectionOptions = useMemo(() => {
    const scoped = (classesQuery.data || []).filter(
      item =>
        (!filters.branchId || item.branchId === filters.branchId) &&
        (!filters.classId || item.classId === filters.classId),
    );
    return scoped.map(item => [item.id, `${item.className}-${item.section}`]);
  }, [classesQuery.data, filters.branchId, filters.classId]);

  const setFilter = (key, value) =>
    setFilters(current => ({...current, [key]: current[key] === value ? null : value}));

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <FlatList
        data={result?.items || []}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={studentsQuery.isFetching}
            onRefresh={studentsQuery.refetch}
          />
        }
        ListHeaderComponent={
          <View>
            <Animated.View
              style={styles.header}>
              <View style={styles.headerDecor} />
              <Text style={styles.headerOverline}>Main Admin</Text>
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Global Students</Text>
                {result?.total ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{result.total}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.headerSub}>Students across every branch</Text>
            </Animated.View>

            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search name, admission no, parent phone"
            />

            {/* ── Status filters ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterRow}
              contentContainerStyle={styles.filterContent}>
              <FilterChip label="All" selected={!filters.status} onPress={() => setFilters(f => ({...f, status: null}))} />
              <FilterChip label="Active" selected={filters.status === 'ACTIVE'} onPress={() => setFilter('status', 'ACTIVE')} />
              <FilterChip label="Inactive" selected={filters.status === 'INACTIVE'} onPress={() => setFilter('status', 'INACTIVE')} />
              <FilterChip label="Male" selected={filters.gender === 'Male'} onPress={() => setFilter('gender', 'Male')} />
              <FilterChip label="Female" selected={filters.gender === 'Female'} onPress={() => setFilter('gender', 'Female')} />
            </ScrollView>

            {/* ── Branch filters ── */}
            {branches.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
                contentContainerStyle={styles.filterContent}>
                {branches.slice(0, 6).map(([branchId, branchName]) => (
                  <FilterChip
                    key={branchId}
                    label={branchName}
                    selected={filters.branchId === branchId}
                    onPress={() => setFilter('branchId', branchId)}
                  />
                ))}
              </ScrollView>
            ) : null}

            {/* ── Class filters ── */}
            {classOptions.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
                contentContainerStyle={styles.filterContent}>
                {classOptions.slice(0, 6).map(([classId, className]) => (
                  <FilterChip
                    key={classId}
                    label={className}
                    selected={filters.classId === classId}
                    onPress={() => {
                      setFilters(f => ({
                        ...f,
                        classId: f.classId === classId ? null : classId,
                        sectionId: null}));
                    }}
                  />
                ))}
              </ScrollView>
            ) : null}

            {/* ── Section filters ── */}
            {sectionOptions.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
                contentContainerStyle={styles.filterContent}>
                {sectionOptions.slice(0, 8).map(([sectionId, label]) => (
                  <FilterChip
                    key={sectionId}
                    label={label}
                    selected={filters.sectionId === sectionId}
                    onPress={() => setFilter('sectionId', sectionId)}
                  />
                ))}
              </ScrollView>
            ) : null}

            {studentsQuery.error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
                <Text style={styles.errorText}>{studentsQuery.error.message}</Text>
              </View>
            ) : null}

            {result?.items?.length > 0 ? (
              <Text style={styles.resultMeta}>
                Page {result.page || 1} · {result.total || 0} total students
              </Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <StudentCard
            item={item}
            index={Math.min(index, 15)}
            onPress={() =>
              navigation.navigate('GlobalStudentProfile', {studentId: item.id})
            }
            onEdit={() =>
              navigation.navigate('EditStudent', {studentId: item.id})
            }
            onAttendance={() =>
              navigation.navigate('ViewAllAttendance', {studentId: item.id})
            }
            onFees={() =>
              navigation.navigate('StudentFeeProfile', {studentId: item.id})
            }
          />
        )}
        ListEmptyComponent={
          studentsQuery.isLoading ? null : (
            <EmptyState
              title="No students"
              message="Adjust filters or search text."
            />
          )
        }
        ListFooterComponent={
          <View style={styles.pagination}>
            <Pressable
              disabled={!result?.hasPreviousPage}
              onPress={() => setPage(p => Math.max(1, p - 1))}
              style={[styles.pageBtn, !result?.hasPreviousPage && styles.pageBtnDisabled]}>
              <MaterialCommunityIcons name="chevron-left" size={16} color={result?.hasPreviousPage ? colors.primary : colors.textMuted} />
              <Text style={[styles.pageBtnText, !result?.hasPreviousPage && {color: colors.textMuted}]}>
                Prev
              </Text>
            </Pressable>
            <Text style={styles.pageText}>Page {result?.page || 1}</Text>
            <Pressable
              disabled={!result?.hasNextPage}
              onPress={() => setPage(p => p + 1)}
              style={[styles.pageBtn, !result?.hasNextPage && styles.pageBtnDisabled]}>
              <Text style={[styles.pageBtnText, !result?.hasNextPage && {color: colors.textMuted}]}>
                Next
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={result?.hasNextPage ? colors.primary : colors.textMuted} />
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

  header: {
    backgroundColor: colors.primaryDark,
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

  filterRow: {marginBottom: spacing.xs},
  filterContent: {gap: spacing.xs, paddingBottom: 4},
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs},
  chipSelected: {backgroundColor: colors.primary, borderColor: colors.primary},
  chipText: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},
  chipTextSelected: {color: colors.white, fontWeight: '700'},

  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm},
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},

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
    padding: spacing.md,
    ...shadows.clay},
  cardTop: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm},
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40},
  avatarText: {color: colors.primary, fontSize: 12, fontWeight: '800'},
  studentInfo: {flex: 1, minWidth: 0},
  studentName: {...typography.bodyBold, color: colors.text},
  studentMeta: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  feeBadge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2},
  feeBadgeText: {fontSize: 10, fontWeight: '800'},

  detailRow: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xs},
  detailPill: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2},
  detailPillText: {color: colors.textMuted, fontSize: 10, fontWeight: '600'},

  phoneRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.sm},
  phoneText: {color: colors.textMuted, fontSize: 11, fontWeight: '500'},

  actionRow: {
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm},
  actionBtn: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs},
  actionBtnText: {color: colors.primary, fontSize: 11, fontWeight: '700'},

  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg},
  pageBtn: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.clay},
  pageBtnDisabled: {opacity: 0.4},
  pageBtnText: {color: colors.primary, fontSize: 12, fontWeight: '700'},
  pageText: {color: colors.textMuted, fontSize: 12, fontWeight: '600'}});

export default GlobalStudentsScreen;
