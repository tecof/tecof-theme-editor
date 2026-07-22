/**
 * Runtime for declarative "when-then" interactions (see types.ts). Pure DOM,
 * framework-agnostic and iframe-safe — mirrors scrollEffects.ts:
 *
 *   - Events are DELEGATED on the root document (so late-added nodes just work,
 *     no re-scan needed).
 *   - A source element is any `.tecof-fx`; its node id comes from the
 *     `tecof-node-<id>` marker class; its interactions from the registry.
 *   - Targets resolve to `.tecof-node-<targetId>` (or the source itself for
 *     `self`, or the window for `top`).
 *
 * The branching policy (what a trigger+action does on click vs. hover-enter vs.
 * hover-leave) lives in the pure {@link planInteraction} so it is unit-testable
 * without a DOM; this file is only the thin DOM shell that applies the plan.
 *
 * Used in two places, exactly like scrollEffects:
 *   - `TecofRender` runs it on the published page (reads the registry `<script>`).
 *   - the editor canvas runs it inside the iframe ONLY in preview mode (passing
 *     the registry directly), so edit-mode clicks keep selecting nodes.
 */

import type { Interaction, InteractionRegistry } from './types';

export interface InteractionsHandle {
  /** No-op: delegation already covers late-added nodes. Kept for API parity. */
  refresh(): void;
  /** Detach all listeners. */
  destroy(): void;
}

/** What a resolved interaction does to its target element (DOM-agnostic). */
export type InteractionOp =
  | { op: 'scroll' }
  | { op: 'toggleClass'; className: string }
  | { op: 'setClass'; className: string; on: boolean }
  | { op: 'setHidden'; hidden: boolean }
  | { op: 'toggleHidden' };

export type InteractionPhase = 'click' | 'enter' | 'leave';

/**
 * Pure policy: resolve one interaction into the operation to apply for a given
 * phase. `click` is one-shot (toggles flip state); `enter`/`leave` implement the
 * transient "while hovering" semantics (enter applies, leave restores).
 * Returns null when the interaction does nothing for that phase.
 */
export function planInteraction(it: Interaction, phase: InteractionPhase): InteractionOp | null {
  if (it.action === 'scrollTo') return phase === 'leave' ? null : { op: 'scroll' };

  if (phase === 'click') {
    switch (it.action) {
      case 'toggleClass':
        return it.className ? { op: 'toggleClass', className: it.className } : null;
      case 'show':
        return { op: 'setHidden', hidden: false };
      case 'hide':
        return { op: 'setHidden', hidden: true };
      case 'toggle':
        return { op: 'toggleHidden' };
      default:
        return null;
    }
  }

  // Hover: enter applies, leave restores.
  const entering = phase === 'enter';
  switch (it.action) {
    case 'toggleClass':
      return it.className ? { op: 'setClass', className: it.className, on: entering } : null;
    case 'show':
    case 'toggle':
      return { op: 'setHidden', hidden: !entering }; // show on enter, hide on leave
    case 'hide':
      return { op: 'setHidden', hidden: entering }; // hide on enter, show on leave
    default:
      return null;
  }
}

const NOOP: InteractionsHandle = { refresh() {}, destroy() {} };
const HIDDEN = 'tecof-fx-hidden';
const NODE_PREFIX = 'tecof-node-';

/** Read the registry from the `<script>` TecofRender emits. */
const readRegistry = (root: Document): InteractionRegistry => {
  const el = root.querySelector('script[data-tecof-interactions]');
  if (!el?.textContent) return {};
  try {
    const parsed = JSON.parse(el.textContent);
    return parsed && typeof parsed === 'object' ? (parsed as InteractionRegistry) : {};
  } catch {
    return {};
  }
};

/** The node id encoded in the element's `tecof-node-<id>` marker class. */
const sourceId = (el: Element): string | null => {
  for (const cls of Array.from(el.classList)) {
    if (cls.startsWith(NODE_PREFIX)) return cls.slice(NODE_PREFIX.length);
  }
  return null;
};

export function initInteractions(
  root: Document | null | undefined,
  registry?: InteractionRegistry
): InteractionsHandle {
  const win = root?.defaultView;
  if (!root || !win) return NOOP;

  const reg = registry ?? readRegistry(root);
  if (Object.keys(reg).length === 0) return NOOP;

  const reduceMotion = win.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const behavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth';
  const escape = (s: string): string =>
    (win as unknown as { CSS?: { escape?: (v: string) => string } }).CSS?.escape?.(s) ?? s;

  const resolveTarget = (source: Element, target?: string): Element | null => {
    if (!target || target === 'self') return source;
    if (target === 'top') return null; // window scroll, handled below
    return root.querySelector(`.${escape(NODE_PREFIX + target)}`);
  };

  const apply = (source: Element, it: Interaction, phase: InteractionPhase) => {
    const plan = planInteraction(it, phase);
    if (!plan) return;
    if (plan.op === 'scroll') {
      if (it.target === 'top') win.scrollTo({ top: 0, behavior });
      else resolveTarget(source, it.target)?.scrollIntoView({ behavior, block: 'start' });
      return;
    }
    const el = resolveTarget(source, it.target);
    if (!el) return;
    switch (plan.op) {
      case 'toggleClass':
        el.classList.toggle(plan.className);
        break;
      case 'setClass':
        el.classList.toggle(plan.className, plan.on);
        break;
      case 'setHidden':
        el.classList.toggle(HIDDEN, plan.hidden);
        break;
      case 'toggleHidden':
        el.classList.toggle(HIDDEN);
        break;
    }
  };

  const hitFor = (target: EventTarget | null): { source: Element; list: Interaction[] } | null => {
    const source = (target as Element | null)?.closest?.('.tecof-fx');
    if (!source) return null;
    const id = sourceId(source);
    const list = id ? reg[id] : null;
    return list && list.length ? { source, list } : null;
  };

  const onClick = (e: Event) => {
    const hit = hitFor(e.target);
    if (!hit) return;
    for (const it of hit.list) if (it.trigger === 'click') apply(hit.source, it, 'click');
  };

  // pointerover/out bubble; the relatedTarget guard turns them into
  // mouseenter/leave semantics so hover fires once per source boundary crossing.
  const onHover = (phase: 'enter' | 'leave') => (e: Event) => {
    const pe = e as PointerEvent;
    const hit = hitFor(pe.target);
    if (!hit) return;
    const related = pe.relatedTarget as Node | null;
    if (related && hit.source.contains(related)) return; // still within the same source
    for (const it of hit.list) if (it.trigger === 'hover') apply(hit.source, it, phase);
  };
  const onOver = onHover('enter');
  const onOut = onHover('leave');

  root.addEventListener('click', onClick);
  root.addEventListener('pointerover', onOver);
  root.addEventListener('pointerout', onOut);

  return {
    refresh() {},
    destroy() {
      root.removeEventListener('click', onClick);
      root.removeEventListener('pointerover', onOver);
      root.removeEventListener('pointerout', onOut);
    },
  };
}
