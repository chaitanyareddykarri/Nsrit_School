import React from 'react';
import {ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View, Text} from 'react-native';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {formatCurrency} from '../../utils/formatters/currency';
import {colors, radius, shadows, spacing} from '../../theme';

const StatCard = ({icon, iconColor, iconBg, label, value, sub, index}) => (
  <Animated.View
    style={styles.statCard}>
    <View style={[styles.statIcon, {backgroundColor: iconBg}]}>
      <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
    </View>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, {color: iconColor}]}>{value}</Text>
    {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
  </Animated.View>
);

const ClassRow = ({item, index}) => {
  const pct = item.totalFee > 0 ? Math.round((item.paidAmount / item.totalFee) * 100) : 0;
  return (
    <View>
      {index > 0 ? <View style={styles.rowDivider} /> : null}
      <View style={styles.classRow}>
        <View style={styles.classMeta}>
          <Text style={styles.className}>{item.className}</Text>
          <Text style={styles.classStudents}>{item.students} students</Text>
        </View>
        <View style={styles.classRight}>
          <Text style={[styles.classPct, {color: pct >= 75 ? colors.success : pct >= 50 ? colors.warning : colors.danger}]}>
            {pct}%
          </Text>
          <View style={styles.classTrack}>
            <View style={[styles.classFill, {width: `${pct}%`, backgroundColor: pct >= 75 ? colors.success : pct >= 50 ? colors.warning : colors.danger}]} />
          </View>
          <Text style={styles.classDue}>{formatCurrency(item.dueAmount)} due</Text>
        </View>
      </View>
    </View>
  );
};

const BranchAnalyticsScreen = () => {
  const {user} = useSelector(state => state.auth);
  const access = useFeeAccess();

  const {data, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ['branchAnalytics', access.branchId],
    queryFn: () => feeService.getFeeReports(access),
    enabled: Boolean(access.branchId),
    staleTime: 2 * 60 * 1000});

  const summary = data?.summary || {};
  const classWise = (data?.classWise || []).sort((a, b) => b.totalFee - a.totalFee);
  const collected = summary.paidAmount || 0;
  const dues = summary.dueAmount || 0;
  const total = summary.totalFee || 0;
  const collectionRate = summary.collectionRate ? Math.round(summary.collectionRate * 100) : 0;
  const studentCount = summary.studentCount || 0;

  if (isLoading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading branch analytics…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[colors.primary]} />}>

      {/* Hero */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.heroIconWrap}>
          <MaterialCommunityIcons name="chart-box-outline" size={32} color="rgba(255,255,255,0.9)" />
        </View>
        <Text style={styles.heroTitle}>{user?.branchName || 'Branch'} Analytics</Text>
        <Text style={styles.heroSub}>Fee collection performance overview</Text>
        <View style={styles.heroBig}>
          <View style={styles.heroBigRow}>
            <View>
              <Text style={styles.heroBigLabel}>Collection Rate</Text>
              <Text style={styles.heroBigValue}>{collectionRate}%</Text>
            </View>
            <View>
              <Text style={styles.heroBigLabel}>Total Collected</Text>
              <Text style={styles.heroBigValue}>{formatCurrency(collected)}</Text>
            </View>
          </View>
          <View style={styles.heroTrack}>
            <View style={[styles.heroFill, {width: `${collectionRate}%`}]} />
          </View>
        </View>
      </Animated.View>

      {/* Stat grid */}
      <View style={styles.statGrid}>
        <StatCard
          index={0}
          icon="cash-check"
          iconColor={colors.success}
          iconBg={colors.successSoft}
          label="Collected"
          value={formatCurrency(collected)}
          sub={`${collectionRate}% of fees`}
        />
        <StatCard
          index={1}
          icon="cash-remove"
          iconColor={colors.danger}
          iconBg={colors.dangerSoft}
          label="Outstanding"
          value={formatCurrency(dues)}
          sub="Pending dues"
        />
        <StatCard
          index={2}
          icon="account-school-outline"
          iconColor={colors.primary}
          iconBg={colors.primarySoft}
          label="Students"
          value={String(studentCount)}
          sub="With fee records"
        />
        <StatCard
          index={3}
          icon="tag-heart-outline"
          iconColor={colors.warning}
          iconBg={colors.warningSoft}
          label="Concessions"
          value={formatCurrency(summary.concessionAmount || 0)}
          sub="Waivers granted"
        />
      </View>

      {/* Class-wise breakdown */}
      {classWise.length > 0 ? (
        <Animated.View style={styles.card}>
          <Text style={styles.cardTitle}>Class-wise Collection</Text>
          {classWise.slice(0, 10).map((item, i) => (
            <ClassRow key={item.className} item={item} index={i} />
          ))}
        </Animated.View>
      ) : null}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  content: {padding: spacing.lg, paddingBottom: 40},
  center: {alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', gap: spacing.md},
  loadingText: {color: colors.textMuted, fontSize: 14},

  hero: {
    backgroundColor: colors.purple,
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
  heroIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    height: 60,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 60},
  heroTitle: {color: colors.white, fontSize: 20, fontWeight: '900'},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: spacing.md, marginTop: 3},
  heroBig: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.card,
    padding: spacing.md},
  heroBigRow: {flexDirection: 'row', gap: spacing.xl, marginBottom: spacing.sm},
  heroBigLabel: {color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2, textTransform: 'uppercase'},
  heroBigValue: {color: colors.white, fontSize: 20, fontWeight: '900'},
  heroTrack: {backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.pill, height: 6, overflow: 'hidden'},
  heroFill: {backgroundColor: '#4ADE80', borderRadius: radius.pill, height: 6},

  statGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md},
  statCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flex: 1,
    minWidth: '46%',
    padding: spacing.md,
    ...shadows.clay},
  statIcon: {alignItems: 'center', borderRadius: radius.md, height: 36, justifyContent: 'center', marginBottom: spacing.sm, width: 36},
  statLabel: {color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase'},
  statValue: {fontSize: 18, fontWeight: '900', marginTop: 2},
  statSub: {color: colors.textSoft, fontSize: 10, marginTop: 2},

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    padding: spacing.lg,
    ...shadows.clay},
  cardTitle: {color: colors.text, fontSize: 13, fontWeight: '800', marginBottom: spacing.md},

  classRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, paddingVertical: 10},
  classMeta: {flex: 1},
  className: {color: colors.text, fontSize: 13, fontWeight: '700'},
  classStudents: {color: colors.textMuted, fontSize: 10, marginTop: 1},
  classRight: {alignItems: 'flex-end', width: 100},
  classPct: {fontSize: 14, fontWeight: '800', marginBottom: 3},
  classTrack: {backgroundColor: colors.background, borderRadius: radius.pill, height: 4, overflow: 'hidden', width: 100},
  classFill: {borderRadius: radius.pill, height: 4},
  classDue: {color: colors.textMuted, fontSize: 9, marginTop: 3},
  rowDivider: {backgroundColor: colors.borderLight, height: 1}});

export default BranchAnalyticsScreen;
