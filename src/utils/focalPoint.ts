import type { FocalPoint } from '../types';

/* ─── Görsel odak noktası yardımcıları ───
 *
 * `UploadedFile.focalPoint` yüzde cinsindendir (0..100, 50/50 = merkez).
 * Tek kaynak burasıdır: TecofPicture `object-position`'ı, odak seçici
 * drawer'ı ve medya karosu rozeti aynı üç yardımcıyı kullanır.
 */

/** Varsayılan odak: merkez. */
export const DEFAULT_FOCAL_POINT: FocalPoint = { x: 50, y: 50 };

const toPercent = (value: unknown, fallback: number): number => {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, n));
};

/**
 * Değerleri 0..100 aralığına sıkıştırır; eksik/geçersiz eksen merkeze düşer.
 * Kayıtlı veride elle bozulmuş bir değer (NaN, string, 140) render'ı bozmasın.
 */
export function clampFocalPoint(fp?: Partial<FocalPoint> | null): FocalPoint {
  return {
    x: toPercent(fp?.x, DEFAULT_FOCAL_POINT.x),
    y: toPercent(fp?.y, DEFAULT_FOCAL_POINT.y),
  };
}

/** Odak yok ya da merkezdeyse true — bu durumda rozet/`object-position` yazılmaz. */
export function isDefaultFocalPoint(fp?: Partial<FocalPoint> | null): boolean {
  if (!fp) return true;
  const c = clampFocalPoint(fp);
  return c.x === DEFAULT_FOCAL_POINT.x && c.y === DEFAULT_FOCAL_POINT.y;
}

/** Yüzdeyi CSS için biçimler: tam sayıysa "30", değilse en çok 2 ondalık. */
const fmt = (n: number): string => {
  const rounded = Math.round(n * 100) / 100;
  return String(rounded);
};

/**
 * `object-position` değeri üretir: `"30% 70%"`. Odak yoksa ya da merkezdeyse
 * `undefined` döner — böylece odak verilmemiş görsellerin DOM çıktısı
 * değişmez (regresyon yok).
 */
export function focalPointToObjectPosition(fp?: Partial<FocalPoint> | null): string | undefined {
  if (isDefaultFocalPoint(fp)) return undefined;
  const c = clampFocalPoint(fp);
  return `${fmt(c.x)}% ${fmt(c.y)}%`;
}
