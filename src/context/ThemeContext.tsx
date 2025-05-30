import React, { createContext, useContext, useState } from 'react';

// TODO: Implement theme saving/loading using MySQL/Prisma or local storage. Supabase logic removed.

const ThemeContext = createContext({
  theme: 'light',
  setTheme: (_theme: string) => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Stub: No persistence implemented

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
