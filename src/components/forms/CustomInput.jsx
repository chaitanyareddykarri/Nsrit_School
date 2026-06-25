import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const CustomInput = ({style, label, error, icon, ...props}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputWrapFocused,
          error && styles.inputWrapError,
        ]}>
        {icon ? (
          <View style={[styles.iconWrap, {backgroundColor: focused ? colors.primarySoft : colors.surfaceAlt}]}>
            <MaterialCommunityIcons
              name={icon}
              size={16}
              color={focused ? colors.primary : colors.textSoft}
            />
          </View>
        ) : null}
        <TextInput
          placeholderTextColor={colors.textSoft}
          style={styles.input}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {marginBottom: spacing.md},
  label: {
    ...typography.captionBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    ...shadows.clayInset,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1.5,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
  },
  inputWrapFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: '#60A5FA',
    shadowOpacity: 0.20,
    shadowRadius: 12,
  },
  inputWrapError: {
    borderColor: colors.danger,
    borderWidth: 2,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 32,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 32,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 14,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '600',
    marginTop: 5,
  },
});

export default CustomInput;
