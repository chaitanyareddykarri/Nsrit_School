// Blue Claymorphism — Clay Floating Shadows
// Key: Use blue-tinted shadows for the floating clay effect.
export const shadows = {
  // Subtle card lift — used for most floating cards
  clay: {
    elevation: 8,
    shadowColor: '#60A5FA',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  // Deeper lift — hero cards, stats
  clayDeep: {
    elevation: 14,
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.18,
    shadowRadius: 28,
  },
  // Pressed / inner state
  clayInset: {
    elevation: 2,
    shadowColor: '#60A5FA',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  // Modal / bottom sheet
  clayModal: {
    elevation: 24,
    shadowColor: '#1E40AF',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.12,
    shadowRadius: 32,
  },
  // FAB / action buttons
  fab: {
    elevation: 12,
    shadowColor: '#0EA5E9',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.30,
    shadowRadius: 16,
  },
  // Backward-compat aliases so existing code using shadows.soft / shadows.medium still works
  soft: {
    elevation: 4,
    shadowColor: '#60A5FA',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.10,
    shadowRadius: 14,
  },
  medium: {
    elevation: 8,
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.14,
    shadowRadius: 20,
  },
  card: {
    elevation: 6,
    shadowColor: '#60A5FA',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
};

export default shadows;
