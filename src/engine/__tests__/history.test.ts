import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../store';
import { createEmptyDocument } from '../document';

describe('Patch-based history', () => {
  beforeEach(() => {
    useEditorStore.getState().setDocument(createEmptyDocument());
  });

  it('stores patches (not full clones) per undo step', () => {
    const { insertNode } = useEditorStore.getState();
    insertNode({ type: 'Hero', props: { id: 'h1' } });

    const step = useEditorStore.getState().history.past[0] as any;
    expect(step).toBeDefined();
    expect(Array.isArray(step.patches)).toBe(true);
    expect(Array.isArray(step.inversePatches)).toBe(true);
    expect(step.patches.length).toBeGreaterThan(0);
    // A patch step must NOT be a full document clone.
    expect(step.content).toBeUndefined();
    expect(step.zones).toBeUndefined();
  });

  it('undoes and redoes via patches', () => {
    const { insertNode, undo, redo } = useEditorStore.getState();

    insertNode({ type: 'A', props: { id: 'a' } });
    insertNode({ type: 'B', props: { id: 'b' } });
    expect(useEditorStore.getState().document.content.map((n) => n.props.id)).toEqual(['a', 'b']);

    undo();
    expect(useEditorStore.getState().document.content.map((n) => n.props.id)).toEqual(['a']);

    undo();
    expect(useEditorStore.getState().document.content.length).toBe(0);

    redo();
    redo();
    expect(useEditorStore.getState().document.content.map((n) => n.props.id)).toEqual(['a', 'b']);
  });

  it('coalesces rapid prop edits to the same node into a single undo step', () => {
    const { insertNode, updateProps, undo } = useEditorStore.getState();

    insertNode({ type: 'Text', props: { id: 't1', text: '' } });
    const afterInsert = useEditorStore.getState().history.past.length;

    // Simulate a burst of keystrokes (within the 500ms window).
    updateProps('t1', { text: 'H' });
    updateProps('t1', { text: 'He' });
    updateProps('t1', { text: 'Hel' });
    updateProps('t1', { text: 'Hello' });

    // Only ONE extra history step should have been added for the whole burst.
    expect(useEditorStore.getState().history.past.length).toBe(afterInsert + 1);
    expect(useEditorStore.getState().document.content[0].props.text).toBe('Hello');

    // A single undo must revert the ENTIRE burst back to the original value.
    undo();
    expect(useEditorStore.getState().document.content[0].props.text).toBe('');
  });

  it('does not coalesce edits to different nodes', () => {
    const { insertNode, updateProps } = useEditorStore.getState();

    insertNode({ type: 'Text', props: { id: 't1', text: '' } });
    insertNode({ type: 'Text', props: { id: 't2', text: '' } });
    const base = useEditorStore.getState().history.past.length;

    updateProps('t1', { text: 'a' });
    updateProps('t2', { text: 'b' });

    expect(useEditorStore.getState().history.past.length).toBe(base + 2);
  });

  it('clears the redo stack on a new commit', () => {
    const { insertNode, undo } = useEditorStore.getState();

    insertNode({ type: 'A', props: { id: 'a' } });
    undo();
    expect(useEditorStore.getState().history.future.length).toBe(1);

    insertNode({ type: 'B', props: { id: 'b' } });
    expect(useEditorStore.getState().history.future.length).toBe(0);
  });

  it('caps the undo stack at the history limit', () => {
    const { insertNode } = useEditorStore.getState();
    for (let i = 0; i < 60; i++) {
      insertNode({ type: 'N', props: { id: `n-${i}` } });
    }
    expect(useEditorStore.getState().history.past.length).toBeLessThanOrEqual(50);
  });

  it('drops a stale selection after undo removes its node', () => {
    const { insertNode, selectNode, undo } = useEditorStore.getState();

    insertNode({ type: 'A', props: { id: 'a' } });
    selectNode('a');
    expect(useEditorStore.getState().selection.selectedId).toBe('a');

    undo(); // removes 'a'
    expect(useEditorStore.getState().selection.selectedId).toBeNull();
  });
});
