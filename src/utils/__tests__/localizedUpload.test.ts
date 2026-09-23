import { describe, it, expect } from 'vitest';
import {
  isLocalizedUploadValue,
  normalizeLocalizedUpload,
  setLocalizedUploadFiles,
  fastFillLocalizedUpload,
  emptyLocalizedUploadCodes,
  resolveLocalizedUpload,
  resolveLocalizedUploadFile,
  type LocalizedUploadFieldValue,
} from '../localizedUpload';
import { createLocalizedUploadField } from '../../components/fields/LocalizedUploadField';
import type { UploadedFile } from '../../types';

/* Sabit dosya nesneleri — testler referans/klon ayrımına bakar. */
const fileTr: UploadedFile = {
  _id: 'f-tr',
  name: 'kampanya-tr.webp',
  size: 1,
  type: 'webp',
  folder: '/',
  focalPoint: { x: 30, y: 60 },
};
const fileEn: UploadedFile = { _id: 'f-en', name: 'campaign-en.webp', size: 1, type: 'webp' };
const legacy = { _id: 'legacy', name: 'foto.jpg', size: 0, type: 'image/jpeg' };

const langs = { languages: ['tr', 'en'], defaultLanguage: 'tr' };
const langs3 = { languages: ['tr', 'en', 'de'], defaultLanguage: 'tr' };

describe('normalizeLocalizedUpload', () => {
  it('null / undefined / "" → tüm merchant dilleri boş, merchant sırasıyla', () => {
    const expected = [{ code: 'tr', value: [] }, { code: 'en', value: [] }];
    expect(normalizeLocalizedUpload(null, langs)).toEqual(expected);
    expect(normalizeLocalizedUpload(undefined, langs)).toEqual(expected);
    expect(normalizeLocalizedUpload('', langs)).toEqual(expected);
  });

  it('düz UploadedFile[] → varsayılan dil altında, diğerleri boş', () => {
    expect(normalizeLocalizedUpload([fileTr], langs)).toEqual([
      { code: 'tr', value: [fileTr] },
      { code: 'en', value: [] },
    ]);
  });

  it('tek UploadedFile nesnesi → [nesne] varsayılan dil altında', () => {
    expect(normalizeLocalizedUpload(fileTr, langs)).toEqual([
      { code: 'tr', value: [fileTr] },
      { code: 'en', value: [] },
    ]);
  });

  it('string eski kayıt → legacy dosya nesnesi (impl ile aynı yedek)', () => {
    expect(normalizeLocalizedUpload('foto.jpg', langs)).toEqual([
      { code: 'tr', value: [legacy] },
      { code: 'en', value: [] },
    ]);
  });

  it('zaten yeni biçim → değerler korunur, eksik dil [] ile tamamlanır', () => {
    const stored = [{ code: 'en', value: [fileEn] }];
    expect(normalizeLocalizedUpload(stored, langs)).toEqual([
      { code: 'tr', value: [] },
      { code: 'en', value: [fileEn] },
    ]);
  });

  it('öğe value tek nesne / string / sayı → sarılır / legacy / []', () => {
    const stored = [
      { code: 'tr', value: fileTr },
      { code: 'en', value: 'foto.jpg' },
      { code: 'de', value: 42 },
    ];
    expect(normalizeLocalizedUpload(stored, langs3)).toEqual([
      { code: 'tr', value: [fileTr] },
      { code: 'en', value: [legacy] },
      { code: 'de', value: [] },
    ]);
  });

  it('code string olmayan öğe düşer; tekrar eden kodda ilki kazanır', () => {
    const stored = [
      { code: 'tr', value: [fileTr] },
      { code: 7, value: [fileEn] },
      null,
      { code: 'tr', value: [fileEn] },
    ];
    expect(normalizeLocalizedUpload(stored, langs)).toEqual([
      { code: 'tr', value: [fileTr] },
      { code: 'en', value: [] },
    ]);
  });

  it('merchant listesinde olmayan kod sona eklenir ve korunur', () => {
    const stored = [
      { code: 'de', value: [fileEn] },
      { code: 'tr', value: [fileTr] },
    ];
    expect(normalizeLocalizedUpload(stored, langs)).toEqual([
      { code: 'tr', value: [fileTr] },
      { code: 'en', value: [] },
      { code: 'de', value: [fileEn] },
    ]);
  });

  it('languages verilmezse yalnız kayıttaki kodlar döner; düz dizi "tr" altına gider', () => {
    expect(normalizeLocalizedUpload([{ code: 'en', value: [fileEn] }])).toEqual([
      { code: 'en', value: [fileEn] },
    ]);
    expect(normalizeLocalizedUpload([fileTr])).toEqual([{ code: 'tr', value: [fileTr] }]);
    expect(normalizeLocalizedUpload(null)).toEqual([]);
  });

  it('girdi dizisi mutasyona uğramaz', () => {
    const stored = [{ code: 'en', value: [fileEn] }];
    const snapshot = JSON.parse(JSON.stringify(stored));
    const out = normalizeLocalizedUpload(stored, langs);
    expect(out).not.toBe(stored);
    expect(stored).toEqual(snapshot);
  });
});

