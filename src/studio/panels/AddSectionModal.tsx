import React, { useState, useMemo, useEffect } from 'react';
import { Bookmark, LayoutGrid, LayoutTemplate, Plus, Search, X } from 'lucide-react';
import type { SectionTemplate, StudioConfig } from '../../types';
import { useStudio } from '../context';
import { LiveBlockPreview } from './LivePreview';

/** Stable fallbacks so `config?.x || {}` doesn't produce a new reference per render. */
const NO_TEMPLATES: SectionTemplate[] = [];
const NO_CATEGORIES: NonNullable<StudioConfig['categories']> = {};
const NO_COMPONENTS: StudioConfig['components'] = {};

/** A saved/shared component as returned by the studio API. */
interface SavedSharedComponent {
  _id: string;
  name: string;
  type: string;
  props: Record<string, unknown>;
}

interface DisplayItem {
  id: string;
  /** Card title. */
  name: string;
  /** Secondary line under the title (component type or "Şablon"). */
  typeText: string;
  preview: React.ReactNode;
  onActivate: () => void;
}

interface DisplayGroup {
  key: string;
  title: string;
  /** Element groups render in a compact grid; section groups in a wide grid. */
  isElement: boolean;
  items: DisplayItem[];
}

type GridCardProps = Omit<DisplayItem, 'id'>;

/** Clickable & keyboard-accessible card shared by all grid items. */
const GridCard = ({ name, typeText, preview, onActivate }: GridCardProps) => (
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
    <div className="tecof-modal-preview-frame">
      {preview}
      <span className="tecof-modal-card-add" aria-hidden="true">
        <Plus size={13} strokeWidth={2.4} />
        Ekle
      </span>
    </div>
    <div className="tecof-modal-card-footer">
      <span className="tecof-modal-card-label">{name}</span>
      <span className="tecof-modal-card-type">{typeText}</span>
    </div>
  </div>
);

export interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: string, customProps?: Record<string, unknown>) => void;
  /** Insert a pre-built section template (subtree with fresh ids). */
  onSelectTemplate?: (template: SectionTemplate) => void;
  config: StudioConfig;
  /**
   * Restricts the listed component types (e.g. only what a target zone's drop
   * rules allow). Applies to components, saved snapshots (by their type) and
   * templates (by their root node type). Undefined = show everything.
   */
  filterType?: (type: string) => boolean;
}

