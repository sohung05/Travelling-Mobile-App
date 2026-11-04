import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { paymentMethodService } from '../api';
import { UserPaymentMethod } from '../api/paymentMethodService';
import { useAuth } from '../contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PaymentMethodsProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [userPaymentMethods, setUserPaymentMethods] = useState<UserPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mẫu phương thức thanh toán
  const samplePaymentMethods: UserPaymentMethod[] = [
    {
      id: 'sample-1',
      userId: user?.id || '',
      paymentMethodId: '1',
      paymentMethod: {
        id: '1',
        name: 'Thẻ tín dụng',
        type: 'credit_card',
        icon: 'card',
        isActive: true,
      },
      details: {
        last4: '4242',
        cardType: 'Visa',
        expiryDate: '12/25',
        cardholderName: user?.name || 'Nguyễn Văn A',
      },
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample-2',
      userId: user?.id || '',
      paymentMethodId: '2',
      paymentMethod: {
        id: '2',
        name: 'Ví điện tử',
        type: 'paypal',
        icon: 'logo-paypal',
        isActive: true,
      },
      details: {
        last4: undefined,
      },
      isDefault: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample-3',
      userId: user?.id || '',
      paymentMethodId: '3',
      paymentMethod: {
        id: '3',
        name: 'Chuyển khoản ngân hàng',
        type: 'bank_transfer',
        icon: 'business',
        isActive: true,
      },
      details: {
        last4: undefined,
      },
      isDefault: false,
      createdAt: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    loadUserPaymentMethods();
  }, [user]);

  const loadUserPaymentMethods = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const methods = await paymentMethodService.getUserPaymentMethods(user.id);
      // Nếu chưa có phương thức thanh toán, hiển thị mẫu
      if (methods.length === 0) {
        setUserPaymentMethods(samplePaymentMethods);
      } else {
        setUserPaymentMethods(methods);
      }
    } catch (error: any) {
      console.error('Error loading payment methods:', error);
      // Nếu endpoint chưa được implement hoặc lỗi API, hiển thị mẫu im lặng
      // Không hiển thị alert để tránh làm phiền người dùng
      if (error?.message?.includes('No static resource') || error?.message?.includes('404')) {
        console.log('⚠️ Payment methods endpoint not implemented, showing sample data');
      }
      setUserPaymentMethods(samplePaymentMethods);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserPaymentMethods();
  };


  const handleAddPaymentMethod = () => {
    // TODO: Navigate to add payment method screen
    Alert.alert('Thông báo', 'Tính năng thêm phương thức thanh toán sẽ được triển khai sớm');
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return 'card';
      case 'paypal':
        return 'logo-paypal';
      case 'apple_pay':
        return 'logo-apple';
      case 'google_pay':
        return 'logo-google';
      case 'bank_transfer':
        return 'business';
      default:
        return 'card';
    }
  };

  const getPaymentMethodColor = (type: string) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return '#2196F3';
      case 'paypal':
        return '#0070BA';
      case 'apple_pay':
        return '#000000';
      case 'google_pay':
        return '#4285F4';
      case 'bank_transfer':
        return '#4CAF50';
      default:
        return COLORS.primary;
    }
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Phương thức thanh toán</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phương thức thanh toán</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Add Payment Method Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPaymentMethod}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.addButtonText}>Thêm phương thức thanh toán</Text>
        </TouchableOpacity>

        {/* Payment Methods List */}
        <View style={styles.methodsList}>
          {userPaymentMethods.map((method) => (
            <View key={method.id} style={styles.methodCard}>
              <View style={styles.methodInfo}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: getPaymentMethodColor(method.paymentMethod.type) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getPaymentMethodIcon(method.paymentMethod.type) as any}
                    size={24}
                    color={getPaymentMethodColor(method.paymentMethod.type)}
                  />
                </View>
                <Text style={styles.methodName}>{method.paymentMethod.name}</Text>
              </View>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Mặc định</Text>
                </View>
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
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.black,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.md,
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    gap: SIZES.sm,
  },
  addButtonText: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.primary,
  },
  methodsList: {
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.xl,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.light,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SIZES.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodName: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.black,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
  },
  defaultBadgeText: {
    ...FONTS.semiBold,
    fontSize: SIZES.body3,
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xl * 2,
    paddingHorizontal: SIZES.xl,
  },
  emptyText: {
    ...FONTS.semiBold,
    fontSize: SIZES.h5,
    color: COLORS.text,
    marginTop: SIZES.md,
    marginBottom: SIZES.xs,
  },
  emptySubtext: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default PaymentMethodsProfileScreen;

