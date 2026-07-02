import React, { useEffect, useState, useRef } from 'react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { getBreadcrumbs, getParentId, findNodeById } from '../../engine/zones';
import { ArrowUp, ArrowDown, Copy, Trash2, ChevronUp, Info } from 'lucide-react';
import { useStudio } from '../context';
import { usePermissions } from '../usePermissions';

/** Resolved padding/margin (px) for the spacing overlay. */
interface BoxModel {
  mt: number; mr: number; mb: number; ml: number;
  pt: number; pr: number; pb: number; pl: number;
}

interface Coords {
  top: number;
  left: number;
  width: number;
  height: number;
  box?: BoxModel;
}

const getOutlineStyle = (coords: Coords) =>
  ({
    '--tecof-outline-top': `${coords.top}px`,
    '--tecof-outline-left': `${coords.left}px`,
    '--tecof-outline-width': `${coords.width}px`,
    '--tecof-outline-height': `${coords.height}px`,
  }) as React.CSSProperties;

const useOverlayCoords = (
  id: string | null,
  iframeEl: HTMLIFrameElement | null,
  containerEl: HTMLDivElement | null,
  documentState: any // pass documentState to trigger recalculation on layout edits
) => {
  const [coords, setCoords] = useState<Coords | null>(null);

  useEffect(() => {
    if (!id || !iframeEl || !containerEl) {
      setCoords(null);
      return;
    }

    let resizeObserver: ResizeObserver | null = null;
    let targetResizeObserver: ResizeObserver | null = null;

    const updateCoords = () => {
      const doc = iframeEl.contentDocument;
      if (!doc) return;

      const wrapper = doc.querySelector(`[data-tecof-id="${id}"]`);
      if (!wrapper) {
        setCoords(null);
        return;
      }

      // The editor wrapper is a full-width block even when the component's
      // real box is narrower (an inline button, a fixed-width card), which
      // made the outline always span the whole row. Measure the rendered
      // component root instead when it is the wrapper's single element child,
      // falling back to the wrapper for fragments/empty renders. Inline
      // components carry data-tecof-id on their own root (no wrapper), so
      // they are measured directly.
      let element: Element = wrapper;
      if (wrapper.classList.contains('tecof-node-wrapper') && wrapper.childElementCount === 1) {
        const inner = wrapper.firstElementChild as Element;
        const innerRect = inner.getBoundingClientRect();
        if (innerRect.width > 0 && innerRect.height > 0) element = inner;
      }

      const rect = element.getBoundingClientRect();
      const iframeRect = iframeEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();

      // Resolved padding/margin for the spacing overlay (read from the iframe's
      // own window so computed values are correct).
      let box: BoxModel | undefined;
      const win = iframeEl.contentWindow;
      if (win) {
        const cs = win.getComputedStyle(element);
        const num = (v: string) => parseFloat(v) || 0;
        box = {
          mt: num(cs.marginTop), mr: num(cs.marginRight), mb: num(cs.marginBottom), ml: num(cs.marginLeft),
          pt: num(cs.paddingTop), pr: num(cs.paddingRight), pb: num(cs.paddingBottom), pl: num(cs.paddingLeft),
        };
      }

      setCoords({
        top: rect.top + iframeRect.top - containerRect.top,
        left: rect.left + iframeRect.left - containerRect.left,
        width: rect.width,
        height: rect.height,
        box,
      });

      // Bind resize observer to element itself if not already bound
      if (!targetResizeObserver) {
        targetResizeObserver = new ResizeObserver(() => {
          updateCoords();
        });
        targetResizeObserver.observe(element);
      }
    };

    updateCoords();

    const iframeDoc = iframeEl.contentDocument;

    // Watch iframe resize
    resizeObserver = new ResizeObserver(() => {
      updateCoords();
    });
    resizeObserver.observe(iframeEl);

    // Watch scrolling inside the iframe. Capture phase on the document catches
    // nested scroll containers too (scroll doesn't bubble), and the rAF
    // coalescing keeps the per-scroll work to one measurement per frame — the
    // raw handler ran layout reads on every scroll event and made canvas
    // scrolling stutter with a selection active.
    let scrollRaf = 0;
    const onAnyScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        updateCoords();
      });
    };
    iframeDoc?.addEventListener('scroll', onAnyScroll, { capture: true, passive: true });
    window.addEventListener('resize', updateCoords);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (targetResizeObserver) targetResizeObserver.disconnect();
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      iframeDoc?.removeEventListener('scroll', onAnyScroll, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [id, iframeEl, containerEl, documentState]);

  return coords;
};

