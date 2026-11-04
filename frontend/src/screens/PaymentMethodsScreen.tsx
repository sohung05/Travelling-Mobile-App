import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { paymentMethodService } from '../api';
import { useAuth } from '../contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'PaymentMethods'>;

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  iconType: 'image' | 'ionicon';
  imageUrl?: string;
}

const PaymentMethodsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const params = route.params as any;
  const { user } = useAuth();
  
  const totalPrice = params?.totalPrice || 0;
  const orderId = params?.orderId || `ORD-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const [selectedMethod, setSelectedMethod] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      name: 'Thẻ tín dụng',
      icon: 'card',
      iconType: 'ionicon',
    },
    {
      id: '2',
      name: 'Ví điện tử',
      icon: 'wallet',
      iconType: 'ionicon',
    },
    {
      id: '3',
      name: 'Chuyển khoản ngân hàng',
      icon: 'business',
      iconType: 'ionicon',
    },
    {
      id: '4',
      name: 'Thanh toán khi nhận dịch vụ',
      icon: 'cash',
      iconType: 'ionicon',
    },
  ];

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleProcessPayment = async () => {
    if (!selectedMethod) {
      return;
    }
    
    setIsProcessing(true);
    try {
        const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
        
        if (!user?.id) {
          alert('Vui lòng đăng nhập để thanh toán');
          setIsProcessing(false);
          return;
        }
        
        if (!params?.destination?.id) {
          alert('Thông tin địa điểm không hợp lệ');
          setIsProcessing(false);
          return;
        }
        
        // Call API to process payment
        const response = await paymentMethodService.processPayment({
          orderId: orderId,
          paymentMethodId: selectedMethod,
          amount: totalPrice,
          currency: 'USD',
          userId: user.id,
          destinationId: params.destination.id,
          departureDate: params?.departureDate,
          returnDate: params?.returnDate,
          participants: params?.participants || 1,
          services: params?.services || [],
        } as any);

        // Navigate to PaymentResultScreen with result
        (navigation as any).navigate('PaymentResult', {
          success: response.success,
          message: response.message,
          transactionId: response.transactionId,
          bookingId: response.bookingId,
          orderId: orderId,
          destination: params?.destination,
          services: params?.services || [],
          departureDate: params?.departureDate,
          returnDate: params?.returnDate,
          participants: params?.participants,
          totalPrice: totalPrice,
          paymentMethod: selectedPaymentMethod?.name || 'Thẻ tín dụng',
        });
      } catch (error: any) {
        console.error('Payment processing error:', error);
        
        // Navigate to PaymentResultScreen with error
        (navigation as any).navigate('PaymentResult', {
          success: false,
          message: error?.message || 'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.',
          orderId: orderId,
          destination: params?.destination,
          services: params?.services || [],
          departureDate: params?.departureDate,
          returnDate: params?.returnDate,
          participants: params?.participants,
          totalPrice: totalPrice,
          paymentMethod: paymentMethods.find(m => m.id === selectedMethod)?.name || 'Thẻ tín dụng',
        });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentMethodIcon = (method: PaymentMethod) => {
    if (method.iconType === 'image' && method.imageUrl) {
      return <Image source={{ uri: method.imageUrl }} style={styles.paymentMethodImage} />;
    }
    
    // Render icon based on method
    if (method.id === '1') {
      // Mastercard icon representation for Credit Card
      return (
        <View style={styles.mastercardIcon}>
          <View style={[styles.mastercardCircle, { backgroundColor: '#EB001B', left: 0 }]} />
          <View style={[styles.mastercardCircle, { backgroundColor: '#F79E1B', right: 0 }]} />
        </View>
      );
    }
    
    // Get icon color based on method
    let iconColor = COLORS.primary;
    if (method.id === '2') iconColor = '#FF6B6B'; // Ví điện tử - màu đỏ hồng
    if (method.id === '3') iconColor = '#2196F3'; // Chuyển khoản - màu xanh dương
    if (method.id === '4') iconColor = '#4CAF50'; // Thanh toán khi nhận - màu xanh lá cây (màu tiền)
    
    return (
      <Ionicons 
        name={method.icon as any} 
        size={24} 
        color={iconColor} 
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phương thức thanh toán</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          {/* Payment Methods List */}
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodCard,
                selectedMethod === method.id && styles.paymentMethodCardSelected,
              ]}
              onPress={() => handleSelectMethod(method.id)}
              activeOpacity={0.8}
            >
              <View style={styles.paymentMethodContent}>
                <View style={styles.paymentMethodIconContainer}>
                  {renderPaymentMethodIcon(method)}
                </View>
                <Text style={[
                  styles.paymentMethodName,
                  selectedMethod === method.id && styles.paymentMethodNameSelected,
                ]}>
                  {method.name}
                </Text>
              </View>
              {selectedMethod === method.id && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
            <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>${totalPrice.toFixed(2).replace(/\.00$/, '')}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.processPaymentButton,
              (isProcessing || !selectedMethod) && styles.processPaymentButtonDisabled
            ]}
            onPress={handleProcessPayment}
            disabled={isProcessing || !selectedMethod}
          >
            {isProcessing ? (
              <>
                <ActivityIndicator size="small" color={COLORS.white} />
                <Text style={styles.processPaymentText}>Đang xử lý...</Text>
              </>
            ) : (
              <Text style={styles.processPaymentText}>Xử lý thanh toán</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
  content: {
    padding: SIZES.md,
    gap: SIZES.md,
  },
  paymentMethodCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.light,
  },
  paymentMethodCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIconContainer: {
    marginRight: SIZES.md,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mastercardIcon: {
    width: 40,
    height: 24,
    position: 'relative',
  },
  mastercardCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
  },
  paymentMethodImage: {
    width: 40,
    height: 24,
    resizeMode: 'contain',
  },
  paymentMethodName: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.black,
  },
  paymentMethodNameSelected: {
    color: COLORS.black,
  },
  checkmarkContainer: {
    marginLeft: SIZES.sm,
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: SIZES.md,
    paddingBottom: SIZES.md + (Platform.OS === 'ios' ? 20 : 10),
    paddingHorizontal: SIZES.md,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    ...FONTS.bold,
    fontSize: SIZES.body1+8,
    color: COLORS.black,
    marginBottom: SIZES.xs,
  },
  totalValue: {
    ...FONTS.bold,
    fontSize: SIZES.h4+2,
    color: COLORS.primary,
  },
  processPaymentButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    minWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  processPaymentButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  processPaymentText: {
    ...FONTS.bold,
    fontSize: SIZES.body1,
    color: COLORS.white,
  },
});

export default PaymentMethodsScreen;
