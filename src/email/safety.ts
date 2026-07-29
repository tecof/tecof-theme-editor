import { EMAIL_MERGE_TAGS } from './constants';
import type { EmailMergeData } from './types';

export const MERGE_TAG_PATTERN = /{{\s*([A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)*)\s*}}/g;
export const FULL_MERGE_TAG_PATTERN = /^{{\s*([A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)*)\s*}}$/;

export const ALLOWED_MERGE_TAG_KEYS = new Set(EMAIL_MERGE_TAGS.map((tag) => tag.key));

export const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getNestedValue = (data: EmailMergeData, key: string): unknown => {
  if (Object.prototype.hasOwnProperty.call(data, key)) return data[key];

  let current: unknown = data;
  for (const segment of key.split('.')) {
    if (typeof current !== 'object' || current === null || Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
};

export const resolveMergeTemplate = (
  template: string,
  data: EmailMergeData | undefined,
  preserveMergeTags: boolean,
  context: 'text' | 'url' = 'text'
): string => {
  const fullTag = template.match(FULL_MERGE_TAG_PATTERN);
  if (fullTag) {
    const value = data ? getNestedValue(data, fullTag[1]) : undefined;
    if (value !== undefined && value !== null) return String(value);
    return preserveMergeTags ? template : '';
  }

  return template.replace(MERGE_TAG_PATTERN, (token, key: string) => {
    const value = data ? getNestedValue(data, key) : undefined;
    if (value === undefined || value === null) return preserveMergeTags ? token : '';
    const stringValue = String(value);
    return context === 'url' ? encodeURIComponent(stringValue) : stringValue;
  });
};

export const mergeTagsIn = (value: string): string[] => {
  const tags: string[] = [];
  for (const match of value.matchAll(MERGE_TAG_PATTERN)) tags.push(match[1]);
  return tags;
};

export const isSafeHexColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/.test(value);

export const isSafeFontFamily = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= 160 &&
  !/[;{}<>\r\n]/.test(value) &&
  /^[A-Za-z0-9 ,.'"-]+$/.test(value);

const placeholderUrl = (value: string): string => {
  if (FULL_MERGE_TAG_PATTERN.test(value)) return 'https://email.tecof.invalid/value';
  return value.replace(MERGE_TAG_PATTERN, 'tecof');
};

export const safeUrlProtocol = (
  value: unknown,
  kind: 'link' | 'image',
  allowEmpty = false
): { safe: boolean; protocol?: string } => {
  if (typeof value !== 'string') return { safe: false };
  const trimmed = value.trim();
  if (trimmed === '') return { safe: allowEmpty };
  if ([...trimmed].some((character) => character.charCodeAt(0) <= 32)) return { safe: false };
  if (/[<>"'`\\]/.test(trimmed)) return { safe: false };

  let url: URL;
  try {
    url = new URL(placeholderUrl(trimmed));
  } catch {
    return { safe: false };
  }

  const protocol = url.protocol.toLowerCase();
  const allowed = kind === 'image' ? protocol === 'https:' : ['https:', 'http:', 'mailto:', 'tel:'].includes(protocol);
  return { safe: allowed, protocol };
};
