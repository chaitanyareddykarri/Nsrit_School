import React, {useState} from 'react';
import {FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {EXAM_TYPE_LABELS} from '../../config/constants';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import marksService, {computeGrade} from '../../services/marks/marksService';
import academicYearService from '../../services/academicYear/academicYearService';
import PerformanceBar from '../../components/marks/PerformanceBar';
import VoiceAnnouncementButton from '../../components/common/VoiceAnnouncementButton';
import {TELUGU} from '../../services/tts/teluguTemplates';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import UserMenuDrawer from '../../components/common/UserMenuDrawer';

const ResultCard = ({examSection, studentId, studentName, onPress}) => {
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

  const student = user?.student || user?.students?.[0];
  const studentId = student?.id;
  const branchId = user?.branchId;

  // Selected year — defaults to active year, allows switching to previous years
  const [selectedYearId, setSelectedYearId] = useState(null);
  const effectiveYearId = selectedYearId || activeAcademicYear?.id;

  // Fetch all academic years for the year switcher
  const yearsQuery = useQuery({
    queryKey: ['academicYears', branchId],
    queryFn: () => academicYearService.getAcademicYears({branchId}),
    enabled: Boolean(branchId),
  });
  const allYears = (yearsQuery.data || []).sort((a, b) => b.startYear - a.startYear);

  // Fetch results for the selected year
  const {data: results = [], isLoading, isError, refetch} = useQuery({
    queryKey: ['studentResults', studentId, effectiveYearId],
    queryFn: () => marksService.getStudentResults(studentId, effectiveYearId),
    enabled: Boolean(studentId && effectiveYearId),
  });

  const selectedYear = allYears.find(y => y.id === effectiveYearId) || activeAcademicYear;

  const renderItem = ({item, index}) => (
    <ResultCard
      examSection={item}
      studentId={studentId}
      studentName={student?.fullName || ''}
      onPress={() =>
        navigation.navigate('ResultDetails', {
          examId: item.exam?.id,
          studentId,
          examSection: item,
          examName: item.exam?.name,
        })
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
            <Text style={styles.headerSub}>{selectedYear?.name || ''}</Text>
          </View>
          <View style={{width: 36}} />
          <View style={styles.blob1} pointerEvents="none" />
          <View style={styles.blob2} pointerEvents="none" />
        </Animated.View>

        {/* Year switcher — shown only if more than one year exists */}
        {allYears.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearRow}>
            {allYears.map(year => {
              const active = year.id === effectiveYearId;
              return (
                <Pressable
                  key={year.id}
                  onPress={() => setSelectedYearId(year.id)}
                  style={[styles.yearChip, active && styles.yearChipActive]}>
                  <Text style={[styles.yearChipText, active && styles.yearChipTextActive]}>
                    {year.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <FlatList
          data={results}
          keyExtractor={item => item.examSectionId || item.id}
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
                  {isError
                    ? 'Pull down to retry'
                    : `Results for ${selectedYear?.name || 'this year'} will appear here once published by your school`}
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

  // Year switcher
  yearRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  yearChip: {
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  yearChipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  yearChipText: {...typography.caption, color: colors.textMuted, fontWeight: '700'},
  yearChipTextActive: {color: colors.white},

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
  emptyDesc: {...typography.caption, color: colors.textSoft, textAlign: 'center', paddingHorizontal: spacing.xl},
});

export default ResultsScreen;
