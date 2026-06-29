# Tecof Studio — Özel Görsel Editör İnşası (Claude Code Görev Promtu)

> Bu dosyayı olduğu gibi Claude Code'a yapıştır. `tecof-theme-editor` reposunun kökünden çalıştır.

---

## 0. Rol & Bağlam

Sen, görsel sayfa editörleri (page builder) konusunda uzman bir **senior frontend mimarısın**. Webflow ve Squarespace seviyesinde editör UX'i ile, sağlam ve test edilebilir bir **headless editör motoru** tasarlama tecrüben var. Production kalitesinde, küçük ve gözden geçirilebilir adımlarla iş çıkarırsın; önce keşfeder ve plan yaparsın, sonra kod yazarsın.

Çalıştığın repo: `@tecof/theme-editor` — Tecof platformu için bir React kütüphanesi (NPM paketi olarak host uygulamaya export ediliyor).

**Mevcut durum:** `TecofEditor` bileşeni içeride `@puckeditor/core`'un `<Puck>` editörünü sarıyor. Yani editör UI'ı tamamen Puck. Asıl değerli kısım ise **bizim yazdığımız parçalar:** custom field'lar, API client, iframe postMessage köprüsü ve `PuckPageData` veri modeli.

**Hedef:** Puck'ın **editör arayüzünü** tamamen kaldırıp yerine Squarespace/Webflow tarzı **kendi editörümüzü** yazmak. Ama Puck'ın **veri yapısını ve mantığını korumak** — `@puckeditor/core` runtime'ına sıfır bağımlılık, ve veritabanındaki **eski sayfaların migration olmadan açılması.**

---

## 1. Misyon (tek cümle)

> `@puckeditor/core` ile yapı/veri olarak %100 uyumlu, ama ona runtime'da hiç bağımlı olmayan, Squarespace/Webflow tarzı (canvas üstünde sürükle-bırak, inline düzenleme, hover toolbar'ları, layers paneli) **kendi görsel editörümüzü** sıfırdan inşa et; mevcut custom field'ları, API client'ı ve postMessage protokolünü koruyarak.

---

## 2. Değişmez Kurallar (Non-Negotiables)

Bunlar müzakereye kapalı. İhlal eden kod reddedilir.

1. **Veri sözleşmesi korunur.** Yeni editör, `src/types/index.ts` içindeki `PuckPageData` şeklini birebir okur/yazar. Yapı: `{ content, root, zones }`, her item `{ type, props }`, her prop'ta `id`. Bkz. §3.
2. **Geriye dönük uyumluluk (lossless round-trip).** Var olan herhangi bir kayıtlı sayfa verisini yükle → editörde aç → tekrar serialize et işlemi **bilgi kaybı olmadan** çalışmalı. Tanımadığın prop/zone/alanı asla düşürme; aynen koru. Hiçbir migration script'i gerekmemeli.
3. **Puck runtime bağımlılığı = SIFIR.** İş bittiğinde `@puckeditor/core` ne çalışma anında import edilmeli ne de `dependencies`/`peerDependencies`'te kalmalı. (Geçiş süresince paralel kalabilir — bkz. §8.) Şu an field'ların import ettiği `FieldLabel` ve Puck field prop tipleri için **kendi muadilini** yaz.
4. **CSS konvansiyonu.** Tüm yeni stiller `src/styles.css` içinde, `.tecof-[component]-[element]` ön ekiyle (örn. `.tecof-canvas-overlay`). Inline style YASAK — istisna: gerçekten dinamik değerler (`style={{ background: userColor }}`). CSS module / CSS-in-JS yok. Mevcut `.agents/workflows/theme-editor-development.md` kurallarına uy.
5. **Build-first.** Bu bir NPM paketi. `.tsx`/`.css` değişiklikleri `npm run build` ile derlenmeden aktif olmaz. Her faz sonunda `npm run lint` ve `npm run build` temiz geçmeli.
6. **Mevcut public export'ları bozma.** `src/index.ts`'teki `TecofProvider`, `TecofRender`, `TecofPicture`, tüm `create*Field`, `TecofApiClient` ve util'ler imza koruyarak çalışmaya devam etmeli. Yeni editör ek bir export olarak gelir (bkz. §7), eskisini bir anda silmez.
7. **Host entegrasyonu kırılmaz.** iframe postMessage protokolü (`puck:save`, `puck:undo`, `puck:redo`, `puck:viewport`, `puck:saved`, `puck:changed`, `puck:itemSelected`, `puck:itemDeselected`) aynen desteklenmeli ki host uygulama değişmeden çalışsın. (İçeride event isimlerini soyutla ama dışarıya aynı mesajları gönder.)

