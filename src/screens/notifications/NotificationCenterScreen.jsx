import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import notificationService from '../../services/notifications/notificationService';
import VoiceAnnouncementButton from '../../components/common/VoiceAnnouncementButton';
import {TELUGU} from '../../services/tts/teluguTemplates';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const ICON_MAP = {
  'Attendance Alert': {icon: 'calendar-remove', color: colors.danger, bg: colors.dangerSoft},
  'Fee Reminder': {icon: 'cash-multiple', color: colors.warning, bg: colors.warningSoft},
  'Notice': {icon: 'bulletin-board', color: colors.info, bg: colors.infoSoft},
  default: {icon: 'bell-outline', color: colors.primary, bg: colors.primaryFaint}};

const getIconProps = title => {
  for (const key of Object.keys(ICON_MAP)) {
    if (key !== 'default' && title?.toLowerCase().includes(key.toLowerCase())) {
      return ICON_MAP[key];
    }
  }
  return ICON_MAP.default;
};

const formatTime = isoString => {
  if (!isoString) {return '';}
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) {return 'Just now';}
    if (diffMins < 60) {return `${diffMins}m ago`;}
    if (diffHours < 24) {return `${diffHours}h ago`;}
    if (diffDays < 7) {return `${diffDays}d ago`;}
    return date.toLocaleDateString('en-IN', {day: 'numeric', month: 'short'});
  } catch {
    return '';
  }
};

// A user can delete a notification if they created it or are MAIN_ADMIN.
const canDeleteNotification = (notification, currentUser) => {
  if (!currentUser) {return false;}
  if (String(currentUser.role || '').toUpperCase() === 'MAIN_ADMIN') {return true;}
  if (notification.createdById && notification.createdById === currentUser.id) {return true;}
  return false;
};

