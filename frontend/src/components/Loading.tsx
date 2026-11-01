import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { COLORS, SIZES, FONTS } from '../constants/theme';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  text = 'Loading...',
  fullScreen = false,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        style={styles.content}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        {text && <Text style={styles.text}>{text}</Text>}
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    alignItems: 'center',
    gap: SIZES.md,
  },
  text: {
    ...FONTS.medium,
    fontSize: SIZES.body1,
    color: COLORS.textSecondary,
  },
});


