import type {
  EmailBlockCatalogItem,
  EmailBlockPropsMap,
  EmailBlockType,
  EmailColumnsLayout,
  EmailMergeTag,
  EmailSpacing,
  EmailTheme,
} from './types';

export const EMAIL_DOCUMENT_VERSION = 1 as const;

export const DEFAULT_EMAIL_THEME: Readonly<EmailTheme> = Object.freeze({
  width: 600,
  backgroundColor: '#f4f4f5',
  contentBackgroundColor: '#ffffff',
  primaryColor: '#74b500',
  textColor: '#18181b',
  mutedTextColor: '#71717a',
  fontFamily: 'Arial, Helvetica, sans-serif',
  borderRadius: 12,
});

const spacing = (top: number, right: number, bottom: number, left: number): EmailSpacing => ({
  top,
  right,
  bottom,
  left,
});

export const EMAIL_BLOCK_DEFAULTS: Readonly<EmailBlockPropsMap> = Object.freeze<EmailBlockPropsMap>({
  logo: {
    src: '{{merchant.logoUrl}}',
    alt: '{{merchant.name}}',
    href: '{{merchant.storeUrl}}',
    width: 160,
    align: 'center',
    padding: spacing(28, 32, 20, 32),
  },
  heading: {
    text: 'Başlığınızı buraya yazın',
    level: 1,
    color: '#18181b',
    align: 'center',
    fontSize: 32,
    lineHeight: 1.2,
    fontWeight: 700,
    padding: spacing(20, 32, 12, 32),
  },
  text: {
    text: 'Mesajınızı buraya yazın.',
    color: '#3f3f46',
    align: 'left',
    fontSize: 16,
    lineHeight: 1.6,
    padding: spacing(8, 32, 16, 32),
  },
  button: {
    label: 'Şimdi incele',
    href: '{{merchant.storeUrl}}',
    backgroundColor: '#74b500',
    color: '#ffffff',
    align: 'center',
    width: 220,
    height: 48,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    padding: spacing(16, 32, 24, 32),
  },
  image: {
    src: '{{campaign.heroImageUrl}}',
    alt: 'Kampanya görseli',
    href: '{{merchant.storeUrl}}',
    width: 536,
    align: 'center',
    padding: spacing(12, 32, 12, 32),
  },
  divider: {
    color: '#e4e4e7',
    width: 100,
    thickness: 1,
    padding: spacing(16, 32, 16, 32),
  },
  spacer: {
    height: 24,
    mobileHeight: 16,
  },
  social: {
    title: 'Bizi takip edin',
    links: [],
    color: '#52525b',
    align: 'center',
    fontSize: 14,
    padding: spacing(16, 32, 28, 32),
  },
  coupon: {
    eyebrow: 'SİZE ÖZEL',
    code: '{{coupon.code}}',
    description: 'Ödeme adımında bu kodu kullanın.',
    backgroundColor: '#f7fee7',
    color: '#365314',
    borderColor: '#a3e635',
    align: 'center',
    padding: spacing(16, 32, 20, 32),
  },
  product: {
    imageUrl: '{{product.imageUrl}}',
    imageAlt: '{{product.name}}',
    title: '{{product.name}}',
    description: '{{product.description}}',
    price: '{{product.price}}',
    oldPrice: '{{product.oldPrice}}',
    url: '{{product.url}}',
    buttonLabel: 'Ürünü incele',
    imageWidth: 180,
    accentColor: '#74b500',
    backgroundColor: '#fafafa',
    padding: spacing(16, 32, 20, 32),
  },
  /* 2026-09-21 stüdyo blokları — backend DEFAULT_PROPS ile birebir */
  video: {
    thumbnailUrl: '{{campaign.heroImageUrl}}',
    videoUrl: '{{merchant.storeUrl}}',
    alt: 'Video',
    caption: 'Videoyu izle',
    showCaption: true,
    width: 536,
    align: 'center',
    padding: spacing(12, 32, 12, 32),
  },
  footer: {
    text: '{{merchant.name}}\n{{merchant.address}}',
    color: '#71717a',
    fontSize: 12,
    align: 'center',
    links: [],
    showUnsubscribe: true,
    unsubscribeLabel: 'Abonelikten çık',
    padding: spacing(20, 32, 28, 32),
  },
  menu: {
    items: [],
    color: '#3f3f46',
    fontSize: 14,
    fontWeight: 600,
    align: 'center',
    separator: 'dot',
    padding: spacing(12, 32, 12, 32),
  },
  html: {
    html: '',
    padding: spacing(0, 32, 0, 32),
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: spacing(0, 0, 0, 0),
    blocks: [],
  },
  columns: {
    layout: '1:1',
    gap: 16,
    verticalAlign: 'top',
    stackOnMobile: true,
    padding: spacing(0, 32, 0, 32),
    columns: [[], []],
  },
});

