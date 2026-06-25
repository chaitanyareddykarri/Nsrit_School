import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View, ActivityIndicator} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {AnimatedProgressBar, EmptyState} from '../../components';
import parentService from '../../services/parents/parentService';
import {formatCurrency} from '../../utils/formatters/currency';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';
import {generateAndShareReceipt} from '../../utils/pdf/receiptGenerator';
import VoiceAnnouncementButton from '../../components/common/VoiceAnnouncementButton';
import {TELUGU} from '../../services/tts/teluguTemplates';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const isActivePayment = payment =>
  !['REVERSED', 'CANCELLED'].includes(
    String(payment.status || 'RECORDED').toUpperCase(),
  );

const getInitials = name =>
  name
    ? name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    : '?';

const FeeBreakdownRow = ({label, value, icon, color = colors.text}) => (
  <View style={styles.breakRow}>
    <MaterialCommunityIcons name={icon} size={16} color={color} style={styles.breakIcon} />
    <Text style={styles.breakLabel}>{label}</Text>
    <Text style={[styles.breakValue, {color}]}>{formatCurrency(value)}</Text>
  </View>
);

const ReceiptItem = ({payment, child, index}) => {
  const isActive = isActivePayment(payment);
  const statusColor = isActive ? colors.success : colors.danger;
  const statusBg = isActive ? colors.successSoft : colors.dangerSoft;

  const handleShare = () => {
    generateAndShareReceipt({
      ...payment,
      studentName: child.fullName,
      className: child.academicClass?.name,
      sectionName: child.section?.name,
      admissionNumber: child.studentId,
      mode: payment.paymentMode,
      date: payment.paymentDate,
      receiptNo: payment.receiptNumber});
  };

  return (
    <Animated.View
      style={styles.receiptRow}>
      <View style={styles.receiptLeft}>
        <View style={styles.receiptDot} />
        <View style={styles.receiptLine} />
      </View>
      <View style={styles.receiptCard}>
        <View style={styles.receiptTop}>
          <View style={styles.receiptBadge}>
            <MaterialCommunityIcons
              name="receipt-text-outline"
              size={10}
              color={colors.primary}
            />
            <Text style={styles.receiptNo}>
              {payment.receiptNumber || 'Pending'}
            </Text>
          </View>
          <Text style={styles.receiptAmount}>{formatCurrency(payment.amount)}</Text>
        </View>
        <View style={styles.receiptMetaRow}>
          <View style={styles.receiptMetaCopy}>
            <Text style={styles.receiptDate}>
              {formatDateForDisplay(payment.paymentDate) || '—'}
            </Text>
            <Text style={styles.receiptMode}>{payment.paymentMode || '—'}</Text>
            <View style={[styles.receiptStatus, {backgroundColor: statusBg}]}>
              <Text style={[styles.receiptStatusText, {color: statusColor}]}>
                {payment.status || 'RECORDED'}
              </Text>
            </View>
          </View>
          {isActive ? (
            <Pressable onPress={handleShare} style={styles.receiptShareBtn} hitSlop={6}>
              <MaterialCommunityIcons name="share-variant" size={18} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
};

// One academic year's fee breakdown + receipts (collapsible). Concession is
// intentionally never rendered — parents only see net payable amounts.
const YearFeeBlock = ({child, year, defaultOpen}) => {
  const [open, setOpen] = useState(defaultOpen);
  const payments = (year.payments || []).filter(isActivePayment);
  const collectionRate = year.total > 0 ? (year.paid / year.total) * 100 : 0;

  return (
    <View style={styles.yearBlock}>
      <Pressable onPress={() => setOpen(e => !e)} style={styles.yearHeader}>
        <View style={styles.yearHeaderLeft}>
          <Text style={styles.yearTitle}>AY {year.academicYear || '—'}</Text>
          {year.isActive ? <View style={styles.currentChip}><Text style={styles.currentChipText}>Current</Text></View> : null}
        </View>
        <View style={styles.yearHeaderRight}>
          <Text style={[styles.yearDue, {color: year.due > 0 ? colors.danger : colors.success}]}>
            {year.due > 0 ? `${formatCurrency(year.due)} due` : 'Cleared'}
          </Text>
          <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
        </View>
      </Pressable>

      {open ? (
        <Animated.View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryVal, {color: colors.text}]}>{formatCurrency(year.total)}</Text>
              <Text style={styles.summaryLabel}>Total Fee</Text>
            </View>
            <View style={styles.summarySep} />
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryVal, {color: colors.success}]}>{formatCurrency(year.paid)}</Text>
              <Text style={styles.summaryLabel}>Paid</Text>
            </View>
            <View style={styles.summarySep} />
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryVal, {color: colors.danger}]}>{formatCurrency(year.due)}</Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
          </View>
          <View style={styles.progressSection}>
            <AnimatedProgressBar
              progress={collectionRate}
              color={collectionRate >= 80 ? colors.success : colors.warning}
              trackColor={colors.border}
              height={6}
            />
          </View>

          <View style={styles.breakdownCard}>
            {year.term1Fee ? <FeeBreakdownRow label="Term I" value={year.term1Fee} icon="numeric-1-circle-outline" color={colors.primary} /> : null}
            {year.term2Fee ? <FeeBreakdownRow label="Term II" value={year.term2Fee} icon="numeric-2-circle-outline" color={colors.primary} /> : null}
            {year.term3Fee ? <FeeBreakdownRow label="Term III" value={year.term3Fee} icon="numeric-3-circle-outline" color={colors.primary} /> : null}
            {year.booksFee ? <FeeBreakdownRow label="Books Fee" value={year.booksFee} icon="book-open-page-variant-outline" /> : null}
            {year.transportFee ? <FeeBreakdownRow label="Transport" value={year.transportFee} icon="bus-school" /> : null}
            {(year.items || []).map(item => (
              <FeeBreakdownRow key={item.id} label={item.category?.name || 'Fee'} value={item.amount} icon="tag-outline" />
            ))}
          </View>

          {payments.length > 0 ? (
            <View style={styles.receiptsSection}>
              <Text style={styles.sectionLabel}>Receipt History</Text>
              {payments.map((payment, i) => (
                <ReceiptItem key={payment.id} payment={payment} child={child} index={i} />
              ))}
            </View>
          ) : null}
        </Animated.View>
      ) : null}
    </View>
  );
};

