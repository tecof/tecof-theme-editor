export {
  DEFAULT_EMAIL_THEME,
  EMAIL_BLOCK_CATALOG,
  EMAIL_DOCUMENT_VERSION,
  EMAIL_MERGE_TAGS,
} from './constants';
export { createEmailBlock, createEmailDocument, normalizeEmailDocument } from './factory';
export { EMAIL_PRESETS } from './presets';
export { renderEmailHtml } from './render';
export {
  EmailValidationError,
  assertValidEmailDocument,
  validateEmailDocument,
} from './validation';
export type {
  CreateEmailDocumentInput,
  EmailAlign,
  EmailBlock,
  EmailBlockCatalogItem,
  EmailBlockOfType,
  EmailBlockPropsMap,
  EmailBlockType,
  EmailButtonProps,
  EmailCouponProps,
  EmailDividerProps,
  EmailDocument,
  EmailDocumentVersion,
  EmailHeadingProps,
  EmailImageProps,
  EmailLogoProps,
  EmailMergeData,
  EmailMergeTag,
  EmailPreset,
  EmailProductProps,
  EmailSocialLink,
  EmailSocialNetwork,
  EmailSocialProps,
  EmailSpacerProps,
  EmailSpacing,
  EmailTextProps,
  EmailTheme,
  EmailValidationIssue,
  RenderEmailOptions,
} from './types';
