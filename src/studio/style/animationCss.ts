/**
 * Entrance-animation CSS for the `anim` / `animDelay` style controls (tokens.ts).
 *
 * Consumed in two places:
 *   - `TecofRender` injects it into published pages via a
 *     `<style data-tecof-animations>` tag (ThemeVars-style injection).
 *   - The editor canvas gets the SAME rules from the
 *     "Entrance animations (style control)" section at the end of
 *     `src/styles.css` — keep both copies in sync when editing.
 */
export const ANIMATION_CSS = `@media (prefers-reduced-motion: reduce) {
  .tecof-anim-fade,
  .tecof-anim-fade-up,
  .tecof-anim-fade-down,
  .tecof-anim-zoom-in {
    animation: none;
  }
}

@keyframes tecof-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes tecof-fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes tecof-fade-down {
  from { opacity: 0; transform: translateY(-24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes tecof-zoom-in {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

.tecof-anim-fade { animation: tecof-fade 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
.tecof-anim-fade-up { animation: tecof-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
.tecof-anim-fade-down { animation: tecof-fade-down 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
.tecof-anim-zoom-in { animation: tecof-zoom-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }

.tecof-anim-delay-100 { animation-delay: 100ms; }
.tecof-anim-delay-200 { animation-delay: 200ms; }
.tecof-anim-delay-300 { animation-delay: 300ms; }
.tecof-anim-delay-500 { animation-delay: 500ms; }

/* ── Scroll reveal (scrollEffects.ts adds .is-visible on intersect) ──
   Hidden initial state is gated on html.tecof-has-js so no-JS / pre-hydration
   pages keep content visible (progressive enhancement). */
.tecof-reveal {
  transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
html.tecof-has-js .tecof-reveal:not(.is-visible) { opacity: 0; }
html.tecof-has-js .tecof-reveal-up:not(.is-visible) { transform: translateY(28px); }
html.tecof-has-js .tecof-reveal-down:not(.is-visible) { transform: translateY(-28px); }
html.tecof-has-js .tecof-reveal-left:not(.is-visible) { transform: translateX(28px); }
html.tecof-has-js .tecof-reveal-right:not(.is-visible) { transform: translateX(-28px); }
html.tecof-has-js .tecof-reveal-zoom:not(.is-visible) { transform: scale(0.92); }
.tecof-reveal.is-visible { opacity: 1; transform: none; }

.tecof-parallax { will-change: transform; }

@media (prefers-reduced-motion: reduce) {
  .tecof-reveal { transition: none; }
  html.tecof-has-js .tecof-reveal:not(.is-visible) { opacity: 1; transform: none; }
  .tecof-parallax { transform: none !important; }
}
`;

export default ANIMATION_CSS;
