import React, { createContext, useContext, useState, useEffect } from 'react';
import { COLORS } from '../constants/theme';

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
  background: '#1A1A1A',
  card: '#2D2D2D',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  border: '#404040',
  primary: '#4CAF50',
  secondary: '#66BB6A',
  lightGray: '#3A3A3A',
};

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const colors = isDarkMode ? darkColors : lightColors;

  const value: DarkModeContextType = {
    isDarkMode,
    toggleDarkMode,
    colors,
  };

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
};


