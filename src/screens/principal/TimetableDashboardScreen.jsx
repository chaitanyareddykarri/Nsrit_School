import React, {useState, useMemo} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, UserMenuDrawer} from '../../components';
import timetableService, {getTimetableStatus} from '../../services/timetable/timetableService';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import {USER_ROLES, TIMETABLE_STATUS} from '../../config/constants';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import academicRepository from '../../repositories/academicRepository';

const normalizeRole = r => String(r || '').toUpperCase();

// ── Status Badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({status}) => {
  const config = {
    [TIMETABLE_STATUS.PUBLISHED]: {color: colors.success, icon: 'check-circle', label: 'Published'},
    [TIMETABLE_STATUS.DRAFT]:     {color: colors.warning, icon: 'pencil-circle',  label: 'Draft'},
    EMPTY:                        {color: colors.textSoft, icon: 'circle-outline',  label: 'No Data'},
  };
  const c = config[status] || config.EMPTY;
  return (
    <View style={[styles.statusBadge, {backgroundColor: `${c.color}18`, borderColor: `${c.color}40`}]}>
      <MaterialCommunityIcons name={c.icon} size={11} color={c.color} />
      <Text style={[styles.statusBadgeText, {color: c.color}]}>{c.label}</Text>
    </View>
  );
};

// ── Section Row (shown when class is expanded) ────────────────────────────────

const SectionRow = ({section, studentCount, onEdit}) => {
  const {status, filledCount, totalSlots} = section.timetableStatus;
  const pct = totalSlots > 0 ? Math.round((filledCount / totalSlots) * 100) : 0;

  return (
    <Pressable
      style={({pressed}) => [styles.sectionRow, pressed && {backgroundColor: colors.primaryFaint}]}
      onPress={() => onEdit(section)}>
      <View style={styles.sectionMain}>
        <View style={styles.sectionLeft}>
          <View style={styles.sectionIconWrap}>
            <MaterialCommunityIcons name="door-open" size={15} color={colors.primary} />
          </View>
          <View style={styles.sectionInfo}>
            <Text style={styles.sectionLabel}>Section {section.sectionName}</Text>
            <View style={styles.sectionMeta}>
              <MaterialCommunityIcons name="account-group-outline" size={11} color={colors.textMuted} />
              <Text style={styles.sectionStudents}>{studentCount} students</Text>
              {status !== 'EMPTY' && (
                <Text style={styles.sectionFill}> · {filledCount}/{totalSlots} periods</Text>
              )}
            </View>
          </View>
        </View>
        <View style={styles.sectionRight}>
          <StatusBadge status={status} />
          <View style={[styles.editChip]}>
            <MaterialCommunityIcons name="pencil-outline" size={13} color={colors.primary} />
            <Text style={styles.editChipText}>Edit</Text>
          </View>
        </View>
      </View>
      {status !== 'EMPTY' && totalSlots > 0 ? (
        <View style={styles.progressBarWrap}>
          <View style={[
            styles.progressBar,
            {width: `${pct}%`, backgroundColor: status === TIMETABLE_STATUS.PUBLISHED ? colors.success : colors.warning},
          ]} />
        </View>
      ) : null}
    </Pressable>
  );
};

// ── Class Card (accordion) ────────────────────────────────────────────────────

