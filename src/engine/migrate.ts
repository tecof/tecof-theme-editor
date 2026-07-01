import type { MigrationConfig, TecofDocument, TecofNode } from '../types';

/**
 * Applies rename + prop-transform to a single node. The node id is always
 * preserved. A throwing transform leaves the node's props untouched rather than
 * corrupting the document.
 */
const migrateNode = (node: TecofNode, migration: MigrationConfig): TecofNode => {
  const renamed = migration.renameComponents?.[node.type];
  const type = renamed ?? node.type;
  // transformProps is keyed by the RESULTING type (after any rename).
  const transform = migration.transformProps?.[type];

  if (!renamed && !transform) return node;

  let props = node.props;
  if (transform) {
    try {
      props = { ...transform(node.props), id: node.props.id };
    } catch {
      props = node.props;
    }
  }
  return { type, props };
};

/**
 * Upgrades a saved document to the current component/prop schema.
 *
 * Order: `renameComponents` → `transformProps` → `migrate` (custom). Zone keys
 * are keyed by node **id** (not type), so a rename never requires rewriting them.
 * When `migration.version` is set, a document already stamped at/above that
 * version is returned untouched (idempotence for persisted data); after running,
 * the version is stamped on `root.props._schemaVersion` so a later save persists
 * it and future loads skip the work.
 *
 * A no-op (`return doc`) when `migration` is undefined — existing hosts are
 * unaffected.
 */
export const migrateDocument = (
  doc: TecofDocument,
  migration?: MigrationConfig
): TecofDocument => {
  if (!migration) return doc;

  const target = migration.version;
  const current = Number(doc.root?.props?._schemaVersion ?? 0);
  if (target != null && current >= target) return doc;

  const content = doc.content ?? [];
  const zones = doc.zones ?? {};

  let next: TecofDocument = {
    root: doc.root ?? { props: {} },
    content:
      migration.renameComponents || migration.transformProps
        ? content.map((n) => migrateNode(n, migration))
        : content,
    zones:
      migration.renameComponents || migration.transformProps
        ? Object.fromEntries(
            Object.entries(zones).map(([key, items]) => [
              key,
              items.map((n) => migrateNode(n, migration)),
            ])
          )
        : zones,
  };

  if (typeof migration.migrate === 'function') {
    try {
      next = migration.migrate(next) ?? next;
    } catch {
      // A throwing custom pass keeps the structural result rather than crashing.
    }
  }

  if (target != null) {
    next = {
      ...next,
      root: {
        ...next.root,
        props: { ...(next.root?.props ?? {}), _schemaVersion: target },
      },
    };
  }

  return next;
};
