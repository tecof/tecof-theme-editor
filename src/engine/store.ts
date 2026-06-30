import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { applyPatches, enableMapSet, enablePatches, produceWithPatches, type Patch } from 'immer';
import type { TecofDocument, TecofNode } from '../types';
import { cloneDocument, createEmptyDocument, parseDocument } from './document';
import { findNodeById } from './zones';
import * as ops from './operations';
import type { ClipboardPayload } from './operations';

// History is patch-based (see below), so immer must have patch support turned on.
// enableMapSet is a no-op for our plain-object document but is cheap insurance in
// case a host ever stores Map/Set in props.
enablePatches();
enableMapSet();

/** Max number of undo steps retained (prevents unbounded memory growth). */
const HISTORY_LIMIT = 50;
/** Rapid prop edits to the same node within this window coalesce into one undo step. */
const COALESCE_MS = 500;

/**
 * Versioned localStorage key for the cross-page/tab clipboard mirror. Bump the
 * suffix if the ClipboardPayload shape ever changes incompatibly.
 */
const CLIPBOARD_STORAGE_KEY = 'tecof:clipboard:v1';

/**
 * Mirrors the clipboard payload to localStorage so copy/paste works across pages
 * and tabs. All access is guarded — SSR (no window) and disabled/quota-exceeded
 * storage simply no-op rather than throw.
 */
const writeClipboardStorage = (payload: ClipboardPayload | null) => {
  try {
    if (typeof localStorage === 'undefined') return;
    if (payload == null) {
      localStorage.removeItem(CLIPBOARD_STORAGE_KEY);
    } else {
      localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(payload));
    }
  } catch {
    // Storage unavailable / quota exceeded — in-memory clipboard still works.
  }
};

/** Reads the localStorage clipboard mirror, returning null when absent/invalid. */
const readClipboardStorage = (): ClipboardPayload | null => {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(CLIPBOARD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.node && typeof parsed.node === 'object') {
      return parsed as ClipboardPayload;
    }
    return null;
  } catch {
    return null;
  }
};

export interface DragPayload {
  /** Set when dragging a NEW block from the palette. */
  type?: string;
  /** Set when dragging an EXISTING node on the canvas/layers. */
  id?: string;
}

/**
 * A single undo step. Instead of a full document clone we keep immer patches:
 * `patches` redo the change, `inversePatches` undo it. This preserves immer's
 * structural sharing and keeps history memory-light even for large documents.
 */
interface HistoryStep {
  patches: Patch[];
  inversePatches: Patch[];
}

interface EditorState {
  document: TecofDocument;
  history: {
    past: HistoryStep[];
    future: HistoryStep[];
  };
  selection: {
    /**
     * PRIMARY selection: the anchor / last-clicked id (or null). All existing
     * single-selection readers (Inspector, overlay toolbar, breadcrumbs) rely on
     * this and keep working unchanged. Always equals the last entry of
     * `selectedIds` (or null when nothing is selected).
     */
    selectedId: string | null;
    /**
     * FULL multi-selection set. `selectNode` keeps this in sync as `[id]` (or
     * `[]`); `toggleSelect` adds/removes. Overlay outlines + bulk actions read this.
     */
    selectedIds: string[];
    hoveredId: string | null;
  };
  viewport: 'desktop' | 'tablet' | 'mobile';
  /** Active drag operation (null when idle). Powers drop affordances + ghost. */
  drag: DragPayload | null;
  /**
   * Internal clipboard (NOT part of history). Holds the most recently copied/cut
   * node subtree. Paste prefers this; falls back to the localStorage mirror.
   */
  clipboard: ClipboardPayload | null;
  /** Internal: last coalescible commit marker (node id + timestamp). */
  _lastCommit: { id: string; time: number } | null;
}

interface EditorActions {
  // Initialization
  setDocument: (doc: TecofDocument) => void;

  // Selection
  selectNode: (id: string | null) => void;
  /** Cmd/Ctrl-click: add/remove `id` from the multi-selection, updating primary. */
  toggleSelect: (id: string) => void;
  /** Replaces the whole selection set (primary = last entry, or null when empty). */
  setSelection: (ids: string[]) => void;
  hoverNode: (id: string | null) => void;
  setViewport: (viewport: 'desktop' | 'tablet' | 'mobile') => void;

  // Drag
  beginDrag: (payload: DragPayload) => void;
  endDrag: () => void;

  // Operations
  insertNode: (node: TecofNode, targetZoneKey?: string, index?: number) => void;
  removeNode: (id: string) => void;
  /** Bulk remove (single undo step). When ids omitted, removes current selection. */
  removeNodes: (ids?: string[]) => void;
  moveNode: (id: string, targetZoneKey?: string, index?: number) => void;
  duplicateNode: (id: string) => void;
  /** Bulk duplicate (single undo step). When ids omitted, duplicates selection. */
  duplicateNodes: (ids?: string[]) => void;
  updateProps: (id: string, patch: Record<string, any>) => void;
  setRootProps: (patch: Record<string, any>) => void;

