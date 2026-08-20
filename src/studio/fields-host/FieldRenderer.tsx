import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUiStore } from '../uiStore';
import { FieldLabel } from '../../components/fields/FieldLabel';
import { FieldErrorBoundary } from '../../components/fields/FieldErrorBoundary';
import { CmsBindingButton } from '../../components/fields/CmsBindingButton';
import { ExternalField, type ExternalFieldConfig } from '../../components/fields/ExternalField';
import type { FieldConfig } from '../../types';

export interface FieldRendererProps {
  name: string;
  definition: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  readOnly?: boolean;
  /**
   * Alanın ait olduğu node (Inspector'dan gelir; kök/alt alan kullanımlarında
   * boş). Canvas'tan gelen `inspectorFocus` isteğinin BU alandaki array
   * satırını otomatik genişletmesi için gerekli — istek {nodeId, field,
   * itemIndex} üçlüsüyle eşleşmeli, yoksa başka node'daki aynı adlı alan açılır.
   */
  nodeId?: string;
}

interface SelectOption {
  value: string;
  label?: string;
}

/** Current string value with the field's declared default as display fallback. */
const stringValue = (value: unknown, definition: FieldConfig): string => {
  if (typeof value === 'string') return value;
  if (typeof definition.defaultValue === 'string') return definition.defaultValue;
  return '';
};

