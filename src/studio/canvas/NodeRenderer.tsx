import React, { useCallback, useRef, useState } from 'react';
import { useStudio } from '../context';
import { ParentNodeContext, renderDropZone } from './DropZone';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import type { TecofNode } from '../../types';
import { setDragGhost } from './dragGhost';
import { createEventAutoScroller, createNode, readDragData, writeDragData } from './dndUtils';
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
  const hoverNode = useEditorStore((state) => state.hoverNode);
  const hoveredId = useEditorStore((state) => state.selection.hoveredId);
  const beginDrag = useEditorStore((state) => state.beginDrag);
  const endDrag = useEditorStore((state) => state.endDrag);
  const drag = useEditorStore((state) => state.drag);
  const autoScrollerRef = useRef(createEventAutoScroller());

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
      if (hoveredId === node.props.id) {
        hoverNode(null);
      }
    },
    [hoverNode, node.props.id, hoveredId, locked]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (locked) return;
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
    [selectNode, node.props.id, node.type, locked]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (locked) return;
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
    [node.props, node.props.id, locked]
  );

  const [dragOverPosition, setDragOverPosition] = useState<'top' | 'bottom' | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (locked) return;
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
  }, [locked]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    autoScrollerRef.current.stop();
    setDragOverPosition(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (locked) return;
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
  }, [dragOverPosition, index, node.props.id, zoneKey, config, locked, endDrag]);

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
    drag?.id === node.props.id ? 'is-dragging' : '',
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
          draggable={!locked}
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
          onDoubleClick={handleDoubleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {componentConfig.render(componentProps)}
        </div>
        {dragOverPosition === 'bottom' && (
          <div className="tecof-drop-line" />
        )}
      </div>
    </ParentNodeContext.Provider>
  );
};