const ChildFeeSection = ({child}) => {
  const summary = child.feeSummary || {};
  const yearlyFees = child.yearlyFees && child.yearlyFees.length
    ? child.yearlyFees
    : child.feePlan
      ? [{
          id: child.feePlan.id,
          academicYear: child.feePlan.academicYear,
          total: summary.total || 0,
          paid: summary.paid || 0,
          due: summary.due || 0,
          term1Fee: child.feePlan.term1Fee,
          term2Fee: child.feePlan.term2Fee,
          term3Fee: child.feePlan.term3Fee,
          booksFee: child.feePlan.booksFee,
          transportFee: child.feePlan.transportFee,
          items: child.feePlan.items,
          payments: child.payments,
          isActive: true}]
      : [];
  const totalDue = summary.due || 0;
  const previousYearDue = summary.previousYearDue || 0;

  return (
    <Animated.View>
      {/* ── Child header ── */}
      <View style={styles.childHeader}>
        <View style={styles.childAvatar}>
          <Text style={styles.childAvatarText}>{getInitials(child.fullName)}</Text>
        </View>
        <View style={styles.childInfo}>
          <Text style={styles.childName}>{child.fullName}</Text>
          <Text style={styles.childMeta}>
            {child.academicClass?.name || '-'}–{child.section?.name || '-'}
          </Text>
        </View>
      </View>

      {/* ── Outstanding dues banner (always visible, never collapsible) ── */}
      {totalDue > 0 ? (
        <View style={styles.dueBanner}>
          <MaterialCommunityIcons name="alert-circle" size={22} color={colors.white} />
          <View style={styles.dueBannerCopy}>
            <Text style={styles.dueBannerLabel}>Total Outstanding Dues</Text>
            <Text style={styles.dueBannerAmount}>{formatCurrency(totalDue)}</Text>
            {previousYearDue > 0 ? (
              <Text style={styles.dueBannerNote}>
                Includes {formatCurrency(previousYearDue)} carried forward from previous years
              </Text>
            ) : null}
          </View>
          <VoiceAnnouncementButton
            text={TELUGU.feeDue(child.fullName, totalDue)}
            size={18}
          />
        </View>
      ) : (
        <View style={styles.clearedBanner}>
          <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
          <Text style={styles.clearedBannerText}>All fees cleared. Thank you!</Text>
          <VoiceAnnouncementButton
            text={TELUGU.feePaid(child.fullName)}
            size={18}
          />
        </View>
      )}

      {/* ── Per-year fee blocks (most recent first) ── */}
      {yearlyFees.map((year, idx) => (
        <YearFeeBlock key={year.id || year.academicYear || idx} child={child} year={year} defaultOpen={idx === 0} />
      ))}
    </Animated.View>
  );
};

