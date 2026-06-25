import React, {useState, useEffect} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {uploadOfflinePayment} from '../../store/slices/feeSlice';
import {ConfirmationModal} from '../../components';
import StudentSearchModal from './components/StudentSearchModal';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const FEE_CATEGORIES = [
  {id: 'tuition', label: 'Tuition Fee', icon: 'school-outline'},
  {id: 'admission', label: 'Admission Fee', icon: 'account-plus-outline'},
  {id: 'exam', label: 'Exam Fee', icon: 'file-document-edit-outline'},
  {id: 'transport', label: 'Transport Fee', icon: 'bus-side'},
  {id: 'hostel', label: 'Hostel & Mess', icon: 'bed-double-outline'},
];

const FieldLabel = ({children}) => <Text style={styles.fieldLabel}>{children}</Text>;

const InputField = ({icon, placeholder, value, onChangeText, keyboardType, prefix, editable = true}) => (
  <View style={[styles.inputWrap, !editable && styles.inputDisabled]}>
    {prefix ? <Text style={styles.inputPrefix}>{prefix}</Text> : null}
    {icon && !prefix ? (
      <MaterialCommunityIcons name={icon} size={16} color={colors.textMuted} style={styles.inputIcon} />
    ) : null}
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSoft}
      keyboardType={keyboardType || 'default'}
      editable={editable}
    />
  </View>
);

const RecordPaymentScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {submitting, error} = useSelector(state => state.fees);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [amount, setAmount] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tuition');
  const [paymentDate, setPaymentDate] = useState('');
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'});
    setPaymentDate(today);
  }, []);

  const handleSelectStudent = student => {
    setSelectedStudent(student);
    setValidationError('');
  };

  const handleUpload = () => {
    if (!selectedStudent) {
      setValidationError('Please select a student first.');
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setValidationError('Please enter a valid payment amount.');
      return;
    }
    if (!receiptNo.trim()) {
      setValidationError('Please enter the manual receipt number.');
      return;
    }
    setValidationError('');
    setConfirmVisible(true);
  };

  const handleConfirmUpload = async () => {
    setConfirmVisible(false);
    const categoryLabel = FEE_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Fee';
    const action = await dispatch(
      uploadOfflinePayment({
        studentId: selectedStudent.studentId,
        studentName: selectedStudent.fullName,
        amount: Number(amount),
        receiptNo: receiptNo.trim(),
        mode: 'Cash',
        category: categoryLabel,
        date: new Date().toISOString()}),
    );

    if (uploadOfflinePayment.fulfilled.match(action)) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* ── Top header ── */}
      <Animated.View style={styles.header}>
        <View style={styles.headerDecor} />
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={colors.white} />
        </Pressable>
        <Text style={styles.headerOverline}>Accountant</Text>
        <Text style={styles.headerTitle}>Record Payment</Text>
        <Text style={styles.headerSub}>Post manual cash collections to ledger</Text>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* ── Student selector ── */}
        <Text style={styles.sectionLabel}>Student</Text>
        {!selectedStudent ? (
          <Pressable
            onPress={() => setSearchModalVisible(true)}
            style={({pressed}) => [styles.selectorCard, pressed && {opacity: 0.85}]}>
            <View style={styles.selectorLeft}>
              <View style={styles.selectorIconWrap}>
                <MaterialCommunityIcons
                  name="account-search-outline"
                  size={22}
                  color={colors.secondary}
                />
              </View>
              <View>
                <Text style={styles.selectorTitle}>Search Student</Text>
                <Text style={styles.selectorSub}>Select recipient for this payment</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
        ) : (
          <View style={styles.studentCard}>
            <View style={styles.studentLeft}>
              <View style={styles.studentAvatar}>
                <Text style={styles.studentAvatarText}>
                  {selectedStudent.fullName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{selectedStudent.fullName}</Text>
                <Text style={styles.studentMeta}>
                  ID: {selectedStudent.studentId} · {selectedStudent.className}–
                  {selectedStudent.sectionName}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => setSelectedStudent(null)}
              style={styles.clearBtn}>
              <MaterialCommunityIcons name="close" size={16} color={colors.danger} />
            </Pressable>
          </View>
        )}

        {/* ── Category chips ── */}
        <Text style={styles.sectionLabel}>Fee Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroll}>
          {FEE_CATEGORIES.map(cat => {
            const active = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[styles.chip, active && styles.chipActive]}>
                <MaterialCommunityIcons
                  name={cat.icon}
                  size={14}
                  color={active ? colors.white : colors.textMuted}
                />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Payment inputs ── */}
        <Text style={styles.sectionLabel}>Payment Details</Text>
        <View style={styles.formCard}>
          <FieldLabel>Amount (INR)</FieldLabel>
          <InputField
            prefix="₹"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <FieldLabel>Receipt / Voucher Number</FieldLabel>
          <InputField
            icon="receipt"
            placeholder="e.g. REC-26-8942"
            value={receiptNo}
            onChangeText={setReceiptNo}
          />

          <FieldLabel>Payment Date</FieldLabel>
          <InputField
            icon="calendar-today"
            value={paymentDate}
            editable={false}
          />
        </View>

        {/* ── Audit notice ── */}
        <View style={styles.auditNotice}>
          <MaterialCommunityIcons
            name="shield-alert-outline"
            size={16}
            color={colors.warning}
          />
          <Text style={styles.auditText}>
            This transaction is double-logged in the general ledger. Once submitted,
            the receipt cannot be reversed without administrator audit overrides.
          </Text>
        </View>

        {/* ── Error ── */}
        {Boolean(validationError || error) ? (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.danger} />
            <Text style={styles.errorText}>{validationError || error}</Text>
          </View>
        ) : null}

        <View style={{height: spacing.xxxl}} />
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={handleUpload}
          disabled={submitting}
          style={({pressed}) => [
            styles.submitBtn,
            submitting && styles.submitBtnDisabled,
            pressed && !submitting && {opacity: 0.88},
          ]}>
          {submitting ? (
            <Text style={styles.submitText}>Uploading…</Text>
          ) : (
            <>
              <MaterialCommunityIcons name="upload-outline" size={18} color={colors.white} />
              <Text style={styles.submitText}>Upload Payment</Text>
            </>
          )}
        </Pressable>
      </View>

      <ConfirmationModal
        visible={confirmVisible}
        title="Record Payment?"
        message={`Record ₹${amount} payment for ${selectedStudent?.fullName || 'student'} (Receipt: ${receiptNo})?`}
        confirmLabel="Yes, Upload"
        cancelLabel="Cancel"
        onConfirm={handleConfirmUpload}
        onCancel={() => setConfirmVisible(false)}
      />
      <StudentSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSelectStudent={handleSelectStudent}
      />
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {backgroundColor: colors.background, flex: 1},

  // Header
  header: {
    backgroundColor: colors.secondary,
    borderRadius: radius.hero,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 120,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 120},
  backBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.sm,
    height: 36,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 36},
  headerOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 4},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500'},

  scroll: {flex: 1},
  scrollContent: {padding: spacing.lg},

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textTransform: 'uppercase'},

  // Student selector
  selectorCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    ...shadows.clay},
  selectorLeft: {alignItems: 'center', flexDirection: 'row', gap: spacing.md},
  selectorIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44},
  selectorTitle: {...typography.bodyBold, color: colors.text},
  selectorSub: {color: colors.textMuted, fontSize: 12, fontWeight: '500', marginTop: 1},

  // Student card
  studentCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.secondary,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    ...shadows.clay},
  studentLeft: {alignItems: 'center', flex: 1, flexDirection: 'row', gap: spacing.md},
  studentAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44},
  studentAvatarText: {color: colors.primary, fontSize: 14, fontWeight: '800'},
  studentInfo: {flex: 1},
  studentName: {...typography.bodyBold, color: colors.text},
  studentMeta: {color: colors.secondary, fontSize: 11, fontWeight: '600', marginTop: 2},
  clearBtn: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    height: 30,
    justifyContent: 'center',
    width: 30},

  // Category chips
  chipScroll: {marginBottom: spacing.xs},
  chipRow: {gap: spacing.sm, paddingVertical: 2},
  chip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.clay},
  chipActive: {backgroundColor: colors.secondary, borderColor: colors.secondary},
  chipText: {color: colors.textMuted, fontSize: 12, fontWeight: '600'},
  chipTextActive: {color: colors.white, fontWeight: '700'},

  // Form card
  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    padding: spacing.md,
    ...shadows.clay},
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
    textTransform: 'uppercase'},
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 46,
    marginBottom: 4,
    paddingHorizontal: spacing.md},
  inputDisabled: {backgroundColor: `${colors.border}40`},
  inputPrefix: {color: colors.text, fontSize: 16, fontWeight: '700', marginRight: 6},
  inputIcon: {marginRight: 8},
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0},

  // Audit notice
  auditNotice: {
    alignItems: 'flex-start',
    backgroundColor: colors.warningSoft,
    borderColor: `${colors.warning}30`,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md},
  auditText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18},

  // Error
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md},
  errorText: {color: colors.danger, flex: 1, fontSize: 13, fontWeight: '600'},

  // Bottom bar
  bottomBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.borderLight,
    borderTopWidth: 1.5,
    padding: spacing.md,
    paddingBottom: spacing.md,
    ...shadows.clay},
  submitBtn: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 50,
    justifyContent: 'center',
    ...shadows.fab},
  submitBtnDisabled: {opacity: 0.55},
  submitText: {color: colors.white, fontSize: 15, fontWeight: '700'}});

export default RecordPaymentScreen;
