import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';

const InfoRow = ({icon, label, value}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <MaterialCommunityIcons name={icon} size={15} color={colors.primary} />
    </View>
    <View style={styles.infoBody}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={3}>{value || '—'}</Text>
    </View>
  </View>
);

const SectionDetailsScreen = ({navigation, route}) => {
  const section = route.params?.section || {};
  const classTeacherAssignment = section.classTeacherAssignments?.[0];
  const assignmentTeacher = classTeacherAssignment?.teacher;
  const classTeacher = section.classTeacher || assignmentTeacher?.user;
  const isClassTeacherAssigned = Boolean(classTeacher?.fullName);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Hero ── */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <Text style={styles.heroOverline}>Principal · Section</Text>
        <Text style={styles.heroTitle}>
          {section.academicClass?.name || 'Class'}–{section.name || ''}
        </Text>
        <Text style={styles.heroSub}>Academic year {section.academicYear || '—'}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{section.studentCount || 0}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{section.academicClass?.wing?.code || '—'}</Text>
            <Text style={styles.statLabel}>Wing</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, {color: isClassTeacherAssigned ? '#86efac' : 'rgba(255,255,255,0.5)'}]}>
              {isClassTeacherAssigned ? '✓' : '—'}
            </Text>
            <Text style={styles.statLabel}>Class Teacher</Text>
          </View>
        </View>
      </Animated.View>

      {/* ── Info card ── */}
      <Animated.View style={styles.infoCard}>
        <Text style={styles.cardSection}>Section Info</Text>
        <InfoRow icon="book-education-outline" label="Class" value={section.academicClass?.name} />
        <InfoRow icon="view-grid-outline" label="Section" value={section.name} />
        <InfoRow icon="clipboard-text-clock" label="Attendance" value={section.attendanceSummary || 'Use attendance reports'} />
      </Animated.View>

      {/* ── Class teacher card ── */}
      <Animated.View style={styles.infoCard}>
        <Text style={styles.cardSection}>Class Teacher</Text>
        <InfoRow icon="teach" label="Name" value={classTeacher?.fullName || 'Not assigned'} />
        {classTeacher ? (
          <>
            <InfoRow
              icon="identifier"
              label="Employee ID"
              value={assignmentTeacher?.employeeId || classTeacher?.employeeId}
            />
            <InfoRow icon="phone" label="Mobile" value={classTeacher?.phoneNumber} />
            <InfoRow
              icon="calendar"
              label="Assigned On"
              value={formatDateForDisplay(classTeacherAssignment?.createdAt)}
            />
            <InfoRow
              icon="account-outline"
              label="Assigned By"
              value={classTeacherAssignment?.assignedBy?.fullName}
            />
          </>
        ) : null}
      </Animated.View>

      {/* ── Assign teacher button ── */}
      <Pressable
        onPress={() =>
          navigation.navigate('AssignClassTeacher', {
            sectionId: section.id,
            academicYear: section.academicYear})
        }
        style={({pressed}) => [styles.assignBtn, pressed && {opacity: 0.88}]}>
        <MaterialCommunityIcons name="account-switch-outline" size={18} color={colors.white} />
        <Text style={styles.assignBtnText}>
          {isClassTeacherAssigned ? 'Reassign Class Teacher' : 'Assign Class Teacher'}
        </Text>
      </Pressable>

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},

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
  heroOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  heroTitle: {color: colors.white, fontSize: 28, fontWeight: '800', marginBottom: 4},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginBottom: spacing.lg},
  statsRow: {
    borderTopColor: 'rgba(255,255,255,0.12)',
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingTop: spacing.md},
  stat: {alignItems: 'center', flex: 1},
  statValue: {color: colors.white, fontSize: 20, fontWeight: '800'},
  statLabel: {color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase'},
  statSep: {backgroundColor: 'rgba(255,255,255,0.12)', width: 1},

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
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md},
  infoIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.card,
    height: 32,
    justifyContent: 'center',
    width: 32},
  infoBody: {flex: 1, minWidth: 0},
  infoLabel: {color: colors.textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase'},
  infoValue: {...typography.bodyBold, color: colors.text, fontSize: 13, marginTop: 1},

  assignBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 50,
    justifyContent: 'center',
    marginTop: spacing.sm,
    ...shadows.fab},
  assignBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'}});

export default SectionDetailsScreen;
