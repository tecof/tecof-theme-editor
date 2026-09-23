import { describe, it, expect, vi } from 'vitest';
import {
  targetLocales,
  fillLanguages,
  mergeTranslations,
  translateLanguages,
  normalizeLocalizedValues,
  isEmptyText,
  isEmptyHtml,
  isEmptyLink,
  LANGUAGE_TOOL_MESSAGES,
  type LocalizedEntry,
  type TranslateFn,
} from '../languageTools';

const LANGS = ['tr', 'en', 'de'];

describe('targetLocales', () => {
  it('kaynak dili listeden çıkarır', () => {
    expect(targetLocales(LANGS, 'en')).toEqual(['tr', 'de']);
  });

  it('kaynak listede yoksa listeyi aynen döner', () => {
    expect(targetLocales(LANGS, 'xx')).toEqual(LANGS);
  });
});

describe('boşluk yardımcıları', () => {
  it('isEmptyText ham !text davranışını korur (boşluk dolu sayılır)', () => {
    expect(isEmptyText('')).toBe(true);
    expect(isEmptyText(null)).toBe(true);
    expect(isEmptyText(undefined)).toBe(true);
    expect(isEmptyText('   ')).toBe(false);
    expect(isEmptyText('a')).toBe(false);
  });

  it('isEmptyHtml boş TipTap belgesini boş sayar', () => {
    expect(isEmptyHtml('<p></p>')).toBe(true);
    expect(isEmptyHtml('<p><br></p>')).toBe(true);
    expect(isEmptyHtml('<p>&nbsp;</p>')).toBe(true);
    expect(isEmptyHtml('')).toBe(true);
    expect(isEmptyHtml('<p>Merhaba</p>')).toBe(false);
  });

  it('isEmptyHtml yalnız medya içeren belgeyi DOLU sayar (TipTap görseli)', () => {
    expect(isEmptyHtml('<img src="x">')).toBe(false);
    expect(isEmptyHtml('<p><img class="tecof-editor-image" src="/a.webp"></p>')).toBe(false);
    expect(isEmptyHtml('<video src="/v.mp4"></video>')).toBe(false);
    expect(isEmptyHtml('<iframe src="https://x"></iframe>')).toBe(false);
    expect(isEmptyHtml('<hr>')).toBe(false);
    expect(isEmptyHtml('<p><imgx></imgx></p>')).toBe(true); // etiket adı tam eşleşmeli
  });

  it('isEmptyLink url olmayan bağlantıyı boş sayar', () => {
    expect(isEmptyLink(undefined)).toBe(true);
    expect(isEmptyLink(null)).toBe(true);
    expect(isEmptyLink({})).toBe(true);
    expect(isEmptyLink({ url: '' })).toBe(true);
    expect(isEmptyLink({ url: '/a' })).toBe(false);
  });
});

describe('normalizeLocalizedValues', () => {
  it('dizi olmayan ham değeri boş sayar ve her dil için girdi üretir', () => {
    expect(normalizeLocalizedValues('çıplak string', ['tr', 'en'], () => '')).toEqual([
      { code: 'tr', value: '' },
      { code: 'en', value: '' },
    ]);
  });

  it('mevcut girdiyi korur, eksik dile makeEmpty yazar, listede olmayanı düşürür', () => {
    const raw = [
      { code: 'tr', value: { url: '/a' } },
      { code: 'xx', value: { url: '/x' } },
    ];
    const out = normalizeLocalizedValues(raw, ['tr', 'en'], () => ({ url: '' }));
    expect(out).toEqual([
      { code: 'tr', value: { url: '/a' } },
      { code: 'en', value: { url: '' } },
    ]);
    expect(out[0]).toBe(raw[0]);
  });
});