  // Clipboard (copy/cut/paste). `id` defaults to the primary selection.
  copyNode: (id?: string) => void;
  cutNode: (id?: string) => void;
  pasteClipboard: (targetZoneKey?: string, index?: number) => void;

  // History
  undo: () => void;
  redo: () => void;
}

export type EditorStore = EditorState & EditorActions;

/**
 * Runs a mutating document operation, capturing the change as immer patches and
 * recording it on the undo stack.
 *
 * `mutate` receives a plain draft of the CURRENT document and mutates it in place
 * (the same ops used everywhere). We compute patches with `produceWithPatches`,
 * assign the produced document back onto the store draft, and push the step.
 *
 * When `coalesceKey` matches the previous commit within COALESCE_MS, we DON'T push
 * a new step — instead we merge the new patches into the top-of-stack step so a
 * single undo reverts the whole burst (e.g. typing into a text field).
 */
const commit = (
  state: EditorStore,
  mutate: (doc: TecofDocument) => void,
  coalesceKey?: string
) => {
  const [next, patches, inversePatches] = produceWithPatches(state.document, mutate);

  // No structural change (e.g. operation no-op'd) — don't pollute history.
  if (patches.length === 0) {
    state.document = next as TecofDocument;
    return;
  }

  state.document = next as TecofDocument;

  const now = Date.now();
  const last = state._lastCommit;
  const isContinuation =
    coalesceKey != null &&
    last != null &&
    last.id === coalesceKey &&
    now - last.time < COALESCE_MS &&
    state.history.past.length > 0;

  if (isContinuation) {
    // Merge into the existing top-of-stack step. Forward patches append in order;
    // inverse patches must be PREPENDED so that, when applied, the most recent
    // change is reverted first (inverse order).
    const top = state.history.past[state.history.past.length - 1];
    top.patches.push(...patches);
    top.inversePatches.unshift(...inversePatches);
  } else {
    state.history.past.push({ patches, inversePatches });
    if (state.history.past.length > HISTORY_LIMIT) {
      state.history.past.shift();
    }
  }

  // Any new commit invalidates the redo stack.
  state.history.future = [];
  state._lastCommit = coalesceKey != null ? { id: coalesceKey, time: now } : null;
};

// Drops the given ids from the current selection (primary + set) after they were
// removed. Keeps `selectedId` pointing at the last surviving selected id.
const pruneSelection = (state: EditorStore, removed: string[]) => {
  const gone = new Set(removed);
  state.selection.selectedIds = state.selection.selectedIds.filter((id) => !gone.has(id));
  if (state.selection.selectedId && gone.has(state.selection.selectedId)) {
    const ids = state.selection.selectedIds;
    state.selection.selectedId = ids.length > 0 ? ids[ids.length - 1] : null;
  }
};

