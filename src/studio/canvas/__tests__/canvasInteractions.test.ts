import { describe, it, expect } from 'vitest';
import { nodeIdFromEl, NODE_MARKER_CLASS, resolveClickTarget } from '../canvasInteractions';

describe('nodeIdFromEl', () => {
  it('reads the node id from the tecof-node-<id> marker class', () => {
    expect(nodeIdFromEl({ classList: ['tecof-el', 'tecof-node-Hero-1', 'p-4'] })).toBe('Hero-1');
  });

  it('handles ids that themselves contain hyphens', () => {
    expect(nodeIdFromEl({ classList: ['tecof-node-Card-a1b2c3'] })).toBe('Card-a1b2c3');
  });

  it('returns null when there is no id marker (e.g. the bare anchor class)', () => {
    expect(nodeIdFromEl({ classList: ['p-4', 'tecof-el'] })).toBeNull();
  });

  it('returns null for a null element', () => {
    expect(nodeIdFromEl(null)).toBeNull();
  });

  it('anchor class is tecof-el', () => {
    expect(NODE_MARKER_CLASS).toBe('tecof-el');
  });
});

describe('resolveClickTarget — derin seçim modeli (Webflow)', () => {
  // MODEL DEĞİŞİKLİĞİ (kullanıcı kararı 2026-08-20): tık DAİMA en içteki
  // (derin) node'u seçer — eski dıştan-içe eskalasyon kaldırıldı. Bir elemente
  // tıklayınca panel yalnız o elementi göstermeli, Stil ona uygulanmalı;
  // section aggregate görünümü section'ın KENDİ boş alanına tıklayınca gelir
  // (orada derin hedef zaten section'ın kendisidir). Bu testler yeni sözleşmeyi
  // SABITLER: fonksiyon her durumda tıklananı döndürür.
  const doc = {
    root: { props: {} },
    content: [
      { type: 'Hero', props: { id: 'hero-1' } },
      { type: 'Blog', props: { id: 'blog-1' } },
    ],
    zones: {
      'hero-1:contentSlot': [
        { type: 'Title', props: { id: 'title-1' } },
        { type: 'Title', props: { id: 'title-2' } },
      ],
      'title-1:inner': [{ type: 'Span', props: { id: 'span-1' } }],
      'title-2:inner': [{ type: 'Span', props: { id: 'span-2' } }],
    },
  } as any;

  it('seçim yokken derindeki elemente tık → o element (eskalasyon YOK)', () => {
    expect(resolveClickTarget(doc, 'span-1', null)).toBe('span-1');
  });

  it('mevcut seçim ne olursa olsun tıklanan derin node kazanır', () => {
    expect(resolveClickTarget(doc, 'span-1', 'hero-1')).toBe('span-1');
    expect(resolveClickTarget(doc, 'span-2', 'title-1')).toBe('span-2');
    expect(resolveClickTarget(doc, 'span-1', 'blog-1')).toBe('span-1');
  });

  it("section'ın kendi boş alanına tık (derin hedef = section) → section", () => {
    // Aggregate görünümün giriş yolu: tıklama section'ın kendi yüzeyine
    // düştüğünde closest('.tecof-el') section'ı bulur.
    expect(resolveClickTarget(doc, 'hero-1', null)).toBe('hero-1');
    expect(resolveClickTarget(doc, 'hero-1', 'span-1')).toBe('hero-1');
  });

  it('Alt+tık davranışı değişmedi (zaten derin seçimdi)', () => {
    expect(resolveClickTarget(doc, 'span-1', 'hero-1', true)).toBe('span-1');
  });
});
