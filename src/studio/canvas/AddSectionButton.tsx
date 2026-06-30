import React from 'react';
import { Plus } from 'lucide-react';

export interface AddSectionButtonProps {
  index: number;
  onClick: (index: number) => void;
  disabled?: boolean;
}

export const AddSectionButton = ({ index, onClick, disabled }: AddSectionButtonProps) => {
  if (disabled) return null;

  return (
    <div className="tecof-add-section-divider">
      <div className="tecof-add-section-line" />
      <button
        type="button"
        className="tecof-add-section-btn"
        onClick={() => onClick(index)}
        title="Buraya Bölüm Ekle"
      >
        <Plus size={12} className="tecof-add-section-icon" />
        <span>Bölüm Ekle</span>
      </button>
      <div className="tecof-add-section-line" />
    </div>
  );
};

export default AddSectionButton;
