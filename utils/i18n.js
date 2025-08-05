import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import da from '../locales/da.json';
import en from '../locales/en.json';

const resources = {
  da: { translation: da },
  en: { translation: en }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'da', // default sprog
    fallbackLng: 'da',
    interpolation: {
      escapeValue: false
    }
  });

// Gem brugerens sprogvalg
export const setLanguage = async (language) => {
  await AsyncStorage.setItem('userLanguage', language);
  i18n.changeLanguage(language);
};

// Hent brugerens sprogvalg ved app start
export const initializeLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('userLanguage');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.log('Error loading language:', error);
  }
};

export default i18n;
