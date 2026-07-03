/**
 * Runtime CSS generator for the editor's style tokens.
 *
 * WHY THIS EXISTS: compiled style classes (`p-4!`, `md:hover:bg-red-500!`)
 * only ever land in a `class` attribute — the CSS behind them used to depend
 * on the HOST's Tailwind build having safelisted every editor token. In
 * practice hosts run different Tailwind majors (the studio app is v3, themes
 * are v4) and never wire the safelist, so the classes had no CSS anywhere and
 * the style editor appeared completely dead.
 *
 * Instead of depending on host builds, we generate the CSS ourselves: the
 * token model is finite and its semantics are known, so every emitted class
 * maps deterministically to declarations. `generateStyleCss` turns the set of
 * classes used by a document into a stylesheet string that is injected
 *   - into the canvas iframe while editing (CanvasStyleInjector), and
 *   - into published pages by TecofRender.
 * Every declaration carries `!important` so editor styles beat the classes
 * components bake into their own markup, regardless of source order.
 */

import { STYLE_CONTROLS, isArbitrary, arbitraryRaw } from './tokens';
import { parsePaletteToken, tailwindSwatch } from './palette';

type Declaration = [property: string, value: string];

/* ─── Scales (mirroring Tailwind's defaults for the tokens we expose) ─── */

const REM = (n: number) => `${n * 0.25}rem`;

const FONT_SIZES: Record<string, [size: string, lineHeight: string]> = {
  xs: ['0.75rem', '1rem'],
  sm: ['0.875rem', '1.25rem'],
  base: ['1rem', '1.5rem'],
  lg: ['1.125rem', '1.75rem'],
  xl: ['1.25rem', '1.75rem'],
  '2xl': ['1.5rem', '2rem'],
  '3xl': ['1.875rem', '2.25rem'],
  '4xl': ['2.25rem', '2.5rem'],
  '5xl': ['3rem', '1'],
};

const FONT_WEIGHTS: Record<string, string> = {
  normal: '400', medium: '500', semibold: '600', bold: '700', extrabold: '800',
};

const LEADING: Record<string, string> = {
  none: '1', tight: '1.25', snug: '1.375', normal: '1.5', relaxed: '1.625', loose: '2',
};

const RADII: Record<string, string> = {
  none: '0', sm: '0.125rem', md: '0.25rem', lg: '0.5rem', xl: '0.75rem',
  '2xl': '1rem', '3xl': '1.5rem', full: '9999px',
};

const SHADOWS: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};

const MAX_WIDTHS: Record<string, string> = {
  none: 'none', sm: '24rem', md: '28rem', lg: '32rem', xl: '36rem',
  '2xl': '42rem', '4xl': '56rem', '6xl': '72rem', full: '100%',
};

const FRACTIONS: Record<string, string> = {
  '1/2': '50%', '1/3': '33.333333%', '2/3': '66.666667%', '1/4': '25%', '3/4': '75%',
};

const JUSTIFY: Record<string, string> = {
  start: 'flex-start', center: 'center', end: 'flex-end',
  between: 'space-between', around: 'space-around', evenly: 'space-evenly',
};

const ITEMS: Record<string, string> = {
  start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch', baseline: 'baseline',
};

/** Resolve a color TOKEN (not an arbitrary value) to a CSS color. */
const colorValue = (token: string): string | null => {
  if (token === 'transparent') return 'transparent';
  if (token === 'white') return '#ffffff';
  if (token === 'black') return '#000000';
  const brand = /^primary-(\d{2,3})$/.exec(token);
  if (brand) {
    // Host @theme may define --color-primary-*; the editor palette always
    // defines --tecof-primary-* as fallback.
    return `var(--color-primary-${brand[1]}, var(--tecof-primary-${brand[1]}))`;
  }
  const palette = parsePaletteToken(token);
  if (palette) return tailwindSwatch(palette.hue.name, palette.shade);
  return null;
};

/** Spacing token → length. Presets are ×0.25rem; arbitrary passes through. */
const spaceValue = (token: string): string | null => {
  if (isArbitrary(token)) return arbitraryRaw(token);
  const n = Number(token);
  return Number.isFinite(n) ? REM(n) : null;
};

