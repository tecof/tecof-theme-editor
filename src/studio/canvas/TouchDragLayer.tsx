import React, { useEffect, useRef } from 'react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { useStudio } from '../context';
import { createAutoScroller, createNode } from './dndUtils';
import { getDropAxis } from './useDropTarget';
import { isInsideOverlayPortal } from './overlayPortal';
import { findNodeById } from '../../engine/zones';
import {
  computeDropPosition,
  computeLayerDropPos,
  isValidTouchDrop,
  parseZoneAttr,
  targetDropIndex,
  type TouchDragPayload,
  type TouchDropTarget,
} from './touchDragModel';

/**
 * Touch / pen drag-and-drop layer (pointer events).
 *
 * Native HTML5 DnD doesn't exist on touch devices, so this layer re-implements
 * the drag interaction with pointer events while reusing every existing piece
 * of the DnD stack: the engine drag state (`beginDrag`/`endDrag`), the drop
 * rules (`isValidTouchDrop` → `engine/rules.ts`), the alignment guides
 * (`uiStore.dropHover` → `DragGuides`), and the same `data-tecof-*` DOM
 * contract the native path renders.
 *
 * Interaction model (matches iOS/Android list editing conventions):
 *   - LONG-PRESS (~300ms, still finger) on a canvas node, a palette block or a
 *     layers-panel row starts the drag — a quick tap or an early move stays a
 *     tap/scroll.
 *   - While dragging, a floating label ghost follows the finger, the hovered
 *     target shows the same affordances as mouse DnD, and the canvas
 *     auto-scrolls near its edges.
 *   - Release drops (innermost valid target wins); pointercancel/Escape aborts.
 *
 * Mouse drags are untouched — `pointerType === 'mouse'` is ignored entirely,
 * the native HTML5 path keeps handling it.
 *
 * Rendered INSIDE the canvas iframe (like DragGuides) so its ref resolves the
 * iframe document; palette sources live in the host document, so listeners are
 * attached to both documents. Remounts with the iframe on viewport switches.
 */

const LONG_PRESS_MS = 300;
/** Finger drift allowed before the long-press is treated as a scroll intent. */
const MOVE_TOLERANCE_PX = 8;

interface TrackingState {
  pointerId: number;
  payload: TouchDragPayload;
  label: string;
  /** Document the source element lives in (host for palette, iframe for nodes). */
  sourceDoc: Document;
  sourceEl: HTMLElement;
  startX: number;
  startY: number;
  timer: number;
  active: boolean;
}

