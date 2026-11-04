import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SIZES, FONTS } from '../constants/theme';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

const LoadingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  
  // Animation states
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [showSuitcase, setShowSuitcase] = useState(false);
  const [showInText, setShowInText] = useState(false);
  const [hideInLetters, setHideInLetters] = useState(false); 
  const [showValiIn, setShowValiIn] = useState(false); // hiện 'in' màu xanh trong vali
  const [showSubtitle, setShowSubtitle] = useState(false);
  const suitcaseAnim = useRef(new Animated.Value(-180)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const inTextOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const inTextOutAnim = useRef(new Animated.Value(1)).current; // opacity for 'in' outside
  const [inColored, setInColored] = useState(false); 
  const inRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const letters = "Travellin".length;
    let currentLetter = 0;
    const letterInterval = setInterval(() => {
      currentLetter++;
      setVisibleLetters(currentLetter);
      if (currentLetter >= letters) {
        clearInterval(letterInterval);
        setTimeout(() => {
          setHideInLetters(true); 
          setShowSuitcase(true); 
          Animated.parallel([
            Animated.timing(suitcaseAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            })
          ]).start(() => {
            setShowValiIn(true);
            setTimeout(() => {
              setShowSubtitle(true);
              Animated.timing(subtitleOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }).start();
            }, 450);
          });
        }, 400);
      }
    }, 100);

    // Navigate sau tổng thời gian animation
    const timer = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 5400);

    return () => {
      clearInterval(letterInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../img/home.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.2)']}
        style={styles.gradient}
      />

      <View style={styles.content}>
        <View style={styles.logoWrapper}>
          <View style={styles.logoContainer}>
            {/* Render từng ký tự Travellin hoặc chỉ Travell (nếu hideInLetters) */}
            <Text style={styles.logoText}>{hideInLetters ? 'Travell' : 'Travellin'.substring(0, visibleLetters)}</Text>
            {/* Khi hideInLetters, render vali bên phải chữ, cùng baseline */}
            {hideInLetters && (
              <Animated.View
                style={[
                  styles.suitcaseWrapper,
                  {
                    transform: [{ translateY: suitcaseAnim }],
                    opacity: opacityAnim,
                    marginLeft: 3,
                    marginBottom: 6 // để sát baseline dòng chữ
                  }
                ]}
              >
                <View style={styles.handleTop} />
                <View style={styles.suitcaseBody}>
                  {/* Sau khi vali chạm, hiện chữ 'in' xanh trong vali */}
                  {showValiIn && (
                    <Text style={styles.textInside}>in</Text>
                  )}
                </View>
              </Animated.View>
            )}
          </View>
          
          {/* Step 3: Animated subtitle */}
          {showSubtitle && (
            <Animated.Text 
              style={[
                styles.subtitle,
                { opacity: subtitleOpacity }
              ]}
            >
              Khám phá thế giới cùng chúng tôi
            </Animated.Text>
          )}
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  logoWrapper: {
    alignItems: 'center',
    marginTop: -100,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 90,
    marginBottom: SIZES.md,
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
    marginHorizontal: 2,
    marginBottom: 0,
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
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.h4,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.97,
    marginTop: -10,
    fontStyle: 'italic',
    fontWeight: 'bold',
    textShadowColor: COLORS.black,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
});

export default LoadingScreen;
