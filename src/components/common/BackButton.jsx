import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius} from '../../theme';

const BackButton = ({onPress, style, color = colors.text}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({pressed}) => [
        styles.btn,
        pressed && styles.pressed,
        style,
      ]}
      hitSlop={8}>
      <MaterialCommunityIcons name="arrow-left" size={22} color={color} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralSoft,
    borderRadius: radius.md,
    height: 38,
    width: 38,
  },
  pressed: {
    opacity: 0.75,
    backgroundColor: colors.border,
  },
});

export default BackButton;
