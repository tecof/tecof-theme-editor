import { create } from 'zustand';

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

  setMode: (mode: EditorMode) => void;
  toggleMode: () => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  mode: 'edit',
  leftPanelOpen: true,
  rightPanelOpen: true,

  setMode: (mode) => set({ mode }),
  toggleMode: () => set((s) => ({ mode: s.mode === 'edit' ? 'preview' : 'edit' })),
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
}));
