import React, { createContext, useContext, useState, useEffect } from 'react';
import { DICTIONARY } from '../constants/translations';
import { SUPPORTED_LANGUAGES } from '../constants/poultry';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('rg_react_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('rg_react_lang', lang);
  }, [lang]);

  const t = (text) => {
    if (!text || lang === 'en') return text;
    const langDict = DICTIONARY[lang] || {};
    return langDict[String(text).trim()] || text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
