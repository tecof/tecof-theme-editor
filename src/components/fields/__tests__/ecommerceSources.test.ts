import { describe, it, expect } from 'vitest';
import {
  readLang,
  formatDate,
  rowsOf,
  brandSource,
  categorySource,
  tagSource,
  attributeSource,
  flashSaleSource,
  discountSource,
  campaignSource,
  variantTypeSource,
  type SourceContext,
} from '../ecommerce/sources';

/* `toOptions` yalnız `locale`'i kullanır; apiClient'a dokunmaz. */
const ctx = { locale: 'tr' } as unknown as SourceContext;

describe('readLang', () => {
  it('çok dilli diziden istenen dili seçer', () => {
    expect(readLang([{ code: 'tr', value: 'Kırmızı' }, { code: 'en', value: 'Red' }], 'tr')).toBe('Kırmızı');
    expect(readLang([{ code: 'tr', value: 'Kırmızı' }, { code: 'en', value: 'Red' }], 'en')).toBe('Red');
  });

  it('PUBLIC uçlardan gelen çevrilmiş düz string`i olduğu gibi döndürür', () => {
    expect(readLang('Kırmızı', 'en')).toBe('Kırmızı');
  });

  it('istenen dil boş/eksikse ilk DOLU değere düşer', () => {
    expect(readLang([{ code: 'tr', value: 'Kırmızı' }, { code: 'de', value: '' }], 'de')).toBe('Kırmızı');
    expect(readLang([{ code: 'tr', value: 'Kırmızı' }], 'en')).toBe('Kırmızı');
  });

  it('boş/geçersiz girdide boş string döner', () => {
    expect(readLang(undefined, 'tr')).toBe('');
    expect(readLang([], 'tr')).toBe('');
    expect(readLang([{ code: 'tr', value: '' }], 'tr')).toBe('');
  });
});

describe('formatDate', () => {
  it('ISO tarihi gün.ay.yıl biçimine çevirir', () => {
    expect(formatDate('2026-01-31T23:59:59.000Z')).toMatch(/^\d{2}\.\d{2}\.2026$/);
  });

  it('boş ve geçersiz değerlerde boş string döner', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('')).toBe('');
    expect(formatDate('bozuk-tarih')).toBe('');
  });
});

describe('rowsOf', () => {
  it('yalnız başarılı yanıtın dizisini alır', () => {
    expect(rowsOf({ success: true, data: [{ _id: '1' }] })).toHaveLength(1);
    expect(rowsOf({ success: false, data: [{ _id: '1' }] })).toEqual([]);
    expect(rowsOf({ success: true, data: { nope: true } })).toEqual([]);
    expect(rowsOf({ success: true })).toEqual([]);
  });
});

describe('brandSource', () => {
  it('id + slug + ad saklar (filtre id ile, bağlantı slug ile çalışır)', () => {
    const [opt] = brandSource.toOptions(
      [{ _id: 'b1', name: 'Anadolu', slug: 'anadolu', imageId: { _id: 'u1', name: 'logo.png' } }],
      ctx
    );
    expect(opt.id).toBe('b1');
    expect(opt.label).toBe('Anadolu');
    expect(opt.value).toMatchObject({ id: 'b1', slug: 'anadolu', name: 'Anadolu' });
    expect(opt.value.image).toEqual({ _id: 'u1', name: 'logo.png' });
  });

  it('adı olmayan markada slug`a düşer', () => {
    const [opt] = brandSource.toOptions([{ _id: 'b2', name: [], slug: 'yedek' }], ctx);
    expect(opt.label).toBe('yedek');
  });

  it('özet ad üzerinden üretilir', () => {
    expect(brandSource.summarize({ name: 'Anadolu', slug: 'anadolu' })).toBe('Anadolu');
    expect(brandSource.summarize(null)).toBe('');
  });
});

describe('tagSource', () => {
  const rows = [
    { _id: 't2', name: [{ code: 'tr', value: 'Zeytin' }], slug: 'zeytin' },
    { _id: 't1', name: [{ code: 'tr', value: 'Çilek' }], slug: 'cilek' },
  ];

  it('etiket kimliğini saklar — ürün filtresi YALNIZ ObjectId kabul ediyor', () => {
    const opts = tagSource.toOptions(rows, ctx);
    expect(opts.map((o) => o.value.id)).toContain('t1');
    expect(opts.every((o) => typeof o.value.id === 'string' && o.value.id.length > 0)).toBe(true);
  });

  it('Türkçe alfabetik sıralar', () => {
    const opts = tagSource.toOptions(rows, ctx);
    expect(opts.map((o) => o.label)).toEqual(['Çilek', 'Zeytin']);
  });
});

