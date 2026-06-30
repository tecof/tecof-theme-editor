import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useEditorStore } from '../../engine/store';
import { isEmbedded, postToHost } from '../bridge';

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
        }
        .tecof-node-wrapper {
          position: relative;
          transition: outline 0.15s ease-in-out;
        }
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
        } catch (e) {
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

      body.addEventListener('click', handleBodyClick);
      doc.addEventListener('keydown', handleIframeKeyDown);
    }

    return () => {
      observer.disconnect();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (body && handleBodyClick) {
        body.removeEventListener('click', handleBodyClick);
      }
      if (handleIframeKeyDown) {
        doc.removeEventListener('keydown', handleIframeKeyDown);
      }
    };
  }, [contentRef]);

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
