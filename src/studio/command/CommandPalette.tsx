import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Undo2, Redo2, Copy, Scissors, ClipboardPaste, CopyPlus, Trash2,
  Eye, Pencil, PanelLeft, PanelRight, Save, Plus, Search, Paintbrush,
} from 'lucide-react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { useStudio } from '../context';
import { findNodeById } from '../../engine/zones';
import { getNodePermissions, DEFAULT_PERMISSIONS } from '../../engine/permissions';
import { createNode } from '../canvas/dndUtils';
import { copyNodeStyles, pasteNodeStyles } from '../style/styleClipboard';

interface Command {
  id: string;
  label: string;
  group: string;
  icon: React.ReactNode;
  /** Shortcut hint shown on the right (display only). */
  hint?: string;
  /** Extra search terms. */
  keywords?: string;
  disabled?: boolean;
  run: () => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iP(hone|ad)/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl';

export interface CommandPaletteProps {
  /** Save action wired by the studio shell (Cmd+S command). */
  onSave?: () => void;
}

export const CommandPalette = ({ onSave }: CommandPaletteProps) => {
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const { config } = useStudio();

  // Reactive bits used to enable/disable commands.
  const selectedId = useEditorStore((s) => s.selection.selectedId);
  const canUndo = useEditorStore((s) => s.history.past.length > 0);
  const canRedo = useEditorStore((s) => s.history.future.length > 0);
  const hasStyleBuffer = useUiStore((s) => !!s.styleClipboard);

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset transient state whenever the palette (re)opens.
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      // Focus after the portal paints.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const insertComponent = (type: string) => {
    const store = useEditorStore.getState();
    const sel = store.selection.selectedId;
    const res = sel ? findNodeById(store.document, sel) : null;
    const node = createNode(config, type);
    store.insertNode(node, res?.path.zoneKey, res ? res.path.index + 1 : undefined);
    store.selectNode(node.props.id);
  };

