import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList, Destination, Booking } from '../types';
import { Header, Button } from '../components';
import { useAuth } from '../contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'Payment'>;

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  type: 'card' | 'digital' | 'bank';
}

interface BookingSummary {
  destination: string;
  duration: string;
  guests: number;
  services: string[];
  subtotal: number;
  tax: number;
  total: number;
}

const PaymentScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { destination, services } = route.params;
  const departureDate = (route.params as any).departureDate;
  const returnDate = (route.params as any).returnDate;
  const participants = (route.params as any).participants || 1;
  const totalPrice = (route.params as any).totalPrice;
  const { addBooking, user } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  // Calculate total price based on selected services (fallback method)
  const calculateTotalPrice = () => {
    let total = destination.price;
    services.forEach(serviceId => {
      // Add service prices here if needed
      if (serviceId === '2') total += 200; // Premium package
      if (serviceId === '3') total += 500; // Luxury package
      if (serviceId === '4') total += 50;  // Photography service
    });
    return total * (participants || 1);
  };

  // Use totalPrice from TourServicesScreen (already calculated with participants)
  const finalTotalPrice = totalPrice || calculateTotalPrice();

  const getServiceName = (serviceId: string): string => {
    const serviceNames: Record<string, string> = {
      '1': 'Gói Cơ Bản',
      '2': 'Gói Tiêu Chuẩn',
      '3': 'Gói Cao Cấp',
      '4': 'Chụp ảnh kỷ niệm'
    };
    return serviceNames[serviceId] || serviceId;
  };

  const bookingSummary: BookingSummary = {
    destination: destination.name,
    duration: `${departureDate || 'Chưa chọn'} - ${returnDate || 'Chưa chọn'}`,
    guests: participants || 1,
    services: services.map(serviceId => getServiceName(serviceId)),
    subtotal: finalTotalPrice,
    tax: Math.round(finalTotalPrice * 0.1),
    total: finalTotalPrice + Math.round(finalTotalPrice * 0.1),
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      name: 'Thẻ tín dụng',
      icon: 'card',
      type: 'card',
    },
    {
      id: '2',
      name: 'Ví điện tử',
      icon: 'wallet',
      type: 'digital',
    },
    {
      id: '3',
      name: 'Chuyển khoản ngân hàng',
      icon: 'business',
      type: 'bank',
    },
    {
      id: '4',
      name: 'Thanh toán khi nhận dịch vụ',
      icon: 'cash',
      type: 'digital',
    },
  ];

  const handlePayment = async () => {
    if (!selectedPayment) {
      Alert.alert('Lỗi', 'Vui lòng chọn phương thức thanh toán');
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    setProcessing(false);

    // Create new booking with user-selected dates
    const depDate = departureDate ? new Date(departureDate.split('/').reverse().join('-')) : new Date();
    const retDate = returnDate ? new Date(returnDate.split('/').reverse().join('-')) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    // Get payment method name
    const selectedPaymentMethod = paymentMethods.find(pm => pm.id === selectedPayment);
    const paymentMethodName = selectedPaymentMethod?.name || selectedPayment;
    
    // Build special requests with service names
    const serviceNames = services.map(serviceId => getServiceName(serviceId));
    const specialRequestsText = serviceNames.length > 0 
      ? `Dịch vụ đã chọn: ${serviceNames.join(', ')}` 
      : '';
    
    const newBooking: Booking = {
      id: Date.now().toString(),
      destination,
      userId: user?.id || 'demo-user',
      startDate: depDate.toISOString(),
      endDate: retDate.toISOString(),
      departureDate: departureDate || new Date().toLocaleDateString('vi-VN'),
      returnDate: returnDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
      guests: participants || 1,
      totalPrice: bookingSummary.total,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      paymentMethod: paymentMethodName,
      specialRequests: specialRequestsText,
      selectedServices: services,
    };

    // Add booking to context
    addBooking(newBooking);

    navigation.navigate('PaymentSuccess', { 
      destination, 
      services: bookingSummary.services,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Thanh toán" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
          {/* Booking Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tóm tắt đặt chỗ</Text>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryIcon}>
                  <Ionicons name="airplane" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.summaryInfo}>
                  <Text style={styles.destinationName}>{bookingSummary.destination}</Text>
                  <Text style={styles.durationText}>{bookingSummary.duration}</Text>
                </View>
              </View>

              <View style={styles.summaryDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Số khách</Text>
                  <Text style={styles.detailValue}>{bookingSummary.guests} người</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Dịch vụ đã chọn</Text>
                  <View style={styles.servicesContainer}>
                    {bookingSummary.services.map((service, index) => (
                      <Text key={index} style={styles.serviceText}>
                        • {service}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.priceBreakdown}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Giá tour</Text>
                  <Text style={styles.priceValue}>${bookingSummary.subtotal}</Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Thuế & phí dịch vụ</Text>
                  <Text style={styles.priceValue}>${bookingSummary.tax}</Text>
                </View>

                <View style={styles.priceDivider} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tổng cộng</Text>
                  <Text style={styles.totalValue}>${bookingSummary.total}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            
            {paymentMethods.map((method, index) => (
              <View
                key={method.id}
              >
                <TouchableOpacity
                  style={[
                    styles.paymentMethodCard,
                    selectedPayment === method.id && styles.paymentMethodSelected,
                  ]}
                  onPress={() => setSelectedPayment(method.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentMethodInfo}>
                    <View style={styles.paymentIcon}>
                      <Ionicons
                        name={method.icon as any}
                        size={24}
                        color={selectedPayment === method.id ? COLORS.primary : COLORS.gray}
                      />
                    </View>
                    <Text style={[
                      styles.paymentMethodName,
                      selectedPayment === method.id && styles.paymentMethodNameSelected,
                    ]}>
                      {method.name}
                    </Text>
                  </View>

                  <View style={[
                    styles.radioButton,
                    selectedPayment === method.id && styles.radioButtonSelected,
                  ]}>
                    {selectedPayment === method.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Payment Security */}
          <View style={styles.section}>
            <View style={styles.securityCard}>
              <View style={styles.securityHeader}>
                <Ionicons name="shield-checkmark" size={24} color={COLORS.success} />
                <Text style={styles.securityTitle}>Thanh toán an toàn</Text>
              </View>
              <Text style={styles.securityText}>
                Thông tin thanh toán của bạn được mã hóa và bảo mật. Chúng tôi không lưu trữ 
                thông tin thẻ tín dụng của bạn.
              </Text>
            </View>
          </View>

          {/* Terms */}
          <View style={styles.section}>
            <Text style={styles.termsText}>
              Bằng việc tiếp tục, bạn đồng ý với{' '}
              <Text style={styles.termsLink}>Điều khoản sử dụng</Text>
              {' '}và{' '}
              <Text style={styles.termsLink}>Chính sách bảo mật</Text>
              {' '}của chúng tôi.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
        <View style={styles.bottomAction}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalValue}>${bookingSummary.total}</Text>
        </View>
        <Button
          title={processing ? "Đang xử lý..." : "Thanh toán"}
          onPress={handlePayment}
          loading={processing}
          style={styles.payButton}
        />
      </View>
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
  section: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    ...SHADOWS.light,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  summaryInfo: {
    flex: 1,
  },
  destinationName: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.ink,
    marginBottom: 2,
  },
  durationText: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.slate,
  },
  summaryDetails: {
    marginBottom: SIZES.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.sm,
  },
  detailLabel: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.slate,
  },
  detailValue: {
    ...FONTS.bold,
    fontSize: SIZES.body2,
    color: COLORS.ink,
  },
  servicesContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  serviceText: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.slate,
  },
  priceBreakdown: {
    borderTopWidth: 1,
    borderTopColor: COLORS.hairline,
    paddingTop: SIZES.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
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
  priceDivider: {
    height: 1,
    backgroundColor: COLORS.hairline,
    marginVertical: SIZES.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderWidth: 1.5,
    borderColor: COLORS.hairline,
    ...SHADOWS.light,
  },
  paymentMethodSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDFA',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  paymentMethodName: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.charcoal,
  },
  paymentMethodNameSelected: {
    color: COLORS.ink,
    ...FONTS.bold,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  securityCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    ...SHADOWS.light,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  securityTitle: {
    ...FONTS.bold,
    fontSize: SIZES.body1,
    color: COLORS.ink,
    marginLeft: SIZES.sm,
  },
  securityText: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.slate,
    lineHeight: 20,
  },
  termsText: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.slate,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    ...FONTS.bold,
    color: COLORS.primary,
  },
  bottomAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.hairline,
    ...SHADOWS.heavy,
  },
  totalContainer: {
    alignItems: 'flex-start',
  },
  payButton: {
    flex: 1,
    marginLeft: SIZES.lg,
  },
});

export default PaymentScreen;
