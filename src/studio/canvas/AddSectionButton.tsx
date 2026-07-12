import React from 'react';
import { Plus } from 'lucide-react';

export interface AddSectionButtonProps {
  index: number;
  onClick: (index: number) => void;
  disabled?: boolean;
  /**
   * Always-visible variant for the divider at the very end of the page, so the
   * user has a permanent "add section" affordance without hunting for the
   * hover-revealed dividers between sections.
   */
  fixed?: boolean;
  /**
   * Slot orientation. `'horizontal'` renders a VERTICAL divider (between
   * side-by-side items); `'vertical'` (default) a horizontal one (between
   * stacked items). Mirrors `DropZone`'s own `orientation`.
   */
  orientation?: 'vertical' | 'horizontal';
  /**
   * Compact, layout-neutral styling for use INSIDE a slot's gap (as opposed to
   * the large root section divider). Sizes the divider to zero and reveals a
   * small "+" pill on hover, so inserting between slot children never shifts the
   * slot's own spacing.
   */
  slot?: boolean;
}

export const AddSectionButton = ({
  index,
  onClick,
  disabled,
  fixed,
  orientation = 'vertical',
  slot,
}: AddSectionButtonProps) => {
  if (disabled) return null;

  const className = [
    'tecof-add-section-divider',
    fixed ? 'is-fixed' : '',
    slot ? 'is-slot' : '',
    orientation === 'horizontal' ? 'is-horizontal' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      <div className="tecof-add-section-line" />
      <button
        type="button"
        className="tecof-add-section-btn"
        // The affordance lives inside the canvas; its click must not bubble to
        // the surrounding node wrapper (which would select the parent) or the
        // root (which would clear selection). Opening the modal is the only job.
        onClick={(e) => {
          e.stopPropagation();
          onClick(index);
        }}
        title={slot ? 'Buraya bileşen ekle' : 'Buraya Bölüm Ekle'}
      >
        <Plus size={12} className="tecof-add-section-icon" />
        <span>{slot ? 'Ekle' : 'Bölüm Ekle'}</span>
      </button>
      <div className="tecof-add-section-line" />
    </div>
  );
};

export default AddSectionButton;
