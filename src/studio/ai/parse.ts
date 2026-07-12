/**
 * Parsing + validation of the AI section response. Pure and defensive: models
 * wrap JSON in fences, add prose, hallucinate component types — everything
 * suspicious is either repaired (fences/prose stripped) or rejected with a
 * Turkish, user-facing error. The validated result is a FOLDED TecofNode
 * (slot children inline in props), which `insertNode` unpacks safely with
 * fresh ids — the AI can never smuggle ids or unknown node shapes in.
 */

import type { StudioConfig, TecofNode } from '../../types';

export class AiParseError extends Error {}

/** Extracts the outermost JSON object from raw model text (fences/prose tolerated). */
const extractJson = (text: string): string => {
  // Prefer a fenced block when present.
  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const candidate = fence ? fence[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end <= start) {
    throw new AiParseError('Yanıtta JSON bulunamadı — tekrar deneyin.');
  }
  return candidate.slice(start, end + 1);
};

/** True for a node-shaped object: { type: string, props?: object }. */
const isNodeShape = (v: unknown): v is { type: string; props?: Record<string, unknown> } =>
  !!v &&
  typeof v === 'object' &&
  typeof (v as any).type === 'string' &&
  ((v as any).props === undefined || typeof (v as any).props === 'object');

/**
 * Recursively validates + sanitizes one node against the config:
 *  - unknown component types are rejected (no hallucinated components),
 *  - `id` is stripped everywhere (the editor generates fresh ones),
 *  - arrays that LOOK like node lists are validated as slot children,
 *  - depth is capped so a malicious/looping response can't blow the stack.
 */
const sanitizeNode = (
  raw: unknown,
  config: StudioConfig,
  depth: number,
): TecofNode => {
  if (depth > 12) throw new AiParseError('Bölüm ağacı çok derin — tekrar deneyin.');
  if (!isNodeShape(raw)) {
    throw new AiParseError('Yanıt geçerli bir bileşen düğümü değil — tekrar deneyin.');
  }
  if (!config.components?.[raw.type]) {
    throw new AiParseError(`Bilinmeyen bileşen tipi: "${raw.type}" — tekrar deneyin.`);
  }

  const props: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw.props ?? {})) {
    if (key === 'id') continue; // ids are always editor-generated
    if (Array.isArray(value) && value.length > 0 && value.every(isNodeShape)) {
      props[key] = value.map((child) => sanitizeNode(child, config, depth + 1));
    } else {
      props[key] = value;
    }
  }

  return { type: raw.type, props } as TecofNode;
};

/**
 * Parses the model's raw text into a validated, folded TecofNode ready for
 * `insertNode`. Throws {@link AiParseError} with a user-facing message on any
 * malformed/invalid response.
 */
export function parseAiSection(text: string, config: StudioConfig): TecofNode {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(text));
  } catch (e) {
    if (e instanceof AiParseError) throw e;
    throw new AiParseError('Yanıt JSON olarak çözümlenemedi — tekrar deneyin.');
  }
  return sanitizeNode(parsed, config, 0);
}
