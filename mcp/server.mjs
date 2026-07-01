#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './create-server.mjs';
import { buildTypeIndex } from './type-definitions.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'playground/public/mcp-manifest.json');

async function loadManifest() {
  try {
    return JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch {
    throw new Error(
      'MCP manifest bulunamadı. Önce `npm run docs:ai` komutunu çalıştırın.',
    );
  }
}

const manifest = await loadManifest();
const documents = await Promise.all(
  manifest.documents.map(async (document) => ({
    ...document,
    content: await readFile(path.join(root, document.file), 'utf8'),
  })),
);
const llmsText = await readFile(path.join(root, 'playground/public/llms.txt'), 'utf8');

let typeDefinitions;
try {
  const dtsSource = await readFile(path.join(root, 'dist/index.d.ts'), 'utf8');
  typeDefinitions = buildTypeIndex(dtsSource);
} catch {
  console.error('dist/index.d.ts bulunamadı, tip tanımı araçları devre dışı. Önce `npm run build` çalıştırın.');
}

const server = createMcpServer({ manifest, documents, llmsText, typeDefinitions });
const transport = new StdioServerTransport();
await server.connect(transport);
