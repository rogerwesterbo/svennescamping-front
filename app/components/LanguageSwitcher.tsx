import { useState } from "react";
import { useLanguageContext, type Language } from "./LanguageProvider";

export const SUPPORTED_LANGUAGES = [
  { code: "nb" as Language, name: "Norwegian", nativeName: "Norsk (Bokmål)" },
  { code: "en" as Language, name: "English", nativeName: "English" },
];

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, t } = useLanguageContext();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (language: Language) => {
    changeLanguage(language);
    setIsOpen(false);
  };

  const currentLangData = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === currentLanguage
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
        aria-label={t("language.changeLanguage")}
      >
        <span>{currentLangData?.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {SUPPORTED_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                    currentLanguage === language.code
                      ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span>{language.nativeName}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
