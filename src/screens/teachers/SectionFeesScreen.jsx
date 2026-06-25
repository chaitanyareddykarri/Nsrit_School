import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {AnimatedProgressBar, EmptyState} from '../../components';
import useFeeAccess from '../../hooks/useFeeAccess';
import feeService from '../../services/fees/feeService';
import {formatCurrency} from '../../utils/formatters/currency';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const SectionFeesScreen = () => {
  const access = useFeeAccess();

  const {data, error, isLoading} = useQuery({
    queryKey: ['teacherSectionFeeStatus', access.branchId, access.academicClassId, access.sectionId],
    queryFn: () => feeService.getFeeReports(access),
    enabled: Boolean(access.branchId)});

  const summary = data?.summary || {};
  const paidAmount = summary.paidAmount || 0;
  const dueAmount = summary.dueAmount || 0;
  const totalAmount = paidAmount + dueAmount;
  const collectionRate = Math.round((summary.collectionRate || 0) * 100);
  const rateColor =
    collectionRate >= 80 ? colors.success : collectionRate >= 50 ? colors.warning : colors.danger;

  if (error) {
    return (
      <View style={{backgroundColor: colors.background, flex: 1}}>
        <EmptyState title="Unable to load fee status" message={error.message} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <Animated.View
        style={styles.header}>
        <View style={styles.headerDecor} />
        <Text style={styles.headerOverline}>Teacher Portal</Text>
        <Text style={styles.headerTitle}>Section Fee Status</Text>
        <Text style={styles.headerSub}>Read-only fee visibility for your sections</Text>
      </Animated.View>

      {/* ── Collection rate ── */}
      <Animated.View
        style={styles.rateCard}>
        <View style={styles.rateHeader}>
          <View style={styles.rateLeft}>
            <Text style={styles.rateLabel}>Collection Rate</Text>
            <Text style={styles.rateSub}>
              {isLoading ? 'Loading…' : `${formatCurrency(paidAmount)} of ${formatCurrency(totalAmount)}`}
            </Text>
          </View>
          <Text style={[styles.rateValue, {color: rateColor}]}>
            {isLoading ? '—' : `${collectionRate}%`}
          </Text>
        </View>
        <AnimatedProgressBar
          progress={collectionRate}
          color={rateColor}
          trackColor={colors.border}
          height={8}
        />
      </Animated.View>

      {/* ── Stats row ── */}
      <Animated.View
        style={styles.statsRow}>
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="cash-check" size={22} color={colors.success} />
          <Text style={[styles.statValue, {color: colors.success}]}>
            {isLoading ? '—' : formatCurrency(paidAmount)}
          </Text>
          <Text style={styles.statLabel}>Total Paid</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="cash-clock" size={22} color={colors.danger} />
          <Text style={[styles.statValue, {color: colors.danger}]}>
            {isLoading ? '—' : formatCurrency(dueAmount)}
          </Text>
          <Text style={styles.statLabel}>Pending Due</Text>
        </View>
      </Animated.View>

      {/* ── View-only notice ── */}
      <View style={styles.notice}>
        <MaterialCommunityIcons
          name="information-outline"
          size={14}
          color={colors.primary}
        />
        <Text style={styles.noticeText}>
          Fee records are read-only for teachers. Contact the accountant for
          payment updates.
        </Text>
      </View>

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},

  header: {
    backgroundColor: colors.secondary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 120,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 120},
  headerOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 4},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500'},

  rateCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.clay},
  rateHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md},
  rateLeft: {gap: 3},
  rateLabel: {...typography.bodyBold, color: colors.text},
  rateSub: {...typography.caption, color: colors.textMuted},
  rateValue: {fontSize: 28, fontWeight: '900'},

  statsRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    paddingVertical: spacing.xl,
    ...shadows.clay},
  statBox: {alignItems: 'center', gap: spacing.xs},
  statValue: {fontSize: 18, fontWeight: '800'},
  statLabel: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},
  statSep: {backgroundColor: colors.border, width: 1},

  notice: {
    alignItems: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md},
  noticeText: {
    color: colors.primary,
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18}});

export default SectionFeesScreen;
