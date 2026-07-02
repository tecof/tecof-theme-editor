/**
 * Overlay Portal — keep specific interactive areas INSIDE a component usable
 * while editing (Puck's `registerOverlayPortal` equivalent).
 *
 * By default the editor canvas intercepts every click/double-click/drag on a
 * node: click selects it, double-click starts inline text editing, and drag
 * moves the node. Components with their own interactive chrome (tab headers,
 * slider arrows, accordion toggles) need those controls to actually work in
 * edit mode. Registering an element as an overlay portal opts it (and its
 * descendants) out of the editor's node handlers.
 *
 * Usage — the function is designed as a React ref callback (it tolerates
 * `null`, which React passes on unmount):
 *
 * ```tsx
 * render: ({ puck, tabs }) => (
 *   <div>
 *     {tabs.map((tab, i) => (
 *       <button key={i} ref={puck.registerOverlayPortal} onClick={() => setActive(i)}>
 *         {tab.title}
 *       </button>
 *     ))}
 *   </div>
 * )
 * ```
 *
 * Or, when you need the cleanup explicitly (e.g. a stable element you manage
 * yourself):
 *
 * ```tsx
 * <button
 *   ref={(el) => {
 *     portalCleanup.current?.();
 *     portalCleanup.current = puck.registerOverlayPortal(el);
 *   }}
 * >
 * ```
 */

export const OVERLAY_PORTAL_ATTR = 'data-tecof-portal';

/**
 * Marks `el` as an overlay portal: clicks inside it won't select the node,
 * double-clicks won't start inline editing, and dragging it won't start a
 * node drag. Returns a cleanup function that removes the marker.
 *
 * Safe to pass directly as a React ref callback — `null` is a no-op.
 */
export function registerOverlayPortal(el: HTMLElement | null): () => void {
  if (!el) return () => {};
  el.setAttribute(OVERLAY_PORTAL_ATTR, 'true');
  // The node wrapper is draggable; without this, grabbing the portal element
  // would still initiate a native drag of the wrapper.
  el.draggable = false;
  return () => {
    el.removeAttribute(OVERLAY_PORTAL_ATTR);
  };
}

/**
 * True when the event target sits inside a registered overlay portal.
 * Editor handlers use this to step aside and let the component handle it.
 */
export function isInsideOverlayPortal(target: EventTarget | null): boolean {
  if (!target || typeof (target as Element).closest !== 'function') return false;
  return (target as Element).closest(`[${OVERLAY_PORTAL_ATTR}]`) !== null;
}
