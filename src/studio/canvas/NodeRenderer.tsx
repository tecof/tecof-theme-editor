import React, { useCallback } from 'react';
import { useStudio } from '../context';
import { ParentNodeContext, renderDropZone } from './DropZone';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import type { TecofNode } from '../../types';
import { setDragGhost } from './dragGhost';
import { writeDragData } from './dndUtils';
import { useInlineEdit } from './useInlineEdit';
import { useDropTarget } from './useDropTarget';
import { NodeErrorBoundary } from './NodeErrorBoundary';
import { postToHost, isEmbedded } from '../bridge';
import { compileStyles, mergeClassName } from '../style/compileStyles';
import { STYLES_PROP } from '../style/types';

export interface NodeRendererProps {
  node: TecofNode;
  index: number;
  zoneKey?: string;
}

export const NodeRenderer = ({ node, index, zoneKey }: NodeRendererProps) => {
  const { config, metadata, readOnly: studioReadOnly } = useStudio();
  const mode = useUiStore((s) => s.mode);
  // In preview mode the canvas behaves like the live site: no select/hover/drag,
  // components receive editMode=false so their links & buttons are clickable.
  const locked = studioReadOnly || mode === 'preview';
  const componentConfig = config.components[node.type];

  const selectNode = useEditorStore((state) => state.selectNode);
  const toggleSelect = useEditorStore((state) => state.toggleSelect);
  const hoverNode = useEditorStore((state) => state.hoverNode);
  // Node-scoped derived selectors: each node only re-renders when ITS OWN hover/
  // drag state flips, instead of every node re-rendering on any hover/drag change.
  const isHovered = useEditorStore((state) => state.selection.hoveredId === node.props.id);
  const isDragging = useEditorStore((state) => state.drag?.id === node.props.id);
  const beginDrag = useEditorStore((state) => state.beginDrag);
  const endDrag = useEditorStore((state) => state.endDrag);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (locked) return;
      e.stopPropagation();
      hoverNode(node.props.id);
    },
    [hoverNode, node.props.id, locked]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      if (locked) return;
      e.stopPropagation();
      if (isHovered) {
        hoverNode(null);
      }
    },
    [hoverNode, node.props.id, isHovered, locked]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (locked) return;
      e.stopPropagation();

      // Cmd/Ctrl-click (or Shift-click) toggles multi-selection; plain click is
      // single-select as before (and only the single path notifies the host of
      // the primary, preserving existing puck:itemSelected behaviour).
      if (e.metaKey || e.ctrlKey || e.shiftKey) {
        toggleSelect(node.props.id);
        return;
      }

      selectNode(node.props.id);

      // Notify the host (when embedded) that an item was selected.
      if (isEmbedded()) {
        postToHost('puck:itemSelected', {
          item: {
            type: node.type,
            id: node.props.id,
          },
        });
      }
    },
    [selectNode, toggleSelect, node.props.id, node.type, locked]
  );

  const { onDoubleClick } = useInlineEdit(node, locked);

  const { position, onDragOver, onDragLeave, onDrop } = useDropTarget({
    zoneKey,
    positional: true,
    index,
    locked,
    selfId: node.props.id,
  });

  if (!componentConfig) {
    return (
      <div className="tecof-node-missing">
        Bileşen bulunamadı: {node.type}
      </div>
    );
  }

  const label = componentConfig.label || node.type;
  const wrapperClassName = [
    'tecof-node-wrapper',
    locked ? 'is-readonly' : '',
    isDragging ? 'is-dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Compile the node's structured Tailwind styles and pass them as `className`
  // so the component applies them to its root (same prop flows in production).
  const styleClassName = compileStyles(node.props[STYLES_PROP]);

  const componentProps = {
    ...node.props,
    className: mergeClassName(node.props.className, styleClassName),
    puck: {
      renderDropZone,
      isEditing: !locked,
      metadata: {
        ...(metadata || {}),
        ...(componentConfig.metadata || {}),
      },
    },
    editMode: !locked,
  } as any;

  if (componentConfig.fields) {
    Object.entries(componentConfig.fields).forEach(([fieldName, fieldDef]: [string, any]) => {
      if (fieldDef && fieldDef.type === 'slot') {
        componentProps[fieldName] = renderDropZone({ zone: fieldName });
      }
    });
  }

  // Reset the error boundary when the node id or its props change, so the
  // component can recover after the user edits the offending prop.
  const errorResetKey = `${node.props.id}:${JSON.stringify(node.props)}`;

  // We wrap in ParentNodeContext so any inner DropZone knows its parent id
  return (
    <ParentNodeContext.Provider value={node.props.id}>
      <div className="tecof-node">
        {position === 'top' && (
          <div className="tecof-drop-line" />
        )}
        <div
          className={wrapperClassName}
          data-tecof-id={node.props.id}
          data-tecof-type={node.type}
          data-tecof-index={index}
          data-tecof-zone={zoneKey || 'root'}
          draggable={!locked}
          onDragStart={(e) => {
            writeDragData(e, { nodeId: node.props.id });
            e.dataTransfer.effectAllowed = 'move';
            setDragGhost(e, label);
            beginDrag({ id: node.props.id });
          }}
          onDragEnd={() => {
            endDrag();
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onDoubleClick={onDoubleClick}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <NodeErrorBoundary label={label} type={node.type} resetKey={errorResetKey}>
            {componentConfig.render(componentProps)}
          </NodeErrorBoundary>
        </div>
        {position === 'bottom' && (
          <div className="tecof-drop-line" />
        )}
      </div>
    </ParentNodeContext.Provider>
  );
};
