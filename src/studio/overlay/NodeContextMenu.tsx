import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Bookmark,
  ChevronUp,
  ClipboardPaste,
  Copy,
  CopyPlus,
  Paintbrush,
  Trash2,
} from 'lucide-react';
import { useEditorStore, hasClipboardContent } from '../../engine/store';
import { useUiStore, type ContextMenuState } from '../uiStore';
import { findNodeById, getParentId } from '../../engine/zones';
import { serializeNodeSubtree } from '../../engine/operations';
import { copyNodeStyles, pasteNodeStyles, isEmptyStyles } from '../style/styleClipboard';
import { STYLES_PROP, type NodeStyles } from '../style/types';
import { useStudio } from '../context';
import { usePermissions } from '../usePermissions';

/** Distance kept between the menu and the window edge when clamping. */
const EDGE_MARGIN = 8;

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  danger?: boolean;
}

/** One context-menu row: a real button (keyboard reachable / screen-readable). */
const MenuItem = ({ icon, label, onSelect, disabled, danger }: MenuItemProps) => (
  <button
    type="button"
    role="menuitem"
    className={`tecof-ctx-item${danger ? ' is-danger' : ''}`}
    disabled={disabled}
    onClick={onSelect}
  >
    <span className="tecof-ctx-item-icon" aria-hidden="true">
      {icon}
    </span>
    <span className="tecof-ctx-item-label">{label}</span>
  </button>
);

type SaveState = 'idle' | 'saving' | 'success' | 'error';

interface MenuProps {
  menu: ContextMenuState;
  onClose: () => void;
}

/**
 * The actual fixed-position menu. Mounted fresh per open (keyed by the outer
 * component), so all transient state — save panel, feedback — resets naturally.
 */