describe('fillLanguages — üzerine yaz (LanguageField birebir)', () => {
  it('aktif metni tüm dillere yazar, listede olmayan kodu düşürür', () => {
    const values: LocalizedEntry<string>[] = [
      { code: 'tr', value: 'Merhaba' },
      { code: 'en', value: '' },
      { code: 'xx', value: 'eski' },
    ];
    const res = fillLanguages(values, LANGS, 'tr', { isEmpty: isEmptyText });
    expect(res).not.toBeNull();
    expect(res!.values).toEqual([
      { code: 'tr', value: 'Merhaba' },
      { code: 'en', value: 'Merhaba' },
      { code: 'de', value: 'Merhaba' },
    ]);
    expect(res!.filled).toEqual(['tr', 'en', 'de']);
  });

  it('dolu dilleri de ezer (parite)', () => {
    const values: LocalizedEntry<string>[] = [
      { code: 'tr', value: 'Merhaba' },
      { code: 'en', value: 'Hello' },
    ];
    const res = fillLanguages(values, ['tr', 'en'], 'tr', { isEmpty: isEmptyText });
    expect(res!.values.find(v => v.code === 'en')!.value).toBe('Merhaba');
  });

  it('kaynak boşsa null döner', () => {
    expect(fillLanguages([{ code: 'tr', value: '' }], LANGS, 'tr', { isEmpty: isEmptyText })).toBeNull();
  });

  it('kaynak kodu dizide yoksa null döner', () => {
    expect(fillLanguages([{ code: 'en', value: 'Hello' }], LANGS, 'tr', { isEmpty: isEmptyText })).toBeNull();
  });

  it('girdi dizisini mutasyona uğratmaz', () => {
    const values: LocalizedEntry<string>[] = [
      { code: 'tr', value: 'Merhaba' },
      { code: 'en', value: '' },
    ];
    const snapshot = JSON.stringify(values);
    fillLanguages(values, ['tr', 'en'], 'tr');
    expect(JSON.stringify(values)).toBe(snapshot);
  });
});

describe('fillLanguages — yalnız boşlar (LinkField)', () => {
  type Link = { url: string; label?: string };
  const values: LocalizedEntry<Link>[] = [
    { code: 'tr', value: { url: '/a', label: 'A' } },
    { code: 'en', value: { url: '/about' } },
    { code: 'de', value: { url: '' } },
    { code: 'xx', value: { url: '/x' } },
  ];

  it('dolu dili korur, boş dile klon yazar, listede olmayanı korur', () => {
    const res = fillLanguages(values, LANGS, 'tr', { onlyEmpty: true, isEmpty: isEmptyLink });
    expect(res).not.toBeNull();
    const byCode = Object.fromEntries(res!.values.map(v => [v.code, v.value]));
    expect(byCode.en).toEqual({ url: '/about' });
    expect(byCode.de).toEqual({ url: '/a', label: 'A' });
    expect(byCode.xx).toEqual({ url: '/x' });
    expect(res!.filled).toEqual(['de']);
    // Klon: kaynakla aynı referans değil
    expect(byCode.de).not.toBe(values[0].value);
    expect(byCode.tr).toBe(values[0].value);
  });

  it('dizide hiç olmayan dili de doldurur (languages sırasıyla)', () => {
    const res = fillLanguages(
      [{ code: 'tr', value: { url: '/a' } }],
      ['en', 'tr', 'de'],
      'tr',
      { onlyEmpty: true, isEmpty: isEmptyLink }
    );
    expect(res!.filled).toEqual(['en', 'de']);
    expect(res!.values.map(v => v.code)).toEqual(['tr', 'en', 'de']);
  });

  it('boş hedef yoksa null döner', () => {
    const full: LocalizedEntry<Link>[] = [
      { code: 'tr', value: { url: '/a' } },
      { code: 'en', value: { url: '/about' } },
    ];
    expect(fillLanguages(full, ['tr', 'en'], 'tr', { onlyEmpty: true, isEmpty: isEmptyLink })).toBeNull();
  });

  it('kaynak url boşsa null döner', () => {
    const empty: LocalizedEntry<Link>[] = [
      { code: 'tr', value: { url: '' } },
      { code: 'en', value: { url: '' } },
    ];
    expect(fillLanguages(empty, ['tr', 'en'], 'tr', { onlyEmpty: true, isEmpty: isEmptyLink })).toBeNull();
  });

  it('dizi değerlerde varsayılan klon [...v] üretir (UploadField yolu)', () => {
    const arrValues: LocalizedEntry<string[]>[] = [
      { code: 'tr', value: ['a.png'] },
      { code: 'en', value: [] },
    ];
    const res = fillLanguages(arrValues, ['tr', 'en'], 'tr', {
      onlyEmpty: true,
      isEmpty: v => v.length === 0,
    });
    const en = res!.values.find(v => v.code === 'en')!.value;
    expect(en).toEqual(['a.png']);
    expect(en).not.toBe(arrValues[0].value);
  });
});

