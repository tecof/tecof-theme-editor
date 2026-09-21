import { createEmailBlock, createEmailDocument } from './factory';
import type { EmailBlock, EmailDocument, EmailPreset } from './types';

const footerBlocks = (prefix: string, includeUnsubscribe = true): EmailBlock[] => [
  createEmailBlock(
    'divider',
    { color: '#e4e4e7', padding: { top: 20, right: 32, bottom: 12, left: 32 } },
    `${prefix}-footer-divider`
  ),
  createEmailBlock(
    'text',
    {
      text: '{{merchant.name}} · {{merchant.address}}',
      color: '#71717a',
      align: 'center',
      fontSize: 12,
      lineHeight: 1.5,
      padding: { top: 4, right: 32, bottom: 4, left: 32 },
    },
    `${prefix}-footer-address`
  ),
  ...(includeUnsubscribe
    ? [
        createEmailBlock(
          'social',
          {
            title: '',
            links: [
              { network: 'website', label: 'Abonelikten çık', url: '{{unsubscribeUrl}}' },
            ],
            color: '#71717a',
            align: 'center',
            fontSize: 12,
            padding: { top: 6, right: 24, bottom: 28, left: 24 },
          },
          `${prefix}-footer-links`
        ),
      ]
    : []),
];

const documentFor = (
  subject: string,
  previewText: string,
  accent: string,
  blocks: EmailBlock[]
): EmailDocument =>
  createEmailDocument({
    subject,
    previewText,
    theme: { primaryColor: accent },
    blocks,
  });

const blank = (): EmailDocument =>
  documentFor(
    'Yeni kampanya',
    '',
    '#74b500',
    [
      createEmailBlock('logo', {}, 'blank-logo'),
      createEmailBlock(
        'heading',
        { text: 'Başlığınızı buraya yazın' },
        'blank-heading'
      ),
      createEmailBlock(
        'text',
        { text: 'Mesajınızı buraya yazın.', align: 'center' },
        'blank-copy'
      ),
      createEmailBlock('button', {}, 'blank-cta'),
      ...footerBlocks('blank'),
    ]
  );

const welcome = (): EmailDocument =>
  documentFor(
    'Aramıza hoş geldin {{customer.firstName}}',
    '{{merchant.name}} ayrıcalıklarını keşfetmeye hazır mısın?',
    '#74b500',
    [
      createEmailBlock('logo', {}, 'welcome-logo'),
      createEmailBlock(
        'heading',
        { text: 'Hoş geldin {{customer.firstName}}!', color: '#18181b' },
        'welcome-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: '{{merchant.name}} ailesine katıldığın için çok mutluyuz. Sana özel ürünleri ve fırsatları hemen keşfedebilirsin.',
          align: 'center',
        },
        'welcome-copy'
      ),
      createEmailBlock(
        'button',
        { label: 'Mağazayı keşfet', href: '{{merchant.storeUrl}}' },
        'welcome-cta'
      ),
      ...footerBlocks('welcome'),
    ]
  );

const flashSale = (): EmailDocument =>
  documentFor(
    'Sadece bugün: kaçırılmayacak fırsatlar',
    '{{campaign.name}} başladı; seçili ürünlerde avantaj seni bekliyor.',
    '#dc2626',
    [
      createEmailBlock('logo', {}, 'flash-logo'),
      createEmailBlock(
        'image',
        { src: '{{campaign.heroImageUrl}}', alt: '{{campaign.name}} kampanya görseli' },
        'flash-hero'
      ),
      createEmailBlock(
        'heading',
        { text: 'Fırsat başladı!', color: '#991b1b', fontSize: 38 },
        'flash-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, seçili ürünlerdeki günün fırsatlarını tükenmeden yakala.',
          align: 'center',
        },
        'flash-copy'
      ),
      createEmailBlock(
        'button',
        { label: 'Fırsatları gör', href: '{{merchant.storeUrl}}', backgroundColor: '#dc2626' },
        'flash-cta'
      ),
      ...footerBlocks('flash'),
    ]
  );

const coupon = (): EmailDocument =>
  documentFor(
    '{{customer.firstName}}, sana özel bir hediyemiz var',
    '{{coupon.code}} kodunu {{coupon.expiry}} tarihine kadar kullan.',
    '#7c3aed',
    [
      createEmailBlock('logo', {}, 'coupon-logo'),
      createEmailBlock(
        'heading',
        { text: 'Bu indirim yalnızca sana özel', color: '#4c1d95' },
        'coupon-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Seni yeniden aramızda görmek istiyoruz {{customer.firstName}}. Aşağıdaki kodu ödeme adımında kullanabilirsin.',
          align: 'center',
        },
        'coupon-copy'
      ),
      createEmailBlock(
        'coupon',
        {
          eyebrow: '{{coupon.expiry}} TARİHİNE KADAR',
          backgroundColor: '#f5f3ff',
          color: '#4c1d95',
          borderColor: '#8b5cf6',
        },
        'coupon-code'
      ),
      createEmailBlock(
        'button',
        { label: 'Alışverişe başla', href: '{{merchant.storeUrl}}', backgroundColor: '#7c3aed' },
        'coupon-cta'
      ),
      ...footerBlocks('coupon'),
    ]
  );

const productLaunch = (): EmailDocument =>
  documentFor(
    'Yeni: {{product.name}} şimdi satışta',
    '{{product.name}} ile ilk tanışanlardan biri ol.',
    '#0f766e',
    [
      createEmailBlock('logo', {}, 'launch-logo'),
      createEmailBlock(
        'heading',
        { text: 'Bekleyiş sona erdi', color: '#134e4a' },
        'launch-heading'
      ),
      createEmailBlock(
        'product',
        {
          accentColor: '#0f766e',
          backgroundColor: '#f0fdfa',
          buttonLabel: 'İlk sen keşfet',
        },
        'launch-product'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Stoklar sınırlı olabilir. {{product.name}} detaylarını inceleyerek sana uygun seçeneği hemen bul.',
          align: 'center',
          color: '#475569',
        },
        'launch-copy'
      ),
      ...footerBlocks('launch'),
    ]
  );

const abandonedCart = (): EmailDocument =>
  documentFor(
    '{{customer.firstName}}, sepetin seni bekliyor',
    'Sepetindeki {{cart.itemCount}} ürünü tamamlamak için geri dön.',
    '#ea580c',
    [
      createEmailBlock('logo', {}, 'cart-logo'),
      createEmailBlock(
        'heading',
        { text: 'Bir şeyi unuttun mu?', color: '#9a3412' },
        'cart-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, sepetindeki ürünleri senin için ayırdık. Sepet toplamın: {{cart.total}}',
          align: 'center',
        },
        'cart-copy'
      ),
      createEmailBlock(
        'button',
        { label: 'Sepetimi tamamla', href: '{{cart.url}}', backgroundColor: '#ea580c' },
        'cart-cta'
      ),
      ...footerBlocks('cart'),
    ]
  );

