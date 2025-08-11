import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // LocalStorage'dan tema tercihini al
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
    
    // Sistem temasını algıla
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'system';
    }
    
    return 'light';
  });

  const [isDark, setIsDark] = useState(false);

  // Tema değişikliklerini uygula
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Eski tema class'larını kaldır
    root.classList.remove('light', 'dark');
    
    let currentTheme = theme;
    
    // System tema ise sistem tercihini kullan
    if (theme === 'system') {
      currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Yeni tema class'ını ekle
    root.classList.add(currentTheme);
    setIsDark(currentTheme === 'dark');
    
    // LocalStorage'a kaydet
    localStorage.setItem('theme', theme);
    
    // Meta theme-color güncelle
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', currentTheme === 'dark' ? '#1f2937' : '#ffffff');
    }
  }, [theme]);

  // Sistem tema değişikliklerini dinle
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        const currentTheme = mediaQuery.matches ? 'dark' : 'light';
        root.classList.add(currentTheme);
        setIsDark(currentTheme === 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
