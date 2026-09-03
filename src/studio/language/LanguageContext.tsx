import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useLanguages } from '../../components/fields/useLanguages';
import { createLanguageEmitter } from './languageEmitter';

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

export interface LanguageProviderProps {
  children: React.ReactNode;
  /**
   * Aktif dil ilk kez çözüldüğünde ve her değişiminde çağrılır (boş string
   * gönderilmez). Host bunu kendi i18n sağlayıcısına bağlayarak TUVAL
   * İÇERİĞİNİ de o dilde gösterebilir; editör kroması bundan etkilenmez.
   */
  onChange?: (code: string) => void;
}

/**
 * Provides a single, app-wide "active language" sourced from merchant-info.
 * When this provider is present (i.e. inside TecofStudio), multilingual fields
 * render only the active language and hide their per-field language tabs — the
 * language is switched once, globally, from the top bar.
 *
 * Fields used WITHOUT this provider (standalone / host Puck) keep their legacy
 * per-field tab behaviour for backward compatibility.
 */
export const LanguageProvider = ({ children, onChange }: LanguageProviderProps) => {
  const { merchantInfo, activeTab, setActiveTab, loading } = useLanguages();

  // Host bildirimi: kural (boş kod yok, tekrar yok) emitter'da; burada yalnız
  // kablolama var. Emitter ref'te yaşar ki "son bildirilen dil" belleği
  // render'lar arasında korunsun.
  const emitterRef = useRef(createLanguageEmitter());

  // Geri çağrımı HER render'da tazele. Bilerek bağımlılık listesi yok ve bu
  // efekt bildirim efektinden ÖNCE tanımlı — böylece host inline fonksiyon
  // verse bile bildirim sayısı değişmez, ama her zaman en güncel fonksiyon
  // çağrılır.
  useEffect(() => {
    emitterRef.current.setCallback(onChange);
  });

  // Bildirimi YALNIZCA aktif dil değişince tetikle. activeTab merchant-info
  // gelene kadar "" olduğu için ilk gerçek çözüm de buradan geçer.
  useEffect(() => {
    emitterRef.current.emit(activeTab);
  }, [activeTab]);

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
