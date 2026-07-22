/**
 * Measuring a node's rendered box in the editor canvas.
 *
 * `data-tecof-id` sits on the `.tecof-node-wrapper`, which is a full-width block —
 * measuring IT would make every selection outline span the whole row. So we
 * measure the rendered COMPONENT instead: the wrapper's element children ARE the
 * component's root element(s) (NodeErrorBoundary passes children straight
 * through, adding no DOM). We take the UNION of their rects, which:
 *   - hugs a narrow component (single root),
 *   - covers a multi-root / Fragment component (`<><a/><b/></>`),
 *   - skips zero-size roots (`<style>`, hidden inputs, `display:contents` roots),
 *   - falls back to the wrapper's own box when the component renders no
 *     measurable element (text-only / null render) — a real rect, never 0x0.
 *
 * Inline nodes carry `data-tecof-id` on their own root (no wrapper), so they are
 * already the right element and measure directly.
 *
 * The union geometry is a pure function ({@link unionBounds}) so it is unit-
 * testable without a DOM; the rest is a thin DOM shell.
 */

export interface RectBounds {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

/**
 * Union of the given rects, ignoring zero-area (degenerate) ones. Returns null
 * when nothing measurable remains. Pure — no DOM.
 */
export const unionBounds = (rects: readonly RectBounds[]): RectBounds | null => {
  let u: RectBounds | null = null;
  for (const r of rects) {
    if (r.right - r.left <= 0 || r.bottom - r.top <= 0) continue;
    if (!u) u = { top: r.top, left: r.left, right: r.right, bottom: r.bottom };
    else {
      if (r.top < u.top) u.top = r.top;
      if (r.left < u.left) u.left = r.left;
      if (r.right > u.right) u.right = r.right;
      if (r.bottom > u.bottom) u.bottom = r.bottom;
    }
  }
  return u;
};

export interface NodeMeasurement {
  /** Tight bounds of the rendered component (union of its root elements). */
  rect: DOMRect;
  /**
   * The single element to read the box model (padding/margin) from — the largest
   * root for a multi-root component, or the element itself when there's no
   * wrapper. Spacing handles need a single element; the largest root is the best
   * single approximation.
   */
  primary: Element;
}

/**
 * Measure a node element. Nodes now render WRAPPERLESS — the element carrying the
 * node identity IS the component's own root — so we measure it directly (no more
 * measuring a full-width wrapper's children). Multi-root components expose only
 * their marked root; that root is what's measured.
 */
export const measureNode = (el: Element): NodeMeasurement => ({
  rect: el.getBoundingClientRect(),
  primary: el,
});

/** The component-tight measurement rect for a node element. */
export const nodeContentRect = (el: Element): DOMRect => measureNode(el).rect;
