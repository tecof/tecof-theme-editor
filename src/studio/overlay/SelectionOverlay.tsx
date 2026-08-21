import React, { useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { getBreadcrumbs, getParentId, findNodeById } from '../../engine/zones';
import { ArrowUp, ArrowDown, Copy, Trash2, ChevronUp, Info, Pencil, Plus } from 'lucide-react';
import { useStudio } from '../context';
import { usePermissions } from '../usePermissions';
import type { ComponentConfig, TecofDocument, TecofNode } from '../../types';
import {
  SpacingDragHandles,
  type BoxModel,
  type Coords,
  type SpacingAxis,
} from './SpacingDragHandles';
import { ResizeHandles, type ResizeCorner } from './ResizeHandles';
import { measureNode } from '../canvas/nodeRect';

type CoordsMap = Record<string, Coords>;

const getOutlineStyle = (coords: Coords) =>
  ({
    '--tecof-outline-top': `${coords.top}px`,
    '--tecof-outline-left': `${coords.left}px`,
    '--tecof-outline-width': `${coords.width}px`,
    '--tecof-outline-height': `${coords.height}px`,
  }) as React.CSSProperties;

/**
 * Measures overlay coordinates for a SET of node ids in one pass, sharing a
 * single group of observers/listeners no matter how many nodes are selected.
 *
 * Binding lifecycle is deliberately split from measurement:
 * - observers + listeners bind on [ids, iframe, container] only;
 * - document edits (every inspector keystroke) just trigger a lightweight
 *   re-measure via `measureRef`, instead of tearing everything down.
 *
 * Layout can also shift without any document change (images finishing loading,
 * webfonts swapping in, lazy content mounting) — covered by a capture-phase
 * `load` listener, `document.fonts.ready` and a childList MutationObserver.
 * Attribute mutations are intentionally NOT observed so style-animating
 * libraries can't schedule measurements every frame.
 */
const useOverlayCoords = (
  ids: readonly string[],
  iframeEl: HTMLIFrameElement | null,
  containerEl: HTMLDivElement | null,
  documentState: TecofDocument,
): CoordsMap => {
  const [coordsMap, setCoordsMap] = useState<CoordsMap>({});
  const measureRef = useRef<() => void>(() => {});
  const idsKey = ids.join('|');

  useEffect(() => {
    const effectIds = idsKey ? idsKey.split('|') : [];
    if (effectIds.length === 0 || !iframeEl || !containerEl) {
      setCoordsMap({});
      return;
    }
    const doc = iframeEl.contentDocument;
    const win = iframeEl.contentWindow;
    if (!doc) return;

    let raf = 0;
    // The rendered element behind an id can be REPLACED between renders; track
    // what each id currently resolves to and re-observe on change — observing
    // only the first element would silently stop tracking size changes.
    const observedById = new Map<string, Element>();
    const targetObserver = new ResizeObserver(() => schedule());

    const measure = () => {
      const iframeRect = iframeEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      // Canvas fit-scale: iframe gerçek tasarım genişliğinde layout edilip
      // transform ile küçültülür — içerideki rect'ler GERÇEK px, dışarıdaki
      // overlay HOST px'tir. Oran, görünen genişlik / layout genişliği.
      const scale = iframeEl.clientWidth > 0 ? iframeRect.width / iframeEl.clientWidth : 1;
      const next: CoordsMap = {};
      const seen = new Set<string>();

      for (const id of effectIds) {
        const wrapper = doc.querySelector(`[data-tecof-id="${id}"]`);
        if (!wrapper) continue;

        // The editor wrapper is a full-width block even when the component's
        // real box is narrower (an inline button, a fixed-width card), which
        // made the outline always span the whole row. Measure the rendered
        // component instead: the union of the wrapper's root element(s) — tight
        // for a single root, correct for multi-root/Fragment, and a real rect
        // (never 0x0) for text/null renders (see nodeRect.ts). `primary` is the
        // largest root, used for the box-model (spacing) read. Inline components
        // carry data-tecof-id on their own root and measure directly.
        const { rect, primary } = measureNode(wrapper);

        // Resolved padding/margin for the spacing overlay (read from the
        // iframe's own window so computed values are correct).
        let box: BoxModel | undefined;
        if (win) {
          const cs = win.getComputedStyle(primary);
          const num = (v: string) => parseFloat(v) || 0;
          box = {
            mt: num(cs.marginTop), mr: num(cs.marginRight), mb: num(cs.marginBottom), ml: num(cs.marginLeft),
            pt: num(cs.paddingTop), pr: num(cs.paddingRight), pb: num(cs.paddingBottom), pl: num(cs.paddingLeft),
          };
        }

        next[id] = {
          top: rect.top * scale + iframeRect.top - containerRect.top,
          left: rect.left * scale + iframeRect.left - containerRect.left,
          width: rect.width * scale,
          height: rect.height * scale,
          // box GERÇEK px kalır (değer matematiği + etiketler); çizim scale ile çarpar.
          box,
          scale,
        };

        seen.add(id);
        // Observe the primary root for size changes (image loads, reflow) so the
        // overlay re-measures; React may swap it between renders, so re-observe.
        const previous = observedById.get(id);
        if (previous !== primary) {
          if (previous) targetObserver.unobserve(previous);
          targetObserver.observe(primary);
          observedById.set(id, primary);
        }
      }

      // Drop observations for ids that no longer resolve to an element.
      for (const [id, el] of observedById) {
        if (!seen.has(id)) {
          targetObserver.unobserve(el);
          observedById.delete(id);
        }
      }

      setCoordsMap(next);
    };

    // Coalesce measurement bursts (scroll, mutations, resizes) to one layout
    // read per frame.
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        measure();
      });
    };
    measureRef.current = schedule;

    measure();

    const iframeResizeObserver = new ResizeObserver(schedule);
    iframeResizeObserver.observe(iframeEl);
    // Fit-scale altında panel aç/kapa iframe'in LAYOUT boyutunu değiştirmez
    // (yalnız transform ölçeği değişir) — konteyneri de gözle ki overlay yeni
    // ölçeğe göre yeniden ölçülsün.
    iframeResizeObserver.observe(containerEl);

    // Capture phase catches nested scroll containers too (scroll doesn't bubble).
    doc.addEventListener('scroll', schedule, { capture: true, passive: true });
    // Images finishing loading shift layout; `load` doesn't bubble either.
    doc.addEventListener('load', schedule, true);
    window.addEventListener('resize', schedule);

    const mutationObserver = new MutationObserver(schedule);
    if (doc.body) {
      mutationObserver.observe(doc.body, { childList: true, subtree: true });
    }
    doc.fonts?.ready.then(schedule).catch(() => {});

    return () => {
      if (raf) cancelAnimationFrame(raf);
      targetObserver.disconnect();
      iframeResizeObserver.disconnect();
      mutationObserver.disconnect();
      doc.removeEventListener('scroll', schedule, true);
      doc.removeEventListener('load', schedule, true);
      window.removeEventListener('resize', schedule);
      measureRef.current = () => {};
    };
  }, [idsKey, iframeEl, containerEl]);

  // Document edits only re-measure; the bindings above stay put.
  useEffect(() => {
    measureRef.current();
  }, [documentState]);

  return coordsMap;
};

