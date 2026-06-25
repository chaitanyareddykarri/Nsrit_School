import React from 'react';
import {StyleSheet, View, Text, Pressable} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, spacing, radius, shadows} from '../../../theme';

const RecentTransactionList = ({
  payments = [],
  loading = false,
  onViewAllPress,
  limit = 5,
}) => {
  const displayPayments = payments.slice(0, limit);

  const formatCurrency = amount => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = dateStr => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Recent Activity</Text>
        </View>
        {[1, 2, 3].map(i => (
          <View key={i} style={[styles.card, styles.skeletonCard]}>
            <View style={[styles.avatarSkeleton, styles.skeletonBg]} />
            <View style={styles.skeletonCopy}>
              <View style={[styles.skeletonTitle, styles.skeletonBg]} />
              <View style={[styles.skeletonMeta, styles.skeletonBg]} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Transactions</Text>
        {payments.length > limit && onViewAllPress && (
          <Pressable onPress={onViewAllPress}>
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        )}
      </View>

      {displayPayments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="receipt-text-minus-outline"
            size={40}
            color={colors.textSoft}
          />
          <Text style={styles.emptyText}>No recent payments uploaded.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {displayPayments.map((item, index) => (
            <View
              key={item.id || index.toString()}
              style={[
                styles.card,
                index === displayPayments.length - 1 && styles.lastCard,
              ]}>
              <View style={styles.leftCol}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name="cash-check"
                    size={22}
                    color={colors.success}
                  />
                </View>
                <View style={styles.details}>
                  <Text style={styles.studentName} numberOfLines={1}>
                    {item.studentName}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      ID: {item.studentId || 'N/A'}
                    </Text>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.metaText}>
                      Receipt: {item.receiptNo || 'N/A'}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                </View>
              </View>

              <View style={styles.rightCol}>
                <Text style={styles.amountText}>{formatCurrency(item.amount)}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.mode || 'Cash'}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.clay,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  viewAllText: {
    fontSize: 13,
    color: colors.secondary,
    fontWeight: '700',
  },
  list: {
    marginTop: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  lastCard: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.successSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    marginLeft: spacing.md,
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  bullet: {
    fontSize: 10,
    color: colors.textSoft,
    marginHorizontal: 4,
  },
  dateText: {
    fontSize: 10,
    color: colors.textSoft,
    fontWeight: '500',
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  skeletonCard: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  avatarSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  skeletonCopy: {
    flex: 1,
    marginLeft: spacing.md,
    gap: 6,
  },
  skeletonTitle: {
    width: '55%',
    height: 12,
    borderRadius: 4,
  },
  skeletonMeta: {
    width: '40%',
    height: 10,
    borderRadius: 4,
  },
  skeletonBg: {
    backgroundColor: colors.background,
  },
});

export default RecentTransactionList;
