import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { FieldLabel } from '../../components/fields/FieldLabel';

export interface FieldRendererProps {
  name: string;
  definition: any;
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
}

export const FieldRenderer = ({
  name,
  definition,
  value,
  onChange,
  readOnly = false,
}: FieldRendererProps) => {
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  const label = definition.label || name;
  const type = definition.type;

  // 1. Custom Render (Custom Fields from create*Field factories)
  if (definition.render) {
    return (
      <div className="tecof-field-custom">
        {definition.render({
          field: definition,
          name,
          id: `field-${name}`,
          value,
          onChange,
          readOnly,
        })}
      </div>
    );
  }

  // 2. Built-in types (Standard fields)
  switch (type) {
    case 'text':
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <input
            id={`field-${name}`}
            type="text"
            value={value || ''}
            disabled={readOnly}
            onChange={(e) => onChange(e.target.value)}
            className="tecof-input-text"
          />
        </FieldLabel>
      );

    case 'textarea':
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <textarea
            id={`field-${name}`}
            rows={4}
            value={value || ''}
            disabled={readOnly}
            onChange={(e) => onChange(e.target.value)}
            className="tecof-input-textarea"
          />
        </FieldLabel>
      );

    case 'select':
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <div className="tecof-field-select-wrap">
            <select
              id={`field-${name}`}
              value={value || ''}
              disabled={readOnly}
              onChange={(e) => onChange(e.target.value)}
              className="tecof-input-select"
            >
              {(definition.options || []).map((opt: any) => (
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

    case 'number':
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <input
            id={`field-${name}`}
            type="number"
            value={value !== undefined ? value : ''}
            disabled={readOnly}
            onChange={(e) => {
              const val = e.target.value;
              onChange(val === '' ? undefined : Number(val));
            }}
            className="tecof-input-number"
          />
        </FieldLabel>
      );

    case 'radio':
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <div className="tecof-field-radio-group">
            {(definition.options || []).map((opt: any) => (
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

    case 'array': {
      const items = Array.isArray(value) ? value : [];
      const arrayFields = definition.arrayFields || {};

      const getItemLabel = (item: any, idx: number) => {
        if (!item) return `Öğe ${idx + 1}`;
        for (const val of Object.values(item)) {
          if (typeof val === 'string' && val.trim().length > 0) {
            return val;
          }
          if (Array.isArray(val)) {
            const trVal = val.find((v) => typeof v === 'object' && v !== null && 'value' in v);
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
        const newItem: any = {};
        Object.entries(arrayFields).forEach(([subName, subDef]: [string, any]) => {
          newItem[subName] = subDef.defaultValue !== undefined ? subDef.defaultValue : null;
        });
        onChange([...items, newItem]);
        setExpandedIndices((prev) => ({ ...prev, [items.length]: true }));
      };

      const handleRemove = (idx: number) => {
        const copy = [...items];
        copy.splice(idx, 1);
        onChange(copy);
        const newExpanded = { ...expandedIndices };
        delete newExpanded[idx];
        setExpandedIndices(newExpanded);
      };

      const handleMove = (idx: number, direction: 'up' | 'down') => {
        if (direction === 'up' && idx === 0) return;
        if (direction === 'down' && idx === items.length - 1) return;

        const copy = [...items];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        const temp = copy[idx];
        copy[idx] = copy[targetIdx];
        copy[targetIdx] = temp;
        onChange(copy);

        const newExpanded = { ...expandedIndices };
        const tempExpanded = newExpanded[idx];
        newExpanded[idx] = newExpanded[targetIdx];
        newExpanded[targetIdx] = tempExpanded;
        setExpandedIndices(newExpanded);
      };

      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <div className="tecof-array">
            {items.map((item, idx) => {
              const isExpanded = !!expandedIndices[idx];
              const itemLabel = getItemLabel(item, idx);

              return (
                <div key={idx} className="tecof-array-item">
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
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemove(idx)}
                          className="tecof-array-btn danger"
                          title="Sil"
                        >
                          <Trash2 size={12} />
                        </button>
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
                          readOnly={readOnly}
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

    default:
      return (
        <div className="tecof-field-unsupported">
          Desteklenmeyen alan türü: &quot;{type}&quot; ({name})
        </div>
      );
  }
};
export default FieldRenderer;
