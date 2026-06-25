import React, {useEffect, useMemo, useState} from 'react';
import {Alert, FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {ConfirmationModal, EmptyState, FilterTabs, SearchBar, SelectField} from '../../components';
import {ROLE_LABELS, USER_ROLES} from '../../config/constants';
import academicRepository from '../../repositories/academicRepository';
import sectionService from '../../services/sections/sectionService';
import teacherService from '../../services/teachers/teacherService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';
import academicYearService from '../../services/academicYear/academicYearService';

const allOption = label => ({label, value: 'ALL'});
const normalizeRole = role => String(role || '').toUpperCase();
const uniqueRoles = roles => {
  const seen = new Set();
  return (roles || [])
    .map(item => normalizeRole(item?.role || item))
    .filter(Boolean)
    .filter(role => {
      if (seen.has(role)) {
        return false;
      }
      seen.add(role);
      return true;
    });
};
const getRoles = user => uniqueRoles([...(user?.roles || []), user?.role]);
const getPrimaryRole = user => normalizeRole(user?.role) || getRoles(user)[0] || '';
const formatRoles = roles => uniqueRoles(roles).map(item => ROLE_LABELS[item] || item).join(', ');

const AssignClassTeacherScreen = ({route}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const effectiveBranchId = route.params?.branchId || user?.branchId;
  const academicYear = route.params?.academicYear || academicYearService.getCurrentStartYear(effectiveBranchId);
  const [error, setError] = useState('');
  const [saveConfirmVisible, setSaveConfirmVisible] = useState(false);
  const [removeConfirmRow, setRemoveConfirmRow] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState(route.params?.sectionId || 'ALL');
  const [teacherFilter, setTeacherFilter] = useState('ALL');
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [form, setForm] = useState({
    classId: '', sectionId: route.params?.sectionId || '', teacherId: ''});

  const role = normalizeRole(user?.role);
  const canModify = [USER_ROLES.COORDINATOR, USER_ROLES.PRINCIPAL, USER_ROLES.BRANCH_ADMIN, USER_ROLES.MAIN_ADMIN].includes(role);

  const assignmentsQuery = useQuery({
    queryKey: ['classTeacherAssignments', effectiveBranchId, academicYear, user?.wing || 'ALL'],
    queryFn: () => teacherService.getClassTeacherAssignments({branchId: effectiveBranchId, academicYear}, scope),
    enabled: Boolean(effectiveBranchId && canModify)});
  const classesQuery = useQuery({
    queryKey: ['activeAcademicClasses', effectiveBranchId],
    queryFn: () => academicRepository.getActiveAcademicClasses(),
    enabled: Boolean(effectiveBranchId && canModify)});
  const pickerSectionsQuery = useQuery({
    queryKey: ['sections', effectiveBranchId, academicYear, 'CLASS_TEACHER_PICKER'],
    queryFn: () => sectionService.getSections({branchId: effectiveBranchId, academicYear, limit: 500}, scope),
    enabled: Boolean(effectiveBranchId && canModify)});
  const teachersQuery = useQuery({
    queryKey: ['teachers', effectiveBranchId, 'CLASS_TEACHER_PICKER'],
    queryFn: () => teacherService.getTeachers({branchId: effectiveBranchId, limit: 300, offset: 0}, scope),
    enabled: Boolean(effectiveBranchId && canModify)});

  const classes = useMemo(() => {
    const items = (classesQuery.data || []).filter(item => item.branchId === effectiveBranchId);
    return role === USER_ROLES.COORDINATOR
      ? items.filter(item => item.wing?.code === user?.wing || item.wing === user?.wing)
      : items;
  }, [classesQuery.data, effectiveBranchId, role, user?.wing]);

  const sections = useMemo(() => assignmentsQuery.data?.sections || [], [assignmentsQuery.data?.sections]);
  const pickerSections = useMemo(() => {
    const items = pickerSectionsQuery.data?.sections || sections;
    return role === USER_ROLES.COORDINATOR
      ? items.filter(section => section.academicClass?.wing?.code === user?.wing || section.wing === user?.wing)
      : items;
  }, [pickerSectionsQuery.data?.sections, role, sections, user?.wing]);

  const assignments = useMemo(() => assignmentsQuery.data?.assignments || [], [assignmentsQuery.data?.assignments]);
  const students = useMemo(() => assignmentsQuery.data?.students || [], [assignmentsQuery.data?.students]);
  const coordinators = useMemo(() => assignmentsQuery.data?.coordinators || [], [assignmentsQuery.data?.coordinators]);
  const teachers = useMemo(() => teachersQuery.data || [], [teachersQuery.data]);
  const teacherCandidates = useMemo(() => {
    const byUserId = new Map();
    teachers.forEach(teacher => {
      const userProfile = teacher.user || teacher;
      const userId = teacher.userId || userProfile.id;
      if (!userId) {
        return;
      }
      const roles = uniqueRoles([...(teacher.roles || []), ...getRoles(userProfile)]);
      const primaryRole = teacher.primaryRole || getPrimaryRole(userProfile) || USER_ROLES.TEACHER;
      byUserId.set(userId, {
        ...teacher,
        id: teacher.id,
        teacherId: teacher.id,
        userId,
        user: userProfile,
        roles,
        primaryRole,
        primaryRoleLabel: ROLE_LABELS[primaryRole] || primaryRole,
        additionalRoles: roles.filter(item => item !== primaryRole),
        additionalRoleLabels: formatRoles(roles.filter(item => item !== primaryRole)),
        isCoordinatorCandidate: roles.includes(USER_ROLES.COORDINATOR)});
    });

    coordinators.forEach(coordinator => {
      const userProfile = coordinator.user || {};
      const userId = coordinator.userId || userProfile.id;
      if (!userId) {
        return;
      }
      const teacherProfile = userProfile.teacherProfile;
      const roles = getRoles(userProfile);
      const primaryRole = getPrimaryRole(userProfile) || USER_ROLES.COORDINATOR;
      const existing = byUserId.get(userId);
      if (existing) {
        const mergedRoles = uniqueRoles([...existing.roles, ...roles]);
        byUserId.set(userId, {
          ...existing,
          coordinatorId: coordinator.id,
          coordinatorWing: coordinator.wing,
          roles: mergedRoles,
          primaryRole,
          primaryRoleLabel: ROLE_LABELS[primaryRole] || primaryRole,
          additionalRoles: mergedRoles.filter(item => item !== primaryRole),
          additionalRoleLabels: formatRoles(mergedRoles.filter(item => item !== primaryRole)),
          isCoordinatorCandidate: true});
        return;
      }

      byUserId.set(userId, {
        id: teacherProfile?.id || `coordinator:${coordinator.id}`,
        teacherId: teacherProfile?.id || null,
        userId,
        user: userProfile,
        fullName: userProfile.fullName,
        phoneNumber: userProfile.phoneNumber,
        employeeId: teacherProfile?.employeeId || coordinator.employeeId || userProfile.employeeId,
        staffType: teacherProfile?.staffType || coordinator.staffType || userProfile.staffType,
        branchId: teacherProfile?.branchId || coordinator.branchId || effectiveBranchId,
        joiningDate: teacherProfile?.joiningDate,
        designation: teacherProfile?.designation || 'Class Teacher',
        gender: teacherProfile?.gender || coordinator.gender || 'Other',
        email: teacherProfile?.email || coordinator.email || null,
        roles,
        primaryRole,
        primaryRoleLabel: ROLE_LABELS[primaryRole] || primaryRole,
        additionalRoles: roles.filter(item => item !== primaryRole),
        additionalRoleLabels: formatRoles(roles.filter(item => item !== primaryRole)),
        coordinatorId: coordinator.id,
        coordinatorWing: coordinator.wing,
        isCoordinatorCandidate: true});
    });

    return [...byUserId.values()].sort((left, right) =>
      String(left.fullName || left.user?.fullName || '').localeCompare(
        String(right.fullName || right.user?.fullName || ''),
      ),
    );
  }, [coordinators, effectiveBranchId, teachers]);

  const studentCounts = useMemo(() => {
    const counts = {};
    students.forEach(student => { counts[student.sectionId] = (counts[student.sectionId] || 0) + 1; });
    return counts;
  }, [students]);

  const activeAssignments = useMemo(() => assignments.filter(item => item.isActive !== false), [assignments]);
  const assignmentBySection = useMemo(() => {
    const map = {};
    activeAssignments.forEach(assignment => { map[assignment.sectionId] = assignment; });
    return map;
  }, [activeAssignments]);

  const coordinatorByWing = useMemo(() => {
    const map = {};
    coordinators.forEach(coordinator => { map[coordinator.wing] = coordinator; });
    return map;
  }, [coordinators]);

  const rows = useMemo(
    () => sections.map(section => {
      const assignment = assignmentBySection[section.id];
      const hasAssignmentRecord = assignments.some(item => item.sectionId === section.id);
      const teacher = assignment?.teacher;
      const wing = section.academicClass?.wing?.code || '';

      const teacherId = assignment
        ? assignment.teacherId
        : (hasAssignmentRecord ? '' : (section.classTeacherId || ''));

      const teacherName = assignment
        ? assignment.teacherName
        : (hasAssignmentRecord ? 'Not assigned' : (section.classTeacher?.fullName || 'Not assigned'));

      const employeeId = assignment
        ? assignment.employeeId
        : (hasAssignmentRecord ? '-' : (section.classTeacher?.employeeId || '-'));

      const teacherPhoneNumber = assignment
        ? assignment.teacherPhoneNumber
        : (hasAssignmentRecord ? '-' : (section.classTeacher?.phoneNumber || '-'));

      const primaryRole = assignment
        ? (assignment.primaryRoleLabel || '-')
        : (hasAssignmentRecord ? '-' : (ROLE_LABELS[normalizeRole(section.classTeacher?.role)] || '-'));

      const additionalRoles = assignment
        ? (assignment.additionalRoleLabels || '-')
        : '-';

      return {
        id: section.id, section, assignment,
        status: assignment ? 'ASSIGNED' : 'UNASSIGNED',
        className: section.academicClass?.name || '-',
        sectionName: section.name || '-',
        teacherId,
        teacherName,
        employeeId,
        teacherPhoneNumber,
        primaryRole,
        additionalRoles,
        assignedDate: assignment?.createdAt,
        assignedBy: assignment?.assignedByName || assignment?.assignedBy?.fullName || '-',
        wing,
        coordinator: coordinatorByWing[wing]?.user?.fullName || '-',
        studentCount: studentCounts[section.id] || 0};
    }),
    [assignmentBySection, assignments, coordinatorByWing, sections, studentCounts],
  );

  const filterOptions = useMemo(() => {
    const classMap = new Map();
    const sectionOptions = new Map();
    const teacherOptions = new Map();
    rows.forEach(row => {
      if (row.section.academicClass?.id) classMap.set(row.section.academicClass.id, row.className);
      sectionOptions.set(row.section.id, `${row.className}-${row.sectionName}`);
      if (row.assignment?.teacherId) teacherOptions.set(row.assignment.teacherId, row.teacherName);
    });
    const sorted = map =>
      [...map.entries()]
        .sort((l, r) => String(l[1]).localeCompare(String(r[1]), undefined, {numeric: true}))
        .map(([value, label]) => ({value, label}));
    return {
      classes: [allOption('All Classes'), ...sorted(classMap)],
      sections: [allOption('All Sections'), ...sorted(sectionOptions)],
      teachers: [allOption('All Teachers / Coordinators'), ...sorted(teacherOptions)]};
  }, [rows]);

  const classOptions = useMemo(
    () => classes.map(item => ({label: item.name, value: item.id, item})),
    [classes],
  );
  const sectionOptions = useMemo(
    () => pickerSections
      .filter(section => !form.classId || section.academicClassId === form.classId || section.academicClass?.id === form.classId)
      .sort((l, r) => String(l.name).localeCompare(String(r.name), undefined, {numeric: true}))
      .map(section => ({label: section.name, value: section.id, item: section})),
    [form.classId, pickerSections],
  );
  // Teachers already serving as class teacher in another section (exclude from dropdown)
  const alreadyClassTeacherIds = useMemo(() => {
    const ids = new Set();
    activeAssignments.forEach(a => {
      // Only exclude if they're a class teacher for a DIFFERENT section than the one being edited
      if (a.isClassTeacher && a.sectionId !== form.sectionId) {
        ids.add(a.teacherId);
      }
    });
    return ids;
  }, [activeAssignments, form.sectionId]);

  const teacherOptions = useMemo(
    () =>
      teacherCandidates
        .filter(item => !alreadyClassTeacherIds.has(item.id) && !alreadyClassTeacherIds.has(item.teacherId))
        .map(item => ({
          label: `${item.fullName || item.user?.fullName || 'Staff'} (${item.primaryRoleLabel || 'Teacher'}) - ${item.employeeId || '-'}`,
          value: item.id,
          item})),
    [teacherCandidates, alreadyClassTeacherIds],
  );

  const selectedSection = useMemo(
    () => sectionOptions.find(item => item.value === form.sectionId)?.item,
    [form.sectionId, sectionOptions],
  );
  const selectedTeacher = useMemo(
    () => teacherOptions.find(item => item.value === form.teacherId)?.item,
    [form.teacherId, teacherOptions],
  );
  const initialRouteSection = useMemo(
    () => pickerSections.find(section => section.id === route.params?.sectionId),
    [route.params?.sectionId, pickerSections],
  );

  useEffect(() => {
    const routeClassId = initialRouteSection?.academicClass?.id || initialRouteSection?.academicClassId;
    if (!form.classId && form.sectionId && routeClassId) {
      setForm(current => ({...current, classId: routeClassId}));
    }
  }, [form.classId, form.sectionId, initialRouteSection]);

  const updateFormClass = value => setForm(current => ({...current, classId: value, sectionId: ''}));
  const updateFormSection = value => {
    const section = pickerSections.find(item => item.id === value);
    setForm(current => ({
      ...current,
      classId: section?.academicClass?.id || section?.academicClassId || current.classId,
      sectionId: value}));
  };

  const filteredRows = useMemo(
    () => rows.filter(row => {
      const haystack = `${row.className} ${row.sectionName} ${row.teacherName} ${row.employeeId}`.toLowerCase();
      return (
        haystack.includes(query.trim().toLowerCase()) &&
        (statusFilter === 'ALL' || row.status === statusFilter) &&
        (classFilter === 'ALL' || row.section.academicClass?.id === classFilter) &&
        (sectionFilter === 'ALL' || row.section.id === sectionFilter) &&
        (teacherFilter === 'ALL' || row.teacherId === teacherFilter)
      );
    }),
    [classFilter, query, rows, sectionFilter, statusFilter, teacherFilter],
  );

  const resetForm = () => {
    setEditingAssignment(null);
    setForm({
      classId: initialRouteSection?.academicClass?.id || '',
      sectionId: route.params?.sectionId || '',
      teacherId: ''});
  };

  const invalidateAssignmentData = () => {
    queryClient.invalidateQueries({queryKey: ['classTeacherAssignments', effectiveBranchId]});
    queryClient.invalidateQueries({queryKey: ['sections', effectiveBranchId, academicYear]});
    queryClient.invalidateQueries({queryKey: ['teachers', effectiveBranchId]});
    queryClient.invalidateQueries({queryKey: ['principalDashboard', effectiveBranchId]});
    queryClient.invalidateQueries({queryKey: ['teacherDashboard']});
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const currentAssignment = editingAssignment || assignmentBySection[form.sectionId];
      if (currentAssignment) {
        return teacherService.updateClassTeacherAssignment(
          {
            assignmentId: currentAssignment.id, oldSectionId: currentAssignment.sectionId,
            oldTeacherId: currentAssignment.teacherId, teacher: selectedTeacher,
            sectionId: form.sectionId, section: selectedSection,
            oldSection: currentAssignment.section, branchId: effectiveBranchId},
          scope,
        );
      }
      return teacherService.assignClassTeacher(
        {teacher: selectedTeacher, sectionId: form.sectionId, section: selectedSection, branchId: effectiveBranchId},
        scope,
      );
    },
    onSuccess: () => { setError(''); resetForm(); invalidateAssignmentData(); },
    onError: err => setError(err.message)});

  const removeMutation = useMutation({
    mutationFn: row =>
      teacherService.removeClassTeacherAssignment(
        {assignmentId: row.assignment.id, sectionId: row.section.id, section: row.section, teacherId: row.assignment.teacherId, branchId: effectiveBranchId},
        scope,
      ),
    onSuccess: () => { setError(''); resetForm(); invalidateAssignmentData(); },
    onError: err => setError(err.message)});

  const startEdit = row => {
    setEditingAssignment(row.assignment);
    setForm({classId: row.section.academicClass?.id || '', sectionId: row.section.id, teacherId: row.assignment.teacherId});
  };

  const confirmRemove = row => {
    setRemoveConfirmRow(row);
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={filteredRows}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ── Hero ── */}
            <Animated.View style={styles.hero}>
              <View style={styles.heroDecor} />
              <Text style={styles.heroOverline}>Principal</Text>
              <View style={styles.heroRow}>
                <Text style={styles.heroTitle}>Class Teacher Assignment</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{rows.length}</Text>
                </View>
              </View>
              <Text style={styles.heroSub}>View, assign, edit, and remove class teachers</Text>
            </Animated.View>

            {/* ── Assignment form ── */}
            {canModify ? (
              <Animated.View style={styles.formCard}>
                <Text style={styles.formSection}>{editingAssignment ? 'Edit Assignment' : 'New Assignment'}</Text>
                <View style={styles.selectWrap}>
                  <SelectField label="Class" value={form.classId} options={classOptions} onChange={updateFormClass} />
                </View>
                {!classesQuery.isLoading && !classesQuery.error && effectiveBranchId && !classOptions.length ? (
                  <Text style={styles.infoText}>No active classes for this branch.</Text>
                ) : null}
                <View style={styles.selectWrap}>
                  <SelectField label="Section" value={form.sectionId} options={sectionOptions} onChange={updateFormSection} disabled={!form.classId || pickerSectionsQuery.isLoading} />
                </View>
                {form.classId && !pickerSectionsQuery.isLoading && !pickerSectionsQuery.error && !sectionOptions.length ? (
                  <Text style={styles.infoText}>No active sections for this class.</Text>
                ) : null}
                <View style={styles.selectWrap}>
                  <SelectField label="Teacher" value={form.teacherId} options={teacherOptions} onChange={v => setForm(current => ({...current, teacherId: v}))} />
                </View>
                {error ? (
                  <View style={styles.errorBox}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
                <View style={styles.formActions}>
                  {editingAssignment ? (
                    <Pressable onPress={resetForm} style={[styles.outlineBtn, {flex: 1}]}>
                      <Text style={styles.outlineBtnText}>Cancel Edit</Text>
                    </Pressable>
                  ) : null}
                  <Pressable
                    onPress={() => setSaveConfirmVisible(true)}
                    disabled={saveMutation.isPending || !form.sectionId || !form.teacherId}
                    style={({pressed}) => [
                      styles.saveBtn,
                      {flex: 1},
                      (saveMutation.isPending || !form.sectionId || !form.teacherId) && {opacity: 0.5},
                      pressed && form.sectionId && form.teacherId && {opacity: 0.88},
                    ]}>
                    <Text style={styles.saveBtnText}>
                      {saveMutation.isPending ? 'Saving…' : editingAssignment || assignmentBySection[form.sectionId] ? 'Update Assignment' : 'Assign Class Teacher'}
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>
            ) : (
              <View style={styles.infoCard}>
                <MaterialCommunityIcons name="information-outline" size={14} color={colors.primary} />
                <Text style={styles.infoCardText}>View-only. Editing is restricted to coordinators and administrators.</Text>
              </View>
            )}

            {/* ── Filters ── */}
            <Text style={styles.sectionLabel}>Class Teacher Overview · {rows.length} sections</Text>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Search teacher, class, section" />
            <FilterTabs
              value={statusFilter}
              onChange={setStatusFilter}
              tabs={[
                {label: 'All', value: 'ALL'},
                {label: 'Assigned', value: 'ASSIGNED'},
                {label: 'Unassigned', value: 'UNASSIGNED'},
              ]}
            />
            <View style={styles.selectWrap2}>
              <SelectField label="Filter By Class" value={classFilter} options={filterOptions.classes} onChange={setClassFilter} />
            </View>
            <View style={styles.selectWrap2}>
              <SelectField label="Filter By Section" value={sectionFilter} options={filterOptions.sections} onChange={setSectionFilter} />
            </View>
            <View style={styles.selectWrap2}>
              <SelectField label="Filter By Teacher" value={teacherFilter} options={filterOptions.teachers} onChange={setTeacherFilter} />
            </View>
            <Text style={styles.sectionLabel}>Assignments</Text>
          </View>
        }
        renderItem={({item: row, index}) => (
          <Animated.View>
            <View style={[styles.rowCard, {borderLeftColor: row.assignment ? colors.success : colors.warning, borderLeftWidth: 3}]}>
              <View style={styles.rowIcon}>
                <MaterialCommunityIcons
                  name={row.assignment ? 'account-tie-outline' : 'account-question-outline'}
                  size={16}
                  color={row.assignment ? colors.success : colors.warning}
                />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{row.className}-{row.sectionName}</Text>
                <Text style={styles.rowTeacher}>
                  {row.teacherName}
                  {row.primaryRole && row.primaryRole !== '-' ? ` (${row.primaryRole})` : ''}
                </Text>
                {row.additionalRoles && row.additionalRoles !== '-' ? (
                  <Text style={styles.rowMeta}>Additional Roles: {row.additionalRoles}</Text>
                ) : null}
                <Text style={styles.rowMeta}>
                  {row.employeeId !== '-' ? `ID: ${row.employeeId} · ` : ''}{row.studentCount} students
                  {row.wing ? ` · Wing: ${row.wing}` : ''}
                </Text>
                {row.assignment ? (
                  <Text style={styles.rowDate}>
                    Assigned {formatDateForDisplay(row.assignedDate) || '—'} by {row.assignedBy}
                  </Text>
                ) : (
                  <Text style={styles.unassignedText}>No class teacher assigned</Text>
                )}
                {canModify && row.assignment ? (
                  <View style={styles.rowActions}>
                    <Pressable onPress={() => startEdit(row)} style={styles.editBtn}>
                      <MaterialCommunityIcons name="pencil-outline" size={12} color={colors.primary} />
                      <Text style={styles.editBtnText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => confirmRemove(row)}
                      disabled={removeMutation.isPending}
                      style={styles.removeBtn}>
                      <MaterialCommunityIcons name="account-remove-outline" size={12} color={colors.danger} />
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState title="No assignments found" message="Adjust search or filters to view sections." />
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
      <ConfirmationModal
        visible={saveConfirmVisible}
        title={editingAssignment || 'Assign Class Teacher?'}
        message="Save this class teacher assignment?"
        confirmLabel="Yes, Save"
        cancelLabel="Cancel"
        onConfirm={() => {
          setSaveConfirmVisible(false);
          saveMutation.mutate();
        }}
        onCancel={() => setSaveConfirmVisible(false)}
      />
      <ConfirmationModal
        visible={Boolean(removeConfirmRow)}
        title="Remove Class Teacher?"
        message={`Remove ${removeConfirmRow?.teacherName || 'this teacher'} as Class Teacher of ${removeConfirmRow?.className || ''}-${removeConfirmRow?.sectionName || ''}?`}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={() => {
          const row = removeConfirmRow;
          setRemoveConfirmRow(null);
          removeMutation.mutate(row);
        }}
        onCancel={() => setRemoveConfirmRow(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

  hero: {
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
  heroRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  heroTitle: {color: colors.white, fontSize: 20, fontWeight: '800'},
  countBadge: {backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2},
  countBadgeText: {color: colors.white, fontSize: 12, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 4},

  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.clay},
  formSection: {
    backgroundColor: colors.background,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    padding: spacing.md,
    paddingBottom: spacing.xs,
    textTransform: 'uppercase'},
  selectWrap: {borderTopColor: colors.borderLight, borderTopWidth: 1, padding: spacing.sm},
  infoText: {color: colors.textMuted, fontSize: 11, fontWeight: '500', paddingHorizontal: spacing.md, paddingBottom: spacing.sm},
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.sm},
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},
  formActions: {flexDirection: 'row', gap: spacing.sm, padding: spacing.md},
  outlineBtn: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: radius.card,
    borderWidth: 1.5,
    height: 44,
    justifyContent: 'center'},
  outlineBtnText: {color: colors.primary, fontSize: 13, fontWeight: '700'},
  saveBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    height: 44,
    justifyContent: 'center',
    ...shadows.fab},
  saveBtnText: {color: colors.white, fontSize: 13, fontWeight: '700'},

  infoCard: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md},
  infoCardText: {color: colors.primary, flex: 1, fontSize: 12, fontWeight: '600'},

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    textTransform: 'uppercase'},
  selectWrap2: {marginBottom: spacing.xs},

  rowCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.clay},
  rowIcon: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    marginTop: 2,
    width: 36},
  rowBody: {flex: 1},
  rowTitle: {...typography.bodyBold, color: colors.text},
  rowTeacher: {color: colors.primary, fontSize: 13, fontWeight: '700', marginTop: 2},
  rowMeta: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  rowDate: {color: colors.textSoft, fontSize: 10, fontWeight: '500', marginTop: 2},
  unassignedText: {color: colors.warning, fontSize: 11, fontWeight: '600', marginTop: 2},
  rowActions: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm},
  editBtn: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4},
  editBtnText: {color: colors.primary, fontSize: 11, fontWeight: '700'},
  removeBtn: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4},
  removeBtnText: {color: colors.danger, fontSize: 11, fontWeight: '700'}});

export default AssignClassTeacherScreen;
