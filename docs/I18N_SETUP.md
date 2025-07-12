# Internationalization (i18n) Setup

This project uses `react-i18next` for internationalization with support for Norwegian (Bokmål) and English.

## Features

- ✅ Default language: Norwegian (Bokmål)
- ✅ Supported languages: Norwegian (nb) and English (en)
- ✅ Browser language detection
- ✅ Language persistence in localStorage
- ✅ Dynamic language switching
- ✅ Language switcher component in navigation
- ✅ HTML lang attribute updates dynamically

## Setup

### Configuration

The i18n setup is configured in `app/i18n.ts` and automatically imported in `app/root.tsx`.

### Language Provider

The `LanguageProvider` component in `app/components/LanguageProvider.tsx` provides language context throughout the application.

### Language Files

- `app/locales/nb.json` - Norwegian (Bokmål) translations
- `app/locales/en.json` - English translations

## Usage

### In React Components

```tsx
import { useLanguageContext } from "~/components/LanguageProvider";

function MyComponent() {
  const { t, currentLanguage, changeLanguage } = useLanguageContext();

  return (
    <div>
      <h1>{t("navigation.home")}</h1>
      <p>Current language: {currentLanguage}</p>
      <button onClick={() => changeLanguage("en")}>Switch to English</button>
    </div>
  );
}
```

### Translation Keys Structure

The translation files are structured as follows:

```json
{
  "translation": {
    "common": {
      "loading": "Loading...",
      "error": "Error"
      // ... more common translations
    },
    "navigation": {
      "home": "Home",
      "profile": "Profile"
      // ... navigation translations
    },
    "auth": {
      "signIn": "Sign In",
      "signOut": "Sign Out"
      // ... auth translations
    }
    // ... more sections
  }
}
```

### Adding New Translations

1. Add the key-value pair to both `nb.json` and `en.json` files
2. Use the translation in your component with `t('section.key')`

Example:

```json
// In nb.json
"profile": {
  "settings": "Innstillinger"
}

// In en.json
"profile": {
  "settings": "Settings"
}
```

```tsx
// In component
const settingsText = t("profile.settings");
```

### Language Switcher

The language switcher is automatically included in the navigation. Users can click on the language selector to switch between Norwegian and English.

### Browser Language Detection

The system automatically detects the user's browser language on first visit:

- Norwegian language codes (`no`, `nb`) → Sets to Norwegian
- English language codes (`en`) → Sets to English
- Other languages → Defaults to Norwegian

### Language Persistence

The selected language is automatically saved to localStorage and restored on subsequent visits.

## Components

### LanguageProvider

Provides language context to the entire application.

### LanguageSwitcher

A dropdown component for switching languages, included in the navigation bar.

### useLanguageContext Hook

Hook for accessing language functionality in components:

- `currentLanguage`: Current language code ('nb' or 'en')
- `changeLanguage(lang)`: Function to change language
- `t(key)`: Translation function

## File Structure

```
app/
├── i18n.ts                           # i18n configuration
├── locales/
│   ├── nb.json                       # Norwegian translations
│   └── en.json                       # English translations
├── components/
│   ├── LanguageProvider.tsx          # Language context provider
│   └── LanguageSwitcher.tsx          # Language switcher component
└── routes/                           # Route components using translations
```

## Best Practices

1. **Consistent Key Structure**: Use a hierarchical structure (e.g., `section.subsection.key`)
2. **Translation Completeness**: Always add translations to both language files
3. **Context in Keys**: Use descriptive keys that provide context
4. **Common Translations**: Put frequently used translations in the `common` section
5. **Testing**: Test your app in both languages to ensure all text is translated

## Adding New Languages

To add a new language:

1. Create a new translation file (e.g., `app/locales/de.json`)
2. Add the language to the `resources` object in `app/i18n.ts`
3. Update the `Language` type in `app/components/LanguageProvider.tsx`
4. Add the language option to `SUPPORTED_LANGUAGES` in `app/components/LanguageSwitcher.tsx`
5. Update the browser detection logic if needed