/**
 * Declarations for one control's stored VALUE (preset token or bracket-wrapped
 * arbitrary). Returns null when the value doesn't resolve (class is skipped).
 */
const declarationsFor = (controlId: string, value: string): Declaration[] | null => {
  const raw = isArbitrary(value) ? arbitraryRaw(value) : null;

  switch (controlId) {
    case 'display':
      return [['display', value === 'hidden' ? 'none' : value]];
    case 'flexDir':
      return [['flex-direction', value === 'col' ? 'column' : 'row']];
    case 'justify':
      return JUSTIFY[value] ? [['justify-content', JUSTIFY[value]]] : null;
    case 'items':
      return ITEMS[value] ? [['align-items', ITEMS[value]]] : null;
    case 'alignSelf':
      return [['align-self', value === 'start' ? 'flex-start' : value === 'end' ? 'flex-end' : value]];
    case 'gap': {
      const v = spaceValue(value);
      return v ? [['gap', v]] : null;
    }

    case 'p': {
      const v = spaceValue(value);
      return v ? [['padding', v]] : null;
    }
    case 'px': {
      const v = spaceValue(value);
      return v ? [['padding-left', v], ['padding-right', v]] : null;
    }
    case 'py': {
      const v = spaceValue(value);
      return v ? [['padding-top', v], ['padding-bottom', v]] : null;
    }
    case 'm': {
      const v = spaceValue(value);
      return v ? [['margin', v]] : null;
    }
    case 'mx': {
      const v = spaceValue(value);
      return v ? [['margin-left', v], ['margin-right', v]] : null;
    }
    case 'my': {
      const v = spaceValue(value);
      return v ? [['margin-top', v], ['margin-bottom', v]] : null;
    }
    case 'marginAlign':
      switch (value) {
        case 'auto': return [['margin', 'auto']];
        case 'l-auto': return [['margin-left', 'auto']];
        case 'r-auto': return [['margin-right', 'auto']];
        case 'x-auto': return [['margin-left', 'auto'], ['margin-right', 'auto']];
        default: return null;
      }

    case 'w': {
      if (raw) return [['width', raw]];
      if (value === 'auto') return [['width', 'auto']];
      if (value === 'full') return [['width', '100%']];
      if (value === 'screen') return [['width', '100vw']];
      if (value === 'fit') return [['width', 'fit-content']];
      return FRACTIONS[value] ? [['width', FRACTIONS[value]]] : null;
    }
    case 'h': {
      if (raw) return [['height', raw]];
      if (value === 'auto') return [['height', 'auto']];
      if (value === 'full') return [['height', '100%']];
      if (value === 'screen') return [['height', '100vh']];
      if (value === 'fit') return [['height', 'fit-content']];
      return null;
    }
    case 'maxW': {
      if (raw) return [['max-width', raw]];
      return MAX_WIDTHS[value] ? [['max-width', MAX_WIDTHS[value]]] : null;
    }

    case 'bg': {
      const v = raw ?? colorValue(value);
      return v ? [['background-color', v]] : null;
    }
    case 'text': {
      const v = raw ?? colorValue(value);
      return v ? [['color', v]] : null;
    }
    case 'borderColor': {
      const v = raw ?? colorValue(value);
      return v ? [['border-color', v]] : null;
    }

    case 'fontSize': {
      const v = FONT_SIZES[value];
      return v ? [['font-size', v[0]], ['line-height', v[1]]] : null;
    }
    case 'fontWeight':
      return FONT_WEIGHTS[value] ? [['font-weight', FONT_WEIGHTS[value]]] : null;
    case 'align':
      return [['text-align', value]];
    case 'leading':
      return LEADING[value] ? [['line-height', LEADING[value]]] : null;

    case 'radius':
      return RADII[value] ? [['border-radius', RADII[value]]] : null;
    case 'border':
      // Explicit border-style: the generated sheet must not depend on the
      // host's Tailwind preflight defaults.
      return [['border-width', `${value}px`], ['border-style', 'solid']];
    case 'shadow':
      return SHADOWS[value] ? [['box-shadow', SHADOWS[value]]] : null;
    case 'opacity': {
      const n = Number(value);
      return Number.isFinite(n) ? [['opacity', String(n / 100)]] : null;
    }

    default:
      // anim / animDelay: their CSS ships separately (animationCss.ts).
      return null;
  }
};

