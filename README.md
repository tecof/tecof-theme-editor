# @tecof/theme-editor

Tecof temaları için görsel sayfa editörü (**Tecof Studio**), yayın renderer’ı, editör alanları, API istemcisi ve stil/tema motoru.

**Belgeler:** <https://tecof-app-dev.vercel.app/theme-editor> — tam başvuru (bileşen yapılandırması, alanlar, slotlar, stil editörü, canlı tema, yayın render’ı, API istemcisi, iframe protokolü, izinler) ve canlı önizlemeler orada. AI asistanları için aynı içerik Markdown (`/theme-editor.md`), `llms.txt` ve doküman MCP sunucusu (`/api/mcp`) olarak da sunulur.

## Kurulum

```bash
npm install @tecof/theme-editor @tiptap/core @tiptap/pm @tiptap/react lucide-react
```

| Peer bağımlılık | Sürüm |
|---|---|
| `react`, `react-dom` | `^18 \|\| ^19` |
| `@tiptap/core`, `@tiptap/pm`, `@tiptap/react` | `^3` |
| `lucide-react` | `>=0.408.0 <2` |

Editörün çalıştığı layout’ta stilleri bir kez içe aktarın:

```tsx
import "@tecof/theme-editor/styles.css";
```

> `0.0.x` sürümlerde `^0.0.96` yalnız `0.0.96`’yı kabul eder; yükseltmek için sürümü `package.json`’da elle değiştirin.

## Kısa kullanım

```tsx
// Provider — API istemcisini alt bileşenlere taşır
import { TecofProvider } from "@tecof/theme-editor";

<TecofProvider
  apiUrl={process.env.NEXT_PUBLIC_BASE_URL!}
  secretKey={process.env.NEXT_PUBLIC_MERCHANT_SECRET_KEY!}
  cdnUrl={process.env.NEXT_PUBLIC_CDN_URL}
  themeId={process.env.NEXT_PUBLIC_THEME_ID}
>
  {children}
</TecofProvider>;
```

```tsx
// Bileşen kaydı — editör ve yayın AYNI config'i kullanır
import { defineSection, type StudioConfig } from "@tecof/theme-editor";

const Hero = defineSection({
  label: "Hero",
  fields: { title: { type: "text", label: "Başlık" } },
  slots: { actions: { label: "Butonlar", layout: "row-wrap", gap: "md" } },
  defaultProps: { title: "Yeni sezon" },
  render: (p, slots) => (
    <section className="py-24 text-center">
      <h1>{p.title}</h1>
      {slots.actions}
    </section>
  ),
});

export const editorConfig: StudioConfig = { components: { Hero } };
```

```tsx
// Editör sayfası (istemci bileşeni). Panel editörü iframe'de ?token=<JWT> ile açar.
"use client";
import { TecofEditor } from "@tecof/theme-editor";

<TecofEditor pageId={pageId} config={editorConfig} accessToken={token} hostOrigin="https://app.tecof.com" />;
```

```tsx
// Yayın sayfası — TecofRender veri getirmez; stil CSS'ini, tema değişkenlerini ve fontları kendisi basar
import { TecofRender } from "@tecof/theme-editor";

<TecofRender data={pageData} config={editorConfig} cmsData={cmsData} />;
```

## Giriş noktaları

| Giriş | İçerik |
|---|---|
| `@tecof/theme-editor` | `TecofProvider`, `TecofEditor` / `TecofStudio`, `TecofRender`, `TecofPicture`, `Slot`, `TecofRoot`, `defineSection` / `defineElement`, `create*Field` fabrikaları, `TecofApiClient`, stil/tema yardımcıları, tipler |
| `@tecof/theme-editor/styles.css` | Editör ve alan stilleri (`./puck.css`, `./dist/styles.css` eski takma adlar) |
| `@tecof/theme-editor/email` | E-posta doküman modeli ve HTML render’ı |
| `@tecof/theme-editor/under-construction` | Yapım aşaması sayfası |

## Bilinmesi gerekenler

- Her bileşen `props.className`’i **kök DOM elemanına** basmalıdır; basmazsa editörde seçilemez (`defineSection` bunu otomatik yapar).
- Stil editörünün kırılımları **masaüstü önceliklidir** (`max-width`); `TecofRender` CSS’i kendisi üretir. Studio sınıflarını temanın Tailwind safelist’ine eklemeyin.
- Editör yalnız taslağı (`draftData`) yazar; yayınlama panel/backend işidir.
- Gömülü kullanımda `hostOrigin` verin.

Ayrıntılar ve sorun giderme: <https://tecof-app-dev.vercel.app/editor-troubleshooting>.

## Geliştirme

```bash
npm run dev        # tsup --watch
npm run build      # paket + email girişi + birleşik styles.css
npm run lint
npx vitest run     # testler (src/**/__tests__)
```

Belgeler bu depoda tutulmaz; `tecof-app-dev` deposunda (`src/content/theme-editor.md`, `editor-*.md`) güncellenir. Mimari notlar: [ARCHITECTURE.md](ARCHITECTURE.md).

## Lisans

MIT © Tecof
