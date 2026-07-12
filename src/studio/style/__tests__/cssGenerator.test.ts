import { describe, it, expect } from 'vitest';
import { generateStyleCss } from '../cssGenerator';

describe('generateStyleCss', () => {
  it('generates spacing declarations from preset tokens', () => {
    const css = generateStyleCss(['p-4!']);
    expect(css).toContain('.p-4\\! { padding: 1rem !important; }');
  });

  it('expands axis spacing into both sides', () => {
    const css = generateStyleCss(['px-4!', 'my-2!']);
    expect(css).toContain('padding-left: 1rem !important; padding-right: 1rem !important;');
    expect(css).toContain('margin-top: 0.5rem !important; margin-bottom: 0.5rem !important;');
  });

  it('resolves Tailwind palette colors with hex fallback', () => {
    const css = generateStyleCss(['bg-red-500!']);
    expect(css).toContain('background-color: var(--color-red-500, #ef4444) !important;');
  });

  it('resolves brand colors through theme variables', () => {
    const css = generateStyleCss(['bg-primary-600!']);
    expect(css).toContain('var(--color-primary-600, var(--tecof-primary-600))');
  });

  it('passes arbitrary values through', () => {
    expect(generateStyleCss(['p-[10px]!'])).toContain('padding: 10px !important;');
    expect(generateStyleCss(['bg-[#ff0000]!'])).toContain('background-color: #ff0000 !important;');
    expect(generateStyleCss(['bg-[var(--theme-color-primary)]!'])).toContain(
      'background-color: var(--theme-color-primary) !important;'
    );
  });

  it('wraps breakpoint-prefixed classes in media queries', () => {
    const css = generateStyleCss(['md:p-8!']);
    expect(css).toContain('@media (min-width: 768px)');
    expect(css).toContain('.md\\:p-8\\! { padding: 2rem !important; }');
  });

  it('appends pseudo-classes for state variants', () => {
    const css = generateStyleCss(['hover:bg-red-500!']);
    expect(css).toContain('.hover\\:bg-red-500\\!:hover {');
  });

  it('handles combined breakpoint + state variants', () => {
    const css = generateStyleCss(['md:hover:bg-red-500!']);
    expect(css).toContain('@media (min-width: 768px)');
    expect(css).toContain('.md\\:hover\\:bg-red-500\\!:hover {');
  });

  it('distinguishes the text-* family (color / size / align)', () => {
    expect(generateStyleCss(['text-red-500!'])).toContain('color: var(--color-red-500, #ef4444)');
    expect(generateStyleCss(['text-sm!'])).toContain('font-size: 0.875rem !important; line-height: 1.25rem !important;');
    expect(generateStyleCss(['text-center!'])).toContain('text-align: center !important;');
  });

  it('handles special-cased presets (rounded, border, shadow, hidden, fractions)', () => {
    expect(generateStyleCss(['rounded!'])).toContain('border-radius: 0.25rem !important;');
    expect(generateStyleCss(['border!'])).toContain('border-width: 1px !important; border-style: solid !important;');
    expect(generateStyleCss(['shadow!'])).toContain('box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1)');
    expect(generateStyleCss(['hidden!'])).toContain('display: none !important;');
    expect(generateStyleCss(['w-1/2!'])).toContain('width: 50% !important;');
  });

  it('skips unknown / non-token classes silently', () => {
    expect(generateStyleCss(['tecof-anim-fade-up', 'card', 'unknown-thing', ''])).toBe('');
  });

  it('de-duplicates repeated classes', () => {
    const css = generateStyleCss(['p-4!', 'p-4!']);
    expect(css.match(/padding: 1rem/g)).toHaveLength(1);
  });

  it('resolves per-node font-family to its CSS variable (builtin preset + custom arbitrary)', () => {
    // Builtin font — a static option in the fontFamily control.
    expect(generateStyleCss(['font-[var(--font-inter)]!']))
      .toContain('font-family: var(--font-inter) !important;');
    // Custom (uploaded) font — resolves through the `font-[` arbitrary path.
    expect(generateStyleCss(['font-[var(--font-brand-sans)]!']))
      .toContain('font-family: var(--font-brand-sans) !important;');
  });

  it('keeps font-weight (font-*) distinct from font-family (font-[…])', () => {
    expect(generateStyleCss(['font-bold!'])).toContain('font-weight: 700 !important;');
  });
});
