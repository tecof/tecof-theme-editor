import { useCallback, useMemo, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import { BulletList, OrderedList, ListItem, ListKeymap } from '@tiptap/extension-list';
import Blockquote from '@tiptap/extension-blockquote';
import HardBreak from '@tiptap/extension-hard-break';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import { useLanguages } from './useLanguages';
import { LanguageTabBar, FieldLoading, fieldStyles } from './LanguageField';
import type { LanguageFieldValue } from '../../types';

/* ─── Extensions preset ─── */

const createExtensions = () => [
  Document,
  Paragraph,
  Text,
  Bold,
  Italic,
  Strike,
  Underline,
  Heading.configure({ levels: [2, 3, 4] }),
  BulletList,
  OrderedList,
  ListItem,
  ListKeymap,
  Blockquote,
  HardBreak,
  HorizontalRule,
  Code,
  CodeBlock,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank' } }),
];

/* ─── Toolbar Styles ─── */

const editorFieldStyles = {
  editorWrapper: {
    border: '1px solid #e4e4e7',
    borderRadius: '8px',
    overflow: 'hidden' as const,
    background: '#ffffff',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '1px',
    padding: '4px 6px',
    borderBottom: '1px solid #e4e4e7',
    background: '#fafafa',
  },
  toolbarBtn: (isActive: boolean) => ({
    display: 'inline-flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: '28px',
    height: '28px',
    padding: '0',
    fontSize: '13px',
    fontWeight: isActive ? 700 : 400,
    color: isActive ? '#3b82f6' : '#52525b',
    background: isActive ? '#eff6ff' : 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer' as const,
    transition: 'all 0.1s ease',
    outline: 'none',
    lineHeight: 1,
  }),
  divider: {
    width: '1px',
    height: '20px',
    background: '#e4e4e7',
    margin: '4px 3px',
    alignSelf: 'center' as const,
  },
} as const;

/* ─── Toolbar Button ─── */

const ToolbarBtn = ({
  onClick,
  isActive = false,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    style={editorFieldStyles.toolbarBtn(isActive)}
    onClick={onClick}
    title={title}
    onMouseDown={e => e.preventDefault()}
  >
    {children}
  </button>
);

/* ─── Toolbar ─── */

const EditorToolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div style={editorFieldStyles.toolbar}>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <strong>B</strong>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <em>I</em>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline"
      >
        <span style={{ textDecoration: 'underline' }}>U</span>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <span style={{ textDecoration: 'line-through' }}>S</span>
      </ToolbarBtn>

      <div style={editorFieldStyles.divider} />

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        H2
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        H3
      </ToolbarBtn>

      <div style={editorFieldStyles.divider} />

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        •
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Ordered List"
      >
        1.
      </ToolbarBtn>

      <div style={editorFieldStyles.divider} />

      <ToolbarBtn
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Align Left"
      >
        ☰
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Align Center"
      >
        ☰
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        title="Align Right"
      >
        ☰
      </ToolbarBtn>

      <div style={editorFieldStyles.divider} />

      <ToolbarBtn
        onClick={() => {
          if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
          } else {
            const url = window.prompt('URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
            }
          }
        }}
        isActive={editor.isActive('link')}
        title="Link"
      >
        🔗
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Blockquote"
      >
        ❝
      </ToolbarBtn>

      <div style={editorFieldStyles.divider} />

      <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
        ↩
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
        ↪
      </ToolbarBtn>
    </div>
  );
};

/* ─── Single Language TipTap Editor ─── */

