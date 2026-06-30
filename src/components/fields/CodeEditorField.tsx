import type { ReactElement } from 'react';
import { forwardRef, lazy, Suspense } from 'react';
import { FieldLabel } from './FieldLabel';
import { FieldErrorBoundary } from './FieldErrorBoundary';
import { FieldLoading } from './LanguageField';

/* ─── Props ─── */

export interface CodeEditorFieldProps {
  field: any;
  name: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export interface CodeEditorFieldOptions {
  /** Field label displayed in the Puck sidebar */
  label?: string;
  /** Icon displayed next to the label (React element, e.g. Lucide icon) */
  labelIcon?: ReactElement;
  /** Whether this field is visible in the sidebar */
  visible?: boolean;
  defaultLanguage?: string;
  height?: string;
  theme?: string;
}

/* ─── Lazy Heavy Implementation ─── */

// Monaco (@monaco-editor/react) is heavy; load it only when this field renders.
const CodeEditorFieldImpl = lazy(() => import('./CodeEditorField.impl'));

/* ─── Component ─── */

/**
 * CodeEditorField — A code editor custom field for Puck.
 * Uses Monaco Editor (@monaco-editor/react), lazy-loaded behind <Suspense>.
 */
export const CodeEditorField = forwardRef<any, CodeEditorFieldProps & CodeEditorFieldOptions>((props, ref) => (
  <Suspense fallback={<FieldLoading />}>
    <CodeEditorFieldImpl ref={ref} {...props} />
  </Suspense>
));

CodeEditorField.displayName = 'CodeEditorField';

/* ─── Factory Function ─── */

/**
 * Creates a Puck custom field definition for code editing.
 *
 * @example
 * ```ts
 * import { createCodeEditorField } from '@tecof/theme-editor';
 *
 * const config = {
 *   components: {
 *     CustomHero: {
 *       fields: {
 *         customHtml: createCodeEditorField({
 *           label: 'Özel HTML Kodu',
 *           defaultLanguage: 'html',
 *           height: '400px',
 *         }),
 *       },
 *       defaultProps: { customHtml: '' },
 *       render: ({ customHtml }) => <div dangerouslySetInnerHTML={{ __html: customHtml }} />,
 *     },
 *   },
 * };
 * ```
 */
export const createCodeEditorField = (options: CodeEditorFieldOptions = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;

  return {
    type: 'custom' as const,
    _fieldType: 'code' as const,
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }: CodeEditorFieldProps) => (
      <FieldLabel label={label || ''} icon={labelIcon} readOnly={readOnly}>
        <FieldErrorBoundary fieldName={name}>
          <CodeEditorField
            field={field}
            name={name}
            id={id}
            value={value || ''}
            onChange={onChange}
            readOnly={readOnly}
            {...fieldOptions}
          />
        </FieldErrorBoundary>
      </FieldLabel>
    ),
  };
};

export default CodeEditorField;
