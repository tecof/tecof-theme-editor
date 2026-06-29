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
 * Serializes a TecofDocument back into a format compatible with PuckPageData.
 * It ensures a lossless round-trip.
 */
export const serializeDocument = (doc: TecofDocument): PuckPageData => {
  return {
    root: doc.root,
    content: doc.content,
    zones: doc.zones,
  };
};
