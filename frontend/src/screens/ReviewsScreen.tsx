import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';

import { COLORS, SIZES, FONTS } from '../constants/theme';
import { RootStackParamList, Review } from '../types';
import { mockReviews, useReviewsByDestination } from '../api';
import { Header, Loading } from '../components';
import { useAuth } from '../contexts/AuthContext';

type RouteProps = RouteProp<RootStackParamList, 'Reviews'>;

const ReviewsScreen = () => {
  const route = useRoute<RouteProps>();
  const { destinationId } = route.params;
  const { userReviews } = useAuth();
  
  // Use React Query hook for reviews with caching
  const { data: apiReviews = [], isLoading, refetch } = useReviewsByDestination(destinationId);

  // Combine API reviews, mock reviews, and user reviews
  // Deduplicate by ID to avoid duplicate keys
  const reviews = React.useMemo(() => {
    const mockDestinationReviews = mockReviews.filter(review => 
      review.destinationId === destinationId
    );
    
    const userDestinationReviews = userReviews.filter(review => 
      review.destinationId === destinationId
    );
    
    // Combine all reviews and deduplicate by ID
    // Priority: apiReviews > userReviews > mockReviews
    const reviewsMap = new Map<string, Review>();
    
    // First add mock reviews (lowest priority)
    mockDestinationReviews.forEach(review => {
      if (review.id && !reviewsMap.has(review.id)) {
        reviewsMap.set(review.id, review);
      }
    });
    
    // Then add user reviews (medium priority)
    userDestinationReviews.forEach(review => {
      if (review.id && !reviewsMap.has(review.id)) {
        reviewsMap.set(review.id, review);
      }
    });
    
    // Finally add API reviews (highest priority - override duplicates)
    apiReviews.forEach(review => {
      if (review.id) {
        reviewsMap.set(review.id, review);
      }
    });
    
    // Convert map values to array and sort by date (newest first)
    const allReviews = Array.from(reviewsMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return allReviews;
  }, [apiReviews, destinationId, userReviews]);

  const loading = isLoading;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={16}
        color={index < rating ? COLORS.rating : COLORS.lightGray}
      />
    ));
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Đánh giá" showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {reviews.map((review, index) => (
            <View
              key={review.id}
              style={styles.reviewCard}
            >
              <View style={styles.reviewHeader}>
                <Image
                  source={{
                    uri: review.userAvatar || 'https://via.placeholder.com/50',
                  }}
                  style={styles.avatar}
                />
                <View style={styles.reviewHeaderInfo}>
                  <Text style={styles.userName}>{review.userName}</Text>
                  <View style={styles.starsRow}>{renderStars(review.rating)}</View>
                </View>
                <Text style={styles.date}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <Text style={styles.comment}>{review.comment}</Text>

              {review.images && review.images.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.reviewImagesContainer}
                >
                  {review.images.map((image, imgIndex) => (
                    <Image
                      key={imgIndex}
                      source={{ uri: image }}
                      style={styles.reviewImage}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.md,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SIZES.sm,
  },
  reviewHeaderInfo: {
    flex: 1,
  },
  userName: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.text,
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  date: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
  },
  comment: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.black,
    lineHeight: 22,
  },
  reviewImagesContainer: {
    marginTop: SIZES.sm,
    gap: SIZES.sm,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: SIZES.radius,
    marginRight: SIZES.sm,
  },
});

export default ReviewsScreen;


