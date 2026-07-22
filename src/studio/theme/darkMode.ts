/**
 * Runtime for developer-toggleable dark mode. Pure DOM, framework-agnostic and
 * iframe-safe — mirrors scrollEffects.ts / interactions/runtime.ts.
 *
 * Strategy: a `.dark` class on the document's `<html>` swaps the
 * `--theme-color-*` variable VALUES (emitted by `generateCSSVariables` under a
 * `:root.dark {}` block). Page content keeps its exact Tailwind classes
 * (`bg-[var(--theme-color-primary)]`), so there is no `dark:` utility variant and
 * NOTHING is added to the host's Tailwind safelist.
 *
 *   - Initial scheme: a stored visitor choice (localStorage) wins; otherwise the
 *     configured `defaultMode` — `'system'` follows `prefers-color-scheme`, else
 *     the literal `'light'`/`'dark'`.
 *   - Toggle: a DELEGATED click on any `.tecof-darkmode-toggle` element flips the
 *     class and persists the choice (so late-added toggles work with no re-scan).
 *   - Config travels in a `<script type="application/json" data-tecof-darkmode>`
 *     (TecofRender emits it), or is passed directly.
 *
 * `TecofRender` wires this automatically on the published page. Because the effect
 * runs post-paint, hosts that want ZERO flash inline {@link darkModeHeadScript}
 * in their `<head>` (TecofRender renders no `<head>`, so it can't do that itself).
 */

export type ColorScheme = 'light' | 'dark';
export type DarkModeDefault = 'light' | 'dark' | 'system';

export interface DarkModeConfig {
  /** First-visit scheme when the visitor has no saved choice. Default `'system'`. */
  defaultMode?: DarkModeDefault;
  /** localStorage key persisting the visitor's toggle choice. Default `'tecof-color-scheme'`. */
  storageKey?: string;
}

export interface DarkModeHandle {
  /** The scheme currently applied. */
  scheme(): ColorScheme;
  /** Apply a scheme explicitly and persist it. */
  set(scheme: ColorScheme): void;
  /** Flip light↔dark and persist. */
  toggle(): void;
  /** Detach listeners. */
  destroy(): void;
}

/** Default localStorage key — override via `config.darkMode.storageKey`. */
export const DARK_MODE_STORAGE_KEY = 'tecof-color-scheme';

const NOOP: DarkModeHandle = { scheme: () => 'light', set() {}, toggle() {}, destroy() {} };

/** Read the config the `<script data-tecof-darkmode>` carries; `null` = not present. */
const readConfig = (root: Document): DarkModeConfig | null => {
  const el = root.querySelector('script[data-tecof-darkmode]');
  if (!el?.textContent) return null;
  try {
    const parsed = JSON.parse(el.textContent);
    return parsed && typeof parsed === 'object' ? (parsed as DarkModeConfig) : {};
  } catch {
    return {};
  }
};

/**
 * Initialise dark mode on `root`. Pass `config` directly, or omit it to read the
 * `<script data-tecof-darkmode>` TecofRender emits. Returns a NO-OP handle when
 * there is no document/window or no config (i.e. dark mode isn't enabled here).
 */
export function initDarkMode(
  root: Document | null | undefined,
  config?: DarkModeConfig,
): DarkModeHandle {
  const win = root?.defaultView;
  if (!root || !win) return NOOP;

  const cfg = config ?? readConfig(root);
  if (!cfg) return NOOP;

  const storageKey = cfg.storageKey || DARK_MODE_STORAGE_KEY;
  const defaultMode: DarkModeDefault = cfg.defaultMode ?? 'system';
  const mq = win.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

  const readStored = (): ColorScheme | null => {
    try {
      const v = win.localStorage?.getItem(storageKey);
      return v === 'dark' || v === 'light' ? v : null;
    } catch {
      return null;
    }
  };
  const writeStored = (s: ColorScheme) => {
    try {
      win.localStorage?.setItem(storageKey, s);
    } catch {
      /* storage unavailable — the class still applies for this session */
    }
  };

  const resolveInitial = (): ColorScheme => {
    const stored = readStored();
    if (stored) return stored;
    if (defaultMode === 'system') return mq?.matches ? 'dark' : 'light';
    return defaultMode;
  };

  let current: ColorScheme = resolveInitial();
  const applyClass = (s: ColorScheme) => root.documentElement.classList.toggle('dark', s === 'dark');
  applyClass(current);

  const setScheme = (s: ColorScheme, persist: boolean) => {
    current = s;
    applyClass(s);
    if (persist) writeStored(s);
  };

  // Follow the OS while the visitor hasn't made an explicit choice (system only).
  const onMqChange = () => {
    if (defaultMode === 'system' && !readStored()) setScheme(mq!.matches ? 'dark' : 'light', false);
  };
  if (mq && defaultMode === 'system') mq.addEventListener?.('change', onMqChange);

  const onClick = (e: Event) => {
    const el = (e.target as Element | null)?.closest?.('.tecof-darkmode-toggle');
    if (!el) return;
    e.preventDefault();
    setScheme(current === 'dark' ? 'light' : 'dark', true);
  };
  root.addEventListener('click', onClick);

  return {
    scheme: () => current,
    set: (s) => setScheme(s, true),
    toggle: () => setScheme(current === 'dark' ? 'light' : 'dark', true),
    destroy() {
      root.removeEventListener('click', onClick);
      if (mq && defaultMode === 'system') mq.removeEventListener?.('change', onMqChange);
    },
  };
}

/**
 * A tiny self-contained `<script>` body hosts inline in `<head>` to set the
 * `.dark` class BEFORE first paint (no flash-of-wrong-theme). TecofRender renders
 * no `<head>`, so zero-flash requires the host to place this string in a
 * `<script>` high in the document. Safe to skip — {@link initDarkMode} still sets
 * the class after mount, just with a possible one-frame flash.
 */
export function darkModeHeadScript(config?: DarkModeConfig): string {
  const storageKey = JSON.stringify(config?.storageKey || DARK_MODE_STORAGE_KEY);
  const defaultMode = JSON.stringify(config?.defaultMode ?? 'system');
  return (
    `(function(){try{` +
    `var k=${storageKey},d=${defaultMode},s=localStorage.getItem(k);` +
    `var dark=s==='dark'||(s!=='light'&&(d==='dark'||(d==='system'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)));` +
    `document.documentElement.classList.toggle('dark',dark);` +
    `}catch(e){}})();`
  );
}
