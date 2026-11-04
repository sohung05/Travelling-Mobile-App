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

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const sections = [
    {
      id: 'introduction',
      title: '1. Giới thiệu',
      content: 'TravelApp cam kết bảo vệ quyền riêng tư và thông tin cá nhân của người dùng. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn khi sử dụng ứng dụng.',
    },
    {
      id: 'collection',
      title: '2. Thu thập thông tin',
      content: 'Chúng tôi thu thập thông tin bạn cung cấp trực tiếp như tên, email, số điện thoại, địa chỉ và thông tin thanh toán. Chúng tôi cũng có thể thu thập thông tin về cách bạn sử dụng ứng dụng.',
    },
    {
      id: 'usage',
      title: '3. Sử dụng thông tin',
      content: 'Thông tin được sử dụng để cung cấp dịch vụ, xử lý đặt tour, gửi thông báo quan trọng, cải thiện dịch vụ và tuân thủ các nghĩa vụ pháp lý.',
    },
    {
      id: 'sharing',
      title: '4. Chia sẻ thông tin',
      content: 'Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba, trừ khi được bạn đồng ý hoặc yêu cầu bởi pháp luật.',
    },
    {
      id: 'security',
      title: '5. Bảo mật thông tin',
      content: 'Chúng tôi sử dụng các biện pháp bảo mật tiên tiến như mã hóa SSL, xác thực 2 yếu tố và kiểm soát truy cập để bảo vệ thông tin của bạn.',
    },
    {
      id: 'cookies',
      title: '6. Cookies và công nghệ theo dõi',
      content: 'Chúng tôi sử dụng cookies và các công nghệ tương tự để cải thiện trải nghiệm người dùng, phân tích lưu lượng truy cập và cá nhân hóa nội dung.',
    },
    {
      id: 'rights',
      title: '7. Quyền của bạn',
      content: 'Bạn có quyền truy cập, chỉnh sửa, xóa thông tin cá nhân hoặc rút lại sự đồng ý bất kỳ lúc nào. Liên hệ với chúng tôi để thực hiện các quyền này.',
    },
    {
      id: 'updates',
      title: '8. Cập nhật chính sách',
      content: 'Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Các thay đổi quan trọng sẽ được thông báo qua ứng dụng hoặc email.',
    },
  ];

  const dataTypes = [
    {
      id: 'personal',
      title: 'Thông tin cá nhân',
      description: 'Tên, email, số điện thoại, địa chỉ',
      icon: 'person',
    },
    {
      id: 'payment',
      title: 'Thông tin thanh toán',
      description: 'Thông tin thẻ, tài khoản ngân hàng',
      icon: 'card',
    },
    {
      id: 'usage',
      title: 'Dữ liệu sử dụng',
      description: 'Lịch sử đặt tour, tìm kiếm, đánh giá',
      icon: 'analytics',
    },
    {
      id: 'device',
      title: 'Thông tin thiết bị',
      description: 'Loại thiết bị, hệ điều hành, địa chỉ IP',
      icon: 'phone-portrait',
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
          <Text style={styles.title}>Chính sách bảo mật</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Policy Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <View style={styles.infoIcon}>
                  <Ionicons name="calendar" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoInfo}>
                  <Text style={styles.infoTitle}>Có hiệu lực từ</Text>
                  <Text style={styles.infoValue}>01 tháng 01, 2024</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <View style={styles.infoIcon}>
                  <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoInfo}>
                  <Text style={styles.infoTitle}>Tuân thủ</Text>
                  <Text style={styles.infoValue}>GDPR, CCPA</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <View style={styles.infoIcon}>
                  <Ionicons name="lock-closed" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoInfo}>
                  <Text style={styles.infoTitle}>Mã hóa</Text>
                  <Text style={styles.infoValue}>SSL/TLS 256-bit</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Data Types Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại dữ liệu thu thập</Text>
          
          <View style={styles.dataCard}>
            {dataTypes.map((data, index) => (
              <View key={data.id}>
                <View style={styles.dataItem}>
                  <View style={styles.dataItemLeft}>
                    <View style={styles.dataIcon}>
                      <Ionicons name={data.icon as any} size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.dataInfo}>
                      <Text style={styles.dataTitle}>{data.title}</Text>
                      <Text style={styles.dataDescription}>{data.description}</Text>
                    </View>
                  </View>
                </View>
                {index < dataTypes.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Privacy Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nội dung chính sách</Text>
          
          {sections.map((section, index) => (
            <View key={section.id} style={styles.policyCard}>
              <Text style={styles.policyTitle}>{section.title}</Text>
              <Text style={styles.policyContent}>{section.content}</Text>
            </View>
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên hệ về bảo mật</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <View style={styles.contactItemLeft}>
                <View style={styles.contactIcon}>
                  <Ionicons name="mail" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Email bảo mật</Text>
                  <Text style={styles.contactValue}>privacy@travelapp.com</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.contactItem}>
              <View style={styles.contactItemLeft}>
                <View style={styles.contactIcon}>
                  <Ionicons name="shield" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>DPO (Data Protection Officer)</Text>
                  <Text style={styles.contactValue}>dpo@travelapp.com</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.contactItem}>
              <View style={styles.contactItemLeft}>
                <View style={styles.contactIcon}>
                  <Ionicons name="time" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Thời gian phản hồi</Text>
                  <Text style={styles.contactValue}>24-48 giờ</Text>
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
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.sm,
    ...SHADOWS.light,
  },
  infoItem: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.sm,
  },
  infoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
  },
  infoInfo: {
    flex: 1,
  },
  infoTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.body2,
    color: COLORS.text,
    marginBottom: 2,
  },
  infoValue: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.veryLightGray,
    marginHorizontal: SIZES.sm,
  },
  dataCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.sm,
    ...SHADOWS.light,
  },
  dataItem: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.sm,
  },
  dataItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
  },
  dataInfo: {
    flex: 1,
  },
  dataTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.text,
    marginBottom: 2,
  },
  dataDescription: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.text,
  },
  policyCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.light,
  },
  policyTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h6,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  policyContent: {
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

export default PrivacyPolicyScreen;