export const FieldRenderer = ({
  name,
  definition,
  value,
  onChange,
  readOnly = false,
  nodeId,
}: FieldRendererProps) => {
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  // Canvas'tan gelen "şu array satırına git" isteği bu alanı hedefliyorsa
  // satırı otomatik genişlet — NodeInspectorBody'nin kaydırma effect'i satırın
  // DOM'a girmesini rAF döngüsüyle bekler.
  const inspectorFocus = useUiStore((s) => s.inspectorFocus);
  useEffect(() => {
    if (!inspectorFocus || !nodeId) return;
    if (inspectorFocus.nodeId !== nodeId || inspectorFocus.field !== name) return;
    const idx = inspectorFocus.itemIndex;
    if (idx == null) return;
    setExpandedIndices((prev) => (prev[idx] ? prev : { ...prev, [idx]: true }));
  }, [inspectorFocus, nodeId, name]);

  const label = definition.label || name;
  const type = definition.type;

  // 1. Custom Render (Custom Fields from create*Field factories). Guarded by an
  // error boundary so one broken custom field can't take down the inspector.
  if (definition.render) {
    return (
      <div className="tecof-field-custom">
        <FieldErrorBoundary fieldName={name}>
          {definition.render({
            field: definition,
            name,
            id: `field-${name}`,
            value,
            onChange,
            readOnly,
          })}
        </FieldErrorBoundary>
      </div>
    );
  }

  // 2. Built-in types (Standard fields)
  switch (type) {
    case 'text': {
      const current = stringValue(value, definition);
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <div className="tecof-field-bindable">
            <input
              id={`field-${name}`}
              type="text"
              value={current}
              disabled={readOnly}
              onChange={(e) => onChange(e.target.value)}
              className="tecof-input-text"
            />
            {!readOnly && definition.bindable !== false && (
              <CmsBindingButton onInsert={(t) => onChange(current ? `${current} ${t}` : t)} />
            )}
          </div>
        </FieldLabel>
      );
    }

    case 'textarea': {
      const current = stringValue(value, definition);
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <div className="tecof-field-bindable is-textarea">
            <textarea
              id={`field-${name}`}
              rows={4}
              value={current}
              disabled={readOnly}
              onChange={(e) => onChange(e.target.value)}
              className="tecof-input-textarea"
            />
            {!readOnly && definition.bindable !== false && (
              <CmsBindingButton onInsert={(t) => onChange(current ? `${current} ${t}` : t)} />
            )}
          </div>
        </FieldLabel>
      );
    }

    case 'select': {
      const options: SelectOption[] = Array.isArray(definition.options) ? definition.options : [];
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <div className="tecof-field-select-wrap">
            <select
              id={`field-${name}`}
              value={stringValue(value, definition)}
              disabled={readOnly}
              onChange={(e) => onChange(e.target.value)}
              className="tecof-input-select"
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label || opt.value}
                </option>
              ))}
            </select>
            <div className="tecof-field-select-caret">
              <ChevronDown size={12} />
            </div>
          </div>
        </FieldLabel>
      );
    }

    case 'number': {
      const current =
        typeof value === 'number'
          ? value
          : typeof definition.defaultValue === 'number'
            ? definition.defaultValue
            : undefined;
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <input
            id={`field-${name}`}
            type="number"
            value={current !== undefined ? current : ''}
            min={definition.min}
            max={definition.max}
            step={definition.step}
            disabled={readOnly}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                onChange(undefined);
                return;
              }
              const num = Number(val);
              if (!Number.isNaN(num)) onChange(num);
            }}
            className="tecof-input-number"
          />
        </FieldLabel>
      );
    }

    case 'boolean':
    case 'toggle': {
      const checked = value === true || value === 'true';
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <button
            id={`field-${name}`}
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={readOnly}
            className={`tecof-field-switch${checked ? ' is-on' : ''}${readOnly ? ' is-readonly' : ''}`}
            onClick={() => onChange(!checked)}
          >
            <span className="tecof-field-switch-track">
              <span className="tecof-field-switch-thumb" />
            </span>
            <span className="tecof-field-switch-text">
              {checked ? definition.onLabel || 'Açık' : definition.offLabel || 'Kapalı'}
            </span>
          </button>
        </FieldLabel>
      );
    }

    case 'range': {
      const min = typeof definition.min === 'number' ? definition.min : 0;
      const max = typeof definition.max === 'number' ? definition.max : 100;
      const step = typeof definition.step === 'number' ? definition.step : 1;
      const current = typeof value === 'number'
        ? value
        : (typeof definition.defaultValue === 'number' ? definition.defaultValue : min);
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <div className="tecof-field-range">
            <input
              id={`field-${name}`}
              type="range"
              min={min}
              max={max}
              step={step}
              value={current}
              disabled={readOnly}
              onChange={(e) => onChange(Number(e.target.value))}
              className="tecof-input-range"
            />
            <output className="tecof-field-range-value">
              {current}{definition.unit || ''}
            </output>
          </div>
        </FieldLabel>
      );
    }

    case 'radio': {
      const options: SelectOption[] = Array.isArray(definition.options) ? definition.options : [];
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <div className="tecof-field-radio-group">
            {options.map((opt) => (
              <label
                key={opt.value}
                className={`tecof-field-radio${readOnly ? ' is-readonly' : ''}`}
              >
                <input
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={value === opt.value}
                  disabled={readOnly}
                  onChange={() => onChange(opt.value)}
                />
                <span>{opt.label || opt.value}</span>
              </label>
            ))}
          </div>
        </FieldLabel>
      );
    }

    case 'array': {
      const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
      const arrayFields = definition.arrayFields || {};

      const getItemLabel = (item: Record<string, unknown> | null | undefined, idx: number) => {
        if (!item) return `Öğe ${idx + 1}`;
        for (const val of Object.values(item)) {
          if (typeof val === 'string' && val.trim().length > 0) {
            return val;
          }
          if (Array.isArray(val)) {
            const trVal = val.find(
              (v): v is { value: unknown } => typeof v === 'object' && v !== null && 'value' in v
            );
            if (trVal && typeof trVal.value === 'string' && trVal.value.trim().length > 0) {
              return trVal.value;
            }
          }
        }
        return `Öğe ${idx + 1}`;
      };

      const toggleExpand = (idx: number) => {
        setExpandedIndices((prev) => ({ ...prev, [idx]: !prev[idx] }));
      };

      const handleAdd = () => {
        if (readOnly) return;
        const newItem: Record<string, unknown> = {};
        Object.entries(arrayFields).forEach(([subName, subDef]) => {
          newItem[subName] = subDef.defaultValue !== undefined ? subDef.defaultValue : null;
        });
        onChange([...items, newItem]);
        setExpandedIndices((prev) => ({ ...prev, [items.length]: true }));
      };

      const handleRemove = (idx: number) => {
        const copy = [...items];
        copy.splice(idx, 1);
        onChange(copy);
        // Kaldırılan öğeden sonrakilerin açık/kapalı durumu bir index kayar —
        // sadece silineni düşürmek durumun yanlış öğeye yapışmasına yol açıyordu.
        setExpandedIndices((prev) => {
          const next: Record<number, boolean> = {};
          for (const [key, expanded] of Object.entries(prev)) {
            const i = Number(key);
            if (i < idx) next[i] = expanded;
            else if (i > idx) next[i - 1] = expanded;
          }
          return next;
        });
      };

      const handleMove = (idx: number, direction: 'up' | 'down') => {
        if (readOnly) return;
        if (direction === 'up' && idx === 0) return;
        if (direction === 'down' && idx === items.length - 1) return;

        const copy = [...items];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        const temp = copy[idx];
        copy[idx] = copy[targetIdx];
        copy[targetIdx] = temp;
        onChange(copy);

        setExpandedIndices((prev) => {
          const next = { ...prev };
          const tempExpanded = next[idx];
          next[idx] = next[targetIdx];
          next[targetIdx] = tempExpanded;
          return next;
        });
      };

      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <div className="tecof-array">
            {items.map((item, idx) => {
              const isExpanded = !!expandedIndices[idx];
              const itemLabel = getItemLabel(item, idx);

              return (
                <div key={idx} className="tecof-array-item" data-tecof-array-index={idx}>
                  <div
                    onClick={() => toggleExpand(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleExpand(idx);
                      }
                    }}
                    className="tecof-array-item-header"
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                  >
                    <div className="tecof-array-item-title-wrap">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className="tecof-array-item-title">{itemLabel}</span>
                    </div>

                    <div className="tecof-array-item-actions" onClick={(e) => e.stopPropagation()}>
                      {!readOnly && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleMove(idx, 'up')}
                            disabled={idx === 0}
                            className="tecof-array-btn"
                            title="Yukarı taşı"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(idx, 'down')}
                            disabled={idx === items.length - 1}
                            className="tecof-array-btn"
                            title="Aşağı taşı"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(idx)}
                            className="tecof-array-btn danger"
                            title="Sil"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="tecof-array-item-body">
                      {Object.entries(arrayFields).map(([subFieldName, subFieldDef]) => (
                        <FieldRenderer
                          key={subFieldName}
                          name={subFieldName}
                          definition={subFieldDef}
                          value={item[subFieldName]}
                          onChange={(newSubVal) => {
                            const updatedItems = [...items];
                            updatedItems[idx] = {
                              ...updatedItems[idx],
                              [subFieldName]: newSubVal,
                            };
                            onChange(updatedItems);
                          }}
                          readOnly={readOnly || subFieldDef.readOnly === true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {!readOnly && (
              <button
                type="button"
                onClick={handleAdd}
                className="tecof-add-array-item-btn"
              >
                <Plus size={14} />
                Öğe Ekle
              </button>
            )}
          </div>
        </FieldLabel>
      );
    }

    case 'object': {
      // Puck-compatible object field: a fixed group of named sub-fields.
      const objectFields = definition.objectFields || {};
      const objVal =
        value && typeof value === 'object' && !Array.isArray(value)
          ? (value as Record<string, unknown>)
          : {};

      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <div className="tecof-field-object">
            {Object.entries(objectFields).map(([subFieldName, subFieldDef]) => (
              <FieldRenderer
                key={subFieldName}
                name={subFieldName}
                definition={subFieldDef}
                value={objVal[subFieldName]}
                onChange={(newSubVal) => onChange({ ...objVal, [subFieldName]: newSubVal })}
                readOnly={readOnly || subFieldDef.readOnly === true}
              />
            ))}
          </div>
        </FieldLabel>
      );
    }

    case 'external':
      // FieldConfig'in serbest index imzası external alan üyelerini (fetchList
      // vb.) taşır; burada somut tipe daraltıyoruz.
      return (
        <ExternalField
          field={definition as unknown as ExternalFieldConfig}
          name={name}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
        />
      );

    default:
      return (
        <div className="tecof-field-unsupported">
          Desteklenmeyen alan türü: &quot;{type}&quot; ({name})
        </div>
      );
  }
};
export default FieldRenderer;
