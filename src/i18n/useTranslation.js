/**
 * useTranslation.js — Lightweight i18n hook. No external libraries.
 *
 * API:
 *   const { t, lang, setLang } = useTranslation();
 *
 *   t('humidity')          → "Humidity"  (en)  |  "እርጥበት"  (am)
 *   t('weekdays')[1]       → "Monday"    (en)  |  "ሰኞ"      (am)
 *   lang                   → 'en' | 'am'
 *   setLang('am')          → switches language, persists to localStorage
 *
 * Design decisions:
 *  - Language state lives here, not in App, so any component can call
 *    useTranslation() independently without prop-drilling.
 *  - The translations object is module-level (imported once, never re-created).
 *  - t() is memoised per language so components that call it don't get a new
 *    function reference on unrelated re-renders.
 *  - Falls back to the key itself if a translation is missing — never crashes.
 */

import { useState, useCallback, useMemo } from 'react';
import translations from './translations.js';

const LANG_KEY      = 'wx_lang';
const SUPPORTED     = Object.keys(translations);   // ['en', 'am']
const DEFAULT_LANG  = 'en';

/**
 * Resolve the initial language:
 *  1. localStorage preference
 *  2. Browser language (first two chars, e.g. "am-ET" → "am")
 *  3. Default ('en')
 */
const resolveInitialLang = () => {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;

  const browser = navigator.language?.slice(0, 2).toLowerCase();
  if (browser && SUPPORTED.includes(browser)) return browser;

  return DEFAULT_LANG;
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useTranslation = () => {
  const [lang, setLangState] = useState(resolveInitialLang);

  /**
   * Switch language and persist the choice.
   * Stable reference — safe to pass as a prop without causing re-renders.
   */
  const setLang = useCallback((newLang) => {
    if (!SUPPORTED.includes(newLang)) {
      console.warn(`[useTranslation] Unsupported language: "${newLang}". Supported: ${SUPPORTED.join(', ')}`);
      return;
    }
    localStorage.setItem(LANG_KEY, newLang);
    setLangState(newLang);
  }, []);

  /**
   * t(key) — look up a translation key for the current language.
   * Falls back to English, then to the key string itself.
   * Memoised per language so the function reference is stable within a language.
   */
  const t = useMemo(() => {
    const dict = translations[lang] ?? translations[DEFAULT_LANG];
    return (key) => {
      const val = dict[key];
      if (val !== undefined) return val;
      // Fallback chain: current lang → English → key
      const fallback = translations[DEFAULT_LANG]?.[key];
      if (fallback !== undefined) return fallback;
      console.warn(`[useTranslation] Missing key: "${key}" for lang: "${lang}"`);
      return key;
    };
  }, [lang]);

  return { t, lang, setLang, supportedLangs: SUPPORTED };
};
