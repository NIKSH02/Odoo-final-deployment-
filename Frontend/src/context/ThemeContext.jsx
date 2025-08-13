import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// --- ThemeContext Definition ---
// This context is defined here to be accessible by components within this file.
const ThemeContext = createContext();

// ThemeProvider component
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
const useTheme = () => {
  return useContext(ThemeContext);
};

export default ThemeProvider;
export { useTheme };
