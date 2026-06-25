import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {colors, radius, typography} from '../../theme';

const palette = [
  colors.primarySoft,
  colors.secondarySoft,
  colors.accentSoft,
  colors.purpleSoft,
];

const Avatar = ({name = 'Student', size = 44, image}) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
  const backgroundColor = image
    ? colors.surfaceAlt
    : palette[name.length % palette.length];

  return (
    <View
      style={[
        styles.avatar,
        {
          backgroundColor,
          borderRadius: Math.min(size / 2, radius.pill),
          height: size,
          width: size,
        },
      ]}>
      <Text style={styles.initials}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '800',
  },
});

export default Avatar;
