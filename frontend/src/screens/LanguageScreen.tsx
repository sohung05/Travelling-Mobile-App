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

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LanguageScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedLanguage, setSelectedLanguage] = useState('vi');

  const languages = [
    {
      id: 'vi',
      name: 'Tiếng Việt',
      nativeName: 'Tiếng Việt',
      flag: '🇻🇳',
    },
    {
      id: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
    },
    {
      id: 'fr',
      name: 'Français',
      nativeName: 'Français',
      flag: '🇫🇷',
    },
    {
      id: 'zh',
      name: '中文',
      nativeName: '中文 (简体)',
      flag: '🇨🇳',
    },
  ];

  const handleSelectLanguage = (languageId: string) => {
    setSelectedLanguage(languageId);
    // In real app, save language preference and reload app
    console.log('Selected language:', languageId);
  };

  const handleSave = () => {
    // In real app, save language preference and reload
    console.log('Language saved:', selectedLanguage);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Ngôn ngữ</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Chọn ngôn ngữ bạn muốn sử dụng trong ứng dụng
          </Text>
        </View>

        {/* Language Options */}
        <View style={styles.languagesContainer}>
          {languages.map((language) => {
            const isSelected = selectedLanguage === language.id;
            return (
              <TouchableOpacity
                key={language.id}
                style={[
                  styles.languageCard,
                  isSelected && styles.languageCardSelected,
                ]}
                onPress={() => handleSelectLanguage(language.id)}
                activeOpacity={0.8}
              >
                {isSelected && <View style={styles.selectedBackground} />}
                <View style={styles.languageContent}>
                  <View style={styles.flagContainer}>
                    <Text style={styles.flag}>{language.flag}</Text>
                  </View>
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageName}>
                      {language.name}
                    </Text>
                    <Text style={styles.languageNativeName}>
                      {language.nativeName}
                    </Text>
                  </View>
                </View>
                {isSelected && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={28} 
                      color={COLORS.primary} 
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Áp dụng</Text>
        </TouchableOpacity>

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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.h3,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  descriptionContainer: {
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.lg,
  },
  description: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.text,
    lineHeight: 22,
  },
  languagesContainer: {
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.lg,
  },
  languageCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  languageCardSelected: {
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  selectedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(90, 195, 224, 0.1)',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    zIndex: 1,
  },
  flagContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  flag: {
    fontSize: 32,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.text,
    marginBottom: 4,
  },
  languageNativeName: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.text,
  },
  checkmarkContainer: {
    marginLeft: SIZES.sm,
    zIndex: 1,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md,
    marginHorizontal: SIZES.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  saveButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.body1,
    color: COLORS.white,
  },
});

export default LanguageScreen;
