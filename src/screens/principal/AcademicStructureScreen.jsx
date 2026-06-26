import React, {useEffect} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {EmptyState} from '../../components';
import SkeletonLoader from '../../components/feedback/SkeletonLoader';
import {fetchClasses} from '../../store/slices/classSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const WING_COLORS = {
  PP: colors.purple,
  PR: colors.secondary,
  HR: colors.primary,
};

const ClassCard = ({item, index}) => {
  const wingCode = item.wing?.code || '';
  const accentColor = WING_COLORS[wingCode] || colors.primary;
  const isActive = item.isActive !== false;

  return (
    <View style={styles.classCard}>
      <View style={[styles.cardAccent, {backgroundColor: accentColor}]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={[styles.classIcon, {backgroundColor: `${accentColor}15`}]}>
            <MaterialCommunityIcons name="school-outline" size={18} color={accentColor} />
          </View>
          <View style={styles.classInfo}>
            <Text style={styles.className}>{item.name}</Text>
            <View style={styles.classMeta}>
              {item.classCode ? (
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{item.classCode}</Text>
                </View>
              ) : null}
              <View style={[styles.wingBadge, {backgroundColor: `${accentColor}18`}]}>
                <Text style={[styles.wingText, {color: accentColor}]}>
                  {item.wing?.name || item.wing?.code || 'Wing'}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={[
              styles.statusDot,
              {backgroundColor: isActive ? colors.success : colors.danger},
            ]}
          />
        </View>
      </View>
    </View>
  );
};

// Stable header component — extracted so FlatList does not remount it when items load
const AcademicHeader = React.memo(({count, navigation}) => (
  <View style={styles.header}>
    <View style={styles.headerDecor} />
    <Text style={styles.headerOverline}>Principal</Text>
    <View style={styles.headerRow}>
      <Text style={styles.headerTitle}>Academic Structure</Text>
      {count > 0 ? (
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{count}</Text>
        </View>
      ) : null}
    </View>
    <Text style={styles.headerSub}>Classes, wings, and curriculum configuration</Text>
    <View style={styles.headerAction}>
      <MaterialCommunityIcons
        name="plus-circle-outline"
        size={13}
        color="rgba(255,255,255,0.75)"
      />
      <Text
        style={styles.headerActionText}
        onPress={() => navigation.navigate('CreateSection')}>
        Add Section
      </Text>
    </View>
  </View>
));

const AcademicStructureScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {items, loading} = useSelector(state => state.classes);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    dispatch(fetchClasses(user?.branchId));
  }, [dispatch, user?.branchId]);

  if (loading && items.length === 0) {
    return (
      <View style={styles.root}>
        <AcademicHeader count={0} navigation={navigation} />
        <View style={{padding: spacing.lg}}>
          <SkeletonLoader rows={6} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <AcademicHeader count={items.length} navigation={navigation} />
        }
        renderItem={({item, index}) => (
          <ClassCard item={item} index={Math.min(index, 15)} />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No classes configured"
            message="Seed the fixed class catalog before adding sections or assigning teachers."
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
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.clayDeep,
  },
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130,
  },
  headerOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  headerRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  countBadgeText: {color: colors.white, fontSize: 12, fontWeight: '800'},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 4},
  headerAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: spacing.sm,
  },
  headerActionText: {color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '700'},

  classCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.clay,
  },
  cardAccent: {width: 4},
  cardBody: {flex: 1, padding: spacing.md},
  cardTop: {alignItems: 'center', flexDirection: 'row', gap: spacing.md},
  classIcon: {
    alignItems: 'center',
    borderRadius: radius.card,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  classInfo: {flex: 1},
  className: {...typography.bodyBold, color: colors.text},
  classMeta: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginTop: 4},
  codeBadge: {
    backgroundColor: colors.background,
    borderColor: colors.borderLight,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  codeText: {color: colors.textMuted, fontSize: 9, fontWeight: '700'},
  wingBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  wingText: {fontSize: 10, fontWeight: '700'},
  statusDot: {
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
});

export default AcademicStructureScreen;
