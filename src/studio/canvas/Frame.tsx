import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useEditorStore } from '../../engine/store';

export interface FrameProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  children: React.ReactNode;
}

export const Frame = ({ children, title = 'Canvas Frame', ...props }: FrameProps) => {
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
        }
        body {
          padding: 32px 16px;
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
          background: rgba(0, 0, 0, 0.15);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }
      `;
      doc.head.appendChild(style);
    };

    copyStyles();

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

      doc.body.addEventListener('click', handleBodyClick);
      return () => {
        doc.body.removeEventListener('click', handleBodyClick);
      };
    }
  }, [contentRef]);

  return (
    <iframe
      title={title}
      ref={setContentRef}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        background: '#ffffff',
        ...props.style,
      }}
      {...props}
    >
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
};
