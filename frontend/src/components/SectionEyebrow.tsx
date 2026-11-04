import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';

interface SectionEyebrowProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
  badge?: string;
}

export const SectionEyebrow: React.FC<SectionEyebrowProps> = ({
  title,
  subtitle,
  actionText = 'See all',
  onActionPress,
  style,
  badge,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <View style={styles.labelWrapper}>
          <Text style={styles.eyebrowTitle} numberOfLines={1}>
            {title}
          </Text>
          {badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {onActionPress ? (
        <TouchableOpacity 
          onPress={onActionPress} 
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>{actionText}</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    marginTop: SIZES.xs,
  },
  textContainer: {
    flex: 1,
  },
  labelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  eyebrowTitle: {
    ...FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  badgeContainer: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: SIZES.radiusFull,
  },
  badgeText: {
    ...FONTS.bold,
    fontSize: SIZES.caption,
    color: COLORS.primary,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingLeft: SIZES.sm,
  },
  actionText: {
    ...FONTS.semiBold,
    fontSize: SIZES.body2,
    color: COLORS.primary,
  },
});

export default SectionEyebrow;
