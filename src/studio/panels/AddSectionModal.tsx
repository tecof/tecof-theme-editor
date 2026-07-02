import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronRight, LayoutGrid, LayoutTemplate, Search, X } from 'lucide-react';
import type { ComponentConfig, SectionTemplate, StudioConfig } from '../../types';
import { useStudio } from '../context';

/**
 * Reference desktop width the preview is rendered at before being scaled down to
 * fit the card. Full-width website sections are designed for a desktop viewport,
 * so rendering at a real desktop width (then scaling) keeps their layout intact
 * instead of squishing them into the card's narrow physical width.
 */
const PREVIEW_REFERENCE_WIDTH = 1280;

/** Stable fallbacks so `config?.x || {}` doesn't produce a new reference per render. */
const NO_TEMPLATES: SectionTemplate[] = [];
const NO_CATEGORIES: NonNullable<StudioConfig['categories']> = {};
const NO_COMPONENTS: StudioConfig['components'] = {};

class PreviewErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error("Preview render failed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="tecof-modal-preview-fallback">
          Önizleme Yüklenemedi
        </div>
      );
    }
    return this.props.children;
  }
}

interface PreviewComponentProps {
  renderFn: ComponentConfig['render'];
  props: Record<string, unknown>;
}

const PreviewComponent = ({ renderFn, props }: PreviewComponentProps) => {
  return (
    <PreviewErrorBoundary>
      {renderFn(props)}
    </PreviewErrorBoundary>
  );
};

type PreviewMode = 'section' | 'element';

interface AutoScalePreviewProps {
  mode: PreviewMode;
  children: React.ReactNode;
}

/**
 * Renders a live component preview and scales it to fit the card, measuring the
 * available box with a ResizeObserver instead of relying on a hard-coded CSS
 * scale factor.
 *
 * - `section`: the content is rendered at {@link PREVIEW_REFERENCE_WIDTH} (a real
 *   desktop width) and uniformly scaled down to the card width, top-aligned — so
 *   full-bleed sections keep their intended desktop layout.
 * - `element`: small/inline components are measured at their natural size and
 *   scaled to *fit* (never upscaled past 1×), centered in the box.
 */
const AutoScalePreview = ({ mode, children }: AutoScalePreviewProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(mode === 'section' ? 0.2 : 1);

  useEffect(() => {
    const box = boxRef.current;
    const stage = stageRef.current;
    if (!box || !stage) return;

    const update = () => {
      const boxWidth = box.clientWidth;
      const boxHeight = box.clientHeight;
      if (boxWidth <= 0 || boxHeight <= 0) return;

      if (mode === 'section') {
        setScale(boxWidth / PREVIEW_REFERENCE_WIDTH);
        return;
      }

      // element: fit the content's natural size into the box (with a little padding)
      const naturalWidth = stage.scrollWidth || 1;
      const naturalHeight = stage.scrollHeight || 1;
      const pad = 28;
      const next = Math.min(
        1,
        (boxWidth - pad) / naturalWidth,
        (boxHeight - pad) / naturalHeight,
      );
      setScale(next > 0 ? next : 1);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(box);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [mode]);

  return (
    <div ref={boxRef} className={`tecof-modal-preview-box mode-${mode}`}>
      <div
        ref={stageRef}
        className="tecof-modal-preview-stage"
        style={
          mode === 'section'
            ? { width: PREVIEW_REFERENCE_WIDTH, transform: `scale(${scale})` }
            : { transform: `translate(-50%, -50%) scale(${scale})` }
        }
      >
        {children}
      </div>
    </div>
  );
};

const DummySlot = () => <div className="tecof-modal-dummy-slot">İçerik Alanı</div>;

/**
 * Build the props a component preview is rendered with: the component's default
 * props plus editor stubs (dummy drop zones, slot fields rendered as
 * placeholders) so child rendering can't crash on missing elements.
 */
const buildPreviewProps = (
  compConfig: ComponentConfig | undefined,
  props: Record<string, unknown>,
): Record<string, unknown> => {
  const renderProps: Record<string, unknown> = {
    ...props,
    puck: {
      renderDropZone: () => <DummySlot />,
      isEditing: false,
      metadata: {},
    },
    editMode: false,
  };

  for (const [fieldName, fieldDef] of Object.entries(compConfig?.fields ?? {})) {
    if (fieldDef?.type === 'slot') {
      renderProps[fieldName] = () => <DummySlot />;
    }
  }

  return renderProps;
};

interface GridCardProps {
  label: string;
  /** Secondary line under the label (component type or "Şablon"). */
  typeText: string;
  preview: React.ReactNode;
  onActivate: () => void;
}

/** Clickable & keyboard-accessible card shell shared by all grid items. */
const GridCard = ({ label, typeText, preview, onActivate }: GridCardProps) => (
  <div
    className="tecof-modal-grid-card"
    role="button"
    tabIndex={0}
    onClick={onActivate}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate();
      }
    }}
  >
    {preview}
    <div className="tecof-modal-card-footer">
      <div className="tecof-modal-card-text">
        <span className="tecof-modal-card-label">{label}</span>
        <span className="tecof-modal-card-type">{typeText}</span>
      </div>
      <ChevronRight size={15} className="tecof-modal-card-arrow" aria-hidden="true" />
    </div>
  </div>
);

