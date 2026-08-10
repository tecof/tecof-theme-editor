/**
 * Pure geometry for the wrapperless insert-affordance overlay (Step 4c).
 *
 * The editor used to interleave `AddSectionButton` "+" dividers as real DOM
 * children between nodes, which perturbed theme structural selectors in slots
 * (`grid`, `space-y`/`divide` via `> * + *`, `:nth-child`). This module computes
 * where a "+" affordance should sit for every insertion position of a zone,
 * PURELY from measured rects — so the overlay can paint them from a separate,
 * out-of-flow layer and the zone's real DOM children stay exactly the published
 * set. Mirrors `dragGuideModel.ts`: all rects are iframe-native viewport space
 * (getBoundingClientRect inside the canvas iframe), rendered with position:fixed.
 */

export type Axis = 'x' | 'y';

export interface OverlayRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface ZoneAffordanceInput {
  /** Zone key; undefined = root content flow. */
  zoneKey?: string;
  /**
   * Fallback axis from the container's declared orientation
   * (`data-tecof-orientation="horizontal"` → 'x'). Used for the before-first /
   * after-last edge affordances where there is only one neighbour to measure.
   */
  zoneAxis: Axis;
  /** The zone container's viewport rect. */
  containerRect: OverlayRect;
  /**
   * Child node rects in DOCUMENT ORDER. `null` = the node exists in the store
   * but its element isn't measurable this frame (just mounted); its neighbours
   * still get affordances and — crucially — the insert INDEX stays aligned with
   * the store list (we never collapse indices on a skip).
   */
  childRects: Array<OverlayRect | null>;
  /** Root's trailing (after-last) affordance stays visible without hover. */
  alwaysLastVisible?: boolean;
}

export interface InsertAffordance {
  /** Stable-ish React key: `${zoneKey ?? 'root'}#${index}`. */
  key: string;
  zoneKey?: string;
  /** Insert position in the store list (0..n). */
  index: number;
  /** Divider normal: 'y' = a horizontal divider (stacked items); 'x' = vertical. */
  axis: Axis;
  /**
   * Fixed-position hover/click band. It IS the clickable target (the "+" pill and
   * guide line are CSS-centred within it), so it's centred on the divider line.
   */
  strip: OverlayRect;
  alwaysVisible: boolean;
}

/**
 * Hover/click band thickness across the divider normal (px, iframe-native). Kept
 * modest so the band steals as little of the adjacent components' edge as
 * possible (it sits ON TOP of them in the overlay) while staying easy to hover.
 */
export const STRIP_THICKNESS = 16;
/**
 * Floor for the hover band when the real gap is smaller than STRIP_THICKNESS.
 * The band must never exceed the ACTUAL gap by more than this — a full 16px band
 * centred on a 0px boundary steals an 8px edge from BOTH neighbours, which made
 * component-edge clicks open the add modal instead of selecting the node.
 */
export const MIN_THICKNESS = 6;
/** Minimum strip span along the divider so tiny items stay grabbable. */
const MIN_SPAN = 24;
/** Push the always-visible trailing affordance below the last item (into the tail spacer). */
const TRAIL_OFFSET = 16;

const right = (r: OverlayRect) => r.left + r.width;
const bottom = (r: OverlayRect) => r.top + r.height;
const clamp = (v: number, lo: number, hi: number) => (lo > hi ? v : Math.min(Math.max(v, lo), hi));

type Geom = { axis: Axis; strip: OverlayRect };

/**
 * Axis of the gap between two adjacent rects. They sit on the same ROW (→ a
 * VERTICAL divider, 'x') only when they overlap vertically but NOT horizontally;
 * otherwise they're stacked (→ a HORIZONTAL divider, 'y'). Requiring little
 * horizontal overlap keeps full-width stacked sections that overlap slightly (a
 * >1px negative margin) classified as 'y' instead of misfiring to 'x'. Handles
 * column, row AND grid-wrap uniformly (a grid wrap has ~no vertical overlap → 'y').
 */
export function gapAxis(a: OverlayRect, b: OverlayRect): Axis {
  const vOverlap = Math.min(bottom(a), bottom(b)) - Math.max(a.top, b.top);
  const hOverlap = Math.min(right(a), right(b)) - Math.max(a.left, b.left);
  return vOverlap > 1 && hOverlap <= 1 ? 'x' : 'y';
}

