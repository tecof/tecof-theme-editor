'use strict';

var chunkFMV4YLE6_js = require('./chunk-FMV4YLE6.js');
var react = require('react');
var jsxRuntime = require('react/jsx-runtime');
var reactDom = require('react-dom');
var lucideReact = require('lucide-react');

var merchantInfoCache = /* @__PURE__ */ new Map();
var CACHE_TTL = 5 * 60 * 1e3;
function useLanguages() {
  const { apiClient, secretKey, apiUrl } = chunkFMV4YLE6_js.useTecof();
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
var OPPOSITE = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
};
var parsePlacement = (placement) => {
  const [side, align] = placement.split("-");
  return { side, align: align ?? "center" };
};
function useFloating({
  anchor,
  open,
  placement = "bottom-start",
  offset = 6,
  padding = 8
}) {
  const floatingRef = react.useRef(null);
  const [pos, setPos] = react.useState({
    top: -9999,
    left: -9999,
    side: parsePlacement(placement).side
  });
  const update = react.useCallback(() => {
    const floating = floatingRef.current;
    if (!anchor || !floating) return;
    const a = anchor.getBoundingClientRect();
    const fw = floating.offsetWidth;
    const fh = floating.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { side: preferred, align } = parsePlacement(placement);
    const space = {
      top: a.top - padding,
      bottom: vh - a.bottom - padding,
      left: a.left - padding,
      right: vw - a.right - padding
    };
    const needed = (s) => (s === "top" || s === "bottom" ? fh : fw) + offset;
    let side = preferred;
    if (space[preferred] < needed(preferred) && space[OPPOSITE[preferred]] > space[preferred]) {
      side = OPPOSITE[preferred];
    }
    let top = 0;
    let left = 0;
    if (side === "bottom") top = a.bottom + offset;
    else if (side === "top") top = a.top - fh - offset;
    else if (side === "right") left = a.right + offset;
    else left = a.left - fw - offset;
    if (side === "top" || side === "bottom") {
      if (align === "start") left = a.left;
      else if (align === "end") left = a.right - fw;
      else left = a.left + (a.width - fw) / 2;
    } else {
      if (align === "start") top = a.top;
      else if (align === "end") top = a.bottom - fh;
      else top = a.top + (a.height - fh) / 2;
    }
    const clamp = (value, size, viewport) => Math.max(padding, Math.min(value, viewport - size - padding));
    setPos({
      top: clamp(top, fh, vh),
      left: clamp(left, fw, vw),
      side
    });
  }, [anchor, placement, offset, padding]);
  react.useLayoutEffect(() => {
    if (open) update();
  }, [open, update]);
  react.useEffect(() => {
    if (!open || !anchor) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    if (floatingRef.current) observer.observe(floatingRef.current);
    observer.observe(anchor);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [open, anchor, update]);
  return {
    floatingRef,
    style: { position: "fixed", top: pos.top, left: pos.left },
    side: pos.side,
    update
  };
}
var tokenFor = (shortcode) => `{{ data.${shortcode} }}`;
var BindingPopover = ({
  anchor,
  onInsert,
  onClose
}) => {
  const { apiClient } = chunkFMV4YLE6_js.useTecof();
  const { floatingRef, style: floatingStyle } = useFloating({
    anchor,
    open: true,
    placement: "bottom-end"
  });
  const [collections, setCollections] = react.useState([]);
  const [loading, setLoading] = react.useState(true);
  const [error, setError] = react.useState(null);
  const [activeSlug, setActiveSlug] = react.useState(null);
  const [query, setQuery] = react.useState("");
  react.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.getCmsCollections();
        if (cancelled) return;
        if (res.success && Array.isArray(res.data)) setCollections(res.data);
        else setError(res.message || "Koleksiyonlar y\xFCklenemedi");
      } catch (e) {
        if (!cancelled) setError(e?.message || "Ba\u011Flant\u0131 hatas\u0131");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiClient]);
  react.useEffect(() => {
    const onDown = (e) => {
      if (!floatingRef.current?.contains(e.target) && !anchor.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [anchor, onClose, floatingRef]);
  const active = collections.find((c) => c.slug === activeSlug) || null;
  const filteredCollections = collections.filter(
    (c) => !query.trim() || `${c.name} ${c.slug}`.toLowerCase().includes(query.toLowerCase())
  );
  const fields = active?.fields || [];
  const filteredFields = fields.filter(
    (f) => !query.trim() || `${f.name} ${f.shortcode}`.toLowerCase().includes(query.toLowerCase())
  );
  return reactDom.createPortal(
    /* @__PURE__ */ jsxRuntime.jsxs("div", { ref: floatingRef, className: "tecof-bind-popover", style: floatingStyle, role: "dialog", "aria-label": "CMS verisine ba\u011Fla", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-bind-header", children: active ? /* @__PURE__ */ jsxRuntime.jsxs("button", { type: "button", className: "tecof-bind-back", onClick: () => {
        setActiveSlug(null);
        setQuery("");
      }, children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronLeft, { size: 14 }),
        " ",
        active.name
      ] }) : /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-bind-title", children: "CMS verisine ba\u011Fla" }) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-bind-search", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { size: 13 }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "text",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: active ? "Alan ara\u2026" : "Koleksiyon ara\u2026",
            className: "tecof-bind-search-input",
            autoFocus: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-bind-list", children: loading ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-bind-empty", children: "Y\xFCkleniyor\u2026" }) : error ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-bind-empty", children: error }) : !active ? filteredCollections.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-bind-empty", children: "Koleksiyon yok" }) : filteredCollections.map((col) => /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          className: "tecof-bind-item",
          onClick: () => {
            setActiveSlug(col.slug);
            setQuery("");
          },
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Database, { size: 13 }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-bind-item-label", children: col.name }),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "tecof-bind-item-meta", children: [
              col.fields?.length ?? 0,
              " alan"
            ] })
          ]
        },
        col._id
      )) : filteredFields.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-bind-empty", children: "Alan yok" }) : filteredFields.map((f) => /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          className: "tecof-bind-item",
          onClick: () => {
            onInsert(tokenFor(f.shortcode));
            onClose();
          },
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Braces, { size: 13 }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-bind-item-label", children: f.name }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-bind-item-meta", children: f.type })
          ]
        },
        f.shortcode
      )) })
    ] }),
    document.body
  );
};
var CmsBindingButton = ({ onInsert, title = "CMS verisine ba\u011Fla" }) => {
  const [open, setOpen] = react.useState(false);
  const btnRef = react.useRef(null);
  const close = react.useCallback(() => setOpen(false), []);
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        ref: btnRef,
        type: "button",
        className: `tecof-bind-btn${open ? " is-active" : ""}`,
        onClick: () => setOpen((o) => !o),
        title,
        "aria-label": title,
        children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Braces, { size: 14 })
      }
    ),
    open && btnRef.current && /* @__PURE__ */ jsxRuntime.jsx(BindingPopover, { anchor: btnRef.current, onInsert, onClose: close })
  ] });
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
  const { apiClient } = chunkFMV4YLE6_js.useTecof();
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

exports.CmsBindingButton = CmsBindingButton;
exports.FieldErrorBoundary = FieldErrorBoundary;
exports.FieldLabel = FieldLabel;
exports.FieldLoading = FieldLoading;
exports.LanguageField = LanguageField;
exports.LanguageProvider = LanguageProvider;
exports.LanguageTabBar = LanguageTabBar;
exports.createLanguageField = createLanguageField;
exports.useActiveLanguage = useActiveLanguage;
exports.useFloating = useFloating;
exports.useLanguages = useLanguages;
//# sourceMappingURL=chunk-HOUGBQE3.js.map
//# sourceMappingURL=chunk-HOUGBQE3.js.map