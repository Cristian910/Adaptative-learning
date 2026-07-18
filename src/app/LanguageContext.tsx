import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STRINGS, type Language, type StringsShape } from '../i18n/strings';

const LANGUAGE_KEY = 'adaptive-learning-language';

interface LanguageContextValue {
  language: Language;
  toggleLanguage: () => void;
  t: StringsShape;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === 'en' || saved === 'es') return saved;
  } catch {
    // localStorage inaccesible — se usa español por defecto
  }
  return 'es';
}

// ─── LanguageProvider ─────────────────────────────────────────────────────────
// Mismo patrón que useTheme.ts (persistencia en localStorage), pero como aquí
// muchísimos componentes anidados necesitan `t()` — no solo un par de
// botones — se expone vía Context en vez de prop-drilling manual en cada
// nivel del árbol.

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(readInitialLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
      // no crítico si no se puede persistir
    }
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((l) => (l === 'es' ? 'en' : 'es'));
  }, []);

  const value = useMemo(
    () => ({ language, toggleLanguage, t: STRINGS[language] }),
    [language, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage debe usarse dentro de <LanguageProvider>');
  }
  return ctx;
}
