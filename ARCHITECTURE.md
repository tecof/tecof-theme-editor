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
> **Dokunmatik (uygulandı):** Native DnD dokunmatik cihazlarda çalışmadığı için
> pointer-event tabanlı bir ikinci katman eklendi: `studio/canvas/TouchDragLayer.tsx`
> (long-press ile başlar, aynı `data-tecof-*` DOM sözleşmesini hit-test eder,
> aynı `engine/rules.ts` doğrulamasını ve `uiStore.dropHover` kılavuzlarını
> kullanır). Fare sürüklemeleri native HTML5 yolunda kalır.

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
| Engine / state | `engine/store.ts` | zustand+immer; **patch-bazlı history** (50 adım, 500ms coalesce), çoklu seçim, clipboard (**sayfalar/sekmeler arası** — localStorage mirror `tecof:clipboard:v1`; context menu de aynı clipboard'ı kullanır, `hasClipboardContent()`). Stil panosu da mirror'lı: `tecof:style-clipboard:v1` (uiStore) |
| Ağaç işlemleri | `engine/operations.ts`, `engine/zones.ts` | `findNodeById` **O(1) WeakMap cache**; bulk remove/duplicate |
| Drop kuralları | `engine/rules.ts` | `isValidDrop` / `canDropInto` / `canAcceptMoreItems` (opt-in: `acceptsChildren`, `maxItems`, `allowedParents`) |
| İzinler / feature toggle | `engine/permissions.ts`, `store.permissionResolver` | `getNodePermissions` (global < component < `resolvePermissions` < **instance `_locked`**); **motor seviyesinde** delete/duplicate/drag gating (her call-site otomatik), `edit` → Inspector readOnly; UI için `usePermissions`. Kilitli node seçilebilir kalır (kilit açmak için); `updateProps` edit-gated değil |
| Katman kilit & gizle | `studio/panels/LayersTree.tsx` | Her satırda daima-görünür kilit/gizle toggle'ı → `_locked`/`_hidden` (updateProps). Kilit izin sistemini yeniden kullanır; gizli node edit'te soluk (`NodeRenderer` `is-hidden`), preview'da ve yayında (`TecofRender`) atlanır |
| Canvas | `studio/canvas/*` | iframe `Frame` (artımlı stil sync), `NodeRenderer`, `useDropTarget` (**eksen-duyarlı drop**: dikey/yatay), `useInlineEdit`, `NodeErrorBoundary` |
| Slot düzeni | `studio/canvas/DropZone.tsx` | `orientation: 'vertical' \| 'horizontal'` — yatay slot + otomatik drop ekseni; `data-tecof-orientation`. Dolu slotta item araları/başı/sonu **hover-reveal "+" ekleme** (`AddSectionButton` `slot`+orientation; layout-nötr; `openAddSection({ zoneKey, index })` → zone-filtreli modal) — artık root dışında da her pozisyona tıkla-ekle |
| Stil editörü | `studio/style/*` | Tailwind token modeli + arbitrary değerler + **breakpoint-bazlı state** (`md:hover`) + **canlı tema renkleri** (`--theme-color-*`) + **per-node font** (`font-[var(--font-*)]`) + miras placeholder; safelist (`getSafelist`, `collectDocumentClasses`) — bkz. `docs/TAILWIND.md` |
| Scroll etkileşimleri | `studio/style/scrollEffects.ts` | `reveal` (görününce) + `parallax` kontrolleri → custom `tecof-reveal`/`tecof-parallax` class'ları; runtime IntersectionObserver + rAF parallax (iframe-güvenli, reduced-motion güvenli, `html.tecof-has-js` progressive-enhancement kapısı). CSS `animationCss.ts` + `styles.css`. Yayın `TecofRender`, editör `Canvas` (yalnız preview) |
| Tema editörü | `studio/theme/*` | `ThemeEditor` (Inspector "Tema" sekmesi) + `ThemeVars` (canlı CSS değişkeni enjeksiyonu); tema `root.props._tecofTheme`'de |
| Font sistemi | `studio/theme/fonts.ts`, `FontSelect.tsx` | Küratörlü Google/sistem registry + `FontSelect` (önizlemeli seçici) + özel `@font-face` upload; canlı yükleme `ThemeVars` (`<link>`+`@font-face`), yayın `TecofRender`. Per-node: `tokens.ts` `fontFamily` kontrolü (`[var(--font-<id>)]`) → `cssGenerator` `font-family: var(--font-<id>)`; `StyleEditor` seçince fontu `theme.fonts`'a ekler. `--font-<id>` değişkenleri `generateCSSVariables`'da |
| Komut paleti | `studio/command/CommandPalette.tsx` | ⌘K; eylemler + bileşen ekleme, fuzzy arama, klavye gezinme |
| Sütun grid kılavuzu | `studio/canvas/GridOverlay.tsx`, `studio/topbar/GridControl.tsx` | Webflow tarzı açılır-kapanır hizalama grid'i; `uiStore` (`gridVisible/gridColumns/gridGap`), iframe içinde `position:fixed` overlay (tema container'ına hizalı), TopBar toggle+ayar popover'ı, `G` kısayolu, preview'da gizli |
| Akıllı hizalama kılavuzları | `studio/canvas/DragGuides.tsx`, `dragGuideModel.ts` | Sürükleme sırasında: zone genişliğinde ekleme çizgisi + container kenar çizgileri + komşulara px mesafe rozetleri (iki eksen). `useDropTarget` → `uiStore.dropHover` (change-guard'lı) → iframe içi overlay; geometri saf `computeDragGuides`/`pickNeighbourEdges`; dragleave/drop/dragend'de temizlenir |
| Overlay | `studio/overlay/SelectionOverlay.tsx` | Seçim/hover outline + toolbar + breadcrumb + **boşluk (padding/margin) overlay'i** (hover) |
| Resize handles | `studio/overlay/ResizeHandles.tsx` | Genişlik/yükseklik sürükleme (SpacingDragHandles deseni: pointer capture, pointerup'ta tek yazım `w-[Npx]`/`h-[Npx]`, Esc iptal). Global `resizeEnabled` toggle (TopBar + `R`) + per-component `resizable:false` opt-out; açıkken SelectionOverlay spacing→resize handle'a geçer |
| Köprü | `studio/bridge.ts` | `postToHost` / `isEmbedded` / origin doğrulama (`hostOrigin`) |
| Field host | `studio/fields-host/FieldRenderer.tsx` | Puck-uyumlu: text/textarea (**CMS veri bağlama** `bindable`), select, number, radio, array, object, slot, custom(`render`); `readOnly` (statik + nested) |
| Dinamik alanlar | `studio/fields-host/useResolvedFields.ts`, `resolve.ts` | `resolveFields` (koşullu alan) + `resolveData` (türetilmiş prop + `readOnly`); async + stale-drop; **diff-guard'lı** geri yazma (`diffProps`, idempotent → tek yazımda durur) |
| Inspector aggregate ("section") görünümü | `studio/panels/Inspector.tsx` (`NodeFieldSet`/`SectionGroup`), `engine/zones.ts` `getDescendants` | Kapsayıcıya (alt öğesi olan node) tıklayınca İçerik sekmesi, bölümün kendi alanları + **tüm alt elementlerin alanlarını** derinliğe göre girintili, katlanabilir gruplar hâlinde listeler (tek panelden düzenleme); yaprağa/element başlığına tıklayınca tek-node'a daralır. Her grup kendi hook'larını (`useResolvedFields`/`usePermissions`/repeat-scope) çözen bağımsız `NodeFieldSet`; grup üstüne gelince `hoverNode` ile canvas vurgusu, kilitli alt öğe rozet+readOnly. `getDescendants` DFS + derinlik (colon-guard'lı prefix) |
| External data field | `components/fields/ExternalField.tsx` | Jenerik host `fetchList` (Tecof CMS'ten bağımsız) → aranabilir modal seçici; `mapProp`/`mapRow`/`getItemSummary`; `type: 'external'` (FieldRenderer) |
| Veri migrasyonu | `engine/migrate.ts` | `migrateDocument`: `renameComponents` → `transformProps` (rename sonrası tipe göre, id korunur) → custom `migrate`; `version` damgası (`root.props._schemaVersion`) ile idempotent; TecofStudio (yükleme) + TecofRender (yayın) yolunda |
| Şablonlar | `studio/panels/AddSectionModal.tsx` | `config.templates` (`SectionTemplate`) → tek tıkla alt ağaç ekleme (`store.insertPayload`, taze id) |
| AI bölüm üretimi | `studio/ai/*` | Host-pluggable: `config.ai.complete({system, prompt})` — LLM çağrısı host'ta, **prompt (bileşen kataloğu) + savunmacı parse/doğrulama** (fence toleransı, uydurma tip reddi, id temizliği, derinlik sınırı) kütüphanede. ⌘K → "AI ile bölüm üret" → doğrulanmış folded node standart `insertNode` yolundan eklenir (taze id, tek undo). `config.ai` yoksa AI UI'ı hiç görünmez |
| Bileşen varyantları | `types` `ComponentConfig.variants`, `AddSectionModal`, `Inspector` | İsimli prop preset'leri ({label, props}). Modal'da her varyant kendi kartı (kendi props'uyla canlı önizleme; saved-components `onSelect(type, customProps)` yolundan eklenir), Inspector'da chip switcher (`_variant` işaretiyle aktif takibi; uygulama updateProps → undoable) |
| Gerçek genişlik canvas (fit-scale) | `canvas/Canvas.tsx`, `topbar/ViewportWidthControl.tsx`, `uiStore` (`desktopWidth`/`canvasScale`) | Viewport, seçilen GERÇEK tasarım genişliğinde (desktop: 1280/1440/1680/1920/özel; tablet 768, mobil 375) layout edilir; alandan genişse `.tecof-canvas-stage` (ölçekli layout footprint) içinde `transform: scale()` ile sığdırılır — site her zaman gerçek breakpoint'te render olur. Ölçek her tüketicide DOM'dan türetilir (`iframeRect.width / iframe.clientWidth`): SelectionOverlay koordinat+box çizimi (değer etiketleri gerçek px), Spacing/Resize handle delta'ları (böl), context menu, TouchDragLayer (host↔iframe çarp/böl). Transform bilerek transition almaz; overlay konteyneri de ResizeObserver'da |
| Dokunmatik DnD | `studio/canvas/TouchDragLayer.tsx`, `touchDragModel.ts` | Pointer-event katmanı: long-press (300ms, 8px tolerans) → `beginDrag`; parmak takibi + iframe koordinat çevirisi + `elementFromPoint` hit-test (`data-tecof-id`/`data-tecof-zone`, en içteki geçerli hedef kazanır — native ile aynı semantik, saf mantık `touchDragModel.ts`'te). Pozisyonel hedefler `uiStore.dropHover` üzerinden DragGuides'ı, konteyner hedefler `.is-touch-dragover` sınıfını kullanır; bırakma `moveNode`/`insertNode`. Ghost host dokümanda; autoscroll parmağın üstünde olduğu kaba göre iframe scrollingElement veya katman panelinin scroll kabı; Esc/pointercancel iptal. Kaynaklar: canvas node, palet (`data-tecof-block-type`), katman satırı (`data-tecof-layer-id`). Katman satırları hedef olarak da çalışır: `computeLayerDropPos` (üst/alt yarı + zone'lu satırda orta-üçte-bir "içine"), fare yoluyla AYNI `is-drop-top/bottom/inside` satır sınıfları. Fare native HTML5 yolunda kalır |
| Repeat zone (öğe şablonu) | `utils/itemTokens.ts`, `components/RepeatItemContext.ts`, `engine/repeat.ts`, `canvas/RepeatGhosts.tsx` | `slot` alanına `repeatSource` (kardeş dizi prop) veya render-anı `renderDropZone({ repeatItems })` → zone çocukları satır başına tekrarlanır; `{{ item.* }}` prop token'ları satırla çözülür (`resolveItemTokens`, referans-koruyan; tam token ham değer geçirir). Editör: şablon ilk satıra bağlı düzenlenir, kalan satırlar statik ghost (`display:contents`, inert); yayın: satır yoksa çıktı yok. Inspector `findRepeatScope` ile `{ }` popover'ına "Öğe alanları" (slot `itemSchema` ?? kaynak alan `itemSchema` ?? satırdan `inferItemSchema`) sağlar; bileşen içi erişim `useRepeatItem()`. **Faz 2 — dinamik kaynaklar:** `components/useRepeatRows.ts` (dizi ↔ `createApiListField` `fetchList` ↔ CMS `collectionSlug`→`getCmsCollectionItems`; oturum cache + inflight tekleme + `clearRepeatRowsCache`/`resolveRepeatRows`/`peekRepeatRows`), `fields/ApiListField.tsx` (değer = `{query,limit}`, inspector'da arama/limit/yenile + canlı önizleme); renderer'larda `RepeatSlotZone`/`EditorRepeatSlot`/`GhostRepeatSlot` sarmalayıcıları, CMS için `useTecofOptional` (provider'sız statik yayında boş) |
| Slot varsayılan çocuk | `studio/canvas/dndUtils.ts` `createNode` | `ComponentConfig.defaultChildren` (slot → çocuk tipleri) → eklenen bileşenin slotlarını recursive (cycle-guard'lı) doldurur; `extractDefaultSlots` insert'te zone'lara taze id ile açar. defaultProps ile dolu slotları atlar |
| Overlay portal | `studio/canvas/overlayPortal.ts` | `registerOverlayPortal` (`puck.registerOverlayPortal`) → belirli kontrolleri (tab/slider/accordion) edit-mode'da canlı bırakır; `installCanvasInteractionGuard` (Frame'de) → edit-mode'da portal-dışı link/buton/form'un native navigasyon+submit'ini **capture fazında** iptal eder (seçim akışı bozulmadan). Preview modunda pasif |
| Build | `tsup.config.ts` | `splitting: true` → ağır field'lar (Monaco/TipTap/FilePond) ayrı chunk |

### Bilinen Boşluklar / Yol Haritası

- Editör arayüzü i18n (şu an sabit Türkçe).
- Autosave + `beforeunload` koruması.

---
*Hazırlayan: Tecof Core Team (AI Architect)*
