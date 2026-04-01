import React, { forwardRef, useRef } from 'react';
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
  label?: string;
  defaultLanguage?: string;
  height?: string;
  theme?: string;
}

/* ─── Styles ─── */

const s = {
  container: {
    width: '100%',
    fontFamily: "'Inter', system-ui, sans-serif",
    border: '1px solid #e4e4e7',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#ffffff',
  },
} as const;

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

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div ref={ref} style={s.container}>
      <Editor
        onMount={handleEditorDidMount}
        theme={theme}
        width="100%"
        height={height}
        defaultLanguage={defaultLanguage}
        value={value || ''}
        onChange={(val) => onChange(val || '')}
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
  const { label, ...fieldOptions } = options;

  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange, readOnly, field, name, id }: CodeEditorFieldProps) => (
      <CodeEditorField
        field={field}
        name={name}
        id={id}
        value={value || ''}
        onChange={onChange}
        readOnly={readOnly}
        {...fieldOptions}
      />
    ),
  };
};

export default CodeEditorField;
