import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../store';
import { createEmptyDocument } from '../document';

describe('Multi-select', () => {
  beforeEach(() => {
    useEditorStore.getState().setDocument(createEmptyDocument());
  });

  describe('selection model (selectedId vs selectedIds)', () => {
    it('selectNode keeps primary and set in lockstep', () => {
      const { selectNode } = useEditorStore.getState();

      selectNode('a');
      expect(useEditorStore.getState().selection.selectedId).toBe('a');
      expect(useEditorStore.getState().selection.selectedIds).toEqual(['a']);

      selectNode(null);
      expect(useEditorStore.getState().selection.selectedId).toBeNull();
      expect(useEditorStore.getState().selection.selectedIds).toEqual([]);
    });

    it('toggleSelect adds, sets new primary, and removes', () => {
      const { selectNode, toggleSelect } = useEditorStore.getState();

      selectNode('a');
      toggleSelect('b');
      expect(useEditorStore.getState().selection.selectedIds).toEqual(['a', 'b']);
      expect(useEditorStore.getState().selection.selectedId).toBe('b'); // anchor

      // Toggle 'b' off -> primary falls back to last remaining ('a').
      toggleSelect('b');
      expect(useEditorStore.getState().selection.selectedIds).toEqual(['a']);
      expect(useEditorStore.getState().selection.selectedId).toBe('a');

      // Toggle last one off -> empty selection.
      toggleSelect('a');
      expect(useEditorStore.getState().selection.selectedIds).toEqual([]);
      expect(useEditorStore.getState().selection.selectedId).toBeNull();
    });

    it('setSelection replaces the set and picks the last as primary', () => {
      const { setSelection } = useEditorStore.getState();
      setSelection(['x', 'y', 'z']);
      expect(useEditorStore.getState().selection.selectedIds).toEqual(['x', 'y', 'z']);
      expect(useEditorStore.getState().selection.selectedId).toBe('z');
    });
  });

  describe('bulk remove / duplicate', () => {
    it('removeNodes deletes all in one undo step and prunes selection', () => {
      const { insertNode, setSelection, removeNodes, undo } = useEditorStore.getState();
      insertNode({ type: 'A', props: { id: 'a' } });
      insertNode({ type: 'B', props: { id: 'b' } });
      insertNode({ type: 'C', props: { id: 'c' } });

      setSelection(['a', 'c']);
      const base = useEditorStore.getState().history.past.length;
      removeNodes(); // defaults to current selection

      let doc = useEditorStore.getState().document;
      expect(doc.content.map((n) => n.props.id)).toEqual(['b']);
      // One history step for the whole bulk delete.
      expect(useEditorStore.getState().history.past.length).toBe(base + 1);
      // Selection pruned.
      expect(useEditorStore.getState().selection.selectedIds).toEqual([]);
      expect(useEditorStore.getState().selection.selectedId).toBeNull();

      undo();
      doc = useEditorStore.getState().document;
      expect(doc.content.map((n) => n.props.id)).toEqual(['a', 'b', 'c']);
    });

    it('duplicateNodes copies all in one undo step and selects the copies', () => {
      const { insertNode, setSelection, duplicateNodes, undo } = useEditorStore.getState();
      insertNode({ type: 'A', props: { id: 'a' } });
      insertNode({ type: 'B', props: { id: 'b' } });

      setSelection(['a', 'b']);
      const base = useEditorStore.getState().history.past.length;
      duplicateNodes();

      const doc = useEditorStore.getState().document;
      expect(doc.content.length).toBe(4);
      expect(useEditorStore.getState().history.past.length).toBe(base + 1);

      // New ids selected (and distinct from originals).
      const sel = useEditorStore.getState().selection.selectedIds;
      expect(sel.length).toBe(2);
      expect(sel).not.toContain('a');
      expect(sel).not.toContain('b');

      undo();
      expect(useEditorStore.getState().document.content.length).toBe(2);
    });
  });

  describe('validateSelection pruning after undo/redo', () => {
    it('prunes selectedIds AND selectedId of vanished nodes', () => {
      const { insertNode, setSelection, undo } = useEditorStore.getState();
      insertNode({ type: 'A', props: { id: 'a' } });
      insertNode({ type: 'B', props: { id: 'b' } });

      setSelection(['a', 'b']); // primary = b
      undo(); // undoes insert of 'b' -> 'b' disappears

      const sel = useEditorStore.getState().selection;
      expect(sel.selectedIds).toEqual(['a']);
      // Primary 'b' is gone -> falls back to last surviving id 'a'.
      expect(sel.selectedId).toBe('a');
    });

    it('clears selection entirely when all selected nodes vanish', () => {
      const { insertNode, selectNode, undo } = useEditorStore.getState();
      insertNode({ type: 'A', props: { id: 'a' } });
      selectNode('a');

      undo(); // removes 'a'
      const sel = useEditorStore.getState().selection;
      expect(sel.selectedIds).toEqual([]);
      expect(sel.selectedId).toBeNull();
    });
  });
});
