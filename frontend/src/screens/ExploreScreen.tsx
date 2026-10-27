import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList, Destination, DestinationCategory, SearchFilters } from '../types';
import { destinationService, userService, useDestinations } from '../api';
import { SearchBar, Loading, FilterModal, SectionEyebrow } from '../components';
import { FilterOptions } from '../components/FilterModal';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExploreScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const { isGuest, userFavorites, addFavorite, removeFavorite } = useAuth();
  
  // Sử dụng React Query hook để lấy destinations với caching
  const { data: allDestinations = [], isLoading: destinationsLoading, refetch: refetchDestinations } = useDestinations();
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    priceRange: { min: 0, max: 7000000 },
    countries: [],
    ratingRange: { min: 0, max: 5 },
    category: null,
  });


  // Update destinations từ React Query cache
  useEffect(() => {
    if (allDestinations && allDestinations.length > 0) {
      setDestinations(allDestinations);
      setLoading(false);
    } else if (!destinationsLoading) {
      setDestinations([]);
      setFilteredDestinations([]);
      setLoading(false);
    }
  }, [allDestinations, destinationsLoading]);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // React Query sẽ tự động refetch nếu data stale
      if (!destinationsLoading) {
        refetchDestinations();
      }
    }, [destinationsLoading, refetchDestinations])
  );

  useEffect(() => {
    if (destinations.length > 0) {
      applyAdvancedFilters(currentFilters);
    }
  }, [searchQuery]);

  // Apply filters when destinations are loaded
  useEffect(() => {
    if (destinations.length > 0) {
      console.log(`📊 Destinations loaded, applying filters...`);
      applyAdvancedFilters(currentFilters);
    }
  }, [destinations]);

  // Handle initial filters passed from HomeScreen
  useEffect(() => {
    if (route.params?.initialFilters) {
      console.log(`🔍 Received initialFilters from route:`, route.params.initialFilters);
      setCurrentFilters(route.params.initialFilters);
      applyAdvancedFilters(route.params.initialFilters);
    }
  }, [route.params?.initialFilters]);

  // Debug logging khi destinations thay đổi
  useEffect(() => {
    if (allDestinations && allDestinations.length > 0) {
      const firstTen = allDestinations.slice(0, 10);
      console.log(`📊 ExploreScreen - Loaded ${allDestinations.length} destinations`);
      console.log(`📊 ExploreScreen - Sample destinations:`, firstTen.slice(0, 3).map(d => ({
        name: d.name,
        category: d.category,
        images: d.images?.length || 0,
        imageUrl: d.imageUrl
      })));
      
      // Debug: Show all unique categories
      const allCategories = [...new Set(allDestinations.map(dest => dest.category))];
      console.log(`📊 ExploreScreen - All categories in data:`, allCategories);
      
      // Debug: Show sample destinations with categories
      console.log(`📊 ExploreScreen - Sample destinations with categories:`, 
        allDestinations.slice(0, 5).map(d => ({ 
          name: d.name, 
          category: d.category,
          categoryType: typeof d.category
        }))
      );
    }
  }, [allDestinations]);


  const applyAdvancedFilters = (filters: FilterOptions) => {
    setCurrentFilters(filters);
    
    // Sử dụng filters.category từ FilterModal
    const effectiveCategory = filters.category;
    
    console.log(`🔍 ApplyAdvancedFilters called with:`, {
      searchQuery,
      filtersCategory: filters.category,
      effectiveCategory,
      filters: filters
    });
    console.log(`📊 Total destinations: ${destinations.length}`);
    
    let filtered = [...destinations];

    // Nếu không có filter nào, hiển thị 10 destinations có rating cao nhất
    const hasNoFilters = !searchQuery && 
                         !effectiveCategory && 
                         filters.countries.length === 0 && 
                         filters.ratingRange.min === 0 && 
                         filters.ratingRange.max === 5 && 
                         filters.priceRange.min === 0;
    
    console.log(`🔍 Checking no filters condition:`, {
      hasNoFilters,
      searchQuery,
      effectiveCategory,
      countriesCount: filters.countries.length,
      ratingRange: filters.ratingRange,
      priceRange: filters.priceRange
    });
    
    if (hasNoFilters) {
      console.log(`📊 No filters active, showing top 10 rated destinations`);
      const topRated = [...destinations]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10);
      console.log(`📊 Top 10 rated destinations count: ${topRated.length}`);
      setFilteredDestinations(topRated);
      return;
    }

    // Debug: Log initial filtered count
    console.log(`📊 Initial filtered count: ${filtered.length}`);

    // Search query
    if (searchQuery && searchQuery.trim()) {
      filtered = filtered.filter(dest => 
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (effectiveCategory) {
      console.log(`🔍 Filtering by category: ${effectiveCategory}`);
      console.log(`📊 Before category filter: ${filtered.length} destinations`);
      
      // Debug: Show all unique categories in data
      const uniqueCategories = [...new Set(filtered.map(dest => dest.category))];
      console.log(`📊 Available categories in data:`, uniqueCategories);
      
      // Try multiple matching strategies
      filtered = filtered.filter(dest => {
        const destCategory = dest.category?.toLowerCase() || '';
        const selectedCategoryLower = effectiveCategory.toLowerCase();
        
        // Exact match
        const exactMatch = dest.category === effectiveCategory;
        // Case-insensitive match
        const caseInsensitiveMatch = destCategory === selectedCategoryLower;
        // Partial match (contains)
        const partialMatch = destCategory.includes(selectedCategoryLower) || selectedCategoryLower.includes(destCategory);
        
        const isMatch = exactMatch || caseInsensitiveMatch || partialMatch;
        
        console.log(`🔍 Checking destination: ${dest.name}, category: "${dest.category}", selected: "${effectiveCategory}", match: ${isMatch}`);
        
        return isMatch;
      });
      
      console.log(`📊 After category filter: ${filtered.length} destinations`);
      console.log(`📊 Filtered destinations:`, filtered.slice(0, 3).map(d => ({ 
        name: d.name, 
        category: d.category, 
        price: d.price,
        images: d.images?.length || 0 
      })));
    }

    // Advanced filters - chỉ áp dụng khi có filter thực sự
    console.log(`📊 Before advanced filters: ${filtered.length} destinations`);
    
    // Price filter - chỉ áp dụng khi có filter thực sự (không phải default)
    // Default max price là 7000000, nên chỉ filter khi user thay đổi
    if (filters.priceRange.min > 0 || (filters.priceRange.max < 7000000 && filters.priceRange.max !== 9999)) {
      console.log(`📊 Applying price filter: ${filters.priceRange.min} - ${filters.priceRange.max}`);
      filtered = filtered.filter(dest => 
        dest.price >= filters.priceRange.min && dest.price <= filters.priceRange.max
      );
      console.log(`📊 After price filter: ${filtered.length} destinations`);
    } else {
      console.log(`📊 Skipping price filter (default range)`);
    }

    if (filters.countries.length > 0) {
      console.log(`📊 Before countries filter: ${filtered.length} destinations`);
      filtered = filtered.filter(dest => filters.countries.includes(dest.country));
      console.log(`📊 After countries filter: ${filtered.length} destinations`);
    }

    if (filters.ratingRange.min > 0 || filters.ratingRange.max < 5) {
      console.log(`📊 Before rating filter: ${filtered.length} destinations`);
      filtered = filtered.filter(dest => 
        dest.rating >= filters.ratingRange.min && dest.rating <= filters.ratingRange.max
      );
      console.log(`📊 After rating filter: ${filtered.length} destinations`);
    }


    console.log(`📊 Final filtered results: ${filtered.length} destinations`);
    console.log(`📊 Final destinations:`, filtered.slice(0, 3).map(d => ({ 
      name: d.name, 
      category: d.category, 
      images: d.images?.length || 0,
      imageUrl: d.imageUrl 
    })));
    
    // Set filtered results
    console.log(`📊 Final filtered count: ${filtered.length}`);
    setFilteredDestinations(filtered);
  };


  const clearAllFilters = () => {
    setSearchQuery('');
    setCurrentFilters({
      priceRange: { min: 0, max: 9999 },
      countries: [],
      ratingRange: { min: 0, max: 5 },
      category: null,
    });
    const topRated = [...destinations]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10);
    setFilteredDestinations(topRated);
  };


  const handleNotificationPress = () => {
    Alert.alert(
      'Thông báo',
      'Bạn có 2 thông báo mới:\n• Điểm đến mới: "Núi Fansipan"\n• Khuyến mãi tour mùa hè!',
      [
        { text: 'Đóng', style: 'cancel' },
        { text: 'Xem chi tiết', onPress: () => {
          console.log('Navigate to notifications');
        }}
      ]
    );
  };

  const handleFavoritePress = async (destinationId: string) => {
    if (isGuest) {
      navigation.navigate('Login');
      return;
    }

    try {
      const isCurrentlyFavorite = userFavorites.some(fav => fav.id === destinationId);
      if (isCurrentlyFavorite) {
        await removeFavorite(destinationId);
      } else {
        // Find the destination to add
        const destination = destinations.find(dest => dest.id === destinationId);
        if (destination) {
          // Double check to avoid duplicate
          const alreadyExists = userFavorites.some(fav => fav.id === destinationId);
          if (!alreadyExists) {
            await addFavorite(destination);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Silently handle the error - the UI will update when state syncs
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    // Hiển thị nửa sao nếu rating từ 4.4 đến 4.8
    const hasHalfStar = rating >= 4.4 && rating < 4.9 && rating % 1 >= 0.4;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={14} color={COLORS.rating} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={14} color={COLORS.rating} />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={14} color={COLORS.rating} />
        );
      }
    }
    return stars;
  };

  // Bỏ loading spinner, hiển thị nội dung ngay lập tức

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Section Eyebrow */}
      <View style={styles.header}>
        <SectionEyebrow 
          title="Tìm kiếm điểm đến" 
          subtitle="Khám phá các hành trình tuyệt vời trên thế giới"
          style={{ paddingHorizontal: 0, marginBottom: 0 }}
        />
      </View>

      {/* Search Input Area */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={18} color={COLORS.slate} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm theo tên thành phố, quốc gia..."
            placeholderTextColor={COLORS.slate}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={COLORS.slate} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          style={styles.filterIconButton}
          activeOpacity={0.85}
        >
          <Ionicons name="options-outline" size={20} color={COLORS.canvas} />
        </TouchableOpacity>
      </View>

      {/* Results Summary */}
      {searchQuery ? (
        <View style={styles.resultsSummary}>
          <Text style={styles.resultsSummaryText}>
            Tìm thấy <Text style={{ color: COLORS.primary }}>{filteredDestinations.length}</Text> kết quả cho "{searchQuery}"
          </Text>
        </View>
      ) : null}

      {/* Fixed Title */}
      {!searchQuery && filteredDestinations.length > 0 && (
        <View style={styles.resultsTitleContainer}>
          <View style={styles.titleLeft}>
            <View style={styles.accentDot} />
            <Text style={styles.resultsTitle}>DANH SÁCH ĐIỂM ĐẾN</Text>
          </View>
          <Text style={styles.resultsCount}>
            {filteredDestinations.length} địa điểm
          </Text>
        </View>
      )}

      {/* Results List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredDestinations.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="search-outline" size={36} color={COLORS.slate} />
            </View>
            <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptyText}>
              Hãy thử tìm kiếm với từ khóa khác hoặc thiết lập lại bộ lọc để xem các gợi ý phong phú hơn.
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredDestinations.map((destination) => (
              <View
                key={destination.id}
                style={styles.listCard}
              >
                <Image
                  source={{ 
                    uri: destination.images?.[0] || 
                    destination.imageUrl || 
                    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                  }}
                  style={styles.listImage}
                  resizeMode="cover"
                />
                <View style={styles.listCardContent}>
                  <View style={styles.listCardTopRow}>
                    <View style={styles.listCardLocationRow}>
                      <Ionicons name="location-sharp" size={12} color={COLORS.primary} />
                      <Text style={styles.listCardLocation}>
                        {destination.country.toUpperCase()}
                      </Text>
                    </View>
                    {destination.duration && (
                      <View style={styles.listCardDurationTag}>
                        <Text style={styles.listCardDurationText}>
                          {destination.duration}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.listCardTitle} numberOfLines={1}>
                    {destination.name}
                  </Text>

                  <View style={styles.listCardRatingRow}>
                    <View style={styles.listCardRating}>
                      {renderStars(destination.rating || 4.8)}
                    </View>
                    <Text style={styles.listCardReviewsText}>
                      ({destination.reviews || 100})
                    </Text>
                  </View>

                  <View style={styles.listCardPriceRow}>
                    <Text style={styles.pricePrefix}>Giá từ</Text>
                    <Text style={styles.listCardPrice}>${destination.price}</Text>
                  </View>
                </View>

                {!isGuest && (
                  <TouchableOpacity
                    onPress={() => handleFavoritePress(destination.id)}
                    style={styles.favoriteIconButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={userFavorites.some(fav => fav.id === destination.id) ? 'heart' : 'heart-outline'}
                      size={16}
                      color={userFavorites.some(fav => fav.id === destination.id) ? COLORS.liveRed : COLORS.slate}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={applyAdvancedFilters}
        currentFilters={currentFilters}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // #F5FAF9
  },
  header: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.xs,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    marginTop: SIZES.xs,
    marginBottom: SIZES.md,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    gap: 10,
    ...SHADOWS.light,
  },
  searchInput: {
    flex: 1,
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.text,
    paddingVertical: 0,
  },
  filterIconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary, // Teal #0D9488
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  resultsSummary: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.sm,
  },
  resultsSummaryText: {
    ...FONTS.medium,
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
  },
  resultsTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.xs,
    marginBottom: SIZES.sm,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  resultsTitle: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  resultsCount: {
    ...FONTS.semiBold,
    fontSize: 12,
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: SIZES.radiusFull,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SIZES.xl,
  },
  listContainer: {
    paddingHorizontal: SIZES.lg,
    gap: 12,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.cardRadius, // 20px
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.hairline,
    alignItems: 'center',
    padding: 10,
    ...SHADOWS.light,
  },
  listImage: {
    width: 105,
    height: 105,
    borderRadius: 16,
  },
  listCardContent: {
    flex: 1,
    paddingLeft: SIZES.md,
    paddingRight: SIZES.sm,
  },
  listCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listCardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  listCardLocation: {
    ...FONTS.bold,
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  listCardDurationTag: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  listCardDurationText: {
    ...FONTS.medium,
    fontSize: 10,
    color: COLORS.primaryDark,
  },
  listCardTitle: {
    ...FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  listCardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  listCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listCardReviewsText: {
    ...FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  listCardPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  pricePrefix: {
    ...FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  listCardPrice: {
    ...FONTS.bold,
    fontSize: 16,
    color: COLORS.primary,
  },
  favoriteIconButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: SIZES.radiusFull,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxl * 1.5,
    paddingHorizontal: SIZES.xl,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  emptyTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  emptyText: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ExploreScreen;