// ─── Notification Card ────────────────────────────────────────────────────────
const NotificationItem = ({item, onPress, onDeleteRequest, showDelete, index}) => {
  const iconProps = getIconProps(item.title);
  const teluguText = TELUGU.notification(item.title, item.message);
  return (
    <Animated.View>
      <Pressable
        onPress={() => onPress(item)}
        style={({pressed}) => [
          styles.notifCard,
          !item.isRead && styles.notifCardUnread,
          pressed && styles.notifCardPressed,
        ]}>
        {/* Unread indicator — only shown when delete button is absent to avoid corner crowding */}
        {!item.isRead && !showDelete && <View style={styles.unreadDot} />}

        {/* Icon */}
        <View style={[styles.iconWrap, {backgroundColor: iconProps.bg}]}>
          <MaterialCommunityIcons name={iconProps.icon} size={22} color={iconProps.color} />
        </View>

        {/* Content */}
        <View style={styles.notifContent}>
          <View style={styles.notifTopRow}>
            <View style={styles.notifTitleRow}>
              {!item.isRead && <View style={styles.unreadDotInline} />}
              <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            <View style={styles.notifActions}>
              <Text style={styles.notifTime}>{formatTime(item.createdAt)}</Text>
              <VoiceAnnouncementButton text={teluguText} size={16} />
              {showDelete && (
                <Pressable
                  onPress={() => onDeleteRequest(item)}
                  hitSlop={10}
                  style={({pressed}) => [styles.deleteBtn, pressed && {opacity: 0.6}]}>
                  <MaterialCommunityIcons name="trash-can-outline" size={15} color={colors.danger} />
                </Pressable>
              )}
            </View>
          </View>
          <Text style={styles.notifMessage} numberOfLines={3}>
            {item.message}
          </Text>
          {item.branch?.name ? (
            <View style={styles.branchChip}>
              <MaterialCommunityIcons name="office-building" size={10} color={colors.textSoft} />
              <Text style={styles.branchChipText}>{item.branch.name}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
const DeleteConfirmModal = ({notification, onConfirm, onCancel, deleting}) => (
  <Modal
    visible={!!notification}
    transparent
    animationType="fade"
    onRequestClose={onCancel}>
    <Pressable style={styles.modalOverlay} onPress={onCancel}>
      <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
        <View style={styles.modalIconRing}>
          <MaterialCommunityIcons name="trash-can-outline" size={28} color={colors.danger} />
        </View>
        <Text style={styles.modalTitle}>Delete Notification</Text>
        <Text style={styles.modalMessage}>
          Are you sure you want to delete{'\n'}
          <Text style={styles.modalNotifTitle}>"{notification?.title}"</Text>?
          {'\n\n'}This will remove the notification from all recipients and update all notification counts.
        </Text>
        <View style={styles.modalBtns}>
          <Pressable
            onPress={onCancel}
            disabled={deleting}
            style={({pressed}) => [styles.cancelBtn, pressed && {opacity: 0.75}]}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            disabled={deleting}
            style={({pressed}) => [styles.deleteConfirmBtn, pressed && !deleting && {opacity: 0.82}]}>
            {deleting
              ? <ActivityIndicator size="small" color={colors.white} />
              : <MaterialCommunityIcons name="trash-can-outline" size={15} color={colors.white} />}
            <Text style={styles.deleteConfirmBtnText}>{deleting ? 'Deleting…' : 'Delete'}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyNotifications = ({activeTab}) => (
  <Animated.View style={styles.emptyWrap}>
    <View style={styles.emptyIconRing}>
      <MaterialCommunityIcons name="bell-off-outline" size={44} color={colors.textSoft} />
    </View>
    <Text style={styles.emptyTitle}>
      {activeTab === 'unread' ? 'All read!' : 'All caught up!'}
    </Text>
    <Text style={styles.emptySub}>
      {activeTab === 'unread'
        ? 'No unread notifications. You\'re all caught up.'
        : 'You have no notifications yet. Attendance alerts and school updates will appear here.'}
    </Text>
  </Animated.View>
);

// ─── Tab Bar ─────────────────────────────────────────────────────────────────
const TabBar = ({activeTab, onTabChange, totalCount, unreadCount}) => (
  <View style={styles.tabBar}>
    <Pressable
      onPress={() => onTabChange('all')}
      style={[styles.tab, activeTab === 'all' && styles.tabActive]}>
      <MaterialCommunityIcons
        name="bell-outline"
        size={14}
        color={activeTab === 'all' ? colors.primary : colors.textMuted}
      />
      <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
        All
      </Text>
      <View style={[styles.tabBadge, activeTab === 'all' && styles.tabBadgeActive]}>
        <Text style={[styles.tabBadgeText, activeTab === 'all' && styles.tabBadgeTextActive]}>
          {totalCount}
        </Text>
      </View>
    </Pressable>

    <Pressable
      onPress={() => onTabChange('unread')}
      style={[styles.tab, activeTab === 'unread' && styles.tabActive]}>
      <MaterialCommunityIcons
        name="bell-ring-outline"
        size={14}
        color={activeTab === 'unread' ? colors.danger : colors.textMuted}
      />
      <Text style={[styles.tabText, activeTab === 'unread' && styles.tabTextActive, activeTab === 'unread' && {color: colors.danger}]}>
        Unread
      </Text>
      {unreadCount > 0 ? (
        <View style={[styles.tabBadge, styles.tabBadgeUnread, activeTab === 'unread' && styles.tabBadgeUnreadActive]}>
          <Text style={[styles.tabBadgeText, styles.tabBadgeTextUnread]}>
            {unreadCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────
const NotificationCenterScreen = () => {
  const user = useSelector(state => state.auth.user);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadNotifications = useCallback(async (isRefresh = false) => {
    if (!user?.id) {return;}
    if (isRefresh) {setRefreshing(true);}
    else {setLoading(true);}
    try {
      const [data, count] = await Promise.all([
        notificationService.getNotifications({userId: user.id}),
        notificationService.getUnreadCount(user.id),
      ]);
      setNotifications(data);
      setUnreadCount(count);
    } catch (err) {
      console.log('[NotificationCenter] Load failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Refetch when app comes to foreground
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        loadNotifications();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [loadNotifications]);

  const handleMarkRead = useCallback(async item => {
    if (item.isRead) {return;}
    setNotifications(prev =>
      prev.map(n => (n.id === item.id ? {...n, isRead: true} : n)),
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    await notificationService.markRead(item.id);
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    if (!user?.id || unreadCount === 0) {return;}
    setNotifications(prev => prev.map(n => ({...n, isRead: true})));
    setUnreadCount(0);
    await notificationService.markAllRead(user.id);
  }, [user?.id, unreadCount]);

  // ── Delete handlers ─────────────────────────────────────────────────────────
  const handleDeleteRequest = useCallback(item => {
    setDeleteTarget(item);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    if (!deleting) {setDeleteTarget(null);}
  }, [deleting]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget || !user) {return;}
    setDeleting(true);
    // Optimistic: remove from local state immediately so UI is instant
    const wasUnread = !deleteTarget.isRead;
    setNotifications(prev => prev.filter(n => n.id !== deleteTarget.id));
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    try {
      await notificationService.deleteNotification({
        id: deleteTarget.id,
        title: deleteTarget.title,
        branchId: user.branchId || null,
        deletedById: user.id,
        deletedByName: user.fullName,
        deletedByRole: user.role});
    } catch (err) {
      console.log('[NotificationCenter] Delete failed:', err);
      // On failure, reload to restore accurate state
      loadNotifications();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, user, loadNotifications]);

  // Derive displayed list from active tab
  const displayedNotifications =
    activeTab === 'unread'
      ? notifications.filter(n => !n.isRead)
      : notifications;

  const header = useMemo(() => (
    <Animated.View style={styles.listHeader}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSub}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <Pressable onPress={handleMarkAllRead} style={styles.markAllBtn} hitSlop={8}>
            <MaterialCommunityIcons name="check-all" size={16} color={colors.primary} />
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      {/* Filter Tabs */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalCount={notifications.length}
        unreadCount={unreadCount}
      />
    </Animated.View>
  ), [activeTab, unreadCount, notifications.length]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <MaterialCommunityIcons name="bell-outline" size={32} color={colors.border} />
        <Text style={styles.loadingText}>Loading notifications…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={displayedNotifications}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => {
          const showDelete = canDeleteNotification(item, user);
          return (
            <NotificationItem
              item={item}
              onPress={handleMarkRead}
              onDeleteRequest={handleDeleteRequest}
              showDelete={showDelete}
              index={index}
            />
          );
        }}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyNotifications activeTab={activeTab} />}
        contentContainerStyle={[
          styles.list,
          displayedNotifications.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadNotifications(true)}
            tintColor={colors.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <DeleteConfirmModal
        notification={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        deleting={deleting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background},
  list: {
    paddingBottom: spacing.xxl},
  listEmpty: {
    flexGrow: 1},

  // ── List header ────────────────────────────────────────────────────────────
  listHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md},
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md},
  headerTitle: {
    ...typography.title,
    color: colors.text},
  headerSub: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2},
  markAllBtn: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 7},
  markAllText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700'},

  // ── Tab bar ────────────────────────────────────────────────────────────────
  tabBar: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    overflow: 'hidden',
    ...shadows.clay},
  tab: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 11},
  tabActive: {
    backgroundColor: colors.primaryFaint,
    borderBottomColor: colors.primary,
    borderBottomWidth: 2.5},
  tabText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700'},
  tabTextActive: {
    color: colors.primary,
    fontWeight: '800'},
  tabBadge: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 1},
  tabBadgeActive: {
    backgroundColor: colors.primarySoft},
  tabBadgeText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800'},
  tabBadgeTextActive: {
    color: colors.primary},
  tabBadgeUnread: {
    backgroundColor: colors.dangerSoft},
  tabBadgeUnreadActive: {
    backgroundColor: colors.dangerSoft},
  tabBadgeTextUnread: {
    color: colors.danger},

  // ── Notification card ─────────────────────────────────────────────────────
  notifCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.clay,
    position: 'relative'},
  notifCardUnread: {
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primarySoft},
  notifCardPressed: {
    opacity: 0.85},
  unreadDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 8,
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
    width: 8},
  unreadDotInline: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 7,
    width: 7,
    flexShrink: 0},
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 44,
    justifyContent: 'center',
    width: 44,
    flexShrink: 0},
  notifContent: {
    flex: 1,
    gap: 4},
  notifTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm},
  notifTitleRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 5},
  notifActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: spacing.sm},
  notifTitle: {
    ...typography.captionBold,
    color: colors.textMuted,
    flex: 1,
    fontSize: 13},
  notifTitleUnread: {
    color: colors.text,
    fontWeight: '800'},
  notifTime: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '500'},
  deleteBtn: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    height: 26,
    justifyContent: 'center',
    width: 26},
  notifMessage: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18},
  branchChip: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 2},
  branchChipText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '500'},
  separator: {
    height: spacing.sm},

  // ── Loading ────────────────────────────────────────────────────────────────
  loadingWrap: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center'},
  loadingText: {
    ...typography.caption,
    color: colors.textMuted},

  // ── Empty ─────────────────────────────────────────────────────────────────
  emptyWrap: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl},
  emptyIconRing: {
    alignItems: 'center',
    backgroundColor: colors.neutralSoft,
    borderColor: colors.borderLight,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 96,
    justifyContent: 'center',
    width: 96},
  emptyTitle: {
    ...typography.heading,
    color: colors.text},
  emptySub: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 20,
    textAlign: 'center'},

  // ── Delete confirm modal ───────────────────────────────────────────────────
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.48)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl},
  modalCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.hero,
    borderWidth: 1.5,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    width: '100%',
    ...shadows.clayDeep},
  modalIconRing: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: `${colors.danger}30`,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 64,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 64},
  modalTitle: {
    ...typography.title,
    color: colors.text,
    fontSize: 18,
    marginBottom: spacing.md,
    textAlign: 'center'},
  modalMessage: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.xl,
    textAlign: 'center'},
  modalNotifTitle: {
    color: colors.text,
    fontWeight: '700'},
  modalBtns: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%'},
  cancelBtn: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 13},
  cancelBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700'},
  deleteConfirmBtn: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radius.card,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 13,
    ...shadows.fab},
  deleteConfirmBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700'}});

export default NotificationCenterScreen;
