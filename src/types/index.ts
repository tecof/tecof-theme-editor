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
  puckData: PuckPageData;
  status?: string;
  [key: string]: any;
}

/* ─── Provider Props ─── */

export interface TecofProviderProps {
  /** Tecof backend API base URL */
  apiUrl: string;
  /** Merchant secret key */
  secretKey: string;
  /** React children */
  children: React.ReactNode;
}

/* ─── Tecof Editor Props ─── */

export interface TecofEditorProps {
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

/* ─── Tecof Render Props ─── */

export interface TecofRenderProps {
  /** Pre-fetched puck data */
  data: PuckPageData;
  /** Puck component configuration (Config from @puckeditor/core) */
  config: any;
  /** Additional class name */
  className?: string;
}
