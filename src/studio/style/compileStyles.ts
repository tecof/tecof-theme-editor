import type { NodeStyles, StyleProps } from './types';
import { CONTROL_BY_ID, BP_PREFIX, STATE_PREFIX } from './tokens';

/** Emit prefixed classes for one style layer. */
function emit(props: StyleProps | undefined, prefix: string): string[] {
  if (!props) return [];
  const out: string[] = [];
  for (const [id, value] of Object.entries(props)) {
    if (!value) continue;
    const control = CONTROL_BY_ID[id];
    if (!control) continue;
    const cls = control.toClass(value);
    if (cls) out.push(prefix + cls);
  }
  return out;
}

/**
 * Compile a structured NodeStyles object into a Tailwind className string.
 * Because each property is a single keyed token, conflicting utilities can't
 * coexist within a layer — no `tailwind-merge` needed.
 *
 * Example:
 *   { base:{p:'4',bg:'primary-600'}, md:{p:'8'}, states:{hover:{bg:'primary-700'}} }
 *   → "p-4 bg-primary-600 md:p-8 hover:bg-primary-700"
 */
export function compileStyles(styles?: NodeStyles | null): string {
  if (!styles) return '';

  const classes: string[] = [
    ...emit(styles.base, BP_PREFIX.base),
    ...emit(styles.sm, BP_PREFIX.sm),
    ...emit(styles.md, BP_PREFIX.md),
    ...emit(styles.lg, BP_PREFIX.lg),
    ...emit(styles.xl, BP_PREFIX.xl),
  ];

  if (styles.states) {
    for (const [state, props] of Object.entries(styles.states)) {
      classes.push(...emit(props, STATE_PREFIX[state] || ''));
    }
  }

  return classes.join(' ');
}

/** Merge a compiled style className with any author-provided className. */
export function mergeClassName(authorClassName: string | undefined, styleClassName: string): string {
  return [authorClassName, styleClassName].filter(Boolean).join(' ').trim();
}
