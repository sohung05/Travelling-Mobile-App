import React from 'react';
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RegisterSuccessScreen from '../screens/RegisterSuccessScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

type MainTabsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'MainTabs'
>;

function MainTabsScreen({ navigation }: MainTabsScreenProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập thành công</Text>
      <Text style={styles.message}>Bạn đã sẵn sàng khám phá Travellin.</Text>
      <Pressable
        accessibilityRole="button"
        onPress={handleLogout}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </Pressable>
    </View>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen
          name="RegisterSuccess"
          component={RegisterSuccessScreen}
        />
        <Stack.Screen name="MainTabs" component={MainTabsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
    backgroundColor: COLORS.background,
  },
  title: {
    ...FONTS.bold,
    color: COLORS.ink,
    fontSize: SIZES.h2,
    textAlign: 'center',
  },
  message: {
    ...FONTS.regular,
    color: COLORS.slate,
    fontSize: SIZES.body1,
    marginTop: SIZES.sm,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    marginTop: SIZES.xl,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
  },
  buttonText: {
    ...FONTS.semiBold,
    color: COLORS.white,
    fontSize: SIZES.body1,
  },
});
