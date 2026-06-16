/* ─── Tecof Platform Components ─── */
export { TecofProvider, useTecof } from './components/TecofProvider';
export { TecofEditor } from './components/TecofEditor';
export { TecofRender } from './components/TecofRender';
export { TecofPicture } from './components/TecofPicture';
export { UnderConstruction } from './components/UnderConstruction';

/* ─── Custom Puck Fields ─── */
export { LanguageField, createLanguageField } from './components/fields';
export { EditorField, createEditorField } from './components/fields';
export { UploadField, createUploadField } from './components/fields';
export { CodeEditorField, createCodeEditorField } from './components/fields';
export { LinkField, createLinkField } from './components/fields';
export { ColorField, createColorField } from './components/fields';
export { RepeaterField, createRepeaterField } from './components/fields';
export { CmsCollectionField, createCmsCollectionField } from './components/fields';
export { FieldErrorBoundary } from './components/fields';

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
  MerchantInfoData,
  LanguageFieldValue,
  UploadedFile,
  LinkFieldValue,
} from './types';
export type { TecofPictureProps } from './components/TecofPicture';
