import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './locales/de/common.json';
import en from './locales/en/common.json';

i18n.use(initReactI18next).init({
  resources: {
    de: { common: de },
    en: { common: en },
  },
  lng: 'de',
  fallbackLng: 'de',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
