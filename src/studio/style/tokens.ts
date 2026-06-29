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
}

/* ─── Scales ─── */

const SPACE = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24'];
const spaceOptions = (): StyleControlOption[] => SPACE.map((v) => ({ label: v, value: v }));

const COLOR_OPTIONS: StyleControlOption[] = [
  { label: 'Yok', value: '' },
  { label: 'Şeffaf', value: 'transparent', swatch: 'transparent' },
  { label: 'Beyaz', value: 'white', swatch: '#ffffff' },
  { label: 'Siyah', value: 'black', swatch: '#000000' },
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
    options: spaceOptions(), toClass: (v) => (v ? `gap-${v}` : null) },

  // Spacing — padding (shorthand + axis + per-side)
  { id: 'p', label: 'Padding', group: 'spacing', type: 'space', options: spaceOptions(), toClass: (v) => (v ? `p-${v}` : null) },
  { id: 'px', label: 'Padding X', group: 'spacing', type: 'space', options: spaceOptions(), toClass: (v) => (v ? `px-${v}` : null) },
  { id: 'py', label: 'Padding Y', group: 'spacing', type: 'space', options: spaceOptions(), toClass: (v) => (v ? `py-${v}` : null) },
  { id: 'pt', label: 'Padding Üst', group: 'spacing', type: 'space', options: spaceOptions(), toClass: (v) => (v ? `pt-${v}` : null) },
  { id: 'pr', label: 'Padding Sağ', group: 'spacing', type: 'space', options: spaceOptions(), toClass: (v) => (v ? `pr-${v}` : null) },
  { id: 'pb', label: 'Padding Alt', group: 'spacing', type: 'space', options: spaceOptions(), toClass: (v) => (v ? `pb-${v}` : null) },
  { id: 'pl', label: 'Padding Sol', group: 'spacing', type: 'space', options: spaceOptions(), toClass: (v) => (v ? `pl-${v}` : null) },
  // Spacing — margin (shorthand + axis + per-side)
  { id: 'm', label: 'Margin', group: 'spacing', type: 'space', options: spaceOptions(), toClass: (v) => (v ? `m-${v}` : null) },
  { id: 'mx', label: 'Margin X', group: 'spacing', type: 'space', options: spaceOptions(), toClass: (v) => (v ? `mx-${v}` : null) },
  { id: 'my', label: 'Margin Y', group: 'spacing', type: 'space', options: spaceOptions(), toClass: (v) => (v ? `my-${v}` : null) },
  { id: 'mt', label: 'Margin Üst', group: 'spacing', type: 'space', options: spaceOptions(), toClass: (v) => (v ? `mt-${v}` : null) },
  { id: 'mr', label: 'Margin Sağ', group: 'spacing', type: 'space', options: spaceOptions(), toClass: (v) => (v ? `mr-${v}` : null) },
  { id: 'mb', label: 'Margin Alt', group: 'spacing', type: 'space', options: spaceOptions(), toClass: (v) => (v ? `mb-${v}` : null) },
  { id: 'ml', label: 'Margin Sol', group: 'spacing', type: 'space', options: spaceOptions(), toClass: (v) => (v ? `ml-${v}` : null) },

  // Sizing
  { id: 'w', label: 'Genişlik', group: 'sizing', type: 'select',
    options: opts(['auto', 'full', 'screen', '1/2', '1/3', '2/3', '1/4', '3/4', 'fit']),
    toClass: (v) => (v ? `w-${v}` : null) },
  { id: 'h', label: 'Yükseklik', group: 'sizing', type: 'select',
    options: opts(['auto', 'full', 'screen', 'fit']),
    toClass: (v) => (v ? `h-${v}` : null) },
  { id: 'maxW', label: 'Maks. genişlik', group: 'sizing', type: 'select',
    options: opts(['none', 'sm', 'md', 'lg', 'xl', '2xl', '4xl', '6xl', 'full']),
    toClass: (v) => (v ? `max-w-${v}` : null) },

  // Background
  { id: 'bg', label: 'Arka plan', group: 'background', type: 'color', options: COLOR_OPTIONS,
    toClass: (v) => (v ? `bg-${v}` : null) },

  // Typography
  { id: 'text', label: 'Metin rengi', group: 'typography', type: 'color', options: COLOR_OPTIONS,
    toClass: (v) => (v ? `text-${v}` : null) },
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
    toClass: (v) => (v ? `border-${v}` : null) },

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
  const prefixes = ['', ...Object.values(BP_PREFIX).filter(Boolean), ...Object.values(STATE_PREFIX)];
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
