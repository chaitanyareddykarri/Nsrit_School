import React, {useMemo, useState} from 'react';
import {Linking, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState} from '../../components';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import {formatCurrency} from '../../utils/formatters/currency';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';
import {maskAadhaar} from '../../utils/masking';
import {USER_ROLES} from '../../config/constants';
import {colors, radius, shadows, spacing, typography} from '../../theme';

// Roles that may reveal a student's full Aadhaar number on demand.
// PARENT and plain TEACHER never see it — they have no administrative need.
const AADHAAR_REVEAL_ROLES = new Set([
  USER_ROLES.MAIN_ADMIN,
  USER_ROLES.BRANCH_ADMIN,
  USER_ROLES.PRINCIPAL,
  USER_ROLES.COORDINATOR,
  USER_ROLES.CLASS_TEACHER,
  USER_ROLES.ACCOUNTANT,
]);

const countStatus = (records, status) =>
  records.filter(item => String(item.status).toUpperCase() === status).length;
const getFeePlans = data => data?.feePlans || data?.studentDetailFeePlans || [];
const getFeeItems = plan => plan?.items || plan?.detailFeeItems || [];
const getFeePayments = plan => plan?.payments || plan?.detailFeePayments || [];
const isActivePayment = payment =>
  !['REVERSED', 'CANCELLED'].includes(String(payment.status || 'RECORDED').toUpperCase());
const getRoleList = user => {
  const roles = [...(user?.roles || []).map(item => item.role), user?.role].filter(Boolean);
  return [...new Set(roles.map(role => String(role).toUpperCase()))].join(', ');
};

const getInitials = name =>
  name
    ? name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    : '?';

const InfoRow = ({icon, label, value, rightIcon}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <MaterialCommunityIcons name={icon} size={14} color={colors.primary} />
    </View>
    <View style={styles.infoBody}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueRow}>
        <Text style={styles.infoValue} numberOfLines={2}>{value || '—'}</Text>
        {rightIcon ? (
          <MaterialCommunityIcons name={rightIcon} size={16} color={colors.textSecondary} style={styles.infoRowEyeIcon} />
        ) : null}
      </View>
    </View>
  </View>
);

const SectionCard = ({title, children}) => (
  <Animated.View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </Animated.View>
);

