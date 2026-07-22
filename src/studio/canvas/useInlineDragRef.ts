import { useCallback, useRef } from 'react';
import type React from 'react';
import { setDragGhost } from './dragGhost';
import { writeDragData } from './dndUtils';
import { isInsideOverlayPortal } from './overlayPortal';
import type { TecofNode } from '../../types';
import type { DragPayload } from '../../engine/store';

/**
 * Options for {@link useInlineDragRef}. Handler fields use method syntax +
 * native/React event unions on purpose: method members are checked
 * bivariantly, so NodeRenderer can pass its existing React-event-typed
 * handlers while we invoke them with native events (inline nodes bind native
 * listeners on the component's own root element; the handlers only touch the
 * structural overlap of the two event shapes).
 */
interface UseInlineDragRefOptions {
  node: TecofNode;
  index: number;
  zoneKey?: string;
  locked: boolean;
  wrapperClassName: string;
  label: string;
  beginDrag(payload: DragPayload): void;
  endDrag(): void;
  handleMouseEnter(e: MouseEvent | React.MouseEvent): void;
  handleMouseLeave(e: MouseEvent | React.MouseEvent): void;
  handleClick(e: MouseEvent | React.MouseEvent): void;
}

/** Every event the inline root listens to — add/remove stays symmetric. */
const BOUND_EVENTS = [
  'mouseenter',
  'mouseleave',
  'click',
  'dragstart',
  'dragend',
] as const;

/**
 * Wires an INLINE component's own root element up as a full editor node:
 * data attributes, wrapper classes, drag source behaviour and all interaction
 * listeners — without an extra wrapper div.
 *
 * Listeners are attached/detached inside the ref callback itself (not in an
 * effect), so they always live on the CURRENT element: React can re-attach the
 * ref to a brand-new DOM element without any dep changing, which would leave an
 * effect-bound listener set on the detached element. The bound handler set is
 * created once and reads the latest callbacks/metadata through refs.
 */
export function useInlineDragRef(options: UseInlineDragRefOptions) {
  const { node, index, zoneKey, locked, wrapperClassName, label } = options;

  const nodeRef = useRef<HTMLElement | null>(null);

  // Latest callbacks + drag metadata, readable from the stable bound handlers.
  const callbacksRef = useRef(options);
  callbacksRef.current = options;
  const metaRef = useRef({ nodeId: node.props.id, label, locked });
  metaRef.current = { nodeId: node.props.id, label, locked };

  // One stable listener set for the hook's lifetime.
  const boundRef = useRef<Record<(typeof BOUND_EVENTS)[number], EventListener> | null>(null);
  if (!boundRef.current) {
    boundRef.current = {
      mouseenter: (e) => callbacksRef.current.handleMouseEnter(e as MouseEvent),
      mouseleave: (e) => callbacksRef.current.handleMouseLeave(e as MouseEvent),
      click: (e) => callbacksRef.current.handleClick(e as MouseEvent),
      dragstart: (e) => {
        const de = e as DragEvent;
        const meta = metaRef.current;
        if (meta.locked) return;
        // Dragging from inside an overlay portal must not move the node.
        // (Click/double-click guards live in the shared handlers themselves.)
        if (isInsideOverlayPortal(de.target)) {
          de.preventDefault();
          return;
        }
        writeDragData(de, { nodeId: meta.nodeId });
        if (de.dataTransfer) {
          de.dataTransfer.effectAllowed = 'move';
        }
        // setDragGhost only touches currentTarget/dataTransfer — structurally
        // identical between native and React drag events.
        setDragGhost(de as unknown as React.DragEvent, meta.label);
        callbacksRef.current.beginDrag({ id: meta.nodeId });
      },
      dragend: () => {
        if (!metaRef.current.locked) callbacksRef.current.endDrag();
      },
    };
  }

  const setRef = useCallback((el: HTMLElement | null) => {
    const bound = boundRef.current!;

    if (nodeRef.current) {
      const old = nodeRef.current;
      old.removeAttribute('data-tecof-id');
      old.removeAttribute('data-tecof-type');
      old.removeAttribute('data-tecof-index');
      old.removeAttribute('data-tecof-zone');
      old.removeAttribute('draggable');

      const classesToRemove = wrapperClassName.split(' ').filter(Boolean);
      if (classesToRemove.length > 0) {
        old.classList.remove(...classesToRemove);
      }
      for (const eventName of BOUND_EVENTS) {
        old.removeEventListener(eventName, bound[eventName]);
      }
    }

    if (el) {
      el.setAttribute('data-tecof-id', node.props.id);
      el.setAttribute('data-tecof-type', node.type);
      el.setAttribute('data-tecof-index', String(index));
      el.setAttribute('data-tecof-zone', zoneKey || 'root');

      if (!locked) {
        el.setAttribute('draggable', 'true');
      }

      const classesToAdd = wrapperClassName.split(' ').filter(Boolean);
      if (classesToAdd.length > 0) {
        el.classList.add(...classesToAdd);
      }
      for (const eventName of BOUND_EVENTS) {
        el.addEventListener(eventName, bound[eventName]);
      }
    }

    nodeRef.current = el;
  }, [node.props.id, node.type, index, zoneKey, locked, wrapperClassName]);

  return { setRef, nodeRef };
}
