export const Colors = {
  // Brand & Accents
  primary: '#1E40AF', // Deep Electric Blue
  primaryDark: '#0F172A',
  primaryLight: '#3B82F6',
  primaryMuted: '#EFF6FF',
  
  secondary: '#0EA5E9', // Ocean Cyan
  secondaryLight: '#E0F2FE',
  
  accentAI: '#7C3AED', // AI Intelligence Purple
  accentAILight: '#F5F3FF',
  accentAIBorder: '#DDD6FE',

  // Status Colors
  success: '#10B981', // Spots Available
  successLight: '#ECFDF5',
  successDark: '#047857',

  warning: '#F59E0B', // Moderate / Filling Up
  warningLight: '#FFFBEB',
  warningDark: '#B45309',

  danger: '#EF4444', // High Congestion / Full
  dangerLight: '#FEF2F2',
  dangerDark: '#B91C1C',

  // Neutrals
  white: '#FFFFFF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#2563EB',

  // Typography
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  textLink: '#2563EB',

  // Overlays
  overlay: 'rgba(15, 23, 42, 0.6)',
  cardShadow: 'rgba(15, 23, 42, 0.06)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    display: 30,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};
