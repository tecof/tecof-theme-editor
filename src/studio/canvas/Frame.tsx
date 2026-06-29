import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useEditorStore } from '../../engine/store';

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

    // Helper to copy parent styles into iframe for styling parity
    const copyStyles = () => {
      // Clear head first
      doc.head.innerHTML = '';

      // Copy stylesheet links and styles
      Array.from(document.styleSheets).forEach((styleSheet) => {
        try {
          if (styleSheet.href) {
            const link = doc.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleSheet.href;
            doc.head.appendChild(link);
          } else {
            const cssRules = Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join('\n');
            const style = doc.createElement('style');
            style.textContent = cssRules;
            doc.head.appendChild(style);
          }
        } catch (e) {
          // Cross-origin stylesheet rules might fail to read, skip them
        }
      });

      // Add studio canvas specific styles
      const style = doc.createElement('style');
      style.textContent = `
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
      doc.head.appendChild(style);
    };

    copyStyles();

    const observer = new MutationObserver(() => {
      copyStyles();
    });
    observer.observe(document.head, { childList: true, subtree: true });

    // Set body attributes
    if (doc.body) {
      doc.body.className = 'tecof-canvas-body';
      
      const handleBodyClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.tecof-node-wrapper')) {
          useEditorStore.getState().selectNode(null);
          const isEmbedded = typeof window !== 'undefined' && window.parent !== window;
          if (isEmbedded) {
            window.parent.postMessage({ type: 'puck:itemDeselected' }, '*');
          }
        }
      };

      const handleIframeKeyDown = (e: KeyboardEvent) => {
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

      doc.body.addEventListener('click', handleBodyClick);
      doc.addEventListener('keydown', handleIframeKeyDown);
      
      return () => {
        observer.disconnect();
        doc.body.removeEventListener('click', handleBodyClick);
        doc.removeEventListener('keydown', handleIframeKeyDown);
      };
    }
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