const orderConfirmation = (): EmailDocument =>
  documentFor(
    'Siparişini aldık: {{order.number}}',
    '{{order.total}} tutarındaki siparişinin tüm detayları burada.',
    '#16a34a',
    [
      createEmailBlock('logo', {}, 'confirmation-logo'),
      createEmailBlock(
        'heading',
        { text: 'Siparişin için teşekkürler!', color: '#14532d' },
        'confirmation-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{order.number}} numaralı siparişini aldık.\nSipariş tarihi: {{order.date}}\nSipariş toplamı: {{order.total}}',
          align: 'left',
        },
        'confirmation-copy'
      ),
      createEmailBlock(
        'button',
        { label: 'Sipariş detaylarını gör', href: '{{order.url}}', backgroundColor: '#16a34a' },
        'confirmation-cta'
      ),
      ...footerBlocks('confirmation', false),
    ]
  );

const orderFollowUp = (): EmailDocument =>
  documentFor(
    '{{order.number}} numaralı siparişin hakkında',
    'Sipariş ve kargo bilgilerin burada.',
    '#2563eb',
    [
      createEmailBlock('logo', {}, 'order-logo'),
      createEmailBlock(
        'heading',
        { text: 'Siparişin yola çıkıyor', color: '#1e3a8a' },
        'order-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{order.number}} numaralı ve {{order.total}} tutarındaki siparişin {{order.carrier}} ile hazırlanıyor.\nSipariş tarihi: {{order.date}}\nTakip numarası: {{order.trackingNumber}}',
          align: 'left',
        },
        'order-copy'
      ),
      createEmailBlock(
        'button',
        { label: 'Kargoyu takip et', href: '{{order.trackingUrl}}', backgroundColor: '#2563eb' },
        'order-tracking'
      ),
      createEmailBlock(
        'button',
        {
          label: 'Sipariş detayları',
          href: '{{order.url}}',
          backgroundColor: '#1e3a8a',
          padding: { top: 0, right: 32, bottom: 24, left: 32 },
        },
        'order-details'
      ),
      ...footerBlocks('order', false),
    ]
  );

const newsletter = (): EmailDocument =>
  documentFor(
    '{{campaign.subject}}',
    '{{campaign.name}} gündeminden öne çıkanlar.',
    '#0891b2',
    [
      createEmailBlock('logo', {}, 'newsletter-logo'),
      createEmailBlock(
        'text',
        {
          text: 'AYLIK BÜLTEN · {{campaign.name}}',
          color: '#0891b2',
          align: 'center',
          fontSize: 13,
          padding: { top: 18, right: 32, bottom: 4, left: 32 },
        },
        'newsletter-eyebrow'
      ),
      createEmailBlock(
        'heading',
        { text: 'Bu ay neler var?', color: '#164e63' },
        'newsletter-heading'
      ),
      createEmailBlock(
        'image',
        { src: '{{campaign.heroImageUrl}}', alt: '{{campaign.name}} bülten görseli' },
        'newsletter-hero'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, yeni ürünlerimizi, ilham veren içerikleri ve bu aya özel fırsatları senin için bir araya getirdik.',
        },
        'newsletter-copy'
      ),
      createEmailBlock(
        'button',
        { label: 'Tüm yenilikleri gör', href: '{{merchant.storeUrl}}', backgroundColor: '#0891b2' },
        'newsletter-cta'
      ),
      ...footerBlocks('newsletter'),
    ]
  );

const winBack = (): EmailDocument =>
  documentFor(
    'Seni özledik {{customer.firstName}}',
    'Geri dönüşüne özel fırsatı kaçırma.',
    '#be185d',
    [
      createEmailBlock('logo', {}, 'winback-logo'),
      createEmailBlock(
        'heading',
        { text: 'Uzun zaman oldu!', color: '#831843' },
        'winback-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{merchant.name}} olarak seni yeniden görmek isteriz. Dönüşüne özel hediyen hazır.',
          align: 'center',
        },
        'winback-copy'
      ),
      createEmailBlock(
        'coupon',
        {
          eyebrow: 'GERİ DÖNÜŞ HEDİYEN',
          description: '{{coupon.expiry}} tarihine kadar geçerli.',
          backgroundColor: '#fdf2f8',
          color: '#831843',
          borderColor: '#ec4899',
        },
        'winback-coupon'
      ),
      createEmailBlock(
        'button',
        { label: 'Hediyemi kullan', href: '{{merchant.storeUrl}}', backgroundColor: '#be185d' },
        'winback-cta'
      ),
      ...footerBlocks('winback'),
    ]
  );

/* ─── Mailchimp tarzı ek tasarımlar (2026-09-21) ─────────────────────────
   Aynı blok sözlüğüyle beş yeni düzen: sola yaslı editoryal duyuru, tam genişlik görselli vitrin,
   büyük başlıklı sezon indirimi (kuponlu), sipariş sonrası değerlendirme isteği, etkinlik daveti.
   Backend kurulum seed'i (tecof-app-backend app/src/data/emailPresetSeeds.ts) bu üreticilerin
   dondurulmuş çıktısıdır — burada bir şey değişirse orası yeniden üretilir. */

const announcement = (): EmailDocument =>
  documentFor(
    'Yeni bir haberimiz var',
    '{{merchant.name}} ekibinden kısa ve önemli bir duyuru.',
    '#111827',
    [
      createEmailBlock(
        'logo',
        { align: 'left', width: 140, padding: { top: 28, right: 32, bottom: 8, left: 32 } },
        'announce-logo'
      ),
      createEmailBlock(
        'divider',
        { color: '#111827', width: 100, thickness: 2, padding: { top: 8, right: 32, bottom: 20, left: 32 } },
        'announce-rule'
      ),
      createEmailBlock(
        'heading',
        {
          text: 'Yeni bir haberimiz var',
          align: 'left',
          fontSize: 36,
          lineHeight: 1.15,
          color: '#111827',
          padding: { top: 0, right: 32, bottom: 12, left: 32 },
        },
        'announce-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{merchant.name}} olarak seninle paylaşmak istediğimiz bir gelişme var. Ayrıntılar aşağıda.',
          align: 'left',
          fontSize: 17,
          lineHeight: 1.65,
          color: '#374151',
        },
        'announce-copy'
      ),
      createEmailBlock(
        'image',
        {
          src: '{{campaign.heroImageUrl}}',
          alt: '{{campaign.name}}',
          padding: { top: 8, right: 32, bottom: 8, left: 32 },
        },
        'announce-image'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Tüm ayrıntıları ve sık sorulan soruları mağazamızda bulabilirsin.',
          align: 'left',
          color: '#6b7280',
          fontSize: 15,
        },
        'announce-note'
      ),
      createEmailBlock(
        'button',
        {
          label: 'Detayları gör',
          href: '{{merchant.storeUrl}}',
          backgroundColor: '#111827',
          align: 'left',
          borderRadius: 4,
          width: 200,
          padding: { top: 8, right: 32, bottom: 28, left: 32 },
        },
        'announce-cta'
      ),
      ...footerBlocks('announce'),
    ]
  );

