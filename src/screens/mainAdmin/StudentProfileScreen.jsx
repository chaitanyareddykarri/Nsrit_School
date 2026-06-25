import React, {useMemo} from 'react';
import {ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {EmptyState} from '../../components';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';

const getInitials = name =>
  name
    ? name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    : '?';

const monthLabel = value => {
  if (!value) return 'Month';
  return new Date(value).toLocaleString('default', {month: 'short'});
};

const InfoRow = ({label, value}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={2}>{value || 'Not set'}</Text>
  </View>
);

const SectionCard = ({title, delay = 0, children}) => (
  <Animated.View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </Animated.View>
);

const getRoleList = user => {
  const roles = [...(user?.roles || []).map(item => item.role), user?.role].filter(Boolean);
  return [...new Set(roles.map(role => String(role).toUpperCase()))].join(', ');
};

const StudentProfileScreen = ({route}) => {
  const {studentId} = route.params || {};
  const {data, loading, error} = useAsyncResource(
    options => mainAdminService.getStudentProfile(studentId, options),
    [studentId],
  );

  const monthlyAttendance = useMemo(() => {
    const groups = {};
    (data?.attendance || []).forEach(record => {
      const key = String(record.attendanceDate || '').slice(0, 7);
      if (!groups[key]) groups[key] = {month: record.attendanceDate, present: 0, total: 0};
      const status = String(record.status || '').toUpperCase();
      if (status === 'PRESENT' || status === 'ABSENT') groups[key].total += 1;
      if (status === 'PRESENT') groups[key].present += 1;
    });
    return Object.values(groups)
      .slice(-6)
      .map(item => ({...item, percent: item.total ? Math.round((item.present / item.total) * 100) : 0}));
  }, [data]);

  if (loading && !data) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.primaryDark} size="large" />
        <Text style={styles.loadingText}>Loading student profile…</Text>
      </View>
    );
  }

  if (!data?.student) {
    return (
      <View style={styles.root}>
        <EmptyState title="Student unavailable" message={error || 'Unable to load profile.'} />
      </View>
    );
  }

  const {student, summary, payments, fees, feePlans, transferHistory, promotionHistory} = data;
  const isActive = student.isActive !== false;
  const attColor =
    (summary?.attendancePercent || 0) >= 75
      ? colors.success
      : (summary?.attendancePercent || 0) >= 60
      ? colors.warning
      : colors.danger;
  const linkedParents = student.linkedParents || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Hero ── */}
      <Animated.View style={styles.hero}>
        <View style={styles.heroDecor} />
        <View style={styles.heroContent}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{getInitials(student.fullName)}</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroName} numberOfLines={2}>{student.fullName}</Text>
            <Text style={styles.heroMeta}>
              #{student.studentId} · {student.branch?.name || '—'}
            </Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, {color: attColor}]}>{summary?.attendancePercent || 0}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatCurrency(summary?.pendingAmount || 0)}</Text>
            <Text style={styles.statLabel}>Fee Due</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, {color: isActive ? '#86efac' : '#fca5a5'}]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>
      </Animated.View>

      <SectionCard title="Personal Details" delay={40}>
        <InfoRow label="Date of Birth" value={formatDateForDisplay(student.dateOfBirth)} />
        <InfoRow label="Gender" value={student.gender} />
        <InfoRow label="Blood Group" value={student.bloodGroup} />
        <InfoRow label="Phone" value={student.phoneNumber} />
        <InfoRow label="Address" value={student.address} />
      </SectionCard>

      <SectionCard title="Parent Details" delay={60}>
        {linkedParents.length > 0 ? (
          linkedParents.map((link, idx) => (
            <React.Fragment key={link.id || idx}>
              <InfoRow
                label={link.relationship || 'Parent'}
                value={`${link.user?.fullName || '—'}${getRoleList(link.user) ? ` (${getRoleList(link.user)})` : ''}`}
              />
              <InfoRow
                label={`${link.relationship || 'Parent'} Mobile`}
                value={link.user?.phoneNumber}
              />
            </React.Fragment>
          ))
        ) : (
          <>
            <InfoRow label="Father" value={student.parent?.fatherName || student.parent?.fullName} />
            <InfoRow label="Mother" value={student.parent?.motherName} />
            <InfoRow label="Phone" value={student.parent?.phoneNumber} />
            <InfoRow label="Email" value={student.parent?.email} />
          </>
        )}
      </SectionCard>

      <SectionCard title="Academic Details" delay={80}>
        <InfoRow label="Branch" value={student.branch?.name} />
        <InfoRow label="Class" value={student.academicClass?.name} />
        <InfoRow label="Wing" value={student.academicClass?.wing?.name || student.academicClass?.wing?.code} />
        <InfoRow label="Section" value={student.section?.name} />
        <InfoRow label="Roll Number" value={student.rollNumber} />
        <InfoRow label="Admission Date" value={formatDateForDisplay(student.admissionDate)} />
        <InfoRow label="Class Teacher" value={student.section?.classTeacher?.fullName} />
      </SectionCard>

      <SectionCard title="Attendance Summary" delay={100}>
        <InfoRow label="Present Days" value={summary?.presentDays} />
        <InfoRow label="Absent Days" value={summary?.absentDays} />
        <InfoRow label="Overall" value={`${summary?.attendancePercent || 0}%`} />
        {monthlyAttendance.length > 0 ? (
          <View style={styles.chart}>
            {monthlyAttendance.map(item => (
              <View key={item.month} style={styles.barItem}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, {height: `${Math.max(item.percent, 4)}%`, backgroundColor: attColor}]} />
                </View>
                <Text style={styles.barValue}>{item.percent}%</Text>
                <Text style={styles.barLabel}>{monthLabel(item.month)}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </SectionCard>

      <SectionCard title="Fee Information" delay={120}>
        <InfoRow label="Total Fees" value={formatCurrency(summary?.totalFees)} />
        <InfoRow label="Paid Amount" value={formatCurrency(summary?.paidAmount)} />
        <InfoRow label="Pending Amount" value={formatCurrency(summary?.pendingAmount)} />
        <InfoRow label="Next Due Date" value={summary?.nextDueDate} />
      </SectionCard>

      {payments?.length > 0 ? (
        <SectionCard title="Payment History" delay={140}>
          {payments.map(payment => (
            <View key={payment.id} style={styles.listRow}>
              <View style={[styles.listIcon, {backgroundColor: colors.secondarySoft}]}>
                <MaterialCommunityIcons name="receipt" size={13} color={colors.secondary} />
              </View>
              <View style={styles.listBody}>
                <Text style={styles.listTitle}>{formatCurrency(payment.amount)}</Text>
                <Text style={styles.listSub}>
                  {payment.paymentMode || 'Payment'} · {payment.receiptNumber || 'No receipt'} · {formatDateForDisplay(payment.paidAt || payment.paymentDate) || '—'}
                </Text>
              </View>
            </View>
          ))}
        </SectionCard>
      ) : null}

      {fees?.length > 0 ? (
        <SectionCard title="Fee Ledgers" delay={160}>
          {fees.map(fee => (
            <View key={fee.id} style={styles.listRow}>
              <View style={[styles.listIcon, {backgroundColor: colors.primarySoft}]}>
                <MaterialCommunityIcons name="cash-clock" size={13} color={colors.primary} />
              </View>
              <View style={styles.listBody}>
                <Text style={styles.listTitle}>{fee.status}</Text>
                <Text style={styles.listSub}>{formatCurrency(fee.paidAmount)} paid of {formatCurrency(fee.totalFee)}</Text>
              </View>
            </View>
          ))}
        </SectionCard>
      ) : null}

      {feePlans?.length > 0 ? (
        <SectionCard title="Fee Plans" delay={170}>
          {feePlans.map(plan => (
            <View key={plan.id} style={styles.listRow}>
              <View style={[styles.listIcon, {backgroundColor: colors.primarySoft}]}>
                <MaterialCommunityIcons name="file-document-outline" size={13} color={colors.primary} />
              </View>
              <View style={styles.listBody}>
                <Text style={styles.listTitle}>AY {plan.academicYear}</Text>
                <Text style={styles.listSub}>{formatCurrency(plan.totalAmount)} · {plan.isActive ? 'Active' : 'Inactive'}</Text>
              </View>
            </View>
          ))}
        </SectionCard>
      ) : null}

      {transferHistory?.length > 0 ? (
        <SectionCard title="Transfer History" delay={180}>
          {transferHistory.map(item => (
            <InfoRow
              key={item.id}
              label={`${item.oldSection?.academicClass?.name || ''}–${item.oldSection?.name || ''} → ${item.newSection?.academicClass?.name || ''}–${item.newSection?.name || ''}`}
              value={`${formatDateForDisplay(item.changedAt) || '—'} by ${item.changedBy?.fullName || 'User'}`}
            />
          ))}
        </SectionCard>
      ) : null}

      {promotionHistory?.length > 0 ? (
        <SectionCard title="Promotion History" delay={190}>
          {promotionHistory.map(item => (
            <InfoRow
              key={item.id}
              label={`${item.fromClass?.name || '—'} → ${item.toClass?.name || '—'}`}
              value={`${formatDateForDisplay(item.promotedAt) || '—'} by ${item.promotedBy?.fullName || 'User'}`}
            />
          ))}
        </SectionCard>
      ) : null}

      <SectionCard title="Documents" delay={200}>
        {[
          {label: 'Aadhaar', url: student.aadhaarDocumentUrl},
          {label: 'Transfer Certificate', url: student.transferCertificateUrl},
          {label: 'Birth Certificate', url: student.birthCertificateUrl},
        ].map(doc => (
          <View key={doc.label} style={styles.docRow}>
            <Text style={styles.infoLabel}>{doc.label}</Text>
            {doc.url ? (
              <Pressable
                onPress={() => Linking.openURL(doc.url)}
                style={styles.openDocBtn}>
                <Text style={styles.openDocBtnText}>Open</Text>
              </Pressable>
            ) : (
              <Text style={styles.infoValue}>Not uploaded</Text>
            )}
          </View>
        ))}
      </SectionCard>

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},
  loadingWrap: {alignItems: 'center', backgroundColor: colors.background, flex: 1, gap: spacing.md, justifyContent: 'center'},
  loadingText: {color: colors.textMuted, fontSize: 13, fontWeight: '600'},

  hero: {
    backgroundColor: colors.primaryDark,
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
  heroContent: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg},
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56},
  avatarText: {color: colors.white, fontSize: 16, fontWeight: '800'},
  heroCopy: {flex: 1},
  heroName: {color: colors.white, fontSize: 18, fontWeight: '800'},
  heroMeta: {color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '500', marginTop: 2},
  statsRow: {
    borderTopColor: 'rgba(255,255,255,0.12)',
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingTop: spacing.md},
  stat: {alignItems: 'center', flex: 1},
  statValue: {color: colors.white, fontSize: 14, fontWeight: '800'},
  statLabel: {color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase'},
  statSep: {backgroundColor: 'rgba(255,255,255,0.12)', width: 1},

  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.clay},
  sectionTitle: {
    backgroundColor: colors.background,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    padding: spacing.md,
    paddingBottom: spacing.xs,
    textTransform: 'uppercase'},
  infoRow: {
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
    paddingHorizontal: spacing.md},
  infoLabel: {color: colors.textMuted, flex: 1.2, fontSize: 11, fontWeight: '500'},
  infoValue: {...typography.bodyBold, color: colors.text, flex: 1.5, fontSize: 11, textAlign: 'right'},

  chart: {alignItems: 'flex-end', flexDirection: 'row', gap: spacing.sm, height: 120, margin: spacing.md, marginTop: spacing.xs},
  barItem: {alignItems: 'center', flex: 1},
  barTrack: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    height: 80,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: '100%'},
  barFill: {borderRadius: radius.sm, width: '100%'},
  barValue: {color: colors.text, fontSize: 10, fontWeight: '700', marginTop: 3},
  barLabel: {color: colors.textMuted, fontSize: 9, fontWeight: '500'},

  listRow: {
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
    paddingHorizontal: spacing.md},
  listIcon: {alignItems: 'center', borderRadius: radius.sm, height: 28, justifyContent: 'center', width: 28},
  listBody: {flex: 1},
  listTitle: {color: colors.text, fontSize: 12, fontWeight: '700'},
  listSub: {color: colors.textMuted, fontSize: 10, fontWeight: '500', marginTop: 1},

  docRow: {
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
    paddingHorizontal: spacing.md},
  openDocBtn: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3},
  openDocBtnText: {color: colors.primary, fontSize: 11, fontWeight: '700'}});

export default StudentProfileScreen;
