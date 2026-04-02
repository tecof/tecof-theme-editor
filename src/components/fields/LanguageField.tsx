import { useCallback, useMemo, useState } from 'react';
import { useLanguages } from './useLanguages';
import { useTecof } from '../TecofProvider';
import type { LanguageFieldValue } from '../../types';
import { Languages, Copy, Loader2 } from 'lucide-react';

/* ─── Shared Styles ─── */

export const fieldStyles = {
  container: {
    width: '100%',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  tabBar: {
    display: 'flex',
    gap: '2px',
    marginBottom: '8px',
    borderRadius: '8px',
    background: '#f4f4f5',
    padding: '3px',
    overflow: 'hidden' as const,
  },
  tab: (isActive: boolean, isDefault: boolean) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: '4px',
    padding: '6px 8px',
    fontSize: '12px',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? '#18181b' : '#71717a',
    background: isActive ? '#ffffff' : 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer' as const,
    transition: 'all 0.15s ease',
    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
    position: 'relative' as const,
    outline: 'none',
  }),
  defaultBadge: {
    fontSize: '8px',
    fontWeight: 700 as const,
    color: '#ffffff',
    background: '#3b82f6',
    borderRadius: '3px',
    padding: '1px 4px',
    lineHeight: '12px',
    letterSpacing: '0.3px',
  },
  inputWrapper: {
    position: 'relative' as const,
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#18181b',
    background: '#ffffff',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e4e4e7',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    boxSizing: 'border-box' as const,
  },
  inputFocused: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59,130,246,0.1)',
  },
  textarea: {
    resize: 'vertical' as const,
    minHeight: '80px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: '12px',
    fontSize: '12px',
    color: '#71717a',
  },
  loadingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#a1a1aa',
    margin: '0 2px',
    display: 'inline-block',
  },
  error: {
    padding: '8px 12px',
    fontSize: '12px',
    color: '#ef4444',
    background: '#fef2f2',
    borderRadius: '6px',
    textAlign: 'center' as const,
  },
  // Action bar
  actionBar: {
    display: 'flex',
    gap: '4px',
    marginTop: '6px',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '4px',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#71717a',
    background: '#f4f4f5',
    border: '1px solid #e4e4e7',
    borderRadius: '6px',
    cursor: 'pointer' as const,
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap' as const,
  },
  actionBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed' as const,
  },
  statusMsg: {
    fontSize: '11px',
    padding: '4px 8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center' as const,
    gap: '4px',
  },
  statusSuccess: {
    color: '#16a34a',
    background: '#f0fdf4',
  },
  statusError: {
    color: '#dc2626',
    background: '#fef2f2',
  },
} as const;

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
    <div style={fieldStyles.tabBar}>
      {languages.map(code => (
        <button
          key={code}
          type="button"
          style={fieldStyles.tab(activeTab === code, code === defaultLanguage)}
          onClick={() => onTabChange(code)}
          title={code.toUpperCase()}
        >
          <span>{code.toUpperCase()}</span>
          {code === defaultLanguage && (
            <span style={fieldStyles.defaultBadge}>DEFAULT</span>
          )}
        </button>
      ))}
    </div>
  );
};

/* ─── Loading Indicator ─── */

export const FieldLoading = () => (
  <div style={fieldStyles.loading}>
    <span style={{ ...fieldStyles.loadingDot, animation: 'tecof-pulse 1.2s ease-in-out infinite' }} />
    <span style={{ ...fieldStyles.loadingDot, animation: 'tecof-pulse 1.2s ease-in-out 0.2s infinite' }} />
    <span style={{ ...fieldStyles.loadingDot, animation: 'tecof-pulse 1.2s ease-in-out 0.4s infinite' }} />
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
  const [focusedInput, setFocusedInput] = useState(false);
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
  if (error && !merchantInfo) return <div style={fieldStyles.error}>{error}</div>;
  if (!merchantInfo) return null;

  const { languages, defaultLanguage } = merchantInfo;
  const hasText = !!getCurrentText();
  const hasMultipleLanguages = languages.length > 1;

  return (
    <div style={fieldStyles.container}>
      <LanguageTabBar
        languages={languages}
        defaultLanguage={defaultLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {languages.map(code => {
        if (activeTab !== code) return null;
        const currentValue = values.find(v => v.code === code)?.value || '';

        const inputStyle = {
          ...fieldStyles.input,
          ...(isTextarea ? fieldStyles.textarea : {}),
          ...(focusedInput ? fieldStyles.inputFocused : {}),
        };

        return (
          <div key={code} style={fieldStyles.inputWrapper}>
            {isTextarea ? (
              <textarea
                value={currentValue}
                onChange={e => handleChange(code, e.target.value)}
                onFocus={() => setFocusedInput(true)}
                onBlur={() => setFocusedInput(false)}
                rows={textareaRows}
                placeholder={placeholder || `${code.toUpperCase()} text...`}
                disabled={readOnly}
                style={inputStyle}
              />
            ) : (
              <input
                type="text"
                value={currentValue}
                onChange={e => handleChange(code, e.target.value)}
                onFocus={() => setFocusedInput(true)}
                onBlur={() => setFocusedInput(false)}
                placeholder={placeholder || `${code.toUpperCase()} text...`}
                disabled={readOnly}
                style={inputStyle}
              />
            )}
          </div>
        );
      })}

      {/* Action Bar: Fast Fill + Translate */}
      {!readOnly && hasMultipleLanguages && (
        <div style={fieldStyles.actionBar}>
          <button
            type="button"
            style={{
              ...fieldStyles.actionBtn,
              ...((!hasText) ? fieldStyles.actionBtnDisabled : {}),
            }}
            onClick={handleFastFill}
            disabled={!hasText}
            title="Aktif sekmedeki metni tüm dillere kopyala"
          >
            <Copy size={12} /> Hızlı Doldur
          </button>
          <button
            type="button"
            style={{
              ...fieldStyles.actionBtn,
              ...((!hasText || translating) ? fieldStyles.actionBtnDisabled : {}),
            }}
            onClick={handleTranslate}
            disabled={!hasText || translating}
            title="Aktif sekmedeki metni diğer dillere çevir"
          >
            {translating ? (
              <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Languages size={12} />
            )}
            {translating ? 'Çevriliyor...' : 'Çevir'}
          </button>

          {statusMsg && (
            <span style={{
              ...fieldStyles.statusMsg,
              ...(statusMsg.type === 'success' ? fieldStyles.statusSuccess : fieldStyles.statusError),
            }}>
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
  options: LanguageFieldOptions & { label?: string } = {}
) => {
  const { label, ...fieldOptions } = options;

  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange, readOnly, field, name, id }: LanguageFieldProps) => (
      <LanguageField
        field={field}
        name={name}
        id={id}
        value={value || []}
        onChange={onChange}
        readOnly={readOnly}
        {...fieldOptions}
      />
    ),
  };
};

export default LanguageField;
