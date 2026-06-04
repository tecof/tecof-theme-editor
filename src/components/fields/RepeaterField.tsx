import type { ReactElement } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FieldLabel } from '@puckeditor/core';
import { FieldErrorBoundary } from './FieldErrorBoundary';
import { ChevronDown, Copy, GripVertical, Plus, Trash2 } from 'lucide-react';

/* ─── Types ─── */

export interface RepeaterFieldProps {
  field: any;
  name: string;
  id: string;
  value: Record<string, any>[];
  onChange: (value: Record<string, any>[]) => void;
  readOnly?: boolean;
}

export interface RepeaterFieldOptions {
  /** Field label displayed in the Puck sidebar */
  label?: string;
  /** Icon displayed next to the label */
  labelIcon?: ReactElement;
  /** Whether this field is visible in the sidebar */
  visible?: boolean;
  /** Sub-fields definition — each key maps to a createXxxField() result */
  subFields: Record<string, any>;
  /** Minimum number of rows */
  minItems?: number;
  /** Maximum number of rows */
  maxItems?: number;
  /** Default values for a new row */
  defaultRow?: Record<string, any>;
}

/* ─── Row Component ─── */

const RepeaterRow = ({
  row,
  rowIndex,
  subFields,
  isExpanded,
  onToggle,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onChange,
  canRemove,
  canMoveUp,
  canMoveDown,
  readOnly,
}: {
  row: Record<string, any>;
  rowIndex: number;
  subFields: Record<string, any>;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChange: (key: string, val: any) => void;
  canRemove: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  readOnly?: boolean;
}) => {
  // Get a preview label from the first sub-field value
  const previewLabel = useMemo(() => {
    const keys = Object.keys(subFields);
    if (keys.length === 0) return `Satır ${rowIndex + 1}`;

    const firstKey = keys[0];
    const val = row[firstKey];
    if (!val) return `Satır ${rowIndex + 1}`;

    // Multilingual array [{code, value}]
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && 'value' in val[0]) {
      const text = val[0]?.value;
      if (typeof text === 'string' && text.trim()) {
        return text.length > 40 ? text.substring(0, 40) + '…' : text;
      }
    }

    // Plain string
    if (typeof val === 'string' && val.trim()) {
      return val.length > 40 ? val.substring(0, 40) + '…' : val;
    }

    return `Satır ${rowIndex + 1}`;
  }, [row, subFields, rowIndex]);

  return (
    <div className={`tecof-repeater-row ${isExpanded ? 'expanded' : ''}`}>
      {/* Row Header */}
      <div className="tecof-repeater-row-header" onClick={onToggle}>
        <div className="tecof-repeater-row-left">
          <GripVertical size={14} className="tecof-repeater-grip" />
          <span className="tecof-repeater-row-index">{rowIndex + 1}</span>
          <span className="tecof-repeater-row-preview">{previewLabel}</span>
        </div>

        <div className="tecof-repeater-row-actions">
          {!readOnly && (
            <>
              {canMoveUp && (
                <button
                  type="button"
                  className="tecof-repeater-action-btn"
                  onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                  title="Yukarı Taşı"
                >
                  ▲
                </button>
              )}
              {canMoveDown && (
                <button
                  type="button"
                  className="tecof-repeater-action-btn"
                  onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                  title="Aşağı Taşı"
                >
                  ▼
                </button>
              )}
              <button
                type="button"
                className="tecof-repeater-action-btn"
                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                title="Kopyala"
              >
                <Copy size={13} />
              </button>
              {canRemove && (
                <button
                  type="button"
                  className="tecof-repeater-action-btn tecof-repeater-action-btn-danger"
                  onClick={(e) => { e.stopPropagation(); onRemove(); }}
                  title="Sil"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </>
          )}
          <ChevronDown
            size={16}
            className={`tecof-repeater-chevron ${isExpanded ? 'rotated' : ''}`}
          />
        </div>
      </div>

      {/* Row Content (Sub-fields) */}
      {isExpanded && (
        <div className="tecof-repeater-row-content">
          {Object.entries(subFields).map(([key, fieldDef]: [string, any]) => {
            const fieldValue = row[key];
            const renderFn = fieldDef?.render;

            if (typeof renderFn !== 'function') return null;

            return (
              <div key={key} className="tecof-repeater-subfield">
                {renderFn({
                  field: fieldDef,
                  name: `${key}_${rowIndex}`,
                  id: `repeater-${rowIndex}-${key}`,
                  value: fieldValue,
                  onChange: (val: any) => onChange(key, val),
                  readOnly,
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ─── */

export const RepeaterField = ({
  value: rawValue,
  onChange,
  readOnly,
  subFields = {},
  minItems = 0,
  maxItems,
  defaultRow,
}: RepeaterFieldProps & RepeaterFieldOptions) => {
  const items = useMemo(() => (Array.isArray(rawValue) ? rawValue : []), [rawValue]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(() => new Set(items.length > 0 ? [0] : []));

  // Stable onChange ref
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const canAdd = maxItems == null || items.length < maxItems;
  const canRemove = items.length > minItems;

  // Build default row from sub-field definitions
  const buildDefaultRow = useCallback((): Record<string, any> => {
    if (defaultRow) return { ...defaultRow };

    const row: Record<string, any> = {};
    for (const [key, fieldDef] of Object.entries(subFields)) {
      const ft = (fieldDef as any)?._fieldType;
      if (ft === 'language' || ft === 'editor') {
        row[key] = [];
      } else if (ft === 'upload') {
        row[key] = [];
      } else if (ft === 'link') {
        row[key] = [];
      } else if (ft === 'color') {
        row[key] = '#000000';
      } else {
        row[key] = '';
      }
    }
    return row;
  }, [subFields, defaultRow]);

  /* ── Handlers ── */

  const handleAdd = useCallback(() => {
    if (!canAdd) return;
    const newRow = buildDefaultRow();
    const newItems = [...items, newRow];
    onChangeRef.current(newItems);
    // Auto-expand the new row
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.add(newItems.length - 1);
      return next;
    });
  }, [canAdd, buildDefaultRow, items]);

  const handleRemove = useCallback((index: number) => {
    if (!canRemove) return;
    const newItems = items.filter((_, i) => i !== index);
    onChangeRef.current(newItems);
    setExpandedRows(prev => {
      const next = new Set<number>();
      prev.forEach(idx => {
        if (idx < index) next.add(idx);
        else if (idx > index) next.add(idx - 1);
      });
      return next;
    });
  }, [canRemove, items]);

  const handleDuplicate = useCallback((index: number) => {
    if (!canAdd) return;
    const newItems = [...items];
    const cloned = JSON.parse(JSON.stringify(items[index]));
    newItems.splice(index + 1, 0, cloned);
    onChangeRef.current(newItems);
    setExpandedRows(prev => {
      const next = new Set<number>();
      prev.forEach(idx => {
        if (idx <= index) next.add(idx);
        else next.add(idx + 1);
      });
      next.add(index + 1);
      return next;
    });
  }, [canAdd, items]);

  const handleMove = useCallback((index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;

    const newItems = [...items];
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    onChangeRef.current(newItems);

    setExpandedRows(prev => {
      const next = new Set<number>();
      prev.forEach(idx => {
        if (idx === index) next.add(target);
        else if (idx === target) next.add(index);
        else next.add(idx);
      });
      return next;
    });
  }, [items]);

  const handleSubFieldChange = useCallback((rowIndex: number, key: string, val: any) => {
    const newItems = items.map((row, i) => {
      if (i !== rowIndex) return row;
      return { ...row, [key]: val };
    });
    onChangeRef.current(newItems);
  }, [items]);

  const toggleRow = useCallback((index: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  return (
    <div className="tecof-repeater-container">
      {/* Header */}
      <div className="tecof-repeater-header">
        <span className="tecof-repeater-count">
          {items.length} satır
          {maxItems != null && ` / ${maxItems}`}
        </span>
      </div>

      {/* Empty State */}
      {items.length === 0 && !readOnly && (
        <div className="tecof-repeater-empty">
          <p className="tecof-repeater-empty-text">Henüz satır eklenmemiş</p>
          <button
            type="button"
            className="tecof-repeater-add-btn"
            onClick={handleAdd}
          >
            <Plus size={14} /> İlk Satırı Ekle
          </button>
        </div>
      )}

      {/* Rows */}
      <div className="tecof-repeater-rows">
        {items.map((row, idx) => (
          <RepeaterRow
            key={idx}
            row={row}
            rowIndex={idx}
            subFields={subFields}
            isExpanded={expandedRows.has(idx)}
            onToggle={() => toggleRow(idx)}
            onRemove={() => handleRemove(idx)}
            onDuplicate={() => handleDuplicate(idx)}
            onMoveUp={() => handleMove(idx, 'up')}
            onMoveDown={() => handleMove(idx, 'down')}
            onChange={(key, val) => handleSubFieldChange(idx, key, val)}
            canRemove={canRemove}
            canMoveUp={idx > 0}
            canMoveDown={idx < items.length - 1}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Add Button */}
      {items.length > 0 && !readOnly && canAdd && (
        <button
          type="button"
          className="tecof-repeater-add-btn-bottom"
          onClick={handleAdd}
        >
          <Plus size={14} /> Satır Ekle
        </button>
      )}
    </div>
  );
};

RepeaterField.displayName = 'RepeaterField';

/* ─── Factory Function (Puck Custom Field) ─── */

export const createRepeaterField = (options: RepeaterFieldOptions) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;

  return {
    type: 'custom' as const,
    _fieldType: 'repeater' as const,
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }: RepeaterFieldProps) => (
      <FieldLabel label={label || ''} icon={labelIcon} readOnly={readOnly}>
        <FieldErrorBoundary fieldName={name}>
          <RepeaterField
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

export default RepeaterField;
