# Tecof Studio — Tailwind Entegrasyonu

Bu belge, Studio'nun **görsel stil editörünün** (Inspector → "Stil" sekmesi)
Tailwind ile nasıl çalıştığını ve host uygulamanın bunu üretimde (production)
nasıl doğru kuracağını anlatır.

---

## 1. Mimari: "stil niyeti" → Tailwind class

Studio, bir node'a uygulanan stilleri **ham class string'i olarak değil, yapısal
token modeli** olarak saklar. Model `node.props._tecofStyles` altında yaşar
(`STYLES_PROP` sabiti):

```ts
// NodeStyles
{
  base?:  { p: '4', bg: 'primary-600' },   // prefixsiz (mobile-first)
  sm?:    { ... },                          // sm:
  md?:    { p: '[10px]' },                  // md:  (arbitrary value)
  lg?:    { ... },                          // lg:
  xl?:    { ... },                          // xl:
  states?: {
    hover: { bg: 'primary-700' },           // hover:  (base breakpoint)
    'md:hover': { bg: 'primary-800' },       // md:hover:  (breakpoint-scoped state)
  }
}
```

Bu model `compileStyles()` ile tek bir Tailwind class string'ine derlenir:

```ts
compileStyles({
  base: { p: '4', bg: 'primary-600' },
  md:   { p: '[10px]' },
  states: { hover: { bg: 'primary-700' } },
})
// → "p-4 bg-primary-600 md:p-[10px] hover:bg-primary-700"
```

Derlenen string, render sırasında bileşenin `className`'ine eklenir
(`NodeRenderer` editörde, `TecofRender` üretimde aynı akışı izler).

**Neden token modeli?**
- UI sürülebilir kalır (her kontrol mevcut değeri gösterebilir).
- Responsive + state varyantları birinci sınıf vatandaştır.
- Her property sonlu bir token kümesine bağlandığı için **tam bir safelist
  üretilebilir** (bkz. §3).
- `node.props._tecofStyles` içinde kayıpsız round-trip yapar.

Tek doğruluk kaynağı: [`src/studio/style/tokens.ts`](../src/studio/style/tokens.ts)
(`STYLE_CONTROLS`). Bu dizi aynı anda üç şeyi sürer: editör UI'ı, class
derlemesi (`toClass`) ve safelist.

---

## 2. Tailwind v4 + `@theme` token'ları

Stil editörü **Tailwind v4** hedefler. Marka paleti CSS değişkenleridir; host
uygulamanın `@theme` bloğunda `--color-primary-*` tanımlaması gerekir ki
editördeki `bg-primary-600`, `text-primary-700` gibi class'lar gerçek renge
karşılık gelsin:

```css
/* app.css (host) */
@import "tailwindcss";

@theme {
  --color-primary-50:  #f3f9e6;
  --color-primary-100: #e4f1c2;
  /* … */
  --color-primary-600: #74b500;  /* ana marka rengi */
  --color-primary-700: #588902;
  --color-primary-950: #1d3300;
}
```

> Not: `--tecof-primary-*` değişkenleri yalnızca **editör arayüzünü** boyar
> (chrome). Sayfa içeriğine uygulanan `primary-*` class'ları ise host'un
> `@theme`'inden beslenir. İkisini karıştırmayın.

### Semantik tema renkleri (`--theme-color-*`)

Stil editörünün renk kontrolleri, marka skalasına ek olarak **canlı tema
renklerini** de sunar (`Tema · Ana renk`, `Tema · Metin`, …). Bunlar
`--theme-color-*` CSS değişkenlerine işaret eden sonlu arbitrary değerlerdir;
`bg`/`text`/`border` için sırasıyla `bg-[var(--theme-color-primary)]` gibi
class'lara derlenir ve `getSafelist()` bunları otomatik kapsar — yani ekstra
Tailwind `@theme` kurulumu gerekmez, yalnızca `--theme-color-*` değişkenlerinin
tanımlı olması yeterlidir.

Bu değişkenler `generateCSSVariables(theme)` çıktısıyla üretilir. Studio'daki
**canlı tema editörü** (Inspector → seçim yokken "Tema" sekmesi) bu değişkenleri
hem editöre hem canvas iframe'ine anında enjekte eder; yayında ise host,
`generateCSSVariables` çıktısını sayfaya dahil etmelidir. Tema, sayfanın
`root.props._tecofTheme`'inde saklanır.

