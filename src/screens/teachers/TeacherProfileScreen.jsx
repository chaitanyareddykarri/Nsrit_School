import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, StatusBadge} from '../../components';
import {ROLE_LABELS} from '../../config/constants';
import teacherService from '../../services/teachers/teacherService';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const getInitials = name =>
  name
    ? name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    : '?';

const InfoRow = ({icon, label, value}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <MaterialCommunityIcons name={icon} size={15} color={colors.secondary} />
    </View>
    <View style={styles.infoBody}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={3}>{value || '—'}</Text>
    </View>
  </View>
);

const SectionCard = ({title, children}) => (
  <Animated.View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </Animated.View>
);

const normalizeRole = role => String(role || '').toUpperCase();
const uniqueRoles = roles => [...new Set((roles || []).map(item => normalizeRole(item?.role || item)).filter(Boolean))];

const TeacherProfileScreen = ({route}) => {
  const teacherId = route.params?.teacherId;
  const {data: teacher} = useQuery({
    queryKey: ['teacherProfile', teacherId],
    queryFn: () => teacherService.getTeacherProfile(teacherId),
    enabled: Boolean(teacherId)});

  if (!teacher) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Teacher profile unavailable"
          message="Profile data could not be loaded."
        />
      </View>
    );
  }

  const assignments = teacher.assignments || [];
  const assignedSection = assignments.find(item => item.isClassTeacher)?.section;
  const activeAssignments = assignments.filter(item => item.isActive !== false);
  const studentCount = assignments.reduce(
    (sum, item) =>
      sum +
      (
        item.section?.profileActiveStudents ||
        item.section?.dashboardActiveStudents ||
        item.section?.activeStudents ||
        item.section?.students_on_section ||
        []
      ).length,
    0,
  );
  const attendanceRecordsMarked = teacher.attendanceMarked?.length || 0;
  const name = teacher.fullName || teacher.user?.fullName || 'Teacher';
  const isActive = teacher.isActive !== false;
  const roles = uniqueRoles([...(teacher.roles || teacher.user?.roles || []), teacher.user?.role, teacher.role]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Hero ── */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.heroRow}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroName} numberOfLines={2}>{name}</Text>
            <Text style={styles.heroMeta}>
              {teacher.designation || 'Teacher'} · {teacher.branch?.name || 'Branch'}
            </Text>
          </View>
        </View>
        <View style={styles.heroStats}>
          {[
            {label: 'Sections', value: activeAssignments.length},
            {label: 'Students', value: studentCount},
            {label: 'Att. Marked', value: attendanceRecordsMarked},
          ].map(stat => (
            <View key={stat.label} style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{stat.value}</Text>
              <Text style={styles.heroStatLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.statusBadge, {backgroundColor: isActive ? 'rgba(34,197,94,0.22)' : 'rgba(239,68,68,0.22)'}]}>
          <View style={[styles.statusDot, {backgroundColor: isActive ? colors.success : colors.danger}]} />
          <Text style={[styles.statusText, {color: isActive ? '#86efac' : '#fca5a5'}]}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </Animated.View>

      {/* ── Roles ── */}
      {roles.length ? (
        <View style={styles.roleRow}>
          {roles.map(role => (
            <StatusBadge key={role} status="info" label={ROLE_LABELS[role] || role} />
          ))}
        </View>
      ) : null}

      <SectionCard title="Personal Information">
        <InfoRow icon="phone" label="Mobile" value={teacher.phoneNumber || teacher.user?.phoneNumber} />
        <InfoRow icon="account-outline" label="Gender" value={teacher.gender} />
        <InfoRow icon="email-outline" label="Email" value={teacher.email} />
        <InfoRow icon="calendar-account-outline" label="Date of Birth" value={formatDateForDisplay(teacher.dateOfBirth)} />
        <InfoRow icon="water-outline" label="Blood Group" value={teacher.bloodGroup} />
      </SectionCard>

      <SectionCard title="Employment Information">
        <InfoRow icon="identifier" label="Employee ID" value={teacher.employeeId} />
        <InfoRow icon="calendar-start" label="Joining Date" value={formatDateForDisplay(teacher.joiningDate)} />
        <InfoRow icon="briefcase-account-outline" label="Designation" value={teacher.designation} />
        <InfoRow icon="school-outline" label="Qualification" value={teacher.qualification} />
        <InfoRow icon="briefcase-outline" label="Experience" value={teacher.experience} />
      </SectionCard>

      <SectionCard title="Academic Assignments">
        <InfoRow
          icon="book-open-outline"
          label="Assigned Subjects"
          value={teacher.subjects?.map(item => item.name).join(', ') || 'None'}
        />
        <InfoRow
          icon="google-classroom"
          label="Class Teacher"
          value={
            assignedSection
              ? `${assignedSection.academicClass?.name}-${assignedSection.name} (Class Teacher)`
              : 'No class teacher assignment'
          }
        />
        <InfoRow
          icon="view-grid-outline"
          label="Assigned Sections"
          value={
            activeAssignments.length
              ? activeAssignments
                  .map(item => `${item.section?.academicClass?.name || '-'}-${item.section?.name || '-'}`)
                  .join(', ')
              : 'None'
          }
        />
      </SectionCard>

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},

  hero: {
    backgroundColor: colors.secondary,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130},
  heroRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg},
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56},
  avatarText: {color: colors.white, fontSize: 16, fontWeight: '800'},
  heroCopy: {flex: 1},
  heroName: {color: colors.white, fontSize: 18, fontWeight: '800'},
  heroMeta: {color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '500', marginTop: 2},
  heroStats: {
    borderTopColor: 'rgba(255,255,255,0.12)',
    borderTopWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingTop: spacing.md},
  heroStat: {alignItems: 'center', flex: 1},
  heroStatValue: {color: colors.white, fontSize: 18, fontWeight: '800'},
  heroStatLabel: {color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase'},
  statusBadge: {alignItems: 'center', alignSelf: 'flex-start', borderRadius: radius.pill, flexDirection: 'row', gap: 5, paddingHorizontal: spacing.sm, paddingVertical: 4},
  statusDot: {borderRadius: radius.pill, height: 6, width: 6},
  statusText: {fontSize: 11, fontWeight: '700'},

  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.clay},
  sectionTitle: {
    backgroundColor: colors.background,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    padding: spacing.md,
    paddingBottom: spacing.xs,
    textTransform: 'uppercase'},
  infoRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md},
  infoIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.lg,
    height: 32,
    justifyContent: 'center',
    width: 32},
  infoBody: {flex: 1, minWidth: 0},
  infoLabel: {color: colors.textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase'},
  infoValue: {...typography.bodyBold, color: colors.text, fontSize: 13, marginTop: 1},
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md}});

export default TeacherProfileScreen;
