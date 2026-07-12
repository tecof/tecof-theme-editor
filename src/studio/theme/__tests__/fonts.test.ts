import { describe, it, expect } from 'vitest';
import {
  BUILTIN_FONTS,
  getBuiltinFont,
  googleFontsHref,
  customFontFaceCss,
  themeFontVarLines,
  listThemeFonts,
  findFontByStack,
  fontIdFromFamily,
  fontIdFromVarToken,
} from '../fonts';
import { getDefaultTheme } from '../../../utils';
import type { CustomFont, ThemeConfig } from '../../../types';

const customFont: CustomFont = { id: 'brand-sans', family: 'Brand Sans', src: 'https://cdn/x.woff2', format: 'woff2' };

describe('googleFontsHref', () => {
  it('builds a combined css2 url and encodes spaces as +', () => {
    const href = googleFontsHref(['inter', 'open-sans']);
    expect(href).toContain('https://fonts.googleapis.com/css2?');
    expect(href).toContain('family=Inter:wght@400;500;600;700');
    expect(href).toContain('family=Open+Sans:wght@400;500;600;700');
    expect(href).toContain('&display=swap');
  });

  it('honours a custom weight set (sorted, deduped)', () => {
    expect(googleFontsHref(['inter'], [600, 400, 400])).toContain('Inter:wght@400;600');
  });

  it('skips system/non-google ids and returns null when nothing loads', () => {
    expect(googleFontsHref(['system', 'georgia'])).toBeNull();
    expect(googleFontsHref([])).toBeNull();
    expect(googleFontsHref(['does-not-exist'])).toBeNull();
  });
});

describe('customFontFaceCss', () => {
  it('emits an @font-face with format + defaults', () => {
    const css = customFontFaceCss([customFont]);
    expect(css).toContain("@font-face");
    expect(css).toContain("font-family: 'Brand Sans'");
    expect(css).toContain("src: url('https://cdn/x.woff2') format('woff2')");
    expect(css).toContain('font-weight: 400');
    expect(css).toContain('font-display: swap');
  });

  it('is empty for no fonts and skips entries missing family/src', () => {
    expect(customFontFaceCss([])).toBe('');
    expect(customFontFaceCss([{ id: 'x', family: '', src: 's' }])).toBe('');
  });
});

describe('themeFontVarLines', () => {
  it('emits --font-<id> for in-use builtin + custom fonts only', () => {
    const theme: ThemeConfig = { ...getDefaultTheme(), fonts: ['inter', 'system'], customFonts: [customFont] };
    const lines = themeFontVarLines(theme).join('\n');
    expect(lines).toContain('--font-inter:');
    expect(lines).toContain('--font-system:'); // system is a builtin (no google, but still a var)
    expect(lines).toContain("--font-brand-sans: 'Brand Sans'");
    expect(lines).not.toContain('--font-roboto'); // not in theme.fonts
  });
});

describe('listThemeFonts / findFontByStack', () => {
  it('lists builtin + custom and round-trips a stack back to its font', () => {
    const fonts = listThemeFonts([customFont]);
    expect(fonts.some((f) => f.id === 'inter' && f.kind === 'builtin')).toBe(true);
    expect(fonts.some((f) => f.id === 'brand-sans' && f.kind === 'custom')).toBe(true);

    const inter = getBuiltinFont('inter')!;
    expect(findFontByStack(inter.stack)?.id).toBe('inter');
    expect(findFontByStack("'Brand Sans', system-ui, -apple-system, \"Segoe UI\", Roboto, sans-serif", [customFont])?.id).toBe('brand-sans');
    expect(findFontByStack('nope')).toBeUndefined();
  });
});

describe('fontIdFromFamily', () => {
  it('slugifies to a stable kebab id', () => {
    expect(fontIdFromFamily('Brand Sans')).toBe('brand-sans');
    expect(fontIdFromFamily('  Weird__Name!! ')).toBe('weird-name');
    expect(fontIdFromFamily('!!!')).toBe('font');
  });
});

describe('fontIdFromVarToken', () => {
  it('parses a per-node font token back to its id', () => {
    expect(fontIdFromVarToken('[var(--font-inter)]')).toBe('inter');
    expect(fontIdFromVarToken('[var(--font-brand-sans)]')).toBe('brand-sans');
  });
  it('rejects non-font tokens', () => {
    expect(fontIdFromVarToken('')).toBeNull();
    expect(fontIdFromVarToken(undefined)).toBeNull();
    expect(fontIdFromVarToken('[var(--theme-color-primary)]')).toBeNull();
    expect(fontIdFromVarToken('inter')).toBeNull();
  });
});

describe('registry integrity', () => {
  it('every builtin has a non-empty stack and unique id', () => {
    const ids = new Set<string>();
    for (const f of BUILTIN_FONTS) {
      expect(f.stack.length).toBeGreaterThan(0);
      expect(ids.has(f.id)).toBe(false);
      ids.add(f.id);
    }
  });
});
