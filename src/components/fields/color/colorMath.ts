/**
 * ColorField v2 — saf renk matematiği (DOM yok, React yok).
 *
 * Neden ayrı modül: seçicinin doğruluğu (parse, dönüşüm, kontrast) vitest ile
 * node ortamında test edilir; bileşen dosyası yalnız etkileşimi taşır.
 * `src/utils/index.ts`'teki `hexToHsl`/`hslToHex` (HSL, yuvarlanmış) dışa
 * verilmiş mevcut API'dir; burada FARKLI adlar kullanılır ki iki modül
 * birbirinin yerine geçmeye çalışmasın.
 */
import type { ThemeColors } from '../../../types';
import { THEME_COLOR_KEYS, toThemeCssKey } from '../../../studio/theme/colorKeys';
import { TAILWIND_PALETTE, TAILWIND_SHADES, type TailwindShade } from '../../../studio/style/palette';

/* ─── Tipler ─── */

/** 0..255 tam sayı kanallar. */
export interface RGB { r: number; g: number; b: number }
/** h 0..360, s/v 0..1 — seçicinin iç modeli (SV alanı + ton kaydırıcısı). */
export interface HSV { h: number; s: number; v: number }
/** h 0..360, s/l 0..100 — HSL kanal girdileri için. */
export interface HSLColor { h: number; s: number; l: number }
export type ColorFormat = 'hex' | 'rgb' | 'hsl';
export interface ParsedColor {
  rgb: RGB;
  /** 0..1 */
  alpha: number;
  source: 'hex' | 'rgb' | 'hsl' | 'keyword';
}
export type ColorValueKind = 'empty' | 'color' | 'themeVar' | 'unknown';
export interface ClassifiedValue {
  kind: ColorValueKind;
  parsed?: ParsedColor;
  themeKey?: keyof ThemeColors;
  /** Depolanan ham değer — `unknown` modunda olduğu gibi korunur. */
  raw: string;
}

export const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n));

const round = Math.round;
const hex2 = (n: number): string => clamp(round(n), 0, 255).toString(16).padStart(2, '0');
const normalizeRgb = (rgb: RGB): RGB => ({ r: clamp(round(rgb.r), 0, 255), g: clamp(round(rgb.g), 0, 255), b: clamp(round(rgb.b), 0, 255) });

/* ─── Parse ─── */

/** Sayı belirteci: `50%` → yüzde işaretli, `0.5`/`12deg` → düz. Geçersizse null. */
const parseNumberToken = (token: string): { value: number; percent: boolean } | null => {
  const m = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%|deg)?$/i.exec(token);
  if (!m) return null;
  const value = Number(m[1]);
  if (!Number.isFinite(value)) return null;
  return { value, percent: m[2] === '%' };
};

/** rgb()/hsl() iç kısmını virgül, boşluk veya `/` ile ayrılmış belirteçlere böler. */
const splitArgs = (inner: string): string[] => inner.split(/[\s,/]+/).filter(Boolean);

const parseAlphaToken = (token: string | undefined): number | null => {
  if (token === undefined) return 1;
  const n = parseNumberToken(token);
  if (!n) return null;
  return clamp(n.percent ? n.value / 100 : n.value, 0, 1);
};

/**
 * `#rgb #rgba #rrggbb #rrggbbaa`, `rgb()/rgba()` (virgüllü ve `rgb(255 0 0 / 50%)`),
 * `hsl()/hsla()` (virgüllü/boşluklu, `%` ile/siz) ve `transparent` kabul edilir;
 * büyük/küçük harf ve kenar boşluğu toleranslıdır. Diğer her şey null.
 * `var(...)` BURADA çözülmez — sınıflandırma `classifyValue`'da yapılır.
 */
