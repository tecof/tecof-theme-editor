import {
  DEFAULT_EMAIL_THEME,
  EMAIL_BLOCK_DEFAULTS,
  EMAIL_BLOCK_TYPES,
  EMAIL_DOCUMENT_VERSION,
} from './constants';
import type {
  CreateEmailDocumentInput,
  EmailBlock,
  EmailBlockOfType,
  EmailBlockPropsMap,
  EmailBlockType,
  EmailDocument,
  EmailSpacing,
  EmailTheme,
} from './types';

const LEGACY_BLOCK_ALIASES: Readonly<Record<string, EmailBlockType>> = Object.freeze({
  logo: 'logo',
  heading: 'heading',
  title: 'heading',
  text: 'text',
  paragraph: 'text',
  richtext: 'text',
  button: 'button',
  cta: 'button',
  image: 'image',
  hero: 'image',
  divider: 'divider',
  separator: 'divider',
  spacer: 'spacer',
  space: 'spacer',
  social: 'social',
  coupon: 'coupon',
  product: 'product',
  products: 'product',
});

const LEGACY_MERGE_TAG_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  firstName: 'customer.firstName',
  lastName: 'customer.lastName',
  fullName: 'customer.fullName',
  email: 'customer.email',
  orderNumber: 'order.number',
  totalPrice: 'order.total',
  orderDate: 'order.date',
  carrier: 'order.carrier',
  trackingNumber: 'order.trackingNumber',
  trackingUrl: 'order.trackingUrl',
});

let generatedId = 0;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const normalizeLegacyMergeTags = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return value.replace(/{{\s*([A-Za-z][A-Za-z0-9]*)\s*}}/g, (token, key: string) => {
      const canonical = LEGACY_MERGE_TAG_ALIASES[key];
      return canonical ? `{{${canonical}}}` : token;
    });
  }
  if (Array.isArray(value)) return value.map(normalizeLegacyMergeTags);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, normalizeLegacyMergeTags(nested)])
    );
  }
  return value;
};

const generatedBlockId = (type: EmailBlockType): string => {
  generatedId += 1;
  return `email-${type}-${Date.now().toString(36)}-${generatedId.toString(36)}`;
};

const asFiniteNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return fallback;
};

const asString = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

const normalizePadding = (value: unknown, source: Record<string, unknown>, fallback: EmailSpacing): EmailSpacing => {
  if (typeof value === 'number' || typeof value === 'string') {
    const all = asFiniteNumber(value, fallback.top);
    return { top: all, right: all, bottom: all, left: all };
  }

  const padding = isRecord(value) ? value : {};
  return {
    top: asFiniteNumber(padding.top ?? source.paddingTop, fallback.top),
    right: asFiniteNumber(padding.right ?? source.paddingRight, fallback.right),
    bottom: asFiniteNumber(padding.bottom ?? source.paddingBottom, fallback.bottom),
    left: asFiniteNumber(padding.left ?? source.paddingLeft, fallback.left),
  };
};

const withLegacyAliases = (type: EmailBlockType, source: Record<string, unknown>): Record<string, unknown> => {
  const props = { ...source };

  const applyAlias = (key: string, ...candidates: unknown[]): void => {
    if (props[key] !== undefined && props[key] !== null) return;
    const alias = candidates.find((candidate) => candidate !== undefined && candidate !== null);
    if (alias !== undefined) props[key] = alias;
  };

  if (type === 'heading' || type === 'text') {
    applyAlias('text', source.content, source.body, source.title);
  }
  if (type === 'button') {
    applyAlias('label', source.text, source.title);
    applyAlias('href', source.url, source.link);
    applyAlias('backgroundColor', source.bgColor);
    applyAlias('color', source.textColor);
    applyAlias('borderRadius', source.radius);
  }
  if (type === 'image' || type === 'logo') {
    applyAlias('src', source.url, source.imageUrl, source.image);
    applyAlias('href', source.link);
  }
  if (type === 'divider') applyAlias('thickness', source.size);
  if (type === 'spacer') applyAlias('height', source.size);
  if (type === 'coupon') {
    applyAlias('code', source.couponCode);
    applyAlias('eyebrow', source.title);
    applyAlias('backgroundColor', source.bgColor);
    applyAlias('color', source.textColor);
  }
  if (type === 'product') {
    applyAlias('imageUrl', source.image, source.src);
    applyAlias('title', source.name);
    applyAlias('url', source.href, source.link);
    applyAlias('buttonLabel', source.ctaLabel, source.buttonText);
  }

  return props;
};

const mergeProps = <T extends EmailBlockType>(
  type: T,
  rawProps: Record<string, unknown>
): EmailBlockPropsMap[T] => {
  const defaults = clone(EMAIL_BLOCK_DEFAULTS[type]) as EmailBlockPropsMap[T];
  const aliased = withLegacyAliases(type, rawProps);
  const next = { ...defaults, ...aliased } as EmailBlockPropsMap[T] & Record<string, unknown>;

  if ('padding' in defaults) {
    next.padding = normalizePadding(
      aliased.padding,
      aliased,
      (defaults as EmailBlockPropsMap[Exclude<EmailBlockType, 'spacer'>]).padding
    );
  }

  if (type === 'social') {
    next.links = Array.isArray(aliased.links) ? clone(aliased.links) : clone(EMAIL_BLOCK_DEFAULTS.social.links);
  }

  return next as EmailBlockPropsMap[T];
};

