import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SIZES, FONTS } from '../constants/theme';
import { RootStackParamList } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegisterSuccessScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleExplore = () => {
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <View style={styles.content}>
        {/* Center Content - Logo, Title, Subtitle grouped together */}
        <View style={styles.centerContent}>
          {/* Logo Travellin */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Text style={styles.logoText}>Travell</Text>
              <View style={styles.suitcaseWrapper}>
                <View style={styles.handleTop} />
                <View style={styles.suitcaseBody}>
                  <Text style={styles.textInside}>in</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            Tạo tài khoản thành công
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Sau đây bạn có thể khám phá bất kỳ nơi nào bạn muốn và tận hưởng nó!
          </Text>
        </View>

        {/* Button at bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleExplore}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Let's Explore</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.lg,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 90,
  },
  logoText: {
    fontSize: 60,
    fontWeight: '600',
    color: COLORS.white,
    lineHeight: 73,
  },
  suitcaseWrapper: {
    width: 52,
    height: 65,
    marginLeft: 3,
    marginBottom: 6,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  handleTop: {
    position: 'absolute',
    width: 33,
    height: 12,
    left: 9,
    top: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.white,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  suitcaseBody: {
    position: 'absolute',
    width: 55,
    height: 58,
    left: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInside: {
    fontSize: 50,
    fontWeight: '600',
    color: COLORS.primary,
    lineHeight: 58,
    marginTop: 0,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.h2 ,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SIZES.sm,
    lineHeight: SIZES.h1 + 12,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: 18,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
    paddingHorizontal: SIZES.md,
  },
  buttonContainer: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.md,
  },
  button: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md + 4,
    paddingHorizontal: SIZES.xl * 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonText: {
    ...FONTS.bold,
    fontSize: 20,
    color: COLORS.black,
  },
});

export default RegisterSuccessScreen;

