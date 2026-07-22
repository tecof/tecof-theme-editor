/**
 * E-ticaret seçici kaynakları.
 *
 * Her kaynak üç şeyi tarif eder:
 *   1. veriyi NEREDEN çekeceğini (apiClient metodu),
 *   2. ham kaydı listede NASIL göstereceğini (`toOption`),
 *   3. seçim yapılınca prop'a NE yazılacağını (`toOption().value`).
 *
 * ── Saklanan değerin altın kuralı ────────────────────────────────────────
 * Prop'a yazılan değer YAYINDA TEK BAŞINA YETERLİ olmalıdır. Bunun iki sebebi
 * var ve ikisi de mimari:
 *
 *   • Etiket/kupon/flaş satış gibi kayıtların storefront (secretKey) karşılığı
 *     YOKTUR; yayınlanmış sayfa bu kaydı yeniden okuyamaz. Ad, tarih, renk gibi
 *     gösterilecek her şey seçim anında kopyalanır ("snapshot").
 *   • Ürün listeleme ucu markayı ve etiketi **ObjectId** ile, kategoriyi ise
 *     **slug** ile filtreler (bkz. storeEcommerce.getProducts). Yalnız slug
 *     saklamak marka/etiket filtresini sessizce çalışmaz hâle getirirdi; bu
 *     yüzden `id` DE saklanır.
 *
 * Snapshot eskiyebilir (merchant markanın adını değiştirir). Bu bilinçli bir
 * takas: yayın tarafında sıfır istek + kırılmayan render. Temalar isterse
 * `id` üzerinden tazeleyebilir.
 */

import type { TecofApiClient } from '../../../api';

/* ─── Ortak tipler ─── */

/** Backend'in çok dilli alan formatı. */
export type LangValue = { code: string; value: string };

export interface SourceContext {
  apiClient: TecofApiClient;
  /** Editörde seçili aktif dil (yoksa mağazanın varsayılanı). */
  locale: string;
}

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

/** Seçim listesindeki tek satır. */
export interface EcommerceOption {
  /** Kayıt kimliği — seçili olanı işaretlemek ve tekrarları elemek için. */
  id: string;
  /** Ana metin. */
  label: string;
  /** Ağaç derinliği (kategori) — satır bu kadar girintilenir. */
  depth?: number;
  /** İkincil metin: slug, kod, tarih aralığı… */
  hint?: string;
  /** Sağ üstteki küçük durum rozeti. */
  badge?: string;
  badgeTone?: BadgeTone;
  /** Renk kutucuğu (renk özelliği / varyant değeri). */
  color?: string;
  /** Prop'a yazılacak değer — snapshot kuralı burada uygulanır. */
  value: Record<string, unknown>;
}

export interface EcommerceSource {
  /** Önbellek anahtarı. Dil ile birleştirilir. */
  key: string;
  /** Seçim yokken tetikleyicide görünen metin. */
  placeholder: string;
  /** Liste boşken gösterilecek metin (kayıt yoksa merchant'ı yönlendirir). */
  emptyLabel: string;
  /** Modal başlığı. */
  title: string;
  /** Veriyi çeken çağrı. `totalData` liste kırpıldıysa uyarı basmak için okunur. */
  load: (ctx: SourceContext) => Promise<{
    success: boolean;
    data?: unknown;
    message?: string;
    totalData?: number;
  }>;
  /** Ham kayıtları listeye çevirir. Sıralama burada belirlenir. */
  toOptions: (rows: any[], ctx: SourceContext) => EcommerceOption[];
  /** Saklanan değeri tek satırlık özete indirger (tetikleyici + rozet metni). */
  summarize: (value: any) => string;
}

/* ─── Yardımcılar ─── */

/**
 * Çok dilli alanı okur.
 *
 * Backend iki farklı şekil döndürebilir ve İKİSİ DE normaldir:
 *   • MERCHANT uçları ham diziyi verir  → [{ code: 'tr', value: 'Kırmızı' }]
 *   • PUBLIC uçları çeviriyi uygular    → 'Kırmızı'
 * Bu yüzden okuma tek noktada toplanır. İstenen dil boşsa ilk DOLU değere
 * düşer; aksi hâlde yeni eklenmiş bir dilde her şey boş görünürdü.
 */
