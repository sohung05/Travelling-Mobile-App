import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { COLORS, SIZES, FONTS, SHADOWS, CATEGORY_NAMES } from '../constants';
import { Destination, DestinationCategory } from '../types';
import { useDarkMode } from '../contexts/DarkModeContext';

export type LocationScope = 'all' | 'domestic' | 'international';

export interface FilterOptions {
  priceRange: {
    min: number;
    max: number;
  };
  locationScope: LocationScope;
  ratingRange: {
    min: number;
    max: number;
  };
  category: string | null;
}

// Mapping từ category gốc trong MongoDB sang nhóm lọc chính
const CATEGORY_GROUP_MAP: Record<string, string> = {
  'Beach': 'Beach',
  'Nature': 'Nature',
  'Cultural': 'Cultural',
  'Entertainment': 'Entertainment',
  'Luxury': 'Luxury',
  'Nature & Beach': 'Beach',
  'Entertainment & Sightseeing': 'Entertainment',
  'Mountain & Nature': 'Nature',
  'Nature & Culture': 'Nature',
  'Adventure & Nature': 'Nature',
  'Nature & Heritage': 'Nature',
  'Culture & Mountain': 'Cultural',
  'Nature & Relaxation': 'Nature',
  'Culture & Nature': 'Cultural',
  'Spiritual & Heritage': 'Cultural',
  'Luxury Cruise & Culture': 'Luxury',
  'Culture & City': 'Cultural',
  'History & Culture': 'Cultural',
  'Culture & Scenic Tour': 'Cultural',
  'Winter & Culture': 'Cultural',
  'Family & Entertainment': 'Entertainment',
  'Culture & Entertainment': 'Entertainment',
  'Culture & Winter Activities': 'Cultural',
  'History & River Cruise': 'Cultural',
  'City & Coast': 'Entertainment',
};

// Map a raw MongoDB category to one of the 5 filter groups
export const getCategoryGroup = (rawCategory: string | undefined | null): string | null => {
  if (!rawCategory) return null;
  // Direct lookup
  if (CATEGORY_GROUP_MAP[rawCategory]) return CATEGORY_GROUP_MAP[rawCategory];
  // Fallback: partial keyword matching
  const lower = rawCategory.toLowerCase();
  if (lower.includes('beach')) return 'Beach';
  if (lower.includes('nature') || lower.includes('mountain') || lower.includes('adventure')) return 'Nature';
  if (lower.includes('cultur') || lower.includes('heritage') || lower.includes('histor') || lower.includes('spiritual')) return 'Cultural';
  if (lower.includes('entertainment') || lower.includes('city') || lower.includes('family')) return 'Entertainment';
  if (lower.includes('luxury') || lower.includes('cruise')) return 'Luxury';
  return null;
};

const DEFAULT_MAX_PRICE = 70000000; // 70 triệu - bao phủ hết giá trong DB

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  destinations?: Destination[]; // dữ liệu API để tính price range động
}

const { height } = Dimensions.get('window');

const RATING_RANGES = [
  { label: 'Tất cả', min: 0, max: 5 },
  { label: '3.0+', min: 3, max: 5 },
  { label: '3.5+', min: 3.5, max: 5 },
  { label: '4.0+', min: 4, max: 5 },
  { label: '4.5+', min: 4.5, max: 5 },
  { label: '4.8+', min: 4.8, max: 5 },
];

const LOCATION_SCOPE_OPTIONS: { value: LocationScope; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'domestic', label: 'Trong nước' },
  { value: 'international', label: 'Quốc tế' },
];

const FILTER_CATEGORIES: { key: string; label: string }[] = [
  { key: 'Beach', label: 'Bãi biển' },
  { key: 'Nature', label: 'Thiên nhiên' },
  { key: 'Cultural', label: 'Văn hóa' },
  { key: 'Entertainment', label: 'Giải trí' },
  { key: 'Luxury', label: 'Sang trọng' },
];

