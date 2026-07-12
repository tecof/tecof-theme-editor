import type { ReactElement } from 'react';
import { lazy, Suspense } from 'react';
import { FieldLabel } from './FieldLabel';
import { FieldErrorBoundary } from './FieldErrorBoundary';
import { FieldLoading } from './LanguageField';
import type { LanguageFieldValue } from '../../types';

export interface EditorFieldProps {
  field: any;
  name: string;
  id: string;
  value: LanguageFieldValue[];
  onChange: (value: LanguageFieldValue[]) => void;
  readOnly?: boolean;
}

export interface EditorFieldOptions {
  /** Field label displayed in the Puck sidebar */
  label?: string;
  /** Icon displayed next to the label (React element, e.g. Lucide icon) */
  labelIcon?: ReactElement;
  /** Whether this field is visible in the sidebar */
  visible?: boolean;
  /** Placeholder text for empty editor */
  placeholder?: string;
  /**
   * Show the CMS data-binding button in the toolbar (inserts a `{{ data.field }}`
   * reference at the cursor). Defaults to `true`; the button only appears when a
   * TecofProvider `apiClient` is available. Set `false` to hide it.
   */
  bindable?: boolean;
}

/* ─── Lazy Heavy Implementation ─── */

// TipTap (@tiptap/*) is heavy; load it only when this field renders.
const EditorFieldImpl = lazy(() => import('./EditorField.impl'));

/* ─── Main Component ─── */

/**
 * EditorField — A multilingual TipTap rich text editor field for Puck.
 *
 * Uses the same language tab system as LanguageField, but renders a
 * TipTap editor with toolbar (bold, italic, underline, headings, lists,
 * alignment, links, blockquote, undo/redo) instead of a plain text input.
 *
 * The heavy TipTap editor is lazy-loaded behind <Suspense>.
 *
 * Value format: [{ code: "tr", value: "<p>HTML content</p>" }, ...]
 */
export const EditorField = (props: EditorFieldProps & EditorFieldOptions) => (
  <Suspense fallback={<FieldLoading />}>
    <EditorFieldImpl {...props} />
  </Suspense>
);

/* ─── Factory Function (Puck Custom Field) ─── */

/**
 * Creates a Puck custom field definition for multilingual rich text (TipTap) editor.
 *
 * @example
 * ```ts
 * import { createEditorField } from '@tecof/theme-editor';
 *
 * const config = {
 *   components: {
 *     TextBlock: {
 *       fields: {
 *         content: createEditorField({ label: 'İçerik' }),
 *       },
 *       defaultProps: { content: [] },
 *       render: ({ content }) => { ... },
 *     },
 *   },
 * };
 * ```
 */
export const createEditorField = (
  options: EditorFieldOptions = {}
) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;

  return {
    type: 'custom' as const,
    _fieldType: 'editor' as const,
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }: EditorFieldProps) => (
      <FieldLabel label={label || ''} icon={labelIcon} readOnly={readOnly}>
        <FieldErrorBoundary fieldName={name}>
          <EditorField
            field={field}
            name={name}
            id={id}
            value={value || []}
            onChange={onChange}
            readOnly={readOnly}
            {...fieldOptions}
          />
        </FieldErrorBoundary>
      </FieldLabel>
    ),
  };
};

export default EditorField;
