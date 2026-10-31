import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { Button } from '../components';
import { useAuth } from '../contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login, pendingTourBooking, clearPendingTour, pendingScreen, clearPendingScreen } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    
    if (success) {
      if (pendingTourBooking) {
        navigation.replace('TourServices', { destination: pendingTourBooking });
        clearPendingTour();
      } else if (pendingScreen) {
        (navigation as any).replace('MainTabs', { screen: pendingScreen });
        clearPendingScreen();
      } else {
        navigation.replace('MainTabs');
      }
    } else {
      Alert.alert('Đăng nhập thất bại', 'Vui lòng kiểm tra lại thông tin tài khoản hoặc mật khẩu.');
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Editorial Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Home' })}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TÀI KHOẢN</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            {/* Al Jazeera Logo Block Brand Lockup */}
            <View style={styles.brandRow}>
              <View style={styles.logoBlock}>
                <Ionicons name="paper-plane" size={22} color={COLORS.canvas} />
              </View>
              <Text style={styles.brandName}>TRAVELLIN</Text>
            </View>

            {/* Section Eyebrow Lockup */}
            <View style={styles.titleLockup}>
              <View style={styles.accentBar} />
              <View>
                <Text style={styles.title}>CHÀO MỪNG TRỞ LẠI</Text>
                <Text style={styles.subtitle}>
                  Đăng nhập để tiếp tục khám phá thế giới cùng chúng tôi
                </Text>
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>EMAIL / TÀI KHOẢN</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={COLORS.slate} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="admin hoặc name@example.com"
                  placeholderTextColor={COLORS.slate}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>MẬT KHẨU</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.slate} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.slate}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color={COLORS.slate}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Admin Test Hint */}
            <TouchableOpacity
              style={styles.adminHintBox}
              onPress={() => {
                setEmail('admin');
                setPassword('admin12345');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="sparkles" size={15} color={COLORS.primary} />
              <Text style={styles.adminHintText}>
                Tài khoản thử nghiệm:{' '}
                <Text style={styles.adminHintBold}>admin / admin12345</Text> (Chạm để điền)
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* Login Button (button-pill-dark from DESIGN.md) */}
            <Button
              title="Đăng nhập"
              onPress={handleLogin}
              loading={loading}
              variant="darkPill"
              size="large"
              style={styles.loginButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>HOẶC ĐĂNG NHẬP VỚI</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('google')}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={18} color={COLORS.liveRed} />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('facebook')}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-facebook" size={18} color="#1877F2" />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.hairline,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: 12,
    color: COLORS.ink,
    letterSpacing: 1,
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: SIZES.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.xl,
  },
  logoBlock: {
    width: 38,
    height: 38,
    backgroundColor: COLORS.primary, // Signature orange block from DESIGN.md
    borderRadius: SIZES.radiusSm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    ...FONTS.black,
    fontSize: 20,
    color: COLORS.ink,
    letterSpacing: 1.5,
  },
  titleLockup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.xxl,
  },
  accentBar: {
    width: 4,
    height: 36,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusXs,
    marginRight: SIZES.sm,
    marginTop: 2,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.h3,
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.slate,
    marginTop: 4,
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: SIZES.lg,
  },
  inputLabel: {
    ...FONTS.bold,
    fontSize: 11,
    color: COLORS.ink,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.soft,
    borderRadius: SIZES.radiusXl, // 22px capsule from DESIGN.md
    paddingHorizontal: SIZES.md + 2,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    gap: SIZES.sm,
  },
  input: {
    flex: 1,
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.ink,
  },
  eyeButton: {
    padding: SIZES.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SIZES.xl,
  },
  forgotPasswordText: {
    ...FONTS.semiBold,
    fontSize: SIZES.body3,
    color: COLORS.primary,
  },
  adminHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: SIZES.radiusMd,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: 'rgba(235, 94, 40, 0.25)',
    gap: 8,
  },
  adminHintText: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.ink,
    flex: 1,
  },
  adminHintBold: {
    ...FONTS.bold,
    color: COLORS.primary,
  },
  loginButton: {
    marginBottom: SIZES.xl,
    height: 50,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.hairline,
  },
  dividerText: {
    ...FONTS.bold,
    fontSize: 10,
    color: COLORS.slate,
    marginHorizontal: SIZES.md,
    letterSpacing: 0.8,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.xl,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.canvas,
    borderRadius: SIZES.radiusXl,
    height: 46,
    gap: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    ...SHADOWS.light,
  },
  socialText: {
    ...FONTS.semiBold,
    fontSize: SIZES.body2,
    color: COLORS.ink,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.sm,
  },
  registerText: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.slate,
  },
  registerLink: {
    ...FONTS.bold,
    fontSize: SIZES.body2,
    color: COLORS.primary,
  },
});

export default LoginScreen;
