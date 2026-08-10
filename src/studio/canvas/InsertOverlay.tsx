import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { OVERLAY_PORTAL_ATTR } from './overlayPortal';
import {
  computeZoneAffordances,
  type Axis,
  type InsertAffordance,
  type OverlayRect,
} from './insertOverlayModel';

/**
 * Wrapperless insert-affordance overlay (Step 4c).
 *
 * Replaces the in-flow `AddSectionButton` "+" dividers with an out-of-flow layer
 * so a zone's real DOM children stay exactly the published set — theme structural
 * selectors (`grid`, `space-y`/`divide`, `:nth-child`) no longer see editor-only
 * divider elements. Rendered INSIDE the canvas iframe (a `<Frame>` child), so it
 * inherits native coordinates (no canvasScale math — the fit-scale transform lives
 * on the host viewport, outside the iframe), native hover and native clicks — the
 * exact model DragGuides/GridOverlay use.
 *
 * Membership + order + insert index come from the DOCUMENT store; geometry is
 * measured live from the DOM. Node elements resolve via the synchronous
 * `tecof-node-<id>` marker class (present at render, unlike the async
 * `data-tecof-id`), so a freshly inserted node is measurable the same frame and
 * repeat-ghost copies (which don't carry the class) are excluded for free.
 */

const rectOf = (el: Element): OverlayRect => {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
};

/**
 * A `display:none` (or detached) element still matches querySelector and still
 * carries `tecof-node-<id>`, but getBoundingClientRect returns an all-zero rect —
 * NOT null. Treat a zero-area rect as "not visible" so hidden zones (inactive
 * tab/accordion/carousel panels, `hidden` slots) don't emit phantom affordances
 * pinned at the iframe's (0,0) corner.
 */
const isVisible = (r: OverlayRect) => r.width > 0 || r.height > 0;

/**
 * Sticky/fixed elemanların rect'i scroll'da viewport'a PİNLİ kalır — akış
 * konumlarını temsil etmez. Sticky bir Header'ın rect'iyle hesaplanan
 * between-şerit, scroll'da header'ın (ve altındaki içeriğin) ÜSTÜNDE gezinir;
 * kullanıcı logoya hover'layınca "Bölüm Ekle" pili beliriyordu. Bu elemanlar
 * ölçümden hariç tutulur: komşuları edge-affordance'a düşer, pinli eleman
 * üzerinde hiç şerit üretilmez.
 */
const isPinned = (el: Element): boolean => {
  const win = el.ownerDocument.defaultView;
  if (!win) return false;
  const pos = win.getComputedStyle(el).position;
  return pos === 'sticky' || pos === 'fixed';
};

