// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { UploadedFile } from '../../../types';

/*
 * jsdom yok: alanın gövdesi (lazy UploadField) ve dil kancası sahte modülle
 * değiştirilir; gövdeye giden `value` dilimi ile `onChange` yakalanır ve
 * render dışında çağrılır. Böylece "aktif dile yaz, diğer dilleri koru, eski
 * düz diziyi varsayılan dil altında aç" sözleşmesi bileşen KABLOLAMASI
 * üzerinden kilitlenir (saf yardımcıların testi `utils/__tests__`te ayrıdır).
 */

let activeTab = 'en';
vi.mock('../useLanguages', () => ({
  useLanguages: () => ({
    merchantInfo: { languages: ['tr', 'en'], defaultLanguage: 'tr' },
    loading: false,
    error: null,
    activeTab,
    setActiveTab: () => {},
  }),
}));

interface CapturedUploadProps {
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  allowMultiple?: boolean;
}
const captured: CapturedUploadProps[] = [];
vi.mock('../UploadField', () => ({
  UploadField: (props: CapturedUploadProps) => {
    captured.push(props);
    return <div data-upload-stub="" data-count={props.value.length} />;
  },
}));

import { createLocalizedUploadField } from '../LocalizedUploadField';

const fileTr: UploadedFile = { _id: 'f-tr', name: 'kampanya-tr.webp', size: 1, type: 'webp' };
const fileEn: UploadedFile = { _id: 'f-en', name: 'campaign-en.webp', size: 1, type: 'webp' };
const legacy: UploadedFile = { _id: 'legacy', name: 'foto.jpg', size: 0, type: 'image/jpeg' };

const renderField = (value: unknown, onChange = vi.fn(), extra: Record<string, unknown> = {}) => {
  const field = createLocalizedUploadField({ label: 'Görsel', allowMultiple: false, ...extra });
  const html = renderToStaticMarkup(
    field.render({ value: value as never, onChange, field: {}, name: 'image', id: 'image' }),
  );
  return { html, onChange };
};

beforeEach(() => {
  captured.length = 0;
  activeTab = 'en';
});

describe('LocalizedUploadField kablolaması', () => {
  it('EN sekmesi: gövdeye EN dilimi ([]) gider, seçenekler aynen geçer, TR yedek ipucu çıkar', () => {
    const { html } = renderField([
      { code: 'tr', value: [fileTr] },
      { code: 'en', value: [] },
    ]);
    expect(html).toContain('Görsel');
    expect(html).toContain('data-upload-stub');
    expect(captured).toHaveLength(1);
    expect(captured[0].value).toEqual([]);
    expect(captured[0].allowMultiple).toBe(false);
    expect(html).toContain('sitede TR görseli gösterilir');
  });

  it('EN sekmesinde dosya seçilince onChange yalnız EN\'i değiştirir, TR korunur', () => {
    const { onChange } = renderField([
      { code: 'tr', value: [fileTr] },
      { code: 'en', value: [] },
    ]);
    captured[0].onChange([fileEn]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([
      { code: 'tr', value: [fileTr] },
      { code: 'en', value: [fileEn] },
    ]);
  });

  it('TR sekmesi: TR dilimi gider, ipucu yok, Hızlı Doldur etkin (EN boş)', () => {
    activeTab = 'tr';
    const { html, onChange } = renderField([
      { code: 'tr', value: [fileTr] },
      { code: 'en', value: [] },
    ]);
    expect(captured[0].value).toEqual([fileTr]);
    expect(html).not.toContain('görseli gösterilir');
    const fillBtn = html.match(/<button[^>]*title="Aktif sekmedeki dosyaları boş dillere kopyala"[^>]*>/)?.[0];
    expect(fillBtn).toBeDefined();
    expect(fillBtn).not.toContain('disabled');
    captured[0].onChange([]);
    expect(onChange).toHaveBeenCalledWith([
      { code: 'tr', value: [] },
      { code: 'en', value: [] },
    ]);
  });

  it('EN boşken Hızlı Doldur pasif (kaynak yok)', () => {
    const { html } = renderField([
      { code: 'tr', value: [fileTr] },
      { code: 'en', value: [] },
    ]);
    const fillBtn = html.match(/<button[^>]*title="Aktif sekmedeki dosyaları boş dillere kopyala"[^>]*>/)?.[0];
    expect(fillBtn).toContain('disabled=""');
  });

  it('eski düz UploadedFile[] varsayılan dil (TR) altında açılır; EN\'e yazınca yeni biçim çıkar, mount\'ta onChange yok', () => {
    const { onChange } = renderField([legacy]);
    expect(onChange).not.toHaveBeenCalled();
    expect(captured[0].value).toEqual([]); // EN boş; legacy TR'de
    captured[0].onChange([fileEn]);
    expect(onChange).toHaveBeenCalledWith([
      { code: 'tr', value: [legacy] },
      { code: 'en', value: [fileEn] },
    ]);
  });

  it('value null/undefined → boş diziden başlar, çökmez', () => {
    const { html, onChange } = renderField(null);
    expect(html).toContain('data-upload-stub');
    captured[0].onChange([fileEn]);
    expect(onChange).toHaveBeenCalledWith([
      { code: 'tr', value: [] },
      { code: 'en', value: [fileEn] },
    ]);
  });

  it('readOnly → araç çubuğu çizilmez', () => {
    const field = createLocalizedUploadField({ label: 'Görsel' });
    const html = renderToStaticMarkup(
      field.render({ value: [], onChange: () => {}, readOnly: true, field: {}, name: 'image', id: 'image' }),
    );
    expect(html).not.toContain('Hızlı Doldur');
  });
});
