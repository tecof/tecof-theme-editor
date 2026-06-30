import type { TecofDocument, TecofNode } from '../types';
import { findNodeById, getDescendantZoneKeys, parseZoneKey } from './zones';
import { remapNodeIds, generateId } from './ids';

/**
 * A serialized node payload used by the clipboard: the node itself plus the
 * slice of `zones` describing its full descendant subtree. Keeping the subtree
 * alongside the node lets paste reconstruct nested children with fresh ids.
 */
export interface ClipboardPayload {
  node: TecofNode;
  zones: Record<string, TecofNode[]>;
}

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

/**
 * Serializes a node and its FULL descendant subtree into a clipboard payload.
 * The returned object is a deep, history-detached snapshot (safe to stash in the
 * store or stringify to localStorage) — it never references live document state.
 */
export const serializeNodeWithZones = (
  doc: TecofDocument,
  id: string
): ClipboardPayload | null => {
  const result = findNodeById(doc, id);
  if (!result) return null;

  const descendantZoneKeys = getDescendantZoneKeys(doc.zones, id);
  const zones: Record<string, TecofNode[]> = {};
  for (const zoneKey of descendantZoneKeys) {
    zones[zoneKey] = doc.zones[zoneKey];
  }

  // Structured-clone via JSON so the payload is fully detached from immer drafts
  // and the live document (props may hold plain JSON-safe values only).
  return JSON.parse(JSON.stringify({ node: result.node, zones }));
};

/**
 * Pastes a clipboard payload as a DEEP COPY with FRESH ids into the target
 * zone/index. Returns the new (remapped) root node so callers can select it.
 * Mutates the draft in place (immer-friendly).
 */
export const pastePayload = (
  draft: TecofDocument,
  payload: ClipboardPayload,
  targetZoneKey?: string,
  index?: number
): TecofNode => {
  // Fresh ids for the node and every descendant zone, so pasting twice can't collide.
  const { remappedNode, newZones } = remapNodeIds(payload.node, payload.zones);

  insertNode(draft, remappedNode, targetZoneKey, index);
  Object.assign(draft.zones, newZones);

  return remappedNode;
};

/**
 * Removes several nodes in one shot. Each removal cleans up its descendant zones
 * (delegates to `removeNode`), so when called inside a single `commit` the whole
 * bulk delete becomes one undo step.
 *
 * We resolve every target's path UP FRONT and remove in descending (list, index)
 * order. Splicing the highest index first means earlier splices never shift the
 * indices we still have to remove — important because findNodeById's per-document
 * index isn't rebuilt for the intermediate (un-finalized) immer draft.
 */
export const removeNodes = (draft: TecofDocument, ids: string[]) => {
  type Located = { id: string; zoneKey?: string; index: number };
  const located = ids
    .map((id): Located | null => {
      const res = findNodeById(draft, id);
      return res ? { id, zoneKey: res.path.zoneKey, index: res.path.index } : null;
    })
    .filter((entry): entry is Located => entry != null);

  // Remove deepest index first within each list to keep remaining indices valid.
  located.sort((a, b) => {
    const keyA = a.zoneKey ?? '';
    const keyB = b.zoneKey ?? '';
    if (keyA !== keyB) return keyA < keyB ? 1 : -1;
    return b.index - a.index;
  });

  for (const entry of located) {
    removeNode(draft, entry.id);
  }
};

/**
 * Duplicates several nodes in one shot. Returns the ids of the created copies
 * (in the same order) so callers can select them. One undo step when wrapped in
 * a single `commit`.
 */
export const duplicateNodes = (draft: TecofDocument, ids: string[]): string[] => {
  const newIds: string[] = [];
  for (const id of ids) {
    const result = findNodeById(draft, id);
    if (!result) continue;

    const { node, path } = result;
    const { remappedNode, newZones } = remapNodeIds(node, draft.zones);

    const targetList = path.zoneKey ? draft.zones[path.zoneKey] : draft.content;
    if (targetList) {
      targetList.splice(path.index + 1, 0, remappedNode);
    }
    Object.assign(draft.zones, newZones);
    newIds.push(remappedNode.props.id);
  }
  return newIds;
};
