import { findNodeById, getParentId } from '../../engine/zones';
import { isValidDrop } from '../../engine/rules';
import type { StudioConfig, TecofDocument } from '../../types';

/**
 * Pure logic of the touch (pointer-event) drag layer — everything that can be
 * computed without a DOM so it stays unit-testable. The DOM-facing controller
 * (`TouchDragLayer`) feeds it parsed `data-tecof-*` attributes and rects.
 *
 * Mirrors the semantics of the native HTML5 path in `useDropTarget.ts`:
 * innermost valid target wins, before/after halves along the layout axis,
 * engine rules via `isValidDrop`, self/own-subtree guards.
 */

export type TouchDragPayload =
  | { kind: 'node'; nodeId: string }
  | { kind: 'block'; type: string };

export interface TouchDropTarget {
  /** Zone the drop lands in; undefined = root content flow. */
  zoneKey: string | undefined;
  /** Resolved insertion index (final, except positional targets — see below). */
  index: number;
  /** Set for positional (over-a-node) targets — drives the dropHover guides;
   * the final index is `index` (before) or `index + 1` (after). */
  positional?: {
    targetId: string;
    position: 'before' | 'after';
    axis: 'x' | 'y';
  };
  /** Set for layers-panel row targets — drives the row's drop classes;
   * `index` is already final. */
  layer?: { pos: 'top' | 'bottom' | 'inside' };
}

/** `data-tecof-zone` attribute → store zone key (`'root'`/missing = root flow). */
export const parseZoneAttr = (value: string | null | undefined): string | undefined =>
  !value || value === 'root' ? undefined : value;

/** Which half of the target rect the point falls in along the drop axis. */
export const computeDropPosition = (
  axis: 'x' | 'y',
  rect: { left: number; top: number; width: number; height: number },
  point: { x: number; y: number }
): 'before' | 'after' =>
  axis === 'x'
    ? point.x - rect.left < rect.width / 2
      ? 'before'
      : 'after'
    : point.y - rect.top < rect.height / 2
      ? 'before'
      : 'after';

/** True when the target zone lives anywhere inside `nodeId`'s own subtree. */
const isZoneInsideNode = (
  doc: TecofDocument,
  zoneKey: string | undefined,
  nodeId: string
): boolean => {
  let current: string | null = zoneKey ? zoneKey.split(':')[0] : null;
  while (current) {
    if (current === nodeId) return true;
    current = getParentId(doc, current);
  }
  return false;
};

/** The dragged component type, resolved from the payload (node id → its type). */
export const resolveDraggedType = (
  doc: TecofDocument,
  payload: TouchDragPayload
): string | null => {
  if (payload.kind === 'block') return payload.type;
  return findNodeById(doc, payload.nodeId)?.node.type ?? null;
};

/**
 * Validates a candidate drop exactly like the native path's `checkValid`:
 * no dropping a node onto itself, never into its own subtree, and the engine
 * drop rules (`allowedParents` / `acceptsChildren` / `maxItems`) must allow it.
 */
export const isValidTouchDrop = (
  config: StudioConfig,
  doc: TecofDocument,
  payload: TouchDragPayload,
  zoneKey: string | undefined,
  targetId?: string
): boolean => {
  if (payload.kind === 'node') {
    if (targetId && payload.nodeId === targetId) return false;
    if (isZoneInsideNode(doc, zoneKey, payload.nodeId)) return false;
  }
  const draggedType = resolveDraggedType(doc, payload);
  if (!draggedType) return false;
  return isValidDrop(config, draggedType, zoneKey, doc);
};

/**
 * Drop position relative to a layers-panel row. Mirrors the tree-row semantics
 * of the mouse path: the middle third of a row that has child zones means
 * "drop INSIDE it"; otherwise the halves reorder above/below.
 */
export type LayerDropPos = 'top' | 'bottom' | 'inside';

export const computeLayerDropPos = (
  rect: { top: number; height: number },
  clientY: number,
  hasInsideTarget: boolean
): LayerDropPos => {
  const relativeY = clientY - rect.top;
  if (hasInsideTarget && relativeY > rect.height / 3 && relativeY < (rect.height * 2) / 3) {
    return 'inside';
  }
  return relativeY < rect.height / 2 ? 'top' : 'bottom';
};

/** Insertion index for a resolved target (positional halves / container end). */
export const targetDropIndex = (
  doc: TecofDocument,
  target: { zoneKey: string | undefined; index?: number; position?: 'before' | 'after' }
): number => {
  if (target.position != null && target.index != null) {
    return target.position === 'before' ? target.index : target.index + 1;
  }
  const list = target.zoneKey ? doc.zones[target.zoneKey] : doc.content;
  return list?.length ?? 0;
};
