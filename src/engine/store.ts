import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { TecofDocument, TecofNode } from '../types';
import { EMPTY_DOCUMENT } from './document';
import * as ops from './operations';

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
}

interface EditorActions {
  // Initialization
  setDocument: (doc: TecofDocument) => void;

  // Selection
  selectNode: (id: string | null) => void;
  hoverNode: (id: string | null) => void;
  setViewport: (viewport: 'desktop' | 'tablet' | 'mobile') => void;

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

// Helper to save current state to history before mutating
const pushToHistory = (state: EditorStore) => {
  state.history.past.push(JSON.parse(JSON.stringify(state.document)));
  state.history.future = [];
};

export const useEditorStore = create<EditorStore>()(
  immer((set) => ({
    // Initial State
    document: { ...EMPTY_DOCUMENT },
    history: {
      past: [],
      future: [],
    },
    selection: {
      selectedId: null,
      hoveredId: null,
    },
    viewport: 'desktop',

    // Actions
    setDocument: (doc) =>
      set((state) => {
        state.document = doc;
        state.history = { past: [], future: [] };
        state.selection = { selectedId: null, hoveredId: null };
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
        pushToHistory(state); // In a real app, this should probably be debounced for inputs
        ops.updateProps(state.document, id, patch);
      }),

    setRootProps: (patch) =>
      set((state) => {
        pushToHistory(state);
        ops.setRootProps(state.document, patch);
      }),

    undo: () =>
      set((state) => {
        if (state.history.past.length === 0) return;
        const previous = state.history.past.pop()!;
        state.history.future.push(JSON.parse(JSON.stringify(state.document)));
        state.document = previous;
        // Selection could be invalid after undo, optionally clear or restore it
      }),

    redo: () =>
      set((state) => {
        if (state.history.future.length === 0) return;
        const next = state.history.future.pop()!;
        state.history.past.push(JSON.parse(JSON.stringify(state.document)));
        state.document = next;
      }),
  }))
);
