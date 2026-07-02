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
`;

export default ANIMATION_CSS;
