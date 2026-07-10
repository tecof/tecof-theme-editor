/**
 * MediaDrawer — Shared media library drawer for selecting uploaded files.
 *
 * Extracted from UploadField so both UploadField and EditorField can reuse
 * the same gallery UI without code duplication.
 *
 * Usage:
 *   <MediaDrawer
 *     open={drawerOpen}
 *     onOpenChange={setDrawerOpen}
 *     onSelect={(file) => { ... }}
 *     filterImages
 *   />
 */

import { useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from 'react';
import { Drawer } from 'vaul';
import {
  Image as ImageIcon,
  Images,
  RefreshCcw,
  X,
  Search,
  Check,
  FileIcon,
  Loader2,
} from 'lucide-react';
import { useTecof } from '../TecofProvider';
import { TecofPicture } from '../TecofPicture';
import type { UploadedFile } from '../../types';

/* ─── Helpers ─── */

const isImageType = (type: string) =>
  ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif', 'bmp', 'tiff', 'heic', 'image'].some(
    (t) => type?.toLowerCase().includes(t)
  );

/**
 * External stock photos (Freepik vb.) carry `type: 'external'` + a direct
 * `url` instead of an image extension — TecofPicture already resolves them,
 * so they count as images for both the library filter and tile previews.
 */
const isPreviewableImage = (file: UploadedFile) =>
  file.type === 'external' || file.provider === 'external' || isImageType(file.type);

/* ─── Props ─── */

/** An extra tab rendered alongside the built-in "Kütüphane" (library) tab. */
export interface MediaDrawerTab {
  /** Unique tab id (must not be `'library'`). */
  id: string;
  /** Tab button label. */
  label: string;
  /** Optional leading icon element. */
  icon?: ReactNode;
  /** Renders the tab's panel content. */
  render: () => ReactNode;
}

export interface MediaDrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Called when user selects a file */
  onSelect: (file: UploadedFile) => void;
  /** Currently selected file IDs (for showing check badges) */
  selectedIds?: string[];
  /** Allow multiple selection (keeps drawer open after select) */
  allowMultiple?: boolean;
  /** Filter to show only images */
  filterImages?: boolean;
  /** Title for the drawer */
  title?: string;
  /** Extra tabs (e.g. upload / reference) rendered next to the library tab. */
  extraTabs?: MediaDrawerTab[];
  /** Show the built-in "Stok" tab (Pexels/Pixabay search → import to storage). */
  enableStock?: boolean;
}

/* ─── Stock media panel ─── */

interface StockPhoto {
  id: string;
  provider: string;
  thumbUrl: string;
  previewUrl: string;
  downloadUrl: string;
  width: number;
  height: number;
  author: string;
  alt: string;
}

const ORIENTATIONS = [
  { value: 'all', label: 'Tümü' },
  { value: 'landscape', label: 'Yatay' },
  { value: 'portrait', label: 'Dikey' },
  { value: 'square', label: 'Kare' },
];