/* ─── class → declarations lookup ─── */

interface UtilityInfo {
  controlId: string;
  value: string;
}

/** Preset lookup: emitted class (without prefixes/important) → control+value. */
const PRESET_BY_CLASS: Record<string, UtilityInfo> = {};
for (const control of STYLE_CONTROLS) {
  for (const opt of control.options) {
    if (!opt.value) continue;
    const cls = control.toClass(opt.value);
    if (cls) PRESET_BY_CLASS[cls] = { controlId: control.id, value: opt.value };
  }
}

/** Arbitrary lookup: utilities shaped `<prefix>-[raw]`, longest prefix first. */
const ARBITRARY_PREFIXES = STYLE_CONTROLS
  .filter((c) => c.arbitraryPrefix)
  .map((c) => ({ prefix: `${c.arbitraryPrefix}-[`, controlId: c.id }))
  .sort((a, b) => b.prefix.length - a.prefix.length);

const resolveUtility = (utility: string): UtilityInfo | null => {
  const preset = PRESET_BY_CLASS[utility];
  if (preset) return preset;
  for (const { prefix, controlId } of ARBITRARY_PREFIXES) {
    if (utility.startsWith(prefix) && utility.endsWith(']')) {
      return { controlId, value: utility.slice(prefix.length - 1) };
    }
  }
  return null;
};

/* ─── Selector / rule assembly ─── */

const MEDIA: Record<string, string> = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
};

const PSEUDO: Record<string, string> = {
  hover: ':hover', focus: ':focus', active: ':active',
};

/** Escape a class token for use in a CSS selector (`p-4!` → `p-4\!`). */
const escapeSelector = (cls: string): string =>
  cls.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);

interface ParsedClass {
  media: string | null;
  pseudo: string | null;
  utility: string;
}

const parseClass = (cls: string): ParsedClass | null => {
  const parts = cls.split(':');
  let media: string | null = null;
  let pseudo: string | null = null;
  let index = 0;
  while (index < parts.length - 1) {
    const part = parts[index];
    if (MEDIA[part] && media === null) {
      media = MEDIA[part];
      index += 1;
      continue;
    }
    if (PSEUDO[part] && pseudo === null) {
      pseudo = PSEUDO[part];
      index += 1;
      continue;
    }
    return null; // unknown variant — not one of ours
  }
  let utility = parts.slice(index).join(':');
  if (utility.endsWith('!')) utility = utility.slice(0, -1);
  return utility ? { media, pseudo, utility } : null;
};

/**
 * Build a stylesheet for the given class list. Unknown classes (component
 * classes, animation classes, anything not ours) are skipped silently.
 */
export function generateStyleCss(classes: readonly string[]): string {
  const plain: string[] = [];
  const byMedia = new Map<string, string[]>();
  const seen = new Set<string>();

  for (const cls of classes) {
    if (!cls || seen.has(cls)) continue;
    seen.add(cls);

    const parsed = parseClass(cls);
    if (!parsed) continue;
    const info = resolveUtility(parsed.utility);
    if (!info) continue;
    const decls = declarationsFor(info.controlId, info.value);
    if (!decls || decls.length === 0) continue;

    const selector = `.${escapeSelector(cls)}${parsed.pseudo ?? ''}`;
    const body = decls.map(([prop, value]) => `${prop}: ${value} !important;`).join(' ');
    const rule = `${selector} { ${body} }`;

    if (parsed.media) {
      const bucket = byMedia.get(parsed.media) ?? [];
      bucket.push(rule);
      byMedia.set(parsed.media, bucket);
    } else {
      plain.push(rule);
    }
  }

  const chunks = [...plain];
  for (const [media, rules] of byMedia) {
    chunks.push(`@media ${media} { ${rules.join(' ')} }`);
  }
  return chunks.join('\n');
}
