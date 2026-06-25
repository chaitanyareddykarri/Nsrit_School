import React, {useState} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {useDispatch} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {logoutUser} from '../../store/slices/authSlice';
import {colors, radius} from '../../theme';
import {ConfirmationModal} from '../feedback/FeedbackModals';

const LogoutButton = ({style, color = colors.white, size = 18}) => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);

  const handleLogoutPress = () => {
    setVisible(true);
  };

  return (
    <>
      <Pressable
        onPress={handleLogoutPress}
        style={({pressed}) => [
          styles.btn,
          pressed && styles.pressed,
          style,
        ]}
        hitSlop={6}>
        <MaterialCommunityIcons name="logout-variant" size={size} color={color} />
      </Pressable>

      <ConfirmationModal
        visible={visible}
        title="Logout"
        message="Are you sure you want to log out of NSRIT Connect?"
        confirmLabel="Logout"
        cancelLabel="Stay Logged In"
        isDestructive
        onConfirm={() => {
          setVisible(false);
          dispatch(logoutUser());
        }}
        onCancel={() => setVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    height: 36,
    width: 36,
  },
  pressed: {
    opacity: 0.75,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
});

export default LogoutButton;
