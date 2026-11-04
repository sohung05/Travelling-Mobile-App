import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { DestinationCategory } from '../types';

export interface FilterOptions {
  priceRange: {
    min: number;
    max: number;
  };
  countries: string[];
  ratingRange: {
    min: number;
    max: number;
  };
  category: DestinationCategory | null;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const { height } = Dimensions.get('window');

const PRICE_RANGES = [
  { label: 'Dưới $500', min: 0, max: 500 },
  { label: '$500 - $1000', min: 500, max: 1000 },
  { label: '$1000 - $2000', min: 1000, max: 2000 },
  { label: 'Trên $2000', min: 2000, max: 9999 },
];

const RATING_RANGES = [
  { label: 'Tất cả', min: 0, max: 5 },
  { label: '3.0+', min: 3, max: 5 },
  { label: '3.5+', min: 3.5, max: 5 },
  { label: '4.0+', min: 4, max: 5 },
  { label: '4.5+', min: 4.5, max: 5 },
  { label: '4.8+', min: 4.8, max: 5 },
];

const COUNTRIES = [
  'France', 'Japan', 'Thailand', 'Italy', 'Spain', 'Greece',
  'Vietnam', 'Indonesia', 'Malaysia', 'Singapore', 'South Korea'
];

const ALL_COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bangladesh', 'Belarus', 'Belgium', 'Brazil', 'Bulgaria', 'Cambodia',
  'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Czech Republic', 'Denmark',
  'Egypt', 'Estonia', 'Finland', 'France', 'Georgia', 'Germany', 'Ghana', 'Greece',
  'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'South Korea', 'Kuwait',
  'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg', 'Malaysia', 'Mexico', 'Morocco',
  'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore',
  'Slovakia', 'Slovenia', 'South Africa', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland',
  'Thailand', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Vietnam', 'Yemen', 'Zimbabwe'
];

const RATINGS = [4.5, 4.0, 3.5, 3.0];


const CATEGORIES: DestinationCategory[] = [
  'Beach',
  'Nature', 
  'Cultural',
  'Entertainment',
  'Luxury'
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const [showCountryModal, setShowCountryModal] = useState(false);

  const handlePriceRangeSelect = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: { min, max }
    }));
  };

  const handlePriceRangeChange = (values: number[]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: { min: values[0], max: values[1] }
    }));
  };

  const handleCountryToggle = (country: string) => {
    setFilters(prev => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country]
    }));
  };

  const handleRatingSelect = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      ratingRange: prev.ratingRange.min === min && prev.ratingRange.max === max 
        ? { min: 0, max: 5 } 
        : { min, max }
    }));
  };


  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      priceRange: { min: 0, max: 9999 },
      countries: [],
      ratingRange: { min: 0, max: 5 },
      category: null,
    };
    setFilters(resetFilters);
  };

  const isPriceRangeSelected = (min: number, max: number) => {
    return filters.priceRange.min === min && filters.priceRange.max === max;
  };

  const isCountrySelected = (country: string) => {
    return filters.countries.includes(country);
  };

  const getSelectedOtherCountry = () => {
    return filters.countries.find(country => !COUNTRIES.includes(country));
  };

  const isRatingSelected = (min: number, max: number) => {
    return filters.ratingRange.min === min && filters.ratingRange.max === max;
  };


  const handleCategoryToggle = (category: DestinationCategory) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === category ? null : category
    }));
  };

  const isCategorySelected = (category: DestinationCategory) => {
    return filters.category === category;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable 
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag Handle Indicator */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <Ionicons name="options-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.headerTitle}>Bộ lọc tìm kiếm</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={COLORS.charcoal} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Khoảng giá</Text>
              <View style={styles.priceSliderContainer}>
                <MultiSlider
                  values={[filters.priceRange.min, filters.priceRange.max]}
                  sliderLength={320}
                  onValuesChange={handlePriceRangeChange}
                  min={0}
                  max={7000000}
                  step={50}
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
                  <Text style={styles.priceLabelMin}>${filters.priceRange.min}</Text>
                  <Text style={styles.priceLabelMax}>${filters.priceRange.max}</Text>
                </View>
              </View>
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Danh mục</Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    !filters.category && styles.selectedOption
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, category: null }))}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText,
                    !filters.category && styles.selectedOptionText
                  ]}>
                    Tất cả
                  </Text>
                </TouchableOpacity>
                {CATEGORIES.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      isCategorySelected(category) && styles.selectedOption
                    ]}
                    onPress={() => handleCategoryToggle(category)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionText,
                      isCategorySelected(category) && styles.selectedOptionText
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Countries */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quốc gia</Text>
              <TouchableOpacity style={styles.countrySelect} onPress={() => setShowCountryModal(true)}>
                <Text style={filters.countries.length > 0 ? styles.countrySelectText : styles.countrySelectPlaceholder}>
                  {filters.countries.length > 0 ? filters.countries.join(', ') : 'Select country'}
                </Text>
                <View style={styles.countrySelectIcon}>
                  <Text style={styles.chevronIcon}>▼</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Đánh giá</Text>
              <View style={styles.optionsContainer}>
                {RATING_RANGES.map((ratingRange, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      isRatingSelected(ratingRange.min, ratingRange.max) && styles.selectedOption
                    ]}
                    onPress={() => handleRatingSelect(ratingRange.min, ratingRange.max)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.ratingOption}>
                      <Ionicons name="star" size={16} color={COLORS.rating} />
                      <Text style={[
                        styles.optionText,
                        isRatingSelected(ratingRange.min, ratingRange.max) && styles.selectedOptionText
                      ]}>
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

          <View style={styles.footer}>
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

      {/* Country Selection Modal */}
      <Modal
        visible={showCountryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowCountryModal(false)}>
          <Pressable style={styles.countryModalContainer}>
            <SafeAreaView style={styles.countryModalContent} edges={['top']}>
              <View style={styles.countryModalHeader}>
                <Text style={styles.countryModalTitle}>Chọn quốc gia</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowCountryModal(false)}
                >
                  <Ionicons name="close" size={24} color={COLORS.gray} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.countryList} showsVerticalScrollIndicator={false}>
                {ALL_COUNTRIES.map((country, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.countryItem,
                      isCountrySelected(country) && styles.selectedCountryItem
                    ]}
                    onPress={() => {
                      handleCountryToggle(country);
                      setShowCountryModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.countryItemText,
                      isCountrySelected(country) && styles.selectedCountryItemText
                    ]}>
                      {country}
                    </Text>
                    {isCountrySelected(country) && (
                      <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </Modal>
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
  countrySelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: SIZES.radiusXl,
    paddingHorizontal: SIZES.md,
    paddingVertical: 12,
    backgroundColor: COLORS.soft,
  },
  countrySelectText: {
    ...FONTS.medium,
    fontSize: SIZES.body2,
    color: COLORS.ink,
    flex: 1,
  },
  countrySelectPlaceholder: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.slate,
    flex: 1,
  },
  countrySelectIcon: {
    marginLeft: SIZES.sm,
  },
  chevronIcon: {
    fontSize: 10,
    color: COLORS.slate,
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
  // Country Modal Styles
  countryModalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    height: height * 0.7,
    marginTop: 'auto',
  },
  countryModalContent: {
    flex: 1,
  },
  countryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.hairline,
  },
  countryModalTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.ink,
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.hairline,
  },
  selectedCountryItem: {
    backgroundColor: COLORS.soft,
  },
  countryItemText: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.charcoal,
  },
  selectedCountryItemText: {
    color: COLORS.primary,
    ...FONTS.bold,
  },
});
