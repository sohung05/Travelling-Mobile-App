import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList, Destination } from '../types';
import { useAuth } from '../contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'PaymentResult'>;

interface PaymentResultData {
  success: boolean;
  message: string;
  transactionId?: string;
  bookingId?: string;
  orderId: string;
  destination: Destination;
  totalPrice: number;
  paymentMethod: string;
  departureDate?: string;
  returnDate?: string;
  participants?: number;
}

const PaymentResultScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const params = route.params as any;
  const { user, refreshBookings } = useAuth();

  const resultData: PaymentResultData = {
    success: params?.success || false,
    message: params?.message || '',
    transactionId: params?.transactionId,
    bookingId: params?.bookingId,
    orderId: params?.orderId || '',
    destination: params?.destination,
    totalPrice: params?.totalPrice || 0,
    paymentMethod: params?.paymentMethod || '',
    departureDate: params?.departureDate,
    returnDate: params?.returnDate,
    participants: params?.participants,
  };

  // Format current date and time
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-');
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Get reference number (use transactionId or orderId)
  const refNumber = resultData.transactionId || resultData.orderId || 'N/A';

  // Auto-refresh bookings when payment is successful
  useEffect(() => {
    if (user && resultData.success) {
      console.log('🔄 Auto-refreshing bookings after successful payment...');
      refreshBookings();
    }
  }, [resultData.success, user, refreshBookings]);

  const handleViewBookings = () => {
    (navigation as any).replace('MainTabs', { screen: 'Bookings' });
  };

  const handleGetPDFReceipt = () => {
    // TODO: Implement PDF receipt generation
    console.log('Generate PDF receipt');
  };

  const handleRetryPayment = () => {
    navigation.goBack();
  };

  // Only show success screen for now
  if (!resultData.success) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán thất bại</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <View style={styles.content}>
            <View style={styles.errorIconContainer}>
              <View style={[styles.resultIcon, { backgroundColor: COLORS.error + '20' }]}>
                <Ionicons name="close-circle" size={80} color={COLORS.error} />
              </View>
            </View>

            <View style={styles.messageContainer}>
              <Text style={[styles.resultTitle, { color: COLORS.error }]}>
                Thanh toán thất bại
              </Text>
              <Text style={styles.resultMessage}>
                {resultData.message || 'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.'}
              </Text>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRetryPayment}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={20} color={COLORS.white} />
                <Text style={styles.primaryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Card */}
        <View style={styles.successCard}>
          {/* Success Icon with Confetti */}
          <View style={styles.iconContainer}>
            {/* Confetti pieces */}
            <View style={[styles.confetti, styles.confetti1]} />
            <View style={[styles.confetti, styles.confetti2]} />
            <View style={[styles.confetti, styles.confetti3]} />
            <View style={[styles.confetti, styles.confetti4]} />
            <View style={[styles.confetti, styles.confetti5]} />
            
            {/* Success Circle */}
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={60} color={COLORS.white} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.successTitle}>Thanh toán thành công!</Text>

          {/* Payment Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã tham chiếu</Text>
              <Text style={styles.detailValue}>{refNumber}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ngày</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Giờ</Text>
              <Text style={styles.detailValue}>{formattedTime}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phương thức thanh toán</Text>
              <Text style={styles.detailValue}>{resultData.paymentMethod || 'Thẻ tín dụng'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số tiền</Text>
              <Text style={styles.detailValue}>
                ${resultData.totalPrice.toFixed(2).replace(/\.00$/, '')}
              </Text>
            </View>
          </View>

          {/* Get PDF Receipt Button */}
          <TouchableOpacity
            style={styles.pdfButton}
            onPress={handleGetPDFReceipt}
            activeOpacity={0.7}
          >
            <Ionicons name="download-outline" size={20} color="#888888" />
            <Text style={styles.pdfButtonText}>Tải hóa đơn PDF</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* View Booking Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.viewBookingButton}
          onPress={handleViewBookings}
          activeOpacity={0.8}
        >
          <Text style={styles.viewBookingButtonText}>Xem đặt chỗ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.black,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SIZES.lg,
  },
  content: {
    padding: SIZES.lg,
  },
  successCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.xl,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  iconContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.xl,
    position: 'relative',
  },
  confetti: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  confetti1: {
    backgroundColor: '#4FC3F7', // Blue
    top: 10,
    left: 20,
  },
  confetti2: {
    backgroundColor: '#F06292', // Pink
    top: 15,
    right: 25,
  },
  confetti3: {
    backgroundColor: '#FFD54F', // Yellow
    bottom: 20,
    left: 15,
  },
  confetti4: {
    backgroundColor: '#81C784', // Green
    bottom: 15,
    right: 20,
  },
  confetti5: {
    backgroundColor: '#BA68C8', // Purple
    top: 5,
    left: '50%',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50', // Vibrant green
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h2,
    color: COLORS.black,
    marginBottom: SIZES.xl,
    textAlign: 'center',
  },
  detailsContainer: {
    width: '100%',
    marginBottom: SIZES.xl,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
    paddingVertical: SIZES.xs,
  },
  detailLabel: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: '#888888',
  },
  detailValue: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.black,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    width: '100%',
    gap: SIZES.sm,
  },
  pdfButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.body1,
    color: '#888888',
  },
  bottomContainer: {
    padding: SIZES.lg,
    paddingBottom: SIZES.lg + 20,
    backgroundColor: COLORS.white,
  },
  viewBookingButton: {
    backgroundColor: '#30B7D9', // Turquoise
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md + 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  viewBookingButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.body1 + 2,
    color: COLORS.white,
  },
  // Error state styles
  errorIconContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
    marginTop: SIZES.lg,
  },
  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  resultTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h2,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  resultMessage: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionsContainer: {
    gap: SIZES.md,
    marginBottom: SIZES.xl,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    gap: SIZES.sm,
    ...SHADOWS.medium,
  },
  primaryButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.body1,
    color: COLORS.white,
  },
});

export default PaymentResultScreen;
