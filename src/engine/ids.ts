import { nanoid } from 'nanoid';
import type { TecofNode, TecofDocument } from '../types';

export const generateId = () => nanoid(8);

/**
 * Traverses a node and all its children in zones to generate a new map of IDs.
 * Returns the remapped node, and any new zones it created.
 */
export const remapNodeIds = (
  node: TecofNode,
  sourceZones: Record<string, TecofNode[]>,
  idMap = new Map<string, string>()
): {
  remappedNode: TecofNode;
  newZones: Record<string, TecofNode[]>;
} => {
  const oldId = node.props.id;
  const newId = generateId();
  idMap.set(oldId, newId);

  const remappedNode: TecofNode = {
    ...node,
    props: {
      ...node.props,
      id: newId,
    },
  };

  const newZones: Record<string, TecofNode[]> = {};

  // Find all zones that belong to this node
  const prefix = `${oldId}:`;
  for (const [zoneKey, zoneItems] of Object.entries(sourceZones)) {
    if (zoneKey.startsWith(prefix)) {
      const slotName = zoneKey.split(':')[1];
      const newZoneKey = `${newId}:${slotName}`;
      
      const newZoneItems: TecofNode[] = [];
      for (const item of zoneItems) {
        const { remappedNode: childNode, newZones: childZones } = remapNodeIds(item, sourceZones, idMap);
        newZoneItems.push(childNode);
        Object.assign(newZones, childZones);
      }
      
      newZones[newZoneKey] = newZoneItems;
    }
  }

  return { remappedNode, newZones };
};
