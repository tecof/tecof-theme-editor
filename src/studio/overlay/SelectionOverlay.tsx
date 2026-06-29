import React, { useEffect, useState, useRef } from 'react';
import { useEditorStore } from '../../engine/store';
import { getBreadcrumbs, getParentId, findNodeById } from '../../engine/zones';
import { ArrowUp, ArrowDown, Copy, Trash2, ChevronUp } from 'lucide-react';

interface Coords {
  top: number;
  left: number;
  width: number;
  height: number;
}

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

  const selectNode = useEditorStore((state) => state.selectNode);
  const removeNode = useEditorStore((state) => state.removeNode);
  const duplicateNode = useEditorStore((state) => state.duplicateNode);
  const moveNode = useEditorStore((state) => state.moveNode);

  const [iframeEl, setIframeEl] = useState<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Retrieve elements on mount / change
  useEffect(() => {
    const iframe = document.querySelector('.tecof-canvas-viewport-wrapper iframe') as HTMLIFrameElement;
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

  return (
    <div
      ref={containerRef}
      className="tecof-selection-overlay-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {/* Hover Highlight */}
      {hoveredCoords && (
        <div
          className="tecof-hover-outline"
          style={{
            position: 'absolute',
            top: hoveredCoords.top,
            left: hoveredCoords.left,
            width: hoveredCoords.width,
            height: hoveredCoords.height,
            border: '1.5px dashed #3b82f6',
            borderRadius: '4px',
            boxSizing: 'border-box',
            pointerEvents: 'none',
            transition: 'all 0.1s ease-out',
          }}
        />
      )}

      {/* Selection Box & Toolbar */}
      {selectedCoords && (
        <div
          className="tecof-selected-outline"
          style={{
            position: 'absolute',
            top: selectedCoords.top,
            left: selectedCoords.left,
            width: selectedCoords.width,
            height: selectedCoords.height,
            border: '2px solid #3b82f6',
            borderRadius: '4px',
            boxSizing: 'border-box',
            pointerEvents: 'none',
            transition: 'all 0.1s ease-out',
          }}
        >
          {/* Floating Toolbar */}
          <div
            className="tecof-floating-toolbar"
            style={{
              position: 'absolute',
              top: '-36px',
              right: '-2px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#3b82f6',
              borderRadius: '6px',
              padding: '4px',
              pointerEvents: 'auto',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
            }}
          >
            {parentId && (
              <button
                onClick={() => selectNode(parentId)}
                title="Üst Öğeyi Seç"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                }}
              >
                <ChevronUp size={14} />
              </button>
            )}

            <button
              onClick={() => handleMove('up')}
              disabled={!canMoveUp}
              title="Yukarı Taşı"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                opacity: canMoveUp ? 1 : 0.5,
                cursor: canMoveUp ? 'pointer' : 'not-allowed',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
              }}
            >
              <ArrowUp size={14} />
            </button>

            <button
              onClick={() => handleMove('down')}
              disabled={!canMoveDown}
              title="Aşağı Taşı"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                opacity: canMoveDown ? 1 : 0.5,
                cursor: canMoveDown ? 'pointer' : 'not-allowed',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
              }}
            >
              <ArrowDown size={14} />
            </button>

            <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.3)', margin: '0 2px' }} />

            <button
              onClick={() => duplicateNode(selectedId!)}
              title="Kopyala"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
              }}
            >
              <Copy size={14} />
            </button>

            <button
              onClick={() => removeNode(selectedId!)}
              title="Sil"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Component Tag Label */}
          {nodeDetails && (
            <div
              className="tecof-outline-label"
              style={{
                position: 'absolute',
                top: '-26px',
                left: '-2px',
                background: '#3b82f6',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px 4px 0 0',
                userSelect: 'none',
              }}
            >
              {nodeDetails.node.type}
            </div>
          )}

          {/* Selected Node Breadcrumbs (Bottom overlay) */}
          {breadcrumbs.length > 1 && (
            <div
              className="tecof-selected-breadcrumbs"
              style={{
                position: 'absolute',
                bottom: '-28px',
                left: '-2px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: '#18181b',
                color: '#a1a1aa',
                fontSize: '10px',
                padding: '4px 8px',
                borderRadius: '0 0 6px 6px',
                pointerEvents: 'auto',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.id}>
                  {idx > 0 && <span style={{ color: '#52525b' }}>&gt;</span>}
                  <span
                    onClick={() => selectNode(crumb.id)}
                    style={{
                      cursor: 'pointer',
                      color: crumb.id === selectedId ? '#ffffff' : undefined,
                      fontWeight: crumb.id === selectedId ? 600 : undefined,
                    }}
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
