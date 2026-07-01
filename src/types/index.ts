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
    | 'boolean'
    | 'toggle'
    | 'range'
    | 'radio'
    | 'array'
    | 'object'
    | 'slot'
    | string;
  /** Human-readable label shown in the inspector. */
  label?: string;
  /** Options for `select` / `radio` fields. */
  options?: any;
  /** Default value applied when the field is empty. */
  defaultValue?: any;
  /** `range`: minimum value (default 0). */
  min?: number;
  /** `range`: maximum value (default 100). */
  max?: number;
  /** `range`: step increment (default 1). */
  step?: number;
  /** `range`: unit suffix shown next to the value (e.g. `'px'`, `'%'`). */
  unit?: string;
  /** `boolean`/`toggle`: text shown when on/off (default `'Açık'`/`'Kapalı'`). */
  onLabel?: string;
  offLabel?: string;
  /** Sub-fields for `array` items. */
  arrayFields?: Record<string, FieldConfig>;
  /** Sub-fields for `object` fields. */
  objectFields?: Record<string, FieldConfig>;
  /**
   * For `slot` fields: lay children out side-by-side (`'horizontal'`) instead of
   * stacked (`'vertical'`, the default). Drives both the editor's drop axis /
   * indicator and the published layout.
   */
  orientation?: 'vertical' | 'horizontal';
  /**
   * For `text` / `textarea` fields: show the CMS data-binding button that inserts
   * a `{{ data.field }}` reference. Defaults to `true`; set `false` to hide it.
   */
  bindable?: boolean;
  /**
   * Render this field disabled (static). Dynamic/computed read-only state comes
   * from a component's `resolveData().readOnly`; the two are OR-ed together.
   */
  readOnly?: boolean;
  /** Custom render escape hatch for non-built-in field types. */
  render?: (props: any) => React.ReactNode;
  /** Allow host-specific extra props without breaking typing. */
  [key: string]: any;
}

/**
 * Context passed to `resolveFields`: the base (statically-declared) field set plus
 * the standard change tracking from {@link ResolveContext}.
 */
export interface ResolveFieldsContext extends ResolveContext {
  /** The component's statically-declared fields — the starting point to extend. */
  fields: Record<string, FieldConfig>;
}

/**
 * Result of a component's `resolveData`. `props` are DERIVED prop values written
 * back to the node (loop-guarded: only the real diff is committed); `readOnly`
 * disables individual fields by name in the inspector.
 */
export interface ResolveDataResult {
  props?: Record<string, any>;
  readOnly?: Record<string, boolean>;
}

/**
 * Feature-permission flags for a node. Every permission defaults to `true`
 * (permissive): hosts opt INTO restrictions by setting a flag to `false`. The
 * index signature allows host-specific custom permissions.
 */
export interface Permissions {
  /** May the node be dragged / moved (canvas + layers)? */
  drag: boolean;
  /** May the node be deleted (single, bulk, or via cut)? */
  delete: boolean;
  /** May the node be duplicated / copy-pasted as a new node? */
  duplicate: boolean;
  /** Are the node's fields editable in the inspector? */
  edit: boolean;
  [key: string]: boolean;
}

/**
 * Context passed to dynamic resolvers (`resolvePermissions`, and later
 * `resolveFields` / `resolveData`). `changed` marks which props changed since the
 * previous resolve; `lastProps` is the previous prop snapshot (null on first run).
 */
export interface ResolveContext {
  changed: Record<string, boolean>;
  lastProps: Record<string, any> | null;
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
  /** If true, removes the editor's div wrapper. The component must attach puck.dragRef to its root element. */
  inline?: boolean;
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
  /* ─ Permissions (optional, permissive by default) ─ */
  /** Per-component permission overrides, merged OVER the global `permissions`. */
  permissions?: Partial<Permissions>;
  /** Dynamically compute permissions from the node's current props. */
  resolvePermissions?: (props: any, ctx: ResolveContext) => Partial<Permissions>;
  /* ─ Dynamic fields / props (optional, Puck-compatible) ─ */
  /**
   * Dynamically compute the editable field set from the node's current props —
   * e.g. show a `url` field only when `type === 'link'`. May be sync or async.
   * Falls back to the static `fields` on throw.
   */
  resolveFields?: (
    props: any,
    ctx: ResolveFieldsContext
  ) => Record<string, FieldConfig> | Promise<Record<string, FieldConfig>>;
  /**
   * Dynamically derive props and per-field read-only state from current props —
   * e.g. derive `slug` from `title` and lock it. Derived `props` are written back
   * loop-guarded (only the diff commits); must be idempotent. May be sync/async.
   */
  resolveData?: (
    props: any,
    ctx: ResolveContext
  ) => ResolveDataResult | Promise<ResolveDataResult>;
  /** Allow host-specific extra props without breaking typing. */
  [key: string]: any;
}

/**
 * A pre-built section template: a self-contained subtree (a root node plus the
 * zones describing its children) that the "Bölüm Ekle" library inserts in one
 * click, with fresh ids. Great for hero/feature/CTA layouts.
 */
export interface SectionTemplate {
  /** Stable id (also used as the React key). */
  id: string;
  /** Display name in the template library. */
  label: string;
  /** Optional category bucket in the picker. */
  category?: string;
  /** Optional preview image URL shown on the card. */
  thumbnail?: string;
  /** The subtree to insert: a root node and (optionally) its descendant zones. */
  payload: {
    node: TecofNode;
    zones?: Record<string, TecofNode[]>;
  };
}

/**
 * Declarative data migration applied to a saved document before it is edited or
 * rendered — upgrades old data when component types are renamed or prop schemas
 * change. Runs in order: rename → transformProps → migrate; then the schema
 * version is stamped on `root.props._schemaVersion`.
 */
export interface MigrationConfig {
  /**
   * Target schema version. When set, a document already stamped at/above this
   * version is returned untouched (idempotent for saved data). Omit to always run
   * the transforms (they must then be idempotent themselves).
   */
  version?: number;
  /** Rename component types: `{ oldType: newType }`. Applied first. */
  renameComponents?: Record<string, string>;
  /**
   * Per-(resulting)-type prop transforms. Looked up by the type AFTER any rename.
   * The node id is always preserved regardless of what the transform returns.
   */
  transformProps?: Record<string, (props: any) => any>;
  /** Final custom pass over the whole document (runs last). */
  migrate?: (doc: TecofDocument) => TecofDocument;
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
  /** Optional pre-built section templates shown in the "Bölüm Ekle" library. */
  templates?: SectionTemplate[];
  /** Global feature permissions. Component configs may override per type. */
  permissions?: Partial<Permissions>;
  /** Optional data migration applied whenever a document is loaded/rendered. */
  migrations?: MigrationConfig;
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
  /**
   * Enable debounced automatic draft saving after edits settle. Off by default
   * so existing hosts keep full control over when `savePage` runs.
   */
  autoSave?: boolean;
  /** Idle delay in ms before an autosave fires once `autoSave` is on. Default 2000. */
  autoSaveDelay?: number;
  /**
   * Show the browser's native "unsaved changes" prompt on navigation/close while
   * there are unpersisted edits. Default true; set false to suppress it.
   */
  warnOnUnsavedChanges?: boolean;
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
