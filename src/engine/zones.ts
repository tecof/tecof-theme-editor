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

/**
 * Finds a node by ID in the document and returns its path and the node itself.
 */
export const findNodeById = (
  doc: TecofDocument,
  id: string
): { node: TecofNode; path: NodePath } | null => {
  // Check root content
  for (let i = 0; i < doc.content.length; i++) {
    if (doc.content[i].props.id === id) {
      return { node: doc.content[i], path: { index: i } };
    }
  }

  // Check all zones
  for (const [zoneKey, items] of Object.entries(doc.zones)) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].props.id === id) {
        return { node: items[i], path: { zoneKey, index: i } };
      }
    }
  }

  return null;
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

