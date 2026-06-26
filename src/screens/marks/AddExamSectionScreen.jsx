import React, {useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import classService from '../../services/classes/classService';
import sectionService from '../../services/sections/sectionService';
import examService from '../../services/marks/examService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const AddExamSectionScreen = ({navigation, route}) => {
  const {examId, branchId, existingSectionIds = [], examName} = route.params || {};
  const insets = useSafeAreaInsets();
  const user = useSelector(state => state.auth.user);

  const [selectedClass, setSelectedClass] = useState(null);
  const [adding, setAdding] = useState(null);

  const classesQuery = useQuery({
    queryKey: ['classes', branchId],
    queryFn: () => classService.getClasses(branchId || user?.branchId),
    enabled: true,
  });

  const sectionsQuery = useQuery({
    queryKey: ['sectionsByClass', selectedClass?.id],
    queryFn: () => sectionService.getSectionsByClass(selectedClass?.id),
    enabled: Boolean(selectedClass?.id),
  });

  const classes = classesQuery.data || [];
  const sections = useMemo(
    () => (sectionsQuery.data || []).filter(s => s.isActive !== false),
    [sectionsQuery.data],
  );

  const handleAddSection = async section => {
    if (adding) return;
    try {
      setAdding(section.id);
      await examService.addSectionToExam(
        examId,
        section.id,
        selectedClass.id,
        branchId || user?.branchId,
        examName,
        user?.id,
      );
      Toast.show({type: 'success', text1: `${selectedClass.name} — ${section.name} added`});
      navigation.goBack();
    } catch (err) {
      Toast.show({type: 'error', text1: err.message || 'Failed to add section'});
    } finally {
      setAdding(null);
    }
  };

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => {
            if (selectedClass) {
              setSelectedClass(null);
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>
          {selectedClass ? `${selectedClass.name} — Pick Section` : 'Pick a Class'}
        </Text>
        <View style={{width: 36}} />
      </View>

      {/* Class list */}
      {!selectedClass && (
        classesQuery.isLoading ? (
          <View style={styles.centred}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : classes.length === 0 ? (
          <View style={styles.centred}>
            <Text style={styles.emptyText}>No classes found for this branch.</Text>
          </View>
        ) : (
          <FlatList
            data={classes}
            keyExtractor={c => c.id}
            contentContainerStyle={styles.list}
            renderItem={({item}) => (
              <Pressable
                onPress={() => setSelectedClass(item)}
                style={({pressed}) => [styles.card, pressed && {opacity: 0.8}]}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSoft} />
              </Pressable>
            )}
          />
        )
      )}

      {/* Section list */}
      {selectedClass && (
        sectionsQuery.isLoading ? (
          <View style={styles.centred}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : sections.length === 0 ? (
          <View style={styles.centred}>
            <Text style={styles.emptyText}>No sections found for {selectedClass.name}.</Text>
          </View>
        ) : (
          <FlatList
            data={sections}
            keyExtractor={s => s.id}
            contentContainerStyle={styles.list}
            renderItem={({item}) => {
              const alreadyAdded = existingSectionIds.includes(item.id);
              return (
                <Pressable
                  onPress={() => !alreadyAdded && handleAddSection(item)}
                  disabled={alreadyAdded || Boolean(adding)}
                  style={({pressed}) => [
                    styles.card,
                    alreadyAdded && styles.cardDisabled,
                    pressed && !alreadyAdded && {opacity: 0.8},
                  ]}>
                  <View style={styles.cardLeft}>
                    <Text style={[styles.cardTitle, alreadyAdded && styles.cardTitleMuted]}>
                      {selectedClass.name} — Section {item.name}
                    </Text>
                    {alreadyAdded && (
                      <Text style={styles.addedLabel}>Already added</Text>
                    )}
                  </View>
                  {adding === item.id ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : alreadyAdded ? (
                    <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
                  ) : (
                    <MaterialCommunityIcons name="plus-circle-outline" size={20} color={colors.primary} />
                  )}
                </Pressable>
              );
            }}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  topBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backBtn: {padding: 4},
  topTitle: {...typography.heading, color: colors.text, fontSize: 16},
  centred: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl},
  emptyText: {...typography.body, color: colors.textMuted, textAlign: 'center'},
  list: {padding: spacing.lg, gap: spacing.sm},
  card: {
    ...shadows.clay,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  cardDisabled: {backgroundColor: colors.surfaceAlt, borderColor: colors.borderLight},
  cardLeft: {flex: 1},
  cardTitle: {...typography.body, color: colors.text, fontWeight: '600', fontSize: 15},
  cardTitleMuted: {color: colors.textMuted},
  addedLabel: {...typography.caption, color: colors.success, marginTop: 2, fontWeight: '600'},
});

export default AddExamSectionScreen;
