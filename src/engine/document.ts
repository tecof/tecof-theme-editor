import type { TecofDocument, PuckPageData } from '../types';

export const EMPTY_DOCUMENT: TecofDocument = {
  root: { props: {} },
  content: [],
  zones: {},
};

/**
 * Parses raw data into a TecofDocument.
 * For now, this is an identity function since PuckPageData and TecofDocument share the same shape.
 * It ensures we always return a valid document structure.
 */
export const parseDocument = (rawData: Partial<PuckPageData> | null | undefined): TecofDocument => {
  if (!rawData) return { ...EMPTY_DOCUMENT };

  return {
    root: rawData.root || { props: {} },
    content: rawData.content || [],
    zones: rawData.zones || {},
  };
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
