import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDark: boolean;
  unitPreference: 'cm' | 'inches';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setUnitPreference: (unit: 'cm' | 'inches') => void;
  unit?: 'cm' | 'in';
  setUnit?: (unit: 'cm' | 'in') => void;
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
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    
    return false;
  });

  const [unitPreference, setUnitPreference] = useState<'cm' | 'inches'>(() => {
    const savedUnit = localStorage.getItem('unitPreference');
    return (savedUnit as 'cm' | 'inches') || 'inches';
  });

  // Back-compat simple unit for components expecting 'cm' | 'in'
  const [unit, setUnit] = useState<'cm' | 'in'>(() => (unitPreference === 'inches' ? 'in' : 'cm'));

  useEffect(() => {
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('unitPreference', unitPreference);
    setUnit(unitPreference === 'inches' ? 'in' : 'cm');
  }, [unitPreference]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const setTheme = (theme: 'light' | 'dark') => {
    setIsDark(theme === 'dark');
  };

  const handleSetUnitPreference = (u: 'cm' | 'inches') => {
    setUnitPreference(u);
  };

  return (
    <ThemeContext.Provider value={{ 
      isDark, 
      unitPreference, 
      toggleTheme, 
      setTheme, 
      setUnitPreference: handleSetUnitPreference,
      unit,
      setUnit,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}; 