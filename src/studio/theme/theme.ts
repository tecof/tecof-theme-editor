import type { ThemeConfig } from '../../types';
import { getDefaultTheme, mergeTheme } from '../../utils';

/** Root-prop key under which the page's theme override is stored (persists + undoable). */
export const THEME_PROP = '_tecofTheme';

/** id of the injected <style> element carrying the theme CSS variables. */
export const THEME_STYLE_ID = 'tecof-theme-vars';

/**
 * Resolves the effective theme: built-in defaults ← the theme package's
 * `config.theme` defaults ← the page's stored override (root props).
 */
export const resolveTheme = (
  rootProps?: Record<string, any> | null,
  configTheme?: Partial<ThemeConfig> | null
): ThemeConfig =>
  mergeTheme(
    mergeTheme(getDefaultTheme(), configTheme ?? {}),
    (rootProps?.[THEME_PROP] as Partial<ThemeConfig>) ?? {}
  );
