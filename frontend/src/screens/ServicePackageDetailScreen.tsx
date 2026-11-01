import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'ServicePackageDetail'>;

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  included: string[];
  optional: string[];
  roomType?: string;
  bedType?: string;
  capacity?: string;
  amenities?: string[];
}

const ServicePackageDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const params = route.params as any;
  
  const servicePackage: ServicePackage = params?.servicePackage || {
    id: '1',
    name: 'Gói Cơ Bản',
    description: 'Dịch vụ cơ bản cho chuyến đi',
    price: 0,
    icon: 'checkmark-circle',
    included: [],
    optional: [],
  };

  // Get icon color based on package ID (for package icon)
  const getPackageIconColor = () => {
    switch (servicePackage.id) {
      case '1':
        return '#4CAF50'; // Xanh lá
      case '2':
        return '#FF9800'; // Cam
      case '3':
        return '#9C27B0'; // Tím
      default:
        return COLORS.primary;
    }
  };

  // Get image source based on package ID
  const getImageSource = () => {
    switch (servicePackage.id) {
      case '1':
        return require('../../assets/standard_room.jpg');
      case '2':
        return require('../../assets/Deluxe_room.jpg');
      case '3':
        return require('../../assets/suite_room.jpg');
      default:
        return require('../../assets/standard_room.jpg');
    }
  };

  // Default room and bed types based on package
  const getDefaultRoomType = () => {
    switch (servicePackage.id) {
      case '1':
        return 'Phòng Standard';
      case '2':
        return 'Phòng Deluxe';
      case '3':
        return 'Phòng Suite';
      default:
        return 'Phòng Standard';
    }
  };

  const getDefaultBedType = () => {
    switch (servicePackage.id) {
      case '1':
        return 'Giường đôi';
      case '2':
        return 'Giường đôi hoặc 2 giường đơn';
      case '3':
        return 'Giường King Size';
      default:
        return 'Giường đôi';
    }
  };

  const getDefaultCapacity = () => {
    switch (servicePackage.id) {
      case '1':
        return '2 người';
      case '2':
        return '2-3 người';
      case '3':
        return '2-4 người';
      default:
        return '2 người';
    }
  };

  const roomType = servicePackage.roomType || getDefaultRoomType();
  const bedType = servicePackage.bedType || getDefaultBedType();
  const capacity = servicePackage.capacity || getDefaultCapacity();

  // Get facilities based on package ID
  const getFacilities = () => {
    switch (servicePackage.id) {
      case '1':
        return [
          { icon: 'wifi', name: 'Wifi' },
          { icon: 'tv', name: 'TV' },
          { icon: 'snow', name: 'Điều hòa' },
          { icon: 'lock-closed', name: 'Tủ an toàn' },
        ];
      case '2':
        return [
          { icon: 'wifi', name: 'Wifi' },
          { icon: 'tv', name: 'TV' },
          { icon: 'snow', name: 'Điều hòa' },
          { icon: 'lock-closed', name: 'Tủ an toàn' },
          { icon: 'barbell', name: 'Thiết bị tập thể dục' },
          { icon: 'cafe', name: 'Khu vực bếp' },
        ];
      case '3':
        return [
          { icon: 'wifi', name: 'Wifi' },
          { icon: 'tv', name: 'TV' },
          { icon: 'snow', name: 'Điều hòa' },
          { icon: 'lock-closed', name: 'Tủ an toàn' },
          { icon: 'barbell', name: 'Thiết bị tập thể dục' },
          { icon: 'cafe', name: 'Khu vực bếp' },
          { icon: 'water', name: 'Hồ bơi' },
          { icon: 'leaf', name: 'Vườn' },
        ];
      default:
        return [];
    }
  };

  // Get services based on package ID
  const getServices = () => {
    switch (servicePackage.id) {
      case '1':
        return {
          'Dọn dẹp & Giặt ủi': [
            { icon: 'shirt', name: 'Dịch vụ giặt ủi' },
          ],
          'Phòng tắm': [
            { icon: 'water', name: 'Vòi sen' },
            { icon: 'cut', name: 'Máy sấy tóc' },
          ],
        };
      case '2':
        return {
          'Dọn dẹp & Giặt ủi': [
            { icon: 'shirt', name: 'Dịch vụ giặt ủi' },
            { icon: 'shirt-outline', name: 'Máy sấy miễn phí - Trong phòng' },
            { icon: 'shirt', name: 'Bàn ủi' },
          ],
          'Phòng tắm': [
            { icon: 'water', name: 'Bồn tắm' },
            { icon: 'cut', name: 'Máy sấy tóc' },
          ],
        };
      case '3':
        return {
          'Dọn dẹp & Giặt ủi': [
            { icon: 'shirt', name: 'Dịch vụ giặt ủi cao cấp' },
            { icon: 'shirt-outline', name: 'Máy sấy miễn phí - Trong phòng' },
            { icon: 'shirt', name: 'Bàn ủi' },
            { icon: 'sparkles', name: 'Dọn dẹp hàng ngày' },
          ],
          'Phòng tắm': [
            { icon: 'water', name: 'Bồn tắm jacuzzi' },
            { icon: 'cut', name: 'Máy sấy tóc cao cấp' },
            { icon: 'sparkles', name: 'Đồ vệ sinh cao cấp' },
          ],
        };
      default:
        return {};
    }
  };

  const facilities = getFacilities();
  const services = getServices();

  // Get icon color based on icon name
  const getIconColor = (iconName: string): string => {
    const colorMap: { [key: string]: string } = {
      // Facilities
      'wifi': '#2196F3', // Blue
      'tv': '#9C27B0', // Purple
      'snow': '#00BCD4', // Cyan
      'lock-closed': '#FF9800', // Orange
      'fitness': '#4CAF50', // Green
      'barbell': '#4CAF50', // Green
      'cafe': '#FF5722', // Deep Orange
      'water': '#00ACC1', // Teal
      'leaf': '#8BC34A', // Light Green
      // Room info
      'home': '#30B7D9', // Primary
      'bed-outline': '#30B7D9', // Primary
      'bed': '#30B7D9', // Primary
      'people': '#30B7D9', // Primary
      // Services
      'shirt': '#2196F3', // Blue
      'shirt-outline': '#4CAF50', // Green
      'cut': '#E91E63', // Pink
      'sparkles': '#FFC107', // Amber
      // General
      'checkmark-circle': '#4CAF50', // Green
      'ellipse-outline': '#9E9E9E', // Gray
    };
    return colorMap[iconName] || COLORS.primary;
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
        <Text style={styles.headerTitle}>Chi tiết gói dịch vụ</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          {/* Package Image */}
          <View style={styles.imageContainer}>
            <Image
              source={getImageSource()}
              style={styles.packageImage}
              resizeMode="cover"
            />
          </View>

          {/* Package Header */}
          <View style={styles.packageHeader}>
            <Text style={styles.packageName}>{servicePackage.name}</Text>
            <Text style={styles.packageDescription}>{servicePackage.description}</Text>
            <Text style={styles.priceText}>
              {servicePackage.price === 0 ? 'Miễn phí' : `$${servicePackage.price}/người`}
            </Text>
          </View>

          {/* Room Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Thông tin phòng</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="home" size={22} color="#FF6B6B" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Loại phòng</Text>
                  <Text style={styles.infoValue}>{roomType}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="bed-outline" size={22} color="#4ECDC4" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Loại giường</Text>
                  <Text style={styles.infoValue}>{bedType}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="people" size={22} color="#95E1D3" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Sức chứa</Text>
                  <Text style={styles.infoValue}>{capacity}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Included Services */}
          {servicePackage.included.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Dịch vụ bao gồm</Text>
              </View>
              <View style={styles.servicesCard}>
                {servicePackage.included.map((item, index) => (
                  <View key={index} style={styles.serviceItem}>
                    <Ionicons name="checkmark-circle" size={22} color={getIconColor('checkmark-circle')} />
                    <Text style={styles.serviceItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Optional Services */}
          {servicePackage.optional.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Dịch vụ tùy chọn</Text>
              </View>
              <View style={styles.servicesCard}>
                {servicePackage.optional.map((item, index) => (
                  <View key={index} style={styles.serviceItem}>
                    <Ionicons name="ellipse-outline" size={22} color={getIconColor('ellipse-outline')} />
                    <Text style={styles.serviceItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Facilities */}
          {facilities.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tiện ích</Text>
              </View>
              <View style={styles.facilitiesCard}>
                {/* Facilities List */}
                {facilities.map((facility, index) => (
                  <View key={index}>
                    <View style={styles.facilityItem}>
                      <Ionicons name={facility.icon as any} size={22} color={getIconColor(facility.icon)} />
                      <Text style={styles.facilityText}>{facility.name}</Text>
                    </View>
                    {index < facilities.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Services */}
          {Object.keys(services).length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Dịch vụ</Text>
              </View>
              {Object.entries(services).map(([category, items], categoryIndex) => (
                <View key={categoryIndex} style={[styles.servicesCard, categoryIndex > 0 && styles.servicesCardMargin]}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  {(items as Array<{ icon: string; name: string }>).map((item: { icon: string; name: string }, itemIndex: number) => (
                    <View key={itemIndex}>
                      <View style={styles.serviceItem}>
                        <Ionicons name={item.icon as any} size={22} color={getIconColor(item.icon)} />
                        <Text style={styles.serviceItemText}>{item.name}</Text>
                      </View>
                      {itemIndex < items.length - 1 && <View style={styles.divider} />}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Amenities (Legacy - keep for backward compatibility) */}
          {servicePackage.amenities && servicePackage.amenities.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tiện ích bổ sung</Text>
              </View>
              <View style={styles.amenitiesContainer}>
                {servicePackage.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
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
    paddingBottom: SIZES.xl * 2,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
    marginBottom: SIZES.lg,
  },
  packageImage: {
    width: '100%',
    height: '100%',
  },
  packageHeader: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    alignItems: 'center',
    marginBottom: SIZES.lg,
    marginHorizontal: SIZES.lg,
    ...SHADOWS.light,
  },
  packageName: {
    ...FONTS.bold,
    fontSize: SIZES.h3,
    color: COLORS.black,
    marginBottom: SIZES.xs,
    textAlign: 'center',
  },
  packageDescription: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  priceText: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.primary,
    textAlign: 'center',
  },
  section: {
    marginBottom: SIZES.xl,
    paddingHorizontal: SIZES.lg,
  },
  sectionHeader: {
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.black,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...SHADOWS.medium,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
    gap: SIZES.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...FONTS.bold,
    fontSize: SIZES.body1+2,
    color: COLORS.black,
    marginBottom: 2,
  },
  infoValue: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.black,
  },
  servicesCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...SHADOWS.medium,
  },
  servicesCardMargin: {
    marginTop: SIZES.md,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
    paddingVertical: SIZES.xs-3,
    gap: SIZES.sm,
  },
  serviceItemText: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.black,
    flex: 1,
  },
  facilitiesCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...SHADOWS.medium,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SIZES.md,
    gap: SIZES.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  summaryText: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.black,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    gap: SIZES.md,
  },
  facilityText: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.black,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: SIZES.md + 20,
  },
  categoryTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.h5,
    color: COLORS.black,
    marginBottom: SIZES.sm,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: SIZES.xs,
  },
  amenityText: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.black,
  },
});

export default ServicePackageDetailScreen;