// After undo/redo, drop any selected ids whose nodes no longer exist. Prunes
// BOTH the multi-selection set and the primary id so they stay consistent.
const validateSelection = (state: EditorStore) => {
  state.selection.selectedIds = state.selection.selectedIds.filter((id) =>
    findNodeById(state.document, id)
  );
  const primary = state.selection.selectedId;
  if (primary && !findNodeById(state.document, primary)) {
    // Fall back to the last surviving selected id (or null) as the new primary.
    const ids = state.selection.selectedIds;
    state.selection.selectedId = ids.length > 0 ? ids[ids.length - 1] : null;
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
      selectedIds: [],
      hoveredId: null,
    },
    viewport: 'desktop',
    drag: null,
    clipboard: null,
    _lastCommit: null,

    // Actions
    setDocument: (doc) =>
      set((state) => {
        state.document = cloneDocument(parseDocument(doc));
        state.history = { past: [], future: [] };
        state.selection = { selectedId: null, selectedIds: [], hoveredId: null };
        state._lastCommit = null;
      }),

    selectNode: (id) =>
      set((state) => {
        // Single-select: primary + set stay in lockstep.
        state.selection.selectedId = id;
        state.selection.selectedIds = id ? [id] : [];
      }),

    toggleSelect: (id) =>
      set((state) => {
        const ids = state.selection.selectedIds;
        const existing = ids.indexOf(id);
        if (existing >= 0) {
          // Already selected -> remove. New primary is the last remaining id.
          ids.splice(existing, 1);
          state.selection.selectedId = ids.length > 0 ? ids[ids.length - 1] : null;
        } else {
          // Not selected -> add and make it the primary (anchor).
          ids.push(id);
          state.selection.selectedId = id;
        }
      }),

    setSelection: (ids) =>
      set((state) => {
        state.selection.selectedIds = [...ids];
        state.selection.selectedId = ids.length > 0 ? ids[ids.length - 1] : null;
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
        commit(state, (doc) => ops.insertNode(doc, node, targetZoneKey, index));
      }),

    removeNode: (id) =>
      set((state) => {
        commit(state, (doc) => ops.removeNode(doc, id));
        pruneSelection(state, [id]);
      }),

    removeNodes: (ids) =>
      set((state) => {
        const targets = ids ?? state.selection.selectedIds;
        if (targets.length === 0) return;
        // One commit -> one undo step for the whole bulk delete.
        commit(state, (doc) => ops.removeNodes(doc, targets));
        pruneSelection(state, targets);
      }),

    moveNode: (id, targetZoneKey, index) =>
      set((state) => {
        commit(state, (doc) => ops.moveNode(doc, id, targetZoneKey, index));
      }),

    duplicateNode: (id) =>
      set((state) => {
        commit(state, (doc) => ops.duplicateNode(doc, id));
      }),

    duplicateNodes: (ids) =>
      set((state) => {
        const targets = ids ?? state.selection.selectedIds;
        if (targets.length === 0) return;
        // Capture the new ids so we can select the copies after the bulk op.
        let newIds: string[] = [];
        commit(state, (doc) => {
          newIds = ops.duplicateNodes(doc, targets);
        });
        if (newIds.length > 0) {
          state.selection.selectedIds = newIds;
          state.selection.selectedId = newIds[newIds.length - 1];
        }
      }),

    updateProps: (id, patch) =>
      set((state) => {
        // Coalesce rapid edits to the SAME node into a single undo step so that
        // typing into a text field doesn't flood the history one keystroke at a time.
        commit(state, (doc) => ops.updateProps(doc, id, patch), id);
      }),

    setRootProps: (patch) =>
      set((state) => {
        // Root-level edits (e.g. the page settings inspector) coalesce under a
        // synthetic "__root__" key, mirroring updateProps behaviour.
        commit(state, (doc) => ops.setRootProps(doc, patch), '__root__');
      }),

    copyNode: (id) =>
      set((state) => {
        const targetId = id ?? state.selection.selectedId;
        if (!targetId) return;
        const payload = ops.serializeNodeWithZones(state.document, targetId);
        if (!payload) return;
        // In-memory clipboard (non-history) + cross-tab localStorage mirror.
        state.clipboard = payload;
        writeClipboardStorage(payload);
      }),

    cutNode: (id) =>
      set((state) => {
        const targetId = id ?? state.selection.selectedId;
        if (!targetId) return;
        const payload = ops.serializeNodeWithZones(state.document, targetId);
        if (!payload) return;
        // Copy then remove as a single undoable step (the remove is the only
        // document mutation; the clipboard write is non-history state).
        state.clipboard = payload;
        writeClipboardStorage(payload);
        commit(state, (doc) => ops.removeNode(doc, targetId));
        pruneSelection(state, [targetId]);
      }),

    pasteClipboard: (targetZoneKey, index) =>
      set((state) => {
        // Prefer the in-memory clipboard; fall back to the localStorage mirror
        // (set by a copy/cut on another page or tab).
        const payload = state.clipboard ?? readClipboardStorage();
        if (!payload) return;

        // Resolve the default paste target: right AFTER the primary selection in
        // its own list/zone; if nothing is selected, append to root content.
        let zoneKey = targetZoneKey;
        let insertIndex = index;
        if (zoneKey === undefined && insertIndex === undefined) {
          const primary = state.selection.selectedId;
          const res = primary ? findNodeById(state.document, primary) : null;
          if (res) {
            zoneKey = res.path.zoneKey;
            insertIndex = res.path.index + 1;
          }
        }

        // Paste goes through history (one undo step). Capture the new root id so
        // we can select the freshly pasted node afterwards.
        let newId: string | null = null;
        commit(state, (doc) => {
          const pasted = ops.pastePayload(doc, payload, zoneKey, insertIndex);
          newId = pasted.props.id;
        });
        if (newId) {
          state.selection.selectedId = newId;
          state.selection.selectedIds = [newId];
        }
      }),

    undo: () =>
      set((state) => {
        if (state.history.past.length === 0) return;
        const step = state.history.past.pop()!;
        state.document = applyPatches(state.document, step.inversePatches) as TecofDocument;
        state.history.future.push(step);
        state._lastCommit = null;
        validateSelection(state);
      }),

    redo: () =>
      set((state) => {
        if (state.history.future.length === 0) return;
        const step = state.history.future.pop()!;
        state.document = applyPatches(state.document, step.patches) as TecofDocument;
        state.history.past.push(step);
        state._lastCommit = null;
        validateSelection(state);
      }),
  }))
);
