import React, { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export type Language = "nb" | "en";

export interface LanguageContextValue {
  currentLanguage: Language;
  changeLanguage: (language: Language) => Promise<void>;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>("nb");

  useEffect(() => {
    // Initialize language from localStorage or browser detection
    const initializeLanguage = () => {
      let detectedLang: Language = "nb"; // Default to Norwegian

      // Check localStorage first
      const storedLang = localStorage.getItem("i18nextLng");
      if (storedLang && ["nb", "en"].includes(storedLang)) {
        detectedLang = storedLang as Language;
      } else {
        // Detect browser language
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith("no") || browserLang.startsWith("nb")) {
          detectedLang = "nb";
        } else if (browserLang.startsWith("en")) {
          detectedLang = "en";
        }
        // Default remains 'nb' for any other language
      }

      if (detectedLang !== i18n.language) {
        i18n.changeLanguage(detectedLang);
      }
      setCurrentLanguage(detectedLang);
    };

    initializeLanguage();
  }, [i18n]);

  useEffect(() => {
    // Update state when i18n language changes
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng as Language);
      // Update HTML lang attribute
      document.documentElement.lang = lng === "nb" ? "no" : lng;
    };

    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = async (language: Language) => {
    try {
      await i18n.changeLanguage(language);
      localStorage.setItem("i18nextLng", language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  const value: LanguageContextValue = {
    currentLanguage,
    changeLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error(
      "useLanguageContext must be used within a LanguageProvider"
    );
  }
  return context;
}
