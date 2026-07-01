/**
 * ExternalField — generic, host-provided data picker.
 *
 * Unlike CmsCollectionField (hardwired to the Tecof CMS), this field is fully
 * decoupled: the host supplies an async `fetchList` and optional mappers. The
 * user opens a modal, the rows returned by `fetchList` are listed (searchable),
 * and selecting a row stores `mapProp(row)` (or the raw row) on the prop.
 *
 * Rendered by FieldRenderer for `{ type: 'external' }`.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Database, Search, X, Check, RefreshCcw, ChevronRight } from 'lucide-react';
import { FieldLabel } from './FieldLabel';
import { FieldErrorBoundary } from './FieldErrorBoundary';
import { deepEqual } from '../../utils';

/* ─── Types ─── */

export interface ExternalFieldConfig {
  type?: 'external';
  label?: string;
  /** Loads rows for the picker. Receives the current search query + filters. */
  fetchList: (params: { query?: string; filters?: Record<string, any> }) => Promise<any[]>;
  /** Maps a chosen row to the value stored on the prop (default: the row itself). */
  mapProp?: (row: any) => any;
  /** Maps a row to display columns (default: the row's own enumerable props). */
  mapRow?: (row: any) => Record<string, any>;
  /** Summarizes the STORED value into the trigger/selected label. */
  getItemSummary?: (value: any) => string;
  /** Show the search box (default true). */
  showSearch?: boolean;
  /** Trigger placeholder when nothing is selected. */
  placeholder?: string;
}

export interface ExternalFieldProps {
  field: ExternalFieldConfig;
  name: string;
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
}

/* ─── Helpers ─── */

export const defaultSummary = (value: any): string => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  const v = value as Record<string, any>;
  return String(v.title ?? v.name ?? v.label ?? v.id ?? v._id ?? JSON.stringify(value));
};

export const rowColumns = (field: ExternalFieldConfig, row: any): Record<string, any> => {
  if (field.mapRow) return field.mapRow(row);
  if (row && typeof row === 'object') return row as Record<string, any>;
  return { value: row };
};

/* ─── Modal ─── */

interface PickerModalProps {
  field: ExternalFieldConfig;
  value: any;
  onSelect: (row: any) => void;
  onClose: () => void;
}

const PickerModal = ({ field, value, onSelect, onClose }: PickerModalProps) => {
  const showSearch = field.showSearch !== false;
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  // Drops stale async responses when a newer request has been issued.
  const reqIdRef = useRef(0);

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  // Debounce the search query.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch whenever the debounced query (or manual reload) changes.
  useEffect(() => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    Promise.resolve(field.fetchList({ query: debounced || undefined }))
      .then((list) => {
        if (reqId !== reqIdRef.current) return;
        setRows(Array.isArray(list) ? list : []);
        setLoading(false);
      })
      .catch((e) => {
        if (reqId !== reqIdRef.current) return;
        setError(e?.message || 'Veri yüklenemedi');
        setRows([]);
        setLoading(false);
      });
  }, [field, debounced, reloadKey]);

  const isSelected = useCallback(
    (row: any) => {
      const mapped = field.mapProp ? field.mapProp(row) : row;
      return deepEqual(mapped, value);
    },
    [field, value]
  );

  return createPortal(
    <div className="tecof-cmdk-overlay" onMouseDown={onClose}>
      <div
        className="tecof-cmdk-panel"
        role="dialog"
        aria-label={field.label || 'Veri seç'}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="tecof-cmdk-input-row">
          <Search size={16} className="tecof-cmdk-search-icon" />
          {showSearch ? (
            <input
              ref={inputRef}
              type="text"
              className="tecof-cmdk-input"
              placeholder="Ara…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          ) : (
            <span className="tecof-cmdk-input">{field.label || 'Veri seç'}</span>
          )}
          <button
            type="button"
            className="tecof-external-reload"
            onClick={() => setReloadKey((k) => k + 1)}
            title="Yenile"
            disabled={loading}
          >
            <RefreshCcw size={14} className={loading ? 'tecof-upload-spin' : ''} />
          </button>
          <button type="button" className="tecof-external-reload" onClick={onClose} title="Kapat">
            <X size={14} />
          </button>
        </div>

        <div className="tecof-cmdk-list">
          {loading ? (
            <div className="tecof-cmdk-empty">Yükleniyor…</div>
          ) : error ? (
            <div className="tecof-external-error">
              <p>{error}</p>
              <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
                Tekrar dene
              </button>
            </div>
          ) : rows.length === 0 ? (
            <div className="tecof-cmdk-empty">Sonuç yok</div>
          ) : (
            rows.map((row, idx) => {
              const cols = rowColumns(field, row);
              const entries = Object.entries(cols);
              const [firstKey, firstVal] = entries[0] ?? ['', ''];
              const primary = field.getItemSummary
                ? field.getItemSummary(field.mapProp ? field.mapProp(row) : row)
                : String(firstVal ?? firstKey);
              const rest = entries.slice(1);
              const selected = isSelected(row);
              return (
                <button
                  key={idx}
                  type="button"
                  className={`tecof-cmdk-item${selected ? ' is-active' : ''}`}
                  onClick={() => onSelect(row)}
                >
                  <span className="tecof-cmdk-item-icon">
                    {selected ? <Check size={15} /> : <ChevronRight size={15} />}
                  </span>
                  <span className="tecof-external-row-text">
                    <span className="tecof-cmdk-item-label">{primary}</span>
                    {rest.length > 0 && (
                      <span className="tecof-external-row-sub">
                        {rest.map(([k, v]) => `${k}: ${String(v)}`).join(' · ')}
                      </span>
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ─── Field ─── */

export const ExternalField = ({ field, name, value, onChange, readOnly }: ExternalFieldProps) => {
  const [open, setOpen] = useState(false);
  const summary = useMemo(() => {
    if (value == null) return '';
    return field.getItemSummary ? field.getItemSummary(value) : defaultSummary(value);
  }, [field, value]);

  const handleSelect = (row: any) => {
    onChange(field.mapProp ? field.mapProp(row) : row);
    setOpen(false);
  };

  return (
    <FieldErrorBoundary fieldName={field.label || name}>
      <FieldLabel label={field.label || name} readOnly={readOnly}>
        <div className="tecof-external">
          <button
            type="button"
            className="tecof-external-trigger"
            disabled={readOnly}
            onClick={() => setOpen(true)}
          >
            <Database size={14} className="tecof-icon-muted" />
            <span className={`tecof-external-summary${summary ? '' : ' is-empty'}`}>
              {summary || field.placeholder || 'Veri seç'}
            </span>
          </button>
          {value != null && !readOnly && (
            <button
              type="button"
              className="tecof-external-clear"
              onClick={() => onChange(undefined)}
              title="Temizle"
              aria-label="Seçimi temizle"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </FieldLabel>

      {open && (
        <PickerModal
          field={field}
          value={value}
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      )}
    </FieldErrorBoundary>
  );
};

/**
 * Factory mirroring the other `create*Field` helpers: returns a `{ type:
 * 'external', ... }` FieldConfig the host spreads into a component's `fields`.
 */
export const createExternalField = (options: Omit<ExternalFieldConfig, 'type'>): ExternalFieldConfig => ({
  type: 'external',
  ...options,
});

export default ExternalField;
