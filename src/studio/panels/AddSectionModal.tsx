import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Bookmark, LayoutGrid, LayoutTemplate, Plus, Search, Trash2, X } from 'lucide-react';
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

/** One named design-system preset of a component, shown as a chip on its card. */
interface VariantChoice {
  key: string;
  label: string;
  props: Record<string, unknown>;
}

interface DisplayItem {
  id: string;
  /** Card title. */
  name: string;
  /** Secondary line under the title (component type or "Şablon"). */
  typeText: string;
  /**
   * Preview for a given preset. Receives the chip's props (undefined = the
   * component's own defaults) so hovering a chip re-renders the card preview.
   */
  renderPreview: (props?: Record<string, unknown>) => React.ReactNode;
  /** Insert; `variantKey` set when a chip (not the card) was activated. */
  onActivate: (variantKey?: string) => void;
  /** Presets shown as chips under the title. Empty/absent → no strip. */
  variants?: VariantChoice[];
  /**
   * Chip pre-selected when the search query matched a variant label — the card
   * opens showing what the user actually searched for.
   */
  initialVariantKey?: string | null;
  /**
   * Kalıcı silme (yalnız "Kaydedilenler" kartları). Verildiğinde kartın
   * köşesinde çöp butonu çizilir; onay ve API çağrısı çağıranın işidir.
   */
  onDelete?: () => void;
}

interface DisplayGroup {
  key: string;
  title: string;
  /** Element groups render in a compact grid; section groups in a wide grid. */
  isElement: boolean;
  items: DisplayItem[];
}

type GridCardProps = Omit<DisplayItem, 'id'>;

/**
 * Clickable & keyboard-accessible card shared by all grid items.
 *
 * Bir bileşenin varyantları AYRI KART OLARAK LİSTELENMEZ: tek kartın altında
 * chip şeridi olarak durur. Chip'in üzerine gelmek önizlemeyi o varyanta çevirir,
 * tıklamak o varyantla ekler. Böylece katalog şişmez, kenar çubuğu sayaçları
 * kart sayısıyla tutarlı kalır ve varyant kavramı Inspector'daki chip diliyle
 * aynı görünür (öğrenilen tek bir kalıp).
 */