export function createEmailBlock<T extends EmailBlockType>(
  type: T,
  props: Partial<EmailBlockPropsMap[T]> = {},
  id?: string
): EmailBlockOfType<T> {
  return {
    id: id ?? generatedBlockId(type),
    type,
    props: mergeProps(type, props as Record<string, unknown>),
  };
}

const normalizeTheme = (input: unknown): EmailTheme => {
  const source = isRecord(input) ? input : {};
  return {
    width: asFiniteNumber(source.width ?? source.maxWidth, DEFAULT_EMAIL_THEME.width),
    backgroundColor: asString(
      source.backgroundColor ?? source.bodyBackground ?? source.background ?? source.bgColor,
      DEFAULT_EMAIL_THEME.backgroundColor
    ),
    contentBackgroundColor: asString(
      source.contentBackgroundColor ?? source.contentBackground ?? source.contentBgColor,
      DEFAULT_EMAIL_THEME.contentBackgroundColor
    ),
    primaryColor: asString(
      source.primaryColor ?? source.brandColor ?? source.accentColor ?? source.linkColor,
      DEFAULT_EMAIL_THEME.primaryColor
    ),
    textColor: asString(source.textColor ?? source.foregroundColor, DEFAULT_EMAIL_THEME.textColor),
    mutedTextColor: asString(
      source.mutedTextColor ?? source.mutedColor,
      DEFAULT_EMAIL_THEME.mutedTextColor
    ),
    fontFamily: asString(source.fontFamily ?? source.font, DEFAULT_EMAIL_THEME.fontFamily),
    borderRadius: asFiniteNumber(
      source.borderRadius ?? source.radius,
      DEFAULT_EMAIL_THEME.borderRadius
    ),
  };
};

const blockSource = (input: Record<string, unknown>): Record<string, unknown> => {
  const nested = input.props ?? input.data ?? input.settings;
  if (isRecord(nested)) return nested;

  const direct = { ...input };
  delete direct.id;
  delete direct.type;
  delete direct.kind;
  delete direct.component;
  return direct;
};

const normalizeBlock = (input: unknown, index: number, legacyDocument: boolean): EmailBlock => {
  const source = isRecord(input) ? input : {};
  const rawType = asString(source.type ?? source.component ?? source.kind, 'text').toLowerCase();
  const type = LEGACY_BLOCK_ALIASES[rawType] ?? rawType;
  const id = asString(source.id, `email-block-${index + 1}`);

  if (!EMAIL_BLOCK_TYPES.includes(type as EmailBlockType)) {
    return {
      id,
      type,
      props: normalizeLegacyMergeTags(blockSource(source)),
    } as unknown as EmailBlock;
  }

  let rawProps = normalizeLegacyMergeTags(blockSource(source)) as Record<string, unknown>;
  if (legacyDocument && type === 'image' && rawProps.width !== undefined) {
    const percentage = asFiniteNumber(rawProps.width, Number.NaN);
    if (Number.isFinite(percentage) && percentage > 0 && percentage <= 100) {
      rawProps = { ...rawProps, width: Math.round((536 * percentage) / 100) };
    }
  }

  return {
    id,
    type,
    props: mergeProps(type as EmailBlockType, rawProps),
  } as EmailBlock;
};

/**
 * Converts the current document shape and the former `blocks + theme` shape to
 * the canonical, versioned e-mail document. Unknown block types remain intact
 * so validation can report them instead of silently deleting merchant content.
 */
export const normalizeEmailDocument = (input: unknown): EmailDocument => {
  const source = isRecord(input) ? input : {};
  const legacyDocument = source.kind !== 'tecof-email' || source.version !== EMAIL_DOCUMENT_VERSION;
  const rawBlocks = Array.isArray(source.blocks)
    ? source.blocks
    : Array.isArray(source.content)
      ? source.content
      : [];

  return {
    kind: 'tecof-email',
    version: EMAIL_DOCUMENT_VERSION,
    subject: normalizeLegacyMergeTags(asString(source.subject, 'Yeni kampanya')) as string,
    previewText: normalizeLegacyMergeTags(asString(source.previewText ?? source.preheader, '')) as string,
    theme: normalizeTheme(source.theme),
    blocks: rawBlocks.map((block, index) => normalizeBlock(block, index, legacyDocument)),
  };
};

export const createEmailDocument = (input: CreateEmailDocumentInput = {}): EmailDocument =>
  normalizeEmailDocument({
    kind: 'tecof-email',
    version: EMAIL_DOCUMENT_VERSION,
    subject: input.subject ?? 'Yeni kampanya',
    previewText: input.previewText ?? '',
    theme: { ...DEFAULT_EMAIL_THEME, ...(input.theme ?? {}) },
    blocks: input.blocks ?? [],
  });
