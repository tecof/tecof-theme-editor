import { useEditorStore } from '../engine/store';
import { findNodeById } from '../engine/zones';
import { getNodePermissions, DEFAULT_PERMISSIONS } from '../engine/permissions';
import { useStudio } from './context';
import type { Permissions } from '../types';

/**
 * Resolves the effective permissions for a node id, reactive to the document +
 * config. Returns the permissive default when nothing is selected / found.
 *
 * UI-only: this drives whether affordances (delete/duplicate/drag buttons, drag
 * handles) are shown or disabled. The engine store (`permissionResolver`) is the
 * authoritative gate — this hook just avoids presenting dead controls.
 */
export const usePermissions = (id: string | null | undefined): Permissions => {
  const { config } = useStudio();
  const node = useEditorStore((state) =>
    id ? findNodeById(state.document, id)?.node ?? null : null
  );
  if (!node) return DEFAULT_PERMISSIONS;
  return getNodePermissions(config, node);
};
