import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from '../../mcp/create-server.mjs';
import { buildTypeIndex } from '../../mcp/type-definitions.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(here, '..', 'public');
const dtsPath = path.join(here, '..', '..', 'dist', 'index.d.ts');

let contextPromise;

function loadContext() {
  if (!contextPromise) {
    contextPromise = (async () => {
      const manifest = JSON.parse(
        await readFile(path.join(publicDir, 'mcp-manifest.json'), 'utf8'),
      );
      const documents = await Promise.all(
        manifest.documents.map(async (document) => ({
          ...document,
          content: await readFile(path.join(publicDir, 'ai', `${document.slug}.md`), 'utf8'),
        })),
      );
      const llmsText = await readFile(path.join(publicDir, 'llms.txt'), 'utf8');

      let typeDefinitions;
      try {
        const dtsSource = await readFile(dtsPath, 'utf8');
        typeDefinitions = buildTypeIndex(dtsSource);
      } catch {
        console.error('dist/index.d.ts bulunamadı, tip tanımı araçları devre dışı.');
      }

      return { manifest, documents, llmsText, typeDefinitions };
    })();
  }
  return contextPromise;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Mcp-Session-Id, Mcp-Protocol-Version');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed. Bu uç nokta sadece POST kabul eder.' },
      id: null,
    });
    return;
  }

  try {
    const { manifest, documents, llmsText, typeDefinitions } = await loadContext();
    const server = createMcpServer({ manifest, documents, llmsText, typeDefinitions });
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on('close', () => {
      transport.close();
      server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('MCP isteği işlenirken hata:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
}
