/**
 * Panel (app.tecof.com) bağlantıları.
 *
 * Editördeki seçiciler merchant'ın KAYDINI oluşturmaz; yalnız var olanı seçtirir.
 * "Hiç marka yok", "yayında ürün yok", "koleksiyon yok" gibi çıkmazlarda
 * kullanıcı editörden çıkmadan doğru panel ekranına gidebilmeli — aksi hâlde
 * boş listeye bakıp nereye gideceğini tahmin etmek zorunda kalıyor.
 *
 * Yollar TEK yerde durur: panelde bir rota değişirse tek dosya güncellenir.
 * Adresin tabanı (`panelUrl`) editöre prop'tan gelir ve Studio context'inde
 * taşınır; alan bileşenleri Studio DIŞINDA da render edilebildiği için
 * `DEFAULT_PANEL_URL` her zaman geçerli bir yedek sağlar.
 */

/** Prop verilmediğinde kullanılan üretim paneli. */
export const DEFAULT_PANEL_URL = 'https://app.tecof.com';

/**
 * Panel rotaları (taban adres HARİÇ — hepsi `/` ile başlar).
 *
 * Not: "yeni kayıt" ekranları panelde ayrı sayfa değil, `[productId]`/
 * `[categoryId]`/`[itemId]` dinamik rotalarının `new` değeridir — panel bunu
 * `isNew` olarak okur.
 */
export const PANEL_PATHS = {
  /* E-ticaret */
  products: '/app/ecommerce/products',
  productNew: '/app/ecommerce/products/new',
  /** Tek ürünün panel ekranı — varyantlar orada, ürünün İÇİNDE düzenlenir. */
  productEdit: (productId: string): string =>
    `/app/ecommerce/products/${encodeURIComponent(String(productId || '').trim())}`,
  categories: '/app/ecommerce/categories',
  categoryNew: '/app/ecommerce/categories/new',
  brands: '/app/ecommerce/settings/brands',
  tags: '/app/ecommerce/settings/tags',
  attributes: '/app/ecommerce/settings/attributes',
  variantTypes: '/app/ecommerce/settings/variant-types',

  /* Kampanya / indirim */
  flashSales: '/app/discounts/flash-sales',
  campaigns: '/app/marketing/campaigns',
  discounts: '/app/discounts/codes',

  /* İçerik (CMS) */
  cms: '/app/cms',
  cmsCollectionNew: '/app/cms/create',
  /** Koleksiyona yeni içerik ekleme ekranı. */
  cmsItemNew: (collectionId: string): string =>
    `/app/cms/${encodeURIComponent(String(collectionId || '').trim())}/new`,

  /** Tema sayfaları. Tema id'si verilirse o temanın sayfa listesine gider. */
  pages: (themeId?: string | null): string => {
    const id = String(themeId || '').trim();
    return id ? `/app/themes/${encodeURIComponent(id)}` : '/app/themes';
  },
} as const;

/**
 * Taban adres ile yolu birleştirir.
 *
 * Taban sonundaki ve yol başındaki `/` tekrarları temizlenir (`.../` + `/app`
 * → tek slash). Taban boşsa göreli yol döner: editör panelin KENDİ alan adında
 * gömülüyse bu da çalışan bir adrestir.
 */
export const buildPanelUrl = (base: string | null | undefined, path: string): string => {
  const cleanBase = String(base ?? '').trim().replace(/\/+$/, '');
  const cleanPath = `/${String(path ?? '').trim().replace(/^\/+/, '')}`;
  return cleanBase ? `${cleanBase}${cleanPath}` : cleanPath;
};
