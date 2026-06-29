import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { TecofDocument, TecofNode } from '../types';
import { cloneDocument, createEmptyDocument, parseDocument } from './document';
import { findNodeById } from './zones';
import * as ops from './operations';

/** Max number of undo steps retained (prevents unbounded memory growth). */
const HISTORY_LIMIT = 50;
/** Rapid prop edits to the same node within this window coalesce into one undo step. */
const COALESCE_MS = 500;

export interface DragPayload {
  /** Set when dragging a NEW block from the palette. */
  type?: string;
  /** Set when dragging an EXISTING node on the canvas/layers. */
  id?: string;
}

interface EditorState {
  document: TecofDocument;
  history: {
    past: TecofDocument[];
    future: TecofDocument[];
  };
  selection: {
    selectedId: string | null;
    hoveredId: string | null;
  };
  viewport: 'desktop' | 'tablet' | 'mobile';
  /** Active drag operation (null when idle). Powers drop affordances + ghost. */
  drag: DragPayload | null;
  /** Internal: last coalescible commit marker (node id + timestamp). */
  _lastCommit: { id: string; time: number } | null;
}

interface EditorActions {
  // Initialization
  setDocument: (doc: TecofDocument) => void;

  // Selection
  selectNode: (id: string | null) => void;
  hoverNode: (id: string | null) => void;
  setViewport: (viewport: 'desktop' | 'tablet' | 'mobile') => void;

  // Drag
  beginDrag: (payload: DragPayload) => void;
  endDrag: () => void;

  // Operations
  insertNode: (node: TecofNode, targetZoneKey?: string, index?: number) => void;
  removeNode: (id: string) => void;
  moveNode: (id: string, targetZoneKey?: string, index?: number) => void;
  duplicateNode: (id: string) => void;
  updateProps: (id: string, patch: Record<string, any>) => void;
  setRootProps: (patch: Record<string, any>) => void;

  // History
  undo: () => void;
  redo: () => void;
}

export type EditorStore = EditorState & EditorActions;

// Push current document onto the undo stack (capped) and clear redo.
const pushToHistory = (state: EditorStore) => {
  state.history.past.push(cloneDocument(state.document));
  if (state.history.past.length > HISTORY_LIMIT) {
    state.history.past.shift();
  }
  state.history.future = [];
  state._lastCommit = null;
};

// After undo/redo, drop a stale selection if its node no longer exists.
const validateSelection = (state: EditorStore) => {
  const id = state.selection.selectedId;
  if (id && !findNodeById(state.document, id)) {
    state.selection.selectedId = null;
  }
  state.selection.hoveredId = null;
};

export const useEditorStore = create<EditorStore>()(
  immer((set) => ({
    // Initial State
    document: createEmptyDocument(),
    history: {
      past: [],
      future: [],
    },
    selection: {
      selectedId: null,
      hoveredId: null,
    },
    viewport: 'desktop',
    drag: null,
    _lastCommit: null,

    // Actions
    setDocument: (doc) =>
      set((state) => {
        state.document = cloneDocument(parseDocument(doc));
        state.history = { past: [], future: [] };
        state.selection = { selectedId: null, hoveredId: null };
        state._lastCommit = null;
      }),

    selectNode: (id) =>
      set((state) => {
        state.selection.selectedId = id;
      }),

    hoverNode: (id) =>
      set((state) => {
        state.selection.hoveredId = id;
      }),

    setViewport: (viewport) =>
      set((state) => {
        state.viewport = viewport;
      }),

    beginDrag: (payload) =>
      set((state) => {
        state.drag = payload;
      }),

    endDrag: () =>
      set((state) => {
        state.drag = null;
      }),

    insertNode: (node, targetZoneKey, index) =>
      set((state) => {
        pushToHistory(state);
        ops.insertNode(state.document, node, targetZoneKey, index);
      }),

    removeNode: (id) =>
      set((state) => {
        pushToHistory(state);
        ops.removeNode(state.document, id);
        if (state.selection.selectedId === id) {
          state.selection.selectedId = null;
        }
      }),

    moveNode: (id, targetZoneKey, index) =>
      set((state) => {
        pushToHistory(state);
        ops.moveNode(state.document, id, targetZoneKey, index);
      }),

    duplicateNode: (id) =>
      set((state) => {
        pushToHistory(state);
        ops.duplicateNode(state.document, id);
      }),

    updateProps: (id, patch) =>
      set((state) => {
        // Coalesce rapid edits to the SAME node into a single undo step so that
        // typing into a text field doesn't flood the history one keystroke at a time.
        const now = Date.now();
        const last = state._lastCommit;
        const isContinuation = last && last.id === id && now - last.time < COALESCE_MS;
        if (!isContinuation) {
          state.history.past.push(cloneDocument(state.document));
          if (state.history.past.length > HISTORY_LIMIT) {
            state.history.past.shift();
          }
          state.history.future = [];
        }
        ops.updateProps(state.document, id, patch);
        state._lastCommit = { id, time: now };
      }),

    setRootProps: (patch) =>
      set((state) => {
        // Root-level edits (e.g. the page settings inspector) coalesce under a
        // synthetic "__root__" key, mirroring updateProps behaviour.
        const now = Date.now();
        const last = state._lastCommit;
        const isContinuation = last && last.id === '__root__' && now - last.time < COALESCE_MS;
        if (!isContinuation) {
          state.history.past.push(cloneDocument(state.document));
          if (state.history.past.length > HISTORY_LIMIT) {
            state.history.past.shift();
          }
          state.history.future = [];
        }
        ops.setRootProps(state.document, patch);
        state._lastCommit = { id: '__root__', time: now };
      }),

    undo: () =>
      set((state) => {
        if (state.history.past.length === 0) return;
        const previous = state.history.past.pop()!;
        state.history.future.push(cloneDocument(state.document));
        state.document = previous;
        state._lastCommit = null;
        validateSelection(state);
      }),

    redo: () =>
      set((state) => {
        if (state.history.future.length === 0) return;
        const next = state.history.future.pop()!;
        state.history.past.push(cloneDocument(state.document));
        state.document = next;
        state._lastCommit = null;
        validateSelection(state);
      }),
  }))
);
