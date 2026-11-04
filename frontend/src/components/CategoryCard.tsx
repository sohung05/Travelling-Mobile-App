import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { DestinationCategory } from '../types';

interface CategoryCardProps {
  category: DestinationCategory;
  imageUrl?: string;
  onPress: () => void;
  isSelected?: boolean;
  index?: number;
}

const CATEGORY_NAMES: Record<DestinationCategory, string> = {
  Beach: 'Beaches',
  Nature: 'Nature',
  Cultural: 'Culture',
  Entertainment: 'Adventure',
  Luxury: 'Luxury',
};

const CATEGORY_ICONS: Record<DestinationCategory, keyof typeof Ionicons.glyphMap> = {
  Beach: 'umbrella-outline',
  Nature: 'leaf-outline',
  Cultural: 'business-outline',
  Entertainment: 'compass-outline',
  Luxury: 'diamond-outline',
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  isSelected = false,
}) => {
  const iconName = CATEGORY_ICONS[category] || 'globe-outline';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.chip,
          isSelected && styles.selectedChip,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons
          name={iconName}
          size={16}
          color={isSelected ? COLORS.white : COLORS.primary}
          style={styles.icon}
        />
        <Text style={[styles.text, isSelected && styles.selectedText]}>
          {CATEGORY_NAMES[category] || category}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: '#D4EBE7',
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.light,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    ...FONTS.semiBold,
    fontSize: 13,
    color: COLORS.primaryDark,
  },
  selectedText: {
    color: COLORS.white,
    ...FONTS.bold,
  },
});

export default CategoryCard;
