import type { TecofDocument, ItemSchemaField } from '../types';
import { findNodeById, parseZoneKey } from './zones';

/**
 * Repeat-zone scope of a node: the nearest ancestor slot declared with
 * `repeatSource` (or an explicit `itemSchema`). Fields of nodes inside that
 * template may bind to the repeat item via `{{ item.<key> }}` tokens.
 */
export interface RepeatScope {
  /** Node id of the component that owns the repeat slot. */
  ownerId: string;
  /** The slot (field) name the template lives in. */
  slotName: string;
  /** The prop the rows come from (`repeatSource`), if declared. */
  sourceProp: string | null;
  /** Current rows read from the owner's props (empty until data exists). */
  rows: any[];
  /** First row — the inference sample for the bindable item schema. */
  sample: any | null;
  /** Explicit `itemSchema` — the slot field's, else the SOURCE field's
   * (e.g. `createApiListField({ itemSchema })`). */
  itemSchema?: ItemSchemaField[];
  /** Raw value of the source prop (array / api-list params / CMS binding) —
   * lets callers peek async-resolved rows for schema inference. */
  sourceValue?: unknown;
  /** Field def of the source prop (carries `fetchList` for api-list fields). */
  sourceFieldDef?: Record<string, any>;
}

/** Minimal config shape needed to look up slot field declarations. */
interface ConfigLike {
  components?: Record<string, { fields?: Record<string, any> } | undefined>;
}

/**
 * Walks up from `nodeId` through its ancestor zones and returns the nearest
 * repeat scope, or `null` when the node is not inside a repeat template. Used
 * by the inspector to offer `{{ item.* }}` bindings for the right fields.
 */
export const findRepeatScope = (
  doc: TecofDocument,
  config: ConfigLike,
  nodeId: string
): RepeatScope | null => {
  let current = findNodeById(doc, nodeId);

  while (current?.path.zoneKey) {
    const { parentId, slotName } = parseZoneKey(current.path.zoneKey);
    const parent = findNodeById(doc, parentId);
    if (!parent) return null;

    const componentFields = config.components?.[parent.node.type]?.fields;
    const fieldDef = componentFields?.[slotName];
    if (fieldDef?.type === 'slot' && (fieldDef.repeatSource || fieldDef.itemSchema)) {
      const sourceValue = fieldDef.repeatSource
        ? parent.node.props[fieldDef.repeatSource]
        : undefined;
      const sourceFieldDef = fieldDef.repeatSource
        ? componentFields?.[fieldDef.repeatSource]
        : undefined;
      const list = Array.isArray(sourceValue) ? sourceValue : [];
      return {
        ownerId: parentId,
        slotName,
        sourceProp: fieldDef.repeatSource ?? null,
        rows: list,
        sample: list[0] ?? null,
        itemSchema: fieldDef.itemSchema ?? sourceFieldDef?.itemSchema,
        sourceValue,
        sourceFieldDef,
      };
    }

    current = parent;
  }

  return null;
};
