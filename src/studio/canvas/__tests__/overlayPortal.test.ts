import { describe, it, expect, vi } from 'vitest';
import {
  registerOverlayPortal,
  isInsideOverlayPortal,
  findBlockableInteraction,
  installCanvasInteractionGuard,
} from '../overlayPortal';

/**
 * These tests run in vitest's default `node` environment (no jsdom), so the
 * overlay-portal helpers are exercised with duck-typed targets: every helper
 * only reaches for `Element.closest`, which we mock. `closest` is keyed on
 * whether the selector is the portal marker or the native-action set, so the
 * mock stays robust to the exact selector strings.
 */
function mockTarget(opts: { portal?: unknown; native?: unknown } = {}): EventTarget {
  return {
    closest(selector: string) {
      if (selector.includes('data-tecof-portal')) return opts.portal ?? null;
      return opts.native ?? null;
    },
  } as unknown as EventTarget;
}

describe('registerOverlayPortal', () => {
  it('tolerates null (React ref callback on unmount) and returns a no-op cleanup', () => {
    const cleanup = registerOverlayPortal(null);
    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
  });

  it('marks the element, disables native drag, and cleanup removes the marker', () => {
    const attrs: Record<string, string> = {};
    const el = {
      draggable: true,
      setAttribute: (k: string, v: string) => {
        attrs[k] = v;
      },
      removeAttribute: (k: string) => {
        delete attrs[k];
      },
    } as unknown as HTMLElement;

    const cleanup = registerOverlayPortal(el);
    expect(attrs['data-tecof-portal']).toBe('true');
    expect(el.draggable).toBe(false);

    cleanup();
    expect(attrs['data-tecof-portal']).toBeUndefined();
  });
});

describe('isInsideOverlayPortal', () => {
  it('is false for null / non-element targets', () => {
    expect(isInsideOverlayPortal(null)).toBe(false);
    expect(isInsideOverlayPortal({} as EventTarget)).toBe(false);
  });

  it('is true only when an ancestor carries the portal marker', () => {
    expect(isInsideOverlayPortal(mockTarget({ portal: { id: 'p' } }))).toBe(true);
    expect(isInsideOverlayPortal(mockTarget({ portal: null }))).toBe(false);
  });
});

describe('findBlockableInteraction', () => {
  it('returns null for null / non-element targets', () => {
    expect(findBlockableInteraction(null)).toBeNull();
    expect(findBlockableInteraction({} as EventTarget)).toBeNull();
  });

  it('returns the interactive element for a link/button outside a portal', () => {
    const link = { tag: 'a' };
    expect(findBlockableInteraction(mockTarget({ native: link }))).toBe(link);
  });

  it('returns null for plain, non-interactive content', () => {
    expect(findBlockableInteraction(mockTarget({ native: null }))).toBeNull();
  });

  it('returns null inside a portal even when the target IS interactive', () => {
    const link = { tag: 'a' };
    expect(
      findBlockableInteraction(mockTarget({ portal: { id: 'p' }, native: link }))
    ).toBeNull();
  });
});

describe('installCanvasInteractionGuard', () => {
  function makeDoc() {
    const listeners: Record<string, Set<EventListener>> = {};
    return {
      addEventListener(type: string, fn: EventListener) {
        (listeners[type] ??= new Set()).add(fn);
      },
      removeEventListener(type: string, fn: EventListener) {
        listeners[type]?.delete(fn);
      },
      fire(type: string, evt: unknown) {
        listeners[type]?.forEach((fn) => fn(evt as Event));
      },
      count() {
        return Object.values(listeners).reduce((n, s) => n + s.size, 0);
      },
    };
  }

  function clickEvent(target: EventTarget) {
    return { target, preventDefault: vi.fn() };
  }

  it('blocks link/button clicks (and middle-clicks) in edit mode', () => {
    const doc = makeDoc();
    installCanvasInteractionGuard(doc as unknown as Document, () => true);

    const click = clickEvent(mockTarget({ native: { tag: 'a' } }));
    doc.fire('click', click);
    expect(click.preventDefault).toHaveBeenCalledTimes(1);

    const aux = clickEvent(mockTarget({ native: { tag: 'a' } }));
    doc.fire('auxclick', aux);
    expect(aux.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('leaves plain content and preview mode untouched', () => {
    const editDoc = makeDoc();
    installCanvasInteractionGuard(editDoc as unknown as Document, () => true);
    const plain = clickEvent(mockTarget({ native: null }));
    editDoc.fire('click', plain);
    expect(plain.preventDefault).not.toHaveBeenCalled();

    const previewDoc = makeDoc();
    installCanvasInteractionGuard(previewDoc as unknown as Document, () => false);
    const inPreview = clickEvent(mockTarget({ native: { tag: 'a' } }));
    previewDoc.fire('click', inPreview);
    expect(inPreview.preventDefault).not.toHaveBeenCalled();
  });

  it('lets overlay-portal controls stay live in edit mode', () => {
    const doc = makeDoc();
    installCanvasInteractionGuard(doc as unknown as Document, () => true);
    const click = clickEvent(mockTarget({ portal: { id: 'p' }, native: { tag: 'a' } }));
    doc.fire('click', click);
    expect(click.preventDefault).not.toHaveBeenCalled();
  });

  it('blocks form submits outside portals but not inside them', () => {
    const doc = makeDoc();
    installCanvasInteractionGuard(doc as unknown as Document, () => true);

    const submit = clickEvent(mockTarget({}));
    doc.fire('submit', submit);
    expect(submit.preventDefault).toHaveBeenCalledTimes(1);

    const portalSubmit = clickEvent(mockTarget({ portal: { id: 'p' } }));
    doc.fire('submit', portalSubmit);
    expect(portalSubmit.preventDefault).not.toHaveBeenCalled();
  });

  it('cleanup removes every listener it added', () => {
    const doc = makeDoc();
    const uninstall = installCanvasInteractionGuard(doc as unknown as Document, () => true);
    expect(doc.count()).toBe(3);
    uninstall();
    expect(doc.count()).toBe(0);
  });
});
