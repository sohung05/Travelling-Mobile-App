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
import { useDarkMode } from '../contexts/DarkModeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegisterScreen = () => {
  const { colors } = useDarkMode();
  const navigation = useNavigation<NavigationProp>();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRegister = async () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const { password, confirmPassword } = formData;
    const nextErrors: Record<string, string> = {};

    if (!name) nextErrors.name = 'Vui lòng nhập họ và tên';
    else if (name.length < 2) nextErrors.name = 'Họ và tên phải có ít nhất 2 ký tự';

    if (!email) nextErrors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Email không đúng định dạng';

    const normalizedPhone = phone.replace(/\s/g, '');
    if (!phone) nextErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^(0|\+84)[0-9]{9,10}$/.test(normalizedPhone)) nextErrors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';

    if (!password) nextErrors.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) nextErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';

    if (!confirmPassword) nextErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (password !== confirmPassword) nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';

    if (!acceptTerms) nextErrors.terms = 'Vui lòng chấp nhận điều khoản sử dụng';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const success = await register({
        name,
        email,
        phone: normalizedPhone,
        password,
      });

      if (success) {
        navigation.replace('Login');
      } else {
        setErrors({ general: 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin và thử lại.' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đăng ký thất bại. Vui lòng thử lại.';
      const lower = message.toLowerCase();
      if (lower.includes('email')) setErrors({ email: message });
      else if (lower.includes('phone') || lower.includes('số điện thoại')) setErrors({ phone: message });
      else if (lower.includes('password') || lower.includes('mật khẩu')) setErrors({ password: message });
      else if (lower.includes('full name') || lower.includes('họ và tên')) setErrors({ name: message });
      else setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Editorial Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Home' })}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ĐĂNG KÝ TÀI KHOẢN</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            {/* Logo Block Brand Lockup */}
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
                <Text style={styles.title}>TẠO TÀI KHOẢN MỚI</Text>
                <Text style={styles.subtitle}>
                  Tham gia cộng đồng để khám phá hàng ngàn tour hấp dẫn
                </Text>
              </View>
            </View>

                        {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>HỌ VÀ TÊN</Text>
              <View style={[styles.inputWrapper, !!errors.name && styles.inputWrapperError]}>
                <Ionicons name="person-outline" size={18} color={COLORS.slate} />
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor={COLORS.slate}
                />
              </View>
              {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <View style={[styles.inputWrapper, !!errors.email && styles.inputWrapperError]}>
                <Ionicons name="mail-outline" size={18} color={COLORS.slate} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.slate}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>SỐ ĐIỆN THOẠI</Text>
              <View style={[styles.inputWrapper, !!errors.phone && styles.inputWrapperError]}>
                <Ionicons name="call-outline" size={18} color={COLORS.slate} />
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  placeholder="0912 345 678"
                  placeholderTextColor={COLORS.slate}
                  keyboardType="phone-pad"
                />
              </View>
              {!!errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>MẬT KHẨU</Text>
              <View style={[styles.inputWrapper, !!errors.password && styles.inputWrapperError]}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.slate} />
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="Tối thiểu 6 ký tự"
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
              {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>XÁC NHẬN MẬT KHẨU</Text>
              <View style={[styles.inputWrapper, !!errors.confirmPassword && styles.inputWrapperError]}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.slate} />
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor={COLORS.slate}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color={COLORS.slate}
                  />
                </TouchableOpacity>
              </View>
              {!!errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsSection}>
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => {
                  setAcceptTerms(!acceptTerms);
                  if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }));
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked, !!errors.terms && styles.checkboxError]}>
                  {acceptTerms && (
                    <Ionicons name="checkmark" size={14} color={COLORS.white} />
                  )}
                </View>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>
                    Tôi đồng ý với{' '}
                    <Text style={styles.termsLink}>Điều khoản sử dụng</Text>
                    {' '}và{' '}
                    <Text style={styles.termsLink}>Chính sách bảo mật</Text>
                  </Text>
                </View>
              </TouchableOpacity>
              {!!errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}
            </View>

            {!!errors.general && <Text style={styles.generalErrorText}>{errors.general}</Text>}

{/* Register Button (button-pill-dark from DESIGN.md) */}
            <Button
              title="Đăng ký tài khoản"
              onPress={handleRegister}
              loading={loading}
              disabled={!acceptTerms}
              variant="darkPill"
              size="large"
              style={styles.registerButton}
            />

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => (navigation as any).navigate('Login')}>
                <Text style={styles.loginLink}>Đăng nhập ngay</Text>
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
    marginBottom: SIZES.lg,
  },
  logoBlock: {
    width: 38,
    height: 38,
    backgroundColor: COLORS.primary,
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
    marginBottom: SIZES.xl,
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
    fontSize: SIZES.h4 + 2,
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.slate,
    marginTop: 3,
  },
  inputContainer: {
    marginBottom: SIZES.md,
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
  inputWrapperError: {
    borderColor: COLORS.error || '#EF4444',
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
  errorText: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.error || '#EF4444',
    marginTop: 6,
    marginLeft: 4,
  },
  generalErrorText: {
    ...FONTS.regular,
    fontSize: 13,
    color: COLORS.error || '#EF4444',
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  termsSection: {
    marginVertical: SIZES.lg,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.slate,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.canvas,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxError: {
    borderColor: COLORS.error || '#EF4444',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.slate,
    lineHeight: 18,
  },
  termsLink: {
    ...FONTS.bold,
    color: COLORS.primary,
  },
  registerButton: {
    marginBottom: SIZES.lg,
    height: 50,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  loginText: {
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.slate,
  },
  loginLink: {
    ...FONTS.bold,
    fontSize: SIZES.body2,
    color: COLORS.primary,
  },
});

export default RegisterScreen;
