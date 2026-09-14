// @vitest-environment node
import { describe, it, expect } from 'vitest';
import type { PageTemplate, StudioConfig } from '../../../types';
import {
  TEMPLATE_PREVIEW_REFERENCE_WIDTH,
  buildInsertHint,
  computeFrameHeight,
  computePreviewBoxHeight,
  computePreviewScale,
  deriveSectionLabel,
  formatSectionCount,
  summarizeTemplateSections,
} from '../pageTemplatePreview';

/**
 * Sayfa şablonu onay drawer'ının SAF yardımcıları: iframe ölçek/yükseklik
 * hesabı ve bölüm etiketi türetme. DOM gerektirmez — hesap hatası burada
 * yakalanır, tarayıcıda değil.
 */

const config = {
  components: {
    Hero: { label: 'Kahraman Alan', render: () => null },
    Faq: { label: '  ', render: () => null },
    Footer: { render: () => null },
  },
} as unknown as StudioConfig;

describe('computePreviewScale — iframe ölçeği', () => {
  it('kutu genişliği / 1280 oranını verir', () => {
    expect(computePreviewScale(640)).toBeCloseTo(0.5, 5);
    expect(computePreviewScale(320)).toBeCloseTo(0.25, 5);
  });

  it('1280 referans genişliği dışa açıktır ve özel referansla çalışır', () => {
    expect(TEMPLATE_PREVIEW_REFERENCE_WIDTH).toBe(1280);
    expect(computePreviewScale(200, 400)).toBeCloseTo(0.5, 5);
  });

  it('1 üstüne çıkmaz (geniş kutuda sayfa büyütülmez)', () => {
    expect(computePreviewScale(1920)).toBe(1);
    expect(computePreviewScale(1280)).toBe(1);
  });

  it('ölçülemeyen kutu (0 / negatif / NaN) 1 döndürür', () => {
    expect(computePreviewScale(0)).toBe(1);
    expect(computePreviewScale(-10)).toBe(1);
    expect(computePreviewScale(Number.NaN)).toBe(1);
    expect(computePreviewScale(640, 0)).toBe(1);
  });
});

describe('computeFrameHeight — ölçek sonrası kutuyu dolduran yükseklik', () => {
  it('yüksekliği ölçeğe böler: 0.5 ölçekte kutu için iki katı render edilir', () => {
    expect(computeFrameHeight(400, 0.5)).toBe(800);
    expect(computeFrameHeight(400, 1)).toBe(400);
  });

  it('geçersiz ölçekte kutu yüksekliğine düşer, geçersiz yükseklikte 0 verir', () => {
    expect(computeFrameHeight(400, 0)).toBe(400);
    expect(computeFrameHeight(400, Number.NaN)).toBe(400);
    expect(computeFrameHeight(0, 0.5)).toBe(0);
  });

  it('ölçek × render yüksekliği = kutu yüksekliği (yuvarlama payıyla)', () => {
    const scale = computePreviewScale(700);
    expect(computeFrameHeight(420, scale) * scale).toBeCloseTo(420, 5);
  });
});

describe('computePreviewBoxHeight — ~60vh sınırları', () => {
  it('ekran yüksekliğinin %60ı', () => {
    expect(computePreviewBoxHeight(1000)).toBe(600);
  });

  it('alt ve üst sınırlara kelepçelenir', () => {
    expect(computePreviewBoxHeight(300)).toBe(280);
    expect(computePreviewBoxHeight(4000)).toBe(720);
  });

  it('ölçüm yoksa alt sınır', () => {
    expect(computePreviewBoxHeight(0)).toBe(280);
    expect(computePreviewBoxHeight(Number.NaN)).toBe(280);
  });
});

describe('deriveSectionLabel — bölüm etiketi', () => {
  it('kayıtlı bileşenin etiketini kullanır', () => {
    expect(deriveSectionLabel(config, 'Hero')).toBe('Kahraman Alan');
  });

  it('etiketi olmayan ya da boş etiketli bileşende ham tip adı', () => {
    expect(deriveSectionLabel(config, 'Footer')).toBe('Footer');
    expect(deriveSectionLabel(config, 'Faq')).toBe('Faq');
  });

  it('kayıtsız tip ham adıyla kalır (şablon eski bileşene işaret edebilir)', () => {
    expect(deriveSectionLabel(config, 'Bilinmeyen')).toBe('Bilinmeyen');
  });

  it('tip yoksa genel "Bölüm" etiketi', () => {
    expect(deriveSectionLabel(config, '')).toBe('Bölüm');
    expect(deriveSectionLabel(config, undefined)).toBe('Bölüm');
    expect(deriveSectionLabel(null, 'Hero')).toBe('Hero');
  });
});

describe('summarizeTemplateSections — sıralı bölüm listesi', () => {
  const sections = [
    { node: { type: 'Hero', props: { id: 'a' } } },
    { node: { type: 'Footer', props: { id: 'b' } } },
  ] as PageTemplate['sections'];

  it('sırayı 1den başlatır ve etiket üretir', () => {
    expect(summarizeTemplateSections(config, sections)).toEqual([
      { key: 'a', order: 1, type: 'Hero', label: 'Kahraman Alan' },
      { key: 'b', order: 2, type: 'Footer', label: 'Footer' },
    ]);
  });

  it('id yoksa key tip + indeksten türetilir (React key çakışmasın)', () => {
    const out = summarizeTemplateSections(config, [
      { node: { type: 'Hero' } },
      { node: { type: 'Hero' } },
    ] as unknown as PageTemplate['sections']);
    expect(out.map((s) => s.key)).toEqual(['Hero-0', 'Hero-1']);
  });

  it('bozuk/eksik düğüm atlanmaz — sayaçla liste uzunluğu tutar', () => {
    const out = summarizeTemplateSections(config, [
      { node: { type: 'Hero', props: { id: 'a' } } },
      {},
    ] as unknown as PageTemplate['sections']);
    expect(out).toHaveLength(2);
    expect(out[1]).toEqual({ key: 'section-1', order: 2, type: '', label: 'Bölüm' });
  });

  it('bölüm yoksa boş dizi', () => {
    expect(summarizeTemplateSections(config, undefined)).toEqual([]);
    expect(summarizeTemplateSections(config, [])).toEqual([]);
  });
});

describe('metinler', () => {
  it('formatSectionCount', () => {
    expect(formatSectionCount(3)).toBe('3 bölüm');
    expect(formatSectionCount(0)).toBe('0 bölüm');
    expect(formatSectionCount(Number.NaN)).toBe('0 bölüm');
  });

  it('buildInsertHint hedefi cümleye koyar ve yıkıcı olmadığını söyler', () => {
    expect(buildInsertHint('sayfanın seçilen yerine')).toBe(
      'Mevcut içerik silinmez; bölümler sayfanın seçilen yerine eklenir, tek Geri Al (⌘Z) ile kaldırılır.',
    );
    expect(buildInsertHint()).toContain('sayfanın sonuna');
    expect(buildInsertHint('   ')).toContain('sayfanın sonuna');
  });
});
