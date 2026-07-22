/**
 * Declarative "when-then" interactions — a trigger + an action + a target,
 * stored on a node's props under `_interactions`. A tiny runtime
 * (`runtime.ts`) executes them on published pages and in the canvas preview, so
 * a static site gets behaviour (scroll-to, class toggles, show/hide panels)
 * without the host writing any code.
 */

export type InteractionTrigger = 'click' | 'hover';

export type InteractionAction =
  | 'scrollTo' // smooth-scroll the target into view
  | 'toggleClass' // toggle `className` on the target
  | 'show' // reveal the target (remove `.tecof-fx-hidden`)
  | 'hide' // hide the target
  | 'toggle'; // flip the target's visibility

export interface Interaction {
  /** Stable row id — React key + one undo step per edit. */
  id: string;
  trigger: InteractionTrigger;
  action: InteractionAction;
  /**
   * Target: another node's id, `'self'` (the source element, the default when
   * empty), or `'top'` (page top — `scrollTo` only).
   */
  target?: string;
  /** Class name toggled by the `toggleClass` action. */
  className?: string;
}

/** Node-prop keys carrying interaction data. */
export const INTERACTIONS_PROP = '_interactions';
/** When true, the node renders hidden at runtime until an action reveals it. */
export const START_HIDDEN_PROP = '_startHidden';

/** Page-level `sourceNodeId → interactions` map handed to the runtime. */
export type InteractionRegistry = Record<string, Interaction[]>;
