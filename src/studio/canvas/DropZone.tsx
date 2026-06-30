import React, { createContext, useContext } from 'react';
import { useEditorStore } from '../../engine/store';
import { useStudio } from '../context';
import { NodeRenderer } from './NodeRenderer';
import { useDropTarget } from './useDropTarget';

export const ParentNodeContext = createContext<string | null>(null);

export interface DropZoneProps {
  zone: string;
  className?: string;
  style?: React.CSSProperties;
  /** Lay children out side-by-side (row) instead of stacked (column). */
  orientation?: 'vertical' | 'horizontal';
}

export const DropZone = ({ zone, className, style, orientation = 'vertical' }: DropZoneProps) => {
  const parentId = useContext(ParentNodeContext);
  const zoneKey = parentId ? `${parentId}:${zone}` : zone;
  const { readOnly } = useStudio();
  // Global "is any drag active" flag drives the dropzone affordance; this is a
  // legitimately global subscription (not node-scoped).
  const isDragActive = useEditorStore((state) => state.drag != null);

  // Get items for this zone from the store
  const items = useEditorStore((state) => state.document.zones[zoneKey]) || [];

  const { isDragOver, onDragOver, onDragLeave, onDrop } = useDropTarget({
    zoneKey,
    locked: readOnly,
    getIndex: () => items.length,
  });

  const dropzoneClassName = [
    'tecof-dropzone',
    orientation === 'horizontal' ? 'is-horizontal' : '',
    items.length === 0 ? 'is-empty' : '',
    isDragOver ? 'is-dragover' : '',
    isDragActive ? 'is-drag-active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={dropzoneClassName}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={style}
      data-tecof-zone={zoneKey}
      data-tecof-orientation={orientation}
    >
      {items.length === 0 ? (
        <span className="tecof-dropzone-hint">
          {isDragOver ? 'Buraya Bırakın' : 'Bileşen Sürükleyin'}
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
export const renderDropZone = ({ zone, className, style, orientation }: DropZoneProps) => {
  return <DropZone zone={zone} className={className} style={style} orientation={orientation} />;
};
export default DropZone;
