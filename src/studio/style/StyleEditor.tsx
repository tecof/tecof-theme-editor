import React, { useEffect, useRef, useState } from 'react';
import { STYLE_CONTROLS, GROUP_LABELS, CONTROL_BY_ID, type StyleControl, type StyleGroup } from './tokens';
import type { NodeStyles, StyleProps, Breakpoint, StateVariant } from './types';
import { useEditorStore } from '../../engine/store';
import { copyStyles, readStyles, useHasClipboardStyles } from './clipboard';

export interface StyleEditorProps {
  value?: NodeStyles;
  onChange: (next: NodeStyles | undefined) => void;
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

/** Canvas viewport → the breakpoint layer it actually previews. */
const VIEWPORT_TO_BP: Record<'desktop' | 'tablet' | 'mobile', Breakpoint> = {
  desktop: 'base',
  tablet: 'md',
  mobile: 'sm',
};

/** Box-model spacing controls are rendered by the visual diagram, not as plain rows. */
const BOX_PADDING = ['pt', 'pr', 'pb', 'pl'] as const;
const BOX_MARGIN = ['mt', 'mr', 'mb', 'ml'] as const;
const BOX_SIDE_IDS = new Set<string>([...BOX_PADDING, ...BOX_MARGIN]);

export const StyleEditor = ({ value, onChange }: StyleEditorProps) => {
  const styles: NodeStyles = value || {};
  const viewport = useEditorStore((s) => s.viewport);
  const hasClipboard = useHasClipboardStyles();

  const [bp, setBp] = useState<Breakpoint>(() => VIEWPORT_TO_BP[viewport]);
  const [state, setState] = useState<'base' | StateVariant>('base');

  // Viewport ↔ breakpoint sync: when the canvas viewport changes, snap the active
  // breakpoint to match. A manual bp click sticks until the viewport next changes
  // (we only re-sync on an actual viewport transition, tracked via this ref).
  const lastViewport = useRef(viewport);
  useEffect(() => {
    if (lastViewport.current !== viewport) {
      lastViewport.current = viewport;
      setBp(VIEWPORT_TO_BP[viewport]);
    }
  }, [viewport]);

  // The style layer currently being edited (breakpoint OR a state bucket).
  const layer: StyleProps =
    state === 'base' ? styles[bp] || {} : styles.states?.[state] || {};

  // Base layer used to surface inherited values when editing a derived layer.
  const baseLayer: StyleProps = styles.base || {};
  const isDerivedLayer = state !== 'base' || bp !== 'base';

  const writeLayer = (nextLayer: StyleProps) => {
    if (state === 'base') {
      onChange({ ...styles, [bp]: nextLayer });
    } else {
      onChange({ ...styles, states: { ...styles.states, [state]: nextLayer } });
    }
  };

  const setLayerValue = (controlId: string, raw: string) => {
    const nextLayer: StyleProps = { ...layer };
    if (raw) nextLayer[controlId] = raw;
    else delete nextLayer[controlId];
    writeLayer(nextLayer);
  };

  /** Inherited (base) value for a control when editing a derived layer, else undefined. */
  const inheritedFor = (controlId: string): string | undefined =>
    isDerivedLayer ? baseLayer[controlId] || undefined : undefined;

  // ── Reset / clipboard actions ──
  const resetLayer = () => writeLayer({});
  const resetAll = () => onChange(undefined);
  const handleCopy = () => copyStyles(styles);
  const handlePaste = () => {
    const pasted = readStyles();
    if (pasted) onChange(pasted);
  };

  const layerHasValues = Object.values(layer).some(Boolean);
  const anyValues =
    Object.keys(styles).some((k) => k !== 'states' && Object.values(styles[k as Breakpoint] || {}).some(Boolean)) ||
    Object.values(styles.states || {}).some((p) => Object.values(p || {}).some(Boolean));

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    controls: STYLE_CONTROLS.filter((c) => c.group === group && !BOX_SIDE_IDS.has(c.id)),
  })).filter((g) => g.controls.length > 0);

  return (
    <div className="tecof-style-editor">
      {/* Header: copy / paste / reset */}
      <div className="tecof-style-toolbar">
        <button
          type="button"
          className="tecof-style-tool-btn"
          onClick={handleCopy}
          disabled={!anyValues}
          title="Bu öğenin tüm stilini panoya kopyala"
        >
          Stili kopyala
        </button>
        <button
          type="button"
          className="tecof-style-tool-btn"
          onClick={handlePaste}
          disabled={!hasClipboard}
          title="Panodaki stili bu öğeye uygula"
        >
          Stili yapıştır
        </button>
        <span className="tecof-style-tool-spacer" />
        <button
          type="button"
          className="tecof-style-tool-btn"
          onClick={resetLayer}
          disabled={!layerHasValues}
          title="Yalnızca seçili breakpoint/durum katmanını temizle"
        >
          Bu katmanı sıfırla
        </button>
        <button
          type="button"
          className="tecof-style-tool-btn is-danger"
          onClick={resetAll}
          disabled={!anyValues}
          title="Tüm stil ayarlarını temizle"
        >
          Tüm stili temizle
        </button>
      </div>

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
        {isDerivedLayer && (
          <div className="tecof-style-scope-hint">
            “Genel/Normal” katmanından miras alınan değerler soluk gösterilir.
          </div>
        )}
      </div>

      {/* Control groups */}
      {grouped.map(({ group, controls }) => (
        <div key={group} className="tecof-style-group">
          <div className="tecof-style-group-title">{GROUP_LABELS[group]}</div>
          {group === 'spacing' && (
            <BoxModel layer={layer} baseLayer={baseLayer} showInherited={isDerivedLayer} onChange={setLayerValue} />
          )}
          {controls.map((control) => (
            <ControlRow
              key={control.id}
              control={control}
              value={layer[control.id] || ''}
              inherited={inheritedFor(control.id)}
              onChange={(v) => setLayerValue(control.id, v)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Visual box-model editor: four margin inputs (outer ring) wrapping four padding
 * inputs (inner ring) around a label. Each input is a compact space-scale select.
 * Mirrors the browser devtools box diagram so per-side spacing reads at a glance.
 */
const BoxModel = ({
  layer,
  baseLayer,
  showInherited,
  onChange,
}: {
  layer: StyleProps;
  baseLayer: StyleProps;
  showInherited: boolean;
  onChange: (controlId: string, value: string) => void;
}) => {
  const spaceOptions = CONTROL_BY_ID.pt?.options ?? [];

  const SideInput = ({ id, edge }: { id: string; edge: string }) => {
    const value = layer[id] || '';
    const inherited = showInherited ? baseLayer[id] || '' : '';
    const control = CONTROL_BY_ID[id];
    return (
      <select
        className={`tecof-box-input tecof-box-input--${edge}${value ? ' has-value' : ''}`}
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        title={`${control?.label ?? id}${inherited ? ` · base: ${inherited}` : ''}`}
        aria-label={control?.label ?? id}
      >
        <option value="">{inherited ? `·${inherited}` : '·'}</option>
        {spaceOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="tecof-box-model" role="group" aria-label="Box model (boşluk)">
      <div className="tecof-box-margin">
        <span className="tecof-box-edge-label tecof-box-edge-label--margin">margin</span>
        <SideInput id="mt" edge="t" />
        <SideInput id="mr" edge="r" />
        <SideInput id="mb" edge="b" />
        <SideInput id="ml" edge="l" />
        <div className="tecof-box-padding">
          <span className="tecof-box-edge-label tecof-box-edge-label--padding">padding</span>
          <SideInput id="pt" edge="t" />
          <SideInput id="pr" edge="r" />
          <SideInput id="pb" edge="b" />
          <SideInput id="pl" edge="l" />
          <div className="tecof-box-core" aria-hidden="true" />
        </div>
      </div>
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
  // Show the inherited base value only when this layer doesn't override it.
  const showInherited = inherited != null && inherited !== '' && !value;
  return (
    <div className="tecof-style-row">
      <span className="tecof-style-label">
        {control.label}
        {showInherited && <span className="tecof-style-inherited">base: {inherited}</span>}
      </span>
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
