import type { ReactElement } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useLanguages } from './useLanguages';
import { useTecof } from '../TecofProvider';
import type { LanguageFieldValue } from '../../types';
import { Languages, Copy, Loader2 } from 'lucide-react';
import { FieldLabel } from '@puckeditor/core';

/* ─── Shared Tab Bar Component ─── */

export const LanguageTabBar = ({
  languages,
  defaultLanguage,
  activeTab,
  onTabChange,
}: {
  languages: string[];
  defaultLanguage: string;
  activeTab: string;
  onTabChange: (code: string) => void;
}) => {
  if (languages.length <= 1) return null;
  return (
    <div className="tecof-lang-tab-bar">
      {languages.map(code => (
        <button
          key={code}
          type="button"
          className={`tecof-lang-tab ${activeTab === code ? 'active' : ''}`}
          onClick={() => onTabChange(code)}
          title={code.toUpperCase()}
        >
          <span>{code.toUpperCase()}</span>
          {code === defaultLanguage && (
            <span className="tecof-lang-default-badge">DEFAULT</span>
          )}
        </button>
      ))}
    </div>
  );
};

/* ─── Loading Indicator ─── */

export const FieldLoading = () => (
  <div className="tecof-lang-loading">
    <span className="tecof-lang-loading-dot" />
    <span className="tecof-lang-loading-dot" />
    <span className="tecof-lang-loading-dot" />
  </div>
);

/* ─── Props ─── */

export interface LanguageFieldProps {
  field: any;
  name: string;
  id: string;
  value: LanguageFieldValue[];
  onChange: (value: LanguageFieldValue[]) => void;
  readOnly?: boolean;
}

export interface LanguageFieldOptions {
  /** Field label displayed in the Puck sidebar */
  label?: string;
  /** Icon displayed next to the label (React element, e.g. Lucide icon) */
  labelIcon?: ReactElement;
  /** Whether this field is visible in the sidebar */
  visible?: boolean;
  /** Whether to render as textarea instead of input */
  isTextarea?: boolean;
  /** Number of rows for textarea mode */
  textareaRows?: number;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the content is HTML (for translation) */
  isHtml?: boolean;
}

/* ─── Component ─── */

