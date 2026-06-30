/* ─── Color Types ─── */

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  card: string;
  cardForeground: string;
  destructive: string;
}

/* ─── Typography Types ─── */

export interface ThemeTypography {
  fontFamily: string;
  headingFontFamily: string;
  baseFontSize: number;
  lineHeight: number;
  headingScale: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
  fontWeightNormal: number;
  fontWeightMedium: number;
  fontWeightBold: number;
}

/* ─── Spacing Types ─── */

export interface ThemeSpacing {
  containerMaxWidth: number;
  sectionPaddingY: number;
  sectionPaddingX: number;
  componentGap: number;
  borderRadius: number;
  borderRadiusLg: number;
  borderRadiusSm: number;
}

/* ─── Theme Config ─── */

export interface ThemeConfig {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  customTokens?: Record<string, string>;
}

/* ─── HSL ─── */

export interface HSL {
  h: number;
  s: number;
  l: number;
}

/* ─── Puck Data Types ─── */

export interface PuckContentItem {
  type: string;
  props: Record<string, any>;
}

export interface PuckPageData {
  content: PuckContentItem[];
  root: { props: Record<string, any> };
  zones: Record<string, any>;
}

/* ─── API Types ─── */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PageApiData {
  _id?: string;
  slug: string;
  title?: string;
  draftData: PuckPageData;
  status?: string;
  [key: string]: any;
}

/* ─── Studio Config Types ───
 *
 * Typed shape of the editor configuration that hosts pass in as `config`.
 * Intentionally permissive: every interface carries an index signature so that
 * existing `any`-shaped host configs continue to typecheck. The goal is better
 * DX (autocomplete on built-in fields), not strict validation.
 */

/** Option entry used by `select` / `radio` fields. */
export interface FieldOption {
  label: string;
  value: string | number | boolean;
}

/**
 * Configuration for a single editable field. Covers the built-in field types
 * plus a `render` escape hatch for fully custom fields. The `type` discriminant
 * is optional/loose on purpose so legacy configs keep compiling.
 */
export interface FieldConfig {
  /** Built-in field kind. Custom fields may omit this and supply `render`. */
  type?:
    | 'text'
    | 'textarea'
    | 'select'
    | 'number'
    | 'radio'
    | 'array'
    | 'object'
    | 'slot'
    | string;
  /** Human-readable label shown in the inspector. */
  label?: string;
  /** Options for `select` / `radio` fields. */
  options?: FieldOption[];
  /** Default value applied when the field is empty. */
  defaultValue?: any;
  /** Sub-fields for `array` items. */
  arrayFields?: Record<string, FieldConfig>;
  /** Sub-fields for `object` fields. */
  objectFields?: Record<string, FieldConfig>;
  /** Custom render escape hatch for non-built-in field types. */
  render?: (props: any) => React.ReactNode;
  /** Allow host-specific extra props without breaking typing. */
  [key: string]: any;
}

/**
 * Configuration for a single component registered in the studio. `render` is
 * the only required member; everything else is optional metadata or behavior.
 */
export interface ComponentConfig {
  /** Display name in the component picker. */
  label?: string;
  /** Grouping category in the component picker. */
  category?: string;
  /** Editable fields for this component, keyed by prop name. */
  fields?: Record<string, FieldConfig>;
  /** Default props applied when the component is inserted. */
  defaultProps?: Record<string, any>;
  /** Renders the component for a given set of props. */
  render: (props: any) => React.ReactNode;
  /** Arbitrary host metadata. */
  metadata?: Record<string, any>;
  /* ─ Drop rules (optional, consumed by the engine where supported) ─ */
  /** Whether this component can contain child nodes (slot/zones). */
  acceptsChildren?: boolean;
  /** Maximum number of direct children allowed. */
  maxItems?: number;
  /** Component types that may contain this component as a child. */
  allowedParents?: string[];
  /** Allow host-specific extra props without breaking typing. */
  [key: string]: any;
}

