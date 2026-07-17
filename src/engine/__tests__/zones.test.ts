import { describe, it, expect } from 'vitest';
import { findNodeById, getParentId, getBreadcrumbs, getDescendants } from '../zones';
import type { TecofDocument } from '../../types';

const makeDoc = (): TecofDocument => ({
  root: { props: {} },
  content: [
    { type: 'Container', props: { id: 'c1' } },
    { type: 'Section', props: { id: 's1' } },
  ],
  zones: {
    'c1:content': [{ type: 'Row', props: { id: 'r1' } }],
    'r1:items': [{ type: 'Button', props: { id: 'b1' } }],
  },
});

describe('findNodeById (cached index)', () => {
  it('finds nodes in root content and nested zones', () => {
    const doc = makeDoc();
    expect(findNodeById(doc, 'c1')).toEqual({ node: doc.content[0], path: { index: 0 } });
    expect(findNodeById(doc, 's1')).toEqual({ node: doc.content[1], path: { index: 1 } });
    expect(findNodeById(doc, 'r1')).toEqual({
      node: doc.zones['c1:content'][0],
      path: { zoneKey: 'c1:content', index: 0 },
    });
    expect(findNodeById(doc, 'b1')).toEqual({
      node: doc.zones['r1:items'][0],
      path: { zoneKey: 'r1:items', index: 0 },
    });
  });

  it('returns null for unknown ids', () => {
    expect(findNodeById(makeDoc(), 'nope')).toBeNull();
  });

  it('returns identical results across repeated calls (cache hit)', () => {
    const doc = makeDoc();
    const first = findNodeById(doc, 'b1');
    const second = findNodeById(doc, 'b1');
    // Same node reference and same resolved path.
    expect(second!.node).toBe(first!.node);
    expect(second).toEqual(first);
  });

  it('reflects a different document version (new object => new index)', () => {
    const docA = makeDoc();
    expect(findNodeById(docA, 'c1')).not.toBeNull();

    // A brand-new document object (as immer would produce) has its own index.
    const docB: TecofDocument = {
      root: { props: {} },
      content: [{ type: 'Hero', props: { id: 'x1' } }],
      zones: {},
    };
    expect(findNodeById(docB, 'c1')).toBeNull();
    expect(findNodeById(docB, 'x1')).not.toBeNull();
  });

  it('flattens a subtree depth-first with depths (getDescendants)', () => {
    const doc = makeDoc();
    // Container c1 -> Row r1 (depth 1) -> Button b1 (depth 2).
    expect(getDescendants(doc, 'c1')).toEqual([
      { id: 'r1', node: doc.zones['c1:content'][0], depth: 1 },
      { id: 'b1', node: doc.zones['r1:items'][0], depth: 2 },
    ]);
    // Leaf / childless nodes yield an empty list.
    expect(getDescendants(doc, 'b1')).toEqual([]);
    expect(getDescendants(doc, 's1')).toEqual([]);
  });

  it('orders sibling slots by field declaration, not zones-key order (getDescendants)', () => {
    // Zones record key order drifts over time (move/undo/paste re-create keys
    // at the END) — with a config the declared slot order must win.
    const doc: TecofDocument = {
      root: { props: {} },
      content: [{ type: 'Hero', props: { id: 'h1' } }],
      zones: {
        // Deliberately "wrong" record order: bottomSlot key was re-created last
        // in real life but appears FIRST here.
        'h1:bottomSlot': [{ type: 'Text', props: { id: 'bottom-child' } }],
        'h1:topSlot': [{ type: 'Text', props: { id: 'top-child' } }],
      },
    };
    const config = {
      components: {
        Hero: {
          fields: {
            title: { type: 'text' },
            topSlot: { type: 'slot' },
            bottomSlot: { type: 'slot' },
          },
        },
      },
    };
    expect(getDescendants(doc, 'h1', config).map((d) => d.id)).toEqual([
      'top-child',
      'bottom-child',
    ]);
    // Without a config the record order is the only signal (backwards compat).
    expect(getDescendants(doc, 'h1').map((d) => d.id)).toEqual(['bottom-child', 'top-child']);
    // Zones not declared as slot fields still show up (appended, record order).
    const legacyDoc: TecofDocument = {
      ...doc,
      zones: { ...doc.zones, 'h1:legacyZone': [{ type: 'Text', props: { id: 'legacy-child' } }] },
    };
    expect(getDescendants(legacyDoc, 'h1', config).map((d) => d.id)).toEqual([
      'top-child',
      'bottom-child',
      'legacy-child',
    ]);
  });

  it('does not leak across id-prefix collisions (getDescendants)', () => {
    // `p1` must not pick up `p10:*` zones — the trailing colon guards this.
    const doc: TecofDocument = {
      root: { props: {} },
      content: [
        { type: 'Box', props: { id: 'p1' } },
        { type: 'Box', props: { id: 'p10' } },
      ],
      zones: {
        'p1:content': [{ type: 'Text', props: { id: 't1' } }],
        'p10:content': [{ type: 'Text', props: { id: 't10' } }],
      },
    };
    expect(getDescendants(doc, 'p1')).toEqual([
      { id: 't1', node: doc.zones['p1:content'][0], depth: 1 },
    ]);
  });

  it('keeps getParentId / getBreadcrumbs working', () => {
    const doc = makeDoc();
    expect(getParentId(doc, 'c1')).toBeNull();
    expect(getParentId(doc, 'r1')).toBe('c1');
    expect(getParentId(doc, 'b1')).toBe('r1');

    expect(getBreadcrumbs(doc, 'b1')).toEqual([
      { id: 'c1', type: 'Container' },
      { id: 'r1', type: 'Row' },
      { id: 'b1', type: 'Button' },
    ]);
  });
});
