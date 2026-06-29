/**
 * Module-level clipboard for copy/paste of whole style objects between nodes.
 *
 * Lives outside React state on purpose: the StyleEditor unmounts/remounts as the
 * selection changes (Inspector keys it per node), so a component-local clipboard
 * would be wiped on every selection switch. A tiny pub/sub store survives that
 * and lets the "Yapıştır" button reactively enable once something is copied.
 */
import { useSyncExternalStore } from 'react';
import type { NodeStyles } from './types';

let clipboard: NodeStyles | null = null;
const listeners = new Set<() => void>();

const emit = () => {
  for (const fn of listeners) fn();
};

/** Store a deep-ish copy of the styles so later edits to the source don't mutate the buffer. */
export const copyStyles = (styles: NodeStyles | undefined) => {
  clipboard = styles ? structuredClone(styles) : null;
  emit();
};

/** Read the buffered styles (fresh clone each call so callers can't mutate the buffer). */
export const readStyles = (): NodeStyles | null =>
  clipboard ? structuredClone(clipboard) : null;

export const hasStyles = (): boolean => clipboard != null;

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

/** React hook: re-renders when the clipboard fills/empties. */
export const useHasClipboardStyles = (): boolean =>
  useSyncExternalStore(subscribe, hasStyles, hasStyles);
