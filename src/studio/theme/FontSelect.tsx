import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { useFloating } from '../../utils/useFloating';
import { listThemeFonts, findFontByStack, previewFontsHref, type ThemeFont } from './fonts';
import type { CustomFont } from '../../types';

const PREVIEW_LINK_ID = 'tecof-font-preview';

/**
 * Ensures every builtin webfont is loaded (once) so the dropdown can render each
 * option in its own typeface — even fonts not yet selected in the theme.
 */
const ensurePreviewFonts = () => {
  if (typeof document === 'undefined') return;
  const href = previewFontsHref();
  if (!href || document.getElementById(PREVIEW_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = PREVIEW_LINK_ID;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};

interface FontSelectProps {
  label: string;
  /** The currently-applied `font-family` stack. */
  value: string;
  customFonts?: CustomFont[];
  onSelect: (font: ThemeFont) => void;
}

/**
 * A font-family picker that previews each option in its own typeface and reports
 * the chosen {@link ThemeFont} (builtin or custom). Replaces the raw CSS text
 * input in the theme editor's typography section.
 */
export const FontSelect = ({ label, value, customFonts, onSelect }: FontSelectProps) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const { floatingRef, style: floatingStyle } = useFloating({
    anchor: btnRef.current,
    open,
    placement: 'bottom-start',
  });

  const fonts = listThemeFonts(customFonts);
  const current = findFontByStack(value, customFonts);

  useEffect(() => {
    if (open) ensurePreviewFonts();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!floatingRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, floatingRef]);

  const builtin = fonts.filter((f) => f.kind === 'builtin');
  const custom = fonts.filter((f) => f.kind === 'custom');

  const renderItem = (font: ThemeFont) => (
    <button
      key={font.id}
      type="button"
      className={`tecof-font-item${current?.id === font.id ? ' is-active' : ''}`}
      onClick={() => { onSelect(font); setOpen(false); }}
    >
      <span className="tecof-font-item-name" style={{ fontFamily: font.stack }}>{font.label}</span>
      {current?.id === font.id && <Check size={14} className="tecof-font-item-check" />}
    </button>
  );

  return (
    <label className="tecof-theme-row tecof-theme-row-stack">
      <span className="tecof-theme-row-label">{label}</span>
      <button
        ref={btnRef}
        type="button"
        className={`tecof-font-select${open ? ' is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="tecof-font-select-value" style={{ fontFamily: value }}>
          {current?.label ?? 'Özel…'}
        </span>
        <ChevronDown size={14} className="tecof-font-select-caret" />
      </button>

      {open && createPortal(
        <div ref={floatingRef} className="tecof-font-menu" style={floatingStyle} role="listbox" aria-label={label}>
          {builtin.map(renderItem)}
          {custom.length > 0 && (
            <>
              <div className="tecof-font-menu-sep">Özel fontlar</div>
              {custom.map(renderItem)}
            </>
          )}
        </div>,
        document.body,
      )}
    </label>
  );
};

export default FontSelect;
