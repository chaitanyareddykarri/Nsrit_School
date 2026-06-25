import React, {useEffect} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {EmptyState} from '../../components';
import {fetchBranches} from '../../store/slices/branchSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const BranchCard = ({branch, index}) => {
  const isActive = branch.isActive !== false;
  return (
    <Animated.View
      style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.branchIconWrap}>
          <MaterialCommunityIcons
            name="office-building-outline"
            size={20}
            color={colors.primaryDark}
          />
        </View>
        <View style={styles.branchInfo}>
          <Text style={styles.branchName} numberOfLines={1}>
            {branch.name}
          </Text>
          <View style={styles.branchMeta}>
            {branch.code ? (
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{branch.code}</Text>
              </View>
            ) : null}
            <View
              style={[
                styles.statusDot,
                {backgroundColor: isActive ? colors.success : colors.danger},
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {color: isActive ? colors.success : colors.danger},
              ]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>
      {branch.city ? (
        <View style={styles.cardFooter}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={11}
            color={colors.textMuted}
          />
          <Text style={styles.cardCity}>{branch.city}</Text>
        </View>
      ) : null}
    </Animated.View>
  );
};

const ManageBranchesScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {items} = useSelector(state => state.branches);

  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  return (
    <View style={styles.root}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Animated.View
              style={styles.header}>
              <View style={styles.headerDecor} />
              <Text style={styles.headerOverline}>Main Admin</Text>
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Manage Branches</Text>
                {items.length > 0 ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{items.length}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.headerSub}>All registered school branches</Text>
              <Pressable
                onPress={() => navigation.navigate('CreateBranch')}
                style={styles.headerCta}>
                <MaterialCommunityIcons name="plus" size={14} color={colors.primaryDark} />
                <Text style={styles.headerCtaText}>Add Branch</Text>
              </Pressable>
            </Animated.View>
          </View>
        }
        renderItem={({item, index}) => (
          <BranchCard branch={item} index={index} />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No branches"
            message="Create the first branch to start onboarding users."
          />
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
    backgroundColor: colors.primaryDark,
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

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.clay},
  cardTop: {alignItems: 'center', flexDirection: 'row', gap: spacing.md},
  branchIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    height: 44,
    justifyContent: 'center',
    width: 44},
  branchInfo: {flex: 1, minWidth: 0},
  branchName: {...typography.bodyBold, color: colors.text},
  branchMeta: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginTop: 4},
  codeBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1},
  codeText: {color: colors.primary, fontSize: 10, fontWeight: '700'},
  statusDot: {borderRadius: radius.pill, height: 6, width: 6},
  statusText: {fontSize: 11, fontWeight: '600'},
  cardFooter: {
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 4,
    marginTop: spacing.sm,
    paddingTop: spacing.sm},
  cardCity: {color: colors.textMuted, fontSize: 11, fontWeight: '600'}});

export default ManageBranchesScreen;
