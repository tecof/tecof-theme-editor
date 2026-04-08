import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { FieldLabel } from '@puckeditor/core';
import { useTecof } from '../TecofProvider';
import type { LinkFieldValue } from '../../types';

// Vaul and Icons
import { Drawer } from 'vaul';
import {
  Link as LinkIcon,
  ExternalLink,
  Globe,
  FileText,
  X,
  Search,
  ChevronRight,
  Pencil,
} from 'lucide-react';



/* ─── Props ─── */

export interface LinkFieldProps {
  field: any;
  name: string;
  id: string;
  value: LinkFieldValue | null;
  onChange: (value: LinkFieldValue | null) => void;
  readOnly?: boolean;
}

export interface LinkFieldOptions {
  /** Field label displayed in the Puck sidebar */
  label?: string;
  /** Icon displayed next to the label (React element, e.g. Lucide icon) */
  labelIcon?: ReactElement;
  /** Whether this field is visible in the sidebar */
  visible?: boolean;
  /** Show target selector (_self / _blank) */
  showTarget?: boolean;
  /** Placeholder for URL input */
  placeholder?: string;
}

/* ─── Main Component ─── */

export const LinkField = ({
  value,
  onChange,
  readOnly,
  showTarget = true,
  placeholder = 'https://...',
}: LinkFieldProps & LinkFieldOptions) => {
  const { apiClient } = useTecof();

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Manual input state
  const [showManual, setShowManual] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualLabel, setManualLabel] = useState('');
  const [manualTarget, setManualTarget] = useState<'_self' | '_blank'>('_self');

  /* ── Fetch Pages ── */

  useEffect(() => {
    if (!drawerOpen) return;
    setLoading(true);
    apiClient.getPages().then((res) => {
      if (res.success && res.data) {
        setPages(res.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [drawerOpen, apiClient]);

  /* ── Filtered Pages ── */

  const filteredPages = search.trim()
    ? pages.filter(p =>
      p.slug?.toLowerCase().includes(search.toLowerCase()) ||
      p.title?.toLowerCase().includes(search.toLowerCase())
    )
    : pages;

  /* ── Select Page ── */

  const handleSelectPage = useCallback((page: any) => {
    onChange({
      url: `/${page.slug}`,
      label: page.title || page.slug,
      target: '_self',
      type: 'page',
    });
    setDrawerOpen(false);
  }, [onChange]);

  /* ── Confirm Manual ── */

  const handleConfirmManual = useCallback(() => {
    if (!manualUrl.trim()) return;
    onChange({
      url: manualUrl.trim(),
      label: manualLabel.trim() || manualUrl.trim(),
      target: manualTarget,
      type: 'custom',
    });
    setShowManual(false);
    setManualUrl('');
    setManualLabel('');
  }, [manualUrl, manualLabel, manualTarget, onChange]);

  /* ── Clear ── */

  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  /* ── Open Manual with existing value ── */

  const handleEditManual = useCallback(() => {
    if (value) {
      setManualUrl(value.url || '');
      setManualLabel(value.label || '');
      setManualTarget(value.target || '_self');
    }
    setShowManual(true);
  }, [value]);

  const hasValue = value && value.url;

  return (
    <div className="tecof-link-container">

      {/* Current Value Display */}
      {hasValue && (
        <div className="tecof-link-value-box">
          <div className="tecof-link-value-icon">
            {value.type === 'page' ? <FileText size={16} /> : <Globe size={16} />}
          </div>
          <div className="tecof-link-value-info">
            <p className="tecof-link-value-label">{value.label || value.url}</p>
            <p className="tecof-link-value-url">{value.url}</p>
          </div>
          <span className={`tecof-link-value-badge ${value.type === 'page' ? 'tecof-link-badge-page' : 'tecof-link-badge-custom'}`}>
            {value.type === 'page' ? 'Sayfa' : 'Link'}
          </span>
          {value.target === '_blank' && (
            <ExternalLink size={14} color="#a1a1aa" />
          )}
          {!readOnly && (
            <>
              <button type="button" className="tecof-link-action-btn-small" onClick={handleEditManual} title="Düzenle">
                <Pencil size={14} />
              </button>
              <button type="button" className="tecof-link-action-btn-small" onClick={handleClear} title="Kaldır">
                <X size={14} />
              </button>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!readOnly && !hasValue && !showManual && (
        <div className="tecof-link-main-actions">
          <button type="button" className="tecof-link-btn-secondary" onClick={() => setDrawerOpen(true)}>
            <FileText size={16} /> Sayfa Seç
          </button>
          <button type="button" className="tecof-link-btn-secondary" onClick={() => setShowManual(true)}>
            <LinkIcon size={16} /> Manuel Link
          </button>
        </div>
      )}

      {/* Manual URL Input */}
      {!readOnly && showManual && (
        <div className="tecof-link-input-group">
          <p className="tecof-link-input-label">Manuel Link</p>
          <input
            type="text"
            placeholder={placeholder}
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="tecof-link-input"
          />
          <input
            type="text"
            placeholder="Etiket (opsiyonel)"
            value={manualLabel}
            onChange={(e) => setManualLabel(e.target.value)}
            className="tecof-link-input"
          />
          {showTarget && (
            <div className="tecof-link-input-row">
              <select
                value={manualTarget}
                onChange={(e) => setManualTarget(e.target.value as '_self' | '_blank')}
                className="tecof-link-select-small tecof-flex-1"
              >
                <option value="_self">Aynı Sekmede Aç</option>
                <option value="_blank">Yeni Sekmede Aç</option>
              </select>
            </div>
          )}
          <div className="tecof-link-manual-actions">
            <button type="button" className="tecof-link-btn-confirm" onClick={handleConfirmManual}>
              Uygula
            </button>
            <button
              type="button"
              className="tecof-link-btn-secondary tecof-flex-none tecof-pad-8-16"
              onClick={() => setShowManual(false)}
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Page Selector Drawer */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="tecof-link-drawer-overlay" />
          <Drawer.Content className="tecof-link-drawer-content">
            <Drawer.Title className="tecof-sr-only">Bağlantı Sayfası Seçici</Drawer.Title>
            <Drawer.Description className="tecof-sr-only">Sayfa listesinden seçim yapın veya arama yapın</Drawer.Description>
            <div className="tecof-link-drawer-header">
              <h2 className="tecof-link-drawer-title">Sayfa Seç</h2>
              <button className="tecof-link-drawer-close-btn" onClick={() => setDrawerOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="tecof-link-search-box">
              <Search size={16} color="#a1a1aa" />
              <input
                type="text"
                placeholder="Sayfa ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="tecof-link-search-input"
              />
            </div>

            {/* Pages List */}
            {loading ? (
              <div className="tecof-text-center tecof-p-40 tecof-text-muted">
                Yükleniyor...
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="tecof-text-center tecof-p-40 tecof-text-muted">
                {search ? 'Sonuç bulunamadı' : 'Henüz sayfa yok'}
              </div>
            ) : (
              <div className="tecof-link-page-list">
                {filteredPages.map((page) => {
                  const selected = value?.url === `/${page.slug}`;
                  return (
                    <div
                      key={page._id}
                      className={`tecof-link-page-item ${selected ? 'selected' : ''}`}
                      onClick={() => handleSelectPage(page)}
                    >
                      <div className={`tecof-link-status-dot ${page.status || 'draft'}`} title={page.status} />
                      <div className="tecof-flex-1 tecof-min-w-0">
                        <p className="tecof-link-page-slug">/{page.slug}</p>
                        {page.title && (
                          <p className="tecof-link-page-title">{page.title}</p>
                        )}
                      </div>
                      <ChevronRight size={16} color="#d4d4d8" />
                    </div>
                  );
                })}
              </div>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

    </div>
  );
};

LinkField.displayName = 'LinkField';

/* ─── Factory Function (Puck Custom Field) ─── */

export const createLinkField = (options: LinkFieldOptions = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;
  return {
    type: 'custom' as const,
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }: LinkFieldProps) => (
      <FieldLabel label={label || ''} icon={labelIcon} readOnly={readOnly}>
        <LinkField
          field={field}
          name={name}
          id={id}
          value={value || { url: '' }}
          onChange={onChange}
          readOnly={readOnly}
          {...fieldOptions}
        />
      </FieldLabel>
    ),
  };
};

export default LinkField;
