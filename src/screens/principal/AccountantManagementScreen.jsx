import React from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, SkeletonLoader} from '../../components';
import accountantService from '../../services/accountants/accountantService';
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

const AccountantCard = ({item, index, onPress}) => {
  const isActive = item.isActive !== false;
  return (
    <Animated.View>
      <Pressable
        onPress={onPress}
        style={({pressed}) => [styles.card, pressed && {opacity: 0.88}]}>
        <View style={styles.cardTop}>
          <View style={[styles.avatar, {backgroundColor: isActive ? colors.secondarySoft : colors.neutralSoft}]}>
            <Text style={[styles.avatarText, {color: isActive ? colors.secondary : colors.textMuted}]}>
              {getInitials(item.fullName)}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{item.fullName}</Text>
            <View style={styles.metaRow}>
              {item.employeeId ? (
                <View style={styles.empBadge}>
                  <Text style={styles.empBadgeText}>{item.employeeId}</Text>
                </View>
              ) : null}
              <View style={[styles.statusDot, {backgroundColor: isActive ? colors.success : colors.danger}]} />
              <Text style={[styles.statusText, {color: isActive ? colors.success : colors.danger}]}>
                {isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textMuted} />
        </View>
        {item.phoneNumber ? (
          <View style={styles.cardFooter}>
            <MaterialCommunityIcons name="phone-outline" size={11} color={colors.textMuted} />
            <Text style={styles.phone}>{item.phoneNumber}</Text>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
};

const AccountantManagementScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);

  const {data: accountants = [], error, isLoading} = useQuery({
    queryKey: ['accountants', user?.branchId],
    queryFn: () => accountantService.getAccountants(user.branchId, scope),
    enabled: Boolean(user?.branchId)});

  return (
    <View style={styles.root}>
      <FlatList
        data={accountants}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Animated.View style={styles.header}>
            <View style={styles.headerDecor} />
            <Text style={styles.headerOverline}>Principal</Text>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Accountants</Text>
              {accountants.length > 0 ? (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{accountants.length}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.headerSub}>Branch fee desk users</Text>
            <Pressable
              onPress={() => navigation.navigate('CreateAccountant')}
              style={styles.headerCta}>
              <MaterialCommunityIcons name="plus" size={14} color={colors.secondary} />
              <Text style={styles.headerCtaText}>Add Accountant</Text>
            </Pressable>
          </Animated.View>
        }
        renderItem={({item, index}) => (
          <AccountantCard
            item={item}
            index={index}
            onPress={() => navigation.navigate('AccountantProfile', {accountantId: item.id})}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <SkeletonLoader rows={3} />
          ) : (
            <EmptyState
              title={error ? 'Unable to load accountants' : 'No accountants'}
              message={error?.message || 'Created accountant profiles will appear here.'}
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
    backgroundColor: colors.secondary,
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
  headerCtaText: {color: colors.secondary, fontSize: 12, fontWeight: '700'},

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
    height: 44,
    justifyContent: 'center',
    width: 44},
  avatarText: {fontSize: 13, fontWeight: '800'},
  info: {flex: 1, minWidth: 0},
  name: {...typography.bodyBold, color: colors.text},
  metaRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginTop: 3},
  empBadge: {
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1},
  empBadgeText: {color: colors.secondary, fontSize: 9, fontWeight: '800'},
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
  phone: {color: colors.textMuted, fontSize: 11, fontWeight: '600'}});

export default AccountantManagementScreen;
