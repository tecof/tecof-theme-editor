import { describe, it, expect } from 'vitest';
import { compileStyles, mergeClassName, collectDocumentClasses } from '../compileStyles';
import { getSafelist } from '../tokens';
import { TAILWIND_PALETTE, TAILWIND_SHADES, parsePaletteToken, tailwindSwatch } from '../palette';
import type { NodeStyles } from '../types';

describe('compileStyles', () => {
  it('returns empty string for empty/nullish input', () => {
    expect(compileStyles(null)).toBe('');
    expect(compileStyles(undefined)).toBe('');
    expect(compileStyles({})).toBe('');
  });

  it('compiles base layer tokens to classes', () => {
    const styles: NodeStyles = { base: { p: '4', bg: 'primary-600', radius: 'lg' } };
    expect(compileStyles(styles)).toBe('p-4 bg-primary-600 rounded-lg');
  });

  it('prefixes responsive breakpoints', () => {
    const styles: NodeStyles = { base: { p: '4' }, md: { p: '8' }, lg: { p: '12' } };
    expect(compileStyles(styles)).toBe('p-4 md:p-8 lg:p-12');
  });

  it('prefixes interaction states', () => {
    const styles: NodeStyles = { base: { bg: 'primary-600' }, states: { hover: { bg: 'primary-700' } } };
    expect(compileStyles(styles)).toBe('bg-primary-600 hover:bg-primary-700');
  });

  it('handles special-cased tokens (rounded/shadow base, display identity)', () => {
    expect(compileStyles({ base: { radius: 'md' } })).toBe('rounded');
    expect(compileStyles({ base: { shadow: 'md' } })).toBe('shadow');
    expect(compileStyles({ base: { display: 'flex', flexDir: 'col' } })).toBe('flex flex-col');
  });

  it('skips empty token values', () => {
    expect(compileStyles({ base: { p: '', bg: 'primary-600' } })).toBe('bg-primary-600');
  });

  it('compiles arbitrary (custom) spacing values', () => {
    expect(compileStyles({ base: { p: '[10px]' } })).toBe('p-[10px]');
    expect(compileStyles({ base: { gap: '[2.5rem]' } })).toBe('gap-[2.5rem]');
  });

  it('compiles arbitrary color values', () => {
    expect(compileStyles({ base: { bg: '[#ff0000]' } })).toBe('bg-[#ff0000]');
    expect(compileStyles({ base: { text: '[#abc]' } })).toBe('text-[#abc]');
  });

  it('prefixes arbitrary values at breakpoints and states', () => {
    expect(compileStyles({ md: { bg: '[#abc]' } })).toBe('md:bg-[#abc]');
    expect(compileStyles({ states: { hover: { bg: '[#ff0000]' } } })).toBe('hover:bg-[#ff0000]');
    expect(compileStyles({ base: { p: '4' }, md: { p: '[10px]' } })).toBe('p-4 md:p-[10px]');
  });

  it('compiles breakpoint-scoped state keys (md:hover)', () => {
    expect(compileStyles({ states: { 'md:hover': { bg: 'primary-700' } } })).toBe('md:hover:bg-primary-700');
    expect(compileStyles({ states: { 'lg:focus': { text: '[#abc]' } } })).toBe('lg:focus:text-[#abc]');
    // Bare keys remain base-breakpoint (back-compat).
    expect(compileStyles({ states: { hover: { bg: 'primary-700' } } })).toBe('hover:bg-primary-700');
  });

  it('mixes presets and arbitrary values in one layer', () => {
    expect(compileStyles({ base: { p: '[10px]', bg: 'primary-600' } })).toBe('p-[10px] bg-primary-600');
  });

  it('mergeClassName joins author + style classes', () => {
    expect(mergeClassName('card', 'p-4 bg-primary-600')).toBe('card p-4 bg-primary-600');
    expect(mergeClassName(undefined, 'p-4')).toBe('p-4');
  });
});

