import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, View } from 'react-native';
import { COLORS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: typeof COLORS;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

interface DarkModeProviderProps {
  children: React.ReactNode;
}

const lightColors = {
  ...COLORS,
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
};

const darkColors = {
  ...COLORS,
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  surface: '#1E1E1E',
  canvas: '#121212',
  card: '#1E1E1E',
  soft: '#263936',
  text: '#FFFFFF',
  textSecondary: '#D1D5DB',
  border: '#404040',
  primary: '#5EEAD4',
  primaryDark: '#99F6E4',
  primaryLight: '#263936',
  lightGray: '#333333',
  white: '#FFFFFF',
  ink: '#FFFFFF',
  charcoal: '#FFFFFF',
  slate: '#D1D5DB',
};

const DARK_WEB_STYLES = `
  html[data-dark-mode="true"] body,
  html[data-dark-mode="true"] #root,
  html[data-dark-mode="true"] [role="application"] {
    background: #121212 !important;
    color: #FFFFFF !important;
  }
  html[data-dark-mode="true"] [style*="background-color: rgb(255, 255, 255)"],
  html[data-dark-mode="true"] [style*="background: rgb(255, 255, 255)"],
  html[data-dark-mode="true"] [style*="background-color: rgb(245, 250, 249)"],
  html[data-dark-mode="true"] [style*="background: rgb(245, 250, 249)"] {
    background-color: #1E1E1E !important;
  }
  html[data-dark-mode="true"] div {
    scrollbar-color: #404040 #121212;
  }
  html[data-dark-mode="true"] div[style*="background"],
  html[data-dark-mode="true"] section,
  html[data-dark-mode="true"] article,
  html[data-dark-mode="true"] main {
    border-color: #404040;
  }
  html[data-dark-mode="true"] [style*="color: rgb(21, 59, 58)"],
  html[data-dark-mode="true"] [style*="color: rgb(51, 51, 51)"],
  html[data-dark-mode="true"] [style*="color: rgb(0, 0, 0)"] {
    color: #FFFFFF !important;
  }
  html[data-dark-mode="true"] [style*="color: rgb(100, 116, 139)"],
  html[data-dark-mode="true"] [style*="color: rgb(102, 102, 102)"],
  html[data-dark-mode="true"] [style*="color: rgb(148, 163, 184)"] {
    color: #D1D5DB !important;
  }
  html[data-dark-mode="true"] img,
  html[data-dark-mode="true"] video {
    opacity: 0.92;
  }
`;

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('dark_mode_enabled').then(value => {
      if (value !== null) {
        setIsDarkMode(value === 'true');
      }
    });
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    document.documentElement.setAttribute('data-dark-mode', String(isDarkMode));
    let styleElement = document.getElementById('global-dark-mode-style');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'global-dark-mode-style';
      styleElement.textContent = DARK_WEB_STYLES;
      document.head.appendChild(styleElement);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      AsyncStorage.setItem('dark_mode_enabled', String(next));
      return next;
    });
  };

  const colors = isDarkMode ? darkColors : lightColors;

  const value: DarkModeContextType = {
    isDarkMode,
    toggleDarkMode,
    colors,
  };

  return (
    <DarkModeContext.Provider value={value}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {children}
      </View>
    </DarkModeContext.Provider>
  );
};


