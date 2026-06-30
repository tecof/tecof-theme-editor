# @tecof/theme-editor

Tecof platform için **sayfa editörü**, **render motoru** ve **gelişmiş alan bileşenleri** kütüphanesi.

> API Client, Context Provider, Tecof Studio editörü, çok dilli alan yöneticileri, medya yöneticisi, link seçici, resim görüntüleyici ve tema araçları içerir.

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

FilePond tabanlı dosya yükleme + Vaul Drawer medya kütüphanesi + Doka görseldüzenleyici.

```tsx
fields: {
  images: createUploadField({
    label: "Görseller",
    allowMultiple: true,
    maxFiles: 10,
    maxFileSize: "50MB",
    showUploadedFiles: true,
  }),
  document: createUploadField({
    label: "Doküman",
    allowMultiple: false,
    acceptedTypes: ["application/pdf"],
  }),
}
```

**Özellikler:**
- 📁 **Medya Seç** — Vaul drawer ile sunucudaki mevcut dosyaları seçin
- 📤 **Yeni Yükle** — FilePond ile sürükle-bırak dosya yükleme
- 🖼️ **Doka Görsel Düzenleyici** — Kırp, döndür, parlaklık, kontrast, markup, çıkartma
- 🗜️ **Resim Sıkıştırma** — Otomatik WebP dönüşümü (browser-image-compression)
- 📄 24+ dosya türü desteği (görseller, PDF, Office, CSV, video)
- 👁️ Dosya önizleme, indirme ve kaldırma butonları
- 🇹🇷 Tamamen Türkçe etiketler (FilePond + Doka)

| Option | Tip | Default | Açıklama |
|--------|-----|---------|----------|
| `allowMultiple` | `boolean` | `true` | Çoklu dosya |
| `maxFiles` | `number` | `100` | Maksimum dosya sayısı |
| `maxFileSize` | `string` | `100MB` | Tek dosya limiti |
| `maxTotalFileSize` | `string` | `200MB` | Toplam limit |
| `acceptedTypes` | `string[]` | `[all]` | İzin verilen MIME türleri |
| `showUploadedFiles` | `boolean` | `false` | Başlık göster |
| `imageCompressionEnabled` | `boolean` | `true` | Sıkıştırma aktif |
| `allowReorder` | `boolean` | `true` | Sürükle-bırak sıralama |

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

Yerel renk seçici, HEX giriş, hazır palet ve opsiyonel opaklık kaydırıcısı.

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
    showPresets: false,
  }),
}
```

**Özellikler:**
- 🎨 **Yerel Renk Seçici** — Sistem renk picker'ı ile kolay seçim
- 🔤 **HEX Giriş** — Monospace font ile doğrudan HEX kodu yazma
- 🎯 **Hazır Palet** — 9×n grid ile hızlı renk seçimi (tamamen özelleştirilebilir)
- 🔲 **Opaklık** — Opsiyonel alpha/opaklık kaydırıcısı (8-digit hex)
- ↩️ **Sıfırla** — Varsayılan renge geri dönme butonu

| Option | Tip | Default | Açıklama |
|--------|-----|---------|----------|
| `showOpacity` | `boolean` | `false` | Opaklık kaydırıcısı |
| `showPresets` | `boolean` | `true` | Hazır renk paleti göster |
| `presetColors` | `string[]` | `[built-in]` | Özel hazır renk listesi |
| `defaultColor` | `string` | `''` | Varsayılan/sıfırlama rengi |
| `placeholder` | `string` | `#000000` | HEX giriş placeholder |
| `showReset` | `boolean` | `true` | Sıfırlama butonu göster |

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
| `⌘/Ctrl + Z` | Geri al |
| `⌘/Ctrl + Shift + Z` · `⌘/Ctrl + Y` | Yinele |
| `⌘/Ctrl + C` / `X` / `V` | Kopyala / Kes / Yapıştır (seçili node'lar) |
| `⌘/Ctrl + D` | Çoğalt (çoklu seçimde toplu) |
| `Delete` / `Backspace` | Sil (çoklu seçimde toplu) |
| `⌘/Ctrl + Tık` · `Shift + Tık` | Çoklu seçime ekle/çıkar |
| `Esc` | Seçimi kaldır |

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
- **Görsel stil editörü (Tailwind)** — Inspector'daki "Stil" sekmesi; breakpoint + state bazlı, preset token'lar ve serbest (arbitrary) değerler. Bkz. [docs/TAILWIND.md](docs/TAILWIND.md).
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
import { getSafelist } from "@tecof/theme-editor";
export default { safelist: getSafelist(), /* ... */ };
```

Tam entegrasyon (Tailwind v4 `@theme`, arbitrary değerler, breakpoint/state) için:
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
