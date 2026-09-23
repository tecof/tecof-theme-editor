// @vitest-environment node
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ColorField, createColorField } from '../ColorField';
import { isColorDraftInProgress } from '../color/ColorPicker';

/** Kapalı durumda (popover yok) sunucu render'ı: fabrika sözleşmesi + dört mod çökmeden markup üretir. */

const render = (value: string, extra: Record<string, unknown> = {}) =>
  renderToStaticMarkup(
    <ColorField field={{}} name="c" id="c" value={value} onChange={() => {}} {...extra} />
  );

describe('createColorField', () => {
  it('Puck custom field sözleşmesi', () => {
    const f = createColorField({ label: 'X' });
    expect(f.type).toBe('custom');
    expect(f._fieldType).toBe('color');
    expect(f.label).toBe('X');
    expect(typeof f.render).toBe('function');
  });

  it('render fonksiyonu FieldLabel + alanı basar', () => {
    const f = createColorField({ label: 'Arka plan', showOpacity: true });
    const html = renderToStaticMarkup(
      f.render({ value: '#2f7cf680', onChange: () => {}, field: {}, name: 'bg', id: 'bg' })
    );
    expect(html).toContain('Arka plan');
    expect(html).toContain('tecof-cp-trigger');
    expect(html).toContain('#2f7cf680');
  });

  it('seçenekler fabrikadan alana geçer (varsayılan değer verilmezse "" ile render)', () => {
    const f = createColorField({ label: 'X', defaultColor: '#000000' });
    const html = renderToStaticMarkup(
      f.render({ value: undefined as unknown as string, onChange: () => {}, field: {}, name: 'x', id: 'x' })
    );
    expect(html).toContain('Renk seç…');
    // value '' !== defaultColor '#000000' → Sıfırla görünür
    expect(html).toContain('Sıfırla');
  });
});

describe('isColorDraftInProgress (yazarken hata gösterme)', () => {
  it('kısa/eksik hex yazılıyor sayılır', () => {
    expect(isColorDraftInProgress('#')).toBe(true);
    expect(isColorDraftInProgress('#2')).toBe(true);
    expect(isColorDraftInProgress('#2f')).toBe(true);
    expect(isColorDraftInProgress('2f7cf')).toBe(true);
    expect(isColorDraftInProgress('#2f7cf6a')).toBe(true);
  });

  it('hex alfabesi dışı ya da fazla uzun metin hemen hatalıdır', () => {
    expect(isColorDraftInProgress('#2g')).toBe(false);
    expect(isColorDraftInProgress('xyz')).toBe(false);
    expect(isColorDraftInProgress('#123456789')).toBe(false);
  });

  it('parantezi kapanmamış rgb()/hsl() yazılıyor, kapanmış olan değil', () => {
    expect(isColorDraftInProgress('rgb(')).toBe(true);
    expect(isColorDraftInProgress('hsla(12, 3')).toBe(true);
    expect(isColorDraftInProgress('rgb(x)')).toBe(false);
  });
});

describe('ColorField kapalı durum', () => {
  it('boş → "Renk seç…" yer tutucusu, şeffaf dolgu', () => {
    const html = render('');
    expect(html).toContain('tecof-cp-input');
    expect(html).toContain('Renk seç…');
    expect(html).toContain('background:transparent');
    // '' === defaultColor '' → Sıfırla yok
    expect(html).not.toContain('Sıfırla');
  });

  it('hex → girdi ham değeri gösterir, dolgu hex', () => {
    const html = render('#2f7cf6');
    expect(html).toContain('value="#2f7cf6"');
    expect(html).toContain('background:#2f7cf6');
    expect(html).toContain('Sıfırla');
  });

  it('büyük harfli hex ilk düzenlemeye kadar olduğu gibi görünür', () => {
    expect(render('#ABCDEF')).toContain('value="#ABCDEF"');
  });

  it('hex8 (showOpacity) → rgba dolgu', () => {
    const html = render('#2f7cf680', { showOpacity: true });
    expect(html).toContain('value="#2f7cf680"');
    expect(html).toContain('rgba(47, 124, 246, 0.502)');
  });

  it('var(--theme-color-primary) → chip, Studio dışında var() dolgusu; çözüm yokken "Bağı kopar" çizilmez', () => {
    const html = render('var(--theme-color-primary)');
    expect(html).toContain('tecof-cp-chip');
    expect(html).toContain('Tema · Ana renk');
    expect(html).toContain('var(--theme-color-primary)');
    // Sunucuda ne tema paleti ne belge değişkeni var: düğme basılsaydı tıklama alanı '' yapardı.
    expect(html).not.toContain('Bağı kopar');
    expect(html).not.toContain('tecof-cp-input');
  });

  it('var(--foo) → unknown chip, ham değer + "CSS değeri", unlink yok', () => {
    const html = render('var(--foo)');
    expect(html).toContain('tecof-cp-chip');
    expect(html).toContain('var(--foo)');
    expect(html).toContain('CSS değeri');
    expect(html).not.toContain('Bağı kopar');
  });

  it('readOnly → tetikleyici, girdi ve sıfırla disabled', () => {
    const html = render('#2f7cf6', { readOnly: true });
    const disabledCount = (html.match(/disabled=""/g) ?? []).length;
    expect(disabledCount).toBeGreaterThanOrEqual(3);
  });

  it('a11y öznitelikleri', () => {
    const html = render('#2f7cf6');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('Renk seçiciyi aç');
  });
});
