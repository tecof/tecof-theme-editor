import { useCallback, useMemo, useState } from 'react';
import { useLanguages } from './useLanguages';
import type { LanguageFieldValue } from '../../types';

/* ─── Language Flag Map (ISO 639-1 → Emoji) ─── */

export const FLAG_MAP: Record<string, string> = {
  tr: '🇹🇷', en: '🇬🇧', de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸',
  it: '🇮🇹', pt: '🇵🇹', nl: '🇳🇱', ru: '🇷🇺', ar: '🇸🇦',
  zh: '🇨🇳', ja: '🇯🇵', ko: '🇰🇷', pl: '🇵🇱', sv: '🇸🇪',
  no: '🇳🇴', da: '🇩🇰', fi: '🇫🇮', el: '🇬🇷', cs: '🇨🇿',
  ro: '🇷🇴', hu: '🇭🇺', bg: '🇧🇬', uk: '🇺🇦', he: '🇮🇱',
  hi: '🇮🇳', th: '🇹🇭', vi: '🇻🇳', id: '🇮🇩', ms: '🇲🇾',
};

export const getFlag = (code: string) => FLAG_MAP[code] || '🌐';

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
    border: '1px solid #e4e4e7',
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
          <span style={{ fontSize: '14px' }}>{getFlag(code)}</span>
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
}

/* ─── Component ─── */

export const LanguageField = ({
  value,
  onChange,
  readOnly,
  isTextarea = false,
  textareaRows = 3,
  placeholder = '',
}: LanguageFieldProps & LanguageFieldOptions) => {
  const { merchantInfo, loading, error, activeTab, setActiveTab } = useLanguages();
  const [focusedInput, setFocusedInput] = useState(false);

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

  if (loading) return <FieldLoading />;
  if (error && !merchantInfo) return <div style={fieldStyles.error}>{error}</div>;
  if (!merchantInfo) return null;

  const { languages, defaultLanguage } = merchantInfo;

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
