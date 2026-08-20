import { describe, it, expect } from 'vitest';
import {
  computeZoneAffordances,
  gapAxis,
  STRIP_THICKNESS,
  MIN_THICKNESS,
  type OverlayRect,
} from '../insertOverlayModel';

const R = (top: number, left: number, height: number, width: number): OverlayRect => ({
  top,
  left,
  height,
  width,
});

const container: OverlayRect = R(0, 0, 1000, 600);

describe('gapAxis', () => {
  it('stacked items (no vertical overlap) → horizontal divider (y)', () => {
    expect(gapAxis(R(0, 0, 100, 600), R(120, 0, 100, 600))).toBe('y');
  });

  it('side-by-side items (shared vertical extent) → vertical divider (x)', () => {
    expect(gapAxis(R(0, 0, 100, 200), R(0, 220, 100, 200))).toBe('x');
  });

  it('grid wrap (next item on the row below) → horizontal divider (y)', () => {
    // a = last cell of row 1 (right), b = first cell of row 2 (left, below).
    expect(gapAxis(R(0, 400, 100, 200), R(120, 0, 100, 200))).toBe('y');
  });

  it('full-width stacked sections with a small negative-margin overlap stay horizontal (y)', () => {
    // Both full width (share horizontal extent); b starts 4px before a ends.
    expect(gapAxis(R(0, 0, 100, 600), R(96, 0, 100, 600))).toBe('y');
  });
});

describe('computeZoneAffordances — vertical stack (root)', () => {
  const childRects = [R(0, 0, 100, 600), R(120, 0, 100, 600), R(240, 0, 100, 600)];
  const res = computeZoneAffordances({
    zoneAxis: 'y',
    containerRect: container,
    childRects,
    alwaysLastVisible: true,
  });

  it('emits n+1 affordances with contiguous store indices', () => {
    expect(res).toHaveLength(4);
    expect(res.map((a) => a.index)).toEqual([0, 1, 2, 3]);
  });

  it('all dividers are horizontal (axis y)', () => {
    expect(res.every((a) => a.axis === 'y')).toBe(true);
  });

  it('places between-dividers at the gap midpoint, spanning the item width', () => {
    // between child 0 (bottom 100) and child 1 (top 120) → line at y=110.
    const between = res[1];
    expect(between.strip).toEqual({ top: 110 - STRIP_THICKNESS / 2, left: 0, width: 600, height: STRIP_THICKNESS });
  });

  it('before-first sits at the first item top, spanning the container width', () => {
    expect(res[0].index).toBe(0);
    // first child top = 0, clamped to stay inside the container → strip fully visible.
    expect(res[0].strip.top).toBe(container.top);
    expect(res[0].strip.width).toBe(container.width);
  });

  it('only the trailing (after-last) affordance is always visible, pushed below the last item', () => {
    expect(res.map((a) => a.alwaysVisible)).toEqual([false, false, false, true]);
    // last child bottom = 340; trailing offset pushes the strip's centre below it.
    const trailing = res[3];
    expect(trailing.strip.top + trailing.strip.height / 2).toBeGreaterThan(340);
  });
});

describe('computeZoneAffordances — horizontal row (slot)', () => {
  const childRects = [R(0, 0, 200, 150), R(0, 170, 200, 150)];
  const res = computeZoneAffordances({
    zoneKey: 'abc:items',
    zoneAxis: 'x',
    containerRect: R(0, 0, 200, 600),
    childRects,
  });

  it('emits vertical dividers (axis x) and carries the zoneKey', () => {
    expect(res).toHaveLength(3);
    expect(res.every((a) => a.axis === 'x')).toBe(true);
    expect(res.every((a) => a.zoneKey === 'abc:items')).toBe(true);
  });

  it('never marks a slot affordance always-visible (no alwaysLastVisible)', () => {
    expect(res.some((a) => a.alwaysVisible)).toBe(false);
  });

  it('between-divider sits at the horizontal gap midpoint', () => {
    // between child 0 (right 150) and child 1 (left 170) → vertical line at x=160.
    const between = res[1];
    expect(between.strip.width).toBe(STRIP_THICKNESS);
    expect(between.strip.left + between.strip.width / 2).toBe(160);
  });
});

describe('computeZoneAffordances — single item', () => {
  it('emits before + after affordances', () => {
    const res = computeZoneAffordances({
      zoneAxis: 'y',
      containerRect: container,
      childRects: [R(50, 0, 100, 600)],
      alwaysLastVisible: true,
    });
    expect(res.map((a) => a.index)).toEqual([0, 1]);
    // 'before' bandı elemanın ÜSTÜNDE; kılavuz çizgi bandın ALT kenarında =
    // eleman üst kenarı (50). Band [20,50], çizgi 50'de.
    expect(res[0].edge).toBe('before');
    expect(res[0].strip.top + res[0].strip.height).toBe(50);
    expect(res[1].alwaysVisible).toBe(true); // trailing
    expect(res[1].edge).toBe('after');
  });

  it('kenar affordance edge yönü doğru; between affordance edge=null', () => {
    const res = computeZoneAffordances({
      zoneAxis: 'y',
      containerRect: container,
      childRects: [R(0, 0, 100, 600), R(120, 0, 100, 600)],
    });
    // [before(0), between(1), after(2)]
    expect(res.map((a) => a.edge)).toEqual(['before', null, 'after']);
    // 'after' bandı son elemanın ALTINDA; çizgi bandın ÜST kenarında = eleman alt kenarı (220).
    const after = res[2];
    expect(after.strip.top).toBe(220);
  });
});

