import { describe, it, expect } from 'vitest';
import { unionBounds, type RectBounds } from '../nodeRect';

/** left, top, right, bottom → RectBounds */
const R = (left: number, top: number, right: number, bottom: number): RectBounds => ({
  top,
  left,
  right,
  bottom,
});

describe('unionBounds', () => {
  it('returns null when there are no rects', () => {
    expect(unionBounds([])).toBeNull();
  });

  it('returns null when every rect is degenerate (zero area)', () => {
    // 0x0 at origin + a zero-width rect
    expect(unionBounds([R(0, 0, 0, 0), R(10, 10, 10, 40)])).toBeNull();
  });

  it('passes a single rect through unchanged', () => {
    expect(unionBounds([R(10, 20, 110, 70)])).toEqual({ top: 20, left: 10, right: 110, bottom: 70 });
  });

  it('unions multiple rects to the outer bounds (multi-root component)', () => {
    expect(unionBounds([R(10, 20, 60, 50), R(40, 10, 120, 40)])).toEqual({
      top: 10,
      left: 10,
      right: 120,
      bottom: 50,
    });
  });

  it('skips a 0x0 root at the origin so it cannot corrupt the union', () => {
    expect(unionBounds([R(0, 0, 0, 0), R(30, 40, 90, 80)])).toEqual({
      top: 40,
      left: 30,
      right: 90,
      bottom: 80,
    });
  });

  it('skips zero-height / zero-width roots (e.g. a <style> or collapsed node)', () => {
    expect(unionBounds([R(10, 10, 100, 10), R(20, 20, 80, 60)])).toEqual({
      top: 20,
      left: 20,
      right: 80,
      bottom: 60,
    });
  });
});
