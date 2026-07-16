# @tecof/theme-editor

Tecof platform için **sayfa editörü**, **render motoru** ve **gelişmiş alan bileşenleri** kütüphanesi.

> API Client, Context Provider, Tecof Studio editörü, çok dilli alan yöneticileri, medya yöneticisi, link seçici, resim görüntüleyici ve tema araçları içerir.
>
> **Studio öne çıkanlar:** komut paleti (⌘K), görsel stil editörü + **canlı tema editörü**, CMS veri bağlama, bölüm şablonları, yan yana slot düzeni, boşluk (box-model) overlay'i ve tam klavye kısayolları.

---

## Kurulum

```bash
npm install @tecof/theme-editor react react-dom
```

## Hızlı Başlangıç

### 1. TecofProvider ile Sarma

```tsx
import { TecofProvider } from "@tecof/theme-editor";

<TecofProvider
  apiUrl="https://api.example.com"
  secretKey="your-merchant-secret-key"
>
  {children}
</TecofProvider>
```

### 2. Editör Sayfası

```tsx
"use client";
import { TecofEditor } from "@tecof/theme-editor";
import { tecofConfig } from "@/tecof-config";

export default function EditorPage({ params }) {
  return <TecofEditor pageId={params.id} config={tecofConfig} />;
}
```

### 3. Public Sayfa (Render)

```tsx
import { TecofRender } from "@tecof/theme-editor";

<TecofRender data={pageData} config={tecofConfig} />
```

---

## Bileşenler

### `<TecofProvider />`

Tüm Tecof bileşenlerini sarar ve API client context'i sağlar.

| Prop | Tip | Açıklama |
|------|-----|----------|
| `apiUrl` | `string` | Backend API base URL |
| `secretKey` | `string` | Merchant secret key |
| `children` | `ReactNode` | Alt bileşenler |

### `<TecofEditor />`

Tecof Studio sayfa editörü. Otomatik fetch/save, iframe postMessage desteği, canvas DnD, katman paneli ve inspector içerir.