describe('computeZoneAffordances — transient unmeasured nodes', () => {
  it('keeps insert indices aligned when a middle node is not yet measurable', () => {
    // child index 1 not mounted yet (null); indices must NOT collapse.
    const res = computeZoneAffordances({
      zoneAxis: 'y',
      containerRect: container,
      childRects: [R(0, 0, 100, 600), null, R(240, 0, 100, 600)],
    });
    // Positions 0 (before c0), 1 (after c0 → edge), 2 (before c2 → edge), 3 (after c2).
    expect(res.map((a) => a.index)).toEqual([0, 1, 2, 3]);
  });

  it('skips a position whose both neighbours are unmeasured', () => {
    const res = computeZoneAffordances({
      zoneAxis: 'y',
      containerRect: container,
      childRects: [null, R(120, 0, 100, 600)],
    });
    // position 0: prev=null,next=null(child0 is null) → skipped; positions with child1 remain.
    expect(res.map((a) => a.index)).toEqual([1, 2]);
  });
});

describe('computeZoneAffordances — gap-clamped band thickness', () => {
  it('keeps the full band for wide gaps, shrinks to the real gap for tight ones', () => {
    // gap 20 (>= STRIP_THICKNESS) → full 16px band.
    const wide = computeZoneAffordances({
      zoneAxis: 'y',
      containerRect: container,
      childRects: [R(0, 0, 100, 600), R(120, 0, 100, 600)],
    });
    expect(wide[1].strip.height).toBe(STRIP_THICKNESS);

    // gap 10 → band exactly 10, still centred on the midpoint (line y=105).
    const tight = computeZoneAffordances({
      zoneAxis: 'y',
      containerRect: container,
      childRects: [R(0, 0, 100, 600), R(110, 0, 100, 600)],
    });
    expect(tight[1].strip.height).toBe(10);
    expect(tight[1].strip.top).toBe(105 - 10 / 2);
  });

  it('flush/overlapping boundaries fall back to the minimum band, not 16px', () => {
    // gap 0 (flush sections) → MIN_THICKNESS band so component edges stay clickable.
    const flush = computeZoneAffordances({
      zoneAxis: 'y',
      containerRect: container,
      childRects: [R(0, 0, 100, 600), R(100, 0, 100, 600)],
    });
    expect(flush[1].strip.height).toBe(MIN_THICKNESS);

    // horizontal flush pair → same clamp on width.
    const flushX = computeZoneAffordances({
      zoneAxis: 'x',
      containerRect: container,
      childRects: [R(0, 0, 100, 200), R(0, 200, 100, 200)],
    });
    expect(flushX[1].strip.width).toBe(MIN_THICKNESS);
  });
});

describe('computeZoneAffordances — compact (element seviyesi HEP; kökte küçük komşu)', () => {
  it('KÖK akışta büyük stacked section komşuları → compact:false (metinli "Bölüm Ekle")', () => {
    // R(top,left,height,width): tam genişlik yüksek section'lar; kök = zoneKey undefined
    const res = computeZoneAffordances({
      zoneKey: undefined,
      zoneAxis: 'y',
      containerRect: container,
      childRects: [R(0, 0, 300, 600), R(320, 0, 300, 600)],
    });
    expect(res.every((a) => a.compact === false)).toBe(true);
  });

  it('KÖK akışta küçük komşu → compact:true (metin küçüğü örterdi)', () => {
    const res = computeZoneAffordances({
      zoneKey: undefined,
      zoneAxis: 'y',
      containerRect: container,
      childRects: [R(0, 0, 40, 80), R(60, 0, 300, 600)],
    });
    const between = res.find((a) => a.index === 1);
    expect(between?.compact).toBe(true);
  });

  it('ELEMENT seviyesi (slot zone) DAİMA compact — büyük komşularda bile', () => {
    // Webflow modeli: slot içinde pil hep küçük yuvarlak "+" — between pilinin
    // geometrik clamp'i yok; metinli pil dar boşlukta komşuların içine taşıyordu
    // (geniş-ama-alçak buton eski width<140 AND height<96 koşulunu geçemiyordu).
    const res = computeZoneAffordances({
      zoneKey: 'Hero-1:contentSlot',
      zoneAxis: 'y',
      containerRect: R(0, 0, 900, 600),
      childRects: [R(0, 0, 400, 600), R(420, 0, 400, 600)],
    });
    expect(res.length).toBeGreaterThan(0);
    expect(res.every((a) => a.compact === true)).toBe(true);
  });

  it('yan yana küçük butonlar (40x40, slot) → compact:true', () => {
    const res = computeZoneAffordances({
      zoneKey: 'actions',
      zoneAxis: 'x',
      containerRect: R(0, 0, 40, 600),
      childRects: [R(0, 0, 40, 40), R(0, 60, 40, 40), R(0, 120, 40, 40)],
    });
    // aradaki + kenar affordance'ların tamamı compact
    expect(res.length).toBeGreaterThan(0);
    expect(res.every((a) => a.compact === true)).toBe(true);
  });

  it('geniş-ama-alçak buton (600x44, slot) → compact:true (eski AND koşulunun açığı)', () => {
    const res = computeZoneAffordances({
      zoneKey: 'ctaSlot',
      zoneAxis: 'y',
      containerRect: R(0, 0, 400, 600),
      childRects: [R(0, 0, 200, 600), R(210, 0, 44, 600)],
    });
    const between = res.find((a) => a.index === 1);
    expect(between?.compact).toBe(true);
  });
});