describe('setLocalizedUploadFiles', () => {
  const base: LocalizedUploadFieldValue[] = [
    { code: 'tr', value: [fileTr] },
    { code: 'en', value: [] },
  ];

  it('yalnız aktif kodu değiştirir; diğer öğeler aynı referansla kalır', () => {
    const out = setLocalizedUploadFiles(base, 'en', [fileEn]);
    expect(out).not.toBe(base);
    expect(out[0]).toBe(base[0]);
    expect(out[1]).toEqual({ code: 'en', value: [fileEn] });
    expect(base[1].value).toEqual([]); // girdi mutasyona uğramadı
  });

  it('kod yoksa sona ekler', () => {
    const out = setLocalizedUploadFiles(base, 'de', [fileEn]);
    expect(out).toHaveLength(3);
    expect(out[2]).toEqual({ code: 'de', value: [fileEn] });
  });
});

describe('fastFillLocalizedUpload / emptyLocalizedUploadCodes', () => {
  it('tr dolu, en/de boş → en ve de tr kopyasını alır; kopya klon ama eşit', () => {
    const base: LocalizedUploadFieldValue[] = [
      { code: 'tr', value: [fileTr] },
      { code: 'en', value: [] },
      { code: 'de', value: [] },
    ];
    const out = fastFillLocalizedUpload(base, 'tr', ['tr', 'en', 'de']);
    expect(out).not.toBe(base);
    expect(out[1].value).toEqual([fileTr]);
    expect(out[2].value).toEqual([fileTr]);
    expect(out[1].value[0]).not.toBe(fileTr); // sığ klon
    expect(out[2].value[0]).not.toBe(out[1].value[0]);
    expect(out[1].value[0]._id).toBe(fileTr._id); // aynı CDN dosyası
    expect(out[1].value[0].focalPoint).toEqual(fileTr.focalPoint); // odak da kopyalanır
  });

  it('kaynak boşsa aynı referans döner', () => {
    const base: LocalizedUploadFieldValue[] = [
      { code: 'tr', value: [] },
      { code: 'en', value: [] },
    ];
    expect(fastFillLocalizedUpload(base, 'tr', ['tr', 'en'])).toBe(base);
  });

  it('boş hedef yoksa aynı referans döner ve emptyLocalizedUploadCodes [] verir', () => {
    const base: LocalizedUploadFieldValue[] = [
      { code: 'tr', value: [fileTr] },
      { code: 'en', value: [fileEn] },
    ];
    expect(fastFillLocalizedUpload(base, 'tr', ['tr', 'en'])).toBe(base);
    expect(emptyLocalizedUploadCodes(base, ['tr', 'en'], 'tr')).toEqual([]);
  });

  it('dolu hedefin üzerine yazmaz', () => {
    const base: LocalizedUploadFieldValue[] = [
      { code: 'tr', value: [fileTr] },
      { code: 'en', value: [fileEn] },
      { code: 'de', value: [] },
    ];
    const out = fastFillLocalizedUpload(base, 'tr', ['tr', 'en', 'de']);
    expect(out[1].value).toEqual([fileEn]);
    expect(out[1]).toBe(base[1]);
    expect(out[2].value).toEqual([fileTr]);
  });

  it('kayıtta hiç olmayan dil de boş sayılır ve doldurulur', () => {
    const base: LocalizedUploadFieldValue[] = [{ code: 'tr', value: [fileTr] }];
    expect(emptyLocalizedUploadCodes(base, ['tr', 'en'])).toEqual(['en']);
    const out = fastFillLocalizedUpload(base, 'tr', ['tr', 'en']);
    expect(out).toEqual([
      { code: 'tr', value: [fileTr] },
      { code: 'en', value: [fileTr] },
    ]);
  });

  it('exceptCode kaynağı listeden çıkarır', () => {
    const base: LocalizedUploadFieldValue[] = [
      { code: 'tr', value: [] },
      { code: 'en', value: [] },
    ];
    expect(emptyLocalizedUploadCodes(base, ['tr', 'en'])).toEqual(['tr', 'en']);
    expect(emptyLocalizedUploadCodes(base, ['tr', 'en'], 'en')).toEqual(['tr']);
  });
});

