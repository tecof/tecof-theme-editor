# Tecof Theme Editor — AI Entegrasyon Rehberi

Bu dosya, bir yapay zekâ asistanının `@tecof/theme-editor` hakkında doğru ve
tutarlı cevap vermesi için kısa, normatif bağlam sağlar.

## Paket kimliği

- Paket: `@tecof/theme-editor`
- Belgelenen sürüm: `0.0.45`
- Çalışma zamanı: React 18 veya React 19
- Amaç: Tecof mağaza ve içerik sayfaları için görsel Studio editörü, yayın
  renderer'ı, API istemcisi ve gelişmiş alan bileşenleri
- Ana export'lar: `TecofProvider`, `TecofEditor`, `TecofStudio`, `TecofRender`,
  `TecofPicture`, `TecofApiClient`
- `TecofEditor`, güncel Studio editörünün public adıdır.

## Cevap üretme kuralları

1. Editör ve public renderer için aynı `StudioConfig` kullanılmalıdır.
2. `TecofRender` veri getirmez. Önceden yüklenmiş `PuckPageData` alır.
3. Paket UI stilleri için uygulama girişinde
   `@tecof/theme-editor/styles.css` import edilmelidir.
4. Studio'nun ürettiği dinamik Tailwind class'ları production build tarafından
   kendiliğinden bulunmaz. Preset'ler için `getSafelist()`, arbitrary değerler
   için kaydedilmiş sayfalarda `collectDocumentClasses()` kullanılmalıdır.
5. Tema, `root.props._tecofTheme` içinde saklanır. Public sayfada
   `generateCSSVariables()` çıktısı uygulanmalıdır.
6. Embed senaryosunda `hostOrigin` verilmelidir. Verilmezse geriye uyumluluk
   nedeniyle `postMessage` hedefi `*` olur.
7. Registry'deki component type adı değişirse eski kayıtlar için
   `config.migrations` tanımlanmalıdır. İzinler varsayılan olarak açıktır;
   kısıtlar `config.permissions` → `component.permissions` →
   `component.resolvePermissions` sırasıyla birleştirilir (bkz.
   `docs/PERMISSIONS.md`).
8. Native HTML5 drag-and-drop dokunmatik cihazlarda tam edit deneyimi sunmaz.
   Public renderer responsive çalışmaya devam eder.
9. Bilinmeyen bir API veya özellik uydurulmamalıdır. Önce MCP araması veya
   ilgili kaynak okunmalıdır.

## Minimum kurulum

```bash
npm install @tecof/theme-editor react react-dom
```

```tsx
import {
  TecofEditor,
  TecofProvider,
  TecofRender,
} from "@tecof/theme-editor";
import "@tecof/theme-editor/styles.css";

<TecofProvider
  apiUrl="https://api.example.com"
  secretKey="merchant-secret"
  cdnUrl="https://cdn.example.com"
>
  <TecofEditor pageId="page-id" config={config} />
</TecofProvider>
```

## Veri modeli

```ts
interface PuckPageData {
  content: Array<{
    type: string;
    props: Record<string, unknown>;
  }>;
  root: {
    props: Record<string, unknown>;
  };
  zones: Record<string, Array<{
    type: string;
    props: Record<string, unknown>;
  }>>;
}
```

Root node'lar `content` dizisinde bulunur. İç içe node'lar `zones` nesnesinde
`parentId:zoneName` anahtarıyla saklanır.

## StudioConfig özeti

```ts
const config = {
  components: {
    Hero: {
      label: "Hero",
      category: "content",
      fields: {
        title: { type: "text", label: "Başlık" },
      },
      defaultProps: {
        title: "Yeni başlık",
      },
      render: ({ title }) => <h1>{title}</h1>,
    },
  },
  categories: {
    content: {
      title: "İçerik",
      components: ["Hero"],
    },
  },
  templates: [],
  permissions: {
    drag: true,
    delete: true,
    duplicate: true,
    edit: true,
  },
  migrations: {
    version: 1,
  },
};
```

Component config; `fields`, `defaultProps`, `render`, `inline`,
`acceptsChildren`, `maxItems`, `allowedParents`, `permissions`,
`resolvePermissions`, `resolveFields` ve `resolveData` seçeneklerini
destekler.

## Alanlar

Yerleşik alan tipleri:

- `text`
- `textarea`
- `select`
- `number`
- `boolean`
- `toggle`
- `range`
- `radio`
- `array`
- `object`
- `slot`

Gelişmiş alan factory'leri:

