import { describe, it, expect } from 'vitest';
import { migrateDocument } from '../migrate';
import type { MigrationConfig, TecofDocument } from '../../types';

const doc = (): TecofDocument => ({
  root: { props: {} },
  content: [
    { type: 'Hero', props: { id: 'h1', title: 'Hi' } },
    { type: 'Card', props: { id: 'c1', text: 'x' } },
  ],
  zones: {
    'c1:body': [{ type: 'Card', props: { id: 'c2', text: 'y' } }],
  },
});

describe('migrateDocument', () => {
  it('returns the document untouched when no migration is provided', () => {
    const d = doc();
    expect(migrateDocument(d, undefined)).toBe(d);
  });

  it('renames component types across content and zones', () => {
    const migration: MigrationConfig = { renameComponents: { Card: 'Tile' } };
    const out = migrateDocument(doc(), migration);
    expect(out.content.map((n) => n.type)).toEqual(['Hero', 'Tile']);
    expect(out.zones['c1:body'][0].type).toBe('Tile');
    // Zone keys are id-based, so the rename does not touch them.
    expect(Object.keys(out.zones)).toEqual(['c1:body']);
  });

  it('applies transformProps by resulting type and preserves the id', () => {
    const migration: MigrationConfig = {
      transformProps: {
        Hero: (p) => ({ heading: p.title }), // drops title, adds heading, no id
      },
    };
    const out = migrateDocument(doc(), migration);
    const hero = out.content[0];
    expect(hero.props.heading).toBe('Hi');
    expect(hero.props.title).toBeUndefined();
    expect(hero.props.id).toBe('h1'); // id always preserved
  });

  it('looks up transformProps by the type AFTER rename', () => {
    const migration: MigrationConfig = {
      renameComponents: { Card: 'Tile' },
      transformProps: { Tile: (p) => ({ ...p, migrated: true }) },
    };
    const out = migrateDocument(doc(), migration);
    expect(out.content[1]).toMatchObject({ type: 'Tile', props: { id: 'c1', migrated: true } });
    expect(out.zones['c1:body'][0]).toMatchObject({ type: 'Tile', props: { migrated: true } });
  });

  it('runs the custom migrate pass last', () => {
    const migration: MigrationConfig = {
      transformProps: { Hero: (p) => ({ ...p, step: 1 }) },
      migrate: (d) => ({
        ...d,
        content: d.content.map((n) =>
          n.type === 'Hero' ? { ...n, props: { ...n.props, step: n.props.step + 1 } } : n
        ),
      }),
    };
    const out = migrateDocument(doc(), migration);
    expect(out.content[0].props.step).toBe(2); // transform (1) then migrate (+1)
  });

  it('stamps the schema version and is idempotent on re-run', () => {
    const migration: MigrationConfig = {
      version: 2,
      transformProps: { Hero: (p) => ({ ...p, n: (p.n ?? 0) + 1 }) },
    };
    const first = migrateDocument(doc(), migration);
    expect(first.root.props._schemaVersion).toBe(2);
    expect(first.content[0].props.n).toBe(1);

    // Already stamped at the target version → returned untouched (n stays 1).
    const second = migrateDocument(first, migration);
    expect(second).toBe(first);
    expect(second.content[0].props.n).toBe(1);
  });

  it('does not stamp when no version is declared', () => {
    const out = migrateDocument(doc(), { renameComponents: { Card: 'Tile' } });
    expect(out.root.props._schemaVersion).toBeUndefined();
  });

  it('leaves props untouched when a transform throws', () => {
    const migration: MigrationConfig = {
      transformProps: {
        Hero: () => {
          throw new Error('bad transform');
        },
      },
    };
    const out = migrateDocument(doc(), migration);
    expect(out.content[0].props).toEqual({ id: 'h1', title: 'Hi' });
  });
});