describe('resolveLocalizedUpload / resolveLocalizedUploadFile', () => {
  const stored = [
    { code: 'tr', value: [fileTr] },
    { code: 'en', value: [fileEn] },
  ];

  it('locale dolu → locale', () => {
    expect(resolveLocalizedUpload(stored, 'en', 'tr')).toEqual([fileEn]);
    expect(resolveLocalizedUploadFile(stored, 'en', 'tr')).toEqual(fileEn);
  });

  it('locale boş → defaultLanguage', () => {
    const v = [{ code: 'tr', value: [fileTr] }, { code: 'en', value: [] }];
    expect(resolveLocalizedUpload(v, 'en', 'tr')).toEqual([fileTr]);
    expect(resolveLocalizedUpload(v, 'de', 'tr')).toEqual([fileTr]); // kayıtta olmayan dil
  });

  it('locale + default boş → ilk dolu dil', () => {
    const v = [
      { code: 'tr', value: [] },
      { code: 'en', value: [] },
      { code: 'de', value: [fileEn] },
    ];
    expect(resolveLocalizedUpload(v, 'en', 'tr')).toEqual([fileEn]);
  });

  it('hepsi boş → [] ve null', () => {
    const v = [{ code: 'tr', value: [] }, { code: 'en', value: [] }];
    expect(resolveLocalizedUpload(v, 'en', 'tr')).toEqual([]);
    expect(resolveLocalizedUploadFile(v, 'en', 'tr')).toBeNull();
    expect(resolveLocalizedUpload([], 'en')).toEqual([]);
  });

  it('düz dizi aynen; tek nesne sarılır; null / sayı / string beklenen', () => {
    const flat = [fileTr, fileEn];
    expect(resolveLocalizedUpload(flat, 'en')).toBe(flat);
    expect(resolveLocalizedUpload(fileTr, 'en')).toEqual([fileTr]);
    expect(resolveLocalizedUpload(null, 'en')).toEqual([]);
    expect(resolveLocalizedUpload(undefined, 'en')).toEqual([]);
    expect(resolveLocalizedUpload(42, 'en')).toEqual([]);
    expect(resolveLocalizedUpload('x', 'en')).toEqual([{ ...legacy, name: 'x' }]);
    expect(resolveLocalizedUploadFile(null, 'en')).toBeNull();
  });

  it('defaultLanguage verilmezse "tr" varsayılır', () => {
    const v = [{ code: 'tr', value: [fileTr] }, { code: 'en', value: [] }];
    expect(resolveLocalizedUpload(v, 'en')).toEqual([fileTr]);
  });

  it('REGRESYON: [{code:"en", value:[]}] için "en" istenince boş dizi DEĞİL varsayılan döner', () => {
    // core getL boş diziyi dolu sayar ve [] basar; bu yardımcı yedek zincirine düşmeli.
    const v = [{ code: 'tr', value: [fileTr] }, { code: 'en', value: [] }];
    const out = resolveLocalizedUpload(v, 'en', 'tr');
    expect(out).not.toEqual([]);
    expect(out).toEqual([fileTr]);
  });
});

describe('isLocalizedUploadValue', () => {
  it('yeni biçim → true', () => {
    expect(isLocalizedUploadValue([{ code: 'tr', value: [fileTr] }])).toBe(true);
  });

  it('düz dizi → false; [] → false; null/string → false', () => {
    expect(isLocalizedUploadValue([fileTr])).toBe(false);
    expect(isLocalizedUploadValue([])).toBe(false);
    expect(isLocalizedUploadValue(null)).toBe(false);
    expect(isLocalizedUploadValue('foto.jpg')).toBe(false);
  });

  it('value tipi denetlenmez, biçim denetlenir: [{code:"tr", value:"x"}] → true', () => {
    expect(isLocalizedUploadValue([{ code: 'tr', value: 'x' }])).toBe(true);
  });
});

describe('createLocalizedUploadField (şekil)', () => {
  it('type custom, _fieldType localized-upload, label/visible/render taşır', () => {
    const field = createLocalizedUploadField({
      label: 'Kampanya Görseli',
      visible: true,
      allowMultiple: false,
    });
    expect(field.type).toBe('custom');
    expect(field._fieldType).toBe('localized-upload');
    expect(field.label).toBe('Kampanya Görseli');
    expect(field.visible).toBe(true);
    expect(typeof field.render).toBe('function');
  });

  it('seçeneksiz çağrı da geçerli bir alan üretir', () => {
    const field = createLocalizedUploadField();
    expect(field._fieldType).toBe('localized-upload');
    expect(field.label).toBeUndefined();
    expect(typeof field.render).toBe('function');
  });
});
