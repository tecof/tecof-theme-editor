import React from 'react';
import { FieldLabel } from '../../components/fields/FieldLabel';

export interface FieldRendererProps {
  name: string;
  definition: any;
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
}

export const FieldRenderer = ({
  name,
  definition,
  value,
  onChange,
  readOnly = false,
}: FieldRendererProps) => {
  const label = definition.label || name;
  const type = definition.type;

  // 1. Custom Render (Custom Fields from create*Field factories)
  if (definition.render) {
    return (
      <div className="tecof-custom-field-wrapper" style={{ width: '100%' }}>
        {definition.render({
          field: definition,
          name,
          id: `field-${name}`,
          value,
          onChange,
          readOnly,
        })}
      </div>
    );
  }

  // 2. Built-in types (Standard fields)
  switch (type) {
    case 'text':
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <input
            id={`field-${name}`}
            type="text"
            value={value || ''}
            disabled={readOnly}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #e4e4e7',
              fontSize: '13px',
              color: '#18181b',
              backgroundColor: readOnly ? '#f4f4f5' : '#ffffff',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
            }}
            className="tecof-input-text"
          />
        </FieldLabel>
      );

    case 'textarea':
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <textarea
            id={`field-${name}`}
            rows={4}
            value={value || ''}
            disabled={readOnly}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #e4e4e7',
              fontSize: '13px',
              color: '#18181b',
              backgroundColor: readOnly ? '#f4f4f5' : '#ffffff',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
            }}
            className="tecof-input-textarea"
          />
        </FieldLabel>
      );

    case 'select':
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <div style={{ position: 'relative', width: '100%' }}>
            <select
              id={`field-${name}`}
              value={value || ''}
              disabled={readOnly}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 32px 10px 12px',
                borderRadius: '8px',
                border: '1px solid #e4e4e7',
                fontSize: '13px',
                color: '#18181b',
                backgroundColor: readOnly ? '#f4f4f5' : '#ffffff',
                outline: 'none',
                appearance: 'none',
                boxSizing: 'border-box',
                cursor: readOnly ? 'not-allowed' : 'pointer',
              }}
              className="tecof-input-select"
            >
              {(definition.options || []).map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label || opt.value}
                </option>
              ))}
            </select>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: '12px',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                color: '#71717a',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </FieldLabel>
      );

    case 'number':
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <input
            id={`field-${name}`}
            type="number"
            value={value !== undefined ? value : ''}
            disabled={readOnly}
            onChange={(e) => {
              const val = e.target.value;
              onChange(val === '' ? undefined : Number(val));
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #e4e4e7',
              fontSize: '13px',
              color: '#18181b',
              backgroundColor: readOnly ? '#f4f4f5' : '#ffffff',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            className="tecof-input-number"
          />
        </FieldLabel>
      );

    case 'radio':
      return (
        <FieldLabel label={label} readOnly={readOnly}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(definition.options || []).map((opt: any) => (
              <label
                key={opt.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: '#27272a',
                  cursor: readOnly ? 'not-allowed' : 'pointer',
                }}
              >
                <input
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={value === opt.value}
                  disabled={readOnly}
                  onChange={() => onChange(opt.value)}
                  style={{
                    cursor: readOnly ? 'not-allowed' : 'pointer',
                  }}
                />
                <span>{opt.label || opt.value}</span>
              </label>
            ))}
          </div>
        </FieldLabel>
      );

    default:
      return (
        <div style={{ padding: '8px', fontSize: '11px', color: '#71717a', background: '#fafafa', borderRadius: '4px' }}>
          Desteklenmeyen alan türü: "{type}" ({name})
        </div>
      );
  }
};
export default FieldRenderer;