const lookbook = (): EmailDocument =>
  documentFor(
    'Bu haftanın seçkisi: {{product.name}}',
    'Yeni gelenler ve en çok sevilenler bir arada.',
    '#be185d',
    [
      createEmailBlock('logo', {}, 'lookbook-logo'),
      createEmailBlock(
        'image',
        {
          src: '{{campaign.heroImageUrl}}',
          alt: '{{campaign.name}} vitrini',
          width: 600,
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
        },
        'lookbook-hero'
      ),
      createEmailBlock(
        'text',
        {
          text: 'YENİ GELENLER',
          align: 'center',
          color: '#be185d',
          fontSize: 12,
          lineHeight: 1.4,
          padding: { top: 28, right: 32, bottom: 4, left: 32 },
        },
        'lookbook-eyebrow'
      ),
      createEmailBlock(
        'heading',
        { text: 'Bu haftanın seçkisi', color: '#831843', fontSize: 34 },
        'lookbook-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Sezonun öne çıkan parçalarını senin için bir araya getirdik. Beğendiğin ürüne tıkla, hemen incele.',
          align: 'center',
        },
        'lookbook-copy'
      ),
      createEmailBlock(
        'product',
        { accentColor: '#be185d', backgroundColor: '#fdf2f8', buttonLabel: 'Ürünü incele' },
        'lookbook-product'
      ),
      createEmailBlock('spacer', { height: 8, mobileHeight: 8 }, 'lookbook-gap'),
      createEmailBlock(
        'button',
        { label: 'Tüm koleksiyonu gör', href: '{{merchant.storeUrl}}', backgroundColor: '#be185d', width: 260 },
        'lookbook-cta'
      ),
      ...footerBlocks('lookbook'),
    ]
  );

const seasonalSale = (): EmailDocument =>
  documentFor(
    "Sezon sonu: %50'ye varan indirim başladı",
    '{{coupon.code}} koduyla sepette ekstra avantaj — {{coupon.expiry}} tarihine kadar.',
    '#b45309',
    [
      createEmailBlock('logo', {}, 'season-logo'),
      createEmailBlock(
        'text',
        {
          text: 'SEZON SONU',
          align: 'center',
          color: '#b45309',
          fontSize: 13,
          lineHeight: 1.4,
          padding: { top: 12, right: 32, bottom: 0, left: 32 },
        },
        'season-eyebrow'
      ),
      createEmailBlock(
        'heading',
        {
          text: "%50'ye varan indirim",
          color: '#78350f',
          fontSize: 44,
          lineHeight: 1.1,
          padding: { top: 4, right: 32, bottom: 8, left: 32 },
        },
        'season-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, sezonun son fırsatları burada. Seçili ürünlerde indirim, kodunla sepette ekstra avantaj.',
          align: 'center',
        },
        'season-copy'
      ),
      createEmailBlock(
        'coupon',
        {
          eyebrow: 'SEPETTE KULLAN',
          description: '{{coupon.expiry}} tarihine kadar geçerli.',
          backgroundColor: '#fffbeb',
          color: '#78350f',
          borderColor: '#f59e0b',
        },
        'season-coupon'
      ),
      createEmailBlock(
        'button',
        { label: 'İndirimleri keşfet', href: '{{merchant.storeUrl}}', backgroundColor: '#b45309' },
        'season-cta'
      ),
      createEmailBlock(
        'image',
        { src: '{{campaign.heroImageUrl}}', alt: '{{campaign.name}}' },
        'season-image'
      ),
      ...footerBlocks('season'),
    ]
  );

const reviewRequest = (): EmailDocument =>
  documentFor(
    'Siparişin nasıldı {{customer.firstName}}?',
    '{{order.number}} numaralı siparişin hakkında görüşünü merak ediyoruz.',
    '#0369a1',
    [
      createEmailBlock('logo', {}, 'review-logo'),
      createEmailBlock(
        'heading',
        { text: 'Siparişin nasıldı?', color: '#0c4a6e' },
        'review-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{order.date}} tarihli {{order.number}} numaralı siparişin eline ulaştı. Bir dakikanı ayırıp deneyimini paylaşır mısın?',
          align: 'center',
        },
        'review-copy'
      ),
      createEmailBlock(
        'heading',
        {
          text: '★ ★ ★ ★ ★',
          level: 2,
          color: '#f59e0b',
          fontSize: 30,
          padding: { top: 4, right: 32, bottom: 4, left: 32 },
        },
        'review-stars'
      ),
      createEmailBlock(
        'button',
        { label: 'Değerlendir', href: '{{order.url}}', backgroundColor: '#0369a1' },
        'review-cta'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Yorumun, başka müşterilerin doğru ürünü bulmasına yardımcı olur. Teşekkürler!',
          align: 'center',
          color: '#64748b',
          fontSize: 14,
        },
        'review-note'
      ),
      ...footerBlocks('review'),
    ]
  );

const eventInvite = (): EmailDocument =>
  documentFor(
    'Davetlisin: {{campaign.name}}',
    'Yerini ayırt — kontenjan sınırlı.',
    '#4f46e5',
    [
      createEmailBlock('logo', {}, 'event-logo'),
      createEmailBlock(
        'image',
        { src: '{{campaign.heroImageUrl}}', alt: '{{campaign.name}}' },
        'event-image'
      ),
      createEmailBlock(
        'text',
        {
          text: 'DAVETİYE',
          align: 'center',
          color: '#4f46e5',
          fontSize: 12,
          lineHeight: 1.4,
          padding: { top: 16, right: 32, bottom: 0, left: 32 },
        },
        'event-eyebrow'
      ),
      createEmailBlock(
        'heading',
        { text: '{{campaign.name}}', color: '#312e81', fontSize: 34 },
        'event-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, seni aramızda görmek istiyoruz. Tarih, yer ve program ayrıntılarını aşağıdaki bağlantıdan inceleyebilirsin.',
          align: 'center',
        },
        'event-copy'
      ),
      createEmailBlock('divider', { color: '#e0e7ff', width: 40 }, 'event-rule'),
      createEmailBlock(
        'text',
        {
          text: 'Tarih: —  ·  Saat: —  ·  Yer: —',
          align: 'center',
          color: '#4338ca',
          fontSize: 15,
        },
        'event-details'
      ),
      createEmailBlock(
        'button',
        { label: 'Yerini ayırt', href: '{{merchant.storeUrl}}', backgroundColor: '#4f46e5' },
        'event-cta'
      ),
      ...footerBlocks('event'),
    ]
  );

