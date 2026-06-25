import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState} from '../../components';
import parentService from '../../services/parents/parentService';
import {formatCurrency} from '../../utils/formatters/currency';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const isActivePayment = payment =>
  !['REVERSED', 'CANCELLED'].includes(
    String(payment.status || 'RECORDED').toUpperCase(),
  );

const ReceiptCard = ({payment, student}) => {
  const statusColor =
    payment.status === 'REVERSED' ? colors.danger : colors.success;

  return (
    <Animated.View style={styles.receiptCard}>
      {/* Decorative top border */}
      <View style={styles.receiptBorder} />

      {/* Receipt header */}
      <View style={styles.receiptHeader}>
        <View style={styles.receiptIconWrap}>
          <MaterialCommunityIcons
            name="receipt-text"
            size={22}
            color={colors.primary}
          />
        </View>
        <View style={styles.receiptHeaderCopy}>
          <Text style={styles.receiptTitle}>Payment Receipt</Text>
          <Text style={styles.receiptSchool}>NSRIT School</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: `${statusColor}18`},
          ]}>
          <Text style={[styles.statusText, {color: statusColor}]}>
            {payment.status || 'RECORDED'}
          </Text>
        </View>
      </View>

      <View style={styles.receiptDivider} />

      {/* Receipt number */}
      <View style={styles.receiptRow}>
        <Text style={styles.receiptKey}>Receipt No.</Text>
        <Text style={styles.receiptVal}>
          {payment.receiptNumber || 'Pending'}
        </Text>
      </View>

      {/* Student info */}
      <View style={styles.receiptRow}>
        <Text style={styles.receiptKey}>Student</Text>
        <Text style={styles.receiptVal}>{student?.fullName || '—'}</Text>
      </View>
      <View style={styles.receiptRow}>
        <Text style={styles.receiptKey}>Admission No.</Text>
        <Text style={styles.receiptVal}>{student?.studentId || '—'}</Text>
      </View>
      <View style={styles.receiptRow}>
        <Text style={styles.receiptKey}>Class</Text>
        <Text style={styles.receiptVal}>
          {student?.academicClass?.name || '-'}-{student?.section?.name || '-'}
        </Text>
      </View>

      <View style={styles.receiptDivider} />

      {/* Payment info */}
      <View style={styles.receiptRow}>
        <Text style={styles.receiptKey}>Payment Date</Text>
        <Text style={styles.receiptVal}>
          {formatDateForDisplay(payment.paymentDate) || '—'}
        </Text>
      </View>
      <View style={styles.receiptRow}>
        <Text style={styles.receiptKey}>Payment Mode</Text>
        <Text style={styles.receiptVal}>{payment.paymentMode || '—'}</Text>
      </View>
      {payment.referenceNumber ? (
        <View style={styles.receiptRow}>
          <Text style={styles.receiptKey}>Reference</Text>
          <Text style={styles.receiptVal}>{payment.referenceNumber}</Text>
        </View>
      ) : null}

      <View style={styles.receiptDivider} />

      {/* Amount */}
      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Total Paid</Text>
        <Text style={styles.amountValue}>{formatCurrency(payment.amount)}</Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <Pressable style={styles.actionBtn}>
          <MaterialCommunityIcons
            name="share-variant-outline"
            size={16}
            color={colors.primary}
          />
          <Text style={styles.actionBtnText}>Share</Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, styles.actionBtnOutlined]}>
          <MaterialCommunityIcons
            name="download-outline"
            size={16}
            color={colors.textMuted}
          />
          <Text style={[styles.actionBtnText, {color: colors.textMuted}]}>Download PDF</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const ReceiptScreen = ({route}) => {
  const user = useSelector(state => state.auth.user);
  const parentId = user?.parentId;

  const {data: children = [], isLoading} = useQuery({
    queryKey: ['parentChildren', parentId],
    queryFn: () => parentService.getParentChildren(parentId),
    enabled: Boolean(parentId)});

  const allPayments = children.flatMap(child =>
    (child.payments || []).filter(isActivePayment).map(p => ({
      ...p,
      student: child})),
  );

  if (isLoading) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
        <EmptyState title="Loading receipts…" message="" />
      </ScrollView>
    );
  }

  if (!allPayments.length) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
        <EmptyState
          title="No receipts yet"
          message="Payment receipts for your children will appear here once fee payments are recorded."
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>
      <Animated.View
        style={styles.pageHeader}>
        <View style={styles.pageHeaderDecor} />
        <Text style={styles.pageHeaderOverline}>Parent Portal</Text>
        <Text style={styles.pageHeaderTitle}>Receipts</Text>
        <Text style={styles.pageHeaderSub}>
          {allPayments.length} payment receipt{allPayments.length !== 1 ? 's' : ''}
        </Text>
      </Animated.View>

      {allPayments.map(payment => (
        <ReceiptCard
          key={payment.id}
          payment={payment}
          student={payment.student}
        />
      ))}
      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},
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
    height: 120,
    position: 'absolute',
    right: -20,
    top: -30,
    width: 120},
  pageHeaderOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  pageHeaderTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  pageHeaderSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 2},

  // Receipt card
  receiptCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.clay},
  receiptBorder: {
    backgroundColor: colors.primary,
    height: 3},
  receiptHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.md},
  receiptIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.card,
    height: 44,
    justifyContent: 'center',
    width: 44},
  receiptHeaderCopy: {flex: 1},
  receiptTitle: {color: colors.text, fontSize: 15, fontWeight: '800'},
  receiptSchool: {color: colors.textMuted, fontSize: 11, fontWeight: '600', marginTop: 1},
  statusBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4},
  statusText: {fontSize: 10, fontWeight: '800', textTransform: 'uppercase'},

  receiptDivider: {
    backgroundColor: colors.borderLight,
    height: 1,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm},

  receiptRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 1},
  receiptKey: {color: colors.textMuted, fontSize: 12, fontWeight: '600'},
  receiptVal: {color: colors.text, fontSize: 13, fontWeight: '700', maxWidth: '60%', textAlign: 'right'},

  amountRow: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: radius.card,
    padding: spacing.md},
  amountLabel: {color: colors.primary, fontSize: 13, fontWeight: '700'},
  amountValue: {color: colors.primary, fontSize: 20, fontWeight: '800'},

  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    margin: spacing.lg,
    marginTop: spacing.sm},
  actionBtn: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.card,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    ...shadows.clay},
  actionBtnOutlined: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    borderWidth: 1.5},
  actionBtnText: {color: colors.primary, fontSize: 12, fontWeight: '700'}});

export default ReceiptScreen;