| Prop | Tip | Açıklama |
|------|-----|----------|
| `pageId` | `string` | Düzenlenecek sayfa ID'si |
| `config` | `Config` | Tecof/Puck-compatible component configuration |
| `accessToken` | `string` | Kayıt isteklerinde Authorization header |
| `onSave` | `(data) => void` | Kayıt sonrası callback |
| `onChange` | `(data) => void` | Her değişiklikte callback (≈300ms debounce'lu) |
| `hostOrigin` | `string` | Embed senaryosunda izin verilen parent origin. Verilirse hem gönderilen hem **gelen** postMessage'lar bu origin'e kısıtlanır (güvenlik). Verilmezse `'*'` (geriye uyumlu). |
| `className` | `string` | Ek CSS sınıfı |

> `TecofEditor`, `TecofStudio`'nun takma adıdır (`TecofEditor = TecofStudio`) — ikisi de aynı editörü açar.

### `<TecofRender />`

Önceden yüklenmiş sayfa verisini render eder. Fetch akışı için `TecofApiClient.getPublishedPage(slug, locale?)` kullanılıp dönen `draftData`/sayfa verisi bu bileşene verilir.

| Prop | Tip | Açıklama |
|------|-----|----------|
| `data` | `PuckPageData` | Sayfa verisi |
| `config` | `Config` | Tecof/Puck-compatible component configuration |
| `cmsData` | `object` | CMS template sayfaları için ham kayıt verisi |
| `className` | `string` | Ek CSS sınıfı |

### `<TecofPicture />`

Akıllı medya bileşeni — görsel/video otomatik algılama, responsive boyutlar, fancybox desteği.

```tsx
import { TecofPicture } from "@tecof/theme-editor";
import Image from "next/image";

// Basit kullanım
<TecofPicture data={file} alt="Hero" />

// Fill modu
<TecofPicture data={file} fill />

// Next.js Image ile
<TecofPicture
  data={file}
  ImageComponent={Image}
  imageProps={{ quality: 85, priority: true }}
/>

// Fancybox lightbox
<TecofPicture data={file} fancybox fancyboxName="gallery" />
```

| Prop | Tip | Açıklama |
|------|-----|----------|
| `data` | `UploadedFile` | Yüklenen dosya verisi |
| `alt` | `string` | Alt metin |
| `size` | `thumbnail \| medium \| large \| full` | Responsive boyut |
| `fill` | `boolean` | Parent'ı kaplar |
| `ImageComponent` | `ComponentType` | Özel image bileşeni (örn: Next.js Image) |
| `imageProps` | `Record<string,any>` | ImageComponent'e ek prop'lar |
| `fancybox` | `boolean` | Fancybox lightbox desteği |

---

## Custom Fields (Editör Alanları)

Tüm alanlar `createXField()` factory fonksiyonları ile Tecof/Puck-compatible config'e entegre edilir.

### LanguageField — Çok Dilli Metin

Sekmeli çok dilli metin girişi. Merchant ayarlarından dilleri otomatik çeker.

```tsx
import { createLanguageField } from "@tecof/theme-editor";

fields: {
  title: createLanguageField({ label: "Başlık" }),
  description: createLanguageField({
    label: "Açıklama",
    isTextarea: true,
    textareaRows: 4,
  }),
  htmlContent: createLanguageField({
    label: "HTML İçerik",
    isHtml: true,
  }),
}
```

**Özellikler:**
- 🌐 Otomatik dil algılama (merchant ayarlarından)
- 📋 **Hızlı Doldur** — Aktif sekmedeki metni tüm dillere kopyalar
- 🔄 **Çevir** — Aktif metni API üzerinden diğer dillere otomatik çevirir (DeepL / Google / OpenAI / Ollama)
- `isHtml` desteği — HTML taglarını koruyarak çeviri yapar

| Option | Tip | Default | Açıklama |
|--------|-----|---------|----------|
| `isTextarea` | `boolean` | `false` | Textarea modu |
| `textareaRows` | `number` | `3` | Textarea satır sayısı |
| `placeholder` | `string` | `''` | Placeholder metni |
| `isHtml` | `boolean` | `false` | HTML içerik çevirisi |

---

### EditorField — Zengin Metin Editörü

TipTap tabanlı, çok dilli WYSIWYG editörü.

```tsx
fields: {
  content: createEditorField({ label: "İçerik" }),
}
```

**Özellikler:** Bold, italic, link, liste, heading ve daha fazlası.

---

### UploadField — Gelişmiş Medya Yöneticisi

Görsel önizleme tile'ları + tek giriş noktalı sekmeli medya drawer'ı (Kütüphane / Yükle / Referans) + FilePond yükleme + Doka görsel düzenleyici.

```tsx
fields: {
  images: createUploadField({
    label: "Görseller",
    allowMultiple: true,
    maxFiles: 10,
    maxFileSize: "50MB",
  }),
  document: createUploadField({
    label: "Doküman",
    allowMultiple: false,
    acceptedTypes: ["application/pdf"],
  }),
}
```

**Özellikler:**
- 🖼️ **Görsel önizleme tile grid'i** — Seçili medya küçük liste satırı yerine kare önizleme tile'ları olarak gösterilir; hover'da kaldır butonu.
- ➕ **Tek giriş noktası** — Bir "ekle" tile'ı drawer'ı açar; tüm kaynaklar **sekme** halinde: **Kütüphane** (sunucudaki dosyalar), **Yükle** (FilePond), **Referans** (CMS değişkeni).
- 🔗 **CMS Referansı** — `{{ data.alan }}` ile dinamik görsel bağlama (CMS şablon sayfaları için).
- 🖌️ **Doka Görsel Düzenleyici** — Kırp, döndür, parlaklık, kontrast, markup, çıkartma.
- 🗜️ **Resim Sıkıştırma** — Otomatik WebP dönüşümü (browser-image-compression).
- 📄 24+ dosya türü desteği (görseller, PDF, Office, CSV, video).
- 🇹🇷 Tamamen Türkçe etiketler (FilePond + Doka).

| Option | Tip | Default | Açıklama |
|--------|-----|---------|----------|
| `allowMultiple` | `boolean` | `true` | Çoklu dosya |
| `maxFiles` | `number` | `100` | Maksimum dosya sayısı |
| `maxFileSize` | `string` | `100MB` | Tek dosya limiti |
| `maxTotalFileSize` | `string` | `200MB` | Toplam limit |
| `acceptedTypes` | `string[]` | `[all]` | İzin verilen MIME türleri |
| `folder` | `string` | `/` | Yüklemelerin hedef klasörü |
| `imageCompressionEnabled` | `boolean` | `true` | Sıkıştırma aktif |
| `imageCompressionOptions` | `object` | `{maxSizeMB:1,…}` | Sıkıştırma ayarları (maxSizeMB, maxWidthOrHeight, fileType) |
| `allowReorder` | `boolean` | `true` | FilePond'da sürükle-bırak sıralama |
| `showUploadedFiles` | `boolean` | `false` | _(kullanımdan kalktı — yeni tile arayüzünde etkisiz)_ |

---

### LinkField — Sayfa / URL Seçici

Mevcut sayfalardan seçim veya manuel URL girişi.

```tsx
fields: {
  link: createLinkField({ label: "Bağlantı" }),
  ctaLink: createLinkField({
    label: "CTA Link",
    showTarget: true,
    placeholder: "https://example.com",
  }),
}
```

**Özellikler:**
- 📄 **Sayfa Seç** — Vaul drawer ile merchant sayfalarını listeler, aranabilir
- 🔗 **Manuel Link** — URL + etiket + hedef (aynı/yeni sekme) girişi
- 🟢 Durum göstergesi (yayınlanmış / değiştirilmiş / taslak)
- 🏷️ Tip badge'i (Sayfa / Link)

| Option | Tip | Default | Açıklama |
|--------|-----|---------|----------|
| `showTarget` | `boolean` | `true` | Hedef sekme seçici |
| `placeholder` | `string` | `https://...` | URL placeholder |

**Değer Tipi (`LinkFieldValue`):**
```ts
{
  url: string;       // "/about" veya "https://..."
  label?: string;    // "Hakkımızda"
  target?: "_self" | "_blank";
  type?: "page" | "custom";
}
```

---

### CodeEditorField — Kod Editörü

Monaco Editor tabanlı syntax-highlighted kod editörü.

```tsx
fields: {
  customHtml: createCodeEditorField({
    label: "Özel Kod",
    defaultLanguage: "html",
  }),
  jsonConfig: createCodeEditorField({
    label: "Config",
    defaultLanguage: "json",
  }),
}
```

---

### ColorField — Renk Seçici

Popover tabanlı gelişmiş renk seçici: doygunluk/parlaklık karesi, hue + alpha kaydırıcıları, swatch paleti, ekrandan renk seçme (EyeDropper) ve inline HEX girişi.

```tsx
import { createColorField } from "@tecof/theme-editor";

fields: {
  bgColor: createColorField({ label: "Arka Plan Rengi" }),
  textColor: createColorField({
    label: "Metin Rengi",
    showOpacity: true,
    defaultColor: "#18181b",
  }),
  accentColor: createColorField({
    label: "Vurgu Rengi",
    swatches: ["#18181b", "#74b500", "#ffffff", "#ef4444"],
  }),
}
```

**Özellikler:**
- 🎨 **SV Karesi + Hue/Alpha** — Doygunluk/parlaklık karesi ve hue + (opsiyonel) alpha kaydırıcıları; pointer ile sürüklenir.
- 🔤 **Inline HEX** — Monospace alanda doğrudan HEX kodu yazma (3/6/8 haneli).
- 🎯 **Swatch Paleti** — Hızlı seçim için özelleştirilebilir renk noktaları.
- 💧 **EyeDropper** — Destekleyen tarayıcılarda ekranın herhangi bir yerinden renk seçme.
- 🕘 **Son Kullanılanlar** — `localStorage` üzerinden son renkler.
- 🔲 **Opaklık** — Opsiyonel alpha kaydırıcısı (8 haneli hex + checkerboard önizleme).
- ↩️ **Sıfırla** — Varsayılan renge geri dönme butonu.

| Option | Tip | Default | Açıklama |
|--------|-----|---------|----------|
| `showOpacity` | `boolean` | `false` | Alpha/opaklık kaydırıcısı |
| `swatches` | `string[]` | `[built-in]` | Popover'daki hızlı renk noktaları (hex listesi) |
| `defaultColor` | `string` | `''` | Varsayılan/sıfırlama rengi |
| `placeholder` | `string` | `#000000` | HEX giriş placeholder |
| `showReset` | `boolean` | `true` | Sıfırlama butonu göster |

> ⚠️ Eski `showPresets` / `presetColors` seçenekleri kaldırıldı; yerine `swatches` kullanın.

---

### RepeaterField — Tekrarlanan Satırlar

Alt alan setini (`subFields`) tekrarlanan satırlar halinde düzenler (SSS, özellik listesi, adım listesi vb.).

```tsx
import { createRepeaterField, createLanguageField, createLinkField } from "@tecof/theme-editor";

fields: {
  items: createRepeaterField({
    label: "Öğeler",
    subFields: {
      title: createLanguageField({ label: "Başlık" }),
      link: createLinkField({ label: "Bağlantı" }),
    },
    minItems: 1,
    maxItems: 6,
    defaultRow: { title: "", link: null },
  }),
}
```

**Özellikler:**
- ➕➖ Satır ekle / sil / çoğalt
- ↕️ Sürükle-bırak ile sıralama (yukarı/aşağı taşıma da destekler)
- 🔽 Satırları genişlet/daralt

| Option | Tip | Default | Açıklama |
|--------|-----|---------|----------|
| `subFields` | `Record<string, FieldConfig>` | — (zorunlu) | Her satırda render edilecek alt alanlar (diğer `create*Field()` sonuçları dahil) |
| `minItems` | `number` | yok | Minimum satır sayısı |
| `maxItems` | `number` | yok | Maksimum satır sayısı |
| `defaultRow` | `Record<string, any>` | yok | Yeni satır eklenince kullanılacak varsayılan değerler |

Değer tipi: `subFields` anahtarlarıyla eşleşen nesnelerden oluşan bir dizi (`Record<string, any>[]`).

---

### IconField — İkon Seçici

`lucide-react` setinden aranabilir ikon seçici. Seçilen değer, ikonun adını (`"ShoppingCart"` gibi) içeren bir string olarak saklanır.

```tsx
import { createIconField } from "@tecof/theme-editor";

fields: {
  icon: createIconField({ label: "İkon" }),
}
```

**Özellikler:**
- 🔍 Aranabilir ızgara (arama yapılmazsa ilk 120 ikon gösterilir)
- 👁️ Seçili ikon önizlemesi + temizle butonu

Alan-özel bir seçeneği yoktur; yalnızca [Ortak Alan Seçenekleri](#ortak-alan-seçenekleri-basefield) (`label`, `labelIcon`, `visible`) geçerlidir.

> Değer sadece ikon **adını** saklar; bileşeninizin `render` fonksiyonunda `lucide-react`'ten karşılık gelen bileşeni kendiniz çözmelisiniz (ör. `const Icon = (LucideIcons as any)[props.icon]`).

---

### ExternalField — Harici Veri Seçici

CMS'e bağlı olmayan, host'un kendi async `fetchList` fonksiyonuyla beslediği aranabilir kayıt seçici. Kendi ürün/kategori/müşteri API'niz gibi üçüncü taraf veri kaynaklarını bağlamak için kullanılır.

```tsx
import { createExternalField } from "@tecof/theme-editor";

fields: {
  product: createExternalField({
    label: "Ürün",
    fetchList: async ({ query }) => {
      const res = await fetch(`/api/products?q=${query ?? ""}`);
      return res.json(); // [{ id, name, sku, ... }, ...]
    },
    mapProp: (row) => ({ id: row.id, name: row.name }),
    mapRow: (row) => ({ Ad: row.name, SKU: row.sku }),
    getItemSummary: (value) => value?.name ?? "",
    placeholder: "Ürün seçin",
  }),
}
```

**Özellikler:**
- 🔎 Aranabilir modal — arama sorgusu her tuş vuruşunda `fetchList`'e geçilir
- 🔄 Yeniden yükleme butonu

| Option | Tip | Default | Açıklama |
|--------|-----|---------|----------|
| `fetchList` | `(params: { query?, filters? }) => Promise<any[]>` | — (zorunlu) | Modal açıldığında/arama yapıldığında satırları getirir |
| `mapProp` | `(row) => any` | satırın kendisi | Seçilen satırdan prop'a yazılacak değeri üretir |
| `mapRow` | `(row) => Record<string, any>` | satırın kendi alanları | Modal tablosunda gösterilecek sütunları üretir |
| `getItemSummary` | `(value) => string` | yok | Kaydedilmiş değeri trigger etiketine çevirir |
| `showSearch` | `boolean` | `true` | Arama kutusunu göster |
| `placeholder` | `string` | yok | Hiçbir şey seçili değilken trigger metni |

Değer tipi: `mapProp` tarafından üretilen herhangi bir değer (varsayılan: ham satırın kendisi).

---

### ApiListField — Repeat Zone için API Liste Kaynağı

Host'un kendi async `fetchList`'i ile beslenen **liste** kaynağı — bir slot'un `repeatSource`'una bağlanır ve öğe şablonu her satır için tekrarlanır (bkz. [Repeat Zone](#repeat-zone-öğe-şablonu--repeatsource)). `ExternalField` tek kayıt seçer; `ApiListField` listenin kendisini akıtır.

```tsx
import { createApiListField } from "@tecof/theme-editor";

fields: {
  source: createApiListField({
    label: "Ürünler",
    fetchList: async ({ query, limit }) =>
      fetch(`/api/products?q=${query ?? ""}&limit=${limit ?? 8}`).then((r) => r.json()),
    itemSchema: [{ key: "name", label: "Ad", type: "text" }], // opsiyonel
  }),
  card: { type: "slot", repeatSource: "source" },
}
```

| Option | Tip | Default | Açıklama |
|--------|-----|---------|----------|
| `fetchList` | `({ query?, limit? }) => Promise<any[]>` | — (zorunlu) | Satırları getirir; editörde ve yayında (client) çalışır |
| `itemSchema` | `{ key, label?, type? }[]` | ilk satırdan çıkarım | `{ }` popover'ındaki öğe alanları |
| `showQuery` | `boolean` | `true` | Arama/filtre metin girişi |
| `showLimit` | `boolean` | `true` | Kayıt adedi girişi |
| `defaultLimit` | `number` | yok | Yeni değerde ön-dolu limit |

**Değer Tipi (`ApiListFieldValue`):** `{ query?: string; limit?: number }` — dokümana yalnızca fetch parametreleri kaydedilir, satırlar render anında çözülür (oturum-içi cache + eş zamanlı istek tekleme).

---

### CmsCollectionField — Koleksiyon Bağlama

Bir bileşeni CMS koleksiyonuna bağlar; koleksiyon seçer, limit/sıralama ayarlar ve bileşenin "slot"larını koleksiyon alanlarına eşler (liste/tekrar eden içerik için).

```tsx
import { createCmsCollectionField } from "@tecof/theme-editor";

fields: {
  source: createCmsCollectionField({
    label: "Veri Kaynağı",
    defaultLimit: 6,
    slots: {
      title: { label: "Başlık", fieldTypes: ["text"] },
      image: { label: "Görsel", fieldTypes: ["image"] },
      link:  { label: "Bağlantı" },
    },
  }),
}
```

| Option | Tip | Default | Açıklama |
|--------|-----|---------|----------|
| `defaultLimit` | `number` | `10` | Çekilecek öğe sayısı varsayılanı |
| `showLimit` | `boolean` | `true` | Limit kontrolü göster |
| `showSort` | `boolean` | `true` | Sıralama kontrolü göster (özel / yeni→eski / eski→yeni) |
| `slots` | `Record<string, { label; fieldTypes? }>` | — | Bileşenin ihtiyaç duyduğu veri slotları; her biri bir CMS alanına eşlenir |

**Değer Tipi (`CmsCollectionFieldValue`):**
```ts
{
  collectionSlug: string;
  collectionName?: string;
  limit?: number;
  sort?: "newest" | "oldest" | "custom";
  fieldMap?: Record<string, string>; // slotKey → CMS field shortcode
}
```

---

### CMS Veri Bağlama (Metin / Textarea)

Yerleşik `text` ve `textarea` alanlarının yanında bir **`{ }` bağlama butonu** görünür. Tıklayınca koleksiyon → alan seçilir ve alana bir `{{ data.shortcode }}` referans token'ı eklenir — elle yazmaya gerek kalmaz. Koleksiyonlar popover açılınca `getCmsCollections()` ile yüklenir.

```tsx
fields: {
  // Bağlama butonu görünür (varsayılan)
  title: { type: "text", label: "Başlık" },

  // Bağlamayı kapat
  staticLabel: { type: "text", label: "Sabit Etiket", bindable: false },
}
```

| Option | Tip | Default | Açıklama |
|--------|-----|---------|----------|
| `bindable` | `boolean` | `true` | `text`/`textarea` alanında CMS bağlama butonunu göster/gizle |

> Token formatı `{{ data.<shortcode> }}`'dır ve render sırasında `cmsData`'ya göre çözülür (CMS şablon sayfaları). `TecofRender`'a ham kayıt `cmsData` prop'u ile verilir.

---

### Ortak Alan Seçenekleri (BaseField)

Tüm `create*Field()` factory fonksiyonları aşağıdaki ortak seçenekleri destekler:

| Option | Tip | Açıklama |
|--------|-----|----------|
| `label` | `string` | Inspector'da görünen alan etiketi |
| `labelIcon` | `ReactElement` | Etiketin yanında gösterilen ikon (ör: Lucide) |
| `visible` | `boolean` | Alanın sidebar'da görünür olup olmadığı |

```tsx
import { Globe, Image, Palette } from "lucide-react";

fields: {
  title: createLanguageField({
    label: "Başlık",
    labelIcon: <Globe size={16} />,
  }),
  bgColor: createColorField({
    label: "Arka Plan",
    labelIcon: <Palette size={16} />,
  }),
  logo: createUploadField({
    label: "Logo",
    labelIcon: <Image size={16} />,
    visible: true,
  }),
}
```

---

## Slot Düzeni & Bölüm Şablonları

### Slot (DropZone) Yönü — `orientation`

`slot` tipi alanlar varsayılan olarak çocukları **alt alta** dizer. `orientation: 'horizontal'` ile **yan yana** (flex-row + wrap) dizilir. Editör, drop eksenini render edilen düzene göre otomatik algılar (yatayda sol/sağ, dikeyde üst/alt göstergesi) ve sürükle-bırak sıralaması buna göre çalışır.

```tsx
fields: {
  columns: { type: "slot", orientation: "horizontal" }, // yan yana
  blocks:  { type: "slot" },                             // varsayılan: dikey
}
```

Bileşen kendi `renderDropZone` çağrısında da geçebilir:

```tsx
render: ({ puck }) => puck.renderDropZone({ zone: "cols", orientation: "horizontal" }),
```

| Değer | Açıklama |
|-------|----------|
| `'vertical'` _(default)_ | Çocuklar alt alta |
| `'horizontal'` | Çocuklar yan yana (satır + sarma) |

> Hem editörde hem `TecofRender` ile yayınlanan sayfada aynı düzen uygulanır.

### Repeat Zone (Öğe Şablonu) — `repeatSource`

Bir `slot` alanına `repeatSource` verildiğinde o slot bir **öğe şablonuna** dönüşür: kart bir kez elementlerle tasarlanır, veri listesindeki **her satır için tekrar** render edilir (Webflow Collection List / Shopify blocks modeli). Şablon içindeki alanlar satır verisine `{{ item.<alan> }}` token'ları ile bağlanır — metin/textarea alanlarındaki `{ }` bağlama butonu şablon içindeyken **"Öğe alanları"** bölümünü gösterir.

```tsx
components: {
  ProductGrid: {
    label: "Ürün Izgarası",
    fields: {
      items: createRepeaterField({           // veri kaynağı: repeater satırları
        label: "Ürünler",
        subFields: { name: { type: "text" }, price: { type: "text" } },
      }),
      card: {
        type: "slot",
        orientation: "horizontal",
        repeatSource: "items",               // ← bu slot 'items' için tekrarlanır
      },
    },
    render: ({ card, className }) => <section className={className}>{card}</section>,
  },
}
```

Şablondaki bir Text elementinin `text` prop'u `"{{ item.name }}"`, fiyat satırı `"Fiyat: {{ item.price }} TL"` olabilir. **Tam token** (`"{{ item.image }}"`) ham değeri olduğu gibi geçirir (görsel/link nesneleri bozulmaz); metin içine gömülü token string olarak enterpolasyon yapılır. Özel yollar: `{{ item._index }}` (0-tabanlı), `{{ item._position }}` (1-tabanlı).

**Veri kaynağı nereden gelirse gelsin çalışır** — `repeatSource`'un gösterdiği prop'un değerine göre satırlar otomatik çözülür:

- **RepeaterField / dizi prop** — satırlar dokümanda kayıtlıdır (yukarıdaki örnek).
- **`createApiListField` (önerilen API yolu)** — host'un `fetchList`'i ile herhangi bir API; satırlar hem editörde (şablon + ghost'lar canlı veriyle) hem yayında kütüphane tarafından çekilir, render kodu gerekmez:

```tsx
fields: {
  source: createApiListField({
    label: "Ürünler",
    fetchList: async ({ query, limit }) =>
      fetch(`/api/products?q=${query ?? ""}&limit=${limit ?? 8}`).then((r) => r.json()),
    // Opsiyonel: binding popover'ındaki öğe alanları (verilmezse ilk satırdan çıkarılır)
    itemSchema: [
      { key: "name",  label: "Ürün Adı", type: "text" },
      { key: "price", label: "Fiyat",    type: "text" },
      { key: "image", label: "Görsel",   type: "image" },
    ],
    defaultLimit: 8,
  }),
  card: { type: "slot", orientation: "horizontal", repeatSource: "source" },
}
```

  Alan değeri yalnızca fetch parametreleridir (`{ query, limit }`); Inspector'da arama + adet girişi, yenile butonu ve canlı kayıt önizlemesi görünür. Sonuçlar parametre bazında cache'lenir (eş zamanlı istekler teklenir); `clearRepeatRowsCache()` ile temizlenir, `resolveRepeatRows()` ile React dışında (örn. SSR ısındırma) çözülür.

- **`createCmsCollectionField`** — değeri (`collectionSlug`/`limit`/`sort`) bir repeat slot'a bağlanırsa satırlar CMS koleksiyonundan otomatik çekilir. Bunun için ağaçta `<TecofProvider>` olmalıdır (editörde her zaman var; provider'sız tam statik yayında satırlar boş kalır — o senaryoda `repeatItems` geçin).
- **Manuel `repeatItems`** — bileşen veriyi kendisi çekip render sırasında geçer (tam kontrol):

```tsx
render: ({ puck }) => {
  const { rows } = useMyProducts();
  return puck.renderDropZone({ zone: "card", repeatItems: rows });
},
```

**Editörde:** şablon ilk satırın verisiyle **bir kez düzenlenebilir** görünür; kalan satırlar etkileşimsiz, hafif soluk **ghost kopyalar** olarak şablonun devamında akar (`display: contents` — grid/flex düzeni yayınla birebir). Yayında (`TecofRender`) döngü gerçek veriyle döner; satır yoksa şablon **hiç render edilmez** (canlı sitede asla ham `{{ item.* }}` görünmez).

| Option (`slot`) | Tip | Açıklama |
|---|---|---|
| `repeatSource` | `string` | Veri kaynağı prop'unun adı (dizi, `createApiListField` veya `createCmsCollectionField` değeri); slot'u öğe şablonuna çevirir |
| `itemSchema` | `{ key, label?, type? }[]` | Bağlama popover'ındaki öğe alanları (verilmezse kaynak alanın `itemSchema`'sından, o da yoksa ilk satırdan çıkarılır) |
| `renderDropZone({ repeatItems })` | `any[]` | Satırları render anında geçme (manuel yol) — editörde ghost'lar da bu veriyle çizilir |

Bileşen içinden satıra programatik erişim için `useRepeatItem()` hook'u (`{ item, index, count }`), host tarafı özel çözümleme için `resolveItemTokens(props, item, index)`, satırları React dışında çözmek için `resolveRepeatRows(value, sourceFieldDef, apiClient?)` ve cache temizliği için `clearRepeatRowsCache()` export edilir.

> Not: Şablon içinde canvas'ta çift tıkla satır-içi düzenleme, çözülmüş metni **literal değer** olarak yazar ve token bağını koparır — bağlı alanları Inspector'dan düzenleyin (Inspector her zaman ham token'ı gösterir).

### Bölüm Şablonları — `config.templates`

"Bölüm Ekle" penceresindeki **Şablonlar** sekmesinde gösterilen, tek tıkla eklenen hazır bölümler. Şablon bir **alt ağaç**tır (kök node + zones) ve eklenirken tüm id'ler **taze üretilir**, yani aynı şablonu defalarca ekleyebilirsiniz.

```tsx
const config = {
  components: { /* ... */ },
  templates: [
    {
      id: "hero-cta",
      label: "Hero + İki Buton",
      thumbnail: "/templates/hero.png", // opsiyonel önizleme görseli
      payload: {
        node: { type: "Hero", props: { id: "t-hero", title: "Başlık" } },
        zones: {
          "t-hero:actions": [
            { type: "Button", props: { id: "t-b1", text: "Başla" } },
            { type: "Button", props: { id: "t-b2", text: "Daha Fazla" } },
          ],
        },
      },
    },
  ],
};
```

**`SectionTemplate` tipi:**

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | `string` | Benzersiz kimlik (React key olarak da kullanılır) |
| `label` | `string` | Şablon kütüphanesinde görünen ad |
| `category` | `string?` | Opsiyonel kategori |
| `thumbnail` | `string?` | Opsiyonel önizleme görseli URL'i (yoksa jenerik ikon) |
| `payload.node` | `TecofNode` | Eklenecek kök node |
| `payload.zones` | `Record<string, TecofNode[]>?` | Kök node'un alt zone'ları (anahtar: `nodeId:slotAdı`) |

### Inline Bileşenler — `inline`

Varsayılan olarak editör her bileşeni bir `.tecof-node-wrapper` div'i ile sarar (seçim/hover/drag bu wrapper üzerinden çalışır). Bileşenin **kendi kök elemanının** sürükleme tutamacı olması gerekiyorsa (ör. sarmalayıcı div'in düzeni bozduğu durumlar), `ComponentConfig`'te `inline: true` verin ve bileşen `puck.dragRef`'i kök elemanına bağlasın.

```tsx
components: {
  InlineButton: {
    label: "Inline Buton",
    inline: true,
    render: ({ puck, text }) => (
      <button ref={puck?.dragRef}>{text}</button>
    ),
  },
}
```

| Option (`ComponentConfig`) | Tip | Default | Açıklama |
|--------|-----|---------|----------|
| `inline` | `boolean` | `false` | Editör wrapper div'ini kaldırır; bileşen `puck.dragRef`'i kök elemanına eklemelidir |

### Etkileşimli Kontroller — `puck.registerOverlayPortal`

**Düzenleme modunda** canvas her tıklamayı editöre yönlendirir: tıklama node'u seçer, çift tıklama satır içi metin düzenlemeyi başlatır, sürükleme node'u taşır. Ayrıca link/buton/form'ların **native davranışı** (navigasyon, form submit) bilinçli olarak iptal edilir — böylece bir sekme başlığına tıklamak sizi düzenlediğiniz sayfadan başka bir adrese götürmez. (**Önizleme modunda** canvas canlı site gibi davranır; her şey normal çalışır.)

Bileşeninizin kendi etkileşimli parçaları (sekme başlıkları, slider okları, akordeon toggle'ları) düzenleme modunda da çalışmalıysa, o elemanı `puck.registerOverlayPortal` ile işaretleyin. Bir React ref callback'i olarak tasarlanmıştır (`null`'a toleranslı):

```tsx
render: ({ puck, tabs }) => (
  <div>
    {tabs.map((tab, i) => (
      <button
        key={i}
        ref={puck.registerOverlayPortal}   // bu buton edit-mode'da canlı kalır
        onClick={() => setActive(i)}
      >
        {tab.title}
      </button>
    ))}
    {/* ... */}
  </div>
)
```

Portal olarak işaretlenen eleman (ve tüm alt elemanları) editörün node handler'larından muaf tutulur: tıklama seçim yapmaz, çift tıklama düzenleme başlatmaz, sürükleme node'u taşımaz ve native davranışı iptal edilmez.

> **Not:** JS ile yapılan yönlendirmeler (ör. `<button onClick={() => router.push(...)}>`) native olmadığı için bu koruma tarafından iptal *edilemez*. Bu tür bileşenler `puck.isEditing` / `editMode` prop'unu kontrol etmeli **veya** kontrolü overlay portal olarak işaretlemelidir.

| `puck` alanı | Tip | Açıklama |
|--------|-----|----------|
| `registerOverlayPortal` | `(el: HTMLElement \| null) => () => void` | Elemanı edit-mode'da canlı bırakır; ref callback olarak kullanılabilir. Temizleyici bir fonksiyon döner |
| `isEditing` | `boolean` | Editör düzenleme modunda mı (`editMode` prop'u ile aynı) |
| `dragRef` | `(el: HTMLElement \| null) => void` | Yalnızca `inline` bileşenlerde: sürükleme tutamacı ref'i |

---

## API Client

```tsx
import { TecofApiClient } from "@tecof/theme-editor";

const client = new TecofApiClient("https://api.example.com", "secret-key");
```

| Metot | Açıklama |
|-------|----------|
| `getPage(id)` | Sayfa draft'ını getir |
| `savePage(id, data)` | Sayfa kaydet |
| `getPublishedPage(slug, locale?)` | Yayınlanmış sayfayı getir |
| `getMerchantInfo()` | Dil ayarlarını getir |
| `uploadFile(file, folder?)` | Dosya yükle |
| `getUploads(page, limit)` | Yüklenen dosyaları listele |
| `getPages()` | Merchant sayfalarını listele |
| `translate(text, sourceLang, locales, isHtml?)` | Metni birden çok dile çevir |
| `cdnUrl` | CDN base URL |

---

## Backend API Endpoints

Kütüphane aşağıdaki endpoint'leri kullanır (`x-secret-key` header ile):

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/store/editor/:id` | Sayfa draft'ını getir |
| `PUT` | `/api/store/editor/:id` | Sayfa kaydet |
| `POST` | `/api/store/render` | Yayınlanmış sayfayı getir (slug + locale) |
| `GET` | `/api/store/merchant-info` | Merchant dil ayarları |
| `POST` | `/api/store/upload` | Dosya yükle |
| `GET` | `/api/store/uploads` | Yüklenen dosyaları listele |
| `GET` | `/api/store/pages` | Merchant sayfalarını listele |
| `POST` | `/api/store/translate` | Metni çok dile çevir |

---

## Utility Fonksiyonları

```tsx
import {
  getDefaultTheme,
  generateCSSVariables,
  mergeTheme,
  hexToHsl,
  hslToHex,
  lighten,
  darken,
} from "@tecof/theme-editor";
```

| Fonksiyon | Açıklama |
|-----------|----------|
| `getDefaultTheme()` | Varsayılan tema config'i |
| `generateCSSVariables(theme)` | ThemeConfig → CSS custom properties |
| `mergeTheme(base, overrides)` | Tema config deep-merge |
| `hexToHsl(hex)` | Hex → HSL dönüşümü |
| `hslToHex(h, s, l)` | HSL → Hex dönüşümü |
| `lighten(hex, amount)` | Rengi açar |
| `darken(hex, amount)` | Rengi koyulaştırır |

---

## iframe postMessage API

`TecofEditor` iframe içinde çalıştığında parent ile iletişim kurar:

```ts
// Parent → Editor
iframe.postMessage({ type: "puck:save" }, "*");
iframe.postMessage({ type: "puck:publish" }, "*");
iframe.postMessage({ type: "puck:undo" }, "*");
iframe.postMessage({ type: "puck:redo" }, "*");
iframe.postMessage({ type: "puck:viewport", width: "375px" }, "*");

// Editor → Parent
window.addEventListener("message", (e) => {
  if (e.data.type === "puck:changed") { /* değişiklik var (debounce'lu) */ }
  if (e.data.type === "puck:saved") { /* başarıyla kaydedildi, e.data.data güncel draft */ }
  if (e.data.type === "puck:saveError") { /* kayıt hatası */ }
  if (e.data.type === "puck:itemSelected") { /* e.data.item = { type, id } */ }
  if (e.data.type === "puck:itemDeselected") { /* seçim kalktı */ }
});
```

> **Güvenlik:** `hostOrigin` prop'u verildiğinde gelen mesajlar `e.origin`'e göre
> doğrulanır ve giden mesajlar yalnızca o origin'e gönderilir. Embed senaryosunda
> `hostOrigin` vermeniz önerilir; aksi halde `'*'` kullanılır (geriye uyumluluk).
> Tüm köprü `src/studio/bridge.ts` içinde soyutlanmıştır.

---

## Klavye Kısayolları (Studio)

| Kısayol | İşlem |
|---|---|
| `⌘/Ctrl + K` | **Komut paleti** aç/kapat (eylemler + bileşen ekleme) |
| `⌘/Ctrl + Z` | Geri al |
| `⌘/Ctrl + Shift + Z` · `⌘/Ctrl + Y` | Yinele |
| `⌘/Ctrl + C` / `X` / `V` | Kopyala / Kes / Yapıştır (seçili node'lar) |
| `⌘/Ctrl + D` | Çoğalt (çoklu seçimde toplu) |
| `⌘/Ctrl + S` | Taslak kaydet |
| `Delete` / `Backspace` | Sil (çoklu seçimde toplu) |
| `↑` / `↓` / `←` / `→` | Kardeş node'lar arası seçim gezinme (↑/← önceki, ↓/→ sonraki) |
| `⌘/Ctrl + Tık` · `Shift + Tık` | Çoklu seçime ekle/çıkar |
| `Esc` | Komut paletini kapat, yoksa seçimi kaldır |

### Komut Paleti (⌘K)

Tek bir aramadan **eylemleri** (geri/ileri al, kopyala/kes/yapıştır, çoğalt, sil, önizleme, panelleri aç/kapat, kaydet — her birinin kısayolu yanında listelenir) ve **bileşen eklemeyi** (config'deki tüm bileşenler) çalıştırır. Ok tuşları ile gezilir, `Enter` ile uygulanır, `Esc` ile kapanır.

> Kopyalanan node'lar `localStorage` (`tecof:clipboard:v1`) üzerinden sekmeler/sayfalar
> arası yapıştırılabilir; yapıştırmada id'ler taze üretilir.

---

## CSS ve Tema Yapısı

Kütüphane %100 oranında izole bir CSS altyapısı sunar. Önceden kullanılan inline "CSS-in-JS" tarzı sabit tasarımlar kaldırılmış, field modüllerine ait tüm UI stilleri (EditorField, LinkField, UploadField vs.) merkezi `dist/styles.css` içerisine taşınmıştır.

Tasarım çakışmalarını önlemek için kütüphanenin sunduğu tüm CSS sınıfları sadece `.tecof-[component]-[element]` (örnek: `.tecof-upload-file-list`) ön ekini kullanır. Tüm editör arayüzü `src/styles.css` içindeki `:root` token'larından beslenir.

### Renk Paleti (lime-green)

`:root` altında tam bir `--tecof-primary-50…950` lime-green paleti tanımlıdır. **Kural: `600` ana renk, `700` hover.** Bileşenler doğrudan `-500/-600` skalasını değil, **semantik accent token'larını** kullanır:

| Token | Değer | Kullanım |
|---|---|---|
| `--tecof-accent` | `primary-600` (`#74b500`) | Ana vurgu (buton, aktif sınır) |
| `--tecof-accent-hover` | `primary-700` (`#588902`) | Hover |
| `--tecof-accent-active` | `primary-800` | Active/basılı |
| `--tecof-accent-fg` | `primary-950` (`#1d3300`) | Accent zemini üstü **koyu yazı** (AA) |
| `--tecof-accent-subtle` | `primary-50` | Tint arka plan |
| `--tecof-accent-text` | `primary-700` | Açık zeminde okunur accent metin |
| `--tecof-accent-ring` | `rgba(116,181,0,.30)` | Focus halkası |

> Lime zemin üzerine beyaz yazı kontrast bırakmadığı için accent dolgular **koyu yazı** (`--tecof-accent-fg`) kullanır. Bu token'lar yalnızca editör arayüzünü boyar; kullanıcı sitesinin teması (`--theme-*`, `generateCSSVariables`) etkilenmez.

Studio arayüzü de aynı sistemdedir: canvas, drop zone, selection overlay, inspector ve field loader'ları bu accent token'larını ve `.tecof-skeleton*` primitive'lerini kullanır. **Tüm yükleme durumları skeleton loader'dır** (spinner yalnızca buton-içi mikro yüklemede). Inline style yalnızca gerçek runtime değerleri için bırakılır (örn. seçili node overlay koordinatı, layer indent CSS değişkeni, kullanıcı renk swatch'ı veya dışarıdan gelen render style prop'u).

### Studio Editör Özellikleri

- **Düzenleme / Önizleme modu** — Üst bardaki toggle ile. Düzenleme'de tıklayınca bileşen seçilir, link/butonlar pasiftir; Önizleme'de link ve butonlar canlı çalışır, editör çerçevesi gizlenir.
- **Inline metin düzenleme** — Canvas'taki metne çift tıklayın; düzenlenen öğe accent kenarlıkla işaretlenir (öğenin kendi arka plan/yazı rengi korunur), Enter kaydeder, Esc iptal eder. Bileşenler düzenlenebilir metni `data-tecof-prop="propAdı"` (ve çok dilli için `data-tecof-lang`) ile işaretleyebilir; aksi halde string-eşleştirme fallback'i devreye girer.
- **Çoklu seçim + kopyala/yapıştır** — `⌘/Ctrl/Shift + tık` ile çoklu seçim; kopyala/kes/yapıştır (sekmeler arası `localStorage`), toplu sil/çoğalt. Bkz. [Klavye Kısayolları](#klavye-kısayolları-studio).
- **Görsel stil editörü (Tailwind)** — Inspector'daki "Stil" sekmesi; breakpoint + state bazlı (`md:hover:` dahil), preset token'lar, serbest (arbitrary) değerler ve **canlı tema renkleri** (`--theme-color-*`). Daha az belirgin katmandan **devralınan değerler** soluk ipucu olarak gösterilir. Bkz. [docs/TAILWIND.md](docs/TAILWIND.md).
- **Komut paleti (⌘K)** — Tek aramadan tüm eylemler + bileşen ekleme; kısayollar listelenir, ok tuşlarıyla gezilir.
- **Canlı tema editörü** — Seçim yokken Inspector'daki "Tema" sekmesi; renk/tipografi/spacing düzenlenir ve değişiklik hem editöre hem canvas'a `--theme-*` CSS değişkenleri olarak **anında** uygulanır. Tema `root.props._tecofTheme`'de saklanır (kayda dahil, undo/redo'lu).
- **Boşluk (box-model) overlay'i** — Bir öğenin üzerine gelince **padding (yeşil)** içeride, **margin (amber)** dışarıda devtools tarzı renkli gösterilir.
- **Yan yana slot düzeni** — `slot` alanlarına `orientation: 'horizontal'` verilerek çocuklar yan yana dizilir; sürükle-bırak drop yönü (sol/sağ ↔ üst/alt) otomatik algılanır.
- **Ok tuşuyla gezinme** — Seçili node'dan kardeşlerine ↑/↓/←/→ ile geçiş.
- **Dokunmatik sürükle-bırak** — Tablet/telefonda bir bileşene, palet bloğuna veya katman satırına **basılı tutup** (~300ms) sürükleyin: aynı drop kuralları, hizalama kılavuzları ve otomatik kaydırma ile taşıma/ekleme; katman panelinde üst/alt sıralama ve (zone'lu satırlarda) ortaya bırakarak "içine taşıma". Erken parmak hareketi kaydırma olarak kalır; fare native DnD yolunu kullanır. Ek kurulum gerekmez.
- **Görsel blok paleti** — Sol panelde bileşenler, varsa render önizleme görselleriyle (lazy yüklenir).
- **Çökme dayanıklılığı** — Bir bileşenin render hatası tüm canvas'ı düşürmez; node bazında error boundary ile izole edilir, prop düzeltilince kendiliğinden toparlanır.
- **Global dil** — Çoklu dilli içerikte dil, üst bardaki tek seçiciden (merchant-info) değiştirilir. Alanlar yalnızca aktif dili düzenler; alan-içi dil sekmeleri Studio'da gizlenir (provider yoksa eski sekmeli mod geçerlidir — geriye uyum). Bkz. `studio/language/LanguageContext`.
- **Daraltılabilir paneller** — Sol (blok/katman) ve sağ (inspector) paneller üst bar butonlarıyla daraltılıp ince ikon rayına iner; canvas genişler.
- **Performans** — Ağır editör alanları (Monaco / TipTap / FilePond) ayrı chunk'lara bölünüp talep üzerine yüklenir; ana paket ~1.37 MB → ~210 KB.

### Stil Editörü & Tailwind

Inspector "Stil" sekmesi, node'lara yapısal token modeli (`node.props._tecofStyles`)
olarak stil uygular ve bunu Tailwind class string'ine derler. Üretimde class'ların
purge edilmemesi için host Tailwind config'ine safelist eklenmelidir:

```js
import { getSafelist, collectDocumentClasses } from "@tecof/theme-editor";

export default {
  // Preset token'ların tamamı (sonlu) + sonlu tema-renk arbitrary'leri:
  safelist: [
    ...getSafelist(),
    // Serbest (arbitrary) değerler için kaydedilmiş sayfalardan toplayın:
    ...savedPages.flatMap((p) => collectDocumentClasses(p.draftData)),
  ],
};
```

- `getSafelist()` — editörün üretebileceği tüm **preset** class'larını (token × breakpoint × state, `md:hover:` dahil) + sonlu **tema-renk** arbitrary'lerini (`bg-[var(--theme-color-primary)]`) döndürür.
- `collectStyleClasses(styles)` / `collectDocumentClasses(pageData)` — kaydedilmiş bir sayfadaki tüm stil class'larını (kullanıcının girdiği `p-[10px]`, `bg-[#ff0000]` gibi **serbest** değerler dahil) toplar; build aşamasında safelist'e ekleyin.

> `TecofRender` (yayın renderer'ı) artık `_tecofStyles`'ı editörle birebir aynı `compileStyles` akışıyla `className`'e derler — yani görsel stil editörünün çıktısı yayınlanan sayfada da uygulanır.

Tam entegrasyon (Tailwind v4 `@theme`, arbitrary değerler, breakpoint/state, tema renkleri) için:
**[docs/TAILWIND.md](docs/TAILWIND.md)**.

Editör alanlarının tam verimle (FilePond, Doka Editor vs.) düzgün işleyebilmesi için bu CSS dosyasını layout ana dosyanıza dahil edin:

```tsx
// Ana Layout / Editor bileşenine yakın
import "@tecof/theme-editor/dist/styles.css";
```

---

## Geliştirme

```bash
npm run dev        # Watch mode (tsup)
npm run build      # Production build + CSS bundle
npm run lint       # ESLint
npm run test       # Vitest
npm run storybook  # Storybook
```

## Lisans

MIT © Tecof
