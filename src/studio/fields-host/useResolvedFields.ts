import { useEffect, useRef, useState } from 'react';
import type { ComponentConfig, FieldConfig, TecofNode } from '../../types';
import { useEditorStore } from '../../engine/store';
import { computeChanged, diffProps } from './resolve';

export interface ResolvedFields {
  /** Effective field set to render (static, or computed by `resolveFields`). */
  fields: Record<string, FieldConfig>;
  /** Field names dynamically disabled by `resolveData().readOnly`. */
  readOnly: Record<string, boolean>;
}

const EMPTY_READONLY: Record<string, boolean> = {};

/**
 * Resolves a node's dynamic fields + read-only map for the inspector.
 *
 * - Components WITHOUT `resolveFields`/`resolveData` return their static fields
 *   synchronously (no state churn, no async).
 * - Otherwise resolvers run in an effect (sync or Promise-returning). A monotonic
 *   request id drops stale async results, and the result is keyed by node id so
 *   switching selection never shows another node's resolved fields.
 * - `resolveData().props` are DERIVED values written back via `updateProps`, but
 *   only the real diff (loop guard) — so an idempotent resolver converges after
 *   one write instead of looping.
 *
 * Resolver errors degrade gracefully to the static fields (never crash the panel).
 */
export const useResolvedFields = (
  node: TecofNode | null,
  componentConfig: ComponentConfig | undefined
): ResolvedFields => {
  const updateProps = useEditorStore((s) => s.updateProps);

  const staticFields = componentConfig?.fields ?? {};
  const hasResolveFields = typeof componentConfig?.resolveFields === 'function';
  const hasResolveData = typeof componentConfig?.resolveData === 'function';
  const dynamic = hasResolveFields || hasResolveData;

  const nodeId = node?.props.id ?? null;
  // Stable dependency for prop changes without re-running on unrelated renders.
  const propsKey = node ? JSON.stringify(node.props) : '';

  // Result keyed by node id: until the effect resolves the CURRENT node we fall
  // back to its static fields, so a previous node's result never leaks through.
  const [state, setState] = useState<{ id: string | null } & ResolvedFields>({
    id: null,
    fields: staticFields,
    readOnly: EMPTY_READONLY,
  });

  const lastPropsRef = useRef<Record<string, any> | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (!node || !dynamic) {
      lastPropsRef.current = node?.props ?? null;
      return;
    }

    const reqId = ++reqIdRef.current;
    let cancelled = false;
    const prev = lastPropsRef.current;
    const ctx = { changed: computeChanged(prev, node.props), lastProps: prev };

    const commit = (fields: Record<string, FieldConfig>, readOnly: Record<string, boolean>) => {
      if (cancelled || reqId !== reqIdRef.current) return;
      setState({ id: node.props.id, fields, readOnly });
    };

    const runData = (fields: Record<string, FieldConfig>) => {
      if (!hasResolveData) {
        commit(fields, EMPTY_READONLY);
        return;
      }
      Promise.resolve(componentConfig!.resolveData!(node.props, ctx))
        .then((res) => {
          if (cancelled || reqId !== reqIdRef.current) return;
          // Derived props: write back only the genuine diff (loop-guarded).
          if (res?.props) {
            const d = diffProps(node.props, res.props);
            if (Object.keys(d).length > 0) updateProps(node.props.id, d);
          }
          commit(fields, res?.readOnly ?? EMPTY_READONLY);
        })
        .catch(() => commit(fields, EMPTY_READONLY));
    };

    if (hasResolveFields) {
      Promise.resolve(
        componentConfig!.resolveFields!(node.props, { ...ctx, fields: staticFields })
      )
        .then((f) => runData(f ?? staticFields))
        .catch(() => runData(staticFields));
    } else {
      runData(staticFields);
    }

    lastPropsRef.current = node.props;
    return () => {
      cancelled = true;
    };
    // `propsKey` captures prop changes; other deps are identity-stable per node.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId, propsKey, dynamic, hasResolveFields, hasResolveData]);

  // Non-dynamic components (the common case) always render static fields.
  if (!dynamic) {
    return { fields: staticFields, readOnly: EMPTY_READONLY };
  }
  // Dynamic: use the resolved result only once it matches the current node.
  return state.id === nodeId
    ? { fields: state.fields, readOnly: state.readOnly }
    : { fields: staticFields, readOnly: EMPTY_READONLY };
};
