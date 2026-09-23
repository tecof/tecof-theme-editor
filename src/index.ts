'use client';

/* ─── Tecof Platform Components ─── */
export { TecofProvider, useTecof } from './components/TecofProvider';
export { TecofEditor } from './components/TecofEditor';
export { TecofStudio } from './studio/TecofStudio';
export { TecofRender } from './components/TecofRender';
export { TecofPicture } from './components/TecofPicture';
export { Slot } from './components/Slot';
export type { SlotProps, SlotLayout, SlotGap } from './components/Slot';
export { TecofRoot } from './components/TecofRoot';
export type { TecofRootProps } from './components/TecofRoot';
export { defineSection, defineElement } from './components/defineComponent';
export type { SectionDefinition, ElementDefinition } from './components/defineComponent';
export { UnderConstruction } from './components/UnderConstruction';
export { PoweredBy, usePoweredBy } from './components/poweredBy';
export type { PoweredByProps, UsePoweredByOptions, UsePoweredByResult, PoweredByMode } from './components/poweredBy';

/* ─── Custom Puck Fields ─── */
export { LanguageField, createLanguageField } from './components/fields';
export { EditorField, createEditorField } from './components/fields';
export { UploadField, createUploadField } from './components/fields';
export { LocalizedUploadField, createLocalizedUploadField } from './components/fields';
export { CodeEditorField, createCodeEditorField } from './components/fields';
export { LinkField, createLinkField } from './components/fields';
export { ColorField, createColorField } from './components/fields';
/* ColorField v2 — popover, tema paleti, saf renk yardımcıları, tema anahtarları */
export {
  ColorPickerPopover,
  useThemePalette,
  parseColor,
  formatHex,
  normalizeColorValue,
  classifyColorValue,
  contrastRatio,
  wcagLevel,
  themeColorVar,
  parseThemeColorVar,
} from './components/fields';
export type {
  ColorFieldProps,
  ColorFieldOptions,
  ColorPickerPopoverProps,
  ThemePaletteEntry,
  ParsedColor,
  ColorFormat,
  ClassifiedColorValue,
} from './components/fields';
export { THEME_COLOR_KEYS, toThemeCssKey } from './studio/theme/colorKeys';
export type { ThemeColorKey } from './studio/theme/colorKeys';
export { RepeaterField, createRepeaterField } from './components/fields';
export { CmsCollectionField, createCmsCollectionField } from './components/fields';
export { IconField, createIconField } from './components/fields';
export { ExternalField, createExternalField } from './components/fields';
export { FieldErrorBoundary } from './components/fields';

/* Dil araçları — çok dilli alanlar için ortak Hızlı Doldur / Çevir yardımcıları */
export { LanguageToolsBar, useLanguageToolsStatus } from './components/fields';
export type { LanguageToolsBarProps, LanguageToolsStatus } from './components/fields';
export {
  fillLanguages,
  mergeTranslations,
  translateLanguages,
  targetLocales,
  normalizeLocalizedValues,
  isEmptyText,
  isEmptyHtml,
  isEmptyLink,
  LANGUAGE_TOOL_MESSAGES,
} from './components/fields';
export type {
  LocalizedEntry,
  FillOptions,
  FillResult,
  TranslateFn,
  TranslateOutcome,
  TranslateLanguagesArgs,
} from './components/fields';

/* ─── E-ticaret Seçicileri ───
   Merchant'ın panelindeki gerçek kayıtlardan seçim yaptırır; slug/id elle
   yazmayı bitirir. Saklanan değer yayında tek başına render edilebilir. */
