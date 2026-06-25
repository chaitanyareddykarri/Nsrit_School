import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {AnimatedProgressBar} from '../../components';
import useFeeAccess from '../../hooks/useFeeAccess';
import feeService from '../../services/fees/feeService';
import {formatCurrency} from '../../utils/formatters/currency';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const MetricRow = ({icon, label, value, color, index}) => (
  <Animated.View
    style={styles.metricRow}>
    <View style={[styles.metricIcon, {backgroundColor: `${color}15`}]}>
      <MaterialCommunityIcons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, {color}]}>{value}</Text>
  </Animated.View>
);

const ClassRow = ({item, index}) => {
  const pct = item.totalFee > 0 ? Math.round((item.paidAmount / item.totalFee) * 100) : 0;
  const barColor = pct >= 75 ? colors.success : pct >= 50 ? colors.warning : colors.danger;
  return (
    <Animated.View
      style={styles.classRow}>
      <View style={styles.classTop}>
        <View style={styles.classInfo}>
          <Text style={styles.className}>{item.className || 'Unknown'}</Text>
          <Text style={styles.classSection}>{item.sectionName || ''}</Text>
        </View>
        <Text style={[styles.classPct, {color: barColor}]}>{pct}%</Text>
      </View>
      <AnimatedProgressBar
        progress={pct}
        color={barColor}
        trackColor={colors.border}
        height={5}
      />
      <View style={styles.classMeta}>
        <Text style={styles.classMetaText}>
          {formatCurrency(item.paidAmount || 0)} / {formatCurrency(item.totalFee || 0)}
        </Text>
        <Text style={[styles.classDue, {color: colors.danger}]}>
          Due: {formatCurrency(item.dueAmount || 0)}
        </Text>
      </View>
    </Animated.View>
  );
};

const WingFeesScreen = ({navigation}) => {
  const access = useFeeAccess();

  const {data, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ['wingFees', access.branchId, access.wingId],
    queryFn: () => feeService.getFeeReports(access),
    enabled: Boolean(access.branchId)});

  const summary = data?.summary || {};
  const classWise = [...(data?.classWise || [])].sort(
    (a, b) => (b.totalFee || 0) - (a.totalFee || 0),
  );
  const collectionRate = Math.round((summary.collectionRate || 0) * 100);
  const barColor = collectionRate >= 75 ? colors.success : collectionRate >= 50 ? colors.warning : colors.danger;

  if (isLoading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          colors={[colors.primary]}
        />
      }>

      {/* ── Hero ── */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.heroRow}>
          <MaterialCommunityIcons name="finance" size={26} color={colors.white} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Wing Fee Overview</Text>
            <Text style={styles.heroSub}>
              {access.wing || 'My Wing'} · Fee collection status
            </Text>
          </View>
        </View>
        <Text style={styles.heroRate}>{collectionRate}%</Text>
        <Text style={styles.heroRateLabel}>Collection Rate</Text>
        <AnimatedProgressBar
          progress={collectionRate}
          color={colors.white}
          trackColor="rgba(255,255,255,0.25)"
          height={6}
        />
      </Animated.View>

      {/* ── Summary metrics ── */}
      <Animated.View
        style={styles.card}>
        <Text style={styles.cardTitle}>Fee Summary</Text>
        <MetricRow
          icon="cash-check"
          label="Total Collected"
          value={formatCurrency(summary.paidAmount || 0)}
          color={colors.success}
          index={0}
        />
        <View style={styles.rowDiv} />
        <MetricRow
          icon="cash-clock"
          label="Outstanding Due"
          value={formatCurrency(summary.dueAmount || 0)}
          color={colors.danger}
          index={1}
        />
        <View style={styles.rowDiv} />
        <MetricRow
          icon="tag-outline"
          label="Concessions"
          value={formatCurrency(summary.concessionAmount || 0)}
          color={colors.info}
          index={2}
        />
        <View style={styles.rowDiv} />
        <MetricRow
          icon="account-school-outline"
          label="Total Students"
          value={String(summary.studentCount || 0)}
          color={colors.primary}
          index={3}
        />
      </Animated.View>

      {/* ── Class-wise breakdown ── */}
      {classWise.length > 0 ? (
        <Animated.View
          style={styles.card}>
          <Text style={styles.cardTitle}>Class-wise Breakdown</Text>
          {classWise.map((item, i) => (
            <ClassRow key={`${item.classId}_${item.sectionId}`} item={item} index={i} />
          ))}
        </Animated.View>
      ) : null}

      {/* ── Quick actions ── */}
      <Animated.View
        style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionRow}>
          <MaterialCommunityIcons
            name="account-clock-outline"
            size={16}
            color={colors.danger}
          />
          <Text
            style={styles.actionLink}
            onPress={() => navigation.navigate('DueStudents')}>
            View Due Students
          </Text>
        </View>
        <View style={styles.rowDiv} />
        <View style={styles.actionRow}>
          <MaterialCommunityIcons
            name="cash-register"
            size={16}
            color={colors.success}
          />
          <Text
            style={styles.actionLink}
            onPress={() => navigation.navigate('FeeDashboard')}>
            Full Fee Dashboard
          </Text>
        </View>
      </Animated.View>

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.lg},
  center: {alignItems: 'center', flex: 1, justifyContent: 'center'},

  hero: {
    backgroundColor: colors.secondary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 90,
    height: 160,
    position: 'absolute',
    right: -30,
    top: -50,
    width: 160},
  heroRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md},
  heroCopy: {flex: 1},
  heroTitle: {color: colors.white, fontSize: 18, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2},
  heroRate: {color: colors.white, fontSize: 36, fontWeight: '900', lineHeight: 42},
  heroRateLabel: {color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '600', marginBottom: spacing.md},

  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg},
  cardTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.md},
  metricRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm},
  metricIcon: {alignItems: 'center', borderRadius: radius.sm, height: 34, justifyContent: 'center', width: 34},
  metricLabel: {...typography.body, color: colors.textMuted, flex: 1},
  metricValue: {fontSize: 14, fontWeight: '800'},
  rowDiv: {backgroundColor: colors.borderLight, height: 1},

  classRow: {marginBottom: spacing.md},
  classTop: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs},
  classInfo: {flex: 1},
  className: {...typography.bodyBold, color: colors.text, fontSize: 13},
  classSection: {...typography.caption, color: colors.textMuted},
  classPct: {fontSize: 13, fontWeight: '800'},
  classMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs},
  classMetaText: {...typography.caption, color: colors.textMuted},
  classDue: {...typography.caption, fontWeight: '700'},

  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm},
  actionLink: {color: colors.primary, fontSize: 13, fontWeight: '700'}});

export default WingFeesScreen;
