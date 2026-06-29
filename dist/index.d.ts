import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import react__default, { ReactElement, Component, ReactNode, ErrorInfo } from 'react';
export { UnderConstruction } from './components/UnderConstruction.js';

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
    config: any;
    /** Access token for save operations (sent as Authorization header) */
    accessToken?: string;
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
interface TecofRenderProps {
    /** Pre-fetched page data */
    data: PuckPageData;
    /** Tecof/Puck-compatible component configuration */
    config: any;
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
     */
    getPage(pageId: string): Promise<ApiResponse<PageApiData>>;
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

declare const TecofEditor: ({ pageId, config, accessToken, onSave, onChange, className, }: TecofEditorProps) => react_jsx_runtime.JSX.Element;

declare const TecofStudio: ({ pageId, config, accessToken, onSave, onChange, className, }: TecofEditorProps) => react_jsx_runtime.JSX.Element;

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
 * Value format: [{ code: "tr", value: "<p>HTML content</p>" }, ...]
 */
declare const EditorField: ({ value, onChange, readOnly, }: EditorFieldProps & EditorFieldOptions) => react_jsx_runtime.JSX.Element | null;
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
declare const UploadField: {
    ({ value: rawValue, onChange, allowMultiple, maxFiles, acceptedTypes, maxFileSize, maxTotalFileSize, folder, readOnly, showUploadedFiles, imagePreviewHeight, allowReorder, imageCompressionEnabled, imageCompressionOptions, }: UploadFieldProps & UploadFieldOptions): react_jsx_runtime.JSX.Element;
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
 * Uses Monaco Editor (@monaco-editor/react).
 */
declare const CodeEditorField: react__default.ForwardRefExoticComponent<CodeEditorFieldProps & CodeEditorFieldOptions & react__default.RefAttributes<any>>;
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
    labelIcon: ReactElement<unknown, string | react__default.JSXElementConstructor<any>> | undefined;
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
}
declare const ColorField: {
    ({ value, onChange, readOnly, showOpacity, defaultColor, placeholder, showReset, }: ColorFieldProps & ColorFieldOptions): react_jsx_runtime.JSX.Element;
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
    render(): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | react.ReactPortal | react.ReactElement<unknown, string | react.JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | react_jsx_runtime.JSX.Element | null | undefined;
}

declare function hexToHsl(hex: string): HSL;
declare function hslToHex(h: number, s: number, l: number): string;
declare function lighten(hex: string, amount: number): string;
declare function darken(hex: string, amount: number): string;
declare function generateCSSVariables(theme: ThemeConfig): string;
declare function getDefaultTheme(): ThemeConfig;
declare function mergeTheme(base: ThemeConfig, overrides: Partial<ThemeConfig>): ThemeConfig;

export { type ApiResponse, CmsCollectionField, CodeEditorField, ColorField, EditorField, FieldErrorBoundary, type HSL, LanguageField, type LanguageFieldValue, LinkField, type LinkFieldValue, type MerchantInfoData, type PageApiData, type PuckContentItem, type PuckPageData, RepeaterField, TecofApiClient, TecofEditor, type TecofEditorProps, TecofPicture, type TecofPictureProps, TecofProvider, type TecofProviderProps, TecofRender, type TecofRenderProps, TecofStudio, type ThemeColors, type ThemeConfig, type ThemeSpacing, type ThemeTypography, UploadField, type UploadedFile, createCmsCollectionField, createCodeEditorField, createColorField, createEditorField, createLanguageField, createLinkField, createRepeaterField, createUploadField, darken, generateCSSVariables, getDefaultTheme, hexToHsl, hslToHex, lighten, mergeTheme, useTecof };
