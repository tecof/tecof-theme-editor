import { useCallback, useRef, useState } from 'react';
import type React from 'react';
import { useEditorStore } from '../../engine/store';
import { useStudio } from '../context';
import { findNodeById } from '../../engine/zones';
import { isValidDrop } from '../../engine/rules';
import { createEventAutoScroller, createNode, readDragData } from './dndUtils';

/**
 * Shared drag-over / drag-leave / drop wiring for every canvas drop target.
 *
 * This consolidates the logic that used to be copy-pasted across NodeRenderer,
 * DropZone and Canvas: managing the auto-scroller, computing the drop position
 * (top/bottom for ordered targets), enforcing the engine drop rules, and finally
 * dispatching the right store mutation (`moveNode` for an existing node,
 * `insertNode` for a new palette block).
 *
 * Two flavours are supported via `positional`:
 *
 *   - positional = true  (NodeRenderer): the target represents a single node and
 *     a drop lands either before (`top`) or after (`bottom`) it. `position` is
 *     tracked in state and the computed index is `index` or `index + 1`.
 *
 *   - positional = false (DropZone / Canvas): the target is a container and a
 *     drop appends at `getIndex()` (end of the zone). A single `isDragOver`
 *     boolean is tracked instead of a top/bottom position.
 *
 * Drop-rule enforcement: before computing the position we resolve the dragged
 * type (palette type directly, or the existing node's type via `findNodeById`)
 * and call `isValidDrop(config, type, zoneKey, doc)`. When invalid we suppress
 * the affordance (no position / not-dragover), set `dropEffect = 'none'`, and the
 * drop itself bails out without mutating. Default configs declare no constraints,
 * so `isValidDrop` is permissive and behaviour is unchanged.
 */

type Position = 'before' | 'after';
type Axis = 'x' | 'y';

/**
 * Reads the main axis of the layout container that holds the hovered node, so a
 * positional drop can land left/right in a row (or grid) and top/bottom in a
 * column. We inspect the *rendered* layout (computed style of the node's parent),
 * which means any horizontal slot — set via the `orientation` prop, a component's
 * own flex/grid styling, or the style editor — gets side-by-side reordering for
 * free, with no extra configuration.
 */
const getDropAxis = (wrapperEl: HTMLElement): Axis => {
  // Non-inline nodes sit inside a `.tecof-node` wrapper; inline nodes render
  // without one and live directly in the layout container, so climbing via
  // closest('.tecof-node') would find an ANCESTOR node's wrapper and read the
  // wrong container. Only step up when the direct parent is our own wrapper.
  const parent = wrapperEl.parentElement;
  const item = parent?.classList.contains('tecof-node') ? parent : wrapperEl;
  const container = item?.parentElement;
  const win = container?.ownerDocument?.defaultView;
  if (!container || !win) return 'y';
  const cs = win.getComputedStyle(container);
  const display = cs.display;
  if (display === 'flex' || display === 'inline-flex') {
    return cs.flexDirection.startsWith('row') ? 'x' : 'y';
  }
  if (display === 'grid' || display === 'inline-grid') {
    const cols = cs.gridTemplateColumns
      .split(' ')
      .filter((t) => t && t !== 'none').length;
    return cols > 1 ? 'x' : 'y';
  }
  return display.startsWith('inline') ? 'x' : 'y';
};

export interface UseDropTargetOptions {
  /** Zone key this target drops into (`undefined` => root content). */
  zoneKey?: string;
  /** When true, track top/bottom position relative to a single node. */
  positional?: boolean;
  /** Index of the node (positional targets only). */
  index?: number;
  /** Returns the drop index for non-positional containers (e.g. items.length). */
  getIndex?: () => number;
  /** Disable all behaviour (read-only / preview). */
  locked?: boolean;
  /** Node id to ignore as a move target (a node can't be dropped onto itself). */
  selfId?: string;
}

