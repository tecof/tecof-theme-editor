# Tecof Studio - Mimari ve Tasarım Belgesi (ARCHITECTURE.md)

Bu belge, `tecof-theme-editor` paketinde Puck editörünün yerine geçecek olan **Tecof Studio** (headless editör motoru + UI) için teknik mimari kararları, state yönetimini, entegrasyon noktalarını ve Puck'ın nasıl çıkartılacağını detaylandırmaktadır.

## 1. State Yönetimi ve Motor (EditorEngine)

Editör, tamamen headless (UI'dan bağımsız) ve test edilebilir bir mimariyle tasarlanacaktır. React UI sadece bu motorun yayınladığı veriyi tüketip olaylarını tetikleyecektir.

- **Kütüphane:** `zustand` + `immer` middleware.
  - *Neden?* `zustand` hafif, React dışında da erişilebilir ve re-render optimizasyonlarına açık bir yapı sunar. `immer` ile mutation gibi görünen kodlar yazılarak karmaşık ağaç güncellemeleri kolayca halledilir.
- **State Ağacı:**
  ```ts
  interface EditorState {
    document: TecofDocument;       // O anki aktif veri modeli
    history: {
      past: TecofDocument[];
      future: TecofDocument[];
    };
    selection: {
      selectedId: string | null;   // Seçili node
      hoveredId: string | null;    // Hover olan node
    };
    viewport: "desktop" | "tablet" | "mobile";
    // Metodlar (Immer aracılığıyla state güncelleyen)
    insertNode: (node: TecofNode, targetZone: string, index?: number) => void;
    removeNode: (id: string) => void;
    moveNode: (id: string, targetZone: string, index: number) => void;
    updateProps: (id: string, patch: any) => void;
    undo: () => void;
    redo: () => void;
    // ...
  }
  ```
- **Zone Modeli:** Puck ile tam uyumluluk için, `zones` nesnesi `[parentId]:[zoneName]` formatını koruyacaktır. Root içerikler ise doğrudan `content` dizisinde yaşayacaktır. Bir node silinirse, o node'a ait zone'lar ve altındaki tüm içerikler recursive olarak temizlenecektir (memory leak olmaması ve data integrity için).

## 2. Drag & Drop Stratejisi

> **Güncelleme (uygulanan):** Tasarım başlangıçta `@dnd-kit` öngörüyordu; ancak
> iframe sınırları arası sürüklemede en güvenilir ve bağımlılıksız çözüm olarak
> **native HTML5 Drag & Drop** (`dataTransfer`, `dragover`/`drop`) tercih edildi.
> Ortak sürükleme mantığı `studio/canvas/useDropTarget.ts` hook'unda toplanmıştır
> (NodeRenderer, DropZone, Canvas onu kullanır; LayersTree tree-row semantiği için
> kendi varyantını kullanır). Drop kuralları `engine/rules.ts` (`isValidDrop`) ile
> doğrulanır; geçersiz bırakmalar `dropEffect='none'` ile reddedilir.
>
> **Açık iş:** Native DnD dokunmatik cihazlarda çalışmaz → tablet/mobil editleme
> için pointer-event tabanlı bir DnD katmanı henüz eklenmedi (yol haritasında).

- **Uygulama (özet):**
  - Sol paneldeki bloklar ve canvas/layers node'ları `draggable` olarak işaretlenir;
    yük `dataTransfer`'a yazılır (`TECOF_BLOCK_TYPE` = yeni blok, `TECOF_NODE_ID` = taşınan node).
  - Drop hedefleri `useDropTarget` ile dragover pozisyonu (top/bottom), autoscroll
    ve kural kontrolünü tek noktadan yönetir.

## 3. Canvas (iframe) Stratejisi

Canvas, stillerin izolasyonu ve responsive viewport testlerinin (Desktop/Tablet/Mobile) doğru yapılabilmesi için bir iframe içerisinde render edilmelidir.

- **Kütüphane:** Custom iframe wrapper + `ReactDOM.createPortal`.
- **Uygulama:** 
  - Host'taki bir div'in içine `<iframe>` yerleştirilecek.
  - iframe'in `contentDocument.body`'sine bir `createPortal` ile render işlemi yapılacak.
  - Host css'leri (özellikle tailwind tarzı global sıfırlayıcılar veya fontlar) iframe'in head kısmına bir `<style>` tagı ile basılacaktır (veya host uygulamanın styles.css dosyası link edilecektir).
  - Web component (Shadow DOM) kullanmamamızın nedeni, third-party kütüphanelerin popover/portal yapıları ile uyumsuzluk yaşamamak. iframe bu konuda daha güvenilir bir "kum havuzu" (sandbox) sunar.

## 4. Field Bağlantıları (Host Entegrasyonu)

Puck'ın `FieldLabel` bileşenine bağımlı olan Custom Field'lar (LanguageField, EditorField vb.), Puck silindiğinde kırılacaktır.

- **Plan:** `src/studio/fields-host/` altında `FieldLabel` ve `FieldRenderer` yazılacak. 
- Puck arayüzü ile uyumlu prop tiplerini (örn: `{ field, name, id, value, onChange, readOnly }`) birebir karşılayacak. Bu sayede host tarafındaki `create*Field` fonksiyonları hiçbir değişiklik gerektirmeden çalışmaya devam edecek. (Geriye Dönük Uyumluluk)

## 5. Puck'ın Çıkarılma Planı (Fazlandırma)

Geçiş güvenli olmak zorundadır.

1. **Paralel Geliştirme (Faz 1-9):** Yeni editör (`TecofStudio`) Puck'ın yerine değil, yanına `src/index.ts`'te ikinci bir export olarak eklenecek. Arayüz ve parite testleri `playground` üzerinde `TecofStudio` kullanılarak yapılacak.
2. **PostMessage Uyumluluğu:** TecofStudio, tıpkı `TecofEditor` gibi iframe eventlerini dinleyecek ve host'a `puck:save` vb. eventleri ateşleyecek (ismini aynı tutacağız, böylece host değişmeyecek).
3. **Puck'ın Silinmesi (Faz 10):** TecofStudio eksiksiz çalıştığı onaylandığında:
   - `TecofEditor`'ün içi tamamen silinip `TecofStudio` referansına yönlendirilecek.
   - `@puckeditor/core` dependency'si package.json'dan kaldırılacak.
   - Tüm field'lar yeni in-house `FieldLabel` üzerinden render edilmeye ayarlanacak.

## 6. Riskler ve Açık Sorular

- **Risk: Dnd-kit Iframe Çapraz Sürükleme:** Sol panel (host DOM) üzerinden sürüklenen bir bloğun, iframe içerisindeki (child DOM) dropzone'a bırakılması teknik zorluklar yaratabilir.
  - *Çözüm:* İhtiyaç halinde sürükleme başladığında iframe'in üzerine transparent bir overlay koyup koordinatları host üzerinden hesaplayıp state güncelleyebiliriz (Puck'ın yaptığı overlay taktiği).