const accountWelcome = (): EmailDocument =>
  documentFor(
    'Hesabın hazır {{customer.firstName}}',
    '{{merchant.name}} hesabınla siparişlerini takip edebilir, adreslerini saklayabilirsin.',
    '#74b500',
    [
      createEmailBlock('logo', {}, 'account-logo'),
      createEmailBlock(
        'heading',
        { text: 'Hesabın hazır {{customer.firstName}}!', color: '#18181b' },
        'account-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{merchant.name}} hesabın oluşturuldu. Artık siparişlerini takip edebilir, adreslerini kaydedebilir ve alışverişini daha hızlı tamamlayabilirsin.',
          align: 'center',
        },
        'account-copy'
      ),
      createEmailBlock(
        'button',
        { label: 'Mağazayı keşfet', href: '{{merchant.storeUrl}}' },
        'account-cta'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Bu hesabı sen oluşturmadıysan bize yanıt vererek bildirebilirsin.',
          align: 'center',
          color: '#71717a',
          fontSize: 14,
        },
        'account-note'
      ),
      ...footerBlocks('account', false),
    ]
  );

const orderProcessing = (): EmailDocument =>
  documentFor(
    '{{order.number}} hazırlanıyor',
    'Siparişini hazırlamaya başladık; kargoya verdiğimizde haber vereceğiz.',
    '#0891b2',
    [
      createEmailBlock('logo', {}, 'processing-logo'),
      createEmailBlock(
        'heading',
        { text: 'Siparişin hazırlanıyor', color: '#155e75' },
        'processing-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{order.number}} numaralı siparişini hazırlamaya başladık.\nSipariş tarihi: {{order.date}}',
          align: 'left',
        },
        'processing-copy'
      ),
      createEmailBlock('divider', { color: '#cffafe', width: 100 }, 'processing-rule'),
      createEmailBlock(
        'text',
        {
          text: 'Siparişindekiler:\n{{order.itemsSummary}}',
          align: 'left',
          color: '#334155',
          fontSize: 15,
        },
        'processing-items'
      ),
      createEmailBlock(
        'button',
        { label: 'Siparişimi görüntüle', href: '{{order.url}}', backgroundColor: '#0891b2' },
        'processing-cta'
      ),
      ...footerBlocks('processing', false),
    ]
  );

const orderDelivered = (): EmailDocument =>
  documentFor(
    'Siparişin teslim edildi',
    '{{order.number}} numaralı siparişin adresine ulaştı.',
    '#16a34a',
    [
      createEmailBlock('logo', {}, 'delivered-logo'),
      createEmailBlock(
        'heading',
        { text: 'Siparişin teslim edildi', color: '#14532d' },
        'delivered-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{order.number}} numaralı siparişin teslim edildi. Keyifle kullanmanı dileriz.',
          align: 'left',
        },
        'delivered-copy'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Teslim edilenler:\n{{order.itemsSummary}}',
          align: 'left',
          color: '#334155',
          fontSize: 15,
        },
        'delivered-items'
      ),
      createEmailBlock(
        'button',
        { label: 'Sipariş detayları', href: '{{order.url}}', backgroundColor: '#16a34a' },
        'delivered-cta'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Ürününde bir sorun mu var? Bu e-postayı yanıtlayarak bize hemen yazabilirsin.',
          align: 'center',
          color: '#71717a',
          fontSize: 14,
        },
        'delivered-note'
      ),
      ...footerBlocks('delivered', false),
    ]
  );

const orderCancelled = (): EmailDocument =>
  documentFor(
    '{{order.number}} iptal edildi',
    'Siparişinin iptal detayları ve sonraki adımlar burada.',
    '#b91c1c',
    [
      createEmailBlock('logo', {}, 'cancelled-logo'),
      createEmailBlock(
        'heading',
        { text: 'Siparişin iptal edildi', color: '#7f1d1d' },
        'cancelled-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{order.number}} numaralı ve {{order.total}} tutarındaki siparişin iptal edildi.\nİptal nedeni: {{order.cancelReason}}',
          align: 'left',
        },
        'cancelled-copy'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Ödemen alındıysa tutar aynı ödeme yöntemine iade edilir. Bankana yansıması 3-10 iş günü sürebilir.',
          align: 'left',
          color: '#334155',
          fontSize: 15,
        },
        'cancelled-refund'
      ),
      createEmailBlock(
        'button',
        { label: 'Alışverişe devam et', href: '{{merchant.storeUrl}}', backgroundColor: '#b91c1c' },
        'cancelled-cta'
      ),
      ...footerBlocks('cancelled', false),
    ]
  );

const orderRefunded = (): EmailDocument =>
  documentFor(
    'Para iaden yapıldı',
    '{{order.number}} numaralı siparişin için {{order.refundAmount}} iade edildi.',
    '#7c3aed',
    [
      createEmailBlock('logo', {}, 'refunded-logo'),
      createEmailBlock(
        'heading',
        { text: 'Para iaden yapıldı', color: '#5b21b6' },
        'refunded-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{order.number}} numaralı siparişin için iade işlemini tamamladık.\nİade edilen tutar: {{order.refundAmount}}\nToplam iade: {{order.refundedTotal}}\nİade nedeni: {{order.refundReason}}',
          align: 'left',
        },
        'refunded-copy'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Tutar, ödemeyi yaptığın karta veya hesaba iade edilir. Bankana yansıması 3-10 iş günü sürebilir.',
          align: 'left',
          color: '#334155',
          fontSize: 15,
        },
        'refunded-note'
      ),
      createEmailBlock(
        'button',
        { label: 'Sipariş detayları', href: '{{order.url}}', backgroundColor: '#7c3aed' },
        'refunded-cta'
      ),
      ...footerBlocks('refunded', false),
    ]
  );

