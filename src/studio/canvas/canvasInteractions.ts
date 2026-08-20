/**
 * Delegated canvas node interactions — one set of listeners on the iframe
 * document instead of per-node React handlers on a wrapper. This is the first
 * step toward a wrapperless canvas (editor DOM == published DOM): the marker
 * class travels on the rendered component itself, and a single delegated
 * listener resolves the node from `event.target.closest('.tecof-el')`.
 *
 * Mirrors installCanvasInteractionGuard (same iframe-doc install site in
 * Frame.tsx). Runs in the BUBBLE phase, so it composes with the capture-phase
 * guard (which only preventDefault's) and Frame's whitespace-deselect body click
 * (which finds `.tecof-node-wrapper` and steps aside).
 *
 * Scope (this step): SELECT + HOVER for NON-INLINE nodes. Inline components wire
 * their own handlers via useInlineDragRef and stopPropagation, so their clicks
 * never reach this listener; for hover, the delegated `mouseover` explicitly
 * steps aside when the pointer is over an inline node (it has `data-tecof-id` but
 * no `.tecof-el`) so it can't fight the inline node's own hover.
 */

import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { findNodeById } from '../../engine/zones';
import type { TecofDocument } from '../../types';
import { isEmbedded, postToHost } from '../bridge';
import { isInsideOverlayPortal } from './overlayPortal';
import { writeDragData } from './dndUtils';
import { parseItemAttr } from './useInlineEdit';

/**
 * Stable marker class on a NON-INLINE node's rendered root — the delegation
 * anchor (`closest('.tecof-el')`). The node id lives in the companion
 * `tecof-node-<id>` class (already emitted for the interactions runtime).
 */
export const NODE_MARKER_CLASS = 'tecof-el';
const ID_PREFIX = 'tecof-node-';

/** Minimal element shape for {@link nodeIdFromEl} — testable without a DOM. */
interface ClassListed {
  classList: Iterable<string>;
}

/** Read a node id from an element's `tecof-node-<id>` marker class. */
export const nodeIdFromEl = (el: ClassListed | null): string | null => {
  if (!el) return null;
  for (const cls of Array.from(el.classList)) {
    if (cls.startsWith(ID_PREFIX)) return cls.slice(ID_PREFIX.length);
  }
  return null;
};

/**
 * Kanvas tıklamasından sağ panel odak isteği üretir (bkz. uiStore
 * `InspectorFocusRequest`): tıklanan yerin `data-tecof-prop` /
 * `data-tecof-item-prop` / `data-tecof-item` işaretlerinden hangi node'un hangi
 * alanına (ve varsa array satırına) gidileceğini çözer.
 *
 * SAHİPLİK KURALI — `useInlineEdit.resolveMatch`'teki `wrapper.contains(...)`
 * guard'ının birebir karşılığı: bir işaret YALNIZ onu render eden node'a aittir.
 * İşaretli bir bölgenin İÇİNE yerleşmiş başka bir node'a tıklandığında atanın
 * alanına kaymak yanlış olurdu; array satırı (`data-tecof-item`) da yalnız alan
 * işaretiyle AYNI node'a aitse kullanılır — aksi halde kartın içindeki yuva
 * çocuğu, dış node'un array alan adıyla eşleştirilip panelde hiçbir hedef
 * bulunamazdı.
 *
 * `fallbackId`: hiçbir işaret yoksa (ya da işaret başka node'a aitse) odak
 * doğrudan tıklanan node'un grubuna gider.
 */
export const requestFocusFromTarget = (target: EventTarget | null, fallbackId: string): void => {
  const t = target as Element | null;
  const propEl = t?.closest?.('[data-tecof-item-prop],[data-tecof-prop]') ?? null;
  const itemEl = t?.closest?.('[data-tecof-item]') ?? null;
  const ownerOf = (el: Element | null) =>
    el ? el.closest(`.${NODE_MARKER_CLASS}`) : null;

  const propOwner = ownerOf(propEl);
  const itemOwner = ownerOf(itemEl);
  // İşaretin sahibi = odak node'u; yoksa tıklanan node.
  const ownerEl = propOwner ?? itemOwner;
  const nodeId = nodeIdFromEl(ownerEl) ?? fallbackId;

  let field: string | undefined;
  let itemIndex: number | undefined;

  // Array satırı yalnız alan işaretiyle AYNI node'a aitse (ya da tek işaret
  // oysa) onurlandırılır.
  if (itemEl && (!propEl || itemOwner === propOwner)) {
    const spec = parseItemAttr(itemEl.getAttribute('data-tecof-item'));
    if (spec) {
      field = spec.field;
      itemIndex = spec.index;
    }
  }
  // Satır işareti yoksa alan adı doğrudan işaretten gelir. `data-tecof-item-prop`
  // SATIR-İÇİ bir alandır (top-level alan değil) — satır bağlamı çözülemediyse
  // panelde arayacak bir alan bloğu yoktur, node grubuna düşülür.
  if (field == null && propEl) {
    field = propEl.getAttribute('data-tecof-prop') ?? undefined;
  }

  useUiStore.getState().requestInspectorFocus({
    nodeId,
    ...(field ? { field } : {}),
    ...(itemIndex != null ? { itemIndex } : {}),
  });
};

