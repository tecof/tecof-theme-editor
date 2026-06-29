import React, { createContext, useContext, useMemo } from 'react';
import { useLanguages } from '../../components/fields/useLanguages';

export interface ActiveLanguageContextType {
  /** All languages configured for the merchant (from merchant-info). */
  languages: string[];
  /** The merchant's default language code. */
  defaultLanguage: string;
  /** The single, app-wide active language being edited. */
  activeLanguage: string;
  /** Switch the app-wide active language. */
  setActiveLanguage: (code: string) => void;
  /** True while merchant languages are still loading. */
  loading: boolean;
}

const ActiveLanguageContext = createContext<ActiveLanguageContextType | null>(null);

/**
 * Provides a single, app-wide "active language" sourced from merchant-info.
 * When this provider is present (i.e. inside TecofStudio), multilingual fields
 * render only the active language and hide their per-field language tabs — the
 * language is switched once, globally, from the top bar.
 *
 * Fields used WITHOUT this provider (standalone / host Puck) keep their legacy
 * per-field tab behaviour for backward compatibility.
 */
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { merchantInfo, activeTab, setActiveTab, loading } = useLanguages();

  const value = useMemo<ActiveLanguageContextType>(
    () => ({
      languages: merchantInfo?.languages || [],
      defaultLanguage: merchantInfo?.defaultLanguage || '',
      activeLanguage: activeTab,
      setActiveLanguage: setActiveTab,
      loading,
    }),
    [merchantInfo, activeTab, setActiveTab, loading]
  );

  return <ActiveLanguageContext.Provider value={value}>{children}</ActiveLanguageContext.Provider>;
};

/** Returns the active-language context, or null when no provider is mounted. */
export const useActiveLanguage = (): ActiveLanguageContextType | null =>
  useContext(ActiveLanguageContext);