export function parseColor(input: string): ParsedColor | null {
  if (typeof input !== 'string') return null;
  const s = input.trim().toLowerCase();
  if (!s) return null;

  if (s === 'transparent') return { rgb: { r: 0, g: 0, b: 0 }, alpha: 0, source: 'keyword' };

  if (s[0] === '#') {
    const h = s.slice(1);
    if (!/^[0-9a-f]+$/.test(h)) return null;
    if (h.length === 3 || h.length === 4) {
      const [r, g, b, a] = h.split('').map((c) => parseInt(c + c, 16));
      return { rgb: { r, g, b }, alpha: h.length === 4 ? a / 255 : 1, source: 'hex' };
    }
    if (h.length === 6 || h.length === 8) {
      const int = parseInt(h.slice(0, 6), 16);
      const alpha = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
      return { rgb: { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }, alpha, source: 'hex' };
    }
    return null;
  }

  const fn = /^(rgba?|hsla?)\(\s*([^()]*)\)$/.exec(s);
  if (!fn) return null;
  const args = splitArgs(fn[2]);
  if (args.length !== 3 && args.length !== 4) return null;
  const alpha = parseAlphaToken(args[3]);
  if (alpha === null) return null;

  if (fn[1].startsWith('rgb')) {
    const ch = args.slice(0, 3).map(parseNumberToken);
    if (ch.some((c) => c === null)) return null;
    const [r, g, b] = ch.map((c) => (c!.percent ? (c!.value * 255) / 100 : c!.value));
    return { rgb: normalizeRgb({ r, g, b }), alpha, source: 'rgb' };
  }

  const [hT, sT, lT] = args.slice(0, 3).map(parseNumberToken);
  if (!hT || !sT || !lT) return null;
  // Ton 360 modülünde sarılır (−30 → 330); doygunluk/parlaklık 0..100 kırpılır.
  const h = ((hT.value % 360) + 360) % 360;
  const rgb = hslToRgb({ h, s: clamp(sT.value, 0, 100), l: clamp(lT.value, 0, 100) });
  return { rgb, alpha, source: 'hsl' };
}

/* ─── Format ─── */

/** Küçük harf `#rrggbb`; alpha < 1 ise 8 hane. Alpha 0..1'e kırpılır. */
export function formatHex(rgb: RGB, alpha = 1): string {
  const a = clamp(Number.isFinite(alpha) ? alpha : 1, 0, 1);
  const base = `#${hex2(rgb.r)}${hex2(rgb.g)}${hex2(rgb.b)}`;
  return a < 1 ? base + hex2(a * 255) : base;
}

const pct = (n: number): string => `${round(n)}%`;

/** Görünüm metni: `#2f7cf6` | `rgb(47 124 246 / 50%)` | `hsl(217 92% 57%)`. */
export function formatColor(rgb: RGB, alpha: number, format: ColorFormat): string {
  const a = clamp(alpha, 0, 1);
  const tail = a < 1 ? ` / ${pct(a * 100)}` : '';
  if (format === 'rgb') {
    const { r, g, b } = normalizeRgb(rgb);
    return `rgb(${r} ${g} ${b}${tail})`;
  }
  if (format === 'hsl') {
    const { h, s, l } = rgbToHsl(rgb);
    return `hsl(${round(h)} ${pct(s)} ${pct(l)}${tail})`;
  }
  return formatHex(rgb, a);
}

/**
 * Emit kuralı (§3.2): parse edilemeyen giriş `''`; `showOpacity` kapalıyken alpha
 * atılır — İSTİSNA alpha 0 (`transparent`) → `''` (siyaha çökmesin diye).
 * Çağıran `unknown` (ör. `var(--x)`) değerleri önce `classifyValue` ile ayırır.
 */
export function normalizeValue(input: string, opts: { showOpacity: boolean }): string {
  const parsed = parseColor(input);
  if (!parsed) return '';
  if (!opts.showOpacity) {
    if (parsed.alpha === 0) return '';
    return formatHex(parsed.rgb, 1);
  }
  return formatHex(parsed.rgb, parsed.alpha);
}

/** Depolanan değeri dört moddan birine ayırır; unknown'da ham metin korunur. */
export function classifyValue(value: string | null | undefined): ClassifiedValue {
  const raw = typeof value === 'string' ? value : '';
  if (!raw.trim()) return { kind: 'empty', raw };
  const themeKey = parseThemeColorVar(raw);
  if (themeKey) return { kind: 'themeVar', themeKey, raw };
  const parsed = parseColor(raw);
  if (parsed) return { kind: 'color', parsed, raw };
  return { kind: 'unknown', raw };
}

/* ─── Dönüşümler ─── */

export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function hsvToRgb(hsv: HSV): RGB {
  const h = ((hsv.h % 360) + 360) % 360;
  const s = clamp(hsv.s, 0, 1), v = clamp(hsv.v, 0, 1);
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return { r: round((r + m) * 255), g: round((g + m) * 255), b: round((b + m) * 255) };
}

