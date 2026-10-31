import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  transparent?: boolean;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBackPress,
  rightIcon,
  onRightPress,
  transparent = false,
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top > 0 ? insets.top : SIZES.sm },
        transparent && styles.transparent,
        style,
      ]}
    >
      <View style={styles.content}>
        {showBack ? (
          <TouchableOpacity
            style={[styles.iconButton, !transparent && styles.backButtonLight]}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={transparent ? COLORS.white : COLORS.ink}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}

        {title && (
          <Text
            style={[
              styles.title,
              transparent && styles.titleTransparent,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}

        {rightIcon && onRightPress ? (
          <TouchableOpacity
            style={[styles.iconButton, !transparent && styles.backButtonLight]}
            onPress={onRightPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={rightIcon as any}
              size={20}
              color={transparent ? COLORS.white : COLORS.ink}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.canvas,
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.hairline,
  },
  transparent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radiusFull,
  },
  backButtonLight: {
    backgroundColor: COLORS.soft,
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.ink,
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  titleTransparent: {
    color: COLORS.white,
  },
});

export default Header;
