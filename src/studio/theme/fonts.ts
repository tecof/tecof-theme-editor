/**
 * Font system — a curated registry of loadable web fonts plus pure helpers that
 * turn a theme's font selection into the CSS the editor and published pages need:
 * a Google Fonts `<link>` href, `@font-face` rules for uploaded custom fonts, and
 * `--font-<id>` CSS variables.
 *
 * Everything here is pure (string in / string out) and DOM-free, so it drives
 * both the live editor injection (ThemeVars) and static publish output
 * (TecofRender / exported helpers) from one source of truth.
 */

import type { CustomFont, ThemeConfig } from '../../types';

export type FontCategory = 'sans' | 'serif' | 'display' | 'mono' | 'system';

export interface BuiltinFont {
  id: string;
  label: string;
  /** The full CSS `font-family` value (primary + fallbacks). */
  stack: string;
  category: FontCategory;
  /** Google Fonts family name; omitted for system fonts that need no loading. */
  google?: string;
}

const SANS_FALLBACK = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const SERIF_FALLBACK = 'Georgia, Cambria, "Times New Roman", serif';
const MONO_FALLBACK = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/** Build a Google-backed builtin font entry. */
const g = (
  id: string,
  label: string,
  google: string,
  category: FontCategory,
  fallback = SANS_FALLBACK,
): BuiltinFont => ({ id, label, google, category, stack: `'${google}', ${fallback}` });

export const BUILTIN_FONTS: readonly BuiltinFont[] = [
  { id: 'system', label: 'Sistem', category: 'system', stack: SANS_FALLBACK },
  { id: 'georgia', label: 'Georgia', category: 'serif', stack: `Georgia, ${SERIF_FALLBACK}` },
  g('inter', 'Inter', 'Inter', 'sans'),
  g('roboto', 'Roboto', 'Roboto', 'sans'),
  g('open-sans', 'Open Sans', 'Open Sans', 'sans'),
  g('lato', 'Lato', 'Lato', 'sans'),
  g('montserrat', 'Montserrat', 'Montserrat', 'sans'),
  g('poppins', 'Poppins', 'Poppins', 'sans'),
  g('nunito', 'Nunito', 'Nunito', 'sans'),
  g('work-sans', 'Work Sans', 'Work Sans', 'sans'),
  g('dm-sans', 'DM Sans', 'DM Sans', 'sans'),
  g('raleway', 'Raleway', 'Raleway', 'sans'),
  g('playfair-display', 'Playfair Display', 'Playfair Display', 'serif', SERIF_FALLBACK),
  g('merriweather', 'Merriweather', 'Merriweather', 'serif', SERIF_FALLBACK),
  g('lora', 'Lora', 'Lora', 'serif', SERIF_FALLBACK),
  g('oswald', 'Oswald', 'Oswald', 'display'),
  g('bebas-neue', 'Bebas Neue', 'Bebas Neue', 'display'),
  g('jetbrains-mono', 'JetBrains Mono', 'JetBrains Mono', 'mono', MONO_FALLBACK),
];

const BY_ID = new Map(BUILTIN_FONTS.map((f) => [f.id, f]));

export const getBuiltinFont = (id: string): BuiltinFont | undefined => BY_ID.get(id);

/** Weights requested from Google for every family (Google serves the nearest). */
const GOOGLE_WEIGHTS = [400, 500, 600, 700];

/** Combined Google Fonts css2 URL for the given ids (google-backed ids only). */
export function googleFontsHref(
  ids: readonly string[],
  weights: readonly number[] = GOOGLE_WEIGHTS,
): string | null {
  const wght = Array.from(new Set(weights)).sort((a, b) => a - b).join(';');
  const families = ids
    .map((id) => BY_ID.get(id))
    .filter((f): f is BuiltinFont => Boolean(f?.google))
    .map((f) => `family=${encodeURIComponent(f.google!).replace(/%20/g, '+')}:wght@${wght}`);
  const unique = Array.from(new Set(families));
  if (unique.length === 0) return null;
  return `https://fonts.googleapis.com/css2?${unique.join('&')}&display=swap`;
}

/** Href that loads EVERY builtin webfont (light weights) — for picker previews. */
export const previewFontsHref = (): string | null =>
  googleFontsHref(BUILTIN_FONTS.filter((f) => f.google).map((f) => f.id), [400, 600]);

/** `@font-face` CSS for uploaded custom fonts. */
export function customFontFaceCss(fonts: readonly CustomFont[] | undefined): string {
  if (!fonts?.length) return '';
  return fonts
    .filter((f) => f && f.family && f.src)
    .map((f) => {
      const fmt = f.format ? ` format('${f.format}')` : '';
      return (
        `@font-face { font-family: '${f.family}'; ` +
        `src: url('${f.src}')${fmt}; ` +
        `font-weight: ${f.weight ?? 400}; ` +
        `font-style: ${f.style ?? 'normal'}; ` +
        `font-display: swap; }`
      );
    })
    .join('\n');
}

/* ─── Theme-scoped conveniences (used by injection + publish) ─── */

/** Google Fonts href for every builtin id referenced by the theme. */
export const themeGoogleFontsHref = (theme: ThemeConfig): string | null =>
  googleFontsHref(theme.fonts ?? []);

/** `@font-face` block for the theme's custom fonts. */
export const themeFontFaceCss = (theme: ThemeConfig): string =>
  customFontFaceCss(theme.customFonts);

/** `--font-<id>: <stack>;` variable lines for builtin (in use) + custom fonts. */
export function themeFontVarLines(theme: ThemeConfig): string[] {
  const lines: string[] = [];
  for (const id of theme.fonts ?? []) {
    const b = BY_ID.get(id);
    if (b) lines.push(`  --font-${id}: ${b.stack};`);
  }
  for (const c of theme.customFonts ?? []) {
    if (c?.id && c.family) lines.push(`  --font-${c.id}: '${c.family}', ${SANS_FALLBACK};`);
  }
  return lines;
}

/* ─── Picker helpers (builtin + custom, unified) ─── */

export interface ThemeFont {
  id: string;
  label: string;
  stack: string;
  kind: 'builtin' | 'custom';
  category?: FontCategory;
}

/** Every font the picker can offer: builtin registry + the theme's custom fonts. */
export function listThemeFonts(customFonts?: readonly CustomFont[]): ThemeFont[] {
  const builtin: ThemeFont[] = BUILTIN_FONTS.map((f) => ({
    id: f.id,
    label: f.label,
    stack: f.stack,
    kind: 'builtin',
    category: f.category,
  }));
  const custom: ThemeFont[] = (customFonts ?? []).map((c) => ({
    id: c.id,
    label: c.family,
    stack: `'${c.family}', ${SANS_FALLBACK}`,
    kind: 'custom',
  }));
  return [...builtin, ...custom];
}

/** Resolve the currently-applied `font-family` stack back to a known font. */
export function findFontByStack(stack: string | undefined, customFonts?: readonly CustomFont[]): ThemeFont | undefined {
  if (!stack) return undefined;
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
  const target = norm(stack);
  return listThemeFonts(customFonts).find((f) => norm(f.stack) === target);
}

/** Parse a per-node font token `[var(--font-<id>)]` back to its font id. */
export function fontIdFromVarToken(value: string | undefined): string | null {
  const m = /^\[var\(--font-([a-z0-9-]+)\)\]$/.exec(value ?? '');
  return m ? m[1] : null;
}

/** Slugify a family name into a stable custom-font id. */
export function fontIdFromFamily(family: string): string {
  return (
    family
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'font'
  );
}
