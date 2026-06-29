import React from 'react';
import { useEditorStore } from '../../engine/store';
import { NodeRenderer } from './NodeRenderer';
import { Frame } from './Frame';

export const Canvas = () => {
  const content = useEditorStore((state) => state.document.content);
  const viewport = useEditorStore((state) => state.viewport);

  const getWidth = () => {
    switch (viewport) {
      case 'tablet':
        return '768px';
      case 'mobile':
        return '375px';
      case 'desktop':
      default:
        return '100%';
    }
  };

  return (
    <div className="tecof-canvas-container" style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f4f4f5',
      padding: '24px',
      overflow: 'auto',
      height: '100%',
      boxSizing: 'border-box'
    }}>
      <div
        className="tecof-canvas-viewport-wrapper"
        style={{
          width: getWidth(),
          height: '100%',
          maxWidth: '100%',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          borderRadius: viewport === 'desktop' ? '0' : '12px',
          overflow: 'hidden',
          backgroundColor: '#ffffff'
        }}
      >
        <Frame>
          <div className="tecof-canvas-root" style={{ minHeight: '100%' }}>
            {content.map((item, index) => (
              <NodeRenderer key={item.props.id} node={item} index={index} />
            ))}
          </div>
        </Frame>
      </div>
    </div>
  );
};
