import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, RefreshControl, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, LoadingScreen, SearchBar} from '../../components';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {
  buildMainAdminBranchContext,
  saveMainAdminBranchContext} from '../../services/mainAdmin/mainAdminContextService';
import {enterMainAdminBranchContext} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const MetricCell = ({label, value, color = colors.primary}) => (
  <View style={styles.metricCell}>
    <Text style={[styles.metricValue, {color}]}>{value ?? 0}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const BranchCard = ({branch, onEnter, index}) => {
  const isActive = branch.isActive !== false;

  return (
    <Animated.View>
      <View
        style={[
          styles.branchCard,
          isActive && styles.branchCardActive,
        ]}>
        {/* Card top */}
        <View style={styles.cardTop}>
          <View
            style={[
              styles.branchIcon,
              {backgroundColor: isActive ? `${colors.primary}15` : colors.neutralSoft},
            ]}>
            <MaterialCommunityIcons
              name="office-building"
              size={20}
              color={isActive ? colors.primary : colors.textMuted}
            />
          </View>
          <View style={styles.branchInfo}>
            <Text style={styles.branchName} numberOfLines={1}>
              {branch.name}
            </Text>
            <View style={styles.branchCodeRow}>
              <View style={styles.codeChip}>
                <Text style={styles.codeText}>{branch.branchCode}</Text>
              </View>
              <View
                style={[
                  styles.statusDot,
                  {backgroundColor: isActive ? colors.success : colors.danger},
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  {color: isActive ? colors.success : colors.danger},
                ]}>
                {isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metricsRow}>
          <MetricCell label="Students" value={branch.totalStudents} color={colors.primary} />
          <View style={styles.metricSep} />
          <MetricCell label="Faculty & Staff" value={branch.totalTeachers} color={colors.purple} />
          <View style={styles.metricSep} />
          <MetricCell
            label="Coordinators"
            value={branch.totalCoordinators}
            color={colors.secondary}
          />
          <View style={styles.metricSep} />
          <MetricCell
            label="Principal"
            value={branch.principalAvailable ? '✓' : '—'}
            color={branch.principalAvailable ? colors.success : colors.textMuted}
          />
        </View>

        {branch.city ? (
          <View style={styles.locationRow}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={12}
              color={colors.textSoft}
            />
            <Text style={styles.locationText}>{branch.city}</Text>
          </View>
        ) : null}

        {/* Enter button */}
        <Pressable
          onPress={() => onEnter(branch)}
          style={styles.enterBtn}>
          <MaterialCommunityIcons name="login" size={15} color={colors.white} />
          <Text style={styles.enterBtnText}>Enter Branch Context</Text>
          <MaterialCommunityIcons name="chevron-right" size={14} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

const BranchContextScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');

  const branchesQuery = useQuery({
    queryKey: ['mainAdminBranches'],
    queryFn: () => mainAdminService.getAllBranches({forceRefresh: true})});

  const branches = useMemo(() => {
    const needle = searchText.trim().toLowerCase();
    if (!needle) {return branchesQuery.data || [];}
    return (branchesQuery.data || []).filter(branch =>
      [branch.name, branch.branchCode, branch.city, branch.phone, branch.email]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(needle)),
    );
  }, [branchesQuery.data, searchText]);

  const enterBranch = branch => {
    const context = buildMainAdminBranchContext(branch);
    saveMainAdminBranchContext(context);
    dispatch(enterMainAdminBranchContext(context));
    navigation.navigate('BranchOperationsDashboard', {branchId: branch.id});
  };

  if (branchesQuery.isLoading && !branchesQuery.data) {
    return <LoadingScreen message="Loading branches" />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <FlatList
        data={branches}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={branchesQuery.isFetching}
            onRefresh={branchesQuery.refetch}
          />
        }
        ListHeaderComponent={
          <View>
            {/* ── Header ── */}
            <Animated.View
              style={styles.header}>
              <View style={styles.headerDecor1} />
              <View style={styles.headerDecor2} />
              <View style={styles.headerRow}>
                <View style={styles.headerIcon}>
                  <MaterialCommunityIcons
                    name="office-building-cog"
                    size={22}
                    color={colors.white}
                  />
                </View>
                <View style={styles.headerCopy}>
                  <Text style={styles.headerOverline}>Main Admin</Text>
                  <Text style={styles.headerTitle}>Branch Context</Text>
                </View>
              </View>
              <Text style={styles.headerSub}>
                Select a branch to operate with full administrative access
              </Text>
              {branches.length > 0 ? (
                <View style={styles.branchCount}>
                  <Text style={styles.branchCountText}>
                    {branches.length} branch{branches.length !== 1 ? 'es' : ''} available
                  </Text>
                </View>
              ) : null}
            </Animated.View>

            {/* ── Search ── */}
            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search by name, code, city, phone"
            />

            {branchesQuery.error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={14}
                  color={colors.danger}
                />
                <Text style={styles.errorText}>
                  {branchesQuery.error.message}
                </Text>
              </View>
            ) : null}

            {branches.length > 0 ? (
              <Text style={styles.resultMeta}>
                {branches.length} result{branches.length !== 1 ? 's' : ''}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <BranchCard
            branch={item}
            onEnter={enterBranch}
            index={index}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No branches found"
            message={
              searchText.trim()
                ? 'No branches match your search.'
                : 'Create a branch before entering context.'
            }
          />
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingBottom: spacing.xxl},

  // Header
  header: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  headerDecor1: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 140,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 140},
  headerDecor2: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 60,
    bottom: -20,
    height: 90,
    left: -10,
    position: 'absolute',
    width: 90},
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm},
  headerIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    height: 46,
    justifyContent: 'center',
    width: 46},
  headerCopy: {flex: 1},
  headerOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
    textTransform: 'uppercase'},
  headerTitle: {color: colors.white, fontSize: 20, fontWeight: '800'},
  headerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: spacing.md},
  branchCount: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4},
  branchCountText: {color: colors.white, fontSize: 11, fontWeight: '700'},

  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md},
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},

  resultMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'},

  // Branch card
  branchCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.clay},
  branchCardActive: {
    borderColor: `${colors.primary}25`},
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md},
  branchIcon: {
    alignItems: 'center',
    borderRadius: radius.card,
    height: 48,
    justifyContent: 'center',
    width: 48},
  branchInfo: {flex: 1},
  branchName: {color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 5},
  branchCodeRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  codeChip: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2},
  codeText: {color: colors.primary, fontSize: 10, fontWeight: '800'},
  statusDot: {borderRadius: radius.pill, height: 7, width: 7},
  statusText: {fontSize: 11, fontWeight: '700'},

  // Metrics
  metricsRow: {
    backgroundColor: colors.background,
    borderRadius: radius.card,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
    padding: spacing.md},
  metricCell: {alignItems: 'center', flex: 1, gap: 3},
  metricValue: {fontSize: 16, fontWeight: '800'},
  metricLabel: {color: colors.textMuted, fontSize: 10, fontWeight: '600'},
  metricSep: {backgroundColor: colors.borderLight, width: 1},

  // Location
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.md},
  locationText: {color: colors.textSoft, fontSize: 11, fontWeight: '600'},

  // Enter button
  enterBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    ...shadows.fab},
  enterBtnText: {
    color: colors.white,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center'}});

export default BranchContextScreen;
