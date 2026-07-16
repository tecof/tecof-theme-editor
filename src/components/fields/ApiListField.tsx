import React from 'react';
import { RefreshCw } from 'lucide-react';
import { FieldLabel } from './FieldLabel';
import { FieldErrorBoundary } from './FieldErrorBoundary';
import { useRepeatRows, clearRepeatRowsCache } from '../useRepeatRows';
import type { ItemSchemaField } from '../../types';

/**
 * ApiListField — a LIST data source for repeat zones, fed by the host's own
 * async `fetchList` (any API, any backend). Unlike `createExternalField` (which
 * picks ONE record), this field's value is just the fetch parameters
 * (`{ query, limit }`); the actual rows are resolved at render time by
 * `useRepeatRows` — in the editor canvas (template + ghosts show live data) AND
 * on the published page. Point a slot's `repeatSource` at this field:
 *
 * ```tsx
 * fields: {
 *   source: createApiListField({
 *     label: "Ürünler",
 *     fetchList: async ({ query, limit }) =>
 *       fetch(`/api/products?q=${query ?? ''}&limit=${limit ?? 8}`).then(r => r.json()),
 *     itemSchema: [ { key: 'name', label: 'Ad', type: 'text' } ], // opsiyonel
 *   }),
 *   card: { type: "slot", repeatSource: "source" },
 * }
 * ```
 *
 * `itemSchema` feeds the `{ }` binding popover inside the template; omit it and
 * the schema is inferred from the first fetched row instead.
 */

export interface ApiListFieldValue {
  query?: string;
  limit?: number;
}

export interface ApiListFieldOptions {
  label?: string;
  labelIcon?: React.ReactElement;
  visible?: boolean;
  /** Fetches the rows. Runs in the editor AND on the published page (client side). */
  fetchList: (params: { query?: string; limit?: number }) => Promise<unknown[]>;
  /** Bindable item fields for the `{ }` popover (else inferred from row 0). */
  itemSchema?: ItemSchemaField[];
  /** Show the free-text query input (default true). */
  showQuery?: boolean;
  /** Show the limit input (default true). */
  showLimit?: boolean;
  /** Prefilled limit for fresh values. */
  defaultLimit?: number;
}

interface ApiListFieldProps {
  value: ApiListFieldValue | null | undefined;
  onChange: (value: ApiListFieldValue) => void;
  readOnly?: boolean;
  options: ApiListFieldOptions;
}

/** First human-readable string in a row object — for the preview list. */
const rowLabel = (row: unknown, index: number): string => {
  if (row && typeof row === 'object') {
    for (const v of Object.values(row as Record<string, unknown>)) {
      if (typeof v === 'string' && v.trim()) return v;
      if (typeof v === 'number') return String(v);
    }
  }
  return `Kayıt ${index + 1}`;
};

const ApiListFieldInner = ({ value, onChange, readOnly, options }: ApiListFieldProps) => {
  const current: ApiListFieldValue = {
    limit: options.defaultLimit,
    ...(value ?? {}),
  };
  // The SAME resolver the repeat zones use — so the preview always mirrors
  // exactly what the canvas/published loop will receive (and shares its cache).
  const rows = useRepeatRows(current, options);

  return (
    <div className="tecof-apilist">
      <div className="tecof-apilist-controls">
        {options.showQuery !== false && (
          <input
            type="text"
            className="tecof-input-text"
            placeholder="Arama / filtre…"
            value={current.query ?? ''}
            disabled={readOnly}
            onChange={(e) => onChange({ ...current, query: e.target.value || undefined })}
          />
        )}
        {options.showLimit !== false && (
          <input
            type="number"
            className="tecof-input-number tecof-apilist-limit"
            min={1}
            placeholder="Adet"
            title="Kayıt sayısı"
            value={current.limit ?? ''}
            disabled={readOnly}
            onChange={(e) => {
              const n = Number(e.target.value);
              onChange({ ...current, limit: e.target.value === '' || Number.isNaN(n) ? undefined : n });
            }}
          />
        )}
        <button
          type="button"
          className="tecof-apilist-refresh"
          title="Veriyi yenile"
          aria-label="Veriyi yenile"
          onClick={() => clearRepeatRowsCache()}
        >
          <RefreshCw size={13} />
        </button>
      </div>
      <div className="tecof-apilist-preview">
        <span className="tecof-apilist-count">{rows.length} kayıt</span>
        {rows.slice(0, 3).map((row, i) => (
          <span key={i} className="tecof-apilist-row" title={rowLabel(row, i)}>
            {rowLabel(row, i)}
          </span>
        ))}
      </div>
    </div>
  );
};

export const createApiListField = (options: ApiListFieldOptions) => {
  const { label, labelIcon, visible, fetchList, itemSchema } = options;

  return {
    type: 'custom' as const,
    _fieldType: 'api-list' as const,
    label,
    labelIcon,
    visible,
    // On the FIELD DEF (not the value) so renderers and the binding popover can
    // reach them via `config.components[type].fields[repeatSource]`.
    fetchList,
    itemSchema,
    render: ({ value, onChange, readOnly, name }: any) => (
      <FieldLabel label={label || ''} icon={labelIcon} readOnly={readOnly}>
        <FieldErrorBoundary fieldName={name}>
          <ApiListFieldInner
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            options={options}
          />
        </FieldErrorBoundary>
      </FieldLabel>
    ),
  };
};

export default createApiListField;
