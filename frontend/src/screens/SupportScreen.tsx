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

const SupportScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const supportOptions = [
    {
      id: 'helpCenter',
      title: 'Trung tâm trợ giúp',
      subtitle: 'Câu hỏi thường gặp và hướng dẫn',
      icon: 'help-circle',
      onPress: () => navigation.push('Support'),
    },
    {
      id: 'contact',
      title: 'Liên hệ hỗ trợ',
      subtitle: 'Gửi yêu cầu hỗ trợ cho chúng tôi',
      icon: 'mail',
      onPress: () => navigation.push('Support'),
    },
    {
      id: 'chat',
      title: 'Chat trực tuyến',
      subtitle: 'Trò chuyện với nhân viên hỗ trợ',
      icon: 'chatbubble',
      onPress: () => navigation.push('Support'),
    },
    {
      id: 'report',
      title: 'Báo cáo sự cố',
      subtitle: 'Báo cáo lỗi hoặc vấn đề kỹ thuật',
      icon: 'bug',
      onPress: () => navigation.push('Support'),
    },
    {
      id: 'terms',
      title: 'Điều khoản dịch vụ',
      subtitle: 'Điều khoản và điều kiện sử dụng',
      icon: 'document-text',
      onPress: () => navigation.push('TermsOfService'),
    },
    {
      id: 'privacy',
      title: 'Chính sách bảo mật',
      subtitle: 'Cách chúng tôi bảo vệ thông tin của bạn',
      icon: 'lock-closed',
      onPress: () => navigation.push('PrivacyPolicy'),
    },
    {
      id: 'about',
      title: 'Về chúng tôi',
      subtitle: 'Thông tin về công ty và ứng dụng',
      icon: 'information-circle',
      onPress: () => navigation.push('AboutUs'),
    },
  ];


  const contactInfo = [
    {
      id: 'email',
      title: 'Email',
      value: 'support@travelapp.com',
      icon: 'mail',
    },
    {
      id: 'phone',
      title: 'Điện thoại',
      value: '+84 123 456 789',
      icon: 'call',
    },
    {
      id: 'website',
      title: 'Website',
      value: 'www.travelapp.com',
      icon: 'globe',
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
          <Text style={styles.title}>Hỗ trợ</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Support Options Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trợ giúp</Text>
          
          <View style={styles.supportCard}>
            {supportOptions.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity style={styles.supportItem} onPress={item.onPress}>
                  <View style={styles.supportItemLeft}>
                    <View style={styles.supportIcon}>
                      <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.supportInfo}>
                      <Text style={styles.supportTitle}>{item.title}</Text>
                      <Text style={styles.supportSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.black} />
                </TouchableOpacity>
                {index < supportOptions.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>


        {/* Contact Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          
          <View style={styles.contactCard}>
            {contactInfo.map((item, index) => (
              <View key={item.id}>
                <View style={styles.contactItem}>
                  <View style={styles.contactItemLeft}>
                    <View style={styles.contactIcon}>
                      <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactTitle}>{item.title}</Text>
                      <Text style={styles.contactValue}>{item.value}</Text>
                    </View>
                  </View>
                </View>
                {index < contactInfo.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin ứng dụng</Text>
          
          <View style={styles.appInfoCard}>
            <View style={styles.appInfoItem}>
              <View style={styles.appInfoItemLeft}>
                <View style={styles.appInfoIcon}>
                  <Ionicons name="calendar" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.appInfoInfo}>
                  <Text style={styles.appInfoTitle}>Ngày cập nhật</Text>
                  <Text style={styles.appInfoValue}>15/12/2024</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.appInfoItem}>
              <View style={styles.appInfoItemLeft}>
                <View style={styles.appInfoIcon}>
                  <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.appInfoInfo}>
                  <Text style={styles.appInfoTitle}>Bảo mật</Text>
                  <Text style={styles.appInfoValue}>SSL/TLS Encrypted</Text>
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
  supportCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.sm,
    ...SHADOWS.light,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.sm,
  },
  supportItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  supportIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.text,
    marginBottom: 2,
  },
  supportSubtitle: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.veryLightGray,
    marginHorizontal: SIZES.sm,
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
  appInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.sm,
    ...SHADOWS.light,
  },
  appInfoItem: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.sm,
  },
  appInfoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appInfoIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
  },
  appInfoInfo: {
    flex: 1,
  },
  appInfoTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.body2,
    color: COLORS.text,
    marginBottom: 2,
  },
  appInfoValue: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.text,
  },
});

export default SupportScreen;