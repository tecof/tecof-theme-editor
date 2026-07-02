import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { StudioConfig } from '../../types';
import { LiveBlockPreview, type PreviewMode } from './LivePreview';

interface BlockThumbProps {
  /** Component type / config key — used both as the preview name and drag payload. */
  type: string;
  /** Human-readable label shown on the card and tooltip. */
  label: string;
  /** Studio config — used to live-render the block preview. */
  config: StudioConfig;
  /** 'element' → compact fit-to-size preview; 'section' → desktop-scaled. */
  previewMode: PreviewMode;
  /** Whether to show the live preview inline inside the card. */
  showPreview?: boolean;
  /** Click-to-add handler (existing behavior). */
  onAdd: (type: string) => void;
  /** Drag start handler (existing behavior). */
  onDragStart: (e: React.DragEvent, type: string, label: string) => void;
  /** Drag end handler (existing behavior). */
  onDragEnd: (e: React.DragEvent) => void;
}

/**
 * A single draggable block card in the "Blok Ekle" palette.
 *
 * Previews are LIVE renders of the component with its default props (via
 * {@link LiveBlockPreview}) — the same preview the Add Section modal shows —
 * instead of server-fetched screenshots, so they need no domain/API plumbing
 * and always match the current theme code. Inline preview when `showPreview`
 * is on; otherwise a hover popover. All drag/click behavior is preserved.
 */
export const BlockThumb = ({
  type,
  label,
  config,
  previewMode,
  showPreview = false,
  onAdd,
  onDragStart,
  onDragEnd,
}: BlockThumbProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onAdd(type)}
      draggable={true}
      onDragStart={(e) => {
        setHovered(false);
        onDragStart(e, type, label);
      }}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`tecof-block-btn${showPreview ? ' tecof-block-btn--thumb' : ''}`}
      title={`${label} ekle`}
    >
      {showPreview && (
        <span className={`tecof-block-thumb is-${previewMode}`}>
          <LiveBlockPreview config={config} type={type} mode={previewMode} />
        </span>
      )}
      <span className="tecof-block-btn-label">{label}</span>
      <Plus size={14} className="tecof-block-btn-icon" />

      {/* Popover hover preview (only when inline previews are off) */}
      {!showPreview && hovered && (
        <span className="tecof-block-popover">
          <span className="tecof-block-popover-title">{label}</span>
          <span className={`tecof-block-popover-preview is-${previewMode}`}>
            <LiveBlockPreview config={config} type={type} mode={previewMode} />
          </span>
        </span>
      )}
    </button>
  );
};

export default BlockThumb;
