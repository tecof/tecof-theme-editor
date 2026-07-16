import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Blocks,
  BookOpen,
  Bot,
  Box,
  Braces,
  Check,
  ChevronRight,
  CircleHelp,
  Command,
  Component,
  Copy,
  Database,
  ExternalLink,
  FileCode2,
  FileJson,
  FileText,
  GitBranch,
  Globe2,
  Keyboard,
  Layers3,
  Menu,
  MonitorSmartphone,
  Moon,
  PackageCheck,
  Palette,
  PanelLeftClose,
  Play,
  Plug,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  SwatchBook,
  X,
  Zap,
} from 'lucide-react';
import './docs.css';

type TocItem = { id: string; label: string };
type DocPage = {
  slug: string;
  group: string;
  title: string;
  navTitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  toc: TocItem[];
  keywords: string[];
  content: React.ReactNode;
};

const codeSamples = {
  install: `npm install @tecof/theme-editor react react-dom`,
  provider: `import { TecofProvider } from "@tecof/theme-editor";
import "@tecof/theme-editor/styles.css";

export function AppProviders({ children }) {
  return (
    <TecofProvider
      apiUrl={process.env.NEXT_PUBLIC_TECOF_API_URL!}
      secretKey={process.env.NEXT_PUBLIC_TECOF_SECRET_KEY!}
      cdnUrl={process.env.NEXT_PUBLIC_TECOF_CDN_URL}
    >
      {children}
    </TecofProvider>
  );
}`,
  editor: `"use client";

import { TecofEditor } from "@tecof/theme-editor";
import { editorConfig } from "@/lib/tecof-config";

export default function EditorPage({ params }) {
  return (
    <TecofEditor
      pageId={params.id}
      config={editorConfig}
      autoSave
      autoSaveDelay={2000}
      warnOnUnsavedChanges
      onSave={(data) => console.log("Kaydedildi", data)}
    />
  );
}`,
  basicConfig: `import type { StudioConfig } from "@tecof/theme-editor";

export const editorConfig: StudioConfig = {
  categories: {
    layout: { title: "Düzen", components: ["Container", "Grid"] },
    content: { title: "İçerik", components: ["Hero", "Text", "Button"] },
  },
  components: {
    Hero: {
      label: "Hero",
      category: "content",
      fields: {
        title: { type: "text", label: "Başlık" },
        description: { type: "textarea", label: "Açıklama" },
      },
      defaultProps: {
        title: "Yeni nesil mağazanızı oluşturun",
        description: "İçeriğinizi görsel olarak yönetin.",
      },
      render: ({ title, description }) => (
        <section className="py-24 text-center">
          <h1 className="text-5xl font-bold">{title}</h1>
          <p className="mt-5 text-lg text-zinc-600">{description}</p>
        </section>
      ),
    },
  },
};`,
  render: `import { TecofApiClient, TecofRender } from "@tecof/theme-editor";
import { editorConfig } from "@/lib/tecof-config";

const client = new TecofApiClient(
  process.env.TECOF_API_URL!,
  process.env.TECOF_SECRET_KEY!
);

export default async function StorePage({ params }) {
  const response = await client.getPublishedPage(params.slug, "tr");
  if (!response.success || !response.data) return null;

  return (
    <TecofRender
      data={response.data.draftData}
      config={editorConfig}
    />
  );
}`,
  slot: `const Grid = {
  label: "Kolonlar",
  acceptsChildren: true,
  fields: {
    columns: {
      type: "slot",
      label: "Kolon içeriği",
      orientation: "horizontal",
    },
  },
  render: ({ puck }) => (
    <div className="grid gap-6 md:grid-cols-3">
      {puck.renderDropZone({
        zone: "columns",
        orientation: "horizontal",
      })}
    </div>
  ),
};`,
  sliderSlot: `const Slider = {
  label: "Slider",
  acceptsChildren: true,
  fields: {
    slides: {
      type: "slot",
      label: "Slaytlar",
      orientation: "horizontal",
    },
  },
  render: ({ puck, editMode, className }) => (
    <section className={className}>
      {puck.renderDropZone({
        zone: "slides",
        orientation: "horizontal",
        // Editörde slaytlar yan yana, sarmalı ve tamamı seçilebilir.
        // Yayında aynı zone yatay scroll-snap carousel'e dönüşür.
        className: editMode
          ? "gap-4"
          : "snap-x snap-mandatory overflow-x-auto gap-4",
        style: editMode ? undefined : { flexWrap: "nowrap" },
      })}
    </section>
  ),
};

const Slide = {
  label: "Slayt",
  allowedParents: ["Slider"],   // yalnızca Slider içine bırakılabilir
  fields: {
    image: createUploadField({ label: "Görsel" }),
    caption: { type: "text", label: "Başlık" },
  },
  render: ({ image, caption, className }) => (
    <figure className={\`w-80 shrink-0 snap-center \${className ?? ""}\`}>
      <TecofPicture data={image} alt={caption ?? ""} size="large" />
      {caption && (
        <figcaption className="mt-2 text-sm">{caption}</figcaption>
      )}
    </figure>
  ),
};`,
  repeatZone: `const ProductGrid = {
  label: "Ürün Izgarası",
  fields: {
    // Veri kaynağı: repeater satırları (veya API — aşağıya bakın)
    items: createRepeaterField({
      label: "Ürünler",
      subFields: {
        name: { type: "text", label: "Ad" },
        price: { type: "text", label: "Fiyat" },
        image: createUploadField({ label: "Görsel", allowMultiple: false }),
      },
    }),
    // Bu slot 'items' dizisi için TEKRARLANIR: kart bir kez tasarlanır,
    // her satır için render edilir.
    card: {
      type: "slot",
      label: "Kart şablonu",
      orientation: "horizontal",
      repeatSource: "items",
    },
  },
  render: ({ card, className }) => (
    <section className={className}>{card}</section>
  ),
};

// Şablondaki elementlerin prop'ları satıra token'la bağlanır:
//   Text.text  = "{{ item.name }}"            → ham değer
//   Text.text  = "Fiyat: {{ item.price }} TL" → string enterpolasyon
//   Image.data = "{{ item.image }}"           → görsel nesnesi bozulmadan geçer

// ── API kaynağı (çoklu / harici) ──
const ApiProductGrid = {
  label: "API Ürünleri",
  fields: {
    card: {
      type: "slot",
      label: "Kart şablonu",
      // Satırlar render anında geldiği için bağlanabilir alanları bildirin:
      itemSchema: [
        { key: "name",  label: "Ürün Adı", type: "text" },
        { key: "price", label: "Fiyat",    type: "text" },
        { key: "image", label: "Görsel",   type: "image" },
      ],
    },
  },
  render: ({ puck }) => {
    const { rows } = useMyProducts(); // host'un kendi fetch'i
    return puck.renderDropZone({ zone: "card", repeatItems: rows });
  },
};

// Şablon bileşeni içinde satıra programatik erişim:
//   const repeat = useRepeatItem(); // { item, index, count } | null`,
  fields: `import {
  createLanguageField,
  createEditorField,
  createUploadField,
  createLinkField,
  createColorField,
  createCodeEditorField,
} from "@tecof/theme-editor";

fields: {
  title: createLanguageField({ label: "Başlık" }),
  content: createEditorField({ label: "İçerik" }),
  gallery: createUploadField({
    label: "Galeri",
    allowMultiple: true,
    maxFiles: 8,
  }),
  link: createLinkField({ label: "Bağlantı", showTarget: true }),
  color: createColorField({ label: "Vurgu", showOpacity: true }),
  code: createCodeEditorField({
    label: "Özel kod",
    defaultLanguage: "html",
  }),
}`,
  cms: `// Metin alanında CMS bağlama butonu varsayılan olarak açıktır.
fields: {
  title: { type: "text", label: "Başlık", bindable: true },
  staticText: { type: "text", label: "Sabit metin", bindable: false },
}

// Kaydedilen token:
"{{ data.product_name }}"

// CMS şablonunu render ederken:
<TecofRender data={pageData} config={config} cmsData={product} />`,
  template: `templates: [
  {
    id: "hero-cta",
    label: "Hero + İki Aksiyon",
    category: "Dönüşüm",
    thumbnail: "/templates/hero-cta.webp",
    payload: {
      node: {
        type: "Hero",
        props: { id: "tpl-hero", title: "Başlık" },
      },
      zones: {
        "tpl-hero:actions": [
          { type: "Button", props: { id: "tpl-a", text: "Başla" } },
          { type: "Button", props: { id: "tpl-b", text: "İncele" } },
        ],
      },
    },
  },
]`,
  tailwind: `/* app.css — Tailwind CSS v4 */
@import "tailwindcss";

@theme {
  --color-primary-50:  #faffe4;
  --color-primary-100: #f2ffc5;
  --color-primary-200: #e3ff92;
  --color-primary-300: #ceff53;
  --color-primary-400: #b6fb20;
  --color-primary-500: #9ae600;
  --color-primary-600: #74b500;
  --color-primary-700: #588902;
  --color-primary-800: #476c08;
  --color-primary-900: #3c5b0c;
  --color-primary-950: #1d3300;
}`,
  safelist: `import {
  getSafelist,
  collectDocumentClasses,
} from "@tecof/theme-editor";

export default {
  safelist: [
    ...getSafelist(),
    ...savedPages.flatMap((page) =>
      collectDocumentClasses(page.draftData)
    ),
  ],
};`,
  theme: `import {
  generateCSSVariables,
  getDefaultTheme,
  mergeTheme,
} from "@tecof/theme-editor";

const theme = mergeTheme(getDefaultTheme(), {
  colors: {
    primary: "#74b500",
    background: "#ffffff",
    foreground: "#18181b",
  },
});

const cssVariables = generateCSSVariables(theme);`,
  api: `import { TecofApiClient } from "@tecof/theme-editor";

const client = new TecofApiClient(
  "https://api.example.com",
  "merchant-secret-key",
  "https://cdn.example.com"
);

const page = await client.getPage("page-id");
const uploads = await client.getUploads(1, 50);
const published = await client.getPublishedPage("anasayfa", "tr");`,
  iframe: `// Parent → Editor
iframe.contentWindow?.postMessage(
  { type: "puck:save" },
  "https://editor.example.com"
);

// Editor → Parent
window.addEventListener("message", (event) => {
  if (event.origin !== "https://editor.example.com") return;

  if (event.data.type === "puck:saved") {
    console.log("Güncel draft:", event.data.data);
  }
});`,
  migration: `const editorConfig = {
  components,
  migrations: {
    version: 3,
    renameComponents: {
      OldHero: "Hero",
    },
    transformProps: {
      Hero: (props) => ({
        ...props,
        eyebrow: props.eyebrow ?? "",
      }),
    },
  },
};`,
  mcpLocal: `// .mcp.json — repo kökünde hazır gelir (project-level MCP)
{
  "mcpServers": {
    "tecof-theme-editor-docs": {
      "command": "node",
      "args": ["mcp/server.mjs"]
    }
  }
}

// Absolute path isteyen client'larda:
{
  "mcpServers": {
    "tecof-theme-editor-docs": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/tecof-theme-editor/mcp/server.mjs"]
    }
  }
}`,
  mcpPrepare: `npm install
npm run docs:ai   # mcp-manifest.json + llms.txt üretir
npm run build     # dist/index.d.ts → tip araçları için gerekli`,
  mcpFlow: `// Önerilen ajan akışı:
// 1. Konuyu ara
search_tecof_docs({ query: "safelist arbitrary" })

// 2. İlgili kaynağı tam oku
read_tecof_doc({ slug: "tailwind" })

// 3. API uydurma — gerçek tip bildirimini doğrula
list_exported_types({})
read_type_definition({ name: "StudioConfig" })`,
  permissions: `const config = {
  permissions: {
    drag: true,
    delete: true,
    duplicate: true,
    edit: true,
  },
  components: {
    Header: {
      permissions: { delete: false, drag: false },
      resolvePermissions: (props) => ({
        edit: !props.locked,
      }),
      // ...
    },
  },
};`,
};

