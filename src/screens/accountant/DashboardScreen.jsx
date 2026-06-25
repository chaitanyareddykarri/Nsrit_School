import React, {useCallback, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {
  AnimatedProgressBar,
  EmptyState,
  PaymentCard,
  SectionHeader} from '../../components';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {fetchFees} from '../../store/slices/feeSlice';
import {formatCurrency} from '../../utils/formatters/currency';
import {toISODate} from '../../utils/helpers/dateHelpers';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import UserMenuDrawer from '../../components/common/UserMenuDrawer';

const isSameMonth = date => {
  const v = new Date(date);
  const n = new Date();
  return v.getFullYear() === n.getFullYear() && v.getMonth() === n.getMonth();
};

const ActionTile = ({icon, label, sub, color, onPress, delay = 0}) => (
  <Animated.View
    style={styles.tileFlex}>
    <Pressable onPress={onPress} style={styles.tile}>
      <View style={[styles.tileAccent, {backgroundColor: color}]} />
      <View style={styles.tileInner}>
        <View style={[styles.tileIcon, {backgroundColor: `${color}15`}]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <Text style={styles.tileLabel}>{label}</Text>
        {sub ? <Text style={styles.tileSub}>{sub}</Text> : null}
      </View>
    </Pressable>
  </Animated.View>
);

const DashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const access = useFeeAccess();

  const {records, payments, summary, loading, error} = useSelector(state => state.fees);

  useFocusEffect(
    useCallback(() => {
      if (access.branchId) {
        dispatch(fetchFees(access));
      }
    }, [access, dispatch]),
  );

  const today = toISODate(new Date());
  const todaysCollections = payments
    .filter(p => p.paymentDate === today)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const monthlyCollections = payments
    .filter(p => isSameMonth(p.paymentDate))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const displaySummary = summary?.totalFee != null ? summary : feeService.getFeeSummary(records);
  const collectionRate = Math.round((displaySummary.collectionRate || 0) * 100);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) {return 'Good morning';}
    if (h < 17) {return 'Good afternoon';}
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* ── Clay Hero Header ── */}
        <Animated.View style={styles.header}>
          <View style={styles.blob1} />
          <View style={styles.blob2} />

          <View style={styles.headerTop}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>
                {(user?.fullName || 'A').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {user?.fullName || 'Accountant'}
              </Text>
            </View>
            <Pressable onPress={() => setMenuOpen(true)} style={styles.menuBtn} hitSlop={6}>
              <MaterialCommunityIcons name="dots-vertical" size={20} color="rgba(255,255,255,0.9)" />
            </Pressable>
          </View>

          <View style={styles.roleBadgeRow}>
            <View style={styles.roleBadge}>
              <View style={styles.roleDot} />
              <Text style={styles.roleText}>Fee Desk · Accountant</Text>
            </View>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short', day: 'numeric', month: 'short'})}
            </Text>
          </View>

          {/* Today + month strip */}
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatVal}>{formatCurrency(todaysCollections)}</Text>
              <Text style={styles.headerStatLabel}>Today</Text>
            </View>
            <View style={styles.headerStatDiv} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatVal}>{formatCurrency(monthlyCollections)}</Text>
              <Text style={styles.headerStatLabel}>This Month</Text>
            </View>
            <View style={styles.headerStatDiv} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatVal}>{collectionRate}%</Text>
              <Text style={styles.headerStatLabel}>Rate</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Collection Progress ── */}
        <Animated.View style={styles.progressCard}>
          <View style={styles.progressAccent} />
          <View style={styles.progressInner}>
            <View style={styles.progressHeader}>
              <View style={styles.progressIconWrap}>
                <MaterialCommunityIcons name="cash-multiple" size={16} color={colors.primary} />
              </View>
              <Text style={styles.progressTitle}>Fee Collection Rate</Text>
              <Text style={[styles.progressPct,
                {color: collectionRate >= 70 ? colors.success : colors.warning}]}>
                {collectionRate}%
              </Text>
            </View>
            <AnimatedProgressBar
              progress={collectionRate}
              color={collectionRate >= 70 ? colors.success : colors.warning}
              trackColor={colors.borderLight}
              height={8}
            />
            <View style={styles.chipRow}>
              <View style={styles.chip}>
                <MaterialCommunityIcons name="calendar-month" size={11} color={colors.primary} />
                <Text style={styles.chipText}>Month: {formatCurrency(monthlyCollections)}</Text>
              </View>
              <View style={[styles.chip, styles.chipDanger]}>
                <MaterialCommunityIcons name="alert-outline" size={11} color={colors.danger} />
                <Text style={[styles.chipText, {color: colors.danger}]}>
                  Due: {formatCurrency(displaySummary.dueAmount || 0)}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── Fee Desk Actions ── */}
        <SectionHeader title="Fee Desk" icon="cash-register" />
        <View style={styles.tileGrid}>
          <ActionTile icon="cash-plus"           label="Record Payment" sub="Accept cash / UPI / card" color={colors.success} onPress={() => navigation.navigate('FeeCollection')} delay={60}  />
          <ActionTile icon="account-alert-outline" label="Due Students"   sub="Follow up list"          color={colors.danger}  onPress={() => navigation.navigate('DueStudents')}   delay={100} />
          <ActionTile icon="receipt-text-clock"  label="Payment History" sub="Receipts & ledger"        color={colors.info}    onPress={() => navigation.navigate('PaymentHistory')} delay={140} />
          <ActionTile icon="file-chart-outline"  label="Reports"         sub="Class-wise analytics"     color={colors.accent}  onPress={() => navigation.navigate('FeeReports')}    delay={180} />
        </View>

        {/* ── Financial Summary ── */}
        <SectionHeader title="Financial Summary" icon="chart-pie" />
        <Animated.View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryStat}>
              <View style={[styles.summaryIconWrap, {backgroundColor: `${colors.success}15`}]}>
                <MaterialCommunityIcons name="cash-check" size={18} color={colors.success} />
              </View>
              <Text style={[styles.summaryValue, {color: colors.success}]}>
                {formatCurrency(displaySummary.paidAmount || 0)}
              </Text>
              <Text style={styles.summaryLabel}>Collected</Text>
            </View>
            <View style={styles.summaryDiv} />
            <View style={styles.summaryStat}>
              <View style={[styles.summaryIconWrap, {backgroundColor: `${colors.danger}15`}]}>
                <MaterialCommunityIcons name="cash-clock" size={18} color={colors.danger} />
              </View>
              <Text style={[styles.summaryValue, {color: colors.danger}]}>
                {formatCurrency(displaySummary.dueAmount || 0)}
              </Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
            <View style={styles.summaryDiv} />
            <View style={styles.summaryStat}>
              <View style={[styles.summaryIconWrap, {backgroundColor: `${colors.warning}15`}]}>
                <MaterialCommunityIcons name="account-alert" size={18} color={colors.warning} />
              </View>
              <Text style={[styles.summaryValue, {color: colors.warning}]}>
                {displaySummary.dueStudents || 0}
              </Text>
              <Text style={styles.summaryLabel}>Due Students</Text>
            </View>
          </View>

          <Pressable
            onPress={() => navigation.navigate('FeeDashboard')}
            style={styles.summaryAction}>
            <Text style={styles.summaryActionText}>Open full fee dashboard</Text>
            <MaterialCommunityIcons name="arrow-right" size={14} color={colors.primary} />
          </Pressable>
        </Animated.View>

        {/* ── Error Banner ── */}
        {Boolean(error) && (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.danger} />
            <Text style={styles.errorBannerText} numberOfLines={2}>
              {String(error)}
            </Text>
            <Pressable onPress={() => dispatch(fetchFees(access))} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* ── No branch configured ── */}
        {!loading && !access.branchId && (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="information-outline" size={16} color={colors.warning} />
            <Text style={styles.errorBannerText}>
              Branch not configured. Contact your administrator.
            </Text>
          </View>
        )}

        {/* ── Recent Payments ── */}
        <SectionHeader
          title="Recent Payments"
          icon="history"
          actionLabel="All History"
          onAction={() => navigation.navigate('PaymentHistory')}
        />
        {payments.length ? (
          payments.slice(0, 5).map((payment, i) => (
            <Animated.View
              key={payment.id}>
              <PaymentCard payment={payment} />
            </Animated.View>
          ))
        ) : (
          <EmptyState
            compact
            icon="receipt-text-outline"
            title="No payments today"
            message="Payments recorded today will appear here."
          />
        )}

      </ScrollView>

      <UserMenuDrawer
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        navigation={navigation}
        profileRoute="AccountantProfile"
        notificationsRoute="NotificationCenter"
        composeNotificationRoute="CreateNotification"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.page, paddingBottom: spacing.xxxl + spacing.xl},

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    ...shadows.clayDeep,
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    padding: spacing.xl,
    paddingBottom: spacing.lg},
  blob1: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 100,
    height: 170,
    position: 'absolute',
    right: -30,
    top: -50,
    width: 170},
  blob2: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 70,
    bottom: -30,
    height: 120,
    left: -15,
    position: 'absolute',
    width: 120},
  headerTop: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md},
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderColor: 'rgba(255,255,255,0.30)',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 50, width: 50,
    justifyContent: 'center'},
  avatarText: {color: colors.white, fontSize: 20, fontWeight: '900'},
  headerCopy: {flex: 1, minWidth: 0},
  greeting: {...typography.overline, color: 'rgba(255,255,255,0.65)'},
  name: {...typography.subtitle, color: colors.white, marginTop: 2},
  menuBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md,
    height: 38, width: 38,
    justifyContent: 'center'},
  roleBadgeRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg},
  roleBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 5},
  roleDot: {backgroundColor: '#4ADE80', borderRadius: radius.pill, height: 7, width: 7},
  roleText: {color: colors.white, fontSize: 11, fontWeight: '700'},
  headerDate: {...typography.captionBold, color: 'rgba(255,255,255,0.60)'},
  headerStats: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.xl,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md},
  headerStat: {alignItems: 'center', flex: 1},
  headerStatVal: {color: colors.white, fontSize: 15, fontWeight: '900'},
  headerStatLabel: {...typography.overline, color: 'rgba(255,255,255,0.60)', fontSize: 9},
  headerStatDiv: {backgroundColor: 'rgba(255,255,255,0.20)', width: 1},

  // ── Progress Card ─────────────────────────────────────────────────────────
  progressCard: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.xs,
    overflow: 'hidden'},
  progressAccent: {backgroundColor: colors.primary, height: 4},
  progressInner: {padding: spacing.lg},
  progressHeader: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg},
  progressIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    height: 30, width: 30,
    justifyContent: 'center'},
  progressTitle: {...typography.heading, color: colors.text, flex: 1},
  progressPct: {fontSize: 15, fontWeight: '800'},
  chipRow: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md},
  chip: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 4},
  chipDanger: {backgroundColor: colors.dangerSoft || `${colors.danger}12`},
  chipText: {...typography.captionBold, color: colors.primary, fontSize: 10},

  // ── Action Tiles ──────────────────────────────────────────────────────────
  tileGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xs},
  tileFlex: {flex: 1, minWidth: '47%'},
  tile: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    overflow: 'hidden'},
  tileAccent: {height: 4},
  tileInner: {padding: spacing.lg},
  tileIcon: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 48,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 48},
  tileLabel: {...typography.bodyBold, color: colors.text, marginBottom: 2},
  tileSub: {...typography.caption, color: colors.textMuted},

  // ── Summary Card ──────────────────────────────────────────────────────────
  summaryCard: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.lg},
  summaryRow: {flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.lg},
  summaryStat: {alignItems: 'center', gap: spacing.sm},
  summaryIconWrap: {alignItems: 'center', borderRadius: radius.lg, height: 40, justifyContent: 'center', width: 40},
  summaryValue: {fontSize: 13, fontWeight: '800', lineHeight: 18},
  summaryLabel: {...typography.overline, color: colors.textMuted, fontSize: 9},
  summaryDiv: {backgroundColor: colors.borderLight, width: 1},
  summaryAction: {
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    paddingTop: spacing.md},
  summaryActionText: {...typography.captionBold, color: colors.primary},
  errorBanner: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: `${colors.danger}30`,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md},
  errorBannerText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},
  retryBtn: {
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4},
  retryText: {color: colors.white, fontSize: 11, fontWeight: '700'}});

export default DashboardScreen;
