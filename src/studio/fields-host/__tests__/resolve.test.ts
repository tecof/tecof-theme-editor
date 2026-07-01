import { describe, it, expect } from 'vitest';
import { computeChanged, diffProps } from '../resolve';
import { deepEqual } from '../../../utils';

describe('computeChanged', () => {
  it('reports every next key as changed on first run (prev = null)', () => {
    expect(computeChanged(null, { a: 1, b: 2 })).toEqual({ a: true, b: true });
  });

  it('flags only the keys whose value differs', () => {
    const prev = { title: 'Hi', count: 3, nested: { x: 1 } };
    const next = { title: 'Hi', count: 4, nested: { x: 1 } };
    expect(computeChanged(prev, next)).toEqual({
      title: false,
      count: true,
      nested: false, // deep-equal object → unchanged
    });
  });

  it('includes removed keys as changed', () => {
    expect(computeChanged({ a: 1 }, {})).toEqual({ a: true });
  });
});

describe('diffProps', () => {
  it('returns only the props that differ from current', () => {
    const current = { title: 'A', slug: 'a' };
    const resolved = { slug: 'a-updated' };
    expect(diffProps(current, resolved)).toEqual({ slug: 'a-updated' });
  });

  it('is empty when resolved matches current (loop-guard convergence)', () => {
    const current = { title: 'A', slug: 'a', tags: ['x', 'y'] };
    const resolved = { slug: 'a', tags: ['x', 'y'] };
    expect(diffProps(current, resolved)).toEqual({});
  });

  it('second pass over already-derived props is a no-op', () => {
    const derive = (p: Record<string, any>) => ({ slug: p.title.toLowerCase() });
    let props: Record<string, any> = { title: 'HELLO', slug: '' };

    // First derive writes the diff.
    const d1 = diffProps(props, derive(props));
    expect(d1).toEqual({ slug: 'hello' });
    props = { ...props, ...d1 };

    // Second derive (same input) converges — nothing to write.
    const d2 = diffProps(props, derive(props));
    expect(d2).toEqual({});
  });
});

describe('deepEqual', () => {
  it('compares primitives, arrays and nested objects', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual('a', 'b')).toBe(false);
    expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
    expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEqual(null, undefined)).toBe(false);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
  });
});
