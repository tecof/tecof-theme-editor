import { describe, it, expect, beforeEach } from 'vitest';
import type { TecofDocument } from '../../types';
import { useEditorStore } from '../store';
import { findNodeById } from '../zones';
import {
  planSymbolSync,
  findSymbolRoot,
  findSymbolInstanceRoots,
  symbolRelativePath,
  resolveSymbolPath,
  symbolInfo,
} from '../symbols';

/**
 * Two instances (cardA, cardB) of symbol "sym1", each a Card with a Heading in
 * its `body` slot; cardC is a standalone Card (not a symbol).
 */
const makeDoc = (): TecofDocument => ({
  root: { props: {} },
  content: [
    { type: 'Card', props: { id: 'cardA', sharedComponentId: 'sym1', bg: 'white' } },
    { type: 'Card', props: { id: 'cardB', sharedComponentId: 'sym1', bg: 'white' } },
    { type: 'Card', props: { id: 'cardC', bg: 'white' } },
  ],
  zones: {
    'cardA:body': [{ type: 'Heading', props: { id: 'hA', text: 'Merhaba' } }],
    'cardB:body': [{ type: 'Heading', props: { id: 'hB', text: 'Merhaba' } }],
  },
});

const prop = (doc: TecofDocument, id: string, key: string) =>
  findNodeById(doc, id)?.node.props[key];

describe('symbol path helpers', () => {
  const doc = makeDoc();

  it('findSymbolRoot resolves from the root and from a descendant', () => {
    expect(findSymbolRoot(doc, 'cardA')).toEqual({ rootId: 'cardA', symbolId: 'sym1' });
    expect(findSymbolRoot(doc, 'hA')).toEqual({ rootId: 'cardA', symbolId: 'sym1' });
    expect(findSymbolRoot(doc, 'cardC')).toBeNull();
  });

  it('symbolRelativePath + resolveSymbolPath round-trip across instances', () => {
    const path = symbolRelativePath(doc, 'cardA', 'hA');
    expect(path).toEqual([{ slot: 'body', index: 0 }]);
    // The SAME path resolves to the sibling instance's corresponding node.
    expect(resolveSymbolPath(doc, 'cardB', path!)).toBe('hB');
    // Root path is empty and resolves to the instance root itself.
    expect(symbolRelativePath(doc, 'cardA', 'cardA')).toEqual([]);
    expect(resolveSymbolPath(doc, 'cardB', [])).toBe('cardB');
  });

  it('findSymbolInstanceRoots + symbolInfo count every instance', () => {
    expect(findSymbolInstanceRoots(doc, 'sym1').sort()).toEqual(['cardA', 'cardB']);
    expect(symbolInfo(doc, 'hA')).toEqual({ rootId: 'cardA', symbolId: 'sym1', instanceCount: 2 });
    expect(symbolInfo(doc, 'cardC')).toBeNull();
  });
});

describe('planSymbolSync', () => {
  it('mirrors a root-level edit onto sibling instances only', () => {
    const plan = planSymbolSync(makeDoc(), 'cardA', { bg: 'black' });
    expect(plan).toEqual([{ targetId: 'cardB', patch: { bg: 'black' } }]);
  });

  it('mirrors a descendant edit via structural path', () => {
    const plan = planSymbolSync(makeDoc(), 'hA', { text: 'Selam' });
    expect(plan).toEqual([{ targetId: 'hB', patch: { text: 'Selam' } }]);
  });

  it('does not propagate a key the SOURCE overrides', () => {
    const doc = makeDoc();
    findNodeById(doc, 'cardA')!.node.props._symbolOverrides = ['bg'];
    expect(planSymbolSync(doc, 'cardA', { bg: 'black' })).toEqual([]);
  });

  it('skips a TARGET that overrides the key', () => {
    const doc = makeDoc();
    findNodeById(doc, 'cardB')!.node.props._symbolOverrides = ['bg'];
    expect(planSymbolSync(doc, 'cardA', { bg: 'black' })).toEqual([]);
  });

  it('never propagates meta keys (id / link / overrides)', () => {
    const plan = planSymbolSync(makeDoc(), 'cardA', {
      id: 'nope',
      sharedComponentId: 'other',
      _symbolOverrides: ['x'],
      bg: 'black',
    });
    expect(plan).toEqual([{ targetId: 'cardB', patch: { bg: 'black' } }]);
  });

  it('returns nothing for a node outside any symbol', () => {
    expect(planSymbolSync(makeDoc(), 'cardC', { bg: 'black' })).toEqual([]);
  });

  it('skips a diverged instance whose node type differs at the path', () => {
    const doc = makeDoc();
    doc.zones['cardB:body'][0] = { type: 'Image', props: { id: 'imgB' } };
    expect(planSymbolSync(doc, 'hA', { text: 'X' })).toEqual([]);
  });
});

describe('store: symbol sync is live and undoable', () => {
  beforeEach(() => {
    useEditorStore.getState().setDocument(makeDoc());
  });

  it('edits to one instance mirror to the others (not to standalone nodes)', () => {
    useEditorStore.getState().updateProps('cardA', { bg: 'black' });
    const doc = useEditorStore.getState().document;
    expect(prop(doc, 'cardA', 'bg')).toBe('black');
    expect(prop(doc, 'cardB', 'bg')).toBe('black'); // synced
    expect(prop(doc, 'cardC', 'bg')).toBe('white'); // untouched
  });

  it('syncs descendant edits through the structural path', () => {
    useEditorStore.getState().updateProps('hA', { text: 'Selam' });
    const doc = useEditorStore.getState().document;
    expect(prop(doc, 'hA', 'text')).toBe('Selam');
    expect(prop(doc, 'hB', 'text')).toBe('Selam');
  });

  it('a single undo reverts the source AND every synced instance', () => {
    useEditorStore.getState().updateProps('cardA', { bg: 'black' });
    useEditorStore.getState().undo();
    const doc = useEditorStore.getState().document;
    expect(prop(doc, 'cardA', 'bg')).toBe('white');
    expect(prop(doc, 'cardB', 'bg')).toBe('white');
  });

  it('an overridden field stays instance-local, then re-links on toggle-off', () => {
    const s = useEditorStore.getState();
    s.toggleSymbolOverride('cardB', 'bg'); // pin cardB.bg
    s.updateProps('cardA', { bg: 'black' });
    expect(prop(useEditorStore.getState().document, 'cardB', 'bg')).toBe('white'); // not synced

    // Re-link: cardB.bg snaps back to the symbol's current value (from cardA).
    useEditorStore.getState().toggleSymbolOverride('cardB', 'bg');
    expect(prop(useEditorStore.getState().document, 'cardB', 'bg')).toBe('black');
  });
});
