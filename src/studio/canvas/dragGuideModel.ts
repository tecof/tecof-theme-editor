/**
 * Pure geometry for the drag-time smart alignment guides (DragGuides.tsx).
 *
 * Given the insertion line coordinate, the flow container's rect and the rects
 * of the neighbouring siblings (the elements the dragged node would land
 * between), this computes:
 *   - the full-width insertion guide line (spans the container, unlike the
 *     per-node drop indicator),
 *   - the container's content-edge alignment lines,
 *   - px distance badges from the insertion line to each neighbour (falling
 *     back to the container edge when inserting at the very start/end).
 *
 * All rects are viewport-space (getBoundingClientRect of the canvas iframe);
 * the output rects are rendered with `position: fixed` inside that iframe.
 * Kept DOM-free so it unit-tests in a plain node environment.
 */

export interface GuideRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface GuideBadge {
  /** Rounded px distance shown in the pill. */
  value: number;
  /** Badge centre, viewport coords (CSS translates by -50%,-50%). */
  top: number;
  left: number;
}

export interface DragGuideModel {
  line: GuideRect;
  edges: GuideRect[];
  badges: GuideBadge[];
}

/** Distances thinner than this are noise (the line touching a neighbour edge). */
const MIN_BADGE_GAP = 2;

export interface ComputeDragGuidesOptions {
  /** Flow axis of the container: 'y' = column (default), 'x' = row. */
  axis: 'x' | 'y';
  /** Insertion line coordinate: a Y for column flow, an X for row flow. */
  lineAt: number;
  /** The flow container's rect (the zone element). */
  container: GuideRect;
  /** Facing edge of the previous sibling (its bottom for 'y', right for 'x'). */
  prevEdge?: number | null;
  /** Facing edge of the next sibling (its top for 'y', left for 'x'). */
  nextEdge?: number | null;
}

export function computeDragGuides({
  axis,
  lineAt,
  container,
  prevEdge,
  nextEdge,
}: ComputeDragGuidesOptions): DragGuideModel {
  const badges: GuideBadge[] = [];

  if (axis === 'y') {
    // Column flow: horizontal insertion line + vertical container edges.
    const line: GuideRect = { top: lineAt - 1, left: container.left, width: container.width, height: 2 };
    const edges: GuideRect[] = [
      { top: container.top, left: container.left, width: 1, height: container.height },
      { top: container.top, left: container.left + container.width - 1, width: 1, height: container.height },
    ];

    const centerX = container.left + container.width / 2;
    const prev = prevEdge ?? container.top;
    const next = nextEdge ?? container.top + container.height;
    const prevGap = lineAt - prev;
    const nextGap = next - lineAt;
    if (prevGap >= MIN_BADGE_GAP) {
      badges.push({ value: Math.round(prevGap), left: centerX, top: (prev + lineAt) / 2 });
    }
    if (nextGap >= MIN_BADGE_GAP) {
      badges.push({ value: Math.round(nextGap), left: centerX, top: (lineAt + next) / 2 });
    }
    return { line, edges, badges };
  }

  // Row flow: vertical insertion line + horizontal container edges.
  const line: GuideRect = { top: container.top, left: lineAt - 1, width: 2, height: container.height };
  const edges: GuideRect[] = [
    { top: container.top, left: container.left, width: container.width, height: 1 },
    { top: container.top + container.height - 1, left: container.left, width: container.width, height: 1 },
  ];

  const centerY = container.top + container.height / 2;
  const prev = prevEdge ?? container.left;
  const next = nextEdge ?? container.left + container.width;
  const prevGap = lineAt - prev;
  const nextGap = next - lineAt;
  if (prevGap >= MIN_BADGE_GAP) {
    badges.push({ value: Math.round(prevGap), top: centerY, left: (prev + lineAt) / 2 });
  }
  if (nextGap >= MIN_BADGE_GAP) {
    badges.push({ value: Math.round(nextGap), top: centerY, left: (lineAt + next) / 2 });
  }
  return { line, edges, badges };
}

/**
 * Picks the neighbouring siblings' facing edges around the insertion line from
 * a list of sibling rects (dragged node already excluded): the nearest edge at
 * or before the line becomes `prevEdge`, the nearest at or after it `nextEdge`.
 * Tolerates the line sitting exactly ON a sibling edge (that sibling is the
 * drop target itself — its edge is used, producing a ~0 gap that the badge
 * threshold then drops).
 */
export function pickNeighbourEdges(
  axis: 'x' | 'y',
  lineAt: number,
  siblings: readonly GuideRect[],
): { prevEdge: number | null; nextEdge: number | null } {
  let prevEdge: number | null = null;
  let nextEdge: number | null = null;
  for (const r of siblings) {
    const start = axis === 'y' ? r.top : r.left;
    const end = axis === 'y' ? r.top + r.height : r.left + r.width;
    if (end <= lineAt + 1 && (prevEdge === null || end > prevEdge)) prevEdge = end;
    if (start >= lineAt - 1 && (nextEdge === null || start < nextEdge)) nextEdge = start;
  }
  return { prevEdge, nextEdge };
}
