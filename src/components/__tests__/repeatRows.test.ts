import { describe, it, expect, beforeEach } from 'vitest';
import {
  resolveRepeatRows,
  peekRepeatRows,
  clearRepeatRowsCache,
} from '../useRepeatRows';

const rows = [
  { name: 'Kupa', price: 149 },
  { name: 'Tabak', price: 89 },
];

beforeEach(() => {
  clearRepeatRowsCache();
});

describe('resolveRepeatRows', () => {
  it('returns plain arrays as-is (no cache involved)', async () => {
    await expect(resolveRepeatRows(rows, undefined)).resolves.toBe(rows);
  });

  it('resolves api-list sources through the field def fetchList', async () => {
    let calls = 0;
    const fieldDef = {
      fetchList: async ({ query, limit }: { query?: string; limit?: number }) => {
        calls += 1;
        expect(query).toBe('kupa');
        expect(limit).toBe(4);
        return rows;
      },
    };
    const value = { query: 'kupa', limit: 4 };
    await expect(resolveRepeatRows(value, fieldDef)).resolves.toEqual(rows);
    // Cached: same params never re-fetch.
    await expect(resolveRepeatRows(value, fieldDef)).resolves.toEqual(rows);
    expect(calls).toBe(1);
  });

  it('de-duplicates concurrent fetches for the same params', async () => {
    let calls = 0;
    const fieldDef = {
      fetchList: async () => {
        calls += 1;
        await new Promise((r) => setTimeout(r, 10));
        return rows;
      },
    };
    const [a, b] = await Promise.all([
      resolveRepeatRows({}, fieldDef),
      resolveRepeatRows({}, fieldDef),
    ]);
    expect(a).toEqual(rows);
    expect(b).toEqual(rows);
    expect(calls).toBe(1);
  });

  it('keys the cache by fetch params — different query refetches', async () => {
    let calls = 0;
    const fieldDef = { fetchList: async () => (calls += 1, rows) };
    await resolveRepeatRows({ query: 'a' }, fieldDef);
    await resolveRepeatRows({ query: 'b' }, fieldDef);
    expect(calls).toBe(2);
  });

  it('resolves CMS collection bindings via the api client ({items} unwrap)', async () => {
    const apiClient: any = {
      getCmsCollectionItems: async (slug: string, opts: any) => {
        expect(slug).toBe('urunler');
        expect(opts).toMatchObject({ limit: 6, sort: 'newest' });
        return { success: true, data: { items: rows, totalData: 2 } };
      },
    };
    const value = { collectionSlug: 'urunler', limit: 6, sort: 'newest' as const };
    await expect(resolveRepeatRows(value, undefined, apiClient)).resolves.toEqual(rows);
  });

  it('resolves to empty for a CMS binding WITHOUT an api client (static publish)', async () => {
    await expect(
      resolveRepeatRows({ collectionSlug: 'urunler' }, undefined, null)
    ).resolves.toEqual([]);
  });

  it('swallows fetch errors as empty rows (a failing API must not crash render)', async () => {
    const fieldDef = {
      fetchList: async () => {
        throw new Error('boom');
      },
    };
    await expect(resolveRepeatRows({}, fieldDef)).resolves.toEqual([]);
  });

  it('returns empty for unrecognized source shapes', async () => {
    await expect(resolveRepeatRows('metin', undefined)).resolves.toEqual([]);
    await expect(resolveRepeatRows({ foo: 1 }, undefined)).resolves.toEqual([]);
  });
});

describe('peekRepeatRows + clearRepeatRowsCache', () => {
  it('peeks resolved rows synchronously and forgets them after a cache bust', async () => {
    const fieldDef = { fetchList: async () => rows };
    expect(peekRepeatRows({}, fieldDef)).toBeNull();
    await resolveRepeatRows({}, fieldDef);
    expect(peekRepeatRows({}, fieldDef)).toEqual(rows);
    clearRepeatRowsCache();
    expect(peekRepeatRows({}, fieldDef)).toBeNull();
  });

  it('peeks arrays directly', () => {
    expect(peekRepeatRows(rows, undefined)).toBe(rows);
  });
});
