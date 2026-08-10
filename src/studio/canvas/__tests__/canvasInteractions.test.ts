import { describe, it, expect } from 'vitest';
import { nodeIdFromEl, NODE_MARKER_CLASS, resolveClickTarget } from '../canvasInteractions';

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

describe('resolveClickTarget — outside-in click escalation', () => {
  // hero-1 ─ contentSlot ─ title-1 ─ inner ─ span-1
  //                      └ title-2 ─ inner ─ span-2
  // blog-1 (ikinci kök section)
  const doc = {
    root: { props: {} },
    content: [
      { type: 'Hero', props: { id: 'hero-1' } },
      { type: 'Blog', props: { id: 'blog-1' } },
    ],
    zones: {
      'hero-1:contentSlot': [
        { type: 'Title', props: { id: 'title-1' } },
        { type: 'Title', props: { id: 'title-2' } },
      ],
      'title-1:inner': [{ type: 'Span', props: { id: 'span-1' } }],
      'title-2:inner': [{ type: 'Span', props: { id: 'span-2' } }],
    },
  } as any;

  it('no selection → selects the outermost (root-level) ancestor', () => {
    expect(resolveClickTarget(doc, 'span-1', null)).toBe('hero-1');
  });

  it('clicking inside the selected node descends exactly one level', () => {
    expect(resolveClickTarget(doc, 'span-1', 'hero-1')).toBe('title-1');
    expect(resolveClickTarget(doc, 'span-1', 'title-1')).toBe('span-1');
  });

  it('clicking the already-selected innermost node keeps it selected', () => {
    expect(resolveClickTarget(doc, 'span-1', 'span-1')).toBe('span-1');
  });

  it('sibling subtree in the SAME section preserves the selection depth', () => {
    // title-1 seçiliyken (derinlik 1) span-2'ye tık → aynı derinlikteki title-2.
    expect(resolveClickTarget(doc, 'span-2', 'title-1')).toBe('title-2');
  });

  it('a different section resets to that section (outermost)', () => {
    expect(resolveClickTarget(doc, 'span-1', 'blog-1')).toBe('hero-1');
  });

  it('Alt+click bypasses escalation and selects the innermost node directly', () => {
    expect(resolveClickTarget(doc, 'span-1', null, true)).toBe('span-1');
    expect(resolveClickTarget(doc, 'span-1', 'hero-1', true)).toBe('span-1');
  });

  it('a root-level click target stays itself regardless of selection', () => {
    expect(resolveClickTarget(doc, 'hero-1', null)).toBe('hero-1');
    expect(resolveClickTarget(doc, 'hero-1', 'blog-1')).toBe('hero-1');
  });
});
