// @vitest-environment node
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TecofRender } from '../TecofRender';

/** Publish-side integration: interaction markers + registry land in the HTML. */

const config: any = {
  components: {
    Box: {
      fields: {},
      render: ({ className, label }: any) => <div className={className}>{label}</div>,
    },
  },
};

const page = {
  root: { props: {} },
  content: [
    {
      type: 'Box',
      props: {
        id: 'btn',
        label: 'Aç',
        _interactions: [{ id: '1', trigger: 'click', action: 'scrollTo', target: 'sec' }],
      },
    },
    { type: 'Box', props: { id: 'sec', label: 'Bölüm' } },
    { type: 'Box', props: { id: 'panel', label: 'Panel', _startHidden: true } },
  ],
  zones: {},
};

describe('TecofRender interactions', () => {
  const html = renderToStaticMarkup(<TecofRender data={page as any} config={config} />);

  it('marks every node with a stable anchor class', () => {
    expect(html).toContain('tecof-node-btn');
    expect(html).toContain('tecof-node-sec');
    expect(html).toContain('tecof-node-panel');
  });

  it('marks interaction sources with tecof-fx', () => {
    // The source (btn) carries the delegation marker; a plain node (sec) does not.
    expect(html).toMatch(/class="[^"]*tecof-node-btn[^"]*tecof-fx[^"]*"/);
    expect(html).not.toMatch(/class="[^"]*tecof-node-sec[^"]*tecof-fx\b[^"]*"/);
  });

  it('renders start-hidden nodes with the hidden class', () => {
    expect(html).toMatch(/class="[^"]*tecof-node-panel[^"]*tecof-fx-hidden[^"]*"/);
  });

  it('serialises the interaction registry into a JSON <script>', () => {
    expect(html).toContain('type="application/json"');
    expect(html).toContain('"action":"scrollTo"');
    expect(html).toContain('"target":"sec"');
    // Only the source node is in the registry (plain/start-hidden nodes aren't).
    expect(html).toContain('"btn":[');
    expect(html).not.toContain('"sec":[');
  });

  it('injects the interaction runtime CSS', () => {
    expect(html).toContain('data-tecof-interactions-css');
    expect(html).toContain('.tecof-fx-hidden');
  });

  it('emits no registry <script> when a page has no interactions', () => {
    const plain = renderToStaticMarkup(
      <TecofRender
        data={{ root: { props: {} }, content: [{ type: 'Box', props: { id: 'x', label: 'a' } }], zones: {} } as any}
        config={config}
      />
    );
    // The JSON registry script is gone; the (always-on) runtime CSS style stays.
    expect(plain).not.toContain('application/json');
    expect(plain).toContain('data-tecof-interactions-css');
  });
});
