import React from 'react';

export interface FieldLabelProps {
  label: string;
  icon?: React.ReactNode;
  readOnly?: boolean;
  children?: React.ReactNode;
  el?: 'div' | 'label';
}

export const FieldLabel = ({
  label,
  icon,
  readOnly,
  children,
  el = 'label',
}: FieldLabelProps) => {
  const Component = el;

  return (
    <Component className="tecof-field-label-container">
      <div className="tecof-field-label-header">
        {icon && <span className="tecof-field-label-icon">{icon}</span>}
        <span>{label}</span>
        {readOnly && (
          <span className="tecof-field-label-readonly">
            Salt Okunur
          </span>
        )}
      </div>
      <div className="tecof-field-label-content">
        {children}
      </div>
    </Component>
  );
};

export default FieldLabel;
