import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import useSWR from 'swr';
import { TecofApiClient } from '../../api';
import { useTecofOptional } from '../TecofProvider';
import { useActiveLanguage } from '../../studio/language/LanguageContext';
import type { MerchantInfoData } from '../../types';
import {
  MERCHANT_INFO_DEDUPE_MS,
  isBandVisible,
  pickLocale,
  pickMode,
  resolveBand,
  type PoweredByBandData,
  type PoweredByMode,
} from './resolve';

/**
 * merchant-info'nun band için gereken alanları. Paketin ortak
 * `MerchantInfoData` tipi bu alanları taşımasa da (eski sürüm) kanca derlenir;
 * ortak tipe eklendiğinde kesişim aynı kalır.
 */
type MerchantInfoWithBand = MerchantInfoData & {
  /** Paket hakkına göre EFEKTİF değer; false = removeBranding (backend band üretmez). */
  showPoweredBy?: boolean;
  /** Hak yok / ayar kapalı / şablon hatalı → null; eski backend → undefined. */
  poweredBy?: PoweredByBandData | null;
  /** Admin askısı — vitrin içeriği basılmaz, band da basılmaz. */
  isSuspended?: boolean;
};

export interface UsePoweredByOptions {
  /** Dil çözümünü ezer. */
  locale?: string;
  /** Mod çözümünü ezer (SSR'da flaşsız tek varyant için). */
  mode?: PoweredByMode;
  /** SSR: `merchantInfo.poweredBy`; `null` = "band yok" bilgisi (fetch yapılmaz). */
  initialData?: PoweredByBandData | null;
  /**
   * SSR: `merchantInfo.defaultLanguage`. `initialData` yalnız bandı taşır;
   * bu verilmezse `locale` prop'u yokken sunucu ve ilk istemci render'ı
   * `html`'in İLK anahtarına düşer (backend anahtarları `merchant.languages`
   * sırasındadır, varsayılan dille başlamak zorunda değil) → dil flaşı.
   */
  defaultLanguage?: string;
  /** `<TecofProvider>` yoksa (core layout'ta body seviyesi) fetch için. */
  apiUrl?: string;
  secretKey?: string;
  /** Varsayılan: `initialData === undefined`. */
  revalidateOnMount?: boolean;
}

export interface UsePoweredByResult {
  band: PoweredByBandData | null;
  /** Seçilen dilin iki varyantı (renderBoth için). */
  variants: { light: string; dark: string } | null;
  /** Seçilen dil × mod. */
  html: string | null;
  css: string | null;
  js: string | null;
  version: string | null;
  locale: string | null;
  mode: PoweredByMode;
  visible: boolean;
  isLoading: boolean;
  error: Error | null;
  /** swr `mutate` sarmalı; SWR tipi dışarı sızmaz. */
  refresh: () => Promise<void>;
}

const DARK_MQ = '(prefers-color-scheme: dark)';

/* ─── Saf kablolama kararları (test edilebilir) ─── */

/** SWR anahtarı: istemci yoksa null (fetch yok); aynı apiUrl+secretKey → aynı anahtar. */
export function buildMerchantInfoSwrKey(hasClient: boolean, apiUrl: string, secretKey: string): string | null {
  return hasClient ? `tecof:merchant-info:${apiUrl}:${secretKey}` : null;
}

/** Açık seçenek kazanır; yoksa yalnız `initialData` verilmemişse mount'ta çekilir. */
export function shouldRevalidateOnMount(option: boolean | undefined, initialData: PoweredByBandData | null | undefined): boolean {
  return option ?? initialData === undefined;
}

/**
 * SSR kaynağı: `initialData` yalnız bandı taşır; varsayılan dil ayrıca
 * verilirse `pickLocale`'ın yedek zinciri sunucuda da çalışır.
 */
export function initialSource(
  initialData: PoweredByBandData | null | undefined,
  defaultLanguage: string | undefined,
): Partial<MerchantInfoWithBand> | undefined {
  if (initialData === undefined) return undefined;
  return defaultLanguage ? { poweredBy: initialData, defaultLanguage } : { poweredBy: initialData };
}
const CLASS_STRATEGY_SELECTOR = 'script[data-tecof-darkmode]';

/**
 * `.dark` sınıfı ve OS tercihi CANLI izlenir: paketin dark-mode anahtarı
 * (`initDarkMode`) sınıfı değiştirdiğinde band anında mod değiştirir.
 * Studio tuvalinde `document` iframe'inkidir — doğru belge izlenir.
 */
function subscribeMode(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};
  const observer = typeof MutationObserver !== 'undefined' ? new MutationObserver(onChange) : null;
  observer?.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  const mq = typeof window.matchMedia === 'function' ? window.matchMedia(DARK_MQ) : null;
  mq?.addEventListener?.('change', onChange);
  return () => {
    observer?.disconnect();
    mq?.removeEventListener?.('change', onChange);
  };
}

/** Ortamdan mod: primitif döner, `useSyncExternalStore` için kararlı. */
function readEnvironmentMode(prop: PoweredByMode | undefined): PoweredByMode {
  if (typeof document === 'undefined') return prop ?? 'light';
  const prefersDark =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(DARK_MQ).matches
      : false;
  return pickMode({
    prop,
    classDark: document.documentElement.classList.contains('dark'),
    classStrategy: document.querySelector(CLASS_STRATEGY_SELECTOR) !== null,
    prefersDark,
  });
}

