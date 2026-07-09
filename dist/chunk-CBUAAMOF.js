'use strict';

var chunkBAKC3WGA_js = require('./chunk-BAKC3WGA.js');
var react = require('react');
var jsxRuntime = require('react/jsx-runtime');
var lucideReact = require('lucide-react');

var merchantInfoCache = /* @__PURE__ */ new Map();
var CACHE_TTL = 5 * 60 * 1e3;
function useLanguages() {
  const { apiClient, secretKey, apiUrl } = chunkBAKC3WGA_js.useTecof();
  const [merchantInfo, setMerchantInfo] = react.useState(null);
  const [loading, setLoading] = react.useState(true);
  const [error, setError] = react.useState(null);
  const [activeTab, setActiveTab] = react.useState("");
  const cacheKey = react.useMemo(() => `${apiUrl}::${secretKey}`, [apiUrl, secretKey]);
  react.useEffect(() => {
    let cancelled = false;
    const fetchInfo = async () => {
      const cached = merchantInfoCache.get(cacheKey);
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        setMerchantInfo(cached.data);
        if (!activeTab) setActiveTab(cached.data.defaultLanguage);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const res = await apiClient.getMerchantInfo();
      if (cancelled) return;
      if (res.success && res.data) {
        merchantInfoCache.set(cacheKey, { data: res.data, ts: Date.now() });
        setMerchantInfo(res.data);
        if (!activeTab) setActiveTab(res.data.defaultLanguage);
      } else {
        setError(res.message || "Failed to load languages");
        const fallback = { languages: ["tr"], defaultLanguage: "tr" };
        setMerchantInfo(fallback);
        if (!activeTab) setActiveTab("tr");
      }
      setLoading(false);
    };
    fetchInfo();
    return () => {
      cancelled = true;
    };
  }, [apiClient, cacheKey]);
  return { merchantInfo, loading, error, activeTab, setActiveTab };
}
var ActiveLanguageContext = react.createContext(null);
var LanguageProvider = ({ children }) => {
  const { merchantInfo, activeTab, setActiveTab, loading } = useLanguages();
  const value = react.useMemo(
    () => ({
      languages: merchantInfo?.languages || [],
      defaultLanguage: merchantInfo?.defaultLanguage || "",
      activeLanguage: activeTab,
      setActiveLanguage: setActiveTab,
      loading
    }),
    [merchantInfo, activeTab, setActiveTab, loading]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(ActiveLanguageContext.Provider, { value, children });
};
var useActiveLanguage = () => react.useContext(ActiveLanguageContext);
var FieldErrorBoundary = class extends react.Component {
  constructor(props) {
    super(props);
    this.handleRetry = () => {
      this.setState({ hasError: false, error: null });
    };
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error(
      `[TecofEditor] Field "${this.props.fieldName || "unknown"}" crashed:`,
      error,
      errorInfo
    );
    this.props.onError?.(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-field-error-boundary", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-field-error-icon", children: "\u26A0\uFE0F" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-field-error-content", children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "tecof-field-error-title", children: "Bu alan y\xFCklenemedi" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "tecof-field-error-detail", children: this.state.error?.message || "Beklenmeyen bir hata olu\u015Ftu" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            className: "tecof-field-error-retry",
            onClick: this.handleRetry,
            children: "Tekrar Dene"
          }
        )
      ] });
    }
    return this.props.children;
  }
};
var FieldLabel = ({
  label,
  icon,
  readOnly,
  children,
  el = "label"
}) => {
  const Component2 = el;
  return /* @__PURE__ */ jsxRuntime.jsxs(Component2, { className: "tecof-field-label-container", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-field-label-header", children: [
      icon && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-field-label-icon", children: icon }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { children: label }),
      readOnly && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-field-label-readonly", children: "Salt Okunur" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-field-label-content", children })
  ] });
};
var LanguageTabBar = ({
  languages,
  defaultLanguage,
  activeTab,
  onTabChange
}) => {
  if (languages.length <= 1) return null;
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-lang-tab-bar", children: languages.map((code) => /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      type: "button",
      className: `tecof-lang-tab ${activeTab === code ? "active" : ""}`,
      onClick: () => onTabChange(code),
      title: code.toUpperCase(),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: code.toUpperCase() }),
        code === defaultLanguage && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-lang-default-badge", children: "DEFAULT" })
      ]
    },
    code
  )) });
};
var FieldLoading = () => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-field-loading", "aria-busy": "true", children: [
  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-field-loading-row", children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-skeleton-circle tecof-field-loading-thumb" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-field-loading-lines", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-skeleton-text w-60" }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-skeleton-text sm w-80" })
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-skeleton-block tecof-studio-skeleton-field" })
] });
var StableInput = ({
  value: externalValue,
  onChange,
  disabled,
  placeholder,
  className
}) => {
  const [localValue, setLocalValue] = react.useState(externalValue);
  const lastEmitted = react.useRef(externalValue);
  react.useEffect(() => {
    if (externalValue !== lastEmitted.current) {
      setLocalValue(externalValue);
      lastEmitted.current = externalValue;
    }
  }, [externalValue]);
  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    lastEmitted.current = val;
    onChange(val);
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    "input",
    {
      type: "text",
      value: localValue,
      onChange: handleChange,
      disabled,
      placeholder,
      className
    }
  );
};
var StableTextarea = ({
  value: externalValue,
  onChange,
  disabled,
  placeholder,
  className,
  rows
}) => {
  const [localValue, setLocalValue] = react.useState(externalValue);
  const lastEmitted = react.useRef(externalValue);
  react.useEffect(() => {
    if (externalValue !== lastEmitted.current) {
      setLocalValue(externalValue);
      lastEmitted.current = externalValue;
    }
  }, [externalValue]);
  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    lastEmitted.current = val;
    onChange(val);
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    "textarea",
    {
      value: localValue,
      onChange: handleChange,
      rows,
      disabled,
      placeholder,
      className
    }
  );
};
var LanguageField = ({
  value,
  onChange,
  readOnly,
  isTextarea = false,
  textareaRows = 3,
  placeholder = "",
  isHtml = false
}) => {
  const {
    merchantInfo,
    loading,
    error,
    activeTab: localActiveTab,
    setActiveTab: localSetActiveTab
  } = useLanguages();
  const globalLang = useActiveLanguage();
  const activeTab = globalLang ? globalLang.activeLanguage : localActiveTab;
  const setActiveTab = globalLang ? globalLang.setActiveLanguage : localSetActiveTab;
  const { apiClient } = chunkBAKC3WGA_js.useTecof();
  const [translating, setTranslating] = react.useState(false);
  const [statusMsg, setStatusMsg] = react.useState(null);
  const values = react.useMemo(() => {
    if (!merchantInfo) return value || [];
    const current = value || [];
    return merchantInfo.languages.map((code) => {
      const existing = current.find((v) => v.code === code);
      return existing || { code, value: "" };
    });
  }, [value, merchantInfo]);
  const valuesRef = react.useRef(values);
  valuesRef.current = values;
  const onChangeRef = react.useRef(onChange);
  onChangeRef.current = onChange;
  const handleChange = react.useCallback((code, newVal) => {
    const current = valuesRef.current;
    const updated = [...current];
    const idx = updated.findIndex((v) => v.code === code);
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], value: newVal };
    } else {
      updated.push({ code, value: newVal });
    }
    onChangeRef.current(updated);
  }, []);
  const getCurrentText = react.useCallback(() => {
    return valuesRef.current.find((v) => v.code === activeTab)?.value || "";
  }, [activeTab]);
  const handleFastFill = react.useCallback(() => {
    const text = getCurrentText();
    if (!text) return;
    if (!merchantInfo) return;
    const updated = merchantInfo.languages.map((code) => ({
      code,
      value: text
    }));
    onChangeRef.current(updated);
    setStatusMsg({ text: "T\xFCm dillere kopyaland\u0131", type: "success" });
    setTimeout(() => setStatusMsg(null), 2e3);
  }, [getCurrentText, merchantInfo]);
  const handleTranslate = react.useCallback(async () => {
    const text = getCurrentText();
    if (!text || !merchantInfo) return;
    const otherLocales = merchantInfo.languages.filter((l) => l !== activeTab);
    if (otherLocales.length === 0) return;
    setTranslating(true);
    setStatusMsg(null);
    try {
      const res = await apiClient.translate(text, activeTab, otherLocales, isHtml);
      if (res.success && Array.isArray(res.data)) {
        const updated = [...valuesRef.current];
        for (const t of res.data) {
          const idx = updated.findIndex((v) => v.code === t.code);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], value: t.value };
          } else {
            updated.push({ code: t.code, value: t.value });
          }
        }
        onChangeRef.current(updated);
        setStatusMsg({ text: "\xC7eviri tamamland\u0131", type: "success" });
      } else {
        setStatusMsg({ text: res.message || "\xC7eviri hatas\u0131", type: "error" });
      }
    } catch (err) {
      setStatusMsg({ text: err.message || "\xC7eviri hatas\u0131", type: "error" });
    } finally {
      setTranslating(false);
      setTimeout(() => setStatusMsg(null), 3e3);
    }
  }, [getCurrentText, merchantInfo, activeTab, apiClient, isHtml]);
  if (loading) return /* @__PURE__ */ jsxRuntime.jsx(FieldLoading, {});
  if (error && !merchantInfo) return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-lang-error", children: error });
  if (!merchantInfo) return null;
  const { languages, defaultLanguage } = merchantInfo;
  const hasText = !!getCurrentText();
  const hasMultipleLanguages = languages.length > 1;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-lang-container", children: [
    !globalLang && /* @__PURE__ */ jsxRuntime.jsx(
      LanguageTabBar,
      {
        languages,
        defaultLanguage,
        activeTab,
        onTabChange: setActiveTab
      }
    ),
    languages.map((code) => {
      if (activeTab !== code) return null;
      const currentValue = values.find((v) => v.code === code)?.value || "";
      return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-lang-input-wrapper", children: isTextarea ? /* @__PURE__ */ jsxRuntime.jsx(
        StableTextarea,
        {
          value: currentValue,
          onChange: (val) => handleChange(code, val),
          rows: textareaRows,
          placeholder: placeholder || `${code.toUpperCase()} text...`,
          disabled: readOnly,
          className: "tecof-lang-input tecof-lang-textarea"
        }
      ) : /* @__PURE__ */ jsxRuntime.jsx(
        StableInput,
        {
          value: currentValue,
          onChange: (val) => handleChange(code, val),
          placeholder: placeholder || `${code.toUpperCase()} text...`,
          disabled: readOnly,
          className: "tecof-lang-input"
        }
      ) }, code);
    }),
    !readOnly && hasMultipleLanguages && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-lang-action-bar", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          className: "tecof-lang-action-btn",
          onClick: handleFastFill,
          disabled: !hasText,
          title: "Aktif sekmedeki metni t\xFCm dillere kopyala",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { size: 12 }),
            " H\u0131zl\u0131 Doldur"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          className: "tecof-lang-action-btn",
          onClick: handleTranslate,
          disabled: !hasText || translating,
          title: "Aktif sekmedeki metni di\u011Fer dillere \xE7evir",
          children: [
            translating ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { size: 12, className: "tecof-spin" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Languages, { size: 12 }),
            translating ? "\xC7evriliyor..." : "\xC7evir"
          ]
        }
      ),
      statusMsg && /* @__PURE__ */ jsxRuntime.jsx("span", { className: `tecof-lang-status-msg ${statusMsg.type === "success" ? "success" : "error"}`, children: statusMsg.text })
    ] })
  ] });
};
var createLanguageField = (options = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;
  return {
    type: "custom",
    _fieldType: "language",
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }) => /* @__PURE__ */ jsxRuntime.jsx(FieldLabel, { label: label || "", icon: labelIcon, readOnly, children: /* @__PURE__ */ jsxRuntime.jsx(FieldErrorBoundary, { fieldName: name, children: /* @__PURE__ */ jsxRuntime.jsx(
      LanguageField,
      {
        field,
        name,
        id,
        value: value || [],
        onChange,
        readOnly,
        ...fieldOptions
      }
    ) }) })
  };
};

exports.FieldErrorBoundary = FieldErrorBoundary;
exports.FieldLabel = FieldLabel;
exports.FieldLoading = FieldLoading;
exports.LanguageField = LanguageField;
exports.LanguageProvider = LanguageProvider;
exports.LanguageTabBar = LanguageTabBar;
exports.createLanguageField = createLanguageField;
exports.useActiveLanguage = useActiveLanguage;
exports.useLanguages = useLanguages;
//# sourceMappingURL=chunk-CBUAAMOF.js.map
//# sourceMappingURL=chunk-CBUAAMOF.js.map