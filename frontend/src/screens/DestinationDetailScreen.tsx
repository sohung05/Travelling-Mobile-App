import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

// Map rendering: Use WebView for all platforms (web, Android, iOS)
// react-native-maps requires native modules and causes TurboModule errors in Expo Go
// WebView solution works universally without native dependencies
import { RootStackParamList, Destination, Review } from '../types';
import { userService, destinationService, reviewService, useReviewsByDestination } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { GOOGLE_MAPS_API_KEY } from '../api/config';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'DestinationDetail'>;

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.5;

// Helper function to get latitude/longitude from destination (handles both formats)
const getDestinationCoordinates = (dest: Destination | any) => {
  return {
    latitude: dest.latitude ?? dest.location?.latitude,
    longitude: dest.longitude ?? dest.location?.longitude,
  };
};

const DestinationDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { destination: initialDestination } = route.params;
  const { isGuest, user, addFavorite, removeFavorite, setPendingTour, userReviews } = useAuth();

  const [destination, setDestination] = useState<Destination>(initialDestination);
  const [isFavorite, setIsFavorite] = useState(
    user?.favorites?.includes(destination.id) || false
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [mapLoadError, setMapLoadError] = useState(false);
  const imageScrollRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Use React Query hook for reviews with caching
  const { data: reviews = [], refetch: refetchReviews } = useReviewsByDestination(destination.id);

  // Fixed visited count (cố định, không đổi)
  const visitedCount = useMemo(() => {
    const reviewCount = (destination.reviews || 0) + userReviews.filter(
      review => review.destinationId === destination.id
    ).length;
    return reviewCount * 3 + 1000; // Fixed calculation
  }, [destination.id, destination.reviews, userReviews.length]);

  // Fetch fresh destination data from server
  const refreshDestination = async () => {
    try {
      const freshDestination = await destinationService.getDestinationById(destination.id);
      if (freshDestination) {
        setDestination(freshDestination);
        // Debug: Log coordinates
        const coords = getDestinationCoordinates(freshDestination);
        console.log('📍 Destination coordinates:', {
          name: freshDestination.name,
          latitude: coords.latitude,
          longitude: coords.longitude,
          rawData: {
            directLat: freshDestination.latitude,
            directLng: freshDestination.longitude,
            locationLat: (freshDestination as any).location?.latitude,
            locationLng: (freshDestination as any).location?.longitude,
          }
        });
      }
    } catch (error) {
      console.error('Failed to refresh destination:', error);
    }
  };

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshDestination();
      refetchReviews();
    }, [destination.id, refetchReviews])
  );

  // Update favorite status when user favorites change
  useEffect(() => {
    setIsFavorite(user?.favorites?.includes(destination.id) || false);
  }, [user?.favorites, destination.id]);

  // Calculate real-time rating and reviews
  const getRealTimeRating = () => {
    const destinationReviews = userReviews.filter(review => 
      review.destinationId === destination.id
    );
    
    if (destinationReviews.length === 0) {
      return destination.rating || 0;
    }
    
    const totalRating = destinationReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / destinationReviews.length;
    
    if (!destination.rating || !destination.reviews) {
      return Math.round(averageRating * 10) / 10;
    }
    
    const originalTotalRating = destination.rating * destination.reviews;
    const newTotalRating = totalRating;
    const totalReviews = destination.reviews + destinationReviews.length;
    const combinedRating = (originalTotalRating + newTotalRating) / totalReviews;
    
    return Math.round(combinedRating * 10) / 10;
  };

  const getRealTimeReviewsCount = () => {
    const destinationReviews = userReviews.filter(review => 
      review.destinationId === destination.id
    );
    return (destination.reviews || 0) + destinationReviews.length;
  };

  const handleFavoritePress = async () => {
    if (isGuest) {
      navigation.navigate('Login');
      return;
    }

    try {
      if (isFavorite) {
        removeFavorite(destination.id);
      } else {
        addFavorite(destination);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleBookNow = () => {
    if (isGuest) {
      setPendingTour(destination);
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('TourServices', { destination });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

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

  const images = destination.images && destination.images.length > 0 
    ? destination.images 
    : [destination.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'];

  const renderImageItem = ({ item }: { item: string }) => (
    <Image
      source={{ uri: item }}
      style={styles.heroImage}
      resizeMode="cover"
    />
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Hôm nay';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return '1 ngày trước';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} tuần trước`;
    }
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Animated header for parallax scroll
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  // Fixed header background opacity - becomes more visible when scrolling
  const fixedHeaderBgOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT * 0.5, HEADER_HEIGHT],
    outputRange: [0, 0.3, 1],
    extrapolate: 'clamp',
  });

  // Fixed header white text opacity - hidden when not scrolling
  const fixedHeaderWhiteTextOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT * 0.7, HEADER_HEIGHT],
    outputRange: [0, 0, 0], // Always hidden
    extrapolate: 'clamp',
  });

  // Fixed header black text opacity - fades in when scrolling
  const fixedHeaderBlackTextOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT * 0.7, HEADER_HEIGHT],
    outputRange: [0, 0, 1], // Only visible when scrolled
    extrapolate: 'clamp',
  });

  // Get amenities for "Bao gồm" section
  const includedServices = destination.amenities || [];
  const defaultServices = [
    { icon: 'airplane-outline', label: 'Chuyến bay' },
    { icon: 'bed-outline', label: 'Khách sạn' },
    { icon: 'car-outline', label: 'Di chuyển' },
  ];

  const servicesToShow = includedServices.length > 0 
    ? includedServices.map((amenity, index) => {
        const iconMap: { [key: string]: string } = {
          'WiFi': 'wifi-outline',
          'Breakfast': 'restaurant-outline',
          'Airport Transfer': 'airplane-outline',
          'Guide': 'person-outline',
          'Hotel': 'bed-outline',
          'Transport': 'car-outline',
        };
        return {
          icon: iconMap[amenity] || 'checkmark-circle-outline',
          label: amenity,
        };
      })
    : defaultServices;


  return (
    <View style={styles.container}>
      {/* Fixed Header - Always visible */}
      <View style={styles.fixedHeader} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.fixedHeaderBackground,
            {
              opacity: fixedHeaderBgOpacity,
            },
          ]}
        />
        <SafeAreaView style={styles.fixedHeaderContent} edges={['top']} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color={COLORS.ink} />
          </TouchableOpacity>

          <View style={styles.fixedHeaderTitleContainer}>
            <Animated.Text
              style={[
                styles.fixedHeaderTitle,
                styles.fixedHeaderTitleWhite,
                {
                  opacity: fixedHeaderWhiteTextOpacity,
                },
              ]}
              numberOfLines={1}
            >
              {destination.name}
            </Animated.Text>
            <Animated.Text
              style={[
                styles.fixedHeaderTitle,
                styles.fixedHeaderTitleBlack,
                {
                  opacity: fixedHeaderBlackTextOpacity,
                },
              ]}
              numberOfLines={1}
            >
              {destination.name}
            </Animated.Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleFavoritePress}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? '#EF4444' : COLORS.ink}
            />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Animated Hero Image - Scrolls with content */}
      <Animated.View
        style={[
          styles.heroContainer,
          {
            transform: [{ translateY: headerTranslateY }],
            opacity: headerOpacity,
          },
        ]}
      >
        <FlatList
          ref={imageScrollRef}
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
          scrollEnabled={images.length > 1}
        />

        {/* Pagination Dots */}
        {images.length > 1 && (
          <View style={styles.paginationDots} pointerEvents="none">
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentImageIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        )}
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Spacer for hero image */}
        <View style={{ height: HEADER_HEIGHT - 24 }} />

        {/* Curved Content Sheet Container */}
        <View style={styles.sheetContainer}>
          {/* Sheet drag indicator hint */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Title and Location */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{destination.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={16} color={COLORS.primary} />
              <Text style={styles.locationText}>{destination.country.toUpperCase()}</Text>
            </View>
          </View>

        {/* Statistics Row - All in one line */}
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Ionicons name="eye-outline" size={13} color={COLORS.slate} />
            <Text style={styles.visitedText}>Ghé thăm {visitedCount.toLocaleString('vi-VN')}</Text>
          </View>
          <View style={styles.statPill}>
            <Ionicons name="star" size={13} color={COLORS.amber} />
            <Text style={styles.statPillText}>
              {getRealTimeRating().toFixed(1)}
            </Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillText}>({getRealTimeReviewsCount()} đánh giá)</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text
            style={styles.description}
            numberOfLines={expandedDescription ? undefined : 4}
          >
            {destination.description || 'Chưa có mô tả chi tiết.'}
          </Text>
          {destination.description && destination.description.length > 200 && (
            <TouchableOpacity
              onPress={() => setExpandedDescription(!expandedDescription)}
              style={styles.readMoreContainer}
            >
              <Text style={styles.readMore}>
                {expandedDescription ? 'Thu gọn' : 'Đọc thêm chi tiết'}
              </Text>
              <Ionicons 
                name={expandedDescription ? 'chevron-up' : 'chevron-down'} 
                size={14} 
                color={COLORS.primary} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* What's Included Section - Horizontal Pills */}
        {servicesToShow.length > 0 && (
          <View style={styles.section}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.includedContainer}
            >
              {servicesToShow.map((service, index) => (
                <View key={index} style={styles.includedPill}>
                  <Ionicons name={service.icon as any} size={18} color={COLORS.primary} />
                  <Text style={styles.includedPillText}>{service.label}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Location/Map Section */}
        <View style={styles.section}>
          <View style={styles.mapContainer}>
            {(() => {
              const coords = getDestinationCoordinates(destination);
              const { latitude, longitude } = coords;
              
              // Debug logging
              console.log('🗺️ Rendering map:', {
                destinationName: destination.name,
                hasCoordinates: !!(latitude && longitude),
                latitude,
                longitude,
                rawDestination: {
                  directLat: destination.latitude,
                  directLng: destination.longitude,
                  locationLat: (destination as any).location?.latitude,
                  locationLng: (destination as any).location?.longitude,
                }
              });
              
              if (!latitude || !longitude) {
                console.warn('⚠️ No coordinates available for destination:', destination.name);
                return (
                  <View style={styles.mapPlaceholder}>
                    <Ionicons name="map-outline" size={48} color={COLORS.textSecondary} />
                    <Text style={styles.mapPlaceholderText}>Bản đồ không khả dụng</Text>
                    <Text style={styles.mapPlaceholderSubtext}>
                      Không có tọa độ cho địa điểm này
                    </Text>
                  </View>
                );
              }

              // Web: Use iframe HTML directly to embed Google Maps
              if (Platform.OS === 'web') {
                const embedMapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=14&output=embed`;
                
                // Web-only: Render iframe using DOM manipulation
                const MapIframe = () => {
                  const containerRef = useRef<any>(null);
                  
                  useEffect(() => {
                    if (containerRef.current && typeof document !== 'undefined') {
                      // Get the native DOM node from React Native View
                      // @ts-ignore - Web-only: Access native node
                      const nativeNode = containerRef.current?._nativeNode || containerRef.current;
                      if (nativeNode && nativeNode.style) {
                        // Create iframe element
                        const iframe = document.createElement('iframe');
                        iframe.src = embedMapUrl;
                        iframe.width = '100%';
                        iframe.height = '100%';
                        iframe.style.border = '0';
                        iframe.style.borderRadius = '8px';
                        iframe.style.display = 'block';
                        iframe.setAttribute('allowfullscreen', '');
                        iframe.setAttribute('loading', 'lazy');
                        iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
                        iframe.title = `Map of ${destination.name}`;
                        
                        // Clear container and append iframe
                        if (nativeNode.parentElement) {
                          const parent = nativeNode.parentElement;
                          parent.innerHTML = '';
                          parent.appendChild(iframe);
                        }
                      }
                    }
                  }, []);
                  
                  return (
                    <View style={styles.webMapWrapper}>
                      <View 
                        ref={containerRef}
                        style={styles.mapImage}
                        // @ts-ignore - Web-only property
                        dangerouslySetInnerHTML={{
                          __html: `<iframe src="${embedMapUrl}" width="100%" height="100%" style="border:0; border-radius: 8px; display: block;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map of ${destination.name}"></iframe>`,
                        }}
                      />
                      {/* Zoom Controls */}
                      <View style={styles.zoomControls}>
                        <TouchableOpacity
                          style={[styles.zoomButton, styles.zoomButtonTop]}
                          onPress={() => {
                            const latLng = `${latitude},${longitude}`;
                            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latLng}&zoom=16`);
                          }}
                        >
                          <Ionicons name="add" size={20} color={COLORS.text} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.zoomButton, styles.zoomButtonBottom]}
                          onPress={() => {
                            const latLng = `${latitude},${longitude}`;
                            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latLng}&zoom=12`);
                          }}
                        >
                          <Ionicons name="remove" size={20} color={COLORS.text} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                };
                
                return <MapIframe />;
              }

              // Android/iOS: Use WebView with HTML content (works without native modules)
              // This is the primary solution - works in Expo Go and all environments
              // Create HTML with embedded iframe for Google Maps
              
              try {
                const { WebView } = require('react-native-webview');
                
                const mapHtml = `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        body, html { margin: 0; padding: 0; width: 100%; height: 100%; }
                        iframe { width: 100%; height: 100%; border: 0; }
                      </style>
                    </head>
                    <body>
                      <iframe 
                        src="https://www.google.com/maps?q=${latitude},${longitude}&z=14&output=embed"
                        allowfullscreen
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade">
                      </iframe>
                    </body>
                  </html>
                `;
                
                return (
                  <View style={styles.mapWrapper}>
                    <WebView
                      source={{ html: mapHtml }}
                      style={styles.mapImage}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      startInLoadingState={true}
                      scalesPageToFit={true}
                      onError={(error: any) => {
                        console.error('❌ WebView map failed:', error);
                      }}
                      onLoadEnd={() => {
                        console.log('✅ WebView map loaded');
                      }}
                    />
                    {/* Zoom Controls */}
                    <View style={styles.zoomControls}>
                      <TouchableOpacity
                        style={[styles.zoomButton, styles.zoomButtonTop]}
                        onPress={() => {
                          const latLng = `${latitude},${longitude}`;
                          const scheme = Platform.select({
                            ios: 'maps:0,0?q=',
                            android: 'geo:0,0?q=',
                          });
                          const label = encodeURIComponent(destination.name);
                          const url = Platform.select({
                            ios: `${scheme}${label}@${latLng}`,
                            android: `${scheme}${latLng}(${label})`,
                          });
                          Linking.openURL(url || `https://www.google.com/maps/search/?api=1&query=${latLng}&zoom=16`);
                        }}
                      >
                        <Ionicons name="add" size={20} color={COLORS.text} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.zoomButton, styles.zoomButtonBottom]}
                        onPress={() => {
                          const latLng = `${latitude},${longitude}`;
                          const scheme = Platform.select({
                            ios: 'maps:0,0?q=',
                            android: 'geo:0,0?q=',
                          });
                          const label = encodeURIComponent(destination.name);
                          const url = Platform.select({
                            ios: `${scheme}${label}@${latLng}`,
                            android: `${scheme}${latLng}(${label})`,
                          });
                          Linking.openURL(url || `https://www.google.com/maps/search/?api=1&query=${latLng}&zoom=12`);
                        }}
                      >
                        <Ionicons name="remove" size={20} color={COLORS.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              } catch (webViewError) {
                console.error('❌ WebView not available:', webViewError);
              }
              
              // Final fallback: Placeholder
              return (
                <TouchableOpacity
                  style={styles.mapWrapper}
                  activeOpacity={0.9}
                  onPress={() => {
                    const latLng = `${latitude},${longitude}`;
                    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latLng}`);
                  }}
                >
                  <View style={styles.mapPlaceholder}>
                    <View style={styles.mapPlaceholderContent}>
                      <Ionicons name="map-outline" size={48} color={COLORS.primary} />
                      <Text style={styles.mapPlaceholderTitle}>Xem bản đồ</Text>
                      <Text style={styles.mapPlaceholderText}>Nhấn để mở Google Maps</Text>
                      <Text style={styles.mapPlaceholderSubtext}>
                        Chạy: npx expo run:android để rebuild app
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })()}
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          {reviews.length > 0 ? (
            <View>
              {reviews.slice(0, 4).map((review, index) => (
                <View key={review.id || index} style={styles.reviewItem}>
                  <Image
                    source={{ uri: review.userAvatar || 'https://via.placeholder.com/48' }}
                    style={styles.reviewAvatar}
                  />
                  <View style={styles.reviewContent}>
                    <View style={styles.reviewHeaderRow}>
                      <Text style={styles.reviewName}>{review.userName || 'Người dùng'}</Text>
                      <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                    </View>
                    <View style={styles.reviewStarsRow}>
                      {renderStars(review.rating)}
                    </View>
                    {review.comment && (
                      <Text style={styles.reviewComment}>{review.comment}</Text>
                    )}
                  </View>
                </View>
              ))}
              {reviews.length > 4 && (
                <TouchableOpacity
                  style={styles.seeAllReviewsButton}
                  onPress={() => navigation.navigate('Reviews', { destinationId: destination.id })}
                >
                  <Text style={styles.seeAllReviewsButtonText}>
                    Xem tất cả ({reviews.length} đánh giá)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.noReviews}>
              <Text style={styles.noReviewsText}>Chưa có đánh giá nào</Text>
            </View>
          )}
        </View>
        </View>

        {/* Bottom Spacing for Sticky Bar */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>${destination.price}</Text>
            <Text style={styles.priceUnit}>/ người</Text>
          </View>
          <Text style={styles.priceDisclaimer}>Bao gồm thuế & phí</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>Đặt ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  fixedHeaderBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
  },
  fixedHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.sm,
    minHeight: 56,
  },
  fixedHeaderTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SIZES.sm,
    position: 'relative',
  },
  fixedHeaderTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  fixedHeaderTitleWhite: {
    color: COLORS.white,
  },
  fixedHeaderTitleBlack: {
    color: COLORS.black,
  },
  heroContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    width: '100%',
    overflow: 'hidden',
    zIndex: 1,
  },
  heroImage: {
    width: width,
    height: HEADER_HEIGHT,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  paginationDots: {
    position: 'absolute',
    bottom: SIZES.lg + 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.xs,
    zIndex: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  dotActive: {
    width: 22,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    paddingBottom: SIZES.xl,
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: SIZES.sm,
    ...SHADOWS.medium,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.xs + 2,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  titleSection: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xs,
    paddingBottom: SIZES.sm,
  },
  title: {
    ...FONTS.bold,
    fontSize: 26,
    color: COLORS.ink,
    lineHeight: 34,
    marginBottom: SIZES.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  locationText: {
    ...FONTS.semiBold,
    fontSize: SIZES.body2,
    color: COLORS.slate,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.lg,
    gap: SIZES.sm,
    flexWrap: 'wrap',
  },
  visitedText: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.slate,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SIZES.md - 2,
    paddingVertical: SIZES.xs + 2,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: '#D1EAE6',
    backgroundColor: '#E6F4F2',
  },
  statPillText: {
    ...FONTS.semiBold,
    fontSize: SIZES.body3,
    color: COLORS.ink,
  },
  section: {
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.lg + 4,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.ink,
    marginBottom: SIZES.md,
  },
  description: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.slate,
    lineHeight: 23,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SIZES.sm,
  },
  readMore: {
    ...FONTS.semiBold,
    fontSize: SIZES.body2,
    color: COLORS.primary,
  },
  includedContainer: {
    flexDirection: 'row',
    gap: SIZES.sm,
    paddingRight: SIZES.md,
  },
  includedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs + 2,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: '#D1EAE6',
    backgroundColor: '#E6F4F2',
  },
  includedPillText: {
    ...FONTS.semiBold,
    fontSize: SIZES.body2,
    color: COLORS.ink,
  },
  locationSubtitle: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
  },
  mapContainer: {
    height: 200,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    marginBottom: SIZES.md,
    backgroundColor: '#E8F5E9', // Light green background (sẽ bị che bởi map image khi load)
  },
  webMapWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    backgroundColor: '#E8F5E9', // Light green background fallback
  },
  zoomControls: {
    position: 'absolute',
    right: SIZES.sm,
    bottom: SIZES.sm,
    flexDirection: 'column',
    gap: 0,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  zoomButton: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButtonTop: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  zoomButtonBottom: {
    // No border for bottom button
  },
  mapWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#E8F5E9', // Light green background fallback
  },
  mapImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent', // Ensure image shows through
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapMarkerOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -16,
    zIndex: 10,
  },
  yellowMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...SHADOWS.medium,
  },
  mapExpandButton: {
    position: 'absolute',
    bottom: SIZES.sm,
    right: SIZES.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9', // Light green background
    position: 'relative',
  },
  mapPlaceholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.md,
  },
  mapPlaceholderTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.text,
    marginTop: SIZES.md,
    marginBottom: SIZES.xs,
  },
  mapPlaceholderText: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  mapPlaceholderSubtext: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
    textAlign: 'center',
  },
  mapAddress: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.black,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  reviewsHeaderTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.black,
    lineHeight: SIZES.h4 + 4,
  },
  reviewsRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.xs,
  },
  reviewsRatingText: {
    ...FONTS.regular,
    fontSize: SIZES.h5,
    color: COLORS.black,
    lineHeight: SIZES.h5 + 4,
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginTop: 4,
    marginRight: 10,
  },
  reviewItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...SHADOWS.light,
    gap: SIZES.md,
  },
  reviewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lightGray,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  reviewName: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.black,
  },
  reviewDate: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
  },
  reviewStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: SIZES.sm,
  },
  reviewComment: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.black,
    lineHeight: 22,
  },
  seeAllReviewsButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.md,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  seeAllReviewsButtonText: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.black,
  },
  noReviews: {
    paddingVertical: SIZES.xl,
    alignItems: 'center',
  },
  noReviewsText: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    paddingBottom: SIZES.md + (Platform.OS === 'ios' ? 24 : 12),
    borderTopColor: COLORS.hairline,
    borderTopWidth: 1,
    ...SHADOWS.medium,
  },
  priceContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginBottom: 2,
  },
  priceValue: {
    ...FONTS.black,
    fontSize: 24,
    color: COLORS.primaryDark,
  },
  priceUnit: {
    ...FONTS.medium,
    fontSize: SIZES.body2,
    color: COLORS.slate,
  },
  priceDisclaimer: {
    ...FONTS.regular,
    fontSize: 11,
    color: COLORS.slate,
  },
  bookButton: {
    backgroundColor: COLORS.primary, // Teal #0D9488
    paddingHorizontal: SIZES.xl,
    paddingVertical: 14,
    borderRadius: SIZES.radiusFull, // Full capsule pill
    marginLeft: SIZES.md,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  bookButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.body1,
    color: COLORS.white,
    letterSpacing: 0.3,
  },
});

export default DestinationDetailScreen;
