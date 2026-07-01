import { create } from 'zustand';
import type { NodeStyles } from './style/types';

export type EditorMode = 'edit' | 'preview';

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

  setMode: (mode: EditorMode) => void;
  toggleMode: () => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setStyleClipboard: (styles: NodeStyles | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  mode: 'edit',
  leftPanelOpen: false,
  rightPanelOpen: true,
  commandPaletteOpen: false,
  styleClipboard: null,

  setMode: (mode) => set({ mode }),
  toggleMode: () => set((s) => ({ mode: s.mode === 'edit' ? 'preview' : 'edit' })),
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setStyleClipboard: (styles) => set({ styleClipboard: styles }),
}));
