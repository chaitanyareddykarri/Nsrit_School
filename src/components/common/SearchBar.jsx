import React from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing} from '../../theme';

const SearchBar = ({value, onChangeText, placeholder = 'Search', style}) => (
  <View style={[styles.wrap, style]}>
    <View style={styles.iconWrap}>
      <MaterialCommunityIcons name="magnify" size={18} color={colors.primary} />
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSoft}
      style={styles.input}
    />
    {value ? (
      <View style={styles.clearWrap}>
        <MaterialCommunityIcons
          name="close-circle"
          size={16}
          color={colors.textSoft}
          onPress={() => onChangeText('')}
        />
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    ...shadows.clayInset,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 2,
  },
  clearWrap: {
    padding: 2,
  },
});

export default SearchBar;