### Renk seçici: dört renk kaynağı

Renk kontrolleri (`bg`, `text`, `borderColor`) tek bir **renk seçici panelinde**
dört kaynağı sunar:

| Kaynak | Saklanan token | Derlenen class | Üretim güvencesi |
|---|---|---|---|
| Hızlı seçim (şeffaf/beyaz/siyah) | `white` | `bg-white` | `getSafelist()` |
| Tema renkleri (canlı) | `[var(--theme-color-primary)]` | `bg-[var(--theme-color-primary)]` | `getSafelist()` |
| Marka skalası | `primary-600` | `bg-primary-600` | `getSafelist()` |
| **Tailwind varsayılan paleti** | `red-500` | `bg-red-500` | `getSafelist()` |
| **Özel renk (color picker / hex)** | `[#ff6b00]` | `bg-[#ff6b00]` | `collectDocumentClasses()` |

Tailwind paleti, v4 varsayılan paletinin tamamıdır: **22 renk × 11 ton**
(`red`…`rose`, `slate`…`stone`; `50`–`950`). Panelde önce renk noktası (hue),
sonra ton şeridi seçilir. Palet verisi `TAILWIND_PALETTE` / `TAILWIND_SHADES`
olarak paketten export edilir. Editör chrome'undaki swatch önizlemeleri host'un
`--color-*` @theme değişkenini okur; tanımlı değilse gömülü varsayılan hex'e
düşer — yani host paleti override ederse editör de üretim de onu izler.

Özel renk bölümü native `<input type="color">` picker'ı ve `#rrggbb` hex girişi
sunar; seçim arbitrary token (`[#ff6b00]`) olarak saklanır ve üretimde
görünmesi için §3b'deki `collectDocumentClasses` akışı gerekir.

---

## 3. Üretimde class'ların var olması: Safelist

Tailwind kullanılmayan class'ları purge eder. Editörde seçilen bir class,
kaynak kodda string olarak geçmediği için (veritabanındaki sayfa JSON'unda
yaşar) Tailwind onu **göremez** ve üretim CSS'ine dahil etmez. İki strateji
vardır:

### 3a. Preset class'lar → `getSafelist()`

Editörün üretebileceği **tüm preset** class'lar sonludur. Paket bunları hazır
verir:

```js
// tailwind.config.js  (veya v4'te CSS @source / safelist mekanizması)
import { getSafelist } from "@tecof/theme-editor";

export default {
  safelist: getSafelist(),
  // ...
};
```

`getSafelist()` her token × her kontrol × her breakpoint/state prefix'ini
döndürür — **breakpoint × state kombinasyonları dahil** (ör. `p-4`, `md:p-4`,
`hover:bg-primary-700`, `md:hover:bg-primary-600`, …). Ayrıca **sonlu tema-renk
arbitrary'lerini** de içerir (ör. `bg-[var(--theme-color-primary)]`,
`text-[var(--theme-color-foreground)]`), çünkü tema renkleri sabit bir kümedir.
Böylece editörde seçilebilen her preset ve tema rengi üretimde kesinlikle bulunur.

