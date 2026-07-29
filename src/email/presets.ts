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
]);
