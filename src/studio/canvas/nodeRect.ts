/**
 * The measurable box for a node's element.
 *
 * Editor node wrappers (`.tecof-node` / `.tecof-node-wrapper`) are
 * `display: contents` so the rendered component lays out exactly like the
 * published page (no injected box, no forced full-width). A contents element
 * generates no box, so its own `getBoundingClientRect()` is empty — measure the
 * rendered component (the wrapper's single element child) instead.
 *
 * Inline components carry `data-tecof-id` on their own root (no wrapper), so
 * they are already the right element and measure directly.
 */
export const nodeContentRect = (el: Element): DOMRect => {
  const inner =
    el.classList.contains('tecof-node-wrapper') && el.firstElementChild
      ? el.firstElementChild
      : el;
  return inner.getBoundingClientRect();
};
