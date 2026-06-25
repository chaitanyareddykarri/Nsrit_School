import React, {useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, View, Text} from 'react-native';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import parentService from '../../services/parents/parentService';
import {formatCurrency} from '../../utils/formatters/currency';
import {colors, radius, shadows, spacing} from '../../theme';

const ChildCard = ({child, index, onViewLedger}) => {
  const fee = child.feeSummary || {};
  const pct = fee.total > 0 ? Math.round((fee.paid / fee.total) * 100) : 0;
  const isPaid = fee.due <= 0;

  return (
    <Animated.View
      style={styles.childCard}>
      {/* Avatar + name */}
      <View style={styles.childHeader}>
        <View style={styles.childAvatar}>
          <Text style={styles.childAvatarText}>
            {(child.fullName || 'ST').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.childInfo}>
          <Text style={styles.childName}>{child.fullName || 'Student'}</Text>
          <Text style={styles.childClass}>
            {[child.className, child.sectionName].filter(Boolean).join(' — ') || 'Class not assigned'}
          </Text>
        </View>
        <View style={[styles.dueBadge, {backgroundColor: isPaid ? colors.successSoft : colors.dangerSoft}]}>
          <Text style={[styles.dueBadgeText, {color: isPaid ? colors.success : colors.danger}]}>
            {isPaid ? 'PAID' : 'DUE'}
          </Text>
        </View>
      </View>

      {/* Fee summary */}
      <View style={styles.feeRow}>
        <View style={styles.feeStat}>
          <Text style={styles.feeStatLabel}>Total</Text>
          <Text style={styles.feeStatValue}>{formatCurrency(fee.total || 0)}</Text>
        </View>
        <View style={styles.feeStatDiv} />
        <View style={styles.feeStat}>
          <Text style={styles.feeStatLabel}>Paid</Text>
          <Text style={[styles.feeStatValue, {color: colors.success}]}>{formatCurrency(fee.paid || 0)}</Text>
        </View>
        <View style={styles.feeStatDiv} />
        <View style={styles.feeStat}>
          <Text style={styles.feeStatLabel}>Balance</Text>
          <Text style={[styles.feeStatValue, {color: isPaid ? colors.success : colors.danger}]}>
            {formatCurrency(fee.due || 0)}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, {width: `${pct}%`, backgroundColor: isPaid ? colors.success : colors.primary}]} />
      </View>
      <Text style={styles.progressLabel}>{pct}% of fees paid</Text>

      {/* CTA */}
      {fee.due > 0 ? (
        <Pressable
          onPress={() => onViewLedger(child)}
          style={({pressed}) => [styles.ledgerBtn, pressed && {opacity: 0.8}]}>
          <MaterialCommunityIcons name="file-document-outline" size={16} color={colors.primary} />
          <Text style={styles.ledgerBtnText}>View Fee Ledger</Text>
          <MaterialCommunityIcons name="chevron-right" size={14} color={colors.primary} />
        </Pressable>
      ) : null}
    </Animated.View>
  );
};

const PaymentScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const parentId = user?.parentId;

  const {data: dashboard, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ['parentPayment', parentId],
    queryFn: () => parentService.getParentDashboard(parentId),
    enabled: Boolean(parentId),
    staleTime: 2 * 60 * 1000});

  const children = dashboard?.children || [];
  const totalDue = dashboard?.totalDue || 0;
  const totalPaid = children.reduce((sum, c) => sum + Number(c.feeSummary?.paid || 0), 0);

  const handleViewLedger = child => {
    navigation.navigate('FeeLedger', {studentId: child.id, childName: child.fullName});
  };

  if (isLoading && !dashboard) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading fee information…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.heroIconWrap}>
          <MaterialCommunityIcons name="cash-multiple" size={32} color="rgba(255,255,255,0.9)" />
        </View>
        <Text style={styles.heroTitle}>Fee Payments</Text>
        <Text style={styles.heroSub}>Track and manage your ward's fee status</Text>
        <View style={styles.heroMetrics}>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricLabel}>Total Paid</Text>
            <Text style={styles.heroMetricValue}>{formatCurrency(totalPaid)}</Text>
          </View>
          <View style={styles.heroMetricDivider} />
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricLabel}>Outstanding</Text>
            <Text style={[styles.heroMetricValue, totalDue > 0 && {color: '#FCA5A5'}]}>
              {formatCurrency(totalDue)}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Payment info card */}
      <Animated.View style={styles.infoCard}>
        <View style={styles.infoIcon}>
          <MaterialCommunityIcons name="bank-outline" size={20} color={colors.info} />
        </View>
        <View style={styles.infoCopy}>
          <Text style={styles.infoTitle}>How to pay</Text>
          <Text style={styles.infoDesc}>
            Visit the school accounts office to pay fees in person. Bring the fee ledger as reference.
          </Text>
        </View>
      </Animated.View>

      {/* Children */}
      {children.length === 0 ? (
        <Animated.View style={styles.emptyCard}>
          <MaterialCommunityIcons name="account-child-outline" size={36} color={colors.border} />
          <Text style={styles.emptyTitle}>No children linked</Text>
          <Text style={styles.emptyDesc}>Contact the school to link your ward to this account.</Text>
        </Animated.View>
      ) : (
        children.map((child, i) => (
          <ChildCard key={child.id || i} child={child} index={i} onViewLedger={handleViewLedger} />
        ))
      )}

      {/* Payment methods */}
      <Animated.View style={styles.methodCard}>
        <Text style={styles.methodTitle}>Accepted Payment Methods</Text>
        {[
          {icon: 'cash', label: 'Cash', desc: 'At the school accounts counter'},
          {icon: 'bank-transfer', label: 'Bank Transfer / NEFT', desc: 'Contact office for bank details'},
          {icon: 'qrcode-scan', label: 'UPI / QR Code', desc: 'Scan at the accounts office'},
          {icon: 'checkbook', label: 'Cheque / DD', desc: 'Payable to school management'},
        ].map((method, i) => (
          <View key={method.label}>
            {i > 0 ? <View style={styles.methodDivider} /> : null}
            <View style={styles.methodRow}>
              <View style={styles.methodIcon}>
                <MaterialCommunityIcons name={method.icon} size={18} color={colors.primary} />
              </View>
              <View style={styles.methodCopy}>
                <Text style={styles.methodLabel}>{method.label}</Text>
                <Text style={styles.methodDesc}>{method.desc}</Text>
              </View>
            </View>
          </View>
        ))}
      </Animated.View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  content: {padding: spacing.lg, paddingBottom: 40},
  center: {alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', gap: spacing.md},
  loadingText: {color: colors.textMuted, fontSize: 14},

  hero: {
    backgroundColor: colors.primary,
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
  heroSub: {color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: spacing.md, marginTop: 3},
  heroMetrics: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.card,
    flexDirection: 'row',
    padding: spacing.md},
  heroMetric: {alignItems: 'flex-start', flex: 1},
  heroMetricDivider: {backgroundColor: 'rgba(255,255,255,0.2)', width: 1},
  heroMetricLabel: {color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2, textTransform: 'uppercase'},
  heroMetricValue: {color: colors.white, fontSize: 18, fontWeight: '900'},

  infoCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.infoSoft,
    borderColor: `${colors.info}30`,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    ...shadows.clay},
  infoIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.12)',
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    marginTop: 2,
    width: 36},
  infoCopy: {flex: 1},
  infoTitle: {color: colors.info, fontSize: 13, fontWeight: '800', marginBottom: 2},
  infoDesc: {color: colors.text, fontSize: 12, lineHeight: 18},

  childCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.clay},
  childHeader: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md},
  childAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44},
  childAvatarText: {color: colors.primary, fontSize: 15, fontWeight: '800'},
  childInfo: {flex: 1},
  childName: {color: colors.text, fontSize: 14, fontWeight: '800'},
  childClass: {color: colors.textMuted, fontSize: 11, marginTop: 2},
  dueBadge: {borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3},
  dueBadgeText: {fontSize: 9, fontWeight: '900', letterSpacing: 0.5},

  feeRow: {flexDirection: 'row', marginBottom: spacing.sm},
  feeStat: {alignItems: 'center', flex: 1},
  feeStatDiv: {backgroundColor: colors.border, width: 1},
  feeStatLabel: {color: colors.textSoft, fontSize: 10, fontWeight: '700', letterSpacing: 0.3, marginBottom: 2, textTransform: 'uppercase'},
  feeStatValue: {color: colors.text, fontSize: 16, fontWeight: '900'},

  progressTrack: {backgroundColor: colors.background, borderRadius: radius.pill, height: 6, marginBottom: 4, marginTop: spacing.sm, overflow: 'hidden'},
  progressFill: {borderRadius: radius.pill, height: 6},
  progressLabel: {color: colors.textSoft, fontSize: 10, marginBottom: spacing.md},

  ledgerBtn: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingVertical: 10},
  ledgerBtnText: {color: colors.primary, fontSize: 13, fontWeight: '700'},

  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.xl,
    ...shadows.clay},
  emptyTitle: {color: colors.text, fontSize: 15, fontWeight: '800'},
  emptyDesc: {color: colors.textMuted, fontSize: 12, textAlign: 'center'},

  methodCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    padding: spacing.lg,
    ...shadows.clay},
  methodTitle: {color: colors.text, fontSize: 13, fontWeight: '800', marginBottom: spacing.md},
  methodRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, paddingVertical: 10},
  methodIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36},
  methodCopy: {flex: 1},
  methodLabel: {color: colors.text, fontSize: 13, fontWeight: '700'},
  methodDesc: {color: colors.textMuted, fontSize: 11, marginTop: 1},
  methodDivider: {backgroundColor: colors.background, height: 1}});

export default PaymentScreen;
