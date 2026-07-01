# Tecof Theme Editor Docs MCP

Bu MCP sunucusu repository dokümanlarını salt-okunur araçlar ve Markdown
resource'ları olarak sunar.

## Hazırlama

```bash
npm install
npm run docs:ai
```

## Çalıştırma

```bash
npm run mcp:docs
```

MCP client stdio sürecini kendisi başlatacağı için normal kullanımda bu komutu
ayrı bir terminalde açık tutmanız gerekmez.

## Client yapılandırması

Repository kökündeki `.mcp.json`, relative path destekleyen project-level MCP
client'ları için hazırdır.

Absolute path isteyen client'larda:

```json
{
  "mcpServers": {
    "tecof-theme-editor-docs": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/tecof-theme-editor/mcp/server.mjs"]
    }
  }
}
```

## Araçlar

- `list_tecof_docs`: Kaynakları listeler.
- `search_tecof_docs`: Tüm kaynaklarda puanlı tam metin araması yapar.
- `read_tecof_doc`: Bir kaynağı eksiksiz Markdown olarak döndürür.
- `list_exported_types`: `dist/index.d.ts`'in gerçekten export ettiği tüm tip,
  bileşen ve fonksiyon adlarını listeler.
- `read_type_definition`: Verilen export adının gerçek TypeScript bildirimini
  döndürür (prop/alan var mı diye tahmin etmek yerine kaynağı okur). Yalnızca
  public export listesindeki değil, dosyada tanımlı herhangi bir üst düzey
  `interface`/`type`/`class`/`function`/`const` için de çalışır (örn. bir
  public tipin referans verdiği dahili bir interface).

Son iki araç, paket `npm run build` ile derlenip `dist/index.d.ts`
üretilmediyse otomatik olarak devre dışı kalır (sunucu çökmez, sadece bu iki
araç `tools/list` çıktısında görünmez).

## Resource URI'ları

- `tecof-docs://index`
- `tecof-docs://ai-guide`
- `tecof-docs://package-reference`
- `tecof-docs://tailwind`
- `tecof-docs://architecture`
- `tecof-docs://permissions`
- `tecof-docs://types`: Tam, rollup edilmiş `dist/index.d.ts` içeriği.

## Uzak (remote) HTTP sunucu — Vercel

Tool/resource mantığı `mcp/create-server.mjs` içinde paylaşılan bir fabrika
fonksiyonu (`createMcpServer`) olarak tanımlı. Bu sayede aynı mantık iki farklı
transport ile çalışır:

- `mcp/server.mjs`: yerel geliştirme için stdio transport (Claude Code, Claude
  Desktop gibi istemciler süreci kendisi başlatır).
- `playground/api/mcp.mjs`: Vercel serverless function olarak deploy edilen,
  Streamable HTTP transport kullanan **stateless** (oturumsuz) uç nokta. Her
  istek kendi `McpServer` + transport çiftini oluşturup kapatır; bu yüzden
  farklı Lambda instance'larına düşen istekler arasında sorun çıkmaz.

`playground/vercel.json` içindeki `includeFiles: "{public/**,../dist/index.d.ts}"`
ayarı önemli: `api/mcp.mjs` dokümanları ve tip tanımlarını `fs.readFile` ile
dinamik path üzerinden okuduğu için Vercel'in Node File Trace'i bu dosyaları
otomatik tespit edemez; bu satır olmadan deploy edilen fonksiyon
`public/mcp-manifest.json`, `public/ai/*.md` ve `dist/index.d.ts` dosyalarını
bulamaz. `dist/` repository'ye commit edildiği için (`.gitignore`'da yok) bu,
Vercel build'inde ayrı bir `npm run build` adımı gerektirmez — deploy anında
repodaki en son commit'lenmiş `dist/index.d.ts` kullanılır. Kod değiştiğinde
`npm run build` çalıştırıp `dist/`'i commit etmeyi unutmayın, yoksa MCP
üzerinden okunan tipler eski kalır.

Deploy sonrası uç nokta: `https://<vercel-domaininiz>/api/mcp`

### AI istemcisine bağlama

**Claude.ai / Claude Desktop:**
Settings → Connectors → Add custom connector → URL alanına
`https://<vercel-domaininiz>/api/mcp` yazın.

**ChatGPT (Connectors / Developer mode):**
Settings → Connectors → Create → URL alanına aynı adresi girin.

Bu uç nokta salt-okunur ve kimlik doğrulaması gerektirmiyor (yalnızca
dokümantasyon sunuyor). Kimlik doğrulama eklemek isterseniz `api/mcp.mjs`
içindeki handler'ın başına bir `Authorization` header kontrolü eklemek
yeterlidir.
