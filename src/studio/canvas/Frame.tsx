import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { isEmbedded, postToHost } from '../bridge';
import { installCanvasInteractionGuard } from './overlayPortal';

export interface FrameProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  children: React.ReactNode;
}

export const Frame = ({
  children,
  title = 'Canvas Frame',
  className,
  style: _style,
  ...props
}: FrameProps) => {
  const [contentRef, setContentRef] = useState<HTMLIFrameElement | null>(null);
  const mountNode = contentRef?.contentWindow?.document?.body;
  const scrollPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!contentRef) return;
    const doc = contentRef.contentDocument;
    if (!doc) return;

    // Create the canvas-specific style block exactly once. It is never
    // torn down or rebuilt by the sync logic below, so it can't thrash.
    const canvasStyle = doc.createElement('style');
    canvasStyle.setAttribute('data-tecof-canvas', 'true');
    canvasStyle.textContent = `
        html, body {
          margin: 0;
          padding: 0;
          background-color: transparent;
          min-height: 100vh;
          box-sizing: border-box;
          /* Keep canvas scrolling inside the canvas: when the page hits its
             scroll end, don't chain the wheel into the editor chrome. */
          overscroll-behavior-y: contain;
        }
        .tecof-node-wrapper {
          position: relative;
          transition: outline 0.15s ease-in-out;
        }
        /* Overlay portals stay truly interactive in edit mode: restore the
           normal cursor over them instead of the wrapper's grab cursor. */
        [data-tecof-portal] { cursor: auto; }
        [data-tecof-portal] * { cursor: auto; }
        /* Custom scrollbars for iframe */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: var(--tecof-scrollbar-thumb);
          border-radius: var(--tecof-radius-xs);
        }
        ::-webkit-scrollbar-thumb:hover {
          background: var(--tecof-scrollbar-thumb-hover);
        }
      `;
    doc.head.appendChild(canvasStyle);

    // Track mirrored external <link> hrefs so we only append new ones and
    // remove stale ones, rather than rebuilding the whole head.
    const mirroredLinks = new Map<string, HTMLLinkElement>();
    // Cache of the last concatenated inline-style content; we only rebuild
    // the mirrored inline <style> block when its combined content changes.
    let lastInlineContent: string | null = null;
    let inlineStyleNode: HTMLStyleElement | null = null;

    // Incremental, diff-based sync of host styles into the iframe head.
    const copyStyles = () => {
      const seenHrefs = new Set<string>();
      const inlineParts: string[] = [];

      Array.from(document.styleSheets).forEach((styleSheet) => {
        try {
          if (styleSheet.href) {
            const href = styleSheet.href;
            seenHrefs.add(href);
            // Only append links we haven't mirrored yet.
            if (!mirroredLinks.has(href)) {
              const link = doc.createElement('link');
              link.rel = 'stylesheet';
              link.href = href;
              link.setAttribute('data-tecof-mirrored', 'link');
              doc.head.appendChild(link);
              mirroredLinks.set(href, link);
            }
          } else {
            const cssRules = Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join('\n');
            inlineParts.push(cssRules);
          }
        } catch {
          // Cross-origin stylesheet rules might fail to read, skip them
        }
      });

      // Remove iframe links whose source href no longer exists in the host.
      mirroredLinks.forEach((link, href) => {
        if (!seenHrefs.has(href)) {
          link.remove();
          mirroredLinks.delete(href);
        }
      });

      // Reconcile inline styles only when their combined content changed.
      const inlineContent = inlineParts.join('\n');
      if (inlineContent !== lastInlineContent) {
        lastInlineContent = inlineContent;
        if (!inlineStyleNode) {
          inlineStyleNode = doc.createElement('style');
          inlineStyleNode.setAttribute('data-tecof-mirrored', 'inline');
          // Insert before the canvas style so canvas rules keep precedence.
          doc.head.insertBefore(inlineStyleNode, canvasStyle);
        }
        inlineStyleNode.textContent = inlineContent;
      }
    };

    copyStyles();

    // Coalesce a burst of head mutations into at most one sync per frame.
    let rafId: number | null = null;
    const scheduleSync = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        copyStyles();
      });
    };

    const observer = new MutationObserver(scheduleSync);
    observer.observe(document.head, { childList: true, subtree: true });

    // Set body attributes
    const body = doc.body;
    let handleBodyClick: ((e: MouseEvent) => void) | null = null;
    let handleIframeKeyDown: ((e: KeyboardEvent) => void) | null = null;
    let handleScroll: (() => void) | null = null;

    // Edit-mode interaction guard: in edit mode, links/buttons/forms inside the
    // canvas are inert (native navigation & submit cancelled) unless they sit in
    // an overlay portal — so a click selects the node instead of leaving the
    // page being edited. Reads mode non-reactively (like the store reads below).
    const uninstallGuard = installCanvasInteractionGuard(
      doc,
      () => useUiStore.getState().mode === 'edit'
    );

    if (body) {
      body.className = 'tecof-canvas-body';

      handleBodyClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.tecof-node-wrapper')) {
          useEditorStore.getState().selectNode(null);
          if (isEmbedded()) {
            postToHost('puck:itemDeselected');
          }
        }
      };

      handleIframeKeyDown = (e: KeyboardEvent) => {
        // Never forward keystrokes typed into an editable element (inputs or
        // inline contentEditable editing). Re-dispatching them on the parent
        // window would bypass the host's input guards — the synthetic event's
        // target is `window`, so e.g. Delete would remove the selected node
        // while the user is just deleting text.
        const target = e.target as HTMLElement | null;
        if (target) {
          const tag = target.tagName?.toLowerCase();
          if (tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable) {
            return;
          }
        }
        // While a node is selected, arrow keys navigate the sibling selection
        // in the parent studio. Its preventDefault() only cancels the forwarded
        // synthetic copy — not this original event — so without this guard the
        // iframe would ALSO scroll natively on every arrow press.
        if (
          !e.metaKey && !e.ctrlKey && !e.altKey &&
          (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') &&
          useEditorStore.getState().selection.selectedId
        ) {
          e.preventDefault();
        }
        const event = new KeyboardEvent('keydown', {
          key: e.key,
          code: e.code,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
          bubbles: true
        });
        window.dispatchEvent(event);
      };

      const onScroll = () => {
        scrollPosRef.current = {
          x: doc.documentElement.scrollLeft || body.scrollLeft,
          y: doc.documentElement.scrollTop || body.scrollTop,
        };
      };
      handleScroll = onScroll;

      body.addEventListener('click', handleBodyClick);
      doc.addEventListener('keydown', handleIframeKeyDown);
      doc.addEventListener('scroll', onScroll, { capture: true, passive: true });
    }

    return () => {
      observer.disconnect();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      uninstallGuard();
      if (body && handleBodyClick) {
        body.removeEventListener('click', handleBodyClick);
      }
      if (handleIframeKeyDown) {
        doc.removeEventListener('keydown', handleIframeKeyDown);
      }
      if (handleScroll) {
        doc.removeEventListener('scroll', handleScroll, true);
      }
    };
  }, [contentRef]);

  // Preserve scroll position on every re-render of the portal children
  useEffect(() => {
    if (!contentRef) return;
    const doc = contentRef.contentDocument;
    const body = doc?.body;
    if (doc && body) {
      const { x, y } = scrollPosRef.current;
      const currentX = doc.documentElement.scrollLeft || body.scrollLeft;
      const currentY = doc.documentElement.scrollTop || body.scrollTop;
      if (currentX !== x || currentY !== y) {
        doc.documentElement.scrollLeft = x;
        doc.documentElement.scrollTop = y;
        body.scrollLeft = x;
        body.scrollTop = y;
      }
    }
  });

  return (
    <iframe
      title={title}
      ref={setContentRef}
      className={['tecof-canvas-frame', className].filter(Boolean).join(' ')}
      {...props}
    >
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
};
