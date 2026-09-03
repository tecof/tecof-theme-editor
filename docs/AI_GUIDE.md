# Tecof Theme Editor — AI Entegrasyon Rehberi

Bu dosya, bir yapay zekâ asistanının `@tecof/theme-editor` hakkında doğru ve
tutarlı cevap vermesi için kısa, normatif bağlam sağlar.

## Paket kimliği

- Paket: `@tecof/theme-editor`
- Belgelenen sürüm: `0.0.71`
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
8. Canvas mimarisi sarmalayıcısızdır (wrapperless canvas): Canvas üzerinde ekstra DOM wrapper düğümleri üretilmez. Seçim, hover ve sürükleme delegasyon/overlay sistemiyle yürütülür.
9. Bileşenler `fieldsGroups` ile Inspector paneli içerisinde akordeon gruplarına ayrılabilir (`{ name: string, fields: string[] }`).
10. Aynı `sharedComponentId` değerini paylaşan node'lar Canlı Sembol (Live Symbol) olarak çalışır. Birinde yapılan değişiklik tüm örneklerde canlı güncellenir; alan bazlı `_symbolOverrides` ile özelleştirilebilir.
11. Dokunmatik cihazlarda (tablet/telefon) sürükle-bırak, pointer-event tabanlı
   ayrı bir katmanla çalışır: bir canvas node'una, palet bloğuna veya katman
   paneli satırına **basılı tutmak** (~300ms) sürüklemeyi başlatır; erken
   hareket kaydırma sayılır. Fare, native HTML5 DnD yolunu kullanmaya devam eder.
12. Bilinmeyen bir API veya özellik uydurulmamalıdır. Önce MCP araması veya
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
- `createExternalField`: Üçüncü taraf listeden TEK kayıt seçimi
- `createApiListField`: Repeat zone için API LİSTE kaynağı (host `fetchList`)

E-ticaret seçicileri (mağazanın kendi kayıtlarından seçim):

