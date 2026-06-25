// Blue Claymorphism — Gradient Definitions
// Used with react-native-linear-gradient or as fallback solid color

export const gradients = {
  // Primary hero gradient — used on dashboard headers
  sky:        ['#0EA5E9', '#38BDF8'],
  skyDeep:    ['#0284C7', '#0EA5E9', '#38BDF8'],
  skyReverse: ['#38BDF8', '#0EA5E9'],

  // Secondary / accent gradient
  ocean:      ['#2563EB', '#0EA5E9'],
  oceanDeep:  ['#1E40AF', '#2563EB', '#3B82F6'],

  // Success
  emerald:    ['#059669', '#10B981'],
  // Warning
  amber:      ['#D97706', '#F59E0B'],
  // Danger
  rose:       ['#DC2626', '#EF4444'],
  // Info / purple
  violet:     ['#7C3AED', '#8B5CF6'],
  indigo:     ['#4338CA', '#6366F1'],

  // Neutral glass — for subtler card tints
  glassBlue:  ['rgba(14,165,233,0.08)', 'rgba(56,189,248,0.04)'],
  glassSky:   ['rgba(240,248,255,0.9)', 'rgba(238,246,255,0.95)'],

  // Dark overlay for gradient headers
  headerOverlay: ['rgba(2,132,199,0.92)', 'rgba(14,165,233,0.88)'],
};

// Solid fallback colors when LinearGradient isn't available
export const gradientFallback = {
  sky:      '#0EA5E9',
  ocean:    '#2563EB',
  emerald:  '#10B981',
  amber:    '#F59E0B',
  rose:     '#EF4444',
  violet:   '#8B5CF6',
  indigo:   '#6366F1',
};

export default gradients;
