import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import react__default from 'react';

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
    puckData: PuckPageData;
    status?: string;
    [key: string]: any;
}
interface TecofProviderProps {
    /** Tecof backend API base URL */
    apiUrl: string;
    /** Merchant secret key */
    secretKey: string;
    /** React children */
    children: React.ReactNode;
}
interface TecofEditorProps {
    /** Page ID to load and edit */
    pageId: string;
    /** Puck component configuration (Config from @puckeditor/core) */
    config: any;
    /** Access token for save operations (sent as Authorization header) */
    accessToken?: string;
    /** Called after successful draft save */
    onSave?: (data: PuckPageData) => void;
    /** Called on every editor change */
    onChange?: (data: PuckPageData) => void;
    /** Puck UI overrides */
    overrides?: Record<string, any>;
    /** Additional Puck plugins */
    plugins?: any[];
    /** Additional class name */
    className?: string;
}
interface TecofRenderProps {
    /** Pre-fetched puck data */
    data: PuckPageData;
    /** Puck component configuration (Config from @puckeditor/core) */
    config: any;
    /** Additional class name */
    className?: string;
}
interface MerchantInfoData {
    /** Available language codes (e.g. ["tr", "en", "de"]) */
    languages: string[];
    /** Default language code (e.g. "tr") */
    defaultLanguage: string;
}
interface LanguageFieldValue {
    code: string;
    value: string;
}
interface UploadedFile {
    _id: string;
    name: string;
    size: number;
    type: string;
    mimeType?: string;
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
    constructor(apiUrl: string, secretKey: string);
    private get headers();
    /**
     * Fetch a page by ID (for the editor)
     */
    getPage(pageId: string): Promise<ApiResponse<PageApiData>>;
    /**
     * Save a page by ID
     */
    savePage(pageId: string, puckData: PuckPageData, title?: string, accessToken?: string): Promise<ApiResponse<PageApiData>>;
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
    /** CDN base URL (derived from apiUrl) */
    get cdnUrl(): string;
}

interface TecofContextValue {
    apiClient: TecofApiClient;
    secretKey: string;
    apiUrl: string;
}
declare const TecofProvider: ({ apiUrl, secretKey, children }: TecofProviderProps) => react_jsx_runtime.JSX.Element;
declare function useTecof(): TecofContextValue;

/**
 * TecofEditor — Puck CMS page editor.
 *
 * - Fetches page by ID via secretKey auth
 * - Saves draft via API (taslak kaydet)
 * - Supports iframe postMessage:
 *   - puck:save       → triggers draft save
 *   - puck:undo       → undo
 *   - puck:redo       → redo
 *   - puck:viewport   → resize preview
 * - Sends to parent:
 *   - puck:saved      → draft saved successfully
 *   - puck:changed    → data changed
 *   - puck:itemSelected → item selected { item, id }
 *
 * Requires `<TecofProvider>` ancestor for API client.
 */
declare const TecofEditor: ({ pageId, config, accessToken, onSave, onChange, overrides, plugins: extraPlugins, className, }: TecofEditorProps) => react_jsx_runtime.JSX.Element;

/**
 * TecofRender — Puck page renderer.
 *
 * Pass `data` (PuckPageData) and `config` (Puck Config) directly.
 * No API fetch, no provider required.
 */
declare const TecofRender: ({ data, config, className }: TecofRenderProps) => react_jsx_runtime.JSX.Element | null;

interface LanguageFieldProps {
    field: any;
    name: string;
    id: string;
    value: LanguageFieldValue[];
    onChange: (value: LanguageFieldValue[]) => void;
    readOnly?: boolean;
}
interface LanguageFieldOptions {
    /** Whether to render as textarea instead of input */
    isTextarea?: boolean;
    /** Number of rows for textarea mode */
    textareaRows?: number;
    /** Placeholder text */
    placeholder?: string;
}
declare const LanguageField: ({ value, onChange, readOnly, isTextarea, textareaRows, placeholder, }: LanguageFieldProps & LanguageFieldOptions) => react_jsx_runtime.JSX.Element | null;
declare const createLanguageField: (options?: LanguageFieldOptions & {
    label?: string;
}) => {
    type: "custom";
    label: string | undefined;
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
declare const createEditorField: (options?: EditorFieldOptions & {
    label?: string;
}) => {
    type: "custom";
    label: string | undefined;
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
    allowMultiple?: boolean;
    maxFiles?: number;
    acceptedTypes?: string[];
    maxFileSize?: string;
    folder?: string;
    label?: string;
}
declare const UploadField: react.ForwardRefExoticComponent<UploadFieldProps & UploadFieldOptions & react.RefAttributes<any>>;
declare const createUploadField: (options?: UploadFieldOptions) => {
    type: "custom";
    label: string | undefined;
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
    label?: string;
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
    label: string | undefined;
    render: ({ value, onChange, readOnly, field, name, id }: CodeEditorFieldProps) => react_jsx_runtime.JSX.Element;
};

declare function hexToHsl(hex: string): HSL;
declare function hslToHex(h: number, s: number, l: number): string;
declare function lighten(hex: string, amount: number): string;
declare function darken(hex: string, amount: number): string;
declare function generateCSSVariables(theme: ThemeConfig): string;
declare function getDefaultTheme(): ThemeConfig;
declare function mergeTheme(base: ThemeConfig, overrides: Partial<ThemeConfig>): ThemeConfig;

export { type ApiResponse, CodeEditorField, EditorField, type HSL, LanguageField, type LanguageFieldValue, type MerchantInfoData, type PageApiData, type PuckContentItem, type PuckPageData, TecofApiClient, TecofEditor, type TecofEditorProps, TecofProvider, type TecofProviderProps, TecofRender, type TecofRenderProps, type ThemeColors, type ThemeConfig, type ThemeSpacing, type ThemeTypography, UploadField, type UploadedFile, createCodeEditorField, createEditorField, createLanguageField, createUploadField, darken, generateCSSVariables, getDefaultTheme, hexToHsl, hslToHex, lighten, mergeTheme, useTecof };
