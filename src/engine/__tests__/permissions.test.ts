import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getNodePermissions, DEFAULT_PERMISSIONS } from '../permissions';
import { useEditorStore } from '../store';
import { createEmptyDocument } from '../document';
import type { StudioConfig, TecofNode } from '../../types';

const node = (type: string, props: Record<string, any> = {}): TecofNode => ({
  type,
  props: { id: `${type}-1`, ...props },
});

const cfg = (partial: Partial<StudioConfig>): StudioConfig =>
  ({ components: {}, ...partial } as StudioConfig);

describe('getNodePermissions', () => {
  it('grants everything by default when no config declares permissions', () => {
    expect(getNodePermissions(cfg({}), node('Box'))).toEqual(DEFAULT_PERMISSIONS);
  });

  it('applies global permissions', () => {
    const config = cfg({ permissions: { delete: false } });
    expect(getNodePermissions(config, node('Box'))).toMatchObject({
      delete: false,
      drag: true,
      duplicate: true,
      edit: true,
    });
  });

  it('component permissions override global', () => {
    const config = cfg({
      permissions: { delete: false, drag: false },
      components: { Box: { render: () => null, permissions: { delete: true } } },
    });
    const perms = getNodePermissions(config, node('Box'));
    expect(perms.delete).toBe(true); // component re-enabled
    expect(perms.drag).toBe(false); // still inherited from global
  });

  it('resolvePermissions has the last word and receives props', () => {
    const config = cfg({
      components: {
        Header: {
          render: () => null,
          permissions: { delete: true },
          resolvePermissions: (props) => ({ delete: !props.locked }),
        },
      },
    });
    expect(getNodePermissions(config, node('Header', { locked: true })).delete).toBe(false);
    expect(getNodePermissions(config, node('Header', { locked: false })).delete).toBe(true);
  });

  it('is permissive when resolvePermissions throws', () => {
    const config = cfg({
      components: {
        Bad: {
          render: () => null,
          permissions: { drag: false },
          resolvePermissions: () => {
            throw new Error('boom');
          },
        },
      },
    });
    // Falls back to the static merge (drag:false from component permissions).
    const perms = getNodePermissions(config, node('Bad'));
    expect(perms.drag).toBe(false);
    expect(perms.delete).toBe(true);
  });

  it('tolerates an undefined config', () => {
    expect(getNodePermissions(undefined, node('Box'))).toEqual(DEFAULT_PERMISSIONS);
  });

  it('a locked node (`_locked`) denies every action, overriding permissive config', () => {
    const config = cfg({
      components: { Box: { render: () => null, resolvePermissions: () => ({ delete: true, drag: true }) } as any },
    });
    expect(getNodePermissions(config, node('Box', { _locked: true }))).toEqual({
      drag: false,
      delete: false,
      duplicate: false,
      edit: false,
    });
    // Unlocked is unaffected.
    expect(getNodePermissions(config, node('Box'))).toEqual(DEFAULT_PERMISSIONS);
  });
});

describe('store enforcement via permissionResolver', () => {
  beforeEach(() => {
    useEditorStore.getState().setDocument(createEmptyDocument());
    useEditorStore.getState().setPermissionResolver(null);
  });
  afterEach(() => {
    useEditorStore.getState().setPermissionResolver(null);
  });

  // Locks whatever the predicate matches; everything else stays permissive.
  const lock = (pred: (n: TecofNode) => boolean, patch: Record<string, boolean>) => {
    useEditorStore.getState().setPermissionResolver((n) =>
      pred(n) ? { ...DEFAULT_PERMISSIONS, ...patch } : DEFAULT_PERMISSIONS
    );
  };

  it('removeNode is a no-op for a delete-locked node', () => {
    const { insertNode, removeNode } = useEditorStore.getState();
    insertNode({ type: 'A', props: { id: 'a' } });
    lock((n) => n.props.id === 'a', { delete: false });

    removeNode('a');
    expect(useEditorStore.getState().document.content.map((n) => n.props.id)).toEqual(['a']);
  });

  it('removeNodes skips locked ids but removes the rest', () => {
    const { insertNode, removeNodes } = useEditorStore.getState();
    insertNode({ type: 'A', props: { id: 'a' } });
    insertNode({ type: 'B', props: { id: 'b' } });
    lock((n) => n.props.id === 'a', { delete: false });

    removeNodes(['a', 'b']);
    expect(useEditorStore.getState().document.content.map((n) => n.props.id)).toEqual(['a']);
  });

  it('duplicateNodes skips duplicate-locked ids', () => {
    const { insertNode, duplicateNodes } = useEditorStore.getState();
    insertNode({ type: 'A', props: { id: 'a' } });
    insertNode({ type: 'B', props: { id: 'b' } });
    lock((n) => n.props.id === 'a', { duplicate: false });

    duplicateNodes(['a', 'b']);
    // 'b' duplicated -> 3 total; 'a' untouched.
    expect(useEditorStore.getState().document.content.length).toBe(3);
  });

  it('moveNode is a no-op for a drag-locked node', () => {
    const { insertNode, moveNode } = useEditorStore.getState();
    insertNode({ type: 'A', props: { id: 'a' } });
    insertNode({ type: 'B', props: { id: 'b' } });
    lock((n) => n.props.id === 'a', { drag: false });

    moveNode('a', undefined, 1); // try to move 'a' after 'b'
    expect(useEditorStore.getState().document.content.map((n) => n.props.id)).toEqual(['a', 'b']);
  });

  it('cutNode degrades to a copy when the node is delete-locked', () => {
    const { insertNode, cutNode } = useEditorStore.getState();
    insertNode({ type: 'A', props: { id: 'a' } });
    lock((n) => n.props.id === 'a', { delete: false });

    cutNode('a');
    // Node stays put, but the clipboard was populated (copy semantics).
    expect(useEditorStore.getState().document.content.map((n) => n.props.id)).toEqual(['a']);
    expect(useEditorStore.getState().clipboard?.node.props.id).toBeDefined();
  });

  it('is fully permissive once the resolver is cleared', () => {
    const { insertNode, removeNode } = useEditorStore.getState();
    insertNode({ type: 'A', props: { id: 'a' } });
    lock((n) => n.props.id === 'a', { delete: false });
    useEditorStore.getState().setPermissionResolver(null);

    removeNode('a');
    expect(useEditorStore.getState().document.content).toEqual([]);
  });
});