const logoUrl = new URL('./logo.svg', import.meta.url).href;
const whiteLogoUrl = new URL('./tecof-logo-white.svg', import.meta.url).href;

function CodeBlock({
  code,
  language = 'tsx',
  title,
}: {
  code: string;
  language?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-zinc-800 bg-[#101411] shadow-[0_16px_50px_-28px_rgba(0,0,0,.8)]">
      <div className="flex h-11 items-center justify-between border-b border-white/8 px-4">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#ffd43b]" />
          <div className="h-2.5 w-2.5 rounded-full bg-primary-500" />
          <span className="ml-2 font-mono text-[11px] text-zinc-500">{title || language}</span>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-400 transition hover:bg-white/8 hover:text-white"
        >
          {copied ? <Check size={13} className="text-primary-400" /> : <Copy size={13} />}
          {copied ? 'Kopyalandı' : 'Kopyala'}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 text-[13px] leading-6 text-zinc-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: 'info' | 'success' | 'warning';
  title: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: 'border-sky-200 bg-sky-50/70 text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100',
    success:
      'border-primary-200 bg-primary-50/80 text-primary-950 dark:border-primary-900 dark:bg-primary-950/50 dark:text-primary-100',
    warning:
      'border-amber-200 bg-amber-50/80 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
  };
  const Icon = type === 'warning' ? CircleHelp : type === 'success' ? Check : Sparkles;

  return (
    <div className={`my-6 flex gap-3 rounded-xl border p-4 text-sm leading-6 ${styles[type]}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div>
        <div className="font-semibold">{title}</div>
        <div className="mt-0.5 opacity-80">{children}</div>
      </div>
    </div>
  );
}

function PropsTable({
  rows,
}: {
  rows: Array<[string, string, string, string?]>;
}) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-zinc-50 text-xs text-zinc-500 dark:bg-zinc-900/80 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3 font-semibold">Alan</th>
            <th className="px-4 py-3 font-semibold">Tip</th>
            <th className="px-4 py-3 font-semibold">Açıklama</th>
            <th className="px-4 py-3 font-semibold">Varsayılan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {rows.map(([name, type, description, defaultValue]) => (
            <tr key={name} className="bg-white dark:bg-[#101310]">
              <td className="px-4 py-3 font-mono text-xs font-semibold text-primary-700 dark:text-primary-400">
                {name}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">{type}</td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{description}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-500">{defaultValue || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeatureGrid({
  items,
}: {
  items: Array<{
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    text: string;
  }>;
}) {
  return (
    <div className="my-7 grid gap-3 sm:grid-cols-2">
      {items.map(({ icon: Icon, title, text }) => (
        <div
          key={title}
          className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-primary-300 hover:shadow-sm dark:border-zinc-800 dark:bg-[#101310] dark:hover:border-primary-800"
        >
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-400">
            <Icon size={16} />
          </div>
          <h3 className="m-0 text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
          <p className="mt-1.5 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{text}</p>
        </div>
      ))}
    </div>
  );
}

const pages: DocPage[] = [
  {
    slug: 'giris',
    group: 'Başlangıç',
    title: 'Tecof Theme Editor',
    navTitle: 'Genel bakış',
    description:
      'React tabanlı görsel sayfa editörü, yayın renderer’ı ve içerik alanları için Türkçe geliştirici rehberi.',
    icon: BookOpen,
    keywords: ['giriş', 'nedir', 'studio', 'özellikler', 'başlangıç'],
    toc: [
      { id: 'nedir', label: 'Nedir?' },
      { id: 'neler-sunar', label: 'Neler sunar?' },
      { id: 'mimari', label: 'Mimari yaklaşım' },
      { id: 'sonraki-adim', label: 'Sonraki adım' },
    ],
    content: (
      <>
        <section id="nedir">
          <h2>Tecof Theme Editor nedir?</h2>
          <p>
            <strong>@tecof/theme-editor</strong>, mağaza ve içerik sayfalarını kod yazmadan
            düzenlemek için geliştirilmiş bir React kütüphanesidir. Paket; görsel Studio
            editörünü, kaydedilmiş sayfaları yayınlayan render motorunu, API istemcisini ve
            gelişmiş form alanlarını tek bir sözleşme altında toplar.
          </p>
          <Callout type="success" title="Güncel paket">
            Bu rehber repodaki <strong>0.0.45</strong> sürümünün gerçek API ve özellikleri
            esas alınarak hazırlanmıştır.
          </Callout>
        </section>
        <section id="neler-sunar">
          <h2>Neler sunar?</h2>
          <FeatureGrid
            items={[
              {
                icon: Blocks,
                title: 'Görsel Studio',
                text: 'Iframe canvas, sürükle-bırak, katmanlar, inspector ve canlı önizleme.',
              },
              {
                icon: Palette,
                title: 'Stil ve tema',
                text: 'Tailwind token’ları, responsive varyantlar ve canlı CSS değişkenleri.',
              },
              {
                icon: Globe2,
                title: 'Çoklu dil',
                text: 'Merchant dilleri, toplu doldurma ve API destekli otomatik çeviri.',
              },
              {
                icon: Database,
                title: 'CMS bağlama',
                text: 'Metin token’ları, koleksiyon eşleme ve kayıt bazlı şablon render’ı.',
              },
              {
                icon: ShieldCheck,
                title: 'Kontrollü düzenleme',
                text: 'Global, bileşen ve dinamik node izinleriyle güvenli editör deneyimi.',
              },
              {
                icon: Zap,
                title: 'Üretim odaklı',
                text: 'Lazy chunk’lar, node error boundary, migration ve autosave desteği.',
              },
            ]}
          />
        </section>
        <section id="mimari">
          <h2>Mimari yaklaşım</h2>
          <p>
            Studio ile yayın renderer’ı aynı <code>StudioConfig</code> ve aynı sayfa veri
            modelini kullanır. Editörde gördüğünüz bileşenler üretimde yeniden yorumlanmaz;
            aynı component registry üzerinden render edilir. Böylece editör ile canlı sayfa
            arasındaki görsel sapma azalır.
          </p>
          <div className="my-6 grid gap-2 text-sm sm:grid-cols-3">
            {[
              ['1', 'StudioConfig', 'Bileşenler ve alanlar'],
              ['2', 'PuckPageData', 'İçerik ve zone ağacı'],
              ['3', 'TecofRender', 'Yayın çıktısı'],
            ].map(([number, title, text]) => (
              <div
                key={number}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <span className="text-xs font-bold text-primary-700 dark:text-primary-400">
                  0{number}
                </span>
                <div className="mt-2 font-semibold text-zinc-900 dark:text-white">{title}</div>
                <div className="mt-1 text-zinc-500">{text}</div>
              </div>
            ))}
          </div>
        </section>
        <section id="sonraki-adim">
          <h2>Sonraki adım</h2>
          <p>
            İlk entegrasyon için kurulum sayfasından başlayın. Yaklaşık üç dosyalık bir
            düzenleme ile provider, editör ve public renderer akışını çalıştırabilirsiniz.
          </p>
        </section>
      </>
    ),
  },
  {
    slug: 'kurulum',
    group: 'Başlangıç',
    title: 'Kurulum',
    navTitle: 'Kurulum',
    description: 'Paketi yükleyin, stil dosyasını ekleyin ve uygulamanızı TecofProvider ile sarın.',
    icon: PackageCheck,
    keywords: ['npm', 'install', 'provider', 'css', 'gereksinim'],
    toc: [
      { id: 'gereksinimler', label: 'Gereksinimler' },
      { id: 'paketi-yukle', label: 'Paketi yükle' },
      { id: 'provider', label: 'Provider kurulumu' },
      { id: 'ortam-degiskenleri', label: 'Ortam değişkenleri' },
    ],
    content: (
      <>
        <section id="gereksinimler">
          <h2>Gereksinimler</h2>
          <p>
            Paket React 18 veya 19 ile çalışır. Zengin metin alanı için TipTap paketleri peer
            dependency olarak beklenir. Next.js kullanıyorsanız editörün bulunduğu bileşeni
            client component olarak işaretleyin.
          </p>
          <PropsTable
            rows={[
              ['react', '^18 veya ^19', 'UI çalışma zamanı', '—'],
              ['react-dom', '^18 veya ^19', 'DOM renderer', '—'],
              ['@tiptap/*', '^3', 'EditorField için zengin metin altyapısı', '—'],
              ['Tailwind CSS', 'v4 önerilir', 'Görsel stil editörünün ürettiği class’lar', '—'],
            ]}
          />
        </section>
        <section id="paketi-yukle">
          <h2>Paketi yükleyin</h2>
          <CodeBlock code={codeSamples.install} language="bash" title="Terminal" />
          <p>
            Studio ve tüm custom field stilleri tek CSS dosyasında dağıtılır. Uygulamanızın
            ana layout dosyasında bir kez import etmeniz yeterlidir.
          </p>
          <CodeBlock
            code={`import "@tecof/theme-editor/styles.css";`}
            language="tsx"
            title="app/layout.tsx"
          />
        </section>
        <section id="provider">
          <h2>Provider kurulumu</h2>
          <p>
            <code>TecofProvider</code> API istemcisini ve medya CDN adresini alt bileşenlere
            taşır. Editör veya API kullanan tüm sayfalar provider altında olmalıdır.
          </p>
          <CodeBlock code={codeSamples.provider} title="providers.tsx" />
        </section>
        <section id="ortam-degiskenleri">
          <h2>Ortam değişkenleri</h2>
          <CodeBlock
            code={`NEXT_PUBLIC_TECOF_API_URL=https://api.example.com
NEXT_PUBLIC_TECOF_SECRET_KEY=merchant-secret
NEXT_PUBLIC_TECOF_CDN_URL=https://cdn.example.com`}
            language="dotenv"
            title=".env.local"
          />
          <Callout type="warning" title="Anahtar güvenliği">
            Mevcut client entegrasyonu <code>x-secret-key</code> kullanır. Üretimde anahtarın
            tarayıcıya açılma modelini backend yetkilendirme politikanızla birlikte
            değerlendirin; mümkünse editör rotasını kimlik doğrulama arkasında tutun.
          </Callout>
        </section>
      </>
    ),
  },
  {
    slug: 'hizli-baslangic',
    group: 'Başlangıç',
    title: 'Hızlı başlangıç',
    navTitle: 'Hızlı başlangıç',
    description: 'İlk component registry’nizi oluşturun, editörü açın ve public sayfayı render edin.',
    icon: Play,
    keywords: ['quick start', 'config', 'editor', 'render', 'ilk sayfa'],
    toc: [
      { id: 'config-olustur', label: 'Config oluştur' },
      { id: 'editoru-ac', label: 'Editörü aç' },
      { id: 'sayfayi-yayinla', label: 'Sayfayı render et' },
      { id: 'veri-akisi', label: 'Veri akışı' },
    ],
    content: (
      <>
        <section id="config-olustur">
          <h2>1. Component config oluşturun</h2>
          <p>
            Config, Studio’nun hangi blokları göstereceğini, bu blokların hangi alanlarla
            düzenleneceğini ve nasıl render edileceğini tanımlar.
          </p>
          <CodeBlock code={codeSamples.basicConfig} title="lib/tecof-config.tsx" />
        </section>
        <section id="editoru-ac">
          <h2>2. Editörü açın</h2>
          <p>
            <code>pageId</code> backend’deki draft kaydını işaret eder. Studio sayfayı otomatik
            getirir, değişiklikleri history’ye yazar ve kaydetme sırasında aynı endpoint’e PUT
            isteği gönderir.
          </p>
          <CodeBlock code={codeSamples.editor} title="app/editor/[id]/page.tsx" />
        </section>
        <section id="sayfayi-yayinla">
          <h2>3. Public sayfayı render edin</h2>
          <CodeBlock code={codeSamples.render} title="app/[slug]/page.tsx" />
        </section>
        <section id="veri-akisi">
          <h2>Veri akışı</h2>
          <div className="my-6 flex flex-col gap-2 sm:flex-row sm:items-center">
            {['API draft', 'TecofStudio', 'Kaydet', 'TecofRender'].map((item, index) => (
              <React.Fragment key={item}>
                <div className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-900">
                  {item}
                </div>
                {index < 3 && (
                  <ArrowRight className="mx-auto rotate-90 text-zinc-300 sm:rotate-0" size={16} />
                )}
              </React.Fragment>
            ))}
          </div>
          <Callout type="info" title="Tek config ilkesi">
            Editör ve public renderer için aynı config’i kullanın. Farklı registry’ler, kaydedilmiş
            bir component type’ın yayın tarafında bulunamamasına neden olur.
          </Callout>
        </section>
      </>
    ),
  },
  {
    slug: 'studio',
    group: 'Editör',
    title: 'Studio arayüzü',
    navTitle: 'Studio arayüzü',
    description: 'Canvas, paneller, seçili node akışı, önizleme modu ve autosave davranışını yönetin.',
    icon: MonitorSmartphone,
    keywords: ['canvas', 'inspector', 'panel', 'autosave', 'önizleme', 'drag drop'],
    toc: [
      { id: 'arayuz', label: 'Arayüz anatomisi' },
      { id: 'duzenleme', label: 'Düzenleme akışı' },
      { id: 'editor-proplari', label: 'Editor prop’ları' },
      { id: 'dayaniklilik', label: 'Dayanıklılık' },
    ],
    content: (
      <>
        <section id="arayuz">
          <h2>Arayüz anatomisi</h2>
          <FeatureGrid
            items={[
              {
                icon: PanelLeftClose,
                title: 'Sol panel',
                text: 'Blok kütüphanesi ve sayfanın hiyerarşik katman ağacı.',
              },
              {
                icon: MonitorSmartphone,
                title: 'Iframe canvas',
                text: 'Host CSS’inden izole, desktop/tablet/mobile genişliklerinde canlı sayfa.',
              },
              {
                icon: Settings2,
                title: 'Inspector',
                text: 'İçerik alanları, görsel stil kontrolleri ve global tema düzenleyici.',
              },
              {
                icon: Command,
                title: 'Komut paleti',
                text: '⌘K ile eylem arama, component ekleme ve klavye navigasyonu.',
              },
            ]}
          />
        </section>
        <section id="duzenleme">
          <h2>Düzenleme akışı</h2>
          <p>
            Düzenleme modunda node’lar seçilebilir; link ve buton etkileşimleri editör tarafından
            tutulur. Önizleme modunda editör çerçeveleri gizlenir ve sayfa gerçek ziyaretçi gibi
            kullanılabilir. Canvas içindeki <code>data-tecof-prop</code> işaretli metinlere çift
            tıklayarak inline düzenleme yapılabilir.
          </p>
          <ul>
            <li>Blokları sol panelden canvas veya zone içine sürükleyin.</li>
            <li>Katman ağacından seçin, yeniden sıralayın veya iç içe taşıyın.</li>
            <li>⌘/Ctrl ya da Shift + tık ile çoklu seçim yapın.</li>
            <li>Viewport kontrolünden desktop, tablet ve mobil sonucu sınayın.</li>
          </ul>
        </section>
        <section id="editor-proplari">
          <h2>TecofEditor prop’ları</h2>
          <PropsTable
            rows={[
              ['pageId', 'string', 'Düzenlenecek backend sayfa kimliği'],
              ['config', 'StudioConfig', 'Bileşen ve editör sözleşmesi'],
              ['accessToken', 'string?', 'Save isteğine Authorization header ekler'],
              ['hostOrigin', 'string?', 'postMessage hedef ve kaynak origin kısıtı'],
              ['autoSave', 'boolean?', 'Debounce sonrası otomatik draft kaydı', 'false'],
              ['autoSaveDelay', 'number?', 'Autosave bekleme süresi (ms)', '2000'],
              ['warnOnUnsavedChanges', 'boolean?', 'Kaydedilmemiş değişiklik uyarısı', 'true'],
              ['onChange', '(data) => void', 'Yaklaşık 300 ms debounce’lu değişiklik callback’i'],
              ['onSave', '(data) => void', 'Başarılı kayıt sonrası callback'],
              ['className', 'string?', 'Kök Studio elemanına ek class'],
            ]}
          />
        </section>
        <section id="dayaniklilik">
          <h2>Dayanıklılık ve performans</h2>
          <p>
            Bir component render sırasında hata verirse tüm canvas kapanmaz; node bazlı error
            boundary sadece ilgili bloğu izole eder. Monaco, TipTap ve FilePond gibi ağır alanlar
            ayrı bundle chunk’larında ihtiyaç anında yüklenir.
          </p>
          <Callout type="warning" title="Dokunmatik DnD">
            Editörün sürükle-bırak katmanı native HTML5 DnD kullanır. Dokunmatik cihazlarda tam
            edit düzenleme desteği mevcut yol haritasında olup, public renderer responsive
            çalışmaya devam eder.
          </Callout>
        </section>
      </>
    ),
  },
  {
    slug: 'bilesen-config',
    group: 'Editör',
    title: 'Bileşen yapılandırması',
    navTitle: 'Bileşen config’i',
    description: 'Component registry, kategoriler, varsayılan prop’lar ve dinamik alanları tanımlayın.',
    icon: Component,
    keywords: ['component config', 'fields', 'resolveFields', 'resolveData', 'category', 'inline'],
    toc: [
      { id: 'component-config', label: 'ComponentConfig' },
      { id: 'dinamik-alanlar', label: 'Dinamik alanlar' },
      { id: 'drop-kurallari', label: 'Drop kuralları' },
      { id: 'inline', label: 'Inline bileşenler' },
    ],
    content: (
      <>
        <section id="component-config">
          <h2>ComponentConfig</h2>
          <p>
            Registry anahtarı sayfa JSON’unda <code>type</code> olarak saklanır. Bu anahtarları
            değiştirmek veri migration’ı gerektirir. Render fonksiyonu dışındaki alanların çoğu
            opsiyoneldir.
          </p>
          <CodeBlock code={codeSamples.basicConfig} title="tecof-config.tsx" />
          <PropsTable
            rows={[
              ['label', 'string?', 'Blok kütüphanesindeki görünen ad'],
              ['category', 'string?', 'Bileşenin kategori anahtarı'],
              ['fields', 'Record<string, FieldConfig>', 'Inspector alanları'],
              ['defaultProps', 'object?', 'Yeni node oluşturulurken başlangıç değerleri'],
              ['render', '(props) => ReactNode', 'Editör ve yayında kullanılan render'],
              ['inline', 'boolean?', 'Editör wrapper’ını kaldırır', 'false'],
              ['resolveFields', 'function?', 'Prop’lara göre dinamik alan seti'],
              ['resolveData', 'function?', 'Türetilmiş prop ve read-only durumu'],
            ]}
          />
        </section>
        <section id="dinamik-alanlar">
          <h2>Dinamik alanlar ve türetilmiş veriler</h2>
          <p>
            <code>resolveFields</code>, örneğin link türü seçildiğinde yalnızca URL alanını
            göstermek için kullanılır. <code>resolveData</code> ise başlıktan slug üretmek ve
            slug alanını salt okunur yapmak gibi senaryolar içindir. Her ikisi sync veya async
            dönebilir; eski async sonuçlar otomatik olarak elenir.
          </p>
          <CodeBlock
            code={`ProductCard: {
  fields: {
    source: { type: "select", options: ["manual", "cms"] },
    title: { type: "text" },
  },
  resolveFields: (props, { fields }) => ({
    ...fields,
    ...(props.source === "cms"
      ? { productId: { type: "external", label: "Ürün" } }
      : {}),
  }),
  resolveData: (props) => ({
    props: { slug: slugify(props.title ?? "") },
    readOnly: { slug: true },
  }),
  render: (props) => <article>{props.title}</article>,
}`}
            title="Dinamik config"
          />
        </section>
        <section id="drop-kurallari">
          <h2>Drop kuralları</h2>
          <p>
            Motor seviyesindeki kurallar canvas ve katman panelinde birlikte uygulanır.
            <code>acceptsChildren</code> component’in child alıp almadığını,
            <code>maxItems</code> doğrudan child limitini, <code>allowedParents</code> ise hangi
            parent type’lar altına bırakılabileceğini belirler.
          </p>
        </section>
        <section id="inline">
          <h2>Inline bileşenler</h2>
          <p>
            Wrapper div layout’u bozuyorsa <code>inline: true</code> kullanın ve editörün verdiği
            <code>puck.dragRef</code> referansını component’in kök DOM elemanına bağlayın.
          </p>
          <CodeBlock
            code={`InlineButton: {
  inline: true,
  fields: { text: { type: "text" } },
  render: ({ puck, text }) => (
    <button ref={puck?.dragRef}>{text}</button>
  ),
}`}
          />
        </section>
      </>
    ),
  },
  {
    slug: 'alanlar',
    group: 'Editör',
    title: 'Alan bileşenleri',
    navTitle: 'Alan bileşenleri',
    description: 'Metin, medya, bağlantı, renk, kod, ikon, repeater ve external veri alanlarını kullanın.',
    icon: Braces,
    keywords: ['field', 'language', 'upload', 'link', 'color', 'editor', 'monaco', 'external'],
    toc: [
      { id: 'yerlesik', label: 'Yerleşik alanlar' },
      { id: 'gelismis', label: 'Gelişmiş alanlar' },
      { id: 'medya', label: 'Medya alanı' },
      { id: 'cms', label: 'CMS veri bağlama' },
    ],
    content: (
      <>
        <section id="yerlesik">
          <h2>Yerleşik alanlar</h2>
          <p>
            Config içinde doğrudan <code>text</code>, <code>textarea</code>, <code>select</code>,
            <code>number</code>, <code>boolean</code>, <code>toggle</code>, <code>range</code>,
            <code>radio</code>, <code>array</code>, <code>object</code> ve <code>slot</code>
            tiplerini kullanabilirsiniz.
          </p>
        </section>
        <section id="gelismis">
          <h2>Gelişmiş Tecof alanları</h2>
          <CodeBlock code={codeSamples.fields} title="component-fields.ts" />
          <PropsTable
            rows={[
              ['LanguageField', 'localized text', 'Merchant dilleri ve otomatik çeviri'],
              ['EditorField', 'rich text', 'TipTap tabanlı WYSIWYG editör'],
              ['UploadField', 'UploadedFile[]', 'Kütüphane, upload, referans ve görsel düzenleme'],
              ['LinkField', 'LinkFieldValue', 'Sayfa seçici veya manuel URL'],
              ['ColorField', 'hex', 'Hue, alpha, swatch, eyedropper ve geçmiş'],
              ['CodeEditorField', 'string', 'Monaco tabanlı kod editörü'],
              ['RepeaterField', 'array', 'Tekrarlanan veri satırları'],
              ['IconField', 'string/object', 'İkon seçimi'],
              ['ExternalField', 'any', 'Üçüncü taraf listeden aranabilir kayıt seçimi'],
              ['CmsCollectionField', 'binding object', 'Koleksiyon, limit, sort ve alan eşleme'],
            ]}
          />
        </section>
        <section id="medya">
          <h2>Medya alanı</h2>
          <p>
            UploadField tek veya çoklu dosya seçebilir. FilePond yüklemeyi, browser-image-compression
            istemci tarafı sıkıştırmayı, Doka ise kırpma/düzenlemeyi yönetir. Drawer; medya
            kütüphanesi, yeni yükleme ve dış referans sekmelerini birleştirir.
          </p>
          <CodeBlock
            code={`gallery: createUploadField({
  label: "Ürün galerisi",
  allowMultiple: true,
  maxFiles: 10,
  maxFileSize: "50MB",
  acceptedFileTypes: ["image/*"],
  folder: "/products",
  imageCompressionEnabled: true,
  allowReorder: true,
})`}
          />
        </section>
        <section id="cms">
          <h2>CMS veri bağlama</h2>
          <p>
            Text ve textarea alanlarında varsayılan olarak görünen bağlama butonu, CMS alanını
            <code>{'{{ data.shortcode }}'}</code> formatında kaydeder. Public render sırasında
            token, <code>cmsData</code> içindeki ham kayıtla çözülür.
          </p>
          <CodeBlock code={codeSamples.cms} title="CMS template" />
        </section>
      </>
    ),
  },
  {
    slug: 'slotlar-sablonlar',
    group: 'Editör',
    title: 'Slotlar ve şablonlar',
    navTitle: 'Slotlar & şablonlar',
    description: 'İç içe içerik bölgeleri oluşturun ve tekrar kullanılabilir bölüm şablonları sunun.',
    icon: Layers3,
    keywords: ['slot', 'zone', 'template', 'section', 'orientation', 'nested', 'slider', 'carousel', 'repeat', 'repeatSource', 'item', 'öğe şablonu', 'koleksiyon', 'ürün kartı'],
    toc: [
      { id: 'zone-modeli', label: 'Zone modeli' },
      { id: 'orientation', label: 'Dikey ve yatay slot' },
      { id: 'repeat-zone', label: 'Repeat zone (öğe şablonu)' },
      { id: 'slider-deseni', label: 'Slider / carousel deseni' },
      { id: 'sablonlar', label: 'Bölüm şablonları' },
      { id: 'id-guvenligi', label: 'ID güvenliği' },
    ],
    content: (
      <>
        <section id="zone-modeli">
          <h2>Zone modeli</h2>
          <p>
            Root node’lar <code>content</code> dizisinde, iç içe node’lar ise
            <code>zones</code> nesnesinde tutulur. Zone anahtarı
            <code>parentId:zoneName</code> formatındadır. Parent silindiğinde tüm alt zone ağacı
            recursive olarak temizlenir.
          </p>
        </section>
        <section id="orientation">
          <h2>Dikey ve yatay slotlar</h2>
          <p>
            Slotlar varsayılan olarak dikeydir. <code>{'orientation: "horizontal"'}</code> verildiğinde
            editör drop eksenini sol/sağ olarak hesaplar ve public render aynı düzeni korur.
          </p>
          <CodeBlock code={codeSamples.slot} title="Grid.tsx" />
        </section>
        <section id="repeat-zone">
          <h2>Repeat zone (öğe şablonu)</h2>
          <p>
            Bir slot alanına <code>repeatSource</code> verildiğinde slot bir <strong>öğe
            şablonuna</strong> dönüşür: kart bir kez elementlerle tasarlanır, veri
            listesindeki her satır için tekrarlanır (ürün ızgarası, koleksiyon listesi,
            SSS vb.). Şablondaki prop’lar satıra <code>{'{{ item.alan }}'}</code>{' '}
            token’larıyla bağlanır — metin alanlarındaki <code>{'{ }'}</code> bağlama
            butonu şablon içindeyken “Öğe alanları” bölümünü gösterir.
          </p>
          <CodeBlock code={codeSamples.repeatZone} title="ProductGrid.tsx" />
          <ul>
            <li>
              <strong>Tam token ham değer geçirir:</strong> <code>{'"{{ item.image }}"'}</code>{' '}
              görsel nesnesini bozmadan iletir; metne gömülü token string’e çevrilir.
              Özel yollar: <code>{'{{ item._index }}'}</code> (0 tabanlı),{' '}
              <code>{'{{ item._position }}'}</code> (1 tabanlı).
            </li>
            <li>
              <strong>Editörde</strong> şablon ilk satırın verisiyle bir kez düzenlenir;
              kalan satırlar etkileşimsiz, hafif soluk ghost kopyalar olarak aynı
              flex/grid akışında görünür.
            </li>
            <li>
              <strong>Yayında</strong> döngü gerçek veriyle döner; satır yoksa şablon hiç
              render edilmez — canlı sitede asla ham token görünmez.
            </li>
            <li>
              <code>{'{{ item.* }}'}</code> token’larını <code>{'{{ data.* }}'}</code>’dan
              farklı olarak <strong>kütüphane çözer</strong>; host tarafında ek iş gerekmez.
            </li>
          </ul>
          <Callout type="warning" title="Satır içi düzenleme">
            Canvas’ta bağlı bir metne çift tıklayıp düzenlemek token’ı literal değerle
            ezer ve bağı koparır. Bağlı alanları Inspector’dan düzenleyin — Inspector her
            zaman ham token’ı gösterir.
          </Callout>
        </section>
        <section id="slider-deseni">
          <h2>Slider / carousel deseni</h2>
          <p>
            Slider gibi bileşenlerde slaytlar ayrı bir bileşen olarak slot’a bırakılır.
            Kritik nokta <code>editMode</code> ayrımıdır: editörde tüm slaytlar yan yana
            görünüp sürükle-bırak almalı, yayında ise aynı zone kaydırılabilir bir
            carousel’e dönüşmelidir. <code>puck.renderDropZone</code> her iki tarafta da
            <code>className</code> ve <code>style</code> kabul ettiği için zone’un kendisini
            scroll container yapabilirsiniz.
          </p>
          <CodeBlock code={codeSamples.sliderSlot} title="Slider.tsx" />
          <ul>
            <li>
              <code>{'allowedParents: ["Slider"]'}</code> slaytın başka yere bırakılmasını,
              <code>maxItems</code> ise slayt sayısının aşılmasını engine seviyesinde engeller.
            </li>
            <li>
              <code>snap-*</code> class’ları slaytın kendi kökünde durur; yayında zone
              çocukları doğrudan render edildiği için scroll-snap birebir çalışır.
            </li>
            <li>
              Zone’un yatay flex düzeni <code>{'orientation: "horizontal"'}</code>’dan gelir;
              yayında <code>{'flexWrap: "nowrap"'}</code> style’ı sarmayı kapatıp tek satır
              carousel yapar.
            </li>
          </ul>
          <Callout type="warning" title="JS slider kütüphaneleri">
            Swiper/Embla gibi DOM’u klonlayan veya ölçen kütüphaneleri yalnızca
            <code>editMode === false</code> iken mount edin; editörde zone düz layout
            kalmalı ki seçim, overlay ve drop hedefleri doğru çalışsın. Çoğu senaryoda
            CSS scroll-snap yeterlidir ve iki taraf arasında görsel sapma üretmez.
          </Callout>
        </section>
        <section id="sablonlar">
          <h2>Bölüm şablonları</h2>
          <p>
            Şablonlar “Bölüm Ekle” penceresinde ayrı bir sekmede gösterilir. Tek node yerine
            çocuk zone’larıyla birlikte tam bir alt ağaç ekleyebilirler.
          </p>
          <CodeBlock code={codeSamples.template} title="tecof-config.tsx" />
        </section>
        <section id="id-guvenligi">
          <h2>ID güvenliği</h2>
          <p>
            Şablondaki id’ler yalnızca ilişki kurmak için örnek kimliklerdir. Studio, her eklemede
            kök ve tüm alt node’lar için yeni id üretir, zone anahtarlarını da buna göre yeniden
            yazar. Aynı şablonu güvenle birden fazla kez ekleyebilirsiniz.
          </p>
        </section>
      </>
    ),
  },
  {
    slug: 'tailwind-stil',
    group: 'Tasarım sistemi',
    title: 'Tailwind stil editörü',
    navTitle: 'Tailwind stil editörü',
    description: 'Token tabanlı responsive stilleri üretime güvenli şekilde derleyin ve safelist’i yönetin.',
    icon: SwatchBook,
    keywords: ['tailwind', 'style', 'safelist', 'breakpoint', 'hover', 'arbitrary', 'renk', 'color picker', 'palet'],
    toc: [
      { id: 'palet', label: 'Marka paleti' },
      { id: 'renk-sistemi', label: 'Renk sistemi' },
      { id: 'token-modeli', label: 'Token modeli' },
      { id: 'responsive', label: 'Responsive & state' },
      { id: 'safelist', label: 'Production safelist' },
    ],
    content: (
      <>
        <section id="palet">
          <h2>Tecof marka paleti</h2>
          <p>
            Host uygulamanın Tailwind v4 temasına Tecof primary skalasını ekleyin. Ana aksiyon
            rengi <code>primary-600</code>, hover rengi <code>primary-700</code> olarak
            kullanılmalıdır.
          </p>
          <CodeBlock code={codeSamples.tailwind} language="css" title="app.css" />
        </section>
        <section id="renk-sistemi">
          <h2>Renk sistemi</h2>
          <p>
            Arka plan, metin ve kenarlık rengi kontrolleri tek bir renk seçici panelinde dört
            kaynağı birleştirir. Hangi kaynağı seçtiğiniz, kaydedilen token’ı ve üretim
            gereksinimini belirler.
          </p>
          <PropsTable
            rows={[
              ['Tema renkleri', '[var(--theme-color-primary)]', 'Canlı tema CSS değişkenini referans eder; tema değişince sayfa da değişir', 'getSafelist()'],
              ['Marka (Primary)', 'primary-600', 'Host @theme’inde tanımlı --color-primary-* skalası', 'getSafelist()'],
              ['Tailwind paleti', 'red-500', '22 renk × 11 ton hazır Tailwind paleti (bg-red-500 gibi derlenir)', 'getSafelist()'],
              ['Özel renk', '[#ff6b00]', 'Color picker veya hex girişi; bg-[#ff6b00] olarak derlenir', 'collectDocumentClasses()'],
            ]}
          />
          <p>
            Tailwind paleti bölümünde önce renk (hue) noktasına, ardından 50–950 ton şeridinden
            tona tıklayın. Özel renk bölümündeki native color picker ile serbest bir renk seçebilir
            veya <code>#rrggbb</code> formatında hex yazabilirsiniz. Editör chrome’unda palet
            önizlemeleri host’un <code>--color-*</code> değişkenlerini okur; değişken yoksa
            varsayılan Tailwind hex’ine düşer.
          </p>
          <Callout type="info" title="Preset ve özel renk farkı">
            Tema, marka ve Tailwind paleti seçimleri sonlu preset token’lardır ve
            <code>getSafelist()</code> ile otomatik güvence altındadır. Color picker’dan seçilen
            özel renkler arbitrary değer olarak kaydedilir; üretimde görünmeleri için
            <code>collectDocumentClasses()</code> akışı şarttır.
          </Callout>
        </section>
        <section id="token-modeli">
          <h2>Yapısal token modeli</h2>
          <p>
            Inspector’daki Stil sekmesi ham class string’i saklamaz. Değerler node’un
            <code>_tecofStyles</code> prop’unda breakpoint ve state katmanlarıyla tutulur,
            ardından <code>compileStyles</code> ile Tailwind class’larına çevrilir.
          </p>
          <CodeBlock
            code={`{
  base: { p: "4", bg: "primary-600", radius: "xl" },
  md: { p: "[40px]" },
  states: {
    hover: { bg: "primary-700" },
    "md:hover": { bg: "primary-800" },
  },
}

// p-4 bg-primary-600 rounded-xl
// md:p-[40px] hover:bg-primary-700 md:hover:bg-primary-800`}
            language="json"
          />
        </section>
        <section id="responsive">
          <h2>Responsive ve state varyantları</h2>
          <p>
            Base, sm, md, lg ve xl katmanlarına ek olarak hover, focus ve active durumları
            düzenlenebilir. Üst breakpoint’te değer yoksa inspector daha küçük katmandan gelen
            değeri soluk bir ipucu olarak gösterir. Serbest değerler
            <code>p-[10px]</code> veya <code>bg-[#ff0000]</code> biçiminde derlenir.
          </p>
        </section>
        <section id="safelist">
          <h2>Production safelist</h2>
          <p>
            Kaydedilmiş class’lar kaynak kodda görünmediğinden Tailwind tarayıcısı bunları
            otomatik bulamaz. Preset’ler için <code>getSafelist()</code>, kullanıcı tarafından
            girilen arbitrary değerler için <code>collectDocumentClasses()</code> kullanın.
          </p>
          <CodeBlock code={codeSamples.safelist} language="js" title="tailwind.config.js" />
          <Callout type="warning" title="Build zamanı verisi">
            Arbitrary değerleri eksiksiz toplamak için build sırasında yayınlanan veya taslak
            sayfa JSON’larına erişmeniz gerekir. Bu akış yoksa serbest değerleri kapatıp preset
            token’larla sınırlı kalın.
          </Callout>
        </section>
      </>
    ),
  },
  {
    slug: 'tema',
    group: 'Tasarım sistemi',
    title: 'Canlı tema',
    navTitle: 'Canlı tema',
    description: 'Renk, tipografi ve spacing token’larını Studio ile düzenleyin ve yayına taşıyın.',
    icon: Palette,
    keywords: ['theme', 'css variables', 'color', 'typography', 'spacing'],
    toc: [
      { id: 'tema-modeli', label: 'Tema modeli' },
      { id: 'studio-tema', label: 'Studio’da tema' },
      { id: 'yayin', label: 'Yayına uygulama' },
      { id: 'utility', label: 'Tema yardımcıları' },
    ],
    content: (
      <>
        <section id="tema-modeli">
          <h2>Tema modeli</h2>
          <p>
            <code>ThemeConfig</code>; semantik renkler, tipografi ve spacing değerlerinden oluşur.
            Tema sayfa verisinin <code>root.props._tecofTheme</code> alanında saklanır; bu nedenle
            kayıt, undo ve redo akışına dahildir.
          </p>
          <PropsTable
            rows={[
              ['colors', 'ThemeColors', 'Primary, background, foreground, card, border ve diğer semantik renkler'],
              ['typography', 'ThemeTypography', 'Font aileleri, ölçek, line-height ve ağırlıklar'],
              ['spacing', 'ThemeSpacing', 'Container, section padding, gap ve radius değerleri'],
              ['customTokens', 'Record<string,string>', 'Host’a özel ek CSS token’ları'],
            ]}
          />
        </section>
        <section id="studio-tema">
          <h2>Studio’da tema düzenleme</h2>
          <p>
            Seçili node yokken Inspector içindeki Tema sekmesi açılır. Değişiklikler
            <code>ThemeVars</code> tarafından hem Studio chrome’una hem canvas iframe’ine anında
            CSS değişkeni olarak uygulanır.
          </p>
        </section>
        <section id="yayin">
          <h2>Yayına uygulama</h2>
          <p>
            Public sayfanın aynı görünmesi için tema değişkenlerini root container veya
            <code>:root</code> üzerine ekleyin. Görsel stil editörünün “Tema · Ana renk” gibi
            seçenekleri bu değişkenleri referans eder.
          </p>
          <CodeBlock code={codeSamples.theme} title="theme.ts" />
        </section>
        <section id="utility">
          <h2>Tema yardımcıları</h2>
          <p>
            Paket ayrıca <code>hexToHsl</code>, <code>hslToHex</code>, <code>lighten</code> ve
            <code>darken</code> fonksiyonlarını export eder. Tema değerlerini programatik
            oluştururken bu yardımcıları kullanabilirsiniz.
          </p>
        </section>
      </>
    ),
  },
  {
    slug: 'render',
    group: 'Yayınlama',
    title: 'Public render',
    navTitle: 'Public render',
    description: 'Kaydedilmiş sayfaları, stilleri ve CMS verilerini üretim ortamında render edin.',
    icon: Globe2,
    keywords: ['render', 'public', 'published page', 'ssr', 'cmsData'],
    toc: [
      { id: 'temel-render', label: 'Temel kullanım' },
      { id: 'render-proplari', label: 'Render prop’ları' },
      { id: 'cms-render', label: 'CMS template' },
      { id: 'akilli-medya', label: 'TecofPicture' },
      { id: 'uyumluluk', label: 'Editör uyumluluğu' },
    ],
    content: (
      <>
        <section id="temel-render">
          <h2>Temel kullanım</h2>
          <p>
            <code>TecofRender</code> veri getirmez; önceden yüklenmiş
            <code>PuckPageData</code> alır. SSR veya server component içinde API client ile
            veriyi çekip renderer’a iletin.
          </p>
          <CodeBlock code={codeSamples.render} title="app/[slug]/page.tsx" />
        </section>
        <section id="render-proplari">
          <h2>Render prop’ları</h2>
          <PropsTable
            rows={[
              ['data', 'PuckPageData', 'Yayınlanacak content, root ve zones verisi'],
              ['config', 'StudioConfig', 'Editörle aynı component registry'],
              ['cmsData', 'Record<string, any>?', 'CMS şablon token’larının ham kaydı'],
              ['className', 'string?', 'Renderer root elementine ek class'],
            ]}
          />
        </section>
        <section id="cms-render">
          <h2>CMS template render</h2>
          <p>
            Bir sayfa ürün veya blog kaydı için şablonsa, kayıt nesnesini
            <code>cmsData</code> olarak geçin. Renderer metinlerdeki
            <code>{'{{ data.field }}'}</code> token’larını kayıt değerleriyle çözer.
          </p>
          <CodeBlock code={codeSamples.cms} title="CMS render" />
        </section>
        <section id="akilli-medya">
          <h2>Akıllı medya: TecofPicture</h2>
          <p>
            <code>TecofPicture</code>, <code>UploadedFile</code> kaydından doğru medya URL’ini
            seçer; görsel ve videoyu otomatik ayırt eder. Thumbnail, medium, large veya full
            varyantı kullanılabilir. Next.js Image gibi özel bir renderer
            <code>ImageComponent</code> üzerinden verilebilir.
          </p>
          <CodeBlock
            code={`import Image from "next/image";
import { TecofPicture } from "@tecof/theme-editor";

<TecofPicture
  data={uploadedFile}
  alt="Ürün görseli"
  size="large"
  ImageComponent={Image}
  imageProps={{ quality: 85, priority: true }}
  fancybox
  fancyboxName="product-gallery"
/>`}
            title="ProductImage.tsx"
          />
          <Callout type="info" title="Bakım modu">
            Mağaza yayınını geçici olarak kapatmak için paket, ayrı entrypoint üzerinden
            <code>UnderConstruction</code> bileşenini de sunar.
          </Callout>
        </section>
        <section id="uyumluluk">
          <h2>Editör ile görsel uyumluluk</h2>
          <p>
            Renderer, Studio ile aynı <code>compileStyles</code> yolunu kullanır. Ancak Tailwind
            safelist ve tema CSS değişkenlerinin host uygulamada bulunması sizin
            sorumluluğunuzdadır. Config, safelist ve tema üçlüsünü ortak modüllerden export etmek
            sapmaları azaltır.
          </p>
        </section>
      </>
    ),
  },
  {
    slug: 'api-client',
    group: 'Entegrasyon',
    title: 'API Client',
    navTitle: 'API Client',
    description: 'Sayfa, medya, merchant bilgisi ve çeviri endpoint’leriyle haberleşin.',
    icon: Plug,
    keywords: ['api', 'endpoint', 'savePage', 'getPage', 'upload', 'translate'],
    toc: [
      { id: 'client', label: 'Client oluşturma' },
      { id: 'metotlar', label: 'Metotlar' },
      { id: 'endpointler', label: 'Endpoint’ler' },
      { id: 'hata-yonetimi', label: 'Hata yönetimi' },
    ],
    content: (
      <>
        <section id="client">
          <h2>Client oluşturma</h2>
          <CodeBlock code={codeSamples.api} title="tecof-api.ts" />
          <p>
            Üçüncü constructor parametresi medya URL’leri için özel CDN adresidir. Verilmezse API
            base URL kullanılır.
          </p>
        </section>
        <section id="metotlar">
          <h2>Metotlar</h2>
          <PropsTable
            rows={[
              ['getPage(id)', 'Promise<ApiResponse>', 'Editör draft sayfasını getirir'],
              ['savePage(id, data)', 'Promise<ApiResponse>', 'Draft verisini kaydeder'],
              ['getPublishedPage(slug, locale?)', 'Promise<ApiResponse>', 'Yayınlanmış sayfayı getirir'],
              ['getMerchantInfo()', 'Promise<ApiResponse>', 'Diller ve mağaza ayarları'],
              ['uploadFile(file, folder?)', 'Promise<ApiResponse>', 'Multipart medya yükleme'],
              ['getUploads(page, limit)', 'Promise<ApiResponse>', 'Medya kütüphanesini listeler'],
              ['getPages()', 'Promise<ApiResponse>', 'LinkField için sayfa listesini getirir'],
              ['translate(...)', 'Promise<ApiResponse>', 'Metni hedef dillere çevirir'],
              ['getComponentPreview(...)', 'Promise<string|null>', 'Component önizleme blob URL’i'],
            ]}
          />
        </section>
        <section id="endpointler">
          <h2>Backend endpoint’leri</h2>
          <PropsTable
            rows={[
              ['GET', '/api/store/editor/:id', 'Draft getir'],
              ['PUT', '/api/store/editor/:id', 'Draft kaydet'],
              ['POST', '/api/store/render', 'Yayınlanmış sayfayı slug ile getir'],
              ['GET', '/api/store/merchant-info', 'Merchant dil ayarları'],
              ['POST', '/api/store/upload', 'Dosya yükle'],
              ['GET', '/api/store/uploads', 'Medya kütüphanesi'],
              ['GET', '/api/store/pages', 'Merchant sayfaları'],
              ['POST', '/api/store/translate', 'Çoklu dil çevirisi'],
            ]}
          />
        </section>
        <section id="hata-yonetimi">
          <h2>Hata yönetimi</h2>
          <p>
            Metotların çoğu ağ hatasını throw etmek yerine
            <code>{'{ success: false, message }'}</code> şekline dönüştürür. Sayfa yükleme
            sırasında kullanılan <code>AbortSignal</code> ise iptal edilen eski istekleri ayırt
            etmek için AbortError’ı yeniden fırlatır.
          </p>
        </section>
      </>
    ),
  },
  {
    slug: 'iframe',
    group: 'Entegrasyon',
    title: 'iframe entegrasyonu',
    navTitle: 'iframe & postMessage',
    description: 'Studio’yu başka bir panel içine gömün ve güvenli postMessage protokolünü kullanın.',
    icon: FileCode2,
    keywords: ['iframe', 'postmessage', 'hostOrigin', 'puck save', 'embed'],
    toc: [
      { id: 'protokol', label: 'Mesaj protokolü' },
      { id: 'parent-editor', label: 'Parent → Editor' },
      { id: 'editor-parent', label: 'Editor → Parent' },
      { id: 'guvenlik', label: 'Origin güvenliği' },
    ],
    content: (
      <>
        <section id="protokol">
          <h2>Mesaj protokolü</h2>
          <p>
            Geriye dönük uyumluluk nedeniyle mesaj tipleri <code>puck:</code> prefix’ini korur.
            Bu isimlendirme internal editör motorunun Puck olduğu anlamına gelmez; host
            uygulamalarının mevcut entegrasyonunu bozmayan stabil bir protokoldür.
          </p>
          <CodeBlock code={codeSamples.iframe} title="host.ts" />
        </section>
        <section id="parent-editor">
          <h2>Parent → Editor</h2>
          <PropsTable
            rows={[
              ['puck:save', 'message', 'Mevcut draft’ı kaydet'],
              ['puck:publish', 'message', 'Kayıt akışını tetikle'],
              ['puck:undo', 'message', 'Son işlemi geri al'],
              ['puck:redo', 'message', 'Geri alınan işlemi yinele'],
              ['puck:viewport', '{ width }', 'Canvas viewport genişliğini değiştir'],
            ]}
          />
        </section>
        <section id="editor-parent">
          <h2>Editor → Parent</h2>
          <PropsTable
            rows={[
              ['puck:changed', 'message', 'Debounce’lu değişiklik bildirimi'],
              ['puck:saved', '{ data }', 'Başarılı save ve güncel draft'],
              ['puck:saveError', '{ message }', 'Kayıt hatası'],
              ['puck:itemSelected', '{ item }', 'Seçili type ve id'],
              ['puck:itemDeselected', 'message', 'Seçimin kaldırılması'],
            ]}
          />
        </section>
        <section id="guvenlik">
          <h2>Origin güvenliği</h2>
          <p>
            Embed senaryosunda <code>hostOrigin</code> prop’unu mutlaka verin. Studio gelen
            mesajların <code>event.origin</code> değerini kontrol eder ve giden mesajları yalnızca
            bu origin’e yollar. Prop verilmezse geriye uyumluluk için wildcard kullanılır.
          </p>
          <CodeBlock
            code={`<TecofEditor
  pageId={pageId}
  config={config}
  hostOrigin="https://panel.example.com"
/>`}
          />
        </section>
      </>
    ),
  },
  {
    slug: 'mcp',
    group: 'Entegrasyon',
    title: 'MCP dokümantasyon sunucusu',
    navTitle: 'MCP sunucusu',
    description: 'AI asistanlarına paket dokümanlarını ve gerçek tip tanımlarını MCP araçları olarak sunun.',
    icon: Bot,
    keywords: ['mcp', 'model context protocol', 'claude', 'cursor', 'chatgpt', 'ai', 'connector', 'stdio'],
    toc: [
      { id: 'mcp-nedir', label: 'Nedir?' },
      { id: 'mcp-araclar', label: 'Araçlar' },
      { id: 'mcp-yerel', label: 'Yerel kullanım (stdio)' },
      { id: 'mcp-uzak', label: 'Uzak sunucu (HTTP)' },
      { id: 'mcp-akis', label: 'Önerilen akış' },
    ],
    content: (
      <>
        <section id="mcp-nedir">
          <h2>MCP sunucusu nedir?</h2>
          <p>
            Repo, <strong>Model Context Protocol</strong> üzerinden paket dokümantasyonunu ve
            <code>dist/index.d.ts</code>’teki gerçek TypeScript bildirimlerini AI asistanlarına
            (Claude Code, Claude Desktop, Cursor, ChatGPT) salt-okunur araçlar olarak sunan bir
            MCP sunucusu içerir. Amaç, asistanın API uydurmak yerine güncel dokümanı ve gerçek
            tip kaynağını okumasıdır.
          </p>
          <p>
            Araç ve resource mantığı <code>mcp/create-server.mjs</code> içinde paylaşılan tek bir
            fabrikada tanımlıdır; aynı mantık iki transport ile çalışır: yerel geliştirme için
            stdio (<code>mcp/server.mjs</code>) ve Vercel’e deploy edilen stateless Streamable
            HTTP ucu (<code>playground/api/mcp.mjs</code>).
          </p>
        </section>
        <section id="mcp-araclar">
          <h2>Araçlar ve resource’lar</h2>
          <PropsTable
            rows={[
              ['list_tecof_docs', 'tool', 'Mevcut doküman kaynaklarını listeler'],
              ['search_tecof_docs', 'tool', 'Tüm kaynaklarda puanlı tam metin araması yapar'],
              ['read_tecof_doc', 'tool', 'Bir kaynağı eksiksiz Markdown olarak döndürür'],
              ['list_exported_types', 'tool', 'Paketin gerçekten export ettiği tip/bileşen/fonksiyon adları'],
              ['read_type_definition', 'tool', 'Verilen export adının gerçek TypeScript bildirimi'],
            ]}
          />
          <p>
            Aynı içerikler <code>tecof-docs://</code> şemalı resource olarak da sunulur:
            <code>index</code>, <code>ai-guide</code>, <code>package-reference</code>,
            <code>tailwind</code>, <code>architecture</code>, <code>permissions</code> ve tam
            rollup tip dosyası için <code>types</code>.
          </p>
          <Callout type="warning" title="Tip araçları build ister">
            <code>list_exported_types</code> ve <code>read_type_definition</code>,
            <code>dist/index.d.ts</code> üzerinden çalışır. Paket <code>npm run build</code> ile
            derlenmediyse sunucu çökmez; yalnızca bu iki araç devre dışı kalır.
          </Callout>
        </section>
        <section id="mcp-yerel">
          <h2>Yerel kullanım (stdio)</h2>
          <p>Önce doküman manifestini ve tip dosyasını hazırlayın:</p>
          <CodeBlock code={codeSamples.mcpPrepare} language="bash" title="Terminal" />
          <p>
            Repo kökündeki <code>.mcp.json</code>, project-level MCP destekleyen client’lar
            (örn. Claude Code) için hazırdır — repoyu açtığınızda sunucu otomatik tanınır.
            Client stdio sürecini kendisi başlattığı için ayrı bir terminalde açık tutmanız
            gerekmez.
          </p>
          <CodeBlock code={codeSamples.mcpLocal} language="json" title=".mcp.json" />
        </section>
        <section id="mcp-uzak">
          <h2>Uzak sunucu (Streamable HTTP)</h2>
          <p>
            <code>playground/api/mcp.mjs</code>, Vercel serverless function olarak deploy edilen
            <strong>stateless</strong> bir uç noktadır: her istek kendi{' '}
            <code>McpServer</code> + transport çiftini oluşturup kapatır, bu yüzden farklı Lambda
            instance’larına düşen istekler sorun çıkarmaz. Deploy sonrası adres:
            <code>https://&lt;domain&gt;/api/mcp</code>
          </p>
          <PropsTable
            rows={[
              ['Claude.ai / Desktop', 'Custom connector', 'Settings → Connectors → Add custom connector → URL'],
              ['ChatGPT', 'Connector', 'Settings → Connectors → Create → URL'],
              ['Claude Code', 'claude mcp add', 'claude mcp add --transport http tecof-docs <URL>'],
            ]}
          />
          <Callout type="info" title="Vercel includeFiles">
            <code>api/mcp.mjs</code> dokümanları dinamik path ile okuduğundan Node File Trace
            bunları göremez; <code>playground/vercel.json</code>’daki{' '}
            <code>includeFiles</code> ayarı <code>public/**</code> ve{' '}
            <code>dist/index.d.ts</code>’i pakete dahil eder. Kod değişince{' '}
            <code>npm run build</code> çalıştırıp <code>dist/</code>’i commit etmeyi unutmayın;
            yoksa MCP’den okunan tipler eski kalır.
          </Callout>
          <p>
            Uç nokta salt-okunur olduğundan kimlik doğrulaması yoktur; gerekirse handler’ın
            başına bir <code>Authorization</code> header kontrolü eklemek yeterlidir.
          </p>
        </section>
        <section id="mcp-akis">
          <h2>Önerilen ajan akışı</h2>
          <p>
            Sunucu, bağlanan asistana şu talimatı verir: önce <code>search_tecof_docs</code> ile
            ara, uygulama kodu önermeden önce ilgili kaynağı <code>read_tecof_doc</code> ile oku,
            belgede olmayan API uydurma ve çelişkide exported TypeScript tiplerini son doğruluk
            kaynağı kabul et.
          </p>
          <CodeBlock code={codeSamples.mcpFlow} language="ts" title="Ajan akışı" />
        </section>
      </>
    ),
  },
  {
    slug: 'izinler-migration',
    group: 'Gelişmiş',
    title: 'İzinler ve migration',
    navTitle: 'İzinler & migration',
    description: 'Node yeteneklerini sınırlandırın ve eski sayfa verisini güvenle yeni şemaya taşıyın.',
    icon: ShieldCheck,
    keywords: ['permission', 'migration', 'schema', 'readonly', 'locked'],
    toc: [
      { id: 'izin-modeli', label: 'İzin modeli' },
      { id: 'dinamik-izin', label: 'Dinamik izinler' },
      { id: 'migration', label: 'Veri migration’ı' },
      { id: 'sira', label: 'Çalışma sırası' },
    ],
    content: (
      <>
        <section id="izin-modeli">
          <h2>İzin modeli</h2>
          <p>
            İzinler varsayılan olarak açıktır. Global config, component config ve
            <code>resolvePermissions</code> sırasıyla birleştirilir. Kısıtlar motor seviyesinde
            uygulandığı için yalnızca buton gizlemekle kalmaz; klavye kısayolu ve clipboard
            işlemleri de aynı kurala uyar.
          </p>
          <CodeBlock code={codeSamples.permissions} title="permissions.ts" />
          <PropsTable
            rows={[
              ['drag', 'boolean', 'Canvas ve katmanlarda taşıma'],
              ['delete', 'boolean', 'Tekli/toplu silme ve kesme'],
              ['duplicate', 'boolean', 'Çoğaltma ve yeni id ile yapıştırma'],
              ['edit', 'boolean', 'Inspector alanlarının düzenlenmesi'],
            ]}
          />
        </section>
        <section id="dinamik-izin">
          <h2>Dinamik izinler</h2>
          <p>
            <code>resolvePermissions(props, context)</code>, node prop’larına göre anlık karar
            üretir. Context içindeki <code>changed</code> ve <code>lastProps</code> değerleri
            yalnızca değişen alanlara göre hesap yapmanıza yardımcı olur.
          </p>
        </section>
        <section id="migration">
          <h2>Veri migration’ı</h2>
          <p>
            Registry anahtarı veya prop şeması değiştiğinde eski kayıtları render öncesi yükseltin.
            <code>version</code> damgası <code>root.props._schemaVersion</code> içine yazılır ve
            aynı migration’ın tekrar uygulanmasını engeller.
          </p>
          <CodeBlock code={codeSamples.migration} title="migration.ts" />
        </section>
        <section id="sira">
          <h2>Çalışma sırası</h2>
          <ol>
            <li><code>renameComponents</code> ile type adları değiştirilir.</li>
            <li>Yeni type adına göre <code>transformProps</code> çalışır.</li>
            <li>Varsa tüm belgeyi alan özel <code>migrate</code> fonksiyonu uygulanır.</li>
            <li>Hedef schema version root’a yazılır.</li>
          </ol>
        </section>
      </>
    ),
  },
  {
    slug: 'kisayollar',
    group: 'Referans',
    title: 'Klavye kısayolları',
    navTitle: 'Klavye kısayolları',
    description: 'Studio’yu klavyeyle hızlı yönetin, node’lar arasında gezinin ve komut paletini kullanın.',
    icon: Keyboard,
    keywords: ['keyboard', 'shortcut', 'command k', 'undo', 'copy paste'],
    toc: [
      { id: 'temel', label: 'Temel kısayollar' },
      { id: 'secim', label: 'Seçim ve gezinme' },
      { id: 'komut-paleti', label: 'Komut paleti' },
      { id: 'clipboard', label: 'Clipboard' },
    ],
    content: (
      <>
        <section id="temel">
          <h2>Temel kısayollar</h2>
          <div className="my-6 divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {[
              ['⌘ / Ctrl  K', 'Komut paletini aç veya kapat'],
              ['⌘ / Ctrl  S', 'Taslağı kaydet'],
              ['⌘ / Ctrl  Z', 'Geri al'],
              ['⌘ / Ctrl  ⇧  Z', 'Yinele'],
              ['⌘ / Ctrl  C / X / V', 'Kopyala, kes, yapıştır'],
              ['⌘ / Ctrl  D', 'Seçimi çoğalt'],
              ['Delete / Backspace', 'Seçili node’ları sil'],
              ['Esc', 'Paleti kapat veya seçimi kaldır'],
            ].map(([keys, action]) => (
              <div
                key={keys}
                className="flex items-center justify-between gap-5 bg-white px-4 py-3 text-sm dark:bg-[#101310]"
              >
                <span className="text-zinc-600 dark:text-zinc-300">{action}</span>
                <kbd>{keys}</kbd>
              </div>
            ))}
          </div>
        </section>
        <section id="secim">
          <h2>Seçim ve gezinme</h2>
          <p>
            ⌘/Ctrl + tık veya Shift + tık ile node’u çoklu seçime ekleyip çıkarabilirsiniz.
            Ok tuşları seçili node’un kardeşleri arasında hareket eder: yukarı/sol önceki,
            aşağı/sağ sonraki node’u seçer.
          </p>
        </section>
        <section id="komut-paleti">
          <h2>Komut paleti</h2>
          <p>
            Palet; undo/redo, panel açma-kapama, önizleme, kayıt ve component ekleme eylemlerini
            aynı aramada birleştirir. Ok tuşlarıyla gezinilir, Enter ile çalıştırılır.
          </p>
        </section>
        <section id="clipboard">
          <h2>Clipboard davranışı</h2>
          <p>
            Node clipboard verisi <code>tecof:clipboard:v1</code> anahtarıyla localStorage’da
            tutulur. Bu sayede farklı sekme veya sayfalar arasında yapıştırma yapılabilir.
            Yapıştırılan node ve alt zone’lar için yeni id’ler üretilir.
          </p>
        </section>
      </>
    ),
  },
  {
    slug: 'sorun-giderme',
    group: 'Referans',
    title: 'Sorun giderme',
    navTitle: 'Sorun giderme',
    description: 'En sık entegrasyon, stil, render ve medya problemlerini sistematik olarak çözün.',
    icon: CircleHelp,
    keywords: ['error', 'sorun', 'css yok', 'component bulunamadı', 'cors', 'upload'],
    toc: [
      { id: 'stiller-yok', label: 'Stiller görünmüyor' },
      { id: 'component-yok', label: 'Component bulunamıyor' },
      { id: 'api-hatasi', label: 'API ve CORS' },
      { id: 'kontrol-listesi', label: 'Kontrol listesi' },
    ],
    content: (
      <>
        <section id="stiller-yok">
          <h2>Yayında stiller görünmüyor</h2>
          <p>
            Önce <code>@tecof/theme-editor/styles.css</code> import’unu kontrol edin. Sorun
            yalnızca kullanıcı tarafından Studio’da verilen stillerdeyse Tailwind safelist’in
            build’e dahil olduğunu doğrulayın. Tema renkleri eksikse
            <code>--theme-color-*</code> değişkenlerini public root’a ekleyin.
          </p>
        </section>
        <section id="component-yok">
          <h2>Component editörde var, yayında yok</h2>
          <p>
            Editor ve renderer aynı <code>StudioConfig</code> nesnesini kullanmalıdır. Kaydedilmiş
            JSON’daki <code>type</code> registry’de yoksa render edilemez. Type adı
            değiştirdiyseniz migration ekleyin.
          </p>
        </section>
        <section id="api-hatasi">
          <h2>API, CORS veya yükleme hatası</h2>
          <ul>
            <li>API base URL sonunda fazladan slash olmasının client tarafından temizlendiğini bilin.</li>
            <li>Backend’in <code>x-secret-key</code> header’ına izin verdiğini kontrol edin.</li>
            <li>Upload isteğinde Content-Type’ı elle vermeyin; multipart boundary’yi tarayıcı ekler.</li>
            <li>Embed kullanıyorsanız parent ve <code>hostOrigin</code> değerlerini birebir eşleştirin.</li>
          </ul>
        </section>
        <section id="kontrol-listesi">
          <h2>Production kontrol listesi</h2>
          <div className="my-6 space-y-2">
            {[
              'Paket CSS’i ana layout’ta import edildi.',
              'Editör ve renderer ortak config kullanıyor.',
              'Tailwind primary paleti ve safelist build’de mevcut.',
              'Tema CSS değişkenleri public sayfaya uygulanıyor.',
              'API endpoint’leri ve CORS header’ları doğrulandı.',
              'iframe entegrasyonunda hostOrigin sınırlandırıldı.',
              'Arbitrary Tailwind değerleri sayfa JSON’larından toplandı.',
              'Eski component şemaları için migration tanımlandı.',
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                <Check size={16} className="mt-0.5 shrink-0 text-primary-600" />
                {item}
              </div>
            ))}
          </div>
        </section>
      </>
    ),
  },
];

const groups = Array.from(new Set(pages.map((page) => page.group)));

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={logoUrl}
        alt="Tecof"
        className={`tecof-docs-logo tecof-docs-logo-light ${compact ? 'is-compact' : ''}`}
      />
      <img
        src={whiteLogoUrl}
        alt="Tecof"
        className={`tecof-docs-logo tecof-docs-logo-dark ${compact ? 'is-compact' : ''}`}
      />
      {!compact && (
        <div className="tecof-docs-product-label contents">
          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-sm font-semibold tracking-tight text-zinc-700 dark:text-zinc-200">
            Docs
          </span>
        </div>
      )}
    </div>
  );
}

function App() {
  const initialSlug = window.location.hash.replace(/^#\/?/, '').split('/')[0] || 'giris';
  const [activeSlug, setActiveSlug] = useState(
    pages.some((page) => page.slug === initialSlug) ? initialSlug : 'giris',
  );
  const [mobileNav, setMobileNav] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dark, setDark] = useState(() => localStorage.getItem('tecof-docs-theme') === 'dark');
  const [activeHeading, setActiveHeading] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);

  const activePage = pages.find((page) => page.slug === activeSlug) || pages[0];
  const currentIndex = pages.findIndex((page) => page.slug === activePage.slug);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr');
    if (!normalized) return pages.slice(0, 7);
    return pages.filter((page) =>
      [page.title, page.description, ...page.keywords]
        .join(' ')
        .toLocaleLowerCase('tr')
        .includes(normalized),
    );
  }, [query]);

  const navigate = (slug: string) => {
    window.location.hash = `/${slug}`;
    setActiveSlug(slug);
    setMobileNav(false);
    setSearchOpen(false);
    setQuery('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const scrollToHeading = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const onHashChange = () => {
      const slug = window.location.hash.replace(/^#\/?/, '').split('/')[0] || 'giris';
      if (pages.some((page) => page.slug === slug)) {
        setActiveSlug(slug);
        window.scrollTo({ top: 0 });
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('tecof-docs-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setMobileNav(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) window.setTimeout(() => searchInput.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    setActiveHeading(activePage.toc[0]?.id || '');
    const sections = activePage.toc
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveHeading(visible.target.id);
      },
      { rootMargin: '-88px 0px -70% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [activePage]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased dark:bg-[#0b0d0b] dark:text-zinc-100">
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-[#0b0d0b]/90">
        <div className="mx-auto flex h-full max-w-[1540px] items-center gap-4 px-4 sm:px-6">
          <button
            onClick={() => setMobileNav(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 lg:hidden dark:text-zinc-300 dark:hover:bg-zinc-900"
            aria-label="Menüyü aç"
          >
            <Menu size={20} />
          </button>
          <button onClick={() => navigate('giris')} className="shrink-0">
            <Logo />
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-0 text-left text-sm text-zinc-400 transition hover:border-zinc-300 hover:bg-white hover:shadow-sm sm:w-full sm:max-w-xl sm:justify-start sm:px-3.5 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
          >
            <Search size={16} />
            <span className="hidden flex-1 sm:block">Dokümanlarda ara...</span>
            <kbd className="tecof-docs-search-shortcut hidden sm:inline-flex">⌘ K</kbd>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDark((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white"
              aria-label="Temayı değiştir"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a
              href="https://github.com/tecof/tecof-theme-editor"
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 md:flex dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <GitBranch size={18} />
              GitHub
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1540px] lg:grid lg:grid-cols-[272px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,820px)_240px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[272px] self-start overflow-y-auto border-r border-zinc-200 bg-white px-5 py-7 lg:block dark:border-zinc-800 dark:bg-[#0b0d0b]">
          <div className="mb-7 rounded-xl border border-primary-200 bg-primary-50 p-3 dark:border-primary-900 dark:bg-primary-950/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-400">
                  Theme Editor
                </div>
                <div className="mt-0.5 text-sm font-semibold text-primary-950 dark:text-primary-100">
                  v0.0.45
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-200/70 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                <Box size={16} />
              </div>
            </div>
          </div>
          <nav className="space-y-6">
            {groups.map((group) => (
              <div key={group}>
                <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                  {group}
                </div>
                <div className="space-y-0.5">
                  {pages
                    .filter((page) => page.group === group)
                    .map((page) => {
                      const Icon = page.icon;
                      const active = page.slug === activePage.slug;
                      return (
                        <button
                          key={page.slug}
                          onClick={() => navigate(page.slug)}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition ${
                            active
                              ? 'bg-primary-100 text-primary-900 dark:bg-primary-950 dark:text-primary-300'
                              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                          }`}
                        >
                          <Icon size={15} />
                          <span className="flex-1">{page.navTitle}</span>
                          {active && <ChevronRight size={13} />}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </nav>
          <div className="mt-8 border-t border-zinc-200 pt-5 dark:border-zinc-800">
            <a
              href="https://github.com/tecof/tecof-theme-editor/issues"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <CircleHelp size={14} />
              Bir sorun bildirin
              <ExternalLink size={11} className="ml-auto" />
            </a>
          </div>
        </aside>

        <main className="min-w-0 px-5 pb-20 pt-28 sm:px-8 lg:col-start-2 lg:px-10 xl:px-12">
          <div className="mb-8 flex items-center gap-2 text-xs font-medium text-zinc-400">
            <span>Dokümantasyon</span>
            <ChevronRight size={12} />
            <span>{activePage.group}</span>
          </div>

          <article className="docs-article">
            <div className="mb-12 border-b border-zinc-200 pb-10 dark:border-zinc-800">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800 dark:border-primary-900 dark:bg-primary-950/60 dark:text-primary-300">
                <Sparkles size={13} />
                Tecof geliştirici rehberi
              </div>
              <h1>{activePage.title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-500 dark:text-zinc-400">
                {activePage.description}
              </p>
            </div>

            {activePage.content}

            <div className="mt-16 border-t border-zinc-200 pt-8 dark:border-zinc-800">
              <div className="grid gap-3 sm:grid-cols-2">
                {currentIndex > 0 ? (
                  <button
                    onClick={() => navigate(pages[currentIndex - 1].slug)}
                    className="group rounded-xl border border-zinc-200 p-4 text-left transition hover:border-primary-300 hover:bg-primary-50/40 dark:border-zinc-800 dark:hover:border-primary-800 dark:hover:bg-primary-950/20"
                  >
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <ArrowLeft size={13} />
                      Önceki
                    </div>
                    <div className="mt-2 font-semibold group-hover:text-primary-800 dark:group-hover:text-primary-300">
                      {pages[currentIndex - 1].title}
                    </div>
                  </button>
                ) : (
                  <div />
                )}
                {currentIndex < pages.length - 1 && (
                  <button
                    onClick={() => navigate(pages[currentIndex + 1].slug)}
                    className="group rounded-xl border border-zinc-200 p-4 text-right transition hover:border-primary-300 hover:bg-primary-50/40 dark:border-zinc-800 dark:hover:border-primary-800 dark:hover:bg-primary-950/20"
                  >
                    <div className="flex items-center justify-end gap-2 text-xs text-zinc-400">
                      Sonraki
                      <ArrowRight size={13} />
                    </div>
                    <div className="mt-2 font-semibold group-hover:text-primary-800 dark:group-hover:text-primary-300">
                      {pages[currentIndex + 1].title}
                    </div>
                  </button>
                )}
              </div>
              <div className="mt-8 flex items-center justify-between text-xs text-zinc-400">
                <span>Son güncelleme: 1 Temmuz 2026</span>
                <a
                  href="https://github.com/tecof/tecof-theme-editor"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 font-medium hover:text-primary-700"
                >
                  <FileText size={13} />
                  Bu sayfayı düzenle
                </a>
              </div>
            </div>
          </article>
        </main>

        <aside className="sticky top-16 col-start-3 row-start-1 hidden h-[calc(100vh-4rem)] self-start overflow-y-auto px-7 py-12 xl:block">
          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Bu sayfada</div>
          <nav className="mt-4 space-y-1 border-l border-zinc-200 dark:border-zinc-800">
            {activePage.toc.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={`-ml-px block w-full border-l px-4 py-1.5 text-left text-xs leading-5 transition ${
                  activeHeading === item.id
                    ? 'border-primary-600 font-semibold text-primary-700 dark:text-primary-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-9 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <GitBranch size={14} />
              Açık kaynak
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Bir hata mı buldunuz? Issue açarak geliştirmeye katkı sağlayın.
            </p>
            <a
              href="https://github.com/tecof/tecof-theme-editor/issues"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-400"
            >
              Issue oluştur <ArrowRight size={12} />
            </a>
          </div>
        </aside>
      </div>

      {mobileNav && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            className="absolute inset-0 bg-black/35 backdrop-blur-sm"
            onClick={() => setMobileNav(false)}
            aria-label="Menüyü kapat"
          />
          <aside className="absolute bottom-0 left-0 top-0 w-[min(88vw,340px)] overflow-y-auto bg-white p-5 shadow-2xl dark:bg-[#0b0d0b]">
            <div className="flex items-center justify-between pb-5">
              <Logo />
              <button
                onClick={() => setMobileNav(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X size={19} />
              </button>
            </div>
            <nav className="space-y-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
              {groups.map((group) => (
                <div key={group}>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    {group}
                  </div>
                  {pages
                    .filter((page) => page.group === group)
                    .map((page) => {
                      const Icon = page.icon;
                      return (
                        <button
                          key={page.slug}
                          onClick={() => navigate(page.slug)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                            page.slug === activePage.slug
                              ? 'bg-primary-100 text-primary-900 dark:bg-primary-950 dark:text-primary-300'
                              : 'text-zinc-600 dark:text-zinc-300'
                          }`}
                        >
                          <Icon size={16} />
                          {page.navTitle}
                        </button>
                      );
                    })}
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/40 px-4 pt-[10vh] backdrop-blur-sm">
          <button
            className="absolute inset-0"
            onClick={() => setSearchOpen(false)}
            aria-label="Aramayı kapat"
          />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#101310]">
            <div className="flex h-14 items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-800">
              <Search size={19} className="text-zinc-400" />
              <input
                ref={searchInput}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Kurulum, Tailwind, API..."
                className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
              />
              <kbd>ESC</kbd>
            </div>
            <div className="max-h-[55vh] overflow-y-auto p-2">
              <div className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {query ? `${results.length} sonuç` : 'Önerilen sayfalar'}
              </div>
              {results.length ? (
                results.map((page) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.slug}
                      onClick={() => navigate(page.slug)}
                      className="group flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-primary-50 dark:hover:bg-primary-950/40"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 group-hover:border-primary-200 group-hover:text-primary-700 dark:border-zinc-700 dark:bg-zinc-900 dark:group-hover:border-primary-900 dark:group-hover:text-primary-400">
                        <Icon size={17} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {page.title}
                        </div>
                        <div className="mt-1 line-clamp-1 text-xs text-zinc-500">
                          {page.description}
                        </div>
                      </div>
                      <ArrowRight
                        size={15}
                        className="ml-auto mt-2 text-zinc-300 group-hover:text-primary-600"
                      />
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-12 text-center">
                  <FileJson size={28} className="mx-auto text-zinc-300" />
                  <div className="mt-3 text-sm font-semibold">Sonuç bulunamadı</div>
                  <p className="mt-1 text-xs text-zinc-500">Farklı bir anahtar kelime deneyin.</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 border-t border-zinc-200 bg-zinc-50 px-4 py-2.5 text-[11px] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60">
              <span className="flex items-center gap-1.5"><kbd>↵</kbd> Aç</span>
              <span className="flex items-center gap-1.5"><kbd>ESC</kbd> Kapat</span>
              <span className="ml-auto">Tecof Docs Search</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
