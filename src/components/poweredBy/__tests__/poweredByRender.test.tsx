// @vitest-environment node
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PoweredBy } from '../PoweredBy';
import type { PoweredByBandData } from '../resolve';

/**
 * SSR güvenliği: provider YOK, window YOK. Bileşen `initialData` ile ilk
 * HTML'de bandı basmalı, `<script>` basmamalı ve `useSWR(null)` ile çökmemeli.
 *
 * DOM sözleşmesi: iki modda da İKİ `[data-powered-band]` basılır; tek varyantta
 * aktif olmayan `hidden` alır (innerHTML yeniden basılmaz → admin JS'inin
 * dinleyicileri yaşar), renderBoth'ta seçimi CSS yapar.
 */

const band: PoweredByBandData = {
  html: {
    tr: { light: 'TR-ACIK', dark: 'TR-KOYU' },
    en: { light: 'EN-LIGHT', dark: 'EN-DARK' },
  },
  css: '.tecof-band{color:red}',
  js: 'window.__band=1',
  version: 'v1abc',
};

/** `data-mode="X"` taşıyan div'in açılış etiketi (hidden var mı diye bakmak için). */
const openTag = (html: string, mode: 'light' | 'dark'): string => {
  const m = html.match(new RegExp(`<div[^>]*data-mode="${mode}"[^>]*>`));
  if (!m) throw new Error(`data-mode="${mode}" div yok`);
  return m[0];
};

describe('<PoweredBy /> SSR', () => {
  it('initialData + locale="en" → iki varyant DOM\'da, light görünür, dark hidden, style var, script yok', () => {
    const html = renderToStaticMarkup(<PoweredBy initialData={band} locale="en" />);
    expect(html).toContain('EN-LIGHT');
    expect(html).toContain('EN-DARK');
    expect(html.match(/data-powered-band=""/g)?.length).toBe(2);
    expect(html.match(/data-single=""/g)?.length).toBe(2);
    expect(openTag(html, 'light')).not.toContain('hidden');
    expect(openTag(html, 'dark')).toContain('hidden=""');
    expect(html).toContain('<style data-powered-band-style');
    expect(html).toContain('data-version="v1abc"');
    expect(html).toContain('.tecof-band{color:red}');
    expect(html).toContain('[data-powered-band][data-single][data-mode]{display:block}');
    expect(html).toContain('[data-powered-band][data-single][hidden]{display:none}');
    expect(html).not.toContain('<script');
  });

  it('style temanın sabit rozetini ilk HTML\'de gizler (has-powered-band sınıfı hidrasyonu beklemez)', () => {
    const html = renderToStaticMarkup(<PoweredBy initialData={band} locale="en" />);
    expect(html).toContain('[data-powered-by]{display:none}');
    expect(renderToStaticMarkup(<PoweredBy initialData={band} locale="en" renderBoth />)).toContain('[data-powered-by]{display:none}');
  });

  it('mode="dark" → dark görünür, light hidden', () => {
    const html = renderToStaticMarkup(<PoweredBy initialData={band} locale="en" mode="dark" />);
    expect(openTag(html, 'dark')).not.toContain('hidden');
    expect(openTag(html, 'light')).toContain('hidden=""');
    expect(html).toContain('EN-DARK');
  });

  it('renderBoth → iki data-powered-band, hidden YOK, prefers-color-scheme CSS, data-single yok', () => {
    const html = renderToStaticMarkup(<PoweredBy initialData={band} locale="tr" renderBoth />);
    expect(html.match(/data-powered-band=""/g)?.length).toBe(2);
    expect(html).toContain('TR-ACIK');
    expect(html).toContain('TR-KOYU');
    expect(html).not.toContain('hidden');
    expect(html).toContain('prefers-color-scheme: dark');
    expect(html).not.toContain('data-single');
    expect(html).not.toContain('<script');
  });

  it("initialData={null} → ''", () => {
    expect(renderToStaticMarkup(<PoweredBy initialData={null} />)).toBe('');
  });

  it('initialData yokken (provider yok, fetch yok) → boş, çökmez', () => {
    expect(renderToStaticMarkup(<PoweredBy />)).toBe('');
  });

  it('locale ve defaultLanguage yokken ilk anahtar (tr)', () => {
    const html = renderToStaticMarkup(<PoweredBy initialData={band} />);
    expect(html).toContain('TR-ACIK');
  });

  it('defaultLanguage="en" (locale yok) → sunucuda EN bandı; ilk anahtara düşmez', () => {
    const html = renderToStaticMarkup(<PoweredBy initialData={band} defaultLanguage="en" />);
    expect(html).toContain('EN-LIGHT');
    expect(html).not.toContain('TR-ACIK');
  });

  it('locale band içinde yoksa defaultLanguage, o da yoksa ilk anahtar', () => {
    expect(renderToStaticMarkup(<PoweredBy initialData={band} locale="de" defaultLanguage="en" />)).toContain('EN-LIGHT');
    expect(renderToStaticMarkup(<PoweredBy initialData={band} locale="de" />)).toContain('TR-ACIK');
  });

  it('className her iki sarmalayıcıya eklenir', () => {
    const html = renderToStaticMarkup(<PoweredBy initialData={band} locale="en" className="site-band" />);
    expect(html.match(/class="site-band"/g)?.length).toBe(2);
  });

  it('apiUrl+secretKey verilse de SSR render çökmez (SWR anahtarı dolu, efekt yok)', () => {
    const html = renderToStaticMarkup(
      <PoweredBy initialData={band} locale="en" apiUrl="https://api.example.test" secretKey="sk_test" />,
    );
    expect(html).toContain('EN-LIGHT');
  });

  it('html boş band → hiçbir şey', () => {
    expect(renderToStaticMarkup(<PoweredBy initialData={{ html: {}, css: null, js: null }} />)).toBe('');
  });
});
