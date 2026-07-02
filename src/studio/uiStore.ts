import { create } from 'zustand';
import type { NodeStyles } from './style/types';
import type { TecofNode } from '../types';

export type EditorMode = 'edit' | 'preview';

/**
 * State of the canvas right-click context menu: the target node plus the
 * PARENT-document coordinates where the menu should appear (iframe coords are
 * translated by the caller). `null` = closed.
 */
export interface ContextMenuState {
  nodeId: string;
  x: number;
  y: number;
}

/**
 * Target of the "Bölüm Ekle" modal: which list the picked component will be
 * inserted into. `zoneKey` undefined = the root content flow; set = a specific
 * slot zone (e.g. clicked from an empty DropZone). `null` state = modal closed.
 */
export interface AddSectionTarget {
  zoneKey?: string;
  index: number;
}

/**
 * Editor *UI* state, deliberately kept separate from the document engine store
 * (`useEditorStore`). This holds chrome/interaction state that should NOT be part
 * of the page document or its undo history: the active mode and panel visibility.
 */
interface UiState {
  /** 'edit' = clicks select nodes, links/buttons inert. 'preview' = links/buttons are live. */
  mode: EditorMode;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  /** Whether the Cmd/Ctrl+K command palette is open. */
  commandPaletteOpen: boolean;
  /**
   * Session style clipboard: the most recently copied node's structured styles
   * (`_tecofStyles`). Lives here (UI state, not the document) so "paste styles"
   * buttons can reactively enable/disable. In-memory only (not persisted).
   */
  styleClipboard: NodeStyles | null;
  /**
   * The open canvas context menu (right-click on a node), or `null` when closed.
   * Coordinates are in the PARENT document's coordinate space.
   */
  contextMenu: ContextMenuState | null;
  /**
   * Session node clipboard for the context menu's Kopyala/Yapıştır: a
   * self-contained node snapshot whose slot children are folded back into the
   * props (see `serializeNodeSubtree`). In-memory only (not persisted); kept
   * separate from the engine clipboard so it never leaks into undo history.
   */
  nodeClipboard: TecofNode | null;
  /** "Bölüm Ekle" modalının ekleme hedefi; null = modal kapalı. */
  addSectionTarget: AddSectionTarget | null;

  setMode: (mode: EditorMode) => void;
  toggleMode: () => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setStyleClipboard: (styles: NodeStyles | null) => void;
  setContextMenu: (menu: ContextMenuState | null) => void;
  setNodeClipboard: (node: TecofNode | null) => void;
  openAddSection: (target: AddSectionTarget) => void;
  closeAddSection: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  mode: 'edit',
  leftPanelOpen: false,
  rightPanelOpen: true,
  commandPaletteOpen: false,
  styleClipboard: null,
  contextMenu: null,
  nodeClipboard: null,
  addSectionTarget: null,

  setMode: (mode) => set({ mode }),
  toggleMode: () => set((s) => ({ mode: s.mode === 'edit' ? 'preview' : 'edit' })),
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setStyleClipboard: (styles) => set({ styleClipboard: styles }),
  setContextMenu: (menu) => set({ contextMenu: menu }),
  setNodeClipboard: (node) => set({ nodeClipboard: node }),
  openAddSection: (target) => set({ addSectionTarget: target }),
  closeAddSection: () => set({ addSectionTarget: null }),
}));
