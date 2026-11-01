import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { Button } from '../components';
import { useAuth } from '../contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FavoritesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isGuest, userFavorites, removeFavorite, setPendingScreenAccess } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isGuest) {
      setPendingScreenAccess('Favorites');
      navigation.navigate('Login');
      return;
    }
  }, [isGuest]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 300);
  };

  const handleFavoritePress = async (destinationId: string) => {
    try {
      removeFavorite(destinationId);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
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
        {userFavorites.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={36} color={COLORS.slate} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có điểm đến yêu thích</Text>
            <Text style={styles.emptyText}>
              Hãy khám phá các chuyến đi và chạm vào biểu tượng trái tim để lưu lại những nơi bạn muốn ghé thăm.
            </Text>
            <Button
              title="Khám phá ngay"
              onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Explore' })}
              variant="primary"
              size="medium"
              style={{ marginTop: SIZES.lg, minWidth: 160 }}
            />
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {userFavorites.map((destination) => (
              <View key={destination.id} style={styles.gridItem}>
                <TouchableOpacity
                  style={styles.card}
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
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.15)', 'transparent', 'rgba(19, 78, 74, 0.9)']}
                    locations={[0, 0.4, 1]}
                    style={styles.gradient}
                  />

                  {/* Favorite Remove Button */}
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => handleFavoritePress(destination.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="heart" size={16} color="#EF4444" />
                  </TouchableOpacity>

                  {/* Card Content Overlay */}
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {destination.name}
                    </Text>

                    <View style={styles.countryRow}>
                      <Ionicons name="location-sharp" size={11} color="#A7F3D0" />
                      <Text style={styles.countryText} numberOfLines={1}>
                        {destination.country}
                      </Text>
                    </View>

                    <View style={styles.cardBottom}>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={11} color="#F59E0B" />
                        <Text style={styles.ratingText}>
                          {(destination.rating || 4.8).toFixed(1)}
                        </Text>
                      </View>
                      <View style={styles.priceContainer}>
                        <Text style={styles.pricePrefix}>Từ </Text>
                        <Text style={styles.price}>${destination.price}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 130 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.sm,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 110,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.lg - 6,
  },
  gridItem: {
    width: '50%',
    padding: 6,
  },
  card: {
    height: 220,
    borderRadius: SIZES.cardRadius,
    overflow: 'hidden',
    backgroundColor: COLORS.primaryDark,
    ...SHADOWS.medium,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...SHADOWS.light,
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.md - 2,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  countryText: {
    ...FONTS.medium,
    fontSize: 11,
    color: '#CCFBF1',
  },
  cardName: {
    ...FONTS.bold,
    fontSize: 15,
    color: COLORS.white,
    marginBottom: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    ...FONTS.bold,
    fontSize: 11,
    color: COLORS.white,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pricePrefix: {
    ...FONTS.regular,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  price: {
    ...FONTS.black,
    fontSize: 13,
    color: COLORS.white,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxl * 1.5,
    paddingHorizontal: SIZES.xl,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E6F4F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  emptyTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.ink,
    marginBottom: SIZES.xs,
  },
  emptyText: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FavoritesScreen;
