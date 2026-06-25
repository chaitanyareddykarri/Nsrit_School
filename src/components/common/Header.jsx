import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Text} from 'react-native-paper';
import CustomButton from '../buttons/CustomButton';
import {ROLE_LABELS} from '../../config/constants';
import {switchActiveRole} from '../../store/slices/authSlice';
import {colors, spacing, typography} from '../../theme';

const RoleSwitch = () => {
  const dispatch = useDispatch();
  const {role, user, loading} = useSelector(state => state.auth);
  const roles = (user?.roles || []).filter(item => item && item !== role);

  if (!roles.length) {
    return null;
  }

  return (
    <View style={styles.switchContainer}>
      <Text style={styles.switchLabel}>Switch Role</Text>
      <View style={styles.switchRow}>
        {roles.map(item => (
          <CustomButton
            key={item}
            compact
            disabled={loading}
            mode="outlined"
            onPress={() => dispatch(switchActiveRole(item))}>
            {ROLE_LABELS[item] || item}
          </CustomButton>
        ))}
      </View>
    </View>
  );
};

const Header = ({title, subtitle, actionLabel, onAction}) => (
  <View style={styles.headerBlock}>
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel ? (
        <CustomButton compact mode="outlined" onPress={onAction}>
          {actionLabel}
        </CustomButton>
      ) : null}
    </View>
    <RoleSwitch />
  </View>
);

const styles = StyleSheet.create({
  headerBlock: {
    marginBottom: spacing.lg,
  },
  container: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.title,
    color: colors.text,
    flexShrink: 1,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    paddingRight: spacing.sm,
  },
  switchContainer: {
    marginTop: spacing.md,
  },
  switchLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  switchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});

export default Header;
