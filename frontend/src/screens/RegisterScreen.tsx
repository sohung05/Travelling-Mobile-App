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

const RegisterScreen = () => {
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { name, email, phone, password, confirmPassword } = formData;

    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin đăng ký');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Lưu ý', 'Vui lòng chấp nhận điều khoản sử dụng');
      return;
    }

    setLoading(true);
    const success = await register({
      name,
      email,
      phone,
      password,
    });
    setLoading(false);
    
    if (success) {
      navigation.replace('RegisterSuccess');
    } else {
      Alert.alert('Đăng ký thất bại', 'Vui lòng kiểm tra lại thông tin và thử lại.');
    }
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
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={COLORS.slate} />
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor={COLORS.slate}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <View style={styles.inputWrapper}>
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
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>SỐ ĐIỆN THOẠI</Text>
              <View style={styles.inputWrapper}>
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
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>MẬT KHẨU</Text>
              <View style={styles.inputWrapper}>
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
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>XÁC NHẬN MẬT KHẨU</Text>
              <View style={styles.inputWrapper}>
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
            </View>

            {/* Terms and Conditions */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
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

            {/* Register Button (button-pill-dark from DESIGN.md) */}
            <Button
              title="Đăng ký tài khoản"
              onPress={handleRegister}
              loading={loading}
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
  input: {
    flex: 1,
    ...FONTS.regular,
    fontSize: SIZES.body2,
    color: COLORS.ink,
  },
  eyeButton: {
    padding: SIZES.xs,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.lg,
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