---

## 3. Korunacak Veri Modeli (Data Contract)

Bizim sahip olduğumuz, Puck ile **yapısal olarak özdeş (superset)** bir tip tanımla — adı `TecofDocument`. Amaç: Puck'tan kopmak ama eski veriyi kayıpsız okumak.

```ts
// Root-seviye ve zone içi her bileşen
interface TecofNode {
  type: string; // config'teki bileşen anahtarı
  props: { id: string } & Record<string, any>; // id ZORUNLU ve unique
}

// Tüm sayfa — PuckPageData ile aynı şekil
interface TecofDocument {
  root: { props: Record<string, any> }; // sayfa-seviye props (title vb.)
  content: TecofNode[]; // kök seviye node'lar (sıralı)
  zones: Record<string, TecofNode[]>; // iç içe içerik; key = `${parentId}:${slotName}`
}
```

**Kurallar:**

- `zones` anahtarlaması `${parentNodeId}:${zoneName}` formatındadır. Bir node silinirse ona ait tüm zone'lar (ve onların alt zone'ları) recursive temizlenir.
- `props.id` her node için global unique olmalı; insert/duplicate'te yeni id üret (kısa, çakışmaz — örn. nanoid). Duplicate'te alt zone'lardaki tüm id'ler de yeniden eşlenmeli (eski→yeni map ile zone anahtarları da güncellenmeli).
- `TecofDocument` ↔ `PuckPageData` dönüşümü **kimlik fonksiyonu** olmalı (aynı obje şekli). Ayrı bir tip tutmanın sebebi sadece sahipliği bizde toplamak; runtime'da fark yok.
- Serialize/parse için bir util yaz ve **property-based / round-trip testi** ile garanti altına al: `parse(serialize(doc))` derin-eşit olmalı; bilinmeyen alanlar korunmalı.

---

## 4. Mevcut Kod Tabanı — Ne Var, Ne Yeniden Kullanılacak

İşe başlamadan önce şu dosyaları oku ve haritasını çıkar:

