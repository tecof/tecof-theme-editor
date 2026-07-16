import type { TecofDocument, TecofNode } from '../types';

/**
 * Parses a zone key into its parentId and slotName.
 * Format: "parentId:slotName"
 */
export const parseZoneKey = (zoneKey: string) => {
  const parts = zoneKey.split(':');
  return {
    parentId: parts[0],
    slotName: parts[1] || 'default',
  };
};

/**
 * Generates a zone key from parentId and slotName.
 */
export const getZoneKey = (parentId: string, slotName: string = 'default') => {
  return `${parentId}:${slotName}`;
};

export type NodePath = {
  zoneKey?: string; // If undefined, it's in the root content array
  index: number;
};

type NodeEntry = { node: TecofNode; path: NodePath };

/**
 * Per-document index cache for O(1) `findNodeById` lookups.
 *
 * Immer (and our own clones) produce a NEW document object on every mutation, so
 * keying this WeakMap on the document instance means the cache invalidates itself
 * automatically the moment the document changes — no manual invalidation needed.
 * Stale documents are garbage-collected along with their index.
 */
const indexCache = new WeakMap<TecofDocument, Map<string, NodeEntry>>();

/**
 * Builds the full id -> {node, path} index for a single document version.
 */
const buildIndex = (doc: TecofDocument): Map<string, NodeEntry> => {
  const index = new Map<string, NodeEntry>();

  // Root content
  for (let i = 0; i < doc.content.length; i++) {
    const node = doc.content[i];
    index.set(node.props.id, { node, path: { index: i } });
  }

  // All zones
  for (const [zoneKey, items] of Object.entries(doc.zones)) {
    for (let i = 0; i < items.length; i++) {
      const node = items[i];
      index.set(node.props.id, { node, path: { zoneKey, index: i } });
    }
  }

  return index;
};

/**
 * Finds a node by ID in the document and returns its path and the node itself.
 *
 * Amortized O(1): on the first call for a given document version we build a
 * complete id index and cache it (keyed on the document instance); subsequent
 * lookups against the same document are constant-time Map gets.
 */
export const findNodeById = (
  doc: TecofDocument,
  id: string
): { node: TecofNode; path: NodePath } | null => {
  let index = indexCache.get(doc);
  if (!index) {
    index = buildIndex(doc);
    indexCache.set(doc, index);
  }
  return index.get(id) ?? null;
};

/**
 * Gets all descendant zone keys recursively for a given node ID.
 * Useful for cleanup when a node is removed.
 */
export const getDescendantZoneKeys = (
  zones: Record<string, TecofNode[]>,
  nodeId: string,
  acc: string[] = []
): string[] => {
  const prefix = `${nodeId}:`;
  for (const zoneKey of Object.keys(zones)) {
    if (zoneKey.startsWith(prefix)) {
      acc.push(zoneKey);
      // Recursively find zones for all children in this zone
      for (const child of zones[zoneKey]) {
        getDescendantZoneKeys(zones, child.props.id, acc);
      }
    }
  }
  return acc;
};

/**
 * Flattens a node's entire subtree into a depth-first list of its descendants
 * (the node itself is NOT included). Direct children are `depth: 1`, their
 * children `depth: 2`, and so on — so the caller can indent by depth.
 *
 * Children live in `doc.zones["<parentId>:<slotName>"]`. The trailing colon in
 * the prefix guards against id-prefix collisions (`Foo-1:` never matches
 * `Foo-12:...`). Slot order follows the zones object's key order; item order
 * within a slot is preserved. Used by the Inspector's aggregate ("section")
 * view to surface every inner element's fields from one panel.
 */
export const getDescendants = (
  doc: TecofDocument,
  id: string
): { id: string; node: TecofNode; depth: number }[] => {
  const out: { id: string; node: TecofNode; depth: number }[] = [];
  const walk = (parentId: string, depth: number) => {
    const prefix = `${parentId}:`;
    for (const [zoneKey, items] of Object.entries(doc.zones)) {
      if (!zoneKey.startsWith(prefix)) continue;
      for (const child of items) {
        out.push({ id: child.props.id, node: child, depth });
        walk(child.props.id, depth + 1);
      }
    }
  };
  walk(id, 1);
  return out;
};

/**
 * Resolves the parent ID of a node by ID.
 */
export const getParentId = (doc: TecofDocument, id: string): string | null => {
  const res = findNodeById(doc, id);
  if (!res || !res.path.zoneKey) return null;
  return parseZoneKey(res.path.zoneKey).parentId;
};

/**
 * Returns a list of ancestor nodes for a given node ID, sorted from root down to the node itself.
 */
export const getBreadcrumbs = (
  doc: TecofDocument,
  id: string
): { id: string; type: string }[] => {
  const crumbs: { id: string; type: string }[] = [];
  let currentId: string | null = id;

  while (currentId) {
    const res = findNodeById(doc, currentId);
    if (!res) break;

    crumbs.unshift({ id: currentId, type: res.node.type });
    currentId = res.path.zoneKey ? parseZoneKey(res.path.zoneKey).parentId : null;
  }

  return crumbs;
};

