import React, {useRef} from 'react';
import {Animated, Pressable, StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing} from '../../theme';

const ActionButton = ({icon = 'plus', onPress, style, accessibilityLabel}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = toValue => {
    Animated.spring(scale, {
      friction: 5,
      tension: 120,
      toValue,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.shadow, {transform: [{scale}]}, style]}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onPressIn={() => animateTo(0.94)}
        onPressOut={() => animateTo(1)}
        style={styles.button}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.white} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    ...shadows.fab,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    padding: spacing.md,
    width: 56,
  },
});

export default ActionButton;
