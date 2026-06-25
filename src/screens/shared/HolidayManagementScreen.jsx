import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {EmptyState, SelectField, SkeletonLoader} from '../../components';
import {
  HOLIDAY_TYPE_ICONS,
  HOLIDAY_TYPE_LABELS,
  HOLIDAY_TYPES,
  USER_ROLES} from '../../config/constants';
import {holidayService} from '../../services/holidays/holidayService';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {toISODate} from '../../utils/helpers/dateHelpers';

const pad = n => String(n).padStart(2, '0');

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const TYPE_OPTIONS = Object.values(HOLIDAY_TYPES).map(t => ({
  label: HOLIDAY_TYPE_LABELS[t] || t,
  value: t}));

const TYPE_COLORS = {
  [HOLIDAY_TYPES.NATIONAL]:  {bg: '#FEF2F2', text: '#DC2626', border: '#FECACA'},
  [HOLIDAY_TYPES.STATE]:     {bg: '#FFFBEB', text: '#D97706', border: '#FDE68A'},
  [HOLIDAY_TYPES.SCHOOL]:    {bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE'},
  [HOLIDAY_TYPES.FESTIVAL]:  {bg: '#FDF4FF', text: '#9333EA', border: '#E9D5FF'},
  [HOLIDAY_TYPES.EMERGENCY]: {bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA'}};

const formatDisplayDate = dateStr => {
  if (!dateStr) {return '';}
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'});
};

// ── Type badge ─────────────────────────────────────────────────────────────────
const TypeBadge = ({type}) => {
  const c = TYPE_COLORS[type] || {bg: colors.surfaceAlt, text: colors.textMuted, border: colors.border};
  return (
    <View style={[s.typeBadge, {backgroundColor: c.bg, borderColor: c.border}]}>
      <MaterialCommunityIcons name={HOLIDAY_TYPE_ICONS[type] || 'calendar'} size={10} color={c.text} />
      <Text style={[s.typeBadgeText, {color: c.text}]}>{HOLIDAY_TYPE_LABELS[type] || type}</Text>
    </View>
  );
};

// ── Holiday card ───────────────────────────────────────────────────────────────
const HolidayCard = ({item, onEdit, onDelete, canManage}) => (
  <Animated.View style={s.card}>
    <View style={s.cardDateCol}>
      <Text style={s.cardDay}>{new Date(item.date + 'T00:00:00').getDate()}</Text>
      <Text style={s.cardMonthAbbr}>
        {MONTH_NAMES[new Date(item.date + 'T00:00:00').getMonth()].slice(0, 3).toUpperCase()}
      </Text>
    </View>
    <View style={s.cardBody}>
      <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
      {item.description ? (
        <Text style={s.cardDesc} numberOfLines={2}>{item.description}</Text>
      ) : null}
      <TypeBadge type={item.type} />
    </View>
    {canManage ? (
      <View style={s.cardActions}>
        <Pressable onPress={() => onEdit(item)} hitSlop={8} style={s.iconBtn}>
          <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.primary} />
        </Pressable>
        <Pressable onPress={() => onDelete(item)} hitSlop={8} style={s.iconBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.danger} />
        </Pressable>
      </View>
    ) : null}
  </Animated.View>
);

// ── Month header ───────────────────────────────────────────────────────────────
const MonthHeader = ({label}) => (
  <View style={s.monthHeader}>
    <Text style={s.monthHeaderText}>{label}</Text>
  </View>
);

// ── Add / Edit modal ───────────────────────────────────────────────────────────
const HolidayFormModal = ({visible, editing, ayStartDate, ayEndDate, onSubmit, onClose, isPending}) => {
  const [name,        setName]        = useState(editing?.name        || '');
  const [date,        setDate]        = useState(editing?.date        || toISODate());
  const [type,        setType]        = useState(editing?.type        || HOLIDAY_TYPES.SCHOOL);
  const [description, setDescription] = useState(editing?.description || '');
  const [dateError,   setDateError]   = useState('');

  React.useEffect(() => {
    if (visible) {
      setName(editing?.name || '');
      setDate(editing?.date || toISODate());
      setType(editing?.type || HOLIDAY_TYPES.SCHOOL);
      setDescription(editing?.description || '');
      setDateError('');
    }
  }, [visible, editing]);

  const handleDateChange = raw => {
    setDate(raw);
    if (ayStartDate && ayEndDate && (raw < ayStartDate || raw > ayEndDate)) {
      setDateError(`Date must be within AY (${ayStartDate} – ${ayEndDate})`);
    } else {
      setDateError('');
    }
  };

  const canSubmit = name.trim() && date && type && !dateError;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.modalBackdrop} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.modalKAV}>
          <Pressable style={s.modalCard} onPress={() => {}}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editing ? 'Edit Holiday' : 'Add Holiday'}</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <MaterialCommunityIcons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={s.formField}>
                <Text style={s.fieldLabel}>Holiday Name *</Text>
                <TextInput
                  style={s.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Diwali, Sports Day"
                  placeholderTextColor={colors.textSoft}
                  autoCapitalize="words"
                />
              </View>

              <View style={s.formField}>
                <Text style={s.fieldLabel}>Date *</Text>
                <TextInput
                  style={[s.textInput, dateError && s.textInputError]}
                  value={date}
                  onChangeText={handleDateChange}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSoft}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
                {dateError ? <Text style={s.fieldError}>{dateError}</Text> : null}
                {ayStartDate && ayEndDate ? (
                  <Text style={s.fieldHint}>AY range: {ayStartDate} – {ayEndDate}</Text>
                ) : null}
              </View>

              <View style={s.formField}>
                <SelectField
                  label="Holiday Type *"
                  value={type}
                  options={TYPE_OPTIONS}
                  onChange={setType}
                />
              </View>

              <View style={s.formField}>
                <Text style={s.fieldLabel}>Description (optional)</Text>
                <TextInput
                  style={[s.textInput, s.textInputMulti]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Add a note about this holiday"
                  placeholderTextColor={colors.textSoft}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={s.modalFooter}>
              <Pressable onPress={onClose} style={s.cancelBtn} disabled={isPending}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => canSubmit && onSubmit({name: name.trim(), date, type, description: description.trim()})}
                style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
                disabled={!canSubmit || isPending}>
                {isPending ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={s.submitBtnText}>{editing ? 'Update' : 'Add Holiday'}</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

// ── Delete confirmation ────────────────────────────────────────────────────────
const DeleteModal = ({visible, holiday, onConfirm, onClose, isPending}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={s.modalBackdrop} onPress={onClose}>
      <Pressable style={[s.modalCard, {maxWidth: 320}]} onPress={() => {}}>
        <View style={s.deleteIconRow}>
          <View style={s.deleteIconBg}>
            <MaterialCommunityIcons name="trash-can-outline" size={28} color={colors.danger} />
          </View>
        </View>
        <Text style={s.deleteTitle}>Delete Holiday?</Text>
        <Text style={s.deleteMsg}>
          Remove <Text style={{fontWeight: '700'}}>{holiday?.name}</Text> ({formatDisplayDate(holiday?.date)}) from the calendar? Staff and parents have already been notified about this holiday.
        </Text>
        <View style={s.modalFooter}>
          <Pressable onPress={onClose} style={s.cancelBtn} disabled={isPending}>
            <Text style={s.cancelBtnText}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            style={[s.submitBtn, {backgroundColor: colors.danger}]}
            disabled={isPending}>
            {isPending ? <ActivityIndicator size="small" color={colors.white} /> : (
              <Text style={s.submitBtnText}>Delete</Text>
            )}
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

// ── Seed confirmation ──────────────────────────────────────────────────────────
const SeedModal = ({visible, count, onConfirm, onClose, isPending}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={s.modalBackdrop} onPress={onClose}>
      <Pressable style={[s.modalCard, {maxWidth: 340}]} onPress={() => {}}>
        <View style={s.deleteIconRow}>
          <View style={[s.deleteIconBg, {backgroundColor: `${colors.primary}12`}]}>
            <MaterialCommunityIcons name="flag-outline" size={28} color={colors.primary} />
          </View>
        </View>
        <Text style={s.deleteTitle}>Seed Public Holidays</Text>
        <Text style={s.deleteMsg}>
          This will add {count} standard India national and festival holidays for this academic year. Holidays that already exist will be skipped. All staff and parents will be notified.
        </Text>
        <View style={s.modalFooter}>
          <Pressable onPress={onClose} style={s.cancelBtn} disabled={isPending}>
            <Text style={s.cancelBtnText}>Cancel</Text>
          </Pressable>
          <Pressable onPress={onConfirm} style={s.submitBtn} disabled={isPending}>
            {isPending ? <ActivityIndicator size="small" color={colors.white} /> : (
              <Text style={s.submitBtnText}>Seed Holidays</Text>
            )}
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

// ── Main screen ────────────────────────────────────────────────────────────────
const HolidayManagementScreen = () => {
  const user             = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const queryClient      = useQueryClient();

  const branchId       = user?.branchId;
  const role           = String(user?.role || '').toUpperCase();
  const ayStartDate    = activeAcademicYear?.startDate || '';
  const ayEndDate      = activeAcademicYear?.endDate   || '';
  const ayStartYear    = ayStartDate ? parseInt(ayStartDate.split('-')[0], 10) : new Date().getFullYear();

  const canManage = [USER_ROLES.PRINCIPAL, USER_ROLES.COORDINATOR, USER_ROLES.MAIN_ADMIN].includes(role);

  const [formVisible,   setFormVisible]   = useState(false);
  const [editingHol,    setEditingHol]    = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [seedVisible,   setSeedVisible]   = useState(false);
  const [toast,         setToast]         = useState('');

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ── Query ──────────────────────────────────────────────────────────────────
  const {data: holidays = [], isLoading, refetch} = useQuery({
    queryKey: ['branchHolidays', branchId, ayStartDate, ayEndDate],
    queryFn:  () => holidayService.getHolidaysByBranch(branchId, ayStartDate, ayEndDate),
    enabled:  Boolean(branchId && ayStartDate && ayEndDate),
    staleTime: 2 * 60 * 1000});

  // Pre-calculate seed count
  const seedPreviewCount = useMemo(() => {
    if (!ayStartDate || !ayEndDate || !ayStartYear) {return 0;}
    const list = holidayService.buildPublicHolidayList(ayStartYear, ayStartDate, ayEndDate);
    const existing = new Set(holidays.map(h => h.date));
    return list.filter(h => !existing.has(h.date)).length;
  }, [holidays, ayStartDate, ayEndDate, ayStartYear]);

  // Build flat list with month-header items
  const listData = useMemo(() => {
    const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date));
    const result = [];
    let lastMonth = '';
    sorted.forEach(h => {
      const ym = h.date.slice(0, 7);
      if (ym !== lastMonth) {
        const [y, m] = ym.split('-').map(Number);
        result.push({type: 'header', id: `hdr-${ym}`, label: `${MONTH_NAMES[m - 1]} ${y}`});
        lastMonth = ym;
      }
      result.push({type: 'holiday', id: h.id, ...h});
    });
    return result;
  }, [holidays]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const invalidate = () => {
    queryClient.invalidateQueries({queryKey: ['branchHolidays', branchId]});
    queryClient.invalidateQueries({queryKey: ['holidayMap', branchId]});
  };

  const createMutation = useMutation({
    mutationFn: payload => holidayService.createHoliday({
      ...payload,
      branchId,
      createdById:   user?.id,
      createdByRole: user?.role,
      createdByName: user?.fullName}),
    onSuccess: () => {
      setFormVisible(false);
      setEditingHol(null);
      invalidate();
      showToast('Holiday added. Notifications sent to all staff and parents.');
    },
    onError: err => showToast(`Failed: ${err.message}`)});

  const updateMutation = useMutation({
    mutationFn: payload => holidayService.updateHoliday({
      ...payload,
      id:            editingHol?.id,
      branchId,
      updatedById:   user?.id,
      updatedByRole: user?.role,
      updatedByName: user?.fullName}),
    onSuccess: () => {
      setFormVisible(false);
      setEditingHol(null);
      invalidate();
      showToast('Holiday updated. Notifications sent.');
    },
    onError: err => showToast(`Failed: ${err.message}`)});

  const deleteMutation = useMutation({
    mutationFn: () => holidayService.deleteHoliday({
      id:          deleteTarget?.id,
      branchId,
      date:        deleteTarget?.date,
      deletedById: user?.id}),
    onSuccess: () => {
      setDeleteTarget(null);
      invalidate();
      showToast('Holiday deleted.');
    },
    onError: err => showToast(`Failed: ${err.message}`)});

  const seedMutation = useMutation({
    mutationFn: () => holidayService.seedPublicHolidays({
      branchId,
      startYear: ayStartYear,
      ayStartDate,
      ayEndDate,
      createdById: user?.id}),
    onSuccess: result => {
      setSeedVisible(false);
      invalidate();
      showToast(`${result.seeded} public holidays seeded (${result.skipped} already existed).`);
    },
    onError: err => showToast(`Seed failed: ${err.message}`)});

  const handleFormSubmit = payload => {
    if (editingHol) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEdit = item => {
    setEditingHol(item);
    setFormVisible(true);
  };

  const openAdd = () => {
    setEditingHol(null);
    setFormVisible(true);
  };

  const renderItem = ({item}) => {
    if (item.type === 'header') {
      return <MonthHeader label={item.label} />;
    }
    return (
      <HolidayCard
        item={item}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        canManage={canManage}
      />
    );
  };

  return (
    <View style={s.root}>
      {/* AY info strip */}
      {activeAcademicYear ? (
        <View style={s.ayStrip}>
          <MaterialCommunityIcons name="calendar-range" size={14} color={colors.primary} />
          <Text style={s.ayStripText}>
            {activeAcademicYear.name} · {ayStartDate} – {ayEndDate}
          </Text>
          <Text style={s.ayHolCount}>{holidays.length} holiday{holidays.length !== 1 ? 's' : ''}</Text>
        </View>
      ) : null}

      {/* Seed button */}
      {canManage ? (
        <View style={s.seedRow}>
          <MaterialCommunityIcons name="information-outline" size={13} color={colors.textMuted} />
          <Text style={s.seedHint}>
            {seedPreviewCount > 0
              ? `${seedPreviewCount} public holidays can be added`
              : 'All standard public holidays already seeded'}
          </Text>
          <Pressable
            onPress={() => setSeedVisible(true)}
            disabled={seedPreviewCount === 0 || seedMutation.isPending}
            style={[s.seedBtn, seedPreviewCount === 0 && s.seedBtnDisabled]}>
            <MaterialCommunityIcons name="flag-outline" size={13} color={seedPreviewCount > 0 ? colors.primary : colors.textMuted} />
            <Text style={[s.seedBtnText, seedPreviewCount === 0 && {color: colors.textMuted}]}>Seed Public</Text>
          </Pressable>
        </View>
      ) : null}

      {/* List */}
      {isLoading ? (
        <View style={s.loaderWrap}>
          {[0, 1, 2, 3].map(i => <SkeletonLoader key={i} width="100%" height={72} borderRadius={12} style={{marginBottom: 10}} />)}
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={item => item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-remove-outline"
              title="No holidays yet"
              message={canManage
                ? "Tap 'Add Holiday' below or seed public holidays to get started."
                : "No holidays have been declared for this academic year yet."}
            />
          }
          renderItem={renderItem}
        />
      )}

      {/* Add FAB */}
      {canManage ? (
        <Pressable onPress={openAdd} style={s.fab}>
          <MaterialCommunityIcons name="plus" size={22} color={colors.white} />
          <Text style={s.fabText}>Add Holiday</Text>
        </Pressable>
      ) : null}

      {/* Toast */}
      {toast ? (
        <View style={s.toast}>
          <MaterialCommunityIcons name="check-circle-outline" size={14} color={colors.white} />
          <Text style={s.toastText}>{toast}</Text>
        </View>
      ) : null}

      {/* Modals */}
      <HolidayFormModal
        visible={formVisible}
        editing={editingHol}
        ayStartDate={ayStartDate}
        ayEndDate={ayEndDate}
        onSubmit={handleFormSubmit}
        onClose={() => { setFormVisible(false); setEditingHol(null); }}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteModal
        visible={Boolean(deleteTarget)}
        holiday={deleteTarget}
        onConfirm={() => deleteMutation.mutate()}
        onClose={() => setDeleteTarget(null)}
        isPending={deleteMutation.isPending}
      />

      <SeedModal
        visible={seedVisible}
        count={seedPreviewCount}
        onConfirm={() => seedMutation.mutate()}
        onClose={() => setSeedVisible(false)}
        isPending={seedMutation.isPending}
      />
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1},

  // AY strip
  ayStrip: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderBottomColor: colors.primarySoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm},
  ayStripText: {
    ...typography.caption,
    color: colors.primary,
    flex: 1,
    fontWeight: '600'},
  ayHolCount: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11},

  // Seed row
  seedRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm},
  seedHint: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1},
  seedBtn: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5},
  seedBtnDisabled: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border},
  seedBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700'},

  // List
  loaderWrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg},
  listContent: {
    paddingBottom: 120,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md},

  // Month header
  monthHeader: {
    marginBottom: spacing.xs,
    marginTop: spacing.md},
  monthHeaderText: {
    ...typography.label,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase'},

  // Holiday card
  card: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md},
  cardDateCol: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.sm,
    minWidth: 44,
    paddingHorizontal: 6,
    paddingVertical: spacing.xs},
  cardDay: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22},
  cardMonthAbbr: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    opacity: 0.7},
  cardBody: {
    flex: 1,
    gap: 3},
  cardName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700'},
  cardDesc: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 16},
  typeBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
    paddingHorizontal: 7,
    paddingVertical: 2},
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700'},
  cardActions: {
    flexDirection: 'row',
    gap: spacing.xs},
  iconBtn: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    height: 32,
    justifyContent: 'center',
    width: 32},

  // FAB
  fab: {
    ...shadows.fab,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    bottom: 28,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    position: 'absolute',
    right: spacing.lg},
  fabText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800'},

  // Toast
  toast: {
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: radius.pill,
    bottom: 90,
    flexDirection: 'row',
    gap: spacing.xs,
    left: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'absolute',
    right: spacing.lg},
  toastText: {
    color: colors.white,
    flex: 1,
    fontSize: 13,
    fontWeight: '500'},

  // Modal
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.52)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg},
  modalKAV: {
    width: '100%'},
  modalCard: {
    ...shadows.clayDeep,
    backgroundColor: colors.surface,
    borderRadius: radius.hero,
    maxHeight: '88%',
    padding: spacing.xl,
    width: '100%'},
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg},
  modalTitle: {
    ...typography.subtitle,
    color: colors.text,
    fontWeight: '800'},
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg},

  // Form
  formField: {
    marginBottom: spacing.md},
  fieldLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 6},
  fieldHint: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4},
  fieldError: {
    color: colors.danger,
    fontSize: 11,
    marginTop: 4},
  textInput: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 10},
  textInputError: {
    borderColor: colors.danger},
  textInputMulti: {
    minHeight: 72,
    paddingTop: 10},

  // Buttons
  cancelBtn: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flex: 1,
    paddingVertical: 12},
  cancelBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700'},
  submitBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    flex: 1,
    paddingVertical: 12},
  submitBtnDisabled: {
    backgroundColor: colors.primarySoft,
    opacity: 0.6},
  submitBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800'},

  // Delete modal
  deleteIconRow: {
    alignItems: 'center',
    marginBottom: spacing.md},
  deleteIconBg: {
    alignItems: 'center',
    backgroundColor: `${colors.danger}12`,
    borderRadius: radius.pill,
    height: 60,
    justifyContent: 'center',
    width: 60},
  deleteTitle: {
    ...typography.subtitle,
    color: colors.text,
    fontWeight: '800',
    marginBottom: spacing.sm,
    textAlign: 'center'},
  deleteMsg: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    textAlign: 'center'}});

export default HolidayManagementScreen;
