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

/* ─── Custom Font ─── */

/**
 * An uploaded/self-hosted font registered as an `@font-face`. `id` is a stable
 * kebab-case slug (used in `--font-<id>` vars and per-node `font-[<id>]` tokens),
 * `family` is the CSS font-family name, `src` the file URL.
 */
export interface CustomFont {
  id: string;
  family: string;
  src: string;
  weight?: number | string;
  style?: 'normal' | 'italic';
  /** `src url() format()` hint, e.g. `'woff2'`, `'truetype'`. */
  format?: string;
}

/* ─── Theme Config ─── */

export interface ThemeConfig {
  colors: ThemeColors;
  /**
   * Dark-mode palette. Only the keys you set override `colors`; the rest fall
   * back to their light value. Emitted as a `:root.dark { --theme-color-* }`
   * block by `generateCSSVariables(theme, { dark: true })`, and ONLY when the
   * host enables `config.darkMode` — otherwise ignored entirely. Edited per-theme
   * in the studio's Tema panel (or auto-derived from `colors` via
   * `deriveDarkColors`).
   */
  darkColors?: Partial<ThemeColors>;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  customTokens?: Record<string, string>;
  /** Uploaded/self-hosted fonts, injected as `@font-face` in editor + publish. */
  customFonts?: CustomFont[];
  /** Builtin font ids in use — drives which Google Fonts links get loaded. */
  fonts?: string[];
}

