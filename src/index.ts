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
export { TAILWIND_PALETTE, TAILWIND_SHADES } from './studio/style/palette';
export type { PaletteHue, TailwindShade } from './studio/style/palette';
export { compileStyles, collectStyleClasses, collectDocumentClasses, cn } from './studio/style/compileStyles';
export { STYLES_PROP } from './studio/style/types';
export type { NodeStyles, Breakpoint, StateVariant } from './studio/style/types';

export { useUiStore } from './studio/uiStore';
export { useEditorStore } from './engine/store';

/* ─── Repeat Zones (item templates) ─── */
// A `slot` field with `repeatSource` repeats its children once per data row;
// `{{ item.* }}` prop tokens resolve against the current row. `useRepeatItem()`
// reads the row inside a template component; `resolveItemTokens` is the same
// resolver the renderers use (exposed for host-side custom rendering).
export { RepeatItemContext, useRepeatItem } from './components/RepeatItemContext';
export type { RepeatItemInfo } from './components/RepeatItemContext';
export { resolveItemTokens, inferItemSchema } from './utils/itemTokens';
export { findRepeatScope } from './engine/repeat';
export type { RepeatScope } from './engine/repeat';
export { createApiListField } from './components/fields/ApiListField';
export type { ApiListFieldOptions, ApiListFieldValue } from './components/fields/ApiListField';
export { useRepeatRows, resolveRepeatRows, clearRepeatRowsCache } from './components/useRepeatRows';

/* ─── Fonts ─── */
// The Tema panel picks/loads fonts automatically, and TecofRender injects the
// Google Fonts <link> + custom @font-face into published pages. These helpers are
// for hosts that assemble their own <head> (e.g. SSR) and need the same output.
export {
  BUILTIN_FONTS,
  googleFontsHref,
  customFontFaceCss,
  themeGoogleFontsHref,
  themeFontFaceCss,
} from './studio/theme/fonts';
export type { BuiltinFont } from './studio/theme/fonts';

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
  DeepPartialThemeConfig,
  ThemeColors,
  ThemeTypography,
  CustomFont,
  ThemeSpacing,
  StudioConfig,
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
  ItemSchemaField,
} from './types';
export type { TecofPictureProps } from './components/TecofPicture';
