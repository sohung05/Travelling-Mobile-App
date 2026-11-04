import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  View,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatbotFABProps {
  onPress: () => void;
  bottomOffset?: number;
  /**
   * Truyền đường dẫn ảnh tùy chỉnh (ví dụ: require('../../assets/my_bot.png'))
   * Mặc định sử dụng ảnh chatbot_icon.jpg được tạo sẵn giống hệt hình thiết kế
   */
  customImageSource?: any;
}

export const ChatbotFAB: React.FC<ChatbotFABProps> = ({ 
  onPress,
  bottomOffset = 96, // Vị trí nằm ngay phía trên thanh Bottom Tab Bar
  customImageSource = require('../../assets/chatbot_icon.jpg'),
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Hiệu ứng xuất hiện pop-up mượt mà
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Hiệu ứng nhấp nháy nhẹ (pulse) thu hút người dùng
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [pulseAnim, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.fabContainer,
        {
          bottom: bottomOffset,
          transform: [
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {/* Vòng hào quang sáng phía sau */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim.interpolate({
              inputRange: [1, 1.08],
              outputRange: [0.35, 0.1],
            }),
          },
        ]}
      />

      <TouchableOpacity
        style={styles.fabButton}
        activeOpacity={0.85}
        onPress={onPress}
      >
        {customImageSource ? (
          /* Hiển thị ảnh trực tiếp (ảnh icon chatbot) */
          <Image
            source={customImageSource}
            style={styles.imageIcon}
            resizeMode="cover"
          />
        ) : (
          /* Biểu tượng dự phòng khi không truyền ảnh */
          <View style={styles.iconWrapper}>
            <Ionicons name="chatbubble-ellipses" size={28} color="#FFFFFF" />
            <View style={styles.onlineBadge} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0D9488',
  },
  fabButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0D9488', // Màu Teal chủ đạo của app Travelling
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#134E4A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 6px 16px rgba(13, 148, 136, 0.4)',
        cursor: 'pointer',
      },
    }),
  },
  imageIcon: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981', // Xanh lá biểu thị trạng thái online
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});

export default ChatbotFAB;
