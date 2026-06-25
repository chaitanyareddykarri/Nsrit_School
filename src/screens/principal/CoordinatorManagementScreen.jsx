import React from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, SkeletonLoader} from '../../components';
import {WING_LABELS} from '../../config/academic';
import coordinatorService from '../../services/coordinators/coordinatorService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const getInitials = name =>
  name
    ? name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    : '?';

const WING_COLORS = {
  PP: colors.purple,
  PR: colors.secondary,
  HR: colors.primary};

const CoordinatorCard = ({item, index, onPress}) => {
  const name = item.user?.fullName || 'Coordinator';
  const wing = item.wing || '';
  const accentColor = WING_COLORS[wing] || colors.primary;
  const isActive = item.isActive !== false;

  return (
    <Animated.View>
      <Pressable
        onPress={() => onPress(item)}
        style={({pressed}) => [styles.card, pressed && {opacity: 0.88}]}>
        <View style={styles.cardTop}>
          <View style={[styles.avatar, {backgroundColor: `${accentColor}18`}]}>
            <Text style={[styles.avatarText, {color: accentColor}]}>
              {getInitials(name)}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.cardMeta}>
              <View style={[styles.wingBadge, {backgroundColor: `${accentColor}15`}]}>
                <MaterialCommunityIcons
                  name="flag-outline"
                  size={10}
                  color={accentColor}
                />
                <Text style={[styles.wingBadgeText, {color: accentColor}]}>
                  {WING_LABELS[wing] || wing || 'Wing'}
                </Text>
              </View>
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
          <MaterialCommunityIcons
            name="chevron-right"
            size={18}
            color={colors.textMuted}
          />
        </View>
        {item.user?.phoneNumber ? (
          <View style={styles.cardFooter}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={11}
              color={colors.textMuted}
            />
            <Text style={styles.cardPhone}>{item.user.phoneNumber}</Text>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
};

const CoordinatorManagementScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);

  const {data = [], isLoading} = useQuery({
    queryKey: ['coordinators', user?.branchId],
    queryFn: () => coordinatorService.getCoordinators(user.branchId, scope),
    enabled: Boolean(user?.branchId)});

  return (
    <View style={styles.root}>
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Animated.View
            style={styles.header}>
            <View style={styles.headerDecor} />
            <Text style={styles.headerOverline}>Principal</Text>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Coordinators</Text>
              {data.length > 0 ? (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{data.length}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.headerSub}>One active coordinator per wing</Text>
            <Pressable
              onPress={() => navigation.navigate('CreateCoordinator')}
              style={styles.headerCta}>
              <MaterialCommunityIcons name="plus" size={14} color={colors.primary} />
              <Text style={styles.headerCtaText}>Create Coordinator</Text>
            </Pressable>
          </Animated.View>
        }
        renderItem={({item, index}) => (
          <CoordinatorCard
            item={item}
            index={index}
            onPress={c =>
              navigation.navigate('CoordinatorDetails', {coordinatorId: c.id})
            }
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <SkeletonLoader rows={3} />
          ) : (
            <EmptyState
              title="No coordinators"
              message="Create pre-primary, primary, and higher coordinators for this branch."
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
  headerCtaText: {color: colors.primary, fontSize: 12, fontWeight: '700'},

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.clay},
  cardTop: {alignItems: 'center', flexDirection: 'row', gap: spacing.md},
  avatar: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 46,
    justifyContent: 'center',
    width: 46},
  avatarText: {fontSize: 14, fontWeight: '800'},
  cardInfo: {flex: 1, minWidth: 0},
  cardName: {...typography.bodyBold, color: colors.text},
  cardMeta: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginTop: 4},
  wingBadge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2},
  wingBadgeText: {fontSize: 10, fontWeight: '700'},
  statusDot: {borderRadius: radius.pill, height: 6, width: 6},
  statusText: {fontSize: 11, fontWeight: '600'},
  cardFooter: {
    alignItems: 'center',
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 5,
    marginTop: spacing.sm,
    paddingTop: spacing.sm},
  cardPhone: {color: colors.textMuted, fontSize: 11, fontWeight: '600'}});

export default CoordinatorManagementScreen;
