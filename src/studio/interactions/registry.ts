import type { Interaction, InteractionRegistry } from './types';
import { INTERACTIONS_PROP, START_HIDDEN_PROP } from './types';

/** Minimal document shape the walkers need (mirrors compileStyles' StyledDocLike). */
interface InteractiveDocLike {
  content?: Array<{ props?: Record<string, unknown> }>;
  zones?: Record<string, Array<{ props?: Record<string, unknown> }>>;
}

/** Keep only well-formed interaction rows (defends the runtime + published JSON). */
export const validInteractions = (value: unknown): Interaction[] =>
  Array.isArray(value)
    ? (value.filter(
        (it): it is Interaction =>
          !!it && typeof it === 'object' && 'trigger' in it && 'action' in it
      ) as Interaction[])
    : [];

/**
 * Walk a document (content + every zone) and collect `{ [nodeId]: interactions }`
 * for the runtime. TecofRender serialises this into a `<script>` tag; the editor
 * canvas passes it to the runtime directly.
 */
export function collectInteractionRegistry(doc?: InteractiveDocLike | null): InteractionRegistry {
  const registry: InteractionRegistry = {};
  if (!doc) return registry;
  const visit = (props?: Record<string, unknown>) => {
    const id = props?.id;
    if (typeof id !== 'string' || !id) return;
    const list = validInteractions(props?.[INTERACTIONS_PROP]);
    if (list.length) registry[id] = list;
  };
  for (const node of doc.content ?? []) visit(node.props);
  for (const items of Object.values(doc.zones ?? {})) for (const node of items) visit(node.props);
  return registry;
}

/**
 * Marker classes appended to a node's className so the interaction runtime can
 * locate it. This rides the SAME `className` channel the style system uses — the
 * only per-node hook that exists on published pages (which, unlike the editor
 * canvas, have no `data-tecof-id` wrapper). So the exact same markers work in
 * both places:
 *   - every node → `tecof-node-<id>` (stable anchor for target lookup + source id),
 *   - interaction sources → `tecof-fx` (event-delegation marker),
 *   - `_startHidden` nodes → `tecof-fx-hidden` at runtime, or `tecof-fx-starthidden`
 *     in edit mode so they stay visible + editable.
 */
export function interactionNodeClasses(
  props: Record<string, unknown> | undefined,
  opts: { editing: boolean }
): string {
  if (!props) return '';
  const out: string[] = [];
  const id = props.id;
  if (typeof id === 'string' && id) out.push(`tecof-node-${id}`);
  if (validInteractions(props[INTERACTIONS_PROP]).length) out.push('tecof-fx');
  if (props[START_HIDDEN_PROP]) out.push(opts.editing ? 'tecof-fx-starthidden' : 'tecof-fx-hidden');
  return out.join(' ');
}