export const readLang = (field: unknown, locale: string): string => {
  if (typeof field === 'string') return field;
  if (!Array.isArray(field)) return '';
  const list = field as LangValue[];
  const exact = list.find((l) => l && l.code === locale && l.value);
  if (exact) return exact.value;
  const filled = list.find((l) => l && l.value);
  return filled ? filled.value : '';
};

/** `2026-01-31T…` → `31.01.2026`. Geçersiz/boş tarihte boş string. */
export const formatDate = (value: unknown): string => {
  if (!value) return '';
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/** "01.06.2026 → 30.06.2026" / tek uçlu aralıklar / boş. */
const dateRange = (start: unknown, end: unknown): string => {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s && e) return `${s} → ${e}`;
  if (e) return `bitiş ${e}`;
  if (s) return `başlangıç ${s}`;
  return '';
};

/** İndirim değerini okunur metne çevirir. */
const discountLabel = (type: unknown, value: unknown): string => {
  const n = Number(value) || 0;
  if (type === 'percentage') return `%${n}`;
  if (type === 'free_shipping') return 'ücretsiz kargo';
  return `${n} ₺`;
};

/** Backend durum kodlarını Türkçe rozete çevirir. */
const STATUS_LABELS: Record<string, { label: string; tone: BadgeTone }> = {
  active: { label: 'Aktif', tone: 'success' },
  scheduled: { label: 'Planlandı', tone: 'neutral' },
  upcoming: { label: 'Yaklaşan', tone: 'neutral' },
  draft: { label: 'Taslak', tone: 'neutral' },
  paused: { label: 'Duraklatıldı', tone: 'warning' },
  expired: { label: 'Süresi doldu', tone: 'danger' },
  completed: { label: 'Tamamlandı', tone: 'neutral' },
  cancelled: { label: 'İptal', tone: 'danger' },
  passive: { label: 'Pasif', tone: 'neutral' },
  inactive: { label: 'Pasif', tone: 'neutral' },
};

const statusBadge = (status: unknown): { badge?: string; badgeTone?: BadgeTone } => {
  const key = String(status || '').toLowerCase();
  const hit = STATUS_LABELS[key];
  if (hit) return { badge: hit.label, badgeTone: hit.tone };
  return key ? { badge: key, badgeTone: 'neutral' } : {};
};

/**
 * Tarihe dayalı efektif durum.
 *
 * `flash-sales` ve `campaigns` uçları bunu backend'de hesaplayıp yanıta ekler;
 * `discounts` ucu (_crud) EKLEMEZ — orada yalnız `isActive` bayrağı vardır.
 * Aynı mantık burada tekrarlanmasaydı süresi dolmuş bir kupon listede "Aktif"
 * görünürdü.
 */
const effectiveStatus = (row: {
  isActive?: boolean;
  startDate?: unknown;
  endDate?: unknown;
  usageLimit?: number | null;
  usageCount?: number;
}): string => {
  if (row.isActive === false) return 'passive';
  const now = Date.now();
  const start = row.startDate ? new Date(row.startDate as string).getTime() : NaN;
  const end = row.endDate ? new Date(row.endDate as string).getTime() : NaN;
  if (!Number.isNaN(end) && end < now) return 'expired';
  if (!Number.isNaN(start) && start > now) return 'scheduled';
  if (row.usageLimit != null && (row.usageCount || 0) >= row.usageLimit) return 'expired';
  return 'active';
};

/** `data` alanını her zaman diziye indirger (hata durumunda boş dizi). */
const rowsOf = (res: { success: boolean; data?: unknown }): any[] =>
  res.success && Array.isArray(res.data) ? (res.data as any[]) : [];