describe('attributeSource', () => {
  it('seçenek etiketlerini ve renk kodlarını kopyalar (yayında ek istek gerekmesin)', () => {
    const [opt] = attributeSource.toOptions(
      [
        {
          _id: 'a1',
          name: [{ code: 'tr', value: 'Renk' }],
          slug: 'renk',
          type: 'color',
          isFilterable: true,
          options: [
            { value: 'kirmizi', label: [{ code: 'tr', value: 'Kırmızı' }], colorCode: '#ff0000' },
            { value: 'mavi', label: [], colorCode: null },
          ],
        },
      ],
      ctx
    );
    expect(opt.badge).toBe('Filtrelenebilir');
    expect(opt.value.options).toEqual([
      { value: 'kirmizi', label: 'Kırmızı', colorCode: '#ff0000' },
      /* etiketi olmayan seçenek ham değere düşer */
      { value: 'mavi', label: 'mavi', colorCode: null },
    ]);
  });
});

describe('attributeSource — pasif kayıtlar', () => {
  it('status inactive olan özelliği listelemez', () => {
    const rows = [
      { _id: 'a1', name: [{ code: 'tr', value: 'Renk' }], slug: 'renk', status: 'active', options: [] },
      { _id: 'a2', name: [{ code: 'tr', value: 'Eski' }], slug: 'eski', status: 'inactive', options: [] },
    ];
    expect(attributeSource.toOptions(rows, ctx).map((o) => o.label)).toEqual(['Renk']);
  });
});

describe('variantTypeSource', () => {
  it('değer kimliğini korur — ürün varyantı değere yalnız _id ile bağlanır', () => {
    const [opt] = variantTypeSource.toOptions(
      [
        {
          _id: 'v1',
          name: [{ code: 'tr', value: 'Renk' }],
          selectionType: 'color',
          values: [{ _id: 'val1', value: [{ code: 'tr', value: 'Siyah' }], colorCode: '#000000', imageId: null }],
        },
      ],
      ctx
    );
    expect(opt.color).toBe('#000000');
    expect(opt.value.values).toEqual([
      { id: 'val1', label: 'Siyah', colorCode: '#000000', image: null },
    ]);
  });
});

describe('categorySource', () => {
  const tree = [
    {
      _id: 'c1',
      name: [{ code: 'tr', value: 'Gıda' }],
      slug: 'gida',
      children: [
        {
          _id: 'c2',
          name: [{ code: 'tr', value: 'Atıştırmalık' }],
          slug: 'atistirmalik',
          children: [{ _id: 'c3', name: [{ code: 'tr', value: 'Cips' }], slug: 'cips' }],
        },
      ],
    },
    { _id: 'c4', name: [{ code: 'tr', value: 'İçecek' }], slug: 'icecek' },
  ];

  it('ağacı derinlik bilgisiyle düz listeye açar', () => {
    const opts = categorySource.toOptions(tree, ctx);
    expect(opts.map((o) => [o.label, o.depth])).toEqual([
      ['Gıda', 0],
      ['Atıştırmalık', 1],
      ['Cips', 2],
      ['İçecek', 0],
    ]);
  });

  it('tam yolu saklar — aynı adlı alt kategoriler ayırt edilebilsin', () => {
    const opts = categorySource.toOptions(tree, ctx);
    const cips = opts.find((o) => o.label === 'Cips')!;
    expect(cips.value).toMatchObject({ id: 'c3', slug: 'cips', path: 'Gıda › Atıştırmalık › Cips' });
    expect(cips.hint).toBe('Gıda › Atıştırmalık');
  });

  it('özet tam yolu gösterir', () => {
    expect(categorySource.summarize({ path: 'Gıda › Cips', name: 'Cips' })).toBe('Gıda › Cips');
  });
});

