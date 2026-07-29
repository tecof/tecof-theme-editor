import { EMAIL_BLOCK_TYPES, EMAIL_SOCIAL_NETWORKS } from './constants';
import { normalizeEmailDocument } from './factory';
import {
  ALLOWED_MERGE_TAG_KEYS,
  isSafeFontFamily,
  isSafeHexColor,
  mergeTagsIn,
  safeUrlProtocol,
} from './safety';
import type {
  EmailAlign,
  EmailBlock,
  EmailDocument,
  EmailValidationIssue,
} from './types';

const ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
const ALIGNMENTS: readonly EmailAlign[] = ['left', 'center', 'right'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const issue = (
  path: string,
  code: string,
  message: string,
  severity: EmailValidationIssue['severity'] = 'error'
): EmailValidationIssue => ({ path, code, message, severity });

const validateString = (
  issues: EmailValidationIssue[],
  value: unknown,
  path: string,
  options: { required?: boolean; max?: number } = {}
): void => {
  if (typeof value !== 'string') {
    issues.push(issue(path, 'string.invalid', 'Metin değeri bekleniyor.'));
    return;
  }
  if (options.required && value.trim() === '') {
    issues.push(issue(path, 'string.required', 'Bu alan boş bırakılamaz.'));
  }
  if (options.max !== undefined && value.length > options.max) {
    issues.push(issue(path, 'string.too_long', `Bu alan en fazla ${options.max} karakter olabilir.`));
  }

  const tags = mergeTagsIn(value);
  for (const tag of tags) {
    if (!ALLOWED_MERGE_TAG_KEYS.has(tag)) {
      issues.push(issue(path, 'merge_tag.unknown', `İzin verilmeyen kişiselleştirme alanı: {{${tag}}}`));
    }
  }

  const stripped = value.replace(/{{\s*[A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)*\s*}}/g, '');
  if (stripped.includes('{{') || stripped.includes('}}')) {
    issues.push(issue(path, 'merge_tag.malformed', 'Kişiselleştirme alanı biçimi geçersiz.'));
  }
};

const validateNumber = (
  issues: EmailValidationIssue[],
  value: unknown,
  path: string,
  min: number,
  max: number,
  integer = true
): void => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < min ||
    value > max ||
    (integer && !Number.isInteger(value))
  ) {
    issues.push(issue(path, 'number.out_of_range', `Değer ${min} ile ${max} arasında olmalıdır.`));
  }
};

const validateColor = (issues: EmailValidationIssue[], value: unknown, path: string): void => {
  if (!isSafeHexColor(value)) {
    issues.push(issue(path, 'color.invalid', 'Renk #RGB veya #RRGGBB biçiminde olmalıdır.'));
  }
};

const validateAlign = (issues: EmailValidationIssue[], value: unknown, path: string): void => {
  if (!ALIGNMENTS.includes(value as EmailAlign)) {
    issues.push(issue(path, 'align.invalid', 'Hizalama left, center veya right olmalıdır.'));
  }
};

const validatePadding = (issues: EmailValidationIssue[], value: unknown, path: string): void => {
  if (!isRecord(value)) {
    issues.push(issue(path, 'padding.invalid', 'Dört yönlü boşluk değeri bekleniyor.'));
    return;
  }
  for (const side of ['top', 'right', 'bottom', 'left'] as const) {
    validateNumber(issues, value[side], `${path}.${side}`, 0, 96);
  }
};

const validateUrl = (
  issues: EmailValidationIssue[],
  value: unknown,
  path: string,
  kind: 'link' | 'image',
  allowEmpty = false
): void => {
  validateString(issues, value, path, { required: !allowEmpty, max: 2048 });
  const result = safeUrlProtocol(value, kind, allowEmpty);
  if (!result.safe) {
    issues.push(
      issue(
        path,
        'url.unsafe',
        kind === 'image'
          ? 'Görsel adresi mutlak bir HTTPS adresi veya izinli görsel alanı olmalıdır.'
          : 'Bağlantı http, https, mailto, tel veya izinli URL alanı olmalıdır.'
      )
    );
  } else if (kind === 'link' && result.protocol === 'http:') {
    issues.push(issue(path, 'url.insecure_http', 'HTTPS bağlantısı kullanılması önerilir.', 'warning'));
  }
};

