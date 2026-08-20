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
  /**
   * Kenar affordance'ı (tek komşu): 'before' = elemanın ÜST kenarı, 'after' =
   * ALT kenarı. İki eleman arasındaki (between) affordance'ta `null`. Overlay bu
   * bilgiyle pili kenarın dışına kaydırır (kenar çizgisi eleman sınırında kalır,
   * pil elemanın içine taşmaz).
   */
  edge: 'before' | 'after' | null;
  /**
   * Komşu eleman(lar) küçükse (bir buton/ikon/etiket boyutunda) `true`.
   * Overlay bu durumda pili metinsiz — yalnız "+" ikonu — çizer: geniş bir
   * "Ekle" metni küçük elemanın üstüne taşıp onu örtüyordu. Büyük/uzun
   * elemanlarda `false` kalır, metin görünür.
   */
  compact: boolean;
  /**
   * GERÇEK ayraç çizgisinin şerit İÇİNDEKİ konumu (normal eksende px, şerit
   * başlangıcından). Çizgi + pil CSS'te bu değere sabitlenir — TEK kaynak:
   *
   * - between: şerit boşluğa ortalandığı için thickness/2.
   * - edge   : ELEMANIN gerçek kenarı. Kritik fark: band kapsayıcıya
   *   clamp'lenip kaysa bile `line` gerçek kenarı izler — eski model çizgiyi
   *   bandın kenarına CSS ile sabitliyordu ve kapsayıcıya yapışık elemanlarda
   *   (rawTop clamp'lenince) çizgi elemanın 30px İÇİNE düşüyordu.
   * - kuyruk (TRAIL_OFFSET'li after): bandın başı (bottom+16) — kuyruk pili
   *   bilinçli olarak tail boşluğunda yüzer, section kenarına yapışmaz.
   */
  line: number;
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
/**
 * Kenar (edge) bandının kalınlığı: eleman kenarının DIŞINA taşar ve "Ekle" pilini
 * tümüyle içine alır (band pili kapsamalı ki pilin göründüğü yer tıklanabilsin).
 * Between (iki eleman arası) affordance'lar bunu KULLANMAZ; onlar boşluğa göre
 * clamp'lenen STRIP_THICKNESS bandını kullanır.
 */
const EDGE_BAND = 30;

/**
 * "Küçük eleman" eşikleri: bir eleman HEM darsa HEM alçaksa (kabaca bir
 * buton/ikon/etiket) metin pili onu örter → yalnız ikon gösterilir. Uzun ya da
 * geniş elemanlarda metin sığar. Eşikler pil metninin ("Ekle") rahat oturması
 * için kalibre edildi; yalnız GÖRSEL karar, tıklama davranışını etkilemez.
 */
export const COMPACT_MAX_WIDTH = 140;
export const COMPACT_MAX_HEIGHT = 96;
const isSmallElement = (r: OverlayRect): boolean =>
  r.width < COMPACT_MAX_WIDTH && r.height < COMPACT_MAX_HEIGHT;

const right = (r: OverlayRect) => r.left + r.width;
const bottom = (r: OverlayRect) => r.top + r.height;
const clamp = (v: number, lo: number, hi: number) => (lo > hi ? v : Math.min(Math.max(v, lo), hi));

type Geom = { axis: Axis; strip: OverlayRect; line: number };

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
    return {
      axis,
      strip: { top: lineY - thickness / 2, left, width, height: thickness },
      line: thickness / 2,
    };
  }
  const lineX = (right(a) + b.left) / 2;
  const thickness = bandThickness(b.left - right(a));
  const top = Math.min(a.top, b.top);
  const height = Math.max(Math.max(bottom(a), bottom(b)) - top, MIN_SPAN);
  return {
    axis,
    strip: { top, left: lineX - thickness / 2, width: thickness, height },
    line: thickness / 2,
  };
}

