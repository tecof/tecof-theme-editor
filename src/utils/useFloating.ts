import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';

/**
 * Lightweight, dependency-free floating-element positioning (a small subset of
 * Floating UI): anchored placement with automatic **flip** (to the opposite side
 * when the preferred side lacks room) and **shift** (clamp into the viewport),
 * plus auto-update on scroll/resize. Uses `position: fixed` viewport coordinates
 * so it works regardless of scroll containers or `overflow: hidden` ancestors.
 *
 * The floating element must be mounted (so it can be measured); it stays parked
 * off-screen until the first measurement lands.
 */

export type FloatingSide = 'top' | 'bottom' | 'left' | 'right';
export type FloatingAlign = 'start' | 'center' | 'end';
export type FloatingPlacement = FloatingSide | `${FloatingSide}-${FloatingAlign}`;

export interface UseFloatingOptions {
  /** The trigger element to position against. */
  anchor: HTMLElement | null;
  /** Whether the floating element is currently mounted/visible. */
  open: boolean;
  /** Preferred placement; flips to the opposite side when it doesn't fit. */
  placement?: FloatingPlacement;
  /** Gap between the anchor and the floating element (px). */
  offset?: number;
  /** Minimum distance to keep from the viewport edges (px). */
  padding?: number;
}

export interface UseFloatingResult {
  /** Attach to the floating element. */
  floatingRef: RefObject<HTMLDivElement | null>;
  /** Inline style (`position: fixed` + resolved coordinates). */
  style: CSSProperties;
  /** The side the element actually landed on (after any flip). */
  side: FloatingSide;
  /** Force a reposition (e.g. after the content size changes). */
  update: () => void;
}

const OPPOSITE: Record<FloatingSide, FloatingSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

const parsePlacement = (
  placement: FloatingPlacement,
): { side: FloatingSide; align: FloatingAlign } => {
  const [side, align] = placement.split('-') as [FloatingSide, FloatingAlign | undefined];
  return { side, align: align ?? 'center' };
};

export function useFloating({
  anchor,
  open,
  placement = 'bottom-start',
  offset = 6,
  padding = 8,
}: UseFloatingOptions): UseFloatingResult {
  const floatingRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; side: FloatingSide }>({
    top: -9999,
    left: -9999,
    side: parsePlacement(placement).side,
  });

  const update = useCallback(() => {
    const floating = floatingRef.current;
    if (!anchor || !floating) return;

    const a = anchor.getBoundingClientRect();
    const fw = floating.offsetWidth;
    const fh = floating.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { side: preferred, align } = parsePlacement(placement);

    // Free space between the anchor and each viewport edge.
    const space: Record<FloatingSide, number> = {
      top: a.top - padding,
      bottom: vh - a.bottom - padding,
      left: a.left - padding,
      right: vw - a.right - padding,
    };
    const needed = (s: FloatingSide) => (s === 'top' || s === 'bottom' ? fh : fw) + offset;

    // Flip: keep the preferred side unless it can't fit and the opposite has more room.
    let side = preferred;
    if (space[preferred] < needed(preferred) && space[OPPOSITE[preferred]] > space[preferred]) {
      side = OPPOSITE[preferred];
    }

    let top = 0;
    let left = 0;

    // Main axis (the side we're anchored to).
    if (side === 'bottom') top = a.bottom + offset;
    else if (side === 'top') top = a.top - fh - offset;
    else if (side === 'right') left = a.right + offset;
    else left = a.left - fw - offset;

    // Cross axis (alignment along the anchor's edge).
    if (side === 'top' || side === 'bottom') {
      if (align === 'start') left = a.left;
      else if (align === 'end') left = a.right - fw;
      else left = a.left + (a.width - fw) / 2;
    } else {
      if (align === 'start') top = a.top;
      else if (align === 'end') top = a.bottom - fh;
      else top = a.top + (a.height - fh) / 2;
    }

    // Shift: clamp into the viewport on both axes.
    const clamp = (value: number, size: number, viewport: number) =>
      Math.max(padding, Math.min(value, viewport - size - padding));

    setPos({
      top: clamp(top, fh, vh),
      left: clamp(left, fw, vw),
      side,
    });
  }, [anchor, placement, offset, padding]);

  useLayoutEffect(() => {
    if (open) update();
  }, [open, update]);

  useEffect(() => {
    if (!open || !anchor) return;

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    if (floatingRef.current) observer.observe(floatingRef.current);
    observer.observe(anchor);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
    };
  }, [open, anchor, update]);

  return {
    floatingRef,
    style: { position: 'fixed', top: pos.top, left: pos.left },
    side: pos.side,
    update,
  };
}
