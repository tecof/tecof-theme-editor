import type { ReactElement } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FieldLabel } from './FieldLabel';
import { Pipette, RotateCcw } from 'lucide-react';
import { FieldErrorBoundary } from './FieldErrorBoundary';

/* ─── Color math ─── */

interface RGB { r: number; g: number; b: number; }
interface HSV { h: number; s: number; v: number; }

const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

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
  if (trimmed.startsWith('#')) return trimmed;
  const rgbaMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
    const hex = `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
    if (a < 1) return hex + Math.round(a * 255).toString(16).padStart(2, '0');
    return hex;
  }
  return trimmed;
};

/** Parse a hex string into rgb (ignores alpha). Null when unparseable. */
const hexToRgb = (hex: string): RGB | null => {
  const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(normalizeHex(hex));
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
};

/** Extract the alpha channel [0..1] from an 8-digit hex; 1 otherwise. */
const hexAlpha = (hex: string): number => {
  const m = /^#[0-9a-f]{6}([0-9a-f]{2})$/i.exec(normalizeHex(hex));
  return m ? parseInt(m[1], 16) / 255 : 1;
};

const rgbToHex = ({ r, g, b }: RGB): string =>
  '#' + [r, g, b].map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0')).join('');

const rgbToHsv = ({ r, g, b }: RGB): HSV => {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = h * 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
};

const hsvToRgb = ({ h, s, v }: HSV): RGB => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
};

/** CSS color string for previews, including alpha. */
const cssColor = (rgb: RGB, alpha: number): string =>
  alpha < 1 ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` : rgbToHex(rgb);

const RECENT_KEY = 'tecof-recent-colors';
const RECENT_MAX = 8;

const readRecent = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]).slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
};

const pushRecent = (hex: string): void => {
  if (!hex || !isValidHex(normalizeHex(hex))) return;
  try {
    const base = rgbToHex(hexToRgb(hex)!);
    const next = [base, ...readRecent().filter((c) => c.toLowerCase() !== base.toLowerCase())].slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / serialization errors */
  }
};

const DEFAULT_SWATCHES = [
  '#18181b', '#71717a', '#ffffff', '#74b500', '#10b981',
  '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
];

const EYEDROPPER_SUPPORTED =
  typeof window !== 'undefined' && 'EyeDropper' in window;

/* ─── Pointer drag helper ─── */

/** Wires a pointer drag on `el`, reporting normalized [0..1] x/y to `cb`. */
const trackPointer = (
  startX: number,
  startY: number,
  el: HTMLElement,
  cb: (nx: number, ny: number) => void
) => {
  const rect = el.getBoundingClientRect();
  const apply = (clientX: number, clientY: number) =>
    cb(
      rect.width ? clamp((clientX - rect.left) / rect.width, 0, 1) : 0,
      rect.height ? clamp((clientY - rect.top) / rect.height, 0, 1) : 0
    );
  apply(startX, startY);
  const onMove = (ev: PointerEvent) => apply(ev.clientX, ev.clientY);
  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
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
  /** Quick-pick swatches shown in the popover (hex strings). */
  swatches?: string[];
}

/* ─── Popover ─── */

interface PopoverProps {
  anchor: HTMLElement;
  hsv: HSV;
  alpha: number;
  showOpacity: boolean;
  swatches: string[];
  onChange: (hsv: HSV, alpha: number) => void;
  onPickHex: (hex: string) => void;
  onClose: () => void;
}

