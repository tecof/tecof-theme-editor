import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, LayoutGrid, LayoutTemplate, Search, X } from 'lucide-react';
import type { SectionTemplate, StudioConfig } from '../../types';
import { useStudio } from '../context';

class PreviewErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
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
  renderFn: (props: any) => React.ReactNode;
  props: any;
}

const PreviewComponent = ({ renderFn, props }: PreviewComponentProps) => {
  return (
    <PreviewErrorBoundary>
      {renderFn(props) as any}
    </PreviewErrorBoundary>
  );
};

interface DisplayItem {
  isSaved: boolean;
  isTemplate?: boolean;
  id: string;
  name: string;
  type: string;
  props: any;
  template?: SectionTemplate;
}

export interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: string, customProps?: any) => void;
  /** Insert a pre-built section template (subtree with fresh ids). */
  onSelectTemplate?: (template: SectionTemplate) => void;
  config: StudioConfig;
}

export const AddSectionModal = ({ isOpen, onClose, onSelect, onSelectTemplate, config }: AddSectionModalProps) => {
  const { apiClient } = useStudio();
  const templates = config?.templates || [];
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedComponents, setSavedComponents] = useState<any[]>([]);

  // Fetch saved global components when the modal opens
  useEffect(() => {
    if (isOpen && apiClient) {
      apiClient.getSharedComponents()
        .then(res => {
          if (res && res.success && Array.isArray(res.data)) {
            setSavedComponents(res.data);
          }
        })
        .catch(err => {
          console.error("Failed to load saved/shared components:", err);
        });
    }
  }, [isOpen, apiClient]);

  const categories = config?.categories || {};
  const components = config?.components || {};

  // All category titles mapping
  const categoryList = useMemo(() => {
    const list = [{ key: 'all', title: 'Tümü' }];
    if (templates.length > 0) {
      list.push({ key: 'templates', title: 'Şablonlar' });
    }
    if (savedComponents.length > 0) {
      list.push({ key: 'saved', title: 'Kaydedilenler (Ortak)' });
    }
    Object.entries(categories).forEach(([key, val]: [string, any]) => {
      list.push({ key, title: val.title || key });
    });
    // If no categories in config, default to Genel
    if (list.length === 1 && savedComponents.length === 0 && templates.length === 0) {
      list.push({ key: 'Genel', title: 'Genel' });
    }
    return list;
  }, [categories, savedComponents, templates.length]);

  // Group components
  const groupedComponents = useMemo(() => {
    const map: Record<string, string[]> = { all: [] };
    
    // Initialize empty arrays
    categoryList.forEach(cat => {
      map[cat.key] = [];
    });

    Object.entries(components).forEach(([name, compConfig]: [string, any]) => {
      // Find category key
      let catKey = 'Genel';
      if (Object.keys(categories).length > 0) {
        Object.entries(categories).forEach(([key, val]: [string, any]) => {
          if (val.components?.includes(name)) {
            catKey = key;
          }
        });
      } else {
        catKey = compConfig.category || 'Genel';
      }

      if (!map[catKey]) {
        map[catKey] = [];
      }
      map[catKey].push(name);
      map.all.push(name);
    });

    return map;
  }, [components, categories, categoryList]);

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

  return (
    <div className="tecof-modal-overlay" onClick={onClose}>
      <div className="tecof-add-section-modal" onClick={e => e.stopPropagation()}>
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
                    <div
                      key={item.id}
                      className="tecof-modal-grid-card"
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectTemplate?.(t)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectTemplate?.(t);
                        }
                      }}
                    >
                      <div className="tecof-modal-preview-wrapper">
                        <span className="tecof-modal-card-chip">Şablon</span>
                        {t.thumbnail ? (
                          <img src={t.thumbnail} alt={t.label} className="tecof-modal-template-thumb" />
                        ) : (
                          <div className="tecof-modal-template-icon">
                            <LayoutTemplate size={28} strokeWidth={1.6} />
                          </div>
                        )}
                      </div>
                      <div className="tecof-modal-card-footer">
                        <div className="tecof-modal-card-text">
                          <span className="tecof-modal-card-label">{t.label}</span>
                          <span className="tecof-modal-card-type">Şablon</span>
                        </div>
                        <ChevronRight size={15} className="tecof-modal-card-arrow" aria-hidden="true" />
                      </div>
                    </div>
                  );
                }

                const compConfig = components[item.type] || {};

                // Create render props
                const renderProps: Record<string, any> = {
                  ...item.props,
                  puck: {
                    renderDropZone: () => (
                      <div className="tecof-modal-dummy-slot">İçerik Alanı</div>
                    ),
                    isEditing: false,
                    metadata: {},
                  },
                  editMode: false,
                };

                // Populate slot fields so that child rendering does not crash due to missing elements
                if (compConfig.fields) {
                  Object.entries(compConfig.fields).forEach(([fieldName, fieldDef]: [string, any]) => {
                    if (fieldDef && fieldDef.type === 'slot') {
                      renderProps[fieldName] = () => (
                        <div className="tecof-modal-dummy-slot">İçerik Alanı</div>
                      );
                    }
                  });
                }

                const handleCardClick = () => {
                  if (item.isSaved) {
                    onSelect('SharedComponentRef', {
                      type: item.type,
                      sharedComponentId: item.id
                    });
                  } else {
                    onSelect(item.type);
                  }
                };

                return (
                  <div
                    key={item.id}
                    className="tecof-modal-grid-card"
                    role="button"
                    tabIndex={0}
                    onClick={handleCardClick}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardClick();
                      }
                    }}
                  >
                    <div className="tecof-modal-preview-wrapper">
                      <span className="tecof-modal-card-chip">
                        {item.isSaved ? 'Ortak' : item.type}
                      </span>
                      <div className="tecof-modal-preview-scale">
                        {compConfig.render ? (
                          <PreviewComponent renderFn={compConfig.render} props={renderProps} />
                        ) : (
                          <div className="tecof-modal-preview-fallback">
                            Önizleme Yok
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="tecof-modal-card-footer">
                      <div className="tecof-modal-card-text">
                        <span className="tecof-modal-card-label">
                          {item.isSaved ? item.name : item.name}
                        </span>
                        <span className="tecof-modal-card-type">
                          {item.isSaved ? compConfig.label || item.type : item.type}
                        </span>
                      </div>
                      <ChevronRight size={15} className="tecof-modal-card-arrow" aria-hidden="true" />
                    </div>
                  </div>
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