> **Boyut notu:** Tam Tailwind paleti (22×11 renk) üç renk kontrolü ve tüm
> breakpoint×state prefix'leriyle çarpıldığı için `getSafelist()` çıktısı
> büyüktür (~20k class). Tailwind yalnızca CSS üretir, JS maliyeti yoktur; yine
> de CSS boyutu kritikse listeyi host tarafında filtreleyebilirsiniz (örn.
> yalnızca kullandığınız hue'ları bırakın).

### 3b. Arbitrary (custom) değerler → `collectDocumentClasses`

Kullanıcı `p-[10px]`, `bg-[#ff0000]` gibi **serbest değerler** girebilir
(bkz. §4). Bunlar sonsuz olduğu için statik safelist'e sığmaz **ve** kaydedilmiş
sayfa JSON'unda yaşadığı için Tailwind'in content tarayıcısı da göremez. Çözüm:
kaydedilmiş sayfalardan **gerçekten kullanılan** class'ları toplayıp safelist'e
eklemek. Paket bunun için iki yardımcı verir:

```js
import { getSafelist, collectDocumentClasses } from "@tecof/theme-editor";

// Build aşamasında yayınlanan/taslak sayfaları gezin:
const dynamic = savedPages.flatMap((p) => collectDocumentClasses(p.draftData));

export default {
  safelist: [...getSafelist(), ...dynamic],
  // ...
};
```

- `collectStyleClasses(styles)` — tek bir `NodeStyles` nesnesinin derlendiği
  tüm class'ları (preset + arbitrary) döndürür.
- `collectDocumentClasses(pageData)` — bir sayfanın kökü + içeriği + tüm
  zone'larındaki her node'un stil class'larını tekilleştirerek döndürür.

> Tam dinamik (DB'den beslenen) senaryolarda bu listeyi her sayfa kaydında
> yanında saklayıp build'de safelist'e verebilir veya Tailwind'i runtime'da
> çalıştırabilirsiniz. Çoğu kullanım için **preset + tema renkleri** (`getSafelist`)
> tek başına yeterlidir; serbest değer açtığınızda yukarıdaki tarayıcıyı ekleyin.

---

## 4. Arbitrary (serbest) değerler

Arbitrary değerler `NodeStyles` içinde **köşeli parantezle** saklanır:
`'[10px]'`, `'[#ff0000]'`. Preset'ler çıplaktır (`'4'`, `'primary-600'`). Bir
kontrolün `arbitraryPrefix`'i varsa, kullanıcının girdiği ham `V` değeri
`prefix-[V]`'ye derlenir:

| Kontrol | Arbitrary girdi | Derlenen class |
|---|---|---|
| `p` (padding) | `10px` | `p-[10px]` |
| `bg` (arka plan) | `#ff0000` | `bg-[#ff0000]` |
| `gap` | `2.5rem` | `gap-[2.5rem]` |

Editörde her arbitrary-destekli kontrolün yanında `+` toggle'ı vardır; açınca
serbest değer input'u çıkar. Arbitrary değer girildiğinde preset seçimi boşalır.
`isArbitrary` / `toArbitrary` / `arbitraryRaw` yardımcıları kodlamayı yönetir.

Hangi kontroller arbitrary destekler: boşluk/boyut (`p, px, py, m, mx, my, gap,
w, h, maxW`) ve renkler (`bg, text, borderColor`). Segment toggle'ları
(display, flex yönü vb.) bilinçli olarak desteklemez.

---

## 5. Breakpoint & state varyantları

| Katman | Prefix | Örnek |
|---|---|---|
| `base` | _(yok)_ | `p-4` |
| `sm` | `sm:` | `sm:p-6` |
| `md` | `md:` | `md:p-8` |
| `lg` | `lg:` | `lg:flex-row` |
| `xl` | `xl:` | `xl:max-w-6xl` |
| `hover` | `hover:` | `hover:bg-primary-700` |
| `focus` | `focus:` | `focus:border-primary-600` |
| `active` | `active:` | `active:opacity-90` |

Editörde üst segmentlerden katman seçilir; **override içeren** breakpoint/state
artık küçük bir nokta (`tecof-style-seg-dot`) ile işaretlenir.

**Breakpoint-bazlı state'ler:** State'ler artık breakpoint'e özeldir. `states`
anahtarı çıplaksa (`hover`) base breakpoint'e, `${bp}:${state}` formatındaysa
(`md:hover`) yalnızca o breakpoint'e uygulanır ve sırasıyla `hover:…` /
`md:hover:…` olarak derlenir. Eski çıplak anahtarlar geriye dönük çalışır.
`getSafelist()` tüm breakpoint × state kombinasyonlarını kapsar.

Ayrıca üst breakpoint'i (örn. `md`) düzenlerken bir property'de değer yoksa,
daha az belirgin katmandan **devralınan değer** ilgili kontrolün yanında soluk
bir ipucu olarak gösterilir (yalnızca editör UI'ı; çıktı etkilenmez).

---

## 6. Editör canvas'ında stiller nasıl görünür?

Canvas bir `<iframe>` içinde render edilir. `Frame` bileşeni host sayfasının
stylesheet'lerini iframe `<head>`'ine **artımlı olarak** kopyalar (link diff +
inline değişiklik-gated, rAF debounce). Dolayısıyla host'ta yüklü olan Tailwind
CSS (safelist dahil) editör canvas'ında da geçerlidir — yani editörde gördüğünüz
ile üretimde çıkan birebir aynıdır, **safelist doğru kurulduğu sürece**.

---

## 7. Karanlık mod (dark mode) — geliştirici aç/kapa

Karanlık mod **opsiyoneldir ve geliştiricinin genel ayarında açılır**
(`config.darkMode`). Anahtar yoksa: hiç dark UI, hiç dark CSS, hiç runtime —
karanlık moda ihtiyacı olmayan tema hiçbir bedel ödemez.

```tsx
<TecofStudio config={{
  // ...
  darkMode: true,                      // varsayılanlarla aç
  // veya ince ayar:
  // darkMode: { defaultMode: 'system', storageKey: 'shop-scheme' },
}} />
```

**Strateji (Tailwind `.dark` class):** `<html>` üzerindeki `.dark` class'ı,
`--theme-color-*` değişkenlerinin **DEĞERLERİNİ** takas eder. `generateCSSVariables`
karanlık mod açıkken ikinci bir blok basar:

```css
:root      { --theme-color-background: #ffffff; /* … */ }
:root.dark { --theme-color-background: #09090b; /* … */ }
```

Sayfa içeriği class'larını **hiç değiştirmez** (`bg-[var(--theme-color-primary)]`
aynı kalır); sadece `var()` çözümlenen değer değişir. Bu yüzden **`dark:` varyantı
yoktur ve safelist'e hiçbir şey eklemeniz gerekmez** — self-hosted CSS mimarisiyle
sorunsuz çalışmasının sebebi budur.

- **Koyu renk değerleri** Tema panelinde düzenlenir (`theme.darkColors`) veya
  "Koyu palet üret" ile açık paletten otomatik türetilir (`deriveDarkColors`).
  Girilmeyen her anahtar açık moddaki değerine düşer.
- **Editörde önizleme:** TopBar'daki ☀️/🌙 düğmesi canvas'ı koyu palette çevirir
  (yalnız `config.darkMode` açıkken görünür; session-only, dokümana/undo'ya yazmaz).
- **Yayında ziyaretçi düğmesi:** Sayfanıza `class="tecof-darkmode-toggle"` taşıyan
  herhangi bir buton koyun — runtime tıklamayı **delege** dinler, `.dark`'ı çevirir
  ve seçimi `localStorage`'a yazar. `TecofRender` runtime'ı + config `<script>`'ini
  otomatik kurar.
- **FOUC (yanlış-tema flaşı) yok:** `TecofRender` `<head>` üretmediği için, sıfır
  flaş isteyen host `<head>`'e `darkModeHeadScript(config)` çıktısını inline bir
  `<script>` olarak koyar (class'ı boyamadan önce ayarlar).
- **İlk şema:** `defaultMode` — `'system'` (OS'i takip eder, varsayılan), `'light'`
  veya `'dark'`. Ziyaretçinin kayıtlı seçimi her zaman kazanır.

Kendi `<head>`'ini kuran host'lar için ihraçlar: `initDarkMode(document)`,
`darkModeHeadScript(config)`, `deriveDarkColors(light)`, `DARK_MODE_STORAGE_KEY`.

---

## 8. Hızlı kontrol listesi

- [ ] Host `@theme`'de `--color-primary-50…950` tanımlı.
- [ ] `safelist: getSafelist()` host Tailwind config'ine eklendi (preset + tema renkleri + bp×state).
- [ ] Tema renkleri kullanılacaksa `generateCSSVariables(theme)` çıktısı (`--theme-color-*`) sayfaya dahil edildi.
- [ ] `@tecof/theme-editor/dist/styles.css` layout'a import edildi (editör chrome'u).
- [ ] Arbitrary değer kullanılacaksa `collectDocumentClasses(pageData)` ile dinamik safelist eklendi (§3b).
- [ ] `TecofRender` ile üretim render'ı, editörle aynı `compileStyles` akışını kullanıyor (otomatik).
- [ ] Karanlık mod isteniyorsa `config.darkMode` açıldı; sıfır flaş için `<head>`'e `darkModeHeadScript()` konuldu (§7).

---

İlgili kaynaklar: [`tokens.ts`](../src/studio/style/tokens.ts) ·
[`compileStyles.ts`](../src/studio/style/compileStyles.ts) ·
[`types.ts`](../src/studio/style/types.ts) · [ARCHITECTURE.md](../ARCHITECTURE.md)
