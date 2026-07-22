/**
 * Runtime CSS for interactions. Injected once by TecofRender (published pages)
 * and mirrored at the end of styles.css (editor canvas). Kept tiny and harmless
 * when unused.
 *
 *   - `.tecof-fx-hidden` — what show/hide/toggle actions and `_startHidden` nodes
 *     use to disappear.
 *   - `.tecof-fx-starthidden` — edit-mode-only hint that a node starts hidden
 *     (it stays visible + editable, marked with a dashed outline).
 */
export const INTERACTIONS_CSS = `
.tecof-fx-hidden { display: none !important; }
.tecof-fx-starthidden { outline: 1px dashed rgba(99, 102, 241, 0.55); outline-offset: 2px; }
`.trim();
