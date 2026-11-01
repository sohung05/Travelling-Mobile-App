import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { CHATBOT_ASSETS } from '../constants/images';
import { ChatMessage } from '../types';
import { chatbotService, TRAVEL_PROMPT_SUGGESTIONS } from '../api/chatbotService';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome_1',
    sender: 'assistant',
    text: `👋 Xin chào! Tôi là **Trợ lý du lịch AI** của Travelling App.\n\nTôi có thể giúp bạn:\n• 🏖️ Tư vấn & gợi ý tour du lịch theo sở thích.\n• 📅 Lên lịch trình khám phá (Tokyo, Bali, Paris, Phú Quốc...).\n• 💰 Tìm kiếm các gói tour tiết kiệm chi phí.\n• 📜 Giải đáp chính sách đặt chỗ, thanh toán & hoàn hủy.\n\nBạn đang muốn khám phá điểm đến nào?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

export const ChatBotScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, 120);
  };

  useEffect(() => {
    scrollToBottom(false);
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const responseText = await chatbotService.sendMessage(content);
      const botMessage: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: 'Rất tiếc, đã xảy ra lỗi kết nối với trợ lý AI. Vui lòng thử lại sau giây lát!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Làm mới đoạn chat',
      'Bạn có muốn xóa lịch sử cuộc trò chuyện này và bắt đầu lại?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Làm mới',
          style: 'destructive',
          onPress: () => {
            setMessages(INITIAL_MESSAGES);
          },
        },
      ]
    );
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.assistantMessageRow,
        ]}
      >
        {!isUser && (
          <View style={styles.botAvatarBadge}>
            <Image
              source={CHATBOT_ASSETS.explorerRobot3D}
              style={styles.botAvatarImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.assistantMessageText,
            ]}
          >
            {item.text}
          </Text>

          <Text
            style={[
              styles.timestampText,
              isUser ? styles.userTimestamp : styles.assistantTimestamp,
            ]}
          >
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 1. Header Trợ Lý AI */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={styles.headerAvatarWrapper}>
            <View style={styles.headerAvatar}>
              <Image
                source={CHATBOT_ASSETS.explorerRobot3D}
                style={styles.headerAvatarImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.headerOnlineDot} />
          </View>

          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>Trợ lý du lịch AI</Text>
            <Text style={styles.headerSubtitle}>Trực tuyến • Hỗ trợ 24/7</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleClearHistory}
          accessibilityLabel="Làm mới"
        >
          <Ionicons name="refresh-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        {/* 2. Danh sách tin nhắn */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.typingIndicatorRow}>
                <View style={styles.botAvatarBadge}>
                  <Image
                    source={CHATBOT_ASSETS.explorerRobot3D}
                    style={styles.botAvatarImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color="#0D9488" />
                  <Text style={styles.typingText}>Trợ lý đang suy nghĩ...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* 3. Gợi ý câu hỏi nhanh (Example Prompts kế thừa từ ai-pdf-chatbot-langchain) */}
        <View style={styles.suggestionsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScroll}
          >
            {TRAVEL_PROMPT_SUGGESTIONS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestionChip}
                activeOpacity={0.7}
                onPress={() => handleSendMessage(item.prompt)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={15}
                  color="#0D9488"
                  style={styles.suggestionIcon}
                />
                <Text style={styles.suggestionText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 4. Thanh nhập câu hỏi */}
        <View style={[styles.inputBarWrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.inputInnerContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Hỏi bất kỳ điều gì về chuyến đi..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={400}
              editable={!isLoading}
            />

            {inputText.length > 0 && (
              <TouchableOpacity
                style={styles.clearInputButton}
                onPress={() => setInputText('')}
              >
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim().length === 0 || isLoading
                  ? styles.sendButtonDisabled
                  : styles.sendButtonActive,
              ]}
              disabled={inputText.trim().length === 0 || isLoading}
              onPress={() => handleSendMessage()}
            >
              <Ionicons
                name="send"
                size={18}
                color="#FFFFFF"
                style={styles.sendIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  headerAvatarWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CCECE7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  headerOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerTextGroup: {
    justifyContent: 'center',
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  headerSubtitle: {
    ...FONTS.regular,
    fontSize: 12,
    color: '#10B981',
    marginTop: 1,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  botAvatarBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CCECE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  botAvatarImage: {
    width: '100%',
    height: '100%',
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: '#0D9488',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
    ...FONTS.regular,
  },
  assistantMessageText: {
    color: '#1E293B',
    ...FONTS.regular,
  },
  timestampText: {
    fontSize: 10,
    marginTop: 6,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: '#94A3B8',
    textAlign: 'left',
  },
  typingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  typingText: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
  suggestionsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6F5',
    borderWidth: 1,
    borderColor: '#CCECE7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  suggestionIcon: {
    marginRight: 6,
  },
  suggestionText: {
    fontSize: 13,
    color: '#0D9488',
    fontWeight: '600',
  },
  inputBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  inputInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    maxHeight: 100,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
  },
  clearInputButton: {
    padding: 4,
    marginRight: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#0D9488',
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  sendIcon: {
    marginLeft: 2,
  },
});

export default ChatBotScreen;
