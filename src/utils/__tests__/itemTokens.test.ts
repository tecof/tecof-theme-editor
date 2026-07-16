import { describe, it, expect } from 'vitest';
import { resolveItemTokens, getItemTokenValue, inferItemSchema } from '../itemTokens';

const item = {
  name: 'Kupa',
  price: 149.9,
  stock: 0,
  image: { name: 'kupa.png', type: 'png', meta: { width: 800 } },
  meta: { title: 'Seramik Kupa' },
};

describe('getItemTokenValue', () => {
  it('reads flat and dotted paths', () => {
    expect(getItemTokenValue(item, 'name', 0)).toBe('Kupa');
    expect(getItemTokenValue(item, 'meta.title', 0)).toBe('Seramik Kupa');
  });

  it('returns undefined for missing paths without throwing', () => {
    expect(getItemTokenValue(item, 'missing.deep.path', 0)).toBeUndefined();
    expect(getItemTokenValue(null, 'name', 0)).toBeUndefined();
  });

  it('resolves the loop specials _index and _position', () => {
    expect(getItemTokenValue(item, '_index', 3)).toBe(3);
    expect(getItemTokenValue(item, '_position', 3)).toBe(4);
  });
});

describe('resolveItemTokens', () => {
  it('resolves a whole-string token to the RAW value (objects intact)', () => {
    expect(resolveItemTokens('{{ item.image }}', item, 0)).toEqual(item.image);
    expect(resolveItemTokens('{{ item.price }}', item, 0)).toBe(149.9);
  });

  it('interpolates embedded tokens as strings', () => {
    expect(resolveItemTokens('Fiyat: {{ item.price }} TL', item, 0)).toBe('Fiyat: 149.9 TL');
    expect(resolveItemTokens('{{ item.name }} — {{ item.meta.title }}', item, 0)).toBe(
      'Kupa — Seramik Kupa'
    );
  });

  it('interpolates falsy-but-present values (0) correctly', () => {
    expect(resolveItemTokens('Stok: {{ item.stock }}', item, 0)).toBe('Stok: 0');
  });

  it('blanks missing and object values in embedded interpolation', () => {
    expect(resolveItemTokens('x{{ item.missing }}y', item, 0)).toBe('xy');
    expect(resolveItemTokens('x{{ item.image }}y', item, 0)).toBe('xy');
  });

  it('resolves deeply through arrays and plain objects (multilingual values)', () => {
    const props = {
      title: [
        { code: 'tr', value: '{{ item.name }}' },
        { code: 'en', value: 'The {{ item.name }}' },
      ],
      link: { url: '/products/{{ item.name }}', label: 'İncele' },
    };
    expect(resolveItemTokens(props, item, 0)).toEqual({
      title: [
        { code: 'tr', value: 'Kupa' },
        { code: 'en', value: 'The Kupa' },
      ],
      link: { url: '/products/Kupa', label: 'İncele' },
    });
  });

  it('preserves references for branches without tokens', () => {
    const props = { id: 'node-1', plain: 'değişmez', nested: { a: 1 }, bound: '{{ item.name }}' };
    const resolved = resolveItemTokens(props, item, 0);
    expect(resolved).not.toBe(props);
    expect(resolved.nested).toBe(props.nested);
    expect(resolved.id).toBe('node-1');
    expect(resolved.bound).toBe('Kupa');

    const untouched = { id: 'node-2', text: 'token yok' };
    expect(resolveItemTokens(untouched, item, 0)).toBe(untouched);
  });

  it('leaves non-item tokens (e.g. {{ data.x }}) alone', () => {
    expect(resolveItemTokens('{{ data.title }}', item, 0)).toBe('{{ data.title }}');
  });
});

describe('inferItemSchema', () => {
  it('infers keys with loose type hints, skipping internal keys', () => {
    const schema = inferItemSchema({ ...item, _rowId: 'x' });
    expect(schema).toEqual([
      { key: 'name', type: 'text' },
      { key: 'price', type: 'text' },
      { key: 'stock', type: 'text' },
      { key: 'image', type: 'image' },
      { key: 'meta', type: 'object' },
    ]);
  });

  it('returns empty for non-object samples', () => {
    expect(inferItemSchema(null)).toEqual([]);
    expect(inferItemSchema('str')).toEqual([]);
    expect(inferItemSchema([1, 2])).toEqual([]);
  });
});
