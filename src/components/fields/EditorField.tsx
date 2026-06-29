import type { ReactElement } from 'react';
import { useCallback, useMemo, useEffect, useRef, useState } from 'react';
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
import Image from '@tiptap/extension-image';
import { FieldLabel } from './FieldLabel';
import { FieldErrorBoundary } from './FieldErrorBoundary';
import { useLanguages } from './useLanguages';
import { LanguageTabBar, FieldLoading } from './LanguageField';
import { MediaDrawer } from './MediaDrawer';
import { useTecof } from '../TecofProvider';
import type { LanguageFieldValue } from '../../types';
import type { UploadedFile } from '../../types';

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
  Image.configure({ inline: false, allowBase64: false, HTMLAttributes: { class: 'tecof-editor-image' } }),
];

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
    className={`tecof-editor-toolbar-btn ${isActive ? 'active' : ''}`}
    onClick={onClick}
    title={title}
    onMouseDown={e => e.preventDefault()}
  >
    {children}
  </button>
);

/* ─── Toolbar ─── */

const EditorToolbar = ({ editor, onImageClick }: { editor: any; onImageClick?: () => void }) => {
  if (!editor) return null;

  return (
    <div className="tecof-editor-toolbar">
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
        <span className="tecof-underline">U</span>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <span className="tecof-line-through">S</span>
      </ToolbarBtn>

      <div className="tecof-editor-divider" />

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

      <div className="tecof-editor-divider" />

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

      <div className="tecof-editor-divider" />

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

      <div className="tecof-editor-divider" />

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
      {onImageClick && (
        <ToolbarBtn
          onClick={onImageClick}
          isActive={false}
          title="Resim Ekle"
        >
          🖼️
        </ToolbarBtn>
      )}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Blockquote"
      >
        ❝
      </ToolbarBtn>

      <div className="tecof-editor-divider" />

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
  cdnUrl,
}: {
  content: string;
  onUpdate: (html: string) => void;
  readOnly?: boolean;
  cdnUrl: string;
}) => {
  const isMountedRef = useRef(false);
  const [mediaDrawerOpen, setMediaDrawerOpen] = useState(false);

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

  // Handle image selection from media library
  const handleImageSelect = useCallback((file: UploadedFile) => {
    if (!editor) return;
    const src = `${cdnUrl}/${file.name}`;
    const alt = file.meta?.originalName || file.name;
    editor.chain().focus().setImage({ src, alt }).run();
  }, [editor, cdnUrl]);

  return (
    <div>
      <EditorToolbar
        editor={editor}
        onImageClick={readOnly ? undefined : () => setMediaDrawerOpen(true)}
      />
      <EditorContent editor={editor} />

      {/* Media Library Drawer for image insertion */}
      <MediaDrawer
        open={mediaDrawerOpen}
        onOpenChange={setMediaDrawerOpen}
        onSelect={handleImageSelect}
        filterImages
        title="Resim Ekle"
      />
    </div>
  );
};



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
  const { cdnUrl } = useTecof();

  // Ensure values array has entries for all languages
  const values = useMemo<LanguageFieldValue[]>(() => {
    if (!merchantInfo) return value || [];
    const current = value || [];
    return merchantInfo.languages.map(code => {
      const existing = current.find(v => v.code === code);
      return existing || { code, value: '' };
    });
  }, [value, merchantInfo]);

  // Stable refs for callbacks
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Handle editor content change
  const handleChange = useCallback((code: string, html: string) => {
    const current = valuesRef.current;
    const updated = [...current];
    const idx = updated.findIndex(v => v.code === code);
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], value: html };
    } else {
      updated.push({ code, value: html });
    }
    onChangeRef.current(updated);
  }, []);

  if (loading) return <FieldLoading />;
  if (error && !merchantInfo) return <div className="tecof-lang-error">{error}</div>;
  if (!merchantInfo) return null;

  const { languages, defaultLanguage } = merchantInfo;

  return (
    <div className="tecof-lang-container tecof-editor-field">
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
          <div key={code} className="tecof-editor-wrapper">
            <TipTapInstance
              content={currentValue}
              onUpdate={(html) => handleChange(code, html)}
              readOnly={readOnly}
              cdnUrl={cdnUrl || ''}
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
