/**
 * Single source of truth for the visual style editor.
 *
 * STYLE_CONTROLS drives three things at once:
 *   1. the StyleEditor UI (which controls + options to render),
 *   2. className compilation (token → Tailwind class via `toClass`),
 *   3. the production safelist (every token × variant → finite class set).
 *
 * Targets Tailwind v4: theme tokens are CSS variables (`@theme`), so the
 * editor palette (`--tecof-primary-*`) maps to `bg-primary-600` etc. once the
 * host registers `--color-primary-*` in its `@theme`.
 */

import { TAILWIND_PALETTE, TAILWIND_SHADES, tailwindSwatch } from './palette';
import { BUILTIN_FONTS } from '../theme/fonts';

export type StyleGroup = 'layout' | 'spacing' | 'sizing' | 'typography' | 'background' | 'border' | 'effects';
export type StyleControlType = 'segment' | 'select' | 'color' | 'space';

export interface StyleControlOption {
  label: string;
  value: string;
  /** Optional CSS color for color-swatch rendering in the UI. */
  swatch?: string;
}

/** ColorPicker panel sections a color control can expose. */
export type ColorSectionKey = 'base' | 'theme' | 'brand' | 'palette' | 'custom';

export interface StyleControl {
  id: string;
  label: string;
  group: StyleGroup;
  type: StyleControlType;
  options: StyleControlOption[];
  /**
   * Token value → Tailwind class(es) (or null to emit nothing). May return
   * multiple space-separated utilities (e.g. `transition-all duration-300`);
   * emitters split on spaces so variant prefixes/important markers attach to
   * each class individually.
   */
  toClass: (value: string) => string | null;
  /**
   * Which ColorPicker sections a `color` control shows (default: all).
   * Gradient stops restrict this to the finite sets (base/theme/brand) so the
   * safelist stays bounded — the full Tailwind palette would double it.
   */
  colorSections?: ColorSectionKey[];
  /**
   * Tailwind utility prefix for arbitrary (custom) values. When set, the user
   * can type a raw value `V` (e.g. `10px`, `#ff0000`) and it compiles to
   * `<prefix>-[V]` (e.g. `p-[10px]`, `bg-[#ff0000]`).
   *
   * Encoding: an arbitrary value is stored in NodeStyles bracket-wrapped
   * (`'[10px]'`); presets stay bare (`'4'`, `'primary-600'`). `isArbitrary`
   * detects the wrapper so `toClass` round-trips losslessly through the model.
   */
  arbitraryPrefix?: string;
}

/** A NodeStyles value is "arbitrary" (custom) when bracket-wrapped: `[10px]`. */
export const isArbitrary = (value: string): boolean =>
  value.length > 1 && value.startsWith('[') && value.endsWith(']');

/** Unwrap an arbitrary value: `'[10px]'` → `'10px'`. */
export const arbitraryRaw = (value: string): string =>
  isArbitrary(value) ? value.slice(1, -1) : value;

/** Wrap a raw custom value for storage in NodeStyles: `'10px'` → `'[10px]'`. */
export const toArbitrary = (raw: string): string => `[${raw}]`;

/* ─── Scales ─── */

const SPACE = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24'];
const spaceOptions = (): StyleControlOption[] => SPACE.map((v) => ({ label: v, value: v }));

/**
 * Semantic theme colors. The host emits these as `--theme-color-*` CSS variables
 * via `generateCSSVariables`, so each swatch preview reads the LIVE theme color
 * and the stored token is an arbitrary value pointing at that same variable
 * (`bg-[var(--theme-color-primary)]`). Because the set is finite, `getSafelist()`
 * covers it automatically — no Tailwind `@theme` mapping required.
 */
const THEME_COLORS: { label: string; key: string }[] = [
  { label: 'Tema · Ana renk', key: 'primary' },
  { label: 'Tema · İkincil', key: 'secondary' },
  { label: 'Tema · Vurgu', key: 'accent' },
  { label: 'Tema · Arka plan', key: 'background' },
  { label: 'Tema · Metin', key: 'foreground' },
  { label: 'Tema · Soluk', key: 'muted' },
  { label: 'Tema · Soluk metin', key: 'muted-foreground' },
  { label: 'Tema · Kenarlık', key: 'border' },
  { label: 'Tema · Kart', key: 'card' },
  { label: 'Tema · Kart metin', key: 'card-foreground' },
  { label: 'Tema · Uyarı', key: 'destructive' },
];

