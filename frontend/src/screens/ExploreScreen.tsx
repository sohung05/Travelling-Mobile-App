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
import { FilterOptions, getCategoryGroup } from '../components/FilterModal';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { formatDestinationPrice, getDestinationPrice, getDestinationReviewCount } from '../utils/destination';
import { useDarkMode } from '../contexts/DarkModeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExploreScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useDarkMode();
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
    priceRange: { min: 0, max: 70000000 },
    locationScope: 'all',
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
      const incoming = route.params.initialFilters as any;
      const normalizedFilters: FilterOptions = {
        priceRange: incoming?.priceRange || { min: 0, max: 70000000 },
        locationScope: incoming?.locationScope || 'all',
        ratingRange: incoming?.ratingRange || { min: 0, max: 5 },
        category: incoming?.category ?? null,
      };
      setCurrentFilters(normalizedFilters);
      applyAdvancedFilters(normalizedFilters);
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
    
    // Sử dụng filters.category từ FilterModal (nhóm lọc: Beach, Nature, Cultural, Entertainment, Luxury)
    const effectiveCategory = filters.category;
    
    console.log(`🔍 ApplyAdvancedFilters called with:`, {
      searchQuery,
      filtersCategory: filters.category,
      effectiveCategory,
      filters: filters
    });
    console.log(`📊 Total destinations: ${destinations.length}`);
    
    let filtered = [...destinations];

    // Nếu không có filter nào, hiển thị tất cả destinations
    const locationScope = filters.locationScope || 'all';
    const hasNoFilters = !searchQuery &&
                         !effectiveCategory &&
                         locationScope === 'all' &&
                         filters.ratingRange.min === 0 &&
                         filters.ratingRange.max === 5 &&
                         filters.priceRange.min === 0;
    
    console.log(`🔍 Checking no filters condition:`, {
      hasNoFilters,
      searchQuery,
      effectiveCategory,
      locationScope,
      ratingRange: filters.ratingRange,
      priceRange: filters.priceRange
    });
    
    if (hasNoFilters) {
      console.log(`📊 No filters active, showing all destinations`);
      const allResults = [...destinations].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      console.log(`📊 All destinations count: ${allResults.length}`);
      setFilteredDestinations(allResults);
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

    // Category filter - sử dụng getCategoryGroup để map category gốc MongoDB sang nhóm lọc
    if (effectiveCategory) {
      console.log(`🔍 Filtering by category group: ${effectiveCategory}`);
      console.log(`📊 Before category filter: ${filtered.length} destinations`);
      
      filtered = filtered.filter(dest => {
        const destGroup = getCategoryGroup(dest.category);
        const isMatch = destGroup === effectiveCategory;
        
        console.log(`🔍 Checking destination: ${dest.name}, category: "${dest.category}", group: "${destGroup}", selected: "${effectiveCategory}", match: ${isMatch}`);
        
        return isMatch;
      });
      
      console.log(`📊 After category filter: ${filtered.length} destinations`);
    }

    // Advanced filters
    console.log(`📊 Before advanced filters: ${filtered.length} destinations`);
    
    // Price filter - áp dụng khi user thay đổi range
    if (filters.priceRange.min > 0 || filters.priceRange.max < 70000000) {
      console.log(`📊 Applying price filter: ${filters.priceRange.min} - ${filters.priceRange.max}`);
      filtered = filtered.filter(dest => {
        const price = getDestinationPrice(dest);
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });
      console.log(`📊 After price filter: ${filtered.length} destinations`);
    } else {
      console.log(`📊 Skipping price filter (default range)`);
    }

    const isDomesticDestination = (dest: Destination) => {
      if (dest.type === 'DOMESTIC') return true;
      if (dest.type === 'INTERNATIONAL') return false;
      const normalized = (dest.country || '').trim().toLowerCase();
      return (
        normalized === 'vietnam' ||
        normalized === 'việt nam' ||
        normalized === 'viet nam'
      );
    };

    const effectiveLocationScope = filters.locationScope || 'all';
    if (effectiveLocationScope === 'domestic') {
      console.log(`📊 Before location filter (domestic): ${filtered.length} destinations`);
      filtered = filtered.filter((dest) => isDomesticDestination(dest));
      console.log(`📊 After location filter (domestic): ${filtered.length} destinations`);
    } else if (effectiveLocationScope === 'international') {
      console.log(`📊 Before location filter (international): ${filtered.length} destinations`);
      filtered = filtered.filter((dest) => !isDomesticDestination(dest));
      console.log(`📊 After location filter (international): ${filtered.length} destinations`);
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
      priceRange: { min: 0, max: 70000000 },
      locationScope: 'all',
      ratingRange: { min: 0, max: 5 },
      category: null,
    });
    const allResults = [...destinations].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    setFilteredDestinations(allResults);
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
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
              <TouchableOpacity
                key={destination.id}
                style={styles.listCard}
                onPress={() =>
                  navigation.navigate('DestinationDetail', { destination })
                }
                activeOpacity={0.92}
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
                      {renderStars(destination.rating || 0)}
                    </View>
                    <Text style={styles.listCardReviewsText}>
                      ({getDestinationReviewCount(destination)})
                    </Text>
                  </View>

                  <View style={styles.listCardMetaRow}>
                    {!!destination.duration && (
                      <Text style={styles.listCardMetaText}>{destination.duration}</Text>
                    )}
                    {!!(destination as any).type && (
                      <Text style={styles.listCardMetaText}>
                        {(destination as any).type === 'DOMESTIC' ? 'Trong nước' : 'Quốc tế'}
                      </Text>
                    )}
                  </View>

                  <View style={styles.listCardPriceRow}>
                    <Text style={styles.pricePrefix}>Giá từ</Text>
                    <Text style={styles.listCardPrice}>{formatDestinationPrice(destination)}</Text>
                  </View>
                </View>

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
              </TouchableOpacity>
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
        destinations={destinations}
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
  listCardMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  listCardMetaText: {
    ...FONTS.medium,
    fontSize: 10,
    color: COLORS.slate,
    backgroundColor: '#EFF6F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
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




