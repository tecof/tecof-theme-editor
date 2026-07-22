// @vitest-environment node
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TecofRender } from '../TecofRender';

/** Publish-side integration: dark-mode CSS block + config <script> land in HTML,
 *  and NOTHING dark is emitted when the host hasn't enabled config.darkMode. */

const baseConfig: any = {
  components: {
    Box: {
      fields: {},
      render: ({ className, label }: any) => <div className={className}>{label}</div>,
    },
  },
};

const page = {
  root: { props: {} },
  content: [{ type: 'Box', props: { id: 'x', label: 'a' } }],
  zones: {},
};

describe('TecofRender dark mode', () => {
  it('emits the :root.dark override block + config <script> when darkMode is on', () => {
    const html = renderToStaticMarkup(
      <TecofRender data={page as any} config={{ ...baseConfig, darkMode: true }} />,
    );
    expect(html).toContain(':root.dark {');
    expect(html).toContain('color-scheme: dark;');
    expect(html).toContain('data-tecof-darkmode');
    expect(html).toContain('"defaultMode":"system"');
  });

  it('honours darkMode options in the emitted config', () => {
    const html = renderToStaticMarkup(
      <TecofRender
        data={page as any}
        config={{ ...baseConfig, darkMode: { defaultMode: 'dark', storageKey: 'shop-scheme' } }}
      />,
    );
    expect(html).toContain('"defaultMode":"dark"');
    expect(html).toContain('"storageKey":"shop-scheme"');
  });

  it('emits ZERO dark output when darkMode is absent', () => {
    const html = renderToStaticMarkup(<TecofRender data={page as any} config={baseConfig} />);
    expect(html).not.toContain(':root.dark');
    expect(html).not.toContain('color-scheme');
    expect(html).not.toContain('data-tecof-darkmode');
  });
});
