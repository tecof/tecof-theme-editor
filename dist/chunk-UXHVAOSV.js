'use strict';

var chunkEC7VNWDF_js = require('./chunk-EC7VNWDF.js');
var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

var isImageType = (type) => ["png", "jpg", "jpeg", "webp", "gif", "svg", "avif", "bmp", "tiff", "heic", "image"].some(
  (t) => type?.toLowerCase().includes(t)
);
var MediaDrawer = ({
  open,
  onOpenChange,
  onSelect,
  selectedIds = [],
  allowMultiple = false,
  filterImages = false,
  title = "Medya K\xFCt\xFCphanesi",
  extraTabs = []
}) => {
  const { apiClient } = chunkEC7VNWDF_js.useTecof();
  const [galleryFiles, setGalleryFiles] = react.useState([]);
  const [loading, setLoading] = react.useState(false);
  const [refreshKey, setRefreshKey] = react.useState(0);
  const [gallerySearch, setGallerySearch] = react.useState("");
  const [activeTab, setActiveTab] = react.useState("library");
  react.useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiClient.getUploads(1, 100).then((res) => {
      if (res.success && res.data) {
        setGalleryFiles(res.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [open, refreshKey, apiClient]);
  const handleSelect = react.useCallback((file) => {
    onSelect(file);
    if (!allowMultiple) {
      onOpenChange(false);
    }
  }, [onSelect, allowMultiple, onOpenChange]);
  const filteredGallery = react.useMemo(() => {
    let files = galleryFiles;
    if (filterImages) {
      files = files.filter((f) => isImageType(f.type));
    }
    if (gallerySearch.trim()) {
      const q = gallerySearch.toLowerCase();
      files = files.filter(
        (f) => f.name?.toLowerCase().includes(q) || f.meta?.originalName?.toLowerCase().includes(q)
      );
    }
    return files;
  }, [galleryFiles, filterImages, gallerySearch]);
  return /* @__PURE__ */ jsxRuntime.jsx(chunkEC7VNWDF_js.Drawer.Root, { open, onOpenChange: (o) => {
    onOpenChange(o);
    if (!o) {
      setGallerySearch("");
      setActiveTab("library");
    }
  }, children: /* @__PURE__ */ jsxRuntime.jsxs(chunkEC7VNWDF_js.Drawer.Portal, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(chunkEC7VNWDF_js.Drawer.Overlay, { className: "tecof-upload-drawer-overlay" }),
    /* @__PURE__ */ jsxRuntime.jsxs(chunkEC7VNWDF_js.Drawer.Content, { className: "tecof-upload-drawer-content", children: [
      /* @__PURE__ */ jsxRuntime.jsx(chunkEC7VNWDF_js.Drawer.Title, { className: "tecof-sr-only", children: title }),
      /* @__PURE__ */ jsxRuntime.jsx(chunkEC7VNWDF_js.Drawer.Description, { className: "tecof-sr-only", children: "Sunucudaki dosyalardan birini se\xE7in" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-upload-drawer-handle" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-upload-drawer-inner", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-upload-drawer-header", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "tecof-upload-drawer-title", children: title }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-upload-drawer-header-actions", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                className: "tecof-upload-drawer-action-btn",
                onClick: () => setRefreshKey((k) => k + 1),
                disabled: loading,
                title: "Yenile",
                children: /* @__PURE__ */ jsxRuntime.jsx(chunkEC7VNWDF_js.RefreshCcw, { size: 15, className: loading ? "tecof-upload-spin" : "" })
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                className: "tecof-upload-drawer-action-btn",
                onClick: () => onOpenChange(false),
                title: "Kapat",
                children: /* @__PURE__ */ jsxRuntime.jsx(chunkEC7VNWDF_js.X, { size: 15 })
              }
            )
          ] })
        ] }),
        extraTabs.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-media-tabs", role: "tablist", children: [
          /* @__PURE__ */ jsxRuntime.jsxs(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-selected": activeTab === "library",
              className: `tecof-media-tab${activeTab === "library" ? " is-active" : ""}`,
              onClick: () => setActiveTab("library"),
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(chunkEC7VNWDF_js.Image, { size: 14 }),
                " K\xFCt\xFCphane"
              ]
            }
          ),
          extraTabs.map((tab) => /* @__PURE__ */ jsxRuntime.jsxs(
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
        activeTab !== "library" ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-media-tab-panel", children: extraTabs.find((t) => t.id === activeTab)?.render() }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-upload-search-box", children: [
            /* @__PURE__ */ jsxRuntime.jsx(chunkEC7VNWDF_js.Search, { size: 15, className: "tecof-icon-muted" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "text",
                placeholder: "Dosya ara...",
                value: gallerySearch,
                onChange: (e) => setGallerySearch(e.target.value),
                className: "tecof-upload-search-input"
              }
            ),
            gallerySearch && /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                className: "tecof-upload-action-btn tecof-upload-clear-search-btn",
                onClick: () => setGallerySearch(""),
                children: /* @__PURE__ */ jsxRuntime.jsx(chunkEC7VNWDF_js.X, { size: 13 })
              }
            )
          ] }),
          loading ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-media-skeleton-grid", "aria-busy": "true", children: Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-media-skeleton-card", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-skeleton-block tecof-media-skeleton-thumb" }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-skeleton tecof-skeleton-text w-80" })
          ] }, index)) }) : filteredGallery.length === 0 ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-upload-gallery-empty", children: [
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-upload-gallery-empty-icon", children: /* @__PURE__ */ jsxRuntime.jsx(chunkEC7VNWDF_js.Image, { size: 24, className: "tecof-icon-muted" }) }),
            /* @__PURE__ */ jsxRuntime.jsx("p", { className: "tecof-upload-empty-heading", children: gallerySearch ? "Sonu\xE7 bulunamad\u0131" : "Hen\xFCz dosya yok" }),
            /* @__PURE__ */ jsxRuntime.jsx("p", { className: "tecof-upload-empty-subheading", children: gallerySearch ? "Farkl\u0131 bir arama terimi deneyin" : "Dosyalar\u0131n\u0131z burada g\xF6r\xFCnecek" })
          ] }) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-upload-gallery-grid", children: filteredGallery.map((file) => {
            const selected = selectedIds.includes(file._id ?? "");
            return /* @__PURE__ */ jsxRuntime.jsxs(
              "div",
              {
                className: `tecof-upload-gallery-item ${selected ? "selected" : ""}`,
                onClick: () => handleSelect(file),
                children: [
                  selected && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-upload-gallery-check", children: /* @__PURE__ */ jsxRuntime.jsx(chunkEC7VNWDF_js.Check, { size: 12, strokeWidth: 3 }) }),
                  isImageType(file.type) ? /* @__PURE__ */ jsxRuntime.jsx(
                    chunkEC7VNWDF_js.TecofPicture,
                    {
                      data: file,
                      alt: file.name,
                      size: "thumbnail",
                      className: "tecof-upload-gallery-thumb"
                    }
                  ) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-upload-gallery-thumb tecof-upload-gallery-file-icon-wrap", children: /* @__PURE__ */ jsxRuntime.jsx(chunkEC7VNWDF_js.File, { size: 24, className: "tecof-icon-muted" }) }),
                  /* @__PURE__ */ jsxRuntime.jsx("p", { className: "tecof-upload-gallery-file-name", children: file.meta?.originalName || file.name })
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

exports.MediaDrawer = MediaDrawer;
//# sourceMappingURL=chunk-UXHVAOSV.js.map
//# sourceMappingURL=chunk-UXHVAOSV.js.map