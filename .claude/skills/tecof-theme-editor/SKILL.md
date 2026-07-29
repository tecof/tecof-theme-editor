---
name: tecof-theme-editor
description: tecof-theme-editor'de (@tecof/theme-editor npm paketi — Tecof Studio editör motoru, TecofRender, alan factory'leri) çalışırken kullan — doküman/zone/node modeli, store/undo/commit, symbol (ortak bileşen) sistemi, izinler, kaydet/yayınla akışı, postMessage protokolü, stil token modeli, build/publish. Motora, alan tiplerine, Inspector/panel UI'ına dokunurken bu skill'i yükle.
---

# Tecof Theme Editor (@tecof/theme-editor)

Repo: `/Users/ahmetaksungur/Desktop/Tecof/tecof-theme-editor`. Puck yerine
yazılmış in-house editör motoru: zustand+immer headless engine + iframe canvas.
Tüketiciler: tema paketleri (theme-core ve türevleri) + panel. **npm paketi** —
değişiklik publish + tüketicide sürüm yükseltmesi olmadan yayına ulaşmaz.

**Otorite dokümanlar**: `docs/AI_GUIDE.md` (normatif — sürüm satırı bayat
olabilir ama davranış anlatımı geçerli), `ARCHITECTURE.md` (modül haritası),
`docs/PERMISSIONS.md`, `docs/TAILWIND.md`. Public yüzeyin tek kaynağı
`src/index.ts`; tipler `src/types/index.ts`.

## Veri modeli (değişmez)

- Node: `{ type: string, props: { id: string, ... } }`. **props.id kimliktir** —
  `updateProps` id'yi asla değiştiremez (patch ezse bile geri yazılır).
- Zone anahtarı DAİMA `parentId:slotName` (slot yoksa `default`). Root node'lar
  `doc.content`'te, iç içe olanlar `doc.zones`'ta.
- ⚠ `doc.zones` KEY SIRASI görsel sırayı temsil ETMEZ (move/undo key'i sona
  yeniden yaratır) — kardeş sırası için `getDescendants(doc, id, config)`.
- Zone prefix taramasında colon-guard: `${nodeId}:` (sondaki `:` şart —
  `Foo-1:` `Foo-12:...` ile eşleşmesin).
- Node silinince alt zone'lar recursive temizlenir; kopyala/çoğalt/yapıştır
  `remapNodeIds` ile TAZE id üretir (nanoid(8)).
