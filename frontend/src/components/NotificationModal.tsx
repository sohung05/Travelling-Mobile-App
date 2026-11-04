import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Pressable,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string; // 'booking', 'payment', 'review', 'system'
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead?: () => void;
  onNotificationRead?: (notificationId: string) => void;
  onDeleteNotification?: (notificationId: string) => void;
}

const { height, width } = Dimensions.get('window');

// Swipeable Notification Card Component
interface SwipeableNotificationCardProps {
  notification: NotificationItem;
  index: number;
  totalNotifications: number;
  onPress: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
  getIconName: (type: string) => string;
  getIconColor: (type: string) => string;
  getTimeAgo: (createdAt: string) => string;
}

const SwipeableNotificationCard: React.FC<SwipeableNotificationCardProps> = ({
  notification,
  index,
  totalNotifications,
  onPress,
  onDelete,
  getIconName,
  getIconColor,
  getTimeAgo,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteThreshold = 100; // Swipe 100px to the left to delete

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        translateX.setOffset((translateX as any)._value || 0);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow swiping left (negative dx)
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        } else {
          translateX.setValue(0);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        const currentValue = (translateX as any)._value || 0;
        
        // If swiped past threshold, delete automatically
        if (currentValue < -deleteThreshold) {
          Animated.timing(translateX, {
            toValue: -width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onDelete(notification.id);
          });
        } else {
          // Otherwise, snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={[
      styles.swipeableContainer,
      index === totalNotifications - 1 && styles.lastCard,
    ]}>
      {/* Notification Card */}
      <Animated.View
        style={[
          styles.notificationCard,
          !notification.read && styles.unreadCard,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onPress(notification.id)}
        >
          <View style={styles.cardContent}>
            <View style={[
              styles.notificationIconContainer,
              !notification.read && styles.unreadIconContainer
            ]}>
              <Ionicons
                name={getIconName(notification.type) as any}
                size={24}
                color={getIconColor(notification.type)}
              />
              {!notification.read && (
                <View style={styles.unreadIndicator} />
              )}
            </View>
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text 
                  style={[
                    styles.notificationTitle,
                    !notification.read && styles.unreadTitle
                  ]}
                  numberOfLines={2}
                >
                  {notification.title}
                </Text>
                <Text style={styles.notificationTime}>
                  {getTimeAgo(notification.createdAt)}
                </Text>
              </View>
              <Text 
                style={styles.notificationMessage}
                numberOfLines={2}
              >
                {notification.message}
              </Text>
            </View>
            {!notification.read && (
              <View style={styles.unreadDot} />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  notifications,
  onMarkAllAsRead,
  onNotificationRead,
  onDeleteNotification,
}) => {
  const handleMarkAllAsRead = () => {
    onMarkAllAsRead?.();
  };

  const handleNotificationPress = (notificationId: string) => {
    onNotificationRead?.(notificationId);
  };

  const handleDeleteNotification = (notificationId: string) => {
    onDeleteNotification?.(notificationId);
  };

  const getTimeAgo = (createdAt: string) => {
    try {
      const now = new Date();
      const created = new Date(createdAt);
      const diffMs = now.getTime() - created.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 30) return `${diffDays} ngày trước`;
      return created.toLocaleDateString('vi-VN');
    } catch (error) {
      return 'Vừa xong';
    }
  };
  const getIconName = (type: string) => {
    switch (type) {
      case 'booking':
        return 'calendar';
      case 'payment':
        return 'card';
      case 'review':
        return 'star';
      case 'system':
        return 'notifications';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'booking':
        return COLORS.primary;
      case 'payment':
        return COLORS.gold;
      case 'review':
        return COLORS.amber;
      default:
        return COLORS.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable 
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Ionicons name="notifications" size={24} color={COLORS.white} />
                <Text style={styles.headerTitle}>Thông báo</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="notifications-outline"
                  size={80}
                  color="#64B5F6"
                />
                <Text style={styles.emptyTitle}>Không có thông báo nào</Text>
                <Text style={styles.emptyText}>
                  Bạn sẽ nhận được thông báo mới ở đây
                </Text>
              </View>
            ) : (
              <View style={styles.notificationsList}>
                {notifications.map((notification, index) => (
                  <SwipeableNotificationCard
                    key={notification.id}
                    notification={notification}
                    index={index}
                    totalNotifications={notifications.length}
                    onPress={handleNotificationPress}
                    onDelete={handleDeleteNotification}
                    getIconName={getIconName}
                    getIconColor={getIconColor}
                    getTimeAgo={getTimeAgo}
                  />
                ))}
              </View>
            )}
          </ScrollView>

          {notifications.length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={handleMarkAllAsRead}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-done" size={18} color={COLORS.white} style={{ marginRight: SIZES.xs }} />
                <Text style={styles.markAllText}>Đánh dấu tất cả đã đọc</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: height * 0.8,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    ...SHADOWS.heavy,
  },
  header: {
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    paddingTop: SIZES.md,
    paddingBottom: SIZES.md,
    paddingHorizontal: SIZES.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.white,
    marginLeft: SIZES.sm,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.md,
    paddingBottom: SIZES.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxl * 2,
    minHeight: height * 0.5,
  },
  emptyTitle: {
    ...FONTS.bold,
    fontSize: SIZES.h4,
    color: COLORS.text,
    marginTop: SIZES.lg,
    marginBottom: SIZES.sm,
  },
  emptyText: {
    ...FONTS.regular,
    fontSize: SIZES.body1,
    color: COLORS.text,
    textAlign: 'center',
    paddingHorizontal: SIZES.xl,
    lineHeight: 22,
  },
  notificationsList: {
    paddingBottom: SIZES.xs,
  },
  swipeableContainer: {
    marginBottom: SIZES.md,
    position: 'relative',
    overflow: 'hidden',
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  unreadCard: {
    backgroundColor: COLORS.canvas,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    ...SHADOWS.light,
  },
  lastCard: {
    marginBottom: 0,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
    position: 'relative',
    backgroundColor: COLORS.soft,
  },
  unreadIconContainer: {
    backgroundColor: 'rgba(250, 144, 0, 0.1)',
  },
  unreadIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.liveRed,
    borderWidth: 1.5,
    borderColor: COLORS.canvas,
  },
  notificationContent: {
    flex: 1,
    paddingRight: SIZES.sm,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.xs,
  },
  notificationTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.ink,
    flex: 1,
    lineHeight: 20,
  },
  unreadTitle: {
    ...FONTS.bold,
    color: COLORS.ink,
  },
  notificationTime: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.slate,
    marginTop: 2,
  },
  notificationMessage: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.charcoal,
    lineHeight: 20,
    marginTop: SIZES.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: SIZES.sm,
  },
  footer: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    paddingBottom: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.sm+3,
    paddingHorizontal: SIZES.lg,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    minWidth: 200,
    ...SHADOWS.medium,
  },
  markAllText: {
    ...FONTS.semiBold,
    fontSize: SIZES.body1,
    color: COLORS.white,
  },
});

