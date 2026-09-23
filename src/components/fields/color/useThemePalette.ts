/**
 * ColorField v2 — canlı tema paleti.
 *
 * Studio içinde sayfanın gerçek tema renklerini (kök props override'ı dahil)
 * çözer; koyu mod açıksa ve önizleme koyuysa `current` koyu değeri taşır.
 * Host belgesine yalnız AÇIK değerler enjekte edildiği için koyu renk CSS'ten
 * okunamaz — bu yüzden çözüm JS'te yapılır.
 *
 * Studio DIŞINDA (yalnız TecofProvider) `null` döner ve bölüm gizlenir.
 * Hook'lar KOŞULSUZ çağrılır (rules-of-hooks): store seçicileri ucuzdur, sonuç
 * `enabled:false`/provider yokken atılır.
 */
import { useMemo } from 'react';
import type { ThemeColors } from '../../../types';
import { useStudioOptional } from '../../../studio/context';
import { useEditorStore } from '../../../engine/store';
import { useUiStore } from '../../../studio/uiStore';
import { resolveTheme } from '../../../studio/theme/theme';
import { THEME_COLOR_KEYS } from '../../../studio/theme/colorKeys';
import { themeColorVar } from './colorMath';

export interface ThemePaletteEntry {
  key: keyof ThemeColors;
  cssKey: string;
  label: string;
  /** `var(--theme-color-<cssKey>)` */
  varRef: string;
  light: string;
  /** Koyu mod kapalıysa açık değerle aynı. */
  dark: string;
  /** Önizleme şemasına göre görünen değer. */
  current: string;
}

export function useThemePalette(enabled: boolean): ThemePaletteEntry[] | null {
  const studio = useStudioOptional();
  const rootProps = useEditorStore((s) => s.document.root?.props);
  const scheme = useUiStore((s) => s.previewColorScheme);
  const config = studio?.config;

  return useMemo(() => {
    if (!enabled || !config) return null;
    const theme = resolveTheme(rootProps, config.theme);
    const darkOn = !!config.darkMode;
    return THEME_COLOR_KEYS.map(({ key, cssKey, label }) => {
      const light = theme.colors[key];
      const dark = darkOn ? (theme.darkColors?.[key] ?? light) : light;
      const current = darkOn && scheme === 'dark' ? dark : light;
      return { key, cssKey, label, varRef: themeColorVar(key), light, dark, current };
    });
  }, [enabled, config, rootProps, scheme]);
}
