/**
 * Runtime for the scroll interaction style controls (`reveal` / `parallax`,
 * see tokens.ts). Pure DOM, framework-agnostic and iframe-safe:
 *
 *   - **Reveal**: elements marked `.tecof-reveal[-dir]` start hidden (CSS, gated
 *     on `html.tecof-has-js`) and get `.is-visible` when they scroll into view,
 *     via an IntersectionObserver created in the TARGET document's window.
 *   - **Parallax**: elements marked `.tecof-parallax[-speed]` are translated on
 *     scroll, throttled to one transform write per frame.
 *
 * Used in two places:
 *   - `TecofRender` runs it on the published page (client effect).
 *   - the editor canvas runs it inside the iframe ONLY in preview mode, so
 *     edit mode never hides content (no `tecof-has-js` → CSS keeps it visible).
 *
 * `initScrollEffects` returns a handle: `refresh()` re-scans after DOM changes,
 * `destroy()` fully unwinds (and clears the has-js gate so reveal content shows).
 */

export interface ScrollEffectsHandle {
  /** Re-scan for newly added reveal/parallax elements. */
  refresh(): void;
  /** Tear everything down and restore the untouched (fully visible) state. */
  destroy(): void;
}

const PARALLAX_SPEED: Record<string, number> = { slow: 0.08, md: 0.16, fast: 0.28 };

const parallaxSpeed = (el: Element): number => {
  if (el.classList.contains('tecof-parallax-fast')) return PARALLAX_SPEED.fast;
  if (el.classList.contains('tecof-parallax-slow')) return PARALLAX_SPEED.slow;
  return PARALLAX_SPEED.md;
};

const NOOP: ScrollEffectsHandle = { refresh() {}, destroy() {} };

export function initScrollEffects(root: Document | null | undefined): ScrollEffectsHandle {
  const win = root?.defaultView;
  if (!root || !win) return NOOP;

  const reduceMotion = win.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  // The has-js gate is what activates the reveal CSS (hidden initial state). With
  // reduced motion we still add it, but the CSS media query keeps content visible.
  root.documentElement.classList.add('tecof-has-js');

  // ── Reveal: one-shot intersection ──
  // Observer must live in the TARGET window so its root viewport is the iframe's,
  // not the parent document's.
  const io = new win.IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
  );

  const observeReveals = () => {
    root.querySelectorAll('.tecof-reveal:not(.is-visible)').forEach((el) => io.observe(el));
  };

  // ── Parallax: transform on scroll, one write per frame ──
  let parallaxEls: HTMLElement[] = [];
  const collectParallax = () => {
    parallaxEls = Array.from(root.querySelectorAll<HTMLElement>('.tecof-parallax'));
  };

  let raf = 0;
  const applyParallax = () => {
    raf = 0;
    const vh = win.innerHeight || 0;
    for (const el of parallaxEls) {
      const rect = el.getBoundingClientRect();
      // Distance of the element's centre from the viewport centre, scaled down.
      const fromCentre = rect.top + rect.height / 2 - vh / 2;
      const offset = -fromCentre * parallaxSpeed(el);
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    }
  };
  const scheduleParallax = () => {
    if (parallaxEls.length === 0 || raf) return;
    raf = win.requestAnimationFrame(applyParallax);
  };

  observeReveals();
  if (!reduceMotion) {
    collectParallax();
    win.addEventListener('scroll', scheduleParallax, { passive: true });
    win.addEventListener('resize', scheduleParallax);
    scheduleParallax();
  }

  // Catch nodes added after init (published hydration, live editor preview).
  let moRaf = 0;
  const mo = new win.MutationObserver(() => {
    if (moRaf) return;
    moRaf = win.requestAnimationFrame(() => {
      moRaf = 0;
      observeReveals();
      if (!reduceMotion) {
        collectParallax();
        scheduleParallax();
      }
    });
  });
  if (root.body) mo.observe(root.body, { childList: true, subtree: true });

  return {
    refresh() {
      observeReveals();
      if (!reduceMotion) {
        collectParallax();
        scheduleParallax();
      }
    },
    destroy() {
      io.disconnect();
      mo.disconnect();
      if (raf) win.cancelAnimationFrame(raf);
      if (moRaf) win.cancelAnimationFrame(moRaf);
      win.removeEventListener('scroll', scheduleParallax);
      win.removeEventListener('resize', scheduleParallax);
      // Restore the pristine look: clear parallax transforms + drop the gate so
      // any not-yet-revealed content becomes visible again (edit mode).
      for (const el of parallaxEls) el.style.transform = '';
      root.documentElement.classList.remove('tecof-has-js');
    },
  };
}