  const commands = useMemo<Command[]>(() => {
    const s = useEditorStore.getState;
    const ui = useUiStore.getState;
    const hasSel = !!selectedId;

    // Permissions of the primary selection gate the destructive commands. (Bulk
    // ops are additionally filtered by the engine.)
    const selNode = selectedId
      ? findNodeById(s().document, selectedId)?.node ?? null
      : null;
    const perms = selNode ? getNodePermissions(config, selNode) : DEFAULT_PERMISSIONS;

    const actions: Command[] = [
      { id: 'undo', label: 'Geri Al', group: 'Eylemler', icon: <Undo2 size={15} />, hint: `${MOD}Z`, disabled: !canUndo, run: () => s().undo() },
      { id: 'redo', label: 'İleri Al', group: 'Eylemler', icon: <Redo2 size={15} />, hint: `${MOD}⇧Z`, disabled: !canRedo, run: () => s().redo() },
      { id: 'duplicate', label: 'Çoğalt', group: 'Eylemler', icon: <CopyPlus size={15} />, hint: `${MOD}D`, keywords: 'duplicate kopya', disabled: !hasSel || perms.duplicate === false, run: () => s().duplicateNodes() },
      { id: 'copy', label: 'Kopyala', group: 'Eylemler', icon: <Copy size={15} />, hint: `${MOD}C`, disabled: !hasSel, run: () => s().copyNode() },
      { id: 'cut', label: 'Kes', group: 'Eylemler', icon: <Scissors size={15} />, hint: `${MOD}X`, disabled: !hasSel || perms.delete === false, run: () => s().cutNode() },
      { id: 'paste', label: 'Yapıştır', group: 'Eylemler', icon: <ClipboardPaste size={15} />, hint: `${MOD}V`, run: () => s().pasteClipboard() },
      { id: 'delete', label: 'Sil', group: 'Eylemler', icon: <Trash2 size={15} />, hint: '⌫', keywords: 'delete kaldır', disabled: !hasSel || perms.delete === false, run: () => s().removeNodes() },
      { id: 'copy-styles', label: 'Stili Kopyala', group: 'Stil', icon: <Paintbrush size={15} />, keywords: 'style stil kopyala copy', disabled: !hasSel, run: () => copyNodeStyles() },
      { id: 'paste-styles', label: 'Stili Yapıştır', group: 'Stil', icon: <Paintbrush size={15} />, keywords: 'style stil yapıştır paste', disabled: !hasSel || !hasStyleBuffer, run: () => pasteNodeStyles() },
      { id: 'mode', label: ui().mode === 'preview' ? 'Düzenleme moduna geç' : 'Önizleme moduna geç', group: 'Görünüm', icon: ui().mode === 'preview' ? <Pencil size={15} /> : <Eye size={15} />, keywords: 'preview önizleme edit düzenle', run: () => ui().toggleMode() },
      { id: 'left', label: ui().leftPanelOpen ? 'Sol paneli gizle' : 'Sol paneli göster', group: 'Görünüm', icon: <PanelLeft size={15} />, keywords: 'panel katman', run: () => ui().toggleLeftPanel() },
      { id: 'right', label: ui().rightPanelOpen ? 'Sağ paneli gizle' : 'Sağ paneli göster', group: 'Görünüm', icon: <PanelRight size={15} />, keywords: 'panel inspector ayar', run: () => ui().toggleRightPanel() },
    ];

    if (onSave) {
      actions.push({ id: 'save', label: 'Kaydet', group: 'Eylemler', icon: <Save size={15} />, hint: `${MOD}S`, keywords: 'save taslak', run: onSave });
    }

    const inserts: Command[] = Object.entries(config.components || {}).map(([type, comp]: [string, any]) => ({
      id: `insert:${type}`,
      label: comp?.label || type,
      group: 'Bileşen Ekle',
      icon: <Plus size={15} />,
      keywords: `ekle insert ${type}`,
      run: () => insertComponent(type),
    }));

    return [...actions, ...inserts];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, selectedId, canUndo, canRedo, onSave, hasStyleBuffer]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.group} ${c.keywords || ''}`.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Keep the active index within bounds as the filtered list shrinks/grows.
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  // Scroll the active row into view.
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const runAt = (idx: number) => {
    const cmd = filtered[idx];
    if (!cmd || cmd.disabled) return;
    setOpen(false);
    cmd.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runAt(active);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  return createPortal(
    <div className="tecof-cmdk-overlay" onMouseDown={() => setOpen(false)}>
      <div className="tecof-cmdk-panel" role="dialog" aria-label="Komut paleti" onMouseDown={(e) => e.stopPropagation()}>
        <div className="tecof-cmdk-input-row">
          <Search size={16} className="tecof-cmdk-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="tecof-cmdk-input"
            placeholder="Komut ara veya bileşen ekle…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={onKeyDown}
          />
          <kbd className="tecof-cmdk-esc">esc</kbd>
        </div>

        <div className="tecof-cmdk-list" ref={listRef}>
          {filtered.length === 0 ? (
            <div className="tecof-cmdk-empty">Sonuç yok</div>
          ) : (
            filtered.map((cmd, idx) => {
              const showGroup = idx === 0 || filtered[idx - 1].group !== cmd.group;
              return (
                <div key={cmd.id}>
                  {showGroup && <div className="tecof-cmdk-group">{cmd.group}</div>}
                  <button
                    type="button"
                    className={`tecof-cmdk-item${idx === active ? ' is-active' : ''}${cmd.disabled ? ' is-disabled' : ''}`}
                    data-active={idx === active}
                    disabled={cmd.disabled}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => runAt(idx)}
                  >
                    <span className="tecof-cmdk-item-icon">{cmd.icon}</span>
                    <span className="tecof-cmdk-item-label">{cmd.label}</span>
                    {cmd.hint && <kbd className="tecof-cmdk-item-hint">{cmd.hint}</kbd>}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CommandPalette;
