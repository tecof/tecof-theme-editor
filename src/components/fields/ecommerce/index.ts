/**
 * E-ticaret seçici alanları.
 *
 * Temalar bu fabrikaları bileşenlerinin `fields` tanımında kullanır; merchant
 * artık slug/id elle yazmaz, panelindeki gerçek kayıttan seçer.
 *
 * ```tsx
 * import { createBrandField, createFlashSaleField } from "@tecof/theme-editor";
 *
 * fields: {
 *   brand:     createBrandField({ label: "Marka" }),
 *   brands:    createBrandListField({ label: "Markalar", max: 8 }),
 *   flashSale: createFlashSaleField({ label: "Flaş Satış" }),
 * }
 * ```
 *
 * Seçim, prop'a yayında tek başına render edilebilecek bir "snapshot" yazar
 * (ad, slug, id, tarih, renk…). Gerekçesi sources.ts başında.
 *
 * ── Veri kaynağı ve yetki ────────────────────────────────────────────────
 * Marka ve ürün PUBLIC uçlardan gelir; etiket, özellik, varyant tipi, flaş
 * satış, kampanya ve kupon MERCHANT uçlarındadır ve JWT ister. Seçiciler
 * yalnız editörde çalıştığı için bu sorun değildir (TecofStudio token'ı
 * apiClient'a basar), ama editör dışında (salt secretKey ile) bir host bu
 * alanları render ederse liste "yetki" hatasıyla boş gelir.
 */

import { createEcommerceField, type EcommerceFieldOptions } from './EcommerceField';
import {
  attributeSource,
  brandSource,
  campaignSource,
  categorySource,
  discountSource,
  flashSaleSource,
  tagSource,
  variantTypeSource,
} from './sources';

export { createEcommerceField } from './EcommerceField';
export type { EcommerceFieldOptions } from './EcommerceField';
export type { EcommerceOption, EcommerceSource, SourceContext } from './sources';
export { readLang, formatDate } from './sources';
/* Hazır kaynaklar da dışa açılır: tema/host kendi seçicisini
   `createEcommerceField(brandSource, …)` ile türetebilsin. */
export {
  attributeSource,
  brandSource,
  campaignSource,
  categorySource,
  discountSource,
  flashSaleSource,
  tagSource,
  variantTypeSource,
} from './sources';
export { createVariantField, type VariantFieldOptions, type VariantFieldValue } from './VariantField';
export {
  createProductField,
  createProductListField,
  type ProductFieldOptions,
  type ProductFieldValue,
} from './ProductField';

/* ── Saklanan değerlerin tipleri ──
   Temalar prop'u `any` olarak okumak zorunda kalmasın; her alanın ne yazdığı
   burada TEK yerde tanımlıdır (üretimi sources.ts'te). */

/** `createBrandField` değeri. */
export interface BrandFieldValue {
  id: string;
  slug: string;
  name: string;
  /** Populate edilmiş logo kaydı (`{_id, name, type, meta}`) ya da null. */
  image?: unknown;
}

/** `createCategoryField` değeri. Ürün listeleme ucu kategoriyi SLUG ile filtreler. */
export interface CategoryFieldValue {
  id: string;
  slug: string;
  name: string;
  /** "Gıda › Atıştırmalık › Cips" — ağaçtaki tam yol. */
  path: string;
}

/** `createTagField` değeri. Ürün filtresi YALNIZ `id` kabul eder. */
export interface TagFieldValue {
  id: string;
  slug: string;
  name: string;
  /** Ham çok dilli ad — çok dilli mağazada `getL(nameI18n, locale)`. */
  nameI18n?: Array<{ code: string; value: string }>;
}

/** `createAttributeField` değeri. */
export interface AttributeFieldValue {
  id: string;
  slug: string;
  name: string;
  nameI18n?: Array<{ code: string; value: string }>;
  type: string;
  isFilterable: boolean;
  options: Array<{ value: string; label: string; colorCode: string | null }>;
}

/** `createVariantTypeField` değeri. */
export interface VariantTypeFieldValue {
  id: string;
  name: string;
  nameI18n?: Array<{ code: string; value: string }>;
  selectionType: string;
  values: Array<{ id: string; label: string; colorCode: string | null; image?: unknown }>;
}

/** `createFlashSaleField` değeri. */
export interface FlashSaleFieldValue {
  id: string;
  name: string;
  status: string;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  showCountdown: boolean;
  bannerText: string;
  highlightColor: string;
  discountType: 'percentage' | 'fixed' | string;
  discountValue: number;
}

/** `createCampaignField` değeri. */
export interface CampaignFieldValue {
  id: string;
  name: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  discountCode: string;
}

/** `createDiscountField` değeri. */
export interface DiscountFieldValue {
  id: string;
  code: string;
  title: string;
  status: string;
  isActive: boolean;
  type: 'percentage' | 'fixed' | 'free_shipping' | string;
  value: number;
  minCartAmount: number;
  maxDiscountAmount: number | null;
  startDate: string | null;
  endDate: string | null;
}

