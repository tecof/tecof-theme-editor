import React, { useState } from 'react';
import { Copy, ClipboardPaste } from 'lucide-react';
import {
  STYLE_CONTROLS,
  GROUP_LABELS,
  isArbitrary,
  arbitraryRaw,
  toArbitrary,
  type StyleControl,
  type StyleGroup,
} from './tokens';
import type { NodeStyles, StyleProps, Breakpoint, StateVariant } from './types';
import { useUiStore } from '../uiStore';
import { cloneStyles, isEmptyStyles } from './styleClipboard';
import { ColorPicker } from './ColorPicker';

/** True when a style layer carries at least one set property. */
const hasProps = (props?: StyleProps): boolean =>
  !!props && Object.values(props).some(Boolean);

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

  // Style clipboard: copy this node's whole style object into the session buffer,
  // or replace this node's styles with the buffered ones. (See styleClipboard.ts.)
  const styleBuffer = useUiStore((s) => s.styleClipboard);
  const setStyleClipboard = useUiStore((s) => s.setStyleClipboard);

  // State buckets are breakpoint-scoped: a bare `hover` key = base breakpoint,
  // `md:hover` = the `md` breakpoint. The normal (non-state) layers stay keyed
  // by breakpoint directly.
  const stateKey = bp === 'base' ? state : `${bp}:${state}`;

  // The style layer currently being edited (breakpoint OR a state bucket).
  const layer: StyleProps =
    state === 'base' ? styles[bp] || {} : styles.states?.[stateKey] || {};

  // Values inherited from a less-specific layer, shown as faint placeholders so
  // the user can see what a property resolves to before overriding it here.
  //   - higher breakpoint, normal state → inherits `base`
  //   - any state layer                 → inherits the normal styles at this bp
  const inheritedLayer: StyleProps =
    state !== 'base'
      ? { ...(styles.base || {}), ...(bp !== 'base' ? styles[bp] || {} : {}) }
      : bp !== 'base'
        ? styles.base || {}
        : {};

  const setLayerValue = (controlId: string, raw: string) => {
    const nextLayer: StyleProps = { ...layer };
    if (raw) nextLayer[controlId] = raw;
    else delete nextLayer[controlId];

    if (state === 'base') {
      onChange({ ...styles, [bp]: nextLayer });
    } else {
      onChange({ ...styles, states: { ...styles.states, [stateKey]: nextLayer } });
    }
  };

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    controls: STYLE_CONTROLS.filter((c) => c.group === group),
  })).filter((g) => g.controls.length > 0);

  return (
    <div className="tecof-style-editor">
      {/* Copy / paste this node's entire style set (all breakpoints + states). */}
      <div className="tecof-style-editor-head">
        <span className="tecof-style-editor-title">Stil</span>
        <div className="tecof-style-editor-actions">
          <button
            type="button"
            className="tecof-style-head-btn"
            title="Stili kopyala"
            aria-label="Stili kopyala"
            disabled={isEmptyStyles(styles)}
            onClick={() => setStyleClipboard(cloneStyles(styles))}
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            className="tecof-style-head-btn"
            title="Stili yapıştır"
            aria-label="Stili yapıştır"
            disabled={!styleBuffer}
            onClick={() => styleBuffer && onChange(cloneStyles(styleBuffer))}
          >
            <ClipboardPaste size={13} />
          </button>
        </div>
      </div>

      {/* Breakpoint + state selectors */}
      <div className="tecof-style-scopes">
        <div className="tecof-style-seg" role="group" aria-label="Breakpoint">
          {BREAKPOINTS.map((b) => {
            const overridden = hasProps(styles[b.key]);
            return (
              <button
                key={b.key}
                type="button"
                className={`tecof-style-seg-btn${bp === b.key ? ' is-active' : ''}`}
                onClick={() => setBp(b.key)}
              >
                {b.label}
                {overridden && <span className="tecof-style-seg-dot" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <div className="tecof-style-seg" role="group" aria-label="Durum">
          {STATES.map((s) => {
            const overridden =
              s.key === 'base'
                ? BREAKPOINTS.some((b) => hasProps(styles[b.key]))
                : hasProps(styles.states?.[bp === 'base' ? s.key : `${bp}:${s.key}`]);
            return (
              <button
                key={s.key}
                type="button"
                className={`tecof-style-seg-btn${state === s.key ? ' is-active' : ''}`}
                onClick={() => setState(s.key)}
              >
                {s.label}
                {overridden && <span className="tecof-style-seg-dot" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Control groups */}
      {grouped.map(({ group, controls }) => (
        <div key={group} className="tecof-style-group">
          <div className="tecof-style-group-title">{GROUP_LABELS[group]}</div>
          {controls.map((control) => (
            <ControlRow
              // Keyed by layer so per-row local state (custom input drafts,
              // picker open state) resets when switching breakpoint/state.
              key={`${bp}:${state}:${control.id}`}
              control={control}
              value={layer[control.id] || ''}
              inherited={inheritedLayer[control.id]}
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
  inherited,
  onChange,
}: {
  control: StyleControl;
  value: string;
  inherited?: string;
  onChange: (value: string) => void;
}) => {
  const isColor = control.type === 'color';
  // Color controls own their custom (arbitrary) input inside the ColorPicker,
  // so the generic +/× toggle and free-text input only apply to other types.
  const supportsArbitrary = !!control.arbitraryPrefix && !isColor;
  // A value is "custom" only when it's an arbitrary literal the user typed — not
  // when it's a known option that merely happens to be encoded as arbitrary (e.g.
  // theme colors like `[var(--theme-color-primary)]`), which must render as a
  // selectable preset, not pop the custom text input.
  const matchesOption = control.options.some((o) => o.value === value);
  const valueIsArbitrary = supportsArbitrary && isArbitrary(value) && !matchesOption;
  // Custom mode is on when the stored value is arbitrary, or the user toggled it.
  const [customOpen, setCustomOpen] = useState(valueIsArbitrary);

  // Faint placeholder showing what this property resolves to from a less-specific
  // layer, when nothing is set here.
  const inheritedOption = inherited ? control.options.find((o) => o.value === inherited) : undefined;
  const inheritedLabel = inherited ? inheritedOption?.label ?? arbitraryRaw(inherited) : '';
  const custom = customOpen || valueIsArbitrary;

  // While in custom mode the presets read as "none-selected" (the active value
  // lives in the text input instead).
  const presetValue = valueIsArbitrary ? '' : value;

  const commitCustom = (raw: string) => {
    const trimmed = raw.trim();
    onChange(trimmed ? toArbitrary(trimmed) : '');
  };

  return (
    <div className={`tecof-style-row${value ? ' is-active' : ''}`}>
      <span className="tecof-style-label">
        {control.label}
        {value && <span className="tecof-style-row-active-dot" title="Özel değer tanımlı" />}
        {!value && inheritedLabel && (
          <span className="tecof-style-inherited" title={`Devralınan değer: ${inheritedLabel}`}>
            {inheritedLabel}
          </span>
        )}
      </span>
      <div className="tecof-style-control">
        {control.type === 'color' ? (
          <ColorPicker value={value} onChange={onChange} />
        ) : control.type === 'segment' ? (
          <div className="tecof-style-seg">
            {control.options.map((opt) => (
              <button
                key={opt.value || 'none'}
                type="button"
                className={`tecof-style-seg-btn${presetValue === opt.value ? ' is-active' : ''}`}
                onClick={() => onChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <select
            className="tecof-input-select tecof-style-select"
            value={presetValue}
            onChange={(e) => onChange(e.target.value)}
          >
            {control.options.map((opt) => (
              <option key={opt.value || 'none'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        {supportsArbitrary && (
          <button
            type="button"
            className={`tecof-style-custom-toggle${custom ? ' is-active' : ''}`}
            title="Özel değer"
            aria-pressed={custom}
            onClick={() => {
              if (custom) {
                // Leaving custom mode clears any arbitrary value.
                if (valueIsArbitrary) onChange('');
                setCustomOpen(false);
              } else {
                setCustomOpen(true);
              }
            }}
          >
            {custom ? '×' : '+'}
          </button>
        )}
      </div>
      {supportsArbitrary && custom && (
        <input
          type="text"
          className="tecof-input tecof-style-custom-input"
          placeholder={control.arbitraryPrefix + '-[…]'}
          defaultValue={valueIsArbitrary ? arbitraryRaw(value) : ''}
          onBlur={(e) => commitCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
        />
      )}
    </div>
  );
};

export default StyleEditor;
