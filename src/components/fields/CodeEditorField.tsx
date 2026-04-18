import type { ReactElement } from 'react';
import React, { forwardRef, useCallback, useRef } from 'react';
import { FieldLabel } from '@puckeditor/core';
import Editor from '@monaco-editor/react';

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

/* ─── Component ─── */

/**
 * CodeEditorField — A code editor custom field for Puck.
 * Uses Monaco Editor (@monaco-editor/react).
 */
export const CodeEditorField = forwardRef<any, CodeEditorFieldProps & CodeEditorFieldOptions>(({
  value,
  onChange,
  readOnly,
  defaultLanguage = 'html',
  height = '300px',
  theme = 'vs-dark',
}, ref) => {
  const editorRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleEditorDidMount = useCallback((editor: any) => {
    editorRef.current = editor;

    // Listen directly on the Monaco model for maximum reliability
    editor.onDidChangeModelContent(() => {
      const newValue = editor.getValue();
      onChangeRef.current(newValue);
    });
  }, []);

  return (
    <div ref={ref} className="tecof-code-editor-container">
      <Editor
        onMount={handleEditorDidMount}
        theme={theme}
        width="100%"
        height={height}
        defaultLanguage={defaultLanguage}
        defaultValue={value || ''}
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          fontSize: 13,
          wordWrap: 'on',
        }}
      />
    </div>
  );
});

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
        <CodeEditorField
          field={field}
          name={name}
          id={id}
          value={value || ''}
          onChange={onChange}
          readOnly={readOnly}
          {...fieldOptions}
        />
      </FieldLabel>
    ),
  };
};

export default CodeEditorField;