describe('mergeTranslations', () => {
  const base: LocalizedEntry<string>[] = [
    { code: 'tr', value: 'Merhaba' },
    { code: 'en', value: '' },
  ];

  it('eşleşen kodu günceller, bilinmeyen kodu sona ekler', () => {
    const out = mergeTranslations(base, [
      { code: 'en', value: 'Hello' },
      { code: 'de', value: 'Hallo' },
    ]);
    expect(out).toEqual([
      { code: 'tr', value: 'Merhaba' },
      { code: 'en', value: 'Hello' },
      { code: 'de', value: 'Hallo' },
    ]);
  });

  it('girdi dizisini mutasyona uğratmaz, kaynak dile dokunmaz', () => {
    const snapshot = JSON.stringify(base);
    const out = mergeTranslations(base, [{ code: 'en', value: 'Hello' }]);
    expect(JSON.stringify(base)).toBe(snapshot);
    expect(out[0]).toBe(base[0]);
  });
});

describe('translateLanguages', () => {
  const values: LocalizedEntry<string>[] = [
    { code: 'tr', value: 'Merhaba' },
    { code: 'en', value: '' },
    { code: 'de', value: '' },
  ];

  it('başarıda merge eder ve doğru argümanlarla çağırır', async () => {
    const translate = vi.fn<TranslateFn>(async () => ({
      success: true,
      data: [
        { code: 'en', value: 'Hello' },
        { code: 'de', value: 'Hallo' },
      ],
    }));
    const out = await translateLanguages({ values, languages: LANGS, sourceCode: 'tr', translate, isHtml: true });
    expect(translate).toHaveBeenCalledTimes(1);
    expect(translate).toHaveBeenCalledWith('Merhaba', 'tr', ['en', 'de'], true);
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.values).toEqual([
        { code: 'tr', value: 'Merhaba' },
        { code: 'en', value: 'Hello' },
        { code: 'de', value: 'Hallo' },
      ]);
      expect(out.translations).toHaveLength(2);
    }
  });

  it('isHtml varsayılanı false', async () => {
    const translate = vi.fn<TranslateFn>(async () => ({ success: true, data: [] }));
    await translateLanguages({ values, languages: LANGS, sourceCode: 'tr', translate });
    expect(translate).toHaveBeenCalledWith('Merhaba', 'tr', ['en', 'de'], false);
  });

  it('values getter ise merge cevap anındaki diziye yapılır (bekleme sırasında yazılan korunur)', async () => {
    let live: LocalizedEntry<string>[] = values;
    const translate = vi.fn<TranslateFn>(async () => {
      // API beklerken kullanıcı aktif dilde yazmaya devam etti
      live = [
        { code: 'tr', value: 'Merhaba dünya' },
        { code: 'en', value: '' },
        { code: 'de', value: '' },
      ];
      return { success: true, data: [{ code: 'en', value: 'Hello' }] };
    });
    const out = await translateLanguages({ values: () => live, languages: LANGS, sourceCode: 'tr', translate });
    expect(translate).toHaveBeenCalledWith('Merhaba', 'tr', ['en', 'de'], false);
    expect(out.ok && out.values.find(v => v.code === 'tr')!.value).toBe('Merhaba dünya');
    expect(out.ok && out.values.find(v => v.code === 'en')!.value).toBe('Hello');
  });

  it('success:false + message → o mesaj', async () => {
    const translate = vi.fn<TranslateFn>(async () => ({ success: false, message: 'Kredi yok' }));
    const out = await translateLanguages({ values, languages: LANGS, sourceCode: 'tr', translate });
    expect(out).toEqual({ ok: false, message: 'Kredi yok' });
  });

  it('success:false mesajsız → Çeviri hatası', async () => {
    const translate = vi.fn<TranslateFn>(async () => ({ success: false }));
    const out = await translateLanguages({ values, languages: LANGS, sourceCode: 'tr', translate });
    expect(out).toEqual({ ok: false, message: LANGUAGE_TOOL_MESSAGES.translateError });
  });

  it('success:true ama data dizi değil → Çeviri hatası', async () => {
    const translate = vi.fn<TranslateFn>(async () => ({ success: true, data: undefined }));
    const out = await translateLanguages({ values, languages: LANGS, sourceCode: 'tr', translate });
    expect(out).toEqual({ ok: false, message: LANGUAGE_TOOL_MESSAGES.translateError });
  });

  it('throw → err.message', async () => {
    const translate = vi.fn<TranslateFn>(async () => {
      throw new Error('ağ');
    });
    const out = await translateLanguages({ values, languages: LANGS, sourceCode: 'tr', translate });
    expect(out).toEqual({ ok: false, message: 'ağ' });
  });

  it('kaynak boşsa çağırmaz', async () => {
    const translate = vi.fn<TranslateFn>(async () => ({ success: true, data: [] }));
    const out = await translateLanguages({
      values: [{ code: 'tr', value: '' }, { code: 'en', value: 'x' }],
      languages: ['tr', 'en'],
      sourceCode: 'tr',
      translate,
    });
    expect(out.ok).toBe(false);
    expect(translate).not.toHaveBeenCalled();
  });

  it('tek dilde çağırmaz', async () => {
    const translate = vi.fn<TranslateFn>(async () => ({ success: true, data: [] }));
    const out = await translateLanguages({
      values: [{ code: 'tr', value: 'Merhaba' }],
      languages: ['tr'],
      sourceCode: 'tr',
      translate,
    });
    expect(out.ok).toBe(false);
    expect(translate).not.toHaveBeenCalled();
  });

  it('isEmpty: isEmptyHtml ile boş <p></p> çağırmaz', async () => {
    const translate = vi.fn<TranslateFn>(async () => ({ success: true, data: [] }));
    const out = await translateLanguages({
      values: [{ code: 'tr', value: '<p></p>' }, { code: 'en', value: '' }],
      languages: ['tr', 'en'],
      sourceCode: 'tr',
      translate,
      isHtml: true,
      isEmpty: isEmptyHtml,
    });
    expect(out.ok).toBe(false);
    expect(translate).not.toHaveBeenCalled();
  });
});

describe('LANGUAGE_TOOL_MESSAGES', () => {
  it('filledEmpty kodları büyük harfle virgülle birleştirir', () => {
    expect(LANGUAGE_TOOL_MESSAGES.filledEmpty(['en', 'de'])).toBe('Boş dillere kopyalandı: EN, DE');
  });

  it('sabit metinler LanguageField ile aynı', () => {
    expect(LANGUAGE_TOOL_MESSAGES.filledAll).toBe('Tüm dillere kopyalandı');
    expect(LANGUAGE_TOOL_MESSAGES.translated).toBe('Çeviri tamamlandı');
    expect(LANGUAGE_TOOL_MESSAGES.translateError).toBe('Çeviri hatası');
  });
});
