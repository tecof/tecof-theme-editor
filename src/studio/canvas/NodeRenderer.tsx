import React, { useCallback } from 'react';
import { useStudio } from '../context';
import { ParentNodeContext, renderDropZone } from './DropZone';
import { useEditorStore } from '../../engine/store';
import type { TecofNode } from '../../types';

export interface NodeRendererProps {
  node: TecofNode;
  index: number;
  zoneKey?: string;
}

export const NodeRenderer = ({ node, index, zoneKey }: NodeRendererProps) => {
  const { config, metadata, readOnly } = useStudio();
  const componentConfig = config.components[node.type];

  const selectNode = useEditorStore((state) => state.selectNode);
  const hoverNode = useEditorStore((state) => state.hoverNode);
  const hoveredId = useEditorStore((state) => state.selection.hoveredId);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;
      e.stopPropagation();
      hoverNode(node.props.id);
    },
    [hoverNode, node.props.id, readOnly]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;
      e.stopPropagation();
      if (hoveredId === node.props.id) {
        hoverNode(null);
      }
    },
    [hoverNode, node.props.id, hoveredId, readOnly]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;
      e.stopPropagation();
      selectNode(node.props.id);

      // Post message to host if embedded
      const isEmbedded = typeof window !== 'undefined' && window.parent !== window;
      if (isEmbedded) {
        window.parent.postMessage(
          {
            type: 'puck:itemSelected',
            item: {
              type: node.type,
              id: node.props.id,
            },
          },
          '*'
        );
      }
    },
    [selectNode, node.props.id, node.type, readOnly]
  );

  if (!componentConfig) {
    return (
      <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', fontSize: '12px', borderRadius: '4px' }}>
        Bileşen bulunamadı: {node.type}
      </div>
    );
  }

  const componentProps = {
    ...node.props,
    puck: {
      renderDropZone,
      isEditing: !readOnly,
      metadata: {
        ...(metadata || {}),
        ...(componentConfig.metadata || {}),
      },
    },
    editMode: !readOnly,
  };

  // We wrap in ParentNodeContext so any inner DropZone knows its parent id
  return (
    <ParentNodeContext.Provider value={node.props.id}>
      <div
        className="tecof-node-wrapper"
        data-tecof-id={node.props.id}
        data-tecof-type={node.type}
        data-tecof-index={index}
        data-tecof-zone={zoneKey || 'root'}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          cursor: readOnly ? undefined : 'pointer',
        }}
      >
        {componentConfig.render(componentProps)}
      </div>
    </ParentNodeContext.Provider>
  );
};

