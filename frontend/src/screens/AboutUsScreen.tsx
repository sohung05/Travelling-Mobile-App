import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AboutUsScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const companyInfo = [
    {
      id: 'founded',
      title: 'Thành lập',
      value: '2020',
      icon: 'calendar',
    },
    {
      id: 'employees',
      title: 'Nhân viên',
      value: '50+',
      icon: 'people',
    },
    {
      id: 'users',
      title: 'Người dùng',
      value: '100K+',
      icon: 'person',
    },
    {
      id: 'tours',
      title: 'Tour đã tổ chức',
      value: '10K+',
      icon: 'airplane',
    },
  ];

  const values = [
    {
      id: 'quality',
      title: 'Chất lượng',
      description: 'Cam kết mang đến những trải nghiệm du lịch tốt nhất',
      icon: 'star',
    },
    {
      id: 'innovation',
      title: 'Đổi mới',
      description: 'Luôn cập nhật công nghệ và dịch vụ mới nhất',
      icon: 'bulb',
    },
    {
      id: 'trust',
      title: 'Tin cậy',
      description: 'Xây dựng mối quan hệ dài hạn với khách hàng',
      icon: 'heart',
    },
  ];

  const achievements = [
    {
      id: 'award1',
      title: 'Giải thưởng Du lịch Quốc tế',
      year: '2023',
      description: 'Ứng dụng du lịch tốt nhất',
    },
    {
      id: 'award2',
      title: 'Top 10 Startup Việt Nam',
      year: '2022',
      description: 'Được vinh danh bởi TechCrunch',
    },
    {
      id: 'award3',
      title: 'Chứng nhận ISO 27001',
      year: '2021',
      description: 'Bảo mật thông tin quốc tế',
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
          <Text style={styles.title}>Về chúng tôi</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Company Logo and Mission */}
        <View style={styles.section}>
          <View style={styles.missionCard}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="airplane" size={40} color={COLORS.text} />
              </View>
              <Text style={styles.companyName}>TravelApp</Text>
            </View>
            
            <Text style={styles.missionTitle}>Sứ mệnh của chúng tôi</Text>
            <Text style={styles.missionText}>
              Mang đến những trải nghiệm du lịch tuyệt vời và kết nối mọi người với những địa điểm đẹp nhất thế giới. 
              Chúng tôi tin rằng mỗi chuyến đi đều là một cơ hội để khám phá, học hỏi và tạo ra những kỷ niệm đáng nhớ.
            </Text>
          </View>
        </View>

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin công ty</Text>
          
          <View style={styles.infoCard}>
            {companyInfo.map((info, index) => (
              <View key={info.id}>
                <View style={styles.infoItem}>
                  <View style={styles.infoItemLeft}>
                    <View style={styles.infoIcon}>
                      <Ionicons name={info.icon as any} size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.infoInfo}>
                      <Text style={styles.infoTitle}>{info.title}</Text>
                      <Text style={styles.infoValue}>{info.value}</Text>
                    </View>
                  </View>
                </View>
                {index < companyInfo.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Values */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giá trị cốt lõi</Text>
          
          {values.map((value, index) => (
            <View key={value.id} style={styles.valueCard}>
              <View style={styles.valueItem}>
                <View style={styles.valueItemLeft}>
                  <View style={styles.valueIcon}>
                    <Ionicons name={value.icon as any} size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.valueInfo}>
                    <Text style={styles.valueTitle}>{value.title}</Text>
                    <Text style={styles.valueDescription}>{value.description}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thành tựu</Text>
          
          <View style={styles.achievementCard}>
            {achievements.map((achievement, index) => (
              <View key={achievement.id}>
                <View style={styles.achievementItem}>
                  <View style={styles.achievementLeft}>
                    <View style={styles.achievementYear}>
                      <Text style={styles.yearText}>{achievement.year}</Text>
                    </View>
                    <View style={styles.achievementInfo}>
                      <Text style={styles.achievementTitle}>{achievement.title}</Text>
                      <Text style={styles.achievementDescription}>{achievement.description}</Text>
                    </View>
                  </View>
                </View>
                {index < achievements.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên hệ</Text>
          
          <View style={styles.contactCard}>
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

            <View style={styles.divider} />

            <View style={styles.contactItem}>
              <View style={styles.contactItemLeft}>
                <View style={styles.contactIcon}>
                  <Ionicons name="call" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Điện thoại</Text>
                  <Text style={styles.contactValue}>+84 123 456 789</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.contactItem}>
              <View style={styles.contactItemLeft}>
                <View style={styles.contactIcon}>
                  <Ionicons name="mail" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Email</Text>
                  <Text style={styles.contactValue}>info@travelapp.com</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.contactItem}>
              <View style={styles.contactItemLeft}>
                <View style={styles.contactIcon}>
                  <Ionicons name="globe" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Website</Text>
                  <Text style={styles.contactValue}>www.travelapp.com</Text>
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
  missionCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.sm,
  },
  companyName: {
    ...FONTS.bold,
    fontSize: SIZES.h3,
    color: COLORS.primary,
  },
  missionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.text,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  missionText: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.text,
    lineHeight: 22,
    textAlign: 'center',
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
  valueCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.light,
  },
  valueItem: {
    paddingVertical: SIZES.sm,
  },
  valueItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
  },
  valueInfo: {
    flex: 1,
  },
  valueTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h6,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  valueDescription: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.text,
  },
  achievementCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.sm,
    ...SHADOWS.light,
  },
  achievementItem: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.sm,
  },
  achievementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementYear: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
  },
  yearText: {
    ...FONTS.bold,
    fontSize: SIZES.body2,
    color: COLORS.white,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.text,
    marginBottom: 2,
  },
  achievementDescription: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.text,
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

export default AboutUsScreen;

