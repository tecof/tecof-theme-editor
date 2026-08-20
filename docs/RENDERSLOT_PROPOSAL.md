# renderSlot mimarisi — tema kodlamayı basitleştiren iyileştirmeler

Amaç: bir section yazmayı bugünkü "her slot çağrısında className + eşleşen style +
hide-if-slot-empty + defaultChildren tuzağı" yükünden kurtarmak. Aşağıdaki her
madde GERÇEK bir tekrar/tuzağa dayanır (dosya:satır ile). Öncelik sırası: 1 > 2 > 3.

---

## ✅ Uygulama durumu (2026-08, `@tecof/theme-editor` 0.0.81)

| # | Madde | Durum | Nerede |
|---|---|---|---|
| 1 | Motor yerleşimi INLINE yerine CLASS + CSS var | ✅ Uygulandı | `DropZone.tsx` + `TecofRender.tsx` `managedLayout` bayrağı; `.tecof-slot-*` @layer base |
| 2 | `<Slot>` bileşeni | ✅ Uygulandı (kısmi) | `src/components/Slot.tsx` — `value/layout/gap/className/style`. `hideIfEmpty` + `as`/a11y **henüz yok** (madde 3'e bağlı) |
| 3 | Boş slot'u birinci sınıf yap (`hideIfEmpty`) | ⬜ Yapılmadı | motorun render'a `isEmpty` sinyali geçirmesi gerekiyor |
| 4 | `defaultProps` slot dizisi ↔ `defaultChildren` otomatik birleşme | ◑ Dolaylı | motor seviyesinde değil; `defineSection` slot `default`'unu `defaultChildren`'a MAP'leyerek tuzağı atlatır |
| 5 | `<TecofRoot>` — kök className sözleşmesi | ✅ Uygulandı | `src/components/TecofRoot.tsx`; `defineSection` render köküne `p.className`'i otomatik ekler |
| 6 | `defineSection` / `defineElement` fabrikası | ✅ Uygulandı | `src/components/defineComponent.tsx` |

**Dağıtım kapısı:** Bu API yalnız **yayınlanmış** paket sürümünde temalara ulaşır.
0.0.80 (npm latest) bu API'yi İÇERMEZ — yerel **0.0.81** içerir ama henüz
yayınlanmadı. Temalar `<Slot>`/`TecofRoot`/`defineSection` kullanmadan ÖNCE:
1. `@tecof/theme-editor` 0.0.81 **npm publish**,
2. tema `package.json` (mova/core `^0.0.80` → `^0.0.81`) + `npm install`,
3. section bileşenlerini aşağıdaki reçeteyle `renderSlot` → `<Slot>`'a taşı.

`.tecof-slot-*` yayın CSS'i mova + core `globals.css`'ine (@layer base) **eklendi**
(bu adım zararsız; eski paket sürümünde class'lar üretilmez). Yayın sayfası paket
styles.css'ini yüklemediği için bu CSS temanın globals.css'inde ŞART.

### Migration reçetesi (renderSlot → <Slot>)

```tsx
// ÖNCE (mova lib/studio.tsx kalıbı — yerleşim İKİ kez: className + style)
{renderSlot(p.itemsSlot, {
  className: cn("flex-wrap justify-center", CARD_WIDTHS[p.columns]),
  style: slotGap("1.5rem"),
})}

// SONRA — yerleşim tek kaynak (layout+gap), className yalnız EK niyet
<Slot value={p.itemsSlot} layout="row-wrap" gap="xl"
      className={cn("justify-center", CARD_WIDTHS[p.columns])} />
```

Kök sözleşmesi elle migration'da hâlâ gerekir — ya `<TecofRoot as="section"
className={cn("py-16", p.className)}>` sar, ya bileşeni `defineSection`'a çevir
(kök className otomatik eklenir). `layout` eşlemesi: yatay=`row`/`row-wrap`,
dikey=`col`, sarmalayıcıyı yok say=`contents`. `gap`: `xs=.25 sm=.5 md=.75 lg=1
xl=1.5rem` (ya da ham `"1.25rem"`).

---

## 0. Bugünkü acı noktaları (kanıt)

**a) Inline stil, className'i sessizce yeniyor.**
`src/components/TecofRender.tsx:56-58` yatay slot kapsayıcısına inline basıyor:
```ts
const orientationStyle = orientation === 'horizontal'
  ? { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' } : undefined;
...
<div className={className} style={{ ...orientationStyle, ...style }}>   // satır 77
```
Editör tarafı (NodeRenderer) da aynı inline'ı basıyor. Inline stil Tailwind
class'ını HER ZAMAN yendiği için tema yazarının `className: "gap-x-10"` /
`"contents"` niyeti yok sayılıyor. Çözüm bugün: temada `slotGap/slotRow/slotColumn/
slotRowWrap/SLOT_CONTENTS` yardımcılarıyla AYNI niyeti bir de `style` olarak geçmek
(mova `lib/studio.tsx:264-310`). Yani her slot çağrısında **iki kez** yerleşim yazılıyor:
```tsx
renderSlot(p.itemsSlot, { className: cn("...", CARD_WIDTHS[...]), style: slotGap("1.5rem") })
```
Bu, section başına 4–8 kez tekrarlanıyor (Header 6, Footer 8, FAQSection 4) ve
`style`'ı unutmak = sessiz bozulma.

**b) `hide-if-slot-empty` bir CSS hack'i.** Boş slot kapsayıcısını gizlemek için
tema `<div className="hide-if-slot-empty">{renderSlot(...)}</div>` sarıyor. Slotun
dolu olup olmadığını render anında bilmenin birinci-sınıf yolu yok.

**c) `defaultChildren` vs `defaultProps` tuzağı.** defaultProps'a slot çocuğu
dizisi yazmak çocuğun KENDİ defaultProps'unu BİRLEŞTİRMEZ (Header/DroneHero
yorumları: "yalnız id verilen kart bomboş doğar"). Doğru yol `defaultChildren`
ama bu iki ayrı mekanizma ve hangisinin ne zaman kullanılacağı ezber gerektiriyor.

**d) className kök sözleşmesi.** Bileşenin `className`'i her render dalında kök
DOM'a düşmeli; düşmezse editörde SEÇİLEMEZ (NodeRenderer tip başına bir kez uyarır).
Sessiz footgun.

---

## 1. Motorun yerleşimi INLINE yerine CLASS + CSS değişkeniyle vermesi ⭐

**En yüksek etki, tema başına onlarca satırı siler.**

`RenderDropZone`, orientation varsayılanını inline style yerine bir CLASS +
CSS değişkeniyle uygulasın:

```tsx
// TecofRender.tsx (öneri)
const orientationClass = orientation === 'horizontal' ? 'tecof-slot-row' : undefined;
// gap CSS değişkenle: theme className override edebilir
<div
  className={cx('tecof-slot', orientationClass, className)}   // theme className EN SONDA
  style={style}
  data-orientation={orientation}
>
```
Paket CSS'i (base katmanında, tema utilities'i EZMESİN):
```css
@layer base {
  .tecof-slot { --tecof-slot-gap: 8px; }
  .tecof-slot-row { display: flex; flex-direction: row; flex-wrap: wrap; gap: var(--tecof-slot-gap); }
}
```
Sonuç: tema `className="gap-x-10 flex-col contents"` yazınca **çalışır** (class vs
class, cn'de sonra gelen kazanır) — `slotGap/slotRow/slotColumn/SLOT_CONTENTS/
SLOT_GAP_*` yardımcıları ve her çağrıdaki ikinci `style` argümanı **tamamen kalkar**.

Geriye dönük uyum: `style` prop'u desteklenmeye devam eder (eski temalar kırılmaz);
yeni temalar yalnız className kullanır. Editör (NodeRenderer) aynı class'ı basmalı
ki canvas ile yayın birebir aynı olsun.

Migration: mova'da `grep -r "style: slot" components` → 40+ çağrı; class'a geçince
hepsi tek `className`'e iner.

---

## 2. `<Slot>` bileşeni — tek satırlık slot API'si ⭐

renderSlot + yerleşim + boş-gizleme + allow'u tek bileşende topla (pakette export,
temalar `renderSlot` yerine bunu kullanır):

```tsx
// paket: <Slot />
<Slot value={p.contentSlot} layout="col" gap="lg" className="items-center" />
<Slot value={p.itemsSlot}   layout="row" gap="md" hideIfEmpty />
<Slot value={p.navSlot}     layout="row" gap="sm" as="nav" aria-label="Menü" />
```
- `layout`: `row | col | row-wrap | contents` → doğru class (madde 1) otomatik.
- `gap`: `xs|sm|md|lg|xl` → `--tecof-slot-gap` değişkenine map.
- `hideIfEmpty`: slot boşsa `null` döner (madde 3) — `.hide-if-slot-empty` hack'i biter.
- `as`: kapsayıcı etiketi (`nav`, `ul`…) + a11y prop geçişi.
- `className`: yalnız EK niyet (hizalama vb.); yerleşim `layout`'tan gelir.

Her section'daki 4–8 satırlık `renderSlot(..., { className: cn(...), style: slot*(...) })`
kalıbı tek satıra iner. Yerleşim tek kaynak — `style`'ı unutma ihtimali yok.

---

## 3. Boş slot'u birinci sınıf yap

`renderSlot`/`<Slot>` slotun dolu olup olmadığını bilebilir (motor zaten zone
listesini görüyor). İki kazanım:
- `hideIfEmpty` (madde 2) → CSS hack yerine gerçek koşullu render.
- `renderSlot(...)` boş slotta `null` dönerse tema `{slot && <wrapper/>}` yazabilir.

Uygulama: motor, boş zone için render fonksiyonuna `data-empty` / `isEmpty`
sinyali geçirsin; `<Slot hideIfEmpty>` bunu okuyup `null` dönsün. (Editörde boş
slot yine "buraya ekle" ipucunu göstermeli — yalnız YAYINDA gizlensin.)

---

## 4. defaultChildren tuzağını kaldır

Motor, `defaultProps` içindeki slot dizilerini de `defaultChildren` gibi
işleyip çocuğun KENDİ defaultProps'uyla BİRLEŞTİRSİN (createNode'daki merge yolu
extractDefaultSlots'a da uygulanır). Böylece:
- Tek mekanizma kalır: slot içeriğini nereye yazarsan yaz, çocuk varsayılanları dolar.
- Header/DroneHero'daki "defaultChildren kullan yoksa boş doğar" uyarıları gereksizleşir.

Ara adım (kırıcı değil): `defineSection` (madde 6) slot defaultProps'unu
otomatik `defaultChildren`'a taşısın — tema yazarı ayrımı hiç görmez.

---

## 5. className kök sözleşmesini yardımcıya gömerek zorla

Bugün her render kök elemanına elle `cn(className, ...)` eklemek gerekiyor;
unutulunca bileşen editörde seçilemiyor. Öneri: `<TecofRoot>` sarmalayıcısı
(ya da `useRootClass()` hook'u) className'i garanti kök elemana bassın:

```tsx
render: (p) => (
  <TecofRoot as="section" className={cn("py-16", p.className)}>
    <Slot value={p.contentSlot} layout="col" gap="lg" />
  </TecofRoot>
)
```
`TecofRoot`, className + `data-tecof-*` işaretlerini tek noktada yönetir; kök
sözleşmesi ihlali imkânsızlaşır (bugünkü "tip başına bir uyarı" yerine derleme-zamanı
garanti).

---

## 6. `defineSection` / `defineElement` fabrikası — boilerplate azalt

Her bileşen `export const X = { label, fields, fieldsGroups, defaultProps, render }`
kalıbını elle yazıyor; appearance alanları `appearanceFields()`/`appearanceDefaults()`
ile kısmen toplanmış ama fieldsGroups + slot + defaultChildren hâlâ elde.

```tsx
export const FeaturesSection = defineSection({
  label: "Özellikler",
  slots: {
    contentSlot: { label: "Başlık", allow: ["Title","Paragraph"], layout: "col", gap: "lg",
                   default: [Title("Avantajlar"), Paragraph("...")] },
    itemsSlot:   { label: "Kartlar", allow: ["Card"], layout: "row", gap: "md", default: [Card(), Card(), Card()] },
  },
  fields: { columns: radio("Sütun", ["2","3","4"]) },
  appearance: ["surface","paddingTop","paddingBottom","width"],
  render: (p, slots) => (
    <TecofRoot as="section">{slots.contentSlot}{slots.itemsSlot}</TecofRoot>
  ),
});
```
`defineSection`:
- slot `default`'unu otomatik `defaultChildren`'a çevirir (madde 4 tuzağı biter),
- `layout`/`gap`'i `<Slot>`'a bağlar (madde 1-2),
- `appearance`'ı fields + defaultProps + fieldsGroups'a genişletir,
- `render`'a hazır-render edilmiş `slots` objesi verir (renderSlot çağrısı bile gerekmez),
- kök className'i `TecofRoot` ile garanti eder (madde 5).

Bir section ~200 satırdan ~50 satıra iner; tuzakların hiçbiri tema yazarına ulaşmaz.

---

## Sıralama ve dağıtım

1. **Madde 1** (motor class + CSS var) — en yüksek etki, geriye uyumlu; önce bu.
2. **Madde 2 + 3** (`<Slot>` + hideIfEmpty) — 1'in üstüne; her section'ı sadeleştirir.
3. **Madde 5** (`TecofRoot`) — kök sözleşmesini garanti eder.
4. **Madde 4 + 6** (`defineSection`, defaultChildren birleşme) — en büyük ergonomi
   sıçraması, en çok test ister; en sona.

Her madde ayrı yayınlanabilir (`@tecof/theme-editor` minor sürümleri); temalar
istedikçe yeni API'ye geçer, eski `renderSlot`/`slot*` yardımcıları bir süre
korunur (deprecated). MCP `list_components` katalog çıkarımı bu değişikliklerden
etkilenmez (fields şekli aynı kalır).
