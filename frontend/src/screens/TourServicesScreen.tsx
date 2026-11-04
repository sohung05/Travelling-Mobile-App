import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList, Destination } from '../types';
import { Header, Button, SectionEyebrow } from '../components';
import { useAuth } from '../contexts/AuthContext';

type RouteProps = RouteProp<RootStackParamList, 'TourServices'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TourService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  icon: string;
  included: string[];
  optional: string[];
}

const TourServicesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { destination } = route.params;
  const { isGuest } = useAuth();

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(destination.price);
  const [departureDate, setDepartureDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>(''); // Auto-calculated
  const [participants, setParticipants] = useState<number>(1);
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [selectedDepartureDate, setSelectedDepartureDate] = useState(new Date());

  const tourServices: TourService[] = [
    {
      id: '1',
      name: 'Gói Cơ Bản',
      description: 'Dịch vụ cơ bản cho chuyến đi',
      price: 0,
      duration: 'Bao gồm',
      icon: 'checkmark-circle',
      included: [
        'Khách sạn 3 sao',
        'Bữa sáng',
        'Hướng dẫn viên',
        'Xe đưa đón sân bay',
      ],
      optional: [],
    },
    {
      id: '2',
      name: 'Gói Nâng Cao',
      description: 'Dịch vụ cao cấp với nhiều tiện ích',
      price: 200,
      duration: '',
      icon: 'star',
      included: [
        'Khách sạn 4 sao',
        'Bữa sáng + tối',
        'Hướng dẫn viên chuyên nghiệp',
        'Xe đưa đón VIP',
        'Bảo hiểm du lịch',
      ],
      optional: [],
    },
    {
      id: '3',
      name: 'Gói Luxury',
      description: 'Trải nghiệm cao cấp nhất',
      price: 500,
      duration: '',
      icon: 'diamond',
      included: [
        'Khách sạn 5 sao',
        'Tất cả bữa ăn',
        'Hướng dẫn viên riêng',
        'Xe limousine',
        'Bảo hiểm cao cấp',
        'Spa & massage',
      ],
      optional: [],
    },
    {
      id: '4',
      name: 'Chụp ảnh kỷ niệm',
      description: 'Dịch vụ chụp ảnh chuyên nghiệp',
      price: 50,
      duration: '+$50',
      icon: 'camera',
      included: [
        'Chụp ảnh chuyên nghiệp',
        'Chỉnh sửa ảnh',
        'Album kỹ thuật số',
      ],
      optional: [],
    },
  ];

  useEffect(() => {
    calculateTotalPrice();
  }, [selectedServices, participants]);

  const calculateTotalPrice = () => {
    let total = destination.price * participants;
    selectedServices.forEach(serviceId => {
      const service = tourServices.find(s => s.id === serviceId);
      if (service) {
        total += service.price * participants;
      }
    });
    setTotalPrice(total);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      // Nếu là gói chính (1, 2, 3), chỉ cho chọn 1 gói
      if (['1', '2', '3'].includes(serviceId)) {
        if (prev.includes(serviceId)) {
          return prev.filter(id => !['1', '2', '3'].includes(id));
        } else {
          return [...prev.filter(id => !['1', '2', '3'].includes(id)), serviceId];
        }
      } else {
        // Nếu là dịch vụ bổ sung, cho chọn nhiều
        if (prev.includes(serviceId)) {
          return prev.filter(id => id !== serviceId);
        } else {
          return [...prev, serviceId];
        }
      }
    });
  };

  const handleContinue = () => {
    if (isGuest) {
      navigation.navigate('Login');
      return;
    }
    
    // Kiểm tra đã chọn ngày khởi hành
    if (!departureDate) {
      alert('Vui lòng chọn ngày khởi hành');
      return;
    }
    
    // Kiểm tra đã chọn ít nhất 1 gói chính
    const hasMainPackage = selectedServices.some(id => ['1', '2', '3'].includes(id));
    if (!hasMainPackage) {
      alert('Vui lòng chọn ít nhất 1 gói dịch vụ chính');
      return;
    }
    
    // Generate order ID
    const orderId = `ORD-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    (navigation as any).navigate('OrderDetails', { 
      destination, 
      services: selectedServices,
      departureDate,
      returnDate,
      participants,
      totalPrice,
      orderId,
      bookingDate: new Date().toLocaleDateString('vi-VN'),
      paymentMethod: 'Chưa thanh toán',
      status: 'pending'
    });
  };

  // Date picker handlers
  const onDepartureDateChange = (event: any, selectedDate?: Date) => {
    setShowDeparturePicker(false);
    if (selectedDate) {
      setSelectedDepartureDate(selectedDate);
      setDepartureDate(selectedDate.toLocaleDateString('vi-VN'));
      
      // Auto-calculate return date based on tour duration
      const durationDays = parseInt(destination.duration?.match(/\d+/)?.[0] || '7');
      const returnDateObj = new Date(selectedDate);
      returnDateObj.setDate(returnDateObj.getDate() + durationDays);
      setReturnDate(returnDateObj.toLocaleDateString('vi-VN'));
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
        <Text style={styles.headerTitle}>Dịch vụ tour</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Destination Header */}
        <View style={styles.destinationHeader}>
          <Image
            source={{ 
              uri: destination.imageUrl || 
              destination.images?.[0] || 
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
            }}
            style={styles.destinationImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.destinationGradient}
          />
          <View style={styles.destinationInfo}>
            <Text style={styles.destinationName}>{destination.name}</Text>
            <View style={styles.destinationDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={16} color={COLORS.white} />
                <Text style={styles.detailText}>{destination.duration}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="people" size={16} color={COLORS.white} />
                <Text style={styles.detailText}>Tối đa 8 người</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Date and Participants Selection */}
        <View style={styles.selectionSection}>
          <SectionEyebrow title="Thông tin đặt tour" style={{ paddingHorizontal: 0, marginBottom: SIZES.sm }} />
          
          {/* Departure Date */}
          <View style={styles.selectionRow}>
            <View style={styles.selectionLabel}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={styles.selectionLabelText}>Ngày khởi hành</Text>
            </View>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDeparturePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {departureDate || 'Chọn ngày'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.slate} />
            </TouchableOpacity>
          </View>

          {/* Return Date - Auto calculated, read-only */}
          {returnDate && (
            <View style={styles.selectionRow}>
              <View style={styles.selectionLabel}>
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
                <Text style={styles.selectionLabelText}>Ngày kết thúc</Text>
              </View>
              <View style={[styles.dateButton, styles.dateButtonDisabled]}>
                <Text style={styles.dateButtonText}>
                  {returnDate}
                </Text>
              </View>
            </View>
          )}

          {/* Participants */}
          <View style={styles.selectionRow}>
            <View style={styles.selectionLabel}>
              <Ionicons name="people-outline" size={20} color={COLORS.primary} />
              <Text style={styles.selectionLabelText}>Số lượng thành viên</Text>
            </View>
            <View style={styles.participantsContainer}>
              <TouchableOpacity
                style={styles.participantButton}
                onPress={() => setParticipants(Math.max(1, participants - 1))}
              >
                <Ionicons name="remove" size={16} color={COLORS.ink} />
              </TouchableOpacity>
              <Text style={styles.participantCount}>{participants}</Text>
              <TouchableOpacity
                style={styles.participantButton}
                onPress={() => setParticipants(Math.min(8, participants + 1))}
              >
                <Ionicons name="add" size={16} color={COLORS.ink} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Main Packages */}
          <View style={styles.section}>
            <SectionEyebrow 
              title="Gói dịch vụ chính" 
              subtitle="Chọn 1 gói dịch vụ chính (bắt buộc)" 
              style={{ paddingHorizontal: 0, marginBottom: SIZES.sm }} 
            />

            {tourServices.filter(service => ['1', '2', '3'].includes(service.id)).map((service) => (
              <View key={service.id}>
                <TouchableOpacity
                  style={[
                    styles.serviceCard,
                    selectedServices.includes(service.id) && styles.serviceCardSelected,
                  ]}
                  onPress={() => toggleService(service.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.serviceHeader}>
                    <View style={styles.serviceInfo}>
                      <View style={[
                        styles.serviceIconContainer,
                        selectedServices.includes(service.id) && styles.serviceIconContainerActive
                      ]}>
                        <Ionicons
                          name={service.icon as any}
                          size={22}
                          color={
                            selectedServices.includes(service.id) 
                              ? COLORS.primary 
                              : COLORS.charcoal
                          }
                        />
                      </View>
                      <View style={styles.serviceDetails}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <Text style={styles.serviceDescription}>{service.description}</Text>
                      </View>
                    </View>
                    <View style={styles.servicePrice}>
                      <Text style={styles.priceText}>
                        {service.price === 0 ? 'Miễn phí' : `$${service.price}`}
                      </Text>
                      {service.price > 0 && service.duration && (
                        <Text style={styles.durationText}>{service.duration}</Text>
                      )}
                    </View>
                  </View>

                  {service.included.length > 0 && (
                    <View style={styles.includedSection}>
                      <Text style={styles.includedTitle}>Bao gồm:</Text>
                      {service.included.map((item, idx) => (
                        <View key={idx} style={styles.includedItem}>
                          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                          <Text style={styles.includedText}>{item}</Text>
                        </View>
                      ))}
                      <TouchableOpacity
                        style={styles.viewDetailsButton}
                        onPress={() => {
                          (navigation as any).navigate('ServicePackageDetail', {
                            servicePackage: service,
                          });
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.viewDetailsText}>Xem chi tiết gói</Text>
                        <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Add-on Services */}
          <View style={styles.section}>
            <SectionEyebrow 
              title="Dịch vụ bổ sung" 
              subtitle="Chọn thêm các dịch vụ bổ sung (tùy chọn)" 
              style={{ paddingHorizontal: 0, marginBottom: SIZES.sm }} 
            />

            {tourServices.filter(service => !['1', '2', '3'].includes(service.id)).map((service) => (
              <View key={service.id}>
                <TouchableOpacity
                  style={[
                    styles.serviceCard,
                    selectedServices.includes(service.id) && styles.serviceCardSelected,
                  ]}
                  onPress={() => toggleService(service.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.serviceHeader}>
                    <View style={styles.serviceInfo}>
                      <View style={[
                        styles.serviceIconContainer,
                        selectedServices.includes(service.id) && styles.serviceIconContainerActive
                      ]}>
                        <Ionicons
                          name={service.icon as any}
                          size={22}
                          color={selectedServices.includes(service.id) ? COLORS.primary : COLORS.charcoal}
                        />
                      </View>
                      <View style={styles.serviceDetails}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <Text style={styles.serviceDescription}>{service.description}</Text>
                      </View>
                    </View>
                    <View style={styles.servicePrice}>
                      {service.price === 0 ? (
                        <Text style={styles.freeText}>Miễn phí</Text>
                      ) : (
                        <Text style={styles.priceText}>+${service.price}</Text>
                      )}
                    </View>
                  </View>

                  {service.included.length > 0 && (
                    <View style={styles.includedSection}>
                      <Text style={styles.includedTitle}>Bao gồm:</Text>
                      {service.included.map((item, idx) => (
                        <View key={idx} style={styles.includedItem}>
                          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                          <Text style={styles.includedText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <SectionEyebrow title="Tóm tắt chi phí" style={{ paddingHorizontal: 0, marginBottom: SIZES.sm }} />
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Giá tour cơ bản ({participants} khách)</Text>
              <Text style={styles.summaryValue}>${destination.price * participants}</Text>
            </View>

            {selectedServices.map(serviceId => {
              const service = tourServices.find(s => s.id === serviceId);
              return service ? (
                <View key={serviceId} style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>{service.name}</Text>
                  <Text style={styles.summaryValue}>
                    {service.price === 0 ? 'Miễn phí' : `+$${service.price * participants}`}
                  </Text>
                </View>
              ) : null;
            })}

            <View style={styles.summaryDivider} />

            <View style={styles.summaryTotal}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>${totalPrice}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Tổng cộng</Text>
          <Text style={styles.priceValue}>${totalPrice}</Text>
        </View>
        <Button
          title="Tiếp tục"
          onPress={handleContinue}
          style={styles.continueButton}
        />
      </View>

      {/* Date Picker - Only for departure date */}
      {showDeparturePicker && (
        <DateTimePicker
          value={selectedDepartureDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDepartureDateChange}
          minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Tomorrow
        />
      )}
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
  destinationHeader: {
    height: 220,
    position: 'relative',
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
  },
  destinationInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.lg,
  },
  destinationName: {
    ...FONTS.bold,
    fontSize: SIZES.h3,
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  destinationDetails: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    ...FONTS.medium,
    fontSize: SIZES.body2,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.md,
  },
  selectionSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.lg,
    marginTop: SIZES.lg,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    ...SHADOWS.light,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  selectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  selectionLabelText: {
    ...FONTS.semiBold,
    fontSize: SIZES.body2,
    color: COLORS.charcoal,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    paddingHorizontal: SIZES.md,
    paddingVertical: 10,
    backgroundColor: COLORS.soft,
    borderRadius: SIZES.radiusXl,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    minWidth: 140,
  },
  dateButtonDisabled: {
    borderColor: COLORS.hairline,
    opacity: 0.8,
    backgroundColor: COLORS.soft,
    minWidth: 140,
  },
  dateButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.body2,
    color: COLORS.ink,
  },
  dateButtonPlaceholder: {
    color: COLORS.slate,
    fontStyle: 'italic',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  participantButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  participantCount: {
    ...FONTS.bold,
    fontSize: SIZES.body1,
    color: COLORS.ink,
    minWidth: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: SIZES.xl,
  },
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    borderWidth: 1.5,
    borderColor: COLORS.hairline,
    ...SHADOWS.light,
  },
  serviceCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDFA',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  serviceIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  serviceIconContainerActive: {
    backgroundColor: '#E6F4F2',
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.ink,
    marginBottom: 4,
  },
  serviceDescription: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.slate,
    lineHeight: 18,
  },
  servicePrice: {
    alignItems: 'flex-end',
    marginLeft: SIZES.sm,
  },
  priceText: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.primary,
  },
  freeText: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.success,
  },
  durationText: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.slate,
  },
  includedSection: {
    marginTop: SIZES.md,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.hairline,
  },
  includedTitle: {
    ...FONTS.bold,
    fontSize: SIZES.caption,
    color: COLORS.slate,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SIZES.xs,
  },
  includedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
    marginBottom: 4,
  },
  includedText: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.charcoal,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.xs,
    gap: 4,
  },
  viewDetailsText: {
    ...FONTS.bold,
    fontSize: SIZES.body2,
    color: COLORS.primary,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    ...SHADOWS.light,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  summaryLabel: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.slate,
  },
  summaryValue: {
    ...FONTS.bold,
    fontSize: SIZES.body2,
    color: COLORS.ink,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.hairline,
    marginVertical: SIZES.md,
  },
  summaryTotal: {
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
  bottomAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.hairline,
    ...SHADOWS.medium,
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  priceLabel: {
    ...FONTS.regular,
    fontSize: SIZES.caption,
    color: COLORS.slate,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  priceValue: {
    ...FONTS.bold,
    fontSize: SIZES.h3,
    color: COLORS.primary,
  },
  continueButton: {
    flex: 1,
    marginLeft: SIZES.lg,
  },
});

export default TourServicesScreen;