| Dosya                                           | Ne işe yarıyor                                                                                                                                   | Yeni editörde rolü                                                                                                                                                                                                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/TecofEditor.tsx`                | Puck wrapper, fetch/save, postMessage köprüsü, hover-preview drawer item                                                                         | **Referans.** Save/load akışı ve postMessage protokolü buradan birebir taşınacak. Editör UI'ı atılacak.                                                                                                                                                                   |
| `src/components/TecofRender.tsx`                | Public render (`<Render>` wrapper)                                                                                                               | Render mantığı yeni canvas renderer'a örnek; runtime'dan Puck çıkarılacak.                                                                                                                                                                                                |
| `src/components/TecofProvider.tsx`              | Context: API client + secretKey                                                                                                                  | **Aynen kullan**, gerekirse editör state'i için genişlet.                                                                                                                                                                                                                 |
| `src/api.ts` (`TecofApiClient`)                 | getPage/savePage/getMerchantInfo/uploads/translate                                                                                               | **Aynen kullan.** Editör sadece bu client üzerinden veri alır/yazar.                                                                                                                                                                                                      |
| `src/components/fields/*`                       | LanguageField, EditorField, UploadField, LinkField, ColorField, CodeEditorField, RepeaterField, CmsCollectionField + `create*Field` factory'leri | **Korunacak en kritik varlık.** Yeni inspector bunları render etmeli. Bunlar Puck'ın field prop sözleşmesini (`{ field, name, id, value, onChange, readOnly }`) ve `FieldLabel`'ı kullanıyor → bu sözleşmeyi sağlayan kendi field-host'unu ve `FieldLabel` muadilini yaz. |
| `src/types/index.ts`                            | `PuckPageData`, field value tipleri, props tipleri                                                                                               | `TecofDocument`'ı buraya ekle; mevcut tipleri koru.                                                                                                                                                                                                                       |
| `src/styles.css`                                | Tüm UI stilleri (2300+ satır)                                                                                                                    | Yeni editör stilleri buraya `.tecof-*` ile eklenir.                                                                                                                                                                                                                       |
| `src/index.ts`                                  | Public API yüzeyi                                                                                                                                | Yeni editör export'u buraya eklenir; eskiler korunur.                                                                                                                                                                                                                     |
| `.agents/workflows/theme-editor-development.md` | Katkı kuralları                                                                                                                                  | **Uy.**                                                                                                                                                                                                                                                                   |
| `playground/App.tsx`                            | Mock API ile lokal demo                                                                                                                          | Yeni editörü test etmek için buraya bir demo sayfası ekle.                                                                                                                                                                                                                |

**Önemli tespit:** Field bileşenleri `@puckeditor/core`'dan `FieldLabel` ve tip importları yapıyor. Puck'ı tamamen çıkarmak için bunların hepsinin in-house bir `FieldLabel` + field tipine taşınması gerekiyor. Bunu Faz 4'te planla.

---

## 5. Hedef Mimari

Editörü iki katmana ayır: **(A) headless EditorEngine** (UI'sız, saf state + operasyonlar, test edilebilir) ve **(B) React UI shell** (canvas, paneller, overlay'ler). Bu ayrım pazarlık konusu değil — UI'sız core, davranışı tek başına test edilebilir kılar.

### 5.1 EditorEngine (headless çekirdek)

Tek doğruluk kaynağı (single source of truth). Sorumlulukları:

- `TecofDocument` state'ini tutar.
- **İmmutable operasyonlar:** `insertNode`, `removeNode`, `moveNode` (zone içi ve zone'lar arası), `duplicateNode`, `updateProps(id, patch)`, `setRootProps`, `reorder`. Hepsi yeni doc döndürür (Immer kullan).
- **Undo/redo history:** geçmiş yığını, debounce'lı snapshot (her tuş vuruşunda değil; prop değişikliklerini grupla).
- **Selection state:** seçili node id, hover node id, breadcrumb (ata zinciri).
- **Zone yardımcıları:** bir node'un altındaki zone'ları, parent'ını, ata zincirini, "şu zone'a şu type düşebilir mi" kontrolünü çözer.
- **Olay yayını (emit):** `change`, `select`, vb. — UI ve postMessage köprüsü buna abone olur.

Implementasyon: `zustand` store + `immer` middleware (veya `useReducer + immer`). History için store içinde past/future array'leri. **Bu katman React'ten bağımsız test edilebilir olmalı** ve operasyonların her biri için unit testi olmalı.

### 5.2 Config Registry / Adapter

Editör neyin sürüklenebilir, nasıl render edileceği ve hangi field'ları olduğunu config'ten okur. **Puck `Config` şekliyle uyumlu bir adapter yaz** ki host uygulamanın mevcut `puckConfig`'i değişmeden çalışsın:

```ts
interface TecofComponentConfig {
  label?: string;
  category?: string;
  fields: Record<string, FieldDefinition>; // create*Field çıktıları
  defaultProps?: Record<string, any>;
  render: (props: any) => React.ReactNode; // canvas + public render ortak
  // slot/zone tanımı: bir bileşen çocuk alabiliyorsa hangi zone'lara sahip
}

interface TecofConfig {
  components: Record<string, TecofComponentConfig>;
  root?: { fields?: Record<string, FieldDefinition>; render?: (p: any) => React.ReactNode };
  categories?: Record<string, { title: string; components: string[] }>;
}
```

Engine bu config'i okur: `fields` → inspector'ı kurar, `render` → canvas'a çizer, `defaultProps` → insert'te kullanılır, `categories` → sol paneldeki blok gruplarını kurar.

### 5.3 Canvas Renderer (iframe içinde)

Webflow gibi, canvas **bir iframe içinde** render edilmeli — stil izolasyonu ve doğru responsive ölçüm için şart. `TecofDocument` ağacını, config'teki `render` fonksiyonlarıyla gerçek React bileşenlerine çevir.

- iframe içine React ağacını `createPortal` ile mount et (öneri: `react-frame-component` veya hafif bir custom iframe + portal çözümü).
- Her render edilen node, düzenleme aksesuarları ile sarılır: seçilebilir, hover'da outline, drag handle, drop zone placeholder'ları.
- Public `TecofRender` ile **aynı `render` fonksiyonlarını** kullan ki "editörde gördüğün = yayında çıkan" garantisi olsun (WYSIWYG).

### 5.4 Drag & Drop Katmanı

İki akış var:

1. **Kütüphaneden canvas'a:** sol panelden bir blok sürükleyip canvas'ta bir konuma/zone'a bırakma → `insertNode`.
2. **Mevcut node'u taşıma/sıralama:** canvas içinde ve zone'lar arası taşıma → `moveNode`/`reorder`, iç içe (nested) destekli.

Kullan: `@dnd-kit/core` + `@dnd-kit/sortable` (modern, erişilebilir, iframe ile çalışır; Puck'ın da geçtiği yol). Gereksinimler: drop indicator çizgisi, auto-scroll, nested zone hedefleme, geçersiz hedefte engelleme (örn. bir bileşeni kendi çocuğuna bırakma). iframe sınırını aşan DnD için pointer koordinat dönüşümünü doğru kur.

### 5.5 Selection & Overlay Katmanı

Canvas'ın üstünde (iframe dışındaki bir overlay layer'da) çizilen kontroller:

- **Hover outline** + bileşen adı etiketi.
- **Selected outline** + floating toolbar: yukarı/aşağı taşı, duplicate, sil, drag handle, "parent'ı seç".
- **Breadcrumb** (ata zinciri) — üst barda veya seçim toolbar'ında.
- Boş alana tıklayınca deselect.
- Overlay, iframe içindeki node'ların `getBoundingClientRect`'ine göre konumlanır; scroll/resize'da yeniden hesaplanır (ResizeObserver + scroll listener).

### 5.6 Field Inspector (sağ panel)

Seçili node'un `props`'una bağlı, config'teki `fields`'i render eden panel:

- Her field için `create*Field` çıktısını, beklediği sözleşmeyle besle: `{ field, name, id, value: props[name], onChange: (v) => engine.updateProps(id, { [name]: v }), readOnly }`.
- `FieldLabel` muadili in-house bileşen yaz (label + ikon + visible kontrolü).
- Root seçiliyken `root.fields`'i göster (sayfa ayarları).
- `RepeaterField` ve `CmsCollectionField` gibi iç içe field'ların düzgün çalıştığını doğrula.

### 5.7 Sol Panel (Blok Kütüphanesi + Layers)

İki sekme:

- **Bloklar:** `categories`'e göre gruplanmış, sürüklenebilir bileşen kartları. (Mevcut hover-preview screenshot davranışını `TecofEditor.tsx`'ten taşıyabilirsin — `apiClient.getComponentPreview`.)
- **Katmanlar (Outline/Layers):** belge ağacının iç içe listesi; tıkla→seç, sürükle→yeniden sırala/yuvala, görünürlük/kilit (opsiyonel), node adını göster.

### 5.8 Top Bar

- Viewport switcher: desktop / tablet / mobile (canvas genişliğini değiştirir — postMessage'daki `puck:viewport` ile uyumlu).
- Undo / redo butonları (engine.history'ye bağlı).
- Kaydet (taslak) / Yayınla — `TecofApiClient.savePage` üzerinden, mevcut save akışıyla aynı.
- Preview toggle (düzenleme aksesuarlarını gizleyip saf render göster).

### 5.9 Inline Editing (Squarespace hissi)

Editörü Puck'tan ayıran kilit özellik: metni **doğrudan canvas üzerinde** düzenleme. Metin tabanlı prop'lar için `contentEditable` ya da mevcut `EditorField`'in (TipTap) inline modu ile, yazılan değeri ilgili `prop`'a yaz. Hangi prop'ların inline düzenlenebilir olduğunu config'te işaretlenebilir kıl (örn. field meta'sı). Bu, "sidebar'a gitmeden tıkla-yaz" deneyimi verir.

### 5.10 postMessage Köprüsü

Engine event'lerini host'a aynı protokolle yansıt:

- Parent→Editor: `puck:save` → save; `puck:undo`/`puck:redo` → history; `puck:viewport` → canvas genişliği.
- Editor→Parent: `puck:saved`, `puck:saveError`, `puck:changed`, `puck:itemSelected {type,id}`, `puck:itemDeselected`.
- İçeride bu isimleri tek bir `bridge` modülünde soyutla (ileride yeniden adlandırmak kolay olsun), ama dışarı yayılan mesajlar şu an aynı kalsın.

---

## 6. Teknoloji Seçimleri

- **DnD:** `@dnd-kit/core`, `@dnd-kit/sortable`.
- **State + history:** `zustand` + `immer` (veya gerekçelendirirsen `useReducer + immer`).
- **iframe render:** `react-frame-component` veya hafif custom iframe + `createPortal`.
- **ID üretimi:** `nanoid`.
- **Mevcut bağımlılıklar korunur:** TipTap (EditorField), FilePond/Doka (UploadField), Monaco (CodeEditorField), lucide-react, vaul.
- Yeni runtime bağımlılıklarını `package.json`'a doğru bölüme ekle; **bundle boyutuna dikkat** (tsup ile tree-shake edilebilir kalsın, `sideEffects` ayarını koru).
- Yeni bağımlılık eklemeden önce hafif alternatifi değerlendir ve ARCHITECTURE.md'de gerekçelendir.

---

## 7. Önerilen Klasör Yapısı

```
src/
  engine/                    # headless core (React'siz, test edilebilir)
    document.ts              # TecofDocument tipleri + serialize/parse + round-trip util
    store.ts                 # zustand store: state + ops + history + selection
    operations.ts            # insert/remove/move/duplicate/updateProps... (saf fonksiyonlar)
    zones.ts                 # zone anahtarlama, ata/parent/child çözümleme
    ids.ts                   # id üretimi + duplicate remap
    bridge.ts                # postMessage protokolü (soyutlanmış)
    __tests__/               # vitest: ops + round-trip + zone testleri
  studio/                    # React UI shell
    TecofStudio.tsx          # ana editör bileşeni (eski TecofEditor'ün muadili)
    canvas/
      Canvas.tsx             # iframe + portal render
      NodeRenderer.tsx       # config.render + edit aksesuarları
      DropZone.tsx           # zone placeholder + dnd hedefi
    overlay/
      SelectionOverlay.tsx   # hover/selected outline + toolbar + breadcrumb
    panels/
      LeftPanel.tsx          # Bloklar + Layers sekmeleri
      BlockLibrary.tsx
      LayersTree.tsx
      Inspector.tsx          # sağ panel, field render
    topbar/
      TopBar.tsx             # viewport / undo-redo / save
    fields-host/
      FieldLabel.tsx         # Puck FieldLabel muadili (in-house)
      FieldRenderer.tsx      # create*Field çıktısını sözleşmeyle besler
  components/                # MEVCUT — dokunma (gerekirse fields'ı buradan host'a bağla)
  api.ts                     # MEVCUT — aynen
  types/index.ts             # MEVCUT + TecofDocument eklenir
  styles.css                 # MEVCUT + .tecof-canvas-*, .tecof-inspector-* vb. eklenir
  index.ts                   # MEVCUT export'lar + TecofStudio export'u
```

Export adı: `TecofStudio` (yeni editör). `TecofEditor`'ı parite sağlanana kadar koru; parite + onaydan sonra deprecate/sil.

---

## 8. Çalışma Şekli (Process)

1. **Önce keşif, sonra kod.** İlk olarak repoyu gez, §4 haritasını doğrula, `npm install` + `npm run build` + `npm run dev:preview`'in çalıştığını gör.
2. **ARCHITECTURE.md yaz** (kod yazmadan önce): seçtiğin state modeli, DnD yaklaşımı, iframe stratejisi, zone modeli, fields'ı host'a bağlama planı, Puck'ı çıkarma planı, riskler. Onay için bana sun.
3. **Faz faz ilerle** (§9). Her faz tek ve odaklı; sonunda `lint` + `build` temiz, ilgili testler yeşil, `playground`'da gözle doğrulanabilir.
4. **Puck'ı bir anda atma.** Geçiş süresince `@puckeditor/core` paralel kalsın; `TecofStudio` parite seviyesine gelince Faz 10'da runtime'dan ve `package.json`'dan tamamen çıkar.
5. **Her fazda** kısa bir özet ver: ne değişti, nasıl test edilir, hangi kabul kriteri karşılandı.
6. Belirsizlik varsa varsayımını yaz ve devam et; beni bloklamadan ilerle ama riskli kararları ARCHITECTURE.md'de işaretle.

---

## 9. Fazlar & Milestone'lar (kabul kriterleriyle)

**Faz 0 — Keşif & Mimari**
Çıktı: repo haritası + `ARCHITECTURE.md` + çalışan dev ortamı.
Kabul: `npm run build` ve `npm run dev:preview` çalışıyor; mimari doküman onaya hazır.

**Faz 1 — Engine Core (headless)**
Çıktı: `engine/` — `TecofDocument`, store, tüm operasyonlar, history, zone util'leri + serialize/parse.
Kabul: UI olmadan, operasyonların her biri için vitest yeşil; `parse(serialize(realPuckData))` derin-eşit ve bilinmeyen alanları koruyor; undo/redo doğru çalışıyor.

**Faz 2 — Canvas Renderer (read-only)**
Çıktı: iframe içinde, config.render ile `TecofDocument`'ı çizen `Canvas` + `NodeRenderer`.
Kabul: Gerçek bir kayıtlı sayfa verisi, public `TecofRender` ile piksel olarak aynı görünüyor; iframe stil izolasyonu çalışıyor.

**Faz 3 — Selection & Overlay**
Çıktı: hover/selected outline, floating toolbar (taşı/duplicate/sil), breadcrumb, deselect.
Kabul: Tıkla→seç, hover→highlight, boş alan→deselect; toolbar aksiyonları engine ops'u tetikliyor; scroll/resize'da overlay doğru konumlanıyor.

**Faz 4 — Field Inspector + Fields'ı Bağlama**
Çıktı: in-house `FieldLabel`, `FieldRenderer`, sağ panel; tüm `create*Field` field'ları çalışıyor; field'lar Puck importundan arındırıldı.
Kabul: Her field tipi (Language, Editor, Upload, Link, Color, Code, Repeater, CmsCollection) seçili node'un prop'unu okuyup yazıyor; `@puckeditor/core` artık `fields/*` içinde import edilmiyor.

**Faz 5 — Kütüphaneden Canvas'a Drag (Insert)**
Çıktı: sol panel blok kütüphanesi + dnd-kit ile drop → `insertNode` (defaultProps ile, yeni id).
Kabul: Bir blok sürüklenip kök seviyeye ve bir zone'a bırakılabiliyor; drop indicator görünüyor; geçersiz hedef engelleniyor.

**Faz 6 — Reorder & Move (nested)**
Çıktı: mevcut node'ları canvas içinde ve zone'lar arası taşıma/sıralama.
Kabul: Node yukarı/aşağı sıralanıyor, başka zone'a taşınıyor; kendi çocuğuna bırakma engelleniyor; id'ler ve zone anahtarları tutarlı kalıyor.

**Faz 7 — Layers / Outline Paneli**
Çıktı: iç içe ağaç; tıkla→seç, sürükle→yeniden sırala/yuvala.
Kabul: Ağaç belgeyle senkron; ağaçtan yapılan değişiklik canvas'a, canvas'tan yapılan ağaca yansıyor.

**Faz 8 — Top Bar + Klavye Kısayolları + Save**
Çıktı: viewport switcher, undo/redo, taslak kaydet/yayınla; kısayollar (Del, Cmd/Ctrl+Z, Shift+Z, Cmd+C/V, oklar).
Kabul: Save, `TecofApiClient.savePage` ile mevcut akışta çalışıyor; viewport canvas'ı yeniden boyutluyor; kısayollar beklendiği gibi.

**Faz 9 — Inline Editing**
Çıktı: metin prop'larını canvas üstünde düzenleme (contentEditable / TipTap inline).
Kabul: Bir metin bloğuna tıklayıp yazınca ilgili prop güncelleniyor; undo/redo ile uyumlu; sidebar'a gitmeye gerek yok.

**Faz 10 — postMessage Paritesi + Puck'ı Söküp Atma**
Çıktı: tüm postMessage mesajları host ile uyumlu; `@puckeditor/core` runtime'dan ve `package.json`'dan kaldırıldı; `TecofStudio` resmî editör.
Kabul: Host uygulama değişmeden çalışıyor (eski `TecofEditor` ile aynı mesajlar); `@puckeditor/core` hiçbir yerde import edilmiyor; build temiz.

**Faz 11 — Polish / Erişilebilirlik / Performans / Doküman**
Çıktı: a11y (klavye, ARIA, odak yönetimi), büyük sayfalarda performans (gereksiz re-render önleme, memoization), README güncellemesi, `playground`'da tam demo.
Kabul: Lighthouse/eksenel kontroller makul; 100+ node'lu sayfada akıcı; README yeni editörü anlatıyor.

---

## 10. Definition of Done (Bitti Sayılma Kriteri)

- [ ] Var olan herhangi bir kayıtlı sayfa, yeni editörde migration'sız açılıyor ve kayıpsız geri yazılıyor.
- [ ] `@puckeditor/core` ne import ediliyor ne de `package.json`'da.
- [ ] Tüm mevcut `create*Field` field'ları yeni editörde çalışıyor.
- [ ] iframe postMessage protokolü host ile birebir uyumlu; host kodu değişmedi.
- [ ] Canvas WYSIWYG: editör görünümü = `TecofRender` çıktısı.
- [ ] Squarespace/Webflow özellikleri var: canvas DnD, nested zone'lar, inline editing, hover/selection toolbar'ları, layers paneli, viewport switcher, undo/redo.
- [ ] `npm run lint`, `npm run build`, `npm run test` temiz; engine ops'u için anlamlı test coverage.
- [ ] Tüm yeni CSS `.tecof-*` konvansiyonunda, inline style yok.
- [ ] `playground` üzerinde tüm akışlar elle doğrulanabilir; README güncel.

---

## 11. Yap / Yapma

**Yap:**

- Önce headless engine'i yaz ve test et; UI'ı onun üstüne kur.
- Public `render` fonksiyonlarını editör ve yayın için ortak kullan.
- Bilinmeyen prop/zone/field'ı koru (forward-compatible ol).
- Küçük, gözden geçirilebilir adımlarla ilerle; her fazda lint+build çalıştır.
- Kararları ARCHITECTURE.md'de gerekçelendir.

**Yapma:**

- Veri şeklini değiştirme / migration gerektiren bir yapı kurma.
- `@puckeditor/core`'a kalıcı runtime bağımlılığı bırakma.
- Inline style, CSS module veya CSS-in-JS kullanma.
- Mevcut public export'ları veya postMessage protokolünü kırma.
- Her şeyi tek seferde yapmaya çalışma; fazları atlama.
- Erişilebilirliği ve performansı sona bırakıp tamamen unutma.

---

## 12. İlk Adım (şimdi yap)

1. Repoyu gez, §4 dosya haritasını doğrula, dev ortamını ayağa kaldır.
2. **Henüz üretim kodu yazma.** Önce `ARCHITECTURE.md` üret: seçtiğin state/DnD/iframe/zone stratejileri, fields'ı host'a bağlama ve Puck'ı çıkarma planı, riskler ve açık sorular.
3. Faz planını (§9) küçük PR/commit'lere böl ve bana sun.
4. Onay sonrası Faz 1'den başla.

> Hatırlatma: Bu bir kütüphane. Her değişiklik `npm run build` ile derlenmeli; `.agents/workflows/theme-editor-development.md` kurallarına ve `.tecof-*` CSS konvansiyonuna uy.
