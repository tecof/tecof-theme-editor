import { useCallback, useEffect, useState } from 'react';
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

/* ─── Styles ─── */

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  // Current value display
  valueBox: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '10px',
    padding: '10px 12px',
    background: '#fafafa',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e4e4e7',
    borderRadius: '10px',
    transition: 'all 0.15s ease',
  },
  valueIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    color: '#3b82f6',
    flexShrink: 0,
  },
  valueInfo: {
    flex: 1,
    minWidth: 0,
  },
  valueLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#18181b',
    margin: 0,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  valueUrl: {
    fontSize: '11px',
    color: '#a1a1aa',
    margin: '2px 0 0',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  valueBadge: {
    fontSize: '10px',
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: '4px',
    lineHeight: '14px',
    flexShrink: 0,
  },
  badgePage: {
    background: '#dbeafe',
    color: '#2563eb',
  },
  badgeCustom: {
    background: '#fef3c7',
    color: '#d97706',
  },
  actionBtnSmall: {
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: '28px',
    height: '28px',
    color: '#a1a1aa',
    background: 'none',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer' as const,
    flexShrink: 0,
  },
  // Action buttons
  mainActions: {
    display: 'flex',
    gap: '8px',
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '6px',
    flex: 1,
    justifyContent: 'center' as const,
    padding: '10px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#3f3f46',
    background: '#f4f4f5',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e4e4e7',
    borderRadius: '8px',
    cursor: 'pointer' as const,
    transition: 'all 0.15s ease',
  },
  // Manual input
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '12px',
    background: '#fafafa',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e4e4e7',
    borderRadius: '10px',
  },
  inputLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#71717a',
    margin: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #e4e4e7',
    borderRadius: '6px',
    outline: 'none',
    background: '#fff',
    color: '#18181b',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
  },
  selectSmall: {
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #e4e4e7',
    borderRadius: '6px',
    outline: 'none',
    background: '#fff',
    color: '#18181b',
    cursor: 'pointer' as const,
  },
  btnConfirm: {
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: '6px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#fff',
    background: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer' as const,
  },
  // Drawer
  drawerOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0, 0, 0, 0.4)',
    zIndex: 9999,
  },
  drawerContent: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '70vh',
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#ffffff',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    zIndex: 10000,
    padding: '16px',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: '12px',
  },
  drawerTitle: {
    fontSize: '16px',
    fontWeight: 600,
    margin: 0,
  },
  drawerCloseBtn: {
    background: '#f4f4f5',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    cursor: 'pointer' as const,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '8px',
    padding: '8px 12px',
    background: '#f4f4f5',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '13px',
    color: '#18181b',
  },
  pageList: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  pageItem: (selected: boolean) => ({
    display: 'flex',
    alignItems: 'center' as const,
    gap: '10px',
    padding: '10px 12px',
    background: selected ? '#eff6ff' : '#fff',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: selected ? '#3b82f6' : '#f4f4f5',
    borderRadius: '8px',
    cursor: 'pointer' as const,
    transition: 'all 0.15s ease',
  }),
  pageSlug: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#18181b',
    margin: 0,
    flex: 1,
  },
  pageTitle: {
    fontSize: '11px',
    color: '#a1a1aa',
    margin: '2px 0 0',
  },
  statusDot: (status: string) => ({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: status === 'published' ? '#22c55e' : status === 'changed' ? '#f59e0b' : '#a1a1aa',
    flexShrink: 0,
  }),
};

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
  label?: string;
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
    <div style={s.container}>

      {/* Current Value Display */}
      {hasValue && (
        <div style={s.valueBox}>
          <div style={s.valueIcon}>
            {value.type === 'page' ? <FileText size={16} /> : <Globe size={16} />}
          </div>
          <div style={s.valueInfo}>
            <p style={s.valueLabel}>{value.label || value.url}</p>
            <p style={s.valueUrl}>{value.url}</p>
          </div>
          <span style={{
            ...s.valueBadge,
            ...(value.type === 'page' ? s.badgePage : s.badgeCustom),
          }}>
            {value.type === 'page' ? 'Sayfa' : 'Link'}
          </span>
          {value.target === '_blank' && (
            <ExternalLink size={14} color="#a1a1aa" />
          )}
          {!readOnly && (
            <>
              <button type="button" style={s.actionBtnSmall} onClick={handleEditManual} title="Düzenle">
                <Pencil size={14} />
              </button>
              <button type="button" style={s.actionBtnSmall} onClick={handleClear} title="Kaldır">
                <X size={14} />
              </button>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!readOnly && !hasValue && !showManual && (
        <div style={s.mainActions}>
          <button type="button" style={s.btnSecondary} onClick={() => setDrawerOpen(true)}>
            <FileText size={16} /> Sayfa Seç
          </button>
          <button type="button" style={s.btnSecondary} onClick={() => setShowManual(true)}>
            <LinkIcon size={16} /> Manuel Link
          </button>
        </div>
      )}

      {/* Manual URL Input */}
      {!readOnly && showManual && (
        <div style={s.inputGroup}>
          <p style={s.inputLabel}>Manuel Link</p>
          <input
            type="text"
            placeholder={placeholder}
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            style={s.input}
          />
          <input
            type="text"
            placeholder="Etiket (opsiyonel)"
            value={manualLabel}
            onChange={(e) => setManualLabel(e.target.value)}
            style={s.input}
          />
          {showTarget && (
            <div style={s.inputRow}>
              <select
                value={manualTarget}
                onChange={(e) => setManualTarget(e.target.value as '_self' | '_blank')}
                style={{ ...s.selectSmall, flex: 1 }}
              >
                <option value="_self">Aynı Sekmede Aç</option>
                <option value="_blank">Yeni Sekmede Aç</option>
              </select>
            </div>
          )}
          <div style={s.inputRow}>
            <button type="button" style={s.btnConfirm} onClick={handleConfirmManual}>
              Uygula
            </button>
            <button
              type="button"
              style={{ ...s.btnSecondary, flex: 'none', padding: '8px 16px' }}
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
          <Drawer.Overlay style={s.drawerOverlay} />
          <Drawer.Content style={s.drawerContent}>
            <div style={s.drawerHeader}>
              <h2 style={s.drawerTitle}>Sayfa Seç</h2>
              <button style={s.drawerCloseBtn} onClick={() => setDrawerOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div style={s.searchBox}>
              <Search size={16} color="#a1a1aa" />
              <input
                type="text"
                placeholder="Sayfa ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={s.searchInput}
              />
            </div>

            {/* Pages List */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#a1a1aa' }}>
                Yükleniyor...
              </div>
            ) : filteredPages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#a1a1aa' }}>
                {search ? 'Sonuç bulunamadı' : 'Henüz sayfa yok'}
              </div>
            ) : (
              <div style={s.pageList}>
                {filteredPages.map((page) => {
                  const selected = value?.url === `/${page.slug}`;
                  return (
                    <div
                      key={page._id}
                      style={s.pageItem(selected)}
                      onClick={() => handleSelectPage(page)}
                    >
                      <div style={s.statusDot(page.status)} title={page.status} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={s.pageSlug}>/{page.slug}</p>
                        {page.title && (
                          <p style={s.pageTitle}>{page.title}</p>
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
  const { label, ...fieldOptions } = options;
  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange, readOnly, field, name, id }: LinkFieldProps) => (
      <LinkField
        field={field}
        name={name}
        id={id}
        value={value || null}
        onChange={onChange}
        readOnly={readOnly}
        {...fieldOptions}
      />
    ),
  };
};

export default LinkField;