- **Risk: Inline Editing (TipTap):** TipTap, focus ve blur işlemlerini iframe içinde ve dışında ayrı context'lerde yürütür. 
- **Açık Soru:** PostMessage protokolünde "Puck" prefix'ini ilelebet korumalı mıyız? (Evet, host değişmemesi için şimdilik tutulacak, içerde `Bridge` modülünde soyutlanmıştır → `studio/bridge.ts`.)

---

## 7. Uygulanan Modüller (Güncel Durum)

| Alan | Modül | Not |
|---|---|---|
| Engine / state | `engine/store.ts` | zustand+immer; **patch-bazlı history** (50 adım, 500ms coalesce), çoklu seçim, clipboard |
| Ağaç işlemleri | `engine/operations.ts`, `engine/zones.ts` | `findNodeById` **O(1) WeakMap cache**; bulk remove/duplicate |
| Drop kuralları | `engine/rules.ts` | `isValidDrop` / `canDropInto` / `canAcceptMoreItems` (opt-in: `acceptsChildren`, `maxItems`, `allowedParents`) |
| İzinler / feature toggle | `engine/permissions.ts`, `store.permissionResolver` | `getNodePermissions` (global < component < `resolvePermissions`); **motor seviyesinde** delete/duplicate/drag gating (her call-site otomatik), `edit` → Inspector readOnly; UI için `usePermissions` |
| Canvas | `studio/canvas/*` | iframe `Frame` (artımlı stil sync), `NodeRenderer`, `useDropTarget` (**eksen-duyarlı drop**: dikey/yatay), `useInlineEdit`, `NodeErrorBoundary` |
| Slot düzeni | `studio/canvas/DropZone.tsx` | `orientation: 'vertical' \| 'horizontal'` — yatay slot + otomatik drop ekseni; `data-tecof-orientation` |
| Stil editörü | `studio/style/*` | Tailwind token modeli + arbitrary değerler + **breakpoint-bazlı state** (`md:hover`) + **canlı tema renkleri** (`--theme-color-*`) + miras placeholder; safelist (`getSafelist`, `collectDocumentClasses`) — bkz. `docs/TAILWIND.md` |
| Tema editörü | `studio/theme/*` | `ThemeEditor` (Inspector "Tema" sekmesi) + `ThemeVars` (canlı CSS değişkeni enjeksiyonu); tema `root.props._tecofTheme`'de |
| Komut paleti | `studio/command/CommandPalette.tsx` | ⌘K; eylemler + bileşen ekleme, fuzzy arama, klavye gezinme |
| Overlay | `studio/overlay/SelectionOverlay.tsx` | Seçim/hover outline + toolbar + breadcrumb + **boşluk (padding/margin) overlay'i** (hover) |
| Köprü | `studio/bridge.ts` | `postToHost` / `isEmbedded` / origin doğrulama (`hostOrigin`) |
| Field host | `studio/fields-host/FieldRenderer.tsx` | Puck-uyumlu: text/textarea (**CMS veri bağlama** `bindable`), select, number, radio, array, object, slot, custom(`render`); `readOnly` (statik + nested) |
| Dinamik alanlar | `studio/fields-host/useResolvedFields.ts`, `resolve.ts` | `resolveFields` (koşullu alan) + `resolveData` (türetilmiş prop + `readOnly`); async + stale-drop; **diff-guard'lı** geri yazma (`diffProps`, idempotent → tek yazımda durur) |
| External data field | `components/fields/ExternalField.tsx` | Jenerik host `fetchList` (Tecof CMS'ten bağımsız) → aranabilir modal seçici; `mapProp`/`mapRow`/`getItemSummary`; `type: 'external'` (FieldRenderer) |
| Veri migrasyonu | `engine/migrate.ts` | `migrateDocument`: `renameComponents` → `transformProps` (rename sonrası tipe göre, id korunur) → custom `migrate`; `version` damgası (`root.props._schemaVersion`) ile idempotent; TecofStudio (yükleme) + TecofRender (yayın) yolunda |
| Şablonlar | `studio/panels/AddSectionModal.tsx` | `config.templates` (`SectionTemplate`) → tek tıkla alt ağaç ekleme (`store.insertPayload`, taze id) |
| Build | `tsup.config.ts` | `splitting: true` → ağır field'lar (Monaco/TipTap/FilePond) ayrı chunk |

### Bilinen Boşluklar / Yol Haritası

- Dokunmatik (pointer-event) DnD — mobil/tablet editleme.
- **Overlay Portals** (`registerOverlayPortal` muadili) — editör içinde belirli
  elemanları etkileşimli bırakma + edit-mode'da link/buton tıklamasını engelleme.
- Editör arayüzü i18n (şu an sabit Türkçe).
- Autosave + `beforeunload` koruması.

---
*Hazırlayan: Tecof Core Team (AI Architect)*
