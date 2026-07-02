import type { TecofDocument, TecofNode } from '../../types';

/** One multilingual prop with at least one missing translation. */
export interface TranslationGap {
  /** Owning node id ('root' for root props). */
  nodeId: string;
  /** Prop path within the node's props (dot-joined for nested objects). */
  propName: string;
  /** Language codes whose translation is missing or empty. */
  missing: string[];
}

export interface TranslationCoverage {
  /** Total number of missing (field, language) pairs across the document. */
  total: number;
  /** Missing count per language code. */
  missingByLang: Record<string, number>;
  /** Detailed list of fields with gaps. */
  gaps: TranslationGap[];
}

/** Entry shape of a multilingual field value: [{ code: 'tr', value: ... }, ...] */
interface LocalizedEntry {
  code: string;
  value: unknown;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Multilingual field heuristic: a non-empty array whose every element is an
 * object with a string `code` and a `value` key. Slot child arrays contain
 * `{ type, props }` objects and upload arrays contain `{ type: 'external', url }`
 * objects — neither has `code`/`value`, so they never match.
 */
const isLocalizedArray = (v: unknown): v is LocalizedEntry[] =>
  Array.isArray(v) &&
  v.length > 0 &&
  v.every(
    (el) => isPlainObject(el) && typeof el.code === 'string' && 'value' in el
  );

/**
 * Slot child array heuristic: every element looks like a TecofNode
 * (`{ type: string, props: object }`). These children are also stored in
 * `doc.zones`, so we skip them during props traversal to avoid double counting.
 */
const isSlotArray = (v: unknown): boolean =>
  Array.isArray(v) &&
  v.length > 0 &&
  v.every(
    (el) => isPlainObject(el) && typeof el.type === 'string' && isPlainObject(el.props)
  );

/**
 * True when a localized value is considered empty. Rich-text values are HTML
 * strings, so "<p></p>", "<p><br></p>" etc. count as empty: tags are stripped,
 * non-breaking spaces normalized, and the remainder trimmed. Non-string values
 * (e.g. localized link objects) are considered filled unless nullish.
 */
export const isEmptyLocalizedValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') {
    return value.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim() === '';
  }
  return false;
};

/**
 * Evaluates one multilingual field against the merchant language list.
 * Returns the language codes that are missing, or null when the field should
 * not be counted (i.e. it is empty in EVERY language — that is missing
 * content, not a missing translation).
 */
const missingLanguagesFor = (
  entries: LocalizedEntry[],
  languages: string[]
): string[] | null => {
  const filled = new Set<string>();
  for (const entry of entries) {
    if (!isEmptyLocalizedValue(entry.value)) filled.add(entry.code);
  }
  // No language has real content: nothing to translate yet.
  if (languages.every((code) => !filled.has(code))) return null;
  const missing = languages.filter((code) => !filled.has(code));
  return missing.length > 0 ? missing : null;
};

interface MutableCoverage {
  total: number;
  missingByLang: Record<string, number>;
  gaps: TranslationGap[];
}

/** Recursively walks a prop value looking for multilingual fields. */
const walkValue = (
  value: unknown,
  nodeId: string,
  path: string,
  languages: string[],
  acc: MutableCoverage
): void => {
  if (isLocalizedArray(value)) {
    const missing = missingLanguagesFor(value, languages);
    if (missing) {
      acc.gaps.push({ nodeId, propName: path, missing });
      acc.total += missing.length;
      for (const code of missing) {
        acc.missingByLang[code] = (acc.missingByLang[code] ?? 0) + 1;
      }
    }
    return; // A localized field is a leaf — don't recurse into its entries.
  }

  // Slot children are already visited via doc.zones; skipping them here keeps
  // every node counted exactly once (zones + content + root covers the tree).
  if (isSlotArray(value)) return;

  if (Array.isArray(value)) {
    value.forEach((el, i) => walkValue(el, nodeId, `${path}[${i}]`, languages, acc));
    return;
  }

  if (isPlainObject(value)) {
    for (const [key, nested] of Object.entries(value)) {
      walkValue(nested, nodeId, path ? `${path}.${key}` : key, languages, acc);
    }
  }
};

const walkNode = (node: TecofNode, languages: string[], acc: MutableCoverage): void => {
  const { id, ...rest } = node.props;
  const nodeId = typeof id === 'string' ? id : '(bilinmeyen)';
  for (const [key, value] of Object.entries(rest)) {
    walkValue(value, nodeId, key, languages, acc);
  }
};

/**
 * Scans the whole document (root props + content + every zone) and reports
 * multilingual fields whose translation is missing for some merchant language.
 *
 * A language counts as "missing" for a field when the field has real content
 * in at least one language, and for that language either there is no entry or
 * its value is empty (empty string / empty HTML like "<p></p>").
 */
export const collectTranslationGaps = (
  doc: TecofDocument,
  languages: string[]
): TranslationCoverage => {
  const acc: MutableCoverage = { total: 0, missingByLang: {}, gaps: [] };
  if (!doc || languages.length <= 1) return acc;

  for (const [key, value] of Object.entries(doc.root?.props ?? {})) {
    walkValue(value, 'root', key, languages, acc);
  }
  for (const node of doc.content ?? []) {
    walkNode(node, languages, acc);
  }
  for (const zoneNodes of Object.values(doc.zones ?? {})) {
    for (const node of zoneNodes) {
      walkNode(node, languages, acc);
    }
  }
  return acc;
};