/**
 * Kenardaki (ilk elemandan ÖNCE / son elemandan SONRA) affordance — tek komşu var.
 *
 * Band, elemanın DIŞINA (üstte 'before', altta 'after') taşan bir şerittir;
 * kılavuz çizgi elemanın TAM kenarında (bandın iç kenarında) durur, "Ekle" pili
 * bandın içinde tamamen kenarın dışında kalır. Böylece pil elemanın içine
 * taşmaz (kullanıcının bildirdiği "üste doğru kayma") AMA band pili kapsadığı
 * için pilin göründüğü yer tıklanabilir kalır — merkezlenmiş 16px'lik şerit pili
 * yarı yarıya dışarıda bırakıp tıklama boşluğu yaratıyordu.
 *
 * Çizginin bandın hangi kenarında duracağını CSS `is-edge-before/after` sınıfı
 * belirler (geometri yalnız bandı konumlandırır). Band, container dışına
 * taşmayacak şekilde kırpılır; `offset` her-zaman-görünür kuyruk pilini tail
 * boşluğuna iter.
 */
function edgeAffordance(
  item: OverlayRect,
  container: OverlayRect,
  axis: Axis,
  side: 'before' | 'after',
  offset = 0,
): Geom {
  /* Çizginin GERÇEK konumu: elemanın kenarı (+ kuyruk offset'i). Band clamp'le
     kaysa bile `line` bu mutlak konumdan türetilir — çizgi hep doğru yerde. */
  if (axis === 'y') {
    const width = Math.max(container.width, MIN_SPAN);
    /* 'before' → band elemanın ÜSTÜNDE; 'after' → band elemanın ALTINDA. */
    const rawTop = side === 'before' ? item.top - EDGE_BAND : bottom(item) + offset;
    const top = clamp(rawTop, container.top, Math.max(container.top, bottom(container) - EDGE_BAND));
    const lineAbs = side === 'before' ? item.top : bottom(item) + offset;
    return {
      axis,
      strip: { top, left: container.left, width, height: EDGE_BAND },
      line: lineAbs - top,
    };
  }
  const height = Math.max(container.height, MIN_SPAN);
  const rawLeft = side === 'before' ? item.left - EDGE_BAND : right(item) + offset;
  const left = clamp(rawLeft, container.left, Math.max(container.left, right(container) - EDGE_BAND));
  const lineAbs = side === 'before' ? item.left : right(item) + offset;
  return {
    axis,
    strip: { top: container.top, left, width: EDGE_BAND, height },
    line: lineAbs - left,
  };
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
    /* Kenar affordance'ı mı ve hangi yönde? Kılavuz çizgi elemanın TAM kenarında
       durur; pil o kenarın DIŞINA (üstte 'before', altta 'after') kaydırılır —
       merkezlenmiş pil kenarın yarısını elemanın içine taşırıyordu. İki eleman
       ARASINDAKİ (between) affordance boşlukta durduğu için taşma yok, edge=null. */
    let edge: 'before' | 'after' | null = null;
    if (prev && next) {
      geom = betweenAffordance(prev, next);
    } else if (next) {
      geom = edgeAffordance(next, containerRect, zoneAxis, 'before');
      edge = 'before';
    } else if (prev) {
      geom = edgeAffordance(prev, containerRect, zoneAxis, 'after', isLast && alwaysLastVisible ? TRAIL_OFFSET : 0);
      edge = 'after';
    }
    if (!geom) continue; // both neighbours unmeasured this frame

    // ELEMENT seviyesinde (slot zone'ları) pil DAİMA kompakt — Webflow modeli:
    // çizgi üstünde küçük yuvarlak "+". Between pili boşluğun merkezinde durur
    // ve geometrik clamp'i yoktur; metinli pil ("+ Ekle" ≈ 60×22px) dar
    // boşluklarda komşu elemanların İÇİNE taşıyordu (kullanıcının "ekle kısmı
    // patlıyor" bildirdiği durum: geniş-ama-alçak buton compact'ın eski
    // width<140 AND height<96 koşulunu geçemiyordu). Kök (section) akışında
    // section'lar büyük olduğundan metinli "Bölüm Ekle" pili kalır; yalnız
    // küçük komşuda metin düşer.
    const neighbours = [prev, next].filter((r): r is OverlayRect => r != null);
    const compact =
      zoneKey !== undefined || (neighbours.length > 0 && neighbours.some(isSmallElement));

    out.push({
      key: `${zoneKey ?? 'root'}#${k}`,
      zoneKey,
      index: k,
      axis: geom.axis,
      strip: geom.strip,
      line: geom.line,
      alwaysVisible: !!(isLast && alwaysLastVisible),
      compact,
      edge,
    });
  }
  return out;
}
