import React, { useState } from 'react';
import { STYLE_CONTROLS, GROUP_LABELS, type StyleControl, type StyleGroup } from './tokens';
import type { NodeStyles, StyleProps, Breakpoint, StateVariant } from './types';

export interface StyleEditorProps {
  value?: NodeStyles;
  onChange: (next: NodeStyles) => void;
}

const BREAKPOINTS: { key: Breakpoint; label: string }[] = [
  { key: 'base', label: 'Genel' },
  { key: 'sm', label: 'sm' },
  { key: 'md', label: 'md' },
  { key: 'lg', label: 'lg' },
  { key: 'xl', label: 'xl' },
];

const STATES: { key: 'base' | StateVariant; label: string }[] = [
  { key: 'base', label: 'Normal' },
  { key: 'hover', label: 'Hover' },
  { key: 'focus', label: 'Focus' },
  { key: 'active', label: 'Active' },
];

const GROUP_ORDER: StyleGroup[] = ['layout', 'spacing', 'sizing', 'typography', 'background', 'border', 'effects'];

export const StyleEditor = ({ value, onChange }: StyleEditorProps) => {
  const styles: NodeStyles = value || {};
  const [bp, setBp] = useState<Breakpoint>('base');
  const [state, setState] = useState<'base' | StateVariant>('base');

  // The style layer currently being edited (breakpoint OR a state bucket).
  const layer: StyleProps =
    state === 'base' ? styles[bp] || {} : styles.states?.[state] || {};

  const setLayerValue = (controlId: string, raw: string) => {
    const nextLayer: StyleProps = { ...layer };
    if (raw) nextLayer[controlId] = raw;
    else delete nextLayer[controlId];

    if (state === 'base') {
      onChange({ ...styles, [bp]: nextLayer });
    } else {
      onChange({ ...styles, states: { ...styles.states, [state]: nextLayer } });
    }
  };

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    controls: STYLE_CONTROLS.filter((c) => c.group === group),
  })).filter((g) => g.controls.length > 0);

  return (
    <div className="tecof-style-editor">
      {/* Breakpoint + state selectors */}
      <div className="tecof-style-scopes">
        <div className="tecof-style-seg" role="group" aria-label="Breakpoint">
          {BREAKPOINTS.map((b) => (
            <button
              key={b.key}
              type="button"
              className={`tecof-style-seg-btn${bp === b.key ? ' is-active' : ''}`}
              onClick={() => setBp(b.key)}
            >
              {b.label}
            </button>
          ))}
        </div>
        <div className="tecof-style-seg" role="group" aria-label="Durum">
          {STATES.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`tecof-style-seg-btn${state === s.key ? ' is-active' : ''}`}
              onClick={() => setState(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control groups */}
      {grouped.map(({ group, controls }) => (
        <div key={group} className="tecof-style-group">
          <div className="tecof-style-group-title">{GROUP_LABELS[group]}</div>
          {controls.map((control) => (
            <ControlRow
              key={control.id}
              control={control}
              value={layer[control.id] || ''}
              onChange={(v) => setLayerValue(control.id, v)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const ControlRow = ({
  control,
  value,
  onChange,
}: {
  control: StyleControl;
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="tecof-style-row">
      <span className="tecof-style-label">{control.label}</span>
      <div className="tecof-style-control">
        {control.type === 'color' ? (
          <div className="tecof-style-swatches">
            {control.options.map((opt) => {
              const isNone = opt.value === '';
              return (
                <button
                  key={opt.value || 'none'}
                  type="button"
                  title={opt.label}
                  className={`tecof-style-swatch${value === opt.value ? ' is-active' : ''}${isNone ? ' is-none' : ''}`}
                  style={!isNone ? ({ '--swatch': opt.swatch || opt.value } as React.CSSProperties) : undefined}
                  onClick={() => onChange(opt.value)}
                />
              );
            })}
          </div>
        ) : control.type === 'segment' ? (
          <div className="tecof-style-seg">
            {control.options.map((opt) => (
              <button
                key={opt.value || 'none'}
                type="button"
                className={`tecof-style-seg-btn${value === opt.value ? ' is-active' : ''}`}
                onClick={() => onChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <select
            className="tecof-input-select tecof-style-select"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {control.options.map((opt) => (
              <option key={opt.value || 'none'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default StyleEditor;
