import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList, Booking, Destination } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'OrderDetails'>;

interface OrderDetailsData {
  orderId: string;
  bookingDate: string;
  destination: Destination;
  departureDate: string;
  returnDate: string;
  guests: number;
  selectedServices: string[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
}

const OrderDetailsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  
  // Get order data from route params
  const params = route.params as any;
  const subtotal = params?.totalPrice || 0;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;
  
  const orderData: OrderDetailsData = {
    orderId: params?.orderId || `ORD-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    bookingDate: params?.bookingDate || new Date().toLocaleDateString('vi-VN'),
    destination: params?.destination || {
      id: '1',
      name: 'Paris, France',
      country: 'France',
      description: 'Beautiful destination',
      shortDescription: 'Beautiful destination',
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
      images: [],
      rating: 4.5,
      reviews: 120,
      price: 500,
      duration: '3 ngày 2 đêm',
      category: 'Cultural',
      featured: false,
      popular: true,
      highlights: [],
      amenities: [],
    },
    departureDate: params?.departureDate || '15/01/2024',
    returnDate: params?.returnDate || '18/01/2024',
    guests: params?.participants || 2,
    selectedServices: params?.services || ['1'],
    subtotal: subtotal,
    tax: tax,
    total: total,
    paymentMethod: params?.paymentMethod || 'Chưa thanh toán',
    status: params?.status || 'pending',
  };

  const getServiceName = (serviceId: string): string => {
    const serviceNames: Record<string, string> = {
      '1': 'Gói Cơ Bản',
      '2': 'Gói Tiêu Chuẩn',
      '3': 'Gói Cao Cấp',
      '4': 'Chụp ảnh kỷ niệm',
    };
    return serviceNames[serviceId] || `Dịch vụ ${serviceId}`;
  };

  // Get room type and capacity based on selected service package
  const getRoomInfo = () => {
    // Find the main package (1, 2, or 3)
    const mainPackage = orderData.selectedServices.find(id => ['1', '2', '3'].includes(id));
    
    switch (mainPackage) {
      case '1':
        return {
          roomType: 'Phòng Standard',
          bedType: 'Giường đôi',
          capacity: `${orderData.guests} người`,
        };
      case '2':
        return {
          roomType: 'Phòng Deluxe',
          bedType: 'Giường đôi hoặc 2 giường đơn',
          capacity: `${orderData.guests} người`,
        };
      case '3':
        return {
          roomType: 'Phòng Suite',
          bedType: 'Giường King Size',
          capacity: `${orderData.guests} người`,
        };
      default:
        return {
          roomType: 'Phòng Standard',
          bedType: 'Giường đôi',
          capacity: `${orderData.guests} người`,
        };
    }
  };

  const roomInfo = getRoomInfo();

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

  const formatDateForDisplay = (dateString: string): string => {
    try {
      // Parse date from "dd/mm/yyyy" format
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const year = parseInt(parts[2]);
        const date = new Date(year, month, day);
        
        const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                       'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        return `${day} ${months[month]}, ${year}`;
      }
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Header Card */}
        <View style={styles.orderHeaderCard}>
          <View style={styles.orderHeaderTop}>
            <View>
              <Text style={styles.orderIdLabel}>Mã đơn hàng</Text>
              <Text style={styles.orderId}>{orderData.orderId}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderData.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(orderData.status) }]}>
                {getStatusText(orderData.status)}
              </Text>
            </View>
          </View>
          <View style={styles.orderDateContainer}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.black} />
            <Text style={styles.orderDate}>Đặt ngày: {orderData.bookingDate}</Text>
          </View>
        </View>

        {/* Destination Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Địa điểm</Text>
          </View>
          <View style={styles.destinationContent}>
            <Image
              source={{ uri: orderData.destination.imageUrl || orderData.destination.images?.[0] }}
              style={styles.destinationImage}
            />
            <View style={styles.destinationInfo}>
              <Text style={styles.destinationName}>{orderData.destination.name}</Text>
              <View style={styles.countryContainer}>
                <Ionicons name="location" size={16} color="#FF0000" />
                <Text style={styles.destinationCountry}>{orderData.destination.country}</Text>
              </View>
              <View style={styles.destinationDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={14} color={COLORS.black} />
                  <Text style={styles.detailText}>{orderData.destination.duration}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="star" size={14} color={COLORS.rating} />
                  <Text style={styles.detailText}>{orderData.destination.rating}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Travel Dates Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Ngày đi & Ngày về</Text>
          </View>
          <View style={styles.datesRow}>
            {/* Left Column */}
            <View style={styles.dateColumn}>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Ngày khởi hành</Text>
                <Text style={styles.dateValue}>{formatDateForDisplay(orderData.departureDate)}</Text>
              </View>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Ngày kết thúc</Text>
                <Text style={styles.dateValue}>{formatDateForDisplay(orderData.returnDate)}</Text>
              </View>
            </View>

            {/* Middle Divider with Dots */}
            <View style={styles.dateDividerContainer}>
              <View style={styles.dateDividerLine}>
                <View style={[styles.dateDot, styles.dateDotEmpty]} />
                <View style={styles.dateDotLineContainer}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <View key={i} style={styles.dateDotLineSegment} />
                  ))}
                </View>
                <View style={[styles.dateDot, styles.dateDotFilled]} />
              </View>
            </View>

            {/* Right Column */}
            <View style={styles.dateColumn}>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Loại phòng</Text>
                <Text style={styles.dateValue}>{roomInfo.roomType}</Text>
              </View>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Sức chứa</Text>
                <Text style={styles.dateValue}>{roomInfo.capacity}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Guests & Services Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Thông tin khách hàng</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="people" size={22} style={{ marginRight: 5 }} color="#4CAF50" />
              <Text style={styles.infoLabel}>Số lượng khách</Text>
            </View>
            <Text style={styles.infoValue}>{orderData.guests} người</Text>
          </View>
        </View>

        {/* Services Card */}
        {orderData.selectedServices && orderData.selectedServices.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Dịch vụ đã chọn</Text>
            </View>
            {orderData.selectedServices.map((serviceId, index) => (
              <View key={index} style={styles.serviceItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.serviceName}>{getServiceName(serviceId)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Price Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Tóm tắt giá</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giá tour</Text>
            <Text style={styles.priceValue}>${orderData.subtotal}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Thuế & Phí</Text>
            <Text style={styles.priceValue}>${orderData.tax}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>${orderData.total}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              (navigation as any).navigate('PaymentMethods', {
                destination: orderData.destination,
                services: orderData.selectedServices,
                departureDate: orderData.departureDate,
                returnDate: orderData.returnDate,
                participants: orderData.guests,
                totalPrice: orderData.total,
                orderId: orderData.orderId,
              });
            }}
          >
            <Text style={styles.primaryButtonText}>Thanh toán</Text>
          </TouchableOpacity>
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.hairline,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: COLORS.soft,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.ink,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 38,
  },
  orderHeaderCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.lg,
    marginTop: SIZES.lg,
    marginBottom: SIZES.md,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    ...SHADOWS.light,
  },
  orderHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.sm,
  },
  orderIdLabel: {
    ...FONTS.regular,
    fontSize: SIZES.caption,
    color: COLORS.slate,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SIZES.xxs,
  },
  orderId: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.ink,
  },
  statusBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull,
  },
  statusText: {
    ...FONTS.bold,
    fontSize: SIZES.caption,
  },
  orderDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  orderDate: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.slate,
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    ...SHADOWS.light,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    marginBottom: SIZES.md,
  },
  cardTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.text,
  },
  destinationContent: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  destinationImage: {
    width: 100,
    height: 100,
    borderRadius: SIZES.radiusSm,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  countryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
    marginBottom: SIZES.sm,
  },
  destinationCountry: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: '#888888',
  },
  destinationDetails: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  detailText: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.black,
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dateColumn: {
    flex: 1,
  },
  dateItem: {
    marginBottom: SIZES.lg,
  },
  dateLabel: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: '#888888',
    marginBottom: SIZES.xs,
  },
  dateValue: {
    ...FONTS.bold,
    fontSize: SIZES.body1,
    color: COLORS.black,
  },
  dateDividerContainer: {
    width: 40,
    marginHorizontal: SIZES.md,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  dateDividerLine: {
    width: 2,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 80,
  },
  dateDotLineContainer: {
    flex: 1,
    width: 2,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  dateDotLineSegment: {
    width: 2,
    height: 4,
    backgroundColor: COLORS.primary,
    marginVertical: 1,
  },
  dateDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    zIndex: 10,
  },
  dateDotEmpty: {
    // Empty circle at top
  },
  dateDotFilled: {
    backgroundColor: COLORS.primary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  infoLabel: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.black,
  },
  infoValue: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.text,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  serviceName: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.text,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  priceLabel: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.black,
  },
  priceValue: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.black,
  },
  priceDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: SIZES.md,
  },
  totalLabel: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.black,
  },
  totalValue: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.primary,
  },
  actionButtons: {
    marginHorizontal: SIZES.lg,
    marginVertical: SIZES.lg,
  },
  primaryButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  primaryButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.body1,
    color: COLORS.white,
  },
});

export default OrderDetailsScreen;