/**
 * Tık hedefi çözümü — DERİN SEÇİM modeli (Webflow; kullanıcı kararı 2026-08-20).
 *
 * ESKİ model dıştan-içe eskalasyondu (ilk tık en dıştaki section'ı seçer,
 * sonraki tık bir kat iner). Pratikte kafa karıştırıyordu: bir elemente
 * tıklayınca panelde ÜST section'ın tüm alanları (aggregate) geliyor, Stil
 * sekmesi de tıklanan elemente değil section'a uygulanıyordu ("stil almıyor").
 *
 * YENİ model: tık DAİMA en içteki (derin) node'u seçer — panel yalnız o
 * elementin alanlarını gösterir, Stil doğrudan ona uygulanır. Section'ı
 * kanvastan seçmek için section'ın KENDİ boş alanına (padding/arka plan,
 * elementlerin dışı) tıklanır: orada en içteki .tecof-el section'ın kendisidir
 * ve panel aggregate görünümüyle TÜM alt elementlerin alanlarını listeler.
 * Üst seçim için ayrıca: durum çubuğu breadcrumb'ı, "Üst Öğe" butonu, katman
 * ağacı. Alt+tık davranışı değişmedi (zaten en içtekini seçiyordu).
 *
 * İmza korunmuştur (doc/selectedId artık kararı etkilemez) — dblclick
 * kararlılığı (detail>1'de seçimi koru) çağıranda yaşar. Pure — test edilebilir.
 */
export const resolveClickTarget = (
  _doc: TecofDocument,
  clickedId: string,
  _selectedId: string | null,
  _altKey = false,
): string => clickedId;

/**
 * Install delegated node selection on a canvas document. Returns a cleanup fn.
 * `isEditMode` gates it exactly like the guard (no selection in preview).
 */
