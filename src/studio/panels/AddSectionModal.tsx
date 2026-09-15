import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Bookmark, ChevronDown, FileStack, LayoutGrid, LayoutTemplate, Plus, Search, Trash2 } from 'lucide-react';
import type { PageTemplate, SectionTemplate, StudioConfig } from '../../types';
import { matchesAllTerms } from '../../utils/search';
import { useStudio } from '../context';
import { StudioDrawer } from '../ui/StudioDrawer';
import { studioDialog } from '../ui/dialogStore';
import { LiveBlockPreview } from './LivePreview';
import { PageTemplateConfirmDrawer } from './PageTemplateConfirmDrawer';
import { PageTemplateMiniPreview } from './PageTemplateMiniPreview';

/**
 * Grup (başlık) accordion durumu — oturumlar arası hatırlanır.
 * Kayıt yok = AÇIK (kullanıcı bir şey kapatmadıkça katalog tam görünür);
 * `true` yazılı olan grup kapalıdır.
 */
const GROUP_COLLAPSE_KEY = 'tecof:add-section:collapsed:v1';

const readCollapsedGroups = (): Record<string, boolean> => {
  try {
    const raw = window.localStorage.getItem(GROUP_COLLAPSE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

/** "Bölüm Ekle" kartı sol paneldeki mini karttan büyük — daha çok bölüm sığar. */
const CARD_PREVIEW_SECTIONS = 4;

/** Stable fallbacks so `config?.x || {}` doesn't produce a new reference per render. */
const NO_TEMPLATES: SectionTemplate[] = [];
const NO_PAGE_TEMPLATES: PageTemplate[] = [];
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
  /** Hazır SAYFA şablonu seçildi — çok bölümlü ekleme (bkz. PageTemplate). */
  onSelectPageTemplate?: (template: PageTemplate) => void;
  config: StudioConfig;
  /**
   * Restricts the listed component types (e.g. only what a target zone's drop
   * rules allow). Applies to components, saved snapshots (by their type) and
   * templates (by their root node type). Undefined = show everything.
   */
  filterType?: (type: string) => boolean;
  /**
   * Hedef KÖK içerik akışı mı (slot değil)? Sayfa şablonları yalnız kökte
   * anlamlıdır. `filterType`'ın varlığına bakmak YANLIŞTI: modal kök akıştan
   * açıldığında da filterType tanımlı gelir (Canvas her hedefte drop kuralı
   * fonksiyonu üretir) — bu yüzden "Sayfa Şablonları" sekmesi HİÇ görünmüyordu.
   */
  isRootTarget?: boolean;
}

export const AddSectionModal = ({ isOpen, onClose, onSelect, onSelectTemplate, onSelectPageTemplate, config, filterType, isRootTarget }: AddSectionModalProps) => {
  const { apiClient } = useStudio();
  const allTemplates = config?.templates ?? NO_TEMPLATES;
  /* Sayfa şablonları YALNIZ kök akışa eklenir (slot hedefliyken tam sayfa
     eklemek anlamsız). Kök olup olmadığını çağıran bildirir — `filterType`
     her hedefte dolu olduğu için ona bakmak sekmeyi tümden gizliyordu. */
  const pageTemplates = isRootTarget
    ? (config?.pageTemplates ?? NO_PAGE_TEMPLATES)
    : NO_PAGE_TEMPLATES;
  const categories = config?.categories ?? NO_CATEGORIES;
  const components = config?.components ?? NO_COMPONENTS;
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedComponents, setSavedComponents] = useState<SavedSharedComponent[]>([]);
  /* Grup başlıkları aç/kapa — kapalı grubun grid'i HİÇ render edilmez
     (canlı önizlemeler boşa çizilmesin). */
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(readCollapsedGroups);
  /* Sayfa şablonu tıklaması önce onay drawer'ını açar; onaydan sonra çağıranın
     kendi ekleme yolu (onSelectPageTemplate) aynen çalışır. */
  const [pendingTemplate, setPendingTemplate] = useState<PageTemplate | null>(null);

  /* DEPOLANAN değeri değil ETKİN durumu yazar. `isCollapsed` arama varken
     zorla `false` türetildiğinden `!prev[key]` yazmak, kullanıcının bilerek
     kapattığı grubu ekranda hiçbir şey değişmeden sessizce açıyordu. */
  const setGroupCollapsed = (key: string, collapsed: boolean) => {
    setCollapsedGroups((prev) => {
      const next = { ...prev, [key]: collapsed };
      try {
        window.localStorage.setItem(GROUP_COLLAPSE_KEY, JSON.stringify(next));
      } catch {
        /* private mode / quota — tercih yalnız bu oturumda kalır */
      }
      return next;
    });
  };
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
    /* Onay beklerken de kilitli: ikinci tıklama ikinci bir onay penceresi
       kuyruğa eklemesin. */
    deletingRef.current = true;
    try {
      const ok = await studioDialog.confirm({
        title: `"${item.name}" ortak bileşeni silinsin mi?`,
        description:
          'Bu bileşeni kullanan sayfalardaki kopyalar aynen kalır ama bağımsızlaşır — ' +
          'artık birinde yapılan düzenleme diğerlerine yansımaz. Bu işlem geri alınamaz.',
        confirmLabel: 'Sil',
        cancelLabel: 'Vazgeç',
        danger: true,
      });
      if (!ok) return;

      const res = await apiClient.deleteSharedComponent(item._id);
      if (res?.success) {
        setSavedComponents((prev) => prev.filter((s) => s._id !== item._id));
      } else {
        console.error('Ortak bileşen silinemedi:', res?.message);
        void studioDialog.alert({
          title: 'Ortak bileşen silinemedi',
          description: res?.message || 'Tekrar deneyin.',
        });
      }
    } catch (err) {
      console.error('Ortak bileşen silinemedi:', err);
      void studioDialog.alert({
        title: 'Ortak bileşen silinemedi',
        description: 'Bağlantıyı kontrol edip tekrar deneyin.',
      });
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

  // Her açılışta arama/kategori sıfırlanır — bileşen unmount olmadığı için
  // önceki oturumun filtresi yaşıyor, yeni açılış "Uyumlu bileşen bulunamadı"
  // ile boş görünebiliyordu.
  useEffect(() => {
    if (!isOpen) return;
    setActiveCategory('all');
    setSearchQuery('');
  }, [isOpen]);

  // Ekleme drawer'ı kapanınca bekleyen onay da düşer (kapalı modalin üstünde
  // yalnız başına duran bir onay drawer'ı kalmasın).
  useEffect(() => {
    if (!isOpen) setPendingTemplate(null);
  }, [isOpen]);

  /* Arama kutusu açılışta odaklanır (vaul odak yönetimi yerine — aksi hâlde
     ilk odaklanabilir olan kenar çubuğu düğmesi seçilirdi). */
  const searchRef = useRef<HTMLInputElement>(null);

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
    /* Türkçe-güvenli arama: düz toLowerCase() "İ/ı"da kırılıyordu ("Iletisim"
       arayan "İletişim"i bulamıyordu) ve aksansız yazımı ("hakkimizda")
       hiç eşleştirmiyordu. matchesAllTerms iki tarafı da katlar ve çok
       kelimeli sorguyu (sıra bağımsız) destekler. */
    const query = searchQuery.trim();
    const showAll = activeCategory === 'all';
    const groups: DisplayGroup[] = [];

    if ((showAll || activeCategory === 'pages') && pageTemplates.length > 0 && onSelectPageTemplate) {
      const items = pageTemplates
        .filter((t) => matchesAllTerms(`${t.label} ${t.description || ''} ${(t.keywords || []).join(' ')}`, query))
        .map<DisplayItem>((t) => ({
          id: `page:${t.id}`,
          name: t.label,
          typeText: `${t.sections.length} bölüm`,
          onActivate: () => setPendingTemplate(t),
          /* Thumbnail yoksa ÇİZGİLİ YER TUTUCU yerine gerçek önizleme: şablonun
             ilk bölümleri kartta canlı çizilir (sol paneldeki mini yığının aynısı,
             `fill` varyantıyla kart çerçevesini doldurur). Eskiden bütün sayfa
             şablonu kartları boş görünüyordu (2026-09-14). */
          renderPreview: () =>
            t.thumbnail ? (
              <img src={t.thumbnail} alt={t.label} className="tecof-modal-template-thumb" />
            ) : t.sections?.length ? (
              <PageTemplateMiniPreview config={config} template={t} fill sectionCount={CARD_PREVIEW_SECTIONS} />
            ) : (
              <div className="tecof-modal-template-icon">
                <FileStack size={28} strokeWidth={1.6} />
              </div>
            ),
        }));
      if (items.length > 0) {
        groups.push({ key: 'pages', title: 'Sayfa Şablonları', isElement: false, items });
      }
    }

    if ((showAll || activeCategory === 'templates') && templates.length > 0) {
      const items = templates
        .filter((t) => matchesAllTerms(t.label, query))
        .map<DisplayItem>((t) => ({
          id: `template:${t.id}`,
          name: t.label,
          typeText: 'Şablon',
          onActivate: () => onSelectTemplate?.(t),
          /* Bölüm şablonu: kökü zaten tek bir bileşen — kayıtlı ortak bileşen
             kartlarıyla AYNI canlı önizleme yolundan geçer. */
          renderPreview: () =>
            t.thumbnail ? (
              <img src={t.thumbnail} alt={t.label} className="tecof-modal-template-thumb" />
            ) : t.payload?.node?.type ? (
              <LiveBlockPreview
                config={config}
                type={t.payload.node.type}
                props={t.payload.node.props as Record<string, unknown> | undefined}
                mode="section"
              />
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
        .filter((item) => matchesAllTerms(item.name, query))
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

        const labelHit = matchesAllTerms(label, query);
        // Arama varyant adını tutuyorsa kart görünür ve o chip seçili açılır.
        const matchedVariant = query
          ? variants.find((v) => matchesAllTerms(`${label} ${v.label}`, query))
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
    activeCategory, searchQuery, templates, pageTemplates, onSelectPageTemplate, visibleSaved,
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
    if (pageTemplates.length > 0 && onSelectPageTemplate) {
      entries.push({ key: 'pages', title: 'Sayfa Şablonları', count: pageTemplates.length });
    }
    if (templates.length > 0) entries.push({ key: 'templates', title: 'Şablonlar', count: templates.length });
    if (visibleSaved.length > 0) {
      entries.push({ key: 'saved', title: 'Kaydedilenler (Ortak)', count: visibleSaved.length });
    }
    for (const cat of componentCategories) {
      entries.push({ key: cat.key, title: cat.title, count: typesByCategory[cat.key]?.length || 0 });
    }
    return entries;
  }, [templates.length, pageTemplates.length, onSelectPageTemplate, visibleSaved.length, componentCategories, typesByCategory]);

  const activeCategoryTitle =
    sidebarEntries.find((entry) => entry.key === activeCategory)?.title || 'Tümü';

  return (
    <>
    {/* Dış kabuk StudioDrawer (xl); iç düzen — kenar çubuğu, arama başlığı,
        grid — ve `tecof-modal-*` sınıfları aynen korunur. ESC / dış tıklama
        StudioDrawer'dan gelir. */}
    <StudioDrawer
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      size="xl"
      tone="primary"
      icon={<LayoutGrid size={22} strokeWidth={2} />}
      title="Bölüm Ekle"
      description={`${activeCategoryTitle} · ${totalVisible} bileşen`}
      className="tecof-add-section-drawer"
      bodyClassName="tecof-add-section-drawer-body"
      /* Onay drawer'ı açıkken katalog kartı tıklama+odak DIŞINDA kalır:
         karartmanın altındaki bir bileşen kartına tıklanıp bileşen ONAYSIZ
         eklenemesin (ve Tab arama kutusuna geri dönemesin). */
      inert={pendingTemplate != null}
      onOpenAutoFocus={(e) => {
        if (!searchRef.current) return;
        e.preventDefault();
        searchRef.current.focus({ preventScroll: true });
      }}
    >
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
                ref={searchRef}
              />
            </div>
            <span className="tecof-modal-result-count">{totalVisible}</span>
          </div>

          <div className="tecof-modal-groups">
            {displayGroups.map((group) => {
              /* Arama yazılıyken her grup AÇIK: eşleşen kart kapalı bir
                 başlığın arkasında saklı kalmasın. O sırada başlık da devre
                 DIŞI: tıklanabilir görünüp hiçbir şey yapmayan (ve kayıtlı
                 tercihi bozan) bir kontrol kalmasın. */
              const searching = !!searchQuery.trim();
              const isCollapsed = !searching && !!collapsedGroups[group.key];
              return (
                <section
                  key={group.key}
                  className={`tecof-modal-group${isCollapsed ? ' is-collapsed' : ''}`}
                >
                  <button
                    type="button"
                    className="tecof-modal-group-head"
                    onClick={() => setGroupCollapsed(group.key, !isCollapsed)}
                    disabled={searching}
                    aria-expanded={!isCollapsed}
                    title={
                      searching
                        ? 'Arama sırasında tüm gruplar açık kalır'
                        : isCollapsed
                          ? 'Grubu genişlet'
                          : 'Grubu daralt'
                    }
                  >
                    {!searching && (
                      <ChevronDown
                        size={13}
                        className="tecof-modal-group-chevron"
                        aria-hidden="true"
                      />
                    )}
                    <span className="tecof-modal-group-title">{group.title}</span>
                    <span className="tecof-modal-group-count">{group.items.length}</span>
                  </button>
                  {!isCollapsed && (
                    <div className={`tecof-modal-grid ${group.isElement ? 'is-elements' : 'is-sections'}`}>
                      {group.items.map(({ id, ...item }) => (
                        <GridCard key={id} {...item} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
            {totalVisible === 0 && (
              <div className="tecof-modal-empty">Uyumlu bileşen bulunamadı.</div>
            )}
          </div>
        </div>
      </div>
      </StudioDrawer>

      {/* Ekleme drawer'ının ÜSTÜNDE bağımsız onay drawer'ı (nested değil).
          DOM sırası YETMEZ: alttaki kart (99999) bu drawer'ın scrim'inden
          (99998) yüksek olduğu için karartma altta kalırdı — `elevated` ile
          overlay+kart bir üst banda (100002/100003) çıkar. */}
      <PageTemplateConfirmDrawer
        elevated
        template={pendingTemplate}
        config={config}
        onConfirm={(tpl) => {
          setPendingTemplate(null);
          onSelectPageTemplate?.(tpl);
        }}
        onClose={() => setPendingTemplate(null)}
        targetLabel={isRootTarget ? 'sayfanın seçilen yerine' : undefined}
      />
    </>
  );
};

export default AddSectionModal;
