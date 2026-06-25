import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useDispatch, useSelector} from 'react-redux';
import {ConfirmationModal, EmptyState} from '../../components';
import DatePickerField from '../../components/forms/DatePickerField';
import academicYearService from '../../services/academicYear/academicYearService';
import {loadActiveAcademicYear, selectActiveAcademicYear} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing} from '../../theme';
import {formatDateForDisplay, toISODate} from '../../utils/helpers/dateHelpers';

const STATUS_COLOR = {
  ACTIVE:   colors.success,
  PLANNING: colors.warning,
  CLOSED:   colors.textMuted};
const STATUS_ICON = {
  ACTIVE:   'check-circle',
  PLANNING: 'clock-outline',
  CLOSED:   'archive-outline'};

const EMPTY_FORM = {name: '', startYear: '', startDate: '', endDate: ''};

const buildNextYearDefaults = existingYears => {
  const years = existingYears || [];
  const maxStartYear = years.reduce((max, y) => Math.max(max, y.startYear || 0), 0);
  const nextStart = maxStartYear > 0 ? maxStartYear + 1 : new Date().getFullYear();
  const shortEnd = String(nextStart + 1).slice(-2);
  return {
    name: `${nextStart}-${shortEnd}`,
    startYear: String(nextStart),
    startDate: `${nextStart}-06-01`,
    endDate: `${nextStart + 1}-04-30`};
};

// ── Academic year card ───────────────────────────────────────────────────────

const YearCard = ({year, isCurrentActive, onActivate, onClose, onEdit}) => {
  const statusColor = STATUS_COLOR[year.status] || colors.textMuted;
  const statusIcon  = STATUS_ICON[year.status]  || 'calendar';
  const isClosed    = year.status === 'CLOSED';

  return (
    <View style={[card.wrap, isCurrentActive && card.wrapActive, isClosed && card.wrapClosed]}>
      <View style={card.left}>
        <View style={[card.statusDot, {backgroundColor: statusColor}]} />
        <View style={card.info}>
          <Text style={[card.name, isClosed && card.nameClosed]}>{year.name}</Text>
          <Text style={card.dates}>
            {formatDateForDisplay(year.startDate)} – {formatDateForDisplay(year.endDate)}
          </Text>
          <View style={card.statusRow}>
            <MaterialCommunityIcons name={statusIcon} size={12} color={statusColor} />
            <Text style={[card.statusText, {color: statusColor}]}>{year.status}</Text>
          </View>
        </View>
      </View>
      <View style={card.actions}>
        {year.status === 'PLANNING' ? (
          <Pressable onPress={() => onEdit(year)} style={card.iconBtn} hitSlop={8}>
            <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.textMuted} />
          </Pressable>
        ) : null}
        {year.status === 'PLANNING' ? (
          <Pressable onPress={() => onActivate(year)} style={card.activateBtn}>
            <Text style={card.activateBtnText}>Activate</Text>
          </Pressable>
        ) : null}
        {year.status === 'ACTIVE' ? (
          <Pressable onPress={() => onClose(year)} style={card.closeBtn}>
            <Text style={card.closeBtnText}>Close</Text>
          </Pressable>
        ) : null}
        {isClosed ? (
          <MaterialCommunityIcons name="archive-outline" size={16} color={colors.textMuted} />
        ) : null}
      </View>
    </View>
  );
};

// ── Form modal ───────────────────────────────────────────────────────────────

