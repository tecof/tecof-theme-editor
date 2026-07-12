import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../engine/store';
import { useStudio } from '../context';
import { usePermissions } from '../usePermissions';
import { findNodeById, getParentId } from '../../engine/zones';
import { isValidDrop } from '../../engine/rules';
import { Trash2, ChevronRight, ChevronDown, Layout, Box, Copy, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { setDragGhost } from '../canvas/dragGhost';
import { readDragData, writeDragData } from '../canvas/dndUtils';
import type { TecofDocument, TecofNode } from '../../types';

interface TreeNodeProps {
  node: TecofNode;
  depth: number;
}

/** Drop position relative to a row: reorder above/below, or into a child zone. */
type DropPos = 'top' | 'bottom' | 'inside';

const getLayerRowStyle = (depth: number) =>
  ({ '--tecof-layer-indent': `${depth * 12 + 8}px` }) as React.CSSProperties;

const getLayerZoneStyle = (depth: number) =>
  ({ '--tecof-layer-zone-indent': `${(depth + 1) * 12 + 14}px` }) as React.CSSProperties;

/** True when `id` lives anywhere inside `ancestorId`'s subtree. */
const isInsideSubtree = (doc: TecofDocument, ancestorId: string, id: string): boolean => {
  let current: string | null = getParentId(doc, id);
  while (current) {
    if (current === ancestorId) return true;
    current = getParentId(doc, current);
  }
  return false;
};

/** Move keyboard focus to the previous/next visible row in the whole tree. */
const focusSiblingRow = (current: HTMLElement, delta: number) => {
  const root = current.closest('.tecof-layers');
  if (!root) return;
  const rows = Array.from(root.querySelectorAll<HTMLElement>('.tecof-layer-row'));
  rows[rows.indexOf(current) + delta]?.focus();
};

const TreeNode = ({ node, depth }: TreeNodeProps) => {
  const { config } = useStudio();
  const documentState = useEditorStore((state) => state.document);
  // `is-selected` reflects membership in the multi-selection set (not just the
  // primary), so cmd/ctrl/shift-selected rows all highlight.
  const isSelected = useEditorStore((state) =>
    state.selection.selectedIds.includes(node.props.id)
  );
  const isPrimary = useEditorStore((state) => state.selection.selectedId === node.props.id);

  const selectNode = useEditorStore((state) => state.selectNode);
  const toggleSelect = useEditorStore((state) => state.toggleSelect);
  const hoverNode = useEditorStore((state) => state.hoverNode);
  const removeNode = useEditorStore((state) => state.removeNode);
  const removeNodes = useEditorStore((state) => state.removeNodes);
  const duplicateNode = useEditorStore((state) => state.duplicateNode);
  const updateProps = useEditorStore((state) => state.updateProps);
  const beginDrag = useEditorStore((state) => state.beginDrag);
  const endDrag = useEditorStore((state) => state.endDrag);

  const [expanded, setExpanded] = useState(true);
  const [dragOverPos, setDragOverPos] = useState<DropPos | null>(null);
  const [renaming, setRenaming] = useState(false);
  const renameCancelledRef = useRef(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const componentConfig = config.components[node.type];
  const label = componentConfig?.label || node.type;
  // Kullanıcının verdiği özel katman adı (dokümanla birlikte kalıcı).
  const customName = typeof node.props._layerName === 'string' ? node.props._layerName : '';
  const displayLabel = customName || label;
  const perms = usePermissions(node.props.id);
  // Per-instance layer state (persisted on the node): hidden = omitted from the
  // published page + faded in the canvas; locked = all edits gated (see
  // getNodePermissions). Toggles below are never permission-gated, so a locked
  // node can always be unlocked.
  const isHidden = node.props._hidden === true;
  const isLocked = node.props._locked === true;

  // Canvas'ta yapılan seçimi ağaçta görünür kıl.
  useEffect(() => {
    if (isPrimary) rowRef.current?.scrollIntoView({ block: 'nearest' });
  }, [isPrimary]);

  // Find zones belonging to this node
  const childZoneKeys = Object.keys(documentState.zones).filter((key) =>
    key.startsWith(`${node.props.id}:`)
  );

  const hasChildren = childZoneKeys.some(
    (key) => (documentState.zones[key] || []).length > 0
  );
  // İçine bırakma hedefi: ilk alt zone (yalnızca zone'u olan node'lar).
  const insideZoneKey = childZoneKeys[0];

  /**
   * Dragged payload: `dataTransfer` is only readable on drop (browsers hide it
   * during dragover), so prefer the store's live drag state and fall back to
   * the event payload for the final drop.
   */
  const getDragInfo = (e: React.DragEvent): { draggedId: string | null; draggedType: string | null } => {
    const stored = useEditorStore.getState().drag as { id?: string; type?: string } | null;
    const fromEvent = readDragData(e);
    return {
      draggedId: fromEvent.nodeId || stored?.id || null,
      draggedType: fromEvent.type || stored?.type || null,
    };
  };

  // Resolves the dragged type + the target zone for a drop relative to this row,
  // then defers to the shared engine drop rules. Permissive when the dragged
  // type can't be determined. Mirrors the rule enforcement used by the canvas
  // drop targets so layers stay consistent.
  const isDropAllowed = (e: React.DragEvent, pos: DropPos): boolean => {
    const { draggedId, draggedType: typeFromPayload } = getDragInfo(e);
    if (draggedId && draggedId === node.props.id) return false;

    const doc = useEditorStore.getState().document;
    // Bir node kendi alt ağacının içine/etrafına taşınamaz.
    if (draggedId && isInsideSubtree(doc, draggedId, node.props.id)) return false;

    const targetZoneKey =
      pos === 'inside' ? insideZoneKey : findNodeById(doc, node.props.id)?.path.zoneKey;

    let draggedType: string | null = typeFromPayload;
    if (!draggedType && draggedId) {
      draggedType = findNodeById(doc, draggedId)?.node.type ?? null;
    }
    if (!draggedType) return true;

    return isValidDrop(config, draggedType, targetZoneKey, doc);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    // Orta üçte-birlik bant, zone'u olan node'larda "içine bırak" hedefi olur.
    let pos: DropPos;
    if (insideZoneKey && relativeY > rect.height / 3 && relativeY < (rect.height * 2) / 3) {
      pos = 'inside';
    } else {
      pos = relativeY < rect.height / 2 ? 'top' : 'bottom';
    }

    if (!isDropAllowed(e, pos)) {
      e.dataTransfer.dropEffect = 'none';
      setDragOverPos(null);
      return;
    }
    setDragOverPos(pos);
  };

  const handleDragLeave = () => {
    setDragOverPos(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const position = dragOverPos;
    setDragOverPos(null);
    if (!position) return;

    const { draggedId } = getDragInfo(e);
    if (!draggedId || draggedId === node.props.id) return;
    if (!isDropAllowed(e, position)) return;

    const doc = useEditorStore.getState().document;

    if (position === 'inside' && insideZoneKey) {
      const items = doc.zones[insideZoneKey] || [];
      useEditorStore.getState().moveNode(draggedId, insideZoneKey, items.length);
      setExpanded(true);
      return;
    }

    // Find index and list of target node
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

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      focusSiblingRow(e.currentTarget, e.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (e.key === 'ArrowRight' && hasChildren && !expanded) {
      e.preventDefault();
      setExpanded(true);
      return;
    }

    if (e.key === 'ArrowLeft' && hasChildren && expanded) {
      e.preventDefault();
      setExpanded(false);
      return;
    }

    if ((e.key === 'Delete' || e.key === 'Backspace') && isSelected) {
      const ids = useEditorStore.getState().selection.selectedIds;
      if (ids.length > 1) {
        // Çoklu seçimde tüm seçimi sil (engine izinsiz node'ları zaten atlar).
        e.preventDefault();
        removeNodes(ids);
      } else if (perms.delete !== false) {
        e.preventDefault();
        removeNode(node.props.id);
      }
    }
  };

  const commitRename = (raw: string) => {
    setRenaming(false);
    if (renameCancelledRef.current) {
      renameCancelledRef.current = false;
      return;
    }
    const next = raw.trim();
    // Boş veya varsayılan etiketle aynıysa özel adı temizle.
    updateProps(node.props.id, { _layerName: next && next !== label ? next : '' });
  };

  const RowIcon = hasChildren ? Layout : Box;

  return (
    <div className="tecof-layer-node">
      {dragOverPos === 'top' && <div className="tecof-drop-line sm" />}
      <div
        ref={rowRef}
        draggable={perms.drag !== false && !renaming}
        onDragStart={(e) => {
          writeDragData(e, { nodeId: node.props.id });
          e.dataTransfer.effectAllowed = 'move';
          setDragGhost(e, displayLabel);
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
        className={`tecof-layer-row${isSelected ? ' is-selected' : ''}${
          dragOverPos === 'inside' ? ' is-drop-inside' : ''
        }${isHidden ? ' is-hidden' : ''}${isLocked ? ' is-locked' : ''}`}
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
              aria-label={expanded ? `${displayLabel} katmanını daralt` : `${displayLabel} katmanını genişlet`}
              aria-expanded={expanded}
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="tecof-layer-caret-spacer" />
          )}
          <RowIcon size={14} className="tecof-layer-icon" />
          {renaming ? (
            <input
              className="tecof-layer-rename-input"
              defaultValue={displayLabel}
              autoFocus
              onFocus={(e) => e.currentTarget.select()}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') {
                  renameCancelledRef.current = true;
                  e.currentTarget.blur();
                }
              }}
              onBlur={(e) => commitRename(e.currentTarget.value)}
            />
          ) : (
            <span
              className="tecof-layer-label"
              title={
                customName
                  ? `${label} — çift tıklayarak yeniden adlandırın`
                  : 'Çift tıklayarak yeniden adlandırın'
              }
              onDoubleClick={(e) => {
                if (perms.edit === false) return;
                e.stopPropagation();
                setRenaming(true);
              }}
            >
              {displayLabel}
            </span>
          )}
        </div>

        <div className="tecof-layer-row-actions">
          {/* Hide + lock toggles are ALWAYS shown (never permission-gated) so a
              locked/hidden node can always be toggled back. */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              updateProps(node.props.id, { _hidden: !isHidden });
            }}
            className={`tecof-layer-toggle${isHidden ? ' is-active' : ''}`}
            title={isHidden ? 'Göster' : 'Gizle'}
            aria-label={`${displayLabel} — ${isHidden ? 'göster' : 'gizle'}`}
            aria-pressed={isHidden}
          >
            {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              updateProps(node.props.id, { _locked: !isLocked });
            }}
            className={`tecof-layer-toggle${isLocked ? ' is-active' : ''}`}
            title={isLocked ? 'Kilidi aç' : 'Kilitle'}
            aria-label={`${displayLabel} — ${isLocked ? 'kilidi aç' : 'kilitle'}`}
            aria-pressed={isLocked}
          >
            {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
          </button>
          {perms.duplicate !== false && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                duplicateNode(node.props.id);
              }}
              className="tecof-layer-action"
              title="Çoğalt"
              aria-label={`${displayLabel} katmanını çoğalt`}
            >
              <Copy size={12} />
            </button>
          )}
          {perms.delete !== false && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeNode(node.props.id);
              }}
              className="tecof-layer-delete"
              title="Sil"
              aria-label={`${displayLabel} katmanını sil`}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
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
        <div className="tecof-layers-empty">
          {"Sayfada henüz bileşen yok. Canvas'a bölüm ekleyerek başlayın."}
        </div>
      ) : (
        documentState.content.map((node) => (
          <TreeNode key={node.props.id} node={node} depth={0} />
        ))
      )}
    </div>
  );
};