/**
 * Renders a single secondary selection outline for a non-primary selected id.
 * Kept as its own component so the coords hook can run per-id (hooks rules).
 */
const SecondaryOutline = ({
  id,
  iframeEl,
  containerEl,
  documentState,
}: {
  id: string;
  iframeEl: HTMLIFrameElement | null;
  containerEl: HTMLDivElement | null;
  documentState: any;
}) => {
  const coords = useOverlayCoords(id, iframeEl, containerEl, documentState);
  if (!coords) return null;
  return (
    <div
      className="tecof-outline is-selected is-multi"
      style={getOutlineStyle(coords)}
    />
  );
};

/**
 * Devtools-style spacing visualization: padding drawn inside the element (green)
 * and margin outside it (amber). Shown on hover so the user can read an element's
 * box model at a glance while laying out the page.
 */
const SpacingBands = ({ coords }: { coords: Coords }) => {
  const b = coords.box;
  if (!b) return null;
  const { top, left, width, height } = coords;
  const innerH = Math.max(0, height - b.pt - b.pb);
  const bands: { cls: string; style: React.CSSProperties }[] = [];
  const push = (cls: string, style: React.CSSProperties) => bands.push({ cls, style });

  // Margin — outside the border box.
  if (b.mt > 0) push('tecof-space-margin', { top: top - b.mt, left, width, height: b.mt });
  if (b.mb > 0) push('tecof-space-margin', { top: top + height, left, width, height: b.mb });
  if (b.ml > 0) push('tecof-space-margin', { top, left: left - b.ml, width: b.ml, height });
  if (b.mr > 0) push('tecof-space-margin', { top, left: left + width, width: b.mr, height });

  // Padding — inside the border box (sides exclude the top/bottom strips).
  if (b.pt > 0) push('tecof-space-padding', { top, left, width, height: b.pt });
  if (b.pb > 0) push('tecof-space-padding', { top: top + height - b.pb, left, width, height: b.pb });
  if (b.pl > 0) push('tecof-space-padding', { top: top + b.pt, left, width: b.pl, height: innerH });
  if (b.pr > 0) push('tecof-space-padding', { top: top + b.pt, left: left + width - b.pr, width: b.pr, height: innerH });

  return (
    <>
      {bands.map((band, i) => (
        <div key={i} className={band.cls} style={band.style} />
      ))}
    </>
  );
};

