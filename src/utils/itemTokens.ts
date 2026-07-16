import type { ItemSchemaField } from '../types';

/**
 * `{{ item.<path> }}` token resolution for repeat-zone templates.
 *
 * A repeat zone renders its children once per data row; before each render the
 * node's props are passed through {@link resolveItemTokens} with that row. Two
 * substitution modes:
 *
 * - A prop that IS a single token (`"{{ item.image }}"`) resolves to the raw
 *   value at that path — objects (uploaded files, links) pass through intact.
 * - Tokens embedded in longer text (`"Fiyat: {{ item.price }} TL"`) interpolate
 *   as strings; missing/object values become the empty string.
 *
 * Special paths: `_index` (0-based row index) and `_position` (1-based).
 */

const WHOLE_TOKEN_RE = /^\{\{\s*item\.([\w$-]+(?:\.[\w$-]+)*)\s*\}\}$/;
const EMBEDDED_TOKEN_RE = /\{\{\s*item\.([\w$-]+(?:\.[\w$-]+)*)\s*\}\}/g;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

/** Reads a dot path off a row object; `_index`/`_position` come from the loop. */
export const getItemTokenValue = (item: unknown, path: string, index: number): unknown => {
  if (path === '_index') return index;
  if (path === '_position') return index + 1;
  return path
    .split('.')
    .reduce<unknown>(
      (acc, key) => (acc == null ? undefined : (acc as Record<string, unknown>)[key]),
      item
    );
};

/**
 * Deeply resolves `{{ item.* }}` tokens in a prop value (string / array / plain
 * object) against one data row. Reference-preserving: branches without tokens
 * return the original value, so untouched props keep their identity.
 */
export const resolveItemTokens = <T>(value: T, item: unknown, index: number): T => {
  if (typeof value === 'string') {
    if (!value.includes('{{')) return value;
    const whole = value.match(WHOLE_TOKEN_RE);
    if (whole) return getItemTokenValue(item, whole[1], index) as T;
    return value.replace(EMBEDDED_TOKEN_RE, (_, path: string) => {
      const resolved = getItemTokenValue(item, path, index);
      return resolved == null || typeof resolved === 'object' ? '' : String(resolved);
    }) as T;
  }

  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((entry) => {
      const resolved = resolveItemTokens(entry, item, index);
      if (resolved !== entry) changed = true;
      return resolved;
    });
    return (changed ? next : value) as T;
  }

  if (isPlainObject(value)) {
    let changed = false;
    const next: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      const resolved = resolveItemTokens(entry, item, index);
      next[key] = resolved;
      if (resolved !== entry) changed = true;
    }
    return (changed ? next : value) as T;
  }

  return value;
};

/** Loose type hint for the binding popover's meta column. */
const guessFieldType = (value: unknown): string => {
  if (isPlainObject(value)) {
    const v = value as Record<string, unknown>;
    if (typeof v.url === 'string' || v.meta != null || (typeof v.name === 'string' && typeof v.type === 'string')) {
      return 'image';
    }
    return 'object';
  }
  if (Array.isArray(value)) return 'list';
  return 'text';
};

/**
 * Infers the bindable item schema from a sample row (typically the first row of
 * a repeat source). Top-level keys only; `_`-prefixed keys are internal and
 * skipped. Hosts can override the result with an explicit `itemSchema`.
 */
export const inferItemSchema = (sample: unknown): ItemSchemaField[] => {
  if (!isPlainObject(sample)) return [];
  return Object.entries(sample)
    .filter(([key]) => !key.startsWith('_'))
    .map(([key, value]) => ({ key, type: guessFieldType(value) }));
};
