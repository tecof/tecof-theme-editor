import { describe, it, expect } from 'vitest';
import { findNodeById, getParentId, getBreadcrumbs } from '../zones';
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
