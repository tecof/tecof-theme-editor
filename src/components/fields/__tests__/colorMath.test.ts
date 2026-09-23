// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  parseColor,
  formatHex,
  formatColor,
  normalizeValue,
  classifyValue,
  rgbToHsv,
  hsvToRgb,
  rgbToHsl,
  hslToRgb,
  hsvToHsl,
  hslToHsv,
  cssColor,
  relativeLuminance,
  compositeOver,
  contrastRatio,
  wcagLevel,
  themeColorVar,
  parseThemeColorVar,
  isCssVar,
  findPaletteHex,
  type RGB,
} from '../color/colorMath';
import { THEME_COLOR_KEYS } from '../../../studio/theme/colorKeys';
import { generateCSSVariables, getDefaultTheme } from '../../../utils';
import type { ThemeColors } from '../../../types';

const rgb = (r: number, g: number, b: number): RGB => ({ r, g, b });

describe('parseColor', () => {
  it('hex 3/4/6/8 hane', () => {
    expect(parseColor('#abc')).toEqual({ rgb: rgb(170, 187, 204), alpha: 1, source: 'hex' });
    const p4 = parseColor('#abcd')!;
    expect(p4.rgb).toEqual(rgb(170, 187, 204));
    expect(p4.alpha).toBeCloseTo(221 / 255, 5);
    expect(parseColor('#AABBCC')).toEqual({ rgb: rgb(170, 187, 204), alpha: 1, source: 'hex' });
    const p8 = parseColor('#aabbcc80')!;
    expect(p8.rgb).toEqual(rgb(170, 187, 204));
    expect(p8.alpha).toBeCloseTo(0.502, 3);
  });

  it('rgb()/rgba() virgüllü ve boşluklu', () => {
    expect(parseColor('rgb(255, 0, 0)')).toEqual({ rgb: rgb(255, 0, 0), alpha: 1, source: 'rgb' });
    expect(parseColor('rgba(0,0,0,.5)')).toEqual({ rgb: rgb(0, 0, 0), alpha: 0.5, source: 'rgb' });
    expect(parseColor('rgb(255 0 0 / 50%)')).toEqual({ rgb: rgb(255, 0, 0), alpha: 0.5, source: 'rgb' });
    expect(parseColor('RGB(10, 20, 30)')?.rgb).toEqual(rgb(10, 20, 30));
  });

  it('hsl()/hsla()', () => {
    expect(parseColor('hsl(120 100% 50%)')).toEqual({ rgb: rgb(0, 255, 0), alpha: 1, source: 'hsl' });
    const p = parseColor('hsla(217,91%,60%,0.4)')!;
    expect(p.alpha).toBe(0.4);
    expect(p.source).toBe('hsl');
    // #3b82f6 ≈ hsl(217 91% 60%) — kanal başına ±2 tolerans (yuvarlama).
    expect(Math.abs(p.rgb.r - 0x3b)).toBeLessThanOrEqual(2);
    expect(Math.abs(p.rgb.g - 0x82)).toBeLessThanOrEqual(2);
    expect(Math.abs(p.rgb.b - 0xf6)).toBeLessThanOrEqual(2);
    expect(parseColor('hsl(120, 100, 50)')?.rgb).toEqual(rgb(0, 255, 0));
  });

  it('transparent ve boşluk toleransı', () => {
    expect(parseColor('transparent')).toEqual({ rgb: rgb(0, 0, 0), alpha: 0, source: 'keyword' });
    expect(parseColor(' #ABC ')?.rgb).toEqual(rgb(170, 187, 204));
  });

  it('geçersizler null', () => {
    for (const bad of ['', 'foo', '#12', '#ggg', 'rgb(1,2)', 'var(--x)', '#12345', 'red', 'rgb(1,2,3,4,5)']) {
      expect(parseColor(bad), bad).toBeNull();
    }
  });
});

describe('formatHex / formatColor', () => {
  it('küçük harf, alpha kuralı ve kırpma', () => {
    expect(formatHex(rgb(0xab, 0xcd, 0xef))).toBe('#abcdef');
    expect(formatHex(rgb(0xab, 0xcd, 0xef), 1)).toBe('#abcdef');
    expect(formatHex(rgb(0xab, 0xcd, 0xef), 0.5)).toBe('#abcdef80');
    expect(formatHex(rgb(0, 0, 0), 1.2)).toBe('#000000');
    expect(formatHex(rgb(0, 0, 0), -1)).toBe('#00000000');
  });

  it('görünüm metinleri', () => {
    const c = rgb(47, 124, 246);
    expect(formatColor(c, 1, 'hex')).toBe('#2f7cf6');
    expect(formatColor(c, 1, 'rgb')).toBe('rgb(47 124 246)');
    expect(formatColor(c, 0.5, 'rgb')).toBe('rgb(47 124 246 / 50%)');
    // #2f7cf6'nın gerçek HSL'i (utils.hexToHsl ile aynı yuvarlama): 217 92% 57%
    expect(formatColor(c, 1, 'hsl')).toBe('hsl(217 92% 57%)');
    expect(formatColor(c, 0.5, 'hsl')).toBe('hsl(217 92% 57% / 50%)');
  });
});

