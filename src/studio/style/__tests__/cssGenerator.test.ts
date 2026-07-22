import { describe, it, expect } from 'vitest';
import { generateStyleCss } from '../cssGenerator';
import { STYLE_CONTROLS, importantClass } from '../tokens';

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

  it('wraps breakpoint-prefixed classes in desktop-first (max-width) media queries', () => {
    const css = generateStyleCss(['md:p-8!']);
    expect(css).toContain('@media (max-width: 768px)');
    expect(css).toContain('.md\\:p-8\\! { padding: 2rem !important; }');
  });

  it('orders media blocks largest-first so the smaller breakpoint wins at narrow widths', () => {
    // Input lists sm before md; output must still emit md (larger) before sm
    // (smaller) so sm's rule wins where both max-width queries match (e.g. 375px).
    const css = generateStyleCss(['sm:p-4!', 'md:p-8!']);
    const mdIdx = css.indexOf('(max-width: 768px)');
    const smIdx = css.indexOf('(max-width: 640px)');
    expect(mdIdx).toBeGreaterThanOrEqual(0);
    expect(smIdx).toBeGreaterThan(mdIdx);
  });

  it('keeps the base layer outside any media query', () => {
    const css = generateStyleCss(['p-2!', 'md:p-8!']);
    const baseIdx = css.indexOf('.p-2\\!');
    const mediaIdx = css.indexOf('@media');
    expect(baseIdx).toBeGreaterThanOrEqual(0);
    expect(baseIdx).toBeLessThan(mediaIdx);
  });

  it('appends pseudo-classes for state variants', () => {
    const css = generateStyleCss(['hover:bg-red-500!']);
    expect(css).toContain('.hover\\:bg-red-500\\!:hover {');
  });

  it('handles combined breakpoint + state variants', () => {
    const css = generateStyleCss(['md:hover:bg-red-500!']);
    expect(css).toContain('@media (max-width: 768px)');
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

  it('emits per-side padding and margin', () => {
    expect(generateStyleCss(['pt-4!'])).toContain('padding-top: 1rem !important;');
    expect(generateStyleCss(['pb-2!'])).toContain('padding-bottom: 0.5rem !important;');
    expect(generateStyleCss(['pl-[10px]!'])).toContain('padding-left: 10px !important;');
    expect(generateStyleCss(['mr-8!'])).toContain('margin-right: 2rem !important;');
  });

  it('emits layout controls: position, z-index, overflow, flex-wrap', () => {
    expect(generateStyleCss(['relative!'])).toContain('position: relative !important;');
    expect(generateStyleCss(['z-10!'])).toContain('z-index: 10 !important;');
    expect(generateStyleCss(['overflow-hidden!'])).toContain('overflow: hidden !important;');
    expect(generateStyleCss(['flex-wrap!'])).toContain('flex-wrap: wrap !important;');
  });

  it('emits typography detail: tracking, transform, decoration', () => {
    expect(generateStyleCss(['tracking-wide!'])).toContain('letter-spacing: 0.025em !important;');
    expect(generateStyleCss(['uppercase!'])).toContain('text-transform: uppercase !important;');
    expect(generateStyleCss(['underline!'])).toContain('text-decoration-line: underline !important;');
    expect(generateStyleCss(['no-underline!'])).toContain('text-decoration-line: none !important;');
  });

  it('emits blur as a filter', () => {
    expect(generateStyleCss(['blur!'])).toContain('filter: blur(8px) !important;');
    expect(generateStyleCss(['blur-lg!'])).toContain('filter: blur(16px) !important;');
  });

  it('composes scale + rotate through CSS variables into one transform', () => {
    const css = generateStyleCss(['scale-110!', 'rotate-6!']);
    expect(css).toContain('--tc-scale: 1.1 !important;');
    expect(css).toContain('--tc-rotate: 6deg !important;');
    // Both classes emit the SAME composed transform referencing both vars, so
    // whichever rule wins source-order still applies scale AND rotate.
    expect(css).toContain('transform: rotate(var(--tc-rotate, 0)) scale(var(--tc-scale, 1)) !important;');
  });

  it('builds a gradient from direction + from/to stops', () => {
    const css = generateStyleCss(['bg-gradient-to-r!', 'from-primary-600!', 'to-[#ff0000]!']);
    expect(css).toContain(
      'linear-gradient(to right, var(--tc-grad-from, transparent), var(--tc-grad-to, transparent))'
    );
    expect(css).toContain('--tc-grad-from: var(--color-primary-600, var(--tecof-primary-600)) !important;');
    expect(css).toContain('--tc-grad-to: #ff0000 !important;');
  });

  it('wires the transition pair (transition-all + duration-N) via a duration var', () => {
    const css = generateStyleCss(['transition-all!', 'duration-300!']);
    expect(css).toContain('transition-property: all !important;');
    expect(css).toContain('transition-duration: var(--tc-duration, 150ms) !important;');
    expect(css).toContain('--tc-duration: 300ms !important;');
  });
});

/**
 * Coverage guard: every visible style control must actually produce CSS. This
 * is exactly the class of bug that left ~20 controls silently dead (the UI
 * emitted a class but `declarationsFor` had no case for it). Animation/scroll
 * controls are excluded — their CSS ships from animationCss.ts / scrollEffects.ts,
 * not generateStyleCss.
 */
describe('style control CSS coverage', () => {
  const RUNTIME_CSS_CONTROLS = new Set(['anim', 'animDelay', 'reveal', 'parallax']);

  for (const control of STYLE_CONTROLS) {
    if (RUNTIME_CSS_CONTROLS.has(control.id)) continue;
    it(`emits CSS for every preset of "${control.id}"`, () => {
      for (const opt of control.options) {
        if (!opt.value) continue; // the empty "—" option is a deliberate no-op
        const cls = control.toClass(opt.value);
        if (!cls) continue;
        const classes = cls.split(' ').map(importantClass);
        const css = generateStyleCss(classes);
        expect(css, `${control.id}="${opt.value}" (${cls}) produced no CSS`).not.toBe('');
      }
    });
  }
});
