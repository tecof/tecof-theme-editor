/* ─── Tecof Platform Components ─── */
export { TecofProvider, useTecof } from './components/TecofProvider';
export { TecofEditor } from './components/TecofEditor';
export { TecofRender } from './components/TecofRender';

/* ─── API Client ─── */
export { TecofApiClient } from './api';

/* ─── Utilities ─── */
export {
  hexToHsl,
  hslToHex,
  lighten,
  darken,
  generateCSSVariables,
  getDefaultTheme,
  mergeTheme,
} from './utils';

/* ─── Types ─── */
export type {
  ThemeConfig,
  ThemeColors,
  ThemeTypography,
  ThemeSpacing,
  HSL,
  PuckContentItem,
  PuckPageData,
  ApiResponse,
  PageApiData,
  TecofProviderProps,
  TecofEditorProps,
  TecofRenderProps,
} from './types';
