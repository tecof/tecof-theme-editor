import type { DragEvent, ReactElement } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FieldLabel } from './FieldLabel';
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

type DropPosition = 'before' | 'after';

interface DropTarget {
  id: string;
  pos: DropPosition;
}

/* ─── Stable row identity ───
 * Rows are plain data objects without an id of their own, so the component
 * assigns each row a session-local uid. Uids are kept in a ref array that is
 * mutated in lockstep with every list operation, which keeps React keys and
 * expanded/drag state stable across reorders. */

let uidCounter = 0;
const nextUid = () => `trow-${++uidCounter}`;

const cloneRow = (row: Record<string, any>): Record<string, any> => {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(row);
    } catch {
      /* fall through — row may contain non-cloneable values */
    }
  }
  return JSON.parse(JSON.stringify(row));
};

/* ─── Row Component ─── */

const RepeaterRow = ({
  row,
  rowId,
  rowIndex,
  subFields,
  isExpanded,
  isDragging,
  dropPos,
  dragArmed,
  onGripPointerDown,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onToggle,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onChange,
  canRemove,
  canDuplicate,
  canMoveUp,
  canMoveDown,
  readOnly,
}: {
  row: Record<string, any>;
  rowId: string;
  rowIndex: number;
  subFields: Record<string, any>;
  isExpanded: boolean;
  isDragging: boolean;
  dropPos: DropPosition | null;
  dragArmed: boolean;
  onGripPointerDown: () => void;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onToggle: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChange: (key: string, val: any) => void;
  canRemove: boolean;
  canDuplicate: boolean;
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
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null && 'value' in val[0]) {
      const entry = val.find((v: any) => typeof v?.value === 'string' && v.value.trim());
      const text = entry?.value;
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

  const rowClasses = [
    'tecof-repeater-row',
    isExpanded ? 'expanded' : '',
    isDragging ? 'dragging' : '',
    dropPos === 'before' ? 'drop-before' : '',
    dropPos === 'after' ? 'drop-after' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rowClasses} onDragOver={onDragOver} onDrop={onDrop}>
      {/* Row Header */}
      <div
        className="tecof-repeater-row-header"
        onClick={onToggle}
        draggable={dragArmed}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="tecof-repeater-row-left">
          {!readOnly && (
            <span
              className="tecof-repeater-grip-handle"
              onPointerDown={onGripPointerDown}
              onClick={(e) => e.stopPropagation()}
              title="Sürükleyerek Taşı"
            >
              <GripVertical size={14} className="tecof-repeater-grip" />
            </span>
          )}
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
              {canDuplicate && (
                <button
                  type="button"
                  className="tecof-repeater-action-btn"
                  onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                  title="Kopyala"
                >
                  <Copy size={13} />
                </button>
              )}
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
                  name: `${key}_${rowId}`,
                  id: `repeater-${rowId}-${key}`,
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

  // Latest-value refs so rapid successive operations (double clicks, drag right
  // after an edit) never work on a stale array captured in a closure.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Stable per-row uids, kept in lockstep with items by every handler below.
  // If the value changes from outside (length mismatch we didn't produce),
  // re-sync by truncating / appending fresh uids.
  const idsRef = useRef<string[]>([]);
  if (idsRef.current.length !== items.length) {
    const synced = idsRef.current.slice(0, items.length);
    while (synced.length < items.length) synced.push(nextUid());
    idsRef.current = synced;
  }
  const rowIds = idsRef.current;

  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    () => new Set(idsRef.current.length > 0 ? [idsRef.current[0]] : []),
  );

  /* ── Drag & drop state ── */
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [dragArmedId, setDragArmedId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const dropTargetRef = useRef<DropTarget | null>(null);
  const suppressToggleRef = useRef(false);

  const canAdd = maxItems == null || items.length < maxItems;
  const canRemove = items.length > minItems;

  // Build default row from sub-field definitions
  const buildDefaultRow = useCallback((): Record<string, any> => {
    if (defaultRow) return cloneRow(defaultRow);

    const row: Record<string, any> = {};
    for (const [key, fieldDef] of Object.entries(subFields)) {
      const ft = (fieldDef as any)?._fieldType;
      if (ft === 'language' || ft === 'editor' || ft === 'upload' || ft === 'link') {
        row[key] = [];
      } else if (ft === 'color') {
        row[key] = '#000000';
      } else if (ft === 'ecommerce') {
        /* Seçici alanların değeri bir NESNE (ya da çoklu modda dizi); boş
           string verilseydi "seçili ama boş" gibi görünürdü — temizle düğmesi
           çıkar, özet boş kalırdı. */
        row[key] = (fieldDef as any)?.multiple ? [] : undefined;
      } else {
        row[key] = '';
      }
    }
    return row;
  }, [subFields, defaultRow]);

  /* ── List operations (always read through refs, mutate ids in lockstep) ── */

  const commit = useCallback((newItems: Record<string, any>[], newIds: string[]) => {
    idsRef.current = newIds;
    itemsRef.current = newItems;
    onChangeRef.current(newItems);
  }, []);

  const handleAdd = useCallback(() => {
    const current = itemsRef.current;
    if (maxItems != null && current.length >= maxItems) return;

    const newId = nextUid();
    commit([...current, buildDefaultRow()], [...idsRef.current, newId]);
    // Auto-expand the new row
    setExpandedRows(prev => new Set(prev).add(newId));
  }, [maxItems, buildDefaultRow, commit]);

  const handleRemove = useCallback((id: string) => {
    const index = idsRef.current.indexOf(id);
    if (index < 0 || itemsRef.current.length <= minItems) return;

    commit(
      itemsRef.current.filter((_, i) => i !== index),
      idsRef.current.filter(existing => existing !== id),
    );
    setExpandedRows(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [minItems, commit]);

  const handleDuplicate = useCallback((id: string) => {
    const current = itemsRef.current;
    if (maxItems != null && current.length >= maxItems) return;
    const index = idsRef.current.indexOf(id);
    if (index < 0) return;

    const newItems = [...current];
    newItems.splice(index + 1, 0, cloneRow(current[index]));
    const newIds = [...idsRef.current];
    const newId = nextUid();
    newIds.splice(index + 1, 0, newId);

    commit(newItems, newIds);
    setExpandedRows(prev => new Set(prev).add(newId));
  }, [maxItems, commit]);

  const moveRow = useCallback((from: number, to: number) => {
    const current = itemsRef.current;
    if (from === to || from < 0 || to < 0 || from >= current.length || to >= current.length) return;

    const newItems = [...current];
    const [movedItem] = newItems.splice(from, 1);
    newItems.splice(to, 0, movedItem);

    const newIds = [...idsRef.current];
    const [movedId] = newIds.splice(from, 1);
    newIds.splice(to, 0, movedId);

    commit(newItems, newIds);
  }, [commit]);

  const handleMove = useCallback((id: string, direction: 'up' | 'down') => {
    const index = idsRef.current.indexOf(id);
    if (index < 0) return;
    moveRow(index, direction === 'up' ? index - 1 : index + 1);
  }, [moveRow]);

  const handleSubFieldChange = useCallback((id: string, key: string, val: any) => {
    const index = idsRef.current.indexOf(id);
    if (index < 0) return;
    const newItems = itemsRef.current.map((row, i) => (i === index ? { ...row, [key]: val } : row));
    itemsRef.current = newItems;
    onChangeRef.current(newItems);
  }, []);

  const toggleRow = useCallback((id: string) => {
    // A click can fire on the header right after a drop lands on it — ignore it.
    if (suppressToggleRef.current || dragIdRef.current) return;
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /* ── Drag & drop handlers ──
   * The header only becomes draggable after a pointerdown on the grip handle,
   * so text selection and clicks elsewhere on the header keep working. */

  const armDrag = useCallback((id: string) => {
    if (readOnly) return;
    setDragArmedId(id);
    const disarm = () => {
      setDragArmedId(current => (current === id ? null : current));
      window.removeEventListener('pointerup', disarm);
    };
    window.addEventListener('pointerup', disarm);
  }, [readOnly]);

  const clearDragState = useCallback(() => {
    dragIdRef.current = null;
    dropTargetRef.current = null;
    setDragId(null);
    setDropTarget(null);
    setDragArmedId(null);
    suppressToggleRef.current = true;
    setTimeout(() => { suppressToggleRef.current = false; }, 0);
  }, []);

  const handleDragStart = useCallback((id: string, e: DragEvent<HTMLDivElement>) => {
    // Keep the drag inside this repeater — don't let Puck's own dnd pick it up.
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    dragIdRef.current = id;
    setDragId(id);
  }, []);

  const handleDragOver = useCallback((id: string, e: DragEvent<HTMLDivElement>) => {
    // Only react to drags started by this repeater instance.
    if (!dragIdRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const pos: DropPosition = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    const target: DropTarget = { id, pos };
    dropTargetRef.current = target;
    setDropTarget(prev => (prev && prev.id === id && prev.pos === pos ? prev : target));
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    if (!dragIdRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const sourceId = dragIdRef.current;
    const target = dropTargetRef.current;
    if (sourceId && target) {
      const from = idsRef.current.indexOf(sourceId);
      const targetIndex = idsRef.current.indexOf(target.id);
      if (from >= 0 && targetIndex >= 0) {
        let to = target.pos === 'before' ? targetIndex : targetIndex + 1;
        if (from < to) to -= 1;
        moveRow(from, to);
      }
    }
    clearDragState();
  }, [moveRow, clearDragState]);

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
        {items.map((row, idx) => {
          const rowId = rowIds[idx];
          return (
            <RepeaterRow
              key={rowId}
              row={row}
              rowId={rowId}
              rowIndex={idx}
              subFields={subFields}
              isExpanded={expandedRows.has(rowId)}
              isDragging={dragId === rowId}
              dropPos={dropTarget?.id === rowId && dragId !== rowId ? dropTarget.pos : null}
              dragArmed={dragArmedId === rowId}
              onGripPointerDown={() => armDrag(rowId)}
              onDragStart={(e) => handleDragStart(rowId, e)}
              onDragEnd={clearDragState}
              onDragOver={(e) => handleDragOver(rowId, e)}
              onDrop={handleDrop}
              onToggle={() => toggleRow(rowId)}
              onRemove={() => handleRemove(rowId)}
              onDuplicate={() => handleDuplicate(rowId)}
              onMoveUp={() => handleMove(rowId, 'up')}
              onMoveDown={() => handleMove(rowId, 'down')}
              onChange={(key, val) => handleSubFieldChange(rowId, key, val)}
              canRemove={canRemove}
              canDuplicate={canAdd}
              canMoveUp={idx > 0}
              canMoveDown={idx < items.length - 1}
              readOnly={readOnly}
            />
          );
        })}
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
            value={value}
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
