// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { PANEL_PATHS, buildPanelUrl, DEFAULT_PANEL_URL } from '../panelLinks';

/**
 * Panel bağlantısı sözleşmesi.
 *
 * Adres iki parçadan kurulur: host'un verdiği taban (`panelUrl`) ve buradaki
 * yol. İki kırılma noktası var ve ikisi de kullanıcıya BOZUK bir bağlantı
 * olarak yansır:
 *   (1) taban sonunda `/` varsa `//app/...` çıkar,
 *   (2) taban hiç yoksa mutlak olmayan, boş bir adres üretilir.
 * Bu testler ikisini de sabitler.
 */

describe('buildPanelUrl', () => {
  it('taban sonundaki slash ile yol başındaki slash çift slash üretmez', () => {
    expect(buildPanelUrl('https://app.tecof.com/', '/app/cms')).toBe('https://app.tecof.com/app/cms');
    expect(buildPanelUrl('https://app.tecof.com///', '///app/cms')).toBe('https://app.tecof.com/app/cms');
  });

  it('tabanda slash, yolda slash olmayan hâlleri de birleştirir', () => {
    expect(buildPanelUrl('https://app.tecof.com', 'app/cms')).toBe('https://app.tecof.com/app/cms');
    expect(buildPanelUrl('https://app.tecof.com', '/app/cms')).toBe('https://app.tecof.com/app/cms');
  });

  it('boş/tanımsız tabanda göreli yol döner (aynı alan adında gömülü editör)', () => {
    expect(buildPanelUrl('', '/app/cms')).toBe('/app/cms');
    expect(buildPanelUrl(undefined, 'app/cms')).toBe('/app/cms');
    expect(buildPanelUrl(null, '/app/cms')).toBe('/app/cms');
  });

  it('boşlukla gelen tabanı kırpar', () => {
    expect(buildPanelUrl('  https://app.tecof.com  ', '/app/cms')).toBe('https://app.tecof.com/app/cms');
    expect(buildPanelUrl('   ', '/app/cms')).toBe('/app/cms');
  });

  it('varsayılan panel adresiyle çalışır', () => {
    expect(buildPanelUrl(DEFAULT_PANEL_URL, PANEL_PATHS.products)).toBe(
      'https://app.tecof.com/app/ecommerce/products'
    );
  });
});

describe('PANEL_PATHS', () => {
  it('cmsItemNew koleksiyon kimliğini yola gömer', () => {
    expect(PANEL_PATHS.cmsItemNew('64f0a1')).toBe('/app/cms/64f0a1/new');
  });

  it('cmsItemNew boş kimlikte de geçerli bir yol üretir', () => {
    expect(PANEL_PATHS.cmsItemNew('')).toBe('/app/cms//new');
  });

  it('cmsItemNew kimliği URL için kaçışlar (slug slash taşıyabilir)', () => {
    expect(PANEL_PATHS.cmsItemNew('blog yazıları')).toBe('/app/cms/blog%20yaz%C4%B1lar%C4%B1/new');
    expect(PANEL_PATHS.cmsItemNew('a/b')).toBe('/app/cms/a%2Fb/new');
  });

  /* Panelde `/app/themes/<id>` rotası YOK (yalnız `[themaId]/code` ve
     `[themaId]/design/[pageId]`), tema id'siyle bağlanmak 404'tü. */
  it('pages her zaman tema listesi ekranıdır', () => {
    expect(PANEL_PATHS.pages).toBe('/app/themes');
  });

  it('productEdit ürün ekranını hedefler', () => {
    expect(PANEL_PATHS.productEdit('p1')).toBe('/app/ecommerce/products/p1');
  });

  /* Yollar panelin gerçek rotalarıdır; sessizce değişirse editördeki her
     bağlantı 404 olur. Bu yüzden sabitler de kilitlenir. */
  it('sabit yollar panel rotalarıyla birebir', () => {
    expect(PANEL_PATHS.productNew).toBe('/app/ecommerce/products/new');
    expect(PANEL_PATHS.categoryNew).toBe('/app/ecommerce/categories/new');
    expect(PANEL_PATHS.brands).toBe('/app/ecommerce/settings/brands');
    expect(PANEL_PATHS.tags).toBe('/app/ecommerce/settings/tags');
    expect(PANEL_PATHS.attributes).toBe('/app/ecommerce/settings/attributes');
    expect(PANEL_PATHS.variantTypes).toBe('/app/ecommerce/settings/variant-types');
    expect(PANEL_PATHS.flashSales).toBe('/app/discounts/flash-sales');
    expect(PANEL_PATHS.campaigns).toBe('/app/marketing/campaigns');
    expect(PANEL_PATHS.discounts).toBe('/app/discounts/codes');
    expect(PANEL_PATHS.cmsCollectionNew).toBe('/app/cms/create');
  });
});
