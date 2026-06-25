import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text} from 'react-native';
import {colors, radius, shadows, spacing} from '../../theme';

const FilterTabs = ({tabs, value, onChange}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}>
    {tabs.map(tab => {
      const active = tab.value === value;
      return (
        <Pressable
          key={tab.value}
          onPress={() => onChange(tab.value)}
          style={[styles.chip, active && styles.activeChip]}>
          <Text style={[styles.text, active && styles.activeText]}>{tab.label}</Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: 2,
  },
  chip: {
    ...shadows.clayInset,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  activeChip: {
    ...shadows.clay,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  activeText: {
    color: colors.white,
  },
});

export default FilterTabs;