const FeeLedgerScreen = () => {
  const user = useSelector(state => state.auth.user);
  // For PARENT, the linked User UUID is the key parentService expects — the
  // previous `user?.parentId` was always undefined, so the ledger never loaded.
  const parentUserId = user?.parentId || user?.id;

  const {data: children = [], error, isLoading} = useQuery({
    queryKey: ['parentChildren', parentUserId],
    queryFn: () => parentService.getParentChildren(parentUserId),
    enabled: Boolean(parentUserId)});

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>
      <Animated.View style={styles.pageHeader}>
        <View style={styles.pageHeaderDecor} />
        <Text style={styles.pageHeaderOverline}>Parent Portal</Text>
        <Text style={styles.pageHeaderTitle}>Fee Ledger</Text>
        <Text style={styles.pageHeaderSub}>Complete fee record for your children</Text>
      </Animated.View>

      {error ? (
        <EmptyState title="Unable to load fees" message={error.message} />
      ) : isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : children.length ? (
        children.map(child => (
          <ChildFeeSection key={child.id} child={child} />
        ))
      ) : (
        <EmptyState
          title="No fee records"
          message="Fee records linked to your children will appear here."
        />
      )}
      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},
  loadingWrap: {alignItems: 'center', paddingVertical: spacing.xxl},
  // Page header
  pageHeader: {
    backgroundColor: colors.secondary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  pageHeaderDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130},
  pageHeaderOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  pageHeaderTitle: {color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 2},
  pageHeaderSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500'},

  // Child header
  childHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    marginTop: spacing.sm},
  childAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44},
  childAvatarText: {color: colors.primary, fontSize: 14, fontWeight: '800'},
  childInfo: {flex: 1},
  childName: {...typography.bodyBold, color: colors.text, fontSize: 16},
  childMeta: {...typography.caption, color: colors.textMuted, marginTop: 2},

  // Outstanding dues banner (prominent, non-collapsible)
  dueBanner: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.clay},
  dueBannerCopy: {flex: 1},
  dueBannerLabel: {color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase'},
  dueBannerAmount: {color: colors.white, fontSize: 22, fontWeight: '900', marginTop: 2},
  dueBannerNote: {color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600', marginTop: 4},
  clearedBanner: {
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md},
  clearedBannerText: {color: colors.success, fontSize: 13, fontWeight: '700'},

  // Per-year block
  yearBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.clay},
  yearHeader: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  yearHeaderLeft: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  yearHeaderRight: {alignItems: 'center', flexDirection: 'row', gap: spacing.xs},
  yearTitle: {color: colors.text, fontSize: 15, fontWeight: '800'},
  yearDue: {fontSize: 13, fontWeight: '800'},
  currentChip: {backgroundColor: colors.primarySoft, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2},
  currentChipText: {color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase'},

  // Fee summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg},
  summaryStat: {alignItems: 'center', gap: 3},
  summaryVal: {fontSize: 15, fontWeight: '800'},
  summaryLabel: {...typography.overline, color: colors.textMuted, fontSize: 9},
  summarySep: {backgroundColor: colors.borderLight, width: 1},
  progressSection: {gap: spacing.xs, marginBottom: spacing.sm},

  // Breakdown card
  breakdownCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.clay},
  breakRow: {
    alignItems: 'center',
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.sm},
  breakIcon: {marginRight: spacing.sm},
  breakLabel: {flex: 1, ...typography.body, color: colors.text},
  breakValue: {fontSize: 13, fontWeight: '700'},

  // Receipts
  receiptsSection: {marginTop: spacing.sm},
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'},
  receiptRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm},
  receiptLeft: {
    alignItems: 'center',
    paddingTop: 6,
    width: 14},
  receiptDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 10,
    width: 10},
  receiptLine: {
    backgroundColor: colors.border,
    flex: 1,
    marginTop: 2,
    width: 1},
  receiptCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flex: 1,
    padding: spacing.md,
    ...shadows.clay},
  receiptTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs},
  receiptBadge: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2},
  receiptNo: {color: colors.primary, fontSize: 9, fontWeight: '800'},
  receiptAmount: {color: colors.text, fontSize: 14, fontWeight: '800'},
  receiptMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2},
  receiptMetaCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1},
  receiptDate: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},
  receiptMode: {color: colors.textSoft, fontSize: 11, fontWeight: '600'},
  receiptStatus: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1},
  receiptStatusText: {fontSize: 9, fontWeight: '800'},
  receiptShareBtn: {margin: 0, padding: 0},
  moreText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center'}});

export default FeeLedgerScreen;
