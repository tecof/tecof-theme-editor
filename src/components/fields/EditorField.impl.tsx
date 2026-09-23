import { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { cdnFileUrl } from '../../utils';
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
// Lucide toolbar icons. Names that collide with the TipTap extension imports
// above (Bold/Italic/Underline/Code/Link/Image) are aliased with an `Icon` suffix.
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough,
  Code as CodeIcon,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  SquareCode,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  RemoveFormatting,
  Undo2,
  Redo2,
} from 'lucide-react';
import { useLanguages } from './useLanguages';
import { useActiveLanguage } from '../../studio/language/LanguageContext';
import { LanguageTabBar, FieldLoading } from './LanguageField';
import { MediaDrawer } from './MediaDrawer';
import { CmsBindingButton } from './CmsBindingButton';
import { useTecof } from '../TecofProvider';
import type { LanguageFieldValue } from '../../types';
import type { UploadedFile } from '../../types';
import type { EditorFieldProps, EditorFieldOptions } from './EditorField';
import { LanguageToolsBar, useLanguageToolsStatus } from './LanguageToolsBar';
import {
  fillLanguages,
  translateLanguages,
  normalizeLocalizedValues,
  isEmptyHtml,
  LANGUAGE_TOOL_MESSAGES,
} from './languageTools';

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
  // `rel` guards against reverse-tabnabbing on target=_blank links (and drops
  // referrer). Set on HTMLAttributes so EVERY rendered link carries it.
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
  }),
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

const ICON = 15;

