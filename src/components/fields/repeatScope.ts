import { createContext, useContext } from 'react';
import type { ItemSchemaField } from '../../types';

/**
 * Bindable item fields of the repeat template the SELECTED node lives in.
 * Provided by the studio Inspector (computed via `findRepeatScope`); consumed by
 * the `{ }` binding popover to offer `{{ item.<key> }}` tokens next to the CMS
 * collections. `null` when the selected node is not inside a repeat template.
 */
export interface RepeatScopeInfo {
  schema: ItemSchemaField[];
}

export const RepeatScopeContext = createContext<RepeatScopeInfo | null>(null);

export const useRepeatScope = (): RepeatScopeInfo | null => useContext(RepeatScopeContext);