/** Sütun düzenleri — ağırlık listesi (backend EMAIL_COLUMN_LAYOUTS ile aynı) */
export const EMAIL_COLUMN_LAYOUTS: Readonly<Record<EmailColumnsLayout, readonly number[]>> = Object.freeze({
  '1': [1],
  '1:1': [1, 1],
  '1:1:1': [1, 1, 1],
  '1:1:1:1': [1, 1, 1, 1],
  '1:2': [1, 2],
  '2:1': [2, 1],
  '1:3': [1, 3],
  '3:1': [3, 1],
});

export const EMAIL_CONTAINER_BLOCK_TYPES = Object.freeze(['section', 'columns'] as const);
export const EMAIL_MENU_SEPARATORS = Object.freeze(['dot', 'pipe', 'space', 'none'] as const);
export const EMAIL_VERTICAL_ALIGNMENTS = Object.freeze(['top', 'middle', 'bottom'] as const);
/** Ham HTML bloğunun sınırı (backend MAX_EMAIL_HTML_BLOCK_BYTES) */
export const EMAIL_HTML_BLOCK_MAX_BYTES = 24 * 1024;

const catalogItem = <T extends EmailBlockType>(
  type: T,
  label: string,
  description: string,
  category: EmailBlockCatalogItem<T>['category']
): EmailBlockCatalogItem<T> => ({
  type,
  label,
  description,
  category,
  defaultProps: EMAIL_BLOCK_DEFAULTS[type],
});

export const EMAIL_BLOCK_CATALOG: readonly EmailBlockCatalogItem[] = Object.freeze([
  catalogItem('logo', 'Logo', 'Marka logosu ve mağaza bağlantısı', 'content'),
  catalogItem('heading', 'Başlık', 'Hiyerarşik kampanya başlığı', 'content'),
  catalogItem('text', 'Metin', 'Güvenli düz metin ve kişiselleştirme alanları', 'content'),
  catalogItem('button', 'Buton', 'Outlook uyumlu harekete geçirici buton', 'content'),
  catalogItem('image', 'Görsel', 'Akışkan kampanya görseli', 'content'),
  catalogItem('divider', 'Ayraç', 'Yatay içerik ayırıcı', 'layout'),
  catalogItem('spacer', 'Boşluk', 'Masaüstü ve mobil kontrollü dikey boşluk', 'layout'),
  catalogItem('social', 'Sosyal bağlantılar', 'İzinli sosyal ağ bağlantıları', 'content'),
  catalogItem('coupon', 'Kupon', 'Öne çıkan indirim kodu alanı', 'commerce'),
  catalogItem('product', 'Ürün', 'Mobilde alt alta geçen ürün kartı', 'commerce'),
  catalogItem('video', 'Video', 'Kapak görseli ve oynatma bağlantısı', 'content'),
  catalogItem('footer', 'Alt bilgi', 'Adres, yasal metin ve abonelikten çıkış', 'content'),
  catalogItem('menu', 'Menü', 'Yatay bağlantı listesi', 'content'),
  catalogItem('html', 'Kod', 'Ham HTML bloğu (gönderimde temizlenir)', 'content'),
  catalogItem('section', 'Bölüm', 'Renkli zeminli bant; içine sütun ya da blok alır', 'layout'),
  catalogItem('columns', 'Sütunlar', '1-4 sütunlu düzen; yalnız yaprak blok alır', 'layout'),
]);

