import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ClipboardPaste,
  Copy,
  CopyPlus,
  Scissors,
  Trash2,
} from 'lucide-react';
import { useEditorStore } from '../../engine/store';
import { useContextMenuStore } from '../contextMenuStore';
import { findNodeById, getParentId } from '../../engine/zones';

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  /** Render a separator above this item. */
  separated?: boolean;
}

/**
 * Single right-click context menu for canvas nodes. Rendered in HOST DOM (a
 * fixed-position element) from `TecofStudio`; its open state + anchor position
 * live in `useContextMenuStore`. Closes on outside click, Esc, or scroll.
 */
export const ContextMenu = () => {
  const open = useContextMenuStore((s) => s.open);
  const nodeId = useContextMenuStore((s) => s.nodeId);
  const x = useContextMenuStore((s) => s.x);
  const y = useContextMenuStore((s) => s.y);
  const closeMenu = useContextMenuStore((s) => s.closeMenu);

  const documentState = useEditorStore((s) => s.document);
  const clipboard = useEditorStore((s) => s.clipboard);

  const menuRef = useRef<HTMLDivElement | null>(null);
  // Edge-flip flags so the menu never overflows the viewport.
  const [flip, setFlip] = useState<{ right: boolean; bottom: boolean }>({
    right: false,
    bottom: false,
  });

  // Close on outside click / Esc / scroll (any scroll dismisses, like native menus).
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeMenu();
      }
    };
    const onScroll = () => closeMenu();

    // `capture` so we beat node handlers; `mousedown` so we close before a click selects.
    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);

    return () => {
      document.removeEventListener('mousedown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, closeMenu]);

  // After open/position change, measure and flip if the menu would overflow.
  useLayoutEffect(() => {
    if (!open || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    setFlip({
      right: x + rect.width > window.innerWidth,
      bottom: y + rect.height > window.innerHeight,
    });
  }, [open, x, y, nodeId]);

  const nodeDetails = useMemo(
    () => (nodeId ? findNodeById(documentState, nodeId) : null),
    [documentState, nodeId]
  );
  const parentId = useMemo(
    () => (nodeId ? getParentId(documentState, nodeId) : null),
    [documentState, nodeId]
  );

  const canMoveUp = nodeDetails ? nodeDetails.path.index > 0 : false;
  const canMoveDown = nodeDetails
    ? (() => {
        const { zoneKey, index } = nodeDetails.path;
        const items = zoneKey ? documentState.zones[zoneKey] || [] : documentState.content;
        return index < items.length - 1;
      })()
    : false;

  if (!open || !nodeId || !nodeDetails) return null;

  const run = (fn: () => void) => {
    fn();
    closeMenu();
  };

  const handleMove = (direction: 'up' | 'down') => {
    if (!nodeDetails) return;
    const { zoneKey, index } = nodeDetails.path;
    useEditorStore.getState().moveNode(nodeId, zoneKey, direction === 'up' ? index - 1 : index + 1);
  };

  const items: MenuItem[] = [
    {
      key: 'copy',
      label: 'Kopyala',
      icon: <Copy size={14} />,
      onClick: () => run(() => useEditorStore.getState().copyNode(nodeId)),
    },
    {
      key: 'cut',
      label: 'Kes',
      icon: <Scissors size={14} />,
      onClick: () => run(() => useEditorStore.getState().cutNode(nodeId)),
    },
    {
      key: 'paste',
      label: 'Yapıştır',
      icon: <ClipboardPaste size={14} />,
      disabled: !clipboard,
      onClick: () => run(() => useEditorStore.getState().pasteNode(nodeId)),
    },
    {
      key: 'duplicate',
      label: 'Çoğalt',
      icon: <CopyPlus size={14} />,
      separated: true,
      onClick: () => run(() => useEditorStore.getState().duplicateNode(nodeId)),
    },
    {
      key: 'selectParent',
      label: 'Üst öğeyi seç',
      icon: <ChevronUp size={14} />,
      disabled: !parentId,
      onClick: () => run(() => useEditorStore.getState().selectNode(parentId)),
    },
    {
      key: 'moveUp',
      label: 'Yukarı taşı',
      icon: <ArrowUp size={14} />,
      disabled: !canMoveUp,
      separated: true,
      onClick: () => run(() => handleMove('up')),
    },
    {
      key: 'moveDown',
      label: 'Aşağı taşı',
      icon: <ArrowDown size={14} />,
      disabled: !canMoveDown,
      onClick: () => run(() => handleMove('down')),
    },
    {
      key: 'delete',
      label: 'Sil',
      icon: <Trash2 size={14} />,
      danger: true,
      separated: true,
      onClick: () => run(() => useEditorStore.getState().removeNode(nodeId)),
    },
  ];

  const menuClassName = [
    'tecof-context-menu',
    flip.right ? 'is-flip-x' : '',
    flip.bottom ? 'is-flip-y' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={menuRef}
      className={menuClassName}
      style={
        {
          '--tecof-menu-x': `${x}px`,
          '--tecof-menu-y': `${y}px`,
        } as React.CSSProperties
      }
      role="menu"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="tecof-context-menu-head">{nodeDetails.node.type}</div>
      {items.map((item) => (
        <React.Fragment key={item.key}>
          {item.separated && <div className="tecof-context-menu-sep" />}
          <button
            type="button"
            role="menuitem"
            className={`tecof-context-menu-item${item.danger ? ' is-danger' : ''}`}
            disabled={item.disabled}
            onClick={item.onClick}
          >
            <span className="tecof-context-menu-icon">{item.icon}</span>
            <span className="tecof-context-menu-label">{item.label}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default ContextMenu;
