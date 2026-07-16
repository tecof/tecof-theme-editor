// @vitest-environment node
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TecofRender } from '../TecofRender';
import { useRepeatItem } from '../RepeatItemContext';

/** Publish-side integration: a `repeatSource` slot loops its template per row. */

const RowProbe = () => {
  const repeat = useRepeatItem();
  return <i data-probe>{repeat ? `${repeat.index + 1}/${repeat.count}` : 'yok'}</i>;
};

const config: any = {
  components: {
    ProductGrid: {
      fields: {
        items: { type: 'array' },
        card: { type: 'slot', repeatSource: 'items' },
      },
      render: ({ card }: any) => <section>{card}</section>,
    },
    Card: {
      fields: { title: { type: 'text' }, price: { type: 'text' } },
      render: ({ title, price }: any) => (
        <article>
          <h3>{title}</h3>
          <p>{price} TL</p>
          <RowProbe />
        </article>
      ),
    },
  },
};

const page = (items: any[] | undefined) => ({
  root: { props: {} },
  content: [{ type: 'ProductGrid', props: { id: 'grid', items } }],
  zones: {
    'grid:card': [
      {
        type: 'Card',
        props: { id: 'card-1', title: '{{ item.name }}', price: 'Fiyat {{ item.price }}' },
      },
    ],
  },
});

describe('TecofRender repeat zones', () => {
  it('renders the template once per row with resolved {{ item.* }} tokens', () => {
    const html = renderToStaticMarkup(
      <TecofRender
        data={page([
          { name: 'Kupa', price: 149 },
          { name: 'Tabak', price: 89 },
        ]) as any}
        config={config}
      />
    );
    expect(html).toContain('<h3>Kupa</h3>');
    expect(html).toContain('<h3>Tabak</h3>');
    expect(html).toContain('Fiyat 149 TL');
    expect(html).toContain('Fiyat 89 TL');
    expect(html).not.toContain('{{ item.');
    // useRepeatItem sees the row scope
    expect(html).toContain('1/2');
    expect(html).toContain('2/2');
  });

  it('renders NOTHING from the template when the repeat has no rows', () => {
    const html = renderToStaticMarkup(<TecofRender data={page([]) as any} config={config} />);
    expect(html).not.toContain('<article');
    expect(html).not.toContain('{{ item.');
  });

  it('treats a missing rows prop as empty (never leaks raw tokens on publish)', () => {
    const html = renderToStaticMarkup(<TecofRender data={page(undefined) as any} config={config} />);
    expect(html).not.toContain('{{ item.');
    expect(html).not.toContain('<article');
  });

  it('keeps non-repeat slots unchanged', () => {
    const plainConfig: any = {
      components: {
        Box: {
          fields: { body: { type: 'slot' } },
          render: ({ body }: any) => <div>{body}</div>,
        },
        Text: { fields: {}, render: ({ text }: any) => <span>{text}</span> },
      },
    };
    const html = renderToStaticMarkup(
      <TecofRender
        data={{
          root: { props: {} },
          content: [{ type: 'Box', props: { id: 'box' } }],
          zones: { 'box:body': [{ type: 'Text', props: { id: 't', text: 'merhaba' } }] },
        } as any}
        config={plainConfig}
      />
    );
    expect(html).toContain('<span>merhaba</span>');
  });
});
