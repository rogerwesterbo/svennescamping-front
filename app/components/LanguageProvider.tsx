import React, { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export type Language = "nb" | "en";

export interface LanguageContextValue {
  currentLanguage: Language;
  changeLanguage: (language: Language) => Promise<void>;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Initialize with the current i18n language or default to 'nb'
    const initialLang = i18n.language || "nb";
    return ["nb", "en"].includes(initialLang)
      ? (initialLang as Language)
      : "nb";
  });

  useEffect(() => {
    // Sync state with i18n language changes
    const handleLanguageChange = (lng: string) => {
      if (["nb", "en"].includes(lng)) {
        setCurrentLanguage(lng as Language);
        // Update HTML lang attribute
        if (typeof window !== "undefined") {
          document.documentElement.lang = lng === "nb" ? "no" : lng;
        }
      }
    };

    // Set initial language from i18n
    handleLanguageChange(i18n.language);

    // Listen for language changes
    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = async (language: Language) => {
    try {
      // i18next will automatically save to localStorage due to the detection config
      await i18n.changeLanguage(language);
      // State will be updated via the languageChanged event handler
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
