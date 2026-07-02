import { icons } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFloating } from '../../utils/useFloating';
import { FieldErrorBoundary } from './FieldErrorBoundary';
import { FieldLabel } from './FieldLabel';

export interface IconFieldProps {
  field: unknown;
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

/**
 * The static `icons` map from lucide-react (PascalCase keys: `ArrowUpRight`).
 *
 * Why static instead of `lucide-react/dynamicIconImports`:
 * - the dynamic variant resolves icons with runtime `import()` calls, which
 *   break once this package is prebuilt and consumed as an external dep;
 * - themes look icons up by PascalCase (`LucideIcons[props.icon]`), so the
 *   stored value must be the PascalCase name — dynamicIconImports keys are
 *   kebab-case and never matched.
 */
const ALL_ICONS = Object.entries(icons)
  .map(([name, Icon]) => ({ name, lower: name.toLowerCase(), Icon }))
  .sort((a, b) => a.name.localeCompare(b.name));

/** Cap the rendered grid so typing stays responsive (~1700 icons in total). */
const MAX_VISIBLE_ICONS = 120;

/** `arrow-up-right` → `ArrowUpRight` (legacy stored values). */
const kebabToPascal = (name: string) =>
  name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

/** Canonical PascalCase icon name, tolerating legacy kebab-case values. */
const canonicalIconName = (name?: string): string | null => {
  if (!name) return null;
  if (name in icons) return name;
  const pascal = kebabToPascal(name);
  return pascal in icons ? pascal : null;
};

const IconPreview = ({ name, size = 16, className }: { name?: string; size?: number; className?: string }) => {
  const canonical = canonicalIconName(name);
  if (!canonical) return <div style={{ width: size, height: size }} className={className} />;
  const Icon = icons[canonical as keyof typeof icons];
  return <Icon size={size} className={className} />;
};

export const IconField = ({ value, onChange, readOnly }: IconFieldProps) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { floatingRef, style: floatingStyle } = useFloating({
    anchor: triggerRef.current,
    open: isOpen,
    placement: 'bottom-start',
  });

  const close = useCallback(() => {
    setIsOpen(false);
    setSearch('');
  }, []);

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = query ? ALL_ICONS.filter((item) => item.lower.includes(query)) : ALL_ICONS;
    return list.slice(0, MAX_VISIBLE_ICONS);
  }, [search]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      if (
        !floatingRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        close();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, floatingRef, close]);

  const selectIcon = (name: string) => {
    onChange(name);
    close();
  };

  // Canonical name of the current value (null when empty/unknown)
  const selectedName = canonicalIconName(value);

  return (
    <div className="tecof-icon-field-container">
      {/* Trigger Button */}
      <div className="tecof-icon-trigger-wrap" ref={triggerRef}>
        <button
          type="button"
          className={`tecof-icon-trigger-btn ${isOpen ? 'open' : ''}`}
          disabled={readOnly}
          onClick={() => (isOpen ? close() : setIsOpen(true))}
        >
          <div className="tecof-icon-trigger-left">
            {selectedName ? (
              <IconPreview name={selectedName} className="tecof-icon-trigger-preview-icon" size={16} />
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

      {/* Popover Dropdown */}
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
            {filteredIcons.map(({ name, Icon }) => (
              <button
                key={name}
                type="button"
                className={`tecof-icon-item-btn ${selectedName === name ? 'selected' : ''}`}
                title={name}
                onClick={() => selectIcon(name)}
              >
                <Icon size={16} />
                <span className="tecof-icon-name">{name}</span>
              </button>
            ))}
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