export const LanguageField = ({
  value,
  onChange,
  readOnly,
  isTextarea = false,
  textareaRows = 3,
  placeholder = '',
  isHtml = false,
}: LanguageFieldProps & LanguageFieldOptions) => {
  const { merchantInfo, loading, error, activeTab, setActiveTab } = useLanguages();
  const { apiClient } = useTecof();
  const [translating, setTranslating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Ensure values array has entries for all languages
  const values = useMemo<LanguageFieldValue[]>(() => {
    if (!merchantInfo) return value || [];
    const current = value || [];
    return merchantInfo.languages.map(code => {
      const existing = current.find(v => v.code === code);
      return existing || { code, value: '' };
    });
  }, [value, merchantInfo]);

  // Handle input change
  const handleChange = useCallback((code: string, newVal: string) => {
    const updated = [...values];
    const idx = updated.findIndex(v => v.code === code);
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], value: newVal };
    } else {
      updated.push({ code, value: newVal });
    }
    onChange(updated);
  }, [values, onChange]);

  // Get current active tab's text
  const getCurrentText = useCallback(() => {
    return values.find(v => v.code === activeTab)?.value || '';
  }, [values, activeTab]);

  // ── Fast Fill: copy active text to ALL languages ──
  const handleFastFill = useCallback(() => {
    const text = getCurrentText();
    if (!text) return;

    if (!merchantInfo) return;
    const updated = merchantInfo.languages.map(code => ({
      code,
      value: text,
    }));
    onChange(updated);
    setStatusMsg({ text: 'Tüm dillere kopyalandı', type: 'success' });
    setTimeout(() => setStatusMsg(null), 2000);
  }, [getCurrentText, merchantInfo, onChange]);

  // ── Translate: translate active text to ALL other languages ──
  const handleTranslate = useCallback(async () => {
    const text = getCurrentText();
    if (!text || !merchantInfo) return;

    const otherLocales = merchantInfo.languages.filter(l => l !== activeTab);
    if (otherLocales.length === 0) return;

    setTranslating(true);
    setStatusMsg(null);

    try {
      const res = await apiClient.translate(text, activeTab, otherLocales, isHtml);
      if (res.success && Array.isArray(res.data)) {
        const updated = [...values];
        for (const t of res.data) {
          const idx = updated.findIndex(v => v.code === t.code);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], value: t.value };
          } else {
            updated.push({ code: t.code, value: t.value });
          }
        }
        onChange(updated);
        setStatusMsg({ text: 'Çeviri tamamlandı', type: 'success' });
      } else {
        setStatusMsg({ text: res.message || 'Çeviri hatası', type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Çeviri hatası', type: 'error' });
    } finally {
      setTranslating(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  }, [getCurrentText, merchantInfo, activeTab, values, onChange, apiClient, isHtml]);

  if (loading) return <FieldLoading />;
  if (error && !merchantInfo) return <div className="tecof-lang-error">{error}</div>;
  if (!merchantInfo) return null;

  const { languages, defaultLanguage } = merchantInfo;
  const hasText = !!getCurrentText();
  const hasMultipleLanguages = languages.length > 1;

  return (
    <div className="tecof-lang-container">
      <LanguageTabBar
        languages={languages}
        defaultLanguage={defaultLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {languages.map(code => {
        if (activeTab !== code) return null;
        const currentValue = values.find(v => v.code === code)?.value || '';

        return (
          <div key={code} className="tecof-lang-input-wrapper">
            {isTextarea ? (
              <textarea
                value={currentValue}
                onChange={e => handleChange(code, e.target.value)}
                rows={textareaRows}
                placeholder={placeholder || `${code.toUpperCase()} text...`}
                disabled={readOnly}
                className="tecof-lang-input tecof-lang-textarea"
              />
            ) : (
              <input
                type="text"
                value={currentValue}
                onChange={e => handleChange(code, e.target.value)}
                placeholder={placeholder || `${code.toUpperCase()} text...`}
                disabled={readOnly}
                className="tecof-lang-input"
              />
            )}
          </div>
        );
      })}

      {/* Action Bar: Fast Fill + Translate */}
      {!readOnly && hasMultipleLanguages && (
        <div className="tecof-lang-action-bar">
          <button
            type="button"
            className="tecof-lang-action-btn"
            onClick={handleFastFill}
            disabled={!hasText}
            title="Aktif sekmedeki metni tüm dillere kopyala"
          >
            <Copy size={12} /> Hızlı Doldur
          </button>
          <button
            type="button"
            className="tecof-lang-action-btn"
            onClick={handleTranslate}
            disabled={!hasText || translating}
            title="Aktif sekmedeki metni diğer dillere çevir"
          >
            {translating ? (
              <Loader2 size={12} className="tecof-spin" />
            ) : (
              <Languages size={12} />
            )}
            {translating ? 'Çevriliyor...' : 'Çevir'}
          </button>

          {statusMsg && (
            <span className={`tecof-lang-status-msg ${statusMsg.type === 'success' ? 'success' : 'error'}`}>
              {statusMsg.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Factory Function (Puck Custom Field) ─── */

export const createLanguageField = (
  options: LanguageFieldOptions = {}
) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;

  return {
    type: 'custom' as const,
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }: LanguageFieldProps) => (
      <FieldLabel label={label || ''} icon={labelIcon} readOnly={readOnly}>
        <LanguageField
          field={field}
          name={name}
          id={id}
          value={value || []}
          onChange={onChange}
          readOnly={readOnly}
          {...fieldOptions}
        />
      </FieldLabel>
    ),
  };
};

export default LanguageField;