const StockPanel = ({ onImported }: { onImported: (file: UploadedFile) => void }) => {
  const { apiClient } = useTecof();

  const [query, setQuery] = useState('');
  const [orientation, setOrientation] = useState('all');
  const [provider, setProvider] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<StockPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [noProvider, setNoProvider] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    const res: any = await apiClient.searchStockMedia(q.trim(), { provider, orientation, perPage: 30 });
    setLoading(false);
    if (res?.success) {
      setResults(res.data || []);
      if (res.provider) setProvider(res.provider);
      setNoProvider(res.note === 'no-provider-configured');
    } else {
      setResults([]);
    }
  }, [apiClient, provider, orientation]);

  // Debounced search on query / filter change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 450);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, orientation, provider, runSearch]);

  const handleImport = async (photo: StockPhoto) => {
    if (importingId) return;
    setImportingId(photo.id);
    const res = await apiClient.importStockMedia({ provider: photo.provider, downloadUrl: photo.downloadUrl, id: photo.id, alt: photo.alt });
    setImportingId(null);
    if (res?.success && res.data) {
      onImported(res.data as UploadedFile);
    }
  };

  return (
    <div className="tecof-stock-panel">
      {/* Search + filters */}
      <div className="tecof-stock-controls">
        <div className="tecof-upload-search-box tecof-stock-search">
          <Search size={15} className="tecof-icon-muted" />
          <input
            type="text"
            placeholder="Stok görsel ara… (örn. mimari, doğa)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="tecof-upload-search-input"
            autoFocus
          />
          {query && (
            <button type="button" className="tecof-upload-action-btn" onClick={() => setQuery('')}>
              <X size={13} />
            </button>
          )}
        </div>
        {/* Sağlayıcı seçici bilinçli yok: marka adı (Pexels/Pixabay) kullanıcıya
            gösterilmez, arama backend'in varsayılan sağlayıcısıyla yapılır. */}
        <select className="tecof-stock-select" value={orientation} onChange={(e) => setOrientation(e.target.value)} aria-label="Yön">
          {ORIENTATIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Results */}
      {noProvider ? (
        <div className="tecof-upload-gallery-empty">
          <div className="tecof-upload-gallery-empty-icon"><Images size={24} className="tecof-icon-muted" /></div>
          <p className="tecof-upload-empty-heading">Stok görsel servisi henüz aktif değil</p>
          <p className="tecof-upload-empty-subheading">Bu özellik yakında kullanıma açılacak.</p>
        </div>
      ) : loading ? (
        <div className="tecof-media-skeleton-grid" aria-busy="true">
          {Array.from({ length: 9 }).map((_, i) => (
            <div className="tecof-media-skeleton-card" key={i}>
              <span className="tecof-skeleton tecof-skeleton-block tecof-media-skeleton-thumb" />
            </div>
          ))}
        </div>
      ) : !searched ? (
        <div className="tecof-upload-gallery-empty">
          <div className="tecof-upload-gallery-empty-icon"><Images size={24} className="tecof-icon-muted" /></div>
          <p className="tecof-upload-empty-heading">Milyonlarca ücretsiz görsel</p>
          <p className="tecof-upload-empty-subheading">Aramak için bir şeyler yazın. Seçtiğiniz görsel kütüphanenize yüklenir.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="tecof-upload-gallery-empty">
          <div className="tecof-upload-gallery-empty-icon"><Search size={24} className="tecof-icon-muted" /></div>
          <p className="tecof-upload-empty-heading">Sonuç bulunamadı</p>
          <p className="tecof-upload-empty-subheading">Farklı bir arama terimi deneyin</p>
        </div>
      ) : (
        <div className="tecof-upload-gallery-grid">
          {results.map((photo) => (
            <div
              key={`${photo.provider}-${photo.id}`}
              className="tecof-upload-gallery-item tecof-stock-item"
              onClick={() => handleImport(photo)}
              title={photo.alt}
            >
              <div className="tecof-upload-gallery-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.thumbUrl} alt={photo.alt} loading="lazy" />
                {importingId === photo.id && (
                  <div className="tecof-stock-importing">
                    <Loader2 size={20} className="tecof-upload-spin" />
                  </div>
                )}
              </div>
              <p className="tecof-upload-gallery-file-name">{photo.author || photo.provider}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Component ─── */

export const MediaDrawer = ({
  open,
  onOpenChange,
  onSelect,
  selectedIds = [],
  allowMultiple = false,
  filterImages = false,
  title = 'Medya Kütüphanesi',
  extraTabs = [],
  enableStock = false,
}: MediaDrawerProps) => {
  const { apiClient } = useTecof();

  const [galleryFiles, setGalleryFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [gallerySearch, setGallerySearch] = useState('');
  const [activeTab, setActiveTab] = useState('library');

  /* ── Fetch gallery ── */

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

  /* ── Handle select ── */

  const handleSelect = useCallback((file: UploadedFile) => {
    onSelect(file);
    if (!allowMultiple) {
      onOpenChange(false);
    }
  }, [onSelect, allowMultiple, onOpenChange]);

  /* ── Filtered list ── */

  const filteredGallery = useMemo(() => {
    let files = galleryFiles;

    // Filter images only if requested
    if (filterImages) {
      files = files.filter(isPreviewableImage);
    }

    // Search filter
    if (gallerySearch.trim()) {
      const q = gallerySearch.toLowerCase();
      files = files.filter(f =>
        f.name?.toLowerCase().includes(q) ||
        f.meta?.originalName?.toLowerCase().includes(q)
      );
    }

    return files;
  }, [galleryFiles, filterImages, gallerySearch]);

  return (
    <Drawer.Root open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setGallerySearch(''); setActiveTab('library'); } }}>
      <Drawer.Portal>
        <Drawer.Overlay className="tecof-upload-drawer-overlay" />
        <Drawer.Content className="tecof-upload-drawer-content">
          <Drawer.Title className="tecof-sr-only">{title}</Drawer.Title>
          <Drawer.Description className="tecof-sr-only">Sunucudaki dosyalardan birini seçin</Drawer.Description>

          {/* Drag Handle */}
          <div className="tecof-upload-drawer-handle" />

          <div className="tecof-upload-drawer-inner">
            {/* Header */}
            <div className="tecof-upload-drawer-header">
              <h2 className="tecof-upload-drawer-title">{title}</h2>
              <div className="tecof-upload-drawer-header-actions">
                <button
                  className="tecof-upload-drawer-action-btn"
                  onClick={() => setRefreshKey(k => k + 1)}
                  disabled={loading}
                  title="Yenile"
                >
                  <RefreshCcw size={15} className={loading ? 'tecof-upload-spin' : ''} />
                </button>
                <button
                  className="tecof-upload-drawer-action-btn"
                  onClick={() => onOpenChange(false)}
                  title="Kapat"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Tabs (when extra tabs or stock search are provided) */}
            {(extraTabs.length > 0 || enableStock) && (
              <div className="tecof-media-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'library'}
                  className={`tecof-media-tab${activeTab === 'library' ? ' is-active' : ''}`}
                  onClick={() => setActiveTab('library')}
                >
                  <ImageIcon size={14} /> Kütüphane
                </button>
                {enableStock && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'stock'}
                    className={`tecof-media-tab${activeTab === 'stock' ? ' is-active' : ''}`}
                    onClick={() => setActiveTab('stock')}
                  >
                    <Images size={14} /> Stok
                  </button>
                )}
                {extraTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`tecof-media-tab${activeTab === tab.id ? ' is-active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'stock' ? (
              <div className="tecof-media-tab-panel">
                <StockPanel onImported={handleSelect} />
              </div>
            ) : activeTab !== 'library' ? (
              <div className="tecof-media-tab-panel">
                {extraTabs.find((t) => t.id === activeTab)?.render()}
              </div>
            ) : (
              <>
            {/* Search */}
            <div className="tecof-upload-search-box">
              <Search size={15} className="tecof-icon-muted" />
              <input
                type="text"
                placeholder="Dosya ara..."
                value={gallerySearch}
                onChange={(e) => setGallerySearch(e.target.value)}
                className="tecof-upload-search-input"
              />
              {gallerySearch && (
                <button
                  type="button"
                  className="tecof-upload-action-btn tecof-upload-clear-search-btn"
                  onClick={() => setGallerySearch('')}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Gallery Grid */}
            {loading ? (
              <div className="tecof-media-skeleton-grid" aria-busy="true">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div className="tecof-media-skeleton-card" key={index}>
                    <span className="tecof-skeleton tecof-skeleton-block tecof-media-skeleton-thumb" />
                    <span className="tecof-skeleton tecof-skeleton-text w-80" />
                  </div>
                ))}
              </div>
            ) : filteredGallery.length === 0 ? (
              <div className="tecof-upload-gallery-empty">
                <div className="tecof-upload-gallery-empty-icon">
                  <ImageIcon size={24} className="tecof-icon-muted" />
                </div>
                <p className="tecof-upload-empty-heading">
                  {gallerySearch ? 'Sonuç bulunamadı' : 'Henüz dosya yok'}
                </p>
                <p className="tecof-upload-empty-subheading">
                  {gallerySearch ? 'Farklı bir arama terimi deneyin' : 'Dosyalarınız burada görünecek'}
                </p>
              </div>
            ) : (
              <div className="tecof-upload-gallery-grid">
                {filteredGallery.map((file) => {
                  const selected = selectedIds.includes(file._id ?? '');
                  return (
                    <div
                      key={file._id}
                      className={`tecof-upload-gallery-item ${selected ? 'selected' : ''}`}
                      onClick={() => handleSelect(file)}
                    >
                      {selected && (
                        <div className="tecof-upload-gallery-check">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                      {isPreviewableImage(file) ? (
                        <TecofPicture
                          data={file}
                          alt={file.name}
                          size="thumbnail"
                          className="tecof-upload-gallery-thumb"
                        />
                      ) : (
                        <div className="tecof-upload-gallery-thumb tecof-upload-gallery-file-icon-wrap">
                          <FileIcon size={24} className="tecof-icon-muted" />
                        </div>
                      )}
                      <p className="tecof-upload-gallery-file-name">
                        {file.meta?.originalName || file.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default MediaDrawer;