/** Tekil seçicilerde `multiple` dışarıya kapalıdır. */
type SingleOptions = Omit<EcommerceFieldOptions, 'multiple' | 'max'>;
/** Çoklu seçicilerde `multiple` zaten açıktır. */
type ListOptions = Omit<EcommerceFieldOptions, 'multiple'>;

/**
 * Kategori seçici — değer `{ id, slug, name, path }`.
 *
 * Liste, kategori AĞACININ düzleştirilmiş hâlidir (alt kategoriler girintili).
 * Ürün listeleme ucu kategoriyi **slug** ile filtreler — marka/etiketin
 * aksine burada slug asıl anahtardır.
 */
export const createCategoryField = (options: SingleOptions = {}) =>
  createEcommerceField(categorySource, { label: 'Kategori', ...options });

/** Çoklu kategori seçici — vitrin şeridi, mega menü kolonu. */
export const createCategoryListField = (options: ListOptions = {}) =>
  createEcommerceField(categorySource, { label: 'Kategoriler', ...options, multiple: true });

/**
 * Marka seçici — değer `{ id, slug, name, image }`.
 *
 * Ürün listeleme ucu markayı **id** ile filtreler (`?brand=<ObjectId>`),
 * marka sayfası bağlantısı ise **slug** ister; ikisi de saklanır.
 */
export const createBrandField = (options: SingleOptions = {}) =>
  createEcommerceField(brandSource, { label: 'Marka', ...options });

/** Çoklu marka seçici — logo şeridi, marka vitrini, çoklu marka filtresi. */
export const createBrandListField = (options: ListOptions = {}) =>
  createEcommerceField(brandSource, { label: 'Markalar', ...options, multiple: true });

/**
 * Etiket seçici — değer `{ id, slug, name }`.
 *
 * ⚠ Ürün listeleme ucu etiketi YALNIZ **id** ile filtreler; slug gönderilirse
 * filtre sessizce uygulanmaz ve tüm ürünler döner.
 */
export const createTagField = (options: SingleOptions = {}) =>
  createEcommerceField(tagSource, { label: 'Etiket', ...options });

/** Çoklu etiket seçici — kürasyon şeritleri ("Yeni Sezon", "Outlet"). */
export const createTagListField = (options: ListOptions = {}) =>
  createEcommerceField(tagSource, { label: 'Etiketler', ...options, multiple: true });

/**
 * Ürün özelliği seçici — değer `{ id, slug, name, type, isFilterable, options[] }`.
 * Seçeneklerin etiketi ve renk kodu da kopyalanır: renk/beden swatch'ı yayında
 * ek istek atmadan çizilir.
 */
export const createAttributeField = (options: SingleOptions = {}) =>
  createEcommerceField(attributeSource, { label: 'Ürün Özelliği', ...options });

/** Çoklu özellik seçici — filtre çubuğunda gösterilecek facet'ler. */
export const createAttributeListField = (options: ListOptions = {}) =>
  createEcommerceField(attributeSource, { label: 'Ürün Özellikleri', ...options, multiple: true });

/**
 * Varyant tipi seçici (Renk, Beden…) — değer `{ id, name, selectionType, values[] }`.
 * Ürünün kendi varyantını seçmek için `createVariantField` kullanın.
 */
export const createVariantTypeField = (options: SingleOptions = {}) =>
  createEcommerceField(variantTypeSource, { label: 'Varyant Tipi', ...options });

/**
 * Flaş satış seçici — değer `{ id, name, startDate, endDate, showCountdown,
 * bannerText, highlightColor, discountType, discountValue }`.
 *
 * Geri sayım bandının bitiş tarihini elle ISO yazmak yerine kampanyadan
 * okumasını sağlar.
 *
 * ⚠ Değer seçim anında DONAR (snapshot). Panelde kampanyanın tarihi sonradan
 * değişirse banner eski tarihi göstermeye devam eder — merchant'ın alanı
 * yeniden seçmesi gerekir. Canlı takip ancak flaş satışın storefront ucu
 * açılırsa mümkün olur.
 */
export const createFlashSaleField = (options: SingleOptions = {}) =>
  createEcommerceField(flashSaleSource, { label: 'Flaş Satış', ...options });

/**
 * Pazarlama kampanyası seçici — değer `{ id, name, status, startDate, endDate,
 * discountCode }`.
 *
 * NOT: Kampanya kaydı bir PAZARLAMA kaydıdır (bütçe, kanal, metrik); vitrinde
 * işe yarayan alanları adı, tarihi ve duyurduğu kupon kodudur. Ürüne indirim
 * uygulayan yapı flaş satış ya da kupondur.
 */
export const createCampaignField = (options: SingleOptions = {}) =>
  createEcommerceField(campaignSource, { label: 'Kampanya', ...options });

/**
 * Kupon seçici — değer `{ id, code, title, type, value, minCartAmount,
 * maxDiscountAmount, startDate, endDate }`.
 *
 * Duyuru barı / CtaCard "kodu kopyala" gibi yerlerde kodu elle yazmayı bitirir.
 */
export const createDiscountField = (options: SingleOptions = {}) =>
  createEcommerceField(discountSource, { label: 'Kupon', ...options });