- `_` önekli prop'lar motor rezervli: `_tecofStyles, _tecofTheme, _interactions,
  _startHidden, _locked, _hidden, _symbolOverrides, _variant, _schemaVersion,
  _layerName` — bileşen prop'u olarak kullanma.

## Store / undo / commit

Her mutasyon `store.ts`'teki `commit` yolundan geçer: immer `produceWithPatches`
ile patch-bazlı history (limit 50), aynı node'a 500ms içindeki edit'ler tek undo
adımına coalesce (inverse patch'ler PREPEND edilir — sırayı bozan merge undo'yu
sessizce bozar). Kullanıcıya görünen bir işlem = TEK commit = TEK undo adımı.
Ara immer draft'ında `findNodeById` index'i yeniden kurulmaz — bulk işlemlerde
path'leri baştan çöz, her listede yüksek index'ten aşağı sil (removeNodes deseni).
Clipboard localStorage anahtarı versiyonlu (`tecof:clipboard:v1`) — payload şekli
değişirse suffix bump.

## Symbol (ortak bileşen) sistemi

Aynı `sharedComponentId`'yi taşıyan node'lar tek sembolün örnekleri; eşleme
STRUCTURAL PATH ({slot,index}) ile. `_symbolOverrides` key'leri ve META_KEYS
(id, sharedComponentId, _symbolOverrides, _locked, _hidden, _startHidden)
örnekler arası ASLA propagate edilmez. `planSymbolSync` PURE plan'dır; store tek
commit'te uygular. Kayıtta backend node'u `SharedComponentRef`'e indirger;
okuma anında master'dan çözer. `deleteSharedComponent` silmeden önce backend
ref'leri sayfalara MATERYALİZE eder (içerik kaybolmaz, bağ kalkar).

## İzinler

Permissive-by-default; merge: DEFAULT < config.permissions <
component.permissions < resolvePermissions < instance `_locked`. Motor seviyesi
gate (removeNode/moveNode/duplicateNode `nodeAllows`); `updateProps` BİLİNÇLİ
gate'siz (kilit açma böyle çalışır); kilitli node seçilebilir kalır. `cutNode`
delete izni yoksa plain copy'ye düşer — bug değil.

## Kaydet / yayınla / host köprüsü

- Editör YALNIZ `draftData` yazar (`PUT /api/store/editor/:id`,
  `{draftData, title?, themeId?}`). Publish (draft→published kopyası) host/backend
  işi — paket publishedData'ya hiç dokunmaz. `puck:publish` bile draft save'dir.
- postMessage öneki `puck:` SABİT (host geriye-uyum). Host→editör:
  save/publish/undo/redo/refetch/highlight/viewport; editör→host:
  changed/saved/saveError/itemSelected/itemDeselected. `hostOrigin` verilmezse
  hedef `*` — embed'de hostOrigin geçmek güvenlik gereği.
- `?revision=` paramı editörü SALT OKUNUR yapar (kaydetme/import kilitli).
- ApiClient hataları `{success:false}` zarfına yutar ama AbortError'ı RETHROW
  eder (iptal ≠ hata) — yeni metotta bu deseni koru. `themeId` gönderilmezse
  backend aktif temaya düşer — yeni uçta themeId'yi geçir.

## Renderer + alanlar

- TecofRender config'te olmayan type'ı sessizce render etmez; editör ve yayın
  AYNI StudioConfig'i kullanır. Type adı değişirse `config.migrations` zorunlu
  (renameComponents → transformProps → migrate; `_schemaVersion` ile idempotent).
- Alan factory'leri `{type:'custom', _fieldType, label, render}` döndürür;
  çok dilli değer `[{code, value}]`. Tam factory listesi `src/index.ts`.
- Repeat zone: slot'a `repeatSource`; `{{ item.<yol> }}` token'ları kütüphane
  çözer; satır yoksa şablon HİÇ render edilmez. Canvas'ta bağlı metne çift
  tıklama token'ı literal'le ezer — bağlı alan Inspector'dan düzenlenir.
- E-ticaret seçicileri seçimi SNAPSHOT dondurur; ürün filtresi marka/etiketi
  ObjectId, kategoriyi slug ister.
- CDN URL kuran HER kod `cdnFileUrl` (src/utils) kullanır — folder'sız
  `${cdnUrl}/${name}` scope'lu dosyada 404 ve TipTap/tema JSON'una KALICI yazılır.
- TecofPicture: `type === 'image/reference'` null render; external (stok) dosya
  kayıttaki mutlak `url`'i kullanır.

## Stil + tema

Node stilleri `props._tecofStyles` token modeli (base/sm/md/lg/xl +
hover/focus/active); `compileStyles()` derler; üretimde preset'ler
`getSafelist()`, arbitrary'ler `collectDocumentClasses()` ister. Tema
`root.props._tecofTheme`; merge: built-in ← config.theme ← sayfa override;
yayında `generateCSSVariables` şart; dark mode opt-in (`:root.dark` değişken
swap — safelist'e dark ekleme yok). Detay: `tecof-design-system` skill'i +
`docs/TAILWIND.md`.

## Build / test / publish

- Build tsup (esm+cjs+dts); onSuccess hook'u dist'teki her JS'e `'use client'`
  banner'ı ekler. `styles.css` build'te FilePond+Doka CSS'leriyle birleştirilir;
  tüketici `@tecof/theme-editor/styles.css` import etmek ZORUNDA. Tüm chrome
  sınıfları `tecof-` önekli. Email şablonları ayrı subpath build
  (`@tecof/theme-editor/email`).
- Test: vitest, kök config YOK; ortam per-file (`// @vitest-environment node`),
  testler `src/**/__tests__/`. `npm test` → 428+ test.
- package.json'da kendine bağımlılık (`"@tecof/theme-editor"`) var — kaza,
  dokunma/şaşırma.
