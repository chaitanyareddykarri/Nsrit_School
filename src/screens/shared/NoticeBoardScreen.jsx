/**
 * Shared read-only notice board — used by Teacher, Coordinator, and any role
 * that should see notices but not edit them.
 *
 * Props via route.params:
 *   edition  — string label for the header sub-text (e.g. 'Teacher Edition')
 *   canPost  — boolean, if true shows a FAB to navigate('PostNotice')
 */
import React, {useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {EmptyState, FloatingActionButton} from '../../components';
import noticesService from '../../services/notices/noticesService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const CATEGORIES = ['All', 'Academic', 'Fee', 'Holiday', 'Event', 'Urgent'];

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

const NoticeCard = ({notice, index}) => {
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
          <View style={styles.expandBtn}>
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.primary}
            />
            <Text style={styles.expandText}>{expanded ? 'Less' : 'More'}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const SharedNoticeBoardScreen = ({navigation, route}) => {
  const {edition = 'Staff Edition', canPost = false} = route?.params || {};
  const {user} = useSelector(state => state.auth);
  const branchId = user?.branchId;
  const [selectedCategory, setSelectedCategory] = useState('All');

  const {data: notices = [], isLoading, isRefetching, refetch} = useQuery({
    queryKey: ['sharedNotices', branchId, selectedCategory],
    queryFn: () => noticesService.getNotices({branchId, category: selectedCategory}),
    enabled: !!branchId,
    staleTime: 30_000});

  // Refetch when screen comes back into focus (e.g. after posting a notice)
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

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
                    {notices.length} notice{notices.length !== 1 ? 's' : ''} · {edition}
                  </Text>
                </View>
                {isLoading ? <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" /> : null}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catContent}>
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
                <Text style={styles.sectionLabel}>Pinned</Text>
                {pinnedNotices.map((notice, i) => (
                  <NoticeCard key={notice.id} notice={notice} index={i} />
                ))}
              </View>
            ) : null}

            {regularNotices.length > 0 ? (
              <Text style={styles.sectionLabel}>Recent Notices</Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <NoticeCard notice={item} index={pinnedNotices.length + index} />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="No notices"
              message="School notices and announcements will appear here automatically."
            />
          ) : null
        }
        ListFooterComponent={<View style={{height: canPost ? spacing.xxxl + spacing.xl : spacing.xxxl}} />}
      />

      {canPost ? (
        <FloatingActionButton
          icon="plus"
          label="New Notice"
          onPress={() => navigation.navigate('PostNotice')}
          extended
        />
      ) : null}
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
  expandBtn: {alignItems: 'center', flexDirection: 'row', gap: 2},
  expandText: {color: colors.primary, fontSize: 11, fontWeight: '700'}});

export default SharedNoticeBoardScreen;
