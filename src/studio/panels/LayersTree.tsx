import React, { useState } from 'react';
import { useEditorStore } from '../../engine/store';
import { useStudio } from '../context';
import { usePermissions } from '../usePermissions';
import { findNodeById } from '../../engine/zones';
import { isValidDrop } from '../../engine/rules';
import { Trash2, ChevronRight, ChevronDown, Layout } from 'lucide-react';
import { setDragGhost } from '../canvas/dragGhost';
import { readDragData, writeDragData } from '../canvas/dndUtils';
import type { TecofNode } from '../../types';

interface TreeNodeProps {
  node: TecofNode;
  depth: number;
}

const getLayerRowStyle = (depth: number) =>
  ({ '--tecof-layer-indent': `${depth * 12 + 8}px` }) as React.CSSProperties;

const getLayerZoneStyle = (depth: number) =>
  ({ '--tecof-layer-zone-indent': `${(depth + 1) * 12 + 14}px` }) as React.CSSProperties;

const TreeNode = ({ node, depth }: TreeNodeProps) => {
  const { config } = useStudio();
  const documentState = useEditorStore((state) => state.document);
  // `is-selected` reflects membership in the multi-selection set (not just the
  // primary), so cmd/ctrl/shift-selected rows all highlight.
  const isSelected = useEditorStore((state) =>
    state.selection.selectedIds.includes(node.props.id)
  );

  const selectNode = useEditorStore((state) => state.selectNode);
  const toggleSelect = useEditorStore((state) => state.toggleSelect);
  const hoverNode = useEditorStore((state) => state.hoverNode);
  const removeNode = useEditorStore((state) => state.removeNode);
  const beginDrag = useEditorStore((state) => state.beginDrag);
  const endDrag = useEditorStore((state) => state.endDrag);

  const [expanded, setExpanded] = useState(true);
  const [dragOverPos, setDragOverPos] = useState<'top' | 'bottom' | null>(null);

  const componentConfig = config.components[node.type];
  const label = componentConfig?.label || node.type;
  const perms = usePermissions(node.props.id);

  // Find zones belonging to this node
  const childZoneKeys = Object.keys(documentState.zones).filter((key) =>
    key.startsWith(`${node.props.id}:`)
  );

  const hasChildren = childZoneKeys.some(
    (key) => (documentState.zones[key] || []).length > 0
  );

  // Resolves the dragged type + the target zone for a drop relative to this row,
  // then defers to the shared engine drop rules. Permissive when the dragged
  // type can't be determined (e.g. payload not yet readable). Mirrors the rule
  // enforcement used by the canvas drop targets so layers stay consistent.
  const isDropAllowed = (e: React.DragEvent): boolean => {
    const { nodeId: draggedId, type } = readDragData(e);
    if (draggedId && draggedId === node.props.id) return false;

    const doc = useEditorStore.getState().document;
    const targetZoneKey = findNodeById(doc, node.props.id)?.path.zoneKey;

    let draggedType: string | null = type || null;
    if (!draggedType && draggedId) {
      draggedType = findNodeById(doc, draggedId)?.node.type ?? null;
    }
    if (!draggedType) return true;

    return isValidDrop(config, draggedType, targetZoneKey, doc);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDropAllowed(e)) {
      e.dataTransfer.dropEffect = 'none';
      setDragOverPos(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    setDragOverPos(relativeY < rect.height / 2 ? 'top' : 'bottom');
  };

  const handleDragLeave = () => {
    setDragOverPos(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const position = dragOverPos;
    setDragOverPos(null);

    const { nodeId: draggedId } = readDragData(e);
    if (!draggedId || draggedId === node.props.id) return;
    if (!isDropAllowed(e)) return;

    // Find index and list of target node
    const doc = useEditorStore.getState().document;
    const res = findNodeById(doc, node.props.id);
    if (!res) return;

    const { path } = res;
    const targetZoneKey = path.zoneKey;
    const targetIndex = position === 'top' ? path.index : path.index + 1;

    useEditorStore.getState().moveNode(draggedId, targetZoneKey, targetIndex);
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Cmd/Ctrl-click (or Shift-click) toggles multi-selection; plain click selects.
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      toggleSelect(node.props.id);
    } else {
      selectNode(node.props.id);
    }
  };

  const handleRowKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectNode(node.props.id);
      return;
    }

    if ((e.key === 'Delete' || e.key === 'Backspace') && isSelected && perms.delete !== false) {
      e.preventDefault();
      removeNode(node.props.id);
    }
  };

  return (
    <div className="tecof-layer-node">
      {dragOverPos === 'top' && <div className="tecof-drop-line sm" />}
      <div
        draggable={perms.drag !== false}
        onDragStart={(e) => {
          writeDragData(e, { nodeId: node.props.id });
          e.dataTransfer.effectAllowed = 'move';
          setDragGhost(e, label);
          beginDrag({ id: node.props.id });
        }}
        onDragEnd={endDrag}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseEnter={() => hoverNode(node.props.id)}
        onMouseLeave={() => hoverNode(null)}
        onClick={handleRowClick}
        onKeyDown={handleRowKeyDown}
        className={`tecof-layer-row${isSelected ? ' is-selected' : ''}`}
        role="treeitem"
        tabIndex={0}
        aria-selected={isSelected}
        aria-expanded={hasChildren ? expanded : undefined}
        style={getLayerRowStyle(depth)}
      >
        <div className="tecof-layer-row-main">
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="tecof-layer-caret"
              aria-label={expanded ? `${label} katmanını daralt` : `${label} katmanını genişlet`}
              aria-expanded={expanded}
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="tecof-layer-caret-spacer" />
          )}
          <Layout size={14} className="tecof-layer-icon" />
          <span className="tecof-layer-label">{label}</span>
        </div>

        {perms.delete !== false && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeNode(node.props.id);
            }}
            className="tecof-layer-delete"
            title="Sil"
            aria-label={`${label} katmanını sil`}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {dragOverPos === 'bottom' && <div className="tecof-drop-line sm" />}

      {/* Render child zones recursively */}
      {expanded && childZoneKeys.map((zoneKey) => {
        const zoneItems = documentState.zones[zoneKey] || [];
        const zoneName = zoneKey.split(':').pop() || '';
        if (zoneItems.length === 0) return null;

        return (
          <div key={zoneKey} className="tecof-layer-node">
            <div className="tecof-layer-zone-label" style={getLayerZoneStyle(depth)}>
              {zoneName}
            </div>
            {zoneItems.map((childNode) => (
              <TreeNode key={childNode.props.id} node={childNode} depth={depth + 1} />
            ))}
          </div>
        );
      })}
    </div>
  );
};

export const LayersTree = () => {
  const documentState = useEditorStore((state) => state.document);

  return (
    <div className="tecof-layers" role="tree" aria-label="Sayfa katmanları">
      {documentState.content.length === 0 ? (
        <div className="tecof-layers-empty">Sürüklenmiş katman yok</div>
      ) : (
        documentState.content.map((node) => (
          <TreeNode key={node.props.id} node={node} depth={0} />
        ))
      )}
    </div>
  );
};
