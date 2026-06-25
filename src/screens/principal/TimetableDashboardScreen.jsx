import React, {useState, useMemo} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, FloatingActionButton, UserMenuDrawer} from '../../components';
import timetableService, {getTimetableStatus} from '../../services/timetable/timetableService';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import {USER_ROLES, TIMETABLE_STATUS} from '../../config/constants';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import academicRepository from '../../repositories/academicRepository';

const FILTER_TABS = ['All', 'Published', 'Draft', 'Empty'];

const normalizeRole = r => String(r || '').toUpperCase();

const StatusBadge = ({status}) => {
  const config = {
    [TIMETABLE_STATUS.PUBLISHED]: {color: colors.success, icon: 'check-circle', label: 'Published'},
    [TIMETABLE_STATUS.DRAFT]: {color: colors.warning, icon: 'pencil-circle', label: 'Draft'},
    EMPTY: {color: colors.textSoft, icon: 'circle-outline', label: 'No Data'}};
  const c = config[status] || config.EMPTY;
  return (
    <View style={[styles.statusBadge, {backgroundColor: `${c.color}18`, borderColor: `${c.color}40`}]}>
      <MaterialCommunityIcons name={c.icon} size={11} color={c.color} />
      <Text style={[styles.statusBadgeText, {color: c.color}]}>{c.label}</Text>
    </View>
  );
};

const SectionRow = ({section, onEdit, index}) => {
  const {status, filledCount, totalSlots} = section.timetableStatus;
  const pct = totalSlots > 0 ? Math.round((filledCount / totalSlots) * 100) : 0;
  return (
    <Animated.View style={styles.sectionRow}>
      <View style={styles.sectionInfo}>
        <Text style={styles.sectionLabel}>
          {section.className} — Section {section.sectionName}
        </Text>
        <View style={styles.sectionMeta}>
          <StatusBadge status={status} />
          {status !== 'EMPTY' ? (
            <Text style={styles.sectionFill}>{filledCount}/{totalSlots} periods</Text>
          ) : null}
        </View>
      </View>
      {status !== 'EMPTY' && totalSlots > 0 ? (
        <View style={styles.progressBarWrap}>
          <View style={[styles.progressBar, {width: `${pct}%`, backgroundColor: status === TIMETABLE_STATUS.PUBLISHED ? colors.success : colors.warning}]} />
        </View>
      ) : null}
      <Pressable
        style={({pressed}) => [styles.editBtn, pressed && {opacity: 0.75}]}
        onPress={() => onEdit(section)}>
        <MaterialCommunityIcons name="pencil-outline" size={14} color={colors.primary} />
        <Text style={styles.editBtnText}>Edit</Text>
      </Pressable>
    </Animated.View>
  );
};

const ClassGroup = ({className, sections, onEdit, groupIndex}) => (
  <Animated.View style={styles.classGroup}>
    <View style={styles.classGroupHeader}>
      <MaterialCommunityIcons name="school-outline" size={15} color={colors.primary} />
      <Text style={styles.classGroupTitle}>{className}</Text>
      <View style={styles.sectionCountBadge}>
        <Text style={styles.sectionCountText}>{sections.length}</Text>
      </View>
    </View>
    {sections.map((sec, i) => (
      <SectionRow key={sec.sectionId} section={sec} onEdit={onEdit} index={i} />
    ))}
  </Animated.View>
);

const TimetableDashboardScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const role = useSelector(state => state.auth.role);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const branchId = user?.branchId;
  const wingId = user?.wingId;
  const [activeFilter, setActiveFilter] = useState('All');
  const [menuOpen, setMenuOpen] = useState(false);

  const isCoordinator = normalizeRole(role) === USER_ROLES.COORDINATOR;
  const academicYear = activeAcademicYear?.startYear;

  // Fetch timetable data (principal → branch, coordinator → wing)
  const {data: timetableSections = [], isLoading: loadingTimetable, refetch: refetchTimetable} = useQuery({
    queryKey: isCoordinator
      ? ['timetablesForWing', branchId, wingId]
      : ['timetablesForBranch', branchId],
    queryFn: () => isCoordinator
      ? timetableService.getTimetablesForWing(branchId, wingId)
      : timetableService.getTimetablesForBranch(branchId),
    enabled: Boolean(branchId)});

  // Fetch all sections to catch ones with no timetable yet
  const {data: allSectionsData, isLoading: loadingSections, refetch: refetchSections} = useQuery({
    queryKey: ['sections', branchId, academicYear],
    queryFn: () => academicRepository.getSections({branchId, academicYear}),
    enabled: Boolean(branchId)});

  const isLoading = loadingTimetable || loadingSections;

  const handleRefresh = () => {
    refetchTimetable();
    refetchSections();
  };

  // Build merged section list: timetable sections + sections without timetable
  const mergedSections = useMemo(() => {
    const timetableMap = {};
    timetableSections.forEach(tt => {
      timetableMap[tt.sectionId] = tt;
    });

    const allSections = allSectionsData?.sections || [];
    const result = [];

    allSections.forEach(sec => {
      if (isCoordinator && wingId && sec.wingId && sec.wingId !== wingId) {return;}
      const tt = timetableMap[sec.id];
      const periods = tt?.periods || [];
      const timetableStatus = getTimetableStatus(periods);
      result.push({
        sectionId: sec.id,
        className: sec.academicClass?.name || sec.className || '',
        sectionName: sec.name || sec.sectionName || '',
        wingId: sec.wingId || '',
        periods,
        timetableStatus});
    });

    // Also include sections that appear in timetable data but not in allSections (edge case)
    timetableSections.forEach(tt => {
      if (!result.find(r => r.sectionId === tt.sectionId)) {
        result.push({
          sectionId: tt.sectionId,
          className: tt.className,
          sectionName: tt.sectionName,
          wingId: tt.wingId || '',
          periods: tt.periods,
          timetableStatus: getTimetableStatus(tt.periods)});
      }
    });

    return result;
  }, [timetableSections, allSectionsData, isCoordinator, wingId]);

  // Filter
  const filteredSections = useMemo(() => {
    if (activeFilter === 'All') {return mergedSections;}
    return mergedSections.filter(s => {
      const st = s.timetableStatus.status;
      if (activeFilter === 'Published') {return st === TIMETABLE_STATUS.PUBLISHED;}
      if (activeFilter === 'Draft') {return st === TIMETABLE_STATUS.DRAFT;}
      if (activeFilter === 'Empty') {return st === 'EMPTY';}
      return true;
    });
  }, [mergedSections, activeFilter]);

  // Group by class name
  const classGroups = useMemo(() => {
    const map = {};
    filteredSections.forEach(sec => {
      if (!map[sec.className]) {map[sec.className] = [];}
      map[sec.className].push(sec);
    });
    return Object.entries(map).map(([className, sections]) => ({className, sections}));
  }, [filteredSections]);

  // Stats
  const totalSections = mergedSections.length;
  const publishedCount = mergedSections.filter(s => s.timetableStatus.status === TIMETABLE_STATUS.PUBLISHED).length;
  const draftCount = mergedSections.filter(s => s.timetableStatus.status === TIMETABLE_STATUS.DRAFT).length;

  const handleEditSection = section => {
    navigation.navigate('TimetableEditor', {
      sectionId: section.sectionId,
      sectionName: section.sectionName,
      className: section.className,
      branchId});
  };

  const renderGroup = ({item, index}) => (
    <ClassGroup
      className={item.className}
      sections={item.sections}
      onEdit={handleEditSection}
      groupIndex={index}
    />
  );

  return (
    <View style={styles.root}>
      <UserMenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navigation={navigation}
      />

      <FlatList
        data={classGroups}
        keyExtractor={item => item.className}
        renderItem={renderGroup}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
        ListHeaderComponent={
          <View>
            {/* Hero header */}
            <Animated.View style={styles.hero}>
              <View style={styles.heroDecor} />
              <View style={styles.heroRow}>
                <Pressable style={styles.menuBtn} onPress={() => setMenuOpen(true)}>
                  <MaterialCommunityIcons name="menu" size={22} color={colors.white} />
                </Pressable>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroTitle}>Timetable Management</Text>
                  <Text style={styles.heroSub}>
                    {isCoordinator ? 'Wing schedule overview' : 'Branch-wide schedule overview'}
                  </Text>
                </View>
                <Pressable
                  style={styles.importBtn}
                  onPress={() => navigation.navigate('BulkImportTimetable')}>
                  <MaterialCommunityIcons name="upload" size={16} color={colors.white} />
                  <Text style={styles.importBtnText}>Import</Text>
                </Pressable>
              </View>
              {/* Stats chips */}
              <View style={styles.statsRow}>
                <View style={styles.statChip}>
                  <Text style={styles.statValue}>{totalSections}</Text>
                  <Text style={styles.statLabel}>Sections</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statChip}>
                  <Text style={[styles.statValue, {color: colors.success}]}>{publishedCount}</Text>
                  <Text style={styles.statLabel}>Published</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statChip}>
                  <Text style={[styles.statValue, {color: colors.warning}]}>{draftCount}</Text>
                  <Text style={styles.statLabel}>Draft</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statChip}>
                  <Text style={[styles.statValue, {color: colors.textMuted}]}>{totalSections - publishedCount - draftCount}</Text>
                  <Text style={styles.statLabel}>Empty</Text>
                </View>
              </View>
            </Animated.View>

            {/* Filter tabs */}
            <Animated.View style={styles.filterRow}>
              {FILTER_TABS.map(tab => (
                <Pressable
                  key={tab}
                  onPress={() => setActiveFilter(tab)}
                  style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]}>
                  <Text style={[styles.filterTabText, activeFilter === tab && styles.filterTabTextActive]}>
                    {tab}
                  </Text>
                </Pressable>
              ))}
            </Animated.View>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title={activeFilter !== 'All' ? `No ${activeFilter.toLowerCase()} timetables` : 'No sections found'}
              message={activeFilter !== 'All' ? 'Try a different filter.' : 'Create sections under your classes first.'}
            />
          ) : (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )
        }
        ListFooterComponent={<View style={{height: spacing.xxxl * 2}} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  list: {padding: spacing.md},
  center: {alignItems: 'center', paddingVertical: spacing.xxl},

  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 100,
    height: 180,
    position: 'absolute',
    right: -30,
    top: -60,
    width: 180},
  heroRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg},
  menuBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md,
    height: 38,
    justifyContent: 'center',
    width: 38},
  heroCopy: {flex: 1},
  heroTitle: {color: colors.white, fontSize: 18, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2},
  importBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs},
  importBtnText: {color: colors.white, fontSize: 12, fontWeight: '800'},

  statsRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around'},
  statChip: {alignItems: 'center', flex: 1},
  statValue: {color: colors.white, fontSize: 22, fontWeight: '800'},
  statLabel: {color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 2},
  statDivider: {backgroundColor: 'rgba(255,255,255,0.2)', height: 28, width: 1},

  filterRow: {flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap'},
  filterTab: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs},
  filterTabActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  filterTabText: {color: colors.textMuted, fontSize: 12, fontWeight: '700'},
  filterTabTextActive: {color: colors.white},

  classGroup: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden'},
  classGroupHeader: {
    alignItems: 'center',
    backgroundColor: colors.neutralSoft,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm},
  classGroupTitle: {...typography.bodyBold, color: colors.text, flex: 1},
  sectionCountBadge: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.pill,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 6},
  sectionCountText: {color: colors.primary, fontSize: 10, fontWeight: '800'},

  sectionRow: {
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm},
  sectionInfo: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: 4},
  sectionLabel: {...typography.body, color: colors.text, flex: 1, fontWeight: '600'},
  sectionMeta: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  sectionFill: {...typography.caption, color: colors.textMuted},

  statusBadge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2},
  statusBadgeText: {fontSize: 10, fontWeight: '800'},

  progressBarWrap: {
    backgroundColor: colors.borderLight,
    borderRadius: radius.pill,
    height: 3,
    marginBottom: spacing.xs,
    overflow: 'hidden',
    width: '100%'},
  progressBar: {borderRadius: radius.pill, height: 3},

  editBtn: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primarySoft,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 5},
  editBtnText: {color: colors.primary, fontSize: 12, fontWeight: '800'}});

export default TimetableDashboardScreen;