export const AddSectionModal = ({ isOpen, onClose, onSelect, onSelectTemplate, config, filterType }: AddSectionModalProps) => {
  const { apiClient } = useStudio();
  const allTemplates = config?.templates ?? NO_TEMPLATES;
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

  // filterType (zone hedefli açılış) uygulanmış görünür kümeler.
  const templates = useMemo(
    () => (filterType ? allTemplates.filter((t) => filterType(t.payload.node.type)) : allTemplates),
    [allTemplates, filterType],
  );
  const visibleSaved = useMemo(
    () => (filterType ? savedComponents.filter((item) => filterType(item.type)) : savedComponents),
    [savedComponents, filterType],
  );

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

  // Ordered component categories (config order, plus a Genel bucket for strays).
  const componentCategories = useMemo(() => {
    const list: { key: string; title: string }[] = [];
    if (Object.keys(categories).length > 0) {
      for (const [key, val] of Object.entries(categories)) {
        list.push({ key, title: String(val.title || key) });
      }
      if (Object.values(categoryKeyByType).includes('Genel') && !categories['Genel']) {
        list.push({ key: 'Genel', title: 'Genel' });
      }
    } else {
      const seen = new Set<string>();
      for (const key of Object.values(categoryKeyByType)) {
        if (!seen.has(key)) {
          seen.add(key);
          list.push({ key, title: key });
        }
      }
    }
    return list;
  }, [categories, categoryKeyByType]);

  // Component types per category key (filterType uygulanmış).
  const typesByCategory = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const name of Object.keys(components)) {
      if (filterType && !filterType(name)) continue;
      (map[categoryKeyByType[name]] ??= []).push(name);
    }
    return map;
  }, [components, categoryKeyByType, filterType]);

  const isElementCategory = (title: string) => /element/i.test(title);

  /**
   * The visible groups: templates + saved + component categories, filtered by
   * the active sidebar selection and the search query. "Tümü" keeps the
   * grouped layout (with headers) instead of one flat mixed grid.
   */
  const displayGroups = useMemo<DisplayGroup[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    const showAll = activeCategory === 'all';
    const groups: DisplayGroup[] = [];

    if ((showAll || activeCategory === 'templates') && templates.length > 0) {
      const items = templates
        .filter((t) => t.label.toLowerCase().includes(query))
        .map<DisplayItem>((t) => ({
          id: `template:${t.id}`,
          name: t.label,
          typeText: 'Şablon',
          onActivate: () => onSelectTemplate?.(t),
          preview: t.thumbnail ? (
            <img src={t.thumbnail} alt={t.label} className="tecof-modal-template-thumb" />
          ) : (
            <div className="tecof-modal-template-icon">
              <LayoutTemplate size={28} strokeWidth={1.6} />
            </div>
          ),
        }));
      if (items.length > 0) {
        groups.push({ key: 'templates', title: 'Şablonlar', isElement: false, items });
      }
    }

    if ((showAll || activeCategory === 'saved') && visibleSaved.length > 0) {
      const items = visibleSaved
        .filter((item) => item.name.toLowerCase().includes(query))
        .map<DisplayItem>((item) => ({
          id: `saved:${item._id}`,
          name: item.name,
          typeText: components[item.type]?.label || item.type,
          // REFERANS olarak ekle: props snapshot'ı + sharedComponentId taşınır.
          // Kayıt anında backend (deresolveSharedComponents) master'a yazar ve
          // düğümü SharedComponentRef'e indirger; diğer sayfalar okuma anında
          // (resolveSharedComponents) master'dan çözer → birinde düzenle,
          // hepsinde güncellenir. Taze node id'si createNode'da EN SON atanır.
          onActivate: () => onSelect(item.type, { ...item.props, sharedComponentId: item._id }),
          preview: <LiveBlockPreview config={config} type={item.type} props={item.props} mode="section" />,
        }));
      if (items.length > 0) {
        groups.push({ key: 'saved', title: 'Kaydedilenler (Ortak)', isElement: false, items });
      }
    }

    for (const cat of componentCategories) {
      if (!showAll && activeCategory !== cat.key) continue;
      const isElement = isElementCategory(cat.title);
      const items = (typesByCategory[cat.key] || []).flatMap<DisplayItem>((type) => {
        const label = components[type]?.label || type;
        const cards: DisplayItem[] = [];
        if (label.toLowerCase().includes(query)) {
          cards.push({
            id: `component:${type}`,
            name: label,
            typeText: type,
            onActivate: () => onSelect(type),
            preview: (
              <LiveBlockPreview config={config} type={type} mode={isElement ? 'element' : 'section'} />
            ),
          });
        }
        // Design-system variants: every named preset is its own card, previewed
        // with ITS props and inserted via the same customProps path saved
        // components use. `_variant` marks the active chip in the Inspector.
        for (const [key, variant] of Object.entries(components[type]?.variants ?? {})) {
          if (!variant?.label || !`${label} ${variant.label}`.toLowerCase().includes(query)) continue;
          cards.push({
            id: `component:${type}:${key}`,
            name: `${label} · ${variant.label}`,
            typeText: type,
            onActivate: () => onSelect(type, { ...variant.props, _variant: key }),
            preview: (
              <LiveBlockPreview
                config={config}
                type={type}
                props={variant.props}
                mode={isElement ? 'element' : 'section'}
              />
            ),
          });
        }
        return cards;
      });
      if (items.length > 0) {
        groups.push({ key: cat.key, title: cat.title, isElement, items });
      }
    }

    return groups;
  }, [
    activeCategory, searchQuery, templates, visibleSaved,
    componentCategories, typesByCategory, components, config,
    onSelect, onSelectTemplate,
  ]);

  const totalVisible = useMemo(
    () => displayGroups.reduce((sum, group) => sum + group.items.length, 0),
    [displayGroups],
  );

  // Sidebar entries with counts (independent of the search filter).
  const sidebarEntries = useMemo(() => {
    const allCount = Object.values(typesByCategory).reduce((sum, arr) => sum + arr.length, 0);
    const entries = [{ key: 'all', title: 'Tümü', count: allCount }];
    if (templates.length > 0) entries.push({ key: 'templates', title: 'Şablonlar', count: templates.length });
    if (visibleSaved.length > 0) {
      entries.push({ key: 'saved', title: 'Kaydedilenler (Ortak)', count: visibleSaved.length });
    }
    for (const cat of componentCategories) {
      entries.push({ key: cat.key, title: cat.title, count: typesByCategory[cat.key]?.length || 0 });
    }
    return entries;
  }, [templates.length, visibleSaved.length, componentCategories, typesByCategory]);

  if (!isOpen) return null;

  const activeCategoryTitle =
    sidebarEntries.find((entry) => entry.key === activeCategory)?.title || 'Tümü';

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
                {activeCategoryTitle} · {totalVisible} bileşen
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
              {sidebarEntries.map(entry => (
                <li key={entry.key}>
                  <button
                    type="button"
                    className={`tecof-modal-cat-btn ${activeCategory === entry.key ? 'is-active' : ''}`}
                    onClick={() => setActiveCategory(entry.key)}
                  >
                    <span className="tecof-modal-cat-btn-title">
                      {entry.key === 'saved' && <Bookmark size={12} aria-hidden="true" />}
                      {entry.key === 'templates' && <LayoutTemplate size={12} aria-hidden="true" />}
                      {entry.title}
                    </span>
                    <span className="tecof-modal-cat-count">{entry.count}</span>
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
              <span className="tecof-modal-result-count">{totalVisible}</span>
            </div>

            <div className="tecof-modal-groups">
              {displayGroups.map((group) => (
                <section key={group.key} className="tecof-modal-group">
                  <div className="tecof-modal-group-head">
                    <span className="tecof-modal-group-title">{group.title}</span>
                    <span className="tecof-modal-group-count">{group.items.length}</span>
                  </div>
                  <div className={`tecof-modal-grid ${group.isElement ? 'is-elements' : 'is-sections'}`}>
                    {group.items.map(({ id, ...item }) => (
                      <GridCard key={id} {...item} />
                    ))}
                  </div>
                </section>
              ))}
              {totalVisible === 0 && (
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
