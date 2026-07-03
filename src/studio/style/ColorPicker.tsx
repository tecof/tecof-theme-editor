import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  COLOR_SECTIONS,
  isArbitrary,
  arbitraryRaw,
  toArbitrary,
  type StyleControlOption,
  type ColorSectionKey,
} from './tokens';
import { TAILWIND_PALETTE, TAILWIND_SHADES, tailwindSwatch, parsePaletteToken } from './palette';

/** #rgb / #rgba / #rrggbb / #rrggbbaa */
const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Expand `#abc` → `#aabbcc` so the native color input can display it. */
const toInputHex = (raw: string): string => {
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
  if (/^#[0-9a-f]{8}$/i.test(raw)) return raw.slice(0, 7);
  if (/^#[0-9a-f]{3,4}$/i.test(raw)) {
    const [r, g, b] = raw.slice(1, 4).split('');
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return '#000000';
};

const findOption = (value: string): StyleControlOption | undefined =>
  [...COLOR_SECTIONS.base, ...COLOR_SECTIONS.theme, ...COLOR_SECTIONS.brand].find(
    (o) => o.value === value
  );

/** Resolve the display label + preview swatch for the current token. */
const describeValue = (value: string): { label: string; swatch: string | null } => {
  if (!value) return { label: 'Yok', swatch: null };
  const option = findOption(value);
  if (option) return { label: option.label, swatch: option.swatch ?? option.value };
  const palette = parsePaletteToken(value);
  if (palette) {
    return {
      label: `${palette.hue.label} ${palette.shade}`,
      swatch: tailwindSwatch(palette.hue.name, palette.shade),
    };
  }
  if (isArbitrary(value)) {
    const raw = arbitraryRaw(value);
    return { label: raw, swatch: raw };
  }
  return { label: value, swatch: value };
};

const Swatch = ({
  option,
  active,
  onSelect,
}: {
  option: StyleControlOption;
  active: boolean;
  onSelect: (value: string) => void;
}) => {
  const isNone = option.value === '';
  return (
    <button
      type="button"
      title={option.label}
      className={`tecof-style-swatch${active ? ' is-active' : ''}${isNone ? ' is-none' : ''}`}
      style={!isNone ? ({ '--swatch': option.swatch || option.value } as React.CSSProperties) : undefined}
      onClick={() => onSelect(option.value)}
    />
  );
};

export interface ColorPickerProps {
  /** Stored token: '', 'white', 'primary-600', 'red-500', '[var(--theme-color-x)]' or '[#hex]'. */
  value: string;
  onChange: (value: string) => void;
  /**
   * Which panel sections to show (default: all). Controls with a bounded
   * safelist (gradient stops) exclude `'palette'` so users can't pick tokens
   * whose classes never make it into the production CSS.
   */
  sections?: ColorSectionKey[];
}

const ALL_SECTIONS: ColorSectionKey[] = ['base', 'theme', 'brand', 'palette', 'custom'];

/**
 * Color control for the style editor. Presents four token sources in one panel:
 * quick picks, live theme colors, the brand (primary) scale, the full Tailwind
 * default palette and a free color-picker that stores an arbitrary hex token.
 */
export const ColorPicker = ({ value, onChange, sections = ALL_SECTIONS }: ColorPickerProps) => {
  const [open, setOpen] = useState(false);
  const { label, swatch } = describeValue(value);
  const show = (key: ColorSectionKey) => sections.includes(key);

  const paletteMatch = parsePaletteToken(value);
  // Last hue the user browsed; the current value's hue wins when it is a palette token.
  const [browsedHue, setBrowsedHue] = useState('red');
  const activeHueName = paletteMatch?.hue.name ?? browsedHue;
  const activeHue = TAILWIND_PALETTE.find((h) => h.name === activeHueName) ?? TAILWIND_PALETTE[0];

  // A stored arbitrary value that is not a theme-variable preset = custom color.
  const isCustom = isArbitrary(value) && !findOption(value);
  const customRaw = isCustom ? arbitraryRaw(value) : '';
  // Local draft for the hex text input; committed on blur/Enter.
  const [hexDraft, setHexDraft] = useState(customRaw);

  const commitHex = (raw: string) => {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed) return;
    const hex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    if (!HEX_RE.test(hex)) {
      setHexDraft(customRaw);
      return;
    }
    setHexDraft(hex);
    onChange(toArbitrary(hex));
  };

  return (
    <div className="tecof-color-picker">
      <button
        type="button"
        className={`tecof-color-trigger${open ? ' is-open' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={`tecof-style-swatch tecof-color-trigger-swatch${!swatch ? ' is-none' : ''}`}
          style={swatch ? ({ '--swatch': swatch } as React.CSSProperties) : undefined}
        />
        <span className="tecof-color-trigger-label">{label}</span>
        <ChevronDown size={13} className={`tecof-color-trigger-chevron${open ? ' is-open' : ''}`} />
      </button>

      {open && (
        <div className="tecof-color-panel">
          {show('base') && (
          <div className="tecof-color-section">
            <div className="tecof-style-swatches">
              {COLOR_SECTIONS.base.map((opt) => (
                <Swatch key={opt.value || 'none'} option={opt} active={value === opt.value} onSelect={onChange} />
              ))}
            </div>
          </div>
          )}

          {show('theme') && (
          <div className="tecof-color-section">
            <div className="tecof-color-section-title">Tema renkleri</div>
            <div className="tecof-style-swatches">
              {COLOR_SECTIONS.theme.map((opt) => (
                <Swatch key={opt.value} option={opt} active={value === opt.value} onSelect={onChange} />
              ))}
            </div>
          </div>
          )}

          {show('brand') && (
          <div className="tecof-color-section">
            <div className="tecof-color-section-title">Marka (Primary)</div>
            <div className="tecof-style-swatches">
              {COLOR_SECTIONS.brand.map((opt) => (
                <Swatch key={opt.value} option={opt} active={value === opt.value} onSelect={onChange} />
              ))}
            </div>
          </div>
          )}

          {show('palette') && (
          <div className="tecof-color-section">
            <div className="tecof-color-section-title">Tailwind paleti</div>
            <div className="tecof-color-hues">
              {TAILWIND_PALETTE.map((h) => (
                <button
                  key={h.name}
                  type="button"
                  title={h.label}
                  className={`tecof-color-hue${activeHueName === h.name ? ' is-active' : ''}`}
                  style={{ '--swatch': tailwindSwatch(h.name, '500') } as React.CSSProperties}
                  onClick={() => setBrowsedHue(h.name)}
                />
              ))}
            </div>
            <div className="tecof-style-swatches">
              {TAILWIND_SHADES.map((shade) => {
                const token = `${activeHue.name}-${shade}`;
                return (
                  <Swatch
                    key={token}
                    option={{ label: `${activeHue.label} ${shade}`, value: token, swatch: tailwindSwatch(activeHue.name, shade) }}
                    active={value === token}
                    onSelect={onChange}
                  />
                );
              })}
            </div>
          </div>
          )}

          {show('custom') && (
          <div className="tecof-color-section">
            <div className="tecof-color-section-title">Özel renk</div>
            <div className="tecof-color-custom">
              <input
                type="color"
                className="tecof-color-input"
                aria-label="Özel renk seç"
                value={toInputHex(customRaw || (hexDraft && HEX_RE.test(hexDraft) ? hexDraft : '#000000'))}
                onChange={(e) => {
                  setHexDraft(e.target.value);
                  onChange(toArbitrary(e.target.value));
                }}
              />
              <input
                type="text"
                className="tecof-input tecof-color-hex-input"
                placeholder="#rrggbb"
                value={hexDraft}
                onChange={(e) => setHexDraft(e.target.value)}
                onBlur={(e) => commitHex(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                }}
              />
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
