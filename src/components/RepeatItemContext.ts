import { createContext, useContext } from 'react';

/**
 * The current data row of a repeat zone. Provided once per row around the
 * template's rendered children — by TecofRender on publish, and by the studio
 * canvas (first row editable, remaining rows as ghost previews).
 */
export interface RepeatItemInfo {
  /** The row object `{{ item.* }}` tokens resolve against. */
  item: any;
  /** 0-based row index. */
  index: number;
  /** Total row count of the repeat. */
  count: number;
}

export const RepeatItemContext = createContext<RepeatItemInfo | null>(null);

/**
 * Read the current repeat row from inside a component rendered in a repeat-zone
 * template — for logic the `{{ item.* }}` prop tokens can't express (e.g.
 * conditional badges, add-to-cart handlers needing the row id). Returns `null`
 * outside a repeat template.
 */
export const useRepeatItem = (): RepeatItemInfo | null => useContext(RepeatItemContext);
