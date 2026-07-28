/**
 * LinkPickerDrawer — MediaDrawer görsel dilinde, ortalanmış bağlantı seçici.
 *
 * Tam genişlik alt sheet yerine MediaDrawer'ın `tecof-upload-drawer-*` kalıbını
 * kullanır (ortada, sınırlı genişlik, blur'lu scrim). Sekmeler veri kaynağına
 * göre koşulludur:
 *   · Sayfalar   — her zaman (sistem sayfaları ayrı grup başlığıyla)
 *   · Kategoriler / Markalar / Ürünler — merchant e-ticaretse
 *   · İçerikler  — temada aktif CMS koleksiyonu varsa
 *
 * Seçim MediaDrawer semantiğiyle ANINDA uygulanır ve drawer kapanır.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Drawer } from 'vaul';
import {
  FileText,
  FolderTree,
  Tag,
  ShoppingBag,
  Newspaper,
  RefreshCcw,
  X,
  Search,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useTecof } from '../TecofProvider';
import type { LinkFieldValue, MerchantInfoData } from '../../types';

/* ─── Modül düzeyi veri cache'i (EcommerceField kalıbı) ───
   Drawer her açılışta yeniden istek atmasın; inflight paylaşımı aynı anda
   birden çok LinkField'ın aynı listeyi çekmesini önler. */

const CACHE_TTL = 60_000;
const dataCache = new Map<string, { ts: number; data: any[] }>();
const inflightRequests = new Map<string, Promise<any[]>>();

const loadCached = (key: string, loader: () => Promise<any[]>): Promise<any[]> => {
  const hit = dataCache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return Promise.resolve(hit.data);

  const running = inflightRequests.get(key);
  if (running) return running;

  const request = loader()
    .then((data) => {
      dataCache.set(key, { ts: Date.now(), data });
      inflightRequests.delete(key);
      return data;
    })
    .catch((error) => {
      inflightRequests.delete(key);
      throw error;
    });

  inflightRequests.set(key, request);
  return request;
};

const bustCache = (prefix: string) => {
  for (const key of Array.from(dataCache.keys())) {
    if (key.startsWith(prefix)) dataCache.delete(key);
  }
  /* Uçuştaki eski istekler de düşürülür — yenile, bayat yanıtı "taze" diye
     cache'e geri yazamasın */
  for (const key of Array.from(inflightRequests.keys())) {
    if (key.startsWith(prefix)) inflightRequests.delete(key);
  }
};

/* ─── Yardımcılar ─── */

/* Temalarda konvansiyonel sistem rotaları — sayfalar sekmesinde ayrı grup
   başlığı altında gösterilir (hepsi backend'de normal merchant sayfasıdır). */
const SYSTEM_SLUGS = new Set([
  'home', 'sepet', 'cart', 'hesap', 'account', 'arama', 'search',
  'odeme', 'checkout', 'favoriler', 'favorites',
]);

/* "home" sayfasının gerçek URL'i kök yoldur — /home diye bir rota yayınlanmaz. */
const pageUrl = (slug: string) => (slug === 'home' ? '/' : `/${slug}`);

/* Eski kayıtlar url:'/home' taşıyabilir — seçili satır vurgusu kaybolmasın */
const normalizeUrl = (url?: string) => (url === '/home' ? '/' : url);

/* metaTitle backend'de [{code, value}] dizisidir — aramada tüm dillerdeki
   değerlere bakılır. */
const metaTitleMatches = (metaTitle: any, query: string): boolean => {
  if (!Array.isArray(metaTitle)) return false;
  return metaTitle.some(
    (entry: any) => typeof entry?.value === 'string' && entry.value.toLowerCase().includes(query)
  );
};

const flattenCategories = (nodes: any[], depth = 0, acc: any[] = []): any[] => {
  for (const node of nodes || []) {
    acc.push({ ...node, depth });
    if (Array.isArray(node.children) && node.children.length > 0) {
      flattenCategories(node.children, depth + 1, acc);
    }
  }
  return acc;
};

/* CMS item'ının okunur etiketi: bilinen başlık alanları → ilk dolu string → slug. */
const cmsItemLabel = (item: any): string => {
  const data = item?.data || {};
  for (const key of ['title', 'name', 'heading', 'baslik']) {
    if (typeof data[key] === 'string' && data[key].trim()) return data[key];
  }
  for (const value of Object.values(data)) {
    if (typeof value === 'string' && value.trim()) return value;
  }
  return item?.slug || '';
};

/* ─── Props ─── */

type PickerTab = 'pages' | 'categories' | 'brands' | 'products' | 'cms';

