import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'darkPill';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[`${size}Button`],
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.buttonText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'text' ? COLORS.primary : COLORS.white}
          size="small"
        />
      ) : (
        <>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={textStyleCombined}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radiusLg, // 18px pill from DESIGN.md
    paddingHorizontal: SIZES.xl,
    gap: SIZES.sm,
  },
  iconWrapper: {
    marginRight: 2,
  },
  // Variants
  primary: {
    backgroundColor: COLORS.primary, // Teal #0D9488
    ...SHADOWS.light,
  },
  darkPill: {
    backgroundColor: COLORS.primaryDark, // #134E4A
    ...SHADOWS.light,
  },
  secondary: {
    backgroundColor: COLORS.primaryLight, // Soft teal #E6F4F2
    borderWidth: 1,
    borderColor: '#D4EBE7',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: SIZES.sm,
  },
  // Sizes
  smallButton: {
    height: SIZES.buttonHeightSm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusFull,
  },
  mediumButton: {
    height: 50,
    borderRadius: SIZES.radiusFull,
  },
  largeButton: {
    height: 54,
    borderRadius: SIZES.radiusFull,
  },
  // Text styles
  buttonText: {
    ...FONTS.bold,
    fontSize: SIZES.body2,
    letterSpacing: 0.2,
  },
  primaryText: {
    color: COLORS.white,
  },
  darkPillText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.primaryDark,
  },
  outlineText: {
    color: COLORS.primary,
  },
  textText: {
    color: COLORS.primary,
  },
  smallText: {
    fontSize: SIZES.body3,
  },
  mediumText: {
    fontSize: SIZES.body2,
  },
  largeText: {
    fontSize: SIZES.body1,
  },
  disabled: {
    opacity: 0.45,
  },
});

export default Button;