export const InsertOverlay = () => {
  // Reactive deps: any document edit or drag toggle re-measures.
  const documentState = useEditorStore((s) => s.document);
  const drag = useEditorStore((s) => s.drag);
  const openAddSection = useUiStore((s) => s.openAddSection);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<InsertAffordance[]>([]);
  // Bumped by layout-only changes (image/font load, panel resize, scroll) that
  // move nodes without touching the document.
  const [tick, setTick] = useState(0);
  // Scroll sırasında position:fixed şeritler içerikle kaymaz ve rAF ölçümü bir
  // kare geriden gelir — kuyruk pili "yüzüyor" görünüyordu. Scroll boyunca
  // overlay gizlenir, durunca (120ms) son ölçümle geri gelir.
  const [scrolling, setScrolling] = useState(false);

  useLayoutEffect(() => {
    const doc = rootRef.current?.ownerDocument;
    // During a drag the smart guides own positioning — hide the "+" affordances
    // so the two don't collide (mirrors the old `!isDragActive` suppression).
    if (!doc || drag) {
      setItems([]);
      return;
    }

    const state = useEditorStore.getState();
    const zones: Array<{ key?: string; list: typeof state.document.content }> = [
      { key: undefined, list: state.document.content },
      ...Object.entries(state.document.zones).map(([key, list]) => ({ key, list })),
    ];

    const out: InsertAffordance[] = [];
    for (const zone of zones) {
      // Empty zones keep their in-flow hint (empty container → nothing to perturb).
      if (!zone.list || zone.list.length === 0) continue;
      const domKey = zone.key ?? 'root';
      const container = doc.querySelector(`[data-tecof-zone="${domKey}"]`);
      if (!container) continue; // zone not currently mounted
      const containerRect = rectOf(container);
      if (!isVisible(containerRect)) continue; // hidden zone (display:none / detached)

      const childRects = zone.list.map((node) => {
        const el = doc.querySelector(`[class~="tecof-node-${node.props.id}"]`);
        if (!el) return null;
        if (isPinned(el)) return null; // sticky/fixed: rect akışı temsil etmez
        const r = rectOf(el);
        return isVisible(r) ? r : null; // skip hidden children
      });
      if (childRects.every((r) => r === null)) continue;

      const zoneAxis: Axis =
        container.getAttribute('data-tecof-orientation') === 'horizontal' ? 'x' : 'y';
      out.push(
        ...computeZoneAffordances({
          zoneKey: zone.key,
          zoneAxis,
          containerRect,
          childRects,
          // Root keeps an always-visible trailing "Bölüm Ekle" like the old is-fixed
          // divider; slots are all hover-revealed.
          alwaysLastVisible: zone.key === undefined,
        }),
      );
    }
    setItems(out);
  }, [documentState, drag, tick]);

  // Re-measure on layout changes that don't change the document.
  useEffect(() => {
    const doc = rootRef.current?.ownerDocument;
    if (!doc) return;

    let cancelled = false;
    let raf = 0;
    let scrollTimer = 0;
    const schedule = () => {
      if (cancelled) return; // e.g. a late fonts.ready resolving after unmount
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setTick((t) => t + 1));
    };
    const onScroll = () => {
      if (cancelled) return;
      setScrolling(true);
      const win = doc.defaultView;
      if (win) {
        win.clearTimeout(scrollTimer);
        scrollTimer = win.setTimeout(() => {
          if (!cancelled) setScrolling(false);
        }, 120);
      }
      schedule();
    };

    // ResizeObserver on the body catches content reflow (image/font load, text
    // edits, panel-driven width changes). Position:fixed affordances don't change
    // the body's content box, so the overlay's own render can't loop this.
    const ro = new ResizeObserver(schedule);
    if (doc.body) ro.observe(doc.body);
    // Capture-phase so nested scroll containers (not just the root) re-measure.
    doc.addEventListener('scroll', onScroll, { capture: true, passive: true });
    doc.defaultView?.addEventListener('resize', schedule);
    // Late web-font layout shift.
    doc.fonts?.ready.then(schedule).catch(() => {});

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      doc.defaultView?.clearTimeout(scrollTimer);
      ro.disconnect();
      doc.removeEventListener('scroll', onScroll, { capture: true });
      doc.defaultView?.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <div ref={rootRef} className={`tecof-insert-overlay${scrolling ? ' is-scrolling' : ''}`}>
      {items.map((a) => (
        // The whole strip IS the button so the entire hover band is clickable (no
        // dead zone that would also swallow clicks meant for the component behind
        // it). Marked as an overlay portal so the canvas select/guard step aside —
        // a click opens the modal instead of deselecting the node. `is-root`:
        // section sınırında kök "Bölüm Ekle" şeridi, slot'un clamp'lenmiş kenar
        // şeridinin ÜSTÜNDE kazanmalı (z-index) — yoksa section eklemek isteyen
        // kullanıcı slot'a bileşen ekler.
        <button
          key={a.key}
          type="button"
          className={`tecof-insert-affordance axis-${a.axis}${a.alwaysVisible ? ' is-fixed' : ''}${a.zoneKey ? '' : ' is-root'}`}
          style={{ top: a.strip.top, left: a.strip.left, width: a.strip.width, height: a.strip.height }}
          title={a.zoneKey ? 'Buraya bileşen ekle' : 'Buraya Bölüm Ekle'}
          {...{ [OVERLAY_PORTAL_ATTR]: '' }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openAddSection(a.zoneKey ? { zoneKey: a.zoneKey, index: a.index } : { index: a.index });
          }}
        >
          <span className="tecof-insert-pill">
            <Plus size={12} strokeWidth={2.6} />
            <span>{a.zoneKey ? 'Ekle' : 'Bölüm Ekle'}</span>
          </span>
        </button>
      ))}
    </div>
  );
};

export default InsertOverlay;
