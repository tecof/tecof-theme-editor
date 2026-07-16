import { describe, it, expect } from 'vitest';
import {
  computeDropPosition,
  computeLayerDropPos,
  isValidTouchDrop,
  parseZoneAttr,
  resolveDraggedType,
  targetDropIndex,
} from '../touchDragModel';
import type { TecofDocument } from '../../../types';

const config: any = {
  components: {
    Section: { acceptsChildren: true, render: () => null },
    Column: { allowedParents: ['Section'], render: () => null },
    Text: { render: () => null },
  },
};

const doc: TecofDocument = {
  root: { props: {} },
  content: [
    { type: 'Section', props: { id: 'sec-1' } },
    { type: 'Text', props: { id: 'text-root' } },
  ],
  zones: {
    'sec-1:body': [
      { type: 'Column', props: { id: 'col-1' } },
      { type: 'Text', props: { id: 'text-1' } },
    ],
    'col-1:content': [],
  },
};

describe('parseZoneAttr', () => {
  it('maps the root marker and empty values to undefined', () => {
    expect(parseZoneAttr('root')).toBeUndefined();
    expect(parseZoneAttr(null)).toBeUndefined();
    expect(parseZoneAttr('')).toBeUndefined();
    expect(parseZoneAttr('sec-1:body')).toBe('sec-1:body');
  });
});

describe('computeDropPosition', () => {
  const rect = { left: 100, top: 200, width: 200, height: 100 };
  it('splits along the y axis for columns', () => {
    expect(computeDropPosition('y', rect, { x: 150, y: 210 })).toBe('before');
    expect(computeDropPosition('y', rect, { x: 150, y: 290 })).toBe('after');
  });
  it('splits along the x axis for rows', () => {
    expect(computeDropPosition('x', rect, { x: 120, y: 250 })).toBe('before');
    expect(computeDropPosition('x', rect, { x: 280, y: 250 })).toBe('after');
  });
});

describe('computeLayerDropPos', () => {
  const rect = { top: 100, height: 30 };

  it('splits rows without child zones into top/bottom halves', () => {
    expect(computeLayerDropPos(rect, 105, false)).toBe('top');
    expect(computeLayerDropPos(rect, 114, false)).toBe('top');
    expect(computeLayerDropPos(rect, 116, false)).toBe('bottom');
    expect(computeLayerDropPos(rect, 128, false)).toBe('bottom');
  });

  it('uses the middle third as "inside" for rows with child zones', () => {
    expect(computeLayerDropPos(rect, 105, true)).toBe('top');
    expect(computeLayerDropPos(rect, 115, true)).toBe('inside');
    expect(computeLayerDropPos(rect, 119, true)).toBe('inside');
    expect(computeLayerDropPos(rect, 128, true)).toBe('bottom');
  });
});

describe('resolveDraggedType', () => {
  it('returns the block type directly and resolves node ids from the doc', () => {
    expect(resolveDraggedType(doc, { kind: 'block', type: 'Text' })).toBe('Text');
    expect(resolveDraggedType(doc, { kind: 'node', nodeId: 'col-1' })).toBe('Column');
    expect(resolveDraggedType(doc, { kind: 'node', nodeId: 'yok' })).toBeNull();
  });
});

describe('isValidTouchDrop', () => {
  it('rejects dropping a node onto itself', () => {
    expect(
      isValidTouchDrop(config, doc, { kind: 'node', nodeId: 'text-1' }, 'sec-1:body', 'text-1')
    ).toBe(false);
  });

  it('rejects dropping a node into its own subtree', () => {
    expect(
      isValidTouchDrop(config, doc, { kind: 'node', nodeId: 'sec-1' }, 'sec-1:body')
    ).toBe(false);
    expect(
      isValidTouchDrop(config, doc, { kind: 'node', nodeId: 'sec-1' }, 'col-1:content')
    ).toBe(false);
  });

  it('enforces engine drop rules (allowedParents)', () => {
    // Column may only live inside Section zones — root is invalid.
    expect(isValidTouchDrop(config, doc, { kind: 'block', type: 'Column' }, undefined)).toBe(false);
    expect(isValidTouchDrop(config, doc, { kind: 'block', type: 'Column' }, 'sec-1:body')).toBe(
      true
    );
  });

  it('accepts ordinary moves and inserts', () => {
    expect(
      isValidTouchDrop(config, doc, { kind: 'node', nodeId: 'text-root' }, 'sec-1:body', 'col-1')
    ).toBe(true);
    expect(isValidTouchDrop(config, doc, { kind: 'block', type: 'Text' }, undefined)).toBe(true);
  });

  it('rejects unknown payload types', () => {
    expect(isValidTouchDrop(config, doc, { kind: 'node', nodeId: 'yok' }, undefined)).toBe(false);
  });
});

describe('targetDropIndex', () => {
  it('computes before/after halves for positional targets', () => {
    expect(targetDropIndex(doc, { zoneKey: 'sec-1:body', index: 1, position: 'before' })).toBe(1);
    expect(targetDropIndex(doc, { zoneKey: 'sec-1:body', index: 1, position: 'after' })).toBe(2);
  });

  it('appends at the end for container targets', () => {
    expect(targetDropIndex(doc, { zoneKey: 'sec-1:body' })).toBe(2);
    expect(targetDropIndex(doc, { zoneKey: 'col-1:content' })).toBe(0);
    expect(targetDropIndex(doc, { zoneKey: undefined })).toBe(2); // root content
  });
});
