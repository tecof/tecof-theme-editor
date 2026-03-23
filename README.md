# @tecof/theme-editor

Tecof platform için Puck CMS tabanlı sayfa editörü ve render kütüphanesi. API client, context provider ve Puck wrapper bileşenleri içerir.

## Kurulum

```bash
npm install @tecof/theme-editor @puckeditor/core react react-dom
```

## Hızlı Başlangıç

### 1. Puck Config Oluştur

```tsx
// puck-config.tsx
import type { Config } from "@puckeditor/core";
import { Header } from "./components/puck/Header";
import { HeroSection } from "./components/puck/Hero";
import { Footer } from "./components/puck/Footer";

export const puckConfig: Config = {
  components: {
    Header,
    HeroSection,
    Footer,
  },
};
```

### 2. Editör Sayfası

```tsx
// app/editor/[slug]/page.tsx
"use client";

import { TecofProvider, TecofEditor } from "@tecof/theme-editor";
import "@tecof/theme-editor/styles.css";
import "@puckeditor/core/puck.css";
import { puckConfig } from "@/puck-config";

export default function EditorPage() {
  return (
    <TecofProvider
      apiUrl="https://api.example.com"
      accessToken="your-merchant-token"
      config={puckConfig}
    >
      <TecofEditor
        slug="home"
        onSave={(data) => console.log("Saved:", data)}
      />
    </TecofProvider>
  );
}
```

### 3. Public Sayfa (Render)

```tsx
// app/[slug]/page.tsx
import { TecofProvider, TecofRender } from "@tecof/theme-editor";
import { puckConfig } from "@/puck-config";

export default function PublicPage() {
  return (
    <TecofProvider
      apiUrl="https://api.example.com"
      accessToken="your-merchant-token"
      config={puckConfig}
    >
      <TecofRender slug="home" />
    </TecofProvider>
  );
}
```

Direkt data ile de render edebilirsiniz:

```tsx
<TecofRender data={puckData} />
```

## API

### `<TecofProvider />`

Tüm Tecof bileşenlerini sarar, API client ve Puck config context'i sağlar.

| Prop | Tip | Açıklama |
|------|-----|----------|
| `apiUrl` | `string` | Backend API base URL |
| `accessToken` | `string` | Merchant access token |
| `config` | `Config` | Puck component configuration |
| `children` | `ReactNode` | Alt bileşenler |

### `<TecofEditor />`

Puck `<Puck>` wrapper — sayfa editörü. Otomatik fetch/save ve iframe postMessage desteği.

| Prop | Tip | Açıklama |
|------|-----|----------|
| `slug` | `string` | Düzenlenecek sayfa slug'ı |
| `onSave` | `(data) => void` | Kayıt sonrası callback |
| `onPublish` | `(data) => void` | Yayınlama sonrası callback |
| `onChange` | `(data) => void` | Her değişiklikte callback |
| `overrides` | `object` | Puck UI override'ları |
| `plugins` | `any[]` | Ek Puck plugin'leri |
| `className` | `string` | CSS class |

### `<TecofRender />`

Puck `<Render>` wrapper — yayınlanmış sayfaları render eder.

| Prop | Tip | Açıklama |
|------|-----|----------|
| `slug` | `string` | Sayfa slug'ı (otomatik fetch) |
| `data` | `PuckPageData` | Direkt puck data (fetch yapmaz) |
| `fallback` | `ReactNode` | Yükleme sırasında gösterilecek bileşen |
| `className` | `string` | CSS class |

### `useTecof()`

Provider context'ine erişim hook'u:

```tsx
const { apiClient, config, accessToken, apiUrl } = useTecof();
```

### `TecofApiClient`

Standalone API client:

```tsx
import { TecofApiClient } from "@tecof/theme-editor";

const client = new TecofApiClient("https://api.example.com", "token");

// Sayfa draft'ını getir
const page = await client.getPage("home");

// Sayfa kaydet
await client.savePage("home", puckData);

// Yayınlanmış sayfayı getir
const published = await client.getPublishedPage("about");
```

### Utility Fonksiyonları

```tsx
import {
  getDefaultTheme,
  generateCSSVariables,
  mergeTheme,
  hexToHsl,
  hslToHex,
  lighten,
  darken,
} from "@tecof/theme-editor";
```

| Fonksiyon | Açıklama |
|-----------|----------|
| `getDefaultTheme()` | Varsayılan tema config'i döner |
| `generateCSSVariables(theme)` | ThemeConfig → CSS custom properties |
| `mergeTheme(base, overrides)` | Tema config deep-merge |
| `hexToHsl(hex)` | Hex → HSL dönüşümü |
| `hslToHex(h, s, l)` | HSL → Hex dönüşümü |
| `lighten(hex, amount)` | Rengi açar |
| `darken(hex, amount)` | Rengi koyulaştırır |

## iframe postMessage API

`TecofEditor` iframe içinde çalıştığında parent ile iletişim kurar:

```ts
// Parent → Editor
iframe.postMessage({ type: "puck:publish" }, "*");   // Kaydet
iframe.postMessage({ type: "puck:undo" }, "*");      // Geri al
iframe.postMessage({ type: "puck:redo" }, "*");      // Yinele
iframe.postMessage({ type: "puck:viewport", width: "375px" }, "*"); // Viewport

// Editor → Parent
window.addEventListener("message", (e) => {
  if (e.data.type === "puck:save") { /* değişiklik var */ }
  if (e.data.type === "puck:saved") { /* başarıyla kaydedildi */ }
});
```

## Backend API Endpoints

Kütüphane aşağıdaki endpoint'leri kullanır (`Authorization` header ile):

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/store/page/:slug` | Sayfa draft'ını getir |
| `PUT` | `/api/store/page/:slug` | Sayfa draft'ını kaydet |
| `GET` | `/api/store/published/:slug` | Yayınlanmış sayfayı getir |

## Geliştirme

```bash
npm run dev        # Watch mode
npm run build      # Production build
npm run lint       # ESLint
npm run test       # Vitest
```

## Lisans

MIT
