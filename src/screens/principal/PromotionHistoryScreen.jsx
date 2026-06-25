import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {EmptyState, FilterTabs, SkeletonLoader} from '../../components';
import academicYearService from '../../services/academicYear/academicYearService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const HistoryCard = ({item, index}) => (
  <Animated.View
    style={styles.card}>
    <View style={styles.cardLeft}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="arrow-up-circle-outline" size={20} color={colors.primary} />
      </View>
    </View>
    <View style={styles.cardBody}>
      <Text style={styles.studentName} numberOfLines={1}>
        {item.student?.fullName || item.student?.studentId || 'Student'}
      </Text>
      <View style={styles.promotionPath}>
        <View style={styles.classChip}>
          <Text style={styles.classChipText}>
            {item.fromClass?.name || '—'}
          </Text>
        </View>
        <MaterialCommunityIcons name="arrow-right" size={14} color={colors.textMuted} />
        <View style={[styles.classChip, styles.classChipTarget]}>
          <Text style={[styles.classChipText, {color: colors.primary}]}>
            {item.toClass?.name || '—'}
          </Text>
        </View>
      </View>
      <Text style={styles.sectionPath}>
        Section{' '}
        <Text style={styles.sectionBold}>{item.fromSection?.name || '—'}</Text>
        {' → '}
        <Text style={styles.sectionBold}>{item.toSection?.name || '—'}</Text>
      </Text>
      {item.promotedBy?.fullName ? (
        <Text style={styles.promotedBy}>By {item.promotedBy.fullName}</Text>
      ) : null}
    </View>
  </Animated.View>
);

const PromotionHistoryScreen = () => {
  const user = useSelector(state => state.auth.user);
  const branchId = user?.branchId;
  const currentYear = academicYearService.getCurrentStartYear(branchId);
  const [year, setYear] = useState(String(currentYear));

  // Year filter: the current academic year plus the four preceding years.
  const yearTabs = useMemo(() => {
    const years = Array.from({length: 5}, (_, i) => currentYear - i);
    return years.map(y => ({label: `AY ${y}`, value: String(y)}));
  }, [currentYear]);

  const {data = [], isLoading} = useQuery({
    queryKey: ['promotionHistory', branchId, year],
    queryFn: () => academicYearService.getPromotionHistory({branchId, academicYear: Number(year)}),
    enabled: Boolean(branchId)});

  return (
    <View style={styles.root}>
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Animated.View
              style={styles.header}>
              <View style={styles.headerDecor} />
              <Text style={styles.headerOverline}>Principal</Text>
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Promotion History</Text>
                {data.length > 0 ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{data.length}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.headerSub}>Annual promotion audit trail</Text>
            </Animated.View>
            <FilterTabs tabs={yearTabs} value={year} onChange={setYear} />
          </View>
        }
        renderItem={({item, index}) => (
          <HistoryCard item={item} index={Math.min(index, 15)} />
        )}
        ListEmptyComponent={
          isLoading ? (
            <SkeletonLoader rows={4} />
          ) : (
            <EmptyState
              title="No promotion records"
              message="Promotion records appear after a principal promotes students."
            />
          )
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

  header: {
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep},
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130},
  headerOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase'},
  headerRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 2},
  countBadgeText: {color: colors.white, fontSize: 12, fontWeight: '800'},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 4},

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.clay},
  cardLeft: {paddingTop: 2},
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38},
  cardBody: {flex: 1},
  studentName: {...typography.bodyBold, color: colors.text, marginBottom: spacing.xs},
  promotionPath: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs},
  classChip: {
    backgroundColor: colors.primaryFaint,
    borderColor: colors.borderLight,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2},
  classChipTarget: {backgroundColor: colors.primarySoft, borderColor: colors.primarySoft},
  classChipText: {color: colors.text, fontSize: 11, fontWeight: '700'},
  sectionPath: {color: colors.textMuted, fontSize: 11, fontWeight: '500'},
  sectionBold: {color: colors.text, fontWeight: '700'},
  promotedBy: {color: colors.textSoft, fontSize: 10, fontWeight: '600', marginTop: 3}});

export default PromotionHistoryScreen;