describe('normalizeValue', () => {
  it('showOpacity kapalı: alpha atılır, alpha 0 → boş', () => {
    expect(normalizeValue('#aabbcc80', { showOpacity: false })).toBe('#aabbcc');
    expect(normalizeValue('#aabbcc00', { showOpacity: false })).toBe('');
    expect(normalizeValue('transparent', { showOpacity: false })).toBe('');
  });
  it('showOpacity açık: hex8 korunur', () => {
    expect(normalizeValue('transparent', { showOpacity: true })).toBe('#00000000');
    expect(normalizeValue('#aabbcc80', { showOpacity: true })).toBe('#aabbcc80');
    expect(normalizeValue('#aabbcc', { showOpacity: true })).toBe('#aabbcc');
  });
  it('RGB() büyük harf → hex; parse edilemeyen → boş', () => {
    expect(normalizeValue('RGB(255, 0, 0)', { showOpacity: false })).toBe('#ff0000');
    expect(normalizeValue('var(--foo)', { showOpacity: false })).toBe('');
  });
});

describe('classifyValue', () => {
  it('boş', () => {
    expect(classifyValue('').kind).toBe('empty');
    expect(classifyValue(null).kind).toBe('empty');
    expect(classifyValue(undefined).kind).toBe('empty');
    expect(classifyValue('   ').kind).toBe('empty');
  });
  it('renk / tema var / bilinmeyen', () => {
    const c = classifyValue('#2f7cf6');
    expect(c.kind).toBe('color');
    expect(c.parsed?.rgb).toEqual(rgb(47, 124, 246));
    const t = classifyValue('var(--theme-color-muted-foreground)');
    expect(t.kind).toBe('themeVar');
    expect(t.themeKey).toBe('mutedForeground');
    const u = classifyValue('var(--foo)');
    expect(u.kind).toBe('unknown');
    expect(u.raw).toBe('var(--foo)');
    expect(classifyValue('abc').kind).toBe('unknown');
  });
});

describe('dönüşümler', () => {
  const hues = [0, 60, 120, 180, 240, 300, 359.9];
  it('hsv gidiş-dönüş ±1 kanal', () => {
    for (const h of hues) {
      const c = hsvToRgb({ h, s: 0.7, v: 0.8 });
      const back = hsvToRgb(rgbToHsv(c));
      expect(Math.abs(back.r - c.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.g - c.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.b - c.b)).toBeLessThanOrEqual(1);
    }
  });
  it('hsl gidiş-dönüş ±1 kanal', () => {
    for (const h of hues) {
      const c = hslToRgb({ h, s: 65, l: 45 });
      const back = hslToRgb(rgbToHsl(c));
      expect(Math.abs(back.r - c.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.g - c.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.b - c.b)).toBeLessThanOrEqual(1);
    }
  });
  it('gri, siyah, beyaz', () => {
    expect(rgbToHsv(rgb(128, 128, 128))).toEqual({ h: 0, s: 0, v: 128 / 255 });
    expect(rgbToHsv(rgb(0, 0, 0))).toEqual({ h: 0, s: 0, v: 0 });
    expect(hsvToRgb({ h: 200, s: 0, v: 1 })).toEqual(rgb(255, 255, 255));
    expect(hsvToRgb({ h: 200, s: 1, v: 0 })).toEqual(rgb(0, 0, 0));
    expect(rgbToHsl(rgb(128, 128, 128)).s).toBe(0);
  });
  it('hsl sınırları ve sarma', () => {
    expect(hslToRgb({ h: 0, s: 100, l: 100 })).toEqual(rgb(255, 255, 255));
    expect(hslToRgb({ h: 0, s: 100, l: 0 })).toEqual(rgb(0, 0, 0));
    expect(hslToRgb({ h: 360, s: 100, l: 50 })).toEqual(rgb(255, 0, 0));
    expect(hslToRgb({ h: -120, s: 100, l: 50 })).toEqual(rgb(0, 0, 255));
    expect(hslToRgb({ h: 0, s: 150, l: 50 })).toEqual(rgb(255, 0, 0));
  });
  it('hsv ↔ hsl doğrudan dönüşüm tonu korur', () => {
    const hsl = hsvToHsl({ h: 200, s: 0, v: 0.5 });
    expect(hsl.h).toBe(200);
    expect(hsl.s).toBe(0);
    const hsv = hslToHsv({ h: 200, s: 0, l: 50 });
    expect(hsv.h).toBe(200);
    expect(hsv.s).toBe(0);
    const round = hslToHsv(hsvToHsl({ h: 33, s: 0.6, v: 0.7 }));
    expect(round.s).toBeCloseTo(0.6, 6);
    expect(round.v).toBeCloseTo(0.7, 6);
  });
});

