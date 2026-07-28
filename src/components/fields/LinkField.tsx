import type { ReactElement } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FieldLabel } from './FieldLabel';
import { FieldErrorBoundary } from './FieldErrorBoundary';
import type { LinkFieldValue, LocalizedLinkFieldValue } from '../../types';
import { LanguageTabBar, FieldLoading } from './LanguageField';
import { useLanguages } from './useLanguages';
import { useActiveLanguage } from '../../studio/language/LanguageContext';
import { LinkPickerDrawer } from './LinkPickerDrawer';

import {
  Link as LinkIcon,
  ExternalLink,
  Globe,
  FileText,
  FolderTree,
  Tag,
  ShoppingBag,
  Newspaper,
  X,
  Pencil,
} from 'lucide-react';

/* ─── Props ─── */

export interface LinkFieldProps {
  field: any;
  name: string;
  id: string;
  value: LocalizedLinkFieldValue[] | null;
  onChange: (value: LocalizedLinkFieldValue[] | null) => void;
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

/* Rozet metni + ikonu seçim tipine göre. Eski kayıtlarda type olmayabilir —
   'custom' varsayılır. */
const TYPE_META: Record<string, { label: string; badgeClass: string; icon: ReactElement }> = {
  page: { label: 'Sayfa', badgeClass: 'tecof-link-badge-page', icon: <FileText size={16} /> },
  category: { label: 'Kategori', badgeClass: 'tecof-link-badge-entity', icon: <FolderTree size={16} /> },
  brand: { label: 'Marka', badgeClass: 'tecof-link-badge-entity', icon: <Tag size={16} /> },
  product: { label: 'Ürün', badgeClass: 'tecof-link-badge-entity', icon: <ShoppingBag size={16} /> },
  cms: { label: 'İçerik', badgeClass: 'tecof-link-badge-entity', icon: <Newspaper size={16} /> },
  custom: { label: 'Link', badgeClass: 'tecof-link-badge-custom', icon: <Globe size={16} /> },
};

/* ─── Main Component ─── */

export const LinkField = ({
  value,
  onChange,
  readOnly,
  showTarget = true,
  placeholder = 'https://...',
}: LinkFieldProps & LinkFieldOptions) => {
  const {
    merchantInfo,
    loading: langLoading,
    activeTab: localActiveTab,
    setActiveTab: localSetActiveTab,
  } = useLanguages();
  const globalLang = useActiveLanguage();
  const activeTab = globalLang ? globalLang.activeLanguage : localActiveTab;
  const setActiveTab = globalLang ? globalLang.setActiveLanguage : localSetActiveTab;

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Manual input state
  const [showManual, setShowManual] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualLabel, setManualLabel] = useState('');
  const [manualTarget, setManualTarget] = useState<'_self' | '_blank'>('_self');

  /* ── Tab Management ── */

  const values = useMemo<LocalizedLinkFieldValue[]>(() => {
    // AI-written data can leave a bare string here — never let .find crash the field
    const current = Array.isArray(value) ? value : [];
    if (!merchantInfo) return current;
    return merchantInfo.languages.map(code => {
      const existing = current.find(v => v.code === code);
      return existing || { code, value: { url: '' } };
    });
  }, [value, merchantInfo]);

  // Stable refs to prevent cursor jump — Puck re-creates onChange on every render
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const activeValueItem = values.find(v => v.code === activeTab);
  const activeValue = activeValueItem?.value || { url: '' };

  const updateActiveValue = useCallback((newLinkVal: LinkFieldValue | null) => {
    const updated = [...valuesRef.current];
    const idx = updated.findIndex(v => v.code === activeTab);

    if (idx >= 0) {
      if (newLinkVal) {
        updated[idx] = { ...updated[idx], value: newLinkVal };
      } else {
        // Clear
        updated[idx] = { ...updated[idx], value: { url: '' } };
      }
    } else if (newLinkVal) {
      updated.push({ code: activeTab, value: newLinkVal });
    }
    onChangeRef.current(updated);
  }, [activeTab]);