/** A saved/shared component as returned by the studio API. */
interface SavedSharedComponent {
  _id: string;
  name: string;
  type: string;
  props: Record<string, unknown>;
}

interface DisplayItem {
  isSaved: boolean;
  isTemplate?: boolean;
  id: string;
  name: string;
  type: string;
  props: Record<string, unknown>;
  template?: SectionTemplate;
}

export interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: string, customProps?: Record<string, unknown>) => void;
  /** Insert a pre-built section template (subtree with fresh ids). */
  onSelectTemplate?: (template: SectionTemplate) => void;
  config: StudioConfig;
}

export const AddSectionModal = ({ isOpen, onClose, onSelect, onSelectTemplate, config }: AddSectionModalProps) => {
  const { apiClient } = useStudio();
  const templates = config?.templates ?? NO_TEMPLATES;
  const categories = config?.categories ?? NO_CATEGORIES;
  const components = config?.components ?? NO_COMPONENTS;
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedComponents, setSavedComponents] = useState<SavedSharedComponent[]>([]);

  // Fetch saved global components when the modal opens
  useEffect(() => {
    if (!isOpen || !apiClient) return;
    let cancelled = false;
    apiClient.getSharedComponents()
      .then(res => {
        if (!cancelled && res?.success && Array.isArray(res.data)) {
          setSavedComponents(res.data);
        }
      })
      .catch(err => {
        console.error("Failed to load saved/shared components:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, apiClient]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // All category titles mapping
  const categoryList = useMemo(() => {
    const list = [{ key: 'all', title: 'Tümü' }];
    if (templates.length > 0) {
      list.push({ key: 'templates', title: 'Şablonlar' });
    }
    if (savedComponents.length > 0) {
      list.push({ key: 'saved', title: 'Kaydedilenler (Ortak)' });
    }
    Object.entries(categories).forEach(([key, val]) => {
      list.push({ key, title: val.title || key });
    });
    // If no categories in config, default to Genel
    if (list.length === 1 && savedComponents.length === 0 && templates.length === 0) {
      list.push({ key: 'Genel', title: 'Genel' });
    }
    return list;
  }, [categories, savedComponents, templates.length]);

  // Which category key each component type belongs to (single pass; when the
  // config declares categories, the last category listing a type wins).
  const categoryKeyByType = useMemo(() => {
    const map: Record<string, string> = {};
    const hasCategories = Object.keys(categories).length > 0;

    for (const [name, compConfig] of Object.entries(components)) {
      map[name] = hasCategories ? 'Genel' : compConfig.category || 'Genel';
    }
    if (hasCategories) {
      for (const [key, val] of Object.entries(categories)) {
        for (const name of val.components || []) {
          if (name in map) map[name] = key;
        }
      }
    }
    return map;
  }, [components, categories]);

  // Group components by category key (plus the synthetic "all" bucket)
  const groupedComponents = useMemo(() => {
    const map: Record<string, string[]> = { all: [] };
    categoryList.forEach(cat => {
      map[cat.key] = [];
    });

    for (const name of Object.keys(components)) {
      const catKey = categoryKeyByType[name];
      (map[catKey] ??= []).push(name);
      map.all.push(name);
    }
    return map;
  }, [components, categoryKeyByType, categoryList]);

  // Filtered items based on active category and search query
  const displayItems = useMemo<DisplayItem[]>(() => {
    const query = searchQuery.toLowerCase();

    if (activeCategory === 'templates') {
      return templates
        .filter((t) => t.label.toLowerCase().includes(query))
        .map((t) => ({
          isSaved: false,
          isTemplate: true,
          id: t.id,
          name: t.label,
          type: 'template',
          props: {},
          template: t,
        }));
    }

    if (activeCategory === 'saved') {
      return savedComponents
        .filter(item => item.name.toLowerCase().includes(query))
        .map(item => ({
          isSaved: true,
          id: item._id,
          name: item.name,
          type: item.type,
          props: item.props
        }));
    }

    const list = groupedComponents[activeCategory] || [];
    return list
      .filter(type => {
        const label = components[type]?.label || type;
        return label.toLowerCase().includes(query);
      })
      .map(type => ({
        isSaved: false,
        id: type,
        name: components[type]?.label || type,
        type: type,
        props: components[type]?.defaultProps || {}
      }));
  }, [groupedComponents, activeCategory, searchQuery, components, savedComponents, templates]);

  if (!isOpen) return null;

  const getCategoryCount = (key: string) => {
    if (key === 'saved') return savedComponents.length;
    if (key === 'templates') return templates.length;
    return groupedComponents[key]?.length || 0;
  };

  const activeCategoryTitle =
    categoryList.find((cat) => cat.key === activeCategory)?.title || 'Tümü';

  // Resolve the category label a component belongs to, so we can pick the right
  // preview mode. Small "element" components get a centered, fit-to-size preview;
  // everything else is treated as a full-width section.
  const categoryTitleForType = (type: string): string => {
    const key = categoryKeyByType[type];
    const category = key ? categories[key] : undefined;
    if (category) return String(category.title || key);
    return String(components[type]?.category || '');
  };
  const isElementType = (type: string) => /element/i.test(categoryTitleForType(type));

  return (
    <div className="tecof-modal-overlay" onClick={onClose}>
      <div
        className="tecof-add-section-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Bölüm Ekle"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="tecof-modal-header">
          <div className="tecof-modal-title-wrap">
            <span className="tecof-modal-title-icon" aria-hidden="true">
              <LayoutGrid size={18} strokeWidth={2} />
            </span>
            <div>
              <h2 className="tecof-modal-title">Bölüm Ekle</h2>
              <span className="tecof-modal-subtitle">
                {activeCategoryTitle} · {displayItems.length} bileşen
              </span>
            </div>
          </div>
          <button type="button" className="tecof-modal-close" onClick={onClose} title="Kapat">
            <X size={18} />
          </button>
        </div>

        {/* Body Container */}
        <div className="tecof-modal-body">
          {/* Sidebar */}
          <div className="tecof-modal-sidebar">
            <div className="tecof-modal-sidebar-title">Kategoriler</div>
            <ul className="tecof-modal-cat-list">
              {categoryList.map(cat => (
                <li key={cat.key}>
                  <button
                    type="button"
                    className={`tecof-modal-cat-btn ${activeCategory === cat.key ? 'is-active' : ''}`}
                    onClick={() => setActiveCategory(cat.key)}
                  >
                    <span>{cat.title}</span>
                    <span className="tecof-modal-cat-count">{getCategoryCount(cat.key)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Grid Content */}
          <div className="tecof-modal-content">
            <div className="tecof-modal-content-head">
              <div className="tecof-modal-search-bar">
                <Search size={16} className="tecof-icon-muted" />
                <input
                  type="text"
                  placeholder="Bileşen ara..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="tecof-modal-search-input"
                  autoFocus
                />
              </div>
              <span className="tecof-modal-result-count">{displayItems.length}</span>
            </div>

            <div className="tecof-modal-grid">
              {displayItems.map(item => {
                // Template cards: insert a whole pre-built subtree on click.
                if (item.isTemplate && item.template) {
                  const t = item.template;
                  return (
                    <GridCard
                      key={item.id}
                      label={t.label}
                      typeText="Şablon"
                      onActivate={() => onSelectTemplate?.(t)}
                      preview={
                        <div className="tecof-modal-preview-wrapper">
                          {t.thumbnail ? (
                            <img src={t.thumbnail} alt={t.label} className="tecof-modal-template-thumb" />
                          ) : (
                            <div className="tecof-modal-template-icon">
                              <LayoutTemplate size={28} strokeWidth={1.6} />
                            </div>
                          )}
                        </div>
                      }
                    />
                  );
                }

                const compConfig: ComponentConfig | undefined = components[item.type];

                // Saved/shared components are full sections; otherwise decide by category.
                const previewMode: PreviewMode =
                  !item.isSaved && isElementType(item.type) ? 'element' : 'section';

                const handleActivate = () => {
                  if (item.isSaved) {
                    // Insert a copy of the saved/shared component: its real
                    // type with the saved props snapshot (fresh id downstream).
                    onSelect(item.type, item.props);
                  } else {
                    onSelect(item.type);
                  }
                };

                return (
                  <GridCard
                    key={item.id}
                    label={item.name}
                    typeText={item.isSaved ? compConfig?.label || item.type : item.type}
                    onActivate={handleActivate}
                    preview={
                      <div className={`tecof-modal-preview-wrapper is-${previewMode}`}>
                        {compConfig?.render ? (
                          <AutoScalePreview mode={previewMode}>
                            <PreviewComponent
                              renderFn={compConfig.render}
                              props={buildPreviewProps(compConfig, item.props)}
                            />
                          </AutoScalePreview>
                        ) : (
                          <div className="tecof-modal-preview-fallback">
                            Önizleme Yok
                          </div>
                        )}
                      </div>
                    }
                  />
                );
              })}
              {displayItems.length === 0 && (
                <div className="tecof-modal-empty">Uyumlu bileşen bulunamadı.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSectionModal;
