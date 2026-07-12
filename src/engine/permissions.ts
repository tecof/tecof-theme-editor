import type { Permissions, StudioConfig, TecofNode } from '../types';

/**
 * Every permission is granted by default; hosts opt into restrictions by setting
 * a flag to `false` (globally, per component, or dynamically).
 */
export const DEFAULT_PERMISSIONS: Permissions = {
  drag: true,
  delete: true,
  duplicate: true,
  edit: true,
};

/**
 * Resolves the effective permissions for a node.
 *
 * Merge order (later wins):
 *   DEFAULT_PERMISSIONS < config.permissions (global) < component.permissions
 *   < component.resolvePermissions(props).
 *
 * Any layer may omit keys; omissions fall through to the layer beneath, so the
 * result is always a fully-populated `Permissions` object. Permissive by design:
 * a missing OR throwing resolver never tightens permissions.
 */
export const getNodePermissions = (
  config: StudioConfig | undefined,
  node: TecofNode
): Permissions => {
  const global = (config?.permissions ?? {}) as Partial<Permissions>;
  const comp = (config?.components?.[node.type] ?? {}) as {
    permissions?: Partial<Permissions>;
    resolvePermissions?: (
      props: any,
      ctx: { changed: Record<string, boolean>; lastProps: null }
    ) => Partial<Permissions>;
  };

  // `Partial<Permissions>` values are `boolean | undefined`; absent keys are not
  // spread, so the assertion is safe. A stray `undefined` reads as permissive
  // everywhere via the `!== false` checks, matching the permissive-by-default rule.
  let merged = {
    ...DEFAULT_PERMISSIONS,
    ...global,
    ...(comp.permissions ?? {}),
  } as Permissions;

  if (typeof comp.resolvePermissions === 'function') {
    try {
      const dynamic =
        comp.resolvePermissions(node.props, { changed: {}, lastProps: null }) ?? {};
      merged = { ...merged, ...dynamic } as Permissions;
    } catch {
      // A throwing resolver must neither crash the editor nor silently tighten
      // permissions — keep the static merge computed above.
    }
  }

  // A per-instance lock (`_locked`, toggled from the Layers panel) overrides
  // everything: the node can't be dragged, deleted, duplicated or edited. It
  // stays *selectable* on purpose — that's how the user reaches the unlock
  // toggle (and `updateProps` isn't permission-gated, so unlocking works).
  if (node.props?._locked) {
    merged = { ...merged, drag: false, delete: false, duplicate: false, edit: false };
  }

  return merged;
};
