import React, {useCallback, useState} from 'react';
import {FlatList, Pressable, RefreshControl, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {EXAM_STATUS, EXAM_TYPE_LABELS} from '../../config/constants';
import EmptyState from '../../components/common/EmptyState';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import examService, {canManageExams} from '../../services/marks/examService';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import UserMenuDrawer from '../../components/common/UserMenuDrawer';

const STATUS_COLOR = {
  [EXAM_STATUS.DRAFT]: colors.warning,
  [EXAM_STATUS.PUBLISHED]: colors.success,
  [EXAM_STATUS.ARCHIVED]: colors.textSoft};

const ExamCard = ({exam, onPress, delay}) => {
  const color = STATUS_COLOR[exam.status] || colors.textSoft;
  const sectionCount = exam.examSections?.length || 0;
  const publishedCount = exam.examSections?.filter(s => s.isPublished).length || 0;
  return (
    <Animated.View>
      <Pressable onPress={onPress} style={({pressed}) => [styles.card, pressed && {opacity: 0.88}]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <Text style={styles.examName} numberOfLines={1}>{exam.name}</Text>
            <Text style={styles.examType}>{EXAM_TYPE_LABELS[exam.examType] || exam.examType}</Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: `${color}18`}]}>
            <Text style={[styles.statusText, {color}]}>{exam.status}</Text>
          </View>
        </View>
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="format-list-bulleted" size={13} color={colors.textSoft} />
            <Text style={styles.metaText}>{sectionCount} section{sectionCount !== 1 ? 's' : ''}</Text>
          </View>
          {sectionCount > 0 && (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="check-circle-outline" size={13} color={colors.success} />
              <Text style={styles.metaText}>{publishedCount} published</Text>
            </View>
          )}
          {exam.startDate && (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="calendar-outline" size={13} color={colors.textSoft} />
              <Text style={styles.metaText}>{exam.startDate}</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const ExamListScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const user = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const branchId = user?.branchId;
  const academicYearId = activeAcademicYear?.id;
  const role = user?.role;

  const {data: exams = [], isLoading, isError, refetch} = useQuery({
    queryKey: ['exams', branchId, academicYearId],
    queryFn: () => examService.getExams(branchId, academicYearId, true),
    enabled: Boolean(branchId && academicYearId)});

  const filtered = filter === 'ALL' ? exams : exams.filter(e => e.status === filter);

  const renderItem = useCallback(
    ({item, index}) => (
      <ExamCard
        exam={item}
        delay={index * 40}
        onPress={() => navigation.navigate('ExamDetails', {examId: item.id})}
      />
    ),
    [navigation],
  );

  return (
    <>
      <View style={[styles.root, {paddingTop: insets.top}]}>
        {/* Header */}
        <Animated.View style={styles.header}>
          <Pressable onPress={() => setMenuOpen(true)} style={styles.menuBtn}>
            <MaterialCommunityIcons name="menu" size={22} color={colors.white} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Exams & Marks</Text>
            <Text style={styles.headerSub}>{activeAcademicYear?.name || 'Academic Year'}</Text>
          </View>
          {canManageExams(role) && (
            <Pressable
              onPress={() => navigation.navigate('CreateExam')}
              style={styles.addBtn}>
              <MaterialCommunityIcons name="plus" size={22} color={colors.white} />
            </Pressable>
          )}
          {/* Blobs */}
          <View style={styles.blob1} pointerEvents="none" />
          <View style={styles.blob2} pointerEvents="none" />
        </Animated.View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {['ALL', EXAM_STATUS.DRAFT, EXAM_STATUS.PUBLISHED, EXAM_STATUS.ARCHIVED].map(f => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          ListEmptyComponent={
            !isLoading && (
              <EmptyState
                icon={isError ? 'alert-circle-outline' : 'clipboard-text-outline'}
                title={isError ? 'Failed to load exams' : 'No exams yet'}
                message={isError ? 'Pull down to retry' : canManageExams(role) ? 'Tap + to create your first exam' : 'No exams have been created yet'}
                actionLabel={isError ? 'Retry' : undefined}
                onAction={isError ? refetch : undefined}
              />
            )
          }
        />
      </View>
      <UserMenuDrawer visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  header: {
    ...shadows.clayDeep,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.hero,
    borderBottomRightRadius: radius.hero,
    overflow: 'hidden',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl},
  blob1: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 100,
    height: 120,
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120},
  blob2: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 80,
    bottom: -20,
    height: 90,
    left: -20,
    position: 'absolute',
    width: 90},
  menuBtn: {padding: 4},
  addBtn: {padding: 4},
  headerCenter: {flex: 1, alignItems: 'center'},
  headerTitle: {...typography.subtitle, color: colors.white},
  headerSub: {...typography.caption, color: 'rgba(255,255,255,0.75)', marginTop: 2},
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md},
  filterChip: {
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: 5},
  filterChipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  filterText: {...typography.caption, color: colors.textMuted, fontWeight: '700'},
  filterTextActive: {color: colors.white},
  list: {paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm},
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    padding: spacing.lg},
  cardHeader: {flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm},
  cardLeft: {flex: 1},
  examName: {...typography.heading, color: colors.text, fontSize: 15},
  examType: {...typography.caption, color: colors.textSoft, marginTop: 2},
  statusBadge: {borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3},
  statusText: {...typography.captionBold, fontSize: 10},
  cardMeta: {flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, flexWrap: 'wrap'},
  metaItem: {flexDirection: 'row', alignItems: 'center', gap: 4},
  metaText: {...typography.caption, color: colors.textSoft, fontSize: 11}});

export default ExamListScreen;
