export { LanguageField, createLanguageField } from './LanguageField';
export type { LanguageFieldProps, LanguageFieldOptions } from './LanguageField';

export { EditorField, createEditorField } from './EditorField';
export type { EditorFieldProps, EditorFieldOptions } from './EditorField';

export { UploadField, createUploadField } from './UploadField';
export type { UploadFieldProps, UploadFieldOptions } from './UploadField';
export { LocalizedUploadField, createLocalizedUploadField } from './LocalizedUploadField';
export type { LocalizedUploadFieldProps, LocalizedUploadFieldOptions } from './LocalizedUploadField';

export { CodeEditorField, createCodeEditorField } from './CodeEditorField';
export type { CodeEditorFieldProps, CodeEditorFieldOptions } from './CodeEditorField';

export { LinkField, createLinkField } from './LinkField';
export type { LinkFieldProps, LinkFieldOptions } from './LinkField';

export { ColorField, createColorField } from './ColorField';
export type { ColorFieldProps, ColorFieldOptions } from './ColorField';
/* ColorField v2 — popover, canlı tema paleti ve saf renk yardımcıları */
export { ColorPickerPopover } from './color/ColorPicker';
export type { ColorPickerPopoverProps } from './color/ColorPicker';
export { useThemePalette } from './color/useThemePalette';
export type { ThemePaletteEntry } from './color/useThemePalette';
export {
  parseColor,
  formatHex,
  normalizeValue as normalizeColorValue,
  classifyValue as classifyColorValue,
  contrastRatio,
  wcagLevel,
  themeColorVar,
  parseThemeColorVar,
} from './color/colorMath';
export type { ParsedColor, ColorFormat, ClassifiedValue as ClassifiedColorValue } from './color/colorMath';

export { RepeaterField, createRepeaterField } from './RepeaterField';
export type { RepeaterFieldProps, RepeaterFieldOptions } from './RepeaterField';

export { CmsCollectionField, createCmsCollectionField } from './CmsCollectionField';
export type { CmsCollectionFieldProps, CmsCollectionFieldOptions, CmsCollectionFieldValue } from './CmsCollectionField';

export { IconField, createIconField } from './IconField';
export type { IconFieldProps, IconFieldOptions } from './IconField';

export { ExternalField, createExternalField } from './ExternalField';
export type { ExternalFieldProps, ExternalFieldConfig } from './ExternalField';

/* E-ticaret seçicileri — marka/etiket/özellik/varyant/flaş satış/kampanya/kupon */
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
  readLang,
} from './ecommerce';
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
} from './ecommerce';

export { FieldErrorBoundary } from './FieldErrorBoundary';
export { useLanguages } from './useLanguages';
export { FieldLabel } from './FieldLabel';
export type { FieldLabelProps } from './FieldLabel';

/* Çok dilli alanların ortak dil araçları (Hızlı Doldur / Çevir) — özel çok dilli
   alan yazanlar aynı çubuğu ve fillLanguages<T> / translateLanguages yolunu kullanır */
export { LanguageToolsBar, useLanguageToolsStatus } from './LanguageToolsBar';
export type { LanguageToolsBarProps, LanguageToolsStatus } from './LanguageToolsBar';
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
} from './languageTools';
export type {
  LocalizedEntry,
  FillOptions,
  FillResult,
  TranslateFn,
  TranslateOutcome,
  TranslateLanguagesArgs,
} from './languageTools';