const ColorPopover = ({
  anchor,
  hsv: initialHsv,
  alpha: initialAlpha,
  showOpacity,
  swatches,
  onChange,
  onPickHex,
  onClose,
}: PopoverProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });
  const recent = useRef<string[]>(readRecent()).current;

  // The popover owns the live HSV/alpha while open. Deriving them from the hex on
  // every render would lose the hue whenever saturation or value hit zero (grey/
  // black round-trips to h=0); local state keeps the picker stable during a drag.
  const [hsv, setHsv] = useState<HSV>(initialHsv);
  const [alpha, setAlpha] = useState<number>(initialAlpha);

  const update = useCallback(
    (nextHsv: HSV, nextAlpha: number) => {
      setHsv(nextHsv);
      setAlpha(nextAlpha);
      onChange(nextHsv, nextAlpha);
    },
    [onChange]
  );

  const rgb = hsvToRgb(hsv);
  const hueColor = rgbToHex(hsvToRgb({ h: hsv.h, s: 1, v: 1 }));

  // Position against the anchor; flip up / clamp horizontally to stay on-screen.
  useLayoutEffect(() => {
    const PW = 244, PH = ref.current?.offsetHeight || 300;
    const r = anchor.getBoundingClientRect();
    let top = r.bottom + 6;
    if (top + PH > window.innerHeight) top = Math.max(8, r.top - PH - 6);
    let left = r.left;
    if (left + PW > window.innerWidth) left = window.innerWidth - PW - 8;
    setPos({ top, left: Math.max(8, left) });
  }, [anchor]);

  // Close on outside interaction.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node) && !anchor.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onScroll = () => onClose();
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onClose);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onClose);
    };
  }, [anchor, onClose]);

  // Picking a discrete color (swatch / eyedropper) seeds the live HSV too so the
  // SV square and sliders jump to the chosen color.
  const pickHex = useCallback(
    (hex: string) => {
      const parsed = hexToRgb(hex);
      if (parsed) {
        setHsv(rgbToHsv(parsed));
        setAlpha(showOpacity ? hexAlpha(hex) : 1);
      }
      onPickHex(hex);
    },
    [onPickHex, showOpacity]
  );

  const pickEyeDropper = useCallback(async () => {
    try {
      const ed = new (window as any).EyeDropper();
      const res = await ed.open();
      if (res?.sRGBHex) pickHex(res.sRGBHex);
    } catch {
      /* user cancelled */
    }
  }, [pickHex]);

  return createPortal(
    <div
      ref={ref}
      className="tecof-color-popover"
      style={{ top: pos.top, left: pos.left }}
      role="dialog"
      aria-label="Renk seçici"
    >
      {/* Saturation / Value square */}
      <div
        className="tecof-color-sv"
        style={{ background: hueColor }}
        onPointerDown={(e) => {
          e.preventDefault();
          trackPointer(e.clientX, e.clientY, e.currentTarget, (nx, ny) =>
            update({ h: hsv.h, s: nx, v: 1 - ny }, alpha)
          );
        }}
      >
        <div className="tecof-color-sv-white" />
        <div className="tecof-color-sv-black" />
        <div
          className="tecof-color-sv-thumb"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            background: rgbToHex(rgb),
          }}
        />
      </div>

      {/* Hue + alpha sliders */}
      <div className="tecof-color-sliders">
        <div
          className="tecof-color-track tecof-color-hue"
          onPointerDown={(e) => {
            e.preventDefault();
            trackPointer(e.clientX, e.clientY, e.currentTarget, (nx) =>
              update({ h: nx * 360, s: hsv.s, v: hsv.v }, alpha)
            );
          }}
        >
          <div className="tecof-color-track-thumb" style={{ left: `${(hsv.h / 360) * 100}%` }} />
        </div>

        {showOpacity && (
          <div
            className="tecof-color-track tecof-color-alpha"
            onPointerDown={(e) => {
              e.preventDefault();
              trackPointer(e.clientX, e.clientY, e.currentTarget, (nx) =>
                update(hsv, nx)
              );
            }}
          >
            <div
              className="tecof-color-alpha-fill"
              style={{ background: `linear-gradient(to right, transparent, ${rgbToHex(rgb)})` }}
            />
            <div className="tecof-color-track-thumb" style={{ left: `${alpha * 100}%` }} />
          </div>
        )}
      </div>

      {/* Eyedropper + theme swatches */}
      <div className="tecof-color-swatch-row">
        {EYEDROPPER_SUPPORTED && (
          <button
            type="button"
            className="tecof-color-eyedropper"
            onClick={pickEyeDropper}
            title="Ekrandan renk seç"
          >
            <Pipette size={14} />
          </button>
        )}
        <div className="tecof-color-swatches">
          {swatches.map((sw) => (
            <button
              key={sw}
              type="button"
              className="tecof-color-swatch-dot"
              style={{ background: sw }}
              title={sw}
              onClick={() => pickHex(sw)}
            />
          ))}
        </div>
      </div>

      {recent.length > 0 && (
        <div className="tecof-color-recent">
          <span className="tecof-color-recent-label">Son kullanılan</span>
          <div className="tecof-color-swatches">
            {recent.map((sw) => (
              <button
                key={sw}
                type="button"
                className="tecof-color-swatch-dot"
                style={{ background: sw }}
                title={sw}
                onClick={() => pickHex(sw)}
              />
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

/* ─── Component ─── */

export const ColorField = ({
  value,
  onChange,
  readOnly,
  showOpacity = false,
  defaultColor = '',
  placeholder = '#000000',
  showReset = true,
  swatches = DEFAULT_SWATCHES,
}: ColorFieldProps & ColorFieldOptions) => {
  const [hexInput, setHexInput] = useState(() => toHex(value || ''));
  const [open, setOpen] = useState(false);
  const swatchRef = useRef<HTMLButtonElement>(null);
  // Last hex we emitted, so external echoes don't fight the live HSV state.
  const lastEmitted = useRef<string>('');

  // Sync external value → text input (skip our own echoes).
  useEffect(() => {
    const hex = toHex(value || '');
    if (hex.toLowerCase() === lastEmitted.current.toLowerCase()) return;
    setHexInput(hex);
  }, [value]);

  const currentHex = normalizeHex(hexInput);
  const isValid = !hexInput || isValidHex(currentHex);
  const rgb = isValid && currentHex ? hexToRgb(currentHex) : null;
  const hsv = rgb ? rgbToHsv(rgb) : { h: 0, s: 0, v: 0 };
  const alpha = hexAlpha(currentHex);

  /** Emit a color, packing alpha into 8-digit hex when opacity is enabled. */
  const emit = useCallback(
    (nextRgb: RGB, nextAlpha: number) => {
      let out = rgbToHex(nextRgb);
      if (showOpacity && nextAlpha < 1) {
        out += Math.round(nextAlpha * 255).toString(16).padStart(2, '0');
      }
      lastEmitted.current = out;
      setHexInput(out);
      onChange(out);
    },
    [onChange, showOpacity]
  );

  const handlePopoverChange = useCallback(
    (nextHsv: HSV, nextAlpha: number) => emit(hsvToRgb(nextHsv), nextAlpha),
    [emit]
  );

  const handlePickHex = useCallback(
    (hex: string) => {
      const parsed = hexToRgb(hex);
      if (parsed) emit(parsed, showOpacity ? hexAlpha(hex) : 1);
    },
    [emit, showOpacity]
  );

  const handleHexChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      if (val && !val.startsWith('#')) val = `#${val}`;
      setHexInput(val);
      const norm = normalizeHex(val);
      if (isValidHex(norm)) {
        const parsed = hexToRgb(norm);
        if (parsed) {
          lastEmitted.current = norm;
          onChange(norm.length === 9 ? norm : rgbToHex(parsed));
        }
      }
    },
    [onChange]
  );

  const handleHexBlur = useCallback(() => {
    if (hexInput && !isValidHex(normalizeHex(hexInput))) {
      setHexInput(value || ''); // revert to last valid value
    } else if (hexInput) {
      pushRecent(hexInput);
    }
  }, [hexInput, value]);

  const handleReset = useCallback(() => {
    lastEmitted.current = defaultColor;
    setHexInput(defaultColor);
    onChange(defaultColor);
  }, [defaultColor, onChange]);

  const closePopover = useCallback(() => {
    setOpen(false);
    if (hexInput) pushRecent(hexInput);
  }, [hexInput]);

  return (
    <div className="tecof-color-container">
      <div className="tecof-color-preview-row">
        {/* Swatch trigger (checkerboard shows through for alpha) */}
        <button
          ref={swatchRef}
          type="button"
          className={`tecof-color-swatch${open ? ' focused' : ''}`}
          disabled={readOnly}
          onClick={() => !readOnly && setOpen((o) => !o)}
          title="Renk seçici"
        >
          <span
            className="tecof-color-swatch-fill"
            style={{ background: rgb ? cssColor(rgb, alpha) : 'transparent' }}
          />
        </button>

        {/* Hex input (inline editing preserved) */}
        <input
          type="text"
          value={hexInput}
          onChange={handleHexChange}
          onBlur={handleHexBlur}
          disabled={readOnly}
          placeholder={placeholder}
          maxLength={9}
          className={`tecof-color-hex-input${!isValid ? ' invalid' : ''}`}
        />

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

      {open && !readOnly && swatchRef.current && (
        <ColorPopover
          anchor={swatchRef.current}
          hsv={hsv}
          alpha={alpha}
          showOpacity={showOpacity}
          swatches={swatches}
          onChange={handlePopoverChange}
          onPickHex={handlePickHex}
          onClose={closePopover}
        />
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
 *     swatches: ['#18181b', '#74b500', '#ffffff'],
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
