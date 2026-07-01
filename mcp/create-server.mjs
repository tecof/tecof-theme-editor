import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const normalize = (value) =>
  value
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

const createSnippet = (content, query) => {
  const plain = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`|[\]-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const normalized = normalize(plain);
  const index = normalized.indexOf(normalize(query));
  const start = Math.max(0, index === -1 ? 0 : index - 120);
  const end = Math.min(plain.length, start + 420);
  return `${start > 0 ? '…' : ''}${plain.slice(start, end)}${end < plain.length ? '…' : ''}`;
};

const scoreDocument = (document, terms) => {
  const title = normalize(document.title);
  const description = normalize(document.description);
  const content = normalize(document.content);

  return terms.reduce((score, term) => {
    if (title.includes(term)) score += 12;
    if (description.includes(term)) score += 6;
    const matches = content.split(term).length - 1;
    return score + Math.min(matches, 20);
  }, 0);
};

const textResult = (text) => ({
  content: [{ type: 'text', text }],
});

/**
 * @param {{ manifest: { name: string, version: string }, documents: Array<{ slug: string, title: string, description: string, content: string }>, llmsText: string, typeDefinitions?: { source: string, publicSymbols: Array<{ name: string, typeOnly: boolean }>, blocks: Map<string, string> } }} context
 */
export function createMcpServer({ manifest, documents, llmsText, typeDefinitions }) {
  const server = new McpServer(
    {
      name: manifest.name,
      version: manifest.version,
    },
    {
      instructions:
        'Tecof Theme Editor sorularında önce search_tecof_docs kullan. Uygulama kodu önermeden önce ilgili kaynağı read_tecof_doc ile oku. Belgede bulunmayan API uydurma. Çelişkide exported TypeScript tiplerini son doğruluk kaynağı kabul et.',
    },
  );

  server.registerTool(
    'list_tecof_docs',
    {
      title: 'Tecof dokümanlarını listele',
      description:
        'Tecof Theme Editor için erişilebilir dokümanları, slug ve kapsam açıklamalarıyla listeler.',
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () =>
      textResult(
        documents
          .map(
            (document) =>
              `- ${document.title} (slug: ${document.slug}, resource: tecof-docs://${document.slug})\n  ${document.description}`,
          )
          .join('\n'),
      ),
  );

  server.registerTool(
    'search_tecof_docs',
    {
      title: 'Tecof dokümanlarında ara',
      description:
        'Kurulum, Studio, component config, alanlar, Tailwind, tema, API, iframe ve migration belgelerinde tam metin araması yapar.',
      inputSchema: z.object({
        query: z.string().min(2).describe('Türkçe veya İngilizce arama ifadesi'),
        limit: z.number().int().min(1).max(10).default(5),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ query, limit }) => {
      const terms = normalize(query).split(/\s+/).filter(Boolean);
      const matches = documents
        .map((document) => ({
          document,
          score: scoreDocument(document, terms),
        }))
        .filter((match) => match.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      if (!matches.length) {
        return textResult(
          `"${query}" için sonuç bulunamadı. list_tecof_docs ile mevcut kaynakları listeleyin.`,
        );
      }

      return textResult(
        matches
          .map(
            ({ document, score }) =>
              `## ${document.title}\nSlug: ${document.slug}\nSkor: ${score}\nResource: tecof-docs://${document.slug}\n\n${createSnippet(document.content, query)}`,
          )
          .join('\n\n---\n\n'),
      );
    },
  );

  server.registerTool(
    'read_tecof_doc',
    {
      title: 'Tecof dokümanını oku',
      description:
        'Bir Tecof Theme Editor dokümanını slug ile eksiksiz Markdown olarak döndürür.',
      inputSchema: z.object({
        slug: z
          .string()
          .describe('list_tecof_docs veya search_tecof_docs sonucundaki doküman slug değeri'),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ slug }) => {
      const document = documents.find((item) => item.slug === slug);
      if (!document) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Doküman bulunamadı: ${slug}. Geçerli slug'lar: ${documents.map((item) => item.slug).join(', ')}`,
            },
          ],
        };
      }
      return textResult(`# ${document.title}\n\nKaynak: ${document.file}\n\n${document.content}`);
    },
  );

  if (typeDefinitions) {
    server.registerTool(
      'list_exported_types',
      {
        title: 'Dışa açık TypeScript tiplerini listele',
        description:
          '@tecof/theme-editor paketinin dist/index.d.ts içinde gerçekten export ettiği tüm tip, bileşen ve fonksiyon adlarını listeler.',
        inputSchema: z.object({}),
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async () =>
        textResult(
          typeDefinitions.publicSymbols
            .map((symbol) => `- ${symbol.name}${symbol.typeOnly ? ' (type)' : ''}`)
            .join('\n'),
        ),
    );

    server.registerTool(
      'read_type_definition',
      {
        title: 'TypeScript tip tanımını oku',
        description:
          'Verilen export adının dist/index.d.ts içindeki gerçek TypeScript bildirimini döndürür. Bir prop veya alanın var olup olmadığını tahmin etmek yerine bunu kullanın.',
        inputSchema: z.object({
          symbol: z
            .string()
            .describe('list_exported_types sonucundaki bir export adı, örn. TecofEditorProps'),
        }),
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async ({ symbol }) => {
        const block = typeDefinitions.blocks.get(symbol);
        if (!block) {
          const available = typeDefinitions.publicSymbols.map((item) => item.name).join(', ');
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: `'${symbol}' bulunamadı. Kullanılabilir export'lar: ${available}`,
              },
            ],
          };
        }
        return textResult(`\`\`\`typescript\n${block}\n\`\`\``);
      },
    );

    server.registerResource(
      'tecof-docs-types',
      'tecof-docs://types',
      {
        title: 'Paket tip tanımları (dist/index.d.ts)',
        description: '@tecof/theme-editor için tam, rollup edilmiş TypeScript bildirim dosyası.',
        mimeType: 'text/plain',
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: typeDefinitions.source,
          },
        ],
      }),
    );
  }

  server.registerResource(
    'tecof-docs-index',
    'tecof-docs://index',
    {
      title: 'Tecof Theme Editor doküman indeksi',
      description: 'AI için kısa doküman indeksi ve kaynak listesi.',
      mimeType: 'text/markdown',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'text/markdown',
          text: llmsText,
        },
      ],
    }),
  );

  for (const document of documents) {
    server.registerResource(
      `tecof-docs-${document.slug}`,
      `tecof-docs://${document.slug}`,
      {
        title: document.title,
        description: document.description,
        mimeType: 'text/markdown',
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: document.content,
          },
        ],
      }),
    );
  }

  return server;
}
