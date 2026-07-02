import type React from 'react';
import { generateId } from '../../engine/ids';
import type { StudioConfig, TecofNode } from '../../types';

export const TECOF_NODE_ID = 'application/tecof-node-id';
export const TECOF_BLOCK_TYPE = 'application/tecof-block-type';

/**
 * Build a fresh node for a palette component type, with a unique id + cloned
 * defaults. `overrideProps` (e.g. a saved/shared component snapshot) is cloned
 * over the defaults. The generated id is applied LAST so neither defaultProps
 * nor overrides can smuggle in a stale id — inserting the same component twice
 * must never produce duplicate node ids.
 */
export function createNode(
  config: StudioConfig | undefined,
  type: string,
  overrideProps?: Record<string, unknown>,
): TecofNode {
  const compConfig = config?.components?.[type];
  const defaultProps = compConfig?.defaultProps || {};
  return {
    type,
    props: {
      ...JSON.parse(JSON.stringify(defaultProps)),
      ...(overrideProps ? JSON.parse(JSON.stringify(overrideProps)) : {}),
      id: generateId(),
    },
  };
}

/**
 * Structural event shape so both React synthetic events and native DragEvents
 * (inline nodes bind listeners natively) work without casts.
 */
interface DragDataEvent {
  dataTransfer: DataTransfer | null;
}

/** Read the drag payload (existing node id OR new block type) off a drag event. */
export function readDragData(e: DragDataEvent): { nodeId: string; type: string } {
  if (!e.dataTransfer) return { nodeId: '', type: '' };
  return {
    nodeId: e.dataTransfer.getData(TECOF_NODE_ID),
    type: e.dataTransfer.getData(TECOF_BLOCK_TYPE),
  };
}

export function writeDragData(e: DragDataEvent, payload: { nodeId?: string; type?: string }) {
  if (!e.dataTransfer) return;
  if (payload.nodeId) {
    e.dataTransfer.setData(TECOF_NODE_ID, payload.nodeId);
  }
  if (payload.type) {
    e.dataTransfer.setData(TECOF_BLOCK_TYPE, payload.type);
  }
}

export function getDragScrollContainer(e: React.DragEvent): HTMLElement | null {
  const ownerDoc = (e.currentTarget as HTMLElement).ownerDocument;
  return (ownerDoc.scrollingElement || ownerDoc.documentElement || ownerDoc.body) as HTMLElement | null;
}

/**
 * Auto-scroll a scrollable container while dragging near its top/bottom edges.
 * Returns a cleanup fn that stops the scroll loop. Call on dragover with the
 * current pointer Y; call the returned stopper on dragleave/drop/dragend.
 */
const EDGE = 64; // px hot-zone at each edge
const MAX_SPEED = 18; // px per frame

export function createAutoScroller(getContainer: () => HTMLElement | null) {
  let raf = 0;
  let velocity = 0;

  const getEdgeBounds = (el: HTMLElement) => {
    const doc = el.ownerDocument;
    const win = doc.defaultView;
    const isDocumentScroller =
      el === doc.documentElement ||
      el === doc.body ||
      el === doc.scrollingElement;

    if (isDocumentScroller && win) {
      return { top: 0, bottom: win.innerHeight };
    }

    return el.getBoundingClientRect();
  };

  const loop = () => {
    const el = getContainer();
    if (el && velocity !== 0) {
      el.scrollTop += velocity;
    }
    raf = requestAnimationFrame(loop);
  };

  const update = (clientY: number) => {
    const el = getContainer();
    if (!el) return;
    const rect = getEdgeBounds(el);
    if (clientY < rect.top + EDGE) {
      const ratio = (rect.top + EDGE - clientY) / EDGE;
      velocity = -Math.ceil(Math.min(1, ratio) * MAX_SPEED);
    } else if (clientY > rect.bottom - EDGE) {
      const ratio = (clientY - (rect.bottom - EDGE)) / EDGE;
      velocity = Math.ceil(Math.min(1, ratio) * MAX_SPEED);
    } else {
      velocity = 0;
    }
    if (!raf) loop();
  };

  const stop = () => {
    velocity = 0;
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  return { update, stop };
}

export function createEventAutoScroller() {
  let container: HTMLElement | null = null;
  const scroller = createAutoScroller(() => container);

  return {
    update(e: React.DragEvent) {
      container = getDragScrollContainer(e);
      scroller.update(e.clientY);
    },
    stop() {
      scroller.stop();
      container = null;
    },
  };
}