// Format giá hiển thị
const formatPriceLabel = (price: number): string => {
  if (price >= 1000000) {
    const millions = price / 1000000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}tr ₫`;
  }
  if (price >= 100000) {
    return `${new Intl.NumberFormat('vi-VN').format(price)} ₫`;
  }
  return `$${price.toLocaleString('en-US')}`;
};

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
  destinations = [],
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const { isDarkMode, colors } = useDarkMode();

  // Tính toán price range động từ dữ liệu API
  const priceStats = useMemo(() => {
    if (!destinations || destinations.length === 0) {
      return { max: DEFAULT_MAX_PRICE, step: 100000 };
    }
    const prices = destinations
      .map(d => {
        const p = typeof d.price === 'number' ? d.price : Number(String(d.price ?? '').replace(/[^0-9.-]/g, ''));
        return Number.isFinite(p) ? p : 0;
      })
      .filter(p => p > 0);
    if (prices.length === 0) return { max: DEFAULT_MAX_PRICE, step: 100000 };
    const maxPrice = Math.max(...prices);
    // Làm tròn lên đến bội số đẹp
    const roundedMax = Math.ceil(maxPrice / 1000000) * 1000000;
    const step = roundedMax > 10000000 ? 500000 : (roundedMax > 1000000 ? 100000 : 50);
    return { max: roundedMax, step };
  }, [destinations]);

  const handlePriceRangeChange = (values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: { min: values[0], max: values[1] },
    }));
  };

  const handleLocationScopeSelect = (scope: LocationScope) => {
    setFilters((prev) => ({
      ...prev,
      locationScope: scope,
    }));
  };

  const handleRatingSelect = (min: number, max: number) => {
    setFilters((prev) => ({
      ...prev,
      ratingRange:
        prev.ratingRange.min === min && prev.ratingRange.max === max
          ? { min: 0, max: 5 }
          : { min, max },
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      priceRange: { min: 0, max: priceStats.max },
      locationScope: 'all',
      ratingRange: { min: 0, max: 5 },
      category: null,
    };
    setFilters(resetFilters);
  };

  const isRatingSelected = (min: number, max: number) => {
    return filters.ratingRange.min === min && filters.ratingRange.max === max;
  };

  const handleCategoryToggle = (categoryKey: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === categoryKey ? null : categoryKey,
    }));
  };

  const isCategorySelected = (categoryKey: string) => {
    return filters.category === categoryKey;
  };

  // Đếm số destination trong mỗi nhóm category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    destinations.forEach(d => {
      const group = getCategoryGroup(d.category);
      if (group) counts[group] = (counts[group] || 0) + 1;
    });
    return counts;
  }, [destinations]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.modalContainer, {
            backgroundColor: isDarkMode ? colors.card : COLORS.white,
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: colors.border,
          }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag Handle Indicator */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <Ionicons name="options-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Bộ lọc tìm kiếm</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Price Range */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Khoảng giá</Text>
              <View style={styles.priceSliderContainer}>
                <MultiSlider
                  values={[
                    Math.min(filters.priceRange.min, priceStats.max),
                    Math.min(filters.priceRange.max, priceStats.max) || priceStats.max,
                  ]}
                  sliderLength={320}
                  onValuesChange={handlePriceRangeChange}
                  min={0}
                  max={priceStats.max}
                  step={priceStats.step}
                  allowOverlap={false}
                  snapped
                  selectedStyle={styles.sliderSelected}
                  unselectedStyle={styles.sliderUnselected}
                  containerStyle={styles.sliderContainer}
                  trackStyle={styles.sliderTrack}
                  markerStyle={styles.sliderMarker}
                  pressedMarkerStyle={styles.sliderMarkerPressed}
                  customMarker={() => (
                    <View style={styles.sliderMarker}>
                      <View style={styles.sliderMarkerInner} />
                    </View>
                  )}
                />
                <View style={styles.priceLabels}>
                  <Text style={styles.priceLabelMin}>{formatPriceLabel(filters.priceRange.min)}</Text>
                  <Text style={styles.priceLabelMax}>{formatPriceLabel(Math.min(filters.priceRange.max, priceStats.max) || priceStats.max)}</Text>
                </View>
              </View>
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Danh mục</Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    !filters.category && styles.selectedOption,
                    isDarkMode && !filters.category ? null : isDarkMode ? {
                      backgroundColor: colors.soft,
                      borderColor: colors.border,
                    } : null,
                  ]}
                  onPress={() => setFilters((prev) => ({ ...prev, category: null }))}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      !filters.category && styles.selectedOptionText,
                      isDarkMode && !filters.category
                        ? { color: COLORS.white }
                        : isDarkMode
                          ? { color: colors.text }
                          : null,
                    ]}
                  >
                    Tất cả
                  </Text>
                </TouchableOpacity>
                {FILTER_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.optionButton,
                      isCategorySelected(cat.key) && styles.selectedOption,
                      isDarkMode && !isCategorySelected(cat.key) ? {
                        backgroundColor: colors.soft,
                        borderColor: colors.border,
                      } : null,
                    ]}
                    onPress={() => handleCategoryToggle(cat.key)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isCategorySelected(cat.key) && styles.selectedOptionText,
                          isDarkMode && !isCategorySelected(cat.key) ? { color: colors.text } : null,
                      ]}
                    >
                      {cat.label}{categoryCounts[cat.key] ? ` (${categoryCounts[cat.key]})` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location Scope */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Khu vực</Text>
              <View style={styles.optionsContainer}>
                {LOCATION_SCOPE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      filters.locationScope === option.value && styles.selectedOption,
                      isDarkMode && filters.locationScope !== option.value ? {
                        backgroundColor: colors.soft,
                        borderColor: colors.border,
                      } : null,
                    ]}
                    onPress={() => handleLocationScopeSelect(option.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        filters.locationScope === option.value && styles.selectedOptionText,
                        isDarkMode && filters.locationScope !== option.value ? { color: colors.text } : null,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rating */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Đánh giá</Text>
              <View style={styles.optionsContainer}>
                {RATING_RANGES.map((ratingRange, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      isRatingSelected(ratingRange.min, ratingRange.max) &&
                        styles.selectedOption,
                      isDarkMode && !isRatingSelected(ratingRange.min, ratingRange.max) ? {
                        backgroundColor: colors.soft,
                        borderColor: colors.border,
                      } : null,
                    ]}
                    onPress={() => handleRatingSelect(ratingRange.min, ratingRange.max)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.ratingOption}>
                      <Ionicons name="star" size={16} color={COLORS.rating} />
                      <Text
                        style={[
                          styles.optionText,
                          isRatingSelected(ratingRange.min, ratingRange.max) &&
                            styles.selectedOptionText,
                          isDarkMode && !isRatingSelected(ratingRange.min, ratingRange.max)
                            ? { color: colors.text }
                            : null,
                        ]}
                      >
                        {ratingRange.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bottom Spacing */}
            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={[styles.footer, {
            backgroundColor: isDarkMode ? colors.card : COLORS.white,
            borderTopColor: colors.border,
          }]}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonText}>Đặt lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.7}
            >
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: height * 0.85,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    ...SHADOWS.heavy,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.hairline,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.ink,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.md,
  },
  section: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.caption,
    color: COLORS.slate,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: SIZES.sm,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  optionButton: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 9,
    borderRadius: SIZES.radiusFull,
    backgroundColor: '#E6F4F2',
    borderWidth: 1,
    borderColor: '#D1EAE6',
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    ...FONTS.medium,
    fontSize: SIZES.body2,
    color: COLORS.ink,
  },
  selectedOptionText: {
    color: COLORS.white,
    ...FONTS.bold,
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  priceSliderContainer: {
    paddingHorizontal: SIZES.xs,
    paddingTop: SIZES.xs,
  },
  sliderContainer: {
    height: 30,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.hairline,
  },
  sliderSelected: {
    backgroundColor: COLORS.primary,
  },
  sliderUnselected: {
    backgroundColor: COLORS.hairline,
  },
  sliderMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  sliderMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  sliderMarkerPressed: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.xs,
  },
  priceLabelMin: {
    ...FONTS.bold,
    fontSize: SIZES.body2,
    color: COLORS.ink,
  },
  priceLabelMax: {
    ...FONTS.bold,
    fontSize: SIZES.body2,
    color: COLORS.ink,
  },
  priceRangeMax: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.slate,
    textAlign: 'right',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    gap: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.hairline,
    backgroundColor: COLORS.white,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.soft,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.body1,
    color: COLORS.charcoal,
  },
  applyButton: {
    flex: 1.4,
    paddingVertical: 14,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  applyButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.body1,
    color: COLORS.white,
  },
});
