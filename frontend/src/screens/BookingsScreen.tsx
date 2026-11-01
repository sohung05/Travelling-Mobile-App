import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList, Booking } from '../types';
import { bookingService, userService } from '../api';
import { Loading } from '../components';
import { useAuth } from '../contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BookingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, isGuest, userBookings, setPendingScreenAccess, removeBooking, userReviews, refreshBookings } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  // Refresh bookings when screen is focused (e.g., coming back from payment)
  useFocusEffect(
    React.useCallback(() => {
      if (!isGuest && user) {
        console.log('🔄 BookingsScreen: Screen focused, refreshing bookings...');
        refreshBookings();
      }
    }, [isGuest, user, refreshBookings])
  );

  useEffect(() => {
    if (isGuest) {
      setPendingScreenAccess('Bookings');
      navigation.navigate('Login');
      return;
    }
    console.log('🔄 BookingsScreen: useEffect triggered');
    console.log('🔄 userBookings from context:', userBookings.length);
    loadBookings();
  }, [activeTab, isGuest, userBookings]);

  // Auto refresh every minute to update status based on real-time
  useEffect(() => {
    const interval = setInterval(() => {
      loadBookings();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [userBookings]);

  const loadBookings = async () => {
    try {
      // Chỉ sử dụng userBookings từ context, không load từ API
      const now = new Date();
      
      // Log để debug
      console.log('📋 Total bookings:', userBookings.length);
      if (userBookings.length > 0) {
        console.log('📋 First booking:', {
          id: userBookings[0].id,
          destination: userBookings[0].destination?.name,
          imageUrl: userBookings[0].destination?.imageUrl,
          images: userBookings[0].destination?.images
        });
      }
      
      if (activeTab === 'upcoming') {
        // Sắp tới: chỉ tour active (confirmed/pending) và chưa qua ngày khởi hành
        const upcoming = userBookings.filter(booking => {
          const depDate = new Date(booking.departureDate.split('/').reverse().join('-'));
          return depDate > now && (booking.status === 'confirmed' || booking.status === 'pending');
        });
        setBookings(upcoming);
      } else {
        // Lịch sử: bao gồm completed, cancelled (trong vòng 7 ngày), và các tour đã qua ngày
        const history = userBookings.filter(booking => {
          const depDate = new Date(booking.departureDate.split('/').reverse().join('-'));
          
          // Nếu tour bị hủy, chỉ hiển thị trong vòng 7 ngày kể từ ngày tạo booking
          if (booking.status === 'cancelled') {
            const createdDate = new Date(booking.createdAt);
            const daysSinceCreated = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            // Chỉ hiển thị tour đã hủy trong vòng 7 ngày
            return daysSinceCreated <= 7;
          }
          
          // Các tour khác (completed hoặc đã qua ngày)
          return depDate <= now || booking.status === 'completed';
        });
        setBookings(history);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshBookings();
      // loadBookings will be triggered automatically when userBookings changes
    } catch (error) {
      console.error('Failed to refresh bookings:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string, departureDate: string) => {
    const now = new Date();
    // Convert departureDate from "dd/mm/yyyy" to Date
    const departure = new Date(departureDate.split('/').reverse().join('-'));
    
    // Kiểm tra status trước
    if (status === 'cancelled') {
      return COLORS.error;
    }
    
    if (status === 'completed') {
      return COLORS.info;
    }
    
    // Nếu tour đã qua thời gian khởi hành
    if (departure <= now) {
      return COLORS.info; // Màu xanh cho "Đã hoàn thành"
    }
    
    // Nếu tour chưa tới thời gian khởi hành (sắp tới)
    switch (status) {
      case 'confirmed':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      default:
        return COLORS.gray;
    }
  };

  const getStatusText = (status: string, departureDate: string) => {
    const now = new Date();
    // Convert departureDate from "dd/mm/yyyy" to Date
    const departure = new Date(departureDate.split('/').reverse().join('-'));
    
    // Kiểm tra status trước
    if (status === 'cancelled') {
      return 'Đã hủy';
    }
    
    if (status === 'completed') {
      return 'Đã hoàn thành';
    }
    
    // Nếu tour đã qua thời gian khởi hành
    if (departure <= now) {
      return 'Đã hoàn thành';
    }
    
    // Nếu tour chưa tới thời gian khởi hành (sắp tới)
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xử lý';
      default:
        return status;
    }
  };

  const formatBookingDate = (departureDate: string, returnDate: string, createdAt?: string, isHistory: boolean = false) => {
    try {
      if (isHistory && createdAt) {
        // For history tab, show booking date (createdAt)
        const date = new Date(createdAt);
        const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                       'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${day} ${month}, ${year}, ${displayHours}:${minutes} ${ampm}`;
      } else {
        // For upcoming tab, show travel dates
        const formatDate = (dateStr: string) => {
          const [day, month, year] = dateStr.split('/');
          return new Date(`${year}-${month}-${day}`);
        };

        const depDate = formatDate(departureDate);
        const retDate = formatDate(returnDate);
        
        const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                       'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        
        const depDay = depDate.getDate();
        const depMonth = months[depDate.getMonth()];
        const depYear = depDate.getFullYear();
        
        const retDay = retDate.getDate();
        const retMonth = months[retDate.getMonth()];
        const retYear = retDate.getFullYear();
        
        if (depMonth === retMonth && depYear === retYear) {
          return `${depDay} - ${retDay} ${depMonth}, ${depYear}`;
        } else {
          return `${depDay} ${depMonth}, ${depYear} - ${retDay} ${retMonth}, ${retYear}`;
        }
      }
    } catch (error) {
      return isHistory ? createdAt || '' : `${departureDate} - ${returnDate}`;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={13} color="#F59E0B" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={13} color="#F59E0B" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={13} color="#CBD5E1" />
        );
      }
    }
    return stars;
  };

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Hủy đặt chỗ',
      'Bạn có chắc chắn muốn hủy đặt chỗ này? Hành động này không thể hoàn tác.',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đặt chỗ',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await bookingService.cancelBooking(booking.id);
              if (success) {
                // Remove booking from context
                removeBooking(booking.id);
                Alert.alert('Thành công', 'Đặt chỗ đã được hủy thành công.');
              } else {
                Alert.alert('Lỗi', 'Không thể hủy đặt chỗ. Vui lòng thử lại sau.');
              }
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert('Lỗi', 'Không thể hủy đặt chỗ. Vui lòng thử lại sau.');
            }
          },
        },
      ]
    );
  };

  const hasReviewed = (destinationId: string) => {
    return userReviews.some(
      review => review.destinationId === destinationId && review.userId === user?.id
    );
  };

  const handleWriteReview = (booking: Booking) => {
    navigation.navigate('TourReview', { booking } as any);
  };

  const handleBookAgain = (booking: Booking) => {
    navigation.navigate('DestinationDetail', { destination: booking.destination });
  };

  if (loading) {
    return <Loading fullScreen />;
  }


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Section Eyebrow */}
      <View style={styles.header}>
      </View>

      {/* Capsule Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.activeTabText,
            ]}
          >
            Sắp khởi hành
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}
          >
            Lịch sử chuyến đi
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="calendar-outline"
                size={36}
                color={COLORS.slate}
              />
            </View>
            <Text style={styles.emptyTitle}>Chưa có đặt chỗ nào</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming'
                ? 'Bắt đầu khám phá và đặt chuyến đi tuyệt vời của bạn ngay hôm nay!'
                : 'Bạn chưa có chuyến đi nào trong lịch sử đặt chỗ.'}
            </Text>
          </View>
        ) : (
          <View style={styles.bookingsContainer}>
            {bookings.map((booking, index) => (
              <View key={booking.id} style={styles.bookingCard}>
                {/* Booking ID, Date, and Status Badge */}
                <View style={styles.bookingHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookingId}>#{booking.id.slice(-8).toUpperCase()}</Text>
                    <Text style={styles.bookingDate}>
                      {activeTab === 'history' ? 'Ngày đặt: ' : 'Ngày đi: '}
                      {formatBookingDate(booking.departureDate, booking.returnDate, booking.createdAt, activeTab === 'history')}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          booking.status === 'confirmed'
                            ? '#E6F4F2'
                            : booking.status === 'pending'
                            ? '#FEF3C7'
                            : booking.status === 'cancelled'
                            ? '#FEE2E2'
                            : '#F1F5F9',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color:
                            booking.status === 'confirmed'
                              ? COLORS.primary
                              : booking.status === 'pending'
                              ? '#D97706'
                              : booking.status === 'cancelled'
                              ? '#DC2626'
                              : COLORS.slate,
                        },
                      ]}
                    >
                      {getStatusText(booking.status, booking.departureDate)}
                    </Text>
                  </View>
                </View>

                {/* Property/Tour Details */}
                <View style={styles.bookingContent}>
                  {/* Image */}
                  <Image
                    source={{
                      uri:
                        booking.destination?.imageUrl ||
                        booking.destination?.images?.[0] ||
                        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                    }}
                    style={styles.bookingImage}
                  />

                  {/* Details */}
                  <View style={styles.bookingDetails}>
                    {/* Name */}
                    <Text style={styles.destinationName} numberOfLines={1}>
                      {booking.destination?.name || 'Không có tên'}
                    </Text>

                    {/* Location */}
                    <View style={styles.locationContainer}>
                      <Ionicons name="location-sharp" size={13} color={COLORS.primary} />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {booking.destination?.country || 'Không xác định'}
                      </Text>
                    </View>

                    {/* Rating */}
                    <View style={styles.ratingContainer}>
                      <View style={styles.starsContainer}>
                        {renderStars(booking.destination?.rating || 0)}
                      </View>
                      <Text style={styles.ratingText}>
                        {booking.destination?.rating?.toFixed(1) || '0.0'}
                      </Text>
                    </View>
                    <Text style={styles.reviewsText}>
                      ({booking.destination?.reviews || 0} đánh giá)
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {activeTab === 'upcoming' ? (
                    <>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => handleCancelBooking(booking)}
                        disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                      >
                        <Text
                          style={[
                            styles.cancelButtonText,
                            (booking.status === 'cancelled' || booking.status === 'completed') &&
                              styles.disabledButtonText,
                          ]}
                        >
                          Hủy
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.viewDetailsButton}
                        onPress={() => navigation.navigate('BookingDetail', { booking })}
                      >
                        <Text style={styles.viewDetailsButtonText}>Xem chi tiết</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.reviewButton}
                        onPress={() => handleWriteReview(booking)}
                        disabled={
                          hasReviewed(booking.destination?.id || '') || 
                          booking.status === 'cancelled'
                        }
                      >
                        <Text
                          style={[
                            styles.reviewButtonText,
                            (hasReviewed(booking.destination?.id || '') || booking.status === 'cancelled') &&
                              styles.disabledButtonText,
                          ]}
                        >
                          Viết đánh giá
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.bookAgainButton}
                        onPress={() => handleBookAgain(booking)}
                      >
                        <Text style={styles.bookAgainButtonText}>Đặt lại</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))}
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
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.xs,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.h3,
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E6F4F2',
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    borderRadius: SIZES.radiusFull,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radiusFull,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.light,
  },
  tabText: {
    ...FONTS.semiBold,
    fontSize: 12,
    color: COLORS.slate,
    letterSpacing: 0.2,
  },
  activeTabText: {
    ...FONTS.bold,
    fontSize: 12,
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 110,
  },
  bookingsContainer: {
    paddingHorizontal: SIZES.lg,
    gap: SIZES.md,
  },
  bookingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.cardRadius,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
    paddingBottom: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.hairline,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    marginLeft: SIZES.sm,
  },
  statusBadgeText: {
    ...FONTS.bold,
    fontSize: 11,
  },
  bookingId: {
    ...FONTS.bold,
    fontSize: 13,
    color: COLORS.ink,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  bookingDate: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.slate,
  },
  bookingContent: {
    flexDirection: 'row',
    marginBottom: SIZES.sm,
  },
  bookingImage: {
    width: 86,
    height: 86,
    borderRadius: 14,
    marginRight: SIZES.md,
    backgroundColor: COLORS.soft,
  },
  bookingDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: SIZES.xs,
  },
  ratingText: {
    ...FONTS.bold,
    fontSize: 11,
    color: COLORS.ink,
  },
  reviewsText: {
    ...FONTS.regular,
    fontSize: 11,
    color: COLORS.slate,
    marginBottom: 2,
  },
  destinationName: {
    ...FONTS.bold,
    fontSize: SIZES.body1,
    color: COLORS.ink,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    ...FONTS.semiBold,
    fontSize: 12,
    color: COLORS.slate,
    letterSpacing: 0.2,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginTop: SIZES.xs,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.hairline,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...FONTS.bold,
    fontSize: 12,
    color: COLORS.ink,
  },
  disabledButtonText: {
    color: COLORS.slate,
    opacity: 0.5,
  },
  viewDetailsButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  viewDetailsButtonText: {
    ...FONTS.bold,
    fontSize: 12,
    color: COLORS.white,
  },
  reviewButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: '#D1EAE6',
    backgroundColor: '#E6F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButtonText: {
    ...FONTS.semiBold,
    fontSize: 12,
    color: COLORS.primary,
  },
  bookAgainButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  bookAgainButtonText: {
    ...FONTS.bold,
    fontSize: 12,
    color: COLORS.white,
  },
  emptyState: {
    flex: 1,
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

export default BookingsScreen;