/**
 * Hover-band thickness clamped to the REAL gap between the neighbours: a wide
 * gap keeps the comfortable 16px band, a tight/flush/overlapping boundary
 * shrinks to a thin (but still hoverable) band so it doesn't cover the
 * neighbours' clickable edges.
 */
const bandThickness = (gap: number) =>
  gap >= STRIP_THICKNESS ? STRIP_THICKNESS : Math.max(MIN_THICKNESS, gap);

/** Affordance sitting in the gap BETWEEN two measured siblings. */
function betweenAffordance(a: OverlayRect, b: OverlayRect): Geom {
  const axis = gapAxis(a, b);
  if (axis === 'y') {
    const lineY = (bottom(a) + b.top) / 2;
    const thickness = bandThickness(b.top - bottom(a));
    const left = Math.min(a.left, b.left);
    const width = Math.max(Math.max(right(a), right(b)) - left, MIN_SPAN);
    return { axis, strip: { top: lineY - thickness / 2, left, width, height: thickness } };
  }
  const lineX = (right(a) + b.left) / 2;
  const thickness = bandThickness(b.left - right(a));
  const top = Math.min(a.top, b.top);
  const height = Math.max(Math.max(bottom(a), bottom(b)) - top, MIN_SPAN);
  return { axis, strip: { top, left: lineX - thickness / 2, width: thickness, height } };
}

/**
 * Affordance at a zone EDGE (before the first item / after the last), where only
 * one neighbour exists. The strip spans the container's cross-extent so it's easy
 * to grab; `offset` pushes an always-visible trailing affordance into the tail.
 * The divider line is clamped to keep the whole band inside the container, so a
 * section flush to the canvas top/edge doesn't render its "+" pill off-screen.
 */
function edgeAffordance(
  item: OverlayRect,
  container: OverlayRect,
  axis: Axis,
  side: 'before' | 'after',
  offset = 0,
): Geom {
  const half = STRIP_THICKNESS / 2;
  if (axis === 'y') {
    const raw = side === 'before' ? item.top : bottom(item) + offset;
    const lineY = clamp(raw, container.top + half, bottom(container) - half);
    const width = Math.max(container.width, MIN_SPAN);
    return { axis, strip: { top: lineY - half, left: container.left, width, height: STRIP_THICKNESS } };
  }
  const raw = side === 'before' ? item.left : right(item) + offset;
  const lineX = clamp(raw, container.left + half, right(container) - half);
  const height = Math.max(container.height, MIN_SPAN);
  return { axis, strip: { top: container.top, left: lineX - half, width: STRIP_THICKNESS, height } };
}

/**
 * Compute every insert affordance for one zone: positions 0..n where n =
 * childRects.length. Position k inserts BEFORE store child k (k=n → append).
 * Returns fewer than n+1 entries only when a position's neighbours are both
 * unmeasured this frame (transient, resolved on the next re-measure).
 */
export function computeZoneAffordances(input: ZoneAffordanceInput): InsertAffordance[] {
  const { zoneKey, zoneAxis, containerRect, childRects, alwaysLastVisible } = input;
  const n = childRects.length;
  const out: InsertAffordance[] = [];
  for (let k = 0; k <= n; k++) {
    const prev = k > 0 ? childRects[k - 1] : null;
    const next = k < n ? childRects[k] : null;
    const isLast = k === n;

    let geom: Geom | null = null;
    if (prev && next) {
      geom = betweenAffordance(prev, next);
    } else if (next) {
      geom = edgeAffordance(next, containerRect, zoneAxis, 'before');
    } else if (prev) {
      geom = edgeAffordance(prev, containerRect, zoneAxis, 'after', isLast && alwaysLastVisible ? TRAIL_OFFSET : 0);
    }
    if (!geom) continue; // both neighbours unmeasured this frame

    out.push({
      key: `${zoneKey ?? 'root'}#${k}`,
      zoneKey,
      index: k,
      axis: geom.axis,
      strip: geom.strip,
      alwaysVisible: !!(isLast && alwaysLastVisible),
    });
  }
  return out;
}
