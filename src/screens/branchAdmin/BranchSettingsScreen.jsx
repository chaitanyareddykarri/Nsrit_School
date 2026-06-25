import React from 'react';
import {Pressable, ScrollView, StyleSheet, View, Text, ActivityIndicator} from 'react-native';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {branchService} from '../../services/branches/branchService';
import {colors, radius, shadows, spacing} from '../../theme';

const InfoRow = ({icon, label, value}) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={16} color={colors.textMuted} style={styles.infoIcon} />
    <View style={styles.infoCopy}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  </View>
);

const SettingLink = ({icon, iconColor, label, desc, onPress}) => (
  <Pressable
    onPress={onPress}
    style={({pressed}) => [styles.link, pressed && {opacity: 0.75}]}>
    <View style={[styles.linkIcon, {backgroundColor: `${iconColor}12`}]}>
      <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
    </View>
    <View style={styles.linkCopy}>
      <Text style={styles.linkLabel}>{label}</Text>
      {desc ? <Text style={styles.linkDesc}>{desc}</Text> : null}
    </View>
    <MaterialCommunityIcons name="chevron-right" size={15} color={colors.border} />
  </Pressable>
);

const BranchSettingsScreen = ({navigation}) => {
  const {user} = useSelector(state => state.auth);
  const branchId = user?.branchId;

  const {data: branches, isLoading} = useQuery({
    queryKey: ['branchDetail', branchId],
    queryFn: async () => {
      const list = await branchService.getBranches();
      return list.find(b => b.id === branchId || b.branchId === branchId) || null;
    },
    enabled: Boolean(branchId),
    staleTime: 5 * 60 * 1000});

  const branch = branches || null;
  const branchName = branch?.name || user?.branchName || 'Branch';
  const branchCode = branch?.branchCode || branch?.code || user?.branchCode || '—';
  const city = branch?.city || '—';
  const address = branch?.address || '—';
  const phone = branch?.phone || branch?.contactNumber || user?.phoneNumber || '—';
  const email = branch?.email || '—';
  const status = (branch?.status || 'ACTIVE').toUpperCase();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.codeChip}>
          <Text style={styles.codeText}>{branchCode}</Text>
        </View>
        <Text style={styles.heroTitle}>{branchName}</Text>
        <Text style={styles.heroSub}>{city}</Text>
        <View style={[styles.statusChip, {backgroundColor: status === 'ACTIVE' ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'}]}>
          <View style={[styles.statusDot, {backgroundColor: status === 'ACTIVE' ? '#4ADE80' : colors.danger}]} />
          <Text style={[styles.statusText, {color: status === 'ACTIVE' ? '#4ADE80' : colors.danger}]}>{status}</Text>
        </View>
      </Animated.View>

      {/* Branch Info */}
      <Animated.View style={styles.card}>
        <Text style={styles.cardTitle}>Branch Information</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{marginVertical: spacing.md}} />
        ) : (
          <>
            <InfoRow icon="office-building-outline" label="Branch Name" value={branchName} />
            <View style={styles.rowDivider} />
            <InfoRow icon="identifier" label="Branch Code" value={branchCode} />
            <View style={styles.rowDivider} />
            <InfoRow icon="map-marker-outline" label="Address" value={address} />
            <View style={styles.rowDivider} />
            <InfoRow icon="city-variant-outline" label="City" value={city} />
            <View style={styles.rowDivider} />
            <InfoRow icon="phone-outline" label="Phone" value={phone} />
            <View style={styles.rowDivider} />
            <InfoRow icon="email-outline" label="Email" value={email} />
            <View style={styles.rowDivider} />
            <InfoRow icon="check-circle-outline" label="Status" value={status} />
          </>
        )}
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View style={styles.card}>
        <Text style={styles.cardTitle}>Administration</Text>
        <SettingLink
          icon="account-group-outline"
          iconColor={colors.secondary}
          label="Manage Teachers"
          desc="Create, edit and manage teaching staff"
          onPress={() => navigation.navigate('ManageTeachers')}
        />
        <View style={styles.rowDivider} />
        <SettingLink
          icon="account-school-outline"
          iconColor={colors.primary}
          label="Manage Students"
          desc="View, transfer and update student records"
          onPress={() => navigation.navigate('ManageStudents')}
        />
        <View style={styles.rowDivider} />
        <SettingLink
          icon="calendar-check-outline"
          iconColor={colors.info}
          label="Attendance Overview"
          desc="Monitor attendance across all classes"
          onPress={() => navigation.navigate('AttendanceOverview')}
        />
        <View style={styles.rowDivider} />
        <SettingLink
          icon="human-male-board"
          iconColor={colors.warning}
          label="Assign Class Teachers"
          desc="Assign homeroom teachers to sections"
          onPress={() => navigation.navigate('AssignClassTeacher')}
        />
      </Animated.View>

      {/* Fee Administration */}
      <Animated.View style={styles.card}>
        <Text style={styles.cardTitle}>Fee Administration</Text>
        <SettingLink
          icon="cash-register"
          iconColor={colors.success}
          label="Fee Dashboard"
          desc="Overview of fee collection status"
          onPress={() => navigation.navigate('FeeDashboard')}
        />
        <View style={styles.rowDivider} />
        <SettingLink
          icon="file-chart-outline"
          iconColor={colors.secondary}
          label="Fee Reports"
          desc="Class-wise and student-wise fee reports"
          onPress={() => navigation.navigate('FeeReports')}
        />
      </Animated.View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  content: {padding: spacing.lg, paddingBottom: 40},

  hero: {
    alignItems: 'flex-start',
    backgroundColor: colors.secondary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    position: 'relative',
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    height: 160,
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160},
  codeChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4},
  codeText: {color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '800', letterSpacing: 1},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '900', marginBottom: 4},
  heroSub: {color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: spacing.md},
  statusChip: {alignItems: 'center', borderRadius: radius.pill, flexDirection: 'row', gap: 5, paddingHorizontal: 10, paddingVertical: 4},
  statusDot: {borderRadius: 999, height: 6, width: 6},
  statusText: {fontSize: 10, fontWeight: '800', letterSpacing: 0.5},

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.clay},
  cardTitle: {color: colors.text, fontSize: 13, fontWeight: '800', letterSpacing: 0.2, marginBottom: spacing.md},

  infoRow: {alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm, paddingVertical: 8},
  infoIcon: {marginTop: 2},
  infoCopy: {flex: 1},
  infoLabel: {color: colors.textSoft, fontSize: 10, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase'},
  infoValue: {color: colors.text, fontSize: 13, fontWeight: '600', marginTop: 1},

  link: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, paddingVertical: 12},
  linkIcon: {alignItems: 'center', borderRadius: radius.md, height: 36, justifyContent: 'center', width: 36},
  linkCopy: {flex: 1},
  linkLabel: {color: colors.text, fontSize: 14, fontWeight: '700'},
  linkDesc: {color: colors.textMuted, fontSize: 11, marginTop: 1},
  rowDivider: {backgroundColor: colors.borderLight, height: 1}});

export default BranchSettingsScreen;
