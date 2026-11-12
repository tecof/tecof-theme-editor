// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureBridge, getBridgePageId, postToHost, setBridgePageId } from '../bridge';

/**
 * Host bridge: every message carries the page id (when one is set) so the host
 * panel can detect a frame that shows a different page than it believes.
 * `window` is shimmed (node environment): embedded = `window.parent !== window`.
 */
describe('bridge page identity', () => {
  const embed = () => {
    const postMessage = vi.fn();
    (globalThis as any).window = { parent: { postMessage } };
    return postMessage;
  };

  afterEach(() => {
    delete (globalThis as any).window;
    setBridgePageId(undefined);
    configureBridge(undefined);
  });

  it('adds pageId to every host message once set', () => {
    const postMessage = embed();
    setBridgePageId('6b00000000000000000000e1');
    postToHost('puck:changed');
    postToHost('puck:saved', { data: { root: {} } });
    expect(postMessage).toHaveBeenNthCalledWith(1, { type: 'puck:changed', pageId: '6b00000000000000000000e1' }, '*');
    expect(postMessage).toHaveBeenNthCalledWith(2, { type: 'puck:saved', pageId: '6b00000000000000000000e1', data: { root: {} } }, '*');
  });

  it('omits pageId when none is set (older hosts see the same shape as before)', () => {
    const postMessage = embed();
    postToHost('puck:changed');
    expect(postMessage).toHaveBeenCalledWith({ type: 'puck:changed' }, '*');
    expect(getBridgePageId()).toBeUndefined();
  });

  it('clears the announced page id', () => {
    const postMessage = embed();
    setBridgePageId('a');
    setBridgePageId(null);
    postToHost('puck:itemDeselected');
    expect(postMessage).toHaveBeenCalledWith({ type: 'puck:itemDeselected' }, '*');
  });

  it('keeps the configured target origin', () => {
    const postMessage = embed();
    configureBridge('https://app.tecof.com');
    setBridgePageId('p1');
    postToHost('puck:changed');
    expect(postMessage).toHaveBeenCalledWith({ type: 'puck:changed', pageId: 'p1' }, 'https://app.tecof.com');
  });

  it('does not post when the editor is not embedded', () => {
    const postMessage = vi.fn();
    const self: any = { postMessage };
    self.parent = self;
    (globalThis as any).window = self;
    setBridgePageId('p1');
    postToHost('puck:changed');
    expect(postMessage).not.toHaveBeenCalled();
  });
});
