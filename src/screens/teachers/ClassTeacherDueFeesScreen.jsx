import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {AnimatedProgressBar, EmptyState, SearchBar, SkeletonLoader} from '../../components';
import useFeeAccess from '../../hooks/useFeeAccess';
import feeService from '../../services/fees/feeService';
import {formatCurrency} from '../../utils/formatters/currency';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const STATUS_META = {
  DUE:     {color: colors.danger,  bg: colors.dangerSoft,  label: 'Unpaid'},
  PARTIAL: {color: '#F97316',      bg: '#FFF7ED',          label: 'Partial'}};

// ── Student due-fee card ───────────────────────────────────────────────────────
const DueCard = ({item, index}) => {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[item.status] || STATUS_META.DUE;
  const paidPct = item.totalFee > 0 ? Math.round((item.paidAmount / item.totalFee) * 100) : 0;

  return (
    <Animated.View style={s.card}>
      <Pressable onPress={() => setExpanded(e => !e)} style={s.cardHeader}>
        {/* Avatar */}
        <View style={s.avatar}>
          <Text style={s.avatarText}>{(item.studentName || 'S').charAt(0).toUpperCase()}</Text>
        </View>

        <View style={s.cardMain}>
          <Text style={s.studentName} numberOfLines={1}>{item.studentName}</Text>
          <Text style={s.studentMeta}>
            {[item.admissionNumber, item.className && item.sectionName
              ? `${item.className}-${item.sectionName}`
              : item.className || item.sectionName]
              .filter(Boolean).join(' · ')}
          </Text>
          <AnimatedProgressBar
            progress={paidPct}
            color={paidPct >= 80 ? colors.success : paidPct >= 40 ? '#F97316' : colors.danger}
            trackColor={colors.border}
            height={4}
          />
        </View>

        <View style={s.cardRight}>
          <Text style={[s.dueAmt, {color: colors.danger}]}>
            {formatCurrency(item.dueAmount)}
          </Text>
          <View style={[s.statusBadge, {backgroundColor: meta.bg}]}>
            <Text style={[s.statusText, {color: meta.color}]}>{meta.label}</Text>
          </View>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textMuted}
          />
        </View>
      </Pressable>

      {expanded ? (
        <View style={s.breakdown}>
          <View style={s.breakRow}>
            <Text style={s.breakLabel}>Total Fee</Text>
            <Text style={s.breakVal}>{formatCurrency(item.totalFee)}</Text>
          </View>
          <View style={s.breakRow}>
            <Text style={s.breakLabel}>Paid</Text>
            <Text style={[s.breakVal, {color: colors.success}]}>{formatCurrency(item.paidAmount)}</Text>
          </View>
          {item.previousYearDue > 0 ? (
            <View style={s.breakRow}>
              <Text style={s.breakLabel}>Prior Year Due</Text>
              <Text style={[s.breakVal, {color: colors.danger}]}>{formatCurrency(item.previousYearDue)}</Text>
            </View>
          ) : null}
          <View style={[s.breakRow, s.breakRowTotal]}>
            <Text style={[s.breakLabel, {fontWeight: '800', color: colors.text}]}>Outstanding</Text>
            <Text style={[s.breakVal, {fontWeight: '900', color: colors.danger, fontSize: 15}]}>
              {formatCurrency(item.dueAmount)}
            </Text>
          </View>
        </View>
      ) : null}
    </Animated.View>
  );
};

