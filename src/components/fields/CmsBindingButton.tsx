import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Braces, ChevronLeft, Database, Search } from 'lucide-react';
import { useTecof } from '../TecofProvider';

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
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: -9999, left: -9999 });
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

  useLayoutEffect(() => {
    const PW = 248, PH = ref.current?.offsetHeight || 280;
    const r = anchor.getBoundingClientRect();
    let top = r.bottom + 6;
    if (top + PH > window.innerHeight) top = Math.max(8, r.top - PH - 6);
    let left = r.right - PW;
    if (left < 8) left = 8;
    setPos({ top, left });
  }, [anchor, loading, activeSlug]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node) && !anchor.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onClose, true);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onClose, true);
    };
  }, [anchor, onClose]);

  const active = collections.find((c) => c.slug === activeSlug) || null;

  const filteredCollections = collections.filter(
    (c) => !query.trim() || `${c.name} ${c.slug}`.toLowerCase().includes(query.toLowerCase())
  );
  const fields = active?.fields || [];
  const filteredFields = fields.filter(
    (f) => !query.trim() || `${f.name} ${f.shortcode}`.toLowerCase().includes(query.toLowerCase())
  );

  return createPortal(
    <div ref={ref} className="tecof-bind-popover" style={{ top: pos.top, left: pos.left }} role="dialog" aria-label="CMS verisine bağla">
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
        {loading ? (
          <div className="tecof-bind-empty">Yükleniyor…</div>
        ) : error ? (
          <div className="tecof-bind-empty">{error}</div>
        ) : !active ? (
          filteredCollections.length === 0 ? (
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
          )
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
