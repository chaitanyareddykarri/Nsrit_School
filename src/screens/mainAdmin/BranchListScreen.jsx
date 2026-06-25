import React, {useCallback, useMemo, useState} from 'react';
import {FlatList, Pressable, RefreshControl, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';
import {EmptyState, SearchBar} from '../../components';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';

const formatDate = value => formatDateForDisplay(value) || 'Not set';

const MetricPill = ({label, value, color}) => (
  <View style={[styles.metric, {backgroundColor: color ? `${color}15` : colors.background}]}>
    <Text style={[styles.metricValue, {color: color || colors.primary}]}>{value || 0}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const BranchCard = ({item, index, onPress}) => {
  const isActive = item.isActive !== false;
  return (
    <Animated.View>
      <Pressable
        onPress={onPress}
        style={({pressed}) => [styles.card, pressed && {opacity: 0.88}]}>
        <View style={styles.cardTop}>
          <View style={styles.branchIcon}>
            <MaterialCommunityIcons
              name="office-building-outline"
              size={20}
              color={colors.primaryDark}
            />
          </View>
          <View style={styles.branchInfo}>
            <Text style={styles.branchName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.branchMeta}>
              {item.branchCode ? (
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{item.branchCode}</Text>
                </View>
              ) : null}
              {item.city ? (
                <View style={styles.cityRow}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={10}
                    color={colors.textMuted}
                  />
                  <Text style={styles.cityText}>{item.city}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: isActive ? colors.successSoft : colors.dangerSoft}]}>
            <View style={[styles.statusDot, {backgroundColor: isActive ? colors.success : colors.danger}]} />
            <Text style={[styles.statusText, {color: isActive ? colors.success : colors.danger}]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <MetricPill label="Students" value={item.totalStudents} color={colors.primary} />
          <MetricPill label="Faculty & Staff" value={item.totalTeachers} color={colors.secondary} />
          <MetricPill label="Coordinators" value={item.totalCoordinators} color={colors.purple} />
        </View>

        <View style={styles.cardFooter}>
          {item.principal?.fullName ? (
            <View style={styles.footerRow}>
              <MaterialCommunityIcons name="account-tie-outline" size={11} color={colors.textMuted} />
              <Text style={styles.footerText} numberOfLines={1}>
                Principal: {item.principal.fullName}
              </Text>
            </View>
          ) : null}
          {item.createdAt ? (
            <Text style={styles.dateText}>Created {formatDate(item.createdAt)}</Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const BranchListScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const {data, loading, refreshing, error, refresh} = useAsyncResource(
    options => mainAdminService.getAllBranches(options),
    [],
  );

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const branches = useMemo(() => {
    const needle = searchText.trim().toLowerCase();
    if (!needle) {
      return data || [];
    }
    return (data || []).filter(branch =>
      [branch.name, branch.branchCode, branch.city, branch.phone, branch.email]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(needle)),
    );
  }, [data, searchText]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <FlatList
        data={branches}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListHeaderComponent={
          <View>
            <Animated.View
              style={styles.header}>
              <View style={styles.headerDecor} />
              <Text style={styles.headerOverline}>Main Admin</Text>
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>All Branches</Text>
                {branches.length > 0 ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{branches.length}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.headerSub}>
                Live classes and student totals per branch
              </Text>
              <Pressable
                onPress={() => navigation.navigate('CreateBranch')}
                style={styles.headerCta}>
                <MaterialCommunityIcons name="plus" size={14} color={colors.primaryDark} />
                <Text style={styles.headerCtaText}>Add Branch</Text>
              </Pressable>
            </Animated.View>

            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search branch, code, phone"
            />

            {error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={13}
                  color={colors.danger}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {branches.length > 0 ? (
              <Text style={styles.resultMeta}>
                {branches.length} branch{branches.length !== 1 ? 'es' : ''}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <BranchCard
            item={item}
            index={Math.min(index, 12)}
            onPress={() =>
              navigation.navigate('BranchDetails', {branchId: item.id})
            }
          />
        )}
        ListEmptyComponent={
          loading && !data ? null : (
            <EmptyState
              title="No branches"
              message="Create a branch or adjust search filters."
            />
          )
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

  header: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.hero,
    marginBottom: spacing.md,
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
  headerCta: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm},
  headerCtaText: {color: colors.primaryDark, fontSize: 12, fontWeight: '700'},

  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm},
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},

  resultMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'},

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.clay},
  cardTop: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md},
  branchIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    height: 42,
    justifyContent: 'center',
    width: 42},
  branchInfo: {flex: 1, minWidth: 0},
  branchName: {...typography.bodyBold, color: colors.text},
  branchMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 3},
  codeBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1},
  codeText: {color: colors.primary, fontSize: 10, fontWeight: '700'},
  cityRow: {alignItems: 'center', flexDirection: 'row', gap: 3},
  cityText: {color: colors.textMuted, fontSize: 11, fontWeight: '500'},
  statusBadge: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4},
  statusDot: {borderRadius: radius.pill, height: 6, width: 6},
  statusText: {fontSize: 11, fontWeight: '700'},

  metricsRow: {flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm},
  metric: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    paddingVertical: spacing.sm},
  metricValue: {fontSize: 16, fontWeight: '800'},
  metricLabel: {color: colors.textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase'},

  cardFooter: {
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    gap: 3,
    paddingTop: spacing.sm},
  footerRow: {alignItems: 'center', flexDirection: 'row', gap: 4},
  footerText: {color: colors.textMuted, fontSize: 11, fontWeight: '500'},
  dateText: {color: colors.textSoft, fontSize: 10, fontWeight: '500'}});

export default BranchListScreen;
