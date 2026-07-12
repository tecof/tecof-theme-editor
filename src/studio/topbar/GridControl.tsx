import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LayoutGrid, ChevronDown } from 'lucide-react';
import { useUiStore } from '../uiStore';
import { useFloating } from '../../utils/useFloating';

/**
 * TopBar control for the column alignment guide: the left button toggles the
 * grid (also bound to `G`), the caret opens a small popover to tune the column
 * count and gap. Config lives in the UI store (session-only editor aid).
 */
export const GridControl = () => {
  const gridVisible = useUiStore((s) => s.gridVisible);
  const toggleGrid = useUiStore((s) => s.toggleGrid);
  const gridColumns = useUiStore((s) => s.gridColumns);
  const gridGap = useUiStore((s) => s.gridGap);
  const setGridColumns = useUiStore((s) => s.setGridColumns);
  const setGridGap = useUiStore((s) => s.setGridGap);

  const [open, setOpen] = useState(false);
  const caretRef = useRef<HTMLButtonElement>(null);
  const { floatingRef, style } = useFloating({ anchor: caretRef.current, open, placement: 'bottom-end' });

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!floatingRef.current?.contains(e.target as Node) && !caretRef.current?.contains(e.target as Node)) {
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

  return (
    <div className="tecof-grid-control">
      <button
        type="button"
        onClick={toggleGrid}
        className={`tecof-icon-btn${gridVisible ? ' is-active' : ''}`}
        title="Sütun kılavuzu (G)"
        aria-pressed={gridVisible}
      >
        <LayoutGrid size={16} />
      </button>
      <button
        ref={caretRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`tecof-grid-caret${open ? ' is-active' : ''}`}
        title="Kılavuz ayarları"
        aria-expanded={open}
      >
        <ChevronDown size={11} />
      </button>

      {open && createPortal(
        <div ref={floatingRef} className="tecof-grid-popover" style={style} role="dialog" aria-label="Kılavuz ayarları">
          <label className="tecof-grid-pop-row">
            <span>Sütun</span>
            <input
              type="number"
              min={1}
              max={24}
              value={gridColumns}
              onChange={(e) => setGridColumns(Number(e.target.value))}
            />
          </label>
          <label className="tecof-grid-pop-row">
            <span>Boşluk (px)</span>
            <input
              type="number"
              min={0}
              value={gridGap}
              onChange={(e) => setGridGap(Number(e.target.value))}
            />
          </label>
          <button type="button" className="tecof-grid-pop-toggle" onClick={toggleGrid}>
            {gridVisible ? 'Kılavuzu gizle' : 'Kılavuzu göster'}
          </button>
        </div>,
        document.body,
      )}
    </div>
  );
};

export default GridControl;
