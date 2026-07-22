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
 * Scope (this step): SELECT only, and only for NON-INLINE nodes — inline
 * components wire their own handlers via useInlineDragRef and stopPropagation, so
 * their clicks never reach this listener. Hover stays per-node for now.
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

  doc.addEventListener('click', onClick);
  return () => doc.removeEventListener('click', onClick);
}