const StudentDetailsScreen = ({navigation, route}) => {
  const studentId = route.params?.studentId;
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const canRevealAadhaar = AADHAAR_REVEAL_ROLES.has(String(user?.role || '').toUpperCase());
  const [aadhaarRevealed, setAadhaarRevealed] = useState(false);
  const {data} = useQuery({
    queryKey: ['studentDetails', studentId],
    queryFn: () => studentService.getStudentDetails(studentId, scope),
    enabled: Boolean(studentId)});

  const attendance = data?.attendances || [];
  const presentCount = countStatus(attendance, 'PRESENT');
  const absentCount = countStatus(attendance, 'ABSENT');
  const totalAttendance = presentCount + absentCount;
  const attendancePercentage = totalAttendance ? Math.round((presentCount / totalAttendance) * 100) : 0;
  const feePlans = getFeePlans(data);
  const activeFeePlan = feePlans.find(plan => plan.isActive !== false) || feePlans[0];
  const activeFeeItems = getFeeItems(activeFeePlan);
  const activeFeePayments = getFeePayments(activeFeePlan).filter(isActivePayment);

  const feeSummary = useMemo(() => {
    if (activeFeePlan) {
      const total =
        Number(activeFeePlan.totalAmount || 0) ||
        activeFeeItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const paid = activeFeePayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      return {total, paid, due: Math.max(total - paid, 0)};
    }
    const fees = data?.studentFees || [];
    return fees.reduce(
      (s, fee) => ({
        total: s.total + Number(fee.totalFee || 0),
        paid: s.paid + Number(fee.paidAmount || 0),
        due: s.due + Number(fee.remainingAmount || 0)}),
      {total: 0, paid: 0, due: 0},
    );
  }, [activeFeeItems, activeFeePayments, activeFeePlan, data]);

  const student = data?.student;
  const linkedParents = student?.linkedParents || [];
  if (!student) {
    return (
      <View style={styles.root}>
        <EmptyState title="Student unavailable" message="The student record could not be loaded." />
      </View>
    );
  }

  const attColor = attendancePercentage >= 75 ? colors.success : attendancePercentage >= 60 ? colors.warning : colors.danger;

  return (
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
              #{student.studentId} · {student.academicClass?.name || '—'}–{student.section?.name || '—'}
            </Text>
          </View>
        </View>

        {/* ── Key stats ── */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, {color: attColor}]}>{attendancePercentage}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatCurrency(feeSummary.due)}</Text>
            <Text style={styles.statLabel}>Fee Due</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{student.status || 'ACTIVE'}</Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>

        <Pressable
          onPress={() => navigation.navigate('EditStudent', {studentId: student.id})}
          style={styles.editBtn}>
          <MaterialCommunityIcons name="pencil-outline" size={13} color={colors.primary} />
          <Text style={styles.editBtnText}>Edit Student</Text>
        </Pressable>
      </Animated.View>

      <SectionCard title="Personal Details">
        <InfoRow icon="account-outline" label="Gender" value={student.gender} />
        <InfoRow icon="calendar-account-outline" label="Date of Birth" value={formatDateForDisplay(student.dateOfBirth)} />
        <InfoRow icon="water-outline" label="Blood Group" value={student.bloodGroup} />
        <InfoRow
          icon="map-marker-outline"
          label="Address"
          value={[student.address, student.city, student.state, student.pincode].filter(Boolean).join(', ')}
        />
      </SectionCard>

      <SectionCard title="Parent Details">
        {linkedParents.length > 0 ? (
          linkedParents.map((link, idx) => (
            <React.Fragment key={link.id || idx}>
              <InfoRow
                icon="account-outline"
                label={link.relationship || 'Parent'}
                value={`${link.user?.fullName || '—'}${getRoleList(link.user) ? ` (${getRoleList(link.user)})` : ''}`}
              />
              <InfoRow
                icon="phone-outline"
                label={`${link.relationship || 'Parent'} Mobile`}
                value={link.user?.phoneNumber}
              />
            </React.Fragment>
          ))
        ) : (
          <>
            <InfoRow icon="account-outline" label="Father" value={student.parent?.fatherName || student.parent?.fullName} />
            <InfoRow icon="account-outline" label="Mother" value={student.parent?.motherName} />
            <InfoRow icon="phone-outline" label="Parent Mobile" value={student.parent?.phoneNumber || student.phoneNumber} />
          </>
        )}
      </SectionCard>

      <SectionCard title="Academic Details">
        <InfoRow icon="book-education-outline" label="Class" value={student.academicClass?.name} />
        <InfoRow icon="google-classroom" label="Section" value={student.section?.name} />
        <InfoRow icon="account-tie-outline" label="Class Teacher" value={student.section?.classTeacher?.fullName} />
        <InfoRow icon="calendar-start" label="Admission Date" value={formatDateForDisplay(student.admissionDate)} />
      </SectionCard>

      <SectionCard title="Attendance Summary">
        <InfoRow icon="chart-donut" label="Percentage" value={`${attendancePercentage}%`} />
        <InfoRow icon="clipboard-check-outline" label="Present" value={String(presentCount)} />
        <InfoRow icon="clipboard-alert-outline" label="Absent" value={String(absentCount)} />
      </SectionCard>

      <SectionCard title="Fee Summary">
        <InfoRow icon="book-open-variant" label="Fee Plan" value={activeFeePlan ? `AY ${activeFeePlan.academicYear || '—'}` : 'Not assigned'} />
        <InfoRow icon="cash-multiple" label="Total Fee" value={formatCurrency(feeSummary.total)} />
        <InfoRow icon="cash-check" label="Paid Amount" value={formatCurrency(feeSummary.paid)} />
        <InfoRow icon="cash-clock" label="Pending Amount" value={formatCurrency(feeSummary.due)} />
        {activeFeeItems.map(item => (
          <InfoRow key={item.id} icon="tag-outline" label={item.category?.name || 'Fee'} value={formatCurrency(item.amount)} />
        ))}
      </SectionCard>

      {activeFeePayments.length > 0 ? (
        <SectionCard title="Payment History">
          {activeFeePayments.map(payment => (
            <InfoRow
              key={payment.id}
              icon="receipt"
              label={payment.receiptNumber || 'Receipt pending'}
              value={`${formatCurrency(payment.amount)} · ${formatDateForDisplay(payment.paymentDate) || '—'} · ${payment.paymentMode || '—'}`}
            />
          ))}
        </SectionCard>
      ) : null}

      <SectionCard title="Documents">
        {student.aadhaarNumber ? (
          <Pressable
            onPress={() => canRevealAadhaar && setAadhaarRevealed(prev => !prev)}
            accessibilityRole="button"
            accessibilityLabel={aadhaarRevealed ? 'Hide Aadhaar number' : 'Reveal Aadhaar number'}>
            <InfoRow
              icon="card-account-details-outline"
              label="Aadhaar"
              value={
                aadhaarRevealed
                  ? student.aadhaarNumber
                  : maskAadhaar(student.aadhaarNumber)
              }
              rightIcon={
                canRevealAadhaar
                  ? aadhaarRevealed ? 'eye-off-outline' : 'eye-outline'
                  : undefined
              }
            />
          </Pressable>
        ) : (
          <InfoRow
            icon="card-account-details-outline"
            label="Aadhaar"
            value={student.aadhaarDocumentUrl ? 'Document uploaded' : 'Number not provided'}
          />
        )}
        <InfoRow
          icon="card-account-details-star-outline"
          label="Apaar ID"
          value={student.apaarId || 'Not provided'}
        />
        {[
          {icon: 'file-document-outline', label: 'Transfer Certificate', url: student.transferCertificateUrl},
          {icon: 'file-certificate-outline', label: 'Birth Certificate', url: student.birthCertificateUrl},
        ].map(doc => (
          <View key={doc.label} style={styles.docRow}>
            <View style={styles.docIcon}>
              <MaterialCommunityIcons name={doc.icon} size={14} color={colors.primary} />
            </View>
            <View style={styles.docBody}>
              <Text style={styles.infoLabel}>{doc.label}</Text>
              <Text style={styles.infoValue}>{doc.url ? 'Uploaded' : 'Not uploaded'}</Text>
            </View>
            {doc.url ? (
              <Pressable
                onPress={() => Linking.openURL(doc.url)}
                style={({pressed}) => [styles.openBtn, pressed && {opacity: 0.7}]}>
                <MaterialCommunityIcons name="open-in-new" size={13} color={colors.primary} />
                <Text style={styles.openBtnText}>Open</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </SectionCard>

      {(data?.studentSectionHistories || []).length > 0 ? (
        <SectionCard title="Transfer History">
          {data.studentSectionHistories.map(item => (
            <InfoRow
              key={item.id}
              icon="swap-horizontal"
              label={`${item.oldSection?.academicClass?.name || ''}–${item.oldSection?.name || ''} → ${item.newSection?.academicClass?.name || ''}–${item.newSection?.name || ''}`}
              value={`${formatDateForDisplay(item.changedAt) || '—'} by ${item.changedBy?.fullName || '—'}`}
            />
          ))}
        </SectionCard>
      ) : null}

      {(data?.studentPromotionHistories || []).length > 0 ? (
        <SectionCard title="Promotion History">
          {data.studentPromotionHistories.map(item => (
            <InfoRow
              key={item.id}
              icon="school-outline"
              label={`${item.fromClass?.name || ''} → ${item.toClass?.name || ''}`}
              value={`${formatDateForDisplay(item.promotedAt) || '—'} by ${item.promotedBy?.fullName || '—'}`}
            />
          ))}
        </SectionCard>
      ) : null}

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},

  hero: {
    backgroundColor: colors.primary,
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
    marginBottom: spacing.md,
    paddingTop: spacing.md},
  stat: {alignItems: 'center', flex: 1},
  statValue: {color: colors.white, fontSize: 14, fontWeight: '800'},
  statLabel: {color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase'},
  statSep: {backgroundColor: 'rgba(255,255,255,0.12)', width: 1},
  editBtn: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    ...shadows.fab},
  editBtnText: {color: colors.primary, fontSize: 12, fontWeight: '700'},

  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
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
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.sm,
    paddingHorizontal: spacing.md},
  infoIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    height: 30,
    justifyContent: 'center',
    width: 30},
  infoBody: {flex: 1, minWidth: 0},
  infoLabel: {color: colors.textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase'},
  infoValue: {...typography.bodyBold, color: colors.text, fontSize: 12, marginTop: 1},
  infoValueRow: {alignItems: 'center', flexDirection: 'row', gap: 6},
  infoRowEyeIcon: {opacity: 0.6},
  docRow: {
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.sm,
    paddingHorizontal: spacing.md},
  docIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    height: 30,
    justifyContent: 'center',
    width: 30},
  docBody: {flex: 1},
  openBtn: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6},
  openBtnText: {color: colors.primary, fontSize: 12, fontWeight: '700'}});

export default StudentDetailsScreen;
