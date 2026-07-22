/**
 * Delegated canvas node interactions — one set of listeners on the iframe
 * document instead of per-node React handlers on a wrapper. This is the first
 * step toward a wrapperless canvas (editor DOM == published DOM): the marker
 * class travels on the rendered component itself, and a single delegated
 * listener resolves the node from `event.target.closest('.tecof-el')`.
 *
 * Mirrors installCanvasInteractionGuard (same iframe-doc install site in
 * Frame.tsx). Runs in the BUBBLE phase, so it composes with the capture-phase
 * guard (which only preventDefault's) and Frame's whitespace-deselect body click
 * (which finds `.tecof-node-wrapper` and steps aside).
 *
 * Scope (this step): SELECT + HOVER for NON-INLINE nodes. Inline components wire
 * their own handlers via useInlineDragRef and stopPropagation, so their clicks
 * never reach this listener; for hover, the delegated `mouseover` explicitly
 * steps aside when the pointer is over an inline node (it has `data-tecof-id` but
 * no `.tecof-el`) so it can't fight the inline node's own hover.
 */

import { useEditorStore } from '../../engine/store';
import { findNodeById } from '../../engine/zones';
import { isEmbedded, postToHost } from '../bridge';
import { isInsideOverlayPortal } from './overlayPortal';

/**
 * Stable marker class on a NON-INLINE node's rendered root — the delegation
 * anchor (`closest('.tecof-el')`). The node id lives in the companion
 * `tecof-node-<id>` class (already emitted for the interactions runtime).
 */
export const NODE_MARKER_CLASS = 'tecof-el';
const ID_PREFIX = 'tecof-node-';

/** Minimal element shape for {@link nodeIdFromEl} — testable without a DOM. */
interface ClassListed {
  classList: Iterable<string>;
}

/** Read a node id from an element's `tecof-node-<id>` marker class. */
export const nodeIdFromEl = (el: ClassListed | null): string | null => {
  if (!el) return null;
  for (const cls of Array.from(el.classList)) {
    if (cls.startsWith(ID_PREFIX)) return cls.slice(ID_PREFIX.length);
  }
  return null;
};

/**
 * Install delegated node selection on a canvas document. Returns a cleanup fn.
 * `isEditMode` gates it exactly like the guard (no selection in preview).
 */
export function installCanvasInteractions(doc: Document, isEditMode: () => boolean): () => void {
  const onClick = (e: MouseEvent) => {
    if (!isEditMode()) return;
    // Overlay portals (tab headers, slider arrows, …) keep their own click.
    if (isInsideOverlayPortal(e.target)) return;
    const el = (e.target as Element | null)?.closest?.(`.${NODE_MARKER_CLASS}`);
    if (!el) return; // whitespace → Frame's body click clears the selection
    const id = nodeIdFromEl(el);
    if (!id) return;

    const store = useEditorStore.getState();
    // Cmd/Ctrl/Shift-click toggles multi-selection; plain click single-selects.
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      store.toggleSelect(id);
      return;
    }
    store.selectNode(id);
    if (isEmbedded()) {
      const type = findNodeById(store.document, id)?.node.type ?? '';
      postToHost('puck:itemSelected', { item: { type, id } });
    }
  };

  // Hover resolves the INNERMOST node via the nearest `[data-tecof-id]` (not
  // `.tecof-el`, which would find a non-inline ANCESTOR when the pointer is over
  // an inline descendant). The nearest node is inline when its own element carries
  // `data-tecof-id` but is NOT the `.tecof-node-wrapper` — then its own handler
  // owns the hover and the delegation steps aside. Compares against the STORE's
  // hoveredId (not a local var) so moving through inline nodes never goes stale.
  const onOver = (e: MouseEvent) => {
    if (!isEditMode()) return;
    const target = e.target as Element | null;
    const nodeEl = target?.closest?.('[data-tecof-id]');
    const store = useEditorStore.getState();
    if (!nodeEl) {
      if (store.selection.hoveredId !== null) store.hoverNode(null); // whitespace
      return;
    }
    if (!nodeEl.classList.contains('tecof-node-wrapper')) return; // inline → its own
    const id = nodeEl.getAttribute('data-tecof-id');
    if (id && store.selection.hoveredId !== id) store.hoverNode(id);
  };

  // Pointer left the iframe entirely (relatedTarget null) → drop the hover.
  const onOut = (e: MouseEvent) => {
    if (e.relatedTarget) return;
    const store = useEditorStore.getState();
    if (store.selection.hoveredId !== null) store.hoverNode(null);
  };

  doc.addEventListener('click', onClick);
  doc.addEventListener('mouseover', onOver);
  doc.addEventListener('mouseout', onOut);
  return () => {
    doc.removeEventListener('click', onClick);
    doc.removeEventListener('mouseover', onOver);
    doc.removeEventListener('mouseout', onOut);
  };
}
