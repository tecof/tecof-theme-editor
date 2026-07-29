import type { ThemeConfig, ThemeColors, HSL, DeepPartialThemeConfig } from '../types';
import { themeFontVarLines } from '../studio/theme/fonts';

/* ─── CDN File URL ───
 *
 * Dosyalar backend'de scope'lu klasörlere yazılır (merchants/{id}/theme/assets/…);
 * public adres CDN/<folder>/<name> şemasındadır. `folder`'ı hesaba katmadan
 * `${cdnUrl}/${name}` kurmak scope'lu her dosya için 404 üretir — ve üretilen
 * URL TipTap HTML'ine ya da tema JSON'una KALICI yazıldığında düzeltilemez.
 * Bu yüzden URL kuran her tüketici bu tek helper'ı kullanır.
 */

export interface CdnFileLike {
  name?: string;
  folder?: string | null;
  /** External (stok) dosyalarda hazır mutlak adres */
  url?: string;
  type?: string;
  provider?: string;
}

/**
 * Bir upload kaydından CDN URL'i kurar.
 *
 * @param fileName Varyant adı (meta.webp / meta.thumbnail…) — verilmezse file.name.
 *        Varyantlar orijinalle AYNI klasörde yaşar, folder öneki ortaktır.
 */
export function cdnFileUrl(cdnUrl: string, file: CdnFileLike | null | undefined, fileName?: string): string {
  if (!file) return '';
  // Stok/harici görseller CDN'de değildir — kayıttaki mutlak adres kullanılır
  if (file.type === 'external' || file.provider === 'external') return file.url || '';

  const name = fileName || file.name || '';
  if (!name) return '';

  const folder = file.folder && file.folder !== '/'
    ? `${String(file.folder).replace(/^\/+|\/+$/g, '')}/`
    : '';
  return `${cdnUrl}/${folder}${name}`;
}

/* ─── Color Converters ─── */

