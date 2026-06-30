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
  states?: { hover: { bg: 'primary-700' } } // hover:/focus:/active:
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
döndürür (ör. `p-4`, `md:p-4`, `hover:bg-primary-700`, …). Böylece editörde
seçilebilen her preset üretimde kesinlikle bulunur.

### 3b. Arbitrary (custom) değerler → JIT taraması

Kullanıcı `p-[10px]`, `bg-[#ff0000]` gibi **serbest değerler** girebilir
(bkz. §4). Bunlar sonsuz olduğu için safelist'e sığmaz. Üretimde görünmeleri
için Tailwind'in **kaydedilmiş sayfa verisini taraması** gerekir. Önerilen yol:
derlenmiş class string'ini render'da basmak zaten yeterlidir **eğer** Tailwind
o çıktıyı bir kaynak olarak görüyorsa. Pratikte iki seçenek:

1. **Server render + content taraması:** Sayfa verisini build/runtime'da
   `compileStyles` ile string'e çevirip Tailwind `content`/`@source`'un
   gördüğü bir dosyaya/aşamaya dahil edin.
2. **Runtime/CDN Tailwind:** Tam dinamik senaryolarda Tailwind'i runtime'da
   çalıştırın (örn. bir CSS-in-JS köprüsü veya `@tailwindcss/browser`).

> Pragmatik öneri: Çoğu kullanım için **preset'ler + safelist** yeterlidir;
> arbitrary değeri yalnızca gerçekten gereken yerlerde açın ve §3b'yi planlayın.

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

---

## 6. Editör canvas'ında stiller nasıl görünür?

Canvas bir `<iframe>` içinde render edilir. `Frame` bileşeni host sayfasının
stylesheet'lerini iframe `<head>`'ine **artımlı olarak** kopyalar (link diff +
inline değişiklik-gated, rAF debounce). Dolayısıyla host'ta yüklü olan Tailwind
CSS (safelist dahil) editör canvas'ında da geçerlidir — yani editörde gördüğünüz
ile üretimde çıkan birebir aynıdır, **safelist doğru kurulduğu sürece**.

---

## 7. Hızlı kontrol listesi

- [ ] Host `@theme`'de `--color-primary-50…950` tanımlı.
- [ ] `safelist: getSafelist()` host Tailwind config'ine eklendi.
- [ ] `@tecof/theme-editor/dist/styles.css` layout'a import edildi (editör chrome'u).
- [ ] Arbitrary değer kullanılacaksa §3b stratejisi planlandı.
- [ ] `TecofRender` ile üretim render'ı, editörle aynı `compileStyles` akışını kullanıyor (otomatik).

---

İlgili kaynaklar: [`tokens.ts`](../src/studio/style/tokens.ts) ·
[`compileStyles.ts`](../src/studio/style/compileStyles.ts) ·
[`types.ts`](../src/studio/style/types.ts) · [ARCHITECTURE.md](../ARCHITECTURE.md)
