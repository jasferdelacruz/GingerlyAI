/**
 * i18n Configuration for GingerlyAI Mobile App
 * Supports English and Tagalog
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import tl from './locales/tl.json';

const LANGUAGE_KEY = '@gingerlyai:language';

// Language detector
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      // Try to get saved language preference
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }

      // Fall back to device language
      const deviceLanguage = Localization.locale;
      
      // If device is set to Filipino/Tagalog, use Tagalog
      if (deviceLanguage.startsWith('tl') || deviceLanguage.startsWith('fil')) {
        callback('tl');
      } else {
        callback('en');
      }
    } catch (error) {
      console.error('Error detecting language:', error);
      callback('en'); // Default to English
    }
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  }
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      tl: { translation: tl }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;

// Helper function to change language
export const changeLanguage = async (lang) => {
  try {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Helper to get current language
export const getCurrentLanguage = () => i18n.language;

// Available languages
export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  tl: {
    code: 'tl',
    name: 'Tagalog',
    nativeName: 'Tagalog',
    flag: '🇵🇭'
  }
};

