/* ─── Tecof Platform Components ─── */
export { TecofProvider, useTecof } from './components/TecofProvider';
export { TecofEditor } from './components/TecofEditor';
export { TecofStudio } from './studio/TecofStudio';
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
export { IconField, createIconField } from './components/fields';
export { ExternalField, createExternalField } from './components/fields';
export { FieldErrorBoundary } from './components/fields';

/* ─── API Client ─── */
export { TecofApiClient } from './api';

/* ─── Visual Style Editor / Tailwind ─── */
// `getSafelist()` returns every Tailwind class the editor's *preset* options can
// emit — feed it into the host Tailwind config so production CSS always contains
// those classes. For *arbitrary* values (e.g. `p-[10px]`, `bg-[#ff0000]`) — which
// live in saved JSON and are invisible to Tailwind's content scanner — run
// `collectDocumentClasses(pageData)` over your saved pages at build time and add
// the result to the safelist as well. See docs/TAILWIND.md.
export { getSafelist, STYLE_CONTROLS } from './studio/style/tokens';
export { compileStyles, collectStyleClasses, collectDocumentClasses } from './studio/style/compileStyles';
export { STYLES_PROP } from './studio/style/types';
export type { NodeStyles, Breakpoint, StateVariant } from './studio/style/types';

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
  Permissions,
  ResolveContext,
  ResolveFieldsContext,
  ResolveDataResult,
  MigrationConfig,
} from './types';
export type { TecofPictureProps } from './components/TecofPicture';
