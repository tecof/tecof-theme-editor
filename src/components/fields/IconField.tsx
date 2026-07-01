import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { FieldLabel } from './FieldLabel';
import { FieldErrorBoundary } from './FieldErrorBoundary';
import { useFloating } from '../../utils/useFloating';

export interface IconFieldProps {
  field: any;
  name: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export interface IconFieldOptions {
  /** Field label displayed in the Puck sidebar */
  label?: string;
  /** Icon displayed next to the label (React element, e.g. Lucide icon) */
  labelIcon?: React.ReactElement;
  /** Whether this field is visible in the sidebar */
  visible?: boolean;
}

// Extract valid icon names from lucide-react
const ALL_ICON_NAMES = Object.keys(Icons).filter(key => {
  // Filters out helper functions and only matches icon components (start with uppercase)
  return /^[A-Z]/.test(key) && typeof (Icons as any)[key] === 'function' && key !== 'createLucideIcon';
});

export const IconField = ({ value, onChange, readOnly }: IconFieldProps) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { floatingRef, style: floatingStyle } = useFloating({
    anchor: triggerRef.current,
    open: isOpen,
    placement: 'bottom-start',
  });

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    const query = search.toLowerCase();
    if (!query) return ALL_ICON_NAMES.slice(0, 120); // Limit to top 120 for responsiveness
    return ALL_ICON_NAMES.filter(name => name.toLowerCase().includes(query)).slice(0, 120);
  }, [search]);

  // Close on outside click / Escape (the dropdown is portaled, so it isn't inside
  // the field's own DOM subtree).
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      if (
        !floatingRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, floatingRef]);

  // Selected Icon Component
  const SelectedIcon = value && (Icons as any)[value] ? (Icons as any)[value] : null;

  return (
    <div className="tecof-icon-field-container">
      {/* Trigger Button */}
      <div className="tecof-icon-trigger-wrap" ref={triggerRef}>
        <button
          type="button"
          className={`tecof-icon-trigger-btn ${isOpen ? 'open' : ''}`}
          disabled={readOnly}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="tecof-icon-trigger-left">
            {SelectedIcon ? (
              <SelectedIcon className="tecof-icon-trigger-preview-icon" size={16} />
            ) : (
              <div className="tecof-icon-trigger-placeholder" />
            )}
            <span className="tecof-icon-trigger-label">{value || 'İkon Seçin'}</span>
          </div>
        </button>
        {value && !readOnly && (
          <button
            type="button"
            className="tecof-icon-clear-btn"
            title="Temizle"
            onClick={() => onChange('')}
          >
            ×
          </button>
        )}
      </div>

      {/* Popover Dropdown — portaled to <body> and positioned with flip/shift so
          it never clips inside the scrolling inspector. */}
      {isOpen && createPortal(
        <div
          ref={floatingRef}
          className="tecof-icon-dropdown"
          style={{
            ...floatingStyle,
            width: triggerRef.current?.offsetWidth,
            right: 'auto',
            marginTop: 0,
            zIndex: 10001,
          }}
        >
          <div className="tecof-icon-search-wrapper">
            <input
              type="text"
              className="tecof-icon-search-input"
              placeholder="İkon ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="tecof-icon-grid">
            {filteredIcons.map((name) => {
              const IconComp = (Icons as any)[name];
              return (
                <button
                  key={name}
                  type="button"
                  className={`tecof-icon-item-btn ${value === name ? 'selected' : ''}`}
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setIsOpen(false);
                  }}
                >
                  <IconComp size={16} />
                  <span className="tecof-icon-name">{name}</span>
                </button>
              );
            })}
            {filteredIcons.length === 0 && (
              <div className="tecof-icon-empty">İkon bulunamadı.</div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export const createIconField = (options: IconFieldOptions = {}) => {
  const { label, labelIcon, visible } = options;

  return {
    type: 'custom' as const,
    _fieldType: 'icon' as const,
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }: IconFieldProps) => (
      <FieldLabel label={label || ''} icon={labelIcon} readOnly={readOnly}>
        <FieldErrorBoundary fieldName={name}>
          <IconField
            field={field}
            name={name}
            id={id}
            value={value || ''}
            onChange={onChange}
            readOnly={readOnly}
          />
        </FieldErrorBoundary>
      </FieldLabel>
    ),
  };
};

export default IconField;
