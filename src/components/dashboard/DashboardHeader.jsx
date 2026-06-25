import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {ROLE_LABELS} from '../../config/constants';
import {switchActiveRole} from '../../store/slices/authSlice';
import CustomButton from '../buttons/CustomButton';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) {return 'Good morning';}
  if (h < 17) {return 'Good afternoon';}
  return 'Good evening';
};

const getInitials = name => {
  if (!name) {return 'NS';}
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
};

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
            mode="contained-tonal"
            onPress={() => dispatch(switchActiveRole(item))}>
            {ROLE_LABELS[item] || item}
          </CustomButton>
        ))}
      </View>
    </View>
  );
};

const DashboardHeader = ({name, role, subtitle, onLogout}) => {
  const greeting = getGreeting();
  const initials = getInitials(name);
  const label = subtitle || ROLE_LABELS?.[role] || role || 'Staff';

  return (
    <View style={styles.container}>
      {/* Decorative background circles */}
      <View style={styles.decor1} />
      <View style={styles.decor2} />

      {/* Top row: avatar + logout */}
      <View style={styles.topRow}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>{label}</Text>
        </View>

        {onLogout ? (
          <Pressable onPress={onLogout} style={styles.logoutBtn} hitSlop={8}>
            <MaterialCommunityIcons
              name="logout-variant"
              size={18}
              color="rgba(255,255,255,0.85)"
            />
          </Pressable>
        ) : null}
      </View>

      {/* Greeting + name */}
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.name} numberOfLines={1}>
        {name || label}
      </Text>

      {/* Date strip */}
      <View style={styles.dateStrip}>
        <MaterialCommunityIcons
          name="calendar-today"
          size={11}
          color="rgba(255,255,255,0.6)"
        />
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </View>

      <RoleSwitch />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...shadows.clayDeep,
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    padding: spacing.xl,
    paddingBottom: spacing.xl,
  },
  // Decorative background shapes
  decor1: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 80,
    height: 160,
    position: 'absolute',
    right: -30,
    top: -50,
    width: 160,
  },
  decor2: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 60,
    bottom: -30,
    height: 100,
    left: -20,
    position: 'absolute',
    width: 100,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 44,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 44,
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  badge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  badgeDot: {
    backgroundColor: colors.success,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  badgeText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  logoutBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    marginLeft: spacing.sm,
    width: 36,
  },
  greeting: {
    ...typography.overline,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 2,
  },
  name: {
    ...typography.title,
    color: colors.white,
    marginBottom: spacing.md,
  },
  dateStrip: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  dateText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '600',
  },
  switchContainer: {
    marginTop: spacing.lg,
  },
  switchLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.78)',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  switchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});

export default DashboardHeader;