const bankTransferInstructions = (): EmailDocument =>
  documentFor(
    'Havale/EFT bilgilerin: {{order.number}}',
    'Ödemeni {{payment.dueDate}} tarihine kadar tamamlaman yeterli.',
    '#1d4ed8',
    [
      createEmailBlock('logo', {}, 'transfer-logo'),
      createEmailBlock(
        'heading',
        { text: 'Havale/EFT bilgilerin', color: '#1e3a8a' },
        'transfer-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{order.number}} numaralı siparişini aldık. Siparişin, ödemeni aldığımızda hazırlanmaya başlar.',
          align: 'left',
        },
        'transfer-copy'
      ),
      createEmailBlock('divider', { color: '#dbeafe', width: 100 }, 'transfer-rule'),
      createEmailBlock(
        'text',
        {
          text: 'Banka: {{payment.bankName}}\nHesap sahibi: {{payment.accountHolder}}\nIBAN: {{payment.iban}}\nTutar: {{payment.amount}}',
          align: 'left',
          color: '#1e293b',
          fontSize: 16,
        },
        'transfer-account'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Açıklama alanına mutlaka şunu yaz: {{payment.reference}}\nReferans yazılmazsa ödemen siparişinle eşleşmeyebilir.',
          align: 'left',
          color: '#1d4ed8',
          fontSize: 16,
        },
        'transfer-reference'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Son ödeme tarihi: {{payment.dueDate}}\n{{payment.description}}',
          align: 'left',
          color: '#334155',
          fontSize: 15,
        },
        'transfer-terms'
      ),
      createEmailBlock(
        'button',
        { label: 'Siparişimi görüntüle', href: '{{order.url}}', backgroundColor: '#1d4ed8' },
        'transfer-cta'
      ),
      ...footerBlocks('transfer', false),
    ]
  );

const paymentConfirmed = (): EmailDocument =>
  documentFor(
    'Ödemen alındı: {{order.number}}',
    'Ödemeni onayladık; siparişini hazırlamaya başlıyoruz.',
    '#16a34a',
    [
      createEmailBlock('logo', {}, 'paid-logo'),
      createEmailBlock(
        'heading',
        { text: 'Ödemen alındı', color: '#14532d' },
        'paid-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{order.number}} numaralı siparişin için {{order.total}} tutarındaki ödemeni onayladık. Siparişini hazırlamaya başlıyoruz.',
          align: 'left',
        },
        'paid-copy'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Siparişindekiler:\n{{order.itemsSummary}}',
          align: 'left',
          color: '#334155',
          fontSize: 15,
        },
        'paid-items'
      ),
      createEmailBlock(
        'button',
        { label: 'Sipariş detayları', href: '{{order.url}}', backgroundColor: '#16a34a' },
        'paid-cta'
      ),
      ...footerBlocks('paid', false),
    ]
  );

const bankTransferReminder = (): EmailDocument =>
  documentFor(
    'Ödemeni bekliyoruz: {{order.number}}',
    '{{payment.dueDate}} tarihine kadar havale/EFT yapman yeterli.',
    '#b45309',
    [
      createEmailBlock('logo', {}, 'reminder-logo'),
      createEmailBlock(
        'heading',
        { text: 'Ödemeni bekliyoruz', color: '#78350f' },
        'reminder-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{order.number}} numaralı siparişinin ödemesi henüz hesabımıza ulaşmadı. Siparişini senin için ayırdık.',
          align: 'left',
        },
        'reminder-copy'
      ),
      createEmailBlock('divider', { color: '#fde68a', width: 100 }, 'reminder-rule'),
      createEmailBlock(
        'text',
        {
          text: 'Banka: {{payment.bankName}}\nHesap sahibi: {{payment.accountHolder}}\nIBAN: {{payment.iban}}\nTutar: {{payment.amount}}\nAçıklama: {{payment.reference}}',
          align: 'left',
          color: '#1e293b',
          fontSize: 16,
        },
        'reminder-account'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Son ödeme tarihi: {{payment.dueDate}}\nBu süre dolarsa siparişin otomatik olarak iptal edilir ve ürünler tekrar satışa açılır.',
          align: 'left',
          color: '#b45309',
          fontSize: 15,
        },
        'reminder-deadline'
      ),
      createEmailBlock(
        'button',
        { label: 'Siparişimi görüntüle', href: '{{order.url}}', backgroundColor: '#b45309' },
        'reminder-cta'
      ),
      ...footerBlocks('reminder', false),
    ]
  );

const orderShippingUpdated = (): EmailDocument =>
  documentFor(
    'Kargo bilgin güncellendi',
    '{{order.number}} için yeni takip numarası: {{order.trackingNumber}}',
    '#2563eb',
    [
      createEmailBlock('logo', {}, 'shipupdate-logo'),
      createEmailBlock(
        'heading',
        { text: 'Kargo bilgin güncellendi', color: '#1e3a8a' },
        'shipupdate-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{order.number}} numaralı siparişinin kargo bilgisi güncellendi.\nKargo firması: {{order.carrier}}\nTakip numarası: {{order.trackingNumber}}',
          align: 'left',
        },
        'shipupdate-copy'
      ),
      createEmailBlock(
        'button',
        { label: 'Kargoyu takip et', href: '{{order.trackingUrl}}', backgroundColor: '#2563eb' },
        'shipupdate-tracking'
      ),
      createEmailBlock(
        'button',
        {
          label: 'Sipariş detayları',
          href: '{{order.url}}',
          backgroundColor: '#1e3a8a',
          padding: { top: 0, right: 32, bottom: 24, left: 32 },
        },
        'shipupdate-details'
      ),
      ...footerBlocks('shipupdate', false),
    ]
  );

const returnRequested = (): EmailDocument =>
  documentFor(
    'İade talebini aldık: {{return.number}}',
    'Talebini inceliyoruz; sonucu en kısa sürede bildireceğiz.',
    '#0369a1',
    [
      createEmailBlock('logo', {}, 'returnreq-logo'),
      createEmailBlock(
        'heading',
        { text: 'İade talebini aldık', color: '#0c4a6e' },
        'returnreq-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{return.number}} numaralı iade talebini aldık. Talebini inceliyoruz ve sonucu en kısa sürede bildireceğiz.',
          align: 'left',
        },
        'returnreq-copy'
      ),
      createEmailBlock(
        'text',
        {
          text: 'İade edilecek ürünler:\n{{return.items}}\nİade nedeni: {{return.reason}}',
          align: 'left',
          color: '#334155',
          fontSize: 15,
        },
        'returnreq-items'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Talebin onaylanmadan ürünü kargoya verme; onay e-postasında kargo adımlarını paylaşacağız.',
          align: 'left',
          color: '#0369a1',
          fontSize: 15,
        },
        'returnreq-note'
      ),
      createEmailBlock(
        'button',
        { label: 'İade talebimi gör', href: '{{return.url}}', backgroundColor: '#0369a1' },
        'returnreq-cta'
      ),
      ...footerBlocks('returnreq', false),
    ]
  );

