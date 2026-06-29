import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FieldLabel } from './FieldLabel';
import { RotateCcw } from 'lucide-react';
import { FieldErrorBoundary } from './FieldErrorBoundary';

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

/** Convert rgb()/rgba()/hsl() string → hex. Returns original string if unparseable. */
const toHex = (val: string): string => {
  if (!val) return '';
  const trimmed = val.trim();
  // Already hex
  if (trimmed.startsWith('#')) return trimmed;
  // Try rgba(r, g, b, a) or rgb(r, g, b)
  const rgbaMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
    const hex = `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`;
    if (a < 1) {
      const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0');
      return hex + alphaHex;
    }
    return hex;
  }
  return trimmed;
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
  defaultColor = '',
  placeholder = '#000000',
  showReset = true,
}: ColorFieldProps & ColorFieldOptions) => {
  const [hexInput, setHexInput] = useState(() => toHex(value || ''));
  const [opacity, setOpacity] = useState(100);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes
  useEffect(() => {
    const hex = toHex(value || '');
    setHexInput(hex);
    // Parse opacity from 8-digit hex
    if (hex && hex.length === 9) {
      const alphaHex = hex.slice(7, 9);
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
    _fieldType: 'color' as const,
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }: ColorFieldProps) => (
      <FieldLabel label={label || ''} icon={labelIcon} readOnly={readOnly}>
        <FieldErrorBoundary fieldName={name}>
          <ColorField
            field={field}
            name={name}
            id={id}
            value={value || ''}
            onChange={onChange}
            readOnly={readOnly}
            {...fieldOptions}
          />
        </FieldErrorBoundary>
      </FieldLabel>
    ),
  };
};

export default ColorField;