/** Bands thinner than this can't host a readable px label. */
const SPACE_LABEL_MIN = 16;

/**
 * Devtools-style spacing visualization: padding drawn inside the element (green)
 * and margin outside it (amber), each band carrying its resolved px value when
 * thick enough. Shown on hover so the user can read an element's box model at
 * a glance while laying out the page.
 */
const SpacingBands = ({ coords }: { coords: Coords }) => {
  const rawBox = coords.box;
  if (!rawBox) return null;
  const { top, left, width, height } = coords;
  // Bant GEOMETRİSİ overlay (host) px'inde çizilir → gerçek px'leri canvas
  // fit-scale'iyle çarp; ETİKETLER ise elemanın gerçek px değerini gösterir.
  const s = coords.scale || 1;
  const b = {
    mt: rawBox.mt * s, mr: rawBox.mr * s, mb: rawBox.mb * s, ml: rawBox.ml * s,
    pt: rawBox.pt * s, pr: rawBox.pr * s, pb: rawBox.pb * s, pl: rawBox.pl * s,
  };
  const innerH = Math.max(0, height - b.pt - b.pb);
  const bands: { cls: string; style: React.CSSProperties; label?: string }[] = [];
  const push = (cls: string, style: React.CSSProperties, thickness: number, realPx: number) =>
    bands.push({
      cls,
      style,
      label: thickness >= SPACE_LABEL_MIN ? String(Math.round(realPx)) : undefined,
    });

  // Margin — outside the border box.
  if (b.mt > 0) push('tecof-space-margin', { top: top - b.mt, left, width, height: b.mt }, b.mt, rawBox.mt);
  if (b.mb > 0) push('tecof-space-margin', { top: top + height, left, width, height: b.mb }, b.mb, rawBox.mb);
  if (b.ml > 0) push('tecof-space-margin', { top, left: left - b.ml, width: b.ml, height }, b.ml, rawBox.ml);
  if (b.mr > 0) push('tecof-space-margin', { top, left: left + width, width: b.mr, height }, b.mr, rawBox.mr);

  // Padding — inside the border box (sides exclude the top/bottom strips).
  if (b.pt > 0) push('tecof-space-padding', { top, left, width, height: b.pt }, b.pt, rawBox.pt);
  if (b.pb > 0) push('tecof-space-padding', { top: top + height - b.pb, left, width, height: b.pb }, b.pb, rawBox.pb);
  if (b.pl > 0) push('tecof-space-padding', { top: top + b.pt, left, width: b.pl, height: innerH }, b.pl, rawBox.pl);
  if (b.pr > 0) push('tecof-space-padding', { top: top + b.pt, left: left + width - b.pr, width: b.pr, height: innerH }, b.pr, rawBox.pr);

  return (
    <>
      {bands.map((band, i) => (
        <div key={i} className={band.cls} style={band.style}>
          {band.label && <span className="tecof-space-label">{band.label}</span>}
        </div>
      ))}
    </>
  );
};