/** Saklanan değerden özet üretir — alan adı kaynağa göre değişir. */
const summaryOf = (keys: string[]) => (value: any): string => {
  if (!value || typeof value !== 'object') return '';
  for (const k of keys) {
    const v = (value as Record<string, unknown>)[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return '';
};

export { rowsOf };

/* ─── Kaynaklar ─── */

/** Markalar — PUBLIC uç. Yalnız aktif markalar gelir, sıra backend'den. */
export const brandSource: EcommerceSource = {
  key: 'brands',
  title: 'Marka seç',
  placeholder: 'Marka seç',
  /* PUBLIC uç yalnız `status: active` markaları döndürür — "hiç marka yok" ile
     "hepsi pasif" ayrımı merchant'a bırakılır. */
  emptyLabel: 'Aktif marka bulunamadı — panelden marka ekleyin ya da mevcut markaları aktifleştirin.',
  load: ({ apiClient, locale }) => apiClient.getEcommerceBrands(locale),
  toOptions: (rows, { locale }) =>
    rows.map((row) => {
      const name = readLang(row.name, locale) || row.slug || 'Adsız marka';
      return {
        id: String(row._id),
        label: name,
        hint: row.slug ? `/${row.slug}` : undefined,
        value: {
          /* Ürün listeleme ucu markayı ObjectId ile filtreler — `id` şart. */
          id: String(row._id),
          slug: row.slug || '',
          name,
          /* Logo, populate edilmiş upload kaydıdır; tema TecofPicture'a verebilir. */
          image: row.imageId || null,
        },
      };
    }),
  summarize: summaryOf(['name', 'slug']),
};

/**
 * Kategoriler — PUBLIC uç. Yanıt bir AĞAÇTIR (kökler + `children`), seçim
 * listesi ise düzdür; ağaç derinlik-öncelikli gezilip `depth` ile girintilenir.
 * Sıra backend'den gelir (order), bozulmasın diye yeniden sıralanmaz.
 */
export const categorySource: EcommerceSource = {
  key: 'categories',
  title: 'Kategori seç',
  placeholder: 'Kategori seç',
  emptyLabel: 'Kayıtlı kategori yok — panelden kategori ekleyin.',
  load: ({ apiClient, locale }) => apiClient.getEcommerceCategories(locale),
  toOptions: (rows, { locale }) => {
    const out: EcommerceOption[] = [];

    const walk = (nodes: any[], depth: number, trail: string[]) => {
      for (const node of nodes) {
        if (!node) continue;
        const name = readLang(node.name, locale) || node.slug || 'Adsız kategori';
        const path = [...trail, name];
        out.push({
          id: String(node._id),
          label: name,
          depth,
          /* Aynı adı taşıyan alt kategoriler ayırt edilebilsin diye üst yol
             gösterilir ("Gıda › Atıştırmalık"). */
          hint: trail.length ? trail.join(' › ') : node.slug ? `/${node.slug}` : undefined,
          value: {
            /* Ürün listeleme ucu kategoriyi SLUG ile filtreler (marka/etiketin
               aksine); `id` yine de saklanır — slug değişirse onarım için. */
            id: String(node._id),
            slug: node.slug || '',
            name,
            path: path.join(' › '),
          },
        });
        if (Array.isArray(node.children) && node.children.length) {
          walk(node.children, depth + 1, path);
        }
      }
    };

    walk(rows, 0, []);
    return out;
  },
  summarize: summaryOf(['path', 'name', 'slug']),
};

/** Etiketler — MERCHANT uç (vitrinde karşılığı yok). */
export const tagSource: EcommerceSource = {
  key: 'tags',
  title: 'Etiket seç',
  placeholder: 'Etiket seç',
  emptyLabel: 'Kayıtlı etiket yok — panelden etiket ekleyin.',
  load: ({ apiClient }) => apiClient.getEcommerceTags(),
  toOptions: (rows, { locale }) =>
    rows
      .map((row) => {
        const name = readLang(row.name, locale) || row.slug || 'Adsız etiket';
        return {
          id: String(row._id),
          label: name,
          hint: row.slug ? `/${row.slug}` : undefined,
          value: {
            /* Etiket filtresi YALNIZ ObjectId kabul eder (slug sessizce yok
               sayılır) — `id` olmadan liste boş döner. */
            id: String(row._id),
            slug: row.slug || '',
            name,
            /* Ham çok dilli dizi de saklanır: `name` seçim ANINDAKİ dile
               indirgenmiştir; çok dilli mağazada tema `getL(nameI18n, locale)`
               ile doğru dili basabilsin. (Merchant uçları ham diziyi verir;
               PUBLIC uçlar çeviriyi zaten uyguladığı için orada yoktur.) */
            nameI18n: row.name,
          },
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label, 'tr')),
  summarize: summaryOf(['name', 'slug']),
};

/** Ürün özellikleri (renk/beden gibi filtrelenebilir alanlar) — MERCHANT uç. */
export const attributeSource: EcommerceSource = {
  key: 'attributes',
  title: 'Ürün özelliği seç',
  placeholder: 'Özellik seç',
  emptyLabel: 'Kayıtlı özellik yok — panelden özellik tanımlayın.',
  load: ({ apiClient }) => apiClient.getEcommerceAttributes(),
  /* _crud yalnız `deleteCode` filtreler; pasife alınmış özellikler de gelir.
     Vitrinde gösterilmeyecek bir özelliği seçtirmemek için burada elenir. */
  toOptions: (rows, { locale }) =>
    rows
      .filter((row) => row?.status !== 'inactive')
      .map((row) => {
      const name = readLang(row.name, locale) || row.slug || 'Adsız özellik';
      const options = Array.isArray(row.options) ? row.options : [];
      return {
        id: String(row._id),
        label: name,
        hint: [row.type, options.length ? `${options.length} değer` : '']
          .filter(Boolean)
          .join(' · '),
        ...(row.isFilterable ? { badge: 'Filtrelenebilir', badgeTone: 'success' as BadgeTone } : {}),
        value: {
          /* Ürün listeleme ucunun `attrs` filtresi attributeId bekler. */
          id: String(row._id),
          slug: row.slug || '',
          name,
          nameI18n: row.name,
          type: row.type || 'text',
          isFilterable: !!row.isFilterable,
          /* Değerler de kopyalanır: swatch/filtre bileşeni yayında ek istek
             atmadan seçenekleri çizebilsin. */
          options: options.map((o: any) => ({
            value: o.value,
            label: readLang(o.label, locale) || o.value,
            colorCode: o.colorCode || null,
          })),
        },
      };
    }),
  summarize: summaryOf(['name', 'slug']),
};

/** Varyant tipleri (Renk, Beden…) — MERCHANT uç. Swatch bileşenleri için. */
export const variantTypeSource: EcommerceSource = {
  key: 'variant-types',
  title: 'Varyant tipi seç',
  placeholder: 'Varyant tipi seç',
  emptyLabel: 'Kayıtlı varyant tipi yok — panelden tanımlayın.',
  load: ({ apiClient }) => apiClient.getEcommerceVariantTypes(),
  toOptions: (rows, { locale }) =>
    rows.map((row) => {
      const name = readLang(row.name, locale) || 'Adsız varyant tipi';
      const values = Array.isArray(row.values) ? row.values : [];
      return {
        id: String(row._id),
        label: name,
        hint: [row.selectionType, values.length ? `${values.length} değer` : '']
          .filter(Boolean)
          .join(' · '),
        color: values.find((v: any) => v.colorCode)?.colorCode || undefined,
        value: {
          id: String(row._id),
          name,
          nameI18n: row.name,
          selectionType: row.selectionType || 'button',
          values: values.map((v: any) => ({
            /* Değerin KENDİ `_id`'si şart: ürün varyantları değere yalnız
               `variantValues[].variantValueId` üzerinden bağlanır. Bu alan
               düşerse swatch, ürünün hangi varyantına denk geldiğini
               eşleştiremez. */
            id: String(v._id ?? ''),
            label: readLang(v.value, locale),
            colorCode: v.colorCode || null,
            /* _crud populate uygulamaz — ham ObjectId gelir. Görsel gerekiyorsa
               backend'e populate eklenmeli. */
            image: v.imageId || null,
          })),
        },
      };
    }),
  summarize: summaryOf(['name']),
};

/** Flaş satışlar — MERCHANT uç. Liste yanıtına efektif `status` eklenir. */
export const flashSaleSource: EcommerceSource = {
  key: 'flash-sales',
  title: 'Flaş satış seç',
  placeholder: 'Flaş satış seç',
  emptyLabel: 'Kayıtlı flaş satış yok — panelden oluşturun.',
  load: ({ apiClient }) => apiClient.getEcommerceFlashSales(),
  toOptions: (rows) =>
    rows.map((row) => ({
      id: String(row._id),
      label: row.name || 'Adsız flaş satış',
      hint: [discountLabel(row.discountType, row.discountValue), dateRange(row.startDate, row.endDate)]
        .filter(Boolean)
        .join(' · '),
      color: row.highlightColor || undefined,
      ...statusBadge(row.status ?? (row.isActive ? 'active' : 'passive')),
      value: {
        id: String(row._id),
        name: row.name || '',
        /* Durum da kopyalanır: tema pasif/süresi dolmuş kampanyayı gizleyebilsin.
           Snapshot seçim anında DONAR — panelde sonradan değişen tarih/durum
           buraya yansımaz, merchant'ın yeniden seçmesi gerekir. */
        status: row.status || (row.isActive === false ? 'passive' : 'active'),
        isActive: row.isActive !== false,
        /* Geri sayım bandı bu üçünü doğrudan kullanır — yayında flaş satış
           kaydını okuyacak public uç YOK. */
        startDate: row.startDate || null,
        endDate: row.endDate || null,
        showCountdown: row.showCountdown !== false,
        bannerText: row.bannerText || '',
        highlightColor: row.highlightColor || '',
        discountType: row.discountType || 'percentage',
        discountValue: Number(row.discountValue) || 0,
      },
    })),
  summarize: summaryOf(['name', 'bannerText']),
};

/** Pazarlama kampanyaları — MERCHANT uç. `effectiveStatus` tarihten türetilir. */
export const campaignSource: EcommerceSource = {
  key: 'campaigns',
  title: 'Kampanya seç',
  placeholder: 'Kampanya seç',
  emptyLabel: 'Kayıtlı kampanya yok — panelden oluşturun.',
  load: ({ apiClient }) => apiClient.getEcommerceCampaigns(),
  toOptions: (rows) =>
    rows.map((row) => ({
      id: String(row._id),
      label: row.name || 'Adsız kampanya',
      hint: [row.discountCode ? `kod: ${row.discountCode}` : '', dateRange(row.startDate, row.endDate)]
        .filter(Boolean)
        .join(' · '),
      ...statusBadge(row.effectiveStatus || row.status),
      value: {
        id: String(row._id),
        name: row.name || '',
        status: row.effectiveStatus || row.status || 'draft',
        startDate: row.startDate || null,
        endDate: row.endDate || null,
        /* Kampanyanın vitrinde işe yarayan tek ticari alanı: duyurulacak kod. */
        discountCode: row.discountCode || '',
      },
    })),
  summarize: summaryOf(['name', 'discountCode']),
};

/** Kuponlar / indirim kodları — MERCHANT uç. */
export const discountSource: EcommerceSource = {
  key: 'discounts',
  title: 'Kupon seç',
  placeholder: 'Kupon seç',
  emptyLabel: 'Kayıtlı kupon yok — panelden indirim kodu oluşturun.',
  load: ({ apiClient }) => apiClient.getEcommerceDiscounts(),
  toOptions: (rows) =>
    rows.map((row) => {
      const code = row.code || '';
      const limitText =
        row.usageLimit != null ? `${row.usageCount || 0}/${row.usageLimit} kullanım` : '';
      return {
        id: String(row._id),
        label: code || row.title || 'Adsız kupon',
        hint: [
          row.title || '',
          discountLabel(row.type, row.value),
          row.minCartAmount ? `min ${row.minCartAmount} ₺` : '',
          limitText,
          dateRange(row.startDate, row.endDate),
        ]
          .filter(Boolean)
          .join(' · '),
        ...statusBadge(effectiveStatus(row)),
        value: {
          id: String(row._id),
          /* Ziyaretçiye gösterilen/panoya kopyalanan asıl bilgi koddur. */
          code,
          /* Tema süresi dolmuş kuponu gizleyebilsin diye durum da kopyalanır —
             snapshot seçim anında donar, canlı durum takip edilmez. */
          status: effectiveStatus(row),
          isActive: row.isActive !== false,
          title: row.title || '',
          type: row.type || 'percentage',
          value: Number(row.value) || 0,
          minCartAmount: Number(row.minCartAmount) || 0,
          maxDiscountAmount: row.maxDiscountAmount ?? null,
          startDate: row.startDate || null,
          endDate: row.endDate || null,
        },
      };
    }),
  summarize: summaryOf(['code', 'title']),
};
