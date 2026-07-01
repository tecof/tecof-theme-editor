/**
 * Style clipboard helpers — copy a node's structured `_tecofStyles` and paste it
 * onto one or more other nodes. The buffer lives in `useUiStore` (session, not
 * persisted, not part of undo history); pasting goes through the engine's
 * `updateProps` so it IS undoable.
 *
 * These are plain functions (read stores via `getState()`) so they work from
 * React components, the command palette, the context menu, and global key
 * handlers alike.
 */
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { findNodeById } from '../../engine/zones';
import { STYLES_PROP, type NodeStyles } from './types';

/** Deep clone a (JSON-serializable) styles object so buffer/targets never share refs. */
export const cloneStyles = (styles: NodeStyles): NodeStyles =>
  JSON.parse(JSON.stringify(styles));

/** True when a styles object has no set layers (nothing worth copying). */
export const isEmptyStyles = (styles?: NodeStyles | null): boolean =>
  !styles ||
  Object.values(styles).every(
    (layer) => !layer || Object.keys(layer).length === 0
  );

/**
 * Copy the given node's styles into the session buffer. Defaults to the primary
 * selection. Returns false (and leaves the buffer untouched) when the node has
 * no styles to copy.
 */
export function copyNodeStyles(id?: string): boolean {
  const ed = useEditorStore.getState();
  const targetId = id ?? ed.selection.selectedId;
  if (!targetId) return false;
  const res = findNodeById(ed.document, targetId);
  const styles = res?.node.props[STYLES_PROP] as NodeStyles | undefined;
  if (isEmptyStyles(styles)) return false;
  useUiStore.getState().setStyleClipboard(cloneStyles(styles!));
  return true;
}

/**
 * Paste the buffered styles onto the given nodes (defaults to the full
 * selection). Each target gets its own clone so later edits stay isolated.
 */
export function pasteNodeStyles(ids?: string[]): void {
  const buffer = useUiStore.getState().styleClipboard;
  if (!buffer) return;
  const ed = useEditorStore.getState();
  const targets = (ids && ids.length ? ids : ed.selection.selectedIds).filter(Boolean);
  for (const id of targets) {
    ed.updateProps(id, { [STYLES_PROP]: cloneStyles(buffer) });
  }
}
