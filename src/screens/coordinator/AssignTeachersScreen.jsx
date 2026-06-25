/**
 * AssignTeachersScreen — Coordinator
 *
 * Shows active teachers in the coordinator's wing/branch.
 * Filters out teachers already assigned to a selected section.
 * Prevents duplicate assignments at the UI and mutation level.
 */
import React, {useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {ConfirmationModal, EmptyState, SearchBar, SelectField} from '../../components';
import {USER_ROLES} from '../../config/constants';
import dataConnectClient from '../../services/dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../../services/dataconnect/operations';
import {colors, radius, shadows, spacing} from '../../theme';
import academicYearService from '../../services/academicYear/academicYearService';

const normalizeRole = r => String(r || '').toUpperCase();

// ── Teacher card ──────────────────────────────────────────────────────────────
const TeacherCard = ({teacher, isSelected, isAlreadyAssigned, onSelect}) => {
  const roles = (teacher.assignments || []);
  const assignedCount = roles.length;

  return (
    <Animated.View>
      <Pressable
        onPress={isAlreadyAssigned ? undefined : onSelect}
        style={[
          styles.teacherCard,
          isSelected && styles.teacherCardSelected,
          isAlreadyAssigned && styles.teacherCardDisabled,
        ]}>
        {/* Avatar */}
        <View style={[styles.avatar, {backgroundColor: isAlreadyAssigned ? colors.border : `${colors.secondary}18`}]}>
          <Text style={[styles.avatarText, {color: isAlreadyAssigned ? colors.textSoft : colors.secondary}]}>
            {(teacher.user?.fullName || teacher.fullName || '?')[0].toUpperCase()}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.teacherInfo}>
          <Text style={[styles.teacherName, isAlreadyAssigned && {color: colors.textSoft}]} numberOfLines={1}>
            {teacher.user?.fullName || teacher.fullName || 'Unknown'}
          </Text>
          <Text style={styles.teacherSub} numberOfLines={1}>
            {teacher.employeeId || '—'} · {teacher.designation || 'Teacher'}
          </Text>
          {assignedCount > 0 ? (
            <View style={styles.assignedPill}>
              <MaterialCommunityIcons name="link-variant" size={10} color={colors.info} />
              <Text style={styles.assignedPillText}>{assignedCount} section{assignedCount > 1 ? 's' : ''} assigned</Text>
            </View>
          ) : (
            <View style={styles.freePill}>
              <MaterialCommunityIcons name="circle" size={7} color={colors.success} />
              <Text style={styles.freePillText}>Available</Text>
            </View>
          )}
        </View>

        {/* Status */}
        {isAlreadyAssigned ? (
          <View style={styles.alreadyBadge}>
            <Text style={styles.alreadyBadgeText}>Assigned</Text>
          </View>
        ) : isSelected ? (
          <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />
        ) : (
          <MaterialCommunityIcons name="circle-outline" size={22} color={colors.border} />
        )}
      </Pressable>
    </Animated.View>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const AssignTeachersScreen = () => {
  const user = useSelector(s => s.auth.user);
  const queryClient = useQueryClient();

  const branchId = user?.branchId;
  const wing     = user?.wing;
  const role     = normalizeRole(user?.role);
  const isCoordinator = role === USER_ROLES.COORDINATOR;
  const AY = academicYearService.getCurrentStartYear(branchId);

  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'available'
  const [confirmVisible, setConfirmVisible] = useState(false);

  // ── Fetch sections ──
  const sectionsQuery = useQuery({
    queryKey: ['sectionsForAssignment', branchId, wing, AY],
    queryFn: async () => {
      const res = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_SECTIONS_FOR_TEACHER_ASSIGNMENT,
        {branchId, wing: isCoordinator ? wing : undefined, academicYear: AY},
      );
      return res.sections || [];
    },
    enabled: Boolean(branchId),
    staleTime: 2 * 60 * 1000});

  // ── Fetch teachers ──
  const teachersQuery = useQuery({
    queryKey: ['teachersByBranch', branchId],
    queryFn: async () => {
      const res = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_TEACHERS_BY_WING,
        {branchId, wing: wing || '', limit: 200, offset: 0},
      );
      const teachers = res.teachers || [];
      // Filter active teachers only
      return teachers.filter(t => t.isActive !== false && t.user?.isActive !== false);
    },
    enabled: Boolean(branchId),
    staleTime: 2 * 60 * 1000});

  // ── Assign mutation ──
  const assignMutation = useMutation({
    mutationFn: async ({teacherId, sectionId, academicClassId}) => {
      return dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ASSIGN_TEACHER, {
        teacherId,
        branchId,
        academicClassId,
        sectionId,
        isClassTeacher: false});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['teachersByBranch', branchId]});
      queryClient.invalidateQueries({queryKey: ['sectionsForAssignment', branchId]});
      queryClient.invalidateQueries({queryKey: ['classTeacherAssignments']});
      setSelectedTeacherId('');
      Alert.alert('Assigned', 'Teacher has been assigned to the section successfully.');
    },
    onError: err => {
      Alert.alert('Assignment Failed', err?.message || 'Unable to assign teacher. Please try again.');
    }});

  // ── Derived data ──
  const sections = sectionsQuery.data || [];
  const teachers = teachersQuery.data || [];

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  // IDs of teachers already assigned to the selected section
  const assignedTeacherIds = useMemo(() => {
    if (!selectedSectionId) return new Set();
    const ids = new Set();
    for (const t of teachers) {
      for (const a of (t.teacherSectionAssignments_on_teacher || [])) {
        if (a.sectionId === selectedSectionId && a.isActive !== false) {
          ids.add(t.id);
        }
      }
    }
    return ids;
  }, [selectedSectionId, teachers]);

  const filteredTeachers = useMemo(() => {
    let list = teachers;
    if (filterMode === 'available') {
      list = list.filter(t => !assignedTeacherIds.has(t.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t =>
        (t.user?.fullName || '').toLowerCase().includes(q) ||
        (t.employeeId || '').toLowerCase().includes(q) ||
        (t.designation || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [teachers, filterMode, searchQuery, assignedTeacherIds]);

  const sectionOptions = sections.map(s => ({
    label: `${s.academicClass?.name || '—'} – ${s.name} (${s.academicClass?.wing?.code || '—'})`,
    value: s.id}));

  const canAssign = Boolean(selectedSectionId && selectedTeacherId && !assignedTeacherIds.has(selectedTeacherId));

  const handleAssign = () => {
    if (!canAssign || assignMutation.isPending) return;
    setConfirmVisible(true);
  };

  const handleConfirmAssign = () => {
    setConfirmVisible(false);
    const section = sections.find(s => s.id === selectedSectionId);
    if (!section) return;
    assignMutation.mutate({
      teacherId: selectedTeacherId,
      sectionId: selectedSectionId,
      academicClassId: section.academicClassId});
  };

  const isLoading = sectionsQuery.isLoading || teachersQuery.isLoading;
  const isRefreshing = sectionsQuery.isFetching || teachersQuery.isFetching;

  const onRefresh = () => {
    sectionsQuery.refetch();
    teachersQuery.refetch();
  };

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <Animated.View style={styles.header}>
        <View style={styles.headerDecor} />
        <Text style={styles.headerOverline}>Coordinator · AY {AY}–{AY + 1}</Text>
        <Text style={styles.headerTitle}>Assign Teachers</Text>
        <Text style={styles.headerSub}>
          Select a section, then pick an available teacher
        </Text>
      </Animated.View>

      {/* ── Section selector ── */}
      <Animated.View style={styles.selectorBox}>
        <SelectField
          label="Select Section"
          value={selectedSectionId}
          options={[{label: 'Choose a section…', value: ''}, ...sectionOptions]}
          onChange={v => {setSelectedSectionId(v); setSelectedTeacherId('');}}
        />
        {selectedSection && (
          <View style={styles.sectionMeta}>
            <MaterialCommunityIcons name="google-classroom" size={13} color={colors.primary} />
            <Text style={styles.sectionMetaText}>
              Wing: {selectedSection.academicClass?.wing?.name || '—'} ·
              Class Teacher: {selectedSection.classTeacher?.fullName || 'Not assigned'}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* ── Filter + Search ── */}
      <Animated.View style={styles.filterRow}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search teachers…"
          style={styles.searchBar}
        />
        <Pressable
          onPress={() => setFilterMode(m => m === 'all' ? 'available' : 'all')}
          style={[styles.filterBtn, filterMode === 'available' && styles.filterBtnActive]}>
          <MaterialCommunityIcons
            name={filterMode === 'available' ? 'filter-check' : 'filter-outline'}
            size={16}
            color={filterMode === 'available' ? colors.white : colors.primary}
          />
          <Text style={[styles.filterBtnText, filterMode === 'available' && {color: colors.white}]}>
            {filterMode === 'available' ? 'Available' : 'All'}
          </Text>
        </Pressable>
      </Animated.View>

      {/* ── Stats row ── */}
      {!isLoading && (
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''}
            {filterMode === 'available' && selectedSectionId ? ' available' : ''}
          </Text>
          {selectedSectionId && (
            <Text style={styles.statsAssigned}>
              {assignedTeacherIds.size} already assigned to this section
            </Text>
          )}
        </View>
      )}

      {/* ── Teacher list ── */}
      <FlatList
        data={filteredTeachers}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Loading teachers…</Text>
            </View>
          ) : (
            <EmptyState
              title={filterMode === 'available' ? 'All teachers assigned' : 'No teachers found'}
              message={filterMode === 'available' ? 'Every active teacher is already assigned to this section.' : 'Try a different search term.'}
            />
          )
        }
        renderItem={({item}) => (
          <TeacherCard
            teacher={item}
            isSelected={item.id === selectedTeacherId}
            isAlreadyAssigned={assignedTeacherIds.has(item.id)}
            onSelect={() => setSelectedTeacherId(prev => prev === item.id ? '' : item.id)}
          />
        )}
      />

      {/* ── Assign button ── */}
      {canAssign && (
        <Animated.View style={styles.assignBar}>
          <View style={styles.assignBarInfo}>
            <Text style={styles.assignBarLabel}>Ready to assign</Text>
            <Text style={styles.assignBarSub} numberOfLines={1}>
              {teachers.find(t => t.id === selectedTeacherId)?.user?.fullName || '—'} → {selectedSection?.name || '—'}
            </Text>
          </View>
          <Pressable
            onPress={handleAssign}
            disabled={assignMutation.isPending}
            style={[styles.assignBtn, assignMutation.isPending && {opacity: 0.65}]}>
            <MaterialCommunityIcons name="check-bold" size={16} color={colors.white} />
            <Text style={styles.assignBtnText}>
              {assignMutation.isPending ? 'Assigning…' : 'Assign'}
            </Text>
          </Pressable>
        </Animated.View>
      )}
      <ConfirmationModal
        visible={confirmVisible}
        title="Assign Teacher?"
        message={`Assign ${teachers.find(t => t.id === selectedTeacherId)?.user?.fullName || 'this teacher'} to ${sections.find(s => s.id === selectedSectionId)?.academicClass?.name || ''}–${sections.find(s => s.id === selectedSectionId)?.name || ''}?`}
        confirmLabel="Yes, Assign"
        cancelLabel="Cancel"
        onConfirm={handleConfirmAssign}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},

  header: {
    backgroundColor: colors.secondary,
    borderRadius: 0,
    borderBottomLeftRadius: radius.hero,
    borderBottomRightRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 80,
    height: 120,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 120},
  headerOverline: {color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4},
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 4},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500'},

  selectorBox: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1.5,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md},
  sectionMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: 4,
    paddingHorizontal: 2},
  sectionMetaText: {color: colors.textMuted, fontSize: 11, fontWeight: '500'},

  filterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm},
  searchBar: {flex: 1},
  filterBtn: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7},
  filterBtnActive: {backgroundColor: colors.primary},
  filterBtnText: {color: colors.primary, fontSize: 12, fontWeight: '700'},

  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs},
  statsText: {color: colors.textMuted, fontSize: 11, fontWeight: '700'},
  statsAssigned: {color: colors.warning, fontSize: 11, fontWeight: '600'},

  listContent: {paddingHorizontal: spacing.lg, paddingBottom: 120},
  emptyWrap: {alignItems: 'center', marginTop: spacing.xxxl},
  emptyText: {color: colors.textSoft, fontSize: 14},

  teacherCard: {
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
  teacherCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: `${colors.primary}06`},
  teacherCardDisabled: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    opacity: 0.7},

  avatar: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44},
  avatarText: {fontSize: 18, fontWeight: '800'},

  teacherInfo: {flex: 1, minWidth: 0},
  teacherName: {color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 2},
  teacherSub: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginBottom: 4},

  assignedPill: {
    alignItems: 'center',
    backgroundColor: `${colors.info}15`,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start'},
  assignedPillText: {color: colors.info, fontSize: 9, fontWeight: '700'},

  freePill: {
    alignItems: 'center',
    backgroundColor: `${colors.success}15`,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start'},
  freePillText: {color: colors.success, fontSize: 9, fontWeight: '700'},

  alreadyBadge: {
    backgroundColor: `${colors.warning}20`,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3},
  alreadyBadgeText: {color: colors.warning, fontSize: 10, fontWeight: '800'},

  // Assign bar
  assignBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopColor: colors.borderLight,
    borderTopWidth: 1.5,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.md,
    left: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    position: 'absolute',
    right: 0,
    ...shadows.clayDeep},
  assignBarInfo: {flex: 1, minWidth: 0},
  assignBarLabel: {color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.3, marginBottom: 2},
  assignBarSub: {color: colors.text, fontSize: 13, fontWeight: '700'},
  assignBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    ...shadows.fab},
  assignBtnText: {color: colors.white, fontSize: 14, fontWeight: '800'}});

export default AssignTeachersScreen;
