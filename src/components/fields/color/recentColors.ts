/**
 * ColorField v2 — "Son kullanılan" + biçim tercihi deposu.
 *
 * Depo ENJEKTE edilebilir (`StorageLike`): testler sahte nesne verir, tarayıcıda
 * varsayılan `localStorage` kullanılır. Her erişim try/catch'lidir çünkü gizli
 * pencere / kapalı site verisi / SSR'da `localStorage` fırlatabilir; seçici bu
 * yüzden asla çökmez, yalnız listeyi boş gösterir.
 *
 * Anahtar ve JSON dizi biçimi v1 ile aynı (`tecof-recent-colors`); eski 8'lik
 * listeler okunur, üst sınır 10'a çıktı.
 */
import { classifyValue, formatHex, type ColorFormat } from './colorMath';

export const RECENT_COLORS_KEY = 'tecof-recent-colors';
export const RECENT_MAX = 10;
export const COLOR_FORMAT_KEY = 'tecof-color-format';

export interface StorageLike {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

const defaultStorage = (): StorageLike | null => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
};

const resolve = (storage?: StorageLike | null): StorageLike | null =>
  storage === undefined ? defaultStorage() : storage;

/** Bozuk JSON / erişim hatası / dizi değil → []. Girişler küçük harfe çekilir. */
export function readRecent(storage?: StorageLike | null): string[] {
  const store = resolve(storage);
  if (!store) return [];
  try {
    const raw = store.getItem(RECENT_COLORS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v): v is string => typeof v === 'string' && v.length > 0)
      .map((v) => v.toLowerCase())
      .slice(0, RECENT_MAX);
  } catch {
    return [];
  }
}

/**
 * Geçerli bir rengi listenin başına ekler; var()/geçersiz değerler listeyi
 * DEĞİŞTİRMEZ. Hex8 korunur (opaklık da "son kullanılan"ın parçası).
 * `setItem` fırlatırsa (kota/gizli mod) sessizce mevcut liste döner.
 */
export function pushRecent(value: string, storage?: StorageLike | null): string[] {
  const store = resolve(storage);
  const current = readRecent(store);
  const cls = classifyValue(value);
  if (cls.kind !== 'color' || !cls.parsed) return current;
  const hex = formatHex(cls.parsed.rgb, cls.parsed.alpha);
  const next = [hex, ...current.filter((c) => c !== hex)].slice(0, RECENT_MAX);
  if (store) {
    try {
      store.setItem(RECENT_COLORS_KEY, JSON.stringify(next));
    } catch {
      /* kota dolu / gizli mod — liste bu oturumda bellekte yaşar */
    }
  }
  return next;
}

const FORMATS: readonly ColorFormat[] = ['hex', 'rgb', 'hsl'];

/** Geçersiz/eksik → 'hex'. */
export function readFormat(storage?: StorageLike | null): ColorFormat {
  const store = resolve(storage);
  if (!store) return 'hex';
  try {
    const raw = store.getItem(COLOR_FORMAT_KEY);
    return raw && (FORMATS as readonly string[]).includes(raw) ? (raw as ColorFormat) : 'hex';
  } catch {
    return 'hex';
  }
}

export function writeFormat(f: ColorFormat, storage?: StorageLike | null): void {
  const store = resolve(storage);
  if (!store || !FORMATS.includes(f)) return;
  try {
    store.setItem(COLOR_FORMAT_KEY, f);
  } catch {
    /* tercih yazılamadı — varsayılan hex ile devam */
  }
}
