import React, { createContext, useContext } from 'react';
import { useEditorStore } from '../../engine/store';
import { NodeRenderer } from './NodeRenderer';

export const ParentNodeContext = createContext<string | null>(null);

export interface DropZoneProps {
  zone: string;
  className?: string;
  style?: React.CSSProperties;
}

export const DropZone = ({ zone, className, style }: DropZoneProps) => {
  const parentId = useContext(ParentNodeContext);
  const zoneKey = parentId ? `${parentId}:${zone}` : zone;

  // Get items for this zone from the store
  const items = useEditorStore((state) => state.document.zones[zoneKey] || []);

  return (
    <div
      className={`tecof-dropzone ${className || ''}`}
      style={{ minHeight: items.length === 0 ? '40px' : undefined, ...style }}
      data-tecof-zone={zoneKey}
    >
      {items.map((item, index) => (
        <NodeRenderer key={item.props.id} node={item} index={index} zoneKey={zoneKey} />
      ))}
    </div>
  );
};

// Helper for puck.renderDropZone
export const renderDropZone = ({ zone, className, style }: DropZoneProps) => {
  return <DropZone zone={zone} className={className} style={style} />;
};
