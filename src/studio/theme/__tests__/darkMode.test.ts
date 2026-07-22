import { describe, it, expect } from 'vitest';
import {
  generateCSSVariables,
  getDefaultTheme,
  mergeTheme,
  deriveDarkColors,
  hexToHsl,
} from '../../../utils';
import { darkModeHeadScript, initDarkMode, type DarkModeConfig } from '../darkMode';
import type { ThemeColors } from '../../../types';

/* ── Minimal fake DOM so the runtime's class-toggle/persistence/delegation logic
   is exercised headlessly (the repo runs node-only, no jsdom). ── */
function makeFakeDom(opts: { stored?: string | null; prefersDark?: boolean; scriptConfig?: DarkModeConfig | null } = {}) {
  const classes = new Set<string>();
  const store: Record<string, string> = {};
  if (opts.stored != null) store['tecof-color-scheme'] = opts.stored;
  const clickHandlers: ((e: any) => void)[] = [];
  const mqHandlers: (() => void)[] = [];
  let prefersDark = !!opts.prefersDark;

  const win: any = {
    matchMedia: () => ({
      get matches() {
        return prefersDark;
      },
      addEventListener: (_: string, fn: () => void) => mqHandlers.push(fn),
      removeEventListener: () => {},
    }),
    localStorage: {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
    },
  };
  const scriptEl =
    opts.scriptConfig !== undefined && opts.scriptConfig !== null
      ? { textContent: JSON.stringify(opts.scriptConfig) }
      : opts.scriptConfig === null
        ? null
        : undefined;
  const doc: any = {
    defaultView: win,
    documentElement: {
      classList: {
        toggle: (c: string, on?: boolean) => {
          const next = on === undefined ? !classes.has(c) : on;
          if (next) classes.add(c);
          else classes.delete(c);
          return next;
        },
        contains: (c: string) => classes.has(c),
      },
    },
    querySelector: (sel: string) => (sel.includes('data-tecof-darkmode') ? scriptEl ?? null : null),
    addEventListener: (t: string, fn: (e: any) => void) => {
      if (t === 'click') clickHandlers.push(fn);
    },
    removeEventListener: () => {},
  };
  const toggleTarget = { closest: (sel: string) => (sel.includes('tecof-darkmode-toggle') ? {} : null) };
  return {
    doc,
    store,
    isDark: () => classes.has('dark'),
    setPrefersDark: (v: boolean) => {
      prefersDark = v;
    },
    clickToggle: () => clickHandlers.forEach((fn) => fn({ target: toggleTarget, preventDefault() {} })),
    clickElsewhere: () =>
      clickHandlers.forEach((fn) => fn({ target: { closest: () => null }, preventDefault() {} })),
    fireMqChange: () => mqHandlers.forEach((fn) => fn()),
  };
}

describe('generateCSSVariables — dark override block', () => {
  const theme = { ...getDefaultTheme(), darkColors: { background: '#000000', foreground: '#ffffff' } };

  it('stays single-mode by default (no :root.dark, no color-scheme)', () => {
    const css = generateCSSVariables(theme);
    expect(css).not.toContain(':root.dark');
    expect(css).not.toContain('color-scheme');
    // base block is unchanged: light colors present as before
    expect(css).toContain('--theme-color-background: #ffffff;');
  });

  it('emits :root.dark with color-scheme only when { dark: true }', () => {
    const css = generateCSSVariables(theme, { dark: true });
    expect(css).toContain(':root.dark {');
    expect(css).toContain('color-scheme: light;');
    expect(css).toContain('color-scheme: dark;');
  });

  it('uses darkColors overrides inside the dark block', () => {
    const css = generateCSSVariables(theme, { dark: true });
    const darkBlock = css.slice(css.indexOf(':root.dark {'));
    expect(darkBlock).toContain('--theme-color-background: #000000;');
    expect(darkBlock).toContain('--theme-color-foreground: #ffffff;');
  });

  it('falls back to the light value for dark keys left unset', () => {
    const t = { ...getDefaultTheme(), darkColors: {} };
    const css = generateCSSVariables(t, { dark: true });
    const darkBlock = css.slice(css.indexOf(':root.dark {'));
    // primary not overridden → same value as the light palette in the dark block
    expect(darkBlock).toContain(`--theme-color-primary: ${t.colors.primary};`);
  });

  it('camelCase keys become kebab vars in the dark block (mutedForeground)', () => {
    const css = generateCSSVariables(getDefaultTheme(), { dark: true });
    const darkBlock = css.slice(css.indexOf(':root.dark {'));
    expect(darkBlock).toContain('--theme-color-muted-foreground:');
  });
});

describe('mergeTheme — darkColors', () => {
  it('merges the dark palette per-key (base ← override)', () => {
    const base = getDefaultTheme();
    const merged = mergeTheme(base, { darkColors: { primary: '#123456' } });
    expect(merged.darkColors?.primary).toBe('#123456');
    // untouched keys keep the base default dark value
    expect(merged.darkColors?.background).toBe(base.darkColors?.background);
  });

  it('keeps the base dark palette when the override omits darkColors', () => {
    const base = getDefaultTheme();
    const merged = mergeTheme(base, { colors: { primary: '#ff0000' } });
    expect(merged.darkColors).toEqual(base.darkColors);
  });
});

