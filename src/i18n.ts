// src/i18n.ts
/**
 * Configuración de i18next para la internacionalización (i18n) de la aplicación.
 *
 * Utiliza `i18next-browser-languagedetector` para detectar el idioma del usuario
 * y `react-i18next` para integrar i18next con React.
 *
 * Las traducciones se cargan desde archivos JSON en la carpeta `src/locales`.
 * Idioma de fallback: 'en' (inglés).
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Archivos de traducción
import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  es: {
    translation: translationES,
  },
};

i18n
  .use(LanguageDetector) // Detecta el idioma del usuario
  .use(initReactI18next) // Pasa i18nลงไป react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Idioma de fallback
    interpolation: {
      escapeValue: false, // React ya se encarga del XSS
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
