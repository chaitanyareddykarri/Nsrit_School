import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {EmptyState, PaymentCard, StatusBadge} from '../../components';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const LedgerRow = ({label, value, valueStyle}) => (
  <View style={styles.ledger}>
    <Text style={styles.ledgerText}>{label}</Text>
    <Text style={[styles.ledgerValue, valueStyle]}>{value}</Text>
  </View>
);

const StudentFeeDetailsScreen = () => {
  const studentFee = useSelector(state => state.fees.selectedStudentFee);
  const payments = useSelector(state =>
    state.fees.payments.filter(item => item.studentId === studentFee?.studentId),
  );

  if (!studentFee) {
    return (
      <View style={styles.denied}>
        <EmptyState
          title="No student selected"
          message="Open a student from the fee dashboard."
        />
      </View>
    );
  }

  const progress = studentFee.totalFee ? studentFee.paidAmount / studentFee.totalFee : 0;
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.heroTop}>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{studentFee.studentName}</Text>
            <Text style={styles.heroMeta}>
              {studentFee.className} - Section {studentFee.sectionName}
            </Text>
          </View>
          <StatusBadge status={studentFee.status} />
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${Math.round(clampedProgress * 100)}%`}]} />
        </View>
        <View style={styles.heroAmounts}>
          <Text style={styles.paidAmt}>{formatCurrency(studentFee.paidAmount)} paid</Text>
          <Text style={styles.dueAmt}>{formatCurrency(studentFee.dueAmount)} due</Text>
        </View>
      </Animated.View>

      <Animated.View style={styles.ledgerCard}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="book-outline" size={14} color={colors.secondary} />
          <Text style={styles.cardTitle}>Ledger</Text>
          {studentFee.dueDate ? (
            <Text style={styles.cardSub}>Due date {studentFee.dueDate}</Text>
          ) : null}
        </View>
        <LedgerRow label="Total Fee" value={formatCurrency(studentFee.totalFee)} />
        <LedgerRow label="Paid Amount" value={formatCurrency(studentFee.paidAmount)} valueStyle={{color: colors.success}} />
        <LedgerRow label="Remaining Balance" value={formatCurrency(studentFee.dueAmount)} valueStyle={{color: colors.danger}} />
      </Animated.View>

      <View style={styles.sectionLabel}>
        <MaterialCommunityIcons name="receipt-text-outline" size={13} color={colors.textMuted} />
        <Text style={styles.sectionLabelText}>Transactions</Text>
      </View>

      {payments.length ? (
        payments.map(payment => (
          <PaymentCard
            key={payment.id}
            payment={{
              ...payment,
              studentName: studentFee.studentName,
              className: studentFee.className,
              sectionName: studentFee.sectionName,
              admissionNumber: studentFee.admissionNumber}}
          />
        ))
      ) : (
        <EmptyState
          title="No payments yet"
          message="Payments will appear after upload or online capture."
        />
      )}

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},
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
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130},
  heroTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md},
  heroInfo: {flex: 1, paddingRight: spacing.md},
  heroName: {color: colors.white, fontSize: 20, fontWeight: '800'},
  heroMeta: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 3},
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    height: 8,
    marginBottom: spacing.md,
    overflow: 'hidden'},
  progressFill: {backgroundColor: colors.white, borderRadius: radius.pill, height: '100%'},
  heroAmounts: {flexDirection: 'row', justifyContent: 'space-between'},
  paidAmt: {color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '700'},
  dueAmt: {color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700'},
  ledgerCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    ...shadows.clay},
  cardHeader: {
    alignItems: 'center',
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md},
  cardTitle: {color: colors.text, flex: 1, fontSize: 13, fontWeight: '800'},
  cardSub: {color: colors.textMuted, fontSize: 11, fontWeight: '500'},
  ledger: {
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md},
  ledgerText: {color: colors.textMuted, fontSize: 13},
  ledgerValue: {...typography.sectionTitle, color: colors.text},
  sectionLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs},
  sectionLabelText: {color: colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase'}});

export default StudentFeeDetailsScreen;
