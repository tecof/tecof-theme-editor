import { create } from 'zustand';

/**
 * State for the single canvas right-click context menu. Kept in its own tiny
 * store (separate from the document engine and UI chrome stores) so the menu can
 * be opened from inside the iframe-portaled `NodeRenderer` and rendered in host
 * DOM from `TecofStudio` without any prop-drilling.
 *
 * `x`/`y` are HOST-window coordinates (the opener translates iframe-relative
 * cursor positions before calling `open`).
 */
interface ContextMenuState {
  open: boolean;
  /** Node the menu acts on. */
  nodeId: string | null;
  /** Host-window cursor position where the menu anchors. */
  x: number;
  y: number;
  openMenu: (nodeId: string, x: number, y: number) => void;
  closeMenu: () => void;
}

export const useContextMenuStore = create<ContextMenuState>((set) => ({
  open: false,
  nodeId: null,
  x: 0,
  y: 0,
  openMenu: (nodeId, x, y) => set({ open: true, nodeId, x, y }),
  closeMenu: () => set({ open: false, nodeId: null }),
}));