export const SelectionOverlay = () => {
  const { config } = useStudio();
  const documentState = useEditorStore((state) => state.document);
  const selectedId = useEditorStore((state) => state.selection.selectedId);
  const selectedIds = useEditorStore((state) => state.selection.selectedIds);
  const hoveredId = useEditorStore((state) => state.selection.hoveredId);
  const mode = useUiStore((state) => state.mode);

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

  // Retrieve elements on mount / change
  useEffect(() => {
    const iframe = document.querySelector('.tecof-canvas-viewport iframe') as HTMLIFrameElement;
    setIframeEl(iframe);
  }, [documentState]);

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

  const selectedCoords = useOverlayCoords(selectedId, iframeEl, containerRef.current, documentState);
  const hoveredCoords = useOverlayCoords(
    hoveredId !== selectedId ? hoveredId : null,
    iframeEl,
    containerRef.current,
    documentState
  );

  // Determine actions availability
  const nodeDetails = selectedId ? findNodeById(documentState, selectedId) : null;
  const parentId = selectedId ? getParentId(documentState, selectedId) : null;

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

  const breadcrumbs = selectedId ? getBreadcrumbs(documentState, selectedId) : [];

  // Toolbar affordances follow the primary node's permissions. Bulk actions are
  // additionally filtered by the engine, so a locked node in a multi-selection is
  // always skipped even if the button stays enabled for the others.
  const perms = usePermissions(selectedId);

  // Preview mode hides all editor chrome so links/buttons are fully interactive.
  if (mode === 'preview') return null;

  return (
    <div
      ref={containerRef}
      className={`tecof-overlay${isScrolling ? ' is-scrolling' : ''}`}
    >
      {/* Hover Highlight + spacing (padding/margin) visualization */}
      {hoveredCoords && (
        <>
          <SpacingBands coords={hoveredCoords} />
          <div
            className="tecof-outline is-hover"
            style={getOutlineStyle(hoveredCoords)}
          />
        </>
      )}

      {/* Secondary selection outlines (every selected id except the primary).
          The primary keeps the full outline + toolbar below. */}
      {selectedIds
        .filter((id) => id !== selectedId)
        .map((id) => (
          <SecondaryOutline
            key={id}
            id={id}
            iframeEl={iframeEl}
            containerEl={containerRef.current}
            documentState={documentState}
          />
        ))}

      {/* Selection Box & Toolbar */}
      {selectedCoords && (
        <div
          className="tecof-outline is-selected"
          style={getOutlineStyle(selectedCoords)}
        >
          {/* Floating Toolbar — flips below the selection when there isn't room
              above it (element near the top of the canvas). */}
          <div className={`tecof-toolbar${selectedCoords.top < 44 ? ' is-flipped' : ''}`}>
            {/* Info Popover inside toolbar */}
            {nodeDetails && (() => {
              const componentConfig = config?.components?.[nodeDetails.node.type] as any;
              return (
                <div className="tecof-toolbar-btn tecof-info-popover-trigger" title="Bileşen Bilgisi">
                  <Info size={14} />
                  <div className="tecof-info-popover">
                    <div className="tecof-info-popover-title">
                      {componentConfig?.label || nodeDetails.node.type}
                    </div>
                    <div className="tecof-info-popover-type">
                      {nodeDetails.node.type}
                    </div>
                    {componentConfig?.fields && Object.keys(componentConfig.fields).length > 0 && (
                      <div className="tecof-info-popover-fields">
                        <div className="tecof-info-popover-section-title">Özellikler:</div>
                        {Object.entries(componentConfig.fields).map(([fieldName, fieldConf]: [string, any]) => (
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
                </div>
              );
            })()}

            <div className="tecof-toolbar-sep" />

            {parentId && (
              <button
                type="button"
                onClick={() => selectNode(parentId)}
                title="Üst Öğeyi Seç"
                className="tecof-toolbar-btn"
                aria-label="Üst öğeyi seç"
              >
                <ChevronUp size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleMove('up')}
              disabled={!canMoveUp || perms.drag === false}
              title="Yukarı Taşı"
              className="tecof-toolbar-btn"
              aria-label="Yukarı taşı"
            >
              <ArrowUp size={14} />
            </button>

            <button
              type="button"
              onClick={() => handleMove('down')}
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
              onClick={handleDuplicate}
              disabled={perms.duplicate === false}
              title={isMulti ? 'Tümünü Çoğalt' : 'Kopyala'}
              className="tecof-toolbar-btn"
              aria-label={isMulti ? 'Seçili öğeleri çoğalt' : 'Kopyala'}
            >
              <Copy size={14} />
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={perms.delete === false}
              title={isMulti ? 'Tümünü Sil' : 'Sil'}
              className="tecof-toolbar-btn"
              aria-label={isMulti ? 'Seçili öğeleri sil' : 'Sil'}
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Selected Node Breadcrumbs (Bottom overlay) */}
          {breadcrumbs.length > 1 && (
            <div className="tecof-breadcrumbs">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.id}>
                  {idx > 0 && <span className="tecof-breadcrumb-sep">&gt;</span>}
                  <span
                    onClick={() => selectNode(crumb.id)}
                    className={`tecof-breadcrumb${crumb.id === selectedId ? ' is-active' : ''}`}
                    onMouseEnter={() => useEditorStore.getState().hoverNode(crumb.id)}
                    onMouseLeave={() => useEditorStore.getState().hoverNode(null)}
                  >
                    {crumb.type}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