  /* ── Confirm Manual ── */

  const handleConfirmManual = useCallback(() => {
    if (!manualUrl.trim()) return;
    updateActiveValue({
      url: manualUrl.trim(),
      label: manualLabel.trim() || manualUrl.trim(),
      target: manualTarget,
      type: 'custom',
    });
    setShowManual(false);
    setManualUrl('');
    setManualLabel('');
  }, [manualUrl, manualLabel, manualTarget, updateActiveValue]);

  /* ── Clear ── */

  const handleClear = useCallback(() => {
    updateActiveValue(null);
  }, [updateActiveValue]);

  /* ── Open Manual with existing value ── */

  const handleEditManual = useCallback(() => {
    if (activeValue && activeValue.url) {
      setManualUrl(activeValue.url || '');
      setManualLabel(activeValue.label || '');
      setManualTarget(activeValue.target || '_self');
    } else {
      setManualUrl('');
      setManualLabel('');
      setManualTarget('_self');
    }
    setShowManual(true);
  }, [activeValue]);

  const hasValue = activeValue && activeValue.url && activeValue.url !== '';
  const typeMeta = TYPE_META[activeValue.type || 'custom'] || TYPE_META.custom;

  return (
    <div className="tecof-link-container">

      {!globalLang && merchantInfo && merchantInfo.languages.length > 1 && (
        <LanguageTabBar
          languages={merchantInfo.languages}
          defaultLanguage={merchantInfo.defaultLanguage}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {langLoading && <FieldLoading />}

      {/* Current Value Display */}
      {hasValue && (
        <div className="tecof-link-value-box">
          <div className="tecof-link-value-icon">{typeMeta.icon}</div>
          <div className="tecof-link-value-info">
            <p className="tecof-link-value-label">{activeValue.label || activeValue.url}</p>
            <p className="tecof-link-value-url">{activeValue.url}</p>
          </div>
          <span className={`tecof-link-value-badge ${typeMeta.badgeClass}`}>
            {typeMeta.label}
          </span>
          {activeValue.target === '_blank' && (
            <ExternalLink size={14} className="tecof-icon-muted" />
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
            <FileText size={16} /> Bağlantı Seç
          </button>
          <button type="button" className="tecof-link-btn-secondary" onClick={() => setShowManual(true)}>
            <LinkIcon size={16} /> Manuel Link
          </button>
        </div>
      )}

      {/* Değer varken de seçici yeniden açılabilir — küçük değiştirme yolu */}
      {!readOnly && hasValue && !showManual && (
        <button type="button" className="tecof-link-change-btn" onClick={() => setDrawerOpen(true)}>
          Bağlantıyı değiştir…
        </button>
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

      {/* Bağlantı seçici — MediaDrawer diliyle ortalanmış, sekmeli */}
      <LinkPickerDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSelect={updateActiveValue}
        currentUrl={activeValue?.url}
        locale={activeTab || merchantInfo?.defaultLanguage || 'tr'}
        merchantInfo={merchantInfo}
      />

    </div>
  );
};

LinkField.displayName = 'LinkField';

/* ─── Factory Function (Puck Custom Field) ─── */

export const createLinkField = (options: LinkFieldOptions = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;
  return {
    type: 'custom' as const,
    _fieldType: 'link' as const,
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }: LinkFieldProps) => (
      <FieldLabel label={label || ''} icon={labelIcon} readOnly={readOnly}>
        <FieldErrorBoundary fieldName={name}>
          <LinkField
            field={field}
            name={name}
            id={id}
            value={value || []}
            onChange={onChange}
            readOnly={readOnly}
            {...fieldOptions}
          />
        </FieldErrorBoundary>
      </FieldLabel>
    ),
  };
};

export default LinkField;