export interface LinkPickerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Seçim anında uygulanır; drawer kapatılır. */
  onSelect: (value: LinkFieldValue) => void;
  /** Aktif dildeki mevcut url — satır vurgusu için. */
  currentUrl?: string;
  /** Aktif dil kodu — e-ticaret/CMS listeleri bu dille çekilir. */
  locale?: string;
  merchantInfo?: MerchantInfoData | null;
}

/* ─── Bileşen ─── */

export const LinkPickerDrawer = ({
  open,
  onOpenChange,
  onSelect,
  currentUrl,
  locale = 'tr',
  merchantInfo,
}: LinkPickerDrawerProps) => {
  const { apiClient, apiUrl, secretKey, themeId } = useTecof();
  /* themeId cache anahtarında: sayfa/CMS listeleri tema kapsamlı — aynı
     apiUrl+secretKey ile farklı tema bağlamları birbirine karışmaz */
  const cachePrefix = `${apiUrl}::${secretKey}::${themeId || 'default'}`;

  const [activeTab, setActiveTab] = useState<PickerTab>('pages');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [pages, setPages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [cmsCollections, setCmsCollections] = useState<any[]>([]);
  const [cmsCollection, setCmsCollection] = useState<any | null>(null);
  const [cmsItems, setCmsItems] = useState<any[]>([]);

  /* productType eski backend'lerde dönmez; şema varsayılanı ecommerce olduğu
     için yoklukta e-ticaret sekmeleri gösterilir. */
  const isEcommerce = merchantInfo?.productType !== 'website';
  const hasCms = cmsCollections.length > 0;

  const searchQuery = search.trim().toLowerCase();
  const productSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Sekme listesi ── */

  const tabs = useMemo(() => {
    const list: Array<{ id: PickerTab; label: string; icon: ReactNode }> = [
      { id: 'pages', label: 'Sayfalar', icon: <FileText size={14} /> },
    ];
    if (isEcommerce) {
      list.push(
        { id: 'categories', label: 'Kategoriler', icon: <FolderTree size={14} /> },
        { id: 'brands', label: 'Markalar', icon: <Tag size={14} /> },
        { id: 'products', label: 'Ürünler', icon: <ShoppingBag size={14} /> }
      );
    }
    if (hasCms) {
      list.push({ id: 'cms', label: 'İçerikler', icon: <Newspaper size={14} /> });
    }
    return list;
  }, [isEcommerce, hasCms]);

  /* ── Veri yükleme ── */

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const finish = (setter: (data: any[]) => void) => (data: any[]) => {
      if (!cancelled) setter(data);
    };

    /* Aktif sekmenin birincil listesi — loading göstergesini yalnız bu yönetir.
       (Ürünler ve CMS item'ları kendi effect'lerinde kendi loading'lerini
       yönetir; arka plan koleksiyon fetch'i göstergeye karışmaz.) */
    const tasks: Array<Promise<any>> = [];

    if (activeTab === 'pages') {
      tasks.push(
        loadCached(`${cachePrefix}::pages`, () =>
          apiClient.getPages().then((res) => (res.success && Array.isArray(res.data) ? res.data : []))
        ).then(finish(setPages))
      );
    }

    if (activeTab === 'categories') {
      tasks.push(
        loadCached(`${cachePrefix}::categories::${locale}`, () =>
          apiClient.getEcommerceCategories(locale).then((res) =>
            res.success && Array.isArray(res.data) ? flattenCategories(res.data) : []
          )
        ).then(finish(setCategories))
      );
    }

    if (activeTab === 'brands') {
      tasks.push(
        loadCached(`${cachePrefix}::brands::${locale}`, () =>
          apiClient.getEcommerceBrands(locale).then((res) => (res.success && Array.isArray(res.data) ? res.data : []))
        ).then(finish(setBrands))
      );
    }

    if (tasks.length > 0) {
      setLoading(true);
      Promise.allSettled(tasks).then(() => {
        if (!cancelled) setLoading(false);
      });
    }

    /* CMS sekme görünürlüğü için koleksiyonlar drawer açılır açılmaz, sessizce
       (loading göstergesine dokunmadan) çekilir. */
    loadCached(`${cachePrefix}::cms-collections`, () =>
      apiClient.getCmsCollections().then((res) => (res.success && Array.isArray(res.data) ? res.data : []))
    ).then(finish(setCmsCollections)).catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [open, activeTab, refreshKey, apiClient, cachePrefix, locale]);

  /* Ürün araması sunucu taraflı + debounce (StockPanel kalıbı).
     cancelled bayrağı: hızlı yazma/sekme değişiminde geç gelen ESKİ yanıt
     yeni listeyi ezemez. */
  useEffect(() => {
    if (!open || activeTab !== 'products') return;
    let cancelled = false;
    if (productSearchRef.current) clearTimeout(productSearchRef.current);

    setLoading(true);
    productSearchRef.current = setTimeout(() => {
      const key = `${cachePrefix}::products::${locale}::${searchQuery}`;
      loadCached(key, () =>
        apiClient
          .getEcommerceProducts({ locale, search: searchQuery || undefined, limit: 30 })
          .then((res) => (res.success && Array.isArray(res.data) ? res.data : []))
      )
        .then((data) => {
          if (!cancelled) setProducts(data);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, searchQuery ? 400 : 0);

    return () => {
      cancelled = true;
      if (productSearchRef.current) clearTimeout(productSearchRef.current);
    };
  }, [open, activeTab, searchQuery, refreshKey, apiClient, cachePrefix, locale]);

  /* CMS koleksiyonu seçilince item'ları çek. */
  useEffect(() => {
    if (!open || activeTab !== 'cms' || !cmsCollection) return;
    let cancelled = false;
    setLoading(true);

    loadCached(`${cachePrefix}::cms-items::${cmsCollection.slug}::${locale}`, () =>
      apiClient
        .getCmsCollectionItems(cmsCollection.slug, { locale, limit: 100 })
        .then((res: any) => (res.success && Array.isArray(res.data) ? res.data : []))
    )
      .then((data) => {
        if (!cancelled) setCmsItems(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, activeTab, cmsCollection, refreshKey, apiClient, cachePrefix, locale]);

  /* ── Kapanış/sekme geçişi state reset'i (MediaDrawer davranışı) ── */

  const handleOpenChange = useCallback(
    (next: boolean) => {
      onOpenChange(next);
      if (!next) {
        setSearch('');
        setActiveTab('pages');
        setCmsCollection(null);
      }
    },
    [onOpenChange]
  );

  const switchTab = (tab: PickerTab) => {
    setActiveTab(tab);
    setSearch('');
    setCmsCollection(null);
  };

  const handleRefresh = () => {
    bustCache(cachePrefix);
    setRefreshKey((k) => k + 1);
  };

  const pick = useCallback(
    (value: LinkFieldValue) => {
      onSelect(value);
      handleOpenChange(false);
    },
    [onSelect, handleOpenChange]
  );

  /* ── Filtreli listeler ── */

  const filteredPages = useMemo(() => {
    if (!searchQuery) return pages;
    return pages.filter(
      (page) =>
        page.slug?.toLowerCase().includes(searchQuery) ||
        page.title?.toLowerCase().includes(searchQuery) ||
        metaTitleMatches(page.metaTitle, searchQuery)
    );
  }, [pages, searchQuery]);

  const groupedPages = useMemo(() => {
    const normal = filteredPages.filter((page) => !SYSTEM_SLUGS.has(page.slug));
    const system = filteredPages.filter((page) => SYSTEM_SLUGS.has(page.slug));
    return { normal, system };
  }, [filteredPages]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    return categories.filter(
      (category) =>
        category.name?.toLowerCase().includes(searchQuery) ||
        category.slug?.toLowerCase().includes(searchQuery)
    );
  }, [categories, searchQuery]);

  const filteredBrands = useMemo(() => {
    if (!searchQuery) return brands;
    return brands.filter(
      (brand) =>
        brand.name?.toLowerCase().includes(searchQuery) ||
        brand.slug?.toLowerCase().includes(searchQuery)
    );
  }, [brands, searchQuery]);

  const filteredCmsCollections = useMemo(() => {
    if (!searchQuery) return cmsCollections;
    return cmsCollections.filter(
      (collection) =>
        collection.name?.toLowerCase().includes(searchQuery) ||
        collection.slug?.toLowerCase().includes(searchQuery)
    );
  }, [cmsCollections, searchQuery]);

  const filteredCmsItems = useMemo(() => {
    if (!searchQuery) return cmsItems;
    return cmsItems.filter(
      (item) =>
        item.slug?.toLowerCase().includes(searchQuery) ||
        cmsItemLabel(item).toLowerCase().includes(searchQuery)
    );
  }, [cmsItems, searchQuery]);

  /* ── Render yardımcıları ── */

  const renderEmpty = (message: string) => (
    <div className="tecof-upload-gallery-empty">
      <div className="tecof-upload-gallery-empty-icon">
        <Search size={24} className="tecof-icon-muted" />
      </div>
      <p className="tecof-upload-empty-heading">{searchQuery ? 'Sonuç bulunamadı' : message}</p>
      {searchQuery && <p className="tecof-upload-empty-subheading">Farklı bir arama terimi deneyin</p>}
    </div>
  );

  const renderSkeleton = () => (
    <div className="tecof-field-loading" aria-busy="true">
      {[0, 1, 2, 3].map((row) => (
        <div className="tecof-field-loading-row" key={row}>
          <span className="tecof-skeleton tecof-skeleton-circle tecof-field-loading-thumb" />
          <div className="tecof-field-loading-lines">
            <span className="tecof-skeleton tecof-skeleton-text w-60" />
            <span className="tecof-skeleton tecof-skeleton-text sm w-80" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderRow = (options: {
    key: string;
    title: string;
    subtitle: string;
    url: string;
    onClick: () => void;
    depth?: number;
    statusDot?: string;
  }) => (
    <div
      key={options.key}
      className={`tecof-link-page-item ${normalizeUrl(currentUrl) === options.url ? 'selected' : ''}`}
      style={options.depth ? { paddingLeft: 12 + options.depth * 16 } : undefined}
      onClick={options.onClick}
    >
      {options.statusDot && (
        <div className={`tecof-link-status-dot ${options.statusDot}`} title={options.statusDot} />
      )}
      <div className="tecof-flex-1 tecof-min-w-0">
        <p className="tecof-link-page-slug">{options.title}</p>
        <p className="tecof-link-page-title">{options.subtitle}</p>
      </div>
      <ChevronRight size={16} className="tecof-icon-faint" />
    </div>
  );

  const renderPageRows = (list: any[]) =>
    list.map((page) =>
      renderRow({
        key: page._id,
        title: page.title || page.slug,
        subtitle: pageUrl(page.slug),
        url: pageUrl(page.slug),
        statusDot: page.status || 'draft',
        onClick: () =>
          pick({
            url: pageUrl(page.slug),
            label: page.title || page.slug,
            target: '_self',
            type: 'page',
          }),
      })
    );

  const searchPlaceholder: Record<PickerTab, string> = {
    pages: 'Sayfa adı, slug veya meta başlık ara…',
    categories: 'Kategori ara…',
    brands: 'Marka ara…',
    products: 'Ürün ara…',
    cms: cmsCollection ? 'İçerik ara…' : 'Koleksiyon ara…',
  };

  return (
    <Drawer.Root open={open} onOpenChange={handleOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="tecof-upload-drawer-overlay" />
        <Drawer.Content className="tecof-upload-drawer-content tecof-link-picker-content">
          <Drawer.Title className="tecof-sr-only">Bağlantı Seç</Drawer.Title>
          <Drawer.Description className="tecof-sr-only">
            Sayfa, kategori, marka, ürün veya içerik bağlantısı seçin
          </Drawer.Description>

          <div className="tecof-upload-drawer-handle" />

          <div className="tecof-upload-drawer-inner">
            {/* Header */}
            <div className="tecof-upload-drawer-header">
              <h2 className="tecof-upload-drawer-title">Bağlantı Seç</h2>
              <div className="tecof-upload-drawer-header-actions">
                <button
                  className="tecof-upload-drawer-action-btn"
                  onClick={handleRefresh}
                  disabled={loading}
                  title="Yenile"
                >
                  <RefreshCcw size={15} className={loading ? 'tecof-upload-spin' : ''} />
                </button>
                <button
                  className="tecof-upload-drawer-action-btn"
                  onClick={() => handleOpenChange(false)}
                  title="Kapat"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            {tabs.length > 1 && (
              <div className="tecof-media-tabs" role="tablist">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`tecof-media-tab${activeTab === tab.id ? ' is-active' : ''}`}
                    onClick={() => switchTab(tab.id)}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* CMS: koleksiyon içindeyken geri yolu */}
            {activeTab === 'cms' && cmsCollection && (
              <button
                type="button"
                className="tecof-link-picker-back"
                onClick={() => {
                  setCmsCollection(null);
                  setSearch('');
                }}
              >
                <ChevronLeft size={14} /> {cmsCollection.name || cmsCollection.slug}
              </button>
            )}

            {/* Search */}
            <div className="tecof-upload-search-box">
              <Search size={15} className="tecof-icon-muted" />
              <input
                type="text"
                placeholder={searchPlaceholder[activeTab]}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="tecof-upload-search-input"
              />
              {search && (
                <button
                  type="button"
                  className="tecof-upload-action-btn tecof-upload-clear-search-btn"
                  onClick={() => setSearch('')}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="tecof-link-picker-body">
              {loading ? (
                renderSkeleton()
              ) : activeTab === 'pages' ? (
                filteredPages.length === 0 ? (
                  renderEmpty('Henüz sayfa yok')
                ) : (
                  <div className="tecof-link-page-list">
                    {groupedPages.normal.length > 0 && groupedPages.system.length > 0 && (
                      <p className="tecof-link-picker-group">Sayfalar</p>
                    )}
                    {renderPageRows(groupedPages.normal)}
                    {groupedPages.system.length > 0 && (
                      <p className="tecof-link-picker-group">Sistem Sayfaları</p>
                    )}
                    {renderPageRows(groupedPages.system)}
                  </div>
                )
              ) : activeTab === 'categories' ? (
                filteredCategories.length === 0 ? (
                  renderEmpty('Henüz kategori yok')
                ) : (
                  <div className="tecof-link-page-list">
                    {filteredCategories.map((category) =>
                      renderRow({
                        key: category._id || category.slug,
                        title: category.name || category.slug,
                        subtitle: `/${category.slug}`,
                        url: `/${category.slug}`,
                        depth: searchQuery ? 0 : category.depth,
                        onClick: () =>
                          pick({
                            url: `/${category.slug}`,
                            label: category.name || category.slug,
                            target: '_self',
                            type: 'category',
                          }),
                      })
                    )}
                  </div>
                )
              ) : activeTab === 'brands' ? (
                filteredBrands.length === 0 ? (
                  renderEmpty('Henüz marka yok')
                ) : (
                  <div className="tecof-link-page-list">
                    {filteredBrands.map((brand) =>
                      renderRow({
                        key: brand._id || brand.slug,
                        title: brand.name || brand.slug,
                        subtitle: `/${brand.slug}`,
                        url: `/${brand.slug}`,
                        onClick: () =>
                          pick({
                            url: `/${brand.slug}`,
                            label: brand.name || brand.slug,
                            target: '_self',
                            type: 'brand',
                          }),
                      })
                    )}
                  </div>
                )
              ) : activeTab === 'products' ? (
                filteredProductsView(products, renderEmpty, renderRow, pick)
              ) : activeTab === 'cms' && !cmsCollection ? (
                filteredCmsCollections.length === 0 ? (
                  renderEmpty('Henüz koleksiyon yok')
                ) : (
                  <div className="tecof-link-page-list">
                    {filteredCmsCollections.map((collection) => (
                      <div
                        key={collection._id || collection.slug}
                        className="tecof-link-page-item"
                        onClick={() => {
                          setCmsCollection(collection);
                          setSearch('');
                        }}
                      >
                        <div className="tecof-flex-1 tecof-min-w-0">
                          <p className="tecof-link-page-slug">{collection.name || collection.slug}</p>
                          <p className="tecof-link-page-title">/{collection.slug}</p>
                        </div>
                        <ChevronRight size={16} className="tecof-icon-faint" />
                      </div>
                    ))}
                  </div>
                )
              ) : (
                filteredCmsItems.length === 0 ? (
                  renderEmpty('Bu koleksiyonda içerik yok')
                ) : (
                  <div className="tecof-link-page-list">
                    {filteredCmsItems.map((item) =>
                      renderRow({
                        key: item._id || item.slug,
                        title: cmsItemLabel(item),
                        subtitle: `/${cmsCollection.slug}/${item.slug}`,
                        url: `/${cmsCollection.slug}/${item.slug}`,
                        onClick: () =>
                          pick({
                            url: `/${cmsCollection.slug}/${item.slug}`,
                            label: cmsItemLabel(item),
                            target: '_self',
                            type: 'cms',
                          }),
                      })
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

/* Ürün listesi — arama sunucu taraflı olduğundan filtre yok, doğrudan liste. */
const filteredProductsView = (
  products: any[],
  renderEmpty: (message: string) => ReactNode,
  renderRow: (options: {
    key: string;
    title: string;
    subtitle: string;
    url: string;
    onClick: () => void;
  }) => ReactNode,
  pick: (value: LinkFieldValue) => void
) => {
  if (products.length === 0) return renderEmpty('Henüz ürün yok');
  return (
    <div className="tecof-link-page-list">
      {products.map((product) =>
        renderRow({
          key: product._id || product.slug,
          title: product.name || product.slug,
          subtitle: `/${product.slug}`,
          url: `/${product.slug}`,
          onClick: () =>
            pick({
              url: `/${product.slug}`,
              label: product.name || product.slug,
              target: '_self',
              type: 'product',
            }),
        })
      )}
    </div>
  );
};

export default LinkPickerDrawer;
