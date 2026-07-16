import { useEffect, useState } from 'react';
import { useTecofOptional } from './TecofProvider';
import type { TecofApiClient } from '../api';

/**
 * Repeat-zone row resolution — turns whatever a `repeatSource` prop holds into
 * the actual data rows the zone loops over:
 *
 *   1. an ARRAY (RepeaterField rows, resolveData output) → used as-is, sync;
 *   2. an api-list value + a source field declaring `fetchList`
 *      (`createApiListField`) → fetched through the host's own function;
 *   3. a CMS collection binding (`createCmsCollectionField` value with
 *      `collectionSlug`) → fetched via the TecofProvider API client.
 *
 * Async results are cached per parameter set for the session (module-level),
 * with in-flight de-duplication so N canvas nodes / published cards trigger ONE
 * request. `clearRepeatRowsCache()` busts the cache and re-renders subscribers
 * (the ApiListField's refresh button uses it).
 *
 * CMS resolution needs a `<TecofProvider>`; without one (fully static publish)
 * it resolves to no rows — pass `repeatItems` to `puck.renderDropZone` yourself
 * in that setup.
 */

/** Minimal shape of a source FIELD DEF that can feed a repeat zone. */
export interface RepeatSourceFieldDef {
  fetchList?: (params: { query?: string; limit?: number }) => Promise<unknown[]>;
  [key: string]: any;
}

interface ApiListValue {
  query?: string;
  limit?: number;
}

interface CmsCollectionValue {
  collectionSlug: string;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'custom';
}

const isCmsCollectionValue = (value: unknown): value is CmsCollectionValue =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as CmsCollectionValue).collectionSlug === 'string' &&
  (value as CmsCollectionValue).collectionSlug.length > 0;

/* ── Session cache + tiny subscription store ── */

const cache = new Map<string, unknown[]>();
const inflight = new Map<string, Promise<unknown[]>>();
let version = 0;
const listeners = new Set<() => void>();

const notify = () => {
  version += 1;
  listeners.forEach((fn) => fn());
};

/** Busts the resolved-rows cache and re-renders every repeat zone using it. */
export const clearRepeatRowsCache = () => {
  cache.clear();
  inflight.clear();
  notify();
};

/**
 * Re-render tick that fires whenever ANY repeat-rows fetch lands or the cache
 * is busted — for consumers that only PEEK the cache (e.g. the inspector's
 * binding-schema inference) and would otherwise miss the async arrival.
 */
export const useRepeatRowsTick = (): number => {
  const [tick, setTick] = useState(version);
  useEffect(() => {
    const onChange = () => setTick(version);
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);
  return tick;
};

/** Sync cache peek — lets the inspector infer a binding schema from row 0
 * once the canvas has fetched, without re-fetching or going async itself. */
export const peekRepeatRows = (
  value: unknown,
  sourceFieldDef: RepeatSourceFieldDef | undefined
): unknown[] | null => {
  if (Array.isArray(value)) return value;
  const key = cacheKeyFor(value, sourceFieldDef);
  return key ? (cache.get(key) ?? null) : null;
};

const cacheKeyFor = (
  value: unknown,
  sourceFieldDef: RepeatSourceFieldDef | undefined
): string | null => {
  if (sourceFieldDef?.fetchList) {
    const v = (value ?? {}) as ApiListValue;
    return `api:${v.query ?? ''}:${v.limit ?? ''}`;
  }
  if (isCmsCollectionValue(value)) {
    return `cms:${value.collectionSlug}:${value.limit ?? ''}:${value.sort ?? ''}`;
  }
  return null;
};

/**
 * Promise form of the resolver — the same cache/de-dupe the hook uses. Also
 * handy for hosts that want to pre-resolve rows outside React (e.g. warming
 * the cache before an SSR hydration pass).
 */
export const resolveRepeatRows = async (
  value: unknown,
  sourceFieldDef: RepeatSourceFieldDef | undefined,
  apiClient?: TecofApiClient | null
): Promise<unknown[]> => {
  if (Array.isArray(value)) return value;
  const key = cacheKeyFor(value, sourceFieldDef);
  if (!key) return [];
  return fetchRows(key, value, sourceFieldDef, apiClient ?? null);
};

const fetchRows = async (
  key: string,
  value: unknown,
  sourceFieldDef: RepeatSourceFieldDef | undefined,
  apiClient: TecofApiClient | null
): Promise<unknown[]> => {
  const cached = cache.get(key);
  if (cached) return cached;
  const pending = inflight.get(key);
  if (pending) return pending;

  const run = (async (): Promise<unknown[]> => {
    if (sourceFieldDef?.fetchList) {
      const v = (value ?? {}) as ApiListValue;
      const rows = await sourceFieldDef.fetchList({ query: v.query, limit: v.limit });
      return Array.isArray(rows) ? rows : [];
    }
    if (isCmsCollectionValue(value) && apiClient) {
      const res = await apiClient.getCmsCollectionItems(value.collectionSlug, {
        limit: value.limit,
        sort: value.sort,
      });
      const data = res?.success ? res.data : null;
      const items = Array.isArray(data) ? data : (data?.items ?? []);
      return Array.isArray(items) ? items : [];
    }
    return [];
  })()
    .then((rows) => {
      cache.set(key, rows);
      // Peek-only consumers (inspector schema inference) learn about the
      // arrival through the tick; hooks awaiting THIS fetch resolve directly.
      notify();
      return rows;
    })
    .catch(() => [] as unknown[])
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, run);
  return run;
};

/**
 * Resolves a repeat slot's rows. Arrays return synchronously (reference-stable);
 * async sources return `[]` until the fetch lands, then the real rows.
 */
export const useRepeatRows = (
  value: unknown,
  sourceFieldDef: RepeatSourceFieldDef | undefined
): unknown[] => {
  const tecof = useTecofOptional();
  const apiClient = tecof?.apiClient ?? null;

  const key = Array.isArray(value) ? null : cacheKeyFor(value, sourceFieldDef);
  const [resolved, setResolved] = useState<{ key: string; rows: unknown[] } | null>(() =>
    key && cache.has(key) ? { key, rows: cache.get(key)! } : null
  );
  // Cache bust (clearRepeatRowsCache) re-runs the fetch effect below.
  const [cacheVersion, setCacheVersion] = useState(version);

  useEffect(() => {
    const onBust = () => setCacheVersion(version);
    listeners.add(onBust);
    return () => {
      listeners.delete(onBust);
    };
  }, []);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetchRows(key, value, sourceFieldDef, apiClient).then((rows) => {
      if (!cancelled) setResolved({ key, rows });
    });
    return () => {
      cancelled = true;
    };
    // `key` encodes every fetch parameter read from `value`/`sourceFieldDef`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, apiClient, cacheVersion]);

  if (Array.isArray(value)) return value;
  if (!key) return EMPTY_ROWS;
  return resolved && resolved.key === key ? resolved.rows : EMPTY_ROWS;
};

const EMPTY_ROWS: unknown[] = [];
