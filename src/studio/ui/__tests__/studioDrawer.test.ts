// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest';
import { isStudioDrawerOpen } from '../StudioDrawer';

/**
 * `isStudioDrawerOpen()` sözleşmesi.
 *
 * Stüdyonun global kısayolları (ESC, Delete, G/R/B, ⌘Z…) bu bayrağa bakıp
 * erken döner. Radix Presence KAPANAN kartı çıkış animasyonu bitene kadar
 * (~0.5sn) DOM'da tutar; yalnız varlığa bakmak kapanıştan sonra yarım
 * saniyelik bir kısayol ölü bölgesi yaratıyordu (⌘Z yutuluyordu). Bu yüzden
 * seçici `data-state="open"` şartını TAŞIMALI.
 */

/** `document.querySelector`'ı taklit eder: verilen seçiciyle eşleşen "kart"lar. */
const withDocument = (matches: (selector: string) => boolean) => {
  (globalThis as unknown as { document?: unknown }).document = {
    querySelector: (selector: string) => (matches(selector) ? {} : null),
  };
};

afterEach(() => {
  delete (globalThis as unknown as { document?: unknown }).document;
});

describe('isStudioDrawerOpen', () => {
  it('document yoksa (SSR/test) false', () => {
    expect(isStudioDrawerOpen()).toBe(false);
  });

  it('seçici hem StudioDrawer hem vaul kartını kapsar', () => {
    const selectors: string[] = [];
    withDocument((selector) => {
      selectors.push(selector);
      return false;
    });
    isStudioDrawerOpen();
    expect(selectors).toHaveLength(1);
    expect(selectors[0]).toContain('[data-tecof-drawer]');
    expect(selectors[0]).toContain('[data-vaul-drawer]');
  });

  it('her iki seçici parçası da data-state="open" şartı taşır', () => {
    const selectors: string[] = [];
    withDocument((selector) => {
      selectors.push(selector);
      return false;
    });
    isStudioDrawerOpen();
    const parts = selectors[0].split(',').map((part) => part.trim()).filter(Boolean);
    expect(parts.length).toBeGreaterThan(0);
    for (const part of parts) {
      expect(part).toContain('[data-state="open"]');
    }
  });

  it('açık kart varsa true', () => {
    withDocument(() => true);
    expect(isStudioDrawerOpen()).toBe(true);
  });

  it('kapanış animasyonundaki kart (data-state="closed") açık sayılmaz', () => {
    /* Sahte DOM: yalnız `data-state="closed"` kartı var → "open" seçicisi
       eşleşmez, dolayısıyla kısayollar kapanış animasyonu boyunca çalışır. */
    withDocument((selector) => !selector.includes('[data-state="open"]'));
    expect(isStudioDrawerOpen()).toBe(false);
  });
});
