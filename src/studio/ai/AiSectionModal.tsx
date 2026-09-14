import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { useStudio } from '../context';
import { useUiStore } from '../uiStore';
import { useEditorStore } from '../../engine/store';
import { generateId } from '../../engine/ids';
import { StudioDrawer } from '../ui/StudioDrawer';
import { buildSectionSystemPrompt, buildSectionUserPrompt } from './prompt';
import { parseAiSection, AiParseError } from './parse';

/** Prompt idea chips shown under the input for a cold start. */
const SUGGESTIONS = [
  '3 kolonlu fiyatlandırma bölümü',
  'Başlık, açıklama ve buton içeren hero',
  'Müşteri yorumları bölümü',
];

/**
 * "AI ile bölüm üret" — prompt in, section out (StudioDrawer 'md'). The
 * library builds the system prompt from the component catalog and validates
 * the response (`prompt.ts`/`parse.ts`); the HOST's `config.ai.complete`
 * performs the actual LLM call. The validated folded node inserts through the
 * standard `insertNode` path (fresh ids, one undo step) and gets selected.
 *
 * Renders nothing unless the host wired `config.ai`; the drawer itself opens
 * with the uiStore flag. ⌘⏎ generates; ESC/dış tıklama vaul'dan.
 */
export const AiSectionModal = () => {
  const { config } = useStudio();
  const open = useUiStore((s) => s.aiModalOpen);
  const setOpen = useUiStore((s) => s.setAiModalOpen);
  const insertNode = useEditorStore((s) => s.insertNode);
  const selectNode = useEditorStore((s) => s.selectNode);

  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The generate call can outlive the drawer (close mid-flight) — drop the result.
  const cancelledRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const close = useCallback(() => {
    cancelledRef.current = true;
    setOpen(false);
  }, [setOpen]);

  // Fresh state per open.
  useEffect(() => {
    if (open) {
      cancelledRef.current = false;
      setPrompt('');
      setError(null);
      setBusy(false);
    }
  }, [open]);

  const ai = config.ai;

  const generate = async () => {
    if (!ai) return;
    const request = prompt.trim();
    if (!request || busy) return;
    setBusy(true);
    setError(null);
    try {
      const text = await ai.complete({
        system: buildSectionSystemPrompt(config),
        prompt: buildSectionUserPrompt(request),
      });
      if (cancelledRef.current) return;
      const node = parseAiSection(text, config);
      // Root id upfront so we can select what we just inserted (children get
      // fresh ids inside insertNode via extractDefaultSlots).
      node.props.id = generateId();
      insertNode(node); // appends to root content — one undo step
      selectNode(node.props.id);
      setOpen(false);
    } catch (e) {
      if (cancelledRef.current) return;
      setError(
        e instanceof AiParseError
          ? e.message
          : 'Üretim başarısız oldu — bağlantıyı kontrol edip tekrar deneyin.',
      );
    } finally {
      if (!cancelledRef.current) setBusy(false);
    }
  };

  if (!ai) return null;

  return (
    <StudioDrawer
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      size="md"
      tone="primary"
      icon={<Sparkles size={22} />}
      title="AI ile bölüm üret"
      description="Ne istediğini yaz; üretilen bölüm sayfanın sonuna eklenir ve seçili gelir."
      busy={busy}
      className="tecof-ai-drawer"
      bodyClassName="tecof-ai-drawer-body"
      onOpenAutoFocus={(e) => {
        if (!inputRef.current) return;
        e.preventDefault();
        inputRef.current.focus({ preventScroll: true });
      }}
      footer={
        <>
          <span className="tecof-drawer-footer-note">⌘⏎ ile üret · sonuç geri alınabilir</span>
          <button
            type="button"
            className="tecof-drawer-btn tecof-drawer-btn--primary"
            disabled={!prompt.trim() || busy}
            onClick={generate}
          >
            {busy ? (
              <Loader2 size={15} className="tecof-upload-spin" aria-hidden="true" />
            ) : (
              <Sparkles size={14} aria-hidden="true" />
            )}
            {busy ? 'Üretiliyor…' : 'Üret'}
          </button>
        </>
      }
    >
      <textarea
        ref={inputRef}
        className="tecof-ai-modal-input"
        placeholder="Ne eklemek istiyorsun? Örn: 3 kolonlu fiyatlandırma bölümü…"
        value={prompt}
        rows={3}
        disabled={busy}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            generate();
          }
        }}
      />

      <div className="tecof-ai-modal-suggestions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="tecof-ai-modal-chip"
            disabled={busy}
            onClick={() => setPrompt(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="tecof-ai-modal-error" role="alert">
          {error}
        </div>
      )}
    </StudioDrawer>
  );
};

export default AiSectionModal;
