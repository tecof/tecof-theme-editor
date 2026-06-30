import { describe, it, expect } from 'vitest';
import { canDropInto, canAcceptMoreItems, isValidDrop } from '../rules';
import type { TecofDocument } from '../../types';

const doc: TecofDocument = {
  root: { props: {} },
  content: [
    { type: 'Container', props: { id: 'c1' } },
    { type: 'Row', props: { id: 'r1' } },
  ],
  zones: {
    'c1:content': [
      { type: 'Button', props: { id: 'b1' } },
      { type: 'Button', props: { id: 'b2' } },
    ],
    'r1:items': [],
  },
};

describe('canDropInto', () => {
  it('is permissive when no constraints are declared', () => {
    const config = { components: { Container: {}, Button: {} } };
    expect(canDropInto(config, 'Button', 'c1:content', doc)).toBe(true);
    expect(canDropInto(config, 'Button', undefined, doc)).toBe(true);
    expect(canDropInto({}, 'Button', 'c1:content', doc)).toBe(true);
  });

  it('honors acceptsChildren as a boolean', () => {
    const config = { components: { Container: { acceptsChildren: false }, Button: {} } };
    expect(canDropInto(config, 'Button', 'c1:content', doc)).toBe(false);
  });

  it('honors acceptsChildren as a type allowlist', () => {
    const config = {
      components: {
        Container: { acceptsChildren: ['Button'] },
        Button: {},
        Image: {},
      },
    };
    expect(canDropInto(config, 'Button', 'c1:content', doc)).toBe(true);
    expect(canDropInto(config, 'Image', 'c1:content', doc)).toBe(false);
  });

  it('honors per-slot acceptsChildren', () => {
    const config = {
      components: {
        Container: { acceptsChildren: { content: ['Button'], header: false } },
        Button: {},
      },
    };
    expect(canDropInto(config, 'Button', 'c1:content', doc)).toBe(true);
    // header slot has its own (denied) rule; use a parent with that slot.
    const doc2: TecofDocument = {
      root: { props: {} },
      content: [{ type: 'Container', props: { id: 'k1' } }],
      zones: { 'k1:header': [] },
    };
    expect(canDropInto(config, 'Button', 'k1:header', doc2)).toBe(false);
  });

  it('honors child allowedParents', () => {
    const config = {
      components: {
        Container: {},
        Row: {},
        Button: { allowedParents: ['Row'] },
      },
    };
    // Button only allowed inside Row.
    expect(canDropInto(config, 'Button', 'r1:items', doc)).toBe(true);
    expect(canDropInto(config, 'Button', 'c1:content', doc)).toBe(false);
    // And not at the root either.
    expect(canDropInto(config, 'Button', undefined, doc)).toBe(false);
  });
});

describe('canAcceptMoreItems', () => {
  it('is permissive when no maxItems is declared', () => {
    const config = { components: { Container: {} } };
    expect(canAcceptMoreItems(config, 'c1:content', doc)).toBe(true);
  });

  it('always allows the root content array', () => {
    expect(canAcceptMoreItems({ components: {} }, undefined, doc)).toBe(true);
  });

  it('enforces a flat maxItems cap', () => {
    const config = { components: { Container: { maxItems: 2 } } };
    // c1:content already has 2 items.
    expect(canAcceptMoreItems(config, 'c1:content', doc)).toBe(false);
    // r1:items has 0; but Row has no cap.
    expect(canAcceptMoreItems({ components: { Row: { maxItems: 1 } } }, 'r1:items', doc)).toBe(true);
  });

  it('enforces a per-slot maxItems cap', () => {
    const config = { components: { Container: { maxItems: { content: 2 } } } };
    expect(canAcceptMoreItems(config, 'c1:content', doc)).toBe(false);
  });
});

describe('isValidDrop', () => {
  it('requires both acceptance and room', () => {
    const config = {
      components: { Container: { acceptsChildren: ['Button'], maxItems: 2 }, Button: {} },
    };
    // Accepted type but the slot is full.
    expect(isValidDrop(config, 'Button', 'c1:content', doc)).toBe(false);
    // Empty slot with room (different parent w/o cap).
    expect(isValidDrop({ components: {} }, 'Button', 'r1:items', doc)).toBe(true);
  });
});
