import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList, Destination } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'PaymentSuccess'>;

const PaymentSuccessScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { destination, services } = route.params;
  const departureDate = (route.params as any).departureDate;
  const returnDate = (route.params as any).returnDate;
  const participants = (route.params as any).participants;
  const totalPrice = (route.params as any).totalPrice;
  const selectedServices = (route.params as any).selectedServices;
  const paymentMethod = (route.params as any).paymentMethod;

  // Removed auto redirect - user will manually navigate

  const handleViewBookings = () => {
    (navigation as any).replace('MainTabs', { screen: 'Bookings' });
  };

  const handleBackToHome = () => {
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
         <View style={styles.headerContent}>
           <TouchableOpacity
             style={styles.backButton}
             onPress={() => navigation.goBack()}
           >
             <Ionicons name="arrow-back" size={24} color={COLORS.white} />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>Thanh toán thành công</Text>
           <TouchableOpacity
             style={styles.homeHeaderButton}
             onPress={handleBackToHome}
           >
             <Ionicons name="home" size={24} color={COLORS.white} />
           </TouchableOpacity>
         </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
         {/* Success Icon */}
         <View style={styles.iconContainer}>
           <View style={styles.successIcon}>
             <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
           </View>
         </View>

         {/* Success Message */}
         <View style={styles.messageContainer}>
           <Text style={styles.successTitle}>Chúc mừng!</Text>
           <Text style={styles.successSubtitle}>
             Chuyến đi của bạn đã được đặt thành công
           </Text>
           <Text style={styles.successDescription}>
             Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn. 
             Vui lòng kiểm tra hộp thư để biết thêm chi tiết.
           </Text>
         </View>

         {/* Booking Details */}
         <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Chi tiết đặt chỗ</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="airplane" size={20} color={COLORS.primary} />
            <Text style={styles.detailLabel}>Điểm đến</Text>
            <Text style={styles.detailValue}>{destination.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.detailLabel}>Ngày khởi hành</Text>
            <Text style={styles.detailValue}>{departureDate || 'Chưa chọn'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.detailLabel}>Ngày kết thúc</Text>
            <Text style={styles.detailValue}>{returnDate || 'Chưa chọn'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="people" size={20} color={COLORS.primary} />
            <Text style={styles.detailLabel}>Số khách</Text>
            <Text style={styles.detailValue}>{participants || 1} người</Text>
          </View>


          <View style={styles.detailRow}>
            <Ionicons name="cash" size={20} color={COLORS.primary} />
            <Text style={styles.detailLabel}>Tổng tiền</Text>
            <Text style={styles.detailValue}>${totalPrice || 0}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="receipt" size={20} color={COLORS.primary} />
            <Text style={styles.detailLabel}>Mã đặt chỗ</Text>
            <Text style={styles.detailValue}>#{Math.random().toString(36).substr(2, 8).toUpperCase()}</Text>
          </View>
         </View>

         {/* Next Steps */}
         <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>Bước tiếp theo</Text>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Kiểm tra email xác nhận</Text>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Chuẩn bị hành lý</Text>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Đến điểm hẹn đúng giờ</Text>
          </View>
         </View>

         {/* Actions */}
         <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.viewBookingsButton}
            onPress={handleViewBookings}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.buttonGradient}
            >
              <Ionicons name="calendar" size={20} color={COLORS.white} />
              <Text style={styles.buttonText}>Xem đặt chỗ của tôi</Text>
            </LinearGradient>
          </TouchableOpacity>
         </View>


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
  header: {
    paddingTop: SIZES.md,
    paddingBottom: SIZES.lg,
    paddingHorizontal: SIZES.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SIZES.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.veryLightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  successTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h2,
    color: COLORS.text,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  successSubtitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.h5,
    color: COLORS.primary,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  successDescription: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
    ...SHADOWS.light,
  },
  detailsTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
    gap: SIZES.sm,
  },
  detailLabel: {
    ...FONTS.medium,
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    flex: 1,
  },
  detailValue: {
    ...FONTS.semiBold,
    fontSize: SIZES.body2,
    color: COLORS.text,
  },
  nextStepsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.xl,
    ...SHADOWS.light,
  },
  nextStepsTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
    gap: SIZES.md,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...FONTS.bold,
    fontSize: SIZES.body2,
    color: COLORS.white,
  },
  stepText: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.text,
    flex: 1,
  },
  actionsContainer: {
    gap: SIZES.md,
    marginBottom: SIZES.xl,
  },
  viewBookingsButton: {
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    gap: SIZES.sm,
  },
  buttonText: {
    ...FONTS.bold,
    fontSize: SIZES.body1,
    color: COLORS.white,
  },
  homeButton: {
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  homeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    gap: SIZES.sm,
  },
  homeButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.body1,
    color: COLORS.primary,
  },
});

export default PaymentSuccessScreen;



