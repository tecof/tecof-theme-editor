/**
 * Lightweight parser for the rolled-up .d.ts tsup produces at dist/index.d.ts.
 * The file is a single flat list of top-level declarations (interface/type/
 * declare class/const/function) followed by one `export { ... }` statement
 * naming the actually-public symbols. No TypeScript compiler is needed since
 * the generated shape is very regular.
 */

const DECLARATION_START_RE =
  /^(?:export\s+)?(?:declare\s+)?(interface|type|class|function|const|enum)\s+([A-Za-z_$][\w$]*)/;

function parsePublicExports(source) {
  // Re-exports from submodules (e.g. `export { UnderConstruction } from './x.js';`)
  // are excluded — only the rolled-up bundle's own public list (no `from` clause)
  // reflects this package's actual top-level API surface.
  const regex = /^export \{([\s\S]*?)\}(.*)$/gm;
  const parts = [];
  let match;
  while ((match = regex.exec(source))) {
    if (!match[2].trim().startsWith('from')) {
      parts.push(match[1]);
    }
  }
  if (!parts.length) return [];

  return parts
    .join(',')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const typeOnly = entry.startsWith('type ');
      const rest = typeOnly ? entry.slice('type '.length).trim() : entry;
      const asMatch = rest.match(/^(.+?)\s+as\s+(.+)$/);
      return asMatch
        ? { name: asMatch[2].trim(), exportedAs: asMatch[1].trim(), typeOnly }
        : { name: rest, typeOnly };
    });
}

function extractDeclarationBlocks(source) {
  const lines = source.split('\n');
  const boundaries = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^export\s*\{/.test(line)) {
      boundaries.push({ line: i, name: null });
      continue;
    }
    if (/^(interface|type|declare)\b/.test(line)) {
      const match = line.match(DECLARATION_START_RE);
      if (match) boundaries.push({ line: i, name: match[2] });
    }
  }

  const blocks = new Map();
  for (let i = 0; i < boundaries.length; i++) {
    const { line: from, name } = boundaries[i];
    if (!name) continue;
    const to = boundaries[i + 1] ? boundaries[i + 1].line : lines.length;
    blocks.set(name, lines.slice(from, to).join('\n').trimEnd());
  }
  return blocks;
}

export function buildTypeIndex(source) {
  return {
    source,
    publicSymbols: parsePublicExports(source),
    blocks: extractDeclarationBlocks(source),
  };
}