export function installCanvasInteractions(doc: Document, isEditMode: () => boolean): () => void {
  const onClick = (e: MouseEvent) => {
    if (!isEditMode()) return;
    // Overlay portals (tab headers, slider arrows, …) keep their own click.
    if (isInsideOverlayPortal(e.target)) return;
    const el = (e.target as Element | null)?.closest?.(`.${NODE_MARKER_CLASS}`);
    if (!el) return; // whitespace → Frame's body click clears the selection
    const id = nodeIdFromEl(el);
    if (!id) return;

    const store = useEditorStore.getState();
    // Cmd/Ctrl/Shift-click toggles multi-selection; plain click single-selects.
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      store.toggleSelect(id);
      return;
    }
    // Çift tıklamanın ikinci tıkı (detail 2) eskalasyonu İLERLETMEZ — dblclick
    // inline-edit'e giderken seçim kat değiştirmesin.
    const targetId =
      e.detail > 1 && store.selection.selectedId
        ? store.selection.selectedId
        : resolveClickTarget(store.document, id, store.selection.selectedId, e.altKey);
    store.selectNode(targetId);
    if (isEmbedded()) {
      const type = findNodeById(store.document, targetId)?.node.type ?? '';
      postToHost('puck:itemSelected', { item: { type, id: targetId } });
    }

    // Sağ panel odağı: tıklanan yerin işaretlerinden Inspector'a "şu alana git"
    // isteği yayınla. Çift tıklamanın ikinci tıkı (detail>1) inline edit'e
    // gittiğinden isteği tekrarlamaz.
    if (e.detail === 1) {
      requestFocusFromTarget(e.target, id);
    }
  };

  // Hover resolves the INNERMOST node via the nearest `[data-tecof-id]` (not
  // `.tecof-el`, which would find a non-inline ANCESTOR when the pointer is over
  // an inline descendant). The nearest node is inline when its own element carries
  // `data-tecof-id` but is NOT the `.tecof-node-wrapper` — then its own handler
  // owns the hover and the delegation steps aside. Compares against the STORE's
  // hoveredId (not a local var) so moving through inline nodes never goes stale.
  const onOver = (e: MouseEvent) => {
    if (!isEditMode()) return;
    const target = e.target as Element | null;
    // İmleç bir overlay-portal (ör. görünmez "Ekle" şeridi) üstündeyken mevcut
    // hover korunur — şerit bir bileşenin kenarını örttüğünde highlight'ın
    // yanıp sönmesini (titreme) bitirir.
    if (isInsideOverlayPortal(target)) return;
    // Innermost node — matched by the marker class (non-inline, synchronous) OR
    // data-tecof-id (inline). Only `.tecof-el` (non-inline) is handled here; inline
    // nodes own their hover via useInlineDragRef.
    const nodeEl = target?.closest?.(`.${NODE_MARKER_CLASS}, [data-tecof-id]`);
    const store = useEditorStore.getState();
    if (!nodeEl) {
      if (store.selection.hoveredId !== null) store.hoverNode(null); // whitespace
      return;
    }
    if (!nodeEl.classList.contains(NODE_MARKER_CLASS)) return; // inline → its own
    const id = nodeIdFromEl(nodeEl);
    if (id && store.selection.hoveredId !== id) store.hoverNode(id);
  };

  // Pointer left the iframe entirely (relatedTarget null) → drop the hover.
  const onOut = (e: MouseEvent) => {
    if (e.relatedTarget) return;
    const store = useEditorStore.getState();
    if (store.selection.hoveredId !== null) store.hoverNode(null);
  };

  // ── Drag SOURCE ──
  // Native drag needs the `draggable` attribute on the element, which
  // className-only components can't set themselves — an observer sets it on every
  // `.tecof-el` (rAF-throttled; ahead of the first mousedown, so the first drag
  // works). dragstart is delegated (gates: edit-mode, overlay portals, drag
  // permission), so the wrapper no longer carries drag handlers. The drop TARGET
  // still lives on the wrapper (useDropTarget) — it moves here when the wrapper is
  // removed.
  const win = doc.defaultView;
  let markRaf = 0;
  // Mark every non-inline node root: `draggable` (native drag source) + a
  // `data-tecof-id` mirror of its `tecof-node-<id>` class, so the `[data-tecof-id]`
  // contract (measurement, drop resolution, inline-edit, context menu) keeps
  // working now that the wrapper — which used to carry it — is gone.
  const markDraggable = () => {
    markRaf = 0;
    doc.querySelectorAll(`.${NODE_MARKER_CLASS}:not([data-tecof-id])`).forEach((el) => {
      const id = nodeIdFromEl(el);
      if (!id) return;
      el.setAttribute('data-tecof-id', id);
      el.setAttribute('draggable', 'true');
    });
  };
  const scheduleMark = () => {
    if (markRaf || !win) return;
    markRaf = win.requestAnimationFrame(markDraggable);
  };
  markDraggable();
  const mo = win ? new win.MutationObserver(scheduleMark) : null;
  if (mo && doc.body) mo.observe(doc.body, { childList: true, subtree: true });

  const onDragStart = (e: DragEvent) => {
    const el = (e.target as Element | null)?.closest?.(`.${NODE_MARKER_CLASS}`) as HTMLElement | null;
    if (!el) return; // inline nodes drag via useInlineDragRef
    if (!isEditMode() || isInsideOverlayPortal(e.target)) {
      e.preventDefault();
      return;
    }
    const id = nodeIdFromEl(el);
    if (!id) {
      e.preventDefault();
      return;
    }
    const store = useEditorStore.getState();
    const node = findNodeById(store.document, id)?.node ?? null;
    if (node && store.permissionResolver?.(node).drag === false) {
      e.preventDefault(); // node is drag-locked (perms or _locked)
      return;
    }
    writeDragData(e, { nodeId: id });
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    // Drag ghost — a small label chip created in the iframe document.
    const owner = el.ownerDocument;
    const ghost = owner.createElement('div');
    ghost.className = 'tecof-drag-ghost';
    ghost.textContent = node?.type ?? id;
    owner.body.appendChild(ghost);
    try {
      e.dataTransfer?.setDragImage(ghost, 14, 14);
    } catch {
      /* setDragImage may be unsupported */
    }
    const gwin = owner.defaultView ?? win;
    gwin?.requestAnimationFrame(() => gwin.requestAnimationFrame(() => ghost.remove()));
    store.beginDrag({ id });
  };

  const onDragEnd = () => useEditorStore.getState().endDrag();

  doc.addEventListener('click', onClick);
  doc.addEventListener('mouseover', onOver);
  doc.addEventListener('mouseout', onOut);
  doc.addEventListener('dragstart', onDragStart);
  doc.addEventListener('dragend', onDragEnd);
  return () => {
    doc.removeEventListener('click', onClick);
    doc.removeEventListener('mouseover', onOver);
    doc.removeEventListener('mouseout', onOut);
    doc.removeEventListener('dragstart', onDragStart);
    doc.removeEventListener('dragend', onDragEnd);
    mo?.disconnect();
    if (markRaf && win) win.cancelAnimationFrame(markRaf);
  };
}
