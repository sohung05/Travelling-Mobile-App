import React, { useState } from 'react';
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

import { COLORS, SIZES, FONTS } from '../constants/theme';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DarkModeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedMode, setSelectedMode] = useState('light');

  const modeOptions = [
    {
      id: 'light',
      title: 'Sáng',
      subtitle: 'Giao diện sáng, dễ nhìn',
      icon: 'sunny-outline',
      description: 'Sử dụng giao diện sáng với nền trắng và chữ đen',
    },
    {
      id: 'dark',
      title: 'Tối',
      subtitle: 'Giao diện tối, tiết kiệm pin',
      icon: 'moon-outline',
      description: 'Sử dụng giao diện tối với nền đen và chữ trắng',
    },
    {
      id: 'auto',
      title: 'Tự động',
      subtitle: 'Theo cài đặt hệ thống',
      icon: 'phone-portrait-outline',
      description: 'Tự động chuyển đổi theo cài đặt của thiết bị',
    },
  ];

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header - giống hệt style hình */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Chế độ tối</Text>
          </View>
        </View>

        {/* Mode Selection Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Chọn chế độ hiển thị</Text>
          
          {modeOptions.map((mode, index) => (
            <View key={mode.id}>
              <TouchableOpacity 
                style={styles.modeItem} 
                onPress={() => handleModeSelect(mode.id)}
              >
                <View style={styles.modeItemLeft}>
                  <View style={styles.modeIcon}>
                    <Ionicons name={mode.icon as any} size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.modeInfo}>
                    <Text style={styles.modeTitle}>{mode.title}</Text>
                    <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
                    <Text style={styles.modeDescription}>{mode.description}</Text>
                  </View>
                </View>
                <View style={styles.radioButton}>
                  {selectedMode === mode.id && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
              </TouchableOpacity>
              {index < modeOptions.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.sectionCard}>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="information-circle" size={24} color={COLORS.info} />
            </View>
            <View style={styles.infoInfo}>
              <Text style={styles.infoTitle}>Thông tin</Text>
              <Text style={styles.infoDescription}>
                Chế độ tối giúp giảm mỏi mắt khi sử dụng ứng dụng trong môi trường thiếu sáng. 
                Nó cũng có thể giúp tiết kiệm pin trên một số thiết bị có màn hình OLED.
              </Text>
            </View>
          </View>
        </View>

        {/* Preview Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Xem trước</Text>
          
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewAvatar} />
              <View style={styles.previewInfo}>
                <View style={styles.previewLine1} />
                <View style={styles.previewLine2} />
              </View>
            </View>
            <View style={styles.previewContent}>
              <View style={styles.previewLine3} />
              <View style={styles.previewLine4} />
              <View style={styles.previewLine5} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.lg,
    marginTop: SIZES.lg,
    marginBottom: SIZES.md,
    padding: SIZES.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: SIZES.md,
  },
  modeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.md,
  },
  modeItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  modeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  modeSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  modeDescription: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginLeft: 66,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SIZES.md,
  },
  infoIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.veryLightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  infoInfo: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  previewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: SIZES.md,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: SIZES.md,
  },
  previewInfo: {
    flex: 1,
  },
  previewLine1: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    marginBottom: 4,
    width: '60%',
  },
  previewLine2: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    width: '40%',
  },
  previewContent: {
    marginTop: SIZES.md,
  },
  previewLine3: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 4,
    width: '80%',
  },
  previewLine4: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 4,
    width: '70%',
  },
  previewLine5: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    width: '50%',
  },
});

export default DarkModeScreen;