import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList, Booking, Review } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCreateReview, useUserReviewForDestination } from '../api';
import { useQueryClient } from '@tanstack/react-query';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'TourReview'>;

const TourReviewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const booking = (route.params as any)?.booking;
  const { user, addReview, userReviews } = useAuth();

  // Use React Query hooks for reviews with caching
  const { data: existingReview } = useUserReviewForDestination(user?.id, booking?.destination?.id);
  const createReviewMutation = useCreateReview();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has already reviewed this tour
  // Check both React Query cache and local state
  const hasAlreadyReviewed = () => {
    // First check React Query cache (most reliable, from backend)
    if (existingReview) {
      return true;
    }
    // Fallback to local state
    return userReviews.some(review => 
      review.destinationId === booking.destination?.id && 
      review.userId === user?.id
    );
  };

  // Get existing review if user has already reviewed
  // Priority: React Query cache > local state
  const getExistingReview = () => {
    // First check React Query cache (from backend)
    if (existingReview) {
      return existingReview;
    }
    // Fallback to local state
    return userReviews.find(review => 
      review.destinationId === booking.destination?.id && 
      review.userId === user?.id
    );
  };

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmitReview = async () => {
    // Check if user has already reviewed this tour (check both sources)
    if (existingReview || hasAlreadyReviewed()) {
      Alert.alert(
        'Đã đánh giá',
        'Bạn đã đánh giá tour này rồi. Mỗi tour chỉ được đánh giá một lần.',
        [
          {
            text: 'Xem đánh giá của tôi',
            onPress: () => navigation.navigate('Reviews', { destinationId: booking.destination?.id || '' }),
          },
          {
            text: 'Quay lại',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      return;
    }

    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn đánh giá sao cho tour này.');
      return;
    }

    if (reviewText.trim().length < 10) {
      Alert.alert('Thông báo', 'Vui lòng viết ít nhất 10 ký tự cho đánh giá của bạn.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use React Query mutation to create review (will invalidate cache automatically)
      const newReview = await createReviewMutation.mutateAsync({
        userId: user?.id || 'user-1',
        destinationId: booking.destination?.id || '',
        rating: rating,
        comment: reviewText.trim(),
      });

      // Add review to context for immediate UI update (but don't auto-create in backend)
      // Note: addReview in AuthContext will NOT auto-create in backend anymore
      addReview(newReview);

      Alert.alert(
        'Thành công',
        'Cảm ơn bạn đã đánh giá tour! Đánh giá của bạn đã được ghi nhận.',
        [
          {
            text: 'Xem đánh giá',
            onPress: () => navigation.navigate('Reviews', { destinationId: booking.destination?.id || '' }),
          },
          {
            text: 'Đặt chỗ',
            onPress: () => (navigation as any).navigate('MainTabs', { screen: 'Bookings' }),
          },
        ]
      );
      
      // Reset form after success
      setRating(0);
      setReviewText('');
    } catch (error: any) {
      console.error('Error creating review:', error);
      
      // Handle specific error message from backend
      // HttpClient throws error with message from backend ApiResponse
      // Backend format: { success: false, message: "You have already reviewed..." }
      const errorMessage = error?.message || 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.';
      
      // Check for duplicate review error (in both English and Vietnamese)
      if (errorMessage.toLowerCase().includes('already reviewed') || 
          errorMessage.toLowerCase().includes('đã đánh giá') ||
          errorMessage.toLowerCase().includes('already exists')) {
        
        // Invalidate cache to refresh existingReview
        if (user?.id && booking.destination?.id) {
          queryClient.invalidateQueries({ 
            queryKey: ['reviews', 'user', user.id, 'destination', booking.destination.id] 
          });
        }
        
        Alert.alert(
          'Đã đánh giá',
          'Bạn đã đánh giá tour này rồi. Mỗi tour chỉ được đánh giá một lần.',
          [
            {
              text: 'Xem đánh giá',
              onPress: () => navigation.navigate('Reviews', { destinationId: booking.destination?.id || '' }),
            },
            {
              text: 'Quay lại',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          style={styles.starButton}
          onPress={() => handleStarPress(i)}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={32}
            color={i <= rating ? COLORS.rating : COLORS.gray}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return 'Rất tệ';
      case 2:
        return 'Tệ';
      case 3:
        return 'Bình thường';
      case 4:
        return 'Tốt';
      case 5:
        return 'Tuyệt vời';
      default:
        return 'Chọn đánh giá';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Đánh giá tour</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tour Info */}
        <View style={styles.section}>
          <View style={styles.tourCard}>
            <Image
              source={{ uri: booking.destination?.imageUrl || booking.destination?.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
              style={styles.tourImage}
            />
            <View style={styles.tourInfo}>
              <Text style={styles.tourName}>{booking.destination?.name || 'Không có tên'}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="#FF0000" />
                <Text style={styles.tourCountry}>{booking.destination?.country || 'Không xác định'}</Text>
              </View>
              <View style={styles.tourDates}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.dateText}>
                  {booking.departureDate} - {booking.returnDate}
                </Text>
              </View>
              <View style={styles.tourGuests}>
                <Ionicons name="people-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.guestsText}>{booking.guests} người</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        {!hasAlreadyReviewed() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đánh giá tổng thể</Text>
            
            <View style={styles.ratingCard}>
              <View style={styles.starsContainer}>
                {renderStars()}
              </View>
              <Text style={styles.ratingText}>{getRatingText()}</Text>
            </View>
          </View>
        )}

        {/* Review Text Section */}
        {!hasAlreadyReviewed() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chia sẻ trải nghiệm của bạn</Text>
            
            <View style={styles.reviewCard}>
              <TextInput
                style={styles.reviewInput}
                placeholder="Hãy chia sẻ trải nghiệm của bạn về chuyến đi này... (ít nhất 10 ký tự)"
                placeholderTextColor={COLORS.black}
                multiline
                numberOfLines={6}
                value={reviewText}
                onChangeText={setReviewText}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {reviewText.length}/500 ký tự
              </Text>
            </View>
          </View>
        )}

        {/* Show existing review if already reviewed */}
        {hasAlreadyReviewed() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
            
            <View style={styles.existingReviewCard}>
              <View style={styles.existingReviewHeader}>
                <View style={styles.existingReviewStars}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Ionicons
                      key={index}
                      name={index < (getExistingReview()?.rating || 0) ? 'star' : 'star-outline'}
                      size={20}
                      color={COLORS.rating}
                    />
                  ))}
                </View>
                <Text style={styles.existingReviewDate}>
                  {new Date(getExistingReview()?.createdAt || '').toLocaleDateString('vi-VN')}
                </Text>
              </View>
              <Text style={styles.existingReviewText}>
                {getExistingReview()?.comment}
              </Text>
            </View>
          </View>
        )}

        {/* Review Guidelines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hướng dẫn đánh giá</Text>
          
          <View style={styles.guidelinesCard}>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.guidelineText}>
                Chia sẻ trải nghiệm thực tế của bạn
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.guidelineText}>
                Đề xuất cải thiện để chúng tôi phục vụ tốt hơn
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.guidelineText}>
                Tránh nội dung không phù hợp hoặc spam
              </Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        {!hasAlreadyReviewed() && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (rating === 0 || reviewText.trim().length < 10 || isSubmitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitReview}
              disabled={rating === 0 || reviewText.trim().length < 10 || isSubmitting || createReviewMutation.isPending}
            >
              {(isSubmitting || createReviewMutation.isPending) ? (
                <Text style={styles.submitButtonText}>Đang gửi...</Text>
              ) : (
                <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* View Reviews Button for already reviewed */}
        {hasAlreadyReviewed() && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.viewReviewsButton}
              onPress={() => navigation.navigate('Reviews', { destinationId: booking.destination?.id || '' })}
            >
              <Text style={styles.viewReviewsButtonText}>Xem tất cả đánh giá</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 20 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.veryLightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  section: {
    paddingHorizontal: SIZES.md,
    marginTop: SIZES.lg,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  tourCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    flexDirection: 'row',
    ...SHADOWS.light,
  },
  tourImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radiusSm,
    marginRight: SIZES.md,
  },
  tourInfo: {
    flex: 1,
  },
  tourName: {
    ...FONTS.bold,
    fontSize: SIZES.h6,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  tourCountry: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: '#808080',
    marginLeft: SIZES.xs,
  },
  tourDates: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  dateText: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.black,
    marginLeft: SIZES.xs,
  },
  tourGuests: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestsText: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.black,
    marginLeft: SIZES.xs,
  },
  ratingCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.md,
  },
  starButton: {
    marginHorizontal: SIZES.xs,
  },
  ratingText: {
    ...FONTS.semiBold,
    fontSize: SIZES.h6,
    color: COLORS.text,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    ...SHADOWS.light,
  },
  reviewInput: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.black,
    textAlign: 'right',
    marginTop: SIZES.sm,
  },
  guidelinesCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    ...SHADOWS.light,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  guidelineText: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.text,
    marginLeft: SIZES.sm,
    flex: 1,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  submitButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.body1,
    color: COLORS.white,
  },
  existingReviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    ...SHADOWS.light,
  },
  existingReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  existingReviewStars: {
    flexDirection: 'row',
  },
  existingReviewDate: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
  },
  existingReviewText: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.text,
    lineHeight: 20,
  },
  viewReviewsButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...SHADOWS.light,
  },
  viewReviewsButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.body1,
    color: COLORS.white,
    marginRight: SIZES.sm,
  },
});

export default TourReviewScreen;
