import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { PLACEHOLDER_IMAGES } from '../constants/images';
import { Destination, DestinationCategory } from '../types';
import { useDestinations } from '../api';
import { DestinationCard, CategoryCard, NotificationModal } from '../components';
import { FilterModal, FilterOptions } from '../components/FilterModal';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

// High-resolution scenic backgrounds that automatically rotate behind Hero area
const HERO_BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop', // Mount Fuji & Cherry Blossoms
  'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1200&auto=format&fit=crop', // Maldives turquoise ocean
  'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop', // Ha Long Bay
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1200&auto=format&fit=crop', // Santorini Greece
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop', // Alpine lake
];

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const {
    user,
    isGuest,
    userFavorites,
    addFavorite,
    removeFavorite,
    userNotifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    loadNotifications,
  } = useAuth();

  // React Query hook for destinations with caching & fallback
  const { data: allDestinations = [], isLoading: destinationsLoading, refetch: refetchDestinations } = useDestinations();

  const [featuredDestinations, setFeaturedDestinations] = useState<Destination[]>([]);
  const [nearbyDestinations, setNearbyDestinations] = useState<Destination[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<Destination[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DestinationCategory | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Filter Modal state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    priceRange: { min: 0, max: 9999 },
    countries: [],
    ratingRange: { min: 0, max: 5 },
    category: null,
  });

  // Animated background carousel state
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Auto-cycle scenic images in the background every 4.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.15,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        setHeroImageIndex((prev) => (prev + 1) % HERO_BACKGROUND_IMAGES.length);
      }, 500);
    }, 4500);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  const categories: DestinationCategory[] = [
    'Beach',
    'Nature',
    'Cultural',
    'Entertainment',
    'Luxury',
  ];

  // Process destinations data
  useEffect(() => {
    if (allDestinations && allDestinations.length > 0) {
      // 1. Featured / Trending destinations
      const featured = allDestinations
        .filter(dest => dest.rating >= 4.7)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
      setFeaturedDestinations(featured);

      // 2. Nearby destinations (Vietnam / Regional spots)
      const nearby = allDestinations
        .filter(dest => dest.country === 'Vietnam' || ['11', '12', '13', '3', '7'].includes(dest.id))
        .slice(0, 6);
      setNearbyDestinations(nearby.length > 0 ? nearby : allDestinations.slice(0, 4));

      // 3. Popular / Categorized destinations
      const featuredIds = featured.map(dest => dest.id);
      const popular = allDestinations
        .filter(dest => !featuredIds.includes(dest.id))
        .slice(0, 8);
      setPopularDestinations(popular);
    }
  }, [allDestinations]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (!destinationsLoading) {
        refetchDestinations();
      }
    }, [destinationsLoading, refetchDestinations])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchDestinations();
    setRefreshing(false);
  };

  const handleFavoritePress = async (destinationId: string) => {
    try {
      const isFav = userFavorites.some(fav => fav.id === destinationId);
      if (isFav) {
        removeFavorite(destinationId);
      } else {
        const dest = allDestinations.find(d => d.id === destinationId);
        if (dest) {
          addFavorite(dest);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleCategoryPress = (category: DestinationCategory) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      const featuredIds = featuredDestinations.map(dest => dest.id);
      const popular = allDestinations
        .filter(dest => !featuredIds.includes(dest.id))
        .slice(0, 8);
      setPopularDestinations(popular);
    } else {
      setSelectedCategory(category);
      const filtered = allDestinations
        .filter(dest => dest.category === category)
        .slice(0, 8);
      setPopularDestinations(filtered);
    }
  };

  const handleApplyFilters = (filters: FilterOptions) => {
    setCurrentFilters(filters);
    setShowFilterModal(false);
    navigation.navigate('MainTabs', {
      screen: 'Explore',
      params: { initialFilters: filters },
    });
  };

  const handleNotificationPress = async () => {
    setShowNotificationModal(true);
    if (!isGuest) {
      await loadNotifications();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Animated Scenic Background Carousel behind Header & Hero */}
      <View style={styles.heroBackgroundWrapper} pointerEvents="none">
        <Animated.Image
          source={{ uri: HERO_BACKGROUND_IMAGES[heroImageIndex] }}
          style={[
            styles.heroBackgroundImage,
            {
              opacity: fadeAnim,
            },
          ]}
          resizeMode="cover"
        />
        {/* Vertical gradient: fades out smoothly into #F5FAF9 at bottom */}
        <LinearGradient
          colors={['rgba(245, 250, 249, 0.1)', 'rgba(245, 250, 249, 0.65)', '#F5FAF9']}
          locations={[0, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Horizontal gradient: keeps left side solid #F5FAF9 so brand & title text are 100% crisp */}
        <LinearGradient
          colors={['#F5FAF9', 'rgba(245, 250, 249, 0.75)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          locations={[0, 0.48, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header Row matching Image 1 */}
        <View style={styles.topHeader}>
          <View style={styles.brandContainer}>
            <View style={styles.brandIconWrapper}>
              <Ionicons name="paper-plane" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.brandTitle}>TRAVELLIN</Text>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNotificationPress}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
            {unreadNotificationCount > 0 && (
              <View style={styles.notificationDot} />
            )}
          </TouchableOpacity>
        </View>

        {/* Hero Title Lockup */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Where to next?</Text>
          <View style={styles.heroSubtitleRow}>
            <Text style={styles.heroSubtitle}>Find your next escape</Text>
            <Ionicons name="airplane" size={18} color={COLORS.primary} style={styles.planeIcon} />
          </View>
        </View>

        {/* Search Bar with Circular Teal Filter Button - Opens FilterModal directly on 1st tap */}
        <View style={styles.searchSection}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.88}
          >
            <Ionicons name="search" size={18} color={COLORS.slate} style={{ marginRight: 10 }} />
            <Text style={styles.searchPlaceholder}>
              Search destinations, cities...
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="options-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Category Pills Carousel */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category, index) => (
              <CategoryCard
                key={`${category}-${selectedCategory === category ? 'selected' : 'unselected'}`}
                category={category}
                imageUrl={PLACEHOLDER_IMAGES.categories[category]}
                onPress={() => handleCategoryPress(category)}
                isSelected={selectedCategory === category}
                index={index}
              />
            ))}
          </ScrollView>
        </View>

        {/* Section 1: Trending destinations */}
        <View style={styles.section}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationsContainer}
          >
            {featuredDestinations.map((destination, index) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                onPress={() =>
                  navigation.navigate('DestinationDetail', { destination })
                }
                onFavoritePress={() => handleFavoritePress(destination.id)}
                isFavorite={userFavorites.some(fav => fav.id === destination.id)}
                index={index}
              />
            ))}
          </ScrollView>
        </View>

        {/* Section 2: Explore nearby */}
        <View style={styles.section}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationsContainer}
          >
            {nearbyDestinations.map((destination) => (
              <TouchableOpacity
                key={`nearby-${destination.id}`}
                style={styles.nearbyCard}
                onPress={() => navigation.navigate('DestinationDetail', { destination })}
                activeOpacity={0.88}
              >
                <Image
                  source={{ uri: destination.imageUrl || destination.images?.[0] }}
                  style={styles.nearbyImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(15, 35, 34, 0.65)']}
                  style={styles.nearbyGradient}
                />
                {/* Location Pill at bottom left */}
                <View style={styles.nearbyPill}>
                  <Ionicons name="location-sharp" size={12} color={COLORS.white} />
                  <Text style={styles.nearbyPillText} numberOfLines={1}>
                    {destination.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Section 3: Popular / Filtered destinations */}
        {selectedCategory && (
          <View style={styles.section}>
            <View style={styles.gridContainer}>
              {popularDestinations.map((destination) => {
                const isFav = userFavorites.some(fav => fav.id === destination.id);
                return (
                  <View key={destination.id} style={styles.gridItem}>
                    <TouchableOpacity
                      style={styles.popularCard}
                      onPress={() =>
                        navigation.navigate('DestinationDetail', { destination })
                      }
                      activeOpacity={0.9}
                    >
                      <Image
                        source={{ uri: destination.imageUrl || destination.images?.[0] }}
                        style={styles.popularImage}
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(15, 35, 34, 0.85)']}
                        style={styles.popularGradient}
                      />

                      <TouchableOpacity
                        style={styles.popularFavorite}
                        onPress={() => handleFavoritePress(destination.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={isFav ? 'heart' : 'heart-outline'}
                          size={16}
                          color={isFav ? '#EF4444' : COLORS.white}
                        />
                      </TouchableOpacity>

                      <View style={styles.popularInfo}>
                        <Text style={styles.popularName} numberOfLines={1}>
                          {destination.name}
                        </Text>
                        <View style={styles.popularBottom}>
                          <View style={styles.popularRating}>
                            <Ionicons name="star" size={11} color={COLORS.rating} />
                            <Text style={styles.popularRatingText}>
                              {(destination.rating || 4.8).toFixed(1)}
                            </Text>
                          </View>
                          <Text style={styles.popularPrice}>${destination.price}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Bottom breathing room */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Notification Modal */}
      <NotificationModal
        visible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        notifications={userNotifications}
        onMarkAllAsRead={markAllNotificationsAsRead}
        onNotificationRead={markNotificationAsRead}
        onDeleteNotification={deleteNotification}
      />

      {/* Filter Modal - opens instantly on 1st click */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
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
  heroBackgroundWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 290,
    overflow: 'hidden',
    zIndex: 0,
  },
  heroBackgroundImage: {
    position: 'absolute',
    top: 0,
    right: -10,
    width: width * 0.85,
    height: 290,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.xs,
    zIndex: 2,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconWrapper: {
    transform: [{ rotate: '-10deg' }],
  },
  brandTitle: {
    ...FONTS.bold,
    fontSize: 22,
    color: COLORS.text, // #153B3A
    letterSpacing: 0.5,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  heroSection: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.md,
    paddingBottom: SIZES.md,
  },
  heroTitle: {
    ...FONTS.bold,
    fontSize: 28,
    color: COLORS.text,
    letterSpacing: -0.6,
  },
  heroSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  heroSubtitle: {
    ...FONTS.medium,
    fontSize: 16,
    color: COLORS.textSecondary, // #64748B
  },
  planeIcon: {
    marginLeft: 2,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.lg,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    ...SHADOWS.light,
  },
  searchPlaceholder: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary, // Teal #0D9488
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  categoriesSection: {
    marginBottom: SIZES.xl,
  },
  categoriesContainer: {
    paddingHorizontal: SIZES.lg,
  },
  section: {
    marginBottom: SIZES.xl,
  },
  destinationsContainer: {
    paddingHorizontal: SIZES.lg,
  },
  // Explore nearby cards
  nearbyCard: {
    width: width * 0.38,
    height: 140,
    borderRadius: SIZES.cardRadius, // 20px
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: COLORS.primaryLight,
    ...SHADOWS.light,
  },
  nearbyImage: {
    width: '100%',
    height: '100%',
  },
  nearbyGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  nearbyPill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 78, 74, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    gap: 3,
  },
  nearbyPillText: {
    ...FONTS.bold,
    fontSize: 11,
    color: COLORS.white,
  },
  // Grid items
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.lg - 6,
  },
  gridItem: {
    width: '50%',
    padding: 6,
  },
  popularCard: {
    height: 200,
    borderRadius: SIZES.cardRadius,
    overflow: 'hidden',
    backgroundColor: COLORS.primaryDark,
    ...SHADOWS.light,
  },
  popularImage: {
    width: '100%',
    height: '100%',
  },
  popularGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  popularFavorite: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  popularInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  popularName: {
    ...FONTS.bold,
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 4,
  },
  popularBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  popularRatingText: {
    ...FONTS.bold,
    fontSize: 11,
    color: COLORS.white,
  },
  popularPrice: {
    ...FONTS.bold,
    fontSize: 13,
    color: COLORS.white,
  },
});

export default HomeScreen;
