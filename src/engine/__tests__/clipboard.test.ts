import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../store';
import { createEmptyDocument } from '../document';

// A simple localStorage shim so the cross-tab mirror is exercised in tests
// (vitest's default environment has no DOM storage).
const installLocalStorageShim = () => {
  const map = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => void map.clear(),
  };
  return map;
};

describe('Clipboard (copy / cut / paste)', () => {
  beforeEach(() => {
    installLocalStorageShim();
    useEditorStore.getState().setDocument(createEmptyDocument());
    // Reset clipboard between tests (it is non-history state).
    useEditorStore.setState((s) => ({ ...s, clipboard: null }));
  });

  it('copies a node + its subtree zones and pastes a deep copy with fresh ids', () => {
    const { insertNode, copyNode, pasteClipboard } = useEditorStore.getState();

    insertNode({ type: 'Container', props: { id: 'c1' } });
    insertNode({ type: 'Button', props: { id: 'b1', label: 'Hi' } }, 'c1:content');

    copyNode('c1');
    pasteClipboard(); // nothing selected -> default target resolves to selection

    const doc = useEditorStore.getState().document;
    // Original + pasted copy at root.
    expect(doc.content.length).toBe(2);

    const copy = doc.content[1];
    expect(copy.type).toBe('Container');
    expect(copy.props.id).not.toBe('c1'); // fresh id

    // Subtree zone copied with a fresh child id, value preserved.
    const copyZoneKey = `${copy.props.id}:content`;
    expect(doc.zones[copyZoneKey]).toBeDefined();
    expect(doc.zones[copyZoneKey].length).toBe(1);
    expect(doc.zones[copyZoneKey][0].props.id).not.toBe('b1');
    expect(doc.zones[copyZoneKey][0].props.label).toBe('Hi');

    // Original is untouched.
    expect(doc.zones['c1:content'][0].props.id).toBe('b1');
  });

  it('pasting twice does not collide on ids', () => {
    const { insertNode, copyNode, pasteClipboard } = useEditorStore.getState();
    insertNode({ type: 'Box', props: { id: 'x1' } });

    copyNode('x1');
    pasteClipboard();
    pasteClipboard();

    const ids = useEditorStore.getState().document.content.map((n) => n.props.id);
    expect(new Set(ids).size).toBe(ids.length); // all unique
    expect(ids.length).toBe(3);
  });

  it('selects the newly pasted node', () => {
    const { insertNode, copyNode, pasteClipboard } = useEditorStore.getState();
    insertNode({ type: 'Box', props: { id: 'x1' } });

    copyNode('x1');
    pasteClipboard();

    const { selection, document } = useEditorStore.getState();
    const pastedId = document.content[document.content.length - 1].props.id;
    expect(selection.selectedId).toBe(pastedId);
    expect(selection.selectedIds).toEqual([pastedId]);
  });

  it('pastes right AFTER the primary selection in its own list', () => {
    const { insertNode, selectNode, copyNode, pasteClipboard } = useEditorStore.getState();
    insertNode({ type: 'A', props: { id: 'a' } });
    insertNode({ type: 'B', props: { id: 'b' } });
    insertNode({ type: 'C', props: { id: 'c' } });

    copyNode('a');
    selectNode('b'); // primary is b
    pasteClipboard();

    const ids = useEditorStore.getState().document.content.map((n) => n.props.id);
    // Copy of A inserted right after B (index 2).
    expect(ids[0]).toBe('a');
    expect(ids[1]).toBe('b');
    expect(ids[3]).toBe('c');
    expect(ids.length).toBe(4);
  });

  it('cuts = copy + remove, as a single undo step', () => {
    const { insertNode, cutNode, undo } = useEditorStore.getState();
    insertNode({ type: 'A', props: { id: 'a' } });
    insertNode({ type: 'B', props: { id: 'b' } });
    const baseHistory = useEditorStore.getState().history.past.length;

    cutNode('a');
    expect(useEditorStore.getState().document.content.map((n) => n.props.id)).toEqual(['b']);
    // Exactly one new history step for the cut.
    expect(useEditorStore.getState().history.past.length).toBe(baseHistory + 1);

    undo();
    expect(useEditorStore.getState().document.content.map((n) => n.props.id)).toEqual(['a', 'b']);
  });

  it('cut then paste re-inserts a fresh-id deep copy', () => {
    const { insertNode, cutNode, pasteClipboard } = useEditorStore.getState();
    insertNode({ type: 'Box', props: { id: 'x1' } });

    cutNode('x1');
    expect(useEditorStore.getState().document.content.length).toBe(0);

    pasteClipboard();
    const doc = useEditorStore.getState().document;
    expect(doc.content.length).toBe(1);
    expect(doc.content[0].props.id).not.toBe('x1');
  });

  it('falls back to the localStorage mirror when in-memory clipboard is empty', () => {
    const { insertNode, copyNode, pasteClipboard } = useEditorStore.getState();
    insertNode({ type: 'Box', props: { id: 'x1' } });
    copyNode('x1');

    // Simulate a different page/tab: clear in-memory clipboard but keep storage.
    useEditorStore.setState((s) => ({ ...s, clipboard: null }));

    pasteClipboard();
    expect(useEditorStore.getState().document.content.length).toBe(2);
  });

  it('paste is a no-op (no history entry) when clipboard is empty', () => {
    const { pasteClipboard } = useEditorStore.getState();
    const base = useEditorStore.getState().history.past.length;
    pasteClipboard();
    expect(useEditorStore.getState().history.past.length).toBe(base);
    expect(useEditorStore.getState().document.content.length).toBe(0);
  });
});
