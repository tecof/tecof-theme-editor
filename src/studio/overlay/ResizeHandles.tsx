import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../engine/store';
import { findNodeById } from '../../engine/zones';
import { STYLES_PROP, type NodeStyles } from '../style/types';
import { toArbitrary } from '../style/tokens';
import type { Coords } from './SpacingDragHandles';

/** Which edge/corner is being dragged: `e`=width, `s`=height, `se`=both. */
export type ResizeCorner = 'e' | 's' | 'se';

const CURSORS: Record<ResizeCorner, string> = {
  e: 'ew-resize',
  s: 'ns-resize',
  se: 'nwse-resize',
};

/** Minimum size a drag can shrink a node to (px). */
const MIN_SIZE = 16;

/**
 * Pure: apply a resize to a node's structured styles. Writes arbitrary
 * `w-[Npx]` / `h-[Npx]` tokens to the BASE layer only (breakpoint-specific sizing
 * is out of scope), mirroring how SpacingDragHandles commits. Styles are replaced
 * immutably so compileStyles' WeakMap cache invalidates on the new reference.
 */
export function resizeStyleUpdate(
  current: NodeStyles,
  corner: ResizeCorner,
  w: number,
  h: number,
): NodeStyles {
  const base = { ...current.base };
  if (corner === 'e' || corner === 'se') base.w = toArbitrary(`${Math.round(w)}px`);
  if (corner === 's' || corner === 'se') base.h = toArbitrary(`${Math.round(h)}px`);
  return { ...current, base };
}

interface DragState {
  corner: ResizeCorner;
  startW: number;
  startH: number;
  startClientX: number;
  startClientY: number;
  w: number;
  h: number;
  moved: boolean;
}

interface ResizeHandlesProps {
  nodeId: string;
  coords: Coords;
  /** Drag start/stop notification (overlay root gets the resize cursor). */
  onResizeChange: (corner: ResizeCorner | null) => void;
}

const HANDLES: readonly ResizeCorner[] = ['e', 's', 'se'];

/**
 * Webflow/Framer-style width/height resize. Right edge = width, bottom edge =
 * height, corner = both. One write per drag (on pointerup, undo-friendly); during
 * the drag only the overlay preview + size label update. Escape cancels.
 */
export const ResizeHandles = ({ nodeId, coords, onResizeChange }: ResizeHandlesProps) => {
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const captureRef = useRef<{ el: HTMLElement; pointerId: number } | null>(null);

  const endDrag = useCallback(
    (commit: boolean) => {
      const d = dragRef.current;
      const cap = captureRef.current;
      dragRef.current = null;
      captureRef.current = null;
      setDrag(null);
      onResizeChange(null);
      if (cap) {
        try {
          cap.el.releasePointerCapture(cap.pointerId);
        } catch {
          /* capture may already be gone */
        }
      }
      if (!d || !commit || !d.moved) return;

      const store = useEditorStore.getState();
      const details = findNodeById(store.document, nodeId);
      if (!details) return;
      const current = (details.node.props?.[STYLES_PROP] ?? {}) as NodeStyles;
      store.updateProps(nodeId, { [STYLES_PROP]: resizeStyleUpdate(current, d.corner, d.w, d.h) });
    },
    [nodeId, onResizeChange],
  );

  const handlePointerDown = (corner: ResizeCorner) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || dragRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    captureRef.current = { el, pointerId: e.pointerId };
    // coords overlay (host) px'idir; yazılacak w/h GERÇEK sayfa px'i olmalı —
    // canvas fit-scale'e bölerek gerçek boyuta çevrilir.
    const scale = coords.scale || 1;
    const startW = Math.round(coords.width / scale);
    const startH = Math.round(coords.height / scale);
    const next: DragState = {
      corner,
      startW,
      startH,
      startClientX: e.clientX,
      startClientY: e.clientY,
      w: startW,
      h: startH,
      moved: false,
    };
    dragRef.current = next;
    setDrag(next);
    onResizeChange(corner);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const scale = coords.scale || 1;
    const dx = (e.clientX - d.startClientX) / scale;
    const dy = (e.clientY - d.startClientY) / scale;
    const w = d.corner === 's' ? d.w : Math.max(MIN_SIZE, d.startW + dx);
    const h = d.corner === 'e' ? d.h : Math.max(MIN_SIZE, d.startH + dy);
    const moved = d.moved || dx !== 0 || dy !== 0;
    if (w === d.w && h === d.h && moved === d.moved) return;
    const next: DragState = { ...d, w, h, moved };
    dragRef.current = next;
    setDrag(next);
  };

  const handlePointerUp = () => endDrag(true);
  const handlePointerCancel = () => endDrag(false);

  const dragging = drag !== null;
  useEffect(() => {
    if (!dragging) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        endDrag(false);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [dragging, endDrag]);

  // Clear the overlay cursor if selection changes mid-drag.
  useEffect(() => () => onResizeChange(null), [onResizeChange]);

  return (
    <>
      {HANDLES.map((corner) => {
        if (drag && drag.corner !== corner) return null;
        return (
          <div
            key={corner}
            className={`tecof-resize-handle is-${corner}${drag?.corner === corner ? ' is-active' : ''}`}
            style={{ cursor: CURSORS[corner] }}
            onPointerDown={handlePointerDown(corner)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          />
        );
      })}

      {drag && (
        <>
          <div className="tecof-resize-preview" style={{ width: drag.w, height: drag.h }} />
          <div className="tecof-resize-label">
            {Math.round(drag.w)} × {Math.round(drag.h)}
          </div>
        </>
      )}
    </>
  );
};

export default ResizeHandles;
