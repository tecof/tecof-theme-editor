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

export const updateProps = (draft: TecofDocument, id: string, patch: Record<string, any>) => {
  const result = findNodeById(draft, id);
  if (!result) return;

  Object.assign(result.node.props, patch);
};

export const setRootProps = (draft: TecofDocument, patch: Record<string, any>) => {
  Object.assign(draft.root.props, patch);
};