const GridCard = ({
  name,
  typeText,
  renderPreview,
  onActivate,
  variants,
  initialVariantKey = null,
  onDelete,
}: GridCardProps) => {
  const hasVariants = !!variants?.length;
  /** Kartın "seçili" ön ayarı — null = bileşenin kendi varsayılanı ("Temel"). */
  const [selectedKey, setSelectedKey] = useState<string | null>(initialVariantKey);
  /** Fare bir chip üzerindeyken önizleme geçici olarak onu gösterir. */
  const [hoverKey, setHoverKey] = useState<string | null | undefined>(undefined);

  // Arama sonucu değişince (aynı kart farklı chip'le eşleşebilir) seçimi tazele.
  useEffect(() => setSelectedKey(initialVariantKey), [initialVariantKey]);

  const shownKey = hoverKey !== undefined ? hoverKey : selectedKey;
  const shownVariant = hasVariants ? variants!.find((v) => v.key === shownKey) : undefined;

  return (
    <div
      className="tecof-modal-grid-card"
      role="button"
      tabIndex={0}
      onClick={() => onActivate(selectedKey ?? undefined)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate(selectedKey ?? undefined);
        }
      }}
    >
      <div className="tecof-modal-preview-frame">
        {renderPreview(shownVariant?.props)}
        <span className="tecof-modal-card-add" aria-hidden="true">
          <Plus size={13} strokeWidth={2.4} />
          Ekle
        </span>
        {onDelete && (
          <button
            type="button"
            className="tecof-modal-card-delete"
            title={`"${name}" ortak bileşenini sil`}
            aria-label={`${name} ortak bileşenini sil`}
            onClick={(e) => {
              // Kart tıklaması sayılmasın — silme butonu bileşeni EKLEMEZ.
              e.stopPropagation();
              onDelete();
            }}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Trash2 size={13} strokeWidth={2} />
          </button>
        )}
      </div>
      <div className="tecof-modal-card-footer">
        <span className="tecof-modal-card-label">{name}</span>
        <span className="tecof-modal-card-type">{typeText}</span>

        {hasVariants && (
          <div
            className="tecof-modal-card-variants"
            role="group"
            aria-label={`${name} varyantları`}
            onMouseLeave={() => setHoverKey(undefined)}
          >
            {[{ key: '', label: 'Temel', props: {} }, ...variants!].map((v) => {
              const key = v.key || null;
              const isActive = selectedKey === key;
              return (
                <button
                  key={v.key || '__base'}
                  type="button"
                  className={`tecof-modal-variant-chip${isActive ? ' is-active' : ''}`}
                  title={`${v.label} varyantıyla ekle`}
                  aria-pressed={isActive}
                  onMouseEnter={() => setHoverKey(key)}
                  onFocus={() => setHoverKey(key)}
                  onBlur={() => setHoverKey(undefined)}
                  onClick={(e) => {
                    // Kart da tıklanmış sayılmasın — chip kendi varyantını ekler.
                    e.stopPropagation();
                    setSelectedKey(key);
                    onActivate(key ?? undefined);
                  }}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

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
  /* İstek uçtayken ikinci tıklama işlem başlatmasın (çifte DELETE koruması).
     Ref, handler'ı useCallback ile stabil tutar — state olsaydı displayGroups
     memo'sundaki closure bayatlar ya da memo her silmede boşa patlardı. */
  const deletingRef = useRef(false);

  /* ── Ortak bileşen silme ──
     Backend silmeden önce ref'leri kullanan sayfalara İŞLER: hiçbir sayfadan
     içerik kaybolmaz, yalnız "birinde düzenle → hepsinde güncellensin" bağı
     kalkar. Onay metni tam olarak bunu söyler — korkutmadan, doğru beklentiyle. */
  const handleDeleteSaved = useCallback(async (item: SavedSharedComponent) => {
    if (!apiClient || deletingRef.current) return;
    const ok = window.confirm(
      `"${item.name}" ortak bileşeni silinsin mi?\n\n` +
      `Bu bileşeni kullanan sayfalardaki kopyalar aynen kalır ama bağımsızlaşır — ` +
      `artık birinde yapılan düzenleme diğerlerine yansımaz. Bu işlem geri alınamaz.`
    );
    if (!ok) return;

    deletingRef.current = true;
    try {
      const res = await apiClient.deleteSharedComponent(item._id);
      if (res?.success) {
        setSavedComponents((prev) => prev.filter((s) => s._id !== item._id));
      } else {
        console.error('Ortak bileşen silinemedi:', res?.message);
        window.alert(res?.message || 'Ortak bileşen silinemedi, tekrar deneyin.');
      }
    } catch (err) {
      console.error('Ortak bileşen silinemedi:', err);
      window.alert('Ortak bileşen silinemedi, tekrar deneyin.');
    } finally {
      deletingRef.current = false;
    }
  }, [apiClient]);

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
          renderPreview: () =>
            t.thumbnail ? (
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
          onDelete: () => handleDeleteSaved(item),
          renderPreview: () => (
            <LiveBlockPreview config={config} type={item.type} props={item.props} mode="section" />
          ),
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

        /* Design-system varyantları AYRI KART DEĞİL, kartın chip şeridi olur:
           katalog bileşen sayısı kadar kart gösterir (kenar çubuğu sayaçlarıyla
           tutarlı), varyantlar tek tıkla eklenir ve `_variant` Inspector'daki
           aktif chip'i işaretler. */
        const variants: VariantChoice[] = Object.entries(components[type]?.variants ?? {})
          .filter(([, v]) => !!v?.label)
          .map(([key, v]) => ({ key, label: v.label as string, props: v.props ?? {} }));

        const labelHit = label.toLowerCase().includes(query);
        // Arama varyant adını tutuyorsa kart görünür ve o chip seçili açılır.
        const matchedVariant = query
          ? variants.find((v) => `${label} ${v.label}`.toLowerCase().includes(query))
          : undefined;
        if (!labelHit && !matchedVariant) return [];

        return [{
          id: `component:${type}`,
          name: label,
          typeText: type,
          variants,
          initialVariantKey: labelHit ? null : matchedVariant?.key ?? null,
          onActivate: (variantKey?: string) => {
            const variant = variantKey ? components[type]?.variants?.[variantKey] : undefined;
            if (variant) onSelect(type, { ...variant.props, _variant: variantKey });
            else onSelect(type);
          },
          renderPreview: (props?: Record<string, unknown>) => (
            <LiveBlockPreview
              config={config}
              type={type}
              props={props}
              mode={isElement ? 'element' : 'section'}
            />
          ),
        }];
      });
      if (items.length > 0) {
        groups.push({ key: cat.key, title: cat.title, isElement, items });
      }
    }

    return groups;
  }, [
    activeCategory, searchQuery, templates, visibleSaved,
    componentCategories, typesByCategory, components, config,
    onSelect, onSelectTemplate, handleDeleteSaved,
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
