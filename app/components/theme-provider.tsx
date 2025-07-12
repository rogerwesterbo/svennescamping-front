import { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  isDark: boolean;
  isClient: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  isClient: false,
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Check localStorage first, then fallback to system preference
    const savedTheme = localStorage.getItem("theme");
    let shouldBeDark = false;

    if (savedTheme) {
      shouldBeDark = savedTheme === "dark";
    } else {
      // Default to light mode as requested
      shouldBeDark = false;
    }

    setIsDark(shouldBeDark);
    updateDOMTheme(shouldBeDark);
  }, []);

  const updateDOMTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    updateDOMTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ isDark, isClient, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
