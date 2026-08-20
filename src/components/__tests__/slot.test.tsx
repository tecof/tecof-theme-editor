// @vitest-environment node
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Slot } from '../Slot';
import { defineSection } from '../defineComponent';

/* Slot, enjekte edilen elemanı managedLayout + layout className ile klonlar. */
const Probe = (props: Record<string, any>) => <div data-testid="zone" {...props} />;

describe('Slot', () => {
  it('layout=row → tecof-slot-row class + managedLayout, gap → --tecof-slot-gap', () => {
    const html = renderToStaticMarkup(
      <Slot value={<Probe />} layout="row" gap="md" className="items-center" />
    );
    expect(html).toContain('tecof-slot');
    expect(html).toContain('tecof-slot-row');
    expect(html).toContain('items-center');
    expect(html).toContain('--tecof-slot-gap:0.75rem');
  });

  it('boş value → null render', () => {
    expect(renderToStaticMarkup(<Slot value={null as any} />)).toBe('');
  });

  it('managedLayout prop enjekte edilir (motor default layout basmasın)', () => {
    // Probe managedLayout'u attribute olarak basmaz; DOM'a düşmese de klonlanan
    // elemana geçtiğini fonksiyon-komponent yoluyla doğrula.
    let received: any = null;
    const Fn = (p: any) => { received = p; return <div />; };
    renderToStaticMarkup(<Slot value={Fn as any} layout="col" />);
    expect(received.managedLayout).toBe(true);
    expect(received.className).toContain('tecof-slot-col');
  });
});

describe('defineSection', () => {
  const Cfg = defineSection({
    label: 'Test',
    slots: {
      itemsSlot: { label: 'Öğeler', allow: ['Card'], layout: 'row', gap: 'md', default: ['Card', 'Card'] },
      contentSlot: { label: 'İçerik', allow: ['Title'], layout: 'col' },
    },
    fields: { columns: { type: 'radio', label: 'Sütun', options: [{ label: '2', value: '2' }] } as any },
    defaultProps: { id: 'Test-1', columns: '2' },
    render: (_p, slots) => <section className="py-16">{slots.contentSlot}{slots.itemsSlot}</section>,
  });

  it('slot field + orientation üretir', () => {
    expect(Cfg.fields?.itemsSlot).toMatchObject({ type: 'slot', allow: ['Card'], orientation: 'horizontal' });
    expect(Cfg.fields?.contentSlot).toMatchObject({ type: 'slot', orientation: 'vertical' });
    expect(Cfg.fields?.columns).toBeTruthy();
  });

  it('slot default → defaultChildren; defaultProps korunur', () => {
    expect(Cfg.defaultChildren?.itemsSlot).toEqual(['Card', 'Card']);
    expect(Cfg.defaultChildren?.contentSlot).toBeUndefined();
    expect(Cfg.defaultProps).toEqual({ id: 'Test-1', columns: '2' });
  });

  it('render kök className\'e p.className OTOMATİK ekler (seçilebilirlik garantisi)', () => {
    const html = renderToStaticMarkup(
      (Cfg.render as any)({ id: 'x', className: 'tecof-node-abc', contentSlot: null, itemsSlot: null })
    );
    expect(html).toContain('py-16');
    expect(html).toContain('tecof-node-abc');
  });
});

describe('Slot — passthrough + hideIfEmpty (0.0.83)', () => {
  const injected = (props: Record<string, unknown> = {}) => <div data-injected {...props} />;

  it('data-*/aria-*/id prop\'ları kapsayıcıya AYNEN geçer (sarmalayıcı div gereksizleşir)', () => {
    const html = renderToStaticMarkup(
      <Slot value={injected()} layout="col" data-reveal-item id="hero-content" aria-label="İçerik" />
    );
    expect(html).toContain('data-reveal-item');
    expect(html).toContain('id="hero-content"');
    expect(html).toContain('aria-label="İçerik"');
    // bilinen anahtarlar rest tarafından EZİLEMEZ: className yine slot sınıflarını taşır
    expect(html).toContain('tecof-slot-col');
  });

  it('hideIfEmpty + isEmpty:true (yayın sinyali) → hiç render edilmez', () => {
    const html = renderToStaticMarkup(
      <div>
        <Slot value={injected({ isEmpty: true })} layout="row" hideIfEmpty />
      </div>
    );
    expect(html).toBe('<div></div>');
  });

  it('hideIfEmpty ama işaret yok (EDİTÖR: isEmpty undefined) → görünür kalır', () => {
    const html = renderToStaticMarkup(<Slot value={injected()} layout="row" hideIfEmpty />);
    expect(html).toContain('data-injected');
  });

  it('hideIfEmpty verilmediyse isEmpty:true bile render edilir (BC)', () => {
    const html = renderToStaticMarkup(<Slot value={injected({ isEmpty: true })} layout="row" />);
    expect(html).toContain('data-injected');
  });
});

describe('defineSection — SlotSpec.className fonksiyonu + hideIfEmpty', () => {
  const Cfg2 = defineSection({
    label: 'Fn',
    slots: {
      contentSlot: {
        label: 'İçerik',
        layout: 'col',
        // prop'a bağlı yerleşim niyeti — bu olmadan hizalama için elle <Slot> gerekirdi
        className: (p: any) => (p.align === 'center' ? 'items-center' : undefined),
        hideIfEmpty: true,
      },
    },
    render: (_p, slots) => <section>{slots.contentSlot}</section>,
  });

  it('className fonksiyonu her render\'da props ile çözülür', () => {
    const value = <div data-injected />;
    const centered = renderToStaticMarkup(
      (Cfg2.render as any)({ id: 'x', align: 'center', contentSlot: value })
    );
    expect(centered).toContain('items-center');
    const left = renderToStaticMarkup(
      (Cfg2.render as any)({ id: 'x', align: 'left', contentSlot: value })
    );
    expect(left).not.toContain('items-center');
  });

  it('hideIfEmpty spec\'ten <Slot>\'a geçer (yayın isEmpty sinyaliyle gizlenir)', () => {
    const html = renderToStaticMarkup(
      (Cfg2.render as any)({ id: 'x', contentSlot: <div data-injected isEmpty={true} /> })
    );
    expect(html).not.toContain('data-injected');
  });
});
