import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguages } from './useLanguages';
import { useActiveLanguage } from '../../studio/language/LanguageContext';
import { useTecof } from '../TecofProvider';
import type { LanguageFieldValue } from '../../types';
import { FieldLabel } from './FieldLabel';
import { FieldErrorBoundary } from './FieldErrorBoundary';
import { LanguageToolsBar, useLanguageToolsStatus } from './LanguageToolsBar';
import {
  fillLanguages,
  translateLanguages,
  normalizeLocalizedValues,
  isEmptyText,
  LANGUAGE_TOOL_MESSAGES,
} from './languageTools';

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
  <div className="tecof-field-loading" aria-busy="true">
    <div className="tecof-field-loading-row">
      <span className="tecof-skeleton tecof-skeleton-circle tecof-field-loading-thumb" />
      <div className="tecof-field-loading-lines">
        <span className="tecof-skeleton tecof-skeleton-text w-60" />
        <span className="tecof-skeleton tecof-skeleton-text sm w-80" />
      </div>
    </div>
    <span className="tecof-skeleton tecof-skeleton-block tecof-studio-skeleton-field" />
  </div>
);

/* ─── Stable Input (cursor-safe) ─── */

/**
 * An input that maintains its own local state to prevent cursor jumping.
 * Only syncs from parent when the external value actually differs from
 * what we last sent upstream (i.e. programmatic changes like translate/fast-fill).
 */
