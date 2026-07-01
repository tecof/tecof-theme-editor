import { describe, it, expect } from 'vitest';
import {
  defaultSummary,
  rowColumns,
  createExternalField,
  type ExternalFieldConfig,
} from '../ExternalField';

describe('defaultSummary', () => {
  it('returns empty for nullish values', () => {
    expect(defaultSummary(null)).toBe('');
    expect(defaultSummary(undefined)).toBe('');
  });

  it('stringifies primitives', () => {
    expect(defaultSummary('Ürün A')).toBe('Ürün A');
    expect(defaultSummary(42)).toBe('42');
  });

  it('prefers title > name > label > id > _id for objects', () => {
    expect(defaultSummary({ title: 'T', name: 'N' })).toBe('T');
    expect(defaultSummary({ name: 'N', label: 'L' })).toBe('N');
    expect(defaultSummary({ label: 'L', id: '1' })).toBe('L');
    expect(defaultSummary({ id: '1' })).toBe('1');
    expect(defaultSummary({ _id: 'x' })).toBe('x');
  });
});

describe('rowColumns', () => {
  const base = { fetchList: async () => [] } as ExternalFieldConfig;

  it('uses mapRow when provided', () => {
    const field = { ...base, mapRow: (r: any) => ({ Ad: r.name, Fiyat: r.price }) };
    expect(rowColumns(field, { name: 'A', price: 10, hidden: true })).toEqual({
      Ad: 'A',
      Fiyat: 10,
    });
  });

  it('falls back to the row object itself', () => {
    expect(rowColumns(base, { a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it('wraps a primitive row under `value`', () => {
    expect(rowColumns(base, 'plain')).toEqual({ value: 'plain' });
  });
});

describe('createExternalField', () => {
  it('produces a { type: "external" } field config', () => {
    const fetchList = async () => [{ id: 1 }];
    const field = createExternalField({ label: 'Ürün', fetchList });
    expect(field.type).toBe('external');
    expect(field.label).toBe('Ürün');
    expect(field.fetchList).toBe(fetchList);
  });
});
