import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const USER_ACTIONS = [
  {
    id: 'branchAdmin',
    title: 'Branch Admin',
    description: 'Create administrators for specific branches',
    icon: 'shield-account',
    color: colors.primary,
    colorSoft: colors.primarySoft,
    cta: 'Create Branch Admin',
    navigateToBranch: true},
  {
    id: 'schoolRoles',
    title: 'School Roles',
    description: 'Create Principals, Coordinators, Teachers, and Parents',
    icon: 'account-group',
    color: colors.secondary,
    colorSoft: colors.secondarySoft,
    cta: 'Create School User',
    navigateToBranch: true},
  {
    id: 'changeRole',
    title: 'Change User Role',
    description: 'Fix a user whose role is wrong — updates users.role and cleans stale user_roles entries',
    icon: 'shield-edit-outline',
    color: colors.danger,
    colorSoft: colors.dangerSoft,
    cta: 'Change Role',
    navigateToBranch: false,
    screen: 'ChangeUserRole'},
];

const ActionCard = ({item, index, onPress}) => (
  <Animated.View>
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.card, pressed && {opacity: 0.88}]}>
      <View style={styles.cardTop}>
        <View style={[styles.cardIcon, {backgroundColor: item.colorSoft}]}>
          <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
        </View>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
      </View>
      <View style={[styles.cardCta, {backgroundColor: item.color}]}>
        <MaterialCommunityIcons name="plus" size={14} color={colors.white} />
        <Text style={styles.cardCtaText}>{item.cta}</Text>
      </View>
    </Pressable>
  </Animated.View>
);

const ManageUsersScreen = ({navigation}) => {
  const navigateToBranchList = () => {
    Toast.show({
      type: 'info',
      text1: 'Select a branch',
      text2: 'Users must be provisioned within a specific branch context.'});
    navigation.navigate('BranchList');
  };

  const handleAction = item => {
    if (item.navigateToBranch) {
      navigateToBranchList();
    } else {
      navigation.navigate(item.screen);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <Animated.View
        style={styles.header}>
        <View style={styles.headerDecor} />
        <Text style={styles.headerOverline}>Main Admin</Text>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <Text style={styles.headerSub}>
          Provision branch admins, school users, and fix role assignments
        </Text>
      </Animated.View>

      {/* ── Info notice ── */}
      <Animated.View
        style={styles.notice}>
        <MaterialCommunityIcons
          name="information-outline"
          size={15}
          color={colors.primary}
        />
        <Text style={styles.noticeText}>
          Creating users requires selecting a branch first. Role changes can be
          applied directly without a branch selection.
        </Text>
      </Animated.View>

      {/* ── Action cards ── */}
      {USER_ACTIONS.map((item, i) => (
        <ActionCard
          key={item.id}
          item={item}
          index={i}
          onPress={() => handleAction(item)}
        />
      ))}

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},

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
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 4},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500'},

  notice: {
    alignItems: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md},
  noticeText: {
    color: colors.primary,
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18},

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.clay},
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg},
  cardIcon: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56},
  cardCopy: {flex: 1},
  cardTitle: {...typography.bodyBold, color: colors.text, fontSize: 16},
  cardDesc: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 3},
  cardCta: {
    alignItems: 'center',
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 42,
    justifyContent: 'center',
    ...shadows.fab},
  cardCtaText: {color: colors.white, fontSize: 14, fontWeight: '700'}});

export default ManageUsersScreen;