describe('getSafelist', () => {
  it('includes base and prefixed variants of emitted classes', () => {
    const safelist = getSafelist();
    expect(safelist).toContain('bg-primary-600');
    expect(safelist).toContain('md:bg-primary-600');
    expect(safelist).toContain('hover:bg-primary-700');
    expect(safelist).toContain('p-4');
    expect(safelist).toContain('rounded'); // radius md special-case
    // No empty/null entries
    expect(safelist.every((c) => typeof c === 'string' && c.length > 0)).toBe(true);
  });

  it('includes responsive-state combinations (md:hover:)', () => {
    const safelist = getSafelist();
    expect(safelist).toContain('md:hover:bg-primary-600');
    expect(safelist).toContain('lg:focus:p-4');
  });

  it('includes the finite theme-color arbitrary classes', () => {
    const safelist = getSafelist();
    expect(safelist).toContain('bg-[var(--theme-color-primary)]');
    expect(safelist).toContain('text-[var(--theme-color-foreground)]');
    expect(safelist).toContain('md:bg-[var(--theme-color-primary)]');
  });

  it('includes the full Tailwind default palette for every color control', () => {
    const safelist = getSafelist();
    expect(safelist).toContain('bg-red-500');
    expect(safelist).toContain('text-sky-300');
    expect(safelist).toContain('border-stone-950');
    expect(safelist).toContain('hover:bg-rose-800');
    expect(safelist).toContain('md:hover:text-emerald-50');
  });

  it('includes the 1px border preset', () => {
    expect(getSafelist()).toContain('border');
  });
});

describe('Tailwind palette tokens', () => {
  it('compiles palette presets to standard Tailwind classes', () => {
    expect(compileStyles({ base: { bg: 'red-500', text: 'zinc-100', borderColor: 'sky-700' } })).toBe(
      'bg-red-500 text-zinc-100 border-sky-700'
    );
  });

  it('parsePaletteToken resolves hue + shade and rejects non-palette tokens', () => {
    expect(parsePaletteToken('red-500')?.hue.name).toBe('red');
    expect(parsePaletteToken('red-500')?.shade).toBe('500');
    expect(parsePaletteToken('primary-600')).toBeNull();
    expect(parsePaletteToken('white')).toBeNull();
    expect(parsePaletteToken('red-499')).toBeNull();
  });

  it('every hue defines all 11 shades as hex previews', () => {
    for (const hue of TAILWIND_PALETTE) {
      for (const shade of TAILWIND_SHADES) {
        expect(hue.shades[shade]).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it('tailwindSwatch prefers the live theme variable with a hex fallback', () => {
    expect(tailwindSwatch('red', '500')).toBe('var(--color-red-500, #ef4444)');
  });
});

describe('collectDocumentClasses', () => {
  it('collects style classes from root, content and zones (de-duplicated)', () => {
    const doc = {
      root: { props: { _tecofStyles: { base: { p: '4' } } } },
      content: [
        { props: { id: 'a', _tecofStyles: { base: { p: '[10px]', bg: 'primary-600' } } } },
        { props: { id: 'b' } }, // no styles → ignored
      ],
      zones: {
        'a:default': [
          { props: { id: 'c', _tecofStyles: { md: { bg: '[#ff0000]' }, base: { p: '4' } } } },
        ],
      },
    };
    const classes = collectDocumentClasses(doc);
    expect(classes).toContain('p-4');
    expect(classes).toContain('p-[10px]');
    expect(classes).toContain('bg-primary-600');
    expect(classes).toContain('md:bg-[#ff0000]');
    // `p-4` appears on root + zone node but is de-duplicated.
    expect(classes.filter((c) => c === 'p-4')).toHaveLength(1);
  });

  it('returns an empty array for null/empty documents', () => {
    expect(collectDocumentClasses(null)).toEqual([]);
    expect(collectDocumentClasses({})).toEqual([]);
  });
});