- `createLanguageField`: Merchant dilleri ve çeviri
- `createEditorField`: TipTap zengin metin editörü
- `createUploadField`: Medya kütüphanesi, FilePond, sıkıştırma ve Doka
- `createLinkField`: Merchant sayfası veya manuel URL seçimi
- `createColorField`: HEX, alpha, swatch ve EyeDropper
- `createCodeEditorField`: Monaco kod editörü
- `createRepeaterField`: Tekrarlanan satırlar
- `createCmsCollectionField`: CMS koleksiyon ve alan eşleme
- `createIconField`: İkon seçimi
- `createExternalField`: Üçüncü taraf listeden kayıt seçimi

`text` ve `textarea` alanlarında CMS bağlama varsayılan olarak açıktır.
Kaydedilen token formatı `{{ data.shortcode }}` şeklindedir. Public render
sırasında ham kayıt `cmsData` prop'u ile verilmelidir.

## TecofEditor önemli prop'ları

| Prop | Anlamı | Varsayılan |
|---|---|---|
| `pageId` | Backend sayfa kimliği | zorunlu |
| `config` | Ortak component registry | zorunlu |
| `accessToken` | Save isteği Authorization değeri | yok |
| `hostOrigin` | Güvenli postMessage origin'i | `*` |
| `autoSave` | Debounce'lu otomatik draft kaydı | `false` |
| `autoSaveDelay` | Autosave gecikmesi | `2000` ms |
| `warnOnUnsavedChanges` | Sekme kapanış uyarısı | `true` |
| `onChange` | Yaklaşık 300 ms debounce'lu değişiklik callback'i | yok |
| `onSave` | Başarılı kayıt callback'i | yok |

## API Client

`TecofApiClient` aşağıdaki public metotları sunar:

- `getPage(id, signal?)`
- `savePage(id, draftData, title?, accessToken?)`
- `getPublishedPage(slug, locale?)`
- `getMerchantInfo()`
- `uploadFile(file, folder?)`
- `getUploads(page, limit)`
- `getPages()`
- `translate(text, sourceLang, locales, isHtml?)`
- `getComponentPreview(domain, componentName)`

İstekler `x-secret-key` header'ını kullanır. Upload isteğinde multipart
`Content-Type` header'ı tarayıcı tarafından oluşturulmalıdır.

## Tailwind ve tema

Studio stilleri node'un `_tecofStyles` prop'unda yapısal token olarak saklar.
`compileStyles()` bu modeli class string'ine dönüştürür.

```ts
{
  base: { p: "4", bg: "primary-600" },
  md: { p: "[40px]" },
  states: {
    hover: { bg: "primary-700" },
    "md:hover": { bg: "primary-800" },
  },
}
```

Desteklenen breakpoint'ler `base`, `sm`, `md`, `lg`, `xl`; state'ler
`hover`, `focus`, `active` değerleridir. Arbitrary değerler köşeli parantezle
saklanır.

Tecof primary renk kuralı:

- Ana vurgu: `#74b500` (`primary-600`)
- Hover: `#588902` (`primary-700`)
- Vurgu zemini üstü metin: `#1d3300` (`primary-950`)

## postMessage protokolü

Parent'tan editöre:

- `puck:save`
- `puck:publish`
- `puck:undo`
- `puck:redo`
- `puck:viewport`

Editörden parent'a:

- `puck:changed`
- `puck:saved`
- `puck:saveError`
- `puck:itemSelected`
- `puck:itemDeselected`

`puck:` prefix'i geriye dönük host uyumluluğu için korunur.

## Hızlı teşhis

### Yayında Studio stilleri görünmiyor

1. Paket CSS import'unu kontrol et.
2. `getSafelist()` çıktısını Tailwind build'e ekle.
3. Arbitrary değerler varsa `collectDocumentClasses()` çalıştır.
4. Tema renkleri eksikse public root'ta tema CSS değişkenlerini üret.

### Editörde görünen component yayında görünmüyor

1. Editör ve renderer'ın aynı config'i kullandığını kontrol et.
2. Kaydedilmiş `type` değerinin registry'de bulunduğunu kontrol et.
3. Type değiştiyse migration ekle.

### iframe mesajları çalışmıyor

1. `hostOrigin` ile parent origin'inin birebir aynı olduğunu kontrol et.
2. Mesajı `iframe.contentWindow` hedefine gönder.
3. `event.origin` doğrulamasını ve `puck:` mesaj tipini kontrol et.

