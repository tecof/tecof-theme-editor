import {
  DEFAULT_EMAIL_THEME,
  EMAIL_BLOCK_DEFAULTS,
  EMAIL_BLOCK_TYPES,
  EMAIL_COLUMN_LAYOUTS,
  EMAIL_DOCUMENT_VERSION,
} from './constants';
import type {
  CreateEmailDocumentInput,
  EmailBlock,
  EmailBlockOfType,
  EmailBlockPropsMap,
  EmailBlockType,
  EmailColumnsLayout,
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
  video: 'video',
  footer: 'footer',
  menu: 'menu',
  nav: 'menu',
  html: 'html',
  code: 'html',
  section: 'section',
  container: 'section',
  columns: 'columns',
  row: 'columns',
});

const CONTAINER_TYPES: ReadonlySet<string> = new Set(['section', 'columns']);

/** Kap kuralı: section yalnız kökte, columns yalnız yaprak alır (backend normalizeBlock ile aynı) */
export const canPlaceEmailBlock = (childType: string, parentType: string | null): boolean => {
  if (!CONTAINER_TYPES.has(childType)) return true;
  if (parentType === 'columns') return false;
  if (childType === 'section') return parentType === null;
  return parentType === null || parentType === 'section';
};

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
  if (type === 'video') {
    applyAlias('thumbnailUrl', source.src, source.imageUrl);
    applyAlias('videoUrl', source.href, source.url);
  }
  if (type === 'menu') applyAlias('items', source.links);
  if (type === 'html') applyAlias('html', source.code, source.content);
  if (type === 'section') applyAlias('backgroundColor', source.bgColor);

  return props;
};

const asBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const normalizeLinkList = (value: unknown, max: number): Array<{ label: string; url: string }> =>
  (Array.isArray(value) ? value : []).slice(0, max).map((item) => {
    const record = isRecord(item) ? item : {};
    return { label: asString(record.label, ''), url: asString(record.url ?? record.href, '') };
  });

const mergeProps = <T extends EmailBlockType>(
  type: T,
  rawProps: Record<string, unknown>,
  depth = 0,
  legacyDocument = false
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
  if (type === 'footer') {
    next.links = aliased.links === undefined ? clone(EMAIL_BLOCK_DEFAULTS.footer.links) : normalizeLinkList(aliased.links, 6);
    next.showUnsubscribe = asBoolean(aliased.showUnsubscribe, true);
  }
  if (type === 'menu') {
    next.items = aliased.items === undefined ? clone(EMAIL_BLOCK_DEFAULTS.menu.items) : normalizeLinkList(aliased.items, 8);
  }
  if (type === 'video') next.showCaption = asBoolean(aliased.showCaption, true);
  if (type === 'section') {
    const children = Array.isArray(aliased.blocks) ? aliased.blocks : [];
    next.blocks = depth >= 2 ? [] : children.map((child, index) => normalizeBlock(child, index, legacyDocument, depth + 1, 'section'));
  }
  if (type === 'columns') {
    const layout = asString(aliased.layout, '1:1') as EmailColumnsLayout;
    const weights = EMAIL_COLUMN_LAYOUTS[layout] ?? EMAIL_COLUMN_LAYOUTS['1:1'];
    next.layout = EMAIL_COLUMN_LAYOUTS[layout] ? layout : '1:1';
    const rawColumns = Array.isArray(aliased.columns) ? aliased.columns : [];
    next.columns = weights.map((_, column) =>
      (Array.isArray(rawColumns[column]) ? (rawColumns[column] as unknown[]) : []).map((child, index) =>
        normalizeBlock(child, index, legacyDocument, depth + 1, 'columns')
      )
    );
    next.stackOnMobile = asBoolean(aliased.stackOnMobile, true);
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

/**
 * Kap kuralına aykırı bloklar (columns içinde kap, iç içe section) bilinmeyen tip gibi
 * OLDUĞU GİBİ bırakılır ki doğrulama raporlayabilsin (silinmez).
 */
const normalizeBlock = (input: unknown, index: number, legacyDocument: boolean, depth = 0, parentType: string | null = null): EmailBlock => {
  const source = isRecord(input) ? input : {};
  const rawType = asString(source.type ?? source.component ?? source.kind, 'text').toLowerCase();
  const type = LEGACY_BLOCK_ALIASES[rawType] ?? rawType;
  const id = asString(source.id, `email-block-${index + 1}`);

  if (!EMAIL_BLOCK_TYPES.includes(type as EmailBlockType) || !canPlaceEmailBlock(type, parentType)) {
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
    props: mergeProps(type as EmailBlockType, rawProps, depth, legacyDocument),
  } as EmailBlock;
};

/** Ağaçtaki bütün blokları gezer (kap içindekiler dâhil) */
export const walkEmailBlocks = (
  blocks: EmailBlock[],
  visit: (block: EmailBlock, parent: EmailBlock | null, depth: number) => void,
  parent: EmailBlock | null = null,
  depth = 0
): void => {
  for (const block of blocks) {
    visit(block, parent, depth);
    /* Kap kuralına aykırı/legacy bloklarda props normalize edilmemiş olabilir — dizi değilse geç */
    const props = (block as unknown as { props?: Record<string, unknown> }).props ?? {};
    if (block.type === 'section' && Array.isArray(props.blocks)) walkEmailBlocks(props.blocks as EmailBlock[], visit, block, depth + 1);
    if (block.type === 'columns' && Array.isArray(props.columns)) {
      (props.columns as unknown[]).forEach((column) => {
        if (Array.isArray(column)) walkEmailBlocks(column as EmailBlock[], visit, block, depth + 1);
      });
    }
  }
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