const Menu = ({ menu, onClose }: MenuProps) => {
  const { config, apiClient } = useStudio();
  const documentState = useEditorStore((s) => s.document);
  const selectNode = useEditorStore((s) => s.selectNode);
  const removeNode = useEditorStore((s) => s.removeNode);
  const duplicateNode = useEditorStore((s) => s.duplicateNode);
  const copyNode = useEditorStore((s) => s.copyNode);
  const pasteClipboard = useEditorStore((s) => s.pasteClipboard);
  const updateProps = useEditorStore((s) => s.updateProps);
  const styleClipboard = useUiStore((s) => s.styleClipboard);
  // Paste availability: the engine clipboard OR its cross-page localStorage
  // mirror — sections copied on another page/tab paste here too.
  const clipboardInMemory = useEditorStore((s) => s.clipboard != null);
  const canPaste = clipboardInMemory || hasClipboardContent();
  const perms = usePermissions(menu.nodeId);

  const nodeDetails = findNodeById(documentState, menu.nodeId);
  const parentId = getParentId(documentState, menu.nodeId);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x: menu.x, y: menu.y });

  const [savePanelOpen, setSavePanelOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  // Mirror for the window-level Escape handler (registered once).
  const savePanelOpenRef = useRef(savePanelOpen);
  savePanelOpenRef.current = savePanelOpen;

  // Clamp to the window so the menu never overflows past the screen edges;
  // re-measured when the save panel swaps in (the menu grows/shrinks).
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(
      EDGE_MARGIN,
      Math.min(menu.x, window.innerWidth - rect.width - EDGE_MARGIN)
    );
    const y = Math.max(
      EDGE_MARGIN,
      Math.min(menu.y, window.innerHeight - rect.height - EDGE_MARGIN)
    );
    setPosition({ x, y });
  }, [menu.x, menu.y, savePanelOpen]);

  // Focus the first enabled item so ArrowUp/Down/Escape work immediately.
  useEffect(() => {
    const first = menuRef.current?.querySelector<HTMLButtonElement>(
      '.tecof-ctx-item:not(:disabled)'
    );
    first?.focus();
  }, []);

  // Dismissal: Escape (capture — consumed so the studio's global handler
  // doesn't also deselect the node), outside pointerdown, scroll and resize.
  // Pointer/scroll events inside the canvas iframe don't reach the parent
  // window, so the same listeners are attached to the iframe document too.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      // Escape steps back out of the save panel first, then closes the menu.
      if (savePanelOpenRef.current) {
        setSavePanelOpen(false);
        setSaveState('idle');
      } else {
        onClose();
      }
    };
    const onPointerDown = (e: Event) => {
      const target = e.target as Node | null;
      if (target && menuRef.current?.contains(target)) return;
      onClose();
    };
    const onScroll = () => onClose();
    const onResize = () => onClose();

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);

    const iframeDoc = document.querySelector<HTMLIFrameElement>(
      '.tecof-canvas-viewport iframe'
    )?.contentDocument;
    iframeDoc?.addEventListener('pointerdown', onPointerDown, true);
    iframeDoc?.addEventListener('scroll', onScroll, true);

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      iframeDoc?.removeEventListener('pointerdown', onPointerDown, true);
      iframeDoc?.removeEventListener('scroll', onScroll, true);
    };
  }, [onClose]);

  // The target node can vanish while the menu is open (undo, host update) —
  // close instead of showing actions for a ghost node.
  useEffect(() => {
    if (!nodeDetails) onClose();
  }, [nodeDetails, onClose]);

  // ArrowUp/ArrowDown walk the enabled items (roving focus).
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '.tecof-ctx-item:not(:disabled)'
      ) ?? []
    );
    if (items.length === 0) return;
    e.preventDefault();
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const delta = e.key === 'ArrowDown' ? 1 : -1;
    const next = (current + delta + items.length) % items.length;
    items[next]?.focus();
  }, []);

  if (!nodeDetails) return null;
  const node = nodeDetails.node;
  const componentLabel = config.components[node.type]?.label || node.type;
  const hasOwnStyles = !isEmptyStyles(node.props[STYLES_PROP] as NodeStyles | undefined);

  const handleSelectParent = () => {
    if (parentId) selectNode(parentId);
    onClose();
  };

  const handleDuplicate = () => {
    duplicateNode(menu.nodeId);
    onClose();
  };

  const handleCopy = () => {
    // The ENGINE clipboard (same one behind ⌘C/⌘V): self-contained payload with
    // the node's descendant zones, mirrored to localStorage — so a section
    // copied here can be pasted on another page or tab.
    copyNode(menu.nodeId);
    onClose();
  };

  const handlePaste = () => {
    if (!canPaste) return;
    // Insert right below the right-clicked node, in its own list. The engine
    // clones with fresh ids and selects the pasted root itself.
    pasteClipboard(nodeDetails.path.zoneKey, nodeDetails.path.index + 1);
    onClose();
  };

  const handleCopyStyles = () => {
    copyNodeStyles(menu.nodeId);
    onClose();
  };

  const handlePasteStyles = () => {
    pasteNodeStyles([menu.nodeId]);
    onClose();
  };

  const handleDelete = () => {
    removeNode(menu.nodeId);
    onClose();
  };

  const handleSaveShared = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = saveName.trim();
    if (!name || !apiClient || saveState === 'saving') return;
    setSaveState('saving');
    try {
      const snapshot = serializeNodeSubtree(documentState, menu.nodeId);
      if (!snapshot) throw new Error('Node not found');
      // Same zone-merged snapshot as the clipboard, minus the node id — the
      // "Bölüm Ekle" saved-components flow re-creates it via createNode +
      // insertNode, which unpacks the inlined slots with fresh ids.
      const props: Record<string, unknown> = { ...snapshot.props };
      delete props.id;
      const res = await apiClient.createSharedComponent(name, node.type, props);
      if (res?.success) {
        // Kaynak node'u da master'a BAĞLA: sharedComponentId yazılır, böylece
        // bu sayfa kaydedildiğinde backend onu referansa çevirir ve bu node'da
        // yapılan düzenlemeler tüm kullanımlara yayılır.
        const masterId = (res as any)?.data?._id;
        if (masterId) {
          updateProps(menu.nodeId, { sharedComponentId: String(masterId) });
        }
        setSaveState('success');
        window.setTimeout(onClose, 1200);
      } else {
        setSaveState('error');
      }
    } catch {
      setSaveState('error');
    }
  };

  return (
    <div
      ref={menuRef}
      className="tecof-ctx-menu"
      style={{ left: position.x, top: position.y }}
      role="menu"
      aria-label={`${componentLabel} bağlam menüsü`}
      onKeyDown={handleMenuKeyDown}
      // Right-clicking the menu itself must not bubble a native menu.
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="tecof-ctx-header">{componentLabel}</div>

      {savePanelOpen ? (
        <form className="tecof-ctx-save" onSubmit={handleSaveShared}>
          <label className="tecof-ctx-save-label" htmlFor="tecof-ctx-save-name">
            Ortak bileşen adı
          </label>
          <input
            id="tecof-ctx-save-name"
            className="tecof-ctx-save-input"
            type="text"
            value={saveName}
            placeholder="Örn. Kampanya Bandı"
            autoFocus
            disabled={saveState === 'saving' || saveState === 'success'}
            onChange={(e) => {
              setSaveName(e.target.value);
              if (saveState === 'error') setSaveState('idle');
            }}
          />
          {saveState === 'error' && (
            <div className="tecof-ctx-feedback is-error" role="alert">
              Kaydedilemedi, tekrar deneyin.
            </div>
          )}
          {saveState === 'success' && (
            <div className="tecof-ctx-feedback is-success" role="status">
              Ortak bileşen kaydedildi.
            </div>
          )}
          <div className="tecof-ctx-save-actions">
            <button
              type="button"
              className="tecof-ctx-btn"
              disabled={saveState === 'saving' || saveState === 'success'}
              onClick={() => {
                setSavePanelOpen(false);
                setSaveState('idle');
              }}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="tecof-ctx-btn is-primary"
              disabled={!saveName.trim() || saveState === 'saving' || saveState === 'success'}
            >
              {saveState === 'saving' ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </form>
      ) : (
        <>
          {parentId && (
            <MenuItem
              icon={<ChevronUp size={14} />}
              label="Üst Öğeyi Seç"
              onSelect={handleSelectParent}
            />
          )}
          <MenuItem
            icon={<CopyPlus size={14} />}
            label="Çoğalt"
            disabled={perms.duplicate === false}
            onSelect={handleDuplicate}
          />
          <MenuItem
            icon={<Copy size={14} />}
            label="Kopyala"
            disabled={perms.duplicate === false}
            onSelect={handleCopy}
          />
          <MenuItem
            icon={<ClipboardPaste size={14} />}
            label="Yapıştır"
            disabled={!canPaste}
            onSelect={handlePaste}
          />
          <MenuItem
            icon={<Paintbrush size={14} />}
            label="Stili Kopyala"
            disabled={!hasOwnStyles}
            onSelect={handleCopyStyles}
          />
          <MenuItem
            icon={<Paintbrush size={14} />}
            label="Stili Yapıştır"
            disabled={!styleClipboard || perms.edit === false}
            onSelect={handlePasteStyles}
          />
          <div className="tecof-ctx-sep" role="separator" />
          {node.props.sharedComponentId ? (
            // Ortak bağını kopar: sharedComponentId düşer → node bağımsız kopya
            // olur, master ve diğer sayfalar etkilenmez.
            <MenuItem
              icon={<Bookmark size={14} />}
              label="Ortak Bağını Kopar (Kopyaya Çevir)"
              onSelect={() => {
                updateProps(menu.nodeId, { sharedComponentId: undefined });
                onClose();
              }}
            />
          ) : (
            <MenuItem
              icon={<Bookmark size={14} />}
              label="Ortak Bileşen Olarak Kaydet"
              disabled={!apiClient}
              onSelect={() => setSavePanelOpen(true)}
            />
          )}
          <div className="tecof-ctx-sep" role="separator" />
          <MenuItem
            icon={<Trash2 size={14} />}
            label="Sil"
            danger
            disabled={perms.delete === false}
            onSelect={handleDelete}
          />
        </>
      )}
    </div>
  );
};

/**
 * Canvas right-click context menu, rendered in the PARENT document (the
 * `contextMenu` coordinates are already iframe-translated by NodeRenderer).
 * Keying the inner menu on the open descriptor remounts it per open, so
 * position clamping and the save panel state always start clean.
 */
export const NodeContextMenu = () => {
  const contextMenu = useUiStore((s) => s.contextMenu);
  const setContextMenu = useUiStore((s) => s.setContextMenu);
  const close = useCallback(() => setContextMenu(null), [setContextMenu]);

  if (!contextMenu) return null;
  return (
    <Menu
      key={`${contextMenu.nodeId}:${contextMenu.x}:${contextMenu.y}`}
      menu={contextMenu}
      onClose={close}
    />
  );
};

export default NodeContextMenu;