/**
 * "Powered by Tecof" bandının verisini ve ortam kararlarını tek yerde toplar.
 *
 * Kaynak: `<TecofProvider>` varsa onun apiClient'ı; yoksa `apiUrl+secretKey`;
 * ikisi de yoksa fetch yok, yalnız `initialData`. SWR anahtarı aynı
 * apiUrl+secretKey için tüm `usePoweredBy` çağrılarında aynıdır → bu kancanın
 * örnekleri tek isteği paylaşır. `useLanguages` AYRI bir Map önbelleği kullanır
 * (SWR değil); aynı sayfada iki ayrı merchant-info isteği görülebilir.
 * Hata durumunda SWR `data`'yı sıfırlamaz → önceki band kendiliğinden korunur.
 */
export function usePoweredBy(options: UsePoweredByOptions = {}): UsePoweredByResult {
  const {
    locale: localeProp,
    mode: modeProp,
    initialData,
    defaultLanguage: defaultLanguageProp,
    apiUrl: apiUrlProp,
    secretKey: secretKeyProp,
  } = options;

  const ctx = useTecofOptional();
  // Provider dışı istemci: prop'lar değişmedikçe tek örnek (SWR anahtarı da sabit kalır).
  const ownClient = useMemo(
    () => (!ctx && apiUrlProp && secretKeyProp ? new TecofApiClient(apiUrlProp, secretKeyProp) : null),
    [ctx, apiUrlProp, secretKeyProp],
  );
  const apiClient = ctx?.apiClient ?? ownClient;
  const apiUrl = ctx?.apiUrl ?? apiUrlProp ?? '';
  const secretKey = ctx?.secretKey ?? secretKeyProp ?? '';
  const swrKey = buildMerchantInfoSwrKey(apiClient !== null, apiUrl, secretKey);

  const fetcher = useCallback(async (): Promise<MerchantInfoWithBand> => {
    if (!apiClient) throw new Error('merchant-info için API istemcisi yok');
    const res = await apiClient.getMerchantInfo();
    if (!res.success || !res.data) throw new Error(res.message || 'merchant-info alınamadı');
    return res.data as MerchantInfoWithBand;
  }, [apiClient]);

  // `fetcher` her zaman verilir: host'un <SWRConfig> fetcher'ı devralınmaz.
  // `fallbackData` KULLANILMAZ — initialData yalnız band; tip karışmasın diye
  // aşağıda `source` ile birleştirilir.
  const swr = useSWR<MerchantInfoWithBand, Error>(swrKey, fetcher, {
    dedupingInterval: MERCHANT_INFO_DEDUPE_MS,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: shouldRevalidateOnMount(options.revalidateOnMount, initialData),
    keepPreviousData: true,
    errorRetryCount: 2,
  });
  const { data, error, isLoading, mutate } = swr;

  // useMemo: `source` aşağıdaki sonuç memo'sunun bağımlılığıdır; her render'da
  // yeni nesne üretmek memo'yu boşa çıkarırdı.
  const source = useMemo<Partial<MerchantInfoWithBand> | undefined>(
    () => data ?? initialSource(initialData, defaultLanguageProp),
    [data, initialData, defaultLanguageProp],
  );
  const band = source?.poweredBy ?? null;

  // Belge dili yalnız mount SONRASI okunur: sunucu ile ilk istemci render'ı
  // aynı çıktıyı üretir (hidrasyon eşitliği), dil bir sonraki render'da oturur.
  const activeLanguage = useActiveLanguage()?.activeLanguage ?? null;
  const [documentLang, setDocumentLang] = useState<string | null>(null);
  useEffect(() => {
    setDocumentLang(document.documentElement.lang || null);
  }, []);

  const getSnapshot = useCallback(() => readEnvironmentMode(modeProp), [modeProp]);
  const getServerSnapshot = useCallback((): PoweredByMode => modeProp ?? 'light', [modeProp]);
  const mode = useSyncExternalStore(subscribeMode, getSnapshot, getServerSnapshot);

  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return useMemo<UsePoweredByResult>(() => {
    const available = band?.html ? Object.keys(band.html) : [];
    const locale = pickLocale({
      prop: localeProp,
      activeLanguage,
      documentLang,
      defaultLanguage: source?.defaultLanguage,
      available,
    });
    const resolved = resolveBand(band, locale, source?.defaultLanguage);
    const visible =
      resolved !== null &&
      isBandVisible({
        band,
        showPoweredBy: source?.showPoweredBy,
        isSuspended: source?.isSuspended,
        isUnderConstruction: source?.isUnderConstruction,
      });
    return {
      band,
      variants: resolved?.html ?? null,
      html: resolved ? resolved.html[mode] : null,
      css: band?.css ?? null,
      js: band?.js ?? null,
      version: band?.version ?? null,
      locale: resolved?.locale ?? null,
      mode,
      visible,
      isLoading: source === undefined && isLoading,
      error: error ?? null,
      refresh,
    };
  }, [band, localeProp, activeLanguage, documentLang, source, mode, isLoading, error, refresh]);
}