export interface DeepPartialThemeConfig {
  colors?: Partial<ThemeColors>;
  /** Dark-mode palette override (see {@link ThemeConfig.darkColors}). */
  darkColors?: Partial<ThemeColors>;
  typography?: Partial<ThemeTypography> & {
    headingScale?: Partial<ThemeTypography['headingScale']>;
  };
  spacing?: Partial<ThemeSpacing>;
  customTokens?: Record<string, string>;
  customFonts?: CustomFont[];
  fonts?: string[];
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
 * One bindable field of a repeat-zone item, offered in the `{ }` binding popover
 * as a `{{ item.<key> }}` token. Declared explicitly via a slot field's
 * `itemSchema`, or inferred from the first row of its `repeatSource` array.
 */
export interface ItemSchemaField {
  /** Property path on the row object (dot paths allowed, e.g. `meta.title`). */
  key: string;
  /** Display name in the binding popover (defaults to the key). */
  label?: string;
  /** Loose type hint shown as meta text (e.g. `text`, `image`, `list`). */
  type?: string;
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
   * For `slot` fields: marks this zone as a REPEAT TEMPLATE. Names a sibling prop
   * whose array value drives the repetition — e.g. a RepeaterField's rows or a
   * list fetched into a prop. The zone's children are designed once in the editor
   * and rendered once per row on publish; `{{ item.<key> }}` tokens inside the
   * template resolve against the current row. Components can instead pass rows at
   * render time via `puck.renderDropZone({ zone, repeatItems })` (e.g. API data).
   */
  repeatSource?: string;
  /**
   * For repeat `slot` fields: the bindable item fields offered by the `{ }`
   * binding popover inside this template. Optional — when omitted, the schema is
   * inferred from the first row of the `repeatSource` array. Declare it when rows
   * arrive only at render time (`repeatItems`) or to curate/label the list.
   */
  itemSchema?: ItemSchemaField[];
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
/** One named prop preset of a component (see `ComponentConfig.variants`). */
export interface ComponentVariant {
  /** Display name of the variant (e.g. "Primary"). */
  label: string;
  /** Props merged over the node when the variant is inserted/applied. */
  props: Record<string, any>;
}

/**
 * An Inspector field group: a `name` (accordion header) and the ordered `fields`
 * (prop names) it contains. See {@link ComponentConfig.fieldsGroups}.
 */
export interface FieldGroup {
  name: string;
  fields: string[];
}

export interface ComponentConfig {
  /** Display name in the component picker. */
  label?: string;
  /** Grouping category in the component picker. */
  category?: string;
  /** Editable fields for this component, keyed by prop name. */
  fields?: Record<string, FieldConfig>;
  /**
   * Optional accordion grouping for the Inspector fields. Each group's `fields`
   * (prop names) render together under a collapsible header, in the given order;
   * any field not listed in a group renders flat after the groups. When
   * `fieldsGroups` is absent or empty the Inspector shows every field flat (the
   * default), so this is purely additive.
   */
  fieldsGroups?: FieldGroup[];
  /** Default props applied when the component is inserted. */
  defaultProps?: Record<string, any>;
  /**
   * Named prop presets for this component (design-system variants — e.g. a
   * Button's Primary/Ghost/Outline). Each variant shows as its own card in the
   * "Bölüm Ekle" modal and as a switcher chip in the Inspector; applying one
   * merges `props` over the node (plus a `_variant` marker for the active chip).
   */
  variants?: Record<string, ComponentVariant>;
  /**
   * Default children auto-created in each slot when the component is inserted, so
   * a freshly-added component isn't a shell of empty slots (e.g. "Columns" →
   * two "Column" children). Keyed by slot (field) name; each entry is a child
   * type string or `{ type, props }`. Applied recursively (a default child gets
   * its OWN `defaultChildren` too), guarded against type cycles. Skipped for a
   * slot whose content is already provided via `defaultProps`.
   */
  defaultChildren?: Record<string, Array<string | { type: string; props?: Record<string, any> }>>;
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
  /**
   * Whether this component shows width/height resize handles when the editor's
   * resize mode is on. Defaults to `true` (opt-out): set `false` for components
   * that shouldn't be resized (e.g. full-width sections) — they keep the spacing
   * handles instead.
   */
  resizable?: boolean;
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
  /**
   * Seçim toolbar'ındaki ⓘ (bileşen bilgisi) düğmesi. VARSAYILAN KAPALI
   * (2026-08 kullanıcı kararı: gündelik düzenlemede yer kaplıyor, kafa
   * karıştırıyordu). Bileşen dokümantasyonunu yüzeye çıkarmak isteyen tema
   * `nodeInfoButton: true` ile açar.
   */
  nodeInfoButton?: boolean;
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
  /**
   * Theme-level design-token defaults (colors, typography, spacing). Merge
   * order: built-in defaults ← `config.theme` ← the page's own override
   * (`root.props._tecofTheme`, edited in the studio's Tema panel). Lets a
   * theme package ship its brand colors as the starting point, so untouched
   * pages keep the theme's look while `--theme-*` variables stay defined.
   */
  theme?: DeepPartialThemeConfig;
  /**
   * AI assistant hookup (optional — no `ai` config, no AI UI). The LIBRARY owns
   * prompt building (component catalog from this config) and response
   * parsing/validation; the HOST owns the actual LLM call: `complete` receives
   * a system prompt + user prompt and returns the model's raw text (which must
   * contain the JSON section payload). Wire it to any provider.
   */
  ai?: {
    complete: (req: { system: string; prompt: string }) => Promise<string>;
  };
  /**
   * Developer on/off switch for Tailwind-style dark mode (optional — no
   * `darkMode` config means no dark UI, no dark CSS, and no runtime, so themes
   * that don't need it pay nothing). Strategy: a `.dark` class on `<html>` swaps
   * the `--theme-color-*` variable VALUES under a `:root.dark {}` block, so page
   * content keeps its exact classes (`bg-[var(--theme-color-primary)]`) and
   * NOTHING has to be added to the Tailwind safelist. Pass `true` for defaults,
   * or an object to tune the first-visit scheme + persistence key. The dark color
   * VALUES are edited per-theme in the Tema panel (`theme.darkColors`).
   */
  darkMode?:
    | boolean
    | {
        /** First-visit scheme when the visitor has no saved choice. Default `'system'`. */
        defaultMode?: 'light' | 'dark' | 'system';
        /** localStorage key persisting the visitor's toggle choice. Default `'tecof-color-scheme'`. */
        storageKey?: string;
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
  /** Çalışılan temanın id'si (NEXT_PUBLIC_THEME_ID) — çok temalı merchant'ta
   *  sayfa kayıt/okuma isteklerinin doğru temaya gitmesini sağlar */
  themeId?: string;
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
  /** Mağaza kimliği — `/api/merchant/*` uçları bunu `x-merchant-id` header'ında ister. */
  merchantId?: string;
  /** Available language codes (e.g. ["tr", "en", "de"]) */
  languages: string[];
  /** Default language code (e.g. "tr") */
  defaultLanguage: string;
  isUnderConstruction?: boolean;
  /** "ecommerce" | "website" — link seçici e-ticaret sekmelerini buna göre gösterir. */
  productType?: 'ecommerce' | 'website';
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
  /**
   * Seçimin kaynağı. Temalar render'da yalnızca url/target okuduğu için yeni
   * üyeler geriye dönük güvenlidir; rozet renklendirmesi bu alana bakar.
   */
  type?: 'page' | 'custom' | 'category' | 'brand' | 'product' | 'cms';
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
