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

/**
 * Elements whose NATIVE default action would take the user away from — or
 * submit — the page: link navigation and form submission. In edit mode these
 * must stay inert so a stray click selects the node instead of navigating the
 * canvas iframe off the page being edited. (`button` with no `type` defaults to
 * a form submit; `type="button"` has no default, so blocking it is a harmless
 * no-op — matching them all keeps the rule simple.)
 */
const NATIVE_ACTION_SELECTOR =
  'a[href], area[href], button, input[type="submit"], input[type="reset"], input[type="image"]';

/**
 * Given an event target, returns the nearest ancestor (or the target itself)
 * whose native default action should be blocked while editing, or `null` when
 * there is nothing to block. Overlay portals opt fully out: their controls stay
 * live in edit mode, so a portal descendant always returns `null`.
 *
 * Pure and DOM-light — only calls `Element.closest`, so it's unit-testable with
 * a duck-typed target.
 */
export function findBlockableInteraction(target: EventTarget | null): Element | null {
  if (!target || typeof (target as Element).closest !== 'function') return null;
  const el = target as Element;
  if (el.closest(`[${OVERLAY_PORTAL_ATTR}]`)) return null;
  return el.closest(NATIVE_ACTION_SELECTOR);
}

/**
 * Installs the edit-mode interaction guard on a canvas document. While
 * `isEditMode()` is true, it cancels the native default of link clicks
 * (`click`/`auxclick` — plain and middle-click) and form submissions (`submit`,
 * e.g. Enter inside an input) that originate outside an overlay portal, so the
 * canvas never navigates away or submits while the user is editing.
 *
 * Listeners run in the CAPTURE phase and only call `preventDefault()` — never
 * `stopPropagation()`. That cancels the browser's default action while leaving
 * the editor's own bubble-phase handlers (node selection, host postMessage)
 * completely untouched. In preview mode `isEditMode()` returns false and the
 * canvas behaves exactly like the live site.
 *
 * Note: JS-driven navigation (a `<button onClick={() => router.push(...)}>`)
 * cannot be cancelled from here — components should honour the `editMode` /
 * `puck.isEditing` prop for that, or register the control as an overlay portal.
 *
 * @returns a cleanup function that removes every listener it added.
 */
export function installCanvasInteractionGuard(
  doc: Document,
  isEditMode: () => boolean
): () => void {
  const onActivate = (e: Event) => {
    if (!isEditMode()) return;
    if (findBlockableInteraction(e.target)) {
      e.preventDefault();
    }
  };
  const onSubmit = (e: Event) => {
    if (!isEditMode()) return;
    if (isInsideOverlayPortal(e.target)) return;
    e.preventDefault();
  };
  doc.addEventListener('click', onActivate, true);
  doc.addEventListener('auxclick', onActivate, true);
  doc.addEventListener('submit', onSubmit, true);
  return () => {
    doc.removeEventListener('click', onActivate, true);
    doc.removeEventListener('auxclick', onActivate, true);
    doc.removeEventListener('submit', onSubmit, true);
  };
}
