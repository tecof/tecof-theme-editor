import { describe, it, expect, beforeEach } from 'vitest';
import { createNode } from '../dndUtils';
import { useEditorStore } from '../../../engine/store';
import { createEmptyDocument } from '../../../engine/document';
import type { StudioConfig } from '../../../types';

/** Minimal config: components exist just so createNode reads their meta. */
const config = {
  components: {
    Columns: {
      render: () => null,
      defaultChildren: { cols: ['Column', 'Column'] },
    },
    Column: {
      render: () => null,
      defaultProps: { width: 'half' },
    },
    Accordion: {
      render: () => null,
      defaultChildren: { items: [{ type: 'AccordionItem', props: { title: 'Başlık' } }] },
    },
    AccordionItem: { render: () => null },
    // A component whose slot default references itself — must not recurse forever.
    Recursive: {
      render: () => null,
      defaultChildren: { slot: ['Recursive'] },
    },
    // Slot content already provided via defaultProps → defaultChildren skipped.
    Preset: {
      render: () => null,
      defaultProps: { slot: [{ type: 'Column', props: { id: 'keep' } }] },
      defaultChildren: { slot: ['Column', 'Column'] },
    },
  },
} as unknown as StudioConfig;

describe('createNode — defaultChildren', () => {
  it('inlines string-spec children into the slot prop with unique ids', () => {
    const node = createNode(config, 'Columns');
    const cols = node.props.cols as any[];
    expect(Array.isArray(cols)).toBe(true);
    expect(cols).toHaveLength(2);
    expect(cols.every((c) => c.type === 'Column')).toBe(true);
    // Column's own defaultProps applied to each child.
    expect(cols.every((c) => c.props.width === 'half')).toBe(true);
    // Ids are present and distinct (node + both children).
    const ids = [node.props.id, cols[0].props.id, cols[1].props.id];
    expect(new Set(ids).size).toBe(3);
  });

  it('applies object-spec props to the child', () => {
    const node = createNode(config, 'Accordion');
    const items = node.props.items as any[];
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ type: 'AccordionItem', props: { title: 'Başlık' } });
    expect(items[0].props.id).toBeTruthy();
  });

  it('stops at type cycles instead of recursing forever', () => {
    const node = createNode(config, 'Recursive');
    // The self-referential child is skipped, so the slot stays empty (no prop).
    expect(node.props.slot).toBeUndefined();
  });

  it('does not overwrite slot content already provided by defaultProps', () => {
    const node = createNode(config, 'Preset');
    const slot = node.props.slot as any[];
    expect(slot).toHaveLength(1);
    expect(slot[0].props.id).toBe('keep');
  });

  it('leaves components without defaultChildren unchanged', () => {
    const node = createNode(config, 'Column');
    expect(node.props.width).toBe('half');
    expect(Object.keys(node.props)).not.toContain('cols');
  });

  it('variant insert contract: variant props + _variant marker merge over defaults', () => {
    // The AddSectionModal inserts a variant via onSelect(type, {...variant.props, _variant}).
    const node = createNode(config, 'Column', { width: 'full', tone: 'ghost', _variant: 'ghost' });
    expect(node.props).toMatchObject({ width: 'full', tone: 'ghost', _variant: 'ghost' });
    expect(node.props.id).toBeTruthy();
  });
});

describe('createNode + insertNode — slots unpack into zones with fresh ids', () => {
  beforeEach(() => {
    useEditorStore.getState().setDocument(createEmptyDocument());
  });

  it('extractDefaultSlots moves inlined children into zones', () => {
    const node = createNode(config, 'Columns');
    useEditorStore.getState().insertNode(node);

    const doc = useEditorStore.getState().document;
    expect(doc.content).toHaveLength(1);
    const parentId = doc.content[0].props.id;
    // The inlined array is emptied on the node and lifted into the zone.
    expect(doc.content[0].props.cols).toEqual([]);
    const zone = doc.zones[`${parentId}:cols`];
    expect(zone).toHaveLength(2);
    expect(zone!.every((c) => c.type === 'Column')).toBe(true);
    // Zone children get fresh ids distinct from each other + the parent.
    const ids = [parentId, ...zone!.map((c) => c.props.id)];
    expect(new Set(ids).size).toBe(3);
  });
});
