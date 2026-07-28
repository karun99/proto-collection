import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('platform_settings');
    return saved ? JSON.parse(saved) : {
      themeMode: 'light',
      primaryColor: '#0056b3',
      platformName: 'TutorConnect',
      logoUrl: null,
    };
  });

  useEffect(() => {
    localStorage.setItem('platform_settings', JSON.stringify(settings));
    applyTheme(settings);
  }, [settings]);

  const applyTheme = (s) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', s.primaryColor);
    
    let activeTheme = s.themeMode;
    if (s.themeMode === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    root.setAttribute('data-theme', activeTheme);
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      themeMode: prev.themeMode === 'light' ? 'dark' : 'light'
    }));
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
