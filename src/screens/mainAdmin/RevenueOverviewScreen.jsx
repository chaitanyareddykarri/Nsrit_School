import React from 'react';
import {ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {formatCurrency} from '../../utils/formatters/currency';
import {colors, radius, shadows, spacing} from '../../theme';

const MetricCard = ({icon, iconColor, iconBg, label, value, sub, index}) => (
  <Animated.View
    style={styles.metricCard}>
    <View style={[styles.metricIcon, {backgroundColor: iconBg}]}>
      <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
    </View>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, {color: iconColor}]}>{value}</Text>
    {sub ? <Text style={styles.metricSub}>{sub}</Text> : null}
  </Animated.View>
);

const ProgressRow = ({label, value, total, color}) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={[styles.progressPct, {color}]}>{pct}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, {width: `${pct}%`, backgroundColor: color}]} />
      </View>
      <Text style={styles.progressValue}>{formatCurrency(value)}</Text>
    </View>
  );
};

const RevenueOverviewScreen = ({navigation}) => {
  const {data: stats, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ['mainAdminRevenue'],
    queryFn: () => mainAdminService.getDashboardStatistics({forceRefresh: true}),
    staleTime: 2 * 60 * 1000});

  const collected = stats?.branchWiseCollection || 0;
  const dues = stats?.branchWiseDues || 0;
  const concessions = stats?.branchWiseConcessions || 0;
  const total = collected + dues;

  if (isLoading && !stats) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading revenue data…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[colors.primary]} />}>

      {/* Hero */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.heroIconWrap}>
          <MaterialCommunityIcons name="currency-inr" size={36} color="rgba(255,255,255,0.9)" />
        </View>
        <Text style={styles.heroTitle}>Revenue Overview</Text>
        <Text style={styles.heroSub}>Fee collection across all branches</Text>
        <View style={styles.heroBig}>
          <Text style={styles.heroBigLabel}>Total Collected</Text>
          <Text style={styles.heroBigValue}>{formatCurrency(collected)}</Text>
        </View>
      </Animated.View>

      {/* Metric cards */}
      <View style={styles.metricGrid}>
        <MetricCard
          index={0}
          icon="check-circle-outline"
          iconColor={colors.success}
          iconBg={colors.successSoft}
          label="Collected"
          value={formatCurrency(collected)}
          sub={`${total > 0 ? Math.round((collected / total) * 100) : 0}% of total`}
        />
        <MetricCard
          index={1}
          icon="alert-circle-outline"
          iconColor={colors.danger}
          iconBg={colors.dangerSoft}
          label="Outstanding"
          value={formatCurrency(dues)}
          sub={`${total > 0 ? Math.round((dues / total) * 100) : 0}% pending`}
        />
        <MetricCard
          index={2}
          icon="tag-heart-outline"
          iconColor={colors.warning}
          iconBg={colors.warningSoft}
          label="Concessions"
          value={formatCurrency(concessions)}
          sub="Waivers granted"
        />
        <MetricCard
          index={3}
          icon="account-group-outline"
          iconColor={colors.primary}
          iconBg={colors.primarySoft}
          label="Students"
          value={String(stats?.totalStudents || 0)}
          sub="Enrolled"
        />
      </View>

      {/* Collection breakdown */}
      <Animated.View style={styles.card}>
        <Text style={styles.cardTitle}>Collection Breakdown</Text>
        <ProgressRow label="Collected" value={collected} total={total} color={colors.success} />
        <View style={styles.rowDivider} />
        <ProgressRow label="Outstanding Dues" value={dues} total={total} color={colors.danger} />
        {concessions > 0 ? (
          <>
            <View style={styles.rowDivider} />
            <ProgressRow label="Concessions Given" value={concessions} total={total + concessions} color={colors.warning} />
          </>
        ) : null}
      </Animated.View>

      {/* Branch stats */}
      <Animated.View style={styles.card}>
        <Text style={styles.cardTitle}>System Overview</Text>
        {[
          {icon: 'office-building-outline', label: 'Active Branches', value: stats?.activeBranches || 0, color: colors.primary},
          {icon: 'account-school-outline', label: 'Total Students', value: stats?.totalStudents || 0, color: colors.secondary},
          {icon: 'teach', label: 'Faculty & Staff', value: stats?.totalTeachers || 0, color: colors.info},
          {icon: 'google-classroom', label: 'Active Classes', value: stats?.totalClasses || 0, color: colors.warning},
        ].map((item, i) => (
          <View key={item.label}>
            {i > 0 ? <View style={styles.rowDivider} /> : null}
            <View style={styles.statRow}>
              <View style={[styles.statIcon, {backgroundColor: `${item.color}12`}]}>
                <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={[styles.statValue, {color: item.color}]}>{item.value}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {backgroundColor: colors.background, flex: 1},
  content: {padding: spacing.lg, paddingBottom: 40},
  center: {alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', gap: spacing.md},
  loadingText: {color: colors.textMuted, fontSize: 14},

  hero: {
    alignItems: 'flex-start',
    backgroundColor: colors.primaryDark,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    position: 'relative',
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
    height: 180,
    position: 'absolute',
    right: -50,
    top: -50,
    width: 180},
  heroIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    height: 60,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 60},
  heroTitle: {color: colors.white, fontSize: 20, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4},
  heroBig: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.card,
    marginTop: spacing.lg,
    padding: spacing.md},
  heroBigLabel: {color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase'},
  heroBigValue: {color: colors.white, fontSize: 28, fontWeight: '900', letterSpacing: -0.5},

  metricGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md},
  metricCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flex: 1,
    minWidth: '46%',
    padding: spacing.md,
    ...shadows.clay},
  metricIcon: {alignItems: 'center', borderRadius: radius.md, height: 36, justifyContent: 'center', marginBottom: spacing.sm, width: 36},
  metricLabel: {color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase'},
  metricValue: {fontSize: 18, fontWeight: '900', marginTop: 2},
  metricSub: {color: colors.textSoft, fontSize: 10, marginTop: 2},

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.clay},
  cardTitle: {color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: spacing.md},

  progressRow: {marginBottom: spacing.md},
  progressHeader: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6},
  progressLabel: {color: colors.text, fontSize: 13, fontWeight: '600'},
  progressPct: {fontSize: 12, fontWeight: '800'},
  progressTrack: {backgroundColor: colors.background, borderRadius: radius.pill, height: 6, overflow: 'hidden'},
  progressFill: {borderRadius: radius.pill, height: 6},
  progressValue: {color: colors.textMuted, fontSize: 11, marginTop: 3},
  rowDivider: {backgroundColor: colors.background, height: 1, marginBottom: spacing.md},

  statRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, paddingVertical: 8},
  statIcon: {alignItems: 'center', borderRadius: radius.sm, height: 32, justifyContent: 'center', width: 32},
  statLabel: {color: colors.text, flex: 1, fontSize: 13, fontWeight: '600'},
  statValue: {fontSize: 16, fontWeight: '800'}});

export default RevenueOverviewScreen;