const commonPaddedBlock = (
  issues: EmailValidationIssue[],
  props: Record<string, unknown>,
  path: string
): void => validatePadding(issues, props.padding, `${path}.padding`);

const UNSUBSCRIBE_TOKEN_PATTERN = /{{\s*unsubscribeUrl\s*}}/;

const hasClickableUnsubscribe = (blocks: EmailBlock[]): boolean =>
  blocks.some((block) => {
    switch (block.type) {
      case 'logo':
      case 'image':
      case 'button':
        return UNSUBSCRIBE_TOKEN_PATTERN.test(block.props.href);
      case 'social':
        return block.props.links.some((link) => UNSUBSCRIBE_TOKEN_PATTERN.test(link.url));
      case 'product':
        return UNSUBSCRIBE_TOKEN_PATTERN.test(block.props.url);
      default:
        return false;
    }
  });

const validateBlock = (issues: EmailValidationIssue[], block: EmailBlock, index: number): void => {
  const path = `blocks.${index}`;
  const runtimeBlock = block as unknown as Record<string, unknown>;
  const type = runtimeBlock.type;

  if (!EMAIL_BLOCK_TYPES.includes(type as EmailBlock['type'])) {
    issues.push(issue(`${path}.type`, 'block.unknown_type', `Desteklenmeyen blok türü: ${String(type)}`));
    return;
  }

  if (!isRecord(runtimeBlock.props)) {
    issues.push(issue(`${path}.props`, 'block.props_invalid', 'Blok ayarları nesne olmalıdır.'));
    return;
  }

  const props = runtimeBlock.props;
  switch (type) {
    case 'logo':
      validateUrl(issues, props.src, `${path}.props.src`, 'image');
      validateString(issues, props.alt, `${path}.props.alt`, { required: true, max: 180 });
      validateUrl(issues, props.href, `${path}.props.href`, 'link', true);
      validateNumber(issues, props.width, `${path}.props.width`, 40, 320);
      validateAlign(issues, props.align, `${path}.props.align`);
      commonPaddedBlock(issues, props, `${path}.props`);
      break;
    case 'heading':
      validateString(issues, props.text, `${path}.props.text`, { required: true, max: 500 });
      validateNumber(issues, props.level, `${path}.props.level`, 1, 3);
      validateColor(issues, props.color, `${path}.props.color`);
      validateAlign(issues, props.align, `${path}.props.align`);
      validateNumber(issues, props.fontSize, `${path}.props.fontSize`, 16, 64);
      validateNumber(issues, props.lineHeight, `${path}.props.lineHeight`, 1, 2, false);
      validateNumber(issues, props.fontWeight, `${path}.props.fontWeight`, 400, 900);
      commonPaddedBlock(issues, props, `${path}.props`);
      break;
    case 'text':
      validateString(issues, props.text, `${path}.props.text`, { max: 10_000 });
      validateColor(issues, props.color, `${path}.props.color`);
      validateAlign(issues, props.align, `${path}.props.align`);
      validateNumber(issues, props.fontSize, `${path}.props.fontSize`, 10, 32);
      validateNumber(issues, props.lineHeight, `${path}.props.lineHeight`, 1, 2.2, false);
      commonPaddedBlock(issues, props, `${path}.props`);
      break;
    case 'button':
      validateString(issues, props.label, `${path}.props.label`, { required: true, max: 100 });
      validateUrl(issues, props.href, `${path}.props.href`, 'link');
      validateColor(issues, props.backgroundColor, `${path}.props.backgroundColor`);
      validateColor(issues, props.color, `${path}.props.color`);
      validateAlign(issues, props.align, `${path}.props.align`);
      validateNumber(issues, props.width, `${path}.props.width`, 80, 536);
      validateNumber(issues, props.height, `${path}.props.height`, 32, 72);
      validateNumber(issues, props.borderRadius, `${path}.props.borderRadius`, 0, 32);
      validateNumber(issues, props.fontSize, `${path}.props.fontSize`, 10, 28);
      validateNumber(issues, props.fontWeight, `${path}.props.fontWeight`, 400, 900);
      commonPaddedBlock(issues, props, `${path}.props`);
      break;
    case 'image':
      validateUrl(issues, props.src, `${path}.props.src`, 'image');
      validateString(issues, props.alt, `${path}.props.alt`, { required: true, max: 240 });
      validateUrl(issues, props.href, `${path}.props.href`, 'link', true);
      validateNumber(issues, props.width, `${path}.props.width`, 40, 700);
      validateAlign(issues, props.align, `${path}.props.align`);
      commonPaddedBlock(issues, props, `${path}.props`);
      break;
    case 'divider':
      validateColor(issues, props.color, `${path}.props.color`);
      validateNumber(issues, props.width, `${path}.props.width`, 10, 100);
      validateNumber(issues, props.thickness, `${path}.props.thickness`, 1, 8);
      commonPaddedBlock(issues, props, `${path}.props`);
      break;
    case 'spacer':
      validateNumber(issues, props.height, `${path}.props.height`, 0, 160);
      validateNumber(issues, props.mobileHeight, `${path}.props.mobileHeight`, 0, 120);
      break;
    case 'social': {
      validateString(issues, props.title, `${path}.props.title`, { max: 160 });
      validateColor(issues, props.color, `${path}.props.color`);
      validateAlign(issues, props.align, `${path}.props.align`);
      validateNumber(issues, props.fontSize, `${path}.props.fontSize`, 10, 24);
      commonPaddedBlock(issues, props, `${path}.props`);
      if (!Array.isArray(props.links) || props.links.length > 8) {
        issues.push(issue(`${path}.props.links`, 'social.links_invalid', 'En fazla 8 sosyal bağlantı kullanılabilir.'));
      } else {
        props.links.forEach((link, linkIndex) => {
          const linkPath = `${path}.props.links.${linkIndex}`;
          if (!isRecord(link)) {
            issues.push(issue(linkPath, 'social.link_invalid', 'Sosyal bağlantı nesne olmalıdır.'));
            return;
          }
          if (!EMAIL_SOCIAL_NETWORKS.includes(link.network as (typeof EMAIL_SOCIAL_NETWORKS)[number])) {
            issues.push(issue(`${linkPath}.network`, 'social.network_invalid', 'Sosyal ağ desteklenmiyor.'));
          }
          validateString(issues, link.label, `${linkPath}.label`, { required: true, max: 50 });
          validateUrl(issues, link.url, `${linkPath}.url`, 'link');
        });
      }
      break;
    }
    case 'coupon':
      validateString(issues, props.eyebrow, `${path}.props.eyebrow`, { max: 80 });
      validateString(issues, props.code, `${path}.props.code`, { required: true, max: 80 });
      validateString(issues, props.description, `${path}.props.description`, { max: 500 });
      validateColor(issues, props.backgroundColor, `${path}.props.backgroundColor`);
      validateColor(issues, props.color, `${path}.props.color`);
      validateColor(issues, props.borderColor, `${path}.props.borderColor`);
      validateAlign(issues, props.align, `${path}.props.align`);
      commonPaddedBlock(issues, props, `${path}.props`);
      break;
    case 'product':
      validateUrl(issues, props.imageUrl, `${path}.props.imageUrl`, 'image');
      validateString(issues, props.imageAlt, `${path}.props.imageAlt`, { required: true, max: 240 });
      validateString(issues, props.title, `${path}.props.title`, { required: true, max: 300 });
      validateString(issues, props.description, `${path}.props.description`, { max: 1_000 });
      validateString(issues, props.price, `${path}.props.price`, { required: true, max: 100 });
      validateString(issues, props.oldPrice, `${path}.props.oldPrice`, { max: 100 });
      validateUrl(issues, props.url, `${path}.props.url`, 'link');
      validateString(issues, props.buttonLabel, `${path}.props.buttonLabel`, {
        required: true,
        max: 100,
      });
      validateNumber(issues, props.imageWidth, `${path}.props.imageWidth`, 80, 300);
      validateColor(issues, props.accentColor, `${path}.props.accentColor`);
      validateColor(issues, props.backgroundColor, `${path}.props.backgroundColor`);
      commonPaddedBlock(issues, props, `${path}.props`);
      break;
  }
};

