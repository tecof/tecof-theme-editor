import { forwardRef, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { CodeEditorFieldProps, CodeEditorFieldOptions } from './CodeEditorField';

/* ─── Heavy Implementation ─── */

/**
 * CodeEditorFieldImpl — The heavy Monaco-backed implementation.
 * Statically imports Monaco (@monaco-editor/react); loaded lazily via
 * CodeEditorField wrapper so it stays out of the initial bundle chunk.
 */
const CodeEditorFieldImpl = forwardRef<any, CodeEditorFieldProps & CodeEditorFieldOptions>(({
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

CodeEditorFieldImpl.displayName = 'CodeEditorFieldImpl';

export default CodeEditorFieldImpl;
