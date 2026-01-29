import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'zh-CN' | 'en';

interface LanguageOption {
  code: Language;
  label: string;
  nativeName: string;
}

export const languageOptions: LanguageOption[] = [
  { code: 'zh-CN', label: '简体中文', nativeName: '简体中文' },
  { code: 'en', label: 'English', nativeName: 'English' },
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isSystemDefault: boolean;
  setIsSystemDefault: (value: boolean) => void;
  getLabel: (lang: Language) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'app_language';
const SYSTEM_DEFAULT_KEY = 'app_language_system_default';

function getSystemLanguage(): Language {
  const systemLang = navigator.language || (navigator as any).userLanguage || 'en';
  // Check if system language is Chinese
  if (systemLang.startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isSystemDefault, setIsSystemDefaultState] = useState<boolean>(() => {
    const saved = localStorage.getItem(SYSTEM_DEFAULT_KEY);
    return saved === null ? true : saved === 'true';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const savedSystemDefault = localStorage.getItem(SYSTEM_DEFAULT_KEY);
    const isSystem = savedSystemDefault === null ? true : savedSystemDefault === 'true';
    
    if (isSystem) {
      return getSystemLanguage();
    }
    
    const saved = localStorage.getItem(STORAGE_KEY) as Language;
    return saved || getSystemLanguage();
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    // When manually setting language, disable system default
    setIsSystemDefaultState(false);
    localStorage.setItem(SYSTEM_DEFAULT_KEY, 'false');
  };

  const setIsSystemDefault = (value: boolean) => {
    setIsSystemDefaultState(value);
    localStorage.setItem(SYSTEM_DEFAULT_KEY, String(value));
    
    if (value) {
      // Reset to system language
      const systemLang = getSystemLanguage();
      setLanguageState(systemLang);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const getLabel = (lang: Language): string => {
    return languageOptions.find(opt => opt.code === lang)?.nativeName || lang;
  };

  // Listen for system language changes
  useEffect(() => {
    if (!isSystemDefault) return;

    const handleLanguageChange = () => {
      setLanguageState(getSystemLanguage());
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, [isSystemDefault]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      isSystemDefault, 
      setIsSystemDefault,
      getLabel 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