const returnApproved = (): EmailDocument =>
  documentFor(
    'İade talebin onaylandı',
    '{{return.number}} numaralı iaden için kargo adımların burada.',
    '#0f766e',
    [
      createEmailBlock('logo', {}, 'returnok-logo'),
      createEmailBlock(
        'heading',
        { text: 'İade talebin onaylandı', color: '#134e4a' },
        'returnok-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{return.number}} numaralı iade talebini onayladık.',
          align: 'left',
        },
        'returnok-copy'
      ),
      createEmailBlock(
        'text',
        {
          text: 'İade edilecek ürünler:\n{{return.items}}',
          align: 'left',
          color: '#334155',
          fontSize: 15,
        },
        'returnok-items'
      ),
      createEmailBlock('divider', { color: '#ccfbf1', width: 100 }, 'returnok-rule'),
      createEmailBlock(
        'text',
        {
          text: 'Kargo ve gönderim talimatın:\n{{return.note}}',
          align: 'left',
          color: '#0f766e',
          fontSize: 16,
        },
        'returnok-note'
      ),
      createEmailBlock(
        'button',
        { label: 'İade talebimi gör', href: '{{return.url}}', backgroundColor: '#0f766e' },
        'returnok-cta'
      ),
      ...footerBlocks('returnok', false),
    ]
  );

const returnRejected = (): EmailDocument =>
  documentFor(
    'İade talebin hakkında',
    '{{return.number}} numaralı iade talebinin sonucu.',
    '#b91c1c',
    [
      createEmailBlock('logo', {}, 'returnno-logo'),
      createEmailBlock(
        'heading',
        { text: 'İade talebin hakkında', color: '#7f1d1d' },
        'returnno-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{return.number}} numaralı iade talebini maalesef onaylayamadık.',
          align: 'left',
        },
        'returnno-copy'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Gerekçe:\n{{return.note}}',
          align: 'left',
          color: '#b91c1c',
          fontSize: 16,
        },
        'returnno-note'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Kararı yeniden değerlendirmemizi istersen bu e-postayı yanıtlayarak bize yazabilirsin.',
          align: 'left',
          color: '#334155',
          fontSize: 15,
        },
        'returnno-help'
      ),
      createEmailBlock(
        'button',
        { label: 'Mağazaya dön', href: '{{merchant.storeUrl}}', backgroundColor: '#b91c1c' },
        'returnno-cta'
      ),
      ...footerBlocks('returnno', false),
    ]
  );

const returnReceived = (): EmailDocument =>
  documentFor(
    'İade ürünün bize ulaştı',
    '{{return.number}} numaralı iadeni teslim aldık; inceliyoruz.',
    '#4f46e5',
    [
      createEmailBlock('logo', {}, 'returnin-logo'),
      createEmailBlock(
        'heading',
        { text: 'İade ürünün bize ulaştı', color: '#312e81' },
        'returnin-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{return.number}} numaralı iade gönderin depomuza ulaştı.',
          align: 'left',
        },
        'returnin-copy'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Teslim aldıklarımız:\n{{return.items}}',
          align: 'left',
          color: '#334155',
          fontSize: 15,
        },
        'returnin-items'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Ürünleri inceliyoruz. İnceleme tamamlandığında sonucu ve varsa iade tutarını e-posta ile bildireceğiz.',
          align: 'left',
          color: '#4f46e5',
          fontSize: 15,
        },
        'returnin-note'
      ),
      createEmailBlock(
        'button',
        { label: 'İade talebimi gör', href: '{{return.url}}', backgroundColor: '#4f46e5' },
        'returnin-cta'
      ),
      ...footerBlocks('returnin', false),
    ]
  );

const returnResolved = (): EmailDocument =>
  documentFor(
    'İade talebin sonuçlandı',
    '{{return.number}} numaralı iaden: {{return.statusLabel}}',
    '#16a34a',
    [
      createEmailBlock('logo', {}, 'returndone-logo'),
      createEmailBlock(
        'heading',
        { text: 'İade talebin sonuçlandı', color: '#14532d' },
        'returndone-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, {{return.number}} numaralı iade talebin sonuçlandı.\nDurum: {{return.statusLabel}}',
          align: 'left',
        },
        'returndone-copy'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Mağaza notu:\n{{return.note}}',
          align: 'left',
          color: '#334155',
          fontSize: 15,
        },
        'returndone-note'
      ),
      createEmailBlock(
        'button',
        { label: 'İade talebimi gör', href: '{{return.url}}', backgroundColor: '#16a34a' },
        'returndone-cta'
      ),
      ...footerBlocks('returndone', false),
    ]
  );

const backInStock = (): EmailDocument =>
  documentFor(
    '{{product.name}} tekrar stokta!',
    'Beklediğin ürün raflarda; tükenmeden yakala.',
    '#ea580c',
    [
      createEmailBlock('logo', {}, 'restock-logo'),
      createEmailBlock(
        'heading',
        { text: 'Tekrar stokta!', color: '#9a3412' },
        'restock-heading'
      ),
      createEmailBlock(
        'text',
        {
          text: 'Merhaba {{customer.firstName}}, haber vermemizi istediğin {{product.name}} yeniden stokta. Stok sınırlı olabilir.',
          align: 'center',
        },
        'restock-copy'
      ),
      createEmailBlock(
        'product',
        {
          oldPrice: '',
          accentColor: '#ea580c',
          backgroundColor: '#fff7ed',
          buttonLabel: 'Ürünü incele',
        },
        'restock-product'
      ),
      createEmailBlock(
        'button',
        { label: 'Hemen satın al', href: '{{product.url}}', backgroundColor: '#ea580c' },
        'restock-cta'
      ),
      ...footerBlocks('restock', false),
    ]
  );