describe('deriveDarkColors', () => {
  const light: ThemeColors = getDefaultTheme().colors;
  const dark = deriveDarkColors(light);

  it('produces all 11 keys', () => {
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
  });

  it('darkens surfaces and lightens text', () => {
    expect(hexToHsl(dark.background).l).toBeLessThan(20);
    expect(hexToHsl(dark.card).l).toBeLessThan(20);
    expect(hexToHsl(dark.foreground).l).toBeGreaterThan(80);
    expect(hexToHsl(dark.cardForeground).l).toBeGreaterThan(80);
  });

  it('inverts a neutral primary to a light value', () => {
    // default primary #18181b is near-black + low saturation → light in dark mode
    expect(hexToHsl(dark.primary).l).toBeGreaterThan(80);
  });

  it('preserves the hue of a saturated brand color (accent stays blue)', () => {
    const a0 = hexToHsl(light.accent);
    const a1 = hexToHsl(dark.accent);
    expect(Math.abs(a1.h - a0.h)).toBeLessThanOrEqual(5);
    expect(a1.s).toBeGreaterThan(30);
  });
});

describe('darkModeHeadScript', () => {
  it('embeds the storage key + default mode and toggles the .dark class', () => {
    const s = darkModeHeadScript({ defaultMode: 'dark', storageKey: 'my-key' });
    expect(s).toContain('my-key');
    expect(s).toContain("'dark'");
    expect(s).toContain("classList.toggle('dark'");
    expect(s).toContain('prefers-color-scheme');
  });

  it('defaults to system + tecof-color-scheme', () => {
    const s = darkModeHeadScript();
    expect(s).toContain('tecof-color-scheme');
    expect(s).toContain('system');
  });
});

describe('initDarkMode — runtime (fake DOM)', () => {
  it('a stored choice wins over the default mode', () => {
    const dom = makeFakeDom({ stored: 'dark', prefersDark: false });
    initDarkMode(dom.doc, { defaultMode: 'light' });
    expect(dom.isDark()).toBe(true);
  });

  it("defaultMode 'system' follows prefers-color-scheme when unstored", () => {
    const dark = makeFakeDom({ prefersDark: true });
    initDarkMode(dark.doc, { defaultMode: 'system' });
    expect(dark.isDark()).toBe(true);

    const light = makeFakeDom({ prefersDark: false });
    initDarkMode(light.doc, { defaultMode: 'system' });
    expect(light.isDark()).toBe(false);
  });

  it("defaultMode 'dark' applies with no stored choice", () => {
    const dom = makeFakeDom({});
    initDarkMode(dom.doc, { defaultMode: 'dark' });
    expect(dom.isDark()).toBe(true);
  });

  it('a delegated .tecof-darkmode-toggle click flips + persists the scheme', () => {
    const dom = makeFakeDom({ prefersDark: false });
    initDarkMode(dom.doc, { defaultMode: 'light' });
    expect(dom.isDark()).toBe(false);

    dom.clickToggle();
    expect(dom.isDark()).toBe(true);
    expect(dom.store['tecof-color-scheme']).toBe('dark');

    dom.clickToggle();
    expect(dom.isDark()).toBe(false);
    expect(dom.store['tecof-color-scheme']).toBe('light');
  });

  it('ignores clicks outside a toggle', () => {
    const dom = makeFakeDom({ prefersDark: false });
    initDarkMode(dom.doc, { defaultMode: 'light' });
    dom.clickElsewhere();
    expect(dom.isDark()).toBe(false);
    expect(dom.store['tecof-color-scheme']).toBeUndefined();
  });

  it("system mode tracks OS changes until the visitor makes a choice", () => {
    const dom = makeFakeDom({ prefersDark: false });
    initDarkMode(dom.doc, { defaultMode: 'system' });
    expect(dom.isDark()).toBe(false);

    dom.setPrefersDark(true);
    dom.fireMqChange();
    expect(dom.isDark()).toBe(true);

    // Once the visitor toggles, an explicit choice is stored and OS changes stop overriding it.
    dom.clickToggle(); // -> light, persisted
    expect(dom.isDark()).toBe(false);
    dom.setPrefersDark(true);
    dom.fireMqChange();
    expect(dom.isDark()).toBe(false); // stays on the explicit choice
  });

  it('is a no-op when no config and no <script> are present', () => {
    const dom = makeFakeDom({ scriptConfig: null });
    initDarkMode(dom.doc); // reads the (absent) script → NOOP
    expect(dom.isDark()).toBe(false);
  });

  it('reads config from the emitted <script data-tecof-darkmode> when not passed', () => {
    const dom = makeFakeDom({ scriptConfig: { defaultMode: 'dark' } });
    initDarkMode(dom.doc);
    expect(dom.isDark()).toBe(true);
  });
});
