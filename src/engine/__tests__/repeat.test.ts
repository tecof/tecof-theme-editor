import { describe, it, expect } from 'vitest';
import { findRepeatScope } from '../repeat';
import type { TecofDocument } from '../../types';

const config = {
  components: {
    ProductGrid: {
      fields: {
        items: { type: 'array' },
        card: { type: 'slot', repeatSource: 'items' },
      },
    },
    ApiGrid: {
      fields: {
        card: {
          type: 'slot',
          itemSchema: [{ key: 'sku', type: 'text' }],
        },
      },
    },
    ApiSourceGrid: {
      fields: {
        source: {
          type: 'custom',
          fetchList: async () => [],
          itemSchema: [{ key: 'name', type: 'text' }],
        },
        card: { type: 'slot', repeatSource: 'source' },
      },
    },
    Card: { fields: { body: { type: 'slot' } } },
    Text: { fields: { text: { type: 'text' } } },
  },
};

const rows = [{ name: 'Kupa' }, { name: 'Tabak' }];

const doc: TecofDocument = {
  root: { props: {} },
  content: [
    { type: 'ProductGrid', props: { id: 'grid', items: rows } },
    { type: 'ApiGrid', props: { id: 'api-grid' } },
    { type: 'ApiSourceGrid', props: { id: 'src-grid', source: { query: 'kupa' } } },
    { type: 'Text', props: { id: 'loose-text' } },
  ],
  zones: {
    'grid:card': [{ type: 'Card', props: { id: 'card-1' } }],
    'card-1:body': [{ type: 'Text', props: { id: 'text-1' } }],
    'api-grid:card': [{ type: 'Text', props: { id: 'api-text' } }],
    'src-grid:card': [{ type: 'Text', props: { id: 'src-text' } }],
  },
};

describe('findRepeatScope', () => {
  it('finds the scope for a direct child of a repeat zone', () => {
    const scope = findRepeatScope(doc, config, 'card-1');
    expect(scope).toMatchObject({
      ownerId: 'grid',
      slotName: 'card',
      sourceProp: 'items',
      rows,
      sample: rows[0],
    });
  });

  it('walks up nested zones to the nearest repeat ancestor', () => {
    const scope = findRepeatScope(doc, config, 'text-1');
    expect(scope?.ownerId).toBe('grid');
    expect(scope?.sample).toEqual({ name: 'Kupa' });
  });

  it('surfaces an explicit itemSchema even without repeatSource rows', () => {
    const scope = findRepeatScope(doc, config, 'api-text');
    expect(scope?.rows).toEqual([]);
    expect(scope?.itemSchema).toEqual([{ key: 'sku', type: 'text' }]);
  });

  it('falls back to the SOURCE field itemSchema and exposes value + field def', () => {
    const scope = findRepeatScope(doc, config, 'src-text');
    expect(scope?.itemSchema).toEqual([{ key: 'name', type: 'text' }]);
    expect(scope?.sourceValue).toEqual({ query: 'kupa' });
    expect(typeof scope?.sourceFieldDef?.fetchList).toBe('function');
    // Non-array source: no sync rows/sample (callers peek the async cache).
    expect(scope?.rows).toEqual([]);
    expect(scope?.sample).toBeNull();
  });

  it('returns null outside any repeat template', () => {
    expect(findRepeatScope(doc, config, 'loose-text')).toBeNull();
    expect(findRepeatScope(doc, config, 'grid')).toBeNull();
  });
});
