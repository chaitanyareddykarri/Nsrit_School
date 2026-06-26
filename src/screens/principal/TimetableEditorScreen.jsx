import React, {useState, useCallback, useMemo} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {ConfirmationModal} from '../../components';
import timetableService, {
  canManageTimetable,
  canPublishTimetable,
  canDeleteTimetable,
  getTimetableStatus} from '../../services/timetable/timetableService';
import timetablePdfService from '../../services/timetable/timetablePdfService';
import teacherService from '../../services/teachers/teacherService';
import {TIMETABLE_STATUS} from '../../config/constants';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SUBJECT_COLORS = [
  colors.primary, colors.secondary, colors.info, colors.success,
  colors.warning, colors.danger, colors.purple, '#E11D48',
];
const PERIOD_TYPES = [
  {key: 'REGULAR', label: 'Regular', icon: 'book-open-outline'},
  {key: 'LUNCH', label: 'Lunch Break', icon: 'food'},
  {key: 'BREAK', label: 'Short Break', icon: 'coffee-outline'},
];

const getSubjectColor = subject => {
  if (!subject) {return colors.border;}
  let hash = 0;
  for (const c of subject) {hash = (hash * 31 + c.charCodeAt(0)) % SUBJECT_COLORS.length;}
  return SUBJECT_COLORS[hash];
};

// ── Period Cell ───────────────────────────────────────────────────────────────

const PeriodCell = ({period, onPress}) => {
  const isLunch = period.timetableType === 'LUNCH';
  const isBreak = period.timetableType === 'BREAK';
  const hasSubject = Boolean(period.subject);
  const color = isLunch ? '#d97706' : isBreak ? '#16a34a' : getSubjectColor(period.subject);

  return (
    <Pressable
      onPress={() => onPress(period)}
      style={[
        styles.cell,
        isLunch ? styles.cellLunch
          : isBreak ? styles.cellBreak
          : hasSubject ? {borderColor: color, backgroundColor: `${color}15`}
          : styles.cellEmpty,
      ]}>
      {isLunch ? (
        <>
          <MaterialCommunityIcons name="food" size={11} color="#d97706" />
          <Text style={[styles.cellSubject, {color: '#d97706', fontSize: 7}]}>Lunch</Text>
          {period.startTime ? <Text style={styles.cellTime}>{period.startTime}</Text> : null}
        </>
      ) : isBreak ? (
        <>
          <MaterialCommunityIcons name="coffee-outline" size={11} color="#16a34a" />
          <Text style={[styles.cellSubject, {color: '#16a34a', fontSize: 7}]}>Break</Text>
          {period.startTime ? <Text style={styles.cellTime}>{period.startTime}</Text> : null}
        </>
      ) : hasSubject ? (
        <>
          <Text style={[styles.cellSubject, {color}]} numberOfLines={2}>{period.subject}</Text>
          {period.teacherName ? (
            <Text style={styles.cellTeacher} numberOfLines={1}>{period.teacherName}</Text>
          ) : null}
          {period.startTime ? (
            <Text style={styles.cellTime} numberOfLines={1}>{period.startTime}</Text>
          ) : null}
        </>
      ) : (
        <MaterialCommunityIcons name="plus" size={14} color={colors.border} />
      )}
    </Pressable>
  );
};

// ── Teacher Picker Modal ──────────────────────────────────────────────────────