const THEME_COLOR_OPTIONS: StyleControlOption[] = THEME_COLORS.map(({ label, key }) => ({
  label,
  value: `[var(--theme-color-${key})]`,
  swatch: `var(--theme-color-${key})`,
}));

/** Quick picks shown at the top of the color picker. */
const BASE_COLOR_OPTIONS: StyleControlOption[] = [
  { label: 'Yok', value: '' },
  { label: 'Şeffaf', value: 'transparent', swatch: 'transparent' },
  { label: 'Beyaz', value: 'white', swatch: '#ffffff' },
  { label: 'Siyah', value: 'black', swatch: '#000000' },
];

/** Brand palette (Tailwind v4 @theme: --color-primary-*). */
const BRAND_COLOR_OPTIONS: StyleControlOption[] = TAILWIND_SHADES.map((s) => ({
  label: `Primary ${s}`,
  value: `primary-${s}`,
  swatch: `var(--tecof-primary-${s})`,
}));

/** Full Tailwind default palette (`red-500` → `bg-red-500`). */
const TAILWIND_COLOR_OPTIONS: StyleControlOption[] = TAILWIND_PALETTE.flatMap((hue) =>
  TAILWIND_SHADES.map((shade) => ({
    label: `${hue.label} ${shade}`,
    value: `${hue.name}-${shade}`,
    swatch: tailwindSwatch(hue.name, shade),
  }))
);

const COLOR_OPTIONS: StyleControlOption[] = [
  ...BASE_COLOR_OPTIONS,
  // Live theme colors (host --theme-color-* variables)
  ...THEME_COLOR_OPTIONS,
  ...BRAND_COLOR_OPTIONS,
  ...TAILWIND_COLOR_OPTIONS,
];

/** Grouped color sections consumed by the ColorPicker UI. */
export const COLOR_SECTIONS = {
  base: BASE_COLOR_OPTIONS,
  theme: THEME_COLOR_OPTIONS,
  brand: BRAND_COLOR_OPTIONS,
} as const;

/**
 * Gradient stop palette: the finite sections only. Every option here lands in
 * the safelist as `from-*`/`to-*` × every variant prefix, so the full Tailwind
 * palette (~250 tokens) is deliberately excluded; custom hex stops still work
 * as arbitrary values via `collectDocumentClasses`.
 */
const GRADIENT_COLOR_OPTIONS: StyleControlOption[] = [
  ...BASE_COLOR_OPTIONS,
  ...THEME_COLOR_OPTIONS,
  ...BRAND_COLOR_OPTIONS,
];

const opts = (values: string[], withNone = true): StyleControlOption[] => [
  ...(withNone ? [{ label: '—', value: '' }] : []),
  ...values.map((v) => ({ label: v, value: v })),
];

/**
 * Per-node font-family options. Like the theme colors, each value is an
 * arbitrary token pointing at a live CSS variable (`[var(--font-<id>)]`) that
 * `generateCSSVariables` defines — so the finite builtin set stays safelisted,
 * while uploaded custom fonts (dynamic) resolve through the same `font-[…]`
 * arbitrary path. The empty option inherits the theme font.
 */
const FONT_OPTIONS: StyleControlOption[] = [
  { label: 'Tema (miras)', value: '' },
  ...BUILTIN_FONTS.map((f) => ({ label: f.label, value: `[var(--font-${f.id})]` })),
];

/* ─── Controls registry ─── */

/**
 * Build a `toClass` for an arbitrary-capable control. Arbitrary values
 * (`'[10px]'`) compile to `prefix-[10px]`; preset values fall through to the
 * supplied preset mapper.
 */
const withArbitrary =
  (prefix: string, preset: (value: string) => string | null) =>
  (value: string): string | null => {
    if (!value) return null;
    if (isArbitrary(value)) return `${prefix}-${value}`;
    return preset(value);
  };

