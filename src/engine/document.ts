import type { TecofDocument, PuckPageData } from '../types';

export const createEmptyDocument = (): TecofDocument => ({
  root: { props: {} },
  content: [],
  zones: {},
});

export const EMPTY_DOCUMENT: TecofDocument = createEmptyDocument();

const cloneValue = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, cloneValue(child)])
    ) as T;
  }

  return value;
};

export const cloneDocument = (doc: TecofDocument): TecofDocument => ({
  root: {
    props: cloneValue(doc.root?.props || {}),
  },
  content: (doc.content || []).map((node) => ({
    type: node.type,
    props: cloneValue(node.props || {}),
  })),
  zones: Object.fromEntries(
    Object.entries(doc.zones || {}).map(([zoneKey, nodes]) => [
      zoneKey,
      nodes.map((node) => ({
        type: node.type,
        props: cloneValue(node.props || {}),
      })),
    ])
  ),
});

/**
 * Parses raw data into a TecofDocument.
 * For now, this is an identity function since PuckPageData and TecofDocument share the same shape.
 * It ensures we always return a valid document structure.
 */
export const parseDocument = (rawData: Partial<PuckPageData> | null | undefined): TecofDocument => {
  if (!rawData) return createEmptyDocument();

  return {
    root: rawData.root || { props: {} },
    content: [...(rawData.content || [])],
    zones: Object.fromEntries(
      Object.entries(rawData.zones || {}).map(([zoneKey, nodes]) => [zoneKey, [...nodes]])
    ),
  } as TecofDocument;
};

/**
 * Structural validation for externally supplied page data (JSON import).
 * `parseDocument` tolerates missing top-level fields, but nodes without a
 * `type` string or `props.id` break the editor — reject those up front.
 * Returns a Turkish error message, or null when the data is acceptable.
 */
export const validatePageData = (raw: any): string | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return 'Dosya bir sayfa dokümanı içermiyor (obje bekleniyor).';
  }

  const checkNodes = (nodes: any, where: string): string | null => {
    if (!Array.isArray(nodes)) return `${where} bir dizi olmalı.`;
    for (const node of nodes) {
      if (!node || typeof node !== 'object') return `${where} içinde geçersiz düğüm var.`;
      if (typeof node.type !== 'string' || !node.type) {
        return `${where} içindeki bir düğümde "type" alanı eksik.`;
      }
      if (!node.props || typeof node.props !== 'object' || typeof node.props.id !== 'string' || !node.props.id) {
        return `${where} içindeki "${node.type}" düğümünde "props.id" eksik.`;
      }
    }
    return null;
  };

  if (raw.content !== undefined) {
    const err = checkNodes(raw.content, 'content');
    if (err) return err;
  }

  if (raw.zones !== undefined) {
    if (!raw.zones || typeof raw.zones !== 'object' || Array.isArray(raw.zones)) {
      return '"zones" bir obje olmalı.';
    }
    for (const [zoneKey, nodes] of Object.entries(raw.zones)) {
      const err = checkNodes(nodes, `zones["${zoneKey}"]`);
      if (err) return err;
    }
  }

  if (raw.root !== undefined && (typeof raw.root !== 'object' || raw.root === null || Array.isArray(raw.root))) {
    return '"root" bir obje olmalı.';
  }

  if (raw.content === undefined && raw.zones === undefined && raw.root === undefined) {
    return 'Dosyada content / zones / root alanlarından hiçbiri yok — Tecof sayfa dosyası değil.';
  }

  return null;
};

/**
 * Serializes a TecofDocument back into a format compatible with PuckPageData.
 * It ensures a lossless round-trip.
 */
export const serializeDocument = (doc: TecofDocument): PuckPageData => {
  // Deep-copy so consumers mutating the returned object can't corrupt the
  // store's live document state (bypassing immer/history). cloneDocument
  // produces the same `{ content, root, zones }` shape PuckPageData expects.
  const cloned = cloneDocument(doc);
  return {
    root: cloned.root,
    content: cloned.content,
    zones: cloned.zones,
  };
};
