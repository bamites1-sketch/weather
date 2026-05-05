/**
 * I18nContext.js — React context for the active translation function.
 *
 * Kept in its own file so Fast Refresh works correctly (a file that exports
 * a context + a hook alongside components breaks HMR in Vite).
 *
 * Usage:
 *   // In App.jsx — provide:
 *   <I18nContext.Provider value={{ t, lang }}>...</I18nContext.Provider>
 *
 *   // In any component — consume:
 *   import { useI18n } from '../i18n/I18nContext';
 *   const { t, lang } = useI18n();
 */

import { createContext, useContext } from 'react';

export const I18nContext = createContext(null);

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nContext.Provider>');
  return ctx;
};