export {
  createCategoryField,
  createCategoryListField,
  createProductField,
  createProductListField,
  createBrandField,
  createBrandListField,
  createTagField,
  createTagListField,
  createAttributeField,
  createAttributeListField,
  createVariantTypeField,
  createVariantField,
  createFlashSaleField,
  createCampaignField,
  createDiscountField,
} from './components/fields';
export type {
  EcommerceFieldOptions,
  EcommerceOption,
  EcommerceSource,
  VariantFieldOptions,
  VariantFieldValue,
  ProductFieldOptions,
  ProductFieldValue,
  BrandFieldValue,
  CategoryFieldValue,
  TagFieldValue,
  AttributeFieldValue,
  VariantTypeFieldValue,
  FlashSaleFieldValue,
  CampaignFieldValue,
  DiscountFieldValue,
} from './components/fields';

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
export { STYLES_PROP, STYLE_SYNC_PROP } from './studio/style/types';
export type { NodeStyles, Breakpoint, StateVariant, StyleMatch, StyleSyncFlag } from './studio/style/types';

/* ─── Sayfalar arası stil senkronu ───
   Bir düğümün stilini AYNI TEMADAKİ diğer sayfalardaki eşleşen bileşenlere
   taşır (`TecofApiClient.applyStylesToPages` / `previewApplyStyles`), ya da
   düğüme `_tecofStyleSync` bayrağı yazıp kayıt sonrası SÜREKLİ senkron açar.
   Aşağıdaki saf yardımcılar backend'in eşleşme kurallarının aynısını uygular —
   host kendi UI'ını kurarsa aynı sonucu göstersin. */
export {
  nodeStyleLabel,
  isStyleSourceNode,
  styleSyncFlagOf,
  buildStyleMatch,
  buildStyleSyncFlag,
  mergeStyleSyncPages,
  styleSyncSummary,
} from './studio/style/styleSync';
export type { StyleSyncPageRow } from './studio/style/styleSync';
export type {
  ApplyStylesPayload,
  ApplyStylesResult,
  ApplyStylesPageResult,
  ApplyStylesConflict,
} from './api';

/* ─── When-then interactions ─── */
// Declarative trigger→action behaviours stored on a node's `_interactions`.
// TecofRender wires the runtime automatically; `initInteractions` is exposed for
// hosts that render pages themselves. `collectInteractionRegistry` builds the
// source→actions map (e.g. for SSR pre-serialisation).
export { initInteractions } from './studio/interactions/runtime';
export { collectInteractionRegistry } from './studio/interactions/registry';
export { INTERACTIONS_PROP, START_HIDDEN_PROP } from './studio/interactions/types';
export type {
  Interaction,
  InteractionTrigger,
  InteractionAction,
  InteractionRegistry,
} from './studio/interactions/types';

/* ─── Dark mode (Tailwind `.dark` class strategy) ─── */
// Opt-in via `config.darkMode`. A `.dark` class on <html> swaps the
// `--theme-color-*` variable VALUES (generateCSSVariables emits a `:root.dark {}`
// block), so page content keeps its exact classes and NOTHING is added to the
// Tailwind safelist. TecofRender wires the runtime + emits the config script
// automatically; `initDarkMode` is for hosts that render pages themselves, and
// `darkModeHeadScript` is inlined in <head> for zero flash-of-wrong-theme.
export { initDarkMode, darkModeHeadScript, DARK_MODE_STORAGE_KEY } from './studio/theme/darkMode';
export type { DarkModeConfig, DarkModeHandle, ColorScheme, DarkModeDefault } from './studio/theme/darkMode';

export { useUiStore } from './studio/uiStore';
export { useEditorStore } from './engine/store';

/* ─── Drawer kabuğu + onay/uyarı kuyruğu ───
   Editördeki her pencere StudioDrawer'dır (Radix Dialog, modal={false}).
   Host'un kendi eklentileri aynı kabuğu kullansın;
   `studioDialog.confirm/alert` window.confirm/alert
   yerine geçer (DialogHost TecofStudio içinde mount edilir). */
