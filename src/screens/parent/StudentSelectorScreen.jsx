import React from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, SkeletonLoader} from '../../components';
import parentService from '../../services/parents/parentService';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {storage} from '../../services/storage/mmkvStorage';
import {STORAGE_KEYS} from '../../config/constants';

const getInitials = name =>
  name
    ? name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    : '?';

const ChildCard = ({child, index, onPress}) => (
  <Animated.View>
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.card, pressed && {opacity: 0.88}]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(child.fullName)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{child.fullName}</Text>
        <Text style={styles.meta}>
          {child.academicClass?.name || '—'}–{child.section?.name || '—'}
        </Text>
        {child.studentId ? (
          <View style={styles.idBadge}>
            <Text style={styles.idText}>#{child.studentId}</Text>
          </View>
        ) : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primary} />
    </Pressable>
  </Animated.View>
);

const StudentSelectorScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const parentId = user?.parentId;

  const {data: children = [], error, isLoading} = useQuery({
    queryKey: ['parentChildren', parentId],
    queryFn: () => parentService.getParentChildren(parentId),
    enabled: Boolean(parentId)});

  return (
    <View style={styles.root}>
      <FlatList
        data={children}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Animated.View
            style={styles.header}>
            <View style={styles.headerDecor} />
            <Text style={styles.headerOverline}>Parent Portal</Text>
            <Text style={styles.headerTitle}>Select Student</Text>
            <Text style={styles.headerSub}>Tap a child to view their attendance</Text>
          </Animated.View>
        }
        renderItem={({item, index}) => (
          <ChildCard
            child={item}
            index={index}
            onPress={() => {
              storage.set(STORAGE_KEYS.ACTIVE_CHILD_ID, item.id);
              navigation.navigate('Home');
            }}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <SkeletonLoader rows={3} />
          ) : error ? (
            <EmptyState title="Unable to load children" message={error.message} />
          ) : (
            <EmptyState
              title="No linked children"
              message="Child records linked to this parent will appear here."
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
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 4},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500'},

  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.clay},
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    width: 48},
  avatarText: {color: colors.primary, fontSize: 14, fontWeight: '800'},
  info: {flex: 1, minWidth: 0},
  name: {...typography.bodyBold, color: colors.text},
  meta: {color: colors.textMuted, fontSize: 12, fontWeight: '500', marginTop: 2},
  idBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    marginTop: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1},
  idText: {color: colors.primary, fontSize: 10, fontWeight: '700'}});

export default StudentSelectorScreen;
