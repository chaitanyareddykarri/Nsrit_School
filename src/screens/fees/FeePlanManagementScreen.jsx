import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, SearchBar} from '../../components';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const FeePlanManagementScreen = ({navigation}) => {
  const access = useFeeAccess();
  const [query, setQuery] = useState('');
  const canManagePlans = feeService.canManageFeePlans(access.role);
  const {data: records = [], isLoading, error} = useQuery({
    queryKey: ['feeRecords', access.branchId, access.wing],
    queryFn: () => feeService.getFeeRecords(access),
    enabled: Boolean(access.branchId)});
  const summary = feeService.getFeeSummary(records);
  const filtered = useMemo(
    () =>
      records.filter(item =>
        `${item.studentName} ${item.admissionNumber} ${item.className} ${item.sectionName}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, records],
  );

  const collectionRate = summary?.collectionRate || 0;

  return (
    <View style={styles.root}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ── Hero ── */}
            <Animated.View style={styles.hero}>
              <View style={styles.heroDecor} />
              <Text style={styles.heroOverline}>Fee</Text>
              <Text style={styles.heroTitle}>Fee Plans</Text>
              <Text style={styles.heroSub}>Assign and review student fee plans</Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{formatCurrency(summary?.totalFee || 0)}</Text>
                  <Text style={styles.heroStatLabel}>Assigned</Text>
                </View>
                <View style={styles.statSep} />
                <View style={styles.heroStat}>
                  <Text style={[styles.heroStatValue, {color: '#86efac'}]}>{formatCurrency(summary?.paidAmount || 0)}</Text>
                  <Text style={styles.heroStatLabel}>Collected</Text>
                </View>
                <View style={styles.statSep} />
                <View style={styles.heroStat}>
                  <Text style={[styles.heroStatValue, {color: summary?.dueAmount > 0 ? '#fca5a5' : '#86efac'}]}>
                    {formatCurrency(summary?.dueAmount || 0)}
                  </Text>
                  <Text style={styles.heroStatLabel}>Pending</Text>
                </View>
              </View>
              {/* progress bar */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, {width: `${collectionRate}%`}]} />
              </View>
              <Text style={styles.progressLabel}>{collectionRate}% collected</Text>
            </Animated.View>

            {/* ── Quick actions ── */}
            {canManagePlans ? (
              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => navigation.navigate('CreateFeePlan')}
                  style={styles.actionBtn}>
                  <MaterialCommunityIcons name="book-edit-outline" size={15} color={colors.secondary} />
                  <Text style={styles.actionBtnText}>Create Fee Plan</Text>
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate('ClassFeeManagement')}
                  style={styles.actionBtn}>
                  <MaterialCommunityIcons name="google-classroom" size={15} color={colors.secondary} />
                  <Text style={styles.actionBtnText}>Class Fees</Text>
                </Pressable>
              </View>
            ) : null}

            <SearchBar value={query} onChangeText={setQuery} placeholder="Search student, admission no, class" />
          </View>
        }
        renderItem={({item, index}) => (
          <Animated.View>
            <Pressable
              onPress={() => navigation.navigate('StudentFeeProfile', {studentId: item.studentId})}
              style={({pressed}) => [styles.planCard, pressed && {opacity: 0.88}]}>
              <View style={styles.planInfo}>
                <Text style={styles.planName} numberOfLines={1}>{item.studentName}</Text>
                <Text style={styles.planMeta}>
                  {item.className}-{item.sectionName} · #{item.admissionNumber}
                </Text>
                <Text style={styles.planPayment}>
                  Paid {formatCurrency(item.paidAmount)} · Pending {formatCurrency(item.dueAmount)}
                </Text>
              </View>
              <View style={styles.planRight}>
                <Text style={styles.planTotal}>{formatCurrency(item.totalFee)}</Text>
                <MaterialCommunityIcons name="chevron-right" size={14} color={colors.textMuted} />
              </View>
            </Pressable>
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState
            title={isLoading ? 'Loading fee plans' : 'No fee plans'}
            message={error?.message || 'Create fee plans for students.'}
          />
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

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
  heroOverline: {color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase'},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginBottom: spacing.md, marginTop: 4},
  heroStats: {borderTopColor: 'rgba(255,255,255,0.12)', borderTopWidth: 1, flexDirection: 'row', paddingTop: spacing.md, marginBottom: spacing.sm},
  heroStat: {alignItems: 'center', flex: 1},
  heroStatValue: {color: colors.white, fontSize: 13, fontWeight: '800'},
  heroStatLabel: {color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase'},
  statSep: {backgroundColor: 'rgba(255,255,255,0.12)', width: 1},
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    height: 5,
    overflow: 'hidden',
    marginBottom: 4},
  progressFill: {backgroundColor: '#86efac', borderRadius: radius.pill, height: '100%'},
  progressLabel: {color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600'},

  actionsRow: {flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md},
  actionBtn: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    ...shadows.clay},
  actionBtnText: {color: colors.secondary, fontSize: 13, fontWeight: '700'},

  planCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.clay},
  planInfo: {flex: 1, minWidth: 0},
  planName: {...typography.bodyBold, color: colors.text},
  planMeta: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  planPayment: {color: colors.textSoft, fontSize: 10, fontWeight: '500', marginTop: 2},
  planRight: {alignItems: 'flex-end', flexDirection: 'row', gap: spacing.xs},
  planTotal: {color: colors.text, fontSize: 13, fontWeight: '800'}});

export default FeePlanManagementScreen;
