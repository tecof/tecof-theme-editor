import type { UploadLimitsData } from '../api';

/* ─── Yükleme boyut sınırı ───
 *
 * Tek dosya sınırı backend'de yönetici ayarıdır (platform ayarı + işletme ezmesi; backend
 * docs/UPLOAD_PATHS.md §3a) ve GET /api/store/upload-limits ile okunur. React'siz, saf mantık:
 * UploadField hangi sınırı göstereceğini buradan alır.
 */

/** Sunucu sınırı okunamazsa — backend `theme.asset` varsayılanı (yükleme `?folder=` tanınmazsa oraya yazılır) */
export const FALLBACK_MAX_FILE_SIZE = '20MB';

/** FilePond boyut metni → MB ("100MB", "500KB", "1GB"); tanınmazsa null */
export const toMB = (value?: string | null): number | null => {
  const m = /^(\d+(?:\.\d+)?)\s*(KB|MB|GB)$/i.exec(String(value || '').trim());
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2].toUpperCase();
  return unit === 'GB' ? n * 1024 : unit === 'KB' ? n / 1024 : n;
};

/**
 * Alanın etkin tek dosya sınırı (FilePond biçimi). Sunucu değeri esastır; tema geliştiricisi daha
 * küçük bir `maxFileSize` verdiyse o kazanır — daha büyüğü sunucuda zaten reddedilir.
 * Kapsam: backend `?folder=` değerini izinli kapsama çevirir, tanınmazsa `defaultScope` (theme.asset).
 */
export const resolveMaxFileSize = (
  limits: UploadLimitsData | null,
  folder: string | undefined,
  explicit: string | undefined,
): string => {
  const scope = limits ? (folder && limits.scopes[folder] ? folder : limits.defaultScope) : null;
  const serverMB = scope ? limits?.scopes[scope]?.maxMB ?? null : null;
  const explicitMB = toMB(explicit);
  if (serverMB && explicitMB) return explicitMB < serverMB ? (explicit as string) : `${serverMB}MB`;
  if (serverMB) return `${serverMB}MB`;
  return explicit || FALLBACK_MAX_FILE_SIZE;
};
