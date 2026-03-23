import { createContext, useMemo, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { fieldsPlugin, Puck, Render } from '@puckeditor/core';

// src/components/TecofProvider.tsx

// src/api.ts
var TecofApiClient = class {
  constructor(apiUrl, secretKey) {
    this.apiUrl = apiUrl.replace(/\/+$/, "");
    this.secretKey = secretKey;
  }
  get headers() {
    return {
      "x-secret-key": this.secretKey,
      Accept: "application/json",
      "Content-Type": "application/json"
    };
  }
  /**
   * Fetch a page by ID (for the editor)
   */
  async getPage(pageId) {
    try {
      const res = await fetch(`${this.apiUrl}/api/store/editor/${pageId}`, {
        method: "GET",
        headers: this.headers
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch page"
      };
    }
  }
  /**
   * Save a page by ID
   */
  async savePage(pageId, puckData, title, accessToken) {
    try {
      const res = await fetch(`${this.apiUrl}/api/store/editor/${pageId}`, {
        method: "PUT",
        headers: {
          ...this.headers,
          ...accessToken && { Authorization: accessToken }
        },
        body: JSON.stringify({ puckData, ...title && { title } })
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to save page"
      };
    }
  }
  /**
   * Fetch a published page by slug + locale (for rendering)
   */
  async getPublishedPage(slug, locale) {
    try {
      const res = await fetch(`${this.apiUrl}/api/store/render`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ slug, ...locale && { locale } })
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch published page"
      };
    }
  }
};
var TecofContext = createContext(null);
var TecofProvider = ({ apiUrl, secretKey, children }) => {
  const value = useMemo(
    () => ({
      apiClient: new TecofApiClient(apiUrl, secretKey),
      secretKey,
      apiUrl
    }),
    [apiUrl, secretKey]
  );
  return /* @__PURE__ */ jsx(TecofContext.Provider, { value, children });
};
function useTecof() {
  const ctx = useContext(TecofContext);
  if (!ctx) {
    throw new Error("useTecof must be used within a <TecofProvider>");
  }
  return ctx;
}

// src/components/styles.ts
var editorStyles = {
  wrapper: {
    position: "relative",
    width: "100%",
    height: "100%"
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#fafafa"
  },
  loadingInner: {
    textAlign: "center"
  },
  loadingText: {
    fontSize: "14px",
    color: "#71717a",
    fontFamily: "'Inter', system-ui, sans-serif"
  },
  saveIndicator: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "8px 16px",
    background: "#18181b",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 500,
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 9999,
    fontFamily: "'Inter', system-ui, sans-serif"
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e4e4e7",
    borderTopColor: "#18181b",
    borderRadius: "50%",
    margin: "0 auto 12px",
    animation: "tecof-spin 0.7s linear infinite"
  }
};
var keyframesInjected = false;
var injectKeyframes = () => {
  if (keyframesInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = `@keyframes tecof-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
  keyframesInjected = true;
};
var EMPTY_PAGE = { content: [], root: { props: {} }, zones: {} };
var TecofEditor = ({
  pageId,
  config,
  accessToken,
  onSave,
  onChange,
  overrides,
  plugins: extraPlugins,
  className
}) => {
  const { apiClient } = useTecof();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const puckDataRef = useRef(null);
  const isEmbedded = typeof window !== "undefined" && window.parent !== window;
  useEffect(() => {
    injectKeyframes();
  }, []);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const res = await apiClient.getPage(pageId);
      if (cancelled) return;
      const data = res.success && res.data?.puckData ? res.data.puckData : EMPTY_PAGE;
      setInitialData(data);
      puckDataRef.current = data;
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [pageId, apiClient]);
  const handleSaveDraft = useCallback(
    async (data) => {
      const currentData = data || puckDataRef.current;
      if (!currentData) return;
      const puckData = currentData;
      setSaving(true);
      setSaveStatus("idle");
      const res = await apiClient.savePage(pageId, puckData, void 0, accessToken);
      if (res.success) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3e3);
        onSave?.(puckData);
        if (isEmbedded) window.parent.postMessage({ type: "puck:saved" }, "*");
      } else {
        setSaveStatus("error");
        if (isEmbedded) window.parent.postMessage({ type: "puck:saveError", message: res.message }, "*");
      }
      setSaving(false);
    },
    [pageId, apiClient, isEmbedded, onSave, accessToken]
  );
  const handleChange = useCallback(
    (data) => {
      puckDataRef.current = data;
      const puckData = data;
      onChange?.(puckData);
      if (isEmbedded) window.parent.postMessage({ type: "puck:changed" }, "*");
    },
    [onChange, isEmbedded]
  );
  const handlePuckPublish = useCallback(
    (data) => {
      handleSaveDraft(data);
    },
    [handleSaveDraft]
  );
  useEffect(() => {
    if (!isEmbedded) return;
    const onMessage = (e) => {
      switch (e.data?.type) {
        case "puck:save": {
          handleSaveDraft();
          break;
        }
        case "puck:undo":
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "z", code: "KeyZ", ctrlKey: true, bubbles: true }));
          break;
        case "puck:redo":
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "z", code: "KeyZ", ctrlKey: true, shiftKey: true, bubbles: true }));
          break;
        case "puck:viewport": {
          const frame = document.querySelector('[data-testid="puck-frame"]');
          if (frame) {
            const w = e.data.width || "100%";
            frame.style.maxWidth = w;
            frame.style.margin = w === "100%" ? "0" : "0 auto";
            frame.style.transition = "max-width 0.3s ease";
          }
          break;
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [isEmbedded, handleSaveDraft]);
  const lastSelectedRef = useRef(null);
  const handleItemSelect = useCallback(
    (appState) => {
      if (!isEmbedded) return;
      const selector = appState?.ui?.itemSelector;
      const selectorKey = selector ? JSON.stringify(selector) : null;
      if (selectorKey !== lastSelectedRef.current) {
        lastSelectedRef.current = selectorKey;
        if (selector) {
          const zone = selector.zone || "default-zone";
          const index = selector.index;
          let item = null;
          if (zone === "default-zone" || !zone) {
            item = appState?.data?.content?.[index];
          } else {
            item = appState?.data?.zones?.[zone]?.[index];
          }
          window.parent.postMessage({
            type: "puck:itemSelected",
            selector,
            item: item ? { type: item.type, id: item.props?.id } : null
          }, "*");
        } else {
          window.parent.postMessage({ type: "puck:itemDeselected" }, "*");
        }
      }
    },
    [isEmbedded]
  );
  if (loading || !initialData) {
    return /* @__PURE__ */ jsx("div", { style: editorStyles.loading, className, children: /* @__PURE__ */ jsxs("div", { style: editorStyles.loadingInner, children: [
      /* @__PURE__ */ jsx("div", { style: editorStyles.spinner }),
      /* @__PURE__ */ jsx("p", { style: editorStyles.loadingText, children: "Loading editor..." })
    ] }) });
  }
  const plugins = [
    ...fieldsPlugin ? [fieldsPlugin({ desktopSideBar: "left" })] : [],
    ...extraPlugins || []
  ];
  const mergedOverrides = { header: () => /* @__PURE__ */ jsx(Fragment, {}), ...overrides || {} };
  return /* @__PURE__ */ jsxs("div", { style: editorStyles.wrapper, className, children: [
    /* @__PURE__ */ jsx(
      Puck,
      {
        plugins,
        config,
        data: initialData,
        onPublish: handlePuckPublish,
        onChange: (data) => {
          handleChange(data);
          setTimeout(() => {
            try {
              const puckState = document.querySelector("[data-puck-component]")?.__puckAppState;
              if (puckState) handleItemSelect(puckState);
            } catch {
            }
          }, 50);
        },
        overrides: mergedOverrides
      }
    ),
    saving && /* @__PURE__ */ jsx("div", { style: editorStyles.saveIndicator, children: saveStatus === "error" ? "Save failed" : "Saving..." })
  ] });
};
var TecofRender = ({ data, config, className }) => {
  if (!data) return null;
  return /* @__PURE__ */ jsx("div", { className, children: /* @__PURE__ */ jsx(Render, { config, data }) });
};

// src/utils/index.ts
function hexToHsl(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}
function hslToHex(h, s, l) {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function lighten(hex, amount) {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.min(100, l + amount));
}
function darken(hex, amount) {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, l - amount));
}
function generateCSSVariables(theme) {
  const lines = [":root {"];
  for (const [key, value] of Object.entries(theme.colors)) {
    const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    lines.push(`  --theme-color-${cssKey}: ${value};`);
  }
  lines.push(`  --theme-font-family: ${theme.typography.fontFamily};`);
  lines.push(`  --theme-heading-font-family: ${theme.typography.headingFontFamily};`);
  lines.push(`  --theme-font-size-base: ${theme.typography.baseFontSize}px;`);
  lines.push(`  --theme-line-height: ${theme.typography.lineHeight};`);
  lines.push(`  --theme-font-weight-normal: ${theme.typography.fontWeightNormal};`);
  lines.push(`  --theme-font-weight-medium: ${theme.typography.fontWeightMedium};`);
  lines.push(`  --theme-font-weight-bold: ${theme.typography.fontWeightBold};`);
  for (const [level, scale] of Object.entries(theme.typography.headingScale)) {
    lines.push(`  --theme-heading-${level}: ${scale}rem;`);
  }
  lines.push(`  --theme-container-max-width: ${theme.spacing.containerMaxWidth}px;`);
  lines.push(`  --theme-section-padding-y: ${theme.spacing.sectionPaddingY}px;`);
  lines.push(`  --theme-section-padding-x: ${theme.spacing.sectionPaddingX}px;`);
  lines.push(`  --theme-component-gap: ${theme.spacing.componentGap}px;`);
  lines.push(`  --theme-border-radius: ${theme.spacing.borderRadius}px;`);
  lines.push(`  --theme-border-radius-lg: ${theme.spacing.borderRadiusLg}px;`);
  lines.push(`  --theme-border-radius-sm: ${theme.spacing.borderRadiusSm}px;`);
  if (theme.customTokens) {
    for (const [key, value] of Object.entries(theme.customTokens)) {
      lines.push(`  --theme-${key}: ${value};`);
    }
  }
  lines.push("}");
  return lines.join("\n");
}
function getDefaultTheme() {
  return {
    colors: {
      primary: "#18181b",
      secondary: "#f4f4f5",
      accent: "#3b82f6",
      background: "#ffffff",
      foreground: "#09090b",
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      border: "#e4e4e7",
      card: "#ffffff",
      cardForeground: "#09090b",
      destructive: "#ef4444"
    },
    typography: {
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      headingFontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      baseFontSize: 16,
      lineHeight: 1.6,
      headingScale: {
        h1: 3,
        h2: 2.25,
        h3: 1.875,
        h4: 1.5,
        h5: 1.25,
        h6: 1
      },
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700
    },
    spacing: {
      containerMaxWidth: 1280,
      sectionPaddingY: 80,
      sectionPaddingX: 24,
      componentGap: 24,
      borderRadius: 8,
      borderRadiusLg: 12,
      borderRadiusSm: 4
    }
  };
}
function mergeTheme(base, overrides) {
  const result = {
    colors: { ...base.colors, ...overrides.colors ?? {} },
    typography: { ...base.typography, ...overrides.typography ?? {} },
    spacing: { ...base.spacing, ...overrides.spacing ?? {} },
    customTokens: { ...base.customTokens ?? {}, ...overrides.customTokens ?? {} }
  };
  if (overrides.typography?.headingScale) {
    result.typography.headingScale = {
      ...base.typography.headingScale,
      ...overrides.typography.headingScale
    };
  }
  return result;
}

export { TecofApiClient, TecofEditor, TecofProvider, TecofRender, darken, generateCSSVariables, getDefaultTheme, hexToHsl, hslToHex, lighten, mergeTheme, useTecof };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map