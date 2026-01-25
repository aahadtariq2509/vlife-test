'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme] = useState('light'); // Always light theme
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only setting theme after component mounts
  useEffect(() => {
    setMounted(true);
    
    // Always set light theme
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }, []);

  // No theme switching functionality
  const setTheme = () => {
    console.warn('Theme switching is disabled. Only light theme is supported.');
  };

  const toggleTheme = () => {
    console.warn('Theme switching is disabled. Only light theme is supported.');
  };

  // Prevent hydration mismatch by not rendering children until mounted
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: 'light', setTheme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
