import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../../theme';

/**
 * ScreenWrapper — SafeAreaView wrapper for screens that manage their own
 * layout (headerShown:false, custom headers, modals).
 * StatusBar is managed globally in App.jsx — do not add it here.
 */
const ScreenWrapper = ({
  children,
  style,
  edges = ['top', 'bottom', 'left', 'right'],
}) => (
  <SafeAreaView edges={edges} style={[styles.container, style]}>
    {children}
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default ScreenWrapper;
