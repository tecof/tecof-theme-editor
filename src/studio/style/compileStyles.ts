import type { NodeStyles, StyleProps } from './types';
import { STYLES_PROP } from './types';
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
    for (const [key, props] of Object.entries(styles.states)) {
      // Keys are either a bare state (`hover`) or `${breakpoint}:${state}`
      // (`md:hover`). The breakpoint prefix comes first so the emitted class is
      // `md:hover:bg-...` (Tailwind's required variant order).
      const [a, b] = key.split(':');
      const bp = b ? a : 'base';
      const state = b ? b : a;
      const prefix = (BP_PREFIX[bp] || '') + (STATE_PREFIX[state] || '');
      classes.push(...emit(props, prefix));
    }
  }

  return classes.join(' ');
}

/** Merge a compiled style className with any author-provided className. */
export function mergeClassName(authorClassName: string | undefined, styleClassName: string): string {
  return [authorClassName, styleClassName].filter(Boolean).join(' ').trim();
}

/**
 * Every Tailwind class a single NodeStyles object compiles to — presets AND
 * arbitrary (custom) values. Use this to enumerate the exact classes a saved
 * node relies on.
 */
export function collectStyleClasses(styles?: NodeStyles | null): string[] {
  const compiled = compileStyles(styles);
  return compiled ? compiled.split(' ') : [];
}

/** Minimal document shape consumed by {@link collectDocumentClasses}. */
interface StyledDocLike {
  root?: { props?: Record<string, any> };
  content?: Array<{ props?: Record<string, any> }>;
  zones?: Record<string, Array<{ props?: Record<string, any> }>>;
}

/**
 * Walks a Tecof document (root + content + every zone) and returns the
 * de-duplicated set of all style classes used by any node.
 *
 * Why this exists: `getSafelist()` only covers the editor's *preset* options, so
 * arbitrary values such as `p-[10px]` / `bg-[#ff0000]` — which live inside the
 * saved JSON and are invisible to Tailwind's content scanner — would otherwise
 * never get CSS generated in production. Run this over your saved pages at build
 * time (or persist its output beside each page) and feed the result into the
 * Tailwind `safelist` so those classes always exist in the published stylesheet.
 */
export function collectDocumentClasses(doc?: StyledDocLike | null): string[] {
  if (!doc) return [];
  const set = new Set<string>();
  const visit = (props?: Record<string, any>) => {
    const styles = props?.[STYLES_PROP] as NodeStyles | undefined;
    if (styles) for (const cls of collectStyleClasses(styles)) set.add(cls);
  };
  visit(doc.root?.props);
  for (const node of doc.content ?? []) visit(node.props);
  for (const items of Object.values(doc.zones ?? {})) {
    for (const node of items) visit(node.props);
  }
  return Array.from(set);
}
