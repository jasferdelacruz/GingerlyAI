/**
 * i18n Middleware for Backend API
 * Handles language detection and translation
 */

const fs = require('fs');
const path = require('path');

// Load translation files
let translations = {};

try {
  translations.en = require('../locales/en.json');
  translations.tl = require('../locales/tl.json');
} catch (error) {
  console.warn('Translation files not found. Using fallback.');
  translations.en = {};
  translations.tl = {};
}

/**
 * Detect language from request
 */
const detectLanguage = (req) => {
  // Priority:
  // 1. Query parameter: ?lang=tl
  // 2. Request header: Accept-Language
  // 3. User preference from database
  // 4. Default: en

  if (req.query.lang) {
    return req.query.lang;
  }

  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    // Parse Accept-Language header
    const languages = acceptLanguage.split(',').map(lang => {
      const parts = lang.trim().split(';');
      return parts[0].toLowerCase();
    });

    // Check if Filipino/Tagalog is preferred
    for (const lang of languages) {
      if (lang.startsWith('tl') || lang.startsWith('fil')) {
        return 'tl';
      }
      if (lang.startsWith('en')) {
        return 'en';
      }
    }
  }

  // Check user preference if authenticated
  if (req.user && req.user.language) {
    return req.user.language;
  }

  // Default to English
  return 'en';
};

/**
 * Get translated text
 */
const translate = (key, lang = 'en', params = {}) => {
  const langData = translations[lang] || translations.en;
  
  // Navigate through nested keys (e.g., 'common.ok')
  const keys = key.split('.');
  let value = langData;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if translation not found
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key itself if not found
        }
      }
      break;
    }
  }

  // Replace parameters in translation
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
      return params[param] || match;
    });
  }

  return value;
};

/**
 * Translate remedy/disease data
 */
const translateData = (data, lang) => {
  if (!data) return data;

  // If data has language-specific fields
  if (typeof data === 'object' && data.en && data.tl) {
    return data[lang] || data.en;
  }

  // If it's an array
  if (Array.isArray(data)) {
    return data.map(item => translateData(item, lang));
  }

  // If it's an object
  if (typeof data === 'object' && data !== null) {
    const translated = {};
    for (const [key, value] of Object.entries(data)) {
      translated[key] = translateData(value, lang);
    }
    return translated;
  }

  return data;
};

/**
 * Middleware to add i18n support to requests
 */
const i18nMiddleware = (req, res, next) => {
  const lang = detectLanguage(req);
  
  // Add language to request object
  req.language = lang;
  
  // Add translation function to request
  req.t = (key, params) => translate(key, lang, params);
  
  // Add data translation function
  req.translateData = (data) => translateData(data, lang);
  
  // Add helper to response for translated JSON
  res.sendTranslated = (data, statusCode = 200) => {
    const translated = translateData(data, lang);
    res.status(statusCode).json(translated);
  };
  
  next();
};

/**
 * Helper to get available languages
 */
const getAvailableLanguages = () => {
  return [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸'
    },
    {
      code: 'tl',
      name: 'Tagalog',
      nativeName: 'Tagalog',
      flag: '🇵🇭'
    }
  ];
};

module.exports = {
  i18nMiddleware,
  translate,
  translateData,
  detectLanguage,
  getAvailableLanguages
};

