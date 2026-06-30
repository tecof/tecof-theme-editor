import type { TecofDocument } from '../types';
import { parseZoneKey } from './zones';

/**
 * Pure drop-rule helpers.
 *
 * These validate whether a node of a given type may be placed into a given zone,
 * based on OPTIONAL component-config constraints. The guiding principle is
 * "permissive by default": when no constraint is declared the drop is allowed, so
 * existing configs (which declare none of these) keep working unchanged.
 *
 * `config` is intentionally typed `any` to avoid coupling the engine to the host's
 * component-config shape. Supported (all optional) conventions:
 *
 *   - A parent component's config may declare `acceptsChildren`:
 *       * `true`  / omitted  -> accepts any child type
 *       * `false`            -> accepts no children
 *       * `string[]`         -> accepts only the listed child types
 *     This may be declared at the component level (applies to every slot) or
 *     per-slot via `acceptsChildren: { [slotName]: string[] | boolean }`.
 *
 *   - A parent component's config may declare `maxItems`:
 *       * `number`                       -> cap applied to every slot
 *       * `{ [slotName]: number }`       -> per-slot cap
 *
 *   - A child component's config may declare `allowedParents?: string[]`: the
 *     dragged type may only be placed inside parents whose type is listed.
 */

/** Reads a component's config entry from a (permissive) studio config. */
const getComponentConfig = (config: any, type: string): any =>
  config?.components?.[type] ?? {};

/**
 * Resolves the slot-specific value of a constraint that may be declared either
 * flat (applies to all slots) or as a per-slot record keyed by slot name.
 */
const resolveSlotValue = <T>(value: any, slotName: string): T | undefined => {
  if (value == null) return undefined;
  // Per-slot record: a plain object that is NOT an array.
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value[slotName] as T | undefined;
  }
  // Flat value applies to every slot.
  return value as T;
};

/**
 * Returns whether `acceptsChildren` (flat or per-slot) permits `draggedType`.
 * Undefined / true => allow; false => deny; string[] => membership test.
 */
const acceptsChildType = (accepts: unknown, draggedType: string): boolean => {
  if (accepts == null || accepts === true) return true;
  if (accepts === false) return false;
  if (Array.isArray(accepts)) return accepts.includes(draggedType);
  return true;
};

/**
 * Returns whether a node of `draggedType` may be dropped into the zone
 * identified by `targetZoneKey`. Permissive by default.
 *
 * @param config        Host studio config (any shape; only optional drop-rule
 *                      fields are read).
 * @param draggedType   The component type being dropped.
 * @param targetZoneKey Zone key "parentId:slotName"; when undefined/empty the
 *                      drop targets the root content array (always allowed unless
 *                      the child restricts its parents).
 * @param doc           Current document, used to resolve the parent node's type.
 */
export const canDropInto = (
  config: any,
  draggedType: string,
  targetZoneKey: string | undefined,
  doc: TecofDocument
): boolean => {
  // Root content: there is no parent component, so only the child's own
  // `allowedParents` constraint can block it.
  if (!targetZoneKey) {
    const childConfig = getComponentConfig(config, draggedType);
    if (Array.isArray(childConfig.allowedParents) && childConfig.allowedParents.length > 0) {
      // A node that restricts its parents cannot live at the root.
      return false;
    }
    return true;
  }

  const { parentId, slotName } = parseZoneKey(targetZoneKey);

  // Resolve the parent node's type so we can check both directions of constraint.
  // We scan content + zones directly rather than findNodeById to avoid importing
  // the lookup here; callers typically already have the doc indexed.
  const parentType = resolveNodeType(doc, parentId);

  // Child -> parent constraint: `allowedParents`.
  const childConfig = getComponentConfig(config, draggedType);
  if (Array.isArray(childConfig.allowedParents) && childConfig.allowedParents.length > 0) {
    if (!parentType || !childConfig.allowedParents.includes(parentType)) {
      return false;
    }
  }

  // Parent -> child constraint: `acceptsChildren`.
  if (parentType) {
    const parentConfig = getComponentConfig(config, parentType);
    const accepts = resolveSlotValue(parentConfig.acceptsChildren, slotName);
    if (!acceptsChildType(accepts, draggedType)) {
      return false;
    }
  }

  return true;
};

/**
 * Returns whether the target zone still has room for another item, based on the
 * parent component's optional `maxItems` constraint (flat or per-slot).
 * Permissive (returns true) when no cap is declared or the parent can't be found.
 */
export const canAcceptMoreItems = (
  config: any,
  targetZoneKey: string | undefined,
  doc: TecofDocument
): boolean => {
  // Root content has no parent component and therefore no maxItems cap.
  if (!targetZoneKey) return true;

  const { parentId, slotName } = parseZoneKey(targetZoneKey);
  const parentType = resolveNodeType(doc, parentId);
  if (!parentType) return true;

  const parentConfig = getComponentConfig(config, parentType);
  const max = resolveSlotValue<number>(parentConfig.maxItems, slotName);
  if (typeof max !== 'number') return true;

  const current = doc.zones[targetZoneKey]?.length ?? 0;
  return current < max;
};

/**
 * Convenience combinator: a drop is valid only if the type is accepted AND the
 * zone has room. Useful for canvas drop affordances.
 */
export const isValidDrop = (
  config: any,
  draggedType: string,
  targetZoneKey: string | undefined,
  doc: TecofDocument
): boolean =>
  canDropInto(config, draggedType, targetZoneKey, doc) &&
  canAcceptMoreItems(config, targetZoneKey, doc);

/** Resolves a node's `type` by id without building the full index. */
const resolveNodeType = (doc: TecofDocument, id: string): string | null => {
  for (const node of doc.content) {
    if (node.props.id === id) return node.type;
  }
  for (const items of Object.values(doc.zones)) {
    for (const node of items) {
      if (node.props.id === id) return node.type;
    }
  }
  return null;
};