export const TouchDragLayer = () => {
  const probeRef = useRef<HTMLSpanElement | null>(null);
  const { config, readOnly } = useStudio();
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const iframeDoc = probeRef.current?.ownerDocument;
    const hostDoc = typeof document !== 'undefined' ? document : null;
    if (!iframeDoc || !hostDoc || readOnly) return;

    let tracking: TrackingState | null = null;
    let ghost: HTMLElement | null = null;
    let dragOverEl: Element | null = null;
    let layerRowEl: Element | null = null;
    let lastTarget: TouchDropTarget | null = null;
    const scroller = createAutoScroller(
      () => (iframeDoc.scrollingElement as HTMLElement | null) ?? iframeDoc.documentElement
    );
    // Layers paneli host dokümanda kendi kabında kayar — ikinci scroller onun.
    let hostScrollEl: HTMLElement | null = null;
    const hostScroller = createAutoScroller(() => hostScrollEl);

    const findScrollableAncestor = (el: HTMLElement | null): HTMLElement | null => {
      let cur = el;
      while (cur) {
        if (cur.scrollHeight > cur.clientHeight + 1) {
          const overflowY = cur.ownerDocument.defaultView?.getComputedStyle(cur).overflowY;
          if (overflowY === 'auto' || overflowY === 'scroll') return cur;
        }
        cur = cur.parentElement;
      }
      return null;
    };

    /** Iframe'in host rect'i + fit-scale oranı (görünen / layout genişliği). */
    const getIframeMetrics = (): { rect: DOMRect; scale: number } | null => {
      const iframe = hostDoc.querySelector<HTMLIFrameElement>('.tecof-canvas-viewport iframe');
      if (!iframe) return null;
      const rect = iframe.getBoundingClientRect();
      const scale = iframe.clientWidth > 0 ? rect.width / iframe.clientWidth : 1;
      return { rect, scale };
    };

    const getIframeRect = (): DOMRect | null => getIframeMetrics()?.rect ?? null;

    /** Event client coords → host-viewport coords (iframe events get offset + scale). */
    const toHostPoint = (e: PointerEvent): { x: number; y: number } => {
      if ((e.target as Node | null)?.ownerDocument !== iframeDoc) {
        return { x: e.clientX, y: e.clientY };
      }
      const metrics = getIframeMetrics();
      return metrics
        ? { x: e.clientX * metrics.scale + metrics.rect.left, y: e.clientY * metrics.scale + metrics.rect.top }
        : { x: e.clientX, y: e.clientY };
    };

    const clearDragOver = () => {
      dragOverEl?.classList.remove('is-touch-dragover');
      dragOverEl = null;
    };

    const clearLayerRow = () => {
      layerRowEl?.classList.remove('is-drop-top', 'is-drop-bottom', 'is-drop-inside');
      layerRowEl = null;
    };

    const preventTouchScroll = (e: TouchEvent) => {
      if (tracking?.active) e.preventDefault();
    };
    const preventDuringTracking = (e: Event) => {
      if (tracking) e.preventDefault();
    };

    const cleanup = () => {
      if (!tracking) return;
      window.clearTimeout(tracking.timer);
      try {
        tracking.sourceEl.releasePointerCapture(tracking.pointerId);
      } catch {
        /* capture may never have been set */
      }
      ghost?.remove();
      ghost = null;
      clearDragOver();
      clearLayerRow();
      scroller.stop();
      hostScroller.stop();
      hostScrollEl = null;
      useUiStore.getState().setDropHover(null);
      if (tracking.active) useEditorStore.getState().endDrag();
      tracking = null;
      lastTarget = null;
    };

    const activate = () => {
      if (!tracking || tracking.active) return;
      tracking.active = true;

      const { payload } = tracking;
      useEditorStore
        .getState()
        .beginDrag(payload.kind === 'node' ? { id: payload.nodeId } : { type: payload.type });

      // From here on the gesture owns the finger: block native scrolling.
      try {
        tracking.sourceEl.setPointerCapture(tracking.pointerId);
      } catch {
        /* fine — document-level listeners still track the pointer */
      }

      ghost = hostDoc.createElement('div');
      ghost.className = 'tecof-drag-ghost is-touch';
      ghost.textContent = tracking.label;
      hostDoc.body.appendChild(ghost);
      positionGhost(tracking.startX, tracking.startY);

      // Subtle haptic tick where supported (Android Chrome).
      (navigator as { vibrate?: (ms: number) => void }).vibrate?.(10);
    };

    const positionGhost = (hostX: number, hostY: number) => {
      if (!ghost) return;
      ghost.style.top = `${hostY + 14}px`;
      ghost.style.left = `${hostX + 14}px`;
    };

    /** Set by resolveLayerTarget for publishTarget's row-class visuals. */
    let layerRowCandidate: Element | null = null;

    /**
     * Drop target in the HOST document: a layers-panel row. Same tree-row
     * semantics as the mouse path (top/bottom reorder, middle-third = inside).
     */
    const resolveLayerTarget = (hostPoint: { x: number; y: number }): TouchDropTarget | null => {
      if (!tracking) return null;
      const row = hostDoc
        .elementFromPoint(hostPoint.x, hostPoint.y)
        ?.closest<HTMLElement>('[data-tecof-layer-id]');
      if (!row) return null;

      const rowId = row.getAttribute('data-tecof-layer-id')!;
      const insideZoneKey = row.getAttribute('data-tecof-layer-inside') || undefined;
      const doc = useEditorStore.getState().document;
      const cfg = configRef.current;
      const { payload } = tracking;
      const pos = computeLayerDropPos(row.getBoundingClientRect(), hostPoint.y, !!insideZoneKey);

      if (pos === 'inside' && insideZoneKey) {
        if (!isValidTouchDrop(cfg, doc, payload, insideZoneKey, rowId)) return null;
        layerRowCandidate = row;
        return {
          zoneKey: insideZoneKey,
          index: targetDropIndex(doc, { zoneKey: insideZoneKey }),
          layer: { pos },
        };
      }

      const entry = findNodeById(doc, rowId);
      if (!entry) return null;
      const zoneKey = entry.path.zoneKey;
      if (!isValidTouchDrop(cfg, doc, payload, zoneKey, rowId)) return null;
      layerRowCandidate = row;
      return {
        zoneKey,
        index: pos === 'top' ? entry.path.index : entry.path.index + 1,
        layer: { pos },
      };
    };

    /** Resolve the drop target under the finger via iframe hit-testing. */
    const resolveTarget = (hostPoint: { x: number; y: number }): TouchDropTarget | null => {
      layerRowCandidate = null;
      const metrics = getIframeMetrics();
      if (!metrics || !tracking) return null;
      const { rect, scale } = metrics;
      if (
        hostPoint.x < rect.left ||
        hostPoint.x > rect.right ||
        hostPoint.y < rect.top ||
        hostPoint.y > rect.bottom
      ) {
        // Parmak canvas dışında: katman paneli satırları da geçerli hedeftir.
        return resolveLayerTarget(hostPoint);
      }

      // Host px → iframe'in GERÇEK (layout) px'i: fit-scale'e böl.
      const point = {
        x: (hostPoint.x - rect.left) / scale,
        y: (hostPoint.y - rect.top) / scale,
      };
      const hit = iframeDoc.elementFromPoint(point.x, point.y);
      if (!hit) return null;

      const doc = useEditorStore.getState().document;
      const cfg = configRef.current;
      const { payload } = tracking;
      const selfId = payload.kind === 'node' ? payload.nodeId : null;

      // Innermost-out walk mirrors native bubbling: a node wrapper first (its
      // OWN zones sit deeper in the DOM, so `closest` naturally prefers an
      // inner zone when the finger is over one), then container zones outward
      // until something accepts the drag.
      let el: Element | null = hit;
      while (el) {
        const nodeEl: HTMLElement | null = el.closest<HTMLElement>('[data-tecof-id]');
        const zoneEl: HTMLElement | null = el.closest<HTMLElement>('[data-tecof-zone]');

        // Prefer whichever is deeper in the DOM (a zone inside the node vs the
        // node wrapper itself). Node wrappers carry BOTH attributes (their
        // parent zone), so equality means "over the node itself".
        const candidate: HTMLElement | null =
          nodeEl && zoneEl
            ? nodeEl.contains(zoneEl)
              ? zoneEl
              : nodeEl
            : nodeEl ?? zoneEl;
        if (!candidate) return null;

        const candidateId = candidate.getAttribute('data-tecof-id');
        if (candidate === nodeEl && candidateId && candidateId !== selfId) {
          const zoneKey = parseZoneAttr(candidate.getAttribute('data-tecof-zone'));
          if (isValidTouchDrop(cfg, doc, payload, zoneKey, candidateId)) {
            const axis = getDropAxis(candidate);
            return {
              zoneKey,
              index: Number(candidate.getAttribute('data-tecof-index') ?? 0),
              positional: {
                targetId: candidateId,
                axis,
                position: computeDropPosition(axis, candidate.getBoundingClientRect(), point),
              },
            };
          }
        } else if (candidate === zoneEl) {
          const zoneKey = parseZoneAttr(candidate.getAttribute('data-tecof-zone'));
          if (isValidTouchDrop(cfg, doc, payload, zoneKey)) {
            return { zoneKey, index: targetDropIndex(doc, { zoneKey }) };
          }
        }

        // Current candidate rejected — continue the walk from its parent.
        el = candidate.parentElement;
      }
      return null;
    };

    const publishTarget = (target: TouchDropTarget | null) => {
      lastTarget = target;
      const ui = useUiStore.getState();

      if (target?.layer && layerRowCandidate) {
        // Katman satırı hedefi: fare yolunun kullandığı AYNI satır sınıfları.
        clearDragOver();
        ui.setDropHover(null);
        const cls =
          target.layer.pos === 'inside'
            ? 'is-drop-inside'
            : target.layer.pos === 'top'
              ? 'is-drop-top'
              : 'is-drop-bottom';
        if (layerRowEl !== layerRowCandidate || !layerRowCandidate.classList.contains(cls)) {
          clearLayerRow();
          layerRowCandidate.classList.add(cls);
          layerRowEl = layerRowCandidate;
        }
        return;
      }
      clearLayerRow();

      if (target?.positional) {
        clearDragOver();
        ui.setDropHover({
          targetId: target.positional.targetId,
          zoneKey: target.zoneKey,
          position: target.positional.position,
          axis: target.positional.axis,
        });
        return;
      }
      ui.setDropHover(null);
      const zoneSelector = `[data-tecof-zone="${target?.zoneKey ?? 'root'}"]`;
      const el = target ? iframeDoc.querySelector(zoneSelector) : null;
      if (el !== dragOverEl) {
        clearDragOver();
        if (el) {
          el.classList.add('is-touch-dragover');
          dragOverEl = el;
        }
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (tracking || !e.isPrimary || (e.pointerType !== 'touch' && e.pointerType !== 'pen')) {
        return;
      }
      if (useUiStore.getState().mode === 'preview') return;
      const target = e.target as HTMLElement | null;
      if (!target || isInsideOverlayPortal(target)) return;

      const fromDoc = target.ownerDocument;
      let payload: TouchDragPayload | null = null;
      let sourceEl: HTMLElement | null = null;
      let label = '';

      if (fromDoc === iframeDoc) {
        // Canvas node: the wrapper's `draggable` attribute already encodes the
        // full "may this node be dragged" answer (readOnly + permissions).
        const nodeEl = target.closest<HTMLElement>('[data-tecof-id]');
        if (!nodeEl || nodeEl.getAttribute('draggable') !== 'true') return;
        const nodeId = nodeEl.getAttribute('data-tecof-id')!;
        const type = nodeEl.getAttribute('data-tecof-type') ?? '';
        payload = { kind: 'node', nodeId };
        sourceEl = nodeEl;
        label = configRef.current.components?.[type]?.label || type || 'Bileşen';
      } else {
        // Host panel: a palette block, or a layers-panel row.
        const blockEl = target.closest<HTMLElement>('[data-tecof-block-type]');
        const layerEl = blockEl ? null : target.closest<HTMLElement>('[data-tecof-layer-id]');
        if (blockEl) {
          const type = blockEl.getAttribute('data-tecof-block-type')!;
          payload = { kind: 'block', type };
          sourceEl = blockEl;
          label = configRef.current.components?.[type]?.label || type;
        } else if (layerEl && layerEl.getAttribute('draggable') === 'true') {
          const nodeId = layerEl.getAttribute('data-tecof-layer-id')!;
          const entry = findNodeById(useEditorStore.getState().document, nodeId);
          if (!entry) return;
          payload = { kind: 'node', nodeId };
          sourceEl = layerEl;
          const customName = entry.node.props._layerName;
          label =
            (typeof customName === 'string' && customName) ||
            configRef.current.components?.[entry.node.type]?.label ||
            entry.node.type;
        } else {
          return;
        }
      }

      const start = toHostPoint(e);
      tracking = {
        pointerId: e.pointerId,
        payload,
        label,
        sourceDoc: fromDoc,
        sourceEl,
        startX: start.x,
        startY: start.y,
        active: false,
        timer: window.setTimeout(activate, LONG_PRESS_MS),
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!tracking || e.pointerId !== tracking.pointerId) return;
      const point = toHostPoint(e);

      if (!tracking.active) {
        // Early movement = scroll/pan intent, not a drag: bail out silently.
        const drift = Math.hypot(point.x - tracking.startX, point.y - tracking.startY);
        if (drift > MOVE_TOLERANCE_PX) cleanup();
        return;
      }

      positionGhost(point.x, point.y);
      const target = resolveTarget(point);

      // Autoscroll whichever container the finger is actually over: the canvas
      // iframe, or the layers panel's own scroll container in the host doc.
      if (target?.layer && layerRowCandidate) {
        scroller.stop();
        hostScrollEl = findScrollableAncestor(layerRowCandidate as HTMLElement);
        hostScroller.update(point.y);
      } else {
        hostScroller.stop();
        hostScrollEl = null;
        const metrics = getIframeMetrics();
        if (metrics) scroller.update((point.y - metrics.rect.top) / metrics.scale);
      }

      publishTarget(target);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!tracking || e.pointerId !== tracking.pointerId) return;
      const wasActive = tracking.active;
      const target = lastTarget;
      const payload = tracking.payload;
      cleanup();
      if (!wasActive || !target) return;

      const state = useEditorStore.getState();
      // Layer-row targets resolve to a FINAL index; canvas targets re-derive it
      // at drop time (positional half / container end) from the fresh document.
      const index = target.layer
        ? target.index
        : targetDropIndex(state.document, {
            zoneKey: target.zoneKey,
            index: target.positional ? target.index : undefined,
            position: target.positional?.position,
          });
      if (payload.kind === 'node') {
        state.moveNode(payload.nodeId, target.zoneKey, index);
      } else {
        state.insertNode(createNode(configRef.current, payload.type), target.zoneKey, index);
      }
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (tracking && e.pointerId === tracking.pointerId) cleanup();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && tracking?.active) cleanup();
    };

    const docs = hostDoc === iframeDoc ? [hostDoc] : [hostDoc, iframeDoc];
    for (const doc of docs) {
      doc.addEventListener('pointerdown', onPointerDown, true);
      doc.addEventListener('pointermove', onPointerMove, true);
      doc.addEventListener('pointerup', onPointerUp, true);
      doc.addEventListener('pointercancel', onPointerCancel, true);
      doc.addEventListener('keydown', onKeyDown, true);
      // Non-passive: the browser must not start scrolling under an active drag,
      // and iOS's long-press callout / selection must not hijack the hold.
      doc.addEventListener('touchmove', preventTouchScroll, { passive: false, capture: true });
      doc.addEventListener('contextmenu', preventDuringTracking, true);
      doc.addEventListener('selectstart', preventDuringTracking, true);
    }

    return () => {
      cleanup();
      for (const doc of docs) {
        doc.removeEventListener('pointerdown', onPointerDown, true);
        doc.removeEventListener('pointermove', onPointerMove, true);
        doc.removeEventListener('pointerup', onPointerUp, true);
        doc.removeEventListener('pointercancel', onPointerCancel, true);
        doc.removeEventListener('keydown', onKeyDown, true);
        doc.removeEventListener('touchmove', preventTouchScroll, true);
        doc.removeEventListener('contextmenu', preventDuringTracking, true);
        doc.removeEventListener('selectstart', preventDuringTracking, true);
      }
    };
  }, [readOnly]);

  // Invisible probe: its ownerDocument is the canvas iframe's document.
  return <span ref={probeRef} style={{ display: 'none' }} aria-hidden="true" />;
};

export default TouchDragLayer;
