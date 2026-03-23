import * as react_jsx_runtime from 'react/jsx-runtime';

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

/**
 * Tecof API Client — handles communication with the Tecof backend
 * for page CRUD operations using merchant secret key.
 *
 * Endpoints:
 *  - GET  /api/store/editor/:id   → get page by ID
 *  - PUT  /api/store/editor/:id   → save page by ID
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

declare function hexToHsl(hex: string): HSL;
declare function hslToHex(h: number, s: number, l: number): string;
declare function lighten(hex: string, amount: number): string;
declare function darken(hex: string, amount: number): string;
declare function generateCSSVariables(theme: ThemeConfig): string;
declare function getDefaultTheme(): ThemeConfig;
declare function mergeTheme(base: ThemeConfig, overrides: Partial<ThemeConfig>): ThemeConfig;

export { type ApiResponse, type HSL, type PageApiData, type PuckContentItem, type PuckPageData, TecofApiClient, TecofEditor, type TecofEditorProps, TecofProvider, type TecofProviderProps, TecofRender, type TecofRenderProps, type ThemeColors, type ThemeConfig, type ThemeSpacing, type ThemeTypography, darken, generateCSSVariables, getDefaultTheme, hexToHsl, hslToHex, lighten, mergeTheme, useTecof };
