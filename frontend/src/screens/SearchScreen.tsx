import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList, Destination } from '../types';
import { destinationService, userService, useDestinations } from '../api';
import { SearchBar, Header } from '../components';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isGuest, userFavorites, addFavorite, removeFavorite } = useAuth();
  const { data: allDestinations = [] } = useDestinations();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Destination[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load recent searches from AsyncStorage
  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem('recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearches = async (searches: string[]) => {
    try {
      await AsyncStorage.setItem('recent_searches', JSON.stringify(searches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };

  // Chỉ clear results khi search query thực sự empty và không phải từ recent search
  useEffect(() => {
    if (searchQuery.length === 0 && !searching) {
      setSearchResults([]);
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [searchQuery, searching]);

  // Generate suggestions based on search query
  useEffect(() => {
    if (searchQuery.trim().length > 0 && !searching && searchResults.length === 0) {
      generateSuggestions(searchQuery.trim());
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [searchQuery, allDestinations, searchResults.length]);

  const generateSuggestions = (query: string) => {
    const queryLower = query.toLowerCase();
    const newSuggestions: string[] = [];

    // 1. Tìm trong recent searches
    recentSearches.forEach(search => {
      if (search.toLowerCase().includes(queryLower) && !newSuggestions.includes(search)) {
        newSuggestions.push(search);
      }
    });

    // 2. Tìm trong destination names
    allDestinations.forEach((dest: Destination) => {
      const name = dest.name.toLowerCase();
      if (name.includes(queryLower)) {
        if (!newSuggestions.includes(dest.name)) {
          newSuggestions.push(dest.name);
        }
      }
    });

    // 3. Tìm trong countries
    allDestinations.forEach((dest: Destination) => {
      const country = dest.country.toLowerCase();
      if (country.includes(queryLower)) {
        const suggestion = `Địa điểm ở ${dest.country}`;
        if (!newSuggestions.includes(suggestion)) {
          newSuggestions.push(suggestion);
        }
      }
    });

    // Giới hạn tối đa 5 suggestions
    setSuggestions(newSuggestions.slice(0, 5));
  };


  const removeRecentSearch = async (searchTerm: string) => {
    const newSearches = recentSearches.filter(term => term !== searchTerm);
    setRecentSearches(newSearches);
    await saveRecentSearches(newSearches);
  };

  const clearAllRecentSearches = async () => {
    setRecentSearches([]);
    await saveRecentSearches([]);
  };

  const performSearch = async () => {
    setSearching(true);
    try {
      const results = await destinationService.searchDestinations({
        searchQuery,
      });
      
      // Debug logging
      console.log(`🔍 Search results for "${searchQuery}":`, results.length);
      console.log(`📊 Sample search results:`, results.slice(0, 3).map(d => ({ 
        name: d.name, 
        images: d.images?.length || 0, 
        imageUrl: d.imageUrl 
      })));
      
      setSearchResults(results);
      
      // Chỉ lưu tìm kiếm khi thực sự tìm kiếm (không phải khi gõ từng ký tự)
      if (searchQuery.trim() && searchQuery.trim() !== lastSearchQuery && !recentSearches.includes(searchQuery.trim())) {
        const newSearches = [searchQuery.trim(), ...recentSearches.slice(0, 9)]; // Giữ tối đa 10 tìm kiếm
        setRecentSearches(newSearches);
        await saveRecentSearches(newSearches);
        setLastSearchQuery(searchQuery.trim());
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleRecentSearch = async (query: string) => {
    setSearchQuery(query);
    // Khi click vào tìm kiếm gần đây, thực hiện tìm kiếm ngay với query được truyền vào
    setSearching(true);
    try {
      const results = await destinationService.searchDestinations({
        searchQuery: query,
      });
      setSearchResults(results);
      setLastSearchQuery(query);
    } catch (error) {
      console.error('Error performing recent search:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchSubmit = () => {
    // Khi người dùng nhấn Enter hoặc click tìm kiếm
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      performSearch();
    }
  };

  const handleSuggestionPress = async (suggestion: string) => {
    // Xử lý suggestion có format "Địa điểm ở {country}"
    let searchTerm = suggestion;
    if (suggestion.startsWith('Địa điểm ở ')) {
      searchTerm = suggestion.replace('Địa điểm ở ', '');
    }
    
    setSearchQuery(searchTerm);
    setShowSuggestions(false);
    
    // Thực hiện search ngay
    setSearching(true);
    try {
      const results = await destinationService.searchDestinations({
        searchQuery: searchTerm,
      });
      setSearchResults(results);
      setLastSearchQuery(searchTerm);
      
      // Lưu vào recent searches
      if (!recentSearches.includes(searchTerm)) {
        const newSearches = [searchTerm, ...recentSearches.slice(0, 9)];
        setRecentSearches(newSearches);
        await saveRecentSearches(newSearches);
      }
    } catch (error) {
      console.error('Error performing suggestion search:', error);
    } finally {
      setSearching(false);
    }
  };


  const handleFavoritePress = async (destinationId: string) => {
    try {
      const isCurrentlyFavorite = userFavorites.some(fav => fav.id === destinationId);
      if (isCurrentlyFavorite) {
        removeFavorite(destinationId);
      } else {
        // Find the destination to add
        const destination = searchResults.find(dest => dest.id === destinationId);
        if (destination) {
          addFavorite(destination);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Swipeable Recent Search Item Component
  const SwipeableRecentSearchItem: React.FC<{
    search: string;
    index: number;
    onPress: () => void;
    onDelete: () => void;
  }> = ({ search, index, onPress, onDelete }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const deleteThreshold = 100;

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        },
        onPanResponderGrant: () => {
          translateX.setOffset((translateX as any)._value || 0);
          translateX.setValue(0);
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx < 0) {
            translateX.setValue(gestureState.dx);
          } else {
            translateX.setValue(0);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          translateX.flattenOffset();
          const currentValue = (translateX as any)._value || 0;
          
          if (currentValue < -deleteThreshold) {
            Animated.timing(translateX, {
              toValue: -width,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              onDelete();
            });
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }).start();
          }
        },
      })
    ).current;

    return (
      <View style={styles.swipeableContainer}>
        <Animated.View
          style={[
            styles.recentItem,
            {
              transform: [{ translateX }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={styles.recentItemContent}
          >
            <Ionicons
              name="time-outline"
              size={20}
              color={COLORS.black}
            />
            <Text style={styles.recentText}>{search}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Tìm kiếm"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          placeholder="Tìm kiếm điểm đến..."
          autoFocus
        />
      </View>


      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đề xuất</Text>
            <View style={styles.recentContainer}>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentItem}
                  onPress={() => handleSuggestionPress(suggestion)}
                  activeOpacity={0.7}
                >
                  <View style={styles.recentItemContent}>
                    <Ionicons
                      name="search-outline"
                      size={20}
                      color={COLORS.black}
                    />
                    <Text style={styles.recentText}>{suggestion}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {searchQuery.length === 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
              {recentSearches.length > 0 && (
                <TouchableOpacity onPress={clearAllRecentSearches}>
                  <Text style={styles.clearAllText}>Xóa tất cả</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.recentContainer}>
              {recentSearches.map((search, index) => (
                <SwipeableRecentSearchItem
                  key={index}
                  search={search}
                  index={index}
                  onPress={() => handleRecentSearch(search)}
                  onDelete={() => removeRecentSearch(search)}
                />
              ))}
            </View>
          </View>
        )}

        {searchQuery.length > 0 && searchResults.length === 0 && !searching && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyTitle}>
              {searchQuery.length < 3
                ? 'Nhập ít nhất 3 ký tự'
                : 'Không tìm thấy kết quả'}
            </Text>
            <Text style={styles.emptyText}>
              Thử tìm kiếm với từ khóa khác
            </Text>
          </View>
        )}

        {searchResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Kết quả ({searchResults.length})
            </Text>
            <View style={styles.listContainer}>
              {searchResults.map((destination) => (
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
                  />
                  <View style={styles.listCardContent}>
                    <Text style={styles.listCardTitle} numberOfLines={2}>
                      {destination.name}
                    </Text>
                    <View style={styles.listCardLocationRow}>
                      <Ionicons name="location" size={16} color="#FF0000" />
                      <Text style={styles.listCardLocation}>
                        {destination.country}
                      </Text>
                    </View>
                    <View style={styles.listCardRatingRow}>
                      <View style={styles.listCardRating}>
                        {renderStars(destination.rating || 4.8)}
                      </View>
                      <Text style={styles.listCardReviewsText}>
                        {destination.reviews || 100} reviews
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
                  {!isGuest && (
                    <TouchableOpacity
                      onPress={() => handleFavoritePress(destination.id)}
                      style={styles.favoriteIconButton}
                    >
                      <Ionicons
                        name={userFavorites.some(fav => fav.id === destination.id) ? 'heart' : 'heart-outline'}
                        size={18}
                        color={userFavorites.some(fav => fav.id === destination.id) ? '#FF0000' : COLORS.white}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchSection: {
    paddingHorizontal: SIZES.md,
    marginVertical: SIZES.md,
  },
  section: {
    paddingHorizontal: SIZES.md,
    marginTop: SIZES.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  clearAllText: {
    ...FONTS.medium,
    fontSize: SIZES.body2,
    color: COLORS.error,
  },
  recentContainer: {
    gap: SIZES.sm,
  },
  swipeableContainer: {
    marginBottom: SIZES.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.soft,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    ...SHADOWS.light,
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  recentItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SIZES.sm,
  },
  recentText: {
    flex: 1,
    ...FONTS.medium,
    fontSize: SIZES.body2,
    color: COLORS.ink,
  },
  listContainer: {
    gap: SIZES.md,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.canvas,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    marginBottom: SIZES.sm,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.hairline,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  listImage: {
    width: 130,
    height: 120,
    borderRadius: SIZES.radiusMd,
    marginLeft: SIZES.sm,
    marginRight: SIZES.sm,
  },
  listCardContent: {
    flex: 1,
    padding: SIZES.lg,
    paddingRight: SIZES.xl,
  },
  listCardTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.text,
    marginBottom: SIZES.sm,
    lineHeight: 22,
  },
  listCardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
    marginBottom: SIZES.xs,
  },
  listCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listCardReviewsText: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
  },
  listCardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SIZES.xs,
  },
  listCardLocation: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.text,
  },
  listCardDurationTag: {
    backgroundColor: '#F5F5F5',
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: SIZES.xs,
  },
  listCardDurationText: {
    ...FONTS.medium,
    fontSize: SIZES.body3,
    color: COLORS.text,
  },
  favoriteIconButton: {
    position: 'absolute',
    top: SIZES.sm,
    right: SIZES.sm,
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxl,
    marginTop: SIZES.xxl,
  },
  emptyTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.text,
    marginTop: SIZES.md,
  },
  emptyText: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
  },
});

export default SearchScreen;