const TeacherPickerModal = ({visible, teachers, onSelect, onClose}) => {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    if (!search.trim()) {return teachers;}
    const q = search.toLowerCase();
    return teachers.filter(t => (t.name || '').toLowerCase().includes(q));
  }, [teachers, search]);

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerSheet}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Teacher</Text>
            <Pressable onPress={onClose} style={styles.pickerClose}>
              <MaterialCommunityIcons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
          <View style={styles.pickerSearch}>
            <MaterialCommunityIcons name="magnify" size={16} color={colors.textMuted} />
            <TextInput
              style={styles.pickerSearchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search teacher..."
              placeholderTextColor={colors.textSoft}
              autoFocus
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={t => t.id}
            renderItem={({item}) => (
              <Pressable
                style={({pressed}) => [styles.teacherRow, pressed && {backgroundColor: colors.primaryFaint}]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                  setSearch('');
                }}>
                <View style={styles.teacherAvatar}>
                  <Text style={styles.teacherAvatarText}>{(item.name || 'T')[0].toUpperCase()}</Text>
                </View>
                <View style={styles.teacherInfo}>
                  <Text style={styles.teacherName}>{item.name}</Text>
                  {item.designation ? (
                    <Text style={styles.teacherDes}>{item.designation}</Text>
                  ) : null}
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.pickerEmpty}>
                <Text style={styles.pickerEmptyText}>No teachers found</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

// ── Section Picker Modal (for Copy From) ─────────────────────────────────────

const SectionPickerModal = ({visible, sections, onSelect, onClose}) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.sectionPickerModal} onPress={e => e.stopPropagation()}>
        <Text style={styles.modalTitle}>Copy Timetable From</Text>
        <Text style={styles.sectionPickerSub}>Select a section to copy its timetable</Text>
        <FlatList
          data={sections}
          keyExtractor={s => s.sectionId}
          style={styles.sectionPickerList}
          renderItem={({item}) => (
            <Pressable
              style={({pressed}) => [styles.sectionPickerRow, pressed && {backgroundColor: colors.primaryFaint}]}
              onPress={() => {onSelect(item); onClose();}}>
              <MaterialCommunityIcons name="school-outline" size={16} color={colors.primary} />
              <Text style={styles.sectionPickerLabel}>{item.className} — Section {item.sectionName}</Text>
            </Pressable>
          )}
        />
        <Pressable style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
      </Pressable>
    </Pressable>
  </Modal>
);

// ── Period Modal ──────────────────────────────────────────────────────────────

