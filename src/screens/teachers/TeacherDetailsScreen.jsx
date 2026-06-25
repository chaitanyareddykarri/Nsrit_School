import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {EmptyState} from '../../components';
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

const InfoRow = ({icon, label, value, onPress}) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress}
    style={({pressed}) => [styles.infoRow, onPress && pressed && {opacity: 0.75}]}>
    <View style={styles.infoIcon}>
      <MaterialCommunityIcons name={icon} size={16} color={colors.secondary} />
    </View>
    <View style={styles.infoBody}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>{value || '—'}</Text>
    </View>
    {onPress ? (
      <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textMuted} />
    ) : null}
  </Pressable>
);

const TeacherDetailsScreen = ({navigation, route}) => {
  const teacherId = route.params?.teacherId;
  const {data: teacher} = useQuery({
    queryKey: ['teacher', teacherId],
    queryFn: () => teacherService.getTeacherProfile(teacherId),
    enabled: Boolean(teacherId)});

  if (!teacher) {
    return (
      <View style={styles.root}>
        <EmptyState title="Teacher not found" message="The selected teacher could not be loaded." />
      </View>
    );
  }

  const subjects = teacher.subjects?.map(item => item.name).join(', ') || 'No subjects assigned';
  const classTeacherSection = teacher.assignments?.find(item => item.isClassTeacher)?.section;
  const isActive = teacher.isActive !== false;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Hero ── */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.heroContent}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>
              {getInitials(teacher.fullName || teacher.user?.fullName || '')}
            </Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroName} numberOfLines={2}>
              {teacher.fullName || teacher.user?.fullName || 'Teacher'}
            </Text>
            <Text style={styles.heroMeta}>
              {teacher.designation || 'Teacher'} · {teacher.branch?.name || 'Branch resource'}
            </Text>
          </View>
        </View>
        <View style={styles.heroFooter}>
          <View style={[styles.statusBadge, {backgroundColor: isActive ? 'rgba(34,197,94,0.22)' : 'rgba(239,68,68,0.22)'}]}>
            <View style={[styles.statusDot, {backgroundColor: isActive ? colors.success : colors.danger}]} />
            <Text style={[styles.statusText, {color: isActive ? '#86efac' : '#fca5a5'}]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('EditTeacher', {teacherId})}
            style={styles.editBtn}>
            <MaterialCommunityIcons name="pencil-outline" size={13} color={colors.secondary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* ── Info card ── */}
      <Animated.View style={styles.infoCard}>
        <Text style={styles.cardSection}>Contact & Identity</Text>
        <InfoRow icon="phone" label="Mobile" value={teacher.phoneNumber || teacher.user?.phoneNumber} />
        <InfoRow icon="identifier" label="Employee ID" value={teacher.employeeId} />
        <InfoRow icon="badge-account-outline" label="Designation" value={teacher.designation} />
        <InfoRow icon="calendar-start" label="Joining Date" value={formatDateForDisplay(teacher.joiningDate)} />
      </Animated.View>

      {/* ── Academic card ── */}
      <Animated.View style={styles.infoCard}>
        <Text style={styles.cardSection}>Academic Assignments</Text>
        <InfoRow
          icon="book-open-page-variant-outline"
          label="Subjects"
          value={subjects}
          onPress={() => navigation.navigate('AssignSubjects', {teacherId})}
        />
        <InfoRow
          icon="google-classroom"
          label="Class Teacher"
          value={
            classTeacherSection
              ? `${classTeacherSection.academicClass?.name || ''}-${classTeacherSection.name}`
              : 'Not assigned'
          }
        />
        <InfoRow
          icon="account-details-outline"
          label="Full Profile"
          value="View detailed profile"
          onPress={() => navigation.navigate('TeacherProfile', {teacherId})}
        />
      </Animated.View>

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
  heroContent: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md},
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
  heroFooter: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between'},
  statusBadge: {alignItems: 'center', borderRadius: radius.pill, flexDirection: 'row', gap: 5, paddingHorizontal: spacing.sm, paddingVertical: 4},
  statusDot: {borderRadius: radius.pill, height: 6, width: 6},
  statusText: {fontSize: 11, fontWeight: '700'},
  editBtn: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs},
  editBtnText: {color: colors.secondary, fontSize: 12, fontWeight: '700'},

  infoCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.clay},
  cardSection: {
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
    height: 34,
    justifyContent: 'center',
    width: 34},
  infoBody: {flex: 1, minWidth: 0},
  infoLabel: {color: colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase'},
  infoValue: {...typography.bodyBold, color: colors.text, fontSize: 13, marginTop: 1}});

export default TeacherDetailsScreen;
