import React, {useState} from 'react';
import {FlatList, Pressable, RefreshControl, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {EXAM_TYPE_LABELS} from '../../config/constants';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import marksService, {computeGrade} from '../../services/marks/marksService';
import PerformanceBar from '../../components/marks/PerformanceBar';
import VoiceAnnouncementButton from '../../components/common/VoiceAnnouncementButton';
import {TELUGU} from '../../services/tts/teluguTemplates';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import UserMenuDrawer from '../../components/common/UserMenuDrawer';

const ResultCard = ({examSection, studentId, studentName, onPress, delay}) => {
  const exam = examSection?.exam;
  const teluguText = TELUGU.resultsPublished(studentName || '', exam?.name || '');
  return (
    <Animated.View>
      <Pressable onPress={onPress} style={({pressed}) => [styles.card, pressed && {opacity: 0.88}]}>
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <Text style={styles.examName} numberOfLines={1}>{exam?.name || '—'}</Text>
            <Text style={styles.examType}>{EXAM_TYPE_LABELS[exam?.examType] || exam?.examType || ''}</Text>
          </View>
          <View style={styles.cardRight}>
            <VoiceAnnouncementButton text={teluguText} size={16} />
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSoft} />
          </View>
        </View>
        {exam?.startDate ? (
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="calendar-outline" size={12} color={colors.textSoft} />
            <Text style={styles.metaText}>{exam.startDate}</Text>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
};

const ResultsScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const user = useSelector(state => state.auth.user);
  const activeAcademicYear = useSelector(selectActiveAcademicYear);
  const [menuOpen, setMenuOpen] = useState(false);

  // For a parent, the linked student is in user.students (first one for now)
  // For multi-child support the parent picks the student.
  const student = user?.student || user?.students?.[0];
  const studentId = student?.id;
  const academicYearId = activeAcademicYear?.id;

  const {data: results = [], isLoading, isError, refetch} = useQuery({
    queryKey: ['studentResults', studentId, academicYearId],
    queryFn: () => marksService.getStudentResults(studentId, academicYearId),
    enabled: Boolean(studentId)});

  const renderItem = ({item, index}) => (
    <ResultCard
      examSection={item}
      studentId={studentId}
      studentName={student?.fullName || ''}
      delay={index * 40}
      onPress={() =>
        navigation.navigate('ResultDetails', {
          examId: item.examId,
          studentId,
          examSection: item,
          examName: item.exam?.name})
      }
    />
  );

  return (
    <>
      <View style={[styles.root, {paddingTop: insets.top}]}>
        <Animated.View style={styles.header}>
          <Pressable onPress={() => setMenuOpen(true)} style={styles.menuBtn}>
            <MaterialCommunityIcons name="menu" size={22} color={colors.white} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>My Results</Text>
            <Text style={styles.headerSub}>{activeAcademicYear?.name || ''}</Text>
          </View>
          <View style={{width: 36}} />
          <View style={styles.blob1} />
          <View style={styles.blob2} />
        </Animated.View>

        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          ListEmptyComponent={
            !isLoading && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name={isError ? 'alert-circle-outline' : 'file-chart-outline'}
                  size={44}
                  color={isError ? colors.danger : colors.textSoft}
                />
                <Text style={styles.emptyTitle}>
                  {isError ? 'Failed to load results' : 'No published results yet'}
                </Text>
                <Text style={styles.emptyDesc}>
                  {isError ? 'Pull down to retry' : 'Results will appear here once published by your school'}
                </Text>
              </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg},
  blob1: {backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 120, position: 'absolute', right: -30, top: -30, width: 120},
  blob2: {backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 80, bottom: -20, height: 90, left: -20, position: 'absolute', width: 90},
  menuBtn: {padding: 4},
  headerCenter: {flex: 1, alignItems: 'center'},
  headerTitle: {...typography.subtitle, color: colors.white},
  headerSub: {...typography.caption, color: 'rgba(255,255,255,0.75)', marginTop: 2},
  list: {padding: spacing.lg, gap: spacing.sm, paddingBottom: 48},
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    padding: spacing.lg},
  cardTop: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  cardLeft: {flex: 1},
  cardRight: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  examName: {...typography.heading, color: colors.text, fontSize: 15},
  examType: {...typography.caption, color: colors.textSoft, marginTop: 2},
  metaItem: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs},
  metaText: {...typography.caption, color: colors.textSoft, fontSize: 11},
  emptyState: {alignItems: 'center', gap: spacing.sm, paddingVertical: 60},
  emptyTitle: {...typography.heading, color: colors.textMuted, textAlign: 'center'},
  emptyDesc: {...typography.caption, color: colors.textSoft, textAlign: 'center', paddingHorizontal: spacing.xl}});

export default ResultsScreen;
