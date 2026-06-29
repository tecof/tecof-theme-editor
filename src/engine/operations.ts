import type { TecofDocument, TecofNode } from '../types';
import { findNodeById, getDescendantZoneKeys, parseZoneKey } from './zones';
import { remapNodeIds, generateId } from './ids';

/**
 * All these functions are intended to be used with Immer, so they mutate the `draft` document directly.
 */

export const insertNode = (
  draft: TecofDocument,
  node: TecofNode,
  targetZoneKey?: string,
  index?: number
) => {
  // Ensure the node has an ID
  if (!node.props.id) {
    node.props.id = generateId();
  }

  let list = targetZoneKey ? draft.zones[targetZoneKey] : draft.content;
  if (!list) {
    list = [];
    if (targetZoneKey) {
      draft.zones[targetZoneKey] = list;
    }
  }

  const insertIndex = typeof index === 'number' ? index : list.length;
  list.splice(insertIndex, 0, node);
};

export const removeNode = (draft: TecofDocument, id: string) => {
  const result = findNodeById(draft, id);
  if (!result) return;

  const { path } = result;
  const list = path.zoneKey ? draft.zones[path.zoneKey] : draft.content;
  
  if (list) {
    list.splice(path.index, 1);
  }

  // Cleanup descendant zones
  const descendantZoneKeys = getDescendantZoneKeys(draft.zones, id);
  for (const zoneKey of descendantZoneKeys) {
    delete draft.zones[zoneKey];
  }
};

export const moveNode = (
  draft: TecofDocument,
  id: string,
  targetZoneKey?: string,
  targetIndex?: number
) => {
  const result = findNodeById(draft, id);
  if (!result) return;

  const { node, path: sourcePath } = result;
  const sourceList = sourcePath.zoneKey ? draft.zones[sourcePath.zoneKey] : draft.content;
  let targetList = targetZoneKey ? draft.zones[targetZoneKey] : draft.content;

  if (targetZoneKey) {
    const targetParentId = parseZoneKey(targetZoneKey).parentId;
    const descendantZoneKeys = getDescendantZoneKeys(draft.zones, id);
    if (targetParentId === id || descendantZoneKeys.includes(targetZoneKey)) {
      return;
    }
  }

  if (!targetList && targetZoneKey) {
    targetList = [];
    draft.zones[targetZoneKey] = targetList;
  }

  if (!sourceList || !targetList) return;

  // Remove from source
  sourceList.splice(sourcePath.index, 1);

  // If we moved within the same list, and the target index was after the source index,
  // we need to adjust the target index to account for the removed item.
  let finalIndex = targetIndex ?? targetList.length;
  if (sourcePath.zoneKey === targetZoneKey && sourcePath.index < finalIndex) {
    finalIndex -= 1;
  }

  // Insert to target
  targetList.splice(finalIndex, 0, node);
};

export const duplicateNode = (draft: TecofDocument, id: string) => {
  const result = findNodeById(draft, id);
  if (!result) return;

  const { node, path } = result;

  const { remappedNode, newZones } = remapNodeIds(node, draft.zones);

  const targetList = path.zoneKey ? draft.zones[path.zoneKey] : draft.content;
  if (targetList) {
    targetList.splice(path.index + 1, 0, remappedNode);
  }

  Object.assign(draft.zones, newZones);
};

/**
 * Collects a node together with all of its descendant zones, for the clipboard.
 * Returns references into the live document — callers MUST deep-clone the result
 * before storing it so a later cut/delete of the source cannot mutate the copy.
 */
export const collectSubtree = (
  draft: TecofDocument,
  id: string
): { node: TecofNode; zones: Record<string, TecofNode[]> } | null => {
  const result = findNodeById(draft, id);
  if (!result) return null;

  const zones: Record<string, TecofNode[]> = {};
  for (const zoneKey of getDescendantZoneKeys(draft.zones, id)) {
    zones[zoneKey] = draft.zones[zoneKey];
  }

  return { node: result.node, zones };
};

/**
 * Pastes a previously copied subtree (node + its descendant zones) into the
 * document. The subtree is given fresh unique ids via `remapNodeIds` so it can
 * coexist with the original. It is inserted AFTER `targetId` (in the same
 * zone/list) or, when no target is given/found, appended to the root content.
 *
 * `clipNode` / `clipZones` are the deep snapshot stored at copy time, so passing
 * them to `remapNodeIds` as the source-zone lookup keeps the op self-contained.
 * Returns the new root id of the pasted subtree.
 */
export const pasteNode = (
  draft: TecofDocument,
  clipNode: TecofNode,
  clipZones: Record<string, TecofNode[]>,
  targetId?: string
): string => {
  const { remappedNode, newZones } = remapNodeIds(clipNode, clipZones);

  let targetList: TecofNode[] | undefined = draft.content;
  let insertIndex = draft.content.length;

  if (targetId) {
    const result = findNodeById(draft, targetId);
    if (result) {
      const { zoneKey, index } = result.path;
      if (zoneKey) {
        if (!draft.zones[zoneKey]) draft.zones[zoneKey] = [];
        targetList = draft.zones[zoneKey];
      } else {
        targetList = draft.content;
      }
      insertIndex = index + 1;
    }
  }

  targetList?.splice(insertIndex, 0, remappedNode);
  Object.assign(draft.zones, newZones);

  return remappedNode.props.id;
};

export const updateProps = (draft: TecofDocument, id: string, patch: Record<string, any>) => {
  const result = findNodeById(draft, id);
  if (!result) return;

  Object.assign(result.node.props, patch);
};

export const setRootProps = (draft: TecofDocument, patch: Record<string, any>) => {
  Object.assign(draft.root.props, patch);
};
