import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../store';
import { createEmptyDocument } from '../document';
import { getDescendantZoneKeys } from '../zones';

describe('Clipboard (copy / cut / paste)', () => {
  beforeEach(() => {
    useEditorStore.getState().setDocument(createEmptyDocument());
  });

  it('starts with an empty clipboard', () => {
    expect(useEditorStore.getState().clipboard).toBeNull();
  });

  it('copies a node + its descendant zones with fresh ids on paste', () => {
    const { insertNode, copyNode, pasteNode } = useEditorStore.getState();

    insertNode({ type: 'Container', props: { id: 'c1' } });
    insertNode({ type: 'Button', props: { id: 'b1', label: 'Hi' } }, 'c1:content');

    copyNode('c1');
    expect(useEditorStore.getState().clipboard?.props.id).toBe('c1');

    pasteNode('c1'); // paste after the source

    const { document } = useEditorStore.getState();
    // Original + pasted copy.
    expect(document.content.length).toBe(2);

    const original = document.content[0];
    const pasted = document.content[1];
    expect(original.props.id).toBe('c1');
    expect(pasted.type).toBe('Container');
    // Root id must be remapped.
    expect(pasted.props.id).not.toBe('c1');

    // Child zone must be remapped under the new parent id AND the child must get a new id.
    const pastedZoneKey = `${pasted.props.id}:content`;
    expect(document.zones[pastedZoneKey]).toBeDefined();
    expect(document.zones[pastedZoneKey].length).toBe(1);
    const pastedChild = document.zones[pastedZoneKey][0];
    expect(pastedChild.props.id).not.toBe('b1');
    // Non-id props are preserved.
    expect(pastedChild.props.label).toBe('Hi');

    // Original subtree is untouched.
    expect(document.zones['c1:content'][0].props.id).toBe('b1');
  });

  it('inserts the pasted node immediately AFTER the target in the same list', () => {
    const { insertNode, copyNode, pasteNode } = useEditorStore.getState();

    insertNode({ type: 'A', props: { id: 'a' } });
    insertNode({ type: 'B', props: { id: 'b' } });
    insertNode({ type: 'C', props: { id: 'c' } });

    copyNode('c');
    pasteNode('a'); // paste right after "a"

    const ids = useEditorStore.getState().document.content.map((n) => n.props.id);
    // a, <copy of c>, b, c
    expect(ids[0]).toBe('a');
    expect(ids[2]).toBe('b');
    expect(ids[3]).toBe('c');
    expect(ids[1]).not.toBe('c');
    expect(ids).toHaveLength(4);
  });

  it('appends to root content when no target is given', () => {
    const { insertNode, copyNode, pasteNode } = useEditorStore.getState();

    insertNode({ type: 'A', props: { id: 'a' } });
    insertNode({ type: 'B', props: { id: 'b' } });

    copyNode('a');
    pasteNode(); // no target -> end of root content

    const ids = useEditorStore.getState().document.content.map((n) => n.props.id);
    expect(ids[0]).toBe('a');
    expect(ids[1]).toBe('b');
    expect(ids).toHaveLength(3);
    expect(ids[2]).not.toBe('a');
  });

  it('pasting the same clipboard twice yields two distinct id sets', () => {
    const { insertNode, copyNode, pasteNode } = useEditorStore.getState();

    insertNode({ type: 'Container', props: { id: 'c1' } });
    insertNode({ type: 'Button', props: { id: 'b1' } }, 'c1:content');

    copyNode('c1');
    pasteNode('c1');
    pasteNode('c1');

    const { document } = useEditorStore.getState();
    expect(document.content.length).toBe(3); // original + 2 pastes

    const ids = document.content.map((n) => n.props.id);
    // All three root ids are unique.
    expect(new Set(ids).size).toBe(3);

    // Each copy owns its own remapped child zone.
    const copyA = document.content[1];
    const copyB = document.content[2];
    expect(copyA.props.id).not.toBe(copyB.props.id);
    expect(document.zones[`${copyA.props.id}:content`][0].props.id).not.toBe(
      document.zones[`${copyB.props.id}:content`][0].props.id
    );
  });

  it('selects the freshly pasted subtree', () => {
    const { insertNode, copyNode, pasteNode } = useEditorStore.getState();

    insertNode({ type: 'A', props: { id: 'a' } });
    copyNode('a');
    pasteNode('a');

    const state = useEditorStore.getState();
    const pasted = state.document.content[1];
    expect(state.selection.selectedId).toBe(pasted.props.id);
  });

  it('cut copies then removes the original (and cleans up its zones)', () => {
    const { insertNode, cutNode } = useEditorStore.getState();

    insertNode({ type: 'Container', props: { id: 'c1' } });
    insertNode({ type: 'Button', props: { id: 'b1' } }, 'c1:content');

    cutNode('c1');

    const state = useEditorStore.getState();
    // Removed from the tree...
    expect(state.document.content.length).toBe(0);
    expect(getDescendantZoneKeys(state.document.zones, 'c1')).toHaveLength(0);
    // ...but available on the clipboard.
    expect(state.clipboard?.props.id).toBe('c1');

    // And pasteable back in with fresh ids.
    state.pasteNode();
    const after = useEditorStore.getState().document;
    expect(after.content.length).toBe(1);
    expect(after.content[0].props.id).not.toBe('c1');
    expect(after.content[0].type).toBe('Container');
  });

  it('cutting the clipboard source does not mutate the stored copy (deep clone)', () => {
    const { insertNode, copyNode, removeNode, pasteNode } = useEditorStore.getState();

    insertNode({ type: 'Box', props: { id: 'x', text: 'original' } });
    copyNode('x');

    // Mutate then delete the source after copying.
    useEditorStore.getState().updateProps('x', { text: 'changed' });
    removeNode('x');

    pasteNode();
    const pasted = useEditorStore.getState().document.content[0];
    // The clipboard snapshot was taken at copy time, before the edit.
    expect(pasted.props.text).toBe('original');
  });

  it('pushes a single undo step for paste', () => {
    const { insertNode, copyNode, pasteNode, undo } = useEditorStore.getState();

    insertNode({ type: 'A', props: { id: 'a' } });
    copyNode('a');
    pasteNode('a');
    expect(useEditorStore.getState().document.content.length).toBe(2);

    undo();
    expect(useEditorStore.getState().document.content.length).toBe(1);
  });

  it('no-ops paste when the clipboard is empty', () => {
    const { insertNode, pasteNode } = useEditorStore.getState();
    insertNode({ type: 'A', props: { id: 'a' } });

    pasteNode('a');
    expect(useEditorStore.getState().document.content.length).toBe(1);
  });
});
