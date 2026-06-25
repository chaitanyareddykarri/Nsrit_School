import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, shadows, spacing} from '../../../theme';

const DashboardHeader = ({
  title = 'NSRIT Connect',
  subtitle = 'Accounting Portal',
  onMenuPress,
  onNotificationPress,
  notificationCount = 3,
  userAvatar,
  userName = 'Jane Doe, CPA',
}) => {
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Pressable onPress={onMenuPress} style={styles.iconBtn} hitSlop={8}>
          <MaterialCommunityIcons name="menu" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Pressable onPress={onNotificationPress} style={styles.bellWrap} hitSlop={8}>
          <MaterialCommunityIcons name="bell-outline" size={24} color={colors.text} />
          {notificationCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          ) : null}
        </Pressable>

        <Pressable style={styles.avatarWrapper}>
          {userAvatar ? (
            <Image source={{uri: userAvatar}} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarLabel}>{initials}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...shadows.clay,
  },
  leftSection: {alignItems: 'center', flex: 1, flexDirection: 'row'},
  iconBtn: {alignItems: 'center', height: 40, justifyContent: 'center', width: 40},
  titleContainer: {marginLeft: spacing.xs},
  title: {color: colors.primary, fontSize: 16, fontWeight: '800', letterSpacing: -0.3},
  subtitle: {color: colors.textMuted, fontSize: 11, fontWeight: '500'},
  rightSection: {alignItems: 'center', flexDirection: 'row', gap: spacing.xs},
  bellWrap: {alignItems: 'center', height: 40, justifyContent: 'center', position: 'relative', width: 40},
  badge: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    minWidth: 16,
    paddingHorizontal: 2,
    position: 'absolute',
    right: 4,
    top: 4,
  },
  badgeText: {color: colors.white, fontSize: 9, fontWeight: '700'},
  avatarWrapper: {paddingRight: spacing.xs},
  avatarImage: {borderRadius: 18, height: 36, width: 36},
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  avatarLabel: {color: colors.primary, fontSize: 13, fontWeight: '800'},
});

export default DashboardHeader;
