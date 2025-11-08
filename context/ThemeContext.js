import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme, Platform } from 'react-native';

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Storage helper for web and native
const getStorage = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    return {
      getItem: (key) => window.localStorage.getItem(key),
      setItem: (key, value) => window.localStorage.setItem(key, value),
    };
  }
  // For native, we'll use a simple approach without AsyncStorage for now
  // You can add @react-native-async-storage/async-storage later if needed
  return {
    getItem: () => null,
    setItem: () => {},
  };
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState('system'); // 'light', 'dark', or 'system'
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = () => {
      try {
        const storage = getStorage();
        const saved = storage.getItem('themePreference');
        if (saved) {
          setThemePreference(saved);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    loadThemePreference();
  }, []);

  // Update isDark based on preference and system scheme
  useEffect(() => {
    if (themePreference === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(themePreference === 'dark');
    }
  }, [themePreference, systemColorScheme]);

  const toggleTheme = (newTheme) => {
    try {
      setThemePreference(newTheme);
      const storage = getStorage();
      storage.setItem('themePreference', newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const value = {
    isDark,
    themePreference,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

