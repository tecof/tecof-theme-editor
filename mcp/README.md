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

## Resource URI'ları

- `tecof-docs://index`
- `tecof-docs://ai-guide`
- `tecof-docs://package-reference`
- `tecof-docs://tailwind`
- `tecof-docs://architecture`
