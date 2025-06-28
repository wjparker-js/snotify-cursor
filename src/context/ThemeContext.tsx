import React, { createContext, useContext, useState, useEffect } from 'react';

// TODO: Implement theme saving/loading using MySQL/Prisma or local storage. Supabase logic removed.

type ColorTheme = 'orange' | 'blue' | 'green' | 'purple';

interface ThemeContextType {
  theme: string;
  colorTheme: ColorTheme;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  colorTheme: 'orange',
  setTheme: (_theme: string) => {},
  toggleTheme: () => {},
  setColorTheme: (_colorTheme: ColorTheme) => {},
});

const colorThemeMap = {
  orange: {
    primary: '24 95% 40%', // orange theme
    primaryHover: '24 95% 35%',
    primaryForeground: '#ffffff',
  },
  blue: {
    primary: '210 100% 50%', // blue theme
    primaryHover: '210 100% 45%',
    primaryForeground: '#ffffff',
  },
  green: {
    primary: '142 76% 36%', // green theme
    primaryHover: '142 76% 31%',
    primaryForeground: '#ffffff',
  },
  purple: {
    primary: '270 76% 50%', // purple theme
    primaryHover: '270 76% 45%',
    primaryForeground: '#ffffff',
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('orange');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Update CSS variables when color theme changes
  useEffect(() => {
    const colors = colorThemeMap[colorTheme];
    const root = document.documentElement;
    
    root.style.setProperty('--theme-color', colors.primary);
    root.style.setProperty('--theme-color-hover', colors.primaryHover);
    root.style.setProperty('--theme-color-foreground', colors.primaryForeground);
  }, [colorTheme]);

  // Stub: No persistence implemented

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      colorTheme, 
      setTheme, 
      toggleTheme, 
      setColorTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