const PeriodModal = ({visible, period, teachers, onSave, onClear, onClose}) => {
  const [periodType, setPeriodType] = useState('REGULAR');
  const [subject, setSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [room, setRoom] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [teacherPickerVisible, setTeacherPickerVisible] = useState(false);

  React.useEffect(() => {
    if (visible && period) {
      const type = period.timetableType === 'LUNCH' || period.timetableType === 'BREAK'
        ? period.timetableType : 'REGULAR';
      setPeriodType(type);
      setSubject(type === 'REGULAR' ? (period.subject || '') : '');
      setSelectedTeacher(period.teacherId
        ? {id: period.teacherId, name: period.teacherName || ''}
        : null);
      setRoom(period.room || '');
      setStartTime(period.startTime || '');
      setEndTime(period.endTime || '');
    }
  }, [visible, period]);

  const handleSave = () => {
    if (periodType === 'REGULAR' && !subject.trim()) {
      Alert.alert('Required', 'Please enter a subject name.');
      return;
    }
    const autoSubject = periodType === 'LUNCH' ? 'Lunch Break'
      : periodType === 'BREAK' ? 'Short Break'
      : subject.trim();
    onSave({
      subject: autoSubject,
      teacherId: periodType === 'REGULAR' ? (selectedTeacher?.id || null) : null,
      teacherName: periodType === 'REGULAR' ? (selectedTeacher?.name || '') : '',
      room: room.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      timetableType: periodType,
    });
  };

  if (!period) {return null;}

  return (
    <>
      <Modal transparent animationType="fade" visible={visible && !teacherPickerVisible} onRequestClose={onClose}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.modal} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>
              {period.day} — Period {period.periodNum}
            </Text>

            {/* Period type chips */}
            <View style={styles.typeChips}>
              {PERIOD_TYPES.map(t => (
                <Pressable
                  key={t.key}
                  style={[styles.typeChip, periodType === t.key && styles.typeChipActive]}
                  onPress={() => {
                    setPeriodType(t.key);
                    if (t.key !== 'REGULAR') {setSelectedTeacher(null);}
                  }}>
                  <MaterialCommunityIcons
                    name={t.icon}
                    size={11}
                    color={periodType === t.key ? colors.white : colors.textMuted}
                  />
                  <Text style={[styles.typeChipText, periodType === t.key && styles.typeChipTextActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {periodType === 'REGULAR' ? (
              <>
                <Text style={styles.fieldLabel}>Subject *</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="book-open-outline" size={16} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="e.g. Mathematics"
                    placeholderTextColor={colors.textSoft}
                    autoFocus
                  />
                </View>

                <Text style={styles.fieldLabel}>Teacher</Text>
                <Pressable
                  style={[styles.inputWrap, styles.teacherPickerBtn]}
                  onPress={() => setTeacherPickerVisible(true)}>
                  <MaterialCommunityIcons name="account-tie-outline" size={16} color={colors.textMuted} />
                  <Text style={[styles.input, !selectedTeacher && {color: colors.textSoft}]}>
                    {selectedTeacher ? selectedTeacher.name : 'Tap to select teacher...'}
                  </Text>
                  {selectedTeacher ? (
                    <Pressable onPress={() => setSelectedTeacher(null)}>
                      <MaterialCommunityIcons name="close-circle" size={16} color={colors.textMuted} />
                    </Pressable>
                  ) : (
                    <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textMuted} />
                  )}
                </Pressable>
              </>
            ) : null}

            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>Start Time</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="09:00"
                    placeholderTextColor={colors.textSoft}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>End Time</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="clock-check-outline" size={14} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="09:45"
                    placeholderTextColor={colors.textSoft}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
            </View>

            {periodType === 'REGULAR' ? (
              <>
                <Text style={styles.fieldLabel}>Room</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="door-open" size={16} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={room}
                    onChangeText={setRoom}
                    placeholder="e.g. Room 101"
                    placeholderTextColor={colors.textSoft}
                  />
                </View>
              </>
            ) : null}

            <View style={styles.modalActions}>
              {period.subject ? (
                <Pressable style={styles.clearBtn} onPress={onClear}>
                  <Text style={styles.clearBtnText}>Clear</Text>
                </Pressable>
              ) : null}
              <Pressable style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <TeacherPickerModal
        visible={teacherPickerVisible}
        teachers={teachers}
        onSelect={t => setSelectedTeacher(t)}
        onClose={() => setTeacherPickerVisible(false)}
      />
    </>
  );
};

// ── Bell Schedule Modal ───────────────────────────────────────────────────────

const BellScheduleModal = ({visible, currentPeriods, onApply, onClose, applying}) => {
  const emptyTimes = () => {
    const t = {};
    for (let i = 1; i <= 8; i++) {t[i] = {startTime: '', endTime: ''};}
    return t;
  };
  const [times, setTimes] = useState(emptyTimes);

  React.useEffect(() => {
    if (visible) {
      const filled = emptyTimes();
      for (const p of currentPeriods || []) {
        if (p.startTime && !filled[p.periodNum]?.startTime) {
          filled[p.periodNum] = {startTime: p.startTime || '', endTime: p.endTime || ''};
        }
      }
      setTimes(filled);
    }
  }, [visible, currentPeriods]);

  const update = (pNum, field, val) =>
    setTimes(prev => ({...prev, [pNum]: {...prev[pNum], [field]: val}}));

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.pickerOverlay}>
        <View style={[styles.pickerSheet, {maxHeight: '90%'}]}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Bell Schedule</Text>
            <Pressable onPress={onClose} style={styles.pickerClose}>
              <MaterialCommunityIcons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
          <Text style={styles.bellSubtitle}>
            Set start and end times for each period. Applied to all filled periods in this section.
          </Text>
          <ScrollView contentContainerStyle={styles.bellList}>
            {Array.from({length: 8}, (_, i) => i + 1).map(pNum => (
              <View key={pNum} style={styles.bellRow}>
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>P{pNum}</Text>
                </View>
                <View style={styles.timeField}>
                  <Text style={styles.fieldLabel}>Start</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={[styles.input, {fontSize: 13}]}
                      value={times[pNum]?.startTime || ''}
                      onChangeText={v => update(pNum, 'startTime', v)}
                      placeholder="09:00"
                      placeholderTextColor={colors.textSoft}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                </View>
                <View style={styles.timeField}>
                  <Text style={styles.fieldLabel}>End</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={[styles.input, {fontSize: 13}]}
                      value={times[pNum]?.endTime || ''}
                      onChangeText={v => update(pNum, 'endTime', v)}
                      placeholder="09:45"
                      placeholderTextColor={colors.textSoft}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.bellFooter}>
            <Pressable
              style={[styles.saveBtn, {alignSelf: 'stretch', alignItems: 'center'}]}
              onPress={() => onApply(times)}
              disabled={applying}>
              {applying
                ? <ActivityIndicator size="small" color={colors.white} />
                : <Text style={styles.saveBtnText}>Apply to All Periods</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────

const TimetableEditorScreen = ({route, navigation}) => {
  const {sectionId, sectionName, className, branchId, studentCount} = route.params || {};
  const user = useSelector(state => state.auth.user);
  const role = useSelector(state => state.auth.role);
  const userId = user?.id;
  const queryClient = useQueryClient();

  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [applyingBell, setApplyingBell] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [publishConfirmVisible, setPublishConfirmVisible] = useState(false);
  const [unpublishConfirmVisible, setUnpublishConfirmVisible] = useState(false);
  const [copyPickerVisible, setCopyPickerVisible] = useState(false);
  const [bellScheduleVisible, setBellScheduleVisible] = useState(false);

  const {data: timetable, isLoading, refetch} = useQuery({
    queryKey: ['timetableSection', sectionId],
    queryFn: () => timetableService.getTimetableForSection(sectionId),
    enabled: Boolean(sectionId)});

  const {data: branchTimetables = []} = useQuery({
    queryKey: ['timetablesForBranch', branchId],
    queryFn: () => timetableService.getTimetablesForBranch(branchId),
    enabled: Boolean(branchId)});

  const {data: teachersData} = useQuery({
    queryKey: ['teachersByBranch', branchId],
    queryFn: () => teacherService.getTeachers({branchId}, {role, branchId}),
    enabled: Boolean(branchId)});
  const teachers = useMemo(() => (teachersData || []).map(t => ({
    id: t.id,
    name: t.fullName || t.name || '',
    designation: t.designation || ''})), [teachersData]);

  const timetableStatus = useMemo(
    () => getTimetableStatus(timetable?.periods || []),
    [timetable],
  );
  const isPublished = timetableStatus.status === TIMETABLE_STATUS.PUBLISHED;

  const getPeriod = useCallback((day, periodNum) => {
    const periods = timetable?.periods || [];
    return periods.find(p => p.day === day && p.periodNum === periodNum) ||
      {day, periodNum, subject: '', teacherName: '', teacherId: '', room: '', startTime: '', endTime: '', timetableType: 'REGULAR'};
  }, [timetable]);

  const handleCellPress = period => {
    setSelectedPeriod(period);
    setModalVisible(true);
  };

  const doSave = async ({subject, teacherId, teacherName, room, startTime, endTime, timetableType}) => {
    setSaving(true);
    setModalVisible(false);
    try {
      await timetableService.updatePeriodFull(sectionId, selectedPeriod.day, selectedPeriod.periodNum, {
        subject, teacherId, teacherName, room, startTime, endTime,
        status: isPublished ? TIMETABLE_STATUS.PUBLISHED : TIMETABLE_STATUS.DRAFT,
        timetableType: timetableType || 'REGULAR'}, branchId);
      queryClient.invalidateQueries({queryKey: ['timetableSection', sectionId]});
      queryClient.invalidateQueries({queryKey: ['timetablesForBranch', branchId]});
      refetch();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to save period.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePeriod = async payload => {
    if (payload.timetableType !== 'REGULAR' || !payload.teacherId) {
      doSave(payload);
      return;
    }
    const conflict = timetableService.detectTeacherConflict(
      payload.teacherId, selectedPeriod.day, selectedPeriod.periodNum,
      branchTimetables, sectionId,
    );
    if (conflict) {
      Alert.alert(
        'Conflict Detected',
        `${payload.teacherName} is already assigned to ${conflict.className} Section ${conflict.sectionName} on ${selectedPeriod.day}, Period ${selectedPeriod.periodNum}.`,
        [
          {text: 'Save Anyway', onPress: () => doSave(payload)},
          {text: 'Cancel', style: 'cancel'},
        ],
      );
      return;
    }
    doSave(payload);
  };

  const handleClearPeriod = async () => {
    if (!selectedPeriod) {return;}
    setSaving(true);
    setModalVisible(false);
    try {
      await timetableService.updatePeriodFull(sectionId, selectedPeriod.day, selectedPeriod.periodNum, {
        subject: '', teacherId: null, teacherName: '', room: '', startTime: '', endTime: '',
        status: TIMETABLE_STATUS.DRAFT,
        timetableType: 'REGULAR'}, branchId);
      queryClient.invalidateQueries({queryKey: ['timetableSection', sectionId]});
      queryClient.invalidateQueries({queryKey: ['timetablesForBranch', branchId]});
      refetch();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to clear period.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTimetable = () => setDeleteConfirmVisible(true);

  const confirmDeleteTimetable = async () => {
    setDeleteConfirmVisible(false);
    try {
      await timetableService.deleteTimetable(sectionId, branchId);
      queryClient.invalidateQueries({queryKey: ['timetableSection', sectionId]});
      queryClient.invalidateQueries({queryKey: ['timetablesForBranch', branchId]});
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to delete timetable.');
    }
  };

  const handlePublish = () => setPublishConfirmVisible(true);

  const confirmPublish = async () => {
    setPublishConfirmVisible(false);
    setPublishing(true);
    try {
      await timetableService.publishTimetable(sectionId, branchId, userId, role);
      queryClient.invalidateQueries({queryKey: ['timetableSection', sectionId]});
      queryClient.invalidateQueries({queryKey: ['timetablesForBranch', branchId]});
      refetch();
      Alert.alert('Published!', 'The timetable is now visible to students, parents, and teachers.');
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to publish timetable.');
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = () => setUnpublishConfirmVisible(true);

  const confirmUnpublish = async () => {
    setUnpublishConfirmVisible(false);
    try {
      await timetableService.unpublishTimetable(sectionId, branchId, role);
      queryClient.invalidateQueries({queryKey: ['timetableSection', sectionId]});
      queryClient.invalidateQueries({queryKey: ['timetablesForBranch', branchId]});
      refetch();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to unpublish timetable.');
    }
  };

  const handleCopyFrom = async section => {
    if (!section?.sectionId) {return;}
    try {
      const copied = await timetableService.copyTimetable(section.sectionId, sectionId, branchId, role);
      queryClient.invalidateQueries({queryKey: ['timetableSection', sectionId]});
      queryClient.invalidateQueries({queryKey: ['timetablesForBranch', branchId]});
      refetch();
      Alert.alert('Copied!', `${copied} periods copied from ${section.className} Section ${section.sectionName}.`);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to copy timetable.');
    }
  };

  const handleApplyBellSchedule = async periodTimes => {
    setBellScheduleVisible(false);
    setApplyingBell(true);
    try {
      await timetableService.applyBellSchedule(sectionId, branchId, periodTimes, role);
      queryClient.invalidateQueries({queryKey: ['timetableSection', sectionId]});
      refetch();
      Alert.alert('Done!', 'Period times updated for all filled periods.');
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to apply bell schedule.');
    } finally {
      setApplyingBell(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await timetablePdfService.downloadSectionPDF(
        timetable?.periods || [], className, sectionName,
      );
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to generate PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const copyableSections = useMemo(
    () => branchTimetables.filter(tt => tt.sectionId !== sectionId && tt.periods?.some(p => p.subject)),
    [branchTimetables, sectionId],
  );

  const canPublish = canPublishTimetable(role);
  const canDelete = canDeleteTimetable(role);
  const canManage = canManageTimetable(role);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const periodNums = Array.from({length: timetableService.MAX_PERIODS}, (_, i) => i + 1);
  const {filledCount, totalSlots} = timetableStatus;
  const isBusy = saving || publishing || applyingBell || downloading;

  return (
    <>
      <ScrollView
        style={styles.root}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>

        {/* ── Header ── */}
        <Animated.View style={styles.header}>
          <View style={styles.headerDecor} />
          <View style={styles.headerRow}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons name="calendar-clock" size={20} color={colors.white} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.headerTitle}>{className} — Section {sectionName}</Text>
              <View style={styles.headerSubRow}>
                <Text style={styles.headerSub}>{filledCount}/{totalSlots} periods filled</Text>
                {studentCount > 0 ? (
                  <>
                    <Text style={styles.headerSubDot}> · </Text>
                    <MaterialCommunityIcons name="account-group-outline" size={11} color="rgba(255,255,255,0.65)" />
                    <Text style={styles.headerSub}> {studentCount} students</Text>
                  </>
                ) : null}
                {teachers.length > 0 ? (
                  <>
                    <Text style={styles.headerSubDot}> · </Text>
                    <MaterialCommunityIcons name="account-tie-outline" size={11} color="rgba(255,255,255,0.65)" />
                    <Text style={styles.headerSub}> {teachers.length} teachers</Text>
                  </>
                ) : null}
              </View>
            </View>
            {isBusy ? <ActivityIndicator size="small" color={colors.white} /> : null}
          </View>

          {/* Status + Actions row */}
          <View style={styles.headerActions}>
            <View style={[styles.headerStatusBadge,
              {backgroundColor: isPublished ? 'rgba(34,197,94,0.25)' : 'rgba(234,179,8,0.25)'}]}>
              <MaterialCommunityIcons
                name={isPublished ? 'check-circle' : 'pencil-circle'}
                size={12}
                color={isPublished ? '#86efac' : '#fde047'}
              />
              <Text style={[styles.headerStatusText, {color: isPublished ? '#86efac' : '#fde047'}]}>
                {isPublished ? 'Published' : 'Draft'}
              </Text>
            </View>

            <View style={styles.headerActionBtns}>
              {/* Bell Schedule */}
              {canManage ? (
                <Pressable style={styles.headerActionBtn} onPress={() => setBellScheduleVisible(true)}>
                  <MaterialCommunityIcons name="bell-ring-outline" size={13} color="rgba(255,255,255,0.75)" />
                  <Text style={styles.headerActionBtnText}>Times</Text>
                </Pressable>
              ) : null}

              {/* Copy from section */}
              {canManage && copyableSections.length > 0 ? (
                <Pressable style={styles.headerActionBtn} onPress={() => setCopyPickerVisible(true)}>
                  <MaterialCommunityIcons name="content-copy" size={13} color="rgba(255,255,255,0.75)" />
                  <Text style={styles.headerActionBtnText}>Copy</Text>
                </Pressable>
              ) : null}

              {/* Download PDF — visible when published */}
              {isPublished && timetable ? (
                <Pressable style={[styles.headerActionBtn, styles.downloadBtn]} onPress={handleDownloadPDF}>
                  <MaterialCommunityIcons name="file-pdf-box" size={13} color={colors.white} />
                  <Text style={styles.headerActionBtnText}>PDF</Text>
                </Pressable>
              ) : null}

              {/* Publish / Unpublish */}
              {canPublish && timetable ? (
                isPublished ? (
                  canDelete ? (
                    <Pressable style={[styles.headerActionBtn, styles.unpublishBtn]} onPress={handleUnpublish}>
                      <MaterialCommunityIcons name="eye-off-outline" size={13} color={colors.white} />
                      <Text style={styles.headerActionBtnText}>Unpublish</Text>
                    </Pressable>
                  ) : null
                ) : (
                  <Pressable style={[styles.headerActionBtn, styles.publishBtn]} onPress={handlePublish}>
                    <MaterialCommunityIcons name="send-check-outline" size={13} color={colors.white} />
                    <Text style={styles.headerActionBtnText}>Publish</Text>
                  </Pressable>
                )
              ) : null}

              {/* Delete */}
              {canDelete && timetable ? (
                <Pressable style={styles.deleteBtn} onPress={handleDeleteTimetable}>
                  <MaterialCommunityIcons name="delete-outline" size={14} color="rgba(255,255,255,0.6)" />
                </Pressable>
              ) : null}
            </View>
          </View>
        </Animated.View>

        {/* ── Grid ── */}
        <Animated.View style={styles.grid}>
          <View style={styles.gridRow}>
            <View style={styles.periodHeader} />
            {DAYS_SHORT.map(day => (
              <View key={day} style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

          {periodNums.map(pNum => (
            <View key={pNum} style={styles.gridRow}>
              <View style={styles.periodHeader}>
                <Text style={styles.periodHeaderText}>P{pNum}</Text>
              </View>
              {timetableService.DAYS.map(day => (
                <PeriodCell
                  key={`${day}_${pNum}`}
                  period={getPeriod(day, pNum)}
                  onPress={canManage ? handleCellPress : () => {}}
                />
              ))}
            </View>
          ))}
        </Animated.View>

        {/* ── Validation summary ── */}
        {timetable && canManage ? (() => {
          const validation = timetableService.validateTimetable(timetable.periods);
          if (validation.errors.length === 0 && validation.warnings.length === 0) {return null;}
          return (
            <Animated.View style={styles.validationBox}>
              {validation.errors.map((e, i) => (
                <View key={i} style={styles.validationRow}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={13} color={colors.danger} />
                  <Text style={[styles.validationText, {color: colors.danger}]}>{e.message}</Text>
                </View>
              ))}
              {validation.warnings.map((w, i) => (
                <View key={i} style={styles.validationRow}>
                  <MaterialCommunityIcons name="information-outline" size={13} color={colors.warning} />
                  <Text style={[styles.validationText, {color: colors.warning}]}>{w}</Text>
                </View>
              ))}
            </Animated.View>
          );
        })() : null}

        {/* ── Legend ── */}
        <View style={styles.legendRow}>
          <MaterialCommunityIcons name="information-outline" size={12} color={colors.textMuted} />
          <Text style={styles.legendText}>
            {canManage
              ? 'Tap empty cell to assign · Tap filled cell to edit or clear'
              : 'View-only mode'}
          </Text>
        </View>

        <View style={{height: spacing.xxxl}} />
      </ScrollView>

      <PeriodModal
        visible={modalVisible}
        period={selectedPeriod}
        teachers={teachers}
        onSave={handleSavePeriod}
        onClear={handleClearPeriod}
        onClose={() => setModalVisible(false)}
      />

      <SectionPickerModal
        visible={copyPickerVisible}
        sections={copyableSections}
        onSelect={handleCopyFrom}
        onClose={() => setCopyPickerVisible(false)}
      />

      <BellScheduleModal
        visible={bellScheduleVisible}
        currentPeriods={timetable?.periods || []}
        onApply={handleApplyBellSchedule}
        onClose={() => setBellScheduleVisible(false)}
        applying={applyingBell}
      />

      <ConfirmationModal
        visible={deleteConfirmVisible}
        title="Delete Timetable?"
        message={`Remove all timetable data for ${className} ${sectionName}? This cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={confirmDeleteTimetable}
        onCancel={() => setDeleteConfirmVisible(false)}
      />

      <ConfirmationModal
        visible={publishConfirmVisible}
        title="Publish Timetable?"
        message="Once published, students, parents, and teachers will immediately see this timetable."
        confirmLabel="Publish Now"
        cancelLabel="Cancel"
        onConfirm={confirmPublish}
        onCancel={() => setPublishConfirmVisible(false)}
      />

      <ConfirmationModal
        visible={unpublishConfirmVisible}
        title="Unpublish Timetable?"
        message="The timetable will be hidden from students, parents, and teachers until republished."
        confirmLabel="Unpublish"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={confirmUnpublish}
        onCancel={() => setUnpublishConfirmVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.md},
  center: {alignItems: 'center', flex: 1, justifyContent: 'center'},

  // ── Header ──
  header: {
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.clayDeep},
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 70,
    height: 120,
    position: 'absolute',
    right: -20,
    top: -30,
    width: 120},
  headerRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md},
  headerIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.md,
    height: 40, width: 40,
    justifyContent: 'center'},
  headerCopy: {flex: 1},
  headerTitle: {color: colors.white, fontSize: 16, fontWeight: '800'},
  headerSubRow: {alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', marginTop: 2},
  headerSub: {color: 'rgba(255,255,255,0.65)', fontSize: 11},
  headerSubDot: {color: 'rgba(255,255,255,0.4)', fontSize: 11},

  headerActions: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap'},
  headerStatusBadge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3},
  headerStatusText: {fontSize: 10, fontWeight: '800'},
  headerActionBtns: {alignItems: 'center', flex: 1, flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end', flexWrap: 'wrap'},
  headerActionBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4},
  publishBtn: {backgroundColor: 'rgba(34,197,94,0.35)'},
  unpublishBtn: {backgroundColor: 'rgba(239,68,68,0.3)'},
  downloadBtn: {backgroundColor: 'rgba(99,102,241,0.4)'},
  headerActionBtnText: {color: colors.white, fontSize: 11, fontWeight: '700'},
  deleteBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    paddingHorizontal: 4},

  // ── Grid ──
  grid: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden'},
  gridRow: {flexDirection: 'row'},
  periodHeader: {
    alignItems: 'center',
    backgroundColor: colors.neutralSoft,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    borderRightColor: colors.border,
    borderRightWidth: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    width: 30},
  periodHeaderText: {color: colors.textMuted, fontSize: 9, fontWeight: '800'},
  dayHeader: {
    alignItems: 'center',
    backgroundColor: colors.neutralSoft,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    borderRightColor: colors.border,
    borderRightWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.sm},
  dayHeaderText: {color: colors.text, fontSize: 10, fontWeight: '800'},
  cell: {
    alignItems: 'center',
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    borderRadius: radius.md,
    borderRightColor: colors.borderLight,
    borderRightWidth: 1,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    margin: 2,
    minHeight: 58,
    padding: 3},
  cellEmpty: {
    backgroundColor: colors.background,
    borderColor: `${colors.border}88`},
  cellLunch: {backgroundColor: '#fef9c3', borderColor: '#d97706'},
  cellBreak: {backgroundColor: '#dcfce7', borderColor: '#16a34a'},
  cellSubject: {fontSize: 8, fontWeight: '800', textAlign: 'center'},
  cellTeacher: {color: colors.textMuted, fontSize: 7, marginTop: 1, textAlign: 'center'},
  cellTime: {color: colors.textSoft, fontSize: 7, marginTop: 1, textAlign: 'center'},

  // ── Validation ──
  validationBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    gap: spacing.xs,
    marginBottom: spacing.md,
    padding: spacing.md},
  validationRow: {alignItems: 'flex-start', flexDirection: 'row', gap: spacing.xs},
  validationText: {flex: 1, fontSize: 11, lineHeight: 16},

  legendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingVertical: spacing.md},
  legendText: {...typography.caption, color: colors.textMuted, textAlign: 'center'},

  // ── Period Modal ──
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl},
  modal: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    width: '100%',
    ...shadows.clayModal},
  modalTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center'},

  typeChips: {flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md},
  typeChip: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    paddingVertical: spacing.xs},
  typeChipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  typeChipText: {color: colors.textMuted, fontSize: 10, fontWeight: '700'},
  typeChipTextActive: {color: colors.white},

  fieldLabel: {
    ...typography.captionBold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    textTransform: 'uppercase'},
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm},
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    paddingVertical: 4},
  teacherPickerBtn: {cursor: 'pointer'},
  timeRow: {flexDirection: 'row', gap: spacing.sm},
  timeField: {flex: 1},
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
    marginTop: spacing.xl},
  clearBtn: {
    alignItems: 'center',
    borderColor: colors.danger,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flex: 1,
    paddingVertical: spacing.sm},
  clearBtnText: {color: colors.danger, fontSize: 13, fontWeight: '700'},
  cancelBtn: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm},
  cancelBtnText: {...typography.captionBold, color: colors.textMuted},
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    ...shadows.fab},
  saveBtnText: {color: colors.white, fontSize: 13, fontWeight: '800'},

  // ── Teacher Picker ──
  pickerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    flex: 1,
    justifyContent: 'flex-end'},
  pickerSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
    maxHeight: '75%',
    ...shadows.clayModal},
  pickerHeader: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg},
  pickerTitle: {...typography.subtitle, color: colors.text},
  pickerClose: {padding: 4},
  pickerSearch: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm},
  pickerSearchInput: {color: colors.text, flex: 1, fontSize: 14},
  teacherRow: {
    alignItems: 'center',
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md},
  teacherAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38},
  teacherAvatarText: {color: colors.primary, fontSize: 15, fontWeight: '800'},
  teacherInfo: {flex: 1},
  teacherName: {...typography.body, color: colors.text, fontWeight: '600'},
  teacherDes: {...typography.caption, color: colors.textMuted},
  pickerEmpty: {alignItems: 'center', padding: spacing.xxl},
  pickerEmptyText: {...typography.caption, color: colors.textMuted},

  // ── Bell Schedule ──
  bellSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    textAlign: 'center'},
  bellList: {paddingHorizontal: spacing.lg, paddingBottom: spacing.md},
  bellRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm},
  bellBadge: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.sm,
    height: 34,
    justifyContent: 'center',
    width: 34},
  bellBadgeText: {color: colors.primary, fontSize: 11, fontWeight: '900'},
  bellFooter: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    padding: spacing.lg},

  // ── Section Picker ──
  sectionPickerModal: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    maxHeight: '70%',
    padding: spacing.lg,
    width: '100%',
    ...shadows.clayModal},
  sectionPickerSub: {...typography.caption, color: colors.textMuted, marginBottom: spacing.md, textAlign: 'center'},
  sectionPickerList: {maxHeight: 280},
  sectionPickerRow: {
    alignItems: 'center',
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md},
  sectionPickerLabel: {...typography.body, color: colors.text, flex: 1}});

export default TimetableEditorScreen;