const ClassCard = ({className, sections, expanded, onToggle, onEdit, studentCountBySection}) => {
  const publishedCount = sections.filter(s => s.timetableStatus.status === TIMETABLE_STATUS.PUBLISHED).length;
  const draftCount = sections.filter(s => s.timetableStatus.status === TIMETABLE_STATUS.DRAFT).length;
  const emptyCount = sections.length - publishedCount - draftCount;
  const totalStudents = sections.reduce((sum, s) => sum + (studentCountBySection[s.sectionId] || 0), 0);

  return (
    <Animated.View style={[styles.classCard, expanded && styles.classCardExpanded]}>
      {/* Header — tappable to expand/collapse */}
      <Pressable
        style={({pressed}) => [styles.classHeader, pressed && {opacity: 0.85}]}
        onPress={onToggle}>
        <View style={styles.classIconWrap}>
          <MaterialCommunityIcons name="school-outline" size={18} color={colors.primary} />
        </View>
        <View style={styles.classInfo}>
          <Text style={styles.className}>{className}</Text>
          <View style={styles.classMeta}>
            <Text style={styles.classMetaText}>{sections.length} section{sections.length !== 1 ? 's' : ''}</Text>
            <Text style={styles.classMetaDot}>·</Text>
            <Text style={styles.classMetaText}>{totalStudents} students</Text>
          </View>
        </View>
        <View style={styles.classPills}>
          {publishedCount > 0 && (
            <View style={[styles.classPill, {backgroundColor: `${colors.success}20`}]}>
              <Text style={[styles.classPillText, {color: colors.success}]}>{publishedCount} ✓</Text>
            </View>
          )}
          {draftCount > 0 && (
            <View style={[styles.classPill, {backgroundColor: `${colors.warning}20`}]}>
              <Text style={[styles.classPillText, {color: colors.warning}]}>{draftCount} draft</Text>
            </View>
          )}
          {emptyCount > 0 && (
            <View style={[styles.classPill, {backgroundColor: colors.borderLight}]}>
              <Text style={[styles.classPillText, {color: colors.textMuted}]}>{emptyCount} empty</Text>
            </View>
          )}
        </View>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textMuted}
        />
      </Pressable>

      {/* Expanded sections list */}
      {expanded && (
        <View style={styles.sectionsWrap}>
          <View style={styles.sectionsDivider} />
          {sections.map((sec, i) => (
            <React.Fragment key={sec.sectionId}>
              <SectionRow
                section={sec}
                studentCount={studentCountBySection[sec.sectionId] || 0}
                onEdit={onEdit}
              />
              {i < sections.length - 1 && <View style={styles.sectionDivider} />}
            </React.Fragment>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────

const TimetableDashboardScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const role = useSelector(state => state.auth.role);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const branchId = user?.branchId;
  const wingId = user?.wingId;
  const [expandedClass, setExpandedClass] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isCoordinator = normalizeRole(role) === USER_ROLES.COORDINATOR;
  const academicYear = activeAcademicYear?.startYear;

  const {data: timetableSections = [], isLoading: loadingTimetable, refetch: refetchTimetable} = useQuery({
    queryKey: isCoordinator
      ? ['timetablesForWing', branchId, wingId]
      : ['timetablesForBranch', branchId],
    queryFn: () => isCoordinator
      ? timetableService.getTimetablesForWing(branchId, wingId)
      : timetableService.getTimetablesForBranch(branchId),
    enabled: Boolean(branchId),
  });

  const {data: allSectionsData, isLoading: loadingSections, refetch: refetchSections} = useQuery({
    queryKey: ['sections', branchId, academicYear],
    queryFn: () => academicRepository.getSections({branchId, academicYear}),
    enabled: Boolean(branchId),
  });

  const isLoading = loadingTimetable || loadingSections;

  const handleRefresh = () => {
    refetchTimetable();
    refetchSections();
  };

  // Student count per section
  const studentCountBySection = useMemo(() => {
    const counts = {};
    (allSectionsData?.students || []).forEach(s => {
      if (s.sectionId) {
        counts[s.sectionId] = (counts[s.sectionId] || 0) + 1;
      }
    });
    return counts;
  }, [allSectionsData]);

  // Merge timetable data with section list
  const mergedSections = useMemo(() => {
    const timetableMap = {};
    timetableSections.forEach(tt => { timetableMap[tt.sectionId] = tt; });

    const allSections = allSectionsData?.sections || [];
    const result = [];

    allSections.forEach(sec => {
      if (isCoordinator && wingId && sec.wingId && sec.wingId !== wingId) {return;}
      const tt = timetableMap[sec.id];
      const periods = tt?.periods || [];
      result.push({
        sectionId: sec.id,
        className: sec.academicClass?.name || sec.className || '',
        sectionName: sec.name || sec.sectionName || '',
        wingId: sec.wingId || '',
        periods,
        timetableStatus: getTimetableStatus(periods),
      });
    });

    // Include timetable sections not in allSections (edge case)
    timetableSections.forEach(tt => {
      if (!result.find(r => r.sectionId === tt.sectionId)) {
        result.push({
          sectionId: tt.sectionId,
          className: tt.className,
          sectionName: tt.sectionName,
          wingId: tt.wingId || '',
          periods: tt.periods,
          timetableStatus: getTimetableStatus(tt.periods),
        });
      }
    });

    return result;
  }, [timetableSections, allSectionsData, isCoordinator, wingId]);

  // Group by class name, sorted by class name
  const classGroups = useMemo(() => {
    const map = {};
    mergedSections.forEach(sec => {
      if (!map[sec.className]) {map[sec.className] = [];}
      map[sec.className].push(sec);
    });
    return Object.entries(map)
      .map(([className, sections]) => ({className, sections}))
      .sort((a, b) => a.className.localeCompare(b.className, undefined, {numeric: true}));
  }, [mergedSections]);

  // Stats
  const totalSections = mergedSections.length;
  const publishedCount = mergedSections.filter(s => s.timetableStatus.status === TIMETABLE_STATUS.PUBLISHED).length;
  const draftCount = mergedSections.filter(s => s.timetableStatus.status === TIMETABLE_STATUS.DRAFT).length;

  const handleEditSection = section => {
    navigation.navigate('TimetableEditor', {
      sectionId: section.sectionId,
      sectionName: section.sectionName,
      className: section.className,
      branchId,
      studentCount: studentCountBySection[section.sectionId] || 0,
    });
  };

  const handleToggleClass = className => {
    setExpandedClass(prev => (prev === className ? null : className));
  };

  const renderGroup = ({item}) => (
    <ClassCard
      className={item.className}
      sections={item.sections}
      expanded={expandedClass === item.className}
      onToggle={() => handleToggleClass(item.className)}
      onEdit={handleEditSection}
      studentCountBySection={studentCountBySection}
    />
  );

  return (
    <View style={styles.root}>
      <UserMenuDrawer
        visible={menuOpen}
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
                    {isCoordinator ? 'Tap a class to manage schedules' : 'Tap a class, then a section to edit'}
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
                  <Text style={styles.statValue}>{classGroups.length}</Text>
                  <Text style={styles.statLabel}>Classes</Text>
                </View>
                <View style={styles.statDivider} />
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
              </View>
            </Animated.View>

            {/* Instruction hint */}
            {classGroups.length > 0 && !isLoading ? (
              <View style={styles.hintRow}>
                <MaterialCommunityIcons name="gesture-tap" size={14} color={colors.textMuted} />
                <Text style={styles.hintText}>Tap a class to see its sections · Tap a section to edit timetable</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="No classes found"
              message="Create classes and sections under Academic Structure first."
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

  // ── Hero ──
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep,
  },
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 100,
    height: 180,
    position: 'absolute',
    right: -30,
    top: -60,
    width: 180,
  },
  heroRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg},
  menuBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  heroCopy: {flex: 1},
  heroTitle: {color: colors.white, fontSize: 18, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2},
  importBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  importBtnText: {color: colors.white, fontSize: 12, fontWeight: '800'},
  statsRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around'},
  statChip: {alignItems: 'center', flex: 1},
  statValue: {color: colors.white, fontSize: 20, fontWeight: '800'},
  statLabel: {color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 2},
  statDivider: {backgroundColor: 'rgba(255,255,255,0.2)', height: 28, width: 1},

  // ── Hint ──
  hintRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  hintText: {color: colors.textMuted, fontSize: 11, textAlign: 'center', flex: 1},

  // ── Class Card ──
  classCard: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  classCardExpanded: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  classHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  classIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.md,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  classInfo: {flex: 1},
  className: {...typography.bodyBold, color: colors.text, fontSize: 15},
  classMeta: {alignItems: 'center', flexDirection: 'row', gap: spacing.xs, marginTop: 2},
  classMetaText: {color: colors.textMuted, fontSize: 11},
  classMetaDot: {color: colors.textSoft, fontSize: 11},
  classPills: {alignItems: 'center', flexDirection: 'row', gap: spacing.xs},
  classPill: {
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  classPillText: {fontSize: 10, fontWeight: '700'},

  // ── Sections (expanded) ──
  sectionsDivider: {backgroundColor: colors.border, height: 1, marginHorizontal: spacing.md},
  sectionsWrap: {},
  sectionDivider: {backgroundColor: colors.borderLight, height: 1, marginLeft: 64},
  sectionRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionMain: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  sectionLeft: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, flex: 1},
  sectionIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.neutralSoft,
    borderRadius: radius.sm,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  sectionInfo: {flex: 1},
  sectionLabel: {...typography.body, color: colors.text, fontWeight: '700'},
  sectionMeta: {alignItems: 'center', flexDirection: 'row', marginTop: 2},
  sectionStudents: {color: colors.textMuted, fontSize: 11, marginLeft: 3},
  sectionFill: {color: colors.textMuted, fontSize: 11},
  sectionRight: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  editChip: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primarySoft,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  editChipText: {color: colors.primary, fontSize: 11, fontWeight: '800'},

  // ── Status Badge ──
  statusBadge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  statusBadgeText: {fontSize: 10, fontWeight: '800'},

  // ── Progress Bar ──
  progressBarWrap: {
    backgroundColor: colors.borderLight,
    borderRadius: radius.pill,
    height: 3,
    marginTop: spacing.xs,
    overflow: 'hidden',
    width: '100%',
  },
  progressBar: {borderRadius: radius.pill, height: 3},
});

export default TimetableDashboardScreen;