export const validateEmailDocument = (input: unknown): EmailValidationIssue[] => {
  const issues: EmailValidationIssue[] = [];
  if (!isRecord(input)) return [issue('', 'document.invalid', 'E-posta dokümanı nesne olmalıdır.')];

  if (input.kind !== undefined && input.kind !== 'tecof-email') {
    issues.push(issue('kind', 'document.kind_invalid', 'Doküman türü tecof-email olmalıdır.'));
  }
  if (input.version !== undefined && input.version !== 1) {
    issues.push(issue('version', 'document.version_unsupported', 'E-posta dokümanı sürümü desteklenmiyor.'));
  }

  const document = normalizeEmailDocument(input);
  validateString(issues, document.subject, 'subject', { required: true, max: 200 });
  validateString(issues, document.previewText, 'previewText', { max: 250 });
  if (document.subject.length > 60 && document.subject.length <= 200) {
    issues.push(
      issue(
        'subject',
        'subject.recommended_length',
        'Konu satırının mobil görünürlük için 60 karakteri geçmemesi önerilir.',
        'warning'
      )
    );
  }
  if (document.previewText.length > 100 && document.previewText.length <= 250) {
    issues.push(
      issue(
        'previewText',
        'preview_text.recommended_length',
        'Önizleme metninin 100 karakteri geçmemesi önerilir.',
        'warning'
      )
    );
  }
  validateNumber(issues, document.theme.width, 'theme.width', 320, 700);
  validateColor(issues, document.theme.backgroundColor, 'theme.backgroundColor');
  validateColor(issues, document.theme.contentBackgroundColor, 'theme.contentBackgroundColor');
  validateColor(issues, document.theme.primaryColor, 'theme.primaryColor');
  validateColor(issues, document.theme.textColor, 'theme.textColor');
  validateColor(issues, document.theme.mutedTextColor, 'theme.mutedTextColor');
  validateNumber(issues, document.theme.borderRadius, 'theme.borderRadius', 0, 32);
  if (!isSafeFontFamily(document.theme.fontFamily)) {
    issues.push(issue('theme.fontFamily', 'font_family.invalid', 'Yazı tipi ailesi güvenli bir CSS font listesi olmalıdır.'));
  }

  if (document.blocks.length > 200) {
    issues.push(issue('blocks', 'blocks.too_many', 'Bir e-postada en fazla 200 blok kullanılabilir.'));
  } else if (document.blocks.length > 100) {
    issues.push(
      issue(
        'blocks',
        'blocks.recommended_count',
        'Teslimat boyutu için 100 veya daha az blok kullanılması önerilir.',
        'warning'
      )
    );
  }
  if (document.blocks.length === 0) {
    issues.push(issue('blocks', 'blocks.empty', 'E-posta henüz içerik bloğu içermiyor.', 'warning'));
  }

  const ids = new Set<string>();
  document.blocks.forEach((block, index) => {
    const runtimeBlock = block as unknown as Record<string, unknown>;
    if (typeof runtimeBlock.id !== 'string' || !ID_PATTERN.test(runtimeBlock.id)) {
      issues.push(issue(`blocks.${index}.id`, 'block.id_invalid', 'Blok kimliği harfle başlamalı ve güvenli karakterler içermelidir.'));
    } else if (ids.has(runtimeBlock.id)) {
      issues.push(issue(`blocks.${index}.id`, 'block.id_duplicate', 'Blok kimliği benzersiz olmalıdır.'));
    } else {
      ids.add(runtimeBlock.id);
    }
    validateBlock(issues, block, index);
  });

  if (!hasClickableUnsubscribe(document.blocks)) {
    issues.push(
      issue(
        'blocks',
        'compliance.unsubscribe_missing',
        'Pazarlama e-postasına abonelikten çıkış bağlantısı eklenmelidir.',
        'warning'
      )
    );
  }

  return issues;
};

export class EmailValidationError extends Error {
  readonly issues: EmailValidationIssue[];

  constructor(issues: EmailValidationIssue[]) {
    super(`E-posta dokümanı doğrulanamadı (${issues.length} sorun).`);
    this.name = 'EmailValidationError';
    this.issues = issues;
  }
}

export const assertValidEmailDocument = (input: unknown, strict = false): EmailDocument => {
  const issues = validateEmailDocument(input);
  const blocking = issues.filter((item) => item.severity === 'error' || strict);
  if (blocking.length > 0) throw new EmailValidationError(blocking);
  return normalizeEmailDocument(input);
};
