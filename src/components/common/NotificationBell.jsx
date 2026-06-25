import React, {useEffect} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing} from '../../theme';

const NotificationBell = ({count = 0, onPress, color = colors.primary}) => {
  const rotate = useSharedValue(0);
  const badgeScale = useSharedValue(count > 0 ? 1 : 0);

  useEffect(() => {
    if (count > 0) {
      rotate.value = withSequence(
        withTiming(-12, {duration: 80}),
        withTiming(12, {duration: 80}),
        withTiming(-8, {duration: 60}),
        withTiming(8, {duration: 60}),
        withTiming(0, {duration: 60}),
      );
      badgeScale.value = withSequence(
        withTiming(1.3, {duration: 150}),
        withTiming(1, {duration: 120}),
      );
    } else {
      badgeScale.value = withTiming(0, {duration: 150});
    }
  }, [count, rotate, badgeScale]);

  const bellStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotate.value}deg`}]}));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{scale: badgeScale.value}]}));

  return (
    <Pressable onPress={onPress} style={styles.wrapper} hitSlop={8}>
      <Animated.View style={bellStyle}>
        <View style={[styles.iconWrap, {backgroundColor: `${color}13`}]}>
          <MaterialCommunityIcons name="bell-outline" size={20} color={color} />
        </View>
      </Animated.View>

      {count > 0 ? (
        <Animated.View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </Animated.View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative'},
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 40,
    justifyContent: 'center',
    width: 40},
  badge: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    justifyContent: 'center',
    minWidth: 18,
    paddingHorizontal: 4,
    position: 'absolute',
    right: 0,
    top: 0},
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 16}});

export default NotificationBell;
