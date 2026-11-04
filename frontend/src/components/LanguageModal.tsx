import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLanguage: (languageId: string) => void;
  selectedLanguage: string;
}

const LanguageModal: React.FC<LanguageModalProps> = ({
  visible,
  onClose,
  onSelectLanguage,
  selectedLanguage,
}) => {
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
    onSelectLanguage(languageId);
    onClose();
  };

  const renderLanguageItem = ({ item }: { item: typeof languages[0] }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        selectedLanguage === item.id && styles.selectedLanguageItem
      ]}
      onPress={() => handleSelectLanguage(item.id)}
    >
      <View style={styles.languageLeft}>
        <Text style={styles.languageFlag}>{item.flag}</Text>
        <View style={styles.languageInfo}>
          <Text style={[
            styles.languageName,
            selectedLanguage === item.id && styles.selectedLanguageName
          ]}>
            {item.name}
          </Text>
          <Text style={styles.languageNativeName}>
            {item.nativeName}
          </Text>
        </View>
      </View>
      {selectedLanguage === item.id && (
        <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Chọn ngôn ngữ</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Language List */}
            <FlatList
              data={languages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.id}
              style={styles.languageList}
              showsVerticalScrollIndicator={false}
            />
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    maxHeight: '80%',
  },
  modalContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedLanguageItem: {
    backgroundColor: COLORS.primaryLight,
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: SIZES.md,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    ...FONTS.semiBold,
    color: COLORS.text,
    marginBottom: SIZES.xs / 2,
  },
  selectedLanguageName: {
    color: COLORS.primary,
  },
  languageNativeName: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.gray,
  },
});

export default LanguageModal;


