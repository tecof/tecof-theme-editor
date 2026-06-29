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
    <Component
      className="tecof-field-label-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        marginBottom: '16px',
        width: '100%',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      <div
        className="tecof-field-label-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#27272a', // zinc-800
        }}
      >
        {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
        <span>{label}</span>
        {readOnly && (
          <span
            style={{
              fontSize: '10px',
              color: '#a1a1aa',
              fontWeight: 400,
              marginLeft: 'auto',
            }}
          >
            Salt Okunur
          </span>
        )}
      </div>
      <div className="tecof-field-label-content" style={{ width: '100%' }}>
        {children}
      </div>
    </Component>
  );
};

export default FieldLabel;
