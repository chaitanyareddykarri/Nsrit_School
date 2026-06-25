import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {EmptyState, SkeletonLoader} from '../../components';
import {USER_ROLES} from '../../config/constants';
import academicRepository from '../../repositories/academicRepository';
import dataConnectClient from '../../services/dataconnect/dataConnectClient';
import {DATA_CONNECT_QUERIES} from '../../services/dataconnect/operations';
import {seedAcademicClasses} from '../../utils/SeedAcademicClasses';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const ClassCard = ({item, index, onToggle, isPending}) => {
  const isActive = item.isActive;

  return (
    <Animated.View
      style={[styles.classCard, isActive && styles.classCardActive]}>
      <View style={[styles.cardAccent, {backgroundColor: isActive ? colors.success : colors.border}]} />
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <View style={styles.cardIconWrap}>
            <MaterialCommunityIcons
              name="school-outline"
              size={18}
              color={isActive ? colors.primary : colors.textMuted}
            />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>
              {item.name}
              {item.classCode ? (
                <Text style={styles.cardCode}> ({item.classCode})</Text>
              ) : null}
            </Text>
            <Text style={styles.cardWing}>
              {item.wing?.name || item.wing?.code || 'Wing not set'}
            </Text>
          </View>
          {isPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Switch
              value={isActive}
              onValueChange={() => onToggle(item)}
              trackColor={{false: colors.border, true: `${colors.success}50`}}
              thumbColor={isActive ? colors.success : colors.textSoft}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const ClassManagementScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const queryClient = useQueryClient();
  const [seeding, setSeeding] = useState(false);
  const isMainAdmin = String(user?.role || '').toUpperCase() === USER_ROLES.MAIN_ADMIN;

  const classesQuery = useQuery({
    queryKey: ['academicClasses', 'all'],
    queryFn: () => academicRepository.getAcademicClasses()});

  const activateMutation = useMutation({
    mutationFn: classId => academicRepository.activateClass(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['academicClasses', 'all']});
      queryClient.invalidateQueries({queryKey: ['activeAcademicClasses']});
    },
    onError: err => Alert.alert('Activation Failed', err.message)});

  const deactivateMutation = useMutation({
    mutationFn: async classItem => {
      const sectionsRes = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_SECTIONS_BY_CLASS,
        {academicClassId: classItem.id},
      );
      if (sectionsRes.sections?.length > 0) {
        throw new Error(
          `Cannot deactivate: ${sectionsRes.sections.length} active section(s) exist.`,
        );
      }
      const analyticsRes = await dataConnectClient.query(
        DATA_CONNECT_QUERIES.GET_CLASS_ANALYTICS,
        {academicClassId: classItem.id},
      );
      if (analyticsRes.students?.length > 0) {
        throw new Error(
          `Cannot deactivate: ${analyticsRes.students.length} active student(s) exist.`,
        );
      }
      return academicRepository.deactivateClass(classItem.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['academicClasses', 'all']});
      queryClient.invalidateQueries({queryKey: ['activeAcademicClasses']});
    },
    onError: err => Alert.alert('Validation Failed', err.message)});

  const handleToggle = classItem => {
    if (classItem.isActive) {
      deactivateMutation.mutate(classItem);
    } else {
      activateMutation.mutate(classItem.id);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    const res = await seedAcademicClasses(user.branchId);
    setSeeding(false);
    if (res.success) {
      Alert.alert('Success', `Seeded ${res.seeded} new classes.`);
      queryClient.invalidateQueries({queryKey: ['academicClasses', 'all']});
    } else {
      Alert.alert('Error', res.error || 'Failed to seed classes.');
    }
  };

  const classes = (classesQuery.data || []).filter(
    item => !user?.branchId || item.branchId === user.branchId,
  );

  const isPending = activateMutation.isPending || deactivateMutation.isPending;

  return (
    <View style={styles.root}>
      <FlatList
        data={classes}
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
                <Text style={styles.headerTitle}>Class Management</Text>
                {classes.length > 0 ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{classes.length}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.headerSub}>
                Activate or deactivate master academic classes
              </Text>
            </Animated.View>

            {seeding ? (
              <View style={styles.seedingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.seedingText}>Seeding class catalog…</Text>
              </View>
            ) : null}

            {classes.length === 0 &&
            !classesQuery.isLoading &&
            !seeding &&
            !isMainAdmin ? (
              <Animated.View
                style={styles.seedCard}>
                <MaterialCommunityIcons
                  name="database-plus-outline"
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.seedTitle}>No class catalog found</Text>
                <Text style={styles.seedDesc}>
                  Seed the initial class data to get started with sections and
                  teacher assignments.
                </Text>
                <Pressable onPress={handleSeed} style={styles.seedBtn}>
                  <MaterialCommunityIcons
                    name="play-circle-outline"
                    size={16}
                    color={colors.white}
                  />
                  <Text style={styles.seedBtnText}>Run Seed Script</Text>
                </Pressable>
              </Animated.View>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <ClassCard
            item={item}
            index={Math.min(index, 15)}
            onToggle={handleToggle}
            isPending={isPending}
          />
        )}
        ListEmptyComponent={
          classesQuery.isLoading ? (
            <SkeletonLoader rows={5} />
          ) : classes.length === 0 && (seeding || isMainAdmin) ? (
            <EmptyState
              title="No classes"
              message="Academic classes will appear after seeding."
            />
          ) : null
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

  seedingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.md},
  seedingText: {color: colors.primary, fontSize: 13, fontWeight: '600'},

  seedCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.xxl,
    ...shadows.clay},
  seedTitle: {...typography.bodyBold, color: colors.text, textAlign: 'center'},
  seedDesc: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center'},
  seedBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.fab},
  seedBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'},

  classCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.clay},
  classCardActive: {borderColor: `${colors.success}30`},
  cardAccent: {width: 4},
  cardBody: {flex: 1, padding: spacing.md},
  cardRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.md},
  cardIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.card,
    height: 40,
    justifyContent: 'center',
    width: 40},
  cardInfo: {flex: 1},
  cardName: {...typography.bodyBold, color: colors.text},
  cardCode: {color: colors.textMuted, fontSize: 12, fontWeight: '500'},
  cardWing: {color: colors.textMuted, fontSize: 12, fontWeight: '500', marginTop: 2}});

export default ClassManagementScreen;
