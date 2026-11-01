import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // New Travellin Teal Design System
  primary: '#0D9488',         // Main Teal
  primaryDark: '#134E4A',     // Dark Teal
  primaryLight: '#E6F4F2',    // Soft Teal tint (for chips, badges)
  primaryMuted: '#CCFBF1',    // Light mint teal
  secondary: '#134E4A',       // Dark Teal
  secondaryDark: '#0B2E2C',
  secondaryLight: '#E6F4F2',
  accent: '#0D9488',
  accentDark: '#134E4A',

  // Surfaces & Backgrounds
  background: '#F5FAF9',      // Fresh light teal-tinted ground
  backgroundSecondary: '#FFFFFF',
  surface: '#FFFFFF',         // Card white
  canvas: '#FFFFFF',
  card: '#FFFFFF',
  soft: '#E6F4F2',            // Soft teal pill fill
  veryLightGray: '#F5FAF9',
  lightGray: '#E2EEEC',
  hairline: '#E2EEEC',        // Subtle border
  border: '#E2EEEC',

  // Text Hierarchy
  text: '#153B3A',            // Primary deep dark teal
  charcoal: '#153B3A',
  ink: '#153B3A',
  textSecondary: '#64748B',   // Muted slate
  slate: '#64748B',
  textLight: '#94A3B8',
  gray: '#64748B',

  // Rating & Status
  rating: '#F59E0B',          // Warm Amber gold for stars
  gold: '#F59E0B',
  amber: '#F59E0B',
  liveRed: '#EF4444',
  urgent: '#EF4444',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#0D9488',

  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  dark: '#153B3A',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.45)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
};

// Default avatar URL
export const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';

export const SIZES = {
  // App dimensions
  width,
  height,

  // Font sizes
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  body1: 16,
  body2: 14,
  body3: 12,
  body4: 10,
  caption: 12,

  // Spacing (consistent 8px system)
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  huge: 32,

  // Border radius scale (Soft 16-24px curves)
  radiusXs: 4,
  radiusSm: 8,
  radiusMd: 14,
  radiusLg: 18,
  radiusXl: 24,
  radiusFull: 9999,

  // Aliases for compatibility
  radius: 16,
  cardRadius: 20,

  // Icon sizes
  iconSm: 16,
  iconMd: 22,
  iconLg: 28,
  iconXl: 36,

  // Button sizes
  buttonHeight: 46,
  buttonHeightSm: 34,
  buttonHeightLg: 52,

  // Input sizes
  inputHeight: 46,

  // Card sizes
  cardPadding: 14,
};

export const FONTS = {
  regular: {
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto', default: 'Roboto' }),
    fontWeight: '400' as '400',
  },
  medium: {
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto', default: 'Roboto' }),
    fontWeight: '500' as '500',
  },
  semiBold: {
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto', default: 'Roboto' }),
    fontWeight: '600' as '600',
  },
  bold: {
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto', default: 'Roboto' }),
    fontWeight: '700' as '700',
  },
  extraBold: {
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto', default: 'Roboto' }),
    fontWeight: '800' as '800',
  },
  black: {
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto', default: 'Roboto' }),
    fontWeight: '900' as '900',
  },
  eyebrow: {
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto', default: 'Roboto' }),
    fontWeight: '600' as '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase' as 'uppercase',
  },
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  light: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  heavy: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const ANIMATIONS = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export default {
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
  ANIMATIONS,
};


