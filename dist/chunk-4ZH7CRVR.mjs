import { useTecof, Drawer, TecofPicture } from './chunk-JQGJZ4SL.mjs';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { RefreshCcw, X, Image, Images, Search, Check, FileIcon, Loader2 } from 'lucide-react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

var isImageType = (type) => ["png", "jpg", "jpeg", "webp", "gif", "svg", "avif", "bmp", "tiff", "heic", "image"].some(
  (t) => type?.toLowerCase().includes(t)
);
var isPreviewableImage = (file) => file.type === "external" || file.provider === "external" || isImageType(file.type);
var ORIENTATIONS = [
  { value: "all", label: "T\xFCm\xFC" },
  { value: "landscape", label: "Yatay" },
  { value: "portrait", label: "Dikey" },
  { value: "square", label: "Kare" }
];
var StockPanel = ({ onImported }) => {
  const { apiClient } = useTecof();
  const [query, setQuery] = useState("");
  const [orientation, setOrientation] = useState("all");
  const [provider, setProvider] = useState(void 0);
  const [providers, setProviders] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState(null);
  const [searched, setSearched] = useState(false);
  const [noProvider, setNoProvider] = useState(false);
  const debounceRef = useRef(null);
  const runSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    const res = await apiClient.searchStockMedia(q.trim(), { provider, orientation, perPage: 30 });
    setLoading(false);
    if (res?.success) {
      setResults(res.data || []);
      setProviders(res.providers || []);
      if (res.provider) setProvider(res.provider);
      setNoProvider(res.note === "no-provider-configured");
    } else {
      setResults([]);
    }
  }, [apiClient, provider, orientation]);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, orientation, provider, runSearch]);
  const handleImport = async (photo) => {
    if (importingId) return;
    setImportingId(photo.id);
    const res = await apiClient.importStockMedia({ provider: photo.provider, downloadUrl: photo.downloadUrl, id: photo.id, alt: photo.alt });
    setImportingId(null);
    if (res?.success && res.data) {
      onImported(res.data);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "tecof-stock-panel", children: [
    /* @__PURE__ */ jsxs("div", { className: "tecof-stock-controls", children: [
      /* @__PURE__ */ jsxs("div", { className: "tecof-upload-search-box tecof-stock-search", children: [
        /* @__PURE__ */ jsx(Search, { size: 15, className: "tecof-icon-muted" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Stok g\xF6rsel ara\u2026 (\xF6rn. mimari, do\u011Fa)",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            className: "tecof-upload-search-input",
            autoFocus: true
          }
        ),
        query && /* @__PURE__ */ jsx("button", { type: "button", className: "tecof-upload-action-btn", onClick: () => setQuery(""), children: /* @__PURE__ */ jsx(X, { size: 13 }) })
      ] }),
      /* @__PURE__ */ jsx("select", { className: "tecof-stock-select", value: orientation, onChange: (e) => setOrientation(e.target.value), "aria-label": "Y\xF6n", children: ORIENTATIONS.map((o) => /* @__PURE__ */ jsx("option", { value: o.value, children: o.label }, o.value)) }),
      providers.length > 1 && /* @__PURE__ */ jsx("select", { className: "tecof-stock-select", value: provider, onChange: (e) => setProvider(e.target.value), "aria-label": "Kaynak", children: providers.map((p) => /* @__PURE__ */ jsx("option", { value: p, children: p[0].toUpperCase() + p.slice(1) }, p)) })
    ] }),
    noProvider ? /* @__PURE__ */ jsxs("div", { className: "tecof-upload-gallery-empty", children: [
      /* @__PURE__ */ jsx("div", { className: "tecof-upload-gallery-empty-icon", children: /* @__PURE__ */ jsx(Images, { size: 24, className: "tecof-icon-muted" }) }),
      /* @__PURE__ */ jsx("p", { className: "tecof-upload-empty-heading", children: "Stok sa\u011Flay\u0131c\u0131 yap\u0131land\u0131r\u0131lmam\u0131\u015F" }),
      /* @__PURE__ */ jsx("p", { className: "tecof-upload-empty-subheading", children: "Y\xF6netici Pexels/Pixabay API anahtar\u0131n\u0131 eklemeli." })
    ] }) : loading ? /* @__PURE__ */ jsx("div", { className: "tecof-media-skeleton-grid", "aria-busy": "true", children: Array.from({ length: 9 }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "tecof-media-skeleton-card", children: /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-skeleton-block tecof-media-skeleton-thumb" }) }, i)) }) : !searched ? /* @__PURE__ */ jsxs("div", { className: "tecof-upload-gallery-empty", children: [
      /* @__PURE__ */ jsx("div", { className: "tecof-upload-gallery-empty-icon", children: /* @__PURE__ */ jsx(Images, { size: 24, className: "tecof-icon-muted" }) }),
      /* @__PURE__ */ jsx("p", { className: "tecof-upload-empty-heading", children: "Milyonlarca \xFCcretsiz g\xF6rsel" }),
      /* @__PURE__ */ jsx("p", { className: "tecof-upload-empty-subheading", children: "Aramak i\xE7in bir \u015Feyler yaz\u0131n. Se\xE7ti\u011Finiz g\xF6rsel k\xFCt\xFCphanenize y\xFCklenir." })
    ] }) : results.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "tecof-upload-gallery-empty", children: [
      /* @__PURE__ */ jsx("div", { className: "tecof-upload-gallery-empty-icon", children: /* @__PURE__ */ jsx(Search, { size: 24, className: "tecof-icon-muted" }) }),
      /* @__PURE__ */ jsx("p", { className: "tecof-upload-empty-heading", children: "Sonu\xE7 bulunamad\u0131" }),
      /* @__PURE__ */ jsx("p", { className: "tecof-upload-empty-subheading", children: "Farkl\u0131 bir arama terimi deneyin" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "tecof-upload-gallery-grid", children: results.map((photo) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "tecof-upload-gallery-item tecof-stock-item",
        onClick: () => handleImport(photo),
        title: photo.alt,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "tecof-upload-gallery-thumb", children: [
            /* @__PURE__ */ jsx("img", { src: photo.thumbUrl, alt: photo.alt, loading: "lazy" }),
            importingId === photo.id && /* @__PURE__ */ jsx("div", { className: "tecof-stock-importing", children: /* @__PURE__ */ jsx(Loader2, { size: 20, className: "tecof-upload-spin" }) })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "tecof-upload-gallery-file-name", children: photo.author || photo.provider })
        ]
      },
      `${photo.provider}-${photo.id}`
    )) })
  ] });
};
var MediaDrawer = ({
  open,
  onOpenChange,
  onSelect,
  selectedIds = [],
  allowMultiple = false,
  filterImages = false,
  title = "Medya K\xFCt\xFCphanesi",
  extraTabs = [],
  enableStock = false
}) => {
  const { apiClient } = useTecof();
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [gallerySearch, setGallerySearch] = useState("");
  const [activeTab, setActiveTab] = useState("library");
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiClient.getUploads(1, 100).then((res) => {
      if (res.success && res.data) {
        setGalleryFiles(res.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [open, refreshKey, apiClient]);
  const handleSelect = useCallback((file) => {
    onSelect(file);
    if (!allowMultiple) {
      onOpenChange(false);
    }
  }, [onSelect, allowMultiple, onOpenChange]);
  const filteredGallery = useMemo(() => {
    let files = galleryFiles;
    if (filterImages) {
      files = files.filter(isPreviewableImage);
    }
    if (gallerySearch.trim()) {
      const q = gallerySearch.toLowerCase();
      files = files.filter(
        (f) => f.name?.toLowerCase().includes(q) || f.meta?.originalName?.toLowerCase().includes(q)
      );
    }
    return files;
  }, [galleryFiles, filterImages, gallerySearch]);
  return /* @__PURE__ */ jsx(Drawer.Root, { open, onOpenChange: (o) => {
    onOpenChange(o);
    if (!o) {
      setGallerySearch("");
      setActiveTab("library");
    }
  }, children: /* @__PURE__ */ jsxs(Drawer.Portal, { children: [
    /* @__PURE__ */ jsx(Drawer.Overlay, { className: "tecof-upload-drawer-overlay" }),
    /* @__PURE__ */ jsxs(Drawer.Content, { className: "tecof-upload-drawer-content", children: [
      /* @__PURE__ */ jsx(Drawer.Title, { className: "tecof-sr-only", children: title }),
      /* @__PURE__ */ jsx(Drawer.Description, { className: "tecof-sr-only", children: "Sunucudaki dosyalardan birini se\xE7in" }),
      /* @__PURE__ */ jsx("div", { className: "tecof-upload-drawer-handle" }),
      /* @__PURE__ */ jsxs("div", { className: "tecof-upload-drawer-inner", children: [
        /* @__PURE__ */ jsxs("div", { className: "tecof-upload-drawer-header", children: [
          /* @__PURE__ */ jsx("h2", { className: "tecof-upload-drawer-title", children: title }),
          /* @__PURE__ */ jsxs("div", { className: "tecof-upload-drawer-header-actions", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "tecof-upload-drawer-action-btn",
                onClick: () => setRefreshKey((k) => k + 1),
                disabled: loading,
                title: "Yenile",
                children: /* @__PURE__ */ jsx(RefreshCcw, { size: 15, className: loading ? "tecof-upload-spin" : "" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "tecof-upload-drawer-action-btn",
                onClick: () => onOpenChange(false),
                title: "Kapat",
                children: /* @__PURE__ */ jsx(X, { size: 15 })
              }
            )
          ] })
        ] }),
        (extraTabs.length > 0 || enableStock) && /* @__PURE__ */ jsxs("div", { className: "tecof-media-tabs", role: "tablist", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-selected": activeTab === "library",
              className: `tecof-media-tab${activeTab === "library" ? " is-active" : ""}`,
              onClick: () => setActiveTab("library"),
              children: [
                /* @__PURE__ */ jsx(Image, { size: 14 }),
                " K\xFCt\xFCphane"
              ]
            }
          ),
          enableStock && /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-selected": activeTab === "stock",
              className: `tecof-media-tab${activeTab === "stock" ? " is-active" : ""}`,
              onClick: () => setActiveTab("stock"),
              children: [
                /* @__PURE__ */ jsx(Images, { size: 14 }),
                " Stok"
              ]
            }
          ),
          extraTabs.map((tab) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-selected": activeTab === tab.id,
              className: `tecof-media-tab${activeTab === tab.id ? " is-active" : ""}`,
              onClick: () => setActiveTab(tab.id),
              children: [
                tab.icon,
                tab.label
              ]
            },
            tab.id
          ))
        ] }),
        activeTab === "stock" ? /* @__PURE__ */ jsx("div", { className: "tecof-media-tab-panel", children: /* @__PURE__ */ jsx(StockPanel, { onImported: handleSelect }) }) : activeTab !== "library" ? /* @__PURE__ */ jsx("div", { className: "tecof-media-tab-panel", children: extraTabs.find((t) => t.id === activeTab)?.render() }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "tecof-upload-search-box", children: [
            /* @__PURE__ */ jsx(Search, { size: 15, className: "tecof-icon-muted" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Dosya ara...",
                value: gallerySearch,
                onChange: (e) => setGallerySearch(e.target.value),
                className: "tecof-upload-search-input"
              }
            ),
            gallerySearch && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "tecof-upload-action-btn tecof-upload-clear-search-btn",
                onClick: () => setGallerySearch(""),
                children: /* @__PURE__ */ jsx(X, { size: 13 })
              }
            )
          ] }),
          loading ? /* @__PURE__ */ jsx("div", { className: "tecof-media-skeleton-grid", "aria-busy": "true", children: Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "tecof-media-skeleton-card", children: [
            /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-skeleton-block tecof-media-skeleton-thumb" }),
            /* @__PURE__ */ jsx("span", { className: "tecof-skeleton tecof-skeleton-text w-80" })
          ] }, index)) }) : filteredGallery.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "tecof-upload-gallery-empty", children: [
            /* @__PURE__ */ jsx("div", { className: "tecof-upload-gallery-empty-icon", children: /* @__PURE__ */ jsx(Image, { size: 24, className: "tecof-icon-muted" }) }),
            /* @__PURE__ */ jsx("p", { className: "tecof-upload-empty-heading", children: gallerySearch ? "Sonu\xE7 bulunamad\u0131" : "Hen\xFCz dosya yok" }),
            /* @__PURE__ */ jsx("p", { className: "tecof-upload-empty-subheading", children: gallerySearch ? "Farkl\u0131 bir arama terimi deneyin" : "Dosyalar\u0131n\u0131z burada g\xF6r\xFCnecek" })
          ] }) : /* @__PURE__ */ jsx("div", { className: "tecof-upload-gallery-grid", children: filteredGallery.map((file) => {
            const selected = selectedIds.includes(file._id ?? "");
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: `tecof-upload-gallery-item ${selected ? "selected" : ""}`,
                onClick: () => handleSelect(file),
                children: [
                  selected && /* @__PURE__ */ jsx("div", { className: "tecof-upload-gallery-check", children: /* @__PURE__ */ jsx(Check, { size: 12, strokeWidth: 3 }) }),
                  isPreviewableImage(file) ? /* @__PURE__ */ jsx(
                    TecofPicture,
                    {
                      data: file,
                      alt: file.name,
                      size: "thumbnail",
                      className: "tecof-upload-gallery-thumb"
                    }
                  ) : /* @__PURE__ */ jsx("div", { className: "tecof-upload-gallery-thumb tecof-upload-gallery-file-icon-wrap", children: /* @__PURE__ */ jsx(FileIcon, { size: 24, className: "tecof-icon-muted" }) }),
                  /* @__PURE__ */ jsx("p", { className: "tecof-upload-gallery-file-name", children: file.meta?.originalName || file.name })
                ]
              },
              file._id
            );
          }) })
        ] })
      ] })
    ] })
  ] }) });
};

export { MediaDrawer };
//# sourceMappingURL=chunk-4ZH7CRVR.mjs.map
//# sourceMappingURL=chunk-4ZH7CRVR.mjs.map