import React, { useLayoutEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import {
  computeDragGuides,
  pickNeighbourEdges,
  type DragGuideModel,
  type GuideRect,
} from './dragGuideModel';

const toGuideRect = (r: DOMRect): GuideRect => ({
  top: r.top,
  left: r.left,
  width: r.width,
  height: r.height,
});

/**
 * Drag-time smart alignment guides (Figma-style). While a drag hovers a
 * positional target (`uiStore.dropHover`, published by useDropTarget), draws —
 * INSIDE the canvas iframe, fixed-position, non-interactive:
 *
 *   - a full-width insertion line across the flow container,
 *   - the container's content-edge alignment lines,
 *   - px distance badges from the insertion line to the neighbouring siblings
 *     (falling back to the container edge at the very start/end).
 *
 * Neighbours are resolved from the DOCUMENT model (the hovered zone's node
 * list, dragged node excluded) and measured in the DOM via `data-tecof-id` —
 * geometry itself lives in the pure `dragGuideModel.ts`. The wrapper div's
 * `ownerDocument` is the iframe document (this code runs in the parent realm,
 * so the `document` global would be the wrong one).
 */
export const DragGuides = () => {
  const dropHover = useUiStore((s) => s.dropHover);
  const dragActive = useEditorStore((s) => s.drag != null);
  const draggedId = useEditorStore((s) => (s.drag as { id?: string } | null)?.id ?? null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [model, setModel] = useState<DragGuideModel | null>(null);
  // Autoscroll moves content under a hover that doesn't change; a capture-phase
  // scroll listener bumps this tick to force a re-measure.
  const [scrollTick, setScrollTick] = useState(0);

  useLayoutEffect(() => {
    const doc = rootRef.current?.ownerDocument;
    if (!doc || !dragActive || !dropHover) {
      setModel(null);
      return;
    }

    const onScroll = () => setScrollTick((t) => t + 1);
    doc.addEventListener('scroll', onScroll, { capture: true, passive: true });

    const { targetId, zoneKey, position, axis } = dropHover;
    const target = doc.querySelector(`[data-tecof-id="${targetId}"]`);
    const container = doc.querySelector(`[data-tecof-zone="${zoneKey ?? 'root'}"]`);
    if (!target || !container) {
      setModel(null);
      return () => doc.removeEventListener('scroll', onScroll, true);
    }

    const targetRect = target.getBoundingClientRect();
    const lineAt =
      axis === 'y'
        ? position === 'before' ? targetRect.top : targetRect.bottom
        : position === 'before' ? targetRect.left : targetRect.right;

    // Sibling rects from the hovered list (document model), dragged node excluded.
    const state = useEditorStore.getState();
    const list = zoneKey ? state.document.zones[zoneKey] ?? [] : state.document.content;
    const siblings: GuideRect[] = [];
    for (const node of list) {
      if (node.props.id === draggedId) continue;
      const el = doc.querySelector(`[data-tecof-id="${node.props.id}"]`);
      if (el) siblings.push(toGuideRect(el.getBoundingClientRect()));
    }

    const { prevEdge, nextEdge } = pickNeighbourEdges(axis, lineAt, siblings);
    setModel(
      computeDragGuides({
        axis,
        lineAt,
        container: toGuideRect(container.getBoundingClientRect()),
        prevEdge,
        nextEdge,
      }),
    );

    return () => doc.removeEventListener('scroll', onScroll, true);
  }, [dropHover, dragActive, draggedId, scrollTick]);

  return (
    <div ref={rootRef} className="tecof-drag-guides" aria-hidden="true">
      {model && (
        <>
          {model.edges.map((edge, i) => (
            <div key={`e${i}`} className="tecof-drag-guide-edge" style={edge} />
          ))}
          <div className="tecof-drag-guide-line" style={model.line} />
          {model.badges.map((badge, i) => (
            <div key={`b${i}`} className="tecof-drag-guide-badge" style={{ top: badge.top, left: badge.left }}>
              {badge.value}px
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default DragGuides;
