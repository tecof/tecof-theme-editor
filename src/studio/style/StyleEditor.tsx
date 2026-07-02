import React, { useEffect, useRef, useState } from 'react';
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
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { cloneStyles, isEmptyStyles } from './styleClipboard';
import { ColorPicker } from './ColorPicker';

/** True when a style layer carries at least one set property. */
const hasProps = (props?: StyleProps): boolean =>
  !!props && Object.values(props).some(Boolean);

type Viewport = 'desktop' | 'tablet' | 'mobile';

/** TopBar viewport → the style breakpoint that canvas width most represents. */
const VIEWPORT_TO_BP: Record<Viewport, Breakpoint> = {
  desktop: 'base',
  tablet: 'md',
  mobile: 'sm',
};

/** Style breakpoint → the TopBar viewport that previews this layer. */
const BP_TO_VIEWPORT: Record<Breakpoint, Viewport> = {
  base: 'desktop',
  sm: 'mobile',
  md: 'tablet',
  lg: 'desktop',
  xl: 'desktop',
};

const STATE_VARIANTS: StateVariant[] = ['hover', 'focus', 'active'];

/**
 * True when a breakpoint carries any explicit value: its normal layer OR any of
 * its state layers (`hover` at base, `md:hover` at `md`, …).
 */
const bpHasOverrides = (styles: NodeStyles, bp: Breakpoint): boolean =>
  hasProps(styles[bp]) ||
  STATE_VARIANTS.some((s) =>
    hasProps(styles.states?.[bp === 'base' ? s : `${bp}:${s}`])
  );

/**
 * Shared "this layer has an explicit value" badge. Same visual language as the
 * original breakpoint-segment dot; `inline` renders it in-flow (control labels)
 * instead of pinned to a segment button corner.
 */
const OverrideBadge = ({ title, inline }: { title: string; inline?: boolean }) => (
  <span
    className={`tecof-style-seg-dot${inline ? ' tecof-style-seg-dot--inline' : ''}`}
    title={title}
    aria-hidden="true"
  />
);

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
  // Start on the layer matching the current canvas viewport (non-reactive read;
  // live changes are handled by the subscription below).
  const [bp, setBp] = useState<Breakpoint>(
    () => VIEWPORT_TO_BP[useEditorStore.getState().viewport]
  );
  const [state, setState] = useState<'base' | StateVariant>('base');

  const setViewport = useEditorStore((s) => s.setViewport);

  // ── Two-way viewport ⇄ breakpoint sync ──
  // `syncingViewportRef` flags viewport writes WE initiated from a breakpoint
  // pick, so our own subscription ignores them (no loop, and picking `lg`/`xl`
  // is never bounced back to `base`). `bpRef` mirrors `bp` for reads inside the
  // non-reactive store listener.
  const syncingViewportRef = useRef(false);
  const bpRef = useRef(bp);
  bpRef.current = bp;

  // Viewport → breakpoint: follow REAL viewport changes only (TopBar clicks
  // etc.). Skip when the current bp already previews at that viewport.
  useEffect(
    () =>
      useEditorStore.subscribe((cur, prev) => {
        if (cur.viewport === prev.viewport) return;
        if (syncingViewportRef.current) return;
        if (BP_TO_VIEWPORT[bpRef.current] === cur.viewport) return;
        setBp(VIEWPORT_TO_BP[cur.viewport]);
      }),
    []
  );

  // Breakpoint → viewport: picking a layer switches the canvas to the matching
  // width so the user immediately previews what they are editing.
  const selectBp = (next: Breakpoint) => {
    setBp(next);
    const target = BP_TO_VIEWPORT[next];
    if (useEditorStore.getState().viewport !== target) {
      syncingViewportRef.current = true;
      setViewport(target);
      syncingViewportRef.current = false;
    }
  };

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
            // Badge covers the normal layer AND the bp's state layers (`md` +
            // `md:hover` …), so a hover-only override still marks its bp.
            const overridden = bpHasOverrides(styles, b.key);
            return (
              <button
                key={b.key}
                type="button"
                className={`tecof-style-seg-btn${bp === b.key ? ' is-active' : ''}`}
                onClick={() => selectBp(b.key)}
              >
                {b.label}
                {overridden && <OverrideBadge title="Bu kırılımda özelleştirildi" />}
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
                {overridden && <OverrideBadge title="Bu durumda özelleştirildi" />}
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
        {/* Same badge language as the breakpoint buttons: an explicit value is
            set for this control in the ACTIVE layer (bp + state). Applies to
            every control type — segment, select and color alike. */}
        {value && <OverrideBadge inline title="Bu katmanda özelleştirildi" />}
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
