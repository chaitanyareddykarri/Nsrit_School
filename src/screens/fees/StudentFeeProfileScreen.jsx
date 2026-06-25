import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, PaymentCard, SectionHeader} from '../../components';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {formatCurrency} from '../../utils/formatters/currency';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const InfoRow = ({icon, label, value}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <MaterialCommunityIcons name={icon} size={14} color={colors.secondary} />
    </View>
    <View style={styles.infoBody}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>{value || '—'}</Text>
    </View>
  </View>
);

const FeeRow = ({icon, label, value, color}) => (
  <View style={styles.feeRow}>
    <View style={[styles.feeIcon, {backgroundColor: color ? `${color}20` : colors.secondarySoft}]}>
      <MaterialCommunityIcons name={icon} size={13} color={color || colors.secondary} />
    </View>
    <Text style={styles.feeLabel} numberOfLines={1}>{label}</Text>
    <Text style={[styles.feeValue, color && {color}]}>{value}</Text>
  </View>
);

const StudentFeeProfileScreen = ({navigation, route}) => {
  const access = useFeeAccess();
  const studentId = route.params?.studentId;
  const canManagePlans = feeService.canManageFeePlans(access.role);
  const canRecordPayments = feeService.canRecordPayments(access.role);
  const canViewTimeline = feeService.canViewPaymentTimeline(access.role);
  const {data: profile, error, isLoading} = useQuery({
    queryKey: ['studentFeeProfile', studentId, access.role, access.wing],
    queryFn: () => feeService.getStudentFeeProfile(studentId, access),
    enabled: Boolean(studentId)});

  if (!profile) {
    return (
      <View style={styles.root}>
        <EmptyState
          title={isLoading ? 'Loading fee profile' : 'Fee profile unavailable'}
          message={error?.message || 'Open a student fee profile from the fee dashboard.'}
        />
      </View>
    );
  }

  const duePercent = profile.totalFee > 0 ? Math.round((profile.dueAmount / profile.totalFee) * 100) : 0;
  const paidPercent = profile.totalFee > 0 ? Math.round((profile.paidAmount / profile.totalFee) * 100) : 0;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Hero ── */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <Text style={styles.heroOverline}>Fee Profile</Text>
        <Text style={styles.heroName} numberOfLines={2}>{profile.studentName}</Text>
        <Text style={styles.heroMeta}>
          #{profile.admissionNumber} · {profile.className || '—'}–{profile.sectionName || '—'}
        </Text>

        {/* ── Fee progress ── */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {width: `${paidPercent}%`, backgroundColor: colors.success}]} />
          </View>
          <Text style={styles.progressLabel}>{paidPercent}% paid</Text>
        </View>

        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{formatCurrency(profile.totalFee)}</Text>
            <Text style={styles.heroStatLabel}>Total</Text>
          </View>
          <View style={styles.heroStatSep} />
          <View style={styles.heroStat}>
            <Text style={[styles.heroStatValue, {color: '#86efac'}]}>{formatCurrency(profile.paidAmount)}</Text>
            <Text style={styles.heroStatLabel}>Paid</Text>
          </View>
          <View style={styles.heroStatSep} />
          <View style={styles.heroStat}>
            <Text style={[styles.heroStatValue, {color: duePercent > 0 ? '#fca5a5' : '#86efac'}]}>
              {formatCurrency(profile.dueAmount)}
            </Text>
            <Text style={styles.heroStatLabel}>Due</Text>
          </View>
        </View>

        {canManagePlans ? (
          <Pressable
            onPress={() => navigation.navigate('CreateFeePlan', {studentId: profile.studentId})}
            style={styles.editPlanBtn}>
            <MaterialCommunityIcons name="pencil-outline" size={13} color={colors.secondary} />
            <Text style={styles.editPlanBtnText}>Edit Plan</Text>
          </Pressable>
        ) : null}
      </Animated.View>

      {/* ── Student details ── */}
      <Animated.View style={styles.infoCard}>
        <Text style={styles.cardSection}>Student Details</Text>
        <InfoRow icon="google-classroom" label="Class & Section" value={`${profile.className || '—'}-${profile.sectionName || '—'}`} />
        <InfoRow icon="phone-outline" label="Parent Mobile" value={profile.parent?.phoneNumber} />
      </Animated.View>

      {/* ── Fee summary ── */}
      <Animated.View style={styles.infoCard}>
        <Text style={styles.cardSection}>Fee Summary</Text>
        <FeeRow icon="cash-multiple" label="Total Fee" value={formatCurrency(profile.totalFee)} />
        <FeeRow icon="cash-check" label="Paid Fee" value={formatCurrency(profile.paidAmount)} color={colors.success} />
        <FeeRow icon="cash-clock" label="Due Fee" value={formatCurrency(profile.dueAmount)} color={profile.dueAmount > 0 ? colors.danger : undefined} />
        {profile.concessionAmount > 0 ? (
          <FeeRow
            icon="sale-outline"
            label={`Concession ${profile.concessionType ? `(${profile.concessionType})` : ''}`}
            value={formatCurrency(profile.concessionAmount)}
          />
        ) : null}
      </Animated.View>

      {/* ── Fee breakup ── */}
      <Animated.View style={styles.infoCard}>
        <Text style={styles.cardSection}>Fee Breakup</Text>
        <FeeRow icon="numeric-1-circle-outline" label="1st Term" value={formatCurrency(profile.term1Fee)} />
        <FeeRow icon="numeric-2-circle-outline" label="2nd Term" value={formatCurrency(profile.term2Fee)} />
        <FeeRow icon="numeric-3-circle-outline" label="3rd Term" value={formatCurrency(profile.term3Fee)} />
        <FeeRow icon="book-open-page-variant-outline" label="Books Fee" value={formatCurrency(profile.booksFee)} />
        <FeeRow icon="bus-school" label="Transport Fee" value={formatCurrency(profile.transportFee)} />
        <FeeRow icon="cash-multiple" label="Gross Fee" value={formatCurrency(profile.grossAmount)} />
      </Animated.View>

      {/* ── Record payment button ── */}
      {canRecordPayments ? (
        <Pressable
          onPress={() => navigation.navigate('FeeCollection', {studentId: profile.studentId})}
          style={({pressed}) => [styles.recordBtn, pressed && {opacity: 0.88}]}>
          <MaterialCommunityIcons name="cash-plus" size={18} color={colors.white} />
          <Text style={styles.recordBtnText}>Record Payment</Text>
        </Pressable>
      ) : null}

      {/* ── Fee categories ── */}
      {profile.categories?.length > 0 ? (
        <Animated.View style={styles.infoCard}>
          <Text style={styles.cardSection}>Fee Categories</Text>
          {profile.categories.map(item => (
            <FeeRow key={item.id} icon="tag-outline" label={item.category?.name || 'Fee'} value={formatCurrency(item.amount)} />
          ))}
        </Animated.View>
      ) : (
        <View style={styles.emptyCategories}>
          <EmptyState title="No fee plan" message="Create a fee plan before collecting payments." />
        </View>
      )}

      {/* ── Payment timeline ── */}
      {canViewTimeline ? (
        <>
          <SectionHeader title="Payment Timeline" />
          {profile.payments.length ? (
            profile.payments.map(payment => (
              <PaymentCard
                key={payment.id}
                payment={{
                  ...payment,
                  studentName: profile.studentName,
                  className: profile.className,
                  sectionName: profile.sectionName,
                  admissionNumber: profile.admissionNumber}}
              />
            ))
          ) : (
            <EmptyState title="No payments" message="Recorded payments will appear here." />
          )}
        </>
      ) : null}

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},

  hero: {
    backgroundColor: colors.secondary,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130},
  heroOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  heroName: {color: colors.white, fontSize: 22, fontWeight: '800'},
  heroMeta: {color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '500', marginBottom: spacing.md, marginTop: 2},
  progressRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md},
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    flex: 1,
    height: 6,
    overflow: 'hidden'},
  progressFill: {borderRadius: radius.pill, height: '100%'},
  progressLabel: {color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600'},
  heroStats: {
    borderTopColor: 'rgba(255,255,255,0.12)',
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingTop: spacing.md},
  heroStat: {alignItems: 'center', flex: 1},
  heroStatValue: {color: colors.white, fontSize: 13, fontWeight: '800'},
  heroStatLabel: {color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase'},
  heroStatSep: {backgroundColor: 'rgba(255,255,255,0.12)', width: 1},
  editPlanBtn: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs},
  editPlanBtnText: {color: colors.secondary, fontSize: 12, fontWeight: '700'},

  infoCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.clay},
  cardSection: {
    backgroundColor: colors.background,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    padding: spacing.md,
    paddingBottom: spacing.xs,
    textTransform: 'uppercase'},
  infoRow: {
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md},
  infoIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.md,
    height: 30,
    justifyContent: 'center',
    width: 30},
  infoBody: {flex: 1, minWidth: 0},
  infoLabel: {color: colors.textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase'},
  infoValue: {...typography.bodyBold, color: colors.text, fontSize: 12, marginTop: 1},

  feeRow: {
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm},
  feeIcon: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 24,
    justifyContent: 'center',
    width: 24},
  feeLabel: {color: colors.text, flex: 1, fontSize: 12, fontWeight: '600'},
  feeValue: {color: colors.text, fontSize: 13, fontWeight: '800'},

  recordBtn: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 50,
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.fab},
  recordBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'},
  emptyCategories: {marginBottom: spacing.sm}});

export default StudentFeeProfileScreen;
