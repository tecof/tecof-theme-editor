import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FieldLabel } from '@puckeditor/core';
import { FieldErrorBoundary } from './FieldErrorBoundary';
import { useTecof } from '../TecofProvider';
import {
  ChevronDown,
  Database,
  Link2,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';

/* ─── Types ─── */

/** Slot definition: describes a data slot the component needs */
export interface CmsSlotDefinition {
  /** Label shown in the editor (e.g. "Başlık") */
  label: string;
  /** Optional: filter to specific CMS field types */
  fieldTypes?: string[];
}

export interface CmsCollectionFieldValue {
  /** Selected collection slug */
  collectionSlug: string;
  /** Collection name (for display) */
  collectionName?: string;
  /** Max items to fetch */
  limit?: number;
  /** Sort order */
  sort?: 'newest' | 'oldest' | 'custom';
  /** Field mapping: slotKey → CMS field shortcode */
  fieldMap?: Record<string, string>;
}

export interface CmsCollectionFieldProps {
  field: any;
  name: string;
  id: string;
  value: CmsCollectionFieldValue | null;
  onChange: (value: CmsCollectionFieldValue | null) => void;
  readOnly?: boolean;
}

export interface CmsCollectionFieldOptions {
  /** Field label displayed in the Puck sidebar */
  label?: string;
  /** Icon displayed next to the label */
  labelIcon?: ReactElement;
  /** Whether this field is visible in the sidebar */
  visible?: boolean;
  /** Default limit for items */
  defaultLimit?: number;
  /** Show limit control */
  showLimit?: boolean;
  /** Show sort control */
  showSort?: boolean;
  /**
   * Mappable slots: defines what data the component needs.
   * Key = slot name used in code, Value = slot definition.
   * Example: { title: { label: "Başlık" }, image: { label: "Görsel" } }
   */
  slots?: Record<string, CmsSlotDefinition>;
}

/* ─── Internal Types ─── */

interface Collection {
  _id: string;
  name: string;
  slug: string;
  fields?: CmsField[];
}

interface CmsField {
  name: string;
  shortcode: string;
  type: string;
}

/* ─── Component ─── */

export const CmsCollectionField = ({
  value,
  onChange,
  readOnly,
  defaultLimit = 10,
  showLimit = true,
  showSort = true,
  slots,
}: CmsCollectionFieldProps & CmsCollectionFieldOptions) => {
  const { apiClient } = useTecof();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  /* ── Fetch Collections ── */
  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getCmsCollections();
      if (res.success && Array.isArray(res.data)) {
        setCollections(res.data);
      } else {
        setError(res.message || 'Koleksiyonlar yüklenemedi');
      }
    } catch (err: any) {
      setError(err.message || 'Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  /* ── Selected collection and its fields ── */
  const selectedCollection = useMemo(() => {
    if (!value?.collectionSlug) return null;
    return collections.find(c => c.slug === value.collectionSlug) || null;
  }, [value?.collectionSlug, collections]);

  const collectionFields = useMemo<CmsField[]>(() => {
    return selectedCollection?.fields || [];
  }, [selectedCollection]);

  /* ── Handlers ── */

  const handleSelect = useCallback((col: Collection) => {
    onChangeRef.current({
      collectionSlug: col.slug,
      collectionName: col.name,
      limit: value?.limit || defaultLimit,
      sort: value?.sort || 'custom',
      fieldMap: value?.fieldMap || {},
    });
    setDropdownOpen(false);
    setSearchQuery('');
  }, [value, defaultLimit]);

  const handleClear = useCallback(() => {
    onChangeRef.current(null);
  }, []);

  const handleLimitChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    if (!value) return;
    onChangeRef.current({
      ...value,
      limit: isNaN(num) ? defaultLimit : Math.max(1, Math.min(100, num)),
    });
  }, [value, defaultLimit]);

  const handleSortChange = useCallback((sort: 'newest' | 'oldest' | 'custom') => {
    if (!value) return;
    onChangeRef.current({ ...value, sort });
  }, [value]);

  const handleFieldMapChange = useCallback((slotKey: string, fieldShortcode: string) => {
    if (!value) return;
    onChangeRef.current({
      ...value,
      fieldMap: {
        ...value.fieldMap,
        [slotKey]: fieldShortcode,
      },
    });
  }, [value]);

  /* ── Filtered Collections ── */
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const q = searchQuery.toLowerCase();
    return collections.filter(c =>
      c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [collections, searchQuery]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="tecof-cms-col-loading">
        <Loader2 size={16} className="tecof-spin" />
        <span>Koleksiyonlar yükleniyor…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tecof-cms-col-error">
        <span>{error}</span>
        <button type="button" className="tecof-cms-col-retry" onClick={fetchCollections}>
          <RefreshCw size={12} /> Tekrar Dene
        </button>
      </div>
    );
  }

  const hasSlots = slots && Object.keys(slots).length > 0;

  return (
    <div className="tecof-cms-col-container">
      {/* Collection Selector */}
      <div className="tecof-cms-col-selector" ref={dropdownRef}>
        <button
          type="button"
          className={`tecof-cms-col-trigger ${dropdownOpen ? 'open' : ''}`}
          onClick={() => !readOnly && setDropdownOpen(!dropdownOpen)}
          disabled={readOnly}
        >
          <div className="tecof-cms-col-trigger-left">
            <Database size={14} />
            <span>
              {value?.collectionName || value?.collectionSlug || 'Koleksiyon Seçin'}
            </span>
          </div>
          <div className="tecof-cms-col-trigger-right">
            {value && !readOnly && (
              <button
                type="button"
                className="tecof-cms-col-clear"
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                title="Temizle"
              >
                <X size={12} />
              </button>
            )}
            <ChevronDown
              size={14}
              className={`tecof-cms-col-chevron ${dropdownOpen ? 'rotated' : ''}`}
            />
          </div>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="tecof-cms-col-dropdown">
            {/* Search */}
            <div className="tecof-cms-col-search">
              <Search size={13} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Koleksiyon ara…"
                className="tecof-cms-col-search-input"
                autoFocus
              />
            </div>

            {/* Options */}
            <div className="tecof-cms-col-options">
              {filteredCollections.length === 0 ? (
                <div className="tecof-cms-col-empty">Koleksiyon bulunamadı</div>
              ) : (
                filteredCollections.map(col => (
                  <button
                    key={col._id}
                    type="button"
                    className={`tecof-cms-col-option ${value?.collectionSlug === col.slug ? 'selected' : ''}`}
                    onClick={() => handleSelect(col)}
                  >
                    <Database size={13} />
                    <div className="tecof-cms-col-option-info">
                      <span className="tecof-cms-col-option-name">{col.name}</span>
                      <span className="tecof-cms-col-option-slug">{col.slug}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Settings (limit + sort) — only when a collection is selected */}
      {value?.collectionSlug && (
        <div className="tecof-cms-col-settings">
          {showLimit && (
            <div className="tecof-cms-col-setting">
              <label className="tecof-cms-col-setting-label">Limit</label>
              <input
                type="number"
                min={1}
                max={100}
                value={value.limit || defaultLimit}
                onChange={handleLimitChange}
                className="tecof-cms-col-setting-input"
                disabled={readOnly}
              />
            </div>
          )}

          {showSort && (
            <div className="tecof-cms-col-setting">
              <label className="tecof-cms-col-setting-label">Sıralama</label>
              <div className="tecof-cms-col-sort-btns">
                <button
                  type="button"
                  className={`tecof-cms-col-sort-btn ${(value.sort || 'custom') === 'custom' ? 'active' : ''}`}
                  onClick={() => handleSortChange('custom')}
                  disabled={readOnly}
                >
                  Özel Sıralama
                </button>
                <button
                  type="button"
                  className={`tecof-cms-col-sort-btn ${value.sort === 'newest' ? 'active' : ''}`}
                  onClick={() => handleSortChange('newest')}
                  disabled={readOnly}
                >
                  Yeni→Eski
                </button>
                <button
                  type="button"
                  className={`tecof-cms-col-sort-btn ${value.sort === 'oldest' ? 'active' : ''}`}
                  onClick={() => handleSortChange('oldest')}
                  disabled={readOnly}
                >
                  Eski→Yeni
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Field Mapping — shown when collection is selected and slots are defined */}
      {value?.collectionSlug && hasSlots && (
        <div className="tecof-cms-col-mapping">
          <div className="tecof-cms-col-mapping-header">
            <Link2 size={12} />
            <span>Alan Eşleştirme</span>
          </div>
          <div className="tecof-cms-col-mapping-rows">
            {Object.entries(slots!).map(([slotKey, slotDef]) => {
              const currentMapping = value.fieldMap?.[slotKey] || '';
              // Filter fields by type if specified
              const availableFields = slotDef.fieldTypes
                ? collectionFields.filter(f => slotDef.fieldTypes!.includes(f.type))
                : collectionFields;

              return (
                <div key={slotKey} className="tecof-cms-col-mapping-row">
                  <label className="tecof-cms-col-mapping-label">{slotDef.label}</label>
                  <select
                    className="tecof-cms-col-mapping-select"
                    value={currentMapping}
                    onChange={(e) => handleFieldMapChange(slotKey, e.target.value)}
                    disabled={readOnly}
                  >
                    <option value="">— Seçin —</option>
                    {availableFields.map(f => (
                      <option key={f.shortcode} value={f.shortcode}>
                        {f.name} ({f.shortcode})
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info badge */}
      {selectedCollection && (
        <div className="tecof-cms-col-badge">
          <Database size={11} />
          <span>{selectedCollection.name}</span>
          {selectedCollection.fields && (
            <span className="tecof-cms-col-badge-count">
              {selectedCollection.fields.length} alan
            </span>
          )}
        </div>
      )}
    </div>
  );
};

CmsCollectionField.displayName = 'CmsCollectionField';

/* ─── Factory Function (Puck Custom Field) ─── */

export const createCmsCollectionField = (options: CmsCollectionFieldOptions = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;

  return {
    type: 'custom' as const,
    _fieldType: 'cmsCollection' as const,
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }: CmsCollectionFieldProps) => (
      <FieldLabel label={label || ''} icon={labelIcon} readOnly={readOnly}>
        <FieldErrorBoundary fieldName={name}>
          <CmsCollectionField
            field={field}
            name={name}
            id={id}
            value={value || null}
            onChange={onChange}
            readOnly={readOnly}
            {...fieldOptions}
          />
        </FieldErrorBoundary>
      </FieldLabel>
    ),
  };
};

export default CmsCollectionField;
