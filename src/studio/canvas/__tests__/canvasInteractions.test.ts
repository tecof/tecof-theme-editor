import { describe, it, expect } from 'vitest';
import { nodeIdFromEl, NODE_MARKER_CLASS } from '../canvasInteractions';

describe('nodeIdFromEl', () => {
  it('reads the node id from the tecof-node-<id> marker class', () => {
    expect(nodeIdFromEl({ classList: ['tecof-el', 'tecof-node-Hero-1', 'p-4'] })).toBe('Hero-1');
  });

  it('handles ids that themselves contain hyphens', () => {
    expect(nodeIdFromEl({ classList: ['tecof-node-Card-a1b2c3'] })).toBe('Card-a1b2c3');
  });

  it('returns null when there is no id marker (e.g. the bare anchor class)', () => {
    expect(nodeIdFromEl({ classList: ['p-4', 'tecof-el'] })).toBeNull();
  });

  it('returns null for a null element', () => {
    expect(nodeIdFromEl(null)).toBeNull();
  });

  it('anchor class is tecof-el', () => {
    expect(NODE_MARKER_CLASS).toBe('tecof-el');
  });
});
