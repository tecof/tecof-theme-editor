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
  | 'product';

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
  group: 'customer' | 'merchant' | 'campaign' | 'coupon' | 'product' | 'order' | 'cart' | 'system';
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
