import { describe, it, expect } from 'vitest';
import {
  bandScriptSelector,
  buildBandCss,
  isBandVisible,
  pickLocale,
  pickMode,
  resolveBand,
  type PoweredByBandData,
} from '../resolve';

/** Saf çözümleyiciler: DOM yok, React yok — hidrasyon eşitliğinin garantisi burada. */

const band: PoweredByBandData = {
  html: {
    tr: { light: '<b>TR açık</b>', dark: '<b>TR koyu</b>' },
    en: { light: '<b>EN light</b>', dark: '<b>EN dark</b>' },
  },
  css: '.tecof-band{color:red}',
  js: 'console.log(1)',
  version: 'abc123def456',
};

describe('pickLocale', () => {
  const available = ['tr', 'en'];

  it('prop öncelikli', () => {
    expect(pickLocale({ prop: 'en', activeLanguage: 'tr', documentLang: 'tr', defaultLanguage: 'tr', available })).toBe('en');
  });

  it('prop available içinde yoksa sıradakine düşer', () => {
    expect(pickLocale({ prop: 'de', activeLanguage: 'en', available })).toBe('en');
  });

  it('activeLanguage boş string yok sayılır', () => {
    expect(pickLocale({ activeLanguage: '', documentLang: 'en', available })).toBe('en');
  });

  it('documentLang tr-TR → tr', () => {
    expect(pickLocale({ documentLang: 'tr-TR', available: ['en', 'tr'] })).toBe('tr');
  });

  it('documentLang en-GB, available=[en] → en', () => {
    expect(pickLocale({ documentLang: 'en-GB', available: ['en'] })).toBe('en');
  });

  it('hiçbiri eşleşmezse defaultLanguage', () => {
    expect(pickLocale({ prop: 'fr', activeLanguage: 'de', documentLang: 'it', defaultLanguage: 'en', available })).toBe('en');
  });

  it('defaultLanguage da yoksa ilk anahtar', () => {
    expect(pickLocale({ prop: 'fr', defaultLanguage: 'de', available: ['tr', 'en'] })).toBe('tr');
  });

  it('available boş → null', () => {
    expect(pickLocale({ prop: 'tr', defaultLanguage: 'tr', available: [] })).toBeNull();
  });
});

describe('pickMode', () => {
  it.each([
    // prop her şeyi ezer
    ['light', true, true, true, 'light'],
    ['dark', false, false, false, 'dark'],
    // classDark → dark
    [undefined, true, true, false, 'dark'],
    [undefined, true, false, false, 'dark'],
    // classStrategy && !classDark → light (prefersDark true olsa da)
    [undefined, false, true, true, 'light'],
    [undefined, false, true, false, 'light'],
    // !classStrategy && !classDark → prefersDark'a göre
    [undefined, false, false, true, 'dark'],
    [undefined, false, false, false, 'light'],
  ] as const)('prop=%s classDark=%s classStrategy=%s prefersDark=%s → %s', (prop, classDark, classStrategy, prefersDark, expected) => {
    expect(pickMode({ prop, classDark, classStrategy, prefersDark })).toBe(expected);
  });
});

describe('resolveBand', () => {
  it('locale eşleşir', () => {
    const r = resolveBand(band, 'en');
    expect(r?.locale).toBe('en');
    expect(r?.html.dark).toBe('<b>EN dark</b>');
  });

  it("locale yoksa defaultLanguage'a düşer", () => {
    const r = resolveBand(band, 'de', 'en');
    expect(r?.locale).toBe('en');
  });

  it('ikisi de yoksa ilk anahtar', () => {
    const r = resolveBand(band, 'de', 'fr');
    expect(r?.locale).toBe('tr');
    expect(r?.html.light).toBe('<b>TR açık</b>');
  });

  it('band null → null; html boş → null', () => {
    expect(resolveBand(null, 'tr')).toBeNull();
    expect(resolveBand(undefined, 'tr')).toBeNull();
    expect(resolveBand({ html: {}, css: null, js: null }, 'tr')).toBeNull();
  });

  it('version resolveBand ile değil band ile taşınır (dokunulmaz)', () => {
    expect(band.version).toBe('abc123def456');
    expect(resolveBand(band, 'tr')).not.toBeNull();
  });
});

describe('isBandVisible', () => {
  it('band null → false', () => {
    expect(isBandVisible({ band: null })).toBe(false);
    expect(isBandVisible({ band: undefined })).toBe(false);
  });

  it('showPoweredBy:false → false', () => {
    expect(isBandVisible({ band, showPoweredBy: false })).toBe(false);
  });

  it('isSuspended → false', () => {
    expect(isBandVisible({ band, isSuspended: true })).toBe(false);
  });

  it('isUnderConstruction → false', () => {
    expect(isBandVisible({ band, isUnderConstruction: true })).toBe(false);
  });

  it('bayraklar undefined + band dolu → true', () => {
    expect(isBandVisible({ band })).toBe(true);
    expect(isBandVisible({ band, showPoweredBy: true, isSuspended: false, isUnderConstruction: false })).toBe(true);
  });

  it('html boş → false', () => {
    expect(isBandVisible({ band: { html: {}, css: null, js: null } })).toBe(false);
  });
});

describe('buildBandCss', () => {
  it('tek varyantta [data-single] kuralı + hidden kuralı + admin CSS', () => {
    const css = buildBandCss('.tecof-band{color:red}', false);
    expect(css).toContain('[data-powered-band][data-single][data-mode]{display:block}');
    expect(css).toContain('[data-powered-band][data-single][hidden]{display:none}');
    expect(css).toContain('.tecof-band{color:red}');
    expect(css).not.toContain('prefers-color-scheme');
  });

  it('her iki modda temanın sabit rozeti gizlenir (SSR/JS\'siz çift rozet olmasın)', () => {
    expect(buildBandCss(null, false)).toContain('[data-powered-by]{display:none}');
    expect(buildBandCss(null, true)).toContain('[data-powered-by]{display:none}');
  });

  it("renderBoth'ta prefers-color-scheme bloğu", () => {
    const css = buildBandCss('.x{}', true);
    expect(css).toContain('[data-powered-band][data-mode="dark"]{display:none}');
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain('.x{}');
    expect(css).not.toContain('[data-single]');
  });

  it('css=null → yalnız taban (admin CSS satırı yok)', () => {
    expect(buildBandCss(null, false)).toBe(
      '[data-powered-band][data-single][data-mode]{display:block}' +
        '[data-powered-band][data-single][hidden]{display:none}' +
        '[data-powered-by]{display:none}',
    );
    expect(buildBandCss(null, false)).not.toContain('\n');
  });
});

describe('bandScriptSelector', () => {
  it("version'lı", () => {
    expect(bandScriptSelector('abc123', 'x')).toBe('script[data-powered-band-script][data-version="abc123"]');
  });

  it('versionsuz → js uzunluğu', () => {
    expect(bandScriptSelector(undefined, 'hello')).toBe('script[data-powered-band-script][data-version="5"]');
    expect(bandScriptSelector(null, 'hello')).toBe('script[data-powered-band-script][data-version="5"]');
  });
});
