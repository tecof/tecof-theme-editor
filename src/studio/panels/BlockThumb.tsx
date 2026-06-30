import React, { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import type { TecofApiClient } from '../../api';

interface BlockThumbProps {
  /** Component type / config key — used both as the preview name and drag payload. */
  type: string;
  /** Human-readable label shown as fallback text and tooltip. */
  label: string;
  /**
   * Merchant domain used to fetch the rendered preview. When undefined, the
   * thumbnail feature degrades gracefully to the text-only button.
   */
  domain?: string;
  /** API client exposing `getComponentPreview`. May be undefined in some contexts. */
  apiClient?: TecofApiClient;
  /** Whether to show the preview image inline inside the card. */
  showPreview?: boolean;
  /** Click-to-add handler (existing behavior). */
  onAdd: (type: string) => void;
  /** Drag start handler (existing behavior). */
  onDragStart: (e: React.DragEvent, type: string, label: string) => void;
  /** Drag end handler (existing behavior). */
  onDragEnd: (e: React.DragEvent) => void;
}

type PreviewState = 'idle' | 'loading' | 'loaded' | 'failed';

/**
 * A single draggable block card in the "Blok Ekle" palette.
 *
 * Renders the existing text + icon button, enhanced with a lazily-loaded
 * preview thumbnail. The image is only fetched once the card scrolls into view
 * (via IntersectionObserver), or when it is hovered, and any in-flight work is ignored after unmount.
 * On a null/error preview — or when no domain/apiClient is available — it falls
 * back to the plain text button, preserving all drag/click behavior.
 */
export const BlockThumb = ({
  type,
  label,
  domain,
  apiClient,
  showPreview = false,
  onAdd,
  onDragStart,
  onDragEnd,
}: BlockThumbProps) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [state, setState] = useState<PreviewState>('idle');
  const [src, setSrc] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);

  // Thumbnails are only possible when we have both a client and a domain.
  const canPreview = Boolean(apiClient && domain);

  // Function to load the preview image
  const loadPreview = useRef<() => void>(() => {});

  useEffect(() => {
    // No client/domain → stay in fallback (text button) forever.
    if (!canPreview) return;

    const el = buttonRef.current;
    if (!el) return;

    let cancelled = false;
    let observer: IntersectionObserver | null = null;

    const load = () => {
      if (cancelled) return;
      // Already loading or loaded
      if (state !== 'idle') return;
      setState('loading');
      apiClient!
        .getComponentPreview(domain!, type)
        .then((url) => {
          if (cancelled) return;
          if (url) {
            setSrc(url);
            setState('loaded');
          } else {
            setState('failed');
          }
        })
        .catch(() => {
          if (!cancelled) setState('failed');
        });
    };

    loadPreview.current = load;

    // If showPreview is true, lazy load via observer.
    if (showPreview) {
      if (typeof IntersectionObserver !== 'undefined') {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              observer?.disconnect();
              observer = null;
              load();
            }
          },
          { rootMargin: '200px' }
        );
        observer.observe(el);
      } else {
        load();
      }
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [canPreview, apiClient, domain, type, showPreview, state]);

  // Load preview immediately if hovered
  useEffect(() => {
    if (hovered && state === 'idle') {
      loadPreview.current();
    }
  }, [hovered, state]);

  const showImage = showPreview && state === 'loaded' && src;
  const showSkeleton = showPreview && canPreview && (state === 'idle' || state === 'loading');
  const showHoverPopover = !showPreview && state === 'loaded' && src && hovered;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => onAdd(type)}
      draggable={true}
      onDragStart={(e) => onDragStart(e, type, label)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`tecof-block-btn${showImage ? ' tecof-block-btn--thumb' : ''}`}
      title={`${label} ekle`}
    >
      {showImage ? (
        <span className="tecof-block-thumb">
          <img
            src={src!}
            alt={label}
            className="tecof-block-thumb-img"
            draggable={false}
            loading="lazy"
          />
        </span>
      ) : showSkeleton ? (
        <span className="tecof-block-thumb tecof-block-thumb--loading">
          <span className="tecof-skeleton tecof-block-thumb-skeleton" />
        </span>
      ) : null}
      <span className="tecof-block-btn-label">{label}</span>
      <Plus size={14} className="tecof-block-btn-icon" />

      {/* Popover hover preview */}
      {showHoverPopover && (
        <span className="tecof-block-popover">
          <span className="tecof-block-popover-title">{label} Önizleme</span>
          <img
            src={src!}
            alt={label}
            className="tecof-block-popover-img"
            draggable={false}
          />
        </span>
      )}
    </button>
  );
};

export default BlockThumb;
