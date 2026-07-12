import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Cross-page persistence of the STYLE clipboard (uiStore mirrors it to
 * localStorage, same pattern as the engine node-clipboard mirror). The store
 * seeds itself from storage at module init, so each scenario installs the shim
 * first and imports a FRESH module registry via vi.resetModules().
 */

const KEY = 'tecof:style-clipboard:v1';

const installLocalStorageShim = () => {
  const backing = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => backing.get(k) ?? null,
    setItem: (k: string, v: string) => void backing.set(k, String(v)),
    removeItem: (k: string) => void backing.delete(k),
  };
  return backing;
};

const freshUiStore = async () => (await import('../uiStore')).useUiStore;

beforeEach(() => {
  vi.resetModules();
});

describe('style clipboard — localStorage mirror', () => {
  it('persists copied styles to storage', async () => {
    const backing = installLocalStorageShim();
    const useUiStore = await freshUiStore();

    useUiStore.getState().setStyleClipboard({ base: { p: '4', bg: 'red-500' } });
    expect(JSON.parse(backing.get(KEY)!)).toEqual({ base: { p: '4', bg: 'red-500' } });
  });

  it('clearing the buffer removes the mirror', async () => {
    const backing = installLocalStorageShim();
    const useUiStore = await freshUiStore();

    useUiStore.getState().setStyleClipboard({ base: { p: '4' } });
    useUiStore.getState().setStyleClipboard(null);
    expect(backing.has(KEY)).toBe(false);
    expect(useUiStore.getState().styleClipboard).toBeNull();
  });

  it('seeds the buffer from storage on a fresh session (another page)', async () => {
    const backing = installLocalStorageShim();
    backing.set(KEY, JSON.stringify({ base: { m: '2' }, states: { hover: { bg: 'red-500' } } }));

    const useUiStore = await freshUiStore();
    expect(useUiStore.getState().styleClipboard).toEqual({
      base: { m: '2' },
      states: { hover: { bg: 'red-500' } },
    });
  });

  it('corrupt storage degrades to an empty buffer instead of throwing', async () => {
    const backing = installLocalStorageShim();
    backing.set(KEY, '{not json');

    const useUiStore = await freshUiStore();
    expect(useUiStore.getState().styleClipboard).toBeNull();
  });

  it('no localStorage at all (SSR) still works in memory', async () => {
    delete (globalThis as any).localStorage;
    const useUiStore = await freshUiStore();

    useUiStore.getState().setStyleClipboard({ base: { p: '8' } });
    expect(useUiStore.getState().styleClipboard).toEqual({ base: { p: '8' } });
  });
});
