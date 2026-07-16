import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFloating } from '../../utils/useFloating';
import { Braces, ChevronLeft, Database, Repeat, Search } from 'lucide-react';
import { useTecof } from '../TecofProvider';
import { useRepeatScope } from './repeatScope';

/* ─── Types ─── */

interface CmsField {
  name: string;
  shortcode: string;
  type: string;
}

interface Collection {
  _id: string;
  name: string;
  slug: string;
  fields?: CmsField[];
}

export interface CmsBindingButtonProps {
  /** Called with the binding token, e.g. `{{ data.title }}`. */
  onInsert: (token: string) => void;
  title?: string;
}

/** Builds the reference token a component resolves against its CMS item data. */
const tokenFor = (shortcode: string) => `{{ data.${shortcode} }}`;

/** Builds the token a repeat-zone template resolves against its current row. */
const itemTokenFor = (key: string) => `{{ item.${key} }}`;

/* ─── Popover ─── */

const BindingPopover = ({
  anchor,
  onInsert,
  onClose,
}: {
  anchor: HTMLElement;
  onInsert: (token: string) => void;
  onClose: () => void;
}) => {
  const { apiClient } = useTecof();
  const { floatingRef, style: floatingStyle } = useFloating({
    anchor,
    open: true,
    placement: 'bottom-end',
  });
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.getCmsCollections();
        if (cancelled) return;
        if (res.success && Array.isArray(res.data)) setCollections(res.data);
        else setError(res.message || 'Koleksiyonlar yüklenemedi');
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Bağlantı hatası');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [apiClient]);

  // Close on outside interaction / Escape. Positioning (flip/shift + reposition
  // on scroll/resize) is handled by useFloating.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!floatingRef.current?.contains(e.target as Node) && !anchor.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [anchor, onClose, floatingRef]);

  const active = collections.find((c) => c.slug === activeSlug) || null;

  const filteredCollections = collections.filter(
    (c) => !query.trim() || `${c.name} ${c.slug}`.toLowerCase().includes(query.toLowerCase())
  );
  const fields = active?.fields || [];
  const filteredFields = fields.filter(
    (f) => !query.trim() || `${f.name} ${f.shortcode}`.toLowerCase().includes(query.toLowerCase())
  );

  // Inside a repeat-zone template the row's own fields come first: they insert
  // `{{ item.key }}` tokens that resolve per repeated row (not per CMS page).
  const repeatScope = useRepeatScope();
  const itemFields = (repeatScope?.schema ?? []).filter(
    (f) => !query.trim() || `${f.label ?? ''} ${f.key}`.toLowerCase().includes(query.toLowerCase())
  );

  return createPortal(
    <div ref={floatingRef} className="tecof-bind-popover" style={floatingStyle} role="dialog" aria-label="CMS verisine bağla">
      <div className="tecof-bind-header">
        {active ? (
          <button type="button" className="tecof-bind-back" onClick={() => { setActiveSlug(null); setQuery(''); }}>
            <ChevronLeft size={14} /> {active.name}
          </button>
        ) : (
          <span className="tecof-bind-title">CMS verisine bağla</span>
        )}
      </div>

      <div className="tecof-bind-search">
        <Search size={13} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={active ? 'Alan ara…' : 'Koleksiyon ara…'}
          className="tecof-bind-search-input"
          autoFocus
        />
      </div>

      <div className="tecof-bind-list">
        {/* Repeat-item fields need no API: they stay available even while the
            CMS collections load or when the host has no CMS at all. */}
        {!active && itemFields.length > 0 && (
          <>
            <div className="tecof-bind-section">Öğe alanları</div>
            {itemFields.map((f) => (
              <button
                key={f.key}
                type="button"
                className="tecof-bind-item"
                onClick={() => { onInsert(itemTokenFor(f.key)); onClose(); }}
              >
                <Repeat size={13} />
                <span className="tecof-bind-item-label">{f.label || f.key}</span>
                <span className="tecof-bind-item-meta">{f.type || ''}</span>
              </button>
            ))}
            <div className="tecof-bind-section">CMS koleksiyonları</div>
          </>
        )}
        {loading ? (
          <div className="tecof-bind-empty">Yükleniyor…</div>
        ) : error ? (
          <div className="tecof-bind-empty">{error}</div>
        ) : !active ? (
          <>
            {filteredCollections.length === 0 ? (
              <div className="tecof-bind-empty">Koleksiyon yok</div>
            ) : (
              filteredCollections.map((col) => (
                <button
                  key={col._id}
                  type="button"
                  className="tecof-bind-item"
                  onClick={() => { setActiveSlug(col.slug); setQuery(''); }}
                >
                  <Database size={13} />
                  <span className="tecof-bind-item-label">{col.name}</span>
                  <span className="tecof-bind-item-meta">{col.fields?.length ?? 0} alan</span>
                </button>
              ))
            )}
          </>
        ) : filteredFields.length === 0 ? (
          <div className="tecof-bind-empty">Alan yok</div>
        ) : (
          filteredFields.map((f) => (
            <button
              key={f.shortcode}
              type="button"
              className="tecof-bind-item"
              onClick={() => { onInsert(tokenFor(f.shortcode)); onClose(); }}
            >
              <Braces size={13} />
              <span className="tecof-bind-item-label">{f.name}</span>
              <span className="tecof-bind-item-meta">{f.type}</span>
            </button>
          ))
        )}
      </div>
    </div>,
    document.body
  );
};

/* ─── Button ─── */

/**
 * A small affordance that lets the user bind a field to a CMS collection field —
 * inserting a `{{ data.shortcode }}` reference token instead of typing it by hand.
 * Collections are fetched lazily the first time the popover opens.
 */
export const CmsBindingButton = ({ onInsert, title = 'CMS verisine bağla' }: CmsBindingButtonProps) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`tecof-bind-btn${open ? ' is-active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        title={title}
        aria-label={title}
      >
        <Braces size={14} />
      </button>
      {open && btnRef.current && (
        <BindingPopover anchor={btnRef.current} onInsert={onInsert} onClose={close} />
      )}
    </>
  );
};

export default CmsBindingButton;
