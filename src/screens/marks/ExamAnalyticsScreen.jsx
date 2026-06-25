import React, {useState} from 'react';
import {ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {selectActiveAcademicYear} from '../../store/slices/authSlice';
import marksService from '../../services/marks/marksService';
import PerformanceBar from '../../components/marks/PerformanceBar';
import GradeChip from '../../components/marks/GradeChip';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const StatCard = ({label, value, color, icon, delay}) => (
  <Animated.View style={styles.statCard}>
    <View style={[styles.statIcon, {backgroundColor: `${color}18`}]}>
      <MaterialCommunityIcons name={icon} size={18} color={color} />
    </View>
    <Text style={[styles.statValue, {color}]}>{value ?? '—'}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Animated.View>
);

const ExamAnalyticsScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {examId, exam} = route.params || {};
  const user = useSelector(state => state.auth.user);

  const [selectedSection, setSelectedSection] = useState(null);

  const {data: analytics, isLoading, isError, refetch} = useQuery({
    queryKey: ['analytics', examId, selectedSection],
    queryFn: () => marksService.getAnalytics(examId, selectedSection || undefined),
    enabled: Boolean(examId)});

  if (isLoading) {
    return (
      <View style={styles.centred}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const a = analytics || {};
  const passRate = a.totalAppeared > 0 ? ((a.totalPassed / a.totalAppeared) * 100).toFixed(1) : 0;
  const avgPct = a.averagePercentage?.toFixed(1) || 0;

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.topTitle} numberOfLines={1}>{exam?.name || 'Analytics'}</Text>
          <Text style={styles.topSub}>Result Analytics</Text>
        </View>
        <View style={{width: 36}} />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 32}]}>

        {isError ? (
          <View style={styles.centredInner}>
            <MaterialCommunityIcons name="alert-circle-outline" size={36} color={colors.danger} />
            <Text style={styles.errorText}>Failed to load analytics</Text>
            <Pressable onPress={refetch} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Overview stat cards */}
            <Animated.View style={styles.overviewRow}>
              <StatCard label="Total Students" value={a.totalStudents} color={colors.primary} icon="account-group-outline" delay={0} />
              <StatCard label="Appeared" value={a.totalAppeared} color={colors.info} icon="pencil-outline" delay={60} />
              <StatCard label="Passed" value={a.totalPassed} color={colors.success} icon="check-circle-outline" delay={120} />
              <StatCard label="Failed" value={a.totalFailed} color={colors.danger} icon="close-circle-outline" delay={180} />
            </Animated.View>

            {/* Pass rate + Average */}
            <Animated.View style={styles.card}>
              <Text style={styles.cardTitle}>Pass Rate</Text>
              <PerformanceBar percentage={parseFloat(passRate)} label={`${passRate}% passed`} />
              <View style={styles.cardDivider} />
              <Text style={styles.cardTitle}>Class Average</Text>
              <PerformanceBar percentage={parseFloat(avgPct)} label={`${avgPct}% average`} />
            </Animated.View>

            {/* Per-subject breakdown */}
            {(a.subjectStats || []).length > 0 && (
              <Animated.View style={styles.card}>
                <Text style={styles.cardTitle}>Subject Performance</Text>
                {a.subjectStats.map((subj, i) => (
                  <View key={subj.subjectName} style={[styles.subjRow, i < a.subjectStats.length - 1 && styles.subjBorder]}>
                    <Text style={styles.subjName} numberOfLines={1}>{subj.subjectName}</Text>
                    <View style={styles.subjRight}>
                      <View style={styles.subjMiniStats}>
                        <Text style={styles.subjStat}>
                          Avg: <Text style={styles.subjStatVal}>{subj.average?.toFixed(1)}</Text>
                        </Text>
                        <Text style={styles.subjStat}>
                          High: <Text style={[styles.subjStatVal, {color: colors.success}]}>{subj.highest}</Text>
                        </Text>
                        <Text style={styles.subjStat}>
                          Low: <Text style={[styles.subjStatVal, {color: colors.danger}]}>{subj.lowest}</Text>
                        </Text>
                      </View>
                      <PerformanceBar
                        percentage={subj.maxMarks > 0 ? (subj.average / subj.maxMarks) * 100 : 0}
                      />
                    </View>
                  </View>
                ))}
              </Animated.View>
            )}

            {/* Top 10 */}
            {(a.topStudents || []).length > 0 && (
              <Animated.View style={styles.card}>
                <Text style={styles.cardTitle}>Top Performers</Text>
                {a.topStudents.map((stu, i) => (
                  <Animated.View
                    key={stu.studentId}
                    style={styles.rankRow}>
                    <View style={[styles.rankBadge, i < 3 && {backgroundColor: ['#FFD700', '#C0C0C0', '#CD7F32'][i] + '22'}]}>
                      <Text style={[styles.rankNum, i < 3 && {color: ['#B8860B', '#808080', '#8B4513'][i]}]}>
                        #{stu.rank}
                      </Text>
                    </View>
                    <Text style={styles.rankName} numberOfLines={1}>{stu.fullName}</Text>
                    <Text style={styles.rankMarks}>
                      {stu.totalObtained}/{stu.totalMax}
                    </Text>
                    <GradeChip grade={stu.grade} />
                  </Animated.View>
                ))}
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  centred: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  centredInner: {alignItems: 'center', gap: spacing.md, padding: spacing.xl},
  topBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md},
  backBtn: {padding: 4},
  headerCenter: {flex: 1, alignItems: 'center'},
  topTitle: {...typography.heading, color: colors.text, fontSize: 15},
  topSub: {...typography.caption, color: colors.textSoft, marginTop: 2},
  content: {padding: spacing.lg, gap: spacing.md},
  overviewRow: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  statCard: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flex: 1,
    gap: 4,
    minWidth: '22%',
    padding: spacing.md},
  statIcon: {alignItems: 'center', borderRadius: radius.sm, height: 32, justifyContent: 'center', width: 32},
  statValue: {...typography.heading, fontSize: 20, fontWeight: '900'},
  statLabel: {...typography.caption, color: colors.textSoft, fontSize: 10, textAlign: 'center'},
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    gap: spacing.sm,
    padding: spacing.lg},
  cardTitle: {...typography.captionBold, color: colors.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8},
  cardDivider: {height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.xs},
  subjRow: {paddingVertical: spacing.sm},
  subjBorder: {borderBottomColor: colors.borderLight, borderBottomWidth: 1},
  subjName: {...typography.body, color: colors.text, fontWeight: '700', fontSize: 13, marginBottom: 4},
  subjRight: {gap: 4},
  subjMiniStats: {flexDirection: 'row', gap: spacing.md},
  subjStat: {...typography.caption, color: colors.textSoft, fontSize: 11},
  subjStatVal: {...typography.captionBold, fontSize: 11},
  rankRow: {
    alignItems: 'center',
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm},
  rankBadge: {
    alignItems: 'center',
    backgroundColor: `${colors.primary}12`,
    borderRadius: radius.sm,
    height: 28,
    justifyContent: 'center',
    width: 28},
  rankNum: {...typography.captionBold, color: colors.primary, fontSize: 11},
  rankName: {...typography.body, color: colors.text, flex: 1, fontWeight: '600', fontSize: 13},
  rankMarks: {...typography.caption, color: colors.textMuted, fontWeight: '700'},
  errorText: {...typography.body, color: colors.textMuted, marginTop: spacing.sm},
  retryBtn: {backgroundColor: colors.primary, borderRadius: radius.card, paddingHorizontal: spacing.xl, paddingVertical: 10},
  retryText: {color: colors.white, fontWeight: '800'}});

export default ExamAnalyticsScreen;
