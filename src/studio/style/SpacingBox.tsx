import React from 'react';
import { CONTROL_BY_ID, isArbitrary, arbitraryRaw, toArbitrary } from './tokens';
import type { StyleProps } from './types';

/**
 * Visual box-model editor for the spacing group: a DevTools-style nested
 * margin/padding box with one editable cell per side, plus compact shorthand
 * cells (Tümü / X / Y) below. Each cell accepts a Tailwind spacing token
 * (`4`) or a custom value (`10px`, `2rem`) which is stored bracket-wrapped as
 * an arbitrary token — the same encoding the +/× custom input used.
 *
 * Sides without an explicit value show the value they RESOLVE to as a faint
 * placeholder, following the shorthand chain in the active layer first
 * (`pt` ← `py` ← `p`), then the same chain in the inherited layer.
 */

const FALLBACKS: Record<string, string[]> = {
  p: ['p'], px: ['px', 'p'], py: ['py', 'p'],
  pt: ['pt', 'py', 'p'], pb: ['pb', 'py', 'p'],
  pl: ['pl', 'px', 'p'], pr: ['pr', 'px', 'p'],
  m: ['m'], mx: ['mx', 'm'], my: ['my', 'm'],
  mt: ['mt', 'my', 'm'], mb: ['mb', 'my', 'm'],
  ml: ['ml', 'mx', 'm'], mr: ['mr', 'mx', 'm'],
};

/** Control ids the box renders; StyleEditor hides their default rows. */
export const SPACING_BOX_IDS = new Set(Object.keys(FALLBACKS));

/** Stored token → what the input shows: arbitrary values unwrap to their raw form. */
const display = (v?: string) => (v ? arbitraryRaw(v) : '');

/**
 * Input text → stored token. Bare numbers stay bare (Tailwind scale, `p-7` is
 * valid even off the preset list); everything else becomes an arbitrary token.
 */
const parseSpaceToken = (raw: string): string => {
  const t = raw.trim();
  if (!t) return '';
  if (/^\d+(\.\d+)?$/.test(t)) return t;
  if (isArbitrary(t)) return t;
  return toArbitrary(t);
};

interface CellProps {
  id: string;
  layer: StyleProps;
  inherited: StyleProps;
  onSet: (controlId: string, value: string) => void;
}

const SpaceCell = ({ id, layer, inherited, onSet }: CellProps) => {
  const explicit = layer[id] || '';

  // Effective value as a faint hint when this side has nothing explicit.
  let hint = '';
  if (!explicit) {
    for (const key of FALLBACKS[id]) {
      if (layer[key]) { hint = display(layer[key]); break; }
    }
    if (!hint) {
      for (const key of FALLBACKS[id]) {
        if (inherited[key]) { hint = display(inherited[key]); break; }
      }
    }
  }

  const label = CONTROL_BY_ID[id]?.label ?? id;

  return (
    <input
      // Remount when the stored value changes externally (chip remove, paste),
      // so the uncontrolled draft never goes stale.
      key={explicit}
      type="text"
      className={`tecof-spacebox-cell${explicit ? ' is-set' : ''}`}
      defaultValue={display(explicit)}
      placeholder={hint || '–'}
      title={`${label} — ölçek (0–24) veya özel değer (ör. 10px)`}
      spellCheck={false}
      onBlur={(e) => {
        const next = parseSpaceToken(e.target.value);
        if (next !== explicit) onSet(id, next);
      }}
      onKeyDown={(e) => {
        const input = e.target as HTMLInputElement;
        if (e.key === 'Enter') input.blur();
        if (e.key === 'Escape') {
          input.value = display(explicit);
          input.blur();
        }
      }}
    />
  );
};

export interface SpacingBoxProps {
  /** Explicit values of the active layer (bp + state). */
  layer: StyleProps;
  /** Values resolved from less-specific layers (placeholder hints). */
  inherited: StyleProps;
  /** Commits one spacing control (empty string clears). */
  onSet: (controlId: string, value: string) => void;
}

export const SpacingBox = ({ layer, inherited, onSet }: SpacingBoxProps) => {
  const cell = (id: string) => (
    <SpaceCell id={id} layer={layer} inherited={inherited} onSet={onSet} />
  );

  return (
    <div className="tecof-spacebox-wrap">
      <div className="tecof-spacebox">
        <span className="tecof-spacebox-tag">margin</span>
        <div className="tecof-spacebox-row">{cell('mt')}</div>
        <div className="tecof-spacebox-mid">
          {cell('ml')}
          <div className="tecof-spacebox-inner">
            <span className="tecof-spacebox-tag">padding</span>
            <div className="tecof-spacebox-row">{cell('pt')}</div>
            <div className="tecof-spacebox-mid">
              {cell('pl')}
              <div className="tecof-spacebox-core" aria-hidden="true" />
              {cell('pr')}
            </div>
            <div className="tecof-spacebox-row">{cell('pb')}</div>
          </div>
          {cell('mr')}
        </div>
        <div className="tecof-spacebox-row">{cell('mb')}</div>
      </div>

      <div className="tecof-spacebox-shorthands">
        <span className="tecof-spacebox-sh-label" aria-hidden="true" />
        <span className="tecof-spacebox-sh-head">Tümü</span>
        <span className="tecof-spacebox-sh-head">X</span>
        <span className="tecof-spacebox-sh-head">Y</span>
        <span className="tecof-spacebox-sh-label">Padding</span>
        {cell('p')}
        {cell('px')}
        {cell('py')}
        <span className="tecof-spacebox-sh-label">Margin</span>
        {cell('m')}
        {cell('mx')}
        {cell('my')}
      </div>
    </div>
  );
};

export default SpacingBox;
