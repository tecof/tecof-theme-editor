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

export type StyleGroup = 'layout' | 'spacing' | 'sizing' | 'typography' | 'background' | 'border' | 'effects';
export type StyleControlType = 'segment' | 'select' | 'color' | 'space';

export interface StyleControlOption {
  label: string;
  value: string;
  /** Optional CSS color for color-swatch rendering in the UI. */
  swatch?: string;
}

export interface StyleControl {
  id: string;
  label: string;
  group: StyleGroup;
  type: StyleControlType;
  options: StyleControlOption[];
  /** Token value → Tailwind class (or null to emit nothing). */
  toClass: (value: string) => string | null;
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

const COLOR_OPTIONS: StyleControlOption[] = [
  { label: 'Yok', value: '' },
  { label: 'Şeffaf', value: 'transparent', swatch: 'transparent' },
  { label: 'Beyaz', value: 'white', swatch: '#ffffff' },
  { label: 'Siyah', value: 'black', swatch: '#000000' },
  // Live theme colors (host --theme-color-* variables)
  ...THEME_COLOR_OPTIONS,
  // Brand palette (Tailwind v4 @theme: --color-primary-*)
  ...['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'].map((s) => ({
    label: `Primary ${s}`,
    value: `primary-${s}`,
    swatch: `var(--tecof-primary-${s})`,
  })),
  // A few neutrals (Tailwind defaults)
  { label: 'Zinc 100', value: 'zinc-100', swatch: '#f4f4f5' },
  { label: 'Zinc 300', value: 'zinc-300', swatch: '#d4d4d8' },
  { label: 'Zinc 500', value: 'zinc-500', swatch: '#71717a' },
  { label: 'Zinc 700', value: 'zinc-700', swatch: '#3f3f46' },
  { label: 'Zinc 900', value: 'zinc-900', swatch: '#18181b' },
];

const opts = (values: string[], withNone = true): StyleControlOption[] => [
  ...(withNone ? [{ label: '—', value: '' }] : []),
  ...values.map((v) => ({ label: v, value: v })),
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
  { id: 'gap', label: 'Boşluk (gap)', group: 'layout', type: 'space',
    options: spaceOptions(), arbitraryPrefix: 'gap', toClass: withArbitrary('gap', (v) => `gap-${v}`) },
  { id: 'alignSelf', label: 'Bireysel Hiza (self)', group: 'layout', type: 'select',
    options: opts(['auto', 'start', 'center', 'end', 'stretch']),
    toClass: (v) => (v ? `self-${v}` : null) },

  // Spacing — padding
  { id: 'p', label: 'Padding', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'p', toClass: withArbitrary('p', (v) => `p-${v}`) },
  { id: 'px', label: 'Padding X', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'px', toClass: withArbitrary('px', (v) => `px-${v}`) },
  { id: 'py', label: 'Padding Y', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'py', toClass: withArbitrary('py', (v) => `py-${v}`) },
  // Spacing — margin
  { id: 'm', label: 'Margin', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'm', toClass: withArbitrary('m', (v) => `m-${v}`) },
  { id: 'mx', label: 'Margin X', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'mx', toClass: withArbitrary('mx', (v) => `mx-${v}`) },
  { id: 'my', label: 'Margin Y', group: 'spacing', type: 'space', options: spaceOptions(), arbitraryPrefix: 'my', toClass: withArbitrary('my', (v) => `my-${v}`) },
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

  // Typography
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

  // Border
  { id: 'radius', label: 'Köşe yarıçapı', group: 'border', type: 'select',
    options: opts(['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full']),
    toClass: (v) => (v ? (v === 'md' ? 'rounded' : `rounded-${v}`) : null) },
  { id: 'border', label: 'Kenarlık', group: 'border', type: 'select',
    options: opts(['0', '2', '4', '8']),
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
      for (const prefix of prefixes) set.add(prefix + cls);
    }
  }
  return Array.from(set);
}
