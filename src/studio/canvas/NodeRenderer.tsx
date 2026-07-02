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
import { useInlineDragRef } from './useInlineDragRef';
import { usePermissions } from '../usePermissions';

export interface NodeRendererProps {
  node: TecofNode;
  index: number;
  zoneKey?: string;
}

const getInlineIndicatorStyle = (
  el: HTMLElement,
  axis: 'x' | 'y',
  position: 'before' | 'after'
): React.CSSProperties => {
  const r = el.getBoundingClientRect();
  return axis === 'x'
    ? {
        position: 'fixed',
        top: r.top,
        height: r.height,
        width: 3,
        left: position === 'before' ? r.left - 5 : r.right + 2,
      }
    : {
        position: 'fixed',
        left: r.left,
        width: r.width,
        height: 3,
        top: position === 'before' ? r.top - 5 : r.bottom + 2,
      };
};

export const NodeRenderer = ({ node, index, zoneKey }: NodeRendererProps) => {
  const { config, metadata, readOnly: studioReadOnly } = useStudio();
  const mode = useUiStore((s) => s.mode);
  // In preview mode the canvas behaves like the live site: no select/hover/drag,
  // components receive editMode=false so their links & buttons are clickable.
  const locked = studioReadOnly || mode === 'preview';
  const componentConfig = config.components[node.type];
  // Drag affordance also respects the node's `drag` permission (engine still
  // enforces moveNode regardless; this just stops the drag from starting).
  const perms = usePermissions(node.props.id);
  const dragLocked = locked || perms.drag === false;

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

  const { position, axis, onDragOver, onDragLeave, onDrop } = useDropTarget({
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

  const { setRef: dragRef, nodeRef: inlineNodeRef } = useInlineDragRef({
    node,
    index,
    zoneKey,
    locked,
    wrapperClassName,
    label,
    beginDrag,
    endDrag,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    onDoubleClick,
    onDragOver,
    onDragLeave,
    onDrop,
  });

  const componentProps = {
    ...node.props,
    className: mergeClassName(node.props.className, styleClassName),
    puck: {
      dragRef: componentConfig.inline ? dragRef : undefined,
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
        componentProps[fieldName] = renderDropZone({ zone: fieldName, orientation: fieldDef.orientation });
      }
    });
  }

  // Reset the error boundary when the node id or its props change, so the
  // component can recover after the user edits the offending prop.
  const errorResetKey = `${node.props.id}:${JSON.stringify(node.props)}`;

  return (
    <ParentNodeContext.Provider value={node.props.id}>
      {componentConfig.inline ? (
        <>
          {/* Inline nodes have no positioned `.tecof-node` wrapper to anchor the
              absolute indicator, so we place it with fixed coords measured from
              the node's own element — layout (flex/grid columns) stays intact. */}
          {position && inlineNodeRef.current && (
            <div
              className="tecof-drop-indicator"
              style={getInlineIndicatorStyle(inlineNodeRef.current, axis, position)}
            />
          )}
          <NodeErrorBoundary label={label} type={node.type} resetKey={errorResetKey}>
            {componentConfig.render(componentProps)}
          </NodeErrorBoundary>
        </>
      ) : (
        <div className="tecof-node">
          {/* Single absolutely-positioned indicator; `axis` decides whether it's a
              horizontal bar (column layout) or a vertical bar (row/grid layout),
              and `position` which edge it hugs. */}
          {position && (
            <div className={`tecof-drop-indicator is-${axis} is-${position}`} />
          )}
          <div
            className={wrapperClassName}
            data-tecof-id={node.props.id}
            data-tecof-type={node.type}
            data-tecof-index={index}
            data-tecof-zone={zoneKey || 'root'}
            draggable={!dragLocked}
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
        </div>
      )}
    </ParentNodeContext.Provider>
  );
};
