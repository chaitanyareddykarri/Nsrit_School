import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';
import {EmptyState, FilterTabs, PaymentCard} from '../../components';
import useFeeAccess from '../../hooks/useFeeAccess';
import {fetchFees} from '../../store/slices/feeSlice';
import feeService from '../../services/fees/feeService';
import {colors, radius, shadows, spacing} from '../../theme';

const PaymentHistoryScreen = () => {
  const dispatch = useDispatch();
  const access = useFeeAccess();
  const canViewPaymentHistory = feeService.canRecordPayments(access.role);
  const {payments, loading} = useSelector(state => state.fees);
  const [yearFilter, setYearFilter] = useState('all');

  useEffect(() => {
    if (canViewPaymentHistory) {
      dispatch(fetchFees(access));
    }
  }, [access, canViewPaymentHistory, dispatch]);

  // Build an academic-year filter from the years actually present in payments.
  const yearTabs = useMemo(() => {
    const years = [...new Set((payments || []).map(p => p.academicYear).filter(Boolean))].sort((a, b) => b - a);
    return [{label: 'All Years', value: 'all'}, ...years.map(y => ({label: `AY ${y}`, value: String(y)}))];
  }, [payments]);

  const filteredPayments = useMemo(() => {
    if (yearFilter === 'all') {
      return payments || [];
    }
    return (payments || []).filter(p => String(p.academicYear) === yearFilter);
  }, [payments, yearFilter]);

  if (!canViewPaymentHistory) {
    return (
      <View style={styles.denied}>
        <EmptyState
          title="Payment history access denied"
          message="Only accountants and principals can view payment history."
        />
      </View>
    );
  }

  return (
    <FlatList
      data={filteredPayments}
      keyExtractor={item => item.id}
      style={styles.root}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshing={loading}
      ListHeaderComponent={
        <View>
          <Animated.View style={styles.hero}>
            <View style={styles.heroDecor} />
            <Text style={styles.heroOverline}>Fees</Text>
            <Text style={styles.heroTitle}>Payment History</Text>
            <Text style={styles.heroSub}>Cash, UPI, and ledger transactions</Text>
          </Animated.View>
          {yearTabs.length > 1 ? (
            <FilterTabs tabs={yearTabs} value={yearFilter} onChange={setYearFilter} />
          ) : null}
        </View>
      }
      renderItem={({item}) => <PaymentCard payment={item} />}
      ListEmptyComponent={
        <EmptyState title="No payments" message="Payment history will appear here." />
      }
    />
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},
  denied: {backgroundColor: colors.background, flex: 1},
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
    height: 120,
    position: 'absolute',
    right: -20,
    top: -35,
    width: 120},
  heroOverline: {color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase'},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 4}});

export default PaymentHistoryScreen;
