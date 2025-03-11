import React, { createContext, useState, useContext, useEffect } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';

// Create theme context
const ThemeContext = createContext();

// Available themes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export const ThemeProvider = ({ children }) => {
  // Get initial theme from storage or default to system
  const [theme, setTheme] = useState(() => {
    return getStorageItem('theme', THEMES.SYSTEM);
  });
  
  // Determine if dark mode should be applied based on theme setting
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Update dark mode state when theme changes
  useEffect(() => {
    if (theme === THEMES.DARK) {
      setIsDarkMode(true);
    } else if (theme === THEMES.LIGHT) {
      setIsDarkMode(false);
    } else if (theme === THEMES.SYSTEM) {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, [theme]);
  
  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (theme === THEMES.SYSTEM) {
        setIsDarkMode(e.matches);
      }
    };
    
    // Add listener for changes to system preference
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Older browser support
      mediaQuery.addListener(handleChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Older browser support
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme]);
  
  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [isDarkMode]);
  
  // Change theme
  const changeTheme = (newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme);
      setStorageItem('theme', newTheme);
    }
  };
  
  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = isDarkMode ? THEMES.LIGHT : THEMES.DARK;
    changeTheme(newTheme);
  };
  
  // Theme context value
  const value = {
    theme,
    isDarkMode,
    changeTheme,
    toggleTheme,
    THEMES
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;