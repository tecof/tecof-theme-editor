import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pipette, X, RotateCcw } from 'lucide-react';

/* ─── Preset Palettes ─── */

const PRESET_COLORS = [
  // Grays
  '#ffffff', '#f4f4f5', '#d4d4d8', '#a1a1aa', '#71717a', '#3f3f46', '#27272a', '#18181b', '#000000',
  // Reds
  '#fef2f2', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c',
  // Oranges
  '#fff7ed', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c',
  // Yellows
  '#fefce8', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207',
  // Greens
  '#f0fdf4', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d',
  // Blues
  '#eff6ff', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8',
  // Indigos
  '#eef2ff', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca',
  // Purples
  '#faf5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce',
  // Pinks
  '#fdf2f8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d',
];

/* ─── Helpers ─── */

const isValidHex = (hex: string): boolean =>
  /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex);

const normalizeHex = (hex: string): string => {
  if (!hex) return '';
  let v = hex.startsWith('#') ? hex : `#${hex}`;
  // Expand shorthand #abc → #aabbcc
  if (/^#[0-9A-Fa-f]{3}$/.test(v)) {
    v = `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  }
  return v;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const match = /^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})/.exec(hex);
  if (!match) return null;
  return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) };
};

const getContrastColor = (hex: string): string => {
  const rgb = hexToRgb(normalizeHex(hex));
  if (!rgb) return '#000000';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#18181b' : '#ffffff';
};



/* ─── Props ─── */

export interface ColorFieldProps {
  field: any;
  name: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export interface ColorFieldOptions {
  /** Field label displayed in the Puck sidebar */
  label?: string;
  /** Icon displayed next to the label (React element, e.g. Lucide icon) */
  labelIcon?: ReactElement;
  /** Whether this field is visible in the sidebar */
  visible?: boolean;
  /** Show opacity/alpha slider */
  showOpacity?: boolean;
  /** Show preset color palette */
  showPresets?: boolean;
  /** Custom preset colors (array of hex strings) */
  presetColors?: string[];
  /** Default/fallback color */
  defaultColor?: string;
  /** Placeholder text for hex input */
  placeholder?: string;
  /** Show reset button */
  showReset?: boolean;
}

/* ─── Component ─── */

export const ColorField = ({
  value,
  onChange,
  readOnly,
  showOpacity = false,
  showPresets = true,
  presetColors = PRESET_COLORS,
  defaultColor = '',
  placeholder = '#000000',
  showReset = true,
}: ColorFieldProps & ColorFieldOptions) => {
  const [hexInput, setHexInput] = useState(value || '');
  const [opacity, setOpacity] = useState(100);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes
  useEffect(() => {
    setHexInput(value || '');
    // Parse opacity from 8-digit hex
    if (value && value.length === 9) {
      const alphaHex = value.slice(7, 9);
      const alphaPercent = Math.round((parseInt(alphaHex, 16) / 255) * 100);
      setOpacity(alphaPercent);
    } else {
      setOpacity(100);
    }
  }, [value]);

  // Apply color, optionally with opacity
  const applyColor = useCallback(
    (hex: string, opacityPercent?: number) => {
      const normalized = normalizeHex(hex);
      if (!isValidHex(normalized)) return;

      const op = opacityPercent ?? opacity;
      if (showOpacity && op < 100) {
        const alphaHex = Math.round((op / 100) * 255)
          .toString(16)
          .padStart(2, '0');
        onChange(normalized.slice(0, 7) + alphaHex);
      } else {
        onChange(normalized.slice(0, 7));
      }
    },
    [onChange, opacity, showOpacity]
  );

  const handleHexChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      // Auto add # prefix
      if (val && !val.startsWith('#')) {
        val = `#${val}`;
      }
      setHexInput(val);

      if (isValidHex(val)) {
        applyColor(val);
      }
    },
    [applyColor]
  );

  const handleHexBlur = useCallback(() => {
    setFocused(false);
    if (hexInput && isValidHex(normalizeHex(hexInput))) {
      applyColor(hexInput);
    } else if (hexInput && !isValidHex(normalizeHex(hexInput))) {
      // Revert to last valid value
      setHexInput(value || '');
    }
  }, [hexInput, value, applyColor]);

  const handleNativeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value;
      setHexInput(hex);
      applyColor(hex);
    },
    [applyColor]
  );

  const handlePresetClick = useCallback(
    (color: string) => {
      setHexInput(color);
      applyColor(color);
    },
    [applyColor]
  );

  const handleOpacityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const op = parseInt(e.target.value, 10);
      setOpacity(op);
      if (hexInput && isValidHex(normalizeHex(hexInput))) {
        applyColor(hexInput, op);
      }
    },
    [hexInput, applyColor]
  );

  const handleReset = useCallback(() => {
    setHexInput(defaultColor);
    setOpacity(100);
    onChange(defaultColor);
  }, [defaultColor, onChange]);

  const currentColor = normalizeHex(hexInput);
  const isValid = !hexInput || isValidHex(currentColor);

  return (
    <div className="tecof-color-container">
      {/* Color Preview + Hex Input */}
      <div className="tecof-color-preview-row">
        {/* Color Swatch with native picker */}
        <div
          className={`tecof-color-swatch ${focused ? 'focused' : ''}`}
          style={{ background: isValid && currentColor ? currentColor : '#ffffff' }}
        >
          {!readOnly && (
            <input
              type="color"
              value={currentColor && isValid ? currentColor.slice(0, 7) : '#000000'}
              onChange={handleNativeChange}
              className="tecof-color-native-input"
              title="Renk seçici"
            />
          )}
        </div>

        {/* Hex Input */}
        <input
          ref={inputRef}
          type="text"
          value={hexInput}
          onChange={handleHexChange}
          onFocus={() => setFocused(true)}
          onBlur={handleHexBlur}
          disabled={readOnly}
          placeholder={placeholder}
          maxLength={9}
          className={`tecof-color-hex-input ${!isValid ? 'invalid' : ''}`}
        />

        {/* Eyedropper / Reset */}
        {!readOnly && showReset && hexInput && (
          <button
            type="button"
            className="tecof-color-action-btn"
            onClick={handleReset}
            title="Sıfırla"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {/* Opacity Slider */}
      {showOpacity && (
        <div className="tecof-color-opacity-row">
          <span className="tecof-color-opacity-label">Opaklık</span>
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={handleOpacityChange}
            disabled={readOnly}
            className="tecof-color-opacity-slider"
          />
          <span className="tecof-color-opacity-value">{opacity}%</span>
        </div>
      )}

      {/* Preset Colors */}
      {showPresets && presetColors.length > 0 && (
        <>
          <p className="tecof-color-section-label">Hazır Renkler</p>
          <div className="tecof-color-preset-grid">
            {presetColors.map((color, idx) => {
              const selected = currentColor?.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={`${color}-${idx}`}
                  type="button"
                  className={`tecof-color-preset-swatch ${selected ? 'selected' : ''} ${color.toLowerCase() === '#ffffff' ? 'is-white' : ''}`}
                  style={{ background: color }}
                  onClick={() => !readOnly && handlePresetClick(color)}
                  title={color}
                  disabled={readOnly}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

ColorField.displayName = 'ColorField';

/* ─── Factory Function (Puck Custom Field) ─── */

/**
 * Creates a Puck custom field definition for color picking.
 *
 * @example
 * ```ts
 * import { createColorField } from '@tecof/theme-editor';
 *
 * fields: {
 *   bgColor: createColorField({ label: 'Arka Plan Rengi' }),
 *   textColor: createColorField({
 *     label: 'Metin Rengi',
 *     showOpacity: true,
 *     defaultColor: '#18181b',
 *   }),
 * }
 * ```
 */
export const createColorField = (options: ColorFieldOptions = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;

  return {
    type: 'custom' as const,
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }: ColorFieldProps) => (
      <ColorField
        field={field}
        name={name}
        id={id}
        value={value || ''}
        onChange={onChange}
        readOnly={readOnly}
        {...fieldOptions}
      />
    ),
  };
};

export default ColorField;
