import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList, MainTabParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoadingScreen from '../screens/LoadingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RegisterSuccessScreen from '../screens/RegisterSuccessScreen';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import BookingsScreen from '../screens/BookingsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DestinationDetailScreen from '../screens/DestinationDetailScreen';
import BookingDetailScreen from '../screens/BookingDetailScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import SearchScreen from '../screens/SearchScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import TourServicesScreen from '../screens/TourServicesScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import PaymentResultScreen from '../screens/PaymentResultScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import PaymentMethodsProfileScreen from '../screens/PaymentMethodsProfileScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import ServicePackageDetailScreen from '../screens/ServicePackageDetailScreen';
import SecurityScreen from '../screens/SecurityScreen';
import SupportScreen from '../screens/SupportScreen';
import DarkModeScreen from '../screens/DarkModeScreen';
import LanguageScreen from '../screens/LanguageScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import AboutUsScreen from '../screens/AboutUsScreen';
import TourReviewScreen from '../screens/TourReviewScreen';
import ChatBotScreen from '../screens/ChatBotScreen';

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
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
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
      <Tab.Screen 
        name="Bookings" 
        component={BookingsScreen}
        options={{ 
          tabBarLabel: 'Trips',
        }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{ 
          tabBarLabel: 'Saved',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          tabBarLabel: 'Profile',
        }}
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
        initialRouteName="Loading"
      >
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="RegisterSuccess" component={RegisterSuccessScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen 
          name="DestinationDetail" 
          component={DestinationDetailScreen}
          options={{
            animation: 'none',
          }}
        />
        <Stack.Screen 
          name="BookingDetail" 
          component={BookingDetailScreen}
        />
        <Stack.Screen 
          name="Search" 
          component={SearchScreen}
          options={{
            animation: 'none',
          }}
        />
        <Stack.Screen 
          name="Reviews" 
          component={ReviewsScreen}
        />
        <Stack.Screen 
          name="TourServices" 
          component={TourServicesScreen}
        />
        <Stack.Screen 
          name="Payment" 
          component={PaymentScreen}
        />
        <Stack.Screen 
          name="PaymentSuccess" 
          component={PaymentSuccessScreen}
        />
        <Stack.Screen 
          name="PaymentResult" 
          component={PaymentResultScreen}
        />
        <Stack.Screen 
          name="OrderDetails" 
          component={OrderDetailsScreen}
        />
        <Stack.Screen 
          name="PersonalInfo" 
          component={PersonalInfoScreen}
        />
        <Stack.Screen 
          name="PaymentMethods" 
          component={PaymentMethodsScreen}
        />
        <Stack.Screen 
          name="PaymentMethodsProfile" 
          component={PaymentMethodsProfileScreen}
        />
        <Stack.Screen 
          name="ServicePackageDetail" 
          component={ServicePackageDetailScreen}
        />
        <Stack.Screen 
          name="Security" 
          component={SecurityScreen}
        />
        <Stack.Screen 
          name="Support" 
          component={SupportScreen}
        />
        <Stack.Screen 
          name="DarkMode" 
          component={DarkModeScreen}
        />
        <Stack.Screen 
          name="Language" 
          component={LanguageScreen}
        />
        <Stack.Screen 
          name="TermsOfService" 
          component={TermsOfServiceScreen}
        />
        <Stack.Screen 
          name="PrivacyPolicy" 
          component={PrivacyPolicyScreen}
        />
        <Stack.Screen 
          name="AboutUs" 
          component={AboutUsScreen}
        />
        <Stack.Screen 
          name="TourReview" 
          component={TourReviewScreen}
        />
        <Stack.Screen 
          name="ChatBot" 
          component={ChatBotScreen}
          options={{
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
