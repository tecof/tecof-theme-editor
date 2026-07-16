import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useUiStore } from '../uiStore';
import { useEditorStore } from '../../engine/store';

/**
 * Desktop design-width picker next to the viewport switcher.
 *
 * The canvas lays the page out at this REAL width and scale-fits it into the
 * available area, so the desktop viewport always shows true desktop breakpoints
 * (no more "tablet-looking desktop" on a laptop). The chip shows the active
 * width and — when the canvas is shrunk to fit — the current zoom percentage.
 */

const PRESETS: { px: number; label: string }[] = [
  { px: 1280, label: 'Laptop' },
  { px: 1440, label: 'Masaüstü' },
  { px: 1680, label: 'Geniş' },
  { px: 1920, label: 'Full HD' },
];

export const ViewportWidthControl = () => {
  const viewport = useEditorStore((s) => s.viewport);
  const desktopWidth = useUiStore((s) => s.desktopWidth);
  const setDesktopWidth = useUiStore((s) => s.setDesktopWidth);
  const canvasScale = useUiStore((s) => s.canvasScale);

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Genişlik seçimi yalnızca masaüstü görünümünü etkiler.
  if (viewport !== 'desktop') return null;

  const pct = Math.round(canvasScale * 100);

  return (
    <div className="tecof-vpwidth" ref={rootRef}>
      <button
        type="button"
        className={`tecof-vpwidth-chip${open ? ' is-active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        title="Masaüstü tasarım genişliği — sayfa bu gerçek genişlikte render edilir, alana sığdırılır"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {desktopWidth}
        {pct < 100 && <span className="tecof-vpwidth-zoom">%{pct}</span>}
        <ChevronDown size={11} aria-hidden="true" />
      </button>

      {open && (
        <div className="tecof-vpwidth-popover" role="menu" aria-label="Tasarım genişliği">
          {PRESETS.map((p) => (
            <button
              key={p.px}
              type="button"
              role="menuitemradio"
              aria-checked={desktopWidth === p.px}
              className={`tecof-vpwidth-item${desktopWidth === p.px ? ' is-active' : ''}`}
              onClick={() => {
                setDesktopWidth(p.px);
                setOpen(false);
              }}
            >
              <span>{p.label}</span>
              <span className="tecof-vpwidth-item-px">{p.px}px</span>
            </button>
          ))}
          <div className="tecof-vpwidth-custom">
            <input
              type="number"
              className="tecof-input-number"
              min={320}
              max={3840}
              defaultValue={desktopWidth}
              aria-label="Özel genişlik (px)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const n = Number((e.target as HTMLInputElement).value);
                  if (!Number.isNaN(n)) {
                    setDesktopWidth(n);
                    setOpen(false);
                  }
                }
              }}
            />
            <span className="tecof-vpwidth-custom-hint">px · Enter</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewportWidthControl;