/**
 * Spacing handles crowd (and block) tiny inline elements like nav links, so
 * they only render when the node is comfortably larger than the handles.
 */
const SPACING_HANDLES_MIN_WIDTH = 90;
const SPACING_HANDLES_MIN_HEIGHT = 48;

/**
 * Component info popover — a real button (keyboard reachable, aria-expanded)
 * that also still opens on hover via CSS.
 */
const InfoPopover = ({ node, componentConfig }: { node: TecofNode; componentConfig?: ComponentConfig }) => {
  const [open, setOpen] = useState(false);
  const fields = Object.entries(componentConfig?.fields ?? {});

  return (
    <span
      className={`tecof-info-popover-trigger${open ? ' is-open' : ''}`}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="tecof-toolbar-btn"
        title="Bileşen Bilgisi"
        aria-label="Bileşen bilgisi"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
      >
        <Info size={14} />
      </button>
      <div className="tecof-info-popover" role="tooltip">
        <div className="tecof-info-popover-title">{componentConfig?.label || node.type}</div>
        <div className="tecof-info-popover-type">{node.type}</div>
        {fields.length > 0 && (
          <div className="tecof-info-popover-fields">
            <div className="tecof-info-popover-section-title">Özellikler:</div>
            {fields.map(([fieldName, fieldConf]) => (
              <div key={fieldName} className="tecof-info-popover-field">
                <span className="tecof-info-popover-field-name">{fieldName}</span>
                <span className="tecof-info-popover-field-label">
                  ({fieldConf.label || fieldConf.type})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </span>
  );
};

interface OverlayToolbarProps {
  /** Seçili düğümün overlay koordinatları — toolbar kendini bunlara göre konumlar. */
  coords: Coords;
  /** Overlay konteyneri — toolbar konteyner sınırlarına CLAMP edilir. */
  containerEl: HTMLDivElement | null;
  node: TecofNode;
  componentConfig?: ComponentConfig;
  parentId: string | null;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isMulti: boolean;
  perms: ReturnType<typeof usePermissions>;
  onSelectParent: (id: string) => void;
  onMove: (direction: 'up' | 'down') => void;
  onDuplicate: () => void;
  onDelete: () => void;
  /** Bileşen ayarları modalını açar (sağ paneli açmadan içerik/stil/etkileşim). */
  onEdit: () => void;
  /** Stüdyo salt-okunur (revizyon önizleme) — düzenleme modalı açılmaz. */
  readOnly: boolean;
}

/**
 * Floating action toolbar — seçimin üstünde, yer yoksa altında, o da yoksa
 * görünür alana PİNLİ.
 *
 * Eski köşe-çapası (top:-36px; right:-2px + is-flipped) iki durumda kırılıyordu:
 * 1. DAR bileşen kanvasın solundayken: sağa hizalı toolbar sola taşar ve
 *    workspace'in overflow:hidden'ı butonları KIRPARDI (erişilemez).
 * 2. Tam-yükseklik bir section'ın ortasına scroll'luyken: top<44 flip'i
 *    toolbar'ı outline'ın altına — görünür alanın DIŞINA — atardı.
 * Şimdi toolbar kendini ölçer (offsetWidth/Height) ve konteyner sınırlarına
 * clamp'lenmiş konteyner-koordinatlarıyla konumlanır; outline'ın kardeşidir.
 */
const TOOLBAR_GAP = 4;
const TOOLBAR_EDGE = 4;

const OverlayToolbar = ({
  coords,
  containerEl,
  node,
  componentConfig,
  parentId,
  canMoveUp,
  canMoveDown,
  isMulti,
  perms,
  onSelectParent,
  onMove,
  onDuplicate,
  onDelete,
  onEdit,
  readOnly,
}: OverlayToolbarProps) => {
  // ⓘ düğmesi görünürlüğü (bkz. aşağıdaki kullanım) — config'ten okunur.
  const { config: studioConfig } = useStudio();
  const showInfoButton = (studioConfig as { nodeInfoButton?: boolean }).nodeInfoButton === true;
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Buton seti değişince (parentId var/yok) genişlik değişir — yeniden ölç.
  useLayoutEffect(() => {
    const el = toolbarRef.current;
    if (el) setSize({ w: el.offsetWidth, h: el.offsetHeight });
  }, [parentId]);

  const containerW = containerEl?.clientWidth ?? Number.POSITIVE_INFINITY;
  const containerH = containerEl?.clientHeight ?? Number.POSITIVE_INFINITY;

  /* Yatay: seçimin sağ kenarına hizala, konteynerin içinde kal. */
  const left = Math.max(
    TOOLBAR_EDGE,
    Math.min(coords.left + coords.width + 2 - size.w, containerW - size.w - TOOLBAR_EDGE)
  );

  /* Dikey: üstte yer varsa üstte; yoksa altta; ikisi de sığmıyorsa (uzun
     section'ın içine scroll'lanmış durum) görünür alanın üstüne pinle. */
  const above = coords.top - size.h - TOOLBAR_GAP;
  const below = coords.top + coords.height + TOOLBAR_GAP;
  let top: number;
  if (above >= TOOLBAR_EDGE) {
    top = above;
  } else if (below + size.h <= containerH - TOOLBAR_EDGE) {
    top = below;
  } else {
    top = Math.max(TOOLBAR_EDGE, Math.min(coords.top + TOOLBAR_GAP, containerH - size.h - TOOLBAR_EDGE));
  }

  /* İlk ölçümden önce (w=0) yanlış konumda tek karelik flaş olmasın. */
  const style: React.CSSProperties = size.w
    ? { top, left, visibility: 'visible' }
    : { visibility: 'hidden' };

  return (
  <div ref={toolbarRef} className="tecof-toolbar" style={style}>
    {/* ⓘ bilgi düğmesi OPT-IN (kullanıcı kararı 2026-08-20: 'gerek yok,
        default kapalı'): yalnız StudioConfig.nodeInfoButton === true olan
        temalarda görünür. */}
    {showInfoButton ? <InfoPopover node={node} componentConfig={componentConfig} /> : null}

    {/* Düzenle — Inspector gövdesini modal'da açar. Çoklu seçimde disable:
        modal tek düğümü düzenler. edit izni kapalıysa da disable (alanlar
        salt-okunur görünürdü ama yanıltıcı olur). */}
    <button
      type="button"
      onClick={onEdit}
      disabled={isMulti || readOnly || perms.edit === false}
      title="Düzenle"
      className="tecof-toolbar-btn"
      aria-label="Bileşeni düzenle"
    >
      <Pencil size={14} />
    </button>

    <div className="tecof-toolbar-sep" />

    {parentId && (
      <button
        type="button"
        onClick={() => onSelectParent(parentId)}
        title="Üst Öğeyi Seç"
        className="tecof-toolbar-btn"
        aria-label="Üst öğeyi seç"
      >
        <ChevronUp size={14} />
      </button>
    )}

    <button
      type="button"
      onClick={() => onMove('up')}
      disabled={!canMoveUp || perms.drag === false}
      title="Yukarı Taşı"
      className="tecof-toolbar-btn"
      aria-label="Yukarı taşı"
    >
      <ArrowUp size={14} />
    </button>

    <button
      type="button"
      onClick={() => onMove('down')}
      disabled={!canMoveDown || perms.drag === false}
      title="Aşağı Taşı"
      className="tecof-toolbar-btn"
      aria-label="Aşağı taşı"
    >
      <ArrowDown size={14} />
    </button>

    <div className="tecof-toolbar-sep" />

    <button
      type="button"
      onClick={onDuplicate}
      disabled={perms.duplicate === false}
      title={isMulti ? 'Tümünü Çoğalt' : 'Kopyala'}
      className="tecof-toolbar-btn"
      aria-label={isMulti ? 'Seçili öğeleri çoğalt' : 'Kopyala'}
    >
      <Copy size={14} />
    </button>

    <button
      type="button"
      onClick={onDelete}
      disabled={perms.delete === false}
      title={isMulti ? 'Tümünü Sil' : 'Sil'}
      className="tecof-toolbar-btn"
      aria-label={isMulti ? 'Seçili öğeleri sil' : 'Sil'}
    >
      <Trash2 size={14} />
    </button>
  </div>
  );
};

/**
 * Selected node ancestry + size, rendered as a FIXED status bar at the bottom
 * of the canvas overlay (Elementor-style) instead of chips attached to the
 * node — attached chips covered neighbouring content and hijacked clicks on
 * small elements. Clicking a crumb re-selects that ancestor.
 */
const OverlayStatusBar = ({
  documentState,
  selectedId,
  coords,
}: {
  documentState: TecofDocument;
  selectedId: string;
  coords: Coords;
}) => {
  const selectNode = useEditorStore((state) => state.selectNode);
  const hoverNode = useEditorStore((state) => state.hoverNode);
  const crumbs = getBreadcrumbs(documentState, selectedId);
  if (crumbs.length === 0) return null;

  return (
    <div className="tecof-overlay-statusbar">
      <div className="tecof-breadcrumbs">
        {crumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.id}>
            {idx > 0 && <span className="tecof-breadcrumb-sep">&gt;</span>}
            <span
              onClick={() => selectNode(crumb.id)}
              className={`tecof-breadcrumb${crumb.id === selectedId ? ' is-active' : ''}`}
              onMouseEnter={() => hoverNode(crumb.id)}
              onMouseLeave={() => hoverNode(null)}
            >
              {crumb.type}
            </span>
          </React.Fragment>
        ))}
      </div>
      <span className="tecof-statusbar-size" title="Genişlik × Yükseklik (px)">
        {Math.round(coords.width)} × {Math.round(coords.height)}
      </span>
    </div>
  );
};

export const SelectionOverlay = () => {
  const { config, readOnly } = useStudio();
  const documentState = useEditorStore((state) => state.document);
  const selectedId = useEditorStore((state) => state.selection.selectedId);
  const selectedIds = useEditorStore((state) => state.selection.selectedIds);
  const hoveredId = useEditorStore((state) => state.selection.hoveredId);
  const mode = useUiStore((state) => state.mode);
  const setNodeSettingsOpen = useUiStore((state) => state.setNodeSettingsOpen);
  const openAddSection = useUiStore((state) => state.openAddSection);
  // Inline metin düzenlemesi sürerken TÜM seçim chrome'u (outline + toolbar +
  // durum çubuğu) gizlenir — kullanıcı yazarken imleç tek odak kalsın
  // (Squarespace davranışı). Commit/cancel bayrağı temizler, chrome geri gelir.
  const inlineEditing = useUiStore((state) => state.inlineEditingNodeId != null);

  const selectNode = useEditorStore((state) => state.selectNode);
  const removeNode = useEditorStore((state) => state.removeNode);
  const removeNodes = useEditorStore((state) => state.removeNodes);
  const duplicateNode = useEditorStore((state) => state.duplicateNode);
  const duplicateNodes = useEditorStore((state) => state.duplicateNodes);
  const moveNode = useEditorStore((state) => state.moveNode);

  const isMulti = selectedIds.length > 1;

  // Bulk delete/duplicate when multiple nodes are selected; otherwise single.
  const handleDelete = () => {
    if (isMulti) removeNodes(selectedIds);
    else if (selectedId) removeNode(selectedId);
  };
  const handleDuplicate = () => {
    if (isMulti) duplicateNodes(selectedIds);
    else if (selectedId) duplicateNode(selectedId);
  };

  const [iframeEl, setIframeEl] = useState<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Locate the canvas iframe. The connected-check bails immediately while the
  // known iframe is still mounted, so document keystrokes don't run a DOM
  // query — only an actual canvas remount (viewport switch) triggers one.
  useEffect(() => {
    if (iframeEl && iframeEl.isConnected) return;
    const iframe = document.querySelector<HTMLIFrameElement>('.tecof-canvas-viewport iframe');
    if (iframe !== iframeEl) setIframeEl(iframe);
  }, [documentState, iframeEl]);

  // While the canvas is actively scrolling, outlines must track the content
  // 1:1 — the top/left transition (nice when hopping between nodes) reads as
  // the selection box lagging behind the page. Flag scroll activity so CSS can
  // suspend the transition, clearing shortly after the last scroll event.
  const [isScrolling, setIsScrolling] = useState(false);
  useEffect(() => {
    const doc = iframeEl?.contentDocument;
    if (!doc) return;
    let timer: number | null = null;
    const onScroll = () => {
      setIsScrolling(true);
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => setIsScrolling(false), 120);
    };
    doc.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      doc.removeEventListener('scroll', onScroll, true);
      if (timer) window.clearTimeout(timer);
    };
  }, [iframeEl]);

  // One measurement pass for the whole selection (primary + secondaries), and
  // a second small one for the hovered node.
  const selectionIdList = useMemo(() => {
    const ids = selectedId ? [selectedId] : [];
    for (const id of selectedIds) {
      if (id !== selectedId) ids.push(id);
    }
    return ids;
  }, [selectedId, selectedIds]);

  const hoverIdList = useMemo(
    () => (hoveredId && hoveredId !== selectedId ? [hoveredId] : []),
    [hoveredId, selectedId],
  );

  const selectionCoords = useOverlayCoords(selectionIdList, iframeEl, containerRef.current, documentState);
  const hoverCoords = useOverlayCoords(hoverIdList, iframeEl, containerRef.current, documentState);

  const selectedCoords = selectedId ? selectionCoords[selectedId] ?? null : null;
  const hoveredCoords = hoveredId ? hoverCoords[hoveredId] ?? null : null;

  // Determine actions availability
  const nodeDetails = selectedId ? findNodeById(documentState, selectedId) : null;
  const parentId = selectedId ? getParentId(documentState, selectedId) : null;
  const componentConfig: ComponentConfig | undefined = nodeDetails
    ? config?.components?.[nodeDetails.node.type]
    : undefined;

  // Ortak (shared) bileşen tespiti — mor outline varyantı için.
  // sharedComponentId taşıyan node, kayıtta master'a yazılıp tüm sayfalara yayılır.
  const isSharedNode = (id: string | null): boolean => {
    if (!id) return false;
    const d = findNodeById(documentState, id);
    return !!(d?.node?.props as Record<string, unknown> | undefined)?.sharedComponentId;
  };
  const selectedIsShared = !!(nodeDetails?.node?.props as Record<string, unknown> | undefined)?.sharedComponentId;

  /* İç element mi? Bir zone içinde yaşayan (kök content'te olmayan) düğüm bir
     slot çocuğudur (Title/Button/Card…). Seçim/hover çerçevesi KESİKLİ çizilir;
     section'lar (kök) DÜZ çizgi kalır — böylece neyin section neyin element
     olduğu bir bakışta anlaşılır. */
  const isInnerNode = (id: string | null): boolean => {
    if (!id) return false;
    return !!findNodeById(documentState, id)?.path.zoneKey;
  };

  const canMoveUp = nodeDetails ? nodeDetails.path.index > 0 : false;
  const canMoveDown = nodeDetails ? (() => {
    const { zoneKey, index } = nodeDetails.path;
    const items = zoneKey ? (documentState.zones[zoneKey] || []) : documentState.content;
    return index < items.length - 1;
  })() : false;

  const handleMove = (direction: 'up' | 'down') => {
    if (!selectedId || !nodeDetails) return;
    const { zoneKey, index } = nodeDetails.path;
    // moveNode expects a drop index measured BEFORE the node is removed from
    // the list (drag-and-drop semantics): it subtracts 1 itself when the target
    // is past the source. So "one down" = insert before the element two ahead;
    // passing index + 1 would compensate back to the original spot (no-op).
    const newIndex = direction === 'up' ? index - 1 : index + 2;
    moveNode(selectedId, zoneKey, newIndex);
  };

  // Toolbar affordances follow the primary node's permissions. Bulk actions are
  // additionally filtered by the engine, so a locked node in a multi-selection is
  // always skipped even if the button stays enabled for the others.
  const perms = usePermissions(selectedId);

  // Spacing drag in progress: the overlay root captures all pointer events
  // (so nothing leaks into the iframe) and shows the matching resize cursor.
  const [spacingDragAxis, setSpacingDragAxis] = useState<SpacingAxis | null>(null);
  const [resizeCorner, setResizeCorner] = useState<ResizeCorner | null>(null);

  // Resize mode (TopBar toggle) swaps the edge handles: width/height resize
  // instead of padding/margin. Opt-out per component via `resizable: false`.
  const resizeEnabled = useUiStore((state) => state.resizeEnabled);
  const canResize = resizeEnabled && componentConfig?.resizable !== false;
  /* Spacing tutamaçları artık OPT-IN (TopBar toggle, kısayol B) — eskiden her
     seçimde varsayılan çıkıyordu ve gündelik düzenlemede kalabalık yapıyordu. */
  const spacingEnabled = useUiStore((state) => state.spacingEnabled);

  // Preview mode hides all editor chrome so links/buttons are fully interactive.
  if (mode === 'preview') return null;

  return (
    <div
      ref={containerRef}
      className={`tecof-overlay${isScrolling ? ' is-scrolling' : ''}${
        spacingDragAxis ? ` is-spacing-dragging is-axis-${spacingDragAxis}` : ''
      }${resizeCorner ? ` is-spacing-dragging is-resizing is-resize-${resizeCorner}` : ''}${
        inlineEditing ? ' is-inline-editing' : ''
      }`}
    >
      {/* Hover Highlight + spacing (padding/margin) visualization */}
      {hoveredCoords && (
        <>
          <SpacingBands coords={hoveredCoords} />
          <div
            className={`tecof-outline is-hover${isInnerNode(hoveredId) ? ' is-inner' : ''}${isSharedNode(hoveredId) ? ' is-shared' : ''}`}
            style={getOutlineStyle(hoveredCoords)}
          />
        </>
      )}

      {/* Secondary selection outlines (every selected id except the primary).
          The primary keeps the full outline + toolbar below. */}
      {selectionIdList
        .filter((id) => id !== selectedId && selectionCoords[id])
        .map((id) => (
          <div
            key={id}
            className={`tecof-outline is-selected is-multi${isInnerNode(id) ? ' is-inner' : ''}${isSharedNode(id) ? ' is-shared' : ''}`}
            style={getOutlineStyle(selectionCoords[id])}
          />
        ))}

      {/* Selection Box & Toolbar */}
      {selectedId && selectedCoords && nodeDetails && (
        <div
          className={`tecof-outline is-selected${nodeDetails?.path.zoneKey ? ' is-inner' : ''}${selectedIsShared ? ' is-shared' : ''}`}
          style={getOutlineStyle(selectedCoords)}
        >
          {/* Single selection, editable, big enough to host handles: resize mode
              shows width/height handles, otherwise the padding/margin ones. */}
          {!isMulti &&
            perms.edit !== false &&
            selectedCoords.box &&
            selectedCoords.width >= SPACING_HANDLES_MIN_WIDTH &&
            selectedCoords.height >= SPACING_HANDLES_MIN_HEIGHT &&
            (canResize ? (
              <ResizeHandles
                nodeId={selectedId}
                coords={selectedCoords}
                onResizeChange={setResizeCorner}
              />
            ) : spacingEnabled ? (
              <SpacingDragHandles
                nodeId={selectedId}
                coords={selectedCoords}
                onDragAxisChange={setSpacingDragAxis}
              />
            ) : null)}
        </div>
      )}

      {/* Floating Toolbar — outline'ın KARDEŞİ: kendini ölçüp konteyner
          sınırlarına clamp'lenir (dar bileşende kırpılmaz, uzun section'da
          görünür alanda kalır).
          `!inlineEditing`: toolbar kendi INLINE style'ıyla `visibility:'visible'`
          bastığı için `.tecof-overlay.is-inline-editing > *` CSS kuralı onu
          gizleyemez (inline style her stylesheet kuralını yener) — yazım
          sırasında gizlemenin tek doğru yolu render'dan düşürmek. */}
      {selectedId && selectedCoords && nodeDetails && !inlineEditing && (
        <OverlayToolbar
          coords={selectedCoords}
          containerEl={containerRef.current}
          node={nodeDetails.node}
          componentConfig={componentConfig}
          parentId={parentId}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          isMulti={isMulti}
          perms={perms}
          onSelectParent={selectNode}
          onMove={handleMove}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onEdit={() => setNodeSettingsOpen(true)}
          readOnly={!!readOnly}
        />
      )}

      {/* Squarespace "Bölüm Ekle": KÖK bir section seçiliyken alt kenarın tam
          ortasında kalıcı pil. BURADA (host overlay) yaşar, iframe'deki
          InsertOverlay'de DEĞİL: seçim çerçevesi host'ta çizilir ve iframe
          içeriğinin HEP üstündedir — pil iframe'deyken çerçeve çizgisi yazının
          üstüne biniyordu. Kök akışta k index'i k'inci çocuğun ÖNÜNE ekler →
          seçilinin altı = path.index + 1. Hover-bazlı iframe affordance'ları
          aynen durur; bu yalnız seçime bağlı kalıcı olanıdır.
          SON kök section İSTİSNA: iframe'in her-zaman-görünür kuyruk pili
          zaten aynı index'e ekliyor — ikisi birden üst üste iki "Bölüm Ekle"
          yığıyordu, host pili orada bastırılır. */}
      {selectedId &&
        selectedCoords &&
        nodeDetails &&
        nodeDetails.path.zoneKey === undefined &&
        nodeDetails.path.index < documentState.content.length - 1 &&
        !isMulti &&
        !readOnly &&
        !inlineEditing && (
          <>
            {/* Pil ile AYNI koordinattan çizilen ayraç çizgisi — iframe'in
                boşluk-ortası çizgisi bastırıldığı için (InsertOverlay
                is-suppressed) çizgi+pil hep aynı noktada, kayma imkânsız. */}
            <div
              aria-hidden
              className="tecof-add-below-line"
              style={{
                top: selectedCoords.top + selectedCoords.height,
                left: selectedCoords.left,
                width: selectedCoords.width,
              }}
            />
          <button
            type="button"
            className="tecof-add-below"
            style={{
              top: selectedCoords.top + selectedCoords.height,
              left: selectedCoords.left + selectedCoords.width / 2,
            }}
            title="Bu bölümün altına yeni bölüm ekle"
            onClick={(e) => {
              e.stopPropagation();
              openAddSection({ index: nodeDetails.path.index + 1 });
            }}
          >
            <Plus size={12} strokeWidth={2.6} aria-hidden="true" />
            Bölüm Ekle
          </button>
          </>
        )}

      {/* Yol + ölçü bilgisi: node'a yapışık çipler yerine canvas'ın sol altında
          sabit durum çubuğu — küçük elemanların üzerini örtmez, tıklama çalmaz. */}
      {selectedId && selectedCoords && nodeDetails && (
        <OverlayStatusBar
          documentState={documentState}
          selectedId={selectedId}
          coords={selectedCoords}
        />
      )}
    </div>
  );
};