/**
 * Top-level studio configuration. Permissive index signature preserves
 * compatibility with existing host configs.
 */
export interface StudioConfig {
  /** Registered components, keyed by component type. */
  components: Record<string, ComponentConfig>;
  /** Optional ordered category definitions for the component picker. */
  categories?: Record<string, { title?: string; components?: string[]; [key: string]: any }>;
  /** Root-level fields and renderer (page wrapper). */
  root?: {
    fields?: Record<string, FieldConfig>;
    render?: (props: any) => React.ReactNode;
    [key: string]: any;
  };
  /** Allow host-specific extra props without breaking typing. */
  [key: string]: any;
}

/* ─── Provider Props ─── */

export interface TecofProviderProps {
  /** Tecof backend API base URL */
  apiUrl: string;
  /** Merchant secret key */
  secretKey: string;
  /** CDN base URL for media files (defaults to apiUrl if not provided) */
  cdnUrl?: string;
  /** React children */
  children: React.ReactNode;
}

/* ─── Tecof Editor Props ─── */

export interface TecofEditorProps {
  /** Page ID to load and edit */
  pageId: string;
  /** Tecof/Puck-compatible component configuration */
  config: StudioConfig;
  /** Access token for save operations (sent as Authorization header) */
  accessToken?: string;
  /**
   * Target origin for host postMessage communication. When set, host messages
   * are posted only to this origin instead of the wildcard `'*'`. Omit to keep
   * the backward-compatible wildcard behavior.
   */
  hostOrigin?: string;
  /** Called after successful draft save */
  onSave?: (data: PuckPageData) => void;
  /** Called on every editor change */
  onChange?: (data: PuckPageData) => void;
  /** Legacy editor UI overrides (reserved, currently ignored by TecofStudio) */
  overrides?: Record<string, any>;
  /** Additional editor plugins (reserved for host integrations) */
  plugins?: any[];
  /** Additional class name */
  className?: string;
}

/* ─── Tecof Render Props ─── */

export interface TecofRenderProps {
  /** Pre-fetched page data */
  data: PuckPageData;
  /** Tecof/Puck-compatible component configuration */
  config: StudioConfig;
  /** Additional class name */
  className?: string;
  /** Raw CMS item data (only present for CMS template pages) */
  cmsData?: Record<string, any> | null;
}

/* ─── Merchant Info ─── */

export interface MerchantInfoData {
  /** Available language codes (e.g. ["tr", "en", "de"]) */
  languages: string[];
  /** Default language code (e.g. "tr") */
  defaultLanguage: string;
  isUnderConstruction?: boolean;
}

/* ─── Language Field Value ─── */

export interface LanguageFieldValue {
  code: string;
  value: string;
}

/* ─── Uploaded File ─── */

export interface UploadedFile {
  _id?: string;
  name: string;
  size: number;
  type: string;            // "png" | "jpg" | "external" | ...
  mimeType?: string;
  /** Direct URL for external images (e.g. Freepik stock photos) */
  url?: string;
  folder?: string;
  provider?: string;       // "sftp" | "external"
  meta?: {
    width?: number;
    height?: number;
    webp?: string;
    thumbnail?: string;
    medium?: string;
    large?: string;
    [key: string]: any;
  };
}

/* ─── Link Field ─── */

export interface LinkFieldValue {
  url: string;
  label?: string;
  target?: '_self' | '_blank';
  type?: 'page' | 'custom';
}

export interface LocalizedLinkFieldValue {
  code: string;
  value: LinkFieldValue;
}

/* ─── Tecof Studio Types ─── */

export interface TecofNode {
  type: string;
  props: { id: string } & Record<string, any>;
}

export interface TecofDocument {
  root: { props: Record<string, any> };
  content: TecofNode[];
  zones: Record<string, TecofNode[]>;
}
