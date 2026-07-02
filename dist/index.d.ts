import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import react__default, { ReactElement, Component, ReactNode, ErrorInfo } from 'react';
export { UnderConstruction } from './components/UnderConstruction.js';
import { ClassValue } from 'clsx';
import * as zustand from 'zustand';
import { Patch } from 'immer';

interface ThemeColors {
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
interface ThemeTypography {
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
interface ThemeSpacing {
    containerMaxWidth: number;
    sectionPaddingY: number;
    sectionPaddingX: number;
    componentGap: number;
    borderRadius: number;
    borderRadiusLg: number;
    borderRadiusSm: number;
}
interface ThemeConfig {
    colors: ThemeColors;
    typography: ThemeTypography;
    spacing: ThemeSpacing;
    customTokens?: Record<string, string>;
}
interface HSL {
    h: number;
    s: number;
    l: number;
}
interface PuckContentItem {
    type: string;
    props: Record<string, any>;
}
interface PuckPageData {
    content: PuckContentItem[];
    root: {
        props: Record<string, any>;
    };
    zones: Record<string, any>;
}
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}
interface PageApiData {
    _id?: string;
    slug: string;
    title?: string;
    draftData: PuckPageData;
    status?: string;
    [key: string]: any;
}
/**
 * Configuration for a single editable field. Covers the built-in field types
 * plus a `render` escape hatch for fully custom fields. The `type` discriminant
 * is optional/loose on purpose so legacy configs keep compiling.
 */
interface FieldConfig {
    /** Built-in field kind. Custom fields may omit this and supply `render`. */
    type?: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'toggle' | 'range' | 'radio' | 'array' | 'object' | 'slot' | string;
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
interface ResolveFieldsContext extends ResolveContext {
    /** The component's statically-declared fields — the starting point to extend. */
    fields: Record<string, FieldConfig>;
}
/**
 * Result of a component's `resolveData`. `props` are DERIVED prop values written
 * back to the node (loop-guarded: only the real diff is committed); `readOnly`
 * disables individual fields by name in the inspector.
 */
interface ResolveDataResult {
    props?: Record<string, any>;
    readOnly?: Record<string, boolean>;
}
/**
 * Feature-permission flags for a node. Every permission defaults to `true`
 * (permissive): hosts opt INTO restrictions by setting a flag to `false`. The
 * index signature allows host-specific custom permissions.
 */
interface Permissions {
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
interface ResolveContext {
    changed: Record<string, boolean>;
    lastProps: Record<string, any> | null;
}
/**
 * Configuration for a single component registered in the studio. `render` is
 * the only required member; everything else is optional metadata or behavior.
 */
interface ComponentConfig {
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
    /** Whether this component can contain child nodes (slot/zones). */
    acceptsChildren?: boolean;
    /** Maximum number of direct children allowed. */
    maxItems?: number;
    /** Component types that may contain this component as a child. */
    allowedParents?: string[];
    /** Per-component permission overrides, merged OVER the global `permissions`. */
    permissions?: Partial<Permissions>;
    /** Dynamically compute permissions from the node's current props. */
    resolvePermissions?: (props: any, ctx: ResolveContext) => Partial<Permissions>;
    /**
     * Dynamically compute the editable field set from the node's current props —
     * e.g. show a `url` field only when `type === 'link'`. May be sync or async.
     * Falls back to the static `fields` on throw.
     */
    resolveFields?: (props: any, ctx: ResolveFieldsContext) => Record<string, FieldConfig> | Promise<Record<string, FieldConfig>>;
    /**
     * Dynamically derive props and per-field read-only state from current props —
     * e.g. derive `slug` from `title` and lock it. Derived `props` are written back
     * loop-guarded (only the diff commits); must be idempotent. May be sync/async.
     */
    resolveData?: (props: any, ctx: ResolveContext) => ResolveDataResult | Promise<ResolveDataResult>;
    /** Allow host-specific extra props without breaking typing. */
    [key: string]: any;
}
/**
 * A pre-built section template: a self-contained subtree (a root node plus the
 * zones describing its children) that the "Bölüm Ekle" library inserts in one
 * click, with fresh ids. Great for hero/feature/CTA layouts.
 */
interface SectionTemplate {
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
interface MigrationConfig {
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
interface StudioConfig {
    /** Registered components, keyed by component type. */
    components: Record<string, ComponentConfig>;
    /** Optional ordered category definitions for the component picker. */
    categories?: Record<string, {
        title?: string;
        components?: string[];
        [key: string]: any;
    }>;
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
interface TecofProviderProps {
    /** Tecof backend API base URL */
    apiUrl: string;
    /** Merchant secret key */
    secretKey: string;
    /** CDN base URL for media files (defaults to apiUrl if not provided) */
    cdnUrl?: string;
    /** React children */
    children: React.ReactNode;
}
interface TecofEditorProps {
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
interface TecofRenderProps {
    /** Pre-fetched page data */
    data: PuckPageData;
    /** Tecof/Puck-compatible component configuration */
    config: StudioConfig;
    /** Additional class name */
    className?: string;
    /** Raw CMS item data (only present for CMS template pages) */
    cmsData?: Record<string, any> | null;
}
interface MerchantInfoData {
    /** Available language codes (e.g. ["tr", "en", "de"]) */
    languages: string[];
    /** Default language code (e.g. "tr") */
    defaultLanguage: string;
    isUnderConstruction?: boolean;
}
interface LanguageFieldValue {
    code: string;
    value: string;
}
interface UploadedFile {
    _id?: string;
    name: string;
    size: number;
    type: string;
    mimeType?: string;
    /** Direct URL for external images (e.g. Freepik stock photos) */
    url?: string;
    folder?: string;
    provider?: string;
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
interface LinkFieldValue {
    url: string;
    label?: string;
    target?: '_self' | '_blank';
    type?: 'page' | 'custom';
}
interface LocalizedLinkFieldValue {
    code: string;
    value: LinkFieldValue;
}
interface TecofNode {
    type: string;
    props: {
        id: string;
    } & Record<string, any>;
}
interface TecofDocument {
    root: {
        props: Record<string, any>;
    };
    content: TecofNode[];
    zones: Record<string, TecofNode[]>;
}

/**
 * Tecof API Client — handles communication with the Tecof backend
 * for page CRUD operations using merchant secret key.
 *
 * Endpoints:
 *  - GET  /api/store/editor/:id   → get page by ID
 *  - PUT  /api/store/editor/:id   → save page by ID
 *  - GET  /api/store/merchant-info → get merchant language config
 */
declare class TecofApiClient {
    private apiUrl;
    private secretKey;
    private customCdnUrl?;
    constructor(apiUrl: string, secretKey: string, customCdnUrl?: string);
    private get headers();
    /**
     * Fetch a page by ID (for the editor)
     *
     * @param signal Optional AbortSignal. When the caller aborts (e.g. a newer
     *   page load supersedes this one), the underlying `fetch` rejects with an
     *   `AbortError`, which we RETHROW so the caller's try/catch can distinguish
     *   an abort from a real failure and skip mutating stale state. Non-abort
     *   errors are still swallowed into an `{ success: false }` response.
     */
    getPage(pageId: string, signal?: AbortSignal): Promise<ApiResponse<PageApiData>>;
    /**
     * Save a page by ID
     */
    savePage(pageId: string, draftData: PuckPageData, title?: string, accessToken?: string): Promise<ApiResponse<PageApiData>>;
    /**
     * Fetch a published page by slug + locale (for rendering)
     */
    getPublishedPage(slug: string, locale?: string): Promise<ApiResponse<PageApiData>>;
    /**
     * Fetch merchant language config (for editor fields)
     */
    getMerchantInfo(): Promise<ApiResponse<MerchantInfoData>>;
    /**
     * Upload files via secretKey auth (for editor fields)
     * Returns array of file records: [{ _id, name, size, type, meta }]
     */
    uploadFile(file: File, folder?: string): Promise<ApiResponse<any[]>>;
    /**
     * Fetch previously uploaded files (for media library selector)
     */
    getUploads(page?: number, limit?: number): Promise<ApiResponse<any[]>>;
    /**
     * Fetch merchant pages list (for LinkField page selector)
     * Returns pages with: _id, slug, title, status, metaTitle
     */
    getPages(): Promise<ApiResponse<any[]>>;
    /**
     * Translate text to multiple languages (for LanguageField)
     * Returns [{code, value}] for each locale
     */
    translate(text: string, sourceLang: string, locales: string[], isHtml?: boolean): Promise<ApiResponse<{
        code: string;
        value: string;
    }[]>>;
    /**
     * Get a component preview screenshot as a Blob URL.
     * Calls POST /api/store/component-preview with domain + componentName.
     * Returns a blob:// URL that can be used as an img src.
     * Results are cached client-side in a Map.
     */
    private previewBlobCache;
    getComponentPreview(domain: string, componentName: string): Promise<string | null>;
    /**
     * Fetch CMS collections list (for CmsCollectionField)
     * Returns: [{ _id, name, slug, fields, ... }]
     */
    getCmsCollections(): Promise<ApiResponse<any[]>>;
    /**
     * Fetch items from a CMS collection by slug
     * Returns: { items: [...], totalData: N }
     */
    getCmsCollectionItems(collectionSlug: string, options?: {
        page?: number;
        limit?: number;
        sort?: 'newest' | 'oldest' | 'custom';
        locale?: string;
    }): Promise<ApiResponse<any>>;
    /**
     * Fetch all global/shared components for the merchant/theme.
     */
    getSharedComponents(): Promise<ApiResponse<any>>;
    /**
     * Create a new global/shared component.
     */
    createSharedComponent(name: string, type: string, props: any): Promise<ApiResponse<any>>;
    /**
     * Update a global/shared component's props/data.
     */
    updateSharedComponent(id: string, name: string, type: string, props: any): Promise<ApiResponse<any>>;
    /** CDN base URL (defaults to apiUrl if not set) */
    get cdnUrl(): string;
}

interface TecofContextValue {
    apiClient: TecofApiClient;
    secretKey: string;
    apiUrl: string;
    cdnUrl?: string;
}
declare const TecofProvider: ({ apiUrl, secretKey, cdnUrl, children }: TecofProviderProps) => react_jsx_runtime.JSX.Element;
declare function useTecof(): TecofContextValue;

declare const TecofEditor: ({ pageId, config, accessToken, onSave, onChange, hostOrigin, autoSave, autoSaveDelay, warnOnUnsavedChanges, className, }: TecofEditorProps) => react_jsx_runtime.JSX.Element;

declare const TecofStudio: ({ pageId, config, accessToken, onSave, onChange, hostOrigin, autoSave, autoSaveDelay, warnOnUnsavedChanges, className, }: TecofEditorProps) => react_jsx_runtime.JSX.Element;

/**
 * TecofRender — Puck-compatible native page renderer.
 *
 * Pass `data` (PuckPageData-compatible page data) and Tecof component `config` directly.
 * Optionally pass `cmsData` to make CMS item data available to all
 * components via `puck.metadata.cmsData`.
 *
 * No API fetch, no provider required, zero @puckeditor/core dependency.
 */
declare const TecofRender: ({ data, config, className, cmsData }: TecofRenderProps) => react_jsx_runtime.JSX.Element | null;

type PictureSize = 'thumbnail' | 'medium' | 'large' | 'full';
interface TecofPictureProps {
    /** The uploaded file data from UploadField */
    data: UploadedFile | null | undefined;
    /** Alt text for accessibility */
    alt?: string | null;
    /** Image size variant */
    size?: PictureSize;
    /** Loading strategy */
    loading?: 'lazy' | 'eager';
    /** Fill the parent container (position: absolute, 100%) */
    fill?: boolean;
    /** Container style overrides */
    style?: React.CSSProperties;
    /** Image style overrides */
    imgStyle?: React.CSSProperties;
    /** Container className */
    className?: string;
    /** Image className */
    imgClassName?: string;
    /** Image width (auto-detected from meta if available) */
    width?: number;
    /** Image height (auto-detected from meta if available) */
    height?: number;
    /** Whether to use a blur placeholder while loading */
    usePlaceholder?: boolean;
    /** Custom blur data URL */
    blurDataURL?: string;
    /** Fancybox lightbox support */
    fancybox?: boolean;
    /** Fancybox group name */
    fancyboxName?: string;
    /** Custom Image component (e.g. Next.js Image). If not provided, uses standard <img> */
    ImageComponent?: React.ComponentType<any>;
    /** Extra props to pass to the Image component (e.g. quality, priority, placeholder) */
    imageProps?: Record<string, any>;
}
declare const TecofPicture: react.MemoExoticComponent<({ data, alt, size, loading, fill, style, imgStyle, className, imgClassName, width, height, usePlaceholder, blurDataURL, fancybox, fancyboxName, ImageComponent, imageProps, }: TecofPictureProps) => react_jsx_runtime.JSX.Element | null>;

interface LanguageFieldProps {
    field: any;
    name: string;
    id: string;
    value: LanguageFieldValue[];
    onChange: (value: LanguageFieldValue[]) => void;
    readOnly?: boolean;
}
interface LanguageFieldOptions {
    /** Field label displayed in the Puck sidebar */
    label?: string;
    /** Icon displayed next to the label (React element, e.g. Lucide icon) */
    labelIcon?: ReactElement;
    /** Whether this field is visible in the sidebar */
    visible?: boolean;
    /** Whether to render as textarea instead of input */
    isTextarea?: boolean;
    /** Number of rows for textarea mode */
    textareaRows?: number;
    /** Placeholder text */
    placeholder?: string;
    /** Whether the content is HTML (for translation) */
    isHtml?: boolean;
}
declare const LanguageField: ({ value, onChange, readOnly, isTextarea, textareaRows, placeholder, isHtml, }: LanguageFieldProps & LanguageFieldOptions) => react_jsx_runtime.JSX.Element | null;
declare const createLanguageField: (options?: LanguageFieldOptions) => {
    type: "custom";
    _fieldType: "language";
    label: string | undefined;
    labelIcon: ReactElement<unknown, string | react.JSXElementConstructor<any>> | undefined;
    visible: boolean | undefined;
    render: ({ value, onChange, readOnly, field, name, id }: LanguageFieldProps) => react_jsx_runtime.JSX.Element;
};

interface EditorFieldProps {
    field: any;
    name: string;
    id: string;
    value: LanguageFieldValue[];
    onChange: (value: LanguageFieldValue[]) => void;
    readOnly?: boolean;
}
interface EditorFieldOptions {
    /** Field label displayed in the Puck sidebar */
    label?: string;
    /** Icon displayed next to the label (React element, e.g. Lucide icon) */
    labelIcon?: ReactElement;
    /** Whether this field is visible in the sidebar */
    visible?: boolean;
    /** Placeholder text for empty editor */
    placeholder?: string;
}
/**
 * EditorField — A multilingual TipTap rich text editor field for Puck.
 *
 * Uses the same language tab system as LanguageField, but renders a
 * TipTap editor with toolbar (bold, italic, underline, headings, lists,
 * alignment, links, blockquote, undo/redo) instead of a plain text input.
 *
 * The heavy TipTap editor is lazy-loaded behind <Suspense>.
 *
 * Value format: [{ code: "tr", value: "<p>HTML content</p>" }, ...]
 */
declare const EditorField: (props: EditorFieldProps & EditorFieldOptions) => react_jsx_runtime.JSX.Element;
/**
 * Creates a Puck custom field definition for multilingual rich text (TipTap) editor.
 *
 * @example
 * ```ts
 * import { createEditorField } from '@tecof/theme-editor';
 *
 * const config = {
 *   components: {
 *     TextBlock: {
 *       fields: {
 *         content: createEditorField({ label: 'İçerik' }),
 *       },
 *       defaultProps: { content: [] },
 *       render: ({ content }) => { ... },
 *     },
 *   },
 * };
 * ```
 */
declare const createEditorField: (options?: EditorFieldOptions) => {
    type: "custom";
    _fieldType: "editor";
    label: string | undefined;
    labelIcon: ReactElement<unknown, string | react.JSXElementConstructor<any>> | undefined;
    visible: boolean | undefined;
    render: ({ value, onChange, readOnly, field, name, id }: EditorFieldProps) => react_jsx_runtime.JSX.Element;
};

interface UploadFieldProps {
    field: any;
    name: string;
    id: string;
    value: UploadedFile[];
    onChange: (value: UploadedFile[]) => void;
    readOnly?: boolean;
}
interface UploadFieldOptions {
    /** Field label displayed in the Puck sidebar */
    label?: string;
    /** Icon displayed next to the label (React element, e.g. Lucide icon) */
    labelIcon?: ReactElement;
    /** Whether this field is visible in the sidebar */
    visible?: boolean;
    allowMultiple?: boolean;
    maxFiles?: number;
    acceptedTypes?: string[];
    maxFileSize?: string;
    maxTotalFileSize?: string;
    folder?: string;
    /** Show uploaded files list with view/download buttons */
    showUploadedFiles?: boolean;
    /** Preview height for images in FilePond */
    imagePreviewHeight?: number;
    /** Allow reorder in FilePond */
    allowReorder?: boolean;
    /** Enable image compression before upload */
    imageCompressionEnabled?: boolean;
    /** Image compression options */
    imageCompressionOptions?: {
        maxSizeMB?: number;
        maxWidthOrHeight?: number;
        useWebWorker?: boolean;
        fileType?: string;
    };
}
/**
 * UploadField — A file upload custom field for Puck.
 * Uses FilePond + the Doka image editor, lazy-loaded behind <Suspense>.
 */
declare const UploadField: {
    (props: UploadFieldProps & UploadFieldOptions): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const createUploadField: (options?: UploadFieldOptions) => {
    type: "custom";
    _fieldType: "upload";
    label: string | undefined;
    labelIcon: ReactElement<unknown, string | react.JSXElementConstructor<any>> | undefined;
    visible: boolean | undefined;
    render: ({ value, onChange, readOnly, field, name, id }: UploadFieldProps) => react_jsx_runtime.JSX.Element;
};

interface CodeEditorFieldProps {
    field: any;
    name: string;
    id: string;
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
}
interface CodeEditorFieldOptions {
    /** Field label displayed in the Puck sidebar */
    label?: string;
    /** Icon displayed next to the label (React element, e.g. Lucide icon) */
    labelIcon?: ReactElement;
    /** Whether this field is visible in the sidebar */
    visible?: boolean;
    defaultLanguage?: string;
    height?: string;
    theme?: string;
}
/**
 * CodeEditorField — A code editor custom field for Puck.
 * Uses Monaco Editor (@monaco-editor/react), lazy-loaded behind <Suspense>.
 */
declare const CodeEditorField: react.ForwardRefExoticComponent<CodeEditorFieldProps & CodeEditorFieldOptions & react.RefAttributes<any>>;
/**
 * Creates a Puck custom field definition for code editing.
 *
 * @example
 * ```ts
 * import { createCodeEditorField } from '@tecof/theme-editor';
 *
 * const config = {
 *   components: {
 *     CustomHero: {
 *       fields: {
 *         customHtml: createCodeEditorField({
 *           label: 'Özel HTML Kodu',
 *           defaultLanguage: 'html',
 *           height: '400px',
 *         }),
 *       },
 *       defaultProps: { customHtml: '' },
 *       render: ({ customHtml }) => <div dangerouslySetInnerHTML={{ __html: customHtml }} />,
 *     },
 *   },
 * };
 * ```
 */
declare const createCodeEditorField: (options?: CodeEditorFieldOptions) => {
    type: "custom";
    _fieldType: "code";
    label: string | undefined;
    labelIcon: ReactElement<unknown, string | react.JSXElementConstructor<any>> | undefined;
    visible: boolean | undefined;
    render: ({ value, onChange, readOnly, field, name, id }: CodeEditorFieldProps) => react_jsx_runtime.JSX.Element;
};

interface LinkFieldProps {
    field: any;
    name: string;
    id: string;
    value: LocalizedLinkFieldValue[] | null;
    onChange: (value: LocalizedLinkFieldValue[] | null) => void;
    readOnly?: boolean;
}
interface LinkFieldOptions {
    /** Field label displayed in the Puck sidebar */
    label?: string;
    /** Icon displayed next to the label (React element, e.g. Lucide icon) */
    labelIcon?: ReactElement;
    /** Whether this field is visible in the sidebar */
    visible?: boolean;
    /** Show target selector (_self / _blank) */
    showTarget?: boolean;
    /** Placeholder for URL input */
    placeholder?: string;
}
declare const LinkField: {
    ({ value, onChange, readOnly, showTarget, placeholder, }: LinkFieldProps & LinkFieldOptions): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const createLinkField: (options?: LinkFieldOptions) => {
    type: "custom";
    _fieldType: "link";
    label: string | undefined;
    labelIcon: ReactElement<unknown, string | react.JSXElementConstructor<any>> | undefined;
    visible: boolean | undefined;
    render: ({ value, onChange, readOnly, field, name, id }: LinkFieldProps) => react_jsx_runtime.JSX.Element;
};

interface ColorFieldProps {
    field: any;
    name: string;
    id: string;
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
}
interface ColorFieldOptions {
    /** Field label displayed in the Puck sidebar */
    label?: string;
    /** Icon displayed next to the label (React element, e.g. Lucide icon) */
    labelIcon?: ReactElement;
    /** Whether this field is visible in the sidebar */
    visible?: boolean;
    /** Show opacity/alpha slider */
    showOpacity?: boolean;
    /** Default/fallback color */
    defaultColor?: string;
    /** Placeholder text for hex input */
    placeholder?: string;
    /** Show reset button */
    showReset?: boolean;
    /** Quick-pick swatches shown in the popover (hex strings). */
    swatches?: string[];
}
declare const ColorField: {
    ({ value, onChange, readOnly, showOpacity, defaultColor, placeholder, showReset, swatches, }: ColorFieldProps & ColorFieldOptions): react_jsx_runtime.JSX.Element;
    displayName: string;
};
/**
 * Creates a Puck custom field definition for color picking.
 *
 * @example
 * ```ts
 * import { createColorField } from '@tecof/theme-editor';
 *
 * fields: {
 *   bgColor: createColorField({ label: 'Arka Plan Rengi' }),
 *   textColor: createColorField({
 *     label: 'Metin Rengi',
 *     showOpacity: true,
 *     defaultColor: '#18181b',
 *     swatches: ['#18181b', '#74b500', '#ffffff'],
 *   }),
 * }
 * ```
 */
declare const createColorField: (options?: ColorFieldOptions) => {
    type: "custom";
    _fieldType: "color";
    label: string | undefined;
    labelIcon: ReactElement<unknown, string | react.JSXElementConstructor<any>> | undefined;
    visible: boolean | undefined;
    render: ({ value, onChange, readOnly, field, name, id }: ColorFieldProps) => react_jsx_runtime.JSX.Element;
};

interface RepeaterFieldProps {
    field: any;
    name: string;
    id: string;
    value: Record<string, any>[];
    onChange: (value: Record<string, any>[]) => void;
    readOnly?: boolean;
}
interface RepeaterFieldOptions {
    /** Field label displayed in the Puck sidebar */
    label?: string;
    /** Icon displayed next to the label */
    labelIcon?: ReactElement;
    /** Whether this field is visible in the sidebar */
    visible?: boolean;
    /** Sub-fields definition — each key maps to a createXxxField() result */
    subFields: Record<string, any>;
    /** Minimum number of rows */
    minItems?: number;
    /** Maximum number of rows */
    maxItems?: number;
    /** Default values for a new row */
    defaultRow?: Record<string, any>;
}
declare const RepeaterField: {
    ({ value: rawValue, onChange, readOnly, subFields, minItems, maxItems, defaultRow, }: RepeaterFieldProps & RepeaterFieldOptions): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const createRepeaterField: (options: RepeaterFieldOptions) => {
    type: "custom";
    _fieldType: "repeater";
    label: string | undefined;
    labelIcon: ReactElement<unknown, string | react.JSXElementConstructor<any>> | undefined;
    visible: boolean | undefined;
    render: ({ value, onChange, readOnly, field, name, id }: RepeaterFieldProps) => react_jsx_runtime.JSX.Element;
};

/** Slot definition: describes a data slot the component needs */
interface CmsSlotDefinition {
    /** Label shown in the editor (e.g. "Başlık") */
    label: string;
    /** Optional: filter to specific CMS field types */
    fieldTypes?: string[];
}
interface CmsCollectionFieldValue {
    /** Selected collection slug */
    collectionSlug: string;
    /** Collection name (for display) */
    collectionName?: string;
    /** Max items to fetch */
    limit?: number;
    /** Sort order */
    sort?: 'newest' | 'oldest' | 'custom';
    /** Field mapping: slotKey → CMS field shortcode */
    fieldMap?: Record<string, string>;
}
interface CmsCollectionFieldProps {
    field: any;
    name: string;
    id: string;
    value: CmsCollectionFieldValue | null;
    onChange: (value: CmsCollectionFieldValue | null) => void;
    readOnly?: boolean;
}
interface CmsCollectionFieldOptions {
    /** Field label displayed in the Puck sidebar */
    label?: string;
    /** Icon displayed next to the label */
    labelIcon?: ReactElement;
    /** Whether this field is visible in the sidebar */
    visible?: boolean;
    /** Default limit for items */
    defaultLimit?: number;
    /** Show limit control */
    showLimit?: boolean;
    /** Show sort control */
    showSort?: boolean;
    /**
     * Mappable slots: defines what data the component needs.
     * Key = slot name used in code, Value = slot definition.
     * Example: { title: { label: "Başlık" }, image: { label: "Görsel" } }
     */
    slots?: Record<string, CmsSlotDefinition>;
}
declare const CmsCollectionField: {
    ({ value, onChange, readOnly, defaultLimit, showLimit, showSort, slots, }: CmsCollectionFieldProps & CmsCollectionFieldOptions): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const createCmsCollectionField: (options?: CmsCollectionFieldOptions) => {
    type: "custom";
    _fieldType: "cmsCollection";
    label: string | undefined;
    labelIcon: ReactElement<unknown, string | react.JSXElementConstructor<any>> | undefined;
    visible: boolean | undefined;
    render: ({ value, onChange, readOnly, field, name, id }: CmsCollectionFieldProps) => react_jsx_runtime.JSX.Element;
};

interface IconFieldProps {
    field: unknown;
    name: string;
    id: string;
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
}
interface IconFieldOptions {
    /** Field label displayed in the Puck sidebar */
    label?: string;
    /** Icon displayed next to the label (React element, e.g. Lucide icon) */
    labelIcon?: react__default.ReactElement;
    /** Whether this field is visible in the sidebar */
    visible?: boolean;
}
declare const IconField: ({ value, onChange, readOnly }: IconFieldProps) => react_jsx_runtime.JSX.Element;
declare const createIconField: (options?: IconFieldOptions) => {
    type: "custom";
    _fieldType: "icon";
    label: string | undefined;
    labelIcon: react__default.ReactElement<unknown, string | react__default.JSXElementConstructor<any>> | undefined;
    visible: boolean | undefined;
    render: ({ value, onChange, readOnly, field, name, id }: IconFieldProps) => react_jsx_runtime.JSX.Element;
};

/**
 * ExternalField — generic, host-provided data picker.
 *
 * Unlike CmsCollectionField (hardwired to the Tecof CMS), this field is fully
 * decoupled: the host supplies an async `fetchList` and optional mappers. The
 * user opens a modal, the rows returned by `fetchList` are listed (searchable),
 * and selecting a row stores `mapProp(row)` (or the raw row) on the prop.
 *
 * Rendered by FieldRenderer for `{ type: 'external' }`.
 */
interface ExternalFieldConfig {
    type?: 'external';
    label?: string;
    /** Loads rows for the picker. Receives the current search query + filters. */
    fetchList: (params: {
        query?: string;
        filters?: Record<string, any>;
    }) => Promise<any[]>;
    /** Maps a chosen row to the value stored on the prop (default: the row itself). */
    mapProp?: (row: any) => any;
    /** Maps a row to display columns (default: the row's own enumerable props). */
    mapRow?: (row: any) => Record<string, any>;
    /** Summarizes the STORED value into the trigger/selected label. */
    getItemSummary?: (value: any) => string;
    /** Show the search box (default true). */
    showSearch?: boolean;
    /** Trigger placeholder when nothing is selected. */
    placeholder?: string;
}
interface ExternalFieldProps {
    field: ExternalFieldConfig;
    name: string;
    value: any;
    onChange: (value: any) => void;
    readOnly?: boolean;
}
declare const ExternalField: ({ field, name, value, onChange, readOnly }: ExternalFieldProps) => react_jsx_runtime.JSX.Element;
/**
 * Factory mirroring the other `create*Field` helpers: returns a `{ type:
 * 'external', ... }` FieldConfig the host spreads into a component's `fields`.
 */
declare const createExternalField: (options: Omit<ExternalFieldConfig, "type">) => ExternalFieldConfig;

interface FieldErrorBoundaryProps {
    /** The field name (for error reporting) */
    fieldName?: string;
    /** Fallback UI to show when a field crashes */
    fallback?: ReactNode;
    /** Optional error callback */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    children: ReactNode;
}
interface FieldErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}
/**
 * Error boundary for Puck custom fields.
 * Catches render errors in child components and shows a friendly fallback
 * instead of crashing the entire editor.
 *
 * @example
 * ```tsx
 * <FieldErrorBoundary fieldName="title">
 *   <LanguageField ... />
 * </FieldErrorBoundary>
 * ```
 */
declare class FieldErrorBoundary extends Component<FieldErrorBoundaryProps, FieldErrorBoundaryState> {
    constructor(props: FieldErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): FieldErrorBoundaryState;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    handleRetry: () => void;
    render(): string | number | bigint | boolean | react_jsx_runtime.JSX.Element | Iterable<ReactNode> | Promise<string | number | bigint | boolean | react.ReactPortal | react.ReactElement<unknown, string | react.JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined;
}

/**
 * Single source of truth for the visual style editor.
 *
 * STYLE_CONTROLS drives three things at once:
 *   1. the StyleEditor UI (which controls + options to render),
 *   2. className compilation (token → Tailwind class via `toClass`),
 *   3. the production safelist (every token × variant → finite class set).
 *
 * Targets Tailwind v4: theme tokens are CSS variables (`@theme`), so the
 * editor palette (`--tecof-primary-*`) maps to `bg-primary-600` etc. once the
 * host registers `--color-primary-*` in its `@theme`.
 */
type StyleGroup = 'layout' | 'spacing' | 'sizing' | 'typography' | 'background' | 'border' | 'effects';
type StyleControlType = 'segment' | 'select' | 'color' | 'space';
interface StyleControlOption {
    label: string;
    value: string;
    /** Optional CSS color for color-swatch rendering in the UI. */
    swatch?: string;
}
interface StyleControl {
    id: string;
    label: string;
    group: StyleGroup;
    type: StyleControlType;
    options: StyleControlOption[];
    /** Token value → Tailwind class (or null to emit nothing). */
    toClass: (value: string) => string | null;
    /**
     * Tailwind utility prefix for arbitrary (custom) values. When set, the user
     * can type a raw value `V` (e.g. `10px`, `#ff0000`) and it compiles to
     * `<prefix>-[V]` (e.g. `p-[10px]`, `bg-[#ff0000]`).
     *
     * Encoding: an arbitrary value is stored in NodeStyles bracket-wrapped
     * (`'[10px]'`); presets stay bare (`'4'`, `'primary-600'`). `isArbitrary`
     * detects the wrapper so `toClass` round-trips losslessly through the model.
     */
    arbitraryPrefix?: string;
}
declare const STYLE_CONTROLS: StyleControl[];
/**
 * Every class the editor can ever emit (token × control × variant prefix).
 * Feed this into the host Tailwind config `safelist` so production CSS always
 * contains the classes chosen in the editor.
 */
declare function getSafelist(): string[];

/**
 * Tailwind default color palette (hue × shade) used by the visual color picker.
 *
 * The stored token is the bare Tailwind preset (`red-500`), so the compiled
 * class (`bg-red-500`) resolves against the HOST's Tailwind theme — if the host
 * overrides a hue, the published page follows it. The hex values here are only
 * swatch previews for the editor chrome (which may not have Tailwind at all);
 * `tailwindSwatch` prefers the live `--color-*` variable when present and falls
 * back to the static hex.
 */
declare const TAILWIND_SHADES: readonly ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
type TailwindShade = (typeof TAILWIND_SHADES)[number];
interface PaletteHue {
    /** Tailwind hue name as used in class names (`red` → `bg-red-500`). */
    name: string;
    /** Display label for the picker UI. */
    label: string;
    /** Shade → preview hex, indexed in TAILWIND_SHADES order. */
    shades: Record<TailwindShade, string>;
}
declare const TAILWIND_PALETTE: PaletteHue[];

/**
 * Structured, token-based style model for the Tailwind v4 visual style editor.
 *
 * We store *style intent* (which token is chosen per property) rather than raw
 * class strings. This keeps the UI drivable (we can show the current value),
 * makes responsive + state variants first-class, and — because every property
 * maps to a finite token set — lets us generate a complete Tailwind safelist for
 * production. The shape round-trips losslessly inside `node.props._tecofStyles`.
 */
/** Responsive breakpoints. `base` = no prefix; others map to Tailwind `sm:`…`xl:`. */
type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';
/** Interaction states → Tailwind `hover:` / `focus:` / `active:`. */
type StateVariant = 'hover' | 'focus' | 'active';
/**
 * One layer of style values, keyed by control id (see STYLE_CONTROLS).
 * Value is the *token* (e.g. `'4'`, `'primary-600'`, `'lg'`), not the class.
 *
 * Arbitrary (custom) values are bracket-wrapped (`'[10px]'`, `'[#ff0000]'`) so
 * they round-trip losslessly and are distinguishable from bare presets; the
 * control's `toClass` compiles them to Tailwind arbitrary syntax (`p-[10px]`).
 */
type StyleProps = Record<string, string | undefined>;
/**
 * Interaction-state layers, keyed by either:
 *   - a bare state variant (`'hover'`)            → applies at the base breakpoint
 *   - a `${breakpoint}:${state}` key (`'md:hover'`) → applies only at that breakpoint
 *
 * Bare keys are the original (back-compatible) encoding; prefixed keys add
 * responsive-state support (e.g. a hover style that only kicks in from `md` up).
 */
type StateLayers = Record<string, StyleProps>;
/** Full style object stored on a node. */
interface NodeStyles {
    base?: StyleProps;
    sm?: StyleProps;
    md?: StyleProps;
    lg?: StyleProps;
    xl?: StyleProps;
    states?: StateLayers;
}
/** The prop key under which a node's structured styles live. */
declare const STYLES_PROP = "_tecofStyles";

declare function cn(...inputs: ClassValue[]): string;
/**
 * Compile a structured NodeStyles object into a Tailwind className string.
 * Because each property is a single keyed token, conflicting utilities can't
 * coexist within a layer — no `tailwind-merge` needed.
 *
 * Example:
 *   { base:{p:'4',bg:'primary-600'}, md:{p:'8'}, states:{hover:{bg:'primary-700'}} }
 *   → "p-4 bg-primary-600 md:p-8 hover:bg-primary-700"
 */
declare function compileStyles(styles?: NodeStyles | null): string;
/**
 * Every Tailwind class a single NodeStyles object compiles to — presets AND
 * arbitrary (custom) values. Use this to enumerate the exact classes a saved
 * node relies on.
 */
declare function collectStyleClasses(styles?: NodeStyles | null): string[];
/** Minimal document shape consumed by {@link collectDocumentClasses}. */
interface StyledDocLike {
    root?: {
        props?: Record<string, unknown>;
    };
    content?: Array<{
        props?: Record<string, unknown>;
    }>;
    zones?: Record<string, Array<{
        props?: Record<string, unknown>;
    }>>;
}
/**
 * Walks a Tecof document (root + content + every zone) and returns the
 * de-duplicated set of all style classes used by any node.
 *
 * Why this exists: `getSafelist()` only covers the editor's *preset* options, so
 * arbitrary values such as `p-[10px]` / `bg-[#ff0000]` — which live inside the
 * saved JSON and are invisible to Tailwind's content scanner — would otherwise
 * never get CSS generated in production. Run this over your saved pages at build
 * time (or persist its output beside each page) and feed the result into the
 * Tailwind `safelist` so those classes always exist in the published stylesheet.
 */
declare function collectDocumentClasses(doc?: StyledDocLike | null): string[];

type EditorMode = 'edit' | 'preview';
/**
 * State of the canvas right-click context menu: the target node plus the
 * PARENT-document coordinates where the menu should appear (iframe coords are
 * translated by the caller). `null` = closed.
 */
interface ContextMenuState {
    nodeId: string;
    x: number;
    y: number;
}
/**
 * Target of the "Bölüm Ekle" modal: which list the picked component will be
 * inserted into. `zoneKey` undefined = the root content flow; set = a specific
 * slot zone (e.g. clicked from an empty DropZone). `null` state = modal closed.
 */
interface AddSectionTarget {
    zoneKey?: string;
    index: number;
}
/**
 * Editor *UI* state, deliberately kept separate from the document engine store
 * (`useEditorStore`). This holds chrome/interaction state that should NOT be part
 * of the page document or its undo history: the active mode and panel visibility.
 */
interface UiState {
    /** 'edit' = clicks select nodes, links/buttons inert. 'preview' = links/buttons are live. */
    mode: EditorMode;
    leftPanelOpen: boolean;
    rightPanelOpen: boolean;
    /** Whether the Cmd/Ctrl+K command palette is open. */
    commandPaletteOpen: boolean;
    /**
     * Session style clipboard: the most recently copied node's structured styles
     * (`_tecofStyles`). Lives here (UI state, not the document) so "paste styles"
     * buttons can reactively enable/disable. In-memory only (not persisted).
     */
    styleClipboard: NodeStyles | null;
    /**
     * The open canvas context menu (right-click on a node), or `null` when closed.
     * Coordinates are in the PARENT document's coordinate space.
     */
    contextMenu: ContextMenuState | null;
    /**
     * Session node clipboard for the context menu's Kopyala/Yapıştır: a
     * self-contained node snapshot whose slot children are folded back into the
     * props (see `serializeNodeSubtree`). In-memory only (not persisted); kept
     * separate from the engine clipboard so it never leaks into undo history.
     */
    nodeClipboard: TecofNode | null;
    /** "Bölüm Ekle" modalının ekleme hedefi; null = modal kapalı. */
    addSectionTarget: AddSectionTarget | null;
    setMode: (mode: EditorMode) => void;
    toggleMode: () => void;
    toggleLeftPanel: () => void;
    toggleRightPanel: () => void;
    setLeftPanelOpen: (open: boolean) => void;
    setRightPanelOpen: (open: boolean) => void;
    setCommandPaletteOpen: (open: boolean) => void;
    toggleCommandPalette: () => void;
    setStyleClipboard: (styles: NodeStyles | null) => void;
    setContextMenu: (menu: ContextMenuState | null) => void;
    setNodeClipboard: (node: TecofNode | null) => void;
    openAddSection: (target: AddSectionTarget) => void;
    closeAddSection: () => void;
}
declare const useUiStore: zustand.UseBoundStore<zustand.StoreApi<UiState>>;

/**
 * A serialized node payload used by the clipboard: the node itself plus the
 * slice of `zones` describing its full descendant subtree. Keeping the subtree
 * alongside the node lets paste reconstruct nested children with fresh ids.
 */
interface ClipboardPayload {
    node: TecofNode;
    zones: Record<string, TecofNode[]>;
}

interface DragPayload {
    /** Set when dragging a NEW block from the palette. */
    type?: string;
    /** Set when dragging an EXISTING node on the canvas/layers. */
    id?: string;
}
/**
 * A single undo step. Instead of a full document clone we keep immer patches:
 * `patches` redo the change, `inversePatches` undo it. This preserves immer's
 * structural sharing and keeps history memory-light even for large documents.
 */
interface HistoryStep {
    patches: Patch[];
    inversePatches: Patch[];
}
interface EditorState {
    document: TecofDocument;
    history: {
        past: HistoryStep[];
        future: HistoryStep[];
    };
    selection: {
        /**
         * PRIMARY selection: the anchor / last-clicked id (or null). All existing
         * single-selection readers (Inspector, overlay toolbar, breadcrumbs) rely on
         * this and keep working unchanged. Always equals the last entry of
         * `selectedIds` (or null when nothing is selected).
         */
        selectedId: string | null;
        /**
         * FULL multi-selection set. `selectNode` keeps this in sync as `[id]` (or
         * `[]`); `toggleSelect` adds/removes. Overlay outlines + bulk actions read this.
         */
        selectedIds: string[];
        hoveredId: string | null;
    };
    viewport: 'desktop' | 'tablet' | 'mobile';
    /** Active drag operation (null when idle). Powers drop affordances + ghost. */
    drag: DragPayload | null;
    /**
     * Internal clipboard (NOT part of history). Holds the most recently copied/cut
     * node subtree. Paste prefers this; falls back to the localStorage mirror.
     */
    clipboard: ClipboardPayload | null;
    /** Internal: last coalescible commit marker (node id + timestamp). */
    _lastCommit: {
        id: string;
        time: number;
    } | null;
    /**
     * Resolves a node's effective permissions. Registered by the studio shell from
     * the host config; `null` means "unrestricted" (every action allowed). This is
     * the AUTHORITATIVE gate — every mutating action consults it, so keyboard
     * shortcuts, the command palette, layers, and the overlay all inherit
     * enforcement for free (no per-call-site checks required).
     */
    permissionResolver: ((node: TecofNode) => Permissions) | null;
}
interface EditorActions {
    setDocument: (doc: TecofDocument) => void;
    selectNode: (id: string | null) => void;
    /** Cmd/Ctrl-click: add/remove `id` from the multi-selection, updating primary. */
    toggleSelect: (id: string) => void;
    /** Replaces the whole selection set (primary = last entry, or null when empty). */
    setSelection: (ids: string[]) => void;
    hoverNode: (id: string | null) => void;
    setViewport: (viewport: 'desktop' | 'tablet' | 'mobile') => void;
    beginDrag: (payload: DragPayload) => void;
    endDrag: () => void;
    insertNode: (node: TecofNode, targetZoneKey?: string, index?: number) => void;
    removeNode: (id: string) => void;
    /** Bulk remove (single undo step). When ids omitted, removes current selection. */
    removeNodes: (ids?: string[]) => void;
    moveNode: (id: string, targetZoneKey?: string, index?: number) => void;
    duplicateNode: (id: string) => void;
    /** Bulk duplicate (single undo step). When ids omitted, duplicates selection. */
    duplicateNodes: (ids?: string[]) => void;
    updateProps: (id: string, patch: Record<string, any>) => void;
    setRootProps: (patch: Record<string, any>) => void;
    copyNode: (id?: string) => void;
    cutNode: (id?: string) => void;
    pasteClipboard: (targetZoneKey?: string, index?: number) => void;
    /**
     * Inserts a self-contained payload (node + its descendant zones) with FRESH
     * ids at the target — used by section templates / shared blocks. Selects the
     * inserted root. One undo step.
     */
    insertPayload: (payload: ClipboardPayload, targetZoneKey?: string, index?: number) => void;
    undo: () => void;
    redo: () => void;
    /** Registers (or clears with `null`) the resolver used to gate mutations. */
    setPermissionResolver: (resolver: ((node: TecofNode) => Permissions) | null) => void;
}
type EditorStore = EditorState & EditorActions;
declare const useEditorStore: zustand.UseBoundStore<Omit<zustand.StoreApi<EditorStore>, "setState"> & {
    setState(nextStateOrUpdater: EditorStore | Partial<EditorStore> | ((state: {
        document: {
            root: {
                props: {
                    [x: string]: any;
                };
            };
            content: {
                type: string;
                props: {
                    [x: string]: any;
                    id: string;
                };
            }[];
            zones: {
                [x: string]: {
                    type: string;
                    props: {
                        [x: string]: any;
                        id: string;
                    };
                }[];
            };
        };
        history: {
            past: {
                patches: {
                    op: "replace" | "remove" | "add";
                    path: (string | number)[];
                    value?: any;
                }[];
                inversePatches: {
                    op: "replace" | "remove" | "add";
                    path: (string | number)[];
                    value?: any;
                }[];
            }[];
            future: {
                patches: {
                    op: "replace" | "remove" | "add";
                    path: (string | number)[];
                    value?: any;
                }[];
                inversePatches: {
                    op: "replace" | "remove" | "add";
                    path: (string | number)[];
                    value?: any;
                }[];
            }[];
        };
        selection: {
            selectedId: string | null;
            selectedIds: string[];
            hoveredId: string | null;
        };
        viewport: "desktop" | "tablet" | "mobile";
        drag: {
            type?: string | undefined;
            id?: string | undefined;
        } | null;
        clipboard: {
            node: {
                type: string;
                props: {
                    [x: string]: any;
                    id: string;
                };
            };
            zones: {
                [x: string]: {
                    type: string;
                    props: {
                        [x: string]: any;
                        id: string;
                    };
                }[];
            };
        } | null;
        _lastCommit: {
            id: string;
            time: number;
        } | null;
        permissionResolver: ((node: TecofNode) => Permissions) | null;
        setDocument: (doc: TecofDocument) => void;
        selectNode: (id: string | null) => void;
        toggleSelect: (id: string) => void;
        setSelection: (ids: string[]) => void;
        hoverNode: (id: string | null) => void;
        setViewport: (viewport: "desktop" | "tablet" | "mobile") => void;
        beginDrag: (payload: DragPayload) => void;
        endDrag: () => void;
        insertNode: (node: TecofNode, targetZoneKey?: string, index?: number) => void;
        removeNode: (id: string) => void;
        removeNodes: (ids?: string[]) => void;
        moveNode: (id: string, targetZoneKey?: string, index?: number) => void;
        duplicateNode: (id: string) => void;
        duplicateNodes: (ids?: string[]) => void;
        updateProps: (id: string, patch: Record<string, any>) => void;
        setRootProps: (patch: Record<string, any>) => void;
        copyNode: (id?: string) => void;
        cutNode: (id?: string) => void;
        pasteClipboard: (targetZoneKey?: string, index?: number) => void;
        insertPayload: (payload: ClipboardPayload, targetZoneKey?: string, index?: number) => void;
        undo: () => void;
        redo: () => void;
        setPermissionResolver: (resolver: ((node: TecofNode) => Permissions) | null) => void;
    }) => void), shouldReplace?: false): void;
    setState(nextStateOrUpdater: EditorStore | ((state: {
        document: {
            root: {
                props: {
                    [x: string]: any;
                };
            };
            content: {
                type: string;
                props: {
                    [x: string]: any;
                    id: string;
                };
            }[];
            zones: {
                [x: string]: {
                    type: string;
                    props: {
                        [x: string]: any;
                        id: string;
                    };
                }[];
            };
        };
        history: {
            past: {
                patches: {
                    op: "replace" | "remove" | "add";
                    path: (string | number)[];
                    value?: any;
                }[];
                inversePatches: {
                    op: "replace" | "remove" | "add";
                    path: (string | number)[];
                    value?: any;
                }[];
            }[];
            future: {
                patches: {
                    op: "replace" | "remove" | "add";
                    path: (string | number)[];
                    value?: any;
                }[];
                inversePatches: {
                    op: "replace" | "remove" | "add";
                    path: (string | number)[];
                    value?: any;
                }[];
            }[];
        };
        selection: {
            selectedId: string | null;
            selectedIds: string[];
            hoveredId: string | null;
        };
        viewport: "desktop" | "tablet" | "mobile";
        drag: {
            type?: string | undefined;
            id?: string | undefined;
        } | null;
        clipboard: {
            node: {
                type: string;
                props: {
                    [x: string]: any;
                    id: string;
                };
            };
            zones: {
                [x: string]: {
                    type: string;
                    props: {
                        [x: string]: any;
                        id: string;
                    };
                }[];
            };
        } | null;
        _lastCommit: {
            id: string;
            time: number;
        } | null;
        permissionResolver: ((node: TecofNode) => Permissions) | null;
        setDocument: (doc: TecofDocument) => void;
        selectNode: (id: string | null) => void;
        toggleSelect: (id: string) => void;
        setSelection: (ids: string[]) => void;
        hoverNode: (id: string | null) => void;
        setViewport: (viewport: "desktop" | "tablet" | "mobile") => void;
        beginDrag: (payload: DragPayload) => void;
        endDrag: () => void;
        insertNode: (node: TecofNode, targetZoneKey?: string, index?: number) => void;
        removeNode: (id: string) => void;
        removeNodes: (ids?: string[]) => void;
        moveNode: (id: string, targetZoneKey?: string, index?: number) => void;
        duplicateNode: (id: string) => void;
        duplicateNodes: (ids?: string[]) => void;
        updateProps: (id: string, patch: Record<string, any>) => void;
        setRootProps: (patch: Record<string, any>) => void;
        copyNode: (id?: string) => void;
        cutNode: (id?: string) => void;
        pasteClipboard: (targetZoneKey?: string, index?: number) => void;
        insertPayload: (payload: ClipboardPayload, targetZoneKey?: string, index?: number) => void;
        undo: () => void;
        redo: () => void;
        setPermissionResolver: (resolver: ((node: TecofNode) => Permissions) | null) => void;
    }) => void), shouldReplace: true): void;
}>;

declare function hexToHsl(hex: string): HSL;
declare function hslToHex(h: number, s: number, l: number): string;
declare function lighten(hex: string, amount: number): string;
declare function darken(hex: string, amount: number): string;
declare function generateCSSVariables(theme: ThemeConfig): string;
declare function getDefaultTheme(): ThemeConfig;
declare function mergeTheme(base: ThemeConfig, overrides: Partial<ThemeConfig>): ThemeConfig;

export { type ApiResponse, type Breakpoint, CmsCollectionField, CodeEditorField, ColorField, EditorField, ExternalField, FieldErrorBoundary, type HSL, IconField, LanguageField, type LanguageFieldValue, LinkField, type LinkFieldValue, type MerchantInfoData, type MigrationConfig, type NodeStyles, type PageApiData, type PaletteHue, type Permissions, type PuckContentItem, type PuckPageData, RepeaterField, type ResolveContext, type ResolveDataResult, type ResolveFieldsContext, STYLES_PROP, STYLE_CONTROLS, type StateVariant, TAILWIND_PALETTE, TAILWIND_SHADES, type TailwindShade, TecofApiClient, TecofEditor, type TecofEditorProps, TecofPicture, type TecofPictureProps, TecofProvider, type TecofProviderProps, TecofRender, type TecofRenderProps, TecofStudio, type ThemeColors, type ThemeConfig, type ThemeSpacing, type ThemeTypography, UploadField, type UploadedFile, cn, collectDocumentClasses, collectStyleClasses, compileStyles, createCmsCollectionField, createCodeEditorField, createColorField, createEditorField, createExternalField, createIconField, createLanguageField, createLinkField, createRepeaterField, createUploadField, darken, generateCSSVariables, getDefaultTheme, getSafelist, hexToHsl, hslToHex, lighten, mergeTheme, useEditorStore, useTecof, useUiStore };
