import React, { useEffect, useRef } from 'react';
import type { StudioConfig } from '../../types';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { useStudio } from '../context';
import { readDragData, createNode, createAutoScroller } from './dndUtils';
import { getDropAxis } from './useDropTarget';
import { nodeContentRect } from './nodeRect';
import {
  computeDropPosition,
  isValidTouchDrop,
  parseZoneAttr,
  targetDropIndex,
  type TouchDragPayload,
} from './touchDragModel';

/**
 * Unified delegated NATIVE (mouse) drop for the canvas — replaces the per-node
 * and per-container `useDropTarget`. One set of dragover/dragleave/drop/dragend
 * listeners on the iframe document resolves the innermost valid target (node OR
 * zone) via `elementFromPoint` + an inner→outer walk — exactly what TouchDragLayer
 * does for touch — and reuses the same rules (`isValidTouchDrop`), index math
 * (`targetDropIndex`), alignment guides (`uiStore.dropHover` → DragGuides) and
 * engine ops (`moveNode`/`insertNode`). Delegating the drop TARGET is what lets
 * nodes render without a per-node wrapper carrying drop handlers.
 *
 * Installed via a hidden anchor component so it captures the studio `config`
 * (needed by the drop rules) and resolves the iframe document from its own
 * `ownerDocument`, like TouchDragLayer.
 */

interface ResolvedDrop {
  zoneKey: string | undefined;
  /** For positional targets: the target node's index in its zone. */
  index: number;
  positional?: { targetId: string; axis: 'x' | 'y'; position: 'before' | 'after' };
}

function installNativeDrop(
  doc: Document,
  config: StudioConfig,
  isEditMode: () => boolean
): () => void {
  const scroller = createAutoScroller(
    () => (doc.scrollingElement ?? doc.documentElement) as HTMLElement | null
  );
  let dragOverZone: Element | null = null;

  const clearZone = () => {
    dragOverZone?.classList.remove('is-touch-dragover');
    dragOverZone = null;
  };
  const clearAll = () => {
    scroller.stop();
    clearZone();
    const ui = useUiStore.getState();
    if (ui.dropHover) ui.setDropHover(null);
  };

  const payloadOf = (e: DragEvent): TouchDragPayload | null => {
    const { nodeId, type } = readDragData(e);
    if (nodeId) return { kind: 'node', nodeId };
    if (type) return { kind: 'block', type };
    return null;
  };

  // Innermost-out walk: prefer a zone nested inside the hovered node over the node
  // itself, then outer containers, until one accepts the drag (mirrors native
  // bubbling + TouchDragLayer). Node wrappers carry BOTH data-tecof-id and their
  // parent data-tecof-zone; equality means "over the node itself".
  const resolve = (e: DragEvent, payload: TouchDragPayload): ResolvedDrop | null => {
    const hit = doc.elementFromPoint(e.clientX, e.clientY);
    if (!hit) return null;
    const docModel = useEditorStore.getState().document;
    const selfId = payload.kind === 'node' ? payload.nodeId : null;
    const point = { x: e.clientX, y: e.clientY };
    let el: Element | null = hit;
    while (el) {
      const nodeEl: HTMLElement | null = el.closest<HTMLElement>('[data-tecof-id]');
      const zoneEl: HTMLElement | null = el.closest<HTMLElement>('[data-tecof-zone]');
      const candidate: HTMLElement | null =
        nodeEl && zoneEl ? (nodeEl.contains(zoneEl) ? zoneEl : nodeEl) : (nodeEl ?? zoneEl);
      if (!candidate) return null;
      const candidateId = candidate.getAttribute('data-tecof-id');
      if (candidate === nodeEl && candidateId && candidateId !== selfId) {
        const zoneKey = parseZoneAttr(candidate.getAttribute('data-tecof-zone'));
        if (isValidTouchDrop(config, docModel, payload, zoneKey, candidateId)) {
          const axis = getDropAxis(candidate);
          return {
            zoneKey,
            index: Number(candidate.getAttribute('data-tecof-index') ?? 0),
            positional: {
              targetId: candidateId,
              axis,
              position: computeDropPosition(axis, nodeContentRect(candidate), point),
            },
          };
        }
      } else if (candidate === zoneEl) {
        const zoneKey = parseZoneAttr(candidate.getAttribute('data-tecof-zone'));
        if (isValidTouchDrop(config, docModel, payload, zoneKey)) {
          return { zoneKey, index: targetDropIndex(docModel, { zoneKey }) };
        }
      }
      el = candidate.parentElement;
    }
    return null;
  };

  const onDragOver = (e: DragEvent) => {
    if (!isEditMode()) return;
    const payload = payloadOf(e);
    if (!payload) return;
    const target = resolve(e, payload);
    if (!target) {
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
      clearAll();
      return;
    }
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = payload.kind === 'node' ? 'move' : 'copy';
    scroller.update(e.clientY);
    const ui = useUiStore.getState();
    if (target.positional) {
      clearZone();
      ui.setDropHover({
        targetId: target.positional.targetId,
        zoneKey: target.zoneKey,
        position: target.positional.position,
        axis: target.positional.axis,
      });
    } else {
      ui.setDropHover(null);
      const zoneEl = doc.querySelector(`[data-tecof-zone="${target.zoneKey ?? 'root'}"]`);
      if (zoneEl !== dragOverZone) {
        clearZone();
        if (zoneEl) {
          zoneEl.classList.add('is-touch-dragover');
          dragOverZone = zoneEl;
        }
      }
    }
  };

  const onDragLeave = (e: DragEvent) => {
    if (e.relatedTarget) return; // fires constantly; only clear when leaving the doc
    clearAll();
  };

  const onDrop = (e: DragEvent) => {
    if (!isEditMode()) return;
    const payload = payloadOf(e);
    const store = useEditorStore.getState();
    if (!payload) {
      clearAll();
      return;
    }
    const target = resolve(e, payload);
    clearAll();
    if (!target) {
      store.endDrag();
      return;
    }
    e.preventDefault();
    const index = target.positional
      ? target.positional.position === 'before'
        ? target.index
        : target.index + 1
      : target.index;
    if (payload.kind === 'node') store.moveNode(payload.nodeId, target.zoneKey, index);
    else store.insertNode(createNode(config, payload.type), target.zoneKey, index);
    store.endDrag();
  };

  const onDragEnd = () => clearAll();

  doc.addEventListener('dragover', onDragOver);
  doc.addEventListener('dragleave', onDragLeave);
  doc.addEventListener('drop', onDrop);
  doc.addEventListener('dragend', onDragEnd);
  return () => {
    doc.removeEventListener('dragover', onDragOver);
    doc.removeEventListener('dragleave', onDragLeave);
    doc.removeEventListener('drop', onDrop);
    doc.removeEventListener('dragend', onDragEnd);
    clearAll();
  };
}

/**
 * Mounts the delegated native drop on the canvas iframe document (edit mode only).
 * Rendered inside the Frame, like TouchDragLayer/DragGuides, so its own
 * `ownerDocument` is the iframe document.
 */
export const CanvasNativeDrop: React.FC = () => {
  const { config } = useStudio();
  const anchorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const doc = anchorRef.current?.ownerDocument;
    if (!doc) return;
    return installNativeDrop(doc, config, () => useUiStore.getState().mode === 'edit');
  }, [config]);
  return <div ref={anchorRef} style={{ display: 'none' }} aria-hidden="true" />;
};