- `createCategoryField` / `createCategoryListField`: Kategori (ağaç, girintili)
- `createProductField` / `createProductListField`: Ürün (sunucu taraflı arama)
- `createBrandField` / `createBrandListField`: Marka
- `createTagField` / `createTagListField`: Etiket
- `createAttributeField` / `createAttributeListField`: Ürün özelliği (renk/beden)
- `createVariantTypeField`: Varyant tipi tanımı
- `createVariantField`: Ürün → varyant (iki adımlı)
- `createFlashSaleField`: Flaş satış (tarih/rozet/renk snapshot'ı ile)
- `createCampaignField`: Pazarlama kampanyası
- `createDiscountField`: Kupon / indirim kodu

Bu alanlar seçimi bir **snapshot** olarak saklar: `id` + `slug` + ad ve
render için gereken alanlar (tarih, renk, kod…). İki sebeple:
etiket/kupon/flaş satış kayıtlarının storefront (secretKey) ucu YOKTUR, yani
yayınlanan sayfa kaydı yeniden okuyamaz; ayrıca ürün listeleme ucu markayı ve
etiketi **ObjectId**, kategoriyi **slug** ile filtreler — yalnız slug saklamak
marka/etiket filtresini sessizce çalışmaz hâle getirir.

Seçicilerin listesi merchant uçlarından gelir ve **JWT + `x-merchant-id`**
ister; `TecofApiClient` mağaza kimliğini `merchant-info`'dan bir kez çözüp
header'a ekler. Kimlik çözülemezse liste boş gösterilmez, HATA basılır —
"kaydım yok" ile "yetkim yok" karışmasın.

Snapshot **seçim anında donar**: panelde kampanyanın tarihi ya da markanın adı
sonradan değişirse sayfa eski değeri göstermeye devam eder; merchant alanı
yeniden seçmelidir.

`text` ve `textarea` alanlarında CMS bağlama varsayılan olarak açıktır.
Kaydedilen token formatı `{{ data.shortcode }}` şeklindedir. Public render
sırasında ham kayıt `cmsData` prop'u ile verilmelidir.

## Repeat zone (öğe şablonu)

Bir `slot` alanına `repeatSource` verildiğinde slot bir **öğe şablonuna**
dönüşür: zone'un çocukları veri listesindeki her satır için tekrarlanır
(ürün kartı, koleksiyon listesi vb.).

```tsx
fields: {
  items: createRepeaterField({ label: "Ürünler", subFields: { /* ... */ } }),
  card:  { type: "slot", orientation: "horizontal", repeatSource: "items" },
}
```

Kurallar:

1. `repeatSource`, veri kaynağı **kardeş prop'un adıdır**. Prop'un değerine
   göre satırlar otomatik çözülür: dizi (RepeaterField) olduğu gibi;
   `createApiListField` değeri host'un `fetchList`'i ile; `createCmsCollectionField`
   değeri (`collectionSlug`) `<TecofProvider>` API client'ı ile çekilir
   (provider yoksa CMS satırları boş kalır). Sonuçlar parametre bazında
   cache'lenir; `clearRepeatRowsCache()` temizler, `resolveRepeatRows()` React
   dışında çözer. Alternatif: bileşen satırları render anında
   `puck.renderDropZone({ zone, repeatItems: rows })` ile geçebilir.
2. Şablon içindeki prop'lar satıra `{{ item.<yol> }}` token'ları ile bağlanır.
   Prop değeri **tek başına token** ise ham değer olduğu gibi geçer (görsel /
   link nesneleri bozulmaz); metne gömülü token string'e çevrilir. Özel
   yollar: `{{ item._index }}` (0 tabanlı), `{{ item._position }}` (1 tabanlı).
3. `{{ item.* }}` token'larını `{{ data.* }}`'dan farklı olarak **kütüphane
   çözer** (hem editör canvas'ı hem `TecofRender`); host tarafında ek iş
   gerekmez.
4. Editörde şablon **ilk satırın verisiyle bir kez** düzenlenir; kalan
   satırlar etkileşimsiz ghost kopya olarak görünür. Yayında satır yoksa
   şablon hiç render edilmez (ham token asla sızmaz).
5. Inspector'daki `{ }` bağlama butonu şablon içindeyken "Öğe alanları"
   bölümü gösterir. Alan listesi sırasıyla: slot'un `itemSchema`'sı → kaynak
   alanın `itemSchema`'sı (`createApiListField({ itemSchema })`) → çözülen ilk
   satırdan otomatik çıkarım (API/CMS satırları canvas'ta yüklendikten sonra
   da çalışır). Yalnızca manuel `repeatItems` yolunda `itemSchema`
   bildirilmesi gerekir.
6. İlgili export'lar: `useRepeatItem()` (şablon bileşeni içinde `{ item,
   index, count }`), `resolveItemTokens(değer, item, index)`,
   `findRepeatScope(doc, config, nodeId)`, `ItemSchemaField` tipi.
7. Canvas'ta bağlı bir metne çift tıklayıp satır içi düzenleme yapmak token'ı
   literal değerle ezer; bağlı alanlar Inspector'dan düzenlenmelidir.

## Array kartı işaretleri (`data-tecof-item`)

Repeat zone'dan AYRI mekanizma: bileşen `type:'array'` prop'unu KENDİ render'ında
map'liyorsa (slot yok), kartları editöre şu attr'larla tanıtabilir:

```tsx
{services.map((s, i) => (
  <li key={i} data-tecof-item={`services:${i}`}>
    <h3 data-tecof-item-prop="title">{getL(s.title, locale)}</h3>
    <p  data-tecof-item-prop="description">{getL(s.description, locale)}</p>
  </li>
))}
```

- Kart edit modunda hover çerçevesi alır; tıklama Inspector'da `services`
  alanının o satırını açıp kaydırır; çift tıklama satır alanını yerinde
  düzenler (`{ ...row, [alan]: değer }` immutable satır yazımı, tek undo adımı).
- Çok dilli satır alanları desteklenir (`[{code,value}]` merge + `data-tecof-lang`).
- `data-tecof-item-prop` BİLİNÇLİ olarak `data-tecof-prop`'tan ayrıdır: eski
  editör sürümleri satır işaretini top-level prop sanıp temaya çöp prop
  yazabilirdi — yeni attr'ı eski sürüm hiç görmez (ileri-uyumlu, zararsız).
- Satır, commit anında silinmiş/taşınmışsa yazım sessizce vazgeçer (bayat
  index guard'ı) — yanlış satıra asla yazılmaz.

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
| `onLanguageChange` | Aktif düzenleme dili callback'i — `(code: string) => void` | yok |

`onLanguageChange` sözleşmesi: aktif dil ilk kez çözüldüğünde (merchant
varsayılan dili) bir kez, sonra her değişimde çağrılır. Boş dil (`""` —
merchant-info henüz gelmedi) ASLA gönderilmez, aynı kod ardışık olarak iki
kez gönderilmez ve host inline fonksiyon verse (her render yeni referans)
bile ek çağrı doğmaz. Host bunu kendi i18n sağlayıcısına bağlayarak TUVAL
içeriğini de o dilde gösterir; editör kroması (TopBar/Inspector) Türkçe
sabittir. Tuvalin içindeki host bileşenleri aynı dili `useActiveLanguage()`
ile doğrudan okuyabilir (provider yoksa `null` döner).

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

### Repeat şablonu yayında boş görünüyor

1. `repeatSource` prop'unun gerçekten bir **dizi** taşıdığını kontrol et —
   yayında satır yoksa şablon bilinçli olarak hiç render edilmez.
2. Veri API'den geliyorsa bileşenin `puck.renderDropZone({ zone, repeatItems })`
   çağrısına satırları geçtiğini kontrol et.
3. Token yolunun satır nesnesindeki alan adıyla eşleştiğini kontrol et
   (`{{ item.name }}` ↔ `row.name`).

### iframe mesajları çalışmıyor

1. `hostOrigin` ile parent origin'inin birebir aynı olduğunu kontrol et.
2. Mesajı `iframe.contentWindow` hedefine gönder.
3. `event.origin` doğrulamasını ve `puck:` mesaj tipini kontrol et.

