import { useLanguageContext } from "~/components/LanguageProvider";

/**
 * Hook to translate product names
 */
export function useProductTranslation() {
  const { t } = useLanguageContext();

  const translateProduct = (productKey: string) => {
    if (!productKey || productKey === "Unknown Product") {
      return t("products.unknownProduct", "Unknown Product");
    }

    // Try to get the translation, fallback to the original key if not found
    const translatedProduct = t(`products.${productKey}`);
    return translatedProduct === `products.${productKey}`
      ? productKey
      : translatedProduct;
  };

  return { translateProduct };
}

/**
 * Static product translation mapping for reference
 */
export const PRODUCT_TRANSLATIONS = {
  en: {
    Cabin: "Cabin",
    "Caravan/motorhome/tent 1-2 pers": "Caravan/motorhome/tent 1-2 pers",
    "Caravan/motorhome/tent 3 pers": "Caravan/motorhome/tent 3 pers",
    "Caravan/motorhome/tent 4 pers": "Caravan/motorhome/tent 4 pers",
    "Washing machine": "Washing machine",
    "Bed linen": "Bed linen",
    Shower: "Shower",
  },
  nb: {
    Cabin: "Hytte",
    "Caravan/motorhome/tent 1-2 pers": "Campingvogn/bobil/telt 1-2 pers",
    "Caravan/motorhome/tent 3 pers": "Campingvogn/bobil/telt 3 pers",
    "Caravan/motorhome/tent 4 pers": "Campingvogn/bobil/telt 4 pers",
    "Washing machine": "Vaskemaskin",
    "Bed linen": "Sengetøy",
    Shower: "Dusj",
  },
} as const;

/**
 * Product pricing information from the CSV
 */
export const PRODUCT_PRICES = {
  Cabin: { price: 650, currency: "NOK" },
  "Caravan/motorhome/tent 1-2 pers": { price: 390, currency: "NOK" },
  "Caravan/motorhome/tent 3 pers": { price: 410, currency: "NOK" },
  "Caravan/motorhome/tent 4 pers": { price: 430, currency: "NOK" },
  "Washing machine": { price: 40, currency: "NOK" },
  "Bed linen": { price: 75, currency: "NOK" },
  Shower: { price: 15, currency: "NOK" },
} as const;
