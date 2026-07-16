import { create } from 'zustand';
import type { NodeStyles } from './style/types';

/**
 * Versioned localStorage key for the style-clipboard mirror — copy a node's
 * styles on one page, paste them on another (same pattern as the engine's
 * node-clipboard mirror in engine/store.ts). Guarded: SSR / disabled storage
 * silently degrade to the in-memory buffer.
 */
const STYLE_CLIPBOARD_STORAGE_KEY = 'tecof:style-clipboard:v1';

const writeStyleClipboardStorage = (styles: NodeStyles | null) => {
  try {
    if (typeof localStorage === 'undefined') return;
    if (styles == null) localStorage.removeItem(STYLE_CLIPBOARD_STORAGE_KEY);
    else localStorage.setItem(STYLE_CLIPBOARD_STORAGE_KEY, JSON.stringify(styles));
  } catch {
    /* storage unavailable — in-memory buffer still works */
  }
};

const readStyleClipboardStorage = (): NodeStyles | null => {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STYLE_CLIPBOARD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as NodeStyles) : null;
  } catch {
    return null;
  }
};

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
 * Live positional drop hover during a canvas drag: which node the drag is
 * hovering, which list it belongs to, and where the insertion line sits.
 * Published by `useDropTarget` and consumed by the smart alignment guides
 * (`DragGuides`). `null` = no positional target hovered.
 */
export interface DropHoverState {
  targetId: string;
  /** Zone the target belongs to; undefined = root content flow. */
  zoneKey?: string;
  position: 'before' | 'after';
  axis: 'x' | 'y';
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
   * Style clipboard: the most recently copied node's structured styles
   * (`_tecofStyles`). Lives here (UI state, not the document) so "paste styles"
   * buttons can reactively enable/disable. Mirrored to localStorage so styles
   * copied on one page can be pasted on another.
   */
  styleClipboard: NodeStyles | null;
  /**
   * The open canvas context menu (right-click on a node), or `null` when closed.
   * Coordinates are in the PARENT document's coordinate space.
   */
  contextMenu: ContextMenuState | null;
  /** "Bölüm Ekle" modalının ekleme hedefi; null = modal kapalı. */
  addSectionTarget: AddSectionTarget | null;

  /** Column-grid alignment overlay (Webflow-style): visibility + config. Editor
   * aid only — not part of the document, resets each session. */
  gridVisible: boolean;
  gridColumns: number;
  gridGap: number;
  /** Resize mode: when on, the selected node shows width/height resize handles
   * (instead of the spacing handles). Editor aid, session-only. */
  resizeEnabled: boolean;
  /** Design width (CSS px) the DESKTOP viewport renders the page at. The canvas
   * iframe is laid out at this exact width and scale-fitted into the available
   * area, so the page sees a REAL desktop breakpoint even on small screens. */
  desktopWidth: number;
  /** Current canvas fit scale (1 = %100), published by Canvas for the TopBar. */
  canvasScale: number;
  /** Live drop hover for the drag-time alignment guides; null = idle. */
  dropHover: DropHoverState | null;
  /** Whether the "AI ile bölüm üret" modal is open (only reachable when the
   * host wires `config.ai`). */
  aiModalOpen: boolean;

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
  openAddSection: (target: AddSectionTarget) => void;
  closeAddSection: () => void;
  toggleGrid: () => void;
  setGridColumns: (n: number) => void;
  setGridGap: (px: number) => void;
  toggleResize: () => void;
  setDesktopWidth: (px: number) => void;
  setCanvasScale: (scale: number) => void;
  setDropHover: (hover: DropHoverState | null) => void;
  setAiModalOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  mode: 'edit',
  leftPanelOpen: false,
  rightPanelOpen: true,
  commandPaletteOpen: false,
  // Seeded from the cross-page mirror so styles copied on a previous page are
  // immediately pasteable here.
  styleClipboard: readStyleClipboardStorage(),
  contextMenu: null,
  addSectionTarget: null,
  gridVisible: false,
  gridColumns: 12,
  gridGap: 24,
  resizeEnabled: false,
  desktopWidth: 1440,
  canvasScale: 1,
  dropHover: null,
  aiModalOpen: false,

  setMode: (mode) => set({ mode }),
  toggleMode: () => set((s) => ({ mode: s.mode === 'edit' ? 'preview' : 'edit' })),
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setStyleClipboard: (styles) => {
    writeStyleClipboardStorage(styles);
    set({ styleClipboard: styles });
  },
  setContextMenu: (menu) => set({ contextMenu: menu }),
  openAddSection: (target) => set({ addSectionTarget: target }),
  closeAddSection: () => set({ addSectionTarget: null }),
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  setGridColumns: (n) => set({ gridColumns: Math.max(1, Math.min(24, Math.round(n) || 1)) }),
  setGridGap: (px) => set({ gridGap: Math.max(0, Math.round(px) || 0) }),
  toggleResize: () => set((s) => ({ resizeEnabled: !s.resizeEnabled })),
  setDesktopWidth: (px) => set({ desktopWidth: Math.max(320, Math.min(3840, Math.round(px) || 1440)) }),
  // Scale updates fire from a ResizeObserver — only notify on real change.
  setCanvasScale: (scale) =>
    set((s) => (Math.abs(s.canvasScale - scale) < 0.001 ? s : { canvasScale: scale })),
  // Dragover fires continuously; only notify subscribers on a real change so the
  // guides don't re-render every pointer move over the same position.
  setDropHover: (hover) =>
    set((s) => {
      const cur = s.dropHover;
      if (
        cur === hover ||
        (cur &&
          hover &&
          cur.targetId === hover.targetId &&
          cur.zoneKey === hover.zoneKey &&
          cur.position === hover.position &&
          cur.axis === hover.axis)
      ) {
        return s;
      }
      return { dropHover: hover };
    }),
  setAiModalOpen: (open) => set({ aiModalOpen: open }),
}));
