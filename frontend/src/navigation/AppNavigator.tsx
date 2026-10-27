import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RegisterSuccessScreen from '../screens/RegisterSuccessScreen';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import SearchScreen from '../screens/SearchScreen';

const Stack = createNativeStackNavigator<any>();
const Tab = createBottomTabNavigator<any>();

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const isIos = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';
  const isMobileView = isWeb && (
    (typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent)) ||
    (typeof window !== 'undefined' && window.innerWidth <= 768)
  );
  
  // Floating bottom offset for 4-corner rounded pill:
  // Nudged down slightly closer to the bottom edge while preserving all 4 rounded corners
  const bottomOffset = isIos 
    ? Math.max(insets.bottom, 10) 
    : (isMobileView ? 12 : 10);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary, // Teal #0D9488
        tabBarInactiveTintColor: COLORS.textSecondary, // Slate #64748B
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomOffset,
          left: 16,
          right: 16,
          height: 66,
          borderRadius: 28,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E2EEEC',
          paddingTop: 4,
          paddingBottom: 4,
          paddingHorizontal: 8,
          shadowColor: '#134E4A',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 0,
          includeFontPadding: false,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{ tabBarLabel: 'Explore' }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
        initialRouteName="MainTabs"
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="RegisterSuccess" component={RegisterSuccessScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen 
          name="Search" 
          component={SearchScreen}
          options={{
            animation: 'none',
          }}
        />
      
      </Stack.Navigator>
    </NavigationContainer>
  );
};
