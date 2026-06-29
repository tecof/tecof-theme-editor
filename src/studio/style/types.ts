/**
 * Structured, token-based style model for the Tailwind v4 visual style editor.
 *
 * We store *style intent* (which token is chosen per property) rather than raw
 * class strings. This keeps the UI drivable (we can show the current value),
 * makes responsive + state variants first-class, and — because every property
 * maps to a finite token set — lets us generate a complete Tailwind safelist for
 * production. The shape round-trips losslessly inside `node.props._tecofStyles`.
 */

/** Responsive breakpoints. `base` = no prefix; others map to Tailwind `sm:`…`xl:`. */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';

/** Interaction states → Tailwind `hover:` / `focus:` / `active:`. */
export type StateVariant = 'hover' | 'focus' | 'active';

/**
 * One layer of style values, keyed by control id (see STYLE_CONTROLS).
 * Value is the *token* (e.g. `'4'`, `'primary-600'`, `'lg'`), not the class.
 */
export type StyleProps = Record<string, string | undefined>;

/** Full style object stored on a node. */
export interface NodeStyles {
  base?: StyleProps;
  sm?: StyleProps;
  md?: StyleProps;
  lg?: StyleProps;
  xl?: StyleProps;
  states?: Partial<Record<StateVariant, StyleProps>>;
}

/** The prop key under which a node's structured styles live. */
export const STYLES_PROP = '_tecofStyles';
