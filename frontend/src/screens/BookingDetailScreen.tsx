import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { Header, Button } from '../components';
import { bookingService } from '../api';
import { useAuth } from '../contexts/AuthContext';

type RouteProps = RouteProp<RootStackParamList, 'BookingDetail'>;

const BookingDetailScreen = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { removeBooking } = useAuth();
  const { booking } = route.params;

  const handleCancelBooking = async () => {
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
              await bookingService.cancelBooking(booking.id);
              // Xóa booking khỏi context
              removeBooking(booking.id);
              Alert.alert(
                'Thành công',
                'Đặt chỗ đã được hủy thành công.',
                [{ 
                  text: 'OK',
                  onPress: () => navigation.goBack()
                }]
              );
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert(
                'Lỗi',
                'Không thể hủy đặt chỗ. Vui lòng thử lại sau.',
                [{ text: 'OK' }]
              );
            }
          }
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'cancelled':
        return COLORS.error;
      case 'completed':
        return COLORS.gray;
      default:
        return COLORS.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xử lý';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="Chi tiết đặt chỗ" 
        showBack 
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Booking Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: booking.destination?.imageUrl || 
              booking.destination?.images?.[0] || 
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
            }}
            style={styles.image}
          />
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(booking.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(booking.status)}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Destination Info */}
          <View style={styles.section}>
            <Text style={styles.destinationName}>{booking.destination?.name || 'Không có tên'}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="#FF0000" />
              <Text style={styles.location}>{booking.destination?.country || 'Không xác định'}</Text>
            </View>
          </View>

          {/* Booking Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin đặt chỗ</Text>
            
            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="calendar" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Ngày đi</Text>
                  <Text style={styles.detailValue}>
                    {booking.departureDate || new Date(booking.startDate).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="calendar" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Ngày về</Text>
                  <Text style={styles.detailValue}>
                    {booking.returnDate || new Date(booking.endDate).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="people" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Số khách</Text>
                  <Text style={styles.detailValue}>{booking.guests} người</Text>
                </View>
              </View>

              {booking.specialRequests && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="document-text" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Yêu cầu đặc biệt</Text>
                      <Text style={styles.detailValue}>
                        {booking.specialRequests}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Payment Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
            
            <View style={styles.detailCard}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Giá tour</Text>
                <Text style={styles.priceValue}>${booking.totalPrice}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Tổng cộng</Text>
                <Text style={styles.totalValue}>${booking.totalPrice}</Text>
              </View>

              {booking.paymentMethod && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="wallet" size={20} color="#4CAF50" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Phương thức thanh toán</Text>
                      <Text style={styles.detailValue}>
                        {booking.paymentMethod}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Booking ID */}
          <View style={styles.section}>
            <Text style={styles.bookingIdLabel}>Mã đặt chỗ</Text>
            <Text style={styles.bookingId}>#{booking.id.toUpperCase()}</Text>
          </View>

          {/* Action Buttons */}
          {booking.status === 'confirmed' && (
            <View
              style={styles.actionsContainer}
            >
              <Button
                title="Liên hệ hỗ trợ"
                onPress={() => {}}
                variant="primary"
                style={styles.supportButton}
              />
              <Button
                title="Hủy đặt chỗ"
                onPress={handleCancelBooking}
                variant="outline"
                style={styles.cancelButton}
                textStyle={styles.cancelButtonText}
              />
            </View>
          )}

          {/* Review Button for Completed Tours */}
          {booking.status === 'completed' && (
            <View style={styles.section}>
              <Button
                title="Đánh giá tour"
                onPress={() => (navigation as any).navigate('TourReview', { booking })}
                style={styles.reviewButton}
              />
            </View>
          )}

          <View style={{ height: 20 }} />
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
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: SIZES.md,
    right: SIZES.md,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusSm,
  },
  statusText: {
    ...FONTS.semiBold,
    fontSize: SIZES.body2,
    color: COLORS.white,
  },
  content: {
    padding: SIZES.md,
  },
  section: {
    marginBottom: SIZES.lg,
  },
  destinationName: {
    ...FONTS.bold,
    fontSize: SIZES.h3,
    color: COLORS.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    ...FONTS.medium,
    fontSize: SIZES.body1,
    color: '#808080',
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    ...SHADOWS.light,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: SIZES.sm,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.slate,
    marginBottom: 2,
  },
  detailValue: {
    ...FONTS.bold,
    fontSize: SIZES.body1,
    color: COLORS.ink,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.hairline,
    marginVertical: SIZES.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.xs,
  },
  priceLabel: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.slate,
  },
  priceValue: {
    ...FONTS.bold,
    fontSize: SIZES.body2,
    color: COLORS.ink,
  },
  totalLabel: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.ink,
  },
  totalValue: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.primary,
  },
  bookingIdLabel: {
    ...FONTS.regular,
    fontSize: SIZES.caption,
    color: COLORS.slate,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  bookingId: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.ink,
  },
  actionsContainer: {
    gap: SIZES.md,
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.xl,
  },
  supportButton: {
    minHeight: SIZES.buttonHeight,
    borderRadius: SIZES.radiusXl,
  },
  cancelButton: {
    minHeight: SIZES.buttonHeight,
    borderWidth: 1.5,
    borderColor: COLORS.liveRed,
    borderRadius: SIZES.radiusXl,
  },
  cancelButtonText: {
    color: COLORS.liveRed,
    ...FONTS.bold,
  },
  reviewButton: {
    backgroundColor: COLORS.ink,
    borderRadius: SIZES.radiusXl,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
});

export default BookingDetailScreen;