const StableInput = ({
  value: externalValue,
  onChange,
  disabled,
  placeholder,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}) => {
  const [localValue, setLocalValue] = useState(externalValue);
  const lastEmitted = useRef(externalValue);

  // Sync from parent only when externally changed (translate, fast-fill, tab switch)
  useEffect(() => {
    if (externalValue !== lastEmitted.current) {
      setLocalValue(externalValue);
      lastEmitted.current = externalValue;
    }
  }, [externalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    lastEmitted.current = val;
    onChange(val);
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
    />
  );
};

const StableTextarea = ({
  value: externalValue,
  onChange,
  disabled,
  placeholder,
  className,
  rows,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  rows?: number;
}) => {
  const [localValue, setLocalValue] = useState(externalValue);
  const lastEmitted = useRef(externalValue);

  useEffect(() => {
    if (externalValue !== lastEmitted.current) {
      setLocalValue(externalValue);
      lastEmitted.current = externalValue;
    }
  }, [externalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    lastEmitted.current = val;
    onChange(val);
  };

  return (
    <textarea
      value={localValue}
      onChange={handleChange}
      rows={rows}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
    />
  );
};

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
  const {
    merchantInfo,
    loading,
    error,
    activeTab: localActiveTab,
    setActiveTab: localSetActiveTab,
  } = useLanguages();
  // When a global language provider is mounted (TecofStudio), the active language
  // is controlled app-wide from the top bar and per-field tabs are hidden.
  const globalLang = useActiveLanguage();
  const activeTab = globalLang ? globalLang.activeLanguage : localActiveTab;
  const setActiveTab = globalLang ? globalLang.setActiveLanguage : localSetActiveTab;
  const { apiClient } = useTecof();
  // Durum mesajı + çeviri bayrağı ortak hook'ta; zamanlayıcı unmount'ta temizlenir.
  const { status, translating, setTranslating, flash } = useLanguageToolsStatus();

  // Ensure values array has entries for all languages
  const values = useMemo<LanguageFieldValue[]>(() => {
    // AI-written data can leave a bare string here — never let .find crash the field
    if (!merchantInfo) return Array.isArray(value) ? value : [];
    return normalizeLocalizedValues<string>(value, merchantInfo.languages, () => '');
  }, [value, merchantInfo]);

  // Keep a ref to current values for callbacks
  const valuesRef = useRef(values);
  valuesRef.current = values;

  // Stable onChange ref — Puck re-creates onChange on every render
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Handle input change — fully stable, no dependencies that change
  const handleChange = useCallback((code: string, newVal: string) => {
    const current = valuesRef.current;
    const updated = [...current];
    const idx = updated.findIndex(v => v.code === code);
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], value: newVal };
    } else {
      updated.push({ code, value: newVal });
    }
    onChangeRef.current(updated);
  }, []);

  // Get current active tab's text
  const getCurrentText = useCallback(() => {
    return valuesRef.current.find(v => v.code === activeTab)?.value || '';
  }, [activeTab]);

  // ── Hızlı Doldur: aktif metni TÜM dillere kopyala (üzerine yazar — parite) ──
  const handleFastFill = useCallback(() => {
    if (!merchantInfo) return;
    const res = fillLanguages(valuesRef.current, merchantInfo.languages, activeTab, {
      isEmpty: isEmptyText,
    });
    if (!res) return; // kaynak boş — düğme zaten pasif
    onChangeRef.current(res.values);
    flash({ text: LANGUAGE_TOOL_MESSAGES.filledAll, type: 'success' }, 2000);
  }, [merchantInfo, activeTab, flash]);

  // ── Çevir: aktif metni diğer dillere çevir ──
  const handleTranslate = useCallback(async () => {
    if (!merchantInfo) return;
    setTranslating(true);
    try {
      // valuesRef getter: cevap gelene kadar yazılan tuşlar merge'de korunur.
      const outcome = await translateLanguages({
        values: () => valuesRef.current,
        languages: merchantInfo.languages,
        sourceCode: activeTab,
        translate: apiClient.translate.bind(apiClient),
        isHtml,
        isEmpty: isEmptyText,
      });
      if (outcome.ok) {
        onChangeRef.current(outcome.values);
        flash({ text: LANGUAGE_TOOL_MESSAGES.translated, type: 'success' }, 3000);
      } else {
        flash({ text: outcome.message, type: 'error' }, 3000);
      }
    } finally {
      setTranslating(false);
    }
  }, [merchantInfo, activeTab, apiClient, isHtml, flash, setTranslating]);

  if (loading) return <FieldLoading />;
  if (error && !merchantInfo) return <div className="tecof-lang-error">{error}</div>;
  if (!merchantInfo) return null;

  const { languages, defaultLanguage } = merchantInfo;
  const hasText = !!getCurrentText();
  const hasMultipleLanguages = languages.length > 1;

  return (
    <div className="tecof-lang-container">
      {!globalLang && (
        <LanguageTabBar
          languages={languages}
          defaultLanguage={defaultLanguage}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {languages.map(code => {
        if (activeTab !== code) return null;
        const currentValue = values.find(v => v.code === code)?.value || '';

        return (
          <div key={code} className="tecof-lang-input-wrapper">
            {isTextarea ? (
              <StableTextarea
                value={currentValue}
                onChange={val => handleChange(code, val)}
                rows={textareaRows}
                placeholder={placeholder || `${code.toUpperCase()} text...`}
                disabled={readOnly}
                className="tecof-lang-input tecof-lang-textarea"
              />
            ) : (
              <StableInput
                value={currentValue}
                onChange={val => handleChange(code, val)}
                placeholder={placeholder || `${code.toUpperCase()} text...`}
                disabled={readOnly}
                className="tecof-lang-input"
              />
            )}
          </div>
        );
      })}

      {/* Araç çubuğu: Hızlı Doldur + Çevir (ortak bileşen) */}
      {!readOnly && hasMultipleLanguages && (
        <LanguageToolsBar
          onFill={handleFastFill}
          fillDisabled={!hasText}
          onTranslate={handleTranslate}
          translateDisabled={!hasText}
          translating={translating}
          status={status}
        />
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
    _fieldType: 'language' as const,
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }: LanguageFieldProps) => (
      <FieldLabel label={label || ''} icon={labelIcon} readOnly={readOnly}>
        <FieldErrorBoundary fieldName={name}>
          <LanguageField
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

export default LanguageField;
