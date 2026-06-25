import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';
import {generateAndShareReceipt} from '../../utils/pdf/receiptGenerator';

const PaymentCard = ({payment}) => {
  const handleShare = () => generateAndShareReceipt(payment);

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="receipt-text-check-outline" size={20} color={colors.success} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {payment.studentName || payment.student?.fullName || 'Student'}{' · '}
          {payment.mode || payment.paymentMode || '—'}
        </Text>
        <Text style={styles.date}>
          {formatDateForDisplay(payment.date || payment.paymentDate) || '—'}
          {payment.receiptNo || payment.receiptNumber
            ? ` | ${payment.receiptNo || payment.receiptNumber}`
            : ''}
        </Text>
      </View>
      <Pressable onPress={handleShare} style={styles.shareBtn} hitSlop={6}>
        <MaterialCommunityIcons name="share-variant" size={18} color={colors.primary} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: `${colors.success}15`,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  copy: {flex: 1, gap: 2},
  amount: {...typography.subtitle, color: colors.text},
  meta: {...typography.caption, color: colors.textMuted},
  date: {...typography.overline, color: colors.textSoft},
  shareBtn: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.md,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
});

export default PaymentCard;
