import { deepEqual } from '../../utils';

/**
 * Pure helpers backing the dynamic-fields hook. Kept separate from React so the
 * change-tracking and loop-guard logic can be unit-tested in isolation.
 */

/**
 * Builds the `changed` map passed to resolvers: for every key present in either
 * snapshot, whether its value differs. On the first run (`prev == null`) every
 * key in `next` is reported as changed.
 */
export const computeChanged = (
  prev: Record<string, any> | null | undefined,
  next: Record<string, any>
): Record<string, boolean> => {
  const changed: Record<string, boolean> = {};
  const keys = new Set([...Object.keys(prev ?? {}), ...Object.keys(next ?? {})]);
  for (const key of keys) {
    changed[key] = !deepEqual(prev?.[key], next?.[key]);
  }
  return changed;
};

/**
 * Returns only the resolved props that actually differ from the current props.
 * This is the loop guard for `resolveData`: writing back an empty diff makes the
 * derive→write→re-derive cycle converge (given an idempotent resolver).
 */
export const diffProps = (
  current: Record<string, any>,
  resolved: Record<string, any>
): Record<string, any> => {
  const diff: Record<string, any> = {};
  for (const key of Object.keys(resolved)) {
    if (!deepEqual(current?.[key], resolved[key])) {
      diff[key] = resolved[key];
    }
  }
  return diff;
};