export function rgbToHsl(rgb: RGB): HSLColor {
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb(hsl: HSLColor): RGB {
  const h = ((hsl.h % 360) + 360) % 360;
  const s = clamp(hsl.s, 0, 100) / 100;
  const l = clamp(hsl.l, 0, 100) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number): number => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return { r: round(f(0) * 255), g: round(f(8) * 255), b: round(f(4) * 255) };
}

/**
 * HSV ↔ HSL doğrudan dönüşüm — RGB'den geçmez ki gri/siyahta (s=0 / v=0) ton
 * kaybolmasın: HSL kanal girdisinde H yazılınca değer yerinde kalır.
 */
export function hsvToHsl(hsv: HSV): HSLColor {
  const s = clamp(hsv.s, 0, 1), v = clamp(hsv.v, 0, 1);
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return { h: hsv.h, s: sl * 100, l: l * 100 };
}

export function hslToHsv(hsl: HSLColor): HSV {
  const s = clamp(hsl.s, 0, 100) / 100, l = clamp(hsl.l, 0, 100) / 100;
  const v = l + s * Math.min(l, 1 - l);
  const sv = v === 0 ? 0 : 2 * (1 - l / v);
  return { h: hsl.h, s: sv, v };
}

/* ─── Önizleme / kontrast ─── */

/** Önizleme dolgusu: opaksa hex, değilse rgba(). */
export function cssColor(rgb: RGB, alpha: number): string {
  const a = clamp(alpha, 0, 1);
  const { r, g, b } = normalizeRgb(rgb);
  return a < 1 ? `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(3))})` : formatHex(rgb, 1);
}

/** WCAG 2.x göreli parlaklık (sRGB doğrusallaştırma). */
export function relativeLuminance(rgb: RGB): number {
  const lin = (c: number): number => {
    const v = clamp(c, 0, 255) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
}

/** Yarı saydam ön rengi zemin üstüne bileşik eder (kontrast için gerçek görünen renk). */
export function compositeOver(fg: RGB, alpha: number, bg: RGB): RGB {
  const a = clamp(alpha, 0, 1);
  return {
    r: round(fg.r * a + bg.r * (1 - a)),
    g: round(fg.g * a + bg.g * (1 - a)),
    b: round(fg.b * a + bg.b * (1 - a)),
  };
}

/** Kontrast oranı ≥ 1, sıra bağımsız. */
export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a), lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function wcagLevel(ratio: number): 'AAA' | 'AA' | 'AA-large' | 'fail' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-large';
  return 'fail';
}

/* ─── Tema değişkenleri ─── */

export function themeColorVar(key: keyof ThemeColors): string {
  return `var(--theme-color-${toThemeCssKey(key)})`;
}

const THEME_KEY_BY_CSS: Record<string, keyof ThemeColors> = Object.fromEntries(
  THEME_COLOR_KEYS.map((k) => [k.cssKey, k.key])
) as Record<string, keyof ThemeColors>;

/** Yalnız 11 bilinen tema anahtarı çözülür; başka var() → null. */
export function parseThemeColorVar(value: string): keyof ThemeColors | null {
  if (typeof value !== 'string') return null;
  const m = /^var\(\s*--theme-color-([a-z-]+)\s*\)$/i.exec(value.trim());
  if (!m) return null;
  return THEME_KEY_BY_CSS[m[1].toLowerCase()] ?? null;
}

export function isCssVar(value: string): boolean {
  return typeof value === 'string' && /^var\(--[\w-]+\)$/.test(value.trim());
}

/* ─── Tailwind paleti ─── */

let paletteIndex: Map<string, { hue: string; shade: TailwindShade }> | null = null;

/** Hex → Tailwind ton eşlemesi; büyük/küçük harf duyarsız, alpha yok sayılır. */
export function findPaletteHex(hex: string): { hue: string; shade: TailwindShade } | null {
  const parsed = parseColor(hex);
  if (!parsed) return null;
  // Tembel kurulur: 242 giriş, yalnız ilk çağrıda.
  if (!paletteIndex) {
    paletteIndex = new Map();
    for (const h of TAILWIND_PALETTE) {
      for (const shade of TAILWIND_SHADES) {
        paletteIndex.set(h.shades[shade].toLowerCase(), { hue: h.name, shade });
      }
    }
  }
  return paletteIndex.get(formatHex(parsed.rgb, 1)) ?? null;
}