export interface UseDropTargetResult {
  /** Active position for positional targets (`null` when idle/invalid). */
  position: Position | null;
  /** Layout axis of the hovered target — drives the drop-indicator orientation. */
  axis: Axis;
  /** True while a valid drag is hovering a non-positional container. */
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

/** Resolves the type of whatever is being dragged, for rule checks. */
const resolveDraggedType = (
  nodeId: string,
  type: string
): string | null => {
  if (type) return type;
  if (nodeId) {
    const doc = useEditorStore.getState().document;
    const res = findNodeById(doc, nodeId);
    return res?.node.type ?? null;
  }
  return null;
};

export const useDropTarget = (options: UseDropTargetOptions): UseDropTargetResult => {
  const { zoneKey, positional = false, index = 0, getIndex, locked = false, selfId } = options;
  const { config } = useStudio();

  const insertNode = useEditorStore((state) => state.insertNode);
  const moveNode = useEditorStore((state) => state.moveNode);
  const endDrag = useEditorStore((state) => state.endDrag);

  const autoScrollerRef = useRef(createEventAutoScroller());
  const [position, setPosition] = useState<Position | null>(null);
  const [axis, setAxis] = useState<Axis>('y');
  const [isDragOver, setIsDragOver] = useState(false);

  /**
   * Validates the current drag against the engine rules. dataTransfer payload is
   * only reliably readable on `drop` in some browsers, but the TYPE we need lives
   * in our custom MIME entries which ARE readable during dragover, so we use them
   * to gate the affordance. Returns null when the drop is disallowed.
   */
  const checkValid = (e: React.DragEvent): boolean => {
    const { nodeId, type } = readDragData(e);
    // Dragging a node onto itself is a no-op, treat as invalid affordance.
    if (nodeId && selfId && nodeId === selfId) return false;
    const draggedType = resolveDraggedType(nodeId, type);
    // No payload yet (e.g. cross-window drag) — stay permissive.
    if (!draggedType) return true;
    const doc = useEditorStore.getState().document;
    return isValidDrop(config, draggedType, zoneKey, doc);
  };

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      if (locked) return;
      e.preventDefault();
      if (positional) e.stopPropagation();

      if (!checkValid(e)) {
        // Reject the affordance and tell the browser this isn't a valid target.
        e.dataTransfer.dropEffect = 'none';
        autoScrollerRef.current.stop();
        setPosition(null);
        setIsDragOver(false);
        return;
      }

      autoScrollerRef.current.update(e);

      if (positional) {
        const el = e.currentTarget as HTMLElement;
        const dropAxis = getDropAxis(el);
        const rect = el.getBoundingClientRect();
        // "before" = the half nearer the start of the main axis (left for a row,
        // top for a column); "after" = the far half.
        const before =
          dropAxis === 'x'
            ? e.clientX - rect.left < rect.width / 2
            : e.clientY - rect.top < rect.height / 2;
        setAxis(dropAxis);
        setPosition(before ? 'before' : 'after');
      } else {
        setIsDragOver(true);
      }
    },
    // checkValid/checkValid deps are captured fresh on each render via closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locked, positional, zoneKey, config]
  );

  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    autoScrollerRef.current.stop();
    setPosition(null);
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      if (locked) return;
      e.preventDefault();
      if (positional) e.stopPropagation();
      autoScrollerRef.current.stop();

      const valid = checkValid(e);
      // Capture position before we clear it for the index computation below.
      const droppedPosition = position;
      setPosition(null);
      setIsDragOver(false);

      if (!valid) {
        endDrag();
        return;
      }

      const { nodeId, type } = readDragData(e);
      const targetIndex = positional
        ? (droppedPosition === 'before' ? index : index + 1)
        : (getIndex ? getIndex() : 0);

      if (nodeId && nodeId !== selfId) {
        moveNode(nodeId, zoneKey, targetIndex);
      } else if (type) {
        insertNode(createNode(config, type), zoneKey, targetIndex);
      }
      endDrag();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locked, positional, index, getIndex, zoneKey, config, selfId, position, moveNode, insertNode, endDrag]
  );

  return { position, axis, isDragOver, onDragOver, onDragLeave, onDrop };
};
