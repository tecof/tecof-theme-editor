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

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Drawer } from 'vaul';
import {
  Image as ImageIcon,
  RefreshCcw,
  X,
  Search,
  Check,
  FileIcon,
} from 'lucide-react';
import { useTecof } from '../TecofProvider';
import { TecofPicture } from '../TecofPicture';
import type { UploadedFile } from '../../types';

/* ─── Helpers ─── */

const isImageType = (type: string) =>
  ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif', 'bmp', 'tiff', 'heic', 'image'].some(
    (t) => type?.toLowerCase().includes(t)
  );

/* ─── Props ─── */

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
}

/* ─── Component ─── */

export const MediaDrawer = ({
  open,
  onOpenChange,
  onSelect,
  selectedIds = [],
  allowMultiple = false,
  filterImages = false,
  title = 'Medya Kütüphanesi',
}: MediaDrawerProps) => {
  const { apiClient } = useTecof();

  const [galleryFiles, setGalleryFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [gallerySearch, setGallerySearch] = useState('');

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
      files = files.filter(f => isImageType(f.type));
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
    <Drawer.Root open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setGallerySearch(''); }}>
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

            {/* Search */}
            <div className="tecof-upload-search-box">
              <Search size={15} color="#a1a1aa" />
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
              <div className="tecof-upload-gallery-empty">
                <div className="tecof-upload-gallery-empty-icon">
                  <RefreshCcw size={24} color="#a1a1aa" className="tecof-upload-spin" />
                </div>
                <p className="tecof-upload-loading-text">Yükleniyor...</p>
              </div>
            ) : filteredGallery.length === 0 ? (
              <div className="tecof-upload-gallery-empty">
                <div className="tecof-upload-gallery-empty-icon">
                  <ImageIcon size={24} color="#a1a1aa" />
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
                      {isImageType(file.type) ? (
                        <TecofPicture
                          data={file}
                          alt={file.name}
                          size="thumbnail"
                          className="tecof-upload-gallery-thumb"
                          imgStyle={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      ) : (
                        <div className="tecof-upload-gallery-thumb tecof-upload-gallery-file-icon-wrap">
                          <FileIcon size={24} color="#a1a1aa" />
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
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default MediaDrawer;