export { StudioDrawer, isStudioDrawerOpen } from './studio/ui/StudioDrawer';
export type { StudioDrawerProps, StudioDrawerSize, StudioDrawerTone } from './studio/ui/StudioDrawer';
export { ConfirmDrawer } from './studio/ui/ConfirmDrawer';
export type { ConfirmDrawerProps } from './studio/ui/ConfirmDrawer';
export { useDialogStore, studioDialog } from './studio/ui/dialogStore';
export type { DialogConfirmOptions, DialogAlertOptions, DialogRequest, DialogState } from './studio/ui/dialogStore';

/* ─── Aktif düzenleme dili ─── */
// Editörde tek, uygulama geneli bir "aktif dil" var (üst bardaki seçici).
// `TecofEditor`'ün `onLanguageChange` prop'u bu dili host'a bildirir; tuvalin
// içinde yaşayan özel host bileşenleri ise aynı dili doğrudan buradan okur.
// Provider yoksa (yayın/standalone render) hook `null` döner — çökmez.
export { useActiveLanguage } from './studio/language/LanguageContext';
export type { ActiveLanguageContextType } from './studio/language/LanguageContext';

/* ─── Symbols (reusable component instances) ─── */
// Nodes sharing a `sharedComponentId` are instances of one symbol; editing one
// mirrors onto the others live in the editor (minus per-instance
// `_symbolOverrides`). `planSymbolSync` is the pure propagation planner — reuse
// it e.g. to dereference/sync instances server-side on save.
export {
  planSymbolSync,
  findSymbolRoot,
  findSymbolInstanceRoots,
  symbolInfo,
  SYMBOL_ID_PROP,
  SYMBOL_OVERRIDES_PROP,
} from './engine/symbols';
export type { SymbolSync, SymbolPathStep } from './engine/symbols';

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
  deriveDarkColors,
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
  PoweredByBandData,
  LanguageFieldValue,
  UploadedFile,
  LinkFieldValue,
  LocalizedLinkFieldValue,
  Permissions,
  ResolveContext,
  ResolveFieldsContext,
  ResolveDataResult,
  MigrationConfig,
  ItemSchemaField,
  SectionTemplate,
  PageTemplate,
  ThemePreset,
  TecofNode,
  TecofDocument,
} from './types';
export type { TecofPictureProps } from './components/TecofPicture';

/* ─── Görsel odak noktası ─── */
export {
  DEFAULT_FOCAL_POINT,
  clampFocalPoint,
  focalPointToObjectPosition,
  isDefaultFocalPoint,
} from './utils/focalPoint';
export type { FocalPoint } from './types';
export { FocalPointDrawer } from './components/fields/FocalPointDrawer';
export type { FocalPointDrawerProps } from './components/fields/FocalPointDrawer';

/* ─── Çok dilli medya ───
   createLocalizedUploadField değeri [{code, value: UploadedFile[]}]; tema
   render'ı dile göre dosyayı bu yardımcılarla çözer (boş dil → varsayılan dil
   → ilk dolu dil). Core getL boş diziyi dolu saydığı için burada ayrı çözümleyici. */
export {
  resolveLocalizedUpload,
  resolveLocalizedUploadFile,
  normalizeLocalizedUpload,
  isLocalizedUploadValue,
} from './utils/localizedUpload';
export type { LocalizedUploadFieldValue, LocalizedUploadLanguages } from './utils/localizedUpload';

export { normalizeSearch, matchesSearch, matchesAllTerms } from './utils/search';

/* ─── Panel bağlantıları ───
   Editörde YARATILAMAYAN kayıtlar (ürün, marka, koleksiyon…) için panele çıkan
   yollar tek dosyada durur; taban adres `TecofEditorProps.panelUrl`'den gelir.
   Host kendi ekranlarında aynı bağlantı dilini kullanabilsin diye dışa açıktır. */
export { PANEL_PATHS, buildPanelUrl, DEFAULT_PANEL_URL } from './utils/panelLinks';
export { PanelLink, PANEL_LINK_HINT } from './components/fields/PanelLink';
export type { PanelLinkProps } from './components/fields/PanelLink';
export { useStudioOptional } from './studio/context';
export type { StudioContextType } from './studio/context';
