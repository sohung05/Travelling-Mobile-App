import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { Destination } from '../types';

interface DestinationCardProps {
  destination: Destination;
  onPress: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  style?: any;
  index?: number;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.52; // Elegant portrait width allowing multiple cards to peek

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onPress,
  onFavoritePress,
  isFavorite = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.9}
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

        {/* Cinematic dark scrim gradient from mid to bottom */}
        <LinearGradient
          colors={['transparent', 'rgba(19, 78, 74, 0.15)', 'rgba(15, 35, 34, 0.88)']}
          locations={[0.3, 0.6, 1]}
          style={styles.gradient}
        />

        {/* Top-Right Favorite Button */}
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavoritePress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? '#EF4444' : COLORS.white}
            />
          </TouchableOpacity>
        )}

        {/* Bottom Destination Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {destination.name}
          </Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={12} color={COLORS.primaryLight} />
            <Text style={styles.locationText} numberOfLines={1}>
              {destination.country}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            {/* Rating */}
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={13} color={COLORS.rating} />
              <Text style={styles.rating}>{(destination.rating || 4.8).toFixed(1)}</Text>
              <Text style={styles.reviews}>({destination.reviews ? `${destination.reviews}+` : '4k+'})</Text>
            </View>

            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>From</Text>
              <Text style={styles.price}>${destination.price}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 14,
  },
  card: {
    width: CARD_WIDTH,
    height: 250,
    borderRadius: SIZES.radiusXl,
    overflow: 'hidden',
    backgroundColor: COLORS.primaryDark,
    ...SHADOWS.light,
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
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  name: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.white,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 8,
  },
  locationText: {
    ...FONTS.medium,
    fontSize: 12,
    color: '#D1E7E5',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    ...FONTS.bold,
    fontSize: 12,
    color: COLORS.white,
  },
  reviews: {
    ...FONTS.regular,
    fontSize: 11,
    color: '#CBD5E1',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    ...FONTS.regular,
    fontSize: 10,
    color: '#CBD5E1',
    lineHeight: 12,
  },
  price: {
    ...FONTS.bold,
    fontSize: 15,
    color: COLORS.white,
  },
});

export default DestinationCard;
