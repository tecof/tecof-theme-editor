/**
 * Prompt building for the AI section generator. Pure string-out functions: the
 * component CATALOG is derived from the host's StudioConfig (types, labels,
 * fields, defaults, variants, slot rules), so the model only ever sees — and is
 * told to only ever use — components that actually exist in this editor.
 * The host's `config.ai.complete` does the actual LLM call.
 */

import type { StudioConfig, FieldConfig } from '../../types';

/** Compact, model-friendly description of one field. */
const fieldSpec = (name: string, def: FieldConfig): Record<string, unknown> => {
  const spec: Record<string, unknown> = { name, type: def.type ?? 'custom' };
  if (def.label) spec.label = def.label;
  if (def.type === 'select' || def.type === 'radio') {
    const opts = Array.isArray(def.options)
      ? def.options.map((o: any) => (typeof o === 'object' ? o.value : o)).filter(Boolean)
      : undefined;
    if (opts?.length) spec.options = opts;
  }
  if (def.type === 'slot') spec.slot = true;
  return spec;
};

/**
 * The component catalog serialized for the system prompt: everything the model
 * needs to produce VALID nodes, nothing more (renders/functions are omitted).
 */
export function buildComponentCatalog(config: StudioConfig): string {
  const catalog = Object.entries(config.components ?? {}).map(([type, comp]) => {
    const entry: Record<string, unknown> = { type };
    if (comp.label) entry.label = comp.label;
    if (comp.category) entry.category = comp.category;
    if (comp.fields) {
      entry.fields = Object.entries(comp.fields).map(([name, def]) => fieldSpec(name, def));
    }
    if (comp.defaultProps) entry.defaultProps = comp.defaultProps;
    if (comp.variants) {
      entry.variants = Object.fromEntries(
        Object.entries(comp.variants).map(([k, v]) => [k, v.props]),
      );
    }
    if (comp.acceptsChildren !== undefined) entry.acceptsChildren = comp.acceptsChildren;
    if (comp.allowedParents) entry.allowedParents = comp.allowedParents;
    return entry;
  });
  return JSON.stringify(catalog);
}

/**
 * System prompt: the output contract + the catalog. The response format is the
 * editor's FOLDED node shape (slot children inline in props arrays) — the exact
 * shape `insertNode`/`extractDefaultSlots` already unpacks into zones, so the
 * parsed result inserts through the standard, battle-tested path.
 */
export function buildSectionSystemPrompt(config: StudioConfig): string {
  return [
    'Sen bir sayfa editörü için bölüm üreten asistansın.',
    'Kullanıcının isteğine uygun TEK bir bölüm (node ağacı) üret.',
    '',
    'KURALLAR:',
    '- SADECE geçerli JSON döndür: tek bir node objesi { "type": string, "props": object }. Açıklama, markdown, kod bloğu YOK.',
    '- Yalnızca aşağıdaki katalogdaki component tiplerini kullan. Katalogda olmayan tip UYDURMA.',
    '- Alan değerlerini her component\'in "fields" tanımına göre doldur; select alanlarında yalnızca listelenen options değerlerini kullan.',
    '- Slot alanları (slot:true): çocuk node\'ları props içinde o alan adıyla bir DİZİ olarak ver: "cols": [{ "type": "...", "props": {...} }].',
    '- "id" alanı YAZMA (editör kendisi üretir).',
    '- İçerik dili: kullanıcının istek dili.',
    '',
    `KATALOG: ${buildComponentCatalog(config)}`,
  ].join('\n');
}

/** User prompt: the request, lightly framed. */
export const buildSectionUserPrompt = (request: string): string =>
  `İstek: ${request.trim()}\nSadece JSON node objesini döndür.`;