export function hexToHsl(hex: string): HSL {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);

  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${f(0)}${f(8)}${f(4)}`;
}

/* ─── Color Manipulation ─── */

export function lighten(hex: string, amount: number): string {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.min(100, l + amount));
}

export function darken(hex: string, amount: number): string {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, l - amount));
}

/* ─── Dark palette derivation ─── */

const clampL = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Derives a sensible dark palette from a light one — powers the Tema panel's
 * "Koyu palet üret" button so authors start from a working dark theme instead of
 * eleven blanks. Neutral (low-saturation) colours invert their lightness so
 * surfaces go dark and text goes light; saturated brand/semantic colours keep
 * their hue and are lightness-tuned to stay readable on a dark background. The
 * result is a full {@link ThemeColors}; every key still has a fallback to the
 * light value at render time, so hand-tuning any single colour is safe.
 */
export function deriveDarkColors(light: ThemeColors): ThemeColors {
  const isNeutral = (hex: string) => hexToHsl(hex).s < 12;
  // Neutral → invert lightness into a clamped dark band (surfaces + light text).
  const invert = (hex: string, lo: number, hi: number, satCap: number): string => {
    const { h, s, l } = hexToHsl(hex);
    return hslToHex(h, Math.min(s, satCap), clampL(100 - l, lo, hi));
  };
  const surface = (hex: string, lo: number, hi: number) => invert(hex, lo, hi, 14);
  const onDark = (hex: string, lo: number, hi: number) => invert(hex, lo, hi, 24);
  // Brand/semantic → keep hue+saturation, lift dark colours so they read on dark.
  const brand = (hex: string): string => {
    const { h, s, l } = hexToHsl(hex);
    return hslToHex(h, s, clampL(l < 50 ? l + 12 : l, 45, 78));
  };

  return {
    background: surface(light.background, 3, 10),
    foreground: onDark(light.foreground, 90, 99),
    card: surface(light.card, 6, 13),
    cardForeground: onDark(light.cardForeground, 90, 99),
    muted: surface(light.muted, 12, 20),
    mutedForeground: onDark(light.mutedForeground, 58, 72),
    border: surface(light.border, 15, 24),
    secondary: isNeutral(light.secondary) ? surface(light.secondary, 12, 20) : brand(light.secondary),
    primary: isNeutral(light.primary) ? onDark(light.primary, 88, 98) : brand(light.primary),
    accent: isNeutral(light.accent) ? surface(light.accent, 14, 22) : brand(light.accent),
    destructive: brand(light.destructive),
  };
}

/* ─── CSS Variable Generation ─── */

export function generateCSSVariables(theme: ThemeConfig, opts?: { dark?: boolean }): string {
  const lines: string[] = [':root {'];

  // When dark mode is enabled, declare the base scheme so native controls
  // (scrollbars, form widgets) match. Omitted when dark is off so the output is
  // byte-identical to before for single-mode themes.
  if (opts?.dark) lines.push('  color-scheme: light;');

  // Colors
  for (const [key, value] of Object.entries(theme.colors)) {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    lines.push(`  --theme-color-${cssKey}: ${value};`);
  }

  // Typography
  lines.push(`  --theme-font-family: ${theme.typography.fontFamily};`);
  lines.push(`  --theme-heading-font-family: ${theme.typography.headingFontFamily};`);
  lines.push(`  --theme-font-size-base: ${theme.typography.baseFontSize}px;`);
  lines.push(`  --theme-line-height: ${theme.typography.lineHeight};`);
  lines.push(`  --theme-font-weight-normal: ${theme.typography.fontWeightNormal};`);
  lines.push(`  --theme-font-weight-medium: ${theme.typography.fontWeightMedium};`);
  lines.push(`  --theme-font-weight-bold: ${theme.typography.fontWeightBold};`);

  for (const [level, scale] of Object.entries(theme.typography.headingScale)) {
    lines.push(`  --theme-heading-${level}: ${scale}rem;`);
  }

  // Per-font `--font-<id>` variables for the fonts in use (builtin + custom), so
  // per-node `font-[<id>]` tokens resolve everywhere the theme vars are injected.
  lines.push(...themeFontVarLines(theme));

  // Spacing
  lines.push(`  --theme-container-max-width: ${theme.spacing.containerMaxWidth}px;`);
  lines.push(`  --theme-section-padding-y: ${theme.spacing.sectionPaddingY}px;`);
  lines.push(`  --theme-section-padding-x: ${theme.spacing.sectionPaddingX}px;`);
  lines.push(`  --theme-component-gap: ${theme.spacing.componentGap}px;`);
  lines.push(`  --theme-border-radius: ${theme.spacing.borderRadius}px;`);
  lines.push(`  --theme-border-radius-lg: ${theme.spacing.borderRadiusLg}px;`);
  lines.push(`  --theme-border-radius-sm: ${theme.spacing.borderRadiusSm}px;`);

  // Custom tokens
  if (theme.customTokens) {
    for (const [key, value] of Object.entries(theme.customTokens)) {
      lines.push(`  --theme-${key}: ${value};`);
    }
  }

  lines.push('}');

  // Dark override block: same 11 color vars, resolved to `darkColors[key]` (with
  // a per-key fallback to the light value), scoped to `:root.dark`. `.dark`
  // (specificity 0,2,0) beats the base `:root` (0,1,0) regardless of order, so
  // toggling the class flips only the VALUES — page classes never change and the
  // Tailwind safelist is untouched. Emitted only when the host enables dark mode.
  if (opts?.dark) {
    const dark = (theme.darkColors ?? {}) as Record<string, string | undefined>;
    lines.push('');
    lines.push(':root.dark {');
    lines.push('  color-scheme: dark;');
    for (const [key, value] of Object.entries(theme.colors)) {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      lines.push(`  --theme-color-${cssKey}: ${dark[key] ?? value};`);
    }
    lines.push('}');
  }

  return lines.join('\n');
}

/* ─── Default Theme ─── */

export function getDefaultTheme(): ThemeConfig {
  return {
    colors: {
      primary: '#18181b',
      secondary: '#f4f4f5',
      accent: '#3b82f6',
      background: '#ffffff',
      foreground: '#09090b',
      muted: '#f4f4f5',
      mutedForeground: '#71717a',
      border: '#e4e4e7',
      card: '#ffffff',
      cardForeground: '#09090b',
      destructive: '#ef4444',
    },
    // Sensible zinc dark baseline so enabling `config.darkMode` yields a working
    // dark theme out of the box; authors refine it in the Tema panel (or click
    // "Koyu palet üret" to re-derive from their own light colours). Ignored
    // entirely unless dark mode is enabled.
    darkColors: {
      primary: '#fafafa',
      secondary: '#27272a',
      accent: '#60a5fa',
      background: '#09090b',
      foreground: '#fafafa',
      muted: '#27272a',
      mutedForeground: '#a1a1aa',
      border: '#27272a',
      card: '#18181b',
      cardForeground: '#fafafa',
      destructive: '#ef4444',
    },
    typography: {
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      headingFontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      baseFontSize: 16,
      lineHeight: 1.6,
      headingScale: {
        h1: 3,
        h2: 2.25,
        h3: 1.875,
        h4: 1.5,
        h5: 1.25,
        h6: 1,
      },
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
    },
    fonts: ['inter'],
    customFonts: [],
    spacing: {
      containerMaxWidth: 1280,
      sectionPaddingY: 80,
      sectionPaddingX: 24,
      componentGap: 24,
      borderRadius: 8,
      borderRadiusLg: 12,
      borderRadiusSm: 4,
    },
  };
}

/* ─── Deep Equality ─── */

/**
 * Structural equality for plain JSON-ish values (primitives, arrays, plain
 * objects). Used to compare prop values so dynamic resolvers only write back real
 * changes (loop guard) and only report genuinely-changed props. Not intended for
 * classes, Maps/Sets, or cyclic structures — prop values are plain data.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const aArr = Array.isArray(a);
  const bArr = Array.isArray(b);
  if (aArr !== bArr) return false;

  if (aArr && bArr) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(bObj, key)) return false;
    if (!deepEqual(aObj[key], bObj[key])) return false;
  }
  return true;
}

/* ─── Deep Merge ─── */

function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item));
}

export function mergeTheme(base: ThemeConfig, overrides: DeepPartialThemeConfig): ThemeConfig {
  const result: ThemeConfig = {
    colors: { ...base.colors, ...(overrides.colors ?? {}) },
    // Dark palette merges per-key like colors (theme package default ← page
    // override). Enumerated explicitly because mergeTheme drops unknown fields.
    darkColors: { ...(base.darkColors ?? {}), ...(overrides.darkColors ?? {}) },
    typography: { ...base.typography, ...(overrides.typography ?? {}) },
    spacing: { ...base.spacing, ...(overrides.spacing ?? {}) },
    customTokens: { ...(base.customTokens ?? {}), ...(overrides.customTokens ?? {}) },
    // Font selection is replaced wholesale when the override provides it (the
    // theme editor always writes the full arrays), else inherited from base.
    fonts: overrides.fonts ?? base.fonts,
    customFonts: overrides.customFonts ?? base.customFonts,
  };

  // Deep-merge headingScale if provided
  if (overrides.typography?.headingScale) {
    result.typography.headingScale = {
      ...base.typography.headingScale,
      ...overrides.typography.headingScale,
    };
  }

  return result;
}
