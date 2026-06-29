import React, { useEffect, useState, useRef } from 'react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { getBreadcrumbs, getParentId, findNodeById } from '../../engine/zones';
import { ArrowUp, ArrowDown, Copy, Trash2, ChevronUp } from 'lucide-react';

interface Coords {
  top: number;
  left: number;
  width: number;
  height: number;
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

      const element = doc.querySelector(`[data-tecof-id="${id}"]`);
      if (!element) {
        setCoords(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      const iframeRect = iframeEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();

      setCoords({
        top: rect.top + iframeRect.top - containerRect.top,
        left: rect.left + iframeRect.left - containerRect.left,
        width: rect.width,
        height: rect.height,
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

    const iframeWin = iframeEl.contentWindow;

    // Watch iframe resize
    resizeObserver = new ResizeObserver(() => {
      updateCoords();
    });
    resizeObserver.observe(iframeEl);

    // Watch scroll inside iframe and resize globally
    iframeWin?.addEventListener('scroll', updateCoords);
    window.addEventListener('resize', updateCoords);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (targetResizeObserver) targetResizeObserver.disconnect();
      iframeWin?.removeEventListener('scroll', updateCoords);
      window.removeEventListener('resize', updateCoords);
    };
  }, [id, iframeEl, containerEl, documentState]);

  return coords;
};

export const SelectionOverlay = () => {
  const documentState = useEditorStore((state) => state.document);
  const selectedId = useEditorStore((state) => state.selection.selectedId);
  const hoveredId = useEditorStore((state) => state.selection.hoveredId);
  const mode = useUiStore((state) => state.mode);

  const selectNode = useEditorStore((state) => state.selectNode);
  const removeNode = useEditorStore((state) => state.removeNode);
  const duplicateNode = useEditorStore((state) => state.duplicateNode);
  const moveNode = useEditorStore((state) => state.moveNode);

  const [iframeEl, setIframeEl] = useState<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Retrieve elements on mount / change
  useEffect(() => {
    const iframe = document.querySelector('.tecof-canvas-viewport iframe') as HTMLIFrameElement;
    setIframeEl(iframe);
  }, [documentState]);

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
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    moveNode(selectedId, zoneKey, newIndex);
  };

  const breadcrumbs = selectedId ? getBreadcrumbs(documentState, selectedId) : [];

  // Preview mode hides all editor chrome so links/buttons are fully interactive.
  if (mode === 'preview') return null;

  return (
    <div
      ref={containerRef}
      className="tecof-overlay"
    >
      {/* Hover Highlight */}
      {hoveredCoords && (
        <div
          className="tecof-outline is-hover"
          style={getOutlineStyle(hoveredCoords)}
        />
      )}

      {/* Selection Box & Toolbar */}
      {selectedCoords && (
        <div
          className="tecof-outline is-selected"
          style={getOutlineStyle(selectedCoords)}
        >
          {/* Floating Toolbar */}
          <div className="tecof-toolbar">
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
              disabled={!canMoveUp}
              title="Yukarı Taşı"
              className="tecof-toolbar-btn"
              aria-label="Yukarı taşı"
            >
              <ArrowUp size={14} />
            </button>

            <button
              type="button"
              onClick={() => handleMove('down')}
              disabled={!canMoveDown}
              title="Aşağı Taşı"
              className="tecof-toolbar-btn"
              aria-label="Aşağı taşı"
            >
              <ArrowDown size={14} />
            </button>

            <div className="tecof-toolbar-sep" />

            <button
              type="button"
              onClick={() => duplicateNode(selectedId!)}
              title="Kopyala"
              className="tecof-toolbar-btn"
              aria-label="Kopyala"
            >
              <Copy size={14} />
            </button>

            <button
              type="button"
              onClick={() => removeNode(selectedId!)}
              title="Sil"
              className="tecof-toolbar-btn"
              aria-label="Sil"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Component Tag Label */}
          {nodeDetails && (
            <div className="tecof-outline-label">
              {nodeDetails.node.type}
            </div>
          )}

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
