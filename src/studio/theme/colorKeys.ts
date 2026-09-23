import type { ThemeColors } from '../../types';

/**
 * Tema renk anahtarlarının TEK kaynağı: ThemeEditor satırları, ColorField'ın
 * tema paleti bölümü ve `var(--theme-color-*)` çözümlemesi hep buradan okur.
 *
 * Saf modül (React yok): renk matematiği ve testler de import eder.
 * `cssKey` generateCSSVariables'ın ürettiği değişken adıyla birebir aynıdır
 * (camelCase → kebab-case); ayrı bir dönüşüm yazıp sürüklenme (drift)
 * yaratmamak için aynı regex `toThemeCssKey` olarak dışa verildi.
 */
export interface ThemeColorKey {
  key: keyof ThemeColors;
  /** `--theme-color-<cssKey>` değişkeninin son parçası. */
  cssKey: string;
  /** Kullanıcıya görünen Türkçe etiket (öneksiz; stil editörü "Tema · " ekler). */
  label: string;
}

/** `generateCSSVariables` (src/utils/index.ts) ile AYNI regex — sürüklenme koruması. */
export const toThemeCssKey = (key: string): string => key.replace(/([A-Z])/g, '-$1').toLowerCase();

const entry = (key: keyof ThemeColors, label: string): ThemeColorKey => ({
  key,
  cssKey: toThemeCssKey(key),
  label,
});

export const THEME_COLOR_KEYS: readonly ThemeColorKey[] = [
  entry('primary', 'Ana renk'),
  entry('secondary', 'İkincil'),
  entry('accent', 'Vurgu'),
  entry('background', 'Arka plan'),
  entry('foreground', 'Metin'),
  entry('muted', 'Soluk'),
  entry('mutedForeground', 'Soluk metin'),
  entry('border', 'Kenarlık'),
  entry('card', 'Kart'),
  entry('cardForeground', 'Kart metin'),
  entry('destructive', 'Uyarı'),
];
