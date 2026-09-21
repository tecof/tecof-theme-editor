export type EmailDocumentVersion = 1;

export type EmailAlign = 'left' | 'center' | 'right';

export interface EmailSpacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface EmailTheme {
  width: number;
  backgroundColor: string;
  contentBackgroundColor: string;
  primaryColor: string;
  textColor: string;
  mutedTextColor: string;
  fontFamily: string;
  borderRadius: number;
}

export type EmailVerticalAlign = 'top' | 'middle' | 'bottom';
export type EmailMenuSeparator = 'dot' | 'pipe' | 'space' | 'none';
export type EmailColumnsLayout = '1' | '1:1' | '1:1:1' | '1:1:1:1' | '1:2' | '2:1' | '1:3' | '3:1';

/**
 * Blok kataloğu v1 (2026-09-21 genişletmesi): yaprak + kap blokları.
 * Doğruluk kaynağı backend `_emailDocument.ts`; burası aynı sözleşme.
 * Kap kuralı: section yalnız en üst düzeyde, columns yalnız yaprak alır.
 */
export type EmailBlockType =
  | 'logo'
  | 'heading'
  | 'text'
  | 'button'
  | 'image'
  | 'divider'
  | 'spacer'
  | 'social'
  | 'coupon'
  | 'product'
  | 'video'
  | 'footer'
  | 'menu'
  | 'html'
  | 'section'
  | 'columns';

export type EmailContainerBlockType = 'section' | 'columns';
export type EmailLeafBlockType = Exclude<EmailBlockType, EmailContainerBlockType>;

export interface EmailLink {
  label: string;
  url: string;
}

export interface EmailLogoProps {
  src: string;
  alt: string;
  href: string;
  width: number;
  align: EmailAlign;
  padding: EmailSpacing;
}

export interface EmailHeadingProps {
  text: string;
  level: 1 | 2 | 3;
  color: string;
  align: EmailAlign;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  padding: EmailSpacing;
}

export interface EmailTextProps {
  text: string;
  color: string;
  align: EmailAlign;
  fontSize: number;
  lineHeight: number;
  padding: EmailSpacing;
}

export interface EmailButtonProps {
  label: string;
  href: string;
  backgroundColor: string;
  color: string;
  align: EmailAlign;
  width: number;
  height: number;
  borderRadius: number;
  fontSize: number;
  fontWeight: number;
  padding: EmailSpacing;
}

export interface EmailImageProps {
  src: string;
  alt: string;
  href: string;
  width: number;
  align: EmailAlign;
  padding: EmailSpacing;
}

export interface EmailDividerProps {
  color: string;
  width: number;
  thickness: number;
  padding: EmailSpacing;
}

export interface EmailSpacerProps {
  height: number;
  mobileHeight: number;
}

export type EmailSocialNetwork =
  | 'instagram'
  | 'facebook'
  | 'x'
  | 'youtube'
  | 'linkedin'
  | 'tiktok'
  | 'website';

export interface EmailSocialLink {
  network: EmailSocialNetwork;
  label: string;
  url: string;
}

export interface EmailSocialProps {
  title: string;
  links: EmailSocialLink[];
  color: string;
  align: EmailAlign;
  fontSize: number;
  padding: EmailSpacing;
}

export interface EmailCouponProps {
  eyebrow: string;
  code: string;
  description: string;
  backgroundColor: string;
  color: string;
  borderColor: string;
  align: EmailAlign;
  padding: EmailSpacing;
}

export interface EmailProductProps {
  imageUrl: string;
  imageAlt: string;
  title: string;
  description: string;
  price: string;
  oldPrice: string;
  url: string;
  buttonLabel: string;
  imageWidth: number;
  accentColor: string;
  backgroundColor: string;
  padding: EmailSpacing;
}

export interface EmailVideoProps {
  thumbnailUrl: string;
  videoUrl: string;
  alt: string;
  caption: string;
  showCaption: boolean;
  width: number;
  align: EmailAlign;
  padding: EmailSpacing;
}

export interface EmailFooterProps {
  text: string;
  color: string;
  fontSize: number;
  align: EmailAlign;
  links: EmailLink[];
  showUnsubscribe: boolean;
  unsubscribeLabel: string;
  padding: EmailSpacing;
}

export interface EmailMenuProps {
  items: EmailLink[];
  color: string;
  fontSize: number;
  fontWeight: number;
  align: EmailAlign;
  separator: EmailMenuSeparator;
  padding: EmailSpacing;
}

export interface EmailHtmlProps {
  html: string;
  padding: EmailSpacing;
}

export interface EmailSectionProps {
  backgroundColor: string;
  borderRadius: number;
  padding: EmailSpacing;
  blocks: EmailBlock[];
}

export interface EmailColumnsProps {
  layout: EmailColumnsLayout;
  gap: number;
  verticalAlign: EmailVerticalAlign;
  stackOnMobile: boolean;
  padding: EmailSpacing;
  columns: EmailBlock[][];
}

export interface EmailBlockPropsMap {
  logo: EmailLogoProps;
  heading: EmailHeadingProps;
  text: EmailTextProps;
  button: EmailButtonProps;
  image: EmailImageProps;
  divider: EmailDividerProps;
  spacer: EmailSpacerProps;
  social: EmailSocialProps;
  coupon: EmailCouponProps;
  product: EmailProductProps;
  video: EmailVideoProps;
  footer: EmailFooterProps;
  menu: EmailMenuProps;
  html: EmailHtmlProps;
  section: EmailSectionProps;
  columns: EmailColumnsProps;
}

export type EmailBlockOfType<T extends EmailBlockType> = {
  id: string;
  type: T;
  props: EmailBlockPropsMap[T];
};

export type EmailBlock = {
  [T in EmailBlockType]: EmailBlockOfType<T>;
}[EmailBlockType];

export interface EmailDocument {
  kind: 'tecof-email';
  version: EmailDocumentVersion;
  subject: string;
  previewText: string;
  theme: EmailTheme;
  blocks: EmailBlock[];
}

export interface EmailMergeTag {
  key: string;
  token: string;
  label: string;
  group:
    | 'customer'
    | 'merchant'
    | 'campaign'
    | 'coupon'
    | 'product'
    | 'order'
    | 'payment'
    | 'return'
    | 'cart'
    | 'system';
  description: string;
}

export interface EmailBlockCatalogItem<T extends EmailBlockType = EmailBlockType> {
  type: T;
  label: string;
  description: string;
  category: 'content' | 'commerce' | 'layout';
  defaultProps: EmailBlockPropsMap[T];
}

export interface EmailValidationIssue {
  path: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
  /** Sorunun ait olduğu blok (kap içindekiler dâhil) */
  blockId?: string;
}

export type EmailMergeData = Record<string, unknown>;

export interface RenderEmailOptions {
  mergeData?: EmailMergeData;
  preserveMergeTags?: boolean;
  strict?: boolean;
  lang?: string;
}

export interface EmailPreset {
  key: string;
  name: string;
  description: string;
  emoji: string;
  accent: string;
  purpose: 'marketing' | 'transactional';
  subject: string;
  previewText: string;
  build: () => EmailDocument;
}

export interface CreateEmailDocumentInput {
  subject?: string;
  previewText?: string;
  theme?: Partial<EmailTheme>;
  blocks?: EmailBlock[];
}
