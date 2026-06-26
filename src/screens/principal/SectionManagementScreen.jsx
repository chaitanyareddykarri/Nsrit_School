import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {EmptyState, SkeletonLoader} from '../../components';
import academicRepository from '../../repositories/academicRepository';
import sectionService from '../../services/sections/sectionService';
import {getAccessScope} from '../../services/rbacScope';
import CreateSectionModal from './CreateSectionModal';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import academicYearService from '../../services/academicYear/academicYearService';

const SectionCard = ({item, index, studentCount, onPress}) => (
  <Animated.View>
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.sectionCard, pressed && {opacity: 0.88}]}>
      <View style={styles.cardLeft}>
        <View style={styles.sectionIconWrap}>
          <MaterialCommunityIcons name="google-classroom" size={18} color={colors.primary} />
        </View>
        <View style={styles.sectionInfo}>
          <Text style={styles.sectionTitle}>
            {item.academicClass?.name || 'Class'}–{item.name}
          </Text>
          <Text style={styles.teacherText} numberOfLines={1}>
            {item.classTeacher?.fullName || 'No class teacher assigned'}
          </Text>
        </View>
      </View>
      <View style={styles.countWrap}>
        <Text style={styles.countValue}>{studentCount}</Text>
        <Text style={styles.countLabel}>students</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  </Animated.View>
);

const SectionManagementScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const academicYear = academicYearService.getCurrentStartYear(user?.branchId);

  const classesQuery = useQuery({
    queryKey: ['activeAcademicClasses', user?.branchId],
    queryFn: () => academicRepository.getActiveAcademicClasses()});
  const branchClasses = useMemo(
    () => (classesQuery.data || []).filter(c => c.branchId === user?.branchId),
    [classesQuery.data, user?.branchId],
  );
  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () =>
      sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId)});

  const mutation = useMutation({
    mutationFn: payload =>
      sectionService.createSection(
        {
          branchId: user.branchId,
          academicClassId: payload.academicClassId,
          wingId: payload.wingId,
          name: payload.name,
          academicYear: Number(payload.academicYear),
          wing: payload.wing,
          className: payload.className},
        scope,
      ),
    onSuccess: () => {
      setModalVisible(false);
      queryClient.invalidateQueries({queryKey: ['sections', user?.branchId, academicYear]});
    }});

  const studentCounts = useMemo(() => {
    const counts = {};
    (sectionsQuery.data?.students || []).forEach(student => {
      counts[student.sectionId] = (counts[student.sectionId] || 0) + 1;
    });
    return counts;
  }, [sectionsQuery.data?.students]);

  const sections = sectionsQuery.data?.sections || [];

  return (
    <View style={styles.root}>
      <FlatList
        data={sections}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Animated.View
            style={styles.header}>
            <View style={styles.headerDecor} />
            <Text style={styles.headerOverline}>Principal</Text>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Sections</Text>
              {sections.length > 0 ? (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{sections.length}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.headerSub}>{academicYear} academic year</Text>
            <Pressable
              onPress={() => setModalVisible(true)}
              style={styles.headerCta}>
              <MaterialCommunityIcons name="plus" size={14} color={colors.primary} />
              <Text style={styles.headerCtaText}>Create Section</Text>
            </Pressable>
          </Animated.View>
        }
        renderItem={({item, index}) => (
          <SectionCard
            item={item}
            index={Math.min(index, 15)}
            studentCount={studentCounts[item.id] || 0}
            onPress={() => navigation.navigate('SectionDetails', {section: item, studentCount: studentCounts[item.id] || 0})}
          />
        )}
        ListEmptyComponent={
          sectionsQuery.isLoading ? (
            <SkeletonLoader rows={4} />
          ) : (
            <EmptyState
              title="No sections"
              message="Create yearly sections under the fixed class list."
            />
          )
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />

      <CreateSectionModal
        visible={modalVisible}
        classes={branchClasses}
        existingSections={sections}
        onDismiss={() => setModalVisible(false)}
        onSubmit={payload => mutation.mutate(payload)}
        loading={mutation.isPending}
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

  sectionCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.clay},
  cardLeft: {alignItems: 'center', flex: 1, flexDirection: 'row', gap: spacing.md},
  sectionIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.card,
    height: 40,
    justifyContent: 'center',
    width: 40},
  sectionInfo: {flex: 1, minWidth: 0},
  sectionTitle: {...typography.bodyBold, color: colors.text},
  teacherText: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  countWrap: {alignItems: 'center'},
  countValue: {color: colors.primary, fontSize: 18, fontWeight: '800'},
  countLabel: {color: colors.textMuted, fontSize: 10, fontWeight: '600'}});

export default SectionManagementScreen;
