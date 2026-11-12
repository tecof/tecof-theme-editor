/* ─── Host Bridge ───
 *
 * Centralizes all communication from the editor (running inside an iframe)
 * to its host wrapper via `window.parent.postMessage`. The wire protocol is
 * Puck-compatible: message types are prefixed `puck:` (e.g. `puck:save`,
 * `puck:changed`) and this prefix MUST stay stable for host backward-compat.
 *
 * Security: instead of always posting to the wildcard origin `'*'`, the host
 * can configure a specific target origin via the `hostOrigin` prop on
 * <TecofStudio>. `configureBridge` is called once on mount to set it. When no
 * origin is configured we fall back to `'*'` so existing embeds keep working.
 *
 * Other files that talk to the host (e.g. NodeRenderer.tsx → `puck:itemSelected`,
 * Frame.tsx → `puck:itemDeselected`) should adopt `postToHost` here so the
 * configured origin is applied consistently. They are owned by other modules
 * and not migrated yet.
 */

/** Module-level config, set once from TecofStudio on mount. */
let configuredOrigin: string | undefined;

/**
 * Set the target origin used for all host messages. Pass `undefined` (or omit
 * the `hostOrigin` prop) to keep the backward-compatible wildcard behavior.
 */
export const configureBridge = (origin?: string): void => {
  configuredOrigin = origin;
};

/** Read the currently configured target origin (`undefined` => wildcard). */
export const getHostOrigin = (): string | undefined => configuredOrigin;

/**
 * Identity of the page this editor instance is editing. When set, it is merged
 * into EVERY host message as `pageId`.
 *
 * Why: the host panel embeds the editor cross-origin, so it cannot read which
 * document the iframe is showing. If the frame and the host ever disagree (the
 * frame went back in history, an in-frame navigation, a stale frame after a
 * page switch) the host would mark the WRONG page as saved / publish a page
 * that was not the one edited. With the id in every message the host can
 * detect the mismatch and re-mount the frame instead. Hosts that ignore the
 * field keep working unchanged.
 */
let hostPageId: string | undefined;

/** Set (or clear with `undefined`) the page id announced to the host. */
export const setBridgePageId = (pageId?: string | null): void => {
  hostPageId = pageId ? String(pageId) : undefined;
};

/** Read the page id currently announced to the host (`undefined` => none). */
export const getBridgePageId = (): string | undefined => hostPageId;

/**
 * Validate the origin of an INCOMING host message against the configured
 * origin. Returns `true` when no origin is configured (or it's the wildcard
 * `'*'`), preserving backward-compatible "accept anything" behavior, and
 * otherwise only when `origin` matches the configured value exactly.
 *
 * Use this on the receive side (the `message` event handler) to drop messages
 * from untrusted origins when a `hostOrigin` is locked in.
 */
export const isAllowedOrigin = (origin: string): boolean => {
  if (configuredOrigin === undefined || configuredOrigin === '*') return true;
  return origin === configuredOrigin;
};

/**
 * True when the editor is running inside an iframe (i.e. there is a distinct
 * parent window to message). Safe to call during SSR.
 */
export const isEmbedded = (): boolean =>
  typeof window !== 'undefined' && window.parent !== window;

/**
 * Post a Puck-compatible message to the host window.
 *
 * @param type    Message type, e.g. `puck:changed` (keep the `puck:` prefix).
 * @param payload Optional extra fields merged alongside `{ type }`.
 * @param origin  Optional per-call origin override; defaults to the configured
 *                origin, then to `'*'` when nothing is configured.
 *
 * No-ops when not embedded, so callers don't need to guard separately.
 */
export const postToHost = (
  type: string,
  payload?: Record<string, unknown>,
  origin?: string
): void => {
  if (!isEmbedded()) return;
  const targetOrigin = origin ?? configuredOrigin ?? '*';
  window.parent.postMessage(
    { type, ...(hostPageId ? { pageId: hostPageId } : {}), ...(payload ?? {}) },
    targetOrigin
  );
};
