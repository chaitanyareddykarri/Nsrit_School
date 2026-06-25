import React, {useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {EmptyState} from '../../components';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const TABS = ['students', 'attendance', 'fees'];
const TAB_LABELS = {students: 'Students', attendance: 'Attendance', fees: 'Fees'};
const TAB_ICONS = {students: 'account-school', attendance: 'calendar-check', fees: 'cash-multiple'};

const StatusChip = ({status}) => {
  const color =
    status === 'PRESENT' ? colors.success
    : status === 'ABSENT' ? colors.danger
    : colors.warning;
  return (
    <View style={[styles.chip, {backgroundColor: `${color}22`}]}>
      <Text style={[styles.chipText, {color}]}>{status}</Text>
    </View>
  );
};

const ClassDetailsScreen = ({navigation, route}) => {
  const {sectionId} = route.params || {};
  const [tab, setTab] = useState('students');
  const {data, loading, refreshing, error, refresh} = useAsyncResource(
    options => mainAdminService.getClassDetails(sectionId, options),
    [sectionId],
  );

  const classTeacher = useMemo(
    () => data?.teacherAssignments?.find(item => item.isClassTeacher)?.teacher,
    [data],
  );

  if (loading && !data) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.primaryDark} size="large" />
        <Text style={styles.loadingText}>Loading class details…</Text>
      </View>
    );
  }

  if (!data?.section) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <EmptyState title="Class unavailable" message={error || 'Unable to load class details.'} />
      </SafeAreaView>
    );
  }

  const classInfo = data.classInfo;
  const listData =
    tab === 'students' ? data.students
    : tab === 'attendance' ? data.attendances
    : data.studentFees;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <FlatList
        data={listData || []}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListHeaderComponent={
          <View>
            <Animated.View style={styles.hero}>
              <View style={styles.heroDecor} />
              <Text style={styles.heroOverline}>{classInfo?.branchName || '—'}</Text>
              <Text style={styles.heroTitle}>
                {classInfo?.className || 'Class'} {classInfo?.section || ''}
              </Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{data.students?.length || 0}</Text>
                  <Text style={styles.heroStatLabel}>Students</Text>
                </View>
                <View style={styles.statSep} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{classTeacher?.fullName || 'Unassigned'}</Text>
                  <Text style={styles.heroStatLabel}>Class Teacher</Text>
                </View>
              </View>
            </Animated.View>

            {/* ── Tab bar ── */}
            <View style={styles.tabBar}>
              {TABS.map(t => (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  style={[styles.tab, tab === t && styles.tabActive]}>
                  <MaterialCommunityIcons
                    name={TAB_ICONS[t]}
                    size={14}
                    color={tab === t ? colors.primaryDark : colors.textMuted}
                  />
                  <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                    {TAB_LABELS[t]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        renderItem={({item, index}) => {
          if (tab === 'students') {
            return (
              <Animated.View>
                <Pressable
                  onPress={() => navigation.navigate('StudentProfile', {studentId: item.id})}
                  style={({pressed}) => [styles.rowCard, pressed && {opacity: 0.88}]}>
                  <View style={styles.rowIcon}>
                    <MaterialCommunityIcons name="account-school" size={14} color={colors.primaryDark} />
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{item.fullName}</Text>
                    <Text style={styles.rowSub}>{item.studentId} · Roll {item.rollNumber || '—'}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={14} color={colors.textMuted} />
                </Pressable>
              </Animated.View>
            );
          }
          if (tab === 'attendance') {
            return (
              <Animated.View>
                <View style={styles.rowCard}>
                  <View style={[styles.rowIcon, {backgroundColor: colors.primarySoft}]}>
                    <MaterialCommunityIcons name="calendar-check" size={14} color={colors.primaryDark} />
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{item.attendanceDate}</Text>
                    {item.remarks ? <Text style={styles.rowSub}>{item.remarks}</Text> : null}
                  </View>
                  <StatusChip status={item.status} />
                </View>
              </Animated.View>
            );
          }
          return (
            <Animated.View>
              <View style={styles.rowCard}>
                <View style={[styles.rowIcon, {backgroundColor: colors.secondarySoft}]}>
                  <MaterialCommunityIcons name="cash-multiple" size={14} color={colors.secondary} />
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{formatCurrency(item.totalFee)}</Text>
                  <Text style={styles.rowSub}>{formatCurrency(item.paidAmount)} paid · {formatCurrency(item.remainingAmount)} pending</Text>
                </View>
                <StatusChip status={item.status} />
              </View>
            </Animated.View>
          );
        }}
        ListEmptyComponent={<EmptyState title="No records" message="Records will appear after entry." />}
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},
  loadingWrap: {alignItems: 'center', backgroundColor: colors.background, flex: 1, gap: spacing.md, justifyContent: 'center'},
  loadingText: {color: colors.textMuted, fontSize: 13, fontWeight: '600'},

  hero: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.clayDeep},
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130},
  heroOverline: {color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase'},
  heroTitle: {color: colors.white, fontSize: 24, fontWeight: '800', marginBottom: spacing.md},
  heroStats: {
    borderTopColor: 'rgba(255,255,255,0.12)',
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingTop: spacing.md},
  heroStat: {alignItems: 'center', flex: 1},
  heroStatValue: {color: colors.white, fontSize: 15, fontWeight: '800'},
  heroStatLabel: {color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase'},
  statSep: {backgroundColor: 'rgba(255,255,255,0.12)', width: 1},

  tabBar: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: 4,
    ...shadows.clay},
  tab: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    paddingVertical: spacing.sm},
  tabActive: {backgroundColor: colors.primarySoft},
  tabText: {color: colors.textMuted, fontSize: 12, fontWeight: '600'},
  tabTextActive: {color: colors.primaryDark, fontWeight: '700'},

  rowCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.clay},
  rowIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    height: 32,
    justifyContent: 'center',
    width: 32},
  rowBody: {flex: 1, minWidth: 0},
  rowTitle: {...typography.bodyBold, color: colors.text, fontSize: 13},
  rowSub: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  chip: {borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2},
  chipText: {fontSize: 10, fontWeight: '800'}});

export default ClassDetailsScreen;
