import React, {useState} from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
  ActivityIndicator} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {ConfirmationModal, EmptyState, FloatingActionButton} from '../../components';
import noticesService from '../../services/notices/noticesService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const CATEGORIES = ['All', 'Academic', 'Fee', 'Holiday', 'Event', 'Urgent'];
const EDIT_CATEGORIES = ['Academic', 'Fee', 'Holiday', 'Event', 'Urgent'];

const CATEGORY_META = {
  Academic: {color: colors.primary, icon: 'school-outline'},
  Fee: {color: colors.secondary, icon: 'cash-multiple'},
  Holiday: {color: colors.success, icon: 'calendar-star'},
  Event: {color: colors.purple, icon: 'party-popper'},
  Urgent: {color: colors.danger, icon: 'alert-circle-outline'}};

const formatDate = dateStr => {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'});
  } catch {
    return dateStr;
  }
};

// ── Edit Modal ──────────────────────────────────────────────────────────────
const EditNoticeModal = ({visible, notice, onSave, onClose}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Academic');
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (visible && notice) {
      setTitle(notice.title || '');
      setBody(notice.body || '');
      setCategory(notice.category || 'Academic');
      setPinned(notice.pinned || false);
    }
  }, [visible, notice]);

  const handleSave = async () => {
    if (!title.trim()) {Alert.alert('Required', 'Title is required.'); return;}
    if (!body.trim() || body.trim().length < 10) {Alert.alert('Required', 'Body must be at least 10 characters.'); return;}
    setSaving(true);
    try {
      await onSave({title: title.trim(), body: body.trim(), category, pinned});
    } finally {
      setSaving(false);
    }
  };

  if (!notice) {return null;}
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.editModal}>
          <View style={styles.editHeader}>
            <Text style={styles.editTitle}>Edit Notice</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <Text style={styles.fieldLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {EDIT_CATEGORIES.map(cat => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.catChipEdit, category === cat && styles.catChipEditActive]}>
                <Text style={[styles.catChipEditText, category === cat && styles.catChipEditTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>Title *</Text>
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons name="format-title" size={16} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Notice title"
              placeholderTextColor={colors.textSoft}
              maxLength={120}
            />
          </View>

          <Text style={styles.fieldLabel}>Body *</Text>
          <View style={[styles.inputWrap, {alignItems: 'flex-start', minHeight: 100}]}>
            <TextInput
              style={[styles.input, {textAlignVertical: 'top'}]}
              value={body}
              onChangeText={setBody}
              placeholder="Notice body…"
              placeholderTextColor={colors.textSoft}
              multiline
              maxLength={2000}
            />
          </View>
          <Text style={styles.charCount}>{body.length}/2000</Text>

          <View style={styles.pinRow}>
            <Text style={styles.pinLabel}>Pin Notice</Text>
            <Switch
              value={pinned}
              onValueChange={setPinned}
              trackColor={{true: colors.primary, false: colors.border}}
              thumbColor={colors.white}
            />
          </View>

          <Pressable style={[styles.saveBtn, saving && {opacity: 0.6}]} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator size="small" color={colors.white} />
              : <Text style={styles.saveBtnText}>Save Changes</Text>
            }
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

// ── NoticeCard ───────────────────────────────────────────────────────────────
const NoticeCard = ({notice, index, onPin, onEdit, onDelete}) => {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[notice.category] || {color: colors.primary, icon: 'bell-outline'};

  return (
    <Animated.View>
      <Pressable
        onPress={() => setExpanded(e => !e)}
        style={[styles.noticeCard, notice.pinned && styles.noticePinned]}>
        {notice.pinned ? (
          <View style={styles.pinnedBanner}>
            <MaterialCommunityIcons name="pin" size={10} color={colors.white} />
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        ) : null}
        <View style={styles.noticeTop}>
          <View style={[styles.categoryBadge, {backgroundColor: `${meta.color}15`}]}>
            <MaterialCommunityIcons name={meta.icon} size={11} color={meta.color} />
            <Text style={[styles.categoryText, {color: meta.color}]}>{notice.category}</Text>
          </View>
          <Text style={styles.noticeDate}>{formatDate(notice.date)}</Text>
        </View>
        <Text style={styles.noticeTitle}>{notice.title}</Text>
        <Text style={styles.noticeBody} numberOfLines={expanded ? undefined : 2}>
          {notice.body}
        </Text>
        <View style={styles.noticeMeta}>
          <View style={styles.noticeAuthor}>
            <MaterialCommunityIcons name="account-tie-outline" size={12} color={colors.textMuted} />
            <Text style={styles.noticeAuthorText}>{notice.author}</Text>
          </View>
          <View style={styles.noticeActions}>
            {onPin ? (
              <Pressable onPress={() => onPin(notice)} hitSlop={6} style={styles.actionBtn}>
                <MaterialCommunityIcons
                  name={notice.pinned ? 'pin-off' : 'pin-outline'}
                  size={14}
                  color={notice.pinned ? colors.danger : colors.textMuted}
                />
              </Pressable>
            ) : null}
            {onEdit ? (
              <Pressable onPress={() => onEdit(notice)} hitSlop={6} style={styles.actionBtn}>
                <MaterialCommunityIcons name="pencil-outline" size={14} color={colors.info} />
              </Pressable>
            ) : null}
            {onDelete ? (
              <Pressable onPress={() => onDelete(notice)} hitSlop={6} style={styles.actionBtn}>
                <MaterialCommunityIcons name="delete-outline" size={14} color={colors.danger} />
              </Pressable>
            ) : null}
            <Pressable style={styles.expandBtn}>
              <MaterialCommunityIcons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colors.primary}
              />
              <Text style={styles.expandText}>{expanded ? 'Less' : 'More'}</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ── Screen ───────────────────────────────────────────────────────────────────
const NoticeBoardScreen = ({navigation}) => {
  const {user} = useSelector(state => state.auth);
  const branchId = user?.branchId;
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingNotice, setEditingNotice] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteConfirmNotice, setDeleteConfirmNotice] = useState(null);

  const queryKey = ['principalNotices', branchId, selectedCategory];

  const {data: notices = [], isLoading, isRefetching, refetch} = useQuery({
    queryKey,
    queryFn: () => noticesService.getNotices({branchId, category: selectedCategory}),
    enabled: !!branchId,
    staleTime: 30_000});

  // Refetch every time the screen comes into focus (e.g. after posting a notice)
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handlePin = async notice => {
    try {
      await noticesService.togglePin(notice.id, notice.pinned);
      refetch();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to toggle pin.');
    }
  };

  const handleEdit = notice => {
    setEditingNotice(notice);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async updates => {
    try {
      await noticesService.updateNotice(editingNotice.id, updates);
      setEditModalVisible(false);
      setEditingNotice(null);
      refetch();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to update notice.');
    }
  };

  const handleDelete = notice => {
    setDeleteConfirmNotice(notice);
  };

  const confirmDelete = async () => {
    try {
      await noticesService.deleteNotice(deleteConfirmNotice.id);
      refetch();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to delete notice.');
    } finally {
      setDeleteConfirmNotice(null);
    }
  };

  const pinnedNotices = notices.filter(n => n.pinned);
  const regularNotices = notices.filter(n => !n.pinned);

  return (
    <View style={styles.root}>
      <FlatList
        data={regularNotices}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            <Animated.View style={styles.header}>
              <View style={styles.headerDecor1} />
              <View style={styles.headerDecor2} />
              <View style={styles.headerRow}>
                <MaterialCommunityIcons name="bulletin-board" size={22} color={colors.white} />
                <View style={styles.headerCopy}>
                  <Text style={styles.headerTitle}>Notice Board</Text>
                  <Text style={styles.headerSub}>
                    {notices.length} notice{notices.length !== 1 ? 's' : ''} · Principal Edition
                  </Text>
                </View>
                {isLoading ? <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" /> : null}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
                {CATEGORIES.map(cat => (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}>
                    <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>

            {pinnedNotices.length > 0 ? (
              <View style={styles.pinnedSection}>
                <Text style={styles.sectionLabel}>{'  '}Pinned</Text>
                {pinnedNotices.map((notice, i) => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    index={i}
                    onPin={handlePin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </View>
            ) : null}

            {regularNotices.length > 0 ? (
              <Text style={styles.sectionLabel}>Recent Notices</Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <NoticeCard
            notice={item}
            index={pinnedNotices.length + index}
            onPin={handlePin}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="No notices yet"
              message="Tap the button below to post your first notice for parents and staff."
            />
          ) : null
        }
        ListFooterComponent={<View style={{height: spacing.xxxl + spacing.xl}} />}
      />

      <FloatingActionButton
        icon="plus"
        label="New Notice"
        onPress={() => navigation.navigate('PostNotice', {branchId})}
        extended
      />

      <EditNoticeModal
        visible={editModalVisible}
        notice={editingNotice}
        onSave={handleSaveEdit}
        onClose={() => {setEditModalVisible(false); setEditingNotice(null);}}
      />
      <ConfirmationModal
        visible={Boolean(deleteConfirmNotice)}
        title="Delete Notice?"
        message={`Delete "${deleteConfirmNotice?.title}"? This cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmNotice(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingBottom: spacing.xxl},

  header: {
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  headerDecor1: {backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 80, height: 140, position: 'absolute', right: -20, top: -40, width: 140},
  headerDecor2: {backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 60, bottom: -20, height: 90, left: -10, position: 'absolute', width: 90},
  headerRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg},
  headerCopy: {flex: 1},
  headerTitle: {color: colors.white, fontSize: 20, fontWeight: '800'},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 2},
  catScroll: {},
  catContent: {gap: spacing.sm},
  catChip: {backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs},
  catChipActive: {backgroundColor: 'rgba(255,255,255,0.9)'},
  catChipText: {color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700'},
  catChipTextActive: {color: colors.primary},

  sectionLabel: {color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.4, marginBottom: spacing.sm, textTransform: 'uppercase'},
  pinnedSection: {marginBottom: spacing.sm},

  noticeCard: {
    backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5,
    marginBottom: spacing.md, overflow: 'hidden', padding: spacing.lg, ...shadows.clay},
  noticePinned: {borderColor: `${colors.danger}50`, borderWidth: 1.5},
  pinnedBanner: {alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.danger, borderRadius: radius.sm, flexDirection: 'row', gap: 4, marginBottom: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: 3},
  pinnedText: {color: colors.white, fontSize: 9, fontWeight: '800', textTransform: 'uppercase'},
  noticeTop: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm},
  categoryBadge: {alignItems: 'center', borderRadius: radius.pill, flexDirection: 'row', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 3},
  categoryText: {fontSize: 10, fontWeight: '800', textTransform: 'uppercase'},
  noticeDate: {...typography.caption, color: colors.textMuted},
  noticeTitle: {...typography.bodyBold, color: colors.text, fontSize: 15, marginBottom: spacing.xs},
  noticeBody: {...typography.body, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.sm},
  noticeMeta: {alignItems: 'center', borderTopColor: colors.borderLight, borderTopWidth: 1, flexDirection: 'row', paddingTop: spacing.sm},
  noticeAuthor: {alignItems: 'center', flex: 1, flexDirection: 'row', gap: 4},
  noticeAuthorText: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},
  noticeActions: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  actionBtn: {padding: 2},
  expandBtn: {alignItems: 'center', flexDirection: 'row', gap: 2},
  expandText: {color: colors.primary, fontSize: 11, fontWeight: '700'},

  // Edit Modal
  overlay: {backgroundColor: 'rgba(14,165,233,0.08)', flex: 1, justifyContent: 'flex-end'},
  editModal: {
    backgroundColor: colors.surface, borderTopLeftRadius: radius.hero, borderTopRightRadius: radius.hero,
    maxHeight: '90%', padding: spacing.xl, ...shadows.clayModal},
  editHeader: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg},
  editTitle: {...typography.subtitle, color: colors.text},
  fieldLabel: {...typography.captionBold, color: colors.textMuted, marginBottom: spacing.xs, marginTop: spacing.md, textTransform: 'uppercase'},
  catRow: {gap: spacing.sm, marginBottom: spacing.xs},
  catChipEdit: {borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1.5, paddingHorizontal: spacing.md, paddingVertical: spacing.xs},
  catChipEditActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  catChipEditText: {color: colors.textMuted, fontSize: 11, fontWeight: '700'},
  catChipEditTextActive: {color: colors.white},
  inputWrap: {alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: 1.5, flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm},
  input: {color: colors.text, flex: 1, fontSize: 14, paddingVertical: 4},
  charCount: {...typography.caption, color: colors.textSoft, marginTop: 2, textAlign: 'right'},
  pinRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md},
  pinLabel: {...typography.bodyBold, color: colors.text},
  saveBtn: {alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.md, marginTop: spacing.xl, paddingVertical: spacing.md},
  saveBtnText: {color: colors.white, fontSize: 15, fontWeight: '800'}});

export default NoticeBoardScreen;
