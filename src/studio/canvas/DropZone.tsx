import React, { createContext, useContext, useRef, useState } from 'react';
import { useEditorStore } from '../../engine/store';
import { useStudio } from '../context';
import { NodeRenderer } from './NodeRenderer';
import { createEventAutoScroller, createNode, readDragData } from './dndUtils';

export const ParentNodeContext = createContext<string | null>(null);

export interface DropZoneProps {
  zone: string;
  className?: string;
  style?: React.CSSProperties;
}

export const DropZone = ({ zone, className, style }: DropZoneProps) => {
  const parentId = useContext(ParentNodeContext);
  const zoneKey = parentId ? `${parentId}:${zone}` : zone;
  const { config } = useStudio();
  const insertNode = useEditorStore((state) => state.insertNode);
  const endDrag = useEditorStore((state) => state.endDrag);
  const drag = useEditorStore((state) => state.drag);
  const autoScrollerRef = useRef(createEventAutoScroller());

  const [isDragOver, setIsDragOver] = useState(false);

  // Get items for this zone from the store
  const items = useEditorStore((state) => state.document.zones[zoneKey] || []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    autoScrollerRef.current.update(e);
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    autoScrollerRef.current.stop();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    autoScrollerRef.current.stop();
    setIsDragOver(false);

    const { nodeId, type } = readDragData(e);

    if (nodeId) {
      useEditorStore.getState().moveNode(nodeId, zoneKey, items.length);
    } else if (type) {
      insertNode(createNode(config, type), zoneKey, items.length);
    }

    endDrag();
  };

  const dropzoneClassName = [
    'tecof-dropzone',
    items.length === 0 ? 'is-empty' : '',
    isDragOver ? 'is-dragover' : '',
    drag ? 'is-drag-active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={dropzoneClassName}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={style}
      data-tecof-zone={zoneKey}
    >
      {items.length === 0 ? (
        <span className="tecof-dropzone-hint">
          {isDragOver ? 'Buraya Bırakın' : 'Bileşen Sürükleyin veya Tıklayın'}
        </span>
      ) : (
        items.map((item, index) => (
          <NodeRenderer key={item.props.id} node={item} index={index} zoneKey={zoneKey} />
        ))
      )}
    </div>
  );
};

// Helper for puck.renderDropZone
export const renderDropZone = ({ zone, className, style }: DropZoneProps) => {
  return <DropZone zone={zone} className={className} style={style} />;
};
export default DropZone;