export const EMAIL_PRESETS: readonly EmailPreset[] = Object.freeze([
  {
    key: 'blank',
    name: 'Boş şablon',
    description: 'Temel marka, içerik, CTA ve yasal altbilgiyle sıfırdan başlar.',
    emoji: '📄',
    accent: '#71717a',
    purpose: 'marketing',
    subject: 'Yeni kampanya',
    previewText: '',
    build: blank,
  },
  {
    key: 'welcome',
    name: 'Hoş geldin',
    description: 'Yeni aboneleri markaya ve mağazaya davet eder.',
    emoji: '👋',
    accent: '#74b500',
    purpose: 'marketing',
    subject: 'Aramıza hoş geldin {{customer.firstName}}',
    previewText: '{{merchant.name}} ayrıcalıklarını keşfetmeye hazır mısın?',
    build: welcome,
  },
  {
    key: 'flash-sale',
    name: 'Hızlı indirim',
    description: 'Süreli kampanyayı güçlü görsel ve CTA ile duyurur.',
    emoji: '⚡',
    accent: '#dc2626',
    purpose: 'marketing',
    subject: 'Sadece bugün: kaçırılmayacak fırsatlar',
    previewText: '{{campaign.name}} başladı; seçili ürünlerde avantaj seni bekliyor.',
    build: flashSale,
  },
  {
    key: 'coupon',
    name: 'Kişisel kupon',
    description: 'Alıcıya atanmış kupon kodunu belirgin şekilde sunar.',
    emoji: '🎟️',
    accent: '#7c3aed',
    purpose: 'marketing',
    subject: '{{customer.firstName}}, sana özel bir hediyemiz var',
    previewText: '{{coupon.code}} kodunu {{coupon.expiry}} tarihine kadar kullan.',
    build: coupon,
  },
  {
    key: 'product-launch',
    name: 'Ürün lansmanı',
    description: 'Yeni ürünü responsive ürün kartıyla tanıtır.',
    emoji: '🚀',
    accent: '#0f766e',
    purpose: 'marketing',
    subject: 'Yeni: {{product.name}} şimdi satışta',
    previewText: '{{product.name}} ile ilk tanışanlardan biri ol.',
    build: productLaunch,
  },
  {
    key: 'abandoned-cart',
    name: 'Terk edilmiş sepet',
    description: 'Sepette kalan ürünü ve toplamı hatırlatır.',
    emoji: '🛒',
    accent: '#ea580c',
    purpose: 'marketing',
    subject: '{{customer.firstName}}, sepetin seni bekliyor',
    previewText: 'Sepetindeki {{cart.itemCount}} ürünü tamamlamak için geri dön.',
    build: abandonedCart,
  },
  {
    key: 'order-confirmation',
    name: 'Sipariş onayı',
    description: 'Sipariş numarası, tarih ve toplamla güven veren işlem bildirimi oluşturur.',
    emoji: '✅',
    accent: '#16a34a',
    purpose: 'transactional',
    subject: 'Siparişini aldık: {{order.number}}',
    previewText: '{{order.total}} tutarındaki siparişinin tüm detayları burada.',
    build: orderConfirmation,
  },
  {
    key: 'order-shipped',
    name: 'Kargo bildirimi',
    description: 'Kargo firması ve takip bağlantısıyla müşteriyi bilgilendirir.',
    emoji: '🚚',
    accent: '#2563eb',
    purpose: 'transactional',
    subject: '{{order.number}} numaralı siparişin hakkında',
    previewText: 'Sipariş ve kargo bilgilerin burada.',
    build: orderFollowUp,
  },
  {
    key: 'order-follow-up',
    name: 'Sipariş takibi',
    description: 'Sipariş ve kargo gelişmelerini kişiselleştirir.',
    emoji: '📦',
    accent: '#2563eb',
    purpose: 'transactional',
    subject: '{{order.number}} numaralı siparişin hakkında',
    previewText: 'Sipariş ve kargo bilgilerin burada.',
    build: orderFollowUp,
  },
  {
    key: 'newsletter',
    name: 'Aylık bülten',
    description: 'İçerik ve yenilikleri düzenli bir bülten yapısında sunar.',
    emoji: '📰',
    accent: '#0891b2',
    purpose: 'marketing',
    subject: '{{campaign.subject}}',
    previewText: '{{campaign.name}} gündeminden öne çıkanlar.',
    build: newsletter,
  },
  {
    key: 'win-back',
    name: 'Geri kazanım',
    description: 'Pasif müşteriyi kişisel mesaj ve kuponla geri çağırır.',
    emoji: '💌',
    accent: '#be185d',
    purpose: 'marketing',
    subject: 'Seni özledik {{customer.firstName}}',
    previewText: 'Geri dönüşüne özel fırsatı kaçırma.',
    build: winBack,
  },
  {
    key: 'announcement',
    name: 'Duyuru',
    description: 'Sola yaslı, editoryal tek sütun: başlık, görsel, tek CTA.',
    emoji: '📣',
    accent: '#111827',
    purpose: 'marketing',
    subject: 'Yeni bir haberimiz var',
    previewText: '{{merchant.name}} ekibinden kısa ve önemli bir duyuru.',
    build: announcement,
  },
  {
    key: 'lookbook',
    name: 'Ürün vitrini',
    description: 'Tam genişlik görsel, öne çıkan ürün kartı ve koleksiyon CTA\'sı.',
    emoji: '🛍️',
    accent: '#be185d',
    purpose: 'marketing',
    subject: 'Bu haftanın seçkisi: {{product.name}}',
    previewText: 'Yeni gelenler ve en çok sevilenler bir arada.',
    build: lookbook,
  },
  {
    key: 'seasonal-sale',
    name: 'Sezon indirimi',
    description: 'Büyük oran başlığı, kupon kartı ve kampanya görseli.',
    emoji: '🍂',
    accent: '#b45309',
    purpose: 'marketing',
    subject: "Sezon sonu: %50'ye varan indirim başladı",
    previewText: '{{coupon.code}} koduyla sepette ekstra avantaj — {{coupon.expiry}} tarihine kadar.',
    build: seasonalSale,
  },
  {
    key: 'review-request',
    name: 'Değerlendirme isteği',
    description: 'Teslim sonrası yorum isteyen kısa, güven veren mesaj.',
    emoji: '⭐',
    accent: '#0369a1',
    purpose: 'marketing',
    subject: 'Siparişin nasıldı {{customer.firstName}}?',
    previewText: '{{order.number}} numaralı siparişin hakkında görüşünü merak ediyoruz.',
    build: reviewRequest,
  },
  {
    key: 'event-invite',
    name: 'Etkinlik daveti',
    description: 'Görsel, davet başlığı, tarih/yer satırı ve kayıt CTA\'sı.',
    emoji: '🎉',
    accent: '#4f46e5',
    purpose: 'marketing',
    subject: 'Davetlisin: {{campaign.name}}',
    previewText: 'Yerini ayırt — kontenjan sınırlı.',
    build: eventInvite,
  },
  {
    key: 'account-welcome',
    name: 'Hesap hoş geldin',
    description: 'Hesap oluşturan müşteriyi karşılar ve mağazaya yönlendirir.',
    emoji: '🙌',
    accent: '#74b500',
    purpose: 'transactional',
    subject: 'Hesabın hazır {{customer.firstName}}',
    previewText: '{{merchant.name}} hesabınla siparişlerini takip edebilir, adreslerini saklayabilirsin.',
    build: accountWelcome,
  },
  {
    key: 'order-processing',
    name: 'Sipariş hazırlanıyor',
    description: 'Siparişin hazırlığa alındığını ürün özetiyle bildirir.',
    emoji: '🧾',
    accent: '#0891b2',
    purpose: 'transactional',
    subject: '{{order.number}} hazırlanıyor',
    previewText: 'Siparişini hazırlamaya başladık; kargoya verdiğimizde haber vereceğiz.',
    build: orderProcessing,
  },
  {
    key: 'order-delivered',
    name: 'Sipariş teslim edildi',
    description: 'Teslimatı onaylar ve sorun bildirimi için kapı bırakır.',
    emoji: '📬',
    accent: '#16a34a',
    purpose: 'transactional',
    subject: 'Siparişin teslim edildi',
    previewText: '{{order.number}} numaralı siparişin adresine ulaştı.',
    build: orderDelivered,
  },
  {
    key: 'order-cancelled',
    name: 'Sipariş iptal edildi',
    description: 'İptal gerekçesini ve iade sürecini açık biçimde anlatır.',
    emoji: '🚫',
    accent: '#b91c1c',
    purpose: 'transactional',
    subject: '{{order.number}} iptal edildi',
    previewText: 'Siparişinin iptal detayları ve sonraki adımlar burada.',
    build: orderCancelled,
  },
  {
    key: 'order-refunded',
    name: 'Para iadesi yapıldı',
    description: 'İade tutarını, toplamı ve bankaya yansıma süresini bildirir.',
    emoji: '💸',
    accent: '#7c3aed',
    purpose: 'transactional',
    subject: 'Para iaden yapıldı',
    previewText: '{{order.number}} numaralı siparişin için {{order.refundAmount}} iade edildi.',
    build: orderRefunded,
  },
  {
    key: 'bank-transfer-instructions',
    name: 'Havale/EFT bilgileri',
    description: 'IBAN, tutar ve zorunlu açıklama referansını öne çıkarır.',
    emoji: '🏦',
    accent: '#1d4ed8',
    purpose: 'transactional',
    subject: 'Havale/EFT bilgilerin: {{order.number}}',
    previewText: 'Ödemeni {{payment.dueDate}} tarihine kadar tamamlaman yeterli.',
    build: bankTransferInstructions,
  },
  {
    key: 'payment-confirmed',
    name: 'Ödeme onaylandı',
    description: 'Havale ödemesinin alındığını ve hazırlığın başladığını bildirir.',
    emoji: '💳',
    accent: '#16a34a',
    purpose: 'transactional',
    subject: 'Ödemen alındı: {{order.number}}',
    previewText: 'Ödemeni onayladık; siparişini hazırlamaya başlıyoruz.',
    build: paymentConfirmed,
  },
  {
    key: 'bank-transfer-reminder',
    name: 'Havale hatırlatma',
    description: 'Ödeme bilgilerini son tarih ve iptal uyarısıyla hatırlatır.',
    emoji: '⏰',
    accent: '#b45309',
    purpose: 'transactional',
    subject: 'Ödemeni bekliyoruz: {{order.number}}',
    previewText: '{{payment.dueDate}} tarihine kadar havale/EFT yapman yeterli.',
    build: bankTransferReminder,
  },
  {
    key: 'order-shipping-updated',
    name: 'Kargo bilgisi güncellendi',
    description: 'Değişen kargo firması ve takip numarasını iletir.',
    emoji: '🔄',
    accent: '#2563eb',
    purpose: 'transactional',
    subject: 'Kargo bilgin güncellendi',
    previewText: '{{order.number}} için yeni takip numarası: {{order.trackingNumber}}',
    build: orderShippingUpdated,
  },
  {
    key: 'return-requested',
    name: 'İade talebi alındı',
    description: 'İade talebini, ürünleri ve nedeni özetleyerek onaylar.',
    emoji: '↩️',
    accent: '#0369a1',
    purpose: 'transactional',
    subject: 'İade talebini aldık: {{return.number}}',
    previewText: 'Talebini inceliyoruz; sonucu en kısa sürede bildireceğiz.',
    build: returnRequested,
  },
  {
    key: 'return-approved',
    name: 'İade onaylandı',
    description: 'Onayı ve kargo/adres talimatını tek ekranda verir.',
    emoji: '✅',
    accent: '#0f766e',
    purpose: 'transactional',
    subject: 'İade talebin onaylandı',
    previewText: '{{return.number}} numaralı iaden için kargo adımların burada.',
    build: returnApproved,
  },
  {
    key: 'return-rejected',
    name: 'İade reddedildi',
    description: 'Red gerekçesini yumuşak bir dille aktarır ve iletişim yolu bırakır.',
    emoji: '⛔',
    accent: '#b91c1c',
    purpose: 'transactional',
    subject: 'İade talebin hakkında',
    previewText: '{{return.number}} numaralı iade talebinin sonucu.',
    build: returnRejected,
  },
  {
    key: 'return-received',
    name: 'İade teslim alındı',
    description: 'İade gönderisinin ulaştığını ve inceleme adımını bildirir.',
    emoji: '📥',
    accent: '#4f46e5',
    purpose: 'transactional',
    subject: 'İade ürünün bize ulaştı',
    previewText: '{{return.number}} numaralı iadeni teslim aldık; inceliyoruz.',
    build: returnReceived,
  },
  {
    key: 'return-resolved',
    name: 'İade sonuçlandı',
    description: 'İade talebinin nihai durumunu ve mağaza notunu paylaşır.',
    emoji: '🏁',
    accent: '#16a34a',
    purpose: 'transactional',
    subject: 'İade talebin sonuçlandı',
    previewText: '{{return.number}} numaralı iaden: {{return.statusLabel}}',
    build: returnResolved,
  },
  {
    key: 'back-in-stock',
    name: 'Tekrar stokta',
    description: 'Stok bildirimi isteyen müşteriye ürün kartıyla haber verir.',
    emoji: '🔔',
    accent: '#ea580c',
    purpose: 'transactional',
    subject: '{{product.name}} tekrar stokta!',
    previewText: 'Beklediğin ürün raflarda; tükenmeden yakala.',
    build: backInStock,
  },
]);
