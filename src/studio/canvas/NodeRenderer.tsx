import React, { useCallback, useRef, useState } from 'react';
import { useStudio } from '../context';
import { ParentNodeContext, renderDropZone } from './DropZone';
import { useEditorStore } from '../../engine/store';
import { useContextMenuStore } from '../contextMenuStore';
import type { TecofNode } from '../../types';
import { setDragGhost } from './dragGhost';
import { createEventAutoScroller, createNode, readDragData, writeDragData } from './dndUtils';
import { NodeErrorBoundary } from './NodeErrorBoundary';

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
  const beginDrag = useEditorStore((state) => state.beginDrag);
  const endDrag = useEditorStore((state) => state.endDrag);
  const drag = useEditorStore((state) => state.drag);
  const autoScrollerRef = useRef(createEventAutoScroller());

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

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;
      e.preventDefault();
      e.stopPropagation();
      selectNode(node.props.id);

      // The wrapper lives inside the canvas iframe, so the cursor coords are
      // relative to the iframe viewport. Translate them into HOST coords by
      // adding the iframe element's offset, since the menu renders in host DOM.
      let hostX = e.clientX;
      let hostY = e.clientY;
      const frameEl = (e.currentTarget.ownerDocument.defaultView as Window | null)?.frameElement;
      if (frameEl) {
        const frameRect = frameEl.getBoundingClientRect();
        hostX += frameRect.left;
        hostY += frameRect.top;
      }
      useContextMenuStore.getState().openMenu(node.props.id, hostX, hostY);
    },
    [selectNode, node.props.id, readOnly]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;
      const target = e.target as HTMLElement;

      const validTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'div'];
      const tag = target.tagName.toLowerCase();
      if (!validTags.includes(tag)) return;

      const text = target.textContent?.trim() || '';
      if (!text) return;

      let matchingPropName: string | null = null;
      let isMultilingual = false;
      const ownerDoc = target.ownerDocument;
      const ownerWin = ownerDoc.defaultView;
      let matchedLangCode = ownerDoc.documentElement.lang || 'tr';

      for (const [key, value] of Object.entries(node.props)) {
        if (typeof value === 'string' && value.trim() === text) {
          matchingPropName = key;
          break;
        }
        if (Array.isArray(value)) {
          // Check if it matches a translation item value
          const matchedItem = value.find(
            (item) =>
              item &&
              typeof item === 'object' &&
              typeof item.value === 'string' &&
              item.value.trim() === text
          );
          if (matchedItem) {
            matchingPropName = key;
            isMultilingual = true;
            matchedLangCode = matchedItem.code;
            break;
          }
        }
      }

      if (!matchingPropName) return;

      e.stopPropagation();

      const originalText = target.textContent || '';

      target.contentEditable = 'true';
      target.setAttribute('data-tecof-inline-editing', 'true');
      target.focus();

      // Range select
      const range = ownerDoc.createRange();
      range.selectNodeContents(target);
      const sel = ownerWin?.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      const propName = matchingPropName;
      const finalIsMultilingual = isMultilingual;
      const finalLangCode = matchedLangCode;

      const commitInlineEdit = () => {
        target.contentEditable = 'false';
        target.removeAttribute('data-tecof-inline-editing');
        target.removeEventListener('blur', handleBlur);
        target.removeEventListener('keydown', handleKeyDown);

        const newText = target.textContent?.trim() || '';

        if (finalIsMultilingual) {
          const currentArray = Array.isArray(node.props[propName]) ? node.props[propName] : [];
          const updatedArray = currentArray.map((item: any) => {
            if (item && item.code === finalLangCode) {
              return { ...item, value: newText };
            }
            return item;
          });

          if (!updatedArray.some((item: any) => item && item.code === finalLangCode)) {
            updatedArray.push({ code: finalLangCode, value: newText });
          }

          useEditorStore.getState().updateProps(node.props.id, {
            [propName]: updatedArray
          });
        } else {
          useEditorStore.getState().updateProps(node.props.id, {
            [propName]: newText
          });
        }
      };

      const cancelInlineEdit = () => {
        target.textContent = originalText;
        target.contentEditable = 'false';
        target.removeAttribute('data-tecof-inline-editing');
        target.removeEventListener('blur', handleBlur);
        target.removeEventListener('keydown', handleKeyDown);
      };

      const handleBlur = () => {
        commitInlineEdit();
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          cancelInlineEdit();
          return;
        }

        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          target.blur();
        }
      };

      target.addEventListener('blur', handleBlur);
      target.addEventListener('keydown', handleKeyDown);
    },
    [node.props, node.props.id, readOnly]
  );

  const [dragOverPosition, setDragOverPosition] = useState<'top' | 'bottom' | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    autoScrollerRef.current.update(e);

    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    if (relativeY < rect.height / 2) {
      setDragOverPosition('top');
    } else {
      setDragOverPosition('bottom');
    }
  }, [readOnly]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    autoScrollerRef.current.stop();
    setDragOverPosition(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    autoScrollerRef.current.stop();
    setDragOverPosition(null);

    const { nodeId, type } = readDragData(e);
    const targetIndex = dragOverPosition === 'top' ? index : index + 1;

    if (nodeId && nodeId !== node.props.id) {
      useEditorStore.getState().moveNode(nodeId, zoneKey || undefined, targetIndex);
    } else if (type) {
      useEditorStore.getState().insertNode(createNode(config, type), zoneKey || undefined, targetIndex);
    }
    endDrag();
  }, [dragOverPosition, index, node.props.id, zoneKey, config, readOnly, endDrag]);

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
    readOnly ? 'is-readonly' : '',
    drag?.id === node.props.id ? 'is-dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

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
      <div className="tecof-node">
        {dragOverPosition === 'top' && (
          <div className="tecof-drop-line" />
        )}
        <div
          className={wrapperClassName}
          data-tecof-id={node.props.id}
          data-tecof-type={node.type}
          data-tecof-index={index}
          data-tecof-zone={zoneKey || 'root'}
          draggable={!readOnly}
          onDragStart={(e) => {
            writeDragData(e, { nodeId: node.props.id });
            e.dataTransfer.effectAllowed = 'move';
            setDragGhost(e, label);
            beginDrag({ id: node.props.id });
          }}
          onDragEnd={() => {
            autoScrollerRef.current.stop();
            endDrag();
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          onDoubleClick={handleDoubleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <NodeErrorBoundary type={node.type} nodeId={node.props.id}>
            {componentConfig.render(componentProps)}
          </NodeErrorBoundary>
        </div>
        {dragOverPosition === 'bottom' && (
          <div className="tecof-drop-line" />
        )}
      </div>
    </ParentNodeContext.Provider>
  );
};
