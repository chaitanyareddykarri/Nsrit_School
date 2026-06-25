import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {colors, radius, spacing} from '../../theme';

const SkeletonLoader = ({rows = 3}) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          duration: 700,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          duration: 700,
          toValue: 0.4,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <View>
      {Array.from({length: rows}).map((_, index) => (
        <Animated.View key={String(index)} style={[styles.card, {opacity}]}>
          <View style={styles.avatar} />
          <View style={styles.copy}>
            <View style={styles.lineLong} />
            <View style={styles.lineShort} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    flexDirection: 'row',
    height: 72,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  avatar: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 40,
    marginRight: spacing.md,
    width: 40,
  },
  copy: {
    flex: 1,
    gap: spacing.sm,
  },
  lineLong: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 12,
    width: '72%',
  },
  lineShort: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 10,
    width: '42%',
  },
});

export default SkeletonLoader;
