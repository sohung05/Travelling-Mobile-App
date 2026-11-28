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
  Modal,
  Pressable,
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
import { formatDestinationPrice, getDestinationPrice } from '../utils/destination';
import { useDarkMode } from '../contexts/DarkModeContext';

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
  const { colors } = useDarkMode();
  const route = useRoute<RouteProps>();
  const { destination } = route.params;
  const { isGuest } = useAuth();

  const getTomorrow = () => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(0, 0, 0, 0);
    return nextDate;
  };

  const isSameDay = (a: Date, b: Date) => {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  };

  const getCalendarGrid = (monthDate: Date) => {
    const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    const startWeekday = firstDayOfMonth.getDay();
    const days: Array<Date | null> = [];

    for (let i = 0; i < startWeekday; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  };

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(getDestinationPrice(destination));
  const [departureDate, setDepartureDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>(''); // Auto-calculated
  const [participants, setParticipants] = useState<number>(1);
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [selectedDepartureDate, setSelectedDepartureDate] = useState<Date>(getTomorrow());
  const [calendarMonth, setCalendarMonth] = useState<Date>(getTomorrow());

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
      price: 4990000,
      duration: 'Phổ biến',
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
      price: 12990000,
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
      price: 1290000,
      duration: '+1.290.000 ₫',
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

  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      try {
        return `${new Intl.NumberFormat('vi-VN').format(amount)} ₫`;
      } catch {
        return `${Math.round(amount).toLocaleString('vi-VN')} ₫`;
      }
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  const calculateTotalPrice = () => {
    let total = getDestinationPrice(destination) * participants;
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

    if (event?.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      const nextDate = new Date(selectedDate);
      nextDate.setHours(0, 0, 0, 0);

      setSelectedDepartureDate(nextDate);
      setDepartureDate(nextDate.toLocaleDateString('vi-VN'));

      // Auto-calculate return date based on tour duration
      const durationDays = parseInt(destination.duration?.match(/\d+/)?.[0] || '7');
      const returnDateObj = new Date(nextDate);
      returnDateObj.setDate(returnDateObj.getDate() + durationDays);
      setReturnDate(returnDateObj.toLocaleDateString('vi-VN'));
    }
  };

  const openDeparturePicker = () => {
    const nextDate = selectedDepartureDate || getTomorrow();
    setSelectedDepartureDate(nextDate);
    setCalendarMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
    setShowDeparturePicker(true);
  };

  const chooseDepartureDate = (date: Date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    setSelectedDepartureDate(normalizedDate);
    setDepartureDate(normalizedDate.toLocaleDateString('vi-VN'));

    const durationDays = parseInt(destination.duration?.match(/\d+/)?.[0] || '7');
    const returnDateObj = new Date(normalizedDate);
    returnDateObj.setDate(returnDateObj.getDate() + durationDays);
    setReturnDate(returnDateObj.toLocaleDateString('vi-VN'));
    setShowDeparturePicker(false);
  };

  const minDepartureDate = getTomorrow();
  const calendarDays = getCalendarGrid(calendarMonth);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
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
              activeOpacity={0.8}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={openDeparturePicker}
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
                        {service.price === 0 ? 'Miễn phí' : formatAmount(service.price)}
                      </Text>
                      {service.price > 0 && service.duration ? (
                        <Text style={styles.durationText}>{service.duration}</Text>
                      ) : null}
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
                        <Text style={styles.priceText}>+{formatAmount(service.price)}</Text>
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
              <Text style={styles.summaryValue}>{formatAmount(getDestinationPrice(destination) * participants)}</Text>
            </View>

            {selectedServices.map(serviceId => {
              const service = tourServices.find(s => s.id === serviceId);
              return service ? (
                <View key={serviceId} style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>{service.name}</Text>
                  <Text style={styles.summaryValue}>
                    {service.price === 0 ? 'Miễn phí' : `+${formatAmount(service.price * participants)}`}
                  </Text>
                </View>
              ) : null;
            })}

            <View style={styles.summaryDivider} />

            <View style={styles.summaryTotal}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{formatAmount(totalPrice)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Tổng cộng</Text>
          <Text style={styles.priceValue}>{formatAmount(totalPrice)}</Text>
        </View>
        <Button
          title="Tiếp tục"
          onPress={handleContinue}
          style={styles.continueButton}
        />
      </View>

      {/* Date Picker - Only for departure date */}
      {Platform.OS === 'web' ? (
        <Modal
          visible={showDeparturePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeparturePicker(false)}
        >
          <Pressable style={styles.pickerOverlay} onPress={() => setShowDeparturePicker(false)}>
            <Pressable style={styles.webPickerContainer} onPress={() => undefined}>
              <View style={styles.webPickerHeader}>
                <TouchableOpacity
                  style={styles.monthNavButton}
                  onPress={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                >
                  <Ionicons name="chevron-back" size={20} color={COLORS.ink} />
                </TouchableOpacity>
                <Text style={styles.webPickerTitle}>
                  {calendarMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity
                  style={styles.monthNavButton}
                  onPress={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                >
                  <Ionicons name="chevron-forward" size={20} color={COLORS.ink} />
                </TouchableOpacity>
              </View>

              <View style={styles.calendarWeekdaysRow}>
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                  <Text key={day} style={styles.calendarWeekday}>{day}</Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <View key={`empty-${index}`} style={styles.calendarDayPlaceholder} />;
                  }

                  const disabled = date < minDepartureDate;
                  const selected = departureDate ? isSameDay(date, new Date(selectedDepartureDate)) : false;

                  return (
                    <TouchableOpacity
                      key={date.toISOString()}
                      style={[
                        styles.calendarDay,
                        selected && styles.calendarDaySelected,
                        disabled && styles.calendarDayDisabled,
                      ]}
                      onPress={() => !disabled && chooseDepartureDate(date)}
                      disabled={disabled}
                    >
                      <Text style={[
                        styles.calendarDayText,
                        selected && styles.calendarDayTextSelected,
                        disabled && styles.calendarDayTextDisabled,
                      ]}>
                        {date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.webPickerActions}>
                <TouchableOpacity style={styles.webPickerCancel} onPress={() => setShowDeparturePicker(false)}>
                  <Text style={styles.webPickerCancelText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : (
        <Modal
          visible={showDeparturePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeparturePicker(false)}
        >
          <Pressable style={styles.pickerOverlay} onPress={() => setShowDeparturePicker(false)}>
            <Pressable style={styles.pickerContainer} onPress={() => undefined}>
              <DateTimePicker
                value={selectedDepartureDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDepartureDateChange}
                minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Tomorrow
              />
            </Pressable>
          </Pressable>
        </Modal>
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
  dateButtonInput: {
    minWidth: 140,
    color: COLORS.ink,
  },
  webPickerContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusLg,
    borderTopRightRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  webPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  webPickerTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.ink,
    textTransform: 'capitalize',
  },
  monthNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarWeekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  calendarWeekday: {
    ...FONTS.medium,
    fontSize: SIZES.caption,
    color: COLORS.slate,
    width: '14.28%',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarDayPlaceholder: {
    width: '14.28%',
    height: 36,
    marginBottom: 8,
  },
  calendarDay: {
    width: '14.28%',
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  calendarDaySelected: {
    backgroundColor: COLORS.primary,
  },
  calendarDayDisabled: {
    opacity: 0.35,
  },
  calendarDayText: {
    ...FONTS.medium,
    fontSize: SIZES.body2,
    color: COLORS.ink,
  },
  calendarDayTextSelected: {
    color: COLORS.white,
  },
  calendarDayTextDisabled: {
    color: COLORS.slate,
  },
  webPickerActions: {
    alignItems: 'flex-end',
    marginTop: SIZES.md,
  },
  webPickerCancel: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusXl,
    backgroundColor: COLORS.soft,
  },
  webPickerCancelText: {
    ...FONTS.semiBold,
    fontSize: SIZES.body2,
    color: COLORS.ink,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusLg,
    borderTopRightRadius: SIZES.radiusLg,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
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
