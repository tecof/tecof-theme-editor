import React from 'react';

export interface FieldLabelProps {
  label: string;
  icon?: React.ReactNode;
  readOnly?: boolean;
  children?: React.ReactNode;
  el?: 'div' | 'label';
  /**
   * Başlık satırının SAĞINA konan küçük eylem (ör. "Panelde yönet" bağlantısı).
   *
   * `el="label"` iken buraya tıklanabilir bir şey koymak, HTML label
   * aktivasyonu yüzünden alanın ilk kontrolünü de tetikler — eylem veren
   * alanlar `el="div"` kullanmalıdır.
   */
  action?: React.ReactNode;
}

export const FieldLabel = ({
  label,
  icon,
  readOnly,
  children,
  el = 'label',
  action,
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
        {action && <span className="tecof-field-label-action">{action}</span>}
      </div>
      <div className="tecof-field-label-content">
        {children}
      </div>
    </Component>
  );
};

export default FieldLabel;
