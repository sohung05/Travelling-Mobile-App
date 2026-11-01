import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SIZES, FONTS, SHADOWS, DEFAULT_AVATAR } from '../constants/theme';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Loading, Button } from '../components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, isGuest, logout, userBookings, userFavorites, isLoading, setPendingScreenAccess } = useAuth();
  const [loading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Show loading if still loading user data
  if (isLoading) {
    return <Loading fullScreen />;
  }

  // Function to check auth before navigating
  const handleNavigateWithAuth = (screen: string, screenName: string) => {
    if (isGuest) {
      setPendingScreenAccess(screenName);
      navigation.navigate('Login');
      return;
    }
    navigation.navigate(screen as any);
  };

  const menuItems = [
    {
      id: 'personal',
      title: 'Thông tin cá nhân',
      icon: 'person-outline',
      onPress: () => handleNavigateWithAuth('PersonalInfo', 'Profile'),
      requireAuth: true,
    },
    {
      id: 'payment',
      title: 'Phương thức thanh toán',
      icon: 'card-outline',
      onPress: () => handleNavigateWithAuth('PaymentMethodsProfile', 'Profile'),
      requireAuth: true,
    },
    {
      id: 'security',
      title: 'Bảo mật tài khoản',
      icon: 'shield-checkmark-outline',
      onPress: () => handleNavigateWithAuth('Security', 'Profile'),
      requireAuth: true,
    },
    {
      id: 'language',
      title: 'Ngôn ngữ',
      icon: 'globe-outline',
      value: 'Tiếng Việt',
      onPress: () => navigation.navigate('Language'),
      requireAuth: false,
    },
  ];

  const supportItems = [
    {
      id: 'help',
      title: 'Trung tâm trợ giúp',
      icon: 'help-circle-outline',
      onPress: () => navigation.navigate('Support'),
    },
    {
      id: 'terms',
      title: 'Điều khoản dịch vụ',
      icon: 'document-text-outline',
      onPress: () => navigation.navigate('TermsOfService'),
    },
    {
      id: 'privacy',
      title: 'Chính sách bảo mật',
      icon: 'lock-closed-outline',
      onPress: () => navigation.navigate('PrivacyPolicy'),
    },
    {
      id: 'about',
      title: 'Về chúng tôi',
      icon: 'information-circle-outline',
      onPress: () => navigation.navigate('AboutUs'),
    },
  ];

  const handleLogout = () => {
    if (isGuest) {
      navigation.navigate('Login');
      return;
    }

    setLogoutError(null);
    setShowLogoutConfirmation(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await logout();
      setShowLogoutConfirmation(false);
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Failed to log out:', error);
      setLogoutError('Không thể đăng xuất. Vui lòng thử lại.');
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <Image
            source={{ uri: isGuest ? DEFAULT_AVATAR : (user?.avatar || DEFAULT_AVATAR) }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {isGuest ? 'Khách trải nghiệm' : (user?.name || 'Thành viên')}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {isGuest ? 'Đăng nhập để nhận ưu đãi tour' : (user?.email || 'user@example.com')}
            </Text>
          </View>
          {!isGuest && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleNavigateWithAuth('PersonalInfo', 'Profile')}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Login Button for Guest */}
        {isGuest && (
          <View style={styles.loginPrompt}>
            <Button
              title="Đăng nhập / Đăng ký"
              onPress={handleLogin}
              variant="primary"
              size="medium"
            />
          </View>
        )}

        {/* Stats Row */}
        {!isGuest && (() => {
          const now = new Date();
          const upcomingBookings = userBookings.filter(booking => {
            try {
              const depDate = new Date(booking.departureDate.split('/').reverse().join('-'));
              return depDate > now && (booking.status === 'confirmed' || booking.status === 'pending');
            } catch (error) {
              return false;
            }
          });
          
          return (
            <View style={styles.statsContainer}>
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => handleNavigateWithAuth('Bookings', 'Bookings')}
                activeOpacity={0.8}
              >
                <Text style={styles.statValue}>{upcomingBookings.length}</Text>
                <Text style={styles.statLabel}>Chuyến đi sắp tới</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => handleNavigateWithAuth('Favorites', 'Favorites')}
                activeOpacity={0.8}
              >
                <Text style={styles.statValue}>{userFavorites.length}</Text>
                <Text style={styles.statLabel}>Điểm đến đã lưu</Text>
              </TouchableOpacity>
            </View>
          );
        })()}

        {/* Settings Section */}
        <View style={styles.section}>
          
          <View style={styles.menuCard}>
            {/* Notifications Toggle */}
            <View style={styles.menuItemContainer}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Ionicons name="notifications-outline" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.menuItemText}>Thông báo hành trình</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.hairline, true: '#99F6E4' }}
                thumbColor={notificationsEnabled ? COLORS.primary : COLORS.slate}
              />
            </View>

            <View style={styles.divider} />

            {/* Dark Mode Toggle */}
            <View style={styles.menuItemContainer}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Ionicons name="moon-outline" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.menuItemText}>Chế độ ban đêm</Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: COLORS.hairline, true: '#99F6E4' }}
                thumbColor={darkModeEnabled ? COLORS.primary : COLORS.slate}
              />
            </View>

            <View style={styles.divider} />

            {/* Menu Items */}
            {menuItems.map((item, index) => (
              <View key={item.id}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.menuItemContainer}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIcon}>
                      <Ionicons name={item.icon as any} size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.value && (
                      <Text style={styles.menuItemValue}>{item.value}</Text>
                    )}
                    <Ionicons name="chevron-forward" size={16} color={COLORS.slate} />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          
          <View style={styles.menuCard}>
            {supportItems.map((item, index) => (
              <View key={item.id}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.menuItemContainer}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIcon}>
                      <Ionicons name={item.icon as any} size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.slate} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        {!isGuest && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.logoutButton} 
              activeOpacity={0.8}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal
          transparent
          animationType="fade"
          visible={showLogoutConfirmation}
          onRequestClose={() => {
            if (!isLoggingOut) setShowLogoutConfirmation(false);
          }}
        >
          <View style={styles.logoutModalOverlay}>
            <View style={styles.logoutModal}>
              <Text style={styles.logoutModalTitle}>Đăng xuất</Text>
              <Text style={styles.logoutModalMessage}>
                Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?
              </Text>
              {logoutError && (
                <Text style={styles.logoutError}>{logoutError}</Text>
              )}
              <View style={styles.logoutModalActions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={isLoggingOut}
                  onPress={() => setShowLogoutConfirmation(false)}
                  style={styles.logoutCancelButton}
                >
                  <Text style={styles.logoutCancelText}>Hủy</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={isLoggingOut}
                  onPress={confirmLogout}
                  style={styles.logoutConfirmButton}
                >
                  <Text style={styles.logoutConfirmText}>
                    {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <View style={{ height: 130 }} />
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
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.sm,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 110,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    padding: SIZES.md + 2,
    borderRadius: SIZES.cardRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: SIZES.md,
    borderWidth: 2,
    borderColor: '#99F6E4',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...FONTS.bold,
    fontSize: SIZES.h5,
    color: COLORS.ink,
    marginBottom: 3,
  },
  userEmail: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.slate,
  },
  editButton: {
    width: 38,
    height: 38,
    borderRadius: SIZES.radiusFull,
    backgroundColor: '#E6F4F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1EAE6',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E6F4F2',
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.cardRadius,
    borderWidth: 1,
    borderColor: '#D1EAE6',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...FONTS.black,
    fontSize: 22,
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  statLabel: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.slate,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#D1EAE6',
    marginVertical: 4,
  },
  section: {
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.cardRadius,
    paddingVertical: SIZES.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  menuItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E6F4F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm + 4,
  },
  menuItemText: {
    ...FONTS.medium,
    fontSize: SIZES.body2,
    color: COLORS.ink,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  menuItemValue: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.slate,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.hairline,
    marginHorizontal: SIZES.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    ...SHADOWS.light,
  },
  logoutText: {
    ...FONTS.bold,
    fontSize: SIZES.body2,
    color: '#EF4444',
  },
  logoutModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  logoutModal: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.cardRadius,
    padding: SIZES.xl,
  },
  logoutModalTitle: {
    ...FONTS.bold,
    color: COLORS.ink,
    fontSize: SIZES.h3,
  },
  logoutModalMessage: {
    ...FONTS.regular,
    color: COLORS.slate,
    fontSize: SIZES.body2,
    marginTop: SIZES.sm,
  },
  logoutError: {
    ...FONTS.medium,
    color: '#EF4444',
    fontSize: SIZES.body3,
    marginTop: SIZES.sm,
  },
  logoutModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SIZES.sm,
    marginTop: SIZES.xl,
  },
  logoutCancelButton: {
    justifyContent: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
  },
  logoutCancelText: {
    ...FONTS.semiBold,
    color: COLORS.slate,
    fontSize: SIZES.body2,
  },
  logoutConfirmButton: {
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
  },
  logoutConfirmText: {
    ...FONTS.semiBold,
    color: COLORS.white,
    fontSize: SIZES.body2,
  },
  loginPrompt: {
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.lg,
  },
});

export default ProfileScreen;