import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, spacing} from '../../theme';
import RoleSwitcherModal from './RoleSwitcherModal';

export const RoleBadge = ({label, style, textColor = 'rgba(255,255,255,0.85)'}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable 
        onPress={() => setVisible(true)} 
        style={({pressed}) => [
          styles.badge,
          pressed && styles.pressed,
          style
        ]}
        hitSlop={8}
      >
        <View style={styles.badgeDot} />
        <Text style={[styles.badgeText, {color: textColor}]}>{label}</Text>
        <MaterialCommunityIcons 
          name="swap-horizontal" 
          size={12} 
          color={textColor} 
          style={styles.swapIcon} 
        />
      </Pressable>

      <RoleSwitcherModal 
        visible={visible} 
        onClose={() => setVisible(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.75,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  badgeDot: {
    backgroundColor: colors.success,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  swapIcon: {
    opacity: 0.8,
  },
});

export default RoleBadge;
