import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {LoadingScreen} from '../../components';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, shadows, spacing} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const StatCard = ({icon, iconColor, iconBg, title, value, desc, index}) => (
  <Animated.View
    style={styles.statCard}>
    <View style={[styles.statIcon, {backgroundColor: iconBg}]}>
      <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
    </View>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={[styles.statValue, {color: iconColor}]}>{value}</Text>
    <Text style={styles.statDesc}>{desc}</Text>
  </Animated.View>
);

const GlobalAnalyticsScreen = () => {
  const {data: stats, loading} = useAsyncResource(
    options => mainAdminService.getDashboardStatistics(options),
    [],
  );

  if (loading && !stats) {
    return <LoadingScreen message="Loading analytics…" />;
  }

  const cards = [
    {
      icon: 'office-building-outline',
      iconColor: colors.primaryDark,
      iconBg: colors.primarySoft,
      title: 'Branch Growth',
      value: `+${stats?.totalBranches || 0} Registered`,
      desc: 'All school regions running in stable cloud environments.'},
    {
      icon: 'cash-multiple',
      iconColor: colors.success,
      iconBg: colors.successSoft,
      title: 'Revenue Trend',
      value: `${formatCurrency(stats?.revenue || 0)} Paid`,
      desc: 'Fee collection active with average collections monitored.'},
    {
      icon: 'account-group-outline',
      iconColor: colors.secondary,
      iconBg: colors.secondarySoft,
      title: 'User Activity',
      value: `${stats?.totalUsers || 0} Users`,
      desc: 'Live system connections authenticated without errors.'},
    {
      icon: 'account-school-outline',
      iconColor: colors.primary,
      iconBg: colors.primarySoft,
      title: 'Total Students',
      value: `${stats?.totalStudents || 0}`,
      desc: 'Enrolled students across all registered branches.'},
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      <Animated.View style={styles.header}>
        <View style={styles.headerDecor} />
        <Text style={styles.headerOverline}>Main Admin</Text>
        <Text style={styles.headerTitle}>Global Analytics</Text>
        <Text style={styles.headerSub}>Platform performance &amp; growth overview</Text>
      </Animated.View>

      <Text style={styles.sectionLabel}>Key Metrics</Text>

      <View style={styles.grid}>
        {cards.map((card, i) => (
          <StatCard key={card.title} {...card} index={i} />
        ))}
      </View>

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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130},
  headerOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 4},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500'},

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: spacing.md,
    textTransform: 'uppercase'},

  grid: {gap: spacing.sm},
  statCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    padding: spacing.lg,
    ...shadows.clay},
  statIcon: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 44,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 44},
  statTitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    textTransform: 'uppercase'},
  statValue: {fontSize: 20, fontWeight: '800', marginBottom: spacing.xs},
  statDesc: {color: colors.textMuted, fontSize: 11, fontWeight: '500', lineHeight: 15}});

export default GlobalAnalyticsScreen;