const YearForm = ({visible, initial, onSave, onCancel, saving, error, minStartDate, maxEndDate}) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);

  React.useEffect(() => {
    if (visible) { setForm(initial || EMPTY_FORM); }
  }, [visible, initial]);

  const set = key => value => setForm(f => {
    const updated = {...f, [key]: value};
    if (key === 'startYear' && value.length === 4) {
      const yr = parseInt(value, 10);
      if (!isNaN(yr)) {
        updated.name = `${yr}-${String(yr + 1).slice(-2)}`;
      }
    }
    if (key === 'name') {
      const match = value.match(/^(\d{4})/);
      if (match) { updated.startYear = match[1]; }
    }
    return updated;
  });

  const isEdit = Boolean(initial?.id);

  if (!visible) { return null; }

  return (
    <View style={modal.overlay}>
      <Animated.View style={modal.sheet}>
        <Text style={modal.title}>{isEdit ? 'Edit Academic Year' : 'Create Academic Year'}</Text>

        <View style={modal.field}>
          <Text style={modal.label}>Year Name (e.g. 2026-27)</Text>
          <TextInput
            style={modal.input}
            value={form.name}
            onChangeText={set('name')}
            placeholder="2026-27"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={modal.field}>
          <Text style={modal.label}>Start Year (e.g. 2026)</Text>
          <TextInput
            style={modal.input}
            value={form.startYear}
            onChangeText={set('startYear')}
            keyboardType="number-pad"
            placeholder="2026"
            placeholderTextColor={colors.textMuted}
            maxLength={4}
          />
        </View>

        <DatePickerField
          label="Start Date"
          value={form.startDate}
          onChange={set('startDate')}
          minimumDate={minStartDate}
          required
        />
        <DatePickerField
          label="End Date"
          value={form.endDate}
          onChange={set('endDate')}
          minimumDate={form.startDate || minStartDate}
          maximumDate={maxEndDate}
          required
        />

        {Boolean(error) ? (
          <Text style={modal.error}>{error}</Text>
        ) : null}

        <View style={modal.btnRow}>
          <Pressable onPress={onCancel} style={modal.cancelBtn}>
            <Text style={modal.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={() => onSave(form)}
            disabled={saving}
            style={[modal.saveBtn, saving && modal.saveBtnDisabled]}>
            <Text style={modal.saveBtnText}>{saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
};

// ── Main screen ──────────────────────────────────────────────────────────────

const AcademicYearManagementScreen = () => {
  const user = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const [formVisible, setFormVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // has .id → edit, no .id → create
  const [createDefaults, setCreateDefaults] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // {type, year}
  const [formError, setFormError] = useState('');

  const yearsQuery = useQuery({
    queryKey: ['academicYears', user?.branchId],
    queryFn: () => academicYearService.getAcademicYears({branchId: user.branchId}),
    enabled: Boolean(user?.branchId)});

  const years = yearsQuery.data || [];
  const hasPlannedYear = years.some(y => y.status === 'PLANNING');

  const invalidate = () => {
    queryClient.invalidateQueries({queryKey: ['academicYears', user?.branchId]});
    queryClient.invalidateQueries({queryKey: ['auth/activeAcademicYear']});
  };

  const createMutation = useMutation({
    mutationFn: data => academicYearService.createAcademicYear({
      branchId: user.branchId,
      name: data.name.trim(),
      startYear: parseInt(data.startYear, 10),
      startDate: data.startDate.trim(),
      endDate: data.endDate.trim()}),
    onSuccess: () => { setFormVisible(false); setCreateDefaults(null); setFormError(''); invalidate(); academicYearService.clearCache(user.branchId); },
    onError: err => setFormError(err.message || 'Failed to create academic year.')});

  const updateMutation = useMutation({
    mutationFn: data => academicYearService.updateAcademicYear({
      id: editTarget.id,
      name: data.name.trim(),
      startDate: data.startDate.trim(),
      endDate: data.endDate.trim()}),
    onSuccess: () => { setFormVisible(false); setEditTarget(null); setFormError(''); invalidate(); academicYearService.clearCache(user.branchId); },
    onError: err => setFormError(err.message || 'Failed to update academic year.')});

  const activateMutation = useMutation({
    mutationFn: year => academicYearService.activateAcademicYear({id: year.id, branchId: user.branchId}),
    onSuccess: () => {
      setConfirmAction(null);
      invalidate();
      academicYearService.clearCache(user.branchId);
      dispatch(loadActiveAcademicYear(user.branchId));
    },
    onError: () => { setConfirmAction(null); }});

  const closeMutation = useMutation({
    mutationFn: year => academicYearService.closeAcademicYear({id: year.id}),
    onSuccess: () => {
      setConfirmAction(null);
      invalidate();
      academicYearService.clearCache(user.branchId);
      dispatch(loadActiveAcademicYear(user.branchId));
    },
    onError: () => { setConfirmAction(null); }});

  const handleSave = form => {
    setFormError('');
    if (!form.name || !form.startYear || !form.startDate || !form.endDate) {
      setFormError('All fields are required.');
      return;
    }
    if (isNaN(parseInt(form.startYear, 10))) {
      setFormError('Start year must be a 4-digit number.');
      return;
    }
    if (editTarget) { updateMutation.mutate(form); }
    else { createMutation.mutate(form); }
  };

  const handleEdit = year => {
    setEditTarget(year);
    setFormError('');
    setFormVisible(true);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header card */}
        <Animated.View style={styles.headerCard}>
          <View style={styles.headerDecor} />
          <Text style={styles.headerOverline}>Academic Year</Text>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Year Management</Text>
            <Pressable
              onPress={() => {
                if (hasPlannedYear) { return; }
                setEditTarget(null);
                setCreateDefaults(buildNextYearDefaults(years));
                setFormError('');
                setFormVisible(true);
              }}
              style={[styles.createBtn, hasPlannedYear && styles.createBtnDisabled]}>
              <MaterialCommunityIcons name="plus" size={16} color={colors.white} />
              <Text style={styles.createBtnText}>{hasPlannedYear ? 'Upcoming Set' : 'New Year'}</Text>
            </Pressable>
          </View>
          {activeAcademicYear ? (
            <View style={styles.activeChip}>
              <MaterialCommunityIcons name="check-circle" size={12} color={colors.success} />
              <Text style={styles.activeChipText}>
                Active: {activeAcademicYear.name}
              </Text>
            </View>
          ) : (
            <View style={[styles.activeChip, styles.inactiveChip]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={12} color={colors.warning} />
              <Text style={[styles.activeChipText, {color: colors.warning}]}>
                No active academic year
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Year list */}
        {yearsQuery.isLoading ? (
          <Text style={styles.loadingText}>Loading…</Text>
        ) : years.length === 0 ? (
          <EmptyState
            title="No academic years"
            message="Create your first academic year to get started."
          />
        ) : (
          years.map((year, i) => (
            <Animated.View key={year.id}>
              <YearCard
                year={year}
                isCurrentActive={year.id === activeAcademicYear?.id}
                onActivate={y => setConfirmAction({type: 'activate', year: y})}
                onClose={y => setConfirmAction({type: 'close', year: y})}
                onEdit={handleEdit}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Create/Edit form overlay */}
      <YearForm
        visible={formVisible}
        initial={editTarget ? {
          id: editTarget.id,
          name: editTarget.name,
          startYear: String(editTarget.startYear),
          startDate: editTarget.startDate,
          endDate: editTarget.endDate} : createDefaults}
        minStartDate={activeAcademicYear?.endDate || toISODate(new Date())}
        maxEndDate={(() => {
          const base = editTarget?.startYear || createDefaults?.startYear;
          if (base) { return `${parseInt(base, 10) + 1}-05-31`; }
          if (activeAcademicYear?.startYear) { return `${activeAcademicYear.startYear + 2}-05-31`; }
          return undefined;
        })()}
        onSave={handleSave}
        onCancel={() => { setFormVisible(false); setEditTarget(null); setCreateDefaults(null); setFormError(''); }}
        saving={isSaving}
        error={formError}
      />

      {/* Activate confirmation */}
      <ConfirmationModal
        visible={confirmAction?.type === 'activate'}
        title="Activate Academic Year?"
        message={`Activating "${confirmAction?.year?.name}" will deactivate the current active year. Attendance and other features will use this year from now on.`}
        confirmLabel="Activate"
        cancelLabel="Cancel"
        onConfirm={() => activateMutation.mutate(confirmAction.year)}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Close confirmation */}
      <ConfirmationModal
        visible={confirmAction?.type === 'close'}
        title="Close Academic Year?"
        message={`Closing "${confirmAction?.year?.name}" will stop all attendance for this year. Make sure all promotions are processed before closing.`}
        confirmLabel="Close Year"
        cancelLabel="Cancel"
        onConfirm={() => closeMutation.mutate(confirmAction.year)}
        onCancel={() => setConfirmAction(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg, paddingBottom: spacing.xxxl},
  loadingText: {color: colors.textMuted, fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: spacing.xl},

  headerCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  headerDecor: {backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 80, height: 120, position: 'absolute', right: -20, top: -30, width: 120},
  headerOverline: {color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase'},
  headerRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm},
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  createBtn: {alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.pill, flexDirection: 'row', gap: 5, paddingHorizontal: spacing.md, paddingVertical: 7},
  createBtnDisabled: {backgroundColor: 'rgba(255,255,255,0.08)', opacity: 0.6},
  createBtnText: {color: colors.white, fontSize: 13, fontWeight: '700'},
  activeChip: {alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.pill, flexDirection: 'row', gap: 5, paddingHorizontal: spacing.sm, paddingVertical: 4},
  inactiveChip: {backgroundColor: 'rgba(255,165,0,0.2)'},
  activeChipText: {color: colors.white, fontSize: 12, fontWeight: '600'}});

// Year card styles
const card = StyleSheet.create({
  wrap: {backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, padding: spacing.md, ...shadows.clay},
  wrapActive: {borderColor: colors.success},
  wrapClosed: {backgroundColor: `${colors.background}cc`, opacity: 0.6},
  nameClosed: {color: colors.textMuted},
  left: {alignItems: 'flex-start', flexDirection: 'row', flex: 1, gap: spacing.sm},
  statusDot: {borderRadius: 6, height: 12, marginTop: 3, width: 12},
  info: {flex: 1},
  name: {color: colors.text, fontSize: 15, fontWeight: '800'},
  dates: {color: colors.textMuted, fontSize: 12, fontWeight: '500', marginTop: 2},
  statusRow: {alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 4},
  statusText: {fontSize: 11, fontWeight: '700'},
  actions: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  iconBtn: {padding: 4},
  activateBtn: {backgroundColor: `${colors.primary}15`, borderColor: colors.primary, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: 5},
  activateBtnText: {color: colors.primary, fontSize: 12, fontWeight: '700'},
  closeBtn: {backgroundColor: `${colors.danger}10`, borderColor: colors.danger, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: 5},
  closeBtnText: {color: colors.danger, fontSize: 12, fontWeight: '700'}});

// Form modal styles
const modal = StyleSheet.create({
  overlay: {backgroundColor: 'rgba(0,0,0,0.5)', bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, justifyContent: 'flex-end'},
  sheet: {backgroundColor: colors.surface, borderTopLeftRadius: radius.hero, borderTopRightRadius: radius.hero, padding: spacing.xl, ...shadows.clayDeep},
  title: {color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: spacing.lg},
  field: {marginBottom: spacing.md},
  label: {color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.3, marginBottom: 6, textTransform: 'uppercase'},
  input: {backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, color: colors.text, fontSize: 14, fontWeight: '600', paddingHorizontal: spacing.md, paddingVertical: 10},
  error: {color: colors.danger, fontSize: 12, fontWeight: '600', marginBottom: spacing.sm},
  btnRow: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm},
  cancelBtn: {alignItems: 'center', borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, flex: 1, height: 46, justifyContent: 'center'},
  cancelText: {color: colors.textMuted, fontSize: 14, fontWeight: '700'},
  saveBtn: {alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.card, flex: 1, height: 46, justifyContent: 'center'},
  saveBtnDisabled: {backgroundColor: colors.border},
  saveBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'}});

export default AcademicYearManagementScreen;
