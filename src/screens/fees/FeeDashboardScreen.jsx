import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {AnimatedProgressBar, EmptyState, FeeCard, FilterTabs, SearchBar, SkeletonLoader} from '../../components';
import {FEE_STATUS} from '../../config/constants';
import useFeeAccess from '../../hooks/useFeeAccess';
import {colors, radius, shadows, spacing} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';
import {fetchFees, setSelectedStudentFee} from '../../store/slices/feeSlice';
import feeService from '../../services/fees/feeService';

const tabs = [
  {label: 'All', value: 'all'},
  {label: 'Paid', value: FEE_STATUS.PAID},
  {label: 'Partial', value: FEE_STATUS.PARTIAL},
  {label: 'Due', value: FEE_STATUS.DUE},
  {label: 'Overdue', value: FEE_STATUS.OVERDUE},
];

const QuickAction = ({icon, label, sub, onPress}) => (
  <Pressable
    onPress={onPress}
    style={({pressed}) => [styles.quickBtn, pressed && {opacity: 0.88}]}>
    <View style={styles.quickIcon}>
      <MaterialCommunityIcons name={icon} size={20} color={colors.secondary} />
    </View>
    <Text style={styles.quickLabel}>{label}</Text>
    <Text style={styles.quickSub}>{sub}</Text>
  </Pressable>
);

const FeeDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const access = useFeeAccess();
  const {records, summary, loading} = useSelector(state => state.fees);
  const canManagePlans = feeService.canManageFeePlans(access.role);
  const canRecordPayments = feeService.canRecordPayments(access.role);
  const canViewReports = feeService.canViewReports(access.role);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchFees(access));
  }, [access, dispatch]);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchFees(access));
    }, [access, dispatch]),
  );

  // Academic-year filter built from the years present in the loaded records.
  const yearTabs = useMemo(() => {
    const years = [...new Set(records.map(item => item.academicYear).filter(Boolean))].sort((a, b) => b - a);
    return [{label: 'All Years', value: 'all'}, ...years.map(y => ({label: `AY ${y}`, value: String(y)}))];
  }, [records]);

  // Records narrowed to the selected academic year (drives both stats and list).
  const yearRecords = useMemo(
    () => (yearFilter === 'all' ? records : records.filter(item => String(item.academicYear) === yearFilter)),
    [records, yearFilter],
  );

  // Recompute the summary so the stat card reflects the selected year.
  const displaySummary = useMemo(
    () => (yearFilter === 'all' ? summary : feeService.getFeeSummary(yearRecords)),
    [summary, yearFilter, yearRecords],
  );

  const filteredRecords = useMemo(
    () =>
      yearRecords.filter(item => {
        const matchesStatus = status === 'all' || item.status === status;
        const matchesQuery = item.studentName.toLowerCase().includes(query.toLowerCase());
        return matchesStatus && matchesQuery;
      }),
    [query, yearRecords, status],
  );

  const openDetails = item => {
    dispatch(setSelectedStudentFee(item));
    navigation.navigate('StudentFeeDetails');
  };

  const collectionRatePct = Math.round((displaySummary.collectionRate || 0) * 100);
  const rateColor = collectionRatePct >= 80 ? colors.success : collectionRatePct >= 50 ? colors.warning : colors.danger;

  const header = useMemo(() => (
    <View>
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <Text style={styles.heroOverline}>Fee Desk</Text>
        <Text style={styles.heroTitle}>Fee Dashboard</Text>
        <Text style={styles.heroSub}>Collection, dues, and student ledger overview</Text>
      </Animated.View>

      {yearTabs.length > 1 ? (
        <FilterTabs tabs={yearTabs} value={yearFilter} onChange={setYearFilter} />
      ) : null}

      <Animated.View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryLabel}>Collection Rate</Text>
            <Text style={styles.summarySub}>
              {displaySummary.paidStudents || 0} paid · {displaySummary.dueStudents || 0} pending
            </Text>
          </View>
          <Text style={[styles.summaryPct, {color: rateColor}]}>{collectionRatePct}%</Text>
        </View>
        <AnimatedProgressBar
          progress={collectionRatePct}
          color={rateColor}
          trackColor={colors.border}
          height={8}
        />
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{formatCurrency(displaySummary.totalFee)}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statBox}>
            <Text style={[styles.statVal, {color: colors.success}]}>{formatCurrency(displaySummary.paidAmount)}</Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
          <View style={styles.statSep} />
          <Pressable style={styles.statBox} onPress={() => navigation.navigate('DueStudents')}>
            <Text style={[styles.statVal, {color: colors.danger}]}>{formatCurrency(displaySummary.dueAmount)}</Text>
            <Text style={styles.statLabel}>Due ↗</Text>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View style={styles.quickGrid}>
        {canManagePlans ? (
          <QuickAction icon="google-classroom" label="Class Fees" sub="Setup" onPress={() => navigation.navigate('ClassFeeManagement')} />
        ) : null}
        {canManagePlans ? (
          <QuickAction icon="book-edit-outline" label="Fee Plans" sub="Manage" onPress={() => navigation.navigate('FeePlanManagement')} />
        ) : null}
        {canRecordPayments ? (
          <QuickAction icon="cash-plus" label="Collection" sub="Record" onPress={() => navigation.navigate('FeeCollection')} />
        ) : null}
        {canRecordPayments ? (
          <QuickAction icon="history" label="History" sub="View" onPress={() => navigation.navigate('PaymentHistory')} />
        ) : null}
        <QuickAction icon="book-open-variant" label="Ledger" sub="Open" onPress={() => navigation.navigate('FeeLedger')} />
        {canViewReports ? (
          <QuickAction icon="file-chart-outline" label="Reports" sub="View" onPress={() => navigation.navigate('FeeReports')} />
        ) : null}
      </Animated.View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>Student Ledgers</Text>
      </View>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search student fees" />
      <FilterTabs tabs={tabs} value={status} onChange={setStatus} />
    </View>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [yearTabs, yearFilter, displaySummary, collectionRatePct, rateColor, query, status,
      canManagePlans, canRecordPayments, canViewReports]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <FlatList
      data={filteredRecords}
      keyExtractor={item => item.id}
      style={styles.root}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshing={loading}
      ListHeaderComponent={header}
      renderItem={({item, index}) => (
        <Animated.View>
          <FeeCard student={item} onPress={() => openDetails(item)} />
        </Animated.View>
      )}
      ListEmptyComponent={
        loading ? (
          <SkeletonLoader rows={4} />
        ) : (
          <EmptyState title="No fee records" message="Try another filter or search term." />
        )
      }
    />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

  hero: {
    backgroundColor: colors.secondary,
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
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 4},

  summaryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.clay},
  summaryTop: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md},
  summaryLabel: {color: colors.text, fontSize: 14, fontWeight: '700'},
  summarySub: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  summaryPct: {fontSize: 28, fontWeight: '900'},

  statsRow: {flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.lg},
  statBox: {alignItems: 'center', flex: 1},
  statVal: {color: colors.text, fontSize: 14, fontWeight: '800'},
  statLabel: {color: colors.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2},
  statSep: {backgroundColor: colors.border, width: 1},

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md},
  quickBtn: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    gap: 4,
    minWidth: 90,
    padding: spacing.md,
    ...shadows.clay},
  quickIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    marginBottom: 2,
    width: 40},
  quickLabel: {color: colors.text, fontSize: 12, fontWeight: '700', textAlign: 'center'},
  quickSub: {color: colors.textMuted, fontSize: 10, fontWeight: '500', textAlign: 'center'},

  listHeader: {marginBottom: spacing.sm},
  listHeaderText: {color: colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase'}});

export default FeeDashboardScreen;
