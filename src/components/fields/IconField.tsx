import dynamicIconImports from 'lucide-react/dynamicIconImports';
import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type LazyExoticComponent,
} from 'react';
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

// Extract valid lowercase icon names from lucide-react/dynamicIconImports
const ALL_ICON_NAMES = Object.keys(dynamicIconImports).sort();

/** Cap the rendered grid so typing stays responsive (~1500 icons in total). */
const MAX_VISIBLE_ICONS = 120;

type LucideIconComponent = ComponentType<{ size?: number; className?: string }>;

/**
 * `lazy()` must not be called during render: it returns a brand-new component
 * every time, which remounts the icon and re-triggers Suspense on each
 * keystroke. Cache one lazy component per icon name for the module lifetime.
 */
const lazyIconCache = new Map<string, LazyExoticComponent<LucideIconComponent>>();

const getLazyIcon = (name: string): LazyExoticComponent<LucideIconComponent> | null => {
  const importFn = dynamicIconImports[name as keyof typeof dynamicIconImports];
  if (!importFn) return null;
  let icon = lazyIconCache.get(name);
  if (!icon) {
    icon = lazy(importFn);
    lazyIconCache.set(name, icon);
  }
  return icon;
};

const DynamicIcon = ({ name, size = 16, className }: { name: string; size?: number; className?: string }) => {
  const LucideIcon = getLazyIcon(name);
  const placeholder = <div style={{ width: size, height: size }} className={className} />;
  if (!LucideIcon) return placeholder;

  return (
    <Suspense fallback={placeholder}>
      <LucideIcon size={size} className={className} />
    </Suspense>
  );
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

  // Filter icons based on search query (names are already lowercase)
  const filteredIcons = useMemo(() => {
    const query = search.trim().toLowerCase();
    const names = query ? ALL_ICON_NAMES.filter((name) => name.includes(query)) : ALL_ICON_NAMES;
    return names.slice(0, MAX_VISIBLE_ICONS);
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

  // Check if selected icon is valid
  const hasSelectedIcon = Boolean(value && value in dynamicIconImports);

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
            {hasSelectedIcon ? (
              <DynamicIcon name={value} className="tecof-icon-trigger-preview-icon" size={16} />
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
            {filteredIcons.map((name) => (
              <button
                key={name}
                type="button"
                className={`tecof-icon-item-btn ${value === name ? 'selected' : ''}`}
                title={name}
                onClick={() => selectIcon(name)}
              >
                <DynamicIcon name={name} size={16} />
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