describe('flashSaleSource', () => {
  const row = {
    _id: 'f1',
    name: 'Yaz İndirimi',
    discountType: 'percentage',
    discountValue: 25,
    startDate: '2026-06-01T00:00:00.000Z',
    endDate: '2026-06-30T23:59:59.000Z',
    showCountdown: true,
    bannerText: 'FLAŞ İNDİRİM',
    highlightColor: '#ef4444',
    status: 'active',
  };

  it('geri sayımın ihtiyaç duyduğu her alanı snapshot`lar', () => {
    const [opt] = flashSaleSource.toOptions([row], ctx);
    expect(opt.value).toMatchObject({
      id: 'f1',
      endDate: '2026-06-30T23:59:59.000Z',
      showCountdown: true,
      bannerText: 'FLAŞ İNDİRİM',
      highlightColor: '#ef4444',
      discountType: 'percentage',
      discountValue: 25,
    });
  });

  it('durumu rozete çevirir ve indirimi ipucunda gösterir', () => {
    const [opt] = flashSaleSource.toOptions([row], ctx);
    expect(opt.badge).toBe('Aktif');
    expect(opt.badgeTone).toBe('success');
    expect(opt.hint).toContain('%25');
  });

  it('status yoksa isActive`e düşer', () => {
    const [passive] = flashSaleSource.toOptions([{ ...row, status: undefined, isActive: false }], ctx);
    expect(passive.badge).toBe('Pasif');
  });

  it('showCountdown yalnız açıkça false ise kapanır', () => {
    const [a] = flashSaleSource.toOptions([{ ...row, showCountdown: undefined }], ctx);
    expect(a.value.showCountdown).toBe(true);
    const [b] = flashSaleSource.toOptions([{ ...row, showCountdown: false }], ctx);
    expect(b.value.showCountdown).toBe(false);
  });
});

describe('discountSource', () => {
  it('kupon kodunu ana etiket yapar ve ticari alanları saklar', () => {
    const [opt] = discountSource.toOptions(
      [
        {
          _id: 'd1',
          code: 'YAZ25',
          title: 'Yaz Kuponu',
          type: 'percentage',
          value: 25,
          minCartAmount: 500,
          maxDiscountAmount: 200,
          usageLimit: 100,
          usageCount: 12,
          isActive: true,
        },
      ],
      ctx
    );
    expect(opt.label).toBe('YAZ25');
    expect(opt.hint).toContain('12/100 kullanım');
    expect(opt.value).toMatchObject({ code: 'YAZ25', type: 'percentage', value: 25, minCartAmount: 500 });
  });

  it('süresi dolmuş kuponu Aktif göstermez — durum tarihten türetilir', () => {
    const [expired] = discountSource.toOptions(
      [{ _id: 'd3', code: 'ESKI', type: 'percentage', value: 10, isActive: true, endDate: '2020-01-01T00:00:00.000Z' }],
      ctx
    );
    expect(expired.badge).toBe('Süresi doldu');
    expect(expired.value.status).toBe('expired');

    const [scheduled] = discountSource.toOptions(
      [{ _id: 'd4', code: 'YENI', type: 'percentage', value: 10, isActive: true, startDate: '2099-01-01T00:00:00.000Z' }],
      ctx
    );
    expect(scheduled.badge).toBe('Planlandı');

    const [used] = discountSource.toOptions(
      [{ _id: 'd5', code: 'BITTI', type: 'fixed', value: 50, isActive: true, usageLimit: 10, usageCount: 10 }],
      ctx
    );
    expect(used.value.status).toBe('expired');
  });

  it('ücretsiz kargo tipini okunur yazar', () => {
    const [opt] = discountSource.toOptions(
      [{ _id: 'd2', code: 'KARGO', type: 'free_shipping', value: 0, isActive: true }],
      ctx
    );
    expect(opt.hint).toContain('ücretsiz kargo');
  });
});

describe('campaignSource', () => {
  it('efektif durumu tercih eder ve kupon kodunu taşır', () => {
    const [opt] = campaignSource.toOptions(
      [
        {
          _id: 'c1',
          name: 'Bahar Kampanyası',
          status: 'draft',
          effectiveStatus: 'active',
          discountCode: 'BAHAR',
          startDate: '2026-03-01T00:00:00.000Z',
          endDate: '2026-03-31T00:00:00.000Z',
        },
      ],
      ctx
    );
    expect(opt.badge).toBe('Aktif');
    expect(opt.value).toMatchObject({ status: 'active', discountCode: 'BAHAR' });
    expect(opt.hint).toContain('kod: BAHAR');
  });
});
