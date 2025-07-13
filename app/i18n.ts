import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import nbTranslation from "./locales/nb.json";
import enTranslation from "./locales/en.json";

const resources = {
  nb: {
    translation: nbTranslation.translation,
  },
  en: {
    translation: enTranslation.translation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "nb", // Default to Norwegian
    lng: undefined, // Let language detector handle initial language
    debug: process.env.NODE_ENV === "development",

    detection: {
      // Detection options - prioritize localStorage
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
      // Don't convert language codes
      convertDetectedLanguage: (lng: string) => {
        // Ensure we only accept our supported languages
        if (lng.startsWith("no") || lng.startsWith("nb")) return "nb";
        if (lng.startsWith("en")) return "en";
        return "nb"; // Default fallback
      },
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // Options for react-i18next
    react: {
      useSuspense: false,
    },
  });

export default i18n;
