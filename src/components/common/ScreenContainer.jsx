import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing} from '../../theme';

/**
 * ScreenContainer — scrollable or static screen wrapper.
 * Automatically pads the bottom of scroll content so items are never
 * hidden behind the home indicator or gesture bar on any device.
 * Use inside screens that already have a React Navigation header
 * (the header handles the top inset; we only need to worry about the bottom).
 */
const ScreenContainer = ({
  children,
  scroll = true,
  style,
  contentContainerStyle,
  animated,
}) => {
  const insets = useSafeAreaInsets();

  const Wrapper = scroll ? ScrollView : View;

  return (
    <Wrapper
      keyboardShouldPersistTaps={scroll ? 'handled' : undefined}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={
        scroll
          ? [
              styles.scrollContent,
              {paddingBottom: Math.max(spacing.xxxl + spacing.xl, insets.bottom + spacing.xl)},
              contentContainerStyle,
            ]
          : undefined
      }
      style={[styles.container, style]}>
      {children}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
});

export default ScreenContainer;
