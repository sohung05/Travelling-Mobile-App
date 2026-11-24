import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';

import { COLORS, SIZES, FONTS } from '../constants/theme';
import { RootStackParamList, Review } from '../types';
import { useReviewsByDestination } from '../api';
import { Header, Loading, Button } from '../components';
import { useAuth } from '../contexts/AuthContext';

type RouteProps = RouteProp<RootStackParamList, 'Reviews'>;

const ReviewsScreen = () => {
  const route = useRoute<RouteProps>();
  const { destinationId } = route.params;
  const { userReviews } = useAuth();

  // Use React Query hook for reviews with caching & refetch
  const {
    data: apiReviews = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useReviewsByDestination(destinationId);

  // Combine API reviews and user reviews for this destination
  // Do NOT mix mock reviews into actual API reviews
  const reviews = useMemo(() => {
    const userDestinationReviews = userReviews.filter(
      (review) => review.destinationId === destinationId
    );

    const reviewsMap = new Map<string, Review>();

    // Add local user reviews first
    userDestinationReviews.forEach((review) => {
      if (review.id) {
        reviewsMap.set(review.id, review);
      }
    });

    // Add API reviews from MongoDB (overriding any temporary local duplicates)
    apiReviews.forEach((review) => {
      if (review.id) {
        reviewsMap.set(review.id, review);
      }
    });

    // Sort by createdAt descending (newest first)
    return Array.from(reviewsMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [apiReviews, destinationId, userReviews]);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading && !isRefetching) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={reviews.length > 0 ? `Đánh giá (${reviews.length})` : 'Đánh giá'}
        showBack
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[COLORS.primary]}
          />
        }
      >
        {isError && reviews.length === 0 ? (
          <View style={styles.stateContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={64}
              color={COLORS.error || '#FF5252'}
            />
            <Text style={styles.errorTitle}>Không thể tải đánh giá</Text>
            <Text style={styles.errorMessage}>
              {(error as any)?.message || 'Vui lòng kiểm tra kết nối mạng và thử lại.'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : reviews.length === 0 ? (
          <View style={styles.stateContainer}>
            <Ionicons
              name="chatbox-ellipses-outline"
              size={64}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyTitle}>Chưa có đánh giá nào</Text>
            <Text style={styles.emptySubtitle}>
              Hãy là người đầu tiên chia sẻ cảm nhận về điểm đến này!
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Image
                    source={{
                      uri: review.userAvatar || 'https://via.placeholder.com/50',
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.reviewHeaderInfo}>
                    <Text style={styles.userName}>{review.userName || 'Người dùng'}</Text>
                    <View style={styles.starsRow}>{renderStars(review.rating)}</View>
                  </View>
                  <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
                </View>

                {review.comment ? (
                  <Text style={styles.comment}>{review.comment}</Text>
                ) : null}

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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: SIZES.md,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SIZES.sm,
    backgroundColor: COLORS.lightGray,
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
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
    minHeight: 350,
  },
  emptyTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h3,
    color: COLORS.text,
    marginTop: SIZES.md,
    marginBottom: SIZES.xs,
  },
  emptySubtitle: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h3,
    color: COLORS.text,
    marginTop: SIZES.md,
    marginBottom: SIZES.xs,
  },
  errorMessage: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusRound,
  },
  retryButtonText: {
    ...FONTS.semiBold,
    fontSize: SIZES.body2,
    color: COLORS.white,
  },
});

export default ReviewsScreen;