// ── Main screen ────────────────────────────────────────────────────────────────
const ClassTeacherDueFeesScreen = () => {
  const access = useFeeAccess();
  const [query, setQuery] = useState('');

  const {data = [], isLoading, error, refetch} = useQuery({
    queryKey: ['ctDueFees', access.branchId, access.sectionId, access.academicClassId],
    queryFn: () => feeService.getDueStudents(access),
    enabled: Boolean(access.branchId),
    staleTime: 3 * 60 * 1000});

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q
      ? data.filter(r =>
          `${r.studentName} ${r.admissionNumber} ${r.className} ${r.sectionName}`
            .toLowerCase().includes(q))
      : data;
  }, [data, query]);

  const totalDue   = useMemo(() => data.reduce((s, r) => s + r.dueAmount,   0), [data]);
  const totalPaid  = useMemo(() => data.reduce((s, r) => s + r.paidAmount,  0), [data]);
  const totalFees  = useMemo(() => data.reduce((s, r) => s + r.totalFee,    0), [data]);
  const collectionRate = totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0;
  const partialCount   = data.filter(r => r.status === 'PARTIAL').length;
  const fullDueCount   = data.filter(r => r.status === 'DUE').length;

  if (error) {
    return (
      <View style={s.root}>
        <EmptyState icon="alert-circle-outline" title="Unable to load fees" message={error.message} />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.studentId || item.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={false}
        renderItem={({item, index}) => <DueCard item={item} index={index} />}
        ListHeaderComponent={
          <View>
            {/* Header card */}
            <Animated.View style={s.header}>
              <View style={s.headerDecor} />
              <Text style={s.headerOverline}>Class Teacher · Read-only</Text>
              <Text style={s.headerTitle}>Students with Due Fees</Text>
              <Text style={s.headerSub}>
                {isLoading ? 'Loading…' : `${data.length} student${data.length !== 1 ? 's' : ''} with outstanding dues`}
              </Text>
            </Animated.View>

            {/* Summary strip */}
            {!isLoading && data.length > 0 ? (
              <Animated.View style={s.summaryCard}>
                <View style={s.summaryRow}>
                  <View style={s.summaryBox}>
                    <MaterialCommunityIcons name="cash-clock" size={20} color={colors.danger} />
                    <Text style={[s.summaryAmt, {color: colors.danger}]}>
                      {formatCurrency(totalDue)}
                    </Text>
                    <Text style={s.summaryLabel}>Total Due</Text>
                  </View>
                  <View style={s.summaryDiv} />
                  <View style={s.summaryBox}>
                    <MaterialCommunityIcons name="cash-check" size={20} color={colors.success} />
                    <Text style={[s.summaryAmt, {color: colors.success}]}>
                      {formatCurrency(totalPaid)}
                    </Text>
                    <Text style={s.summaryLabel}>Total Paid</Text>
                  </View>
                  <View style={s.summaryDiv} />
                  <View style={s.summaryBox}>
                    <MaterialCommunityIcons name="percent-outline" size={20} color={colors.primary} />
                    <Text style={[s.summaryAmt, {color: colors.primary}]}>
                      {collectionRate}%
                    </Text>
                    <Text style={s.summaryLabel}>Collected</Text>
                  </View>
                </View>
                <AnimatedProgressBar
                  progress={collectionRate}
                  color={collectionRate >= 80 ? colors.success : collectionRate >= 50 ? '#F97316' : colors.danger}
                  trackColor={colors.border}
                  height={6}
                />
                <View style={s.tagRow}>
                  {fullDueCount > 0 ? (
                    <View style={[s.tag, {backgroundColor: colors.dangerSoft}]}>
                      <MaterialCommunityIcons name="close-circle-outline" size={11} color={colors.danger} />
                      <Text style={[s.tagText, {color: colors.danger}]}>{fullDueCount} unpaid</Text>
                    </View>
                  ) : null}
                  {partialCount > 0 ? (
                    <View style={[s.tag, {backgroundColor: '#FFF7ED'}]}>
                      <MaterialCommunityIcons name="circle-half-full" size={11} color="#F97316" />
                      <Text style={[s.tagText, {color: '#F97316'}]}>{partialCount} partial</Text>
                    </View>
                  ) : null}
                </View>
              </Animated.View>
            ) : null}

            {/* Skeleton while loading */}
            {isLoading ? (
              <View style={{gap: spacing.sm}}>
                {[0, 1, 2, 3].map(i => (
                  <SkeletonLoader key={i} width="100%" height={72} borderRadius={12} />
                ))}
              </View>
            ) : null}

            {/* Notice */}
            <View style={s.notice}>
              <MaterialCommunityIcons name="information-outline" size={13} color={colors.primary} />
              <Text style={s.noticeText}>
                Read-only view. Contact the accountant or coordinator to record payments.
              </Text>
            </View>

            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name or roll number"
            />
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon={query ? 'account-search-outline' : 'check-circle-outline'}
              title={query ? 'No match' : 'All fees cleared!'}
              message={
                query
                  ? `No student matches "${query}".`
                  : 'No students in your section have outstanding dues. Great work!'
              }
            />
          ) : null
        }
      />
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {paddingBottom: 40, paddingHorizontal: spacing.lg, paddingTop: spacing.md},

  // Header
  header: {
    ...shadows.clayDeep,
    backgroundColor: colors.danger,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl},
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 80,
    height: 120,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 120},
  headerOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '900', marginBottom: 4},
  headerSub:  {color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '500'},

  // Summary card
  summaryCard: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.lg},
  summaryRow: {flexDirection: 'row', justifyContent: 'space-around'},
  summaryBox: {alignItems: 'center', flex: 1, gap: 3},
  summaryAmt: {fontSize: 16, fontWeight: '800'},
  summaryLabel: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},
  summaryDiv: {backgroundColor: colors.border, width: 1},

  tagRow: {flexDirection: 'row', gap: spacing.sm, marginTop: 2},
  tag: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3},
  tagText: {fontSize: 11, fontWeight: '700'},

  // Notice
  notice: {
    alignItems: 'flex-start',
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    padding: spacing.sm},
  noticeText: {color: colors.primary, flex: 1, fontSize: 11, fontWeight: '500', lineHeight: 16},

  // Student card
  card: {
    ...shadows.clay,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    overflow: 'hidden'},
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md},
  avatar: {
    alignItems: 'center',
    backgroundColor: `${colors.danger}18`,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40},
  avatarText: {color: colors.danger, fontSize: 16, fontWeight: '900'},
  cardMain: {flex: 1, gap: 3},
  studentName: {...typography.body, color: colors.text, fontWeight: '700'},
  studentMeta: {...typography.caption, color: colors.textMuted},

  cardRight: {alignItems: 'flex-end', gap: 4},
  dueAmt: {fontSize: 15, fontWeight: '900'},
  statusBadge: {borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 2},
  statusText: {fontSize: 10, fontWeight: '700'},

  // Breakdown
  breakdown: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: 2,
    padding: spacing.md,
    paddingTop: spacing.sm},
  breakRow: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3},
  breakRowTotal: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 6},
  breakLabel: {...typography.caption, color: colors.textMuted},
  breakVal: {...typography.caption, color: colors.text, fontWeight: '600'}});

export default ClassTeacherDueFeesScreen;