export const STYLE_CONTROLS: StyleControl[] = [
  // Layout
  { id: 'display', label: 'Display', group: 'layout', type: 'select',
    options: opts(['block', 'inline-block', 'flex', 'inline-flex', 'grid', 'hidden']),
    toClass: (v) => v || null },
  { id: 'flexDir', label: 'Yön', group: 'layout', type: 'segment',
    options: opts(['row', 'col']),
    toClass: (v) => (v ? `flex-${v}` : null) },
  { id: 'justify', label: 'Yatay hiza', group: 'layout', type: 'select',
    options: opts(['start', 'center', 'end', 'between', 'around', 'evenly']),
    toClass: (v) => (v ? `justify-${v}` : null) },
  { id: 'items', label: 'Dikey hiza', group: 'layout', type: 'select',
    options: opts(['start', 'center', 'end', 'stretch', 'baseline']),
    toClass: (v) => (v ? `items-${v}` : null) },
  { id: 'flexWrap', label: 'Satır kaydır', group: 'layout', type: 'segment',
    options: opts(['wrap', 'nowrap']),
    toClass: (v) => (v ? `flex-${v}` : null) },
  { id: 'gap', label: 'Boşluk (gap)', group: 'layout', type: 'space',
    options: spaceOptions(), arbitraryPrefix: 'gap', toClass: withArbitrary('gap', (v) => `gap-${v}`) },
  { id: 'alignSelf', label: 'Bireysel Hiza (self)', group: 'layout', type: 'select',
    options: opts(['auto', 'start', 'center', 'end', 'stretch']),
    toClass: (v) => (v ? `self-${v}` : null) },
  { id: 'position', label: 'Konumlama', group: 'layout', type: 'select',
    options: opts(['static', 'relative', 'absolute', 'sticky', 'fixed']),
    toClass: (v) => v || null },
  { id: 'zIndex', label: 'Katman (z-index)', group: 'layout', type: 'select',
    options: opts(['auto', '0', '10', '20', '30', '40', '50']),
    toClass: (v) => (v ? `z-${v}` : null) },
  { id: 'overflow', label: 'Taşma', group: 'layout', type: 'select',
    options: opts(['visible', 'hidden', 'auto', 'scroll']),
    toClass: (v) => (v ? `overflow-${v}` : null) },

  // Spacing — padding (shorthands + per-side; sides render in the SpacingBox)
  { id: 'p', label: 'Padding', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'p', toClass: withArbitrary('p', (v) => `p-${v}`) },
  { id: 'px', label: 'Padding X', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'px', toClass: withArbitrary('px', (v) => `px-${v}`) },
  { id: 'py', label: 'Padding Y', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'py', toClass: withArbitrary('py', (v) => `py-${v}`) },
  { id: 'pt', label: 'Padding Üst', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'pt', toClass: withArbitrary('pt', (v) => `pt-${v}`) },
  { id: 'pb', label: 'Padding Alt', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'pb', toClass: withArbitrary('pb', (v) => `pb-${v}`) },
  { id: 'pl', label: 'Padding Sol', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'pl', toClass: withArbitrary('pl', (v) => `pl-${v}`) },
  { id: 'pr', label: 'Padding Sağ', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'pr', toClass: withArbitrary('pr', (v) => `pr-${v}`) },
  // Spacing — margin
  { id: 'm', label: 'Margin', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'm', toClass: withArbitrary('m', (v) => `m-${v}`) },
  { id: 'mx', label: 'Margin X', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'mx', toClass: withArbitrary('mx', (v) => `mx-${v}`) },
  { id: 'my', label: 'Margin Y', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'my', toClass: withArbitrary('my', (v) => `my-${v}`) },
  { id: 'mt', label: 'Margin Üst', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'mt', toClass: withArbitrary('mt', (v) => `mt-${v}`) },
  { id: 'mb', label: 'Margin Alt', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'mb', toClass: withArbitrary('mb', (v) => `mb-${v}`) },
  { id: 'ml', label: 'Margin Sol', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'ml', toClass: withArbitrary('ml', (v) => `ml-${v}`) },
  { id: 'mr', label: 'Margin Sağ', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'mr', toClass: withArbitrary('mr', (v) => `mr-${v}`) },
  { id: 'marginAlign', label: 'Özel Hiza (margin)', group: 'spacing', type: 'select',
    options: [
      { label: '—', value: '' },
      { label: 'Sola Yasla (ml-auto)', value: 'l-auto' },
      { label: 'Sağa Yasla (mr-auto)', value: 'r-auto' },
      { label: 'Yatay Merkez (mx-auto)', value: 'x-auto' },
      { label: 'Merkez (m-auto)', value: 'auto' }
    ],
    toClass: (v) => (v ? (v === 'auto' ? 'm-auto' : v === 'l-auto' ? 'ml-auto' : v === 'r-auto' ? 'mr-auto' : 'mx-auto') : null) },

  // Sizing
  { id: 'w', label: 'Genişlik', group: 'sizing', type: 'select',
    options: opts(['auto', 'full', 'screen', '1/2', '1/3', '2/3', '1/4', '3/4', 'fit']),
    arbitraryPrefix: 'w', toClass: withArbitrary('w', (v) => `w-${v}`) },
  { id: 'h', label: 'Yükseklik', group: 'sizing', type: 'select',
    options: opts(['auto', 'full', 'screen', 'fit']),
    arbitraryPrefix: 'h', toClass: withArbitrary('h', (v) => `h-${v}`) },
  { id: 'maxW', label: 'Maks. genişlik', group: 'sizing', type: 'select',
    options: opts(['none', 'sm', 'md', 'lg', 'xl', '2xl', '4xl', '6xl', 'full']),
    arbitraryPrefix: 'max-w', toClass: withArbitrary('max-w', (v) => `max-w-${v}`) },

  // Background
  { id: 'bg', label: 'Arka plan', group: 'background', type: 'color', options: COLOR_OPTIONS,
    arbitraryPrefix: 'bg', toClass: withArbitrary('bg', (v) => `bg-${v}`) },
  // Gradient: direction + two color stops. `bg-gradient-to-*` (v4 alias of
  // bg-linear-to-*) keeps v3 hosts working too.
  { id: 'bgGradient', label: 'Gradient yönü', group: 'background', type: 'select',
    options: [
      { label: '—', value: '' },
      { label: 'Sağa', value: 'to-r' },
      { label: 'Sola', value: 'to-l' },
      { label: 'Aşağı', value: 'to-b' },
      { label: 'Yukarı', value: 'to-t' },
      { label: 'Sağ alta', value: 'to-br' },
      { label: 'Sağ üste', value: 'to-tr' },
    ],
    toClass: (v) => (v ? `bg-gradient-${v}` : null) },
  { id: 'gradientFrom', label: 'Gradient başlangıç', group: 'background', type: 'color',
    options: GRADIENT_COLOR_OPTIONS, colorSections: ['base', 'theme', 'brand', 'custom'],
    arbitraryPrefix: 'from', toClass: withArbitrary('from', (v) => `from-${v}`) },
  { id: 'gradientTo', label: 'Gradient bitiş', group: 'background', type: 'color',
    options: GRADIENT_COLOR_OPTIONS, colorSections: ['base', 'theme', 'brand', 'custom'],
    arbitraryPrefix: 'to', toClass: withArbitrary('to', (v) => `to-${v}`) },

  // Typography
  { id: 'fontFamily', label: 'Yazı tipi', group: 'typography', type: 'select', options: FONT_OPTIONS,
    // Options are arbitrary var-tokens → `withArbitrary` emits `font-[var(--font-id)]`.
    // `arbitraryPrefix: 'font'` also lets cssGenerator resolve custom-font classes.
    arbitraryPrefix: 'font', toClass: withArbitrary('font', () => null) },
  { id: 'text', label: 'Metin rengi', group: 'typography', type: 'color', options: COLOR_OPTIONS,
    arbitraryPrefix: 'text', toClass: withArbitrary('text', (v) => `text-${v}`) },
  { id: 'fontSize', label: 'Yazı boyutu', group: 'typography', type: 'select',
    options: opts(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl']),
    toClass: (v) => (v ? `text-${v}` : null) },
  { id: 'fontWeight', label: 'Kalınlık', group: 'typography', type: 'select',
    options: opts(['normal', 'medium', 'semibold', 'bold', 'extrabold']),
    toClass: (v) => (v ? `font-${v}` : null) },
  { id: 'align', label: 'Metin hizası', group: 'typography', type: 'segment',
    options: opts(['left', 'center', 'right', 'justify']),
    toClass: (v) => (v ? `text-${v}` : null) },
  { id: 'leading', label: 'Satır yüks.', group: 'typography', type: 'select',
    options: opts(['none', 'tight', 'snug', 'normal', 'relaxed', 'loose']),
    toClass: (v) => (v ? `leading-${v}` : null) },
  { id: 'tracking', label: 'Harf aralığı', group: 'typography', type: 'select',
    options: opts(['tighter', 'tight', 'normal', 'wide', 'wider', 'widest']),
    toClass: (v) => (v ? `tracking-${v}` : null) },
  { id: 'textTransform', label: 'Harf dönüşümü', group: 'typography', type: 'select',
    options: [
      { label: '—', value: '' },
      { label: 'BÜYÜK HARF', value: 'uppercase' },
      { label: 'küçük harf', value: 'lowercase' },
      { label: 'Baş Harfler', value: 'capitalize' },
      { label: 'Normal', value: 'normal-case' },
    ],
    toClass: (v) => v || null },
  { id: 'decoration', label: 'Süsleme', group: 'typography', type: 'select',
    options: [
      { label: '—', value: '' },
      { label: 'Altı çizili', value: 'underline' },
      { label: 'Üstü çizili', value: 'line-through' },
      { label: 'Çizgisiz', value: 'no-underline' },
    ],
    toClass: (v) => v || null },

  // Border
  { id: 'radius', label: 'Köşe yarıçapı', group: 'border', type: 'select',
    options: opts(['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full']),
    toClass: (v) => (v ? (v === 'md' ? 'rounded' : `rounded-${v}`) : null) },
  { id: 'border', label: 'Kenarlık', group: 'border', type: 'select',
    options: opts(['0', '1', '2', '4', '8']),
    toClass: (v) => (v ? (v === '1' ? 'border' : `border-${v}`) : null) },
  { id: 'borderColor', label: 'Kenarlık rengi', group: 'border', type: 'color', options: COLOR_OPTIONS,
    arbitraryPrefix: 'border', toClass: withArbitrary('border', (v) => `border-${v}`) },

  // Effects
  { id: 'shadow', label: 'Gölge', group: 'effects', type: 'select',
    options: opts(['none', 'sm', 'md', 'lg', 'xl', '2xl']),
    toClass: (v) => (v ? (v === 'md' ? 'shadow' : `shadow-${v}`) : null) },
  { id: 'opacity', label: 'Saydamlık', group: 'effects', type: 'select',
    options: opts(['0', '25', '50', '75', '90', '100']),
    toClass: (v) => (v ? `opacity-${v}` : null) },
  { id: 'blur', label: 'Bulanıklık', group: 'effects', type: 'select',
    options: opts(['none', 'sm', 'md', 'lg', 'xl']),
    toClass: (v) => (v ? (v === 'md' ? 'blur' : `blur-${v}`) : null) },
  // Hover/focus pairs: set these on the Hover state and add a transition so the
  // change animates instead of snapping.
  { id: 'scale', label: 'Ölçek (scale)', group: 'effects', type: 'select',
    options: opts(['90', '95', '100', '105', '110', '125']),
    toClass: (v) => (v ? `scale-${v}` : null) },
  { id: 'rotate', label: 'Döndürme', group: 'effects', type: 'select',
    options: opts(['0', '1', '2', '3', '6', '12', '45', '90', '180']),
    toClass: (v) => (v ? `rotate-${v}` : null) },
  // Multi-class value: `transition-all` + `duration-*` (emitters split on
  // spaces — see StyleControl.toClass).
  { id: 'transition', label: 'Geçiş süresi', group: 'effects', type: 'select',
    options: [
      { label: '—', value: '' },
      { label: '75ms', value: '75' },
      { label: '150ms', value: '150' },
      { label: '300ms', value: '300' },
      { label: '500ms', value: '500' },
      { label: '700ms', value: '700' },
    ],
    toClass: (v) => (v ? `transition-all duration-${v}` : null) },
  // Entrance animations — custom (non-Tailwind) classes; CSS lives in
  // `animationCss.ts` (published pages) and mirrored at the end of `styles.css`
  // (editor canvas). No arbitraryPrefix: custom values are meaningless here.
  { id: 'anim', label: 'Giriş Animasyonu', group: 'effects', type: 'select',
    options: [
      { label: 'Yok', value: '' },
      { label: 'Belirme', value: 'fade' },
      { label: 'Yukarı Süzülme', value: 'fade-up' },
      { label: 'Aşağı Süzülme', value: 'fade-down' },
      { label: 'Büyüme', value: 'zoom-in' },
    ],
    toClass: (v) => (v ? `tecof-anim-${v}` : null) },
  { id: 'animDelay', label: 'Animasyon Gecikmesi', group: 'effects', type: 'select',
    options: [
      { label: 'Yok', value: '' },
      { label: '100ms', value: '100' },
      { label: '200ms', value: '200' },
      { label: '300ms', value: '300' },
      { label: '500ms', value: '500' },
    ],
    toClass: (v) => (v ? `tecof-anim-delay-${v}` : null) },
  // Scroll interactions — custom classes driven by scrollEffects.ts at runtime
  // (IntersectionObserver + parallax). CSS in animationCss.ts (published) +
  // mirrored in styles.css (editor canvas). Unlike `anim` (plays on load),
  // `reveal` triggers when the element scrolls into view.
  { id: 'reveal', label: 'Görününce (scroll)', group: 'effects', type: 'select',
    options: [
      { label: 'Yok', value: '' },
      { label: 'Belirme', value: 'fade' },
      { label: 'Yukarı', value: 'up' },
      { label: 'Aşağı', value: 'down' },
      { label: 'Soldan', value: 'left' },
      { label: 'Sağdan', value: 'right' },
      { label: 'Büyüme', value: 'zoom' },
    ],
    toClass: (v) => (!v ? null : v === 'fade' ? 'tecof-reveal' : `tecof-reveal tecof-reveal-${v}`) },
  { id: 'parallax', label: 'Parallax (scroll)', group: 'effects', type: 'select',
    options: [
      { label: 'Yok', value: '' },
      { label: 'Yavaş', value: 'slow' },
      { label: 'Orta', value: 'md' },
      { label: 'Hızlı', value: 'fast' },
    ],
    toClass: (v) => (v ? `tecof-parallax tecof-parallax-${v}` : null) },
];

/** Fast lookup: control id → control. */
export const CONTROL_BY_ID: Record<string, StyleControl> = Object.fromEntries(
  STYLE_CONTROLS.map((c) => [c.id, c])
);

export const GROUP_LABELS: Record<StyleGroup, string> = {
  layout: 'Yerleşim',
  spacing: 'Boşluk',
  sizing: 'Boyut',
  typography: 'Tipografi',
  background: 'Arka Plan',
  border: 'Kenarlık',
  effects: 'Efektler',
};

/** Breakpoint → Tailwind prefix. */
export const BP_PREFIX: Record<string, string> = { base: '', sm: 'sm:', md: 'md:', lg: 'lg:', xl: 'xl:' };
/** State → Tailwind prefix. */
export const STATE_PREFIX: Record<string, string> = { hover: 'hover:', focus: 'focus:', active: 'active:' };

/**
 * Editor-emitted utilities carry Tailwind v4's important marker (`p-4!`) so
 * they always beat the classes a component bakes into its own markup.
 * tailwind-merge can only resolve conflicts between classes that meet in the
 * SAME `cn()` call — a theme's internal `text-[13px]` vs. the editor's
 * `text-sm` end up in the same class attribute with equal specificity, where
 * plain CSS source order (not className order) decides. The `!` marker settles
 * it deterministically in the editor's favour.
 *
 * Custom (non-Tailwind) classes such as the `tecof-anim-*` set are exempt:
 * a literal bang would break their selectors.
 */
export const importantClass = (cls: string): string =>
  cls.startsWith('tecof-') ? cls : `${cls}!`;

/**
 * Every class the editor can ever emit (token × control × variant prefix).
 * Feed this into the host Tailwind config `safelist` so production CSS always
 * contains the classes chosen in the editor.
 */
export function getSafelist(): string[] {
  // Every breakpoint × state combination the editor can emit, including
  // responsive-state variants like `md:hover:` (breakpoint prefix first).
  const bpPrefixes = ['', ...Object.values(BP_PREFIX).filter(Boolean)];
  const statePrefixes = ['', ...Object.values(STATE_PREFIX)];
  const prefixes = new Set<string>();
  for (const bp of bpPrefixes) {
    for (const state of statePrefixes) prefixes.add(bp + state);
  }

  const set = new Set<string>();
  for (const control of STYLE_CONTROLS) {
    for (const opt of control.options) {
      const cls = control.toClass(opt.value);
      if (!cls) continue;
      // Mirror compileStyles: split multi-class values, important-mark each.
      for (const single of cls.split(' ')) {
        for (const prefix of prefixes) set.add(prefix + importantClass(single));
      }
    }
  }
  return Array.from(set);
}
