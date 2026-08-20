// @vitest-environment node
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TecofRender } from '../TecofRender';
import { Slot } from '../Slot';

/**
 * YAYIN yolunun uçtan uca sözleşmesi — <Slot> GERÇEK motor enjeksiyonuyla
 * (RenderDropZone) test edilir, mock elemanla değil. Önceki passthrough testi
 * ham bir <div>'e karşı geçiyordu ama motorun zone bileşeni rest prop'ları
 * yutuyordu (adversarial review bulgusu): buradaki testler o sınıfı hatayı
 * bir daha kaçırmamak için var.
 */

const config: any = {
  components: {
    Hero: {
      fields: {
        contentSlot: { type: 'slot' },
        actionsSlot: { type: 'slot' },
      },
      render: (p: any) => (
        <section>
          {/* serbest prop geçişi: data-* kapsayıcı div'e ulaşmalı */}
          <Slot value={p.contentSlot} layout="col" gap="md" data-reveal-item id="hero-content" />
          {/* hideIfEmpty: boş slot yayında HİÇ render edilmemeli (mt-10 dahil) */}
          <Slot value={p.actionsSlot} layout="row-wrap" hideIfEmpty className="mt-10" />
        </section>
      ),
    },
    Title: {
      fields: { text: { type: 'text' } },
      render: ({ text }: any) => <h1>{text}</h1>,
    },
  },
};

const page = (zones: Record<string, any[]>) => ({
  root: { props: {} },
  content: [{ type: 'Hero', props: { id: 'hero' } }],
  zones,
});

const render = (zones: Record<string, any[]>) =>
  renderToStaticMarkup(<TecofRender data={page(zones) as any} config={config} />);

describe('Slot yayın sözleşmesi (gerçek RenderDropZone ile)', () => {
  it('serbest prop geçişi kapsayıcı DIV\'e ulaşır (data-*, id)', () => {
    const html = render({
      'hero:contentSlot': [{ type: 'Title', props: { id: 't1', text: 'Merhaba' } }],
      'hero:actionsSlot': [],
    });
    expect(html).toContain('data-reveal-item');
    expect(html).toContain('id="hero-content"');
    // yerleşim sınıfları da aynı kapsayıcıda
    expect(html).toContain('tecof-slot-col');
    expect(html).toContain('<h1>Merhaba</h1>');
  });

  it('hideIfEmpty: boş zone yayında kapsayıcısıyla birlikte YOK (mt-10 dahil)', () => {
    const html = render({
      'hero:contentSlot': [{ type: 'Title', props: { id: 't1', text: 'Merhaba' } }],
      'hero:actionsSlot': [],
    });
    expect(html).not.toContain('mt-10');
    expect(html).not.toContain('tecof-slot-row-wrap');
  });

  it('hideIfEmpty: dolu zone normal render edilir', () => {
    const html = render({
      'hero:contentSlot': [],
      'hero:actionsSlot': [{ type: 'Title', props: { id: 't2', text: 'Buton' } }],
    });
    expect(html).toContain('mt-10');
    expect(html).toContain('tecof-slot-row-wrap');
  });

  it('tüm çocukları _hidden olan slot BOŞ sayılır (hideIfEmpty gizler)', () => {
    const html = render({
      'hero:contentSlot': [],
      'hero:actionsSlot': [{ type: 'Title', props: { id: 't3', text: 'Gizli', _hidden: true } }],
    });
    // _hidden çocuk yayında render edilmez; kapsayıcı da kalmamalı
    expect(html).not.toContain('Gizli');
    expect(html).not.toContain('mt-10');
  });

  it('hideIfEmpty VERİLMEYEN boş slot kapsayıcısını basar (BC — eski davranış)', () => {
    const html = render({
      'hero:contentSlot': [],
      'hero:actionsSlot': [],
    });
    // contentSlot hideIfEmpty değil → boşken de kapsayıcı (tecof-slot-col) durur
    expect(html).toContain('tecof-slot-col');
  });
});