const mergeTag = (
  key: string,
  label: string,
  group: EmailMergeTag['group'],
  description: string
): EmailMergeTag => ({ key, token: `{{${key}}}`, label, group, description });

export const EMAIL_MERGE_TAGS: readonly EmailMergeTag[] = Object.freeze([
  mergeTag('customer.firstName', 'Müşteri adı', 'customer', 'Alıcının adı'),
  mergeTag('customer.lastName', 'Müşteri soyadı', 'customer', 'Alıcının soyadı'),
  mergeTag('customer.fullName', 'Müşteri adı soyadı', 'customer', 'Alıcının tam adı'),
  mergeTag('customer.email', 'Müşteri e-postası', 'customer', 'Alıcının e-posta adresi'),
  mergeTag('merchant.name', 'Mağaza adı', 'merchant', 'Gönderen mağazanın adı'),
  mergeTag('merchant.logoUrl', 'Mağaza logosu', 'merchant', 'Mağaza logosunun HTTPS adresi'),
  mergeTag('merchant.storeUrl', 'Mağaza adresi', 'merchant', 'Mağazanın web adresi'),
  mergeTag('merchant.address', 'Mağaza fiziksel adresi', 'merchant', 'Yasal gönderici adresi'),
  mergeTag('campaign.name', 'Kampanya adı', 'campaign', 'Dahili kampanya adı'),
  mergeTag('campaign.subject', 'Kampanya konusu', 'campaign', 'E-posta konu satırı'),
  mergeTag('campaign.heroImageUrl', 'Kampanya görseli', 'campaign', 'Kampanya kapak görseli'),
  mergeTag('coupon.code', 'Kupon kodu', 'coupon', 'Alıcıya atanmış kupon kodu'),
  mergeTag('coupon.expiry', 'Kupon bitişi', 'coupon', 'Kuponun son kullanım tarihi'),
  mergeTag('product.name', 'Ürün adı', 'product', 'Öne çıkan ürünün adı'),
  mergeTag('product.description', 'Ürün açıklaması', 'product', 'Öne çıkan ürün açıklaması'),
  mergeTag('product.price', 'Ürün fiyatı', 'product', 'Güncel biçimlendirilmiş fiyat'),
  mergeTag('product.oldPrice', 'Eski ürün fiyatı', 'product', 'İndirim öncesi fiyat'),
  mergeTag('product.url', 'Ürün adresi', 'product', 'Ürün detay sayfası'),
  mergeTag('product.imageUrl', 'Ürün görseli', 'product', 'Ürün görselinin HTTPS adresi'),
  mergeTag('order.number', 'Sipariş numarası', 'order', 'Siparişin görünen numarası'),
  mergeTag('order.total', 'Sipariş toplamı', 'order', 'Biçimlendirilmiş sipariş toplamı'),
  mergeTag('order.date', 'Sipariş tarihi', 'order', 'Biçimlendirilmiş sipariş tarihi'),
  mergeTag('order.carrier', 'Kargo firması', 'order', 'Siparişi taşıyan kargo firması'),
  mergeTag('order.trackingNumber', 'Kargo takip numarası', 'order', 'Gönderinin takip numarası'),
  mergeTag('order.trackingUrl', 'Kargo takip adresi', 'order', 'Gönderinin takip bağlantısı'),
  mergeTag('order.url', 'Sipariş adresi', 'order', 'Sipariş detay sayfası'),
  mergeTag('order.status', 'Sipariş durumu', 'order', 'Siparişin sistem durumu (processing, delivered…)'),
  mergeTag('order.statusLabel', 'Sipariş durumu (Türkçe)', 'order', 'Siparişin okunabilir Türkçe durum adı'),
  mergeTag('order.itemsSummary', 'Sipariş ürün özeti', 'order', 'Sipariş satırlarının kısa metin özeti'),
  mergeTag('order.shippingAddress', 'Teslimat adresi', 'order', 'Siparişin teslimat adresi'),
  mergeTag('order.paymentMethod', 'Ödeme yöntemi', 'order', 'Siparişte kullanılan ödeme yöntemi'),
  mergeTag('order.cancelReason', 'İptal gerekçesi', 'order', 'Siparişin iptal edilme nedeni'),
  mergeTag('order.refundAmount', 'İade edilen tutar', 'order', 'Bu işlemde iade edilen tutar'),
  mergeTag('order.refundedTotal', 'Toplam iade', 'order', 'Sipariş için bugüne kadar iade edilen toplam'),
  mergeTag('order.refundReason', 'İade gerekçesi', 'order', 'Para iadesinin nedeni'),
  mergeTag('order.reviewUrl', 'Değerlendirme adresi', 'order', 'Sipariş değerlendirme sayfası'),
  mergeTag('payment.bankName', 'Banka adı', 'payment', 'Havale/EFT yapılacak banka'),
  mergeTag('payment.accountHolder', 'Hesap sahibi', 'payment', 'Havale/EFT hesabının sahibi'),
  mergeTag('payment.iban', 'IBAN', 'payment', 'Havale/EFT için IBAN numarası'),
  mergeTag('payment.description', 'Ödeme açıklaması', 'payment', 'Mağazanın ödeme talimatı açıklaması'),
  mergeTag('payment.reference', 'Ödeme referansı', 'payment', 'Havale açıklamasına yazılacak referans'),
  mergeTag('payment.amount', 'Ödenecek tutar', 'payment', 'Havale/EFT ile ödenecek tutar'),
  mergeTag('payment.dueDate', 'Son ödeme tarihi', 'payment', 'Ödemenin yapılması gereken son tarih'),
  mergeTag('return.number', 'İade numarası', 'return', 'İade talebinin görünen numarası'),
  mergeTag('return.status', 'İade durumu', 'return', 'İade talebinin sistem durumu'),
  mergeTag('return.statusLabel', 'İade durumu (Türkçe)', 'return', 'İade talebinin okunabilir Türkçe durumu'),
  mergeTag('return.items', 'İade ürünleri', 'return', 'İadeye konu ürünlerin metin özeti'),
  mergeTag('return.reason', 'İade nedeni', 'return', 'Müşterinin belirttiği iade nedeni'),
  mergeTag('return.note', 'İade notu', 'return', 'Mağazanın iade talebine eklediği not'),
  mergeTag('return.url', 'İade adresi', 'return', 'İade talebi detay sayfası'),
  mergeTag('cart.url', 'Sepet adresi', 'cart', 'Terk edilen sepetin güvenli adresi'),
  mergeTag('cart.itemCount', 'Sepet ürün sayısı', 'cart', 'Sepetteki ürün adedi'),
  mergeTag('cart.total', 'Sepet toplamı', 'cart', 'Biçimlendirilmiş sepet toplamı'),
  mergeTag('unsubscribeUrl', 'Abonelikten çıkış', 'system', 'Zorunlu abonelikten çıkış adresi'),
]);

export const EMAIL_BLOCK_TYPES = Object.freeze(
  EMAIL_BLOCK_CATALOG.map((item) => item.type)
) as readonly EmailBlockType[];

export const EMAIL_SOCIAL_NETWORKS = Object.freeze([
  'instagram',
  'facebook',
  'x',
  'youtube',
  'linkedin',
  'tiktok',
  'website',
] as const);
