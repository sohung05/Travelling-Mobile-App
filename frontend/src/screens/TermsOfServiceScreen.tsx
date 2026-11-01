import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TermsOfServiceScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const sections = [
    {
      id: 'acceptance',
      title: '1. Chấp nhận điều khoản',
      content: 'Bằng việc sử dụng ứng dụng TravelApp, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, bạn không nên sử dụng ứng dụng của chúng tôi.',
    },
    {
      id: 'description',
      title: '2. Mô tả dịch vụ',
      content: 'TravelApp là một ứng dụng di động cung cấp dịch vụ đặt tour du lịch, tìm kiếm điểm đến và quản lý các chuyến đi. Chúng tôi cung cấp thông tin về các tour du lịch, giá cả và dịch vụ từ các đối tác của chúng tôi.',
    },
    {
      id: 'userAccount',
      title: '3. Tài khoản người dùng',
      content: 'Để sử dụng một số tính năng của ứng dụng, bạn cần tạo tài khoản. Bạn có trách nhiệm duy trì tính bảo mật của tài khoản và mật khẩu của mình. Bạn đồng ý chấp nhận trách nhiệm cho tất cả các hoạt động xảy ra dưới tài khoản của bạn.',
    },
    {
      id: 'booking',
      title: '4. Đặt tour và thanh toán',
      content: 'Khi đặt tour, bạn đồng ý cung cấp thông tin chính xác và cập nhật. Thanh toán phải được thực hiện đầy đủ trước khi tour bắt đầu. Chúng tôi có quyền từ chối hoặc hủy bỏ đặt tour nếu thông tin không chính xác.',
    },
    {
      id: 'cancellation',
      title: '5. Hủy và hoàn tiền',
      content: 'Chính sách hủy và hoàn tiền sẽ được áp dụng theo điều kiện cụ thể của từng tour. Thông tin chi tiết về chính sách hủy sẽ được thông báo tại thời điểm đặt tour.',
    },
    {
      id: 'liability',
      title: '6. Trách nhiệm pháp lý',
      content: 'TravelApp không chịu trách nhiệm cho bất kỳ tổn thất, thiệt hại hoặc thương tích nào phát sinh từ việc sử dụng dịch vụ của chúng tôi hoặc tham gia các tour du lịch.',
    },
    {
      id: 'modification',
      title: '7. Thay đổi điều khoản',
      content: 'Chúng tôi có quyền thay đổi các điều khoản này bất kỳ lúc nào. Việc tiếp tục sử dụng ứng dụng sau khi có thay đổi sẽ được coi là chấp nhận các điều khoản mới.',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Điều khoản dịch vụ</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Last Updated Info */}
        <View style={styles.section}>
          <View style={styles.updateCard}>
            <View style={styles.updateItem}>
              <View style={styles.updateItemLeft}>
                <View style={styles.updateIcon}>
                  <Ionicons name="calendar" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.updateInfo}>
                  <Text style={styles.updateTitle}>Cập nhật lần cuối</Text>
                  <Text style={styles.updateValue}>15 tháng 12, 2024</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.updateItem}>
              <View style={styles.updateItemLeft}>
                <View style={styles.updateIcon}>
                  <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.updateInfo}>
                  <Text style={styles.updateTitle}>Trạng thái</Text>
                  <Text style={styles.updateValue}>Có hiệu lực</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Terms Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nội dung điều khoản</Text>
          
          {sections.map((section, index) => (
            <View key={section.id} style={styles.termCard}>
              <Text style={styles.termTitle}>{section.title}</Text>
              <Text style={styles.termContent}>{section.content}</Text>
            </View>
          ))}
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên hệ</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <View style={styles.contactItemLeft}>
                <View style={styles.contactIcon}>
                  <Ionicons name="mail" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Email pháp lý</Text>
                  <Text style={styles.contactValue}>legal@travelapp.com</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.contactItem}>
              <View style={styles.contactItemLeft}>
                <View style={styles.contactIcon}>
                  <Ionicons name="call" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Hotline</Text>
                  <Text style={styles.contactValue}>+84 123 456 789</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.contactItem}>
              <View style={styles.contactItemLeft}>
                <View style={styles.contactIcon}>
                  <Ionicons name="location" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Địa chỉ</Text>
                  <Text style={styles.contactValue}>123 Đường ABC, Quận 1, TP.HCM</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  section: {
    paddingHorizontal: SIZES.md,
    marginTop: SIZES.lg,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  updateCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.sm,
    ...SHADOWS.light,
  },
  updateItem: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.sm,
  },
  updateItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
  },
  updateInfo: {
    flex: 1,
  },
  updateTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.body2,
    color: COLORS.text,
    marginBottom: 2,
  },
  updateValue: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.veryLightGray,
    marginHorizontal: SIZES.sm,
  },
  termCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.light,
  },
  termTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h6,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  termContent: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.text,
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.sm,
    ...SHADOWS.light,
  },
  contactItem: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.sm,
  },
  contactItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.body2,
    color: COLORS.text,
    marginBottom: 2,
  },
  contactValue: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.text,
  },
});

export default TermsOfServiceScreen;