const EditorToolbar = ({
  editor,
  onImageClick,
  showBinding,
}: {
  editor: any;
  onImageClick?: () => void;
  showBinding?: boolean;
}) => {
  if (!editor) return null;

  // Link: prefill the current href, empty string clears, Cancel is a no-op.
  // extendMarkRange lets the user set/replace a link without first selecting the
  // whole word.
  const editLink = () => {
    const prev = editor.getAttributes('link')?.href || '';
    const url = window.prompt('Bağlantı URL:', prev);
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim(), target: '_blank' }).run();
  };

  return (
    <div className="tecof-editor-toolbar">
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Kalın">
        <BoldIcon size={ICON} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="İtalik">
        <ItalicIcon size={ICON} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Altı çizili">
        <UnderlineIcon size={ICON} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Üstü çizili">
        <Strikethrough size={ICON} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Satır içi kod">
        <CodeIcon size={ICON} />
      </ToolbarBtn>

      <div className="tecof-editor-divider" />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Başlık 2">
        <Heading2 size={ICON} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Başlık 3">
        <Heading3 size={ICON} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} isActive={editor.isActive('heading', { level: 4 })} title="Başlık 4">
        <Heading4 size={ICON} />
      </ToolbarBtn>

      <div className="tecof-editor-divider" />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Madde işaretli liste">
        <List size={ICON} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Sıralı liste">
        <ListOrdered size={ICON} />
      </ToolbarBtn>

      <div className="tecof-editor-divider" />

      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Sola hizala">
        <AlignLeft size={ICON} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Ortala">
        <AlignCenter size={ICON} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Sağa hizala">
        <AlignRight size={ICON} />
      </ToolbarBtn>

      <div className="tecof-editor-divider" />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Alıntı">
        <Quote size={ICON} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Kod bloğu">
        <SquareCode size={ICON} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Yatay çizgi">
        <Minus size={ICON} />
      </ToolbarBtn>

      <div className="tecof-editor-divider" />

      <ToolbarBtn onClick={editLink} isActive={editor.isActive('link')} title="Bağlantı">
        <LinkIcon size={ICON} />
      </ToolbarBtn>
      {onImageClick && (
        <ToolbarBtn onClick={onImageClick} title="Görsel ekle">
          <ImageIcon size={ICON} />
        </ToolbarBtn>
      )}
      {showBinding && (
        // Insert a `{{ data.field }}` CMS reference at the cursor; the component
        // resolves it against `puck.metadata.cmsData` at render time — same
        // convention as the bindable text field.
        <CmsBindingButton
          onInsert={(token) => editor.chain().focus().insertContent(token).run()}
        />
      )}

      <div className="tecof-editor-divider" />

      <ToolbarBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Biçimi temizle">
        <RemoveFormatting size={ICON} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Geri al">
        <Undo2 size={ICON} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Yinele">
        <Redo2 size={ICON} />
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
  showBinding,
}: {
  content: string;
  onUpdate: (html: string) => void;
  readOnly?: boolean;
  cdnUrl: string;
  showBinding?: boolean;
}) => {
  const isMountedRef = useRef(false);
  const [mediaDrawerOpen, setMediaDrawerOpen] = useState(false);

  const editor = useEditor({
    extensions: createExtensions(),
    content: content || '',
    editable: !readOnly,
    onUpdate: ({ editor: ed }: { editor: { getHTML: () => string } }) => {
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

  // Dış içerik değişimini senkronla (undo/redo, AI düzenlemesi, tuval içi
  // düzenleme). Hızlı Doldur / Çevir aktif dilin string'ini DEĞİŞTİRMEDİĞİ için
  // buraya girmez → imleç ve odak korunur. `emitUpdate:false` (TipTap v3 resmi
  // seçeneği) onUpdate'i bastırır; eski `isMountedRef=false + rAF` hilesi rAF
  // penceresinde gelen tuş vuruşunu yutabiliyordu, o yüzden kaldırıldı.
  const lastExternalContent = useRef(content);
  useEffect(() => {
    if (editor && content !== lastExternalContent.current) {
      lastExternalContent.current = content;
      const currentHtml = editor.getHTML();
      if (currentHtml !== content) {
        editor.commands.setContent(content || '', { emitUpdate: false });
      }
    }
  }, [content, editor]);

  // Handle image selection from media library
  const handleImageSelect = useCallback((file: UploadedFile) => {
    if (!editor) return;
    /* cdnFileUrl ŞART: URL TipTap HTML'ine KALICI yazılır. folder'sız kurulan
       adres scope'lu dosyada 404'tü ve external stok görsellerde file.url
       yerine file.name kullanıldığı için onlar da kırıktı. */
    const src = cdnFileUrl(cdnUrl, file);
    if (!src) return;
    const alt = file.meta?.originalName || file.name;
    editor.chain().focus().setImage({ src, alt }).run();
  }, [editor, cdnUrl]);

  return (
    <div>
      <EditorToolbar
        editor={editor}
        onImageClick={readOnly ? undefined : () => setMediaDrawerOpen(true)}
        showBinding={!readOnly && showBinding}
      />
      <EditorContent editor={editor} />

      {/* Media Library Drawer for image insertion */}
      <MediaDrawer
        open={mediaDrawerOpen}
        onOpenChange={setMediaDrawerOpen}
        onSelect={handleImageSelect}
        filterImages
        enableStock
        title="Resim Ekle"
      />
    </div>
  );
};

/* ─── Heavy Implementation ─── */

/**
 * EditorFieldImpl — The heavy TipTap-backed implementation.
 * Statically imports @tiptap/*; loaded lazily via the EditorField wrapper so
 * it stays out of the initial bundle chunk.
 */
const EditorFieldImpl = ({
  value,
  onChange,
  readOnly,
  bindable,
}: EditorFieldProps & EditorFieldOptions) => {
  const {
    merchantInfo,
    loading,
    error,
    activeTab: localActiveTab,
    setActiveTab: localSetActiveTab,
  } = useLanguages();
  const globalLang = useActiveLanguage();
  const activeTab = globalLang ? globalLang.activeLanguage : localActiveTab;
  const setActiveTab = globalLang ? globalLang.setActiveLanguage : localSetActiveTab;
  const { cdnUrl, apiClient } = useTecof();

  // CMS binding toolbar button: on by default, but only when the host actually
  // has an API client (there'd be no collections to bind to otherwise).
  const showBinding = bindable !== false && !!apiClient;

  // Durum mesajı + çeviri bayrağı (LanguageField ile aynı hook)
  const { status, translating, setTranslating, flash } = useLanguageToolsStatus();

  // Ensure values array has entries for all languages
  const values = useMemo<LanguageFieldValue[]>(() => {
    // AI-written data can leave a bare string here — never let .find crash the field
    if (!merchantInfo) return Array.isArray(value) ? value : [];
    return normalizeLocalizedValues<string>(value, merchantInfo.languages, () => '');
  }, [value, merchantInfo]);

  // Stable refs for callbacks
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // ── Hızlı Doldur: aktif HTML'i tüm dillere kopyala (üzerine yazar — LanguageField paritesi).
  // Aktif dil aynı string'i aldığı için TipTapInstance senkron efekti tetiklenmez.
  const handleFastFill = useCallback(() => {
    if (!merchantInfo) return;
    const res = fillLanguages(valuesRef.current, merchantInfo.languages, activeTab, {
      isEmpty: isEmptyHtml,
    });
    if (!res) return; // boş <p></p> — düğme zaten pasif
    onChangeRef.current(res.values);
    flash({ text: LANGUAGE_TOOL_MESSAGES.filledAll, type: 'success' }, 2000);
  }, [merchantInfo, activeTab, flash]);

  // ── Çevir: aktif HTML'i etiketleri koruyarak (isHtml) diğer dillere çevir.
  // Sonuç yalnız diğer dillere yazılır; aktif editör dokunulmaz kalır.
  const handleTranslate = useCallback(async () => {
    if (!merchantInfo) return;
    setTranslating(true);
    try {
      const outcome = await translateLanguages({
        values: () => valuesRef.current,
        languages: merchantInfo.languages,
        sourceCode: activeTab,
        translate: apiClient.translate.bind(apiClient),
        isHtml: true,
        isEmpty: isEmptyHtml,
      });
      if (outcome.ok) {
        onChangeRef.current(outcome.values);
        flash({ text: LANGUAGE_TOOL_MESSAGES.translated, type: 'success' }, 3000);
      } else {
        flash({ text: outcome.message, type: 'error' }, 3000);
      }
    } finally {
      setTranslating(false);
    }
  }, [merchantInfo, activeTab, apiClient, flash, setTranslating]);

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
  // Boşluk tanımı HTML'e göre: TipTap boş belgede <p></p> üretir.
  const hasContent = !isEmptyHtml(values.find(v => v.code === activeTab)?.value || '');
  const hasMultipleLanguages = languages.length > 1;

  return (
    <div className="tecof-lang-container tecof-editor-field">
      {!globalLang && (
        <LanguageTabBar
          languages={languages}
          defaultLanguage={defaultLanguage}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

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
              showBinding={showBinding}
            />
          </div>
        );
      })}

      {/* Araç çubuğu: Hızlı Doldur + Çevir. Çevir yalnız apiClient varken (showBinding kapısıyla aynı mantık). */}
      {!readOnly && hasMultipleLanguages && (
        <LanguageToolsBar
          onFill={handleFastFill}
          fillDisabled={!hasContent}
          onTranslate={apiClient ? handleTranslate : undefined}
          translateDisabled={!hasContent}
          translating={translating}
          status={status}
        />
      )}
    </div>
  );
};

export default EditorFieldImpl;
