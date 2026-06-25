import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {ConfirmationModal, EmptyState, SearchBar, SelectField} from '../../components';
import feeService from '../../services/fees/feeService';
import studentService from '../../services/students/studentService';
import useFeeAccess from '../../hooks/useFeeAccess';
import academicYearService from '../../services/academicYear/academicYearService';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const NativeInput = ({icon, label, ...props}) => (
  <View style={styles.inputWrap}>
    {icon ? <MaterialCommunityIcons name={icon} size={14} color={colors.textMuted} style={styles.inputIcon} /> : null}
    <TextInput style={styles.input} placeholder={label} placeholderTextColor={colors.textSoft} {...props} />
  </View>
);

const CreateFeePlanScreen = ({navigation, route}) => {
  const access = useFeeAccess();
  const queryClient = useQueryClient();
  const routeStudentId = route.params?.studentId;
  const canManagePlans = feeService.canManageFeePlans(access.role);
  const [searchText, setSearchText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [academicYear, setAcademicYear] = useState(String(academicYearService.getCurrentStartYear(access.branchId)));
  const [feeFields, setFeeFields] = useState({
    term1Fee: '', term2Fee: '', term3Fee: '', booksFee: '', transportFee: '',
    concessionType: '', concessionValue: ''});
  const [itemDraft, setItemDraft] = useState({categoryId: '', amount: ''});
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ['feeCategories', access.role],
    queryFn: () => feeService.ensureDefaultFeeCategories(access)});
  const profileQuery = useQuery({
    queryKey: ['studentFeeProfile', routeStudentId, access.role, access.wing],
    queryFn: () => feeService.getStudentFeeProfile(routeStudentId, access),
    enabled: Boolean(routeStudentId)});
  const studentsQuery = useQuery({
    queryKey: ['feePlanStudentSearch', access.branchId, searchText],
    queryFn: () => studentService.searchStudents({branchId: access.branchId, searchText, limit: 20}, access),
    enabled: Boolean(access.branchId && searchText.trim().length >= 2 && !selectedStudent)});

  const categoryOptions = (categoriesQuery.data || [])
    .filter(item => String(item.status || 'ACTIVE').toUpperCase() === 'ACTIVE')
    .map(item => ({label: item.name, value: item.id, item}));
  const concessionOptions = [
    {label: 'No Concession', value: ''},
    {label: 'Amount', value: 'AMOUNT'},
    {label: 'Percentage', value: 'PERCENTAGE'},
  ];
  const total = useMemo(() => {
    const standardTotal =
      Number(feeFields.term1Fee || 0) + Number(feeFields.term2Fee || 0) +
      Number(feeFields.term3Fee || 0) + Number(feeFields.booksFee || 0) +
      Number(feeFields.transportFee || 0);
    const extraTotal = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const concessionValue = Number(feeFields.concessionValue || 0);
    const concession =
      feeFields.concessionType === 'PERCENTAGE'
        ? (standardTotal * concessionValue) / 100
        : feeFields.concessionType === 'AMOUNT' ? concessionValue : 0;
    return Math.max(standardTotal + extraTotal - concession, 0);
  }, [feeFields, items]);

  useEffect(() => {
    if (!profileQuery.data || selectedStudent) return;
    const profile = profileQuery.data;
    setSelectedStudent({
      id: profile.studentId, fullName: profile.studentName, studentId: profile.admissionNumber,
      academicClass: {name: profile.className}, section: {name: profile.sectionName}});
    setAcademicYear(String(profile.academicYear || academicYearService.getCurrentStartYear(access.branchId)));
    setItems((profile.categories || []).map(item => ({
      categoryId: item.category?.id, categoryName: item.category?.name || 'Fee', amount: Number(item.amount || 0)})));
    setFeeFields({
      term1Fee: String(profile.term1Fee || ''), term2Fee: String(profile.term2Fee || ''),
      term3Fee: String(profile.term3Fee || ''), booksFee: String(profile.booksFee || ''),
      transportFee: String(profile.transportFee || ''), concessionType: profile.concessionType || '',
      concessionValue: String(profile.concessionValue || '')});
  }, [profileQuery.data, selectedStudent]);

  const addItem = () => {
    const category = categoryOptions.find(opt => opt.value === itemDraft.categoryId);
    if (!category || Number(itemDraft.amount) <= 0) {
      setError('Select a category and enter a valid amount.');
      return;
    }
    setItems(current => [
      ...current.filter(item => item.categoryId !== itemDraft.categoryId),
      {categoryId: itemDraft.categoryId, categoryName: category.label, amount: Number(itemDraft.amount)},
    ]);
    setItemDraft({categoryId: '', amount: ''});
    setError('');
  };

  const mutation = useMutation({
    mutationFn: () =>
      feeService.saveFeePlan(
        {
          studentId: selectedStudent?.id, academicYear: Number(academicYear), items,
          term1Fee: Number(feeFields.term1Fee || 0), term2Fee: Number(feeFields.term2Fee || 0),
          term3Fee: Number(feeFields.term3Fee || 0), booksFee: Number(feeFields.booksFee || 0),
          transportFee: Number(feeFields.transportFee || 0),
          concessionType: feeFields.concessionType || null,
          concessionValue: Number(feeFields.concessionValue || 0)},
        access,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['feeRecords']});
      queryClient.invalidateQueries({queryKey: ['studentFeeProfile', selectedStudent?.id]});
      queryClient.invalidateQueries({queryKey: ['feeReports']});
      queryClient.invalidateQueries({queryKey: ['coordinatorFeeDashboard']});
      queryClient.invalidateQueries({queryKey: ['principalFeeSummary']});
      queryClient.invalidateQueries({queryKey: ['accountantFeeDashboard']});
      queryClient.invalidateQueries({queryKey: ['parentChildren']});
      queryClient.invalidateQueries({queryKey: ['parentDashboard']});
      queryClient.invalidateQueries({queryKey: ['studentDetails', selectedStudent?.id]});
      navigation.goBack();
    },
    onError: err => setError(err.message)});

  const updateFeeField = (field, value) => setFeeFields(current => ({...current, [field]: value}));

  if (!canManagePlans) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Access denied"
          message="Only coordinators, principals, branch admins, and main admins can create or edit fee plans."
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={items}
        keyExtractor={item => item.categoryId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ── Hero ── */}
            <Animated.View style={styles.hero}>
              <View style={styles.heroDecor} />
              <Text style={styles.heroOverline}>Fee</Text>
              <Text style={styles.heroTitle}>{routeStudentId ? 'Edit Fee Plan' : 'Create Fee Plan'}</Text>
              <Text style={styles.heroSub}>Assign category-wise fees to a student</Text>
            </Animated.View>

            {/* ── Student select ── */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Student</Text>
              {!selectedStudent ? (
                <View style={styles.searchWrap}>
                  <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search student by name" />
                  {(studentsQuery.data || []).map((student, index) => (
                    <Animated.View key={student.id}>
                      <Pressable
                        onPress={() => setSelectedStudent(student)}
                        style={({pressed}) => [styles.studentRow, pressed && {opacity: 0.88}]}>
                        <View style={styles.studentAvatar}>
                          <Text style={styles.studentAvatarText}>{(student.fullName || '?')[0]}</Text>
                        </View>
                        <View style={styles.studentInfo}>
                          <Text style={styles.studentName}>{student.fullName}</Text>
                          <Text style={styles.studentMeta}>
                            {student.studentId} · {student.academicClass?.name || '—'}–{student.section?.name || '—'}
                          </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={14} color={colors.textMuted} />
                      </Pressable>
                    </Animated.View>
                  ))}
                </View>
              ) : (
                <View style={styles.selectedStudent}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentAvatarText}>{(selectedStudent.fullName || '?')[0]}</Text>
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{selectedStudent.fullName}</Text>
                    <Text style={styles.studentMeta}>
                      {selectedStudent.studentId} · {selectedStudent.academicClass?.name || '—'}–{selectedStudent.section?.name || '—'}
                    </Text>
                  </View>
                  {!routeStudentId ? (
                    <Pressable onPress={() => setSelectedStudent(null)} style={styles.clearBtn}>
                      <MaterialCommunityIcons name="close" size={14} color={colors.textMuted} />
                    </Pressable>
                  ) : null}
                </View>
              )}
            </View>

            {/* ── Academic year ── */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Academic Year</Text>
              <NativeInput icon="calendar" label="Academic Year" keyboardType="number-pad" value={academicYear} onChangeText={setAcademicYear} />
            </View>

            {/* ── Tuition ── */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Tuition Structure</Text>
              <NativeInput icon="numeric-1-circle-outline" label="1st Term Fee" keyboardType="numeric" value={feeFields.term1Fee} onChangeText={v => updateFeeField('term1Fee', v)} />
              <NativeInput icon="numeric-2-circle-outline" label="2nd Term Fee" keyboardType="numeric" value={feeFields.term2Fee} onChangeText={v => updateFeeField('term2Fee', v)} />
              <NativeInput icon="numeric-3-circle-outline" label="3rd Term Fee" keyboardType="numeric" value={feeFields.term3Fee} onChangeText={v => updateFeeField('term3Fee', v)} />
            </View>

            {/* ── Custom fees ── */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Custom Fees</Text>
              <NativeInput icon="book-open-page-variant-outline" label="Books Fee" keyboardType="numeric" value={feeFields.booksFee} onChangeText={v => updateFeeField('booksFee', v)} />
              <NativeInput icon="bus-school" label="Transport Fee" keyboardType="numeric" value={feeFields.transportFee} onChangeText={v => updateFeeField('transportFee', v)} />
              <SelectField label="Concession Type" value={feeFields.concessionType} options={concessionOptions} onChange={v => updateFeeField('concessionType', v)} />
              {feeFields.concessionType ? (
                <NativeInput icon="sale-outline" label="Concession Value" keyboardType="numeric" value={feeFields.concessionValue} onChangeText={v => updateFeeField('concessionValue', v)} />
              ) : null}
            </View>

            {/* ── Add fee item ── */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Additional Categories</Text>
              <SelectField
                label="Fee Category"
                value={itemDraft.categoryId}
                options={categoryOptions}
                onChange={v => setItemDraft(current => ({...current, categoryId: v}))}
              />
              <NativeInput icon="cash" label="Amount" keyboardType="numeric" value={itemDraft.amount} onChangeText={v => setItemDraft(current => ({...current, amount: v}))} />
              <Pressable
                onPress={addItem}
                style={({pressed}) => [styles.addItemBtn, pressed && {opacity: 0.88}]}>
                <MaterialCommunityIcons name="plus" size={14} color={colors.secondary} />
                <Text style={styles.addItemBtnText}>Add Fee Item</Text>
              </Pressable>
            </View>

            {/* ── Total ── */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Final Payable</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>

            {items.length > 0 ? (
              <Text style={styles.categoryLabel}>Fee Categories Added</Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <Animated.View>
            <Pressable
              onPress={() => setItems(current => current.filter(row => row.categoryId !== item.categoryId))}
              style={styles.feeItemCard}>
              <View style={styles.feeItemIcon}>
                <MaterialCommunityIcons name="tag-outline" size={14} color={colors.secondary} />
              </View>
              <Text style={styles.feeItemName}>{item.categoryName}</Text>
              <Text style={styles.feeItemAmount}>{formatCurrency(item.amount)}</Text>
              <MaterialCommunityIcons name="close-circle-outline" size={16} color={colors.danger} />
            </Pressable>
          </Animated.View>
        )}
        ListEmptyComponent={<EmptyState title="No fee items" message="Add fee categories and amounts above." />}
        ListFooterComponent={
          <View style={styles.footer}>
            {error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            <Pressable
              onPress={() => setConfirmVisible(true)}
              disabled={mutation.isPending || !selectedStudent}
              style={({pressed}) => [
                styles.saveBtn,
                (mutation.isPending || !selectedStudent) && {opacity: 0.5},
                pressed && selectedStudent && {opacity: 0.88},
              ]}>
              <MaterialCommunityIcons name="content-save-outline" size={18} color={colors.white} />
              <Text style={styles.saveBtnText}>{mutation.isPending ? 'Saving…' : 'Save Fee Plan'}</Text>
            </Pressable>
          </View>
        }
      />
      <ConfirmationModal
        visible={confirmVisible}
        title="Save Fee Plan?"
        message={`Create a fee plan for ${selectedStudent?.fullName || 'this student'}? This will set their fee structure for the year.`}
        confirmLabel="Yes, Save"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmVisible(false);
          mutation.mutate();
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingBottom: spacing.xxxl},

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
  heroOverline: {color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase'},
  heroTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  heroSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 4},

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
  searchWrap: {padding: spacing.sm, paddingTop: 0},

  studentRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md},
  selectedStudent: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md},
  studentAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36},
  studentAvatarText: {color: colors.primary, fontSize: 13, fontWeight: '800'},
  studentInfo: {flex: 1},
  studentName: {...typography.bodyBold, color: colors.text},
  studentMeta: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  clearBtn: {padding: spacing.xs},

  inputWrap: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md},
  inputIcon: {marginRight: spacing.sm},
  input: {color: colors.text, flex: 1, fontSize: 14, fontWeight: '500', minHeight: 44},

  addItemBtn: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    padding: spacing.md},
  addItemBtnText: {color: colors.secondary, fontSize: 13, fontWeight: '700'},

  totalCard: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.clay},
  totalLabel: {color: colors.secondary, fontSize: 14, fontWeight: '700'},
  totalValue: {color: colors.secondary, fontSize: 20, fontWeight: '800'},

  categoryLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'},
  feeItemCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.clay},
  feeItemIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.md,
    height: 30,
    justifyContent: 'center',
    width: 30},
  feeItemName: {...typography.bodyBold, color: colors.text, flex: 1},
  feeItemAmount: {color: colors.secondary, fontSize: 13, fontWeight: '800'},

  footer: {marginTop: spacing.md},
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md},
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},
  saveBtn: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 50,
    justifyContent: 'center',
    ...shadows.fab},
  saveBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'}});

export default CreateFeePlanScreen;
