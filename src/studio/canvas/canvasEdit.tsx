import React, { useEffect, useRef } from 'react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { findNodeById } from '../../engine/zones';
import { isInsideOverlayPortal } from './overlayPortal';
import { runInlineEditFromEvent } from './useInlineEdit';
import { useActiveLanguage } from '../language/LanguageContext';

/**
 * Delegated double-click (inline text edit) + right-click (context menu) for the
 * canvas — moved off the per-node wrapper so nodes can render wrapperless. Both
 * resolve the node from the nearest `[data-tecof-id]` (present on every node's
 * rendered root: non-inline via the draggable observer, inline via
 * useInlineDragRef). Mounted via a hidden anchor component so it can read the
 * studio's active editing language for inline edit.
 */

const nodeIdOf = (target: EventTarget | null): string | null =>
  (target as Element | null)?.closest?.('[data-tecof-id]')?.getAttribute('data-tecof-id') ?? null;

function installCanvasEdit(doc: Document, getActiveLanguage: () => string | null): () => void {
  const isEdit = () => useUiStore.getState().mode === 'edit';

  const onDblClick = (e: MouseEvent) => {
    if (!isEdit() || isInsideOverlayPortal(e.target)) return;
    const id = nodeIdOf(e.target);
    if (!id) return;
    const node = findNodeById(useEditorStore.getState().document, id)?.node;
    if (node) runInlineEditFromEvent(e, node, getActiveLanguage(), false);
  };

  const onContextMenu = (e: MouseEvent) => {
    if (!isEdit() || isInsideOverlayPortal(e.target)) return;
    const id = nodeIdOf(e.target);
    if (!id) return;
    e.preventDefault();
    useEditorStore.getState().selectNode(id);
    // iframe → host coordinate translation (fit-scale aware), matching the old
    // per-node handler: the menu renders in the parent document.
    const iframe = document.querySelector<HTMLIFrameElement>('.tecof-canvas-viewport iframe');
    const iframeRect = iframe?.getBoundingClientRect();
    const scale =
      iframe && iframeRect && iframe.clientWidth > 0 ? iframeRect.width / iframe.clientWidth : 1;
    useUiStore.getState().setContextMenu({
      nodeId: id,
      x: e.clientX * scale + (iframeRect?.left ?? 0),
      y: e.clientY * scale + (iframeRect?.top ?? 0),
    });
  };

  doc.addEventListener('dblclick', onDblClick);
  doc.addEventListener('contextmenu', onContextMenu);
  return () => {
    doc.removeEventListener('dblclick', onDblClick);
    doc.removeEventListener('contextmenu', onContextMenu);
  };
}

/** Mounts delegated inline-edit + context-menu on the canvas iframe document. */
export const CanvasEditDelegation: React.FC = () => {
  const activeLanguage = useActiveLanguage()?.activeLanguage ?? null;
  const langRef = useRef(activeLanguage);
  langRef.current = activeLanguage;
  const anchorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const doc = anchorRef.current?.ownerDocument;
    if (!doc) return;
    // Yalnız düzenleme modunda mount edildiğimiz için (Canvas koşullu render)
    // body'ye edit işareti basmak güvenli: paket CSS'i bununla salt-editör
    // affordance'larını açar (ör. `[data-tecof-item]` repeater kart hover
    // çerçevesi) — önizleme/yayında sınıf hiç var olmaz.
    doc.body?.classList.add('tecof-canvas-edit');
    const uninstall = installCanvasEdit(doc, () => langRef.current);
    return () => {
      doc.body?.classList.remove('tecof-canvas-edit');
      uninstall();
    };
  }, []);
  return <div ref={anchorRef} style={{ display: 'none' }} aria-hidden="true" />;
};