const TipTapInstance = ({
  content,
  onUpdate,
  readOnly,
}: {
  content: string;
  onUpdate: (html: string) => void;
  readOnly?: boolean;
}) => {
  const isMountedRef = useRef(false);

  const editor = useEditor({
    extensions: createExtensions(),
    content: content || '',
    editable: !readOnly,
    onUpdate: ({ editor: ed }) => {
      if (isMountedRef.current) {
        onUpdate(ed.getHTML());
      }
    },
    immediatelyRender: false,
  });

  // Mark mounted after first render to avoid firing onUpdate on initialization
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Sync external content changes (e.g. when switching language tabs)
  const lastExternalContent = useRef(content);
  useEffect(() => {
    if (editor && content !== lastExternalContent.current) {
      lastExternalContent.current = content;
      const currentHtml = editor.getHTML();
      if (currentHtml !== content) {
        isMountedRef.current = false;
        editor.commands.setContent(content || '');
        requestAnimationFrame(() => { isMountedRef.current = true; });
      }
    }
  }, [content, editor]);

  return (
    <div>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

/* ─── Inject Editor Styles ─── */

let editorStylesInjected = false;
const injectEditorStyles = () => {
  if (editorStylesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = `
    .tecof-editor-field .tiptap {
      padding: 10px 14px;
      min-height: 120px;
      outline: none;
      font-size: 14px;
      line-height: 1.6;
      color: #18181b;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .tecof-editor-field .tiptap p { margin: 0 0 0.5em 0; }
    .tecof-editor-field .tiptap h2 { font-size: 1.4em; font-weight: 600; margin: 0.8em 0 0.4em; }
    .tecof-editor-field .tiptap h3 { font-size: 1.2em; font-weight: 600; margin: 0.6em 0 0.3em; }
    .tecof-editor-field .tiptap h4 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0 0.25em; }
    .tecof-editor-field .tiptap ul,
    .tecof-editor-field .tiptap ol { padding-left: 1.4em; margin: 0.4em 0; }
    .tecof-editor-field .tiptap li { margin: 0.1em 0; }
    .tecof-editor-field .tiptap blockquote {
      border-left: 3px solid #e4e4e7;
      padding-left: 12px;
      margin: 0.6em 0;
      color: #71717a;
      font-style: italic;
    }
    .tecof-editor-field .tiptap a { color: #3b82f6; text-decoration: underline; }
    .tecof-editor-field .tiptap code {
      background: #f4f4f5; padding: 2px 4px; border-radius: 3px;
      font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.9em;
    }
    .tecof-editor-field .tiptap pre {
      background: #18181b; color: #e4e4e7; padding: 12px 16px;
      border-radius: 6px; font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 13px; overflow-x: auto;
    }
    .tecof-editor-field .tiptap hr {
      border: none; border-top: 1px solid #e4e4e7; margin: 1em 0;
    }
  `;
  document.head.appendChild(style);
  editorStylesInjected = true;
};

/* ─── Props ─── */

export interface EditorFieldProps {
  field: any;
  name: string;
  id: string;
  value: LanguageFieldValue[];
  onChange: (value: LanguageFieldValue[]) => void;
  readOnly?: boolean;
}

export interface EditorFieldOptions {
  /** Placeholder text for empty editor */
  placeholder?: string;
}

/* ─── Main Component ─── */

/**
 * EditorField — A multilingual TipTap rich text editor field for Puck.
 *
 * Uses the same language tab system as LanguageField, but renders a
 * TipTap editor with toolbar (bold, italic, underline, headings, lists,
 * alignment, links, blockquote, undo/redo) instead of a plain text input.
 *
 * Value format: [{ code: "tr", value: "<p>HTML content</p>" }, ...]
 */
export const EditorField = ({
  value,
  onChange,
  readOnly,
}: EditorFieldProps & EditorFieldOptions) => {
  const { merchantInfo, loading, error, activeTab, setActiveTab } = useLanguages();

  // Inject TipTap styles once
  useEffect(() => { injectEditorStyles(); }, []);

  // Ensure values array has entries for all languages
  const values = useMemo<LanguageFieldValue[]>(() => {
    if (!merchantInfo) return value || [];
    const current = value || [];
    return merchantInfo.languages.map(code => {
      const existing = current.find(v => v.code === code);
      return existing || { code, value: '' };
    });
  }, [value, merchantInfo]);

  // Handle editor content change
  const handleChange = useCallback((code: string, html: string) => {
    const updated = [...values];
    const idx = updated.findIndex(v => v.code === code);
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], value: html };
    } else {
      updated.push({ code, value: html });
    }
    onChange(updated);
  }, [values, onChange]);

  if (loading) return <FieldLoading />;
  if (error && !merchantInfo) return <div style={fieldStyles.error}>{error}</div>;
  if (!merchantInfo) return null;

  const { languages, defaultLanguage } = merchantInfo;

  return (
    <div style={fieldStyles.container} className="tecof-editor-field">
      <LanguageTabBar
        languages={languages}
        defaultLanguage={defaultLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {languages.map(code => {
        if (activeTab !== code) return null;
        const currentValue = values.find(v => v.code === code)?.value || '';

        return (
          <div key={code} style={editorFieldStyles.editorWrapper}>
            <TipTapInstance
              content={currentValue}
              onUpdate={(html) => handleChange(code, html)}
              readOnly={readOnly}
            />
          </div>
        );
      })}
    </div>
  );
};

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
  options: EditorFieldOptions & { label?: string } = {}
) => {
  const { label, ...fieldOptions } = options;

  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange, readOnly, field, name, id }: EditorFieldProps) => (
      <EditorField
        field={field}
        name={name}
        id={id}
        value={value || []}
        onChange={onChange}
        readOnly={readOnly}
        {...fieldOptions}
      />
    ),
  };
};

export default EditorField;
