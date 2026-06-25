import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {EmptyState, SearchBar} from '../../components';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const FilterChip = ({label, selected, onPress}) => (
  <Pressable
    onPress={onPress}
    style={[styles.filterChip, selected && styles.filterChipSelected]}>
    <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>{label}</Text>
  </Pressable>
);

const MetricCell = ({label, value}) => (
  <View style={styles.metricCell}>
    <Text style={styles.metricCellValue} numberOfLines={1}>{value ?? 0}</Text>
    <Text style={styles.metricCellLabel}>{label}</Text>
  </View>
);

const ClassCard = ({item, index, onPress}) => (
  <Animated.View>
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.classCard, pressed && {opacity: 0.88}]}>
      <View style={styles.classCardTop}>
        <View style={styles.classTitleWrap}>
          <Text style={styles.classTitle}>{item.className} {item.section}</Text>
          <Text style={styles.classBranch}>{item.branchName}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textMuted} />
      </View>
      <View style={styles.metricsRow}>
        <MetricCell label="Teacher" value={item.classTeacher || '—'} />
        <MetricCell label="Students" value={item.totalStudents} />
        <MetricCell label="Attendance" value={`${item.attendancePercent || 0}%`} />
        <MetricCell label="Fees" value={`${item.feeCollectionPercent || 0}%`} />
      </View>
    </Pressable>
  </Animated.View>
);

const GlobalClassesScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({});
  const {data, loading, refreshing, error, refresh} = useAsyncResource(
    options => mainAdminService.getGlobalClasses({...options}),
    [],
  );

  const branches = useMemo(
    () => [...new Map((data || []).map(item => [item.branchId, item.branchName])).entries()],
    [data],
  );
  const grades = useMemo(() => [...new Set((data || []).map(item => item.className))], [data]);
  const sections = useMemo(() => [...new Set((data || []).map(item => item.section))], [data]);

  const classes = useMemo(
    () =>
      (data || []).filter(item => {
        const matchesFilters =
          (!filters.branchId || item.branchId === filters.branchId) &&
          (!filters.grade || item.className === filters.grade) &&
          (!filters.section || item.section === filters.section);
        const needle = searchText.trim().toLowerCase();
        const matchesSearch =
          !needle ||
          [item.branchName, item.className, item.section, item.classTeacher].some(value =>
            String(value || '').toLowerCase().includes(needle),
          );
        return matchesFilters && matchesSearch;
      }),
    [data, filters, searchText],
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <FlatList
        data={classes}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListHeaderComponent={
          <View>
            <Animated.View style={styles.hero}>
              <View style={styles.heroDecor} />
              <Text style={styles.heroOverline}>Main Admin</Text>
              <View style={styles.heroRow}>
                <Text style={styles.heroTitle}>Global Classes</Text>
                {classes.length > 0 ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{classes.length}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.heroSub}>Classes across all active branches</Text>
            </Animated.View>

            <View style={styles.searchWrap}>
              <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search classes" />
            </View>

            {/* Branch filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow} contentContainerStyle={styles.filtersContent}>
              <FilterChip label="All Branches" selected={!filters.branchId} onPress={() => setFilters(f => ({...f, branchId: null}))} />
              {branches.slice(0, 8).map(([id, name]) => (
                <FilterChip
                  key={id}
                  label={name}
                  selected={filters.branchId === id}
                  onPress={() => setFilters(f => ({...f, branchId: f.branchId === id ? null : id}))}
                />
              ))}
            </ScrollView>

            {/* Grade filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow} contentContainerStyle={styles.filtersContent}>
              <FilterChip label="All Grades" selected={!filters.grade} onPress={() => setFilters(f => ({...f, grade: null}))} />
              {grades.slice(0, 14).map(grade => (
                <FilterChip
                  key={grade}
                  label={grade}
                  selected={filters.grade === grade}
                  onPress={() => setFilters(f => ({...f, grade: f.grade === grade ? null : grade}))}
                />
              ))}
            </ScrollView>

            {error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <ClassCard
            item={item}
            index={index}
            onPress={() => navigation.navigate('ClassDetails', {sectionId: item.id})}
          />
        )}
        ListEmptyComponent={
          loading && !data ? null : (
            <EmptyState title="No classes" message="Adjust filters or add classes." />
          )
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

  hero: {
    backgroundColor: colors.primaryDark,
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
  heroRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  countBadge: {backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 2},
  countBadgeText: {color: colors.white, fontSize: 12, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 4},

  searchWrap: {marginBottom: spacing.sm},
  filtersRow: {marginBottom: spacing.sm},
  filtersContent: {gap: spacing.xs, paddingVertical: 2},
  filterChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs},
  filterChipSelected: {backgroundColor: colors.primaryDark, borderColor: colors.primaryDark},
  filterChipText: {color: colors.text, fontSize: 12, fontWeight: '600'},
  filterChipTextSelected: {color: colors.white},

  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm},
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},

  classCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.clay},
  classCardTop: {alignItems: 'center', flexDirection: 'row', marginBottom: spacing.md},
  classTitleWrap: {flex: 1},
  classTitle: {...typography.bodyBold, color: colors.text, fontSize: 15},
  classBranch: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  metricsRow: {borderTopColor: colors.borderLight, borderTopWidth: 1, flexDirection: 'row', paddingTop: spacing.sm},
  metricCell: {alignItems: 'center', flex: 1},
  metricCellValue: {color: colors.primaryDark, fontSize: 13, fontWeight: '700'},
  metricCellLabel: {color: colors.textMuted, fontSize: 9, fontWeight: '700', marginTop: 1, textTransform: 'uppercase'}});

export default GlobalClassesScreen;
