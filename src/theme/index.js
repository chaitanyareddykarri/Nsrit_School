import {MD3LightTheme} from 'react-native-paper';
import animations from './animations';
import colors from './colors';
import globalStyles from './globalStyles';
import gradients from './gradients';
import radius from './radius';
import shadows from './shadows';
import spacing from './spacing';
import typography from './typography';

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary:            colors.primary,
    secondary:          colors.secondary,
    background:         colors.background,
    surface:            colors.surface,
    error:              colors.danger,
    outline:            colors.border,
    outlineVariant:     colors.borderLight,
    onSurface:          colors.text,
    onSurfaceVariant:   colors.textMuted,
    onPrimary:          colors.white,
    surfaceVariant:     colors.surfaceAlt,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: colors.surface,
      level2: colors.surfaceAlt,
    },
  },
  roundness: radius.card,
};

export {animations, colors, globalStyles, gradients, radius, shadows, spacing, typography};
