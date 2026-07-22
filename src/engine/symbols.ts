import type { TecofDocument, TecofNode } from '../types';
import { findNodeById, parseZoneKey, getZoneKey } from './zones';

/**
 * Symbols (reusable component instances) — the Webflow-symbol / Figma-component
 * model on top of the existing `sharedComponentId` link.
 *
 * All nodes that carry the SAME `sharedComponentId` are INSTANCES of one symbol.
 * Each instance is a full, independent subtree (its own node ids); instances are
 * matched to each other by STRUCTURAL PATH from their root (a sequence of
 * `{slot, index}` steps), so an edit to one instance can be mirrored onto the
 * corresponding node in every other instance — this is what makes "edit one →
 * all update" work live in the editor.
 *
 * A field can be pinned to a single instance via `_symbolOverrides` (a list of
 * prop keys): overridden keys are never synced in or out, so e.g. each card can
 * keep its own title while sharing layout/style.
 *
 * The propagation itself is a PURE plan ({@link planSymbolSync}) so it is fully
 * unit-testable; the store applies the plan inside one undoable commit.
 */

/** Node-prop key linking an instance to its symbol. */
export const SYMBOL_ID_PROP = 'sharedComponentId';
/** Node-prop key: field keys pinned to THIS instance (not synced). */
export const SYMBOL_OVERRIDES_PROP = '_symbolOverrides';

/** Keys that identify/localise a node and must never propagate between instances. */
const META_KEYS = new Set<string>([
  'id',
  SYMBOL_ID_PROP,
  SYMBOL_OVERRIDES_PROP,
  '_locked',
  '_hidden',
  '_startHidden',
]);

export interface SymbolPathStep {
  slot: string;
  index: number;
}

export interface SymbolSync {
  targetId: string;
  patch: Record<string, unknown>;
}

const asKeyArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

/** The list of override keys pinned to a node. */
export const symbolOverridesOf = (node: TecofNode | null | undefined): string[] =>
  asKeyArray(node?.props?.[SYMBOL_OVERRIDES_PROP]);

/**
 * The nearest ancestor (or the node itself) that carries a `sharedComponentId` —
 * i.e. the symbol instance this node belongs to. Null when the node is not part
 * of any symbol.
 */
export const findSymbolRoot = (
  doc: TecofDocument,
  id: string
): { rootId: string; symbolId: string } | null => {
  let cur: string | null = id;
  while (cur) {
    const res = findNodeById(doc, cur);
    if (!res) return null;
    const symbolId = res.node.props[SYMBOL_ID_PROP];
    if (typeof symbolId === 'string' && symbolId) return { rootId: cur, symbolId };
    cur = res.path.zoneKey ? parseZoneKey(res.path.zoneKey).parentId : null;
  }
  return null;
};

/** Structural path (slot + index steps) from a symbol root down to a node. */
export const symbolRelativePath = (
  doc: TecofDocument,
  rootId: string,
  nodeId: string
): SymbolPathStep[] | null => {
  if (nodeId === rootId) return [];
  const steps: SymbolPathStep[] = [];
  let cur = nodeId;
  // Walk up until we hit the root; bail if we reach root content first (the node
  // isn't actually under rootId).
  while (cur !== rootId) {
    const res = findNodeById(doc, cur);
    if (!res || !res.path.zoneKey) return null;
    const { parentId, slotName } = parseZoneKey(res.path.zoneKey);
    steps.push({ slot: slotName, index: res.path.index });
    cur = parentId;
  }
  return steps.reverse();
};

/** Resolve a structural path against another instance root → the node id there. */
export const resolveSymbolPath = (
  doc: TecofDocument,
  instanceRootId: string,
  path: SymbolPathStep[]
): string | null => {
  let cur = instanceRootId;
  for (const step of path) {
    const child = doc.zones[getZoneKey(cur, step.slot)]?.[step.index];
    if (!child) return null;
    cur = child.props.id;
  }
  return cur;
};

/** Every instance ROOT (node id) that belongs to the given symbol. */
export const findSymbolInstanceRoots = (doc: TecofDocument, symbolId: string): string[] => {
  const roots: string[] = [];
  const check = (node: TecofNode) => {
    if (node.props[SYMBOL_ID_PROP] === symbolId) roots.push(node.props.id);
  };
  for (const node of doc.content) check(node);
  for (const items of Object.values(doc.zones)) for (const node of items) check(node);
  return roots;
};

/** Summary for the inspector: is this node in a symbol, and how many instances. */
export const symbolInfo = (
  doc: TecofDocument,
  id: string
): { symbolId: string; rootId: string; instanceCount: number } | null => {
  const root = findSymbolRoot(doc, id);
  if (!root) return null;
  return { ...root, instanceCount: findSymbolInstanceRoots(doc, root.symbolId).length };
};

/**
 * Plan the propagation of a prop patch to sibling instances. Returns the patch
 * each corresponding node in every OTHER instance should receive:
 *   - meta keys (id/link/overrides/editor-state) never propagate,
 *   - keys the SOURCE node overrides stay instance-local (not propagated),
 *   - keys a TARGET node overrides are skipped for that target,
 *   - targets whose structure diverges (missing path or different type) are skipped.
 */
export const planSymbolSync = (
  doc: TecofDocument,
  editedId: string,
  patch: Record<string, unknown>
): SymbolSync[] => {
  const root = findSymbolRoot(doc, editedId);
  if (!root) return [];
  const source = findNodeById(doc, editedId);
  if (!source) return [];

  const sourceOverrides = symbolOverridesOf(source.node);
  const keys = Object.keys(patch).filter((k) => !META_KEYS.has(k) && !sourceOverrides.includes(k));
  if (keys.length === 0) return [];

  const path = symbolRelativePath(doc, root.rootId, editedId);
  if (path === null) return [];

  const out: SymbolSync[] = [];
  for (const instanceRoot of findSymbolInstanceRoots(doc, root.symbolId)) {
    if (instanceRoot === root.rootId) continue;
    const targetId = resolveSymbolPath(doc, instanceRoot, path);
    if (!targetId) continue;
    const target = findNodeById(doc, targetId);
    if (!target || target.node.type !== source.node.type) continue;

    const targetOverrides = symbolOverridesOf(target.node);
    const applyKeys = keys.filter((k) => !targetOverrides.includes(k));
    if (applyKeys.length === 0) continue;

    const p: Record<string, unknown> = {};
    for (const k of applyKeys) p[k] = patch[k];
    out.push({ targetId, patch: p });
  }
  return out;
};