describe('cssColor', () => {
  it('opak hex, saydam rgba', () => {
    expect(cssColor(rgb(255, 0, 0), 1)).toBe('#ff0000');
    expect(cssColor(rgb(255, 0, 0), 0.5)).toBe('rgba(255, 0, 0, 0.5)');
  });
});

describe('kontrast', () => {
  const white = rgb(255, 255, 255);
  const black = rgb(0, 0, 0);
  it('beyaz/siyah 21, sıra bağımsız', () => {
    expect(contrastRatio(white, black)).toBeCloseTo(21, 5);
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5);
    expect(relativeLuminance(white)).toBeCloseTo(1, 6);
    expect(relativeLuminance(black)).toBe(0);
  });
  it('#767676 vs beyaz ≈ 4.54 → AA; aynı renk 1 → fail', () => {
    const r = contrastRatio(rgb(0x76, 0x76, 0x76), white);
    expect(r).toBeCloseTo(4.54, 2);
    expect(wcagLevel(r)).toBe('AA');
    expect(contrastRatio(white, white)).toBe(1);
    expect(wcagLevel(1)).toBe('fail');
  });
  it('eşikler', () => {
    expect(wcagLevel(2.99)).toBe('fail');
    expect(wcagLevel(3)).toBe('AA-large');
    expect(wcagLevel(4.49)).toBe('AA-large');
    expect(wcagLevel(4.5)).toBe('AA');
    expect(wcagLevel(6.99)).toBe('AA');
    expect(wcagLevel(7)).toBe('AAA');
  });
  it('compositeOver', () => {
    const c = compositeOver(black, 0.5, white);
    for (const ch of [c.r, c.g, c.b]) expect(Math.abs(ch - 128)).toBeLessThanOrEqual(1);
    expect(compositeOver(rgb(10, 20, 30), 1, white)).toEqual(rgb(10, 20, 30));
    expect(compositeOver(rgb(10, 20, 30), 0, white)).toEqual(white);
  });
});

describe('tema değişkenleri', () => {
  it('11 anahtar gidiş-dönüş', () => {
    for (const { key } of THEME_COLOR_KEYS) {
      expect(parseThemeColorVar(themeColorVar(key))).toBe(key);
    }
    expect(themeColorVar('cardForeground')).toBe('var(--theme-color-card-foreground)');
    expect(parseThemeColorVar('var(--theme-color-nope)')).toBeNull();
    expect(parseThemeColorVar('#fff')).toBeNull();
    expect(parseThemeColorVar(' var( --theme-color-primary ) ')).toBe('primary');
  });
  it('isCssVar', () => {
    expect(isCssVar('var(--x)')).toBe(true);
    expect(isCssVar('var(--theme-color-primary)')).toBe(true);
    expect(isCssVar('#fff')).toBe(false);
    expect(isCssVar('var(--x, red)')).toBe(false);
  });
  it('sürüklenme koruması: generateCSSVariables çıktısındaki her --theme-color-* çözülür', () => {
    const css = generateCSSVariables(getDefaultTheme());
    const names = Array.from(css.matchAll(/--theme-color-([a-z-]+):/g)).map((m) => m[1]);
    expect(names.length).toBe(11);
    const keys = new Set<keyof ThemeColors>();
    for (const n of names) {
      const key = parseThemeColorVar(`var(--theme-color-${n})`);
      expect(key, n).not.toBeNull();
      keys.add(key!);
    }
    expect(new Set(names)).toEqual(new Set(THEME_COLOR_KEYS.map((k) => k.cssKey)));
    expect(keys).toEqual(new Set(THEME_COLOR_KEYS.map((k) => k.key)));
  });
});

describe('findPaletteHex', () => {
  it('eşleşme büyük/küçük harf duyarsız; yakın renk eşleşmez', () => {
    expect(findPaletteHex('#ef4444')).toEqual({ hue: 'red', shade: '500' });
    expect(findPaletteHex('#EF4444')).toEqual({ hue: 'red', shade: '500' });
    expect(findPaletteHex('#ef444480')).toEqual({ hue: 'red', shade: '500' });
    expect(findPaletteHex('#ef4445')).toBeNull();
    expect(findPaletteHex('nope')).toBeNull();
  });
});
