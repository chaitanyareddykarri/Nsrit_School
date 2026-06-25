import React, {useEffect} from 'react';
import {FlatList, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, LoadingScreen} from '../../components';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {
  buildMainAdminBranchContext,
  clearMainAdminBranchContext as clearStoredBranchContext,
  saveMainAdminBranchContext} from '../../services/mainAdmin/mainAdminContextService';
import {
  clearMainAdminBranchContext,
  enterMainAdminBranchContext} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const modules = [
  {title: 'Overview', icon: 'view-dashboard-outline', route: 'BranchDetails', color: colors.primaryDark},
  {title: 'Students', icon: 'account-school-outline', route: 'StudentManagement', color: colors.primary},
  {title: 'Teachers', icon: 'account-tie-outline', route: 'TeacherManagement', color: colors.secondary},
  {title: 'Class Teachers', icon: 'account-switch-outline', route: 'AssignClassTeacher', color: colors.secondary},
  {title: 'Coordinators', icon: 'account-supervisor-outline', route: 'CoordinatorManagement', color: colors.purple},
  {title: 'Accountants', icon: 'account-cash-outline', route: 'AccountantManagement', color: colors.warning},
  {title: 'Attendance', icon: 'calendar-check-outline', route: 'ViewAllAttendance', color: colors.success},
  {title: 'Fees', icon: 'cash-register', route: 'FeeDashboard', color: colors.danger},
  {title: 'Sections', icon: 'select-group', route: 'SectionManagement', color: colors.primary},
  {title: 'Classes', icon: 'google-classroom', route: 'ClassManagement', color: colors.primaryDark},
  {title: 'Reports', icon: 'chart-box-outline', route: 'GlobalReports', color: colors.secondary},
  {title: 'Branch Settings', icon: 'cog-outline', route: 'BranchSettings', color: colors.textMuted},
  {title: 'Parent Data', icon: 'account-child-outline', route: 'GlobalStudents', color: colors.purple},
];

const ModuleCard = ({item, index, onPress}) => (
  <Animated.View
    style={styles.moduleWrap}>
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.moduleCard, pressed && {opacity: 0.88}]}>
      <View style={[styles.moduleIcon, {backgroundColor: `${item.color}15`}]}>
        <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
      </View>
      <Text style={styles.moduleTitle} numberOfLines={2}>{item.title}</Text>
    </Pressable>
  </Animated.View>
);

const BranchOperationsDashboard = ({navigation, route}) => {
  const dispatch = useDispatch();
  const {branchId} = route.params || {};

  const detailsQuery = useQuery({
    queryKey: ['mainAdminBranchOperations', branchId],
    queryFn: () => mainAdminService.getBranchDetails(branchId, {forceRefresh: true}),
    enabled: Boolean(branchId)});

  useEffect(() => {
    if (detailsQuery.data?.branch) {
      const context = buildMainAdminBranchContext(detailsQuery.data.branch);
      saveMainAdminBranchContext(context);
      dispatch(enterMainAdminBranchContext(context));
    }
  }, [detailsQuery.data?.branch, dispatch]);

  const leaveContext = () => {
    clearStoredBranchContext();
    dispatch(clearMainAdminBranchContext());
    navigation.navigate('BranchContext');
  };

  if (detailsQuery.isLoading && !detailsQuery.data) {
    return <LoadingScreen message="Loading branch operations" />;
  }

  if (!detailsQuery.data?.branch) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Branch unavailable"
          message={detailsQuery.error?.message || 'Select a branch to enter operations.'}
        />
      </View>
    );
  }

  const {branch, summary} = detailsQuery.data;
  const isActive = branch.isActive !== false;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Hero ── */}
      <Animated.View style={styles.header}>
        <View style={styles.headerDecor} />
        <Text style={styles.headerOverline}>Main Admin · Branch Context</Text>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle} numberOfLines={2}>{branch.name}</Text>
          <View style={[styles.activeBadge, {backgroundColor: isActive ? 'rgba(34,197,94,0.22)' : 'rgba(239,68,68,0.22)'}]}>
            <View style={[styles.activeDot, {backgroundColor: isActive ? colors.success : colors.danger}]} />
            <Text style={[styles.activeBadgeText, {color: isActive ? '#86efac' : '#fca5a5'}]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        {branch.branchCode ? (
          <View style={styles.codePill}>
            <Text style={styles.codePillText}>{branch.branchCode}</Text>
          </View>
        ) : null}

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          {[
            {label: 'Students', value: summary?.totalStudents ?? 0},
            {label: 'Faculty & Staff', value: summary?.totalTeachers ?? 0},
            {label: 'Attendance', value: `${summary?.attendancePercent ?? 0}%`},
            {label: 'Pending Fees', value: formatCurrency(summary?.pendingFees ?? 0)},
          ].map(stat => (
            <View key={stat.label} style={styles.stat}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={leaveContext} style={styles.leaveBtn}>
          <MaterialCommunityIcons name="logout-variant" size={13} color={colors.danger} />
          <Text style={styles.leaveBtnText}>Leave Context</Text>
        </Pressable>
      </Animated.View>

      {/* ── Section header ── */}
      <Text style={styles.sectionLabel}>Branch Modules</Text>

      {/* ── Module grid ── */}
      <FlatList
        data={modules}
        keyExtractor={item => item.title}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperStyle={styles.moduleRow}
        renderItem={({item, index}) => (
          <ModuleCard
            item={item}
            index={index}
            onPress={() => navigation.navigate(item.route, {branchId: branch.id})}
          />
        )}
      />

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},

  header: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 90,
    height: 150,
    position: 'absolute',
    right: -30,
    top: -50,
    width: 150},
  headerOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  headerRow: {alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm},
  headerTitle: {color: colors.white, flex: 1, fontSize: 22, fontWeight: '800'},
  activeBadge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4},
  activeDot: {borderRadius: radius.pill, height: 6, width: 6},
  activeBadgeText: {fontSize: 10, fontWeight: '700'},
  codePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.sm,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2},
  codePillText: {color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700'},

  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg},
  stat: {
    alignItems: 'center',
    borderRightColor: 'rgba(255,255,255,0.12)',
    borderRightWidth: 1,
    flex: 1},
  statValue: {color: colors.white, fontSize: 15, fontWeight: '800'},
  statLabel: {color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase'},

  leaveBtn: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm},
  leaveBtnText: {color: colors.danger, fontSize: 12, fontWeight: '700'},

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: spacing.md,
    textTransform: 'uppercase'},

  moduleRow: {gap: spacing.sm, marginBottom: spacing.sm},
  moduleWrap: {flex: 1},
  moduleCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.clay},
  moduleIcon: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 44,
    justifyContent: 'center',
    width: 44},
  moduleTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center'}});

export default BranchOperationsDashboard;
